const express = require("express")
const fs = require("node:fs").promises
const path = require("node:path")
const apicache = require("apicache")
const config = require("config")
const operationContext = require("../../../Common/sources/operationContext")

const router = express.Router()

const cfgDocumentFormatsFile = config.get("services.CoAuthoring.server.documentFormatsFile")

const LOCALE_SUBDIR = path.join("apps", "documenteditor", "main", "locale")

let cachedLocales = null

/**
 * Returns list of supported UI locale codes from documenteditor locale JSON files.
 * Result is cached for the lifetime of the process (locale files only change on product upgrade).
 * @param {string} webAppsPath - Resolved path to web-apps root
 * @returns {Promise<string[]>} Sorted list of locale codes (e.g. ['de', 'en', 'ru'])
 */
async function getSupportedLocales(webAppsPath) {
  if (cachedLocales) return cachedLocales
  const localeDir = path.resolve(webAppsPath, LOCALE_SUBDIR)
  try {
    const entries = await fs.readdir(localeDir, { withFileTypes: true })
    cachedLocales = entries
      .filter((e) => e.isFile() && e.name.endsWith(".json"))
      .map((e) => path.basename(e.name, ".json"))
    cachedLocales.sort((a, b) => a.localeCompare(b))
    return cachedLocales
  } catch {
    return []
  }
}

/**
 * Returns supported document formats from JSON file
 * @route GET /meta/formats
 */
router.get("/formats", apicache.middleware("5 min"), async (req, res) => {
  if (cfgDocumentFormatsFile) {
    res.sendFile(path.resolve(cfgDocumentFormatsFile))
  } else {
    res.sendStatus(404)
  }
})

/**
 * Returns tenant-specific client configuration for document editor integration
 * @route GET /meta/config
 */
router.get("/config", async (req, res) => {
  const ctx = new operationContext.Context()
  try {
    ctx.initFromRequest(req)
    await ctx.initTenantCache()

    const webAppsPath =
      ctx.config?.services?.CoAuthoring?.server?.static_content?.["/web-apps"]?.path
    const langs = webAppsPath ? await getSupportedLocales(webAppsPath) : []

    const clientConfig = {
      authorization: {
        header: ctx.config?.services?.CoAuthoring?.token?.inbox?.header,
        prefix: ctx.config?.services?.CoAuthoring?.token?.inbox?.prefix,
      },
      urls: {
        api: "/web-apps/apps/api/documents/api.js",
        command: "/command",
        converter: "/converter",
        docbuilder: "/docbuilder",
      },
      limits: {
        maxFileSize: ctx.config?.FileConverter?.converter?.maxDownloadBytes,
      },
      langs,
    }

    res.json(clientConfig)
  } catch (err) {
    ctx.logger.error("meta/config error: %s", err.stack)
    res.sendStatus(500)
  }
})

module.exports = router
