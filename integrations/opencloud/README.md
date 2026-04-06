![World-Office](https://codeberg.org/World-Office/artwork/raw/branch/main/assets/banner.png)

# world-office-opencloud

A deployment companion for World-Office Document Server and ownCloud Infinite Scale (OCIS). It provides a simple way to orchestrate OCIS, Document Server, and supporting services via Docker Compose.

> **Disclaimer:** World-Office is an independent open-source fork hosted on Codeberg and is not affiliated with, endorsed by, or controlled by any of the upstream projects or integration providers referenced in this repository (including WORLDOFFICE, Ascensio System SIA, and others). World-Office is entirely separate from "word-office" (a GitHub organization associated with Nextcloud and IONOS). World-Office maintains its own development roadmap, release cycle, and support channels.
>
> All meaningful pull requests from WORLDOFFICE and word-office on GitHub have been reviewed and, where applicable, synced into this fork. An automated watch is in place that continuously monitors and integrates relevant upstream developments.

## Features

- **Interactive Setup Wizard**: Web-based configuration with validation
- **Docker Compose Generation**: Automatically generates full stack configuration
- **Health Dashboard**: Real-time service status monitoring
- **WOPI Integration**: Seamless OCIS collaboration with Document Server
- **World-Office Branding**: Consistent visual identity with deep void theme

## Architecture

world-office-opencloud is a deployment companion that:

1. Generates OCIS and Document Server configurations from a single `.env` file
2. Creates Docker Compose files for the full stack (Traefik, OCIS, Document Server)
3. Provides a web dashboard for monitoring service health
4. Offers a setup wizard for easy initial configuration

The architecture leverages OCIS's native WOPI collaboration service, so no custom protocol code is needed.

## Quick Start

### Prerequisites

- Docker 20.10+ and Docker Compose 2.0+
- Node.js 20+ (for running the companion)
- Two domain names (one for OCIS, one for Document Server)

### Installation

```bash
# Clone the repository
git clone https://codeberg.org/World-Office/world-office-opencloud.git
cd world-office-opencloud

# Install dependencies
npm install

# Start the companion
npm start
```

### Setup

1. Open your browser and navigate to `http://localhost:3000/setup`
2. Fill in your configuration:
   - OCIS Domain (e.g., `ocis.example.com`)
   - Document Server Domain (e.g., `docs.example.com`)
   - Dashboard Port (default: 3000)
   - Features (SSL, metrics, logs)
3. Click "Save Configuration"
4. Run `docker-compose up -d` to start all services
5. Visit your OCIS domain to start using World-Office Cloud

### Accessing Services

- **Dashboard**: `http://localhost:3000`
- **OCIS**: `https://<your-ocis-domain>`
- **Document Server**: `https://<your-docs-domain>`
- **Health API**: `http://localhost:3000/api/health`

## Configuration

The application uses a single `.env` file for configuration. After running the setup wizard, the file will be automatically created.

### Required Settings

- `OCIS_DOMAIN`: Public URL for OCIS (e.g., `ocis.example.com`)
- `DOCUMENT_SERVER_DOMAIN`: Public URL for Document Server (e.g., `docs.example.com`)
- `OCIS_JWT_SECRET`: Shared secret for WOPI authentication (min 32 chars)
- `DOCUMENT_SERVER_JWT_SECRET`: JWT secret for Document Server (min 32 chars)

### Optional Settings

- `PORT`: Dashboard port (default: 3000)
- `ENABLE_SSL`: Enable SSL/TLS (default: true)
- `ENABLE_METRICS`: Enable metrics collection (default: true)
- `ENABLE_LOGS`: Enable log collection (default: true)

### Docker Settings

- `OCIS_IMAGE`: OCIS Docker image (default: `owncloud/ocis:latest`)
- `DOCUMENT_SERVER_IMAGE`: Document Server image (default: `world-office/documentserver:latest`)
- `TRAEFIK_IMAGE`: Traefik image (default: `traefik:v2.10`)

## Development

```bash
# Install development dependencies
npm install

# Run with auto-reload
npm run dev

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Docker Deployment

### Using Docker Compose

```bash
# Build the companion image
docker build -t world-office-opencloud:latest .

# Run with Docker Compose
docker-compose up -d
```

### Standalone Docker

```bash
docker run -d \
  --name world-office-opencloud \
  -p 3000:3000 \
  -v $(pwd)/.env:/app/.env \
  -v $(pwd)/data:/app/data \
  world-office-opencloud:latest
```

## API Endpoints

### Health Check

```bash
# Get overall health status
curl http://localhost:3000/api/health

# Check WOPI connectivity
curl http://localhost:3000/api/health/wopi

# Get system metrics
curl http://localhost:3000/api/metrics
```

### Configuration

```bash
# Get current configuration (sanitized)
curl http://localhost:3000/api/config
```

## Services

The Docker Compose stack includes:

- **Traefik**: Reverse proxy with automatic SSL
- **OCIS**: ownCloud Infinite Scale (file sharing platform)
- **OCIS Collaboration**: WOPI service for document editing
- **Document Server**: World-Office document editors

## Troubleshooting

### Services Not Starting

Check container logs:
```bash
docker-compose logs -f <service-name>
```

### WOPI Connection Issues

Verify JWT secrets match between OCIS and Document Server:
```bash
# Check OCIS JWT secret
docker exec world-office-ocis env | grep JWT_SECRET

# Check Document Server JWT secret
docker exec world-office-documentserver env | grep JWT_SECRET
```

### Dashboard Not Accessible

Ensure the companion is running:
```bash
docker ps | grep world-office-opencloud
```

Check port configuration:
```bash
docker logs world-office-opencloud | grep "port"
```

## Security Considerations

- Never commit `.env` files to version control
- Use strong, randomly generated JWT secrets (minimum 32 characters)
- Enable SSL/TLS in production
- Keep Docker images updated
- Review Traefik security headers

## Architecture Details

### WOPI Protocol

The integration uses the WOPI (Web Application Open Platform Interface) protocol:

- **WOPI Host**: OCIS (handles file storage and user authentication)
- **WOPI Client**: Document Server (provides document editing interface)
- **Authentication**: JWT tokens signed with shared secret

### Data Flow

1. User accesses OCIS web interface
2. User opens a document
3. OCIS WOPI service requests editing session from Document Server
4. Document Server loads in iframe with JWT token
5. User edits, changes sync via WOPI protocol

## Contributing

Contributions are welcome! Please follow these guidelines:

- Fork the repository
- Create a feature branch
- Make your changes
- Add tests if applicable
- Submit a pull request

## License

This project is licensed under the AGPL-3.0 License. See LICENSE file for details.

## Support

- **Documentation**: See `docs/DESIGN.md` for architecture details
- **Issues**: Report bugs on Codeberg
- **Community**: Join our discussions for questions

## Related Projects

- [world-office-nextcloud](https://codeberg.org/World-Office/world-office-nextcloud) - Nextcloud integration
- [OCIS](https://github.com/owncloud/ocis) - ownCloud Infinite Scale
- [World-Office Document Server](https://codeberg.org/World-Office/DocumentServer) - Document editor

---

© 2024 World-Office. Released under AGPL-3.0.
