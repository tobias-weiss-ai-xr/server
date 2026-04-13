import type { Page } from "@playwright/test"

/**
 * Wait for the editor canvas to be fully initialized.
 */
export async function waitForEditorReady(page: Page, timeout = 15_000): Promise<void> {
  const canvas = page.locator("canvas")
  await canvas.waitFor({ state: "visible", timeout })
  // Give the editor a moment to finish rendering
  await page.waitForTimeout(1000)
}

/**
 * Log in to the document server.
 */
export async function login(page: Page, username: string, password: string): Promise<void> {
  await page.goto("/login")
  const userField = page.locator("#username, input[name='username']")
  const passField = page.locator("#password, input[name='password']")
  await userField.fill(username)
  await passField.fill(password)
  await page.click("button[type='submit']")
  await page.waitForURL("**/files/**", { timeout: 10_000 })
}
