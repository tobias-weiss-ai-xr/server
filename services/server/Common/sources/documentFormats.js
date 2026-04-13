const { readFile } = require("node:fs/promises")

const CATEGORIES = [
  "pdfView",
  "pdfEdit",
  "wordView",
  "wordEdit",
  "cellView",
  "cellEdit",
  "slideView",
  "slideEdit",
  "diagramView",
  "diagramEdit",
  "forms",
]

let cache = null

/**
 * Load and parse all formats from JSON file (with caching)
 * @param {string} filePath - Full path to world-office-docs-formats.json
 * @returns {Promise<Object>} Map of category -> extensions array
 */
async function getAllFormats(filePath) {
  if (cache) {
    return cache
  }

  // Initialize empty categories
  cache = Object.fromEntries(CATEGORIES.map((key) => [key, []]))

  if (!filePath) {
    return cache
  }

  try {
    const formats = JSON.parse(await readFile(filePath, "utf8"))

    if (!Array.isArray(formats)) {
      return cache
    }

    for (const { name, type, actions } of formats) {
      if (!name || !type || !Array.isArray(actions)) {
        continue
      }

      // 'edit' = native edit, 'lossy-edit' = edit with potential format loss
      const hasEdit = actions.includes("edit") || actions.includes("lossy-edit")
      const hasView = actions.includes("view")
      const key = type + (hasEdit ? "Edit" : hasView ? "View" : "")

      if (cache[key]) {
        cache[key].push(name)
      }

      if (type === "pdf" && actions.includes("fill")) {
        cache.forms.push(name)
      }
    }
  } catch {
    // Return empty categories on error
  }

  return cache
}

module.exports = { getAllFormats }
