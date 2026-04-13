const config = require("config")
const nodemailer = require("nodemailer")

const cfgConnection = config.util.cloneDeep(config.get("email.connectionConfiguration"))

const connectionDefaultSettings = {
  pool: true,
  socketTimeout: 1000 * 60 * 2,
  connectionTimeout: 1000 * 60 * 2,
  maxConnections: 10,
}
// Connection settings could be overridden by config, so user can configure transporter anyhow.
const settings = Object.assign(connectionDefaultSettings, cfgConnection)
const smtpTransporters = new Map()

function createTransporter(ctx, host, port, auth, messageCommonParameters = {}) {
  const server = {
    host,
    port,
    auth,
    secure: port === 465,
  }
  const transport = Object.assign({}, server, settings)

  try {
    if (smtpTransporters.has(`${host}:${auth.user}`)) {
      return
    }

    const transporter = nodemailer.createTransport(transport, messageCommonParameters)
    smtpTransporters.set(`${host}:${auth.user}`, transporter)
  } catch (error) {
    ctx.logger.error(
      "Mail service smtp transporter creation error: %o\nWith parameters: \n\thost - %s, \n\tport - %d, \n\tauth = %o",
      error.stack,
      host,
      port,
      auth,
    )
  }
}

async function send(host, userLogin, mailObject) {
  const transporter = smtpTransporters.get(`${host}:${userLogin}`)
  if (!transporter) {
    throw new Error(`MailService: no transporter exists for host "${host}" and user "${userLogin}"`)
  }

  return transporter.sendMail(mailObject)
}

function deleteTransporter(ctx, host, userLogin) {
  const transporter = smtpTransporters.get(`${host}:${userLogin}`)
  if (!transporter) {
    ctx.logger.error(
      `MailService: no transporter exists for host "${host}" and user "${userLogin}"`,
    )
    return
  }

  transporter.close()
  smtpTransporters.delete(`${host}:${userLogin}`)
}

function transportersRelease() {
  smtpTransporters.forEach((transporter) => transporter.close())
  smtpTransporters.clear()
}

module.exports = {
  createTransporter,
  send,
  deleteTransporter,
  transportersRelease,
}
