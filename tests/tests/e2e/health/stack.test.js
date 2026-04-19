/**
 * Full Stack Integration Tests
 *
 * Tests that verify all services work together as a stack.
 */

const { describe, test, expect, beforeAll } = require("@jest/globals")
const axios = require("axios")
const config = require("../../setup")

const DS_URL = config.documentServerUrl
const OCIS_URL = config.ocisUrl
const COMPANION_URL = config.companionUrl

let companionAvailable = false

beforeAll(async () => {
  try {
    const response = await axios.get(`${COMPANION_URL}/api/health`, { timeout: 3000 })
    companionAvailable = response.status === 200
  } catch {
    companionAvailable = false
  }
})

describe("Full Stack Integration", () => {
  describe("All Services Healthy", () => {
    const requiredServices = ["documentserver", "ocis"]
    if (companionAvailable) requiredServices.push("companion")

    test(`${requiredServices.length} services are simultaneously healthy`, async () => {
      const { waitForAllServices } = require("../../helpers/docker")

      const result = await waitForAllServices(requiredServices, 300000)

      expect(result.success).toBe(true)
    }, 330000)
  })

  describe("Service Communication", () => {
    test("OCIS WOPI endpoint is accessible", async () => {
      const response = await axios.get(`${OCIS_URL}/.well-known/openid-configuration`)
      expect(response.status).toBe(200)
    }, 10000)

    if (companionAvailable) {
      test("companion can reach Document Server", async () => {
        const response = await axios.get(`${COMPANION_URL}/api/health`)
        const dsHealth = response.data.services?.documentserver

        expect(dsHealth).toBeDefined()
        expect(dsHealth.running).toBe(true)
      }, 30000)

      test("companion can reach OCIS", async () => {
        const response = await axios.get(`${COMPANION_URL}/api/health`)
        const ocisHealth = response.data.services?.ocis

        expect(ocisHealth).toBeDefined()
        expect(ocisHealth.running).toBe(true)
      }, 30000)
    }
  })

  describe("Container Stability", () => {
    test("no containers in restart loop", async () => {
      const { getContainerHealth } = require("../../helpers/docker")

      const dsHealth = await getContainerHealth("test-documentserver")
      const ocisHealth = await getContainerHealth("test-ocis")

      expect(dsHealth.restartCount || 0).toBeLessThan(3)
      expect(ocisHealth.restartCount || 0).toBeLessThan(3)

      if (companionAvailable) {
        const companionHealth = await getContainerHealth("test-companion")
        expect(companionHealth.restartCount || 0).toBeLessThan(3)
      }
    }, 30000)
  })
})
