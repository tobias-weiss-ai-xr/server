const fs = require("node:fs/promises")
const path = require("node:path")
const config = require("config")
const NodeCache = require("node-cache")
const operationContext = require("./operationContext")
const utils = require("./utils")
const logger = require("./logger")

const cfgRuntimeConfig = config.get("runtimeConfig")
const configFilePath = cfgRuntimeConfig.filePath
const configFileName = path.basename(configFilePath)

// Initialize cache with TTL and check for expired keys every minute
const nodeCache = new NodeCache(cfgRuntimeConfig.cache)

// Debounce timer to wait for file write completion
let reloadTimer = null
const RELOAD_DEBOUNCE_MS = 200

/**
 * Get runtime configuration for the current context
 * @param {operationContext} ctx - Operation context
 * @returns {Object} Runtime configuration object
 */
async function getConfigFromFile(ctx) {
  if (!configFilePath) {
    return null
  }
  try {
    const configData = await fs.readFile(configFilePath, "utf8")
    return JSON.parse(configData)
  } catch (err) {
    if (err.code !== "ENOENT") {
      ctx.logger.error("getConfigFromFile error: %s", err.stack)
    }
    return null
  }
}

/**
 * Get cached configuration for the current context
 * @param {operationContext} ctx - Operation context
 * @returns {Object} Cached configuration object
 */
async function getConfig(ctx) {
  let config = nodeCache.get(configFileName)
  if (undefined === config) {
    config = await getConfigFromFile(ctx)
    nodeCache.set(configFileName, config)
  }
  return config
}
/**
 * Save runtime configuration for the current context
 * @param {operationContext} ctx - Operation context
 * @param {Object} config - Configuration data to save
 * @returns {Object} Saved configuration object
 */
async function saveConfig(ctx, config) {
  if (!configFilePath) {
    throw new Error("runtimeConfig.filePath is not specified")
  }
  await fs.mkdir(path.dirname(configFilePath), { recursive: true })
  let newConfig = await getConfig(ctx)
  newConfig = utils.deepMergeObjects(newConfig || {}, config)
  await fs.writeFile(configFilePath, JSON.stringify(newConfig, null, 2), "utf8")
  nodeCache.set(configFileName, newConfig)
  return newConfig
}

/**
 * Replace runtime configuration completely (no merging)
 * @param {operationContext} ctx - Operation context
 * @param {Object} config - Configuration data to replace with
 * @returns {Object} Replaced configuration object
 */
async function replaceConfig(_ctx, config) {
  if (!configFilePath) {
    throw new Error("runtimeConfig.filePath is not specified")
  }
  await fs.mkdir(path.dirname(configFilePath), { recursive: true })
  await fs.writeFile(configFilePath, JSON.stringify(config, null, 2), "utf8")
  nodeCache.set(configFileName, config)
  return config
}

/**
 * Handle config file change event from fs.watch or fs.watchFile
 * Debounces multiple events to prevent excessive reloads during file write
 * @param {string|fs.Stats} eventTypeOrCurrent - Event type for fs.watch or current stats for fs.watchFile
 * @param {string|fs.Stats} filenameOrPrevious - Filename for fs.watch or previous stats for fs.watchFile
 */
function handleConfigFileChange(eventTypeOrCurrent, filenameOrPrevious) {
  try {
    let shouldReload = false

    if (typeof eventTypeOrCurrent === "object" && eventTypeOrCurrent.isFile) {
      // fs.watchFile callback: (current, previous)
      shouldReload = eventTypeOrCurrent.mtime !== filenameOrPrevious.mtime
    } else {
      // fs.watch callback: (eventType, filename)
      shouldReload = configFileName === filenameOrPrevious
    }

    if (shouldReload) {
      // Clear timer and wait for file write to complete
      if (reloadTimer) {
        clearTimeout(reloadTimer)
      }

      reloadTimer = setTimeout(() => {
        reloadTimer = null
        nodeCache.del(configFileName)
        operationContext.global.logger.info(
          `handleConfigFileChange reloading config: ${configFileName}`,
        )

        operationContext.global.cleanRuntimeConfigCache()
        getConfig(operationContext.global)
          .then((config) => {
            logger.configureLogger(config?.log?.options)
          })
          .catch((err) => {
            operationContext.global.logger.error(
              `handleConfigFileChange reload error: ${err.message}`,
            )
          })
      }, RELOAD_DEBOUNCE_MS)
    }
  } catch (err) {
    operationContext.global.logger.error(`handleConfigFileChange error: ${err.message}`)
  }
}

/**
 * Initialize the configuration directory watcher
 */
async function initRuntimeConfigWatcher(ctx) {
  if (!configFilePath) {
    ctx.logger.info("runtimeConfig.filePath is not specified")
    return
  }
  const configDir = path.dirname(configFilePath)
  await utils.watchWithFallback(ctx, configDir, configFilePath, handleConfigFileChange)
}
module.exports = {
  initRuntimeConfigWatcher,
  getConfig,
  saveConfig,
  replaceConfig,
}
