const Ajv = require("ajv")
const addFormats = require("ajv-formats")
const addErrors = require("ajv-errors")
const logger = require("../../../../../Common/sources/logger")
const tenantManager = require("../../../../../Common/sources/tenantManager")
const supersetSchema = require("../../../../../Common/config/schemas/config.schema.json")
const { deriveSchemaForScope, X_SCOPE_KEYWORD } = require("./config.schema.utils")

// Constants
const AJV_CONFIG = { allErrors: true, strict: false }
const AJV_FILTER_CONFIG = { allErrors: true, strict: false, removeAdditional: true }

/**
 * Registers custom keyword and formats on an AJV instance.
 * @param {Ajv.default} instance
 */
function registerAjvExtras(instance) {
  instance.addKeyword({ keyword: X_SCOPE_KEYWORD, schemaType: ["string", "array"], errors: false })
}

/**
 * Creates and configures an AJV instance.
 * @param {Object} config - AJV configuration
 * @returns {Ajv.default}
 */
function createAjvInstance(config) {
  const instance = new Ajv(config)
  addFormats(instance)
  addErrors(instance)
  registerAjvExtras(instance)
  return instance
}

const ajvValidator = createAjvInstance(AJV_CONFIG)
const ajvFilter = createAjvInstance(AJV_FILTER_CONFIG)

// Derive and compile per-scope schemas
const adminSchema = deriveSchemaForScope(supersetSchema, "admin")
const tenantSchema = deriveSchemaForScope(supersetSchema, "tenant")
const validateAdmin = ajvValidator.compile(adminSchema)
const validateTenant = ajvValidator.compile(tenantSchema)
const filterAdmin = ajvFilter.compile(adminSchema)
const filterTenant = ajvFilter.compile(tenantSchema)

function isAdminScope(ctx) {
  return tenantManager.isDefaultTenant(ctx)
}

/**
 * Validates updateData against the derived per-scope schema selected by ctx.
 * @param {operationContext} ctx
 * @param {Object} updateData
 * @returns {{ value?: Object, errors?: any, errorsText?: string }}
 */
function validateScoped(ctx, updateData) {
  const validator = isAdminScope(ctx) ? validateAdmin : validateTenant
  const valid = validator(updateData)

  return valid
    ? { value: updateData, errors: null, errorsText: null }
    : {
        value: null,
        errors: validator.errors,
        errorsText: ajvValidator.errorsText(validator.errors),
      }
}

/**
 * Filters configuration to include only fields defined in the appropriate schema
 * @param {operationContext} ctx - Operation context
 * @returns {Object} Filtered configuration object
 */
function getScopedConfig(ctx) {
  const cfg = ctx.getFullCfg()
  const configCopy = JSON.parse(JSON.stringify(cfg))

  // Add log config. getLoggerConfig return merged config
  if (!configCopy.log) {
    configCopy.log = {}
  }
  configCopy.log.options = logger.getLoggerConfig()

  const filter = isAdminScope(ctx) ? filterAdmin : filterTenant
  filter(configCopy)
  return configCopy
}

module.exports = { validateScoped, getScopedConfig }
