const config = require("config")
const container = require("rhea")
const operationContext = require("./operationContext")

const cfgRabbitSocketOptions = config.util.cloneDeep(config.get("activemq.connectOptions"))

const RECONNECT_TIMEOUT = 1000

function connetPromise(closeCallback) {
  return new Promise((resolve, _reject) => {
    //todo use built-in reconnect logic
    function startConnect() {
      let onDisconnected = () => {
        if (isConnected) {
          closeCallback()
        } else {
          setTimeout(startConnect, RECONNECT_TIMEOUT)
        }
      }
      const conn = container.create_container().connect(cfgRabbitSocketOptions)
      let isConnected = false
      conn.on("connection_open", (_context) => {
        operationContext.global.logger.debug("[AMQP] connected")
        isConnected = true
        resolve(conn)
      })
      conn.on("connection_error", (context) => {
        operationContext.global.logger.debug(
          "[AMQP] connection_error %s",
          context.error && context.error,
        )
      })
      conn.on("connection_close", (_context) => {
        operationContext.global.logger.debug("[AMQP] conn close")
        if (onDisconnected) {
          onDisconnected()
          onDisconnected = null
        }
      })
      conn.on("disconnected", (context) => {
        operationContext.global.logger.error("[AMQP] disconnected %s", context.error?.stack)
        if (onDisconnected) {
          onDisconnected()
          onDisconnected = null
        }
      })
    }

    startConnect()
  })
}
function openSenderPromise(conn, options) {
  return new Promise((resolve, _reject) => {
    resolve(conn.open_sender(options))
  })
}
function openReceiverPromise(conn, options) {
  return new Promise((resolve, _reject) => {
    resolve(conn.open_receiver(options))
  })
}
function closePromise(conn) {
  return new Promise((resolve, _reject) => {
    conn.close()
    resolve()
  })
}

module.exports.connetPromise = connetPromise
module.exports.openSenderPromise = openSenderPromise
module.exports.openReceiverPromise = openReceiverPromise
module.exports.closePromise = closePromise
module.exports.RECONNECT_TIMEOUT = RECONNECT_TIMEOUT
