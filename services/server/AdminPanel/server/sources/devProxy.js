const http = require("node:http")
const cors = require("cors")
const operationContext = require("../../../Common/sources/operationContext")

/**
 * Setup development proxy to DocService
 * @param {object} app - Express app
 * @param {object} server - HTTP server
 * @param {number} targetPort - DocService port
 */
function setupDevProxy(app, server, targetPort) {
  /**
   * Simple proxy middleware for DocService HTTP requests
   * @param {object} req - Express request
   * @param {object} res - Express response
   * @param {Function} next - Express next
   */
  function proxyToDocService(req, res, next) {
    // Skip requests that start with /admin
    if (req.path.startsWith("/admin")) {
      return next()
    }

    const proxyReq = http.request(
      {
        hostname: req.hostname || "localhost",
        port: targetPort,
        path: req.url,
        method: req.method,
        headers: req.headers,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers)
        proxyRes.pipe(res)
      },
    )

    proxyReq.on("error", (err) => {
      operationContext.global.logger.error("Proxy error: %s", err.message)
      res.status(502).send("Bad Gateway")
    })

    req.pipe(proxyReq)
  }

  app.use(proxyToDocService)

  /**
   * Proxy WebSocket upgrade requests to DocService
   */
  server.on("upgrade", (req, socket, _head) => {
    // Skip WebSocket requests that start with /admin
    if (req.url.startsWith("/admin")) {
      socket.destroy()
      return
    }

    const proxyReq = http.request({
      hostname: req.headers.host?.split(":")[0] || "localhost",
      port: targetPort,
      path: req.url,
      method: req.method,
      headers: req.headers,
    })

    proxyReq.on("upgrade", (proxyRes, proxySocket, proxyHead) => {
      // Forward upgrade response to client
      socket.write(
        `HTTP/${proxyRes.httpVersion} ${proxyRes.statusCode} ${proxyRes.statusMessage}\r\n`,
      )
      Object.entries(proxyRes.headers).forEach(([key, value]) => {
        socket.write(`${key}: ${value}\r\n`)
      })
      socket.write("\r\n")
      socket.write(proxyHead)

      // Bidirectional pipe
      proxySocket.pipe(socket)
      socket.pipe(proxySocket)
    })

    proxyReq.on("error", (err) => {
      operationContext.global.logger.error("WebSocket proxy error: %s", err.message)
      socket.destroy()
    })

    proxyReq.end()
  })
}

/**
 * Get CORS middleware for development
 * @returns {Function} CORS middleware
 */
function getDevCors() {
  return cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
}

module.exports = { setupDevProxy, getDevCors }
