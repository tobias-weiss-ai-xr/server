import { expect, test } from "@playwright/test"

test.describe("API: Conversion", () => {
  test("should return error for unsupported format", async ({ request }) => {
    const response = await request.post("/ConvertService.ashx", {
      data: {
        filetype: "xyz",
      },
    })
    expect(response.status()).toBe(400)
  })
})
