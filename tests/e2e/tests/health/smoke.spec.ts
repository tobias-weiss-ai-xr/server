import { test, expect } from "@playwright/test";

test.describe("Health", () => {
  test("should load the document editor", async ({ page }) => {
    await page.goto("/documenteditor/");
    await expect(page).toHaveTitle(/World Office/i);
  });

  test("should load the spreadsheet editor", async ({ page }) => {
    await page.goto("/spreadsheeteditor/");
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible({ timeout: 15_000 });
  });

  test("should load the presentation editor", async ({ page }) => {
    await page.goto("/presentationeditor/");
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible({ timeout: 15_000 });
  });

  test("health check endpoint returns 200", async ({ request }) => {
    const response = await request.get("/health");
    expect(response.status()).toBe(200);
  });
});
