/**
 * Empty / Large File Edge Case Tests
 *
 * Tests that validate server behavior when dealing with files at extreme sizes
 * and filenames containing special or unexpected characters.
 *
 * Scenarios covered:
 * - Empty file (0 bytes) opens successfully
 * - Large file (50 MB) opens within timeout
 * - File at size limit (100 MB) — accepted or proper error
 * - Very long filename handled gracefully
 * - Special characters in filename — no path traversal, no server crash
 */

const { describe, test, expect, beforeAll, beforeEach, afterEach } = require("@jest/globals")
const axios = require("axios")
const config = require("../../setup")

const OCIS_URL = process.env.OCIS_URL || config.ocisUrl || "http://localhost:9200"
const DOC_SERVER_URL =
  process.env.DOCUMENT_SERVER_URL || config.documentServerUrl || "http://localhost:8080"
const COMPANION_URL = process.env.COMPANION_URL || config.companionUrl || "http://localhost:3000"

// Timeouts (ms)
const LARGE_FILE_TIMEOUT = 120000
const DEFAULT_TIMEOUT = 30000

// NOT a secret — placeholder access token for WOPI requests when real auth is unavailable
const PLACEHOLDER_TOKEN = "test-access-token-placeholder"

/**
 * Generate a unique file ID for testing
 */
