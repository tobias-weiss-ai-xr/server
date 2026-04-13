const statsD = require("node-statsd")
const configStatsD = require("config").get("statsd")

const cfgStatsDUseMetrics = configStatsD.get("useMetrics")
const cfgStatsDHost = configStatsD.get("host")
const cfgStatsDPort = configStatsD.get("port")
const cfgStatsDPrefix = configStatsD.get("prefix")

let clientStatsD = null
if (cfgStatsDUseMetrics) {
  clientStatsD = new statsD({ host: cfgStatsDHost, port: cfgStatsDPort, prefix: cfgStatsDPrefix })
}

exports.getClient = () => clientStatsD
