const config = require("config")
const util = require("node:util")
const fs = require("node:fs")

const log4js = require("log4js")
const layouts = require("log4js/lib/layouts")
const logConfigPath = config.get("log.filePath")
const logOptions = config.get("log.options")

// https://stackoverflow.com/a/36643588
const dateToJSONWithTZ = (d) => {
  const timezoneOffsetInHours = -(d.getTimezoneOffset() / 60) //UTC minus local time
  const sign = timezoneOffsetInHours >= 0 ? "+" : "-"
  const leadingZero = Math.abs(timezoneOffsetInHours) < 10 ? "0" : ""

  //It's a bit unfortunate that we need to construct a new Date instance
  //(we don't want _d_ Date instance to be modified)
  const correctedDate = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    d.getHours(),
    d.getMinutes(),
    d.getSeconds(),
    d.getMilliseconds(),
  )
  correctedDate.setHours(d.getHours() + timezoneOffsetInHours)
  const iso = correctedDate.toISOString().replace("Z", "")
  return `${iso + sign + leadingZero + Math.abs(timezoneOffsetInHours).toString()}:00`
}

log4js.addLayout("json", () => {
  return (logEvent) => {
    logEvent.startTime = dateToJSONWithTZ(logEvent.startTime)
    logEvent.message = util.format(...logEvent.data)
    logEvent.data = undefined
    return JSON.stringify(logEvent)
  }
})

/**
 * Custom pattern layout that supports %x{usid} using USERSESSIONID from context.
 * @param {object} cfg
 * @returns {function}
 */
log4js.addLayout("patternWithTokens", (cfg) => {
  const pattern = cfg?.pattern ? cfg.pattern : "%m"
  const baseTokens = cfg?.tokens ? cfg.tokens : {}
  const tokens = Object.assign({}, baseTokens, {
    usid(ev) {
      const id = ev?.context?.USERSESSIONID
      return id ? ` [${id}]` : ""
    },
  })
  return layouts.patternLayout(pattern, tokens)
})

const cachedLogConfig = JSON.parse(fs.readFileSync(logConfigPath, "utf8"))
let curLogConfig = cachedLogConfig

function configureLogger(options) {
  const mergedOptions = config.util.extendDeep({}, cachedLogConfig, options)
  log4js.configure(mergedOptions)
  curLogConfig = mergedOptions
}
configureLogger(logOptions)

const logger = log4js.getLogger("nodeJS")

if (config.get("log.options.replaceConsole")) {
  console.log = logger.info.bind(logger)
  console.info = logger.info.bind(logger)
  console.warn = logger.warn.bind(logger)
  console.error = logger.error.bind(logger)
  console.debug = logger.debug.bind(logger)
}
exports.getLogger = () => log4js.getLogger.apply(log4js, Array.prototype.slice.call(arguments))
exports.trace = () => logger.trace.apply(logger, Array.prototype.slice.call(arguments))
exports.debug = () => logger.debug.apply(logger, Array.prototype.slice.call(arguments))
exports.info = () => logger.info.apply(logger, Array.prototype.slice.call(arguments))
exports.warn = () => logger.warn.apply(logger, Array.prototype.slice.call(arguments))
exports.error = () => logger.error.apply(logger, Array.prototype.slice.call(arguments))
exports.fatal = () => logger.fatal.apply(logger, Array.prototype.slice.call(arguments))
exports.shutdown = (callback) => log4js.shutdown(callback)
exports.configureLogger = configureLogger
exports.getLoggerConfig = () => config.util.extendDeep({}, curLogConfig)
exports.getInitialLoggerConfig = () => config.util.extendDeep({}, cachedLogConfig)
