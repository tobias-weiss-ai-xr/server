const { createHistogram, performance, PerformanceObserver } = require("node:perf_hooks")

const co = require("co")
const taskResult = require("./../../DocService/sources/taskresult")
const storage = require("./../../Common/sources/storage/storage-base")
const storageFs = require("./../../Common/sources/storage/storage-fs")
const operationContext = require("./../../Common/sources/operationContext")
const utils = require("./../../Common/sources/utils")
const docsCoServer = require("./../../DocService/sources/DocsCoServer")
const gc = require("./../../DocService/sources/gc")

const ctx = operationContext.global

let addRandomKeyTask
const histograms = {}

async function beforeStart() {
  const timerify = (func, name) => {
    //todo remove anonymous functions. use func.name
    Object.defineProperty(func, "name", {
      value: name,
    })
    const histogram = createHistogram()
    histograms[func.name] = histogram
    return performance.timerify(func, { histogram })
  }

  addRandomKeyTask = timerify(co.wrap(taskResult.addRandomKeyTask), "addRandomKeyTask")
  taskResult.getExpired = timerify(taskResult.getExpired, "getExpired")
  taskResult.remove = timerify(taskResult.remove, "remove")
  storage.putObject = timerify(storage.putObject, "putObject")
  storage.listObjects = timerify(storage.listObjects, "listObjects")
  storageFs.deletePath = timerify(storageFs.deletePath, "deletePath")
  storageFs.deleteObject = timerify(storageFs.deleteObject, "deleteObject")
  docsCoServer.getEditorsCountPromise = timerify(
    docsCoServer.getEditorsCountPromise,
    "getEditorsCountPromise",
  )

  const obs = new PerformanceObserver((list) => {
    const entries = list.getEntries()
    entries.forEach((entry) => {
      const duration = Math.round(entry.duration * 1000) / 1000
      console.log(`${entry.name}:${duration}ms`)
    })
  })
  obs.observe({ entryTypes: ["function"] })

  await docsCoServer.editorData.connect()
}

async function beforeEnd() {
  const logHistogram = (histogram, name) => {
    const mean = Math.round(histogram.mean / 1000) / 1000
    const min = Math.round(histogram.min / 1000) / 1000
    const max = Math.round(histogram.max / 1000) / 1000
    const count = histogram.count
    ctx.logger.info(`histogram ${name}: count=${count}, mean=${mean}ms, min=${min}ms, max=${max}ms`)
  }
  await utils.sleep(1000)
  for (const name in histograms) {
    logHistogram(histograms[name], name)
  }
}

async function addFileExpire(count, size, prefix, filesInFolder) {
  while (count > 0) {
    const task = await addRandomKeyTask(ctx, undefined, prefix, 8)
    const data = Buffer.alloc(size, 0)
    const rand = Math.floor(Math.random() * filesInFolder) + 1
    for (let i = 0; i < rand && count > 0; i++) {
      await storage.putObject(ctx, `${task.key}/data${i}`, data, data.length)
      count--
    }
  }
}

async function startTest() {
  const args = process.argv.slice(2)
  if (args.length < 4) {
    ctx.logger.error(
      "missing arguments.USAGE: checkFileExpire.js [add-files-count] [file-size-bytes] [key-prefix] [seconds-to-expire]",
    )
    return
  }
  ctx.logger.info("test started")
  await beforeStart()

  await addFileExpire(
    Number.parseInt(args[0]),
    Number.parseInt(args[1]),
    args[2],
    Number.parseInt(args[4] || 1),
  )
  //delay to log observer events
  await utils.sleep(1000)
  await gc.checkFileExpire(args[3])

  await beforeEnd()
  ctx.logger.info("test finished")
}

startTest()
  .then(() => {
    //delay to log observer events
    return utils.sleep(1000)
  })
  .catch((err) => {
    ctx.logger.error(err.stack)
  })
  .finally(() => {
    process.exit(0)
  })
