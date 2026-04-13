const fs = require("node:fs")

/**
 * Reloads an NPM module by clearing it from require.cache and re-requiring it
 * @param {string} moduleName - Name of the module to reload
 * @returns {Object} The freshly loaded module
 */
function reloadNpmModule(moduleName) {
  try {
    const moduleId = require.resolve(moduleName)
    delete require.cache[moduleId]
    return require(moduleName)
  } catch (error) {
    console.error(`Failed to reload module ${moduleName}:`, error.message)
    throw error
  }
}

// Backup original NODE_CONFIG to avoid growing environment
const prevNodeConfig = process.env.NODE_CONFIG
let nodeConfigOverridden = false
let baseConfigSnapshot = null

/**
 * Returns the base configuration as plain object before runtime configuration is applied
 * @returns {Object} Base configuration object
 */
function getBaseConfig() {
  return baseConfigSnapshot
}

/**
 * Requires config module with runtime configuration support.
 * Temporarily sets NODE_CONFIG for reload, then restores environment to prevent E2BIG.
 * @param {Object} opt_additionalConfig - Additional configuration to merge
 * @returns {Object} config module
 */
function requireConfigWithRuntime(opt_additionalConfig) {
  let config = require("config")

  try {
    // Save base config before reloading with runtime modifications
    baseConfigSnapshot = config.util.toObject()

    const configFilePath = config.get("runtimeConfig.filePath")
    if (configFilePath) {
      const configData = fs.readFileSync(configFilePath, "utf8")

      // Parse existing NODE_CONFIG or start with empty object
      let curNodeConfig = JSON.parse(process.env.NODE_CONFIG ?? "{}")
      const fileConfig = JSON.parse(configData)

      // Merge configurations: NODE_CONFIG -> runtime -> additional
      curNodeConfig = config.util.extendDeep(curNodeConfig, fileConfig)
      if (opt_additionalConfig) {
        curNodeConfig = config.util.extendDeep(curNodeConfig, opt_additionalConfig)
      }

      // Temporarily set NODE_CONFIG only to reload the config module
      process.env.NODE_CONFIG = JSON.stringify(curNodeConfig)
      nodeConfigOverridden = true

      config = reloadNpmModule("config")
    }
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.error("Failed to load runtime config: %s", err.stack)
    }
  }
  return config
}

function finalizeConfigWithRuntime() {
  // Restore original NODE_CONFIG to keep env small and avoid E2BIG on Windows/pkg
  if (nodeConfigOverridden) {
    if (typeof prevNodeConfig === "undefined") {
      process.env.NODE_CONFIG = undefined
    } else {
      process.env.NODE_CONFIG = prevNodeConfig
    }
  }
}

module.exports = {
  reloadNpmModule,
  getBaseConfig,
  requireConfigWithRuntime,
  finalizeConfigWithRuntime,
}
