# World Office Nextcloud Integration — Test Environment

## Overview

Docker Compose environment for testing the World Office Nextcloud integration app against a World Office Document Server instance.

## Services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| `worldoffice-docs` | `ghcr.io/world-office/documentserver:latest` | 8080 | World Office Document Server |
| `nextcloud` | `nextcloud:33` | 8081 | Nextcloud instance |

## Quick Start

```bash
# Start everything
docker compose up -d

# Wait for Document Server to be ready (~30s)
docker compose logs -f worldoffice-docs | grep -m1 "ready"

# Configure Nextcloud integration (runs automatically on first start)
docker compose exec nextcloud bash /setup-world-office.sh

# Open Nextcloud
# http://localhost:8081
# Admin: admin / admin
```

## Configuration

### JWT Secret
Both services use `mysecret` as the JWT secret. Change in both places:

1. `worldoffice-docs` → `JWT_SECRET` env var
2. `setup-world-office.sh` → `jwt_secret` occ command

### Internal URLs
- Nextcloud sees Document Server at: `http://worldoffice-docs/`
- Document Server sees Nextcloud at: `http://nextcloud/`

### Manual Setup (if auto-setup fails)

```bash
docker compose exec nextcloud bash

# Install the app manually
php occ app:install worldoffice
# or copy from local source:
# cp -r /path/to/worldoffice-nextcloud /var/www/html/apps/worldoffice

# Configure
php occ config:app:set worldoffice DocumentServerUrl --value="http://localhost:8080/"
php occ config:app:set worldoffice DocumentServerInternalUrl --value="http://worldoffice-docs/"
php occ config:app:set worldoffice StorageUrl --value="http://nextcloud/"
php occ config:app:set worldoffice jwt_secret --value="mysecret"
php occ config:app:set worldoffice VerifyPeerOff --value="true"

# Verify connection
php occ worldoffice:documentserver --check
```

### Install Local App Source

To test your local `worldoffice-nextcloud` source:

```bash
# Build JS assets (requires Node.js 20+)
cd worldoffice-nextcloud
npm install
npm run build
composer install

# Copy to running container
docker compose cp ./ nextcloud:/var/www/html/apps/worldoffice
docker compose exec nextcloud chown -R www-data:www-data /var/www/html/apps/worldoffice

# Enable and configure
docker compose exec nextcloud php occ app:enable worldoffice
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
