const cluster = require("node:cluster")
const moduleReloader = require("./../../Common/sources/moduleReloader")
const config = moduleReloader.requireConfigWithRuntime()
const logger = require("./../../Common/sources/logger")
const operationContext = require("./../../Common/sources/operationContext")
const runtimeConfigManager = require("./../../Common/sources/runtimeConfigManager")

if (cluster.isMaster) {
  const fs = require("node:fs")
  const os = require("node:os")
  const license = require("./../../Common/sources/license")

  const cfgLicenseFile = config.get("license.license_file")
  const cfgMaxProcessCount = config.get("FileConverter.converter.maxprocesscount")

  let workersCount = 0
  const readLicense = async () => {
    const numCPUs = os.cpus().length
    const availableParallelism = os.availableParallelism?.()
    operationContext.global.logger.warn(
      "num of CPUs: %d; availableParallelism: %s",
      numCPUs,
      availableParallelism,
    )
    workersCount = Math.ceil((availableParallelism || numCPUs) * cfgMaxProcessCount)
    const [licenseInfo] = await license.readLicense(cfgLicenseFile)
    workersCount = Math.min(licenseInfo.count, workersCount)
    //todo send license to workers for multi-tenancy
  }
  const updateWorkers = () => {
    let i
    const arrKeyWorkers = Object.keys(cluster.workers)
    if (arrKeyWorkers.length < workersCount) {
      for (i = arrKeyWorkers.length; i < workersCount; ++i) {
        const newWorker = cluster.fork()
        operationContext.global.logger.warn("worker %s started.", newWorker.process.pid)
      }
    } else {
      for (i = workersCount; i < arrKeyWorkers.length; ++i) {
        const killWorker = cluster.workers[arrKeyWorkers[i]]
        if (killWorker) {
          killWorker.kill()
        }
      }
    }
  }
  const updateLicense = async () => {
    try {
      await readLicense()
      operationContext.global.logger.warn("update cluster with %s workers", workersCount)
      updateWorkers()
    } catch (err) {
      operationContext.global.logger.error("updateLicense error: %s", err.stack)
    }
  }

  cluster.on("exit", (worker, code, signal) => {
    operationContext.global.logger.warn(
      "worker %s died (code = %s; signal = %s).",
      worker.process.pid,
      code,
      signal,
    )
    updateWorkers()
  })

  updateLicense()

  fs.watchFile(cfgLicenseFile, updateLicense)
  setInterval(updateLicense, 86400000)
} else {
  const converter = require("./converter")
  converter.run()
  //Initialize watch here to avoid circular import with operationContext
  runtimeConfigManager.initRuntimeConfigWatcher(operationContext.global).catch((err) => {
    operationContext.global.logger.warn("initRuntimeConfigWatcher error: %s", err.stack)
  })
}

process.on("uncaughtException", (err) => {
  operationContext.global.logger.error(
    `${new Date().toUTCString()} uncaughtException:`,
    err.message,
  )
  operationContext.global.logger.error(err.stack)
  logger.shutdown(() => {
    process.exit(1)
  })
})

//after all required modules in all files
moduleReloader.finalizeConfigWithRuntime()
