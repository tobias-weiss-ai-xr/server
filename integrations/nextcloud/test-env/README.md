# Euro-Office Nextcloud Integration — Test Environment

## Overview

Docker Compose environment for testing the Euro-Office Nextcloud integration app against a Euro-Office Document Server instance.

## Services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| `world-office-docs` | `ghcr.io/world-office/documentserver:latest` | 8080 | Euro-Office Document Server |
| `nextcloud` | `nextcloud:33` | 8081 | Nextcloud instance |

## Quick Start

```bash
# Start everything
docker compose up -d

# Wait for Document Server to be ready (~30s)
docker compose logs -f world-office-docs | grep -m1 "ready"

# Configure Nextcloud integration (runs automatically on first start)
docker compose exec nextcloud bash /setup-world-office.sh

# Open Nextcloud
# http://localhost:8081
# Admin: admin / admin
```

## Configuration

### JWT Secret
Both services use `mysecret` as the JWT secret. Change in both places:

1. `world-office-docs` → `JWT_SECRET` env var
2. `setup-world-office.sh` → `jwt_secret` occ command

### Internal URLs
- Nextcloud sees Document Server at: `http://world-office-docs/`
- Document Server sees Nextcloud at: `http://nextcloud/`

### Manual Setup (if auto-setup fails)

```bash
docker compose exec nextcloud bash

# Install the app manually
php occ app:install world-office
# or copy from local source:
# cp -r /path/to/world-office-nextcloud /var/www/html/apps/world-office

# Configure
php occ config:app:set world-office DocumentServerUrl --value="http://localhost:8080/"
php occ config:app:set world-office DocumentServerInternalUrl --value="http://world-office-docs/"
php occ config:app:set world-office StorageUrl --value="http://nextcloud/"
php occ config:app:set world-office jwt_secret --value="mysecret"
php occ config:app:set world-office VerifyPeerOff --value="true"

# Verify connection
php occ world-office:documentserver --check
```

### Install Local App Source

To test your local `world-office-nextcloud` source:

```bash
# Build JS assets (requires Node.js 20+)
cd world-office-nextcloud
npm install
npm run build
composer install

# Copy to running container
docker compose cp ./ nextcloud:/var/www/html/apps/world-office
docker compose exec nextcloud chown -R www-data:www-data /var/www/html/apps/world-office

# Enable and configure
docker compose exec nextcloud php occ app:enable world-office
```

## Teardown

```bash
docker compose down -v  # removes all data
```

## Notes

- Document Server takes ~30-60 seconds to fully initialize on first start
- SQLite is used for simplicity — not suitable for production
- The `ALLOW_PRIVATE_IP_ADDRESS` and `USE_UNAUTHORIZED_STORAGE` env vars are set for development convenience
- For production, use HTTPS with a reverse proxy (traefik/nginx)
