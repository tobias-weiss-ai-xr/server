/**
 * Simple key-value store for internal application settings.
 */

const settings = new Map<string, unknown>()

/**
 * Get a setting value.
 *
 * @param name - Setting name/key
 * @returns Setting value or undefined if not found
 */
export function get<T = unknown>(name: string): T | undefined {
  return settings.get(name) as T | undefined
}

/**
 * Set a setting value.
 *
 * @param name - Setting name/key
 * @param value - Setting value
 */
export function set(name: string, value: unknown): void {
  settings.set(name, value)
}

/**
 * Remove a setting.
 *
 * @param name - Setting name/key
 * @returns true if setting was removed, false if it didn't exist
 */
export function remove(name: string): boolean {
  return settings.delete(name)
}

/**
 * Check if a setting exists.
 *
 * @param name - Setting name/key
 * @returns true if setting exists
 */
export function has(name: string): boolean {
  return settings.has(name)
}

/**
 * Clear all settings.
 */
export function clear(): void {
  settings.clear()
}

/**
 * Get all setting keys.
 *
 * @returns Array of setting names
 */
export function keys(): string[] {
  return Array.from(settings.keys())
}

/**
 * Get all settings as key-value pairs.
 *
 * @returns Array of [key, value] tuples
 */
export function entries(): [string, unknown][] {
  return Array.from(settings.entries())
}
