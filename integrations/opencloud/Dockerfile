# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application code
COPY . .

# Verify config exists
RUN test -f lib/config.js || exit 1

# Stage 2: Runtime
FROM node:20-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S world-office && \
    adduser -S -u 1001 -G world-office world-office

WORKDIR /app

# Copy dependencies and app from builder
COPY --from=builder --chown=world-office:world-office /app/node_modules ./node_modules
COPY --from=builder --chown=world-office:world-office /app ./

# Create data directories
RUN mkdir -p data/ocis data/documentserver data/traefik && \
    chown -R world-office:world-office data

# Switch to non-root user
USER world-office

# Expose dashboard port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the app
CMD ["node", "app.js"]
