/**
 * TypeScript keyboard shortcut manager + React hooks.
 * Migration of keymaster.js (Thomas Fuchs, MIT license).
 */

import { useCallback, useEffect, useRef } from "react"

export interface ModifierState {
  shift: boolean
  alt: boolean
  ctrl: boolean
  meta: boolean
}

export interface ShortcutHandler {
  shortcut: string
  scope: string
  method: (e: KeyboardEvent) => boolean | undefined
  mods: number[]
  locked: boolean
  propagate: boolean
}

export const MODIFIERS: Record<string, number> = {
  shift: 16,
  alt: 18,
  option: 18,
  ctrl: 17,
  control: 17,
  command: 91,
  meta: 91,
}

export const KEY_MAP: Record<string, number> = {
  backspace: 8,
  tab: 9,
  clear: 12,
  enter: 13,
  return: 13,
  esc: 27,
  escape: 27,
  space: 32,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  del: 46,
  delete: 46,
  home: 36,
  end: 35,
  pageup: 33,
  pagedown: 34,
  ",": 188,
  ".": 190,
  "/": 191,
  "`": 192,
  "-": 189,
  "=": 187,
  ";": 186,
  "'": 222,
  "[": 219,
  "]": 221,
  "\\": 220,
  numplus: 107,
  numminus: 109,
  "0": 48,
}

// f1–f19
for (let k = 1; k < 20; k++) {
  KEY_MAP[`f${k}`] = 111 + k
}

function code(x: string): number {
  return KEY_MAP[x] ?? x.toUpperCase().charCodeAt(0)
}

function index(array: number[], item: number): number {
  let i = array.length
  while (i--) {
    if (array[i] === item) return i
  }
  return -1
}

function compareArray(a1: number[], a2: number[]): boolean {
  if (a1.length !== a2.length) return false
  for (let i = 0; i < a1.length; i++) {
    if (a1[i] !== a2[i]) return false
  }
  return true
}

function getKeys(key: string): string[] {
  const k = key.replace(/\s/g, "")
  const keys = k.split(",")
  if (keys[keys.length - 1] === "") {
    keys[keys.length - 2] += ","
  }
  return keys
}

function getMods(key: string[]): number[] {
  const parts = key.slice(0, key.length - 1)
  const result: number[] = []
  for (let mi = 0; mi < parts.length; mi++) {
    result.push(MODIFIERS[parts[mi]] ?? 0)
  }
  return result
}

const MODIFIER_KEYS = [16, 18, 17, 91]
const MODIFIER_KEY_MAP: Record<number, keyof ModifierState> = {
  16: "shift",
  18: "alt",
  17: "ctrl",
  91: "meta",
}

let handlers: Record<number, ShortcutHandler[]> = {}
let mods: ModifierState = { shift: false, alt: false, ctrl: false, meta: false }
let downKeys: number[] = []
let currentScope = "all"
let locked = false
let propagate = false

function updateModifiers(event: KeyboardEvent): void {
  for (const k of MODIFIER_KEYS) {
    const prop = MODIFIER_KEY_MAP[k]
    mods[prop] = !!(event as unknown as Record<string, boolean>)[prop]
  }
}

function filter(event: KeyboardEvent): boolean {
  const target = event.target || (event as unknown as { srcElement: EventTarget }).srcElement
  const tagName = (target as HTMLElement)?.tagName
  return tagName !== "INPUT" && tagName !== "SELECT" && tagName !== "TEXTAREA"
}

function dispatch(event: KeyboardEvent): void {
  const key = event.keyCode

  if (index(downKeys, key) === -1) {
    downKeys.push(key)
  }

  // right command / Gecko command
  const normalizedKey = key === 93 || key === 224 ? 91 : key

  if (normalizedKey in MODIFIER_KEY_MAP) {
    mods[MODIFIER_KEY_MAP[normalizedKey]] = true
    return
  }

  updateModifiers(event)

  if (!filter(event)) return
  if (!(key in handlers)) return

  const scope = currentScope

  for (let i = 0; i < handlers[key].length; i++) {
    const handler = handlers[key][i]

    if (handler.scope !== scope && handler.scope !== "all") continue

    let modifiersMatch = handler.mods.length > 0
    for (const k of MODIFIER_KEYS) {
      const modIdx = index(handler.mods, k)
      if (
        (!mods[MODIFIER_KEY_MAP[k]] && modIdx > -1) ||
        (mods[MODIFIER_KEY_MAP[k]] && modIdx === -1)
      ) {
        modifiersMatch = false
      }
    }

    const noModifiers =
      handler.mods.length === 0 && !mods.shift && !mods.alt && !mods.ctrl && !mods.meta

    if (noModifiers || modifiersMatch) {
      if (locked === true || handler.locked || handler.method(event) === false) {
        if ((locked === true && propagate) || (handler.locked && handler.propagate)) {
          continue
        }
        event.preventDefault()
        event.stopPropagation()
      }
    }
  }
}

function clearModifier(event: KeyboardEvent): void {
  const key = event.keyCode
  const i = index(downKeys, key)
  if (i >= 0) {
    downKeys.splice(i, 1)
  }

  const normalizedKey = key === 93 || key === 224 ? 91 : key
  if (normalizedKey in MODIFIER_KEY_MAP) {
    mods[MODIFIER_KEY_MAP[normalizedKey]] = false
  }
}

function resetModifiers(): void {
  for (const k of MODIFIER_KEYS) {
    mods[MODIFIER_KEY_MAP[k]] = false
  }
}

