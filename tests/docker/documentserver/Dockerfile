# Document Server Dockerfile - Built from World-Office/core/ fork
# 
# This Dockerfile builds Document Server from our fork at:
# https://codeberg.org/World-Office/core
#
# Build time: ~2-4 hours (C++ compilation)
# 
# Usage:
#   docker build -t world-office-documentserver:latest .
#   docker run -e JWT_SECRET=your_secret -p 8080:80 world-office-documentserver

# =============================================================================
# Stage 1: Builder - Compile C++ core and Node.js services
# =============================================================================
FROM ubuntu:24.04 AS builder

# Avoid interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    git \
    curl \
    wget \
    ca-certificates \
    pkg-config \
    libssl-dev \
    libcurl4-openssl-dev \
    libboost-all-dev \
    qtbase5-dev \
    libqt5webkit5-dev \
    libpocofoundation80 \
    libpocoutil80 \
    libpqxx-dev \
    postgresql-server-dev-all \
    python3 \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Clone World-Office/core fork (NOT from local workspace - it has empty submodules)
RUN git clone --depth=1 https://codeberg.org/World-Office/core.git

# Initialize submodules - CRITICAL: sdkjs is a submodule that must be fetched
WORKDIR /build/core
RUN git submodule update --init --recursive || \
    (echo "Submodule init failed, cloning sdkjs directly..." && \
     git clone --depth=1 https://codeberg.org/World-Office/sdkjs.git sdkjs)

# Build core with CMake (Release mode for production)
RUN cmake -B build \
    -DCMAKE_BUILD_TYPE=Release \
    -DCONFIG_NODE=/etc/world-office/documentserver/default.json \
    && cmake --build build -j$(nproc)

# Build Node.js services (sdkjs)
WORKDIR /build/core/sdkjs
RUN npm install --production || npm install --legacy-peer-deps

# =============================================================================
# Stage 2: Runtime - Minimal image with only necessary components
# =============================================================================
FROM ubuntu:24.04

# Avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install runtime dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    nodejs \
    postgresql \
    rabbitmq-server \
    redis-server \
    supervisor \
    curl \
    fontconfig \
    fonts-dejavu \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

# Create necessary directories
RUN mkdir -p /var/log/world-office \
    /var/lib/world-office/documentserver/App_Data/cache/files \
    /var/www/world-office/documentserver/Data \
    /etc/world-office/documentserver

# Copy built artifacts from builder stage
COPY --from=builder /build/core/build /var/www/world-office/documentserver
COPY --from=builder /build/core/sdkjs /var/www/world-office/documentserver/sdkjs

# Create default configuration
RUN echo '{ \
    "services": { \
        "CoAuthoring": { \
            "server": { \
                "port": 8000 \
            }, \
            "sql": { \
                "type": "postgres", \
                "dbHost": "localhost", \
                "dbPort": 5432, \
                "dbName": "world-office", \
                "dbUser": "world-office", \
                "dbPass": "world-office" \
            } \
        } \
    } \
}' > /etc/world-office/documentserver/default.json

# Create supervisor configuration
RUN mkdir -p /etc/world-office/documentserver/supervisor && \
    echo '[supervisord]' > /etc/world-office/documentserver/supervisor/supervisord.conf && \
    echo 'nodaemon=true' >> /etc/world-office/documentserver/supervisor/supervisord.conf && \
    echo 'logfile=/var/log/world-office/supervisord.log' >> /etc/world-office/documentserver/supervisor/supervisord.conf && \
    echo 'pidfile=/var/run/supervisord.pid' >> /etc/world-office/documentserver/supervisor/supervisord.conf

# JWT configuration - injected at runtime via -e JWT_SECRET=xxx
ARG JWT_SECRET=change_me
ENV JWT_SECRET=${JWT_SECRET}
ENV JWT_HEADER=Authorization
ENV JWT_IN_BODY=true

# Expose HTTP port (mapped to 8080 in docker-compose)
EXPOSE 80

# Health check - verify WOPI discovery endpoint is responding
HEALTHCHECK --interval=10s --timeout=5s --start-period=120s --retries=30 \
    CMD curl -f http://localhost/hosting/discovery || exit 1

# Set working directory
WORKDIR /var/www/world-office/documentserver

# Start services via supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/world-office/documentserver/supervisor/supervisord.conf"]
