const config = require("config")
const configCoAuthoring = config.get("services.CoAuthoring")
const co = require("co")
const pubsubService = require("./pubsubRabbitMQ")
const sqlBase = require("./databaseConnectors/baseConnector")
const commonDefines = require("./../../Common/sources/commondefines")
const constants = require("./../../Common/sources/constants")
const utils = require("./../../Common/sources/utils")

const cfgRedisPrefix = configCoAuthoring.get("redis.prefix")
const redisKeyShutdown = cfgRedisPrefix + constants.REDIS_KEY_SHUTDOWN

const WAIT_TIMEOUT = 30000
const LOOP_TIMEOUT = 1000
const EXEC_TIMEOUT = WAIT_TIMEOUT + utils.getConvertionTimeout(undefined)

exports.shutdown = (ctx, editorStat, status) =>
  co(function* () {
    let res = true
    try {
      ctx.logger.debug(`shutdown start:${EXEC_TIMEOUT}`)

      //redisKeyShutdown is not a simple counter, so it doesn't get decremented by a build that started before Shutdown started
      //reset redisKeyShutdown just in case the previous run didn't finish
      yield editorStat.cleanupShutdown(redisKeyShutdown)

      const pubsub = new pubsubService()
      yield pubsub.initPromise()
      //inner ping to update presence
      ctx.logger.debug("shutdown pubsub shutdown message")
      yield pubsub.publish(
        JSON.stringify({ type: commonDefines.c_oPublishType.shutdown, ctx, status }),
      )
      //wait while pubsub deliver and start conversion
      ctx.logger.debug("shutdown start wait pubsub deliver")
      const startTime = new Date().getTime()
      let isStartWait = true
      while (true) {
        const curTime = new Date().getTime() - startTime
        if (isStartWait && curTime >= WAIT_TIMEOUT) {
          isStartWait = false
          ctx.logger.debug("shutdown stop wait pubsub deliver")
        } else if (curTime >= EXEC_TIMEOUT) {
          res = false
          ctx.logger.debug("shutdown timeout")
          break
        }
        const remainingFiles = yield editorStat.getShutdownCount(redisKeyShutdown)
        const inSavingStatus = yield sqlBase.getCountWithStatus(
          ctx,
          commonDefines.FileStatus.SaveVersion,
          EXEC_TIMEOUT,
        )
        ctx.logger.debug(
          "shutdown remaining files editorStat:%d, db:%d",
          remainingFiles,
          inSavingStatus,
        )
        if (!isStartWait && remainingFiles + inSavingStatus <= 0) {
          break
        }
        yield utils.sleep(LOOP_TIMEOUT)
      }
      //todo need to check the queues, because there may be long conversions running before Shutdown
      //clean up
      yield editorStat.cleanupShutdown(redisKeyShutdown)
      yield pubsub.close()

      ctx.logger.debug("shutdown end")
    } catch (e) {
      res = false
      ctx.logger.error("shutdown error: %s", e.stack)
    }
    return res
  })
