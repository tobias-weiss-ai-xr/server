import { expect, test } from "@playwright/test"

test.describe("Documents", () => {
  test("should display the toolbar", async ({ page }) => {
    await page.goto("/documenteditor/")
    // Wait for editor to initialize
    const toolbar = page.locator(".toolbar, [data-role='toolbar']")
    await expect(toolbar.first()).toBeVisible({ timeout: 15_000 })
  })

  test("should show the document canvas", async ({ page }) => {
    await page.goto("/documenteditor/")
    const canvas = page.locator("canvas")
    await expect(canvas).toBeVisible({ timeout: 15_000 })
  })
})
