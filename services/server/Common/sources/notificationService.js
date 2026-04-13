const config = require("config")
const ms = require("ms")

const mailService = require("./mailService")

const cfgEditorDataStorage = config.get("services.CoAuthoring.server.editorDataStorage")
const cfgEditorStatStorage = config.get("services.CoAuthoring.server.editorStatStorage")
const cfgSmtpServerConfiguration = config.get("email.smtpServerConfiguration")
const cfgContactDefaults = config.get("email.contactDefaults")
const editorStatStorage = require(
  `./../../DocService/sources/${cfgEditorStatStorage || cfgEditorDataStorage}`,
)

const editorStat = editorStatStorage.EditorStat
  ? new editorStatStorage.EditorStat()
  : new editorStatStorage()
const notificationTypes = {
  LICENSE_EXPIRATION_WARNING: "licenseExpirationWarning",
  LICENSE_EXPIRATION_ERROR: "licenseExpirationError",
  LICENSE_LIMIT_EDIT: "licenseLimitEdit",
  LICENSE_LIMIT_LIVE_VIEWER: "licenseLimitLiveViewer",
}

class TransportInterface {
  async send(_ctx, _message) {}
  contentGeneration(_title, _message) {}
}

class MailTransport extends TransportInterface {
  constructor(ctx) {
    super()

    const mailServerConfig = ctx.getCfg("email.smtpServerConfiguration", cfgSmtpServerConfiguration)
    this.host = mailServerConfig.host
    this.port = mailServerConfig.port
    this.auth = mailServerConfig.auth
    const cfgMailMessageDefaults = ctx.getCfg("email.contactDefaults", cfgContactDefaults)

    mailService.createTransporter(ctx, this.host, this.port, this.auth, cfgMailMessageDefaults)
  }

  async send(ctx, message) {
    ctx.logger.debug("Notification service: MailTransport send %j", message)
    return mailService.send(this.host, this.auth.user, message)
  }

  contentGeneration(title, message) {
    return {
      subject: title,
      text: message,
    }
  }
}

// TODO:
class TelegramTransport extends TransportInterface {
  constructor(_ctx) {
    super()
  }
}

class Transport {
  transport = new TransportInterface()

  constructor(ctx, transportName) {
    this.name = transportName

    switch (transportName) {
      case "email":
        this.transport = new MailTransport(ctx)
        break
      case "telegram":
        this.transport = new TelegramTransport(ctx)
        break
      default:
        ctx.logger.warn(
          `Notification service: error: transport method "${transportName}" not implemented`,
        )
    }
  }
}

async function notify(ctx, notificationType, title, message, opt_cacheKey = undefined) {
  const tenRule = ctx.getCfg(
    `notification.rules.${notificationType}`,
    config.get(`notification.rules.${notificationType}`),
  )
  if (tenRule?.enable) {
    ctx.logger.debug('Notification service: notify "%s"', notificationType)
    const checkRes = await checkRulePolicies(ctx, notificationType, tenRule, opt_cacheKey)
    if (checkRes) {
      await notifyRule(ctx, tenRule, title, message)
    }
  }
}

async function checkRulePolicies(ctx, notificationType, tenRule, opt_cacheKey) {
  const { repeatInterval } = tenRule.policies
  //decrease repeatInterval by 1% to avoid race condition if timeout=repeatInterval
  const ttl = Math.floor((ms(repeatInterval) * 0.99) / 1000)
  let isLock = false
  //todo for compatibility remove if after 8.2
  if (editorStat?.lockNotification) {
    isLock = await editorStat.lockNotification(ctx, opt_cacheKey || notificationType, ttl)
  }
  if (!isLock) {
    ctx.logger.debug(
      `Notification service: skip rule "%s" due to repeat interval = %s`,
      notificationType,
      repeatInterval,
    )
  }
  return isLock
}

async function notifyRule(ctx, tenRule, title, message) {
  const transportObjects = tenRule.transportType.map((transport) => new Transport(ctx, transport))
  for (const transportObject of transportObjects) {
    try {
      const mail = transportObject.transport.contentGeneration(title, message)
      await transportObject.transport.send(ctx, mail)
    } catch (error) {
      ctx.logger.error("Notification service: error: %s", error.stack)
    }
  }
}

module.exports = {
  notificationTypes,
  notify,
}