// Attach global listeners
if (typeof document !== "undefined") {
  document.addEventListener("keydown", dispatch)
  document.addEventListener("keyup", clearModifier)
}
if (typeof window !== "undefined") {
  window.addEventListener("focus", resetModifiers)
}

/**
 * Bind a keyboard shortcut.
 * @param keyCombo Shortcut string, e.g. "ctrl+s", "ctrl+shift+f", "a,b,c" for multiple
 * @param handler Callback, return false to prevent default
 * @param scope Optional scope name (default: "all")
 */
export function bind(
  keyCombo: string,
  handler: (e: KeyboardEvent) => boolean | undefined,
  scope = "all",
): void {
  const keys = getKeys(keyCombo)
  for (let i = 0; i < keys.length; i++) {
    const parts = keys[i].split("+")
    const m: number[] = []
    let k: string

    if (parts.length > 1) {
      for (let j = 0; j < parts.length - 1; j++) {
        m.push(MODIFIERS[parts[j]] ?? 0)
      }
      k = parts[parts.length - 1]
    } else {
      k = parts[0]
    }

    const keyCode = code(k)
    if (!(keyCode in handlers)) {
      handlers[keyCode] = []
    }
    handlers[keyCode].push({
      shortcut: keys[i],
      scope,
      method: handler,
      mods: m,
      locked: false,
      propagate: false,
    })
  }
}

/**
 * Unbind a keyboard shortcut.
 * @param keyCombo Shortcut string
 * @param scope Optional scope (default: current scope)
 */
export function unbind(keyCombo: string, scope?: string): void {
  const s = scope ?? currentScope
  const multipleKeys = getKeys(keyCombo)

  for (let j = 0; j < multipleKeys.length; j++) {
    const parts = multipleKeys[j].split("+")
    const m = parts.length > 1 ? getMods(parts) : []
    const k = parts[parts.length - 1]
    const keyCode = code(k)

    if (!handlers[keyCode]) return

    for (const i in handlers[keyCode]) {
      const obj = handlers[keyCode][i]
      if (obj.scope === s && compareArray(obj.mods, m)) {
        handlers[keyCode][i] = { ...obj, shortcut: "", method: () => false, mods: [] }
      }
    }
  }
}

/** Set the active scope for shortcuts. */
export function setScope(scope: string): void {
  currentScope = scope || "all"
}

/** Get the current scope. */
export function getScope(): string {
  return currentScope || "all"
}

/** Delete all handlers for a given scope. */
export function deleteScope(scope: string): void {
  for (const key in handlers) {
    const arr = handlers[key]
    for (let i = 0; i < arr.length; ) {
      if (arr[i].scope === scope) arr.splice(i, 1)
      else i++
    }
  }
}

/** Check if a key is currently pressed (by keyCode number or key name string). */
export function isPressed(keyCode: number | string): boolean {
  const code =
    typeof keyCode === "string"
      ? (KEY_MAP[keyCode] ?? keyCode.toUpperCase().charCodeAt(0))
      : keyCode
  return index(downKeys, code) !== -1
}

/** Get all currently pressed key codes. */
export function getPressedKeyCodes(): number[] {
  return downKeys.slice()
}

/** Suspend (pause) keyboard shortcut handling. */
export function suspend(key?: string, scope?: string, pass?: boolean): void {
  if (key) {
    setKeyOption(key, scope, "locked", true)
    if (pass) setKeyOption(key, scope, "propagate", true)
  } else {
    locked = true
    if (pass) propagate = true
  }
}

/** Resume keyboard shortcut handling. */
export function resume(key?: string, scope?: string): void {
  if (key) {
    setKeyOption(key, scope, "locked", false)
    setKeyOption(key, scope, "propagate", false)
  } else {
    locked = false
    propagate = false
  }
}

function setKeyOption(
  key: string,
  scope: string | undefined,
  option: "locked" | "propagate",
  value: boolean,
): void {
  const s = scope ?? currentScope
  const multipleKeys = getKeys(key)

  for (let j = multipleKeys.length - 1; j >= 0; j--) {
    const parts = multipleKeys[j].split("+")
    const m = parts.length > 1 ? getMods(parts) : []
    const k = parts[parts.length - 1]
    const keyCode = code(k)

    if (!handlers[keyCode]) continue

    for (const i in handlers[keyCode]) {
      const obj = handlers[keyCode][i]
      if (obj.scope === s && compareArray(obj.mods, m)) {
        handlers[keyCode][i][option] = value
      }
    }
  }
}

/** Reset all state (useful for testing). */
export function reset(): void {
  handlers = {}
  mods = { shift: false, alt: false, ctrl: false, meta: false }
  downKeys = []
  currentScope = "all"
  locked = false
  propagate = false
}

/**
 * React hook to bind a keyboard shortcut for the component lifecycle.
 * Registers on mount, unbinds on unmount.
 */
export function useHotkeys(
  keyCombo: string,
  handler: (e: KeyboardEvent) => boolean | undefined,
  deps: unknown[] = [],
  scope?: string,
): void {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  const stableHandler = useCallback((e: KeyboardEvent) => handlerRef.current(e), [])

  useEffect(() => {
    const s = scope ?? getScope()
    bind(keyCombo, stableHandler, s)
    return () => unbind(keyCombo, s)
  }, [keyCombo, stableHandler, scope, ...deps])
}

/**
 * React hook to set the active keyboard shortcut scope for the component lifecycle.
 */
export function useHotkeysScope(scope: string): void {
  const prevScope = useRef(getScope())

  useEffect(() => {
    prevScope.current = getScope()
    setScope(scope)
    return () => setScope(prevScope.current)
  }, [scope])
}
