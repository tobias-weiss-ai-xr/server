/**
 * Fonts controller — manages font collection and API font callbacks.
 *
 * Handles font loading from the editor API and font selection events.
 * Emits events when fonts change or are loaded.
 */

import { notificationCenter } from "../core/event-bus"

/** Font type for recent fonts */
const FONT_TYPE_RECENT = 4

/** Cached fonts collection */
let cachedStore: unknown[] | null = null

/** Font data structure from API */
export interface FontData {
  id: string
  name: string
  imgidx: string
  type: number
}

/** Checks if a font is already saved in the recent section */
function isFontSaved(store: FontData[], rec: FontData): boolean {
  let isRecent = rec.type === FONT_TYPE_RECENT
  let i = -1
  const count = store.length

  while (!isRecent && ++i < count) {
    const current = store[i]
    if (current.type !== FONT_TYPE_RECENT) break
    isRecent = current.name === rec.name
  }

  return isRecent
}

/** Handles font selection from combo box */
function onSelectFont(combo: unknown, record: FontData): void {
  const comboApi = combo as { showlastused?: boolean }
  if (comboApi?.showlastused && cachedStore && !isFontSaved(cachedStore as FontData[], record)) {
    // Recent font handling would go here - commented in original
  }
}

/** Handles API font change callback */
function onApiFontChange(fontobj: unknown): void {
  notificationCenter.emit("fonts:change", fontobj)
}

/** Handles API font loading callback */
function onApiLoadFonts(...args: unknown[]): void {
  const fonts = args[0] as unknown[]
  const select = args[1] as boolean | undefined
  const fontsArray: FontData[] = []

  if (Array.isArray(fonts)) {
    for (const font of fonts) {
      const fontApi = font as {
        asc_getFontId?: () => string
        asc_getFontName?: () => string
        asc_getFontThumbnail?: () => string
        asc_getFontType?: () => number
      }
      const fontId = fontApi.asc_getFontId ? fontApi.asc_getFontId() : ""
      fontsArray.push({
        id: fontId || "",
        name: fontApi.asc_getFontName ? fontApi.asc_getFontName() : "",
        imgidx: fontApi.asc_getFontThumbnail ? fontApi.asc_getFontThumbnail() : "",
        type: fontApi.asc_getFontType ? fontApi.asc_getFontType() : 0,
      })
    }
  }

  cachedStore = fontsArray

  notificationCenter.emit("fonts:load", cachedStore, select)
  cachedStore = null
}

/**
 * Gets the cached fonts collection.
 * @returns The cached fonts array or null
 */
export function store(): unknown[] | null {
  return cachedStore
}

/**
 * Initializes the Fonts controller.
 * Sets up event listeners for font selection.
 */
export function initialize(): void {
  notificationCenter.on("fonts:select", onSelectFont)
}

/**
 * Registers API callbacks for font operations.
 * @param api The editor API object
 */
export function setApi(api: {
  asc_registerCallback: (event: string, callback: (...args: unknown[]) => void) => void
}): void {
  api.asc_registerCallback("asc_onInitEditorFonts", onApiLoadFonts)
  api.asc_registerCallback("asc_onFontFamily", onApiFontChange)
}