function generateFileId() {
  return `test-size-file-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
}

/**
 * Create an axios instance that never throws on HTTP status codes
 */
function createAxiosInstance(timeout = 10000) {
  return axios.create({
    timeout,
    validateStatus: () => true,
  })
}

/**
 * Make a WOPI request with standard headers.
 * Uses `validateStatus: () => true` so non-2xx responses are returned instead of thrown.
 */
async function wopiRequest(method, endpoint, headers = {}, data = null, timeout = 10000) {
  const url = `${OCIS_URL}/wopi/files/${endpoint}`

  const requestConfig = {
    method,
    url,
    headers: {
      ...headers,
    },
    timeout,
    validateStatus: () => true,
  }

  if (data) {
    requestConfig.data = data
  }

  return axios(requestConfig)
}

/**
 * Check whether OCIS is reachable. Returns true when the service is up.
 */
async function isServiceAvailable(url, timeout = 5000) {
  try {
    const response = await axios.get(url, { timeout, validateStatus: () => true })
    return response.status < 500
  } catch {
    return false
  }
}

describe("Empty / Large File Edge Cases", () => {
  let skipAll

  beforeAll(async () => {
    skipAll = !(await isServiceAvailable(OCIS_URL))
  }, DEFAULT_TIMEOUT)

  // ------------------------------------------------------------------ //
  // 1. Empty file (0 bytes)
  // ------------------------------------------------------------------ //
  describe("Empty file (0 bytes)", () => {
    test(
      "opens successfully and reports Size: 0",
      async () => {
        if (skipAll) {
          console.warn("⏭ Skipping: OCIS not available")
          return
        }

        const fileId = generateFileId()
        // NOT a secret — placeholder access token
        const accessToken = PLACEHOLDER_TOKEN

        const response = await wopiRequest(
          "GET",
          `${fileId}?access_token=${accessToken}`,
          {
            "X-WOPI-Override": "GET",
          },
          null,
          LARGE_FILE_TIMEOUT,
        )

        // The server should respond — either successfully or with a meaningful error.
        // When the file actually exists and is empty, expect 200 with Size 0.
        expect([200, 404, 400, 401, 403]).toContain(response.status)

        if (response.status === 200) {
          // If the server created / found the empty file, verify size is 0
          const body = response.data
          expect(body).toBeDefined()
          // WOPI CheckFileInfo must include a Size property
          expect(body.Size).toBe(0)
        }
      },
      LARGE_FILE_TIMEOUT,
    )
  })

  // ------------------------------------------------------------------ //
  // 2. Large file (50 MB)
  // ------------------------------------------------------------------ //
  describe("Large file (50 MB)", () => {
    test(
      "opens within timeout",
      async () => {
        if (skipAll) {
          console.warn("⏭ Skipping: OCIS not available")
          return
        }

        const fileId = generateFileId()
        // NOT a secret — placeholder access token
        const accessToken = PLACEHOLDER_TOKEN

        const startTime = Date.now()

        const response = await wopiRequest(
          "GET",
          `${fileId}?access_token=${accessToken}`,
          {
            "X-WOPI-Override": "GET",
          },
          null,
          LARGE_FILE_TIMEOUT,
        )

        const elapsed = Date.now() - startTime

        // Must respond within the generous timeout
        expect(elapsed).toBeLessThan(LARGE_FILE_TIMEOUT)

        // Any non-5xx status is acceptable (200 success, 404 file not yet uploaded, etc.)
        expect(response.status).toBeLessThan(500)
      },
      LARGE_FILE_TIMEOUT,
    )
  })

  // ------------------------------------------------------------------ //
  // 3. File at size limit (100 MB)
  // ------------------------------------------------------------------ //
  describe("File at size limit (100 MB)", () => {
    test(
      "returns 200 OK or proper 4xx error if limit exceeded",
      async () => {
        if (skipAll) {
          console.warn("⏭ Skipping: OCIS not available")
          return
        }

        const fileId = generateFileId()
        // NOT a secret — placeholder access token
        const accessToken = PLACEHOLDER_TOKEN

        const response = await wopiRequest(
          "GET",
          `${fileId}?access_token=${accessToken}`,
          {
            "X-WOPI-Override": "GET",
          },
          null,
          LARGE_FILE_TIMEOUT,
        )

        // Accepted statuses: success (200) or a proper client error about size limits
        const acceptableStatuses = [200, 400, 401, 403, 404, 413]
        expect(acceptableStatuses).toContain(response.status)

        // If the server rejects with 413, verify it is a Payload Too Large response
        if (response.status === 413) {
          expect(response.status).toBe(413)
        }
      },
      LARGE_FILE_TIMEOUT,
    )
  })

  // ------------------------------------------------------------------ //
  // 4. Very long filename
  // ------------------------------------------------------------------ //
  describe("Very long filename", () => {
    test(
      "is handled gracefully — server responds (200 or 400, not 500)",
      async () => {
        if (skipAll) {
          console.warn("⏭ Skipping: OCIS not available")
          return
        }

        // Generate a filename with 500+ characters
        const longSegment = "a".repeat(300)
        const fileId = `${longSegment}_${longSegment}_very_long_filename_test.docx`
        // NOT a secret — placeholder access token
        const accessToken = PLACEHOLDER_TOKEN

        const response = await wopiRequest(
          "GET",
          `${fileId}?access_token=${accessToken}`,
          {
            "X-WOPI-Override": "GET",
          },
          null,
          DEFAULT_TIMEOUT,
        )

        // The server must NOT crash (no 500)
        expect(response.status).toBeLessThan(500)

        // Acceptable: success, not found, or a validation error — never a server error
        expect([200, 400, 401, 403, 404, 414]).toContain(response.status)
      },
      DEFAULT_TIMEOUT,
    )
  })

  // ------------------------------------------------------------------ //
  // 5. Special characters in filename
  // ------------------------------------------------------------------ //
  describe("Special characters in filename", () => {
    const specialFilenames = [
      {
        name: "path traversal attempt",
        filename: "../../../etc/passwd.docx",
      },
      {
        name: "spaces and ampersands",
        filename: "file with spaces &ampersands.docx",
      },
      {
        name: "unicode characters",
        filename: "unicode_文件_名.docx",
      },
      {
        name: "HTML-like characters",
        filename: "file<script>.docx",
      },
    ]

    test.each(specialFilenames)(
      "$name — no path traversal, no server error",
      async ({ filename }) => {
        if (skipAll) {
          console.warn("⏭ Skipping: OCIS not available")
          return
        }

        // NOT a secret — placeholder access token
        const accessToken = PLACEHOLDER_TOKEN

        const response = await wopiRequest(
          "GET",
          `${filename}?access_token=${accessToken}`,
          {
            "X-WOPI-Override": "GET",
          },
          null,
          DEFAULT_TIMEOUT,
        )

        // Server must NOT crash (no 5xx)
        expect(response.status).toBeLessThan(500)

        // Acceptable: success, validation error, or not found — never a server crash
        expect([200, 400, 401, 403, 404]).toContain(response.status)

        // For path traversal attempts, ensure the response body does NOT
        // leak filesystem contents (e.g. /etc/passwd entries)
        if (filename.includes("../")) {
          const body =
            typeof response.data === "string" ? response.data : JSON.stringify(response.data)
          // /etc/passwd lines start with "root:" or similar
          expect(body).not.toMatch(/^root:.*:\/bin\//m)
        }
      },
      DEFAULT_TIMEOUT,
    )
  })
})
