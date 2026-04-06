const express = require('express');
const router = express.Router();
const { getHealthStatus } = require('../lib/health.js');

/**
 * GET /api/health — JSON health status of all services.
 */
router.get('/health', async (req, res) => {
  try {
    const health = await getHealthStatus();
    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      services: {},
      config: {},
      version: '1.0.0'
    });
  }
});

module.exports = router;
