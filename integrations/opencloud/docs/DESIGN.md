# worldoffice-opencloud Design Document

**Version:** 1.0
**Date:** 2026-04-04
**Status:** Design Phase

---

## Executive Summary

worldoffice-opencloud aims to provide a seamless integration between World Office Document Server and ownCloud Infinite Scale (OCIS). This document outlines three architectural approaches, with detailed analysis of trade-offs, dependencies, and implementation considerations.

The primary insight from our research is that OCIS already has a native WOPI collaboration service. The integration is primarily configuration-based rather than requiring custom protocol code. This shapes our architectural choices significantly.

---

## 1. Context

### 1.1 What is OCIS?

ownCloud Infinite Scale (OCIS) is a next-generation file sharing and collaboration platform. It's designed as a microservices architecture, built with Go, and supports extensible services through a plugin-like architecture. Key features include:

- File storage and sharing
- User and group management
- Extension services (including WOPI for document collaboration)
- Modern RESTful APIs
- Cloud-native deployment (Docker, Kubernetes)

### 1.2 What is WOPI?

WOPI (Web Application Open Platform Interface) is a protocol that enables web applications to interact with document editing services. It defines how a WOPI host (OCIS) communicates with a WOPI client (Document Server) for:

- Document discovery and metadata
- File retrieval and locking
- Content synchronization
- User authentication via JWT tokens

The WOPI protocol is HTTP-based, RESTful, and stateless, making it ideal for cloud-native deployments.

### 1.3 Why This Project Exists

World Office is an independent, sovereign document editing suite. While worldoffice-nextcloud integrates with Nextcloud, there's no equivalent integration for OCIS users.

OCIS has built-in WOPI support and integrates with Collabora and World-Office. However, setting up a production deployment requires manual configuration of multiple components. worldoffice-opencloud aims to simplify this process.

### 1.4 Current State

The project currently contains a bare Express.js prototype (1 commit) with:

- Mock authentication
- In-memory file storage
- Basic CRUD routes
- No actual WOPI implementation
- No OCIS integration

This prototype will be replaced entirely. All code is throwaway scaffolding.

### 1.5 Relationship to World Office-nextcloud

World Office-nextcloud provides a mature integration pattern for Nextcloud. Key reusable elements include:

- JWT configuration structure (shared secret, expiration, leeway)
- Token signing with HS256
- Dual-token pattern (header token + body token)
- Converter payload structure
- Editor initialization flow

These patterns inform our design but require adaptation for OCIS's different architecture.

---

## 2. Approach 1: Deployment Companion ("World Office Cloud in a Box")

### 2.1 Architecture

This approach builds a deployment companion that orchestrates OCIS, World Office Document Server, and supporting services through Docker Compose. The app generates all necessary configurations from a single environment file.

```
┌─────────────────────────────────────────────────────────────┐
│                    World Office-opencloud                       │
│                    (Deployment Companion)                     │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Setup Wizard │  │   Config     │  │ Health Dashboard │   │
│  │              │  │  Generator   │  │                  │   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘   │
│         │                 │                   │             │
└─────────┼─────────────────┼───────────────────┼─────────────┘
          │                 │                   │
          ▼                 ▼                   ▼
    .env file         docker-compose.yml     Health API
          │                 │                   │
          └─────────────────┴───────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Traefik    │    │     OCIS     │    │ Document     │
│   (Proxy)    │    │              │    │ Server       │
└──────────────┘    └──────────────┘    └──────────────┘
                           │
                    ┌──────┴──────┐
                    │ Collaboration│
                    │   Service   │
                    └─────────────┘
```

### 2.2 Components

**Config Generator Module**
- Reads user-provided `.env` file
- Validates required fields (domains, secrets, ports)
- Generates `docker-compose.yml` for full stack
- Generates OCIS environment configuration
- Generates Document Server configuration
- Provides error messages for invalid configuration

**Setup Wizard**
- Web-based form (EJS template) for interactive configuration
- Pre-fills defaults where sensible
- Validates input client-side and server-side
- Generates `.env` file on submission
- Guides users through first deployment

**Health Check Dashboard**
- Real-time status of all services (Traefik, OCIS, Document Server, Collaboration)
- Shows uptime, memory usage, container health
- Displays WOPI connection status
- Provides one-click logs for each service
- Quick restart commands

**Deploy/Teardown Commands**
- CLI commands for common operations
- `npm start` - Launch full stack
- `npm stop` - Stop all services
- `npm restart <service>` - Restart specific service
- `npm logs <service>` - Stream logs
- `npm status` - Show service status

### 2.3 Data Flow

**Configuration Phase:**
1. User opens setup wizard in browser
2. Wizard form submits configuration
3. Server validates and writes `.env` file
4. Config generator reads `.env`
5. Generator writes `docker-compose.yml` and OCIS config
6. User runs `docker-compose up -d`

**Runtime Phase:**
1. Docker Compose starts containers in order (depends_on)
2. Traefik proxy starts, registers services
3. OCIS starts, loads WOPI collaboration service
4. Collaboration service connects to Document Server via WOPI discovery
5. Health check API polls services periodically
6. Dashboard displays real-time status

**User Access:**
1. User accesses OCIS via Traefik proxy
2. OCIS authentication handles login
3. User opens document in web UI
4. OCIS WOPI service requests document editing session from Document Server
5. Document Server loads in iframe with JWT token
6. User edits, changes sync via WOPI

### 2.4 Trade-offs

**Pros:**
- Low complexity. Leverages existing OCIS WOPI implementation.
- High value. Provides working deployment immediately.
- No custom protocol code. WOPI is handled by OCIS.
- Single point of configuration. One `.env` file controls everything.
- Easy to maintain. Thin wrapper around Docker Compose.
- Enables other approaches. Full stack running locally for development.

**Cons:**
- Limited to deployment. Doesn't add features beyond what OCIS provides.
- Tied to Docker Compose. Not ideal for Kubernetes deployments.
- No World Office-specific UI in OCIS. Uses standard OCIS interface.

**Dependencies:**
- Docker and Docker Compose installed on target system
- OCIS docker image and configuration
- World Office Document Server image
- Sufficient system resources (4GB+ RAM recommended)

### 2.5 Why Approach 1 First

This approach provides the fastest path to a working product. It gives users a complete, production-ready deployment with minimal development effort. It also establishes the foundation for the other approaches by having a running OCIS instance to extend or manage.

---

## 3. Approach 2: OCIS Extension/App

### 3.1 Architecture

This approach builds a custom OCIS micro-service that provides World Office-specific features beyond generic WOPI collaboration. The extension integrates with OCIS's extension system and provides additional functionality.

```
┌─────────────────────────────────────────────────────────────┐
│                        OCIS Core                              │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Storage    │  │  User Auth   │  │   Collaboration  │   │
│  │   Service    │  │   Service    │  │    (WOPI)        │   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘   │
│         │                 │                   │             │
└─────────┼─────────────────┼───────────────────┼─────────────┘
          │                 │                   │
          └─────────────────┴───────────────────┘
                            │
                    ┌───────┴────────┐
                    │ Extension API │
                    └───────┬────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ World Office  │    │  Template    │    │   Format     │
│  Extension   │    │   Manager    │    │   Policy     │
│              │    │              │    │   Engine     │
└──────┬───────┘    └──────────────┘    └──────────────┘
       │
       ▼
┌──────────────┐
│ Document     │
│ Server       │
└──────────────┘
```

### 3.2 Components

**OCIS Extension Microservice**
- Written in Go (OCIS native language)
- Implements OCIS extension interfaces
- Registers with OCIS at startup
- Provides REST API for World Office features
- Handles authentication via OCIS tokens

**Template Management Service**
- Store and manage document templates (contracts, invoices, reports)
- Template categories and metadata
- User can create documents from templates
- Template preview and search

**Enhanced Conversion Workflow**
- Bulk conversion of documents with progress tracking
- Conversion history and retry logic
- Format-specific conversion options (PDF quality, compression)
- Conversion queue management

**World Office Branding Overrides**
- Custom branding in OCIS interface (logos, colors, fonts)
- White-label deployment option
- Custom splash screen and welcome message
- Admin-configurable branding elements

**Format Policy Engine**
- Define allowed document formats per user group
- Automatic format conversion on upload
- Format compatibility warnings
- Format audit trail

### 3.3 Data Flow

**Template Creation Flow:**
1. Admin uploads template via extension UI
2. Extension stores template in OCIS storage
3. Template metadata indexed in extension database
4. User selects template from dropdown
5. Extension creates new document from template
6. Document opened in Document Server via WOPI

**Conversion Flow:**
1. User initiates bulk conversion via extension UI
2. Extension creates conversion jobs in queue
3. Workers process jobs asynchronously
4. Document Server performs actual conversion
5. Results stored back in OCIS storage
6. User notified when complete

**Format Policy Flow:**
1. User attempts to upload disallowed format
2. Extension intercepts upload request
3. Policy engine checks user group permissions
4. Either blocks upload or queues auto-conversion
5. Result displayed to user

### 3.4 Trade-offs

**Pros:**
- Deep integration. Features feel native to OCIS.
- Scalable. Microservices architecture scales independently.
- Leverage OCIS infrastructure. Authentication, storage, API handling provided.
- Enterprise-ready. Can handle large deployments.

**Cons:**
- High complexity. Requires Go development and OCIS internals knowledge.
- Tightly coupled to OCIS versions. Breaking changes in OCIS require updates.
- Maintenance burden. Must keep extension in sync with OCIS releases.
- Steep learning curve. OCIS extension system not well documented.

**Dependencies:**
- Go 1.21+ development environment
- OCIS source code and extension interfaces
- OCIS development and deployment knowledge
- Persistence layer for extension data (PostgreSQL or Redis)

### 3.5 When to Choose This Approach

Best suited for organizations with in-house Go development capacity and a need for World Office-specific features beyond generic WOPI. Ideal for enterprise deployments with custom workflows.

---

## 4. Approach 3: Management Dashboard

### 4.1 Architecture

This approach builds a standalone web application for administrative tasks. It provides a comprehensive dashboard for managing OCIS deployments with World Office Document Server.

```
┌─────────────────────────────────────────────────────────────┐
│                 World Office-opencloud                          │
│                  (Management Dashboard)                        │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   React/Vue  │  │  REST API    │  │  WebSocket      │   │
│  │   Frontend   │  │  Backend     │  │  (Real-time)    │   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘   │
│         │                 │                   │             │
└─────────┼─────────────────┼───────────────────┼─────────────┘
          │                 │                   │
          ▼                 ▼                   ▼
     Session Store      PostgreSQL        Redis Cache
     (JWT tokens)      (App Data)        (Real-time)
                            │
                    ┌───────┴────────┐
                    │   OCIS Admin   │
                    │      API       │
                    └────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Traefik    │    │     OCIS     │    │ Document     │
│   Stats      │    │   Services   │    │ Server       │
└──────────────┘    └──────────────┘    └──────────────┘
```

### 4.2 Components

**Express.js Backend**
- RESTful API for all dashboard operations
- JWT-based authentication
- Role-based access control (admin, operator, viewer)
- API rate limiting and security headers
- Health monitoring and metrics collection

**Vue.js/React Frontend**
- Modern single-page application
- Responsive design for mobile and desktop
- Real-time updates via WebSocket
- Data visualization (charts, graphs, tables)
- Dark mode with World Office branding

**User Management Module**
- List and search users
- Add, edit, delete users
- User group management
- Bulk user operations
- User activity logs

**Document Analytics Module**
- Document creation and edit statistics
- Storage usage per user and group
- Most used file formats
- Conversion job metrics
- Active session tracking

**Storage Quota Module**
- Per-user storage limits
- Group-level quotas
- Usage alerts and notifications
- Automatic cleanup policies
- Storage trend analysis

**Conversion Job Queue**
- Queue all conversion requests
- Priority-based scheduling
- Job retry and error handling
- Progress tracking and notifications
- Job history and audit log

**WebSocket Server**
- Real-time service status updates
- Live conversion progress
- User activity feed
- Alert notifications
- Multi-client synchronization

### 4.3 Data Flow

**Authentication Flow:**
1. User logs in via dashboard
2. Frontend sends credentials to backend API
3. Backend validates against OCIS Admin API
4. Backend issues JWT token
5. Frontend stores token in localStorage
6. Subsequent API calls include token in Authorization header

**Real-time Status Flow:**
1. WebSocket client connects to backend
2. Backend authenticates client via JWT
3. Backend subscribes client to status updates
4. Health checker polls OCIS and Document Server
5. Status changes pushed to clients via WebSocket
6. Frontend updates UI in real-time

**Document Analytics Flow:**
1. Backend queries OCIS Admin API for document stats
2. Results aggregated and cached in Redis
3. Frontend requests aggregated data via REST API
4. Backend returns cached data (or refetches if stale)
5. Frontend visualizes with charts and tables

### 4.4 Trade-offs

**Pros:**
- Most comprehensive. Provides full management capabilities.
- Platform agnostic. Works with OCIS, Nextcloud, or standalone.
- Professional UI. Modern, responsive, user-friendly.
- Extensible. Can add new modules easily.
- Real-time feedback. WebSocket for live updates.

**Cons:**
- Highest complexity. Full-stack application with database.
- Ongoing maintenance. Requires updates for security, dependencies.
- Authentication complexity. JWT management, role-based access control.
- Resource intensive. PostgreSQL and Redis required.
- Longer development timeline. 6-12 months to reach feature parity.

**Dependencies:**
- Node.js 20+, Express.js
- PostgreSQL 14+ for application data
- Redis 7+ for caching and WebSocket sessions
- OCIS Admin API access
- Build tools (Webpack, Vite, or similar)

### 4.5 When to Choose This Approach

Best suited for organizations with large deployments requiring centralized management, detailed analytics, and granular control. Ideal for managed service providers or enterprises with multiple OCIS instances.

---

## 5. Cross-Cutting Concerns

### 5.1 JWT Configuration

All three approaches require JWT configuration for WOPI authentication. The pattern from World Office-nextcloud applies:

**JWT Secret**
- Shared secret between OCIS and Document Server
- Minimum 32 characters, preferably generated securely
- Stored in environment variables (OCIS_JWT_SECRET, DOCUMENT_SERVER_JWT_SECRET)
- Rotate periodically for security

**Token Structure**
- HS256 algorithm for signing
- Claims: `iat` (issued at), `exp` (expiration)
- Dual-token pattern: header token for authentication, body token for document access
- Typical expiration: 30 minutes to 1 hour

**Configuration Mapping**
```
OCIS_JWT_SECRET → Document Server JWT secret
OCIS_DOMAIN → WOPI host URL
DOCUMENT_SERVER_DOMAIN → Document Server public URL
```

### 5.2 Branding

World Office visual identity must be consistent across all approaches:

**Color Palette**
- Background: deep void #0b0b1e
- Primary: electric cyan #00d4ff
- Accent: warm gold #e8b931
- Text: white with high opacity (#ffffff 0.9)
- Secondary text: #ffffff 0.7
- Borders: #ffffff 0.1

**Typography**
- Font: sans-serif (system fonts)
- Weight: light (300) for body, normal (400) for headings
- Letter-spacing: generous (0.02em for body, 0.05em for headings)
- Line-height: 1.6 for readability

**Logo Usage**
- Place logo consistently in top-left
- Ensure contrast with dark background
- Scale appropriately (never stretch)

### 5.3 Security

**TLS Everywhere**
- All services behind Traefik with automatic HTTPS
- Valid certificates required (Let's Encrypt or custom)
- Redirect HTTP to HTTPS
- HSTS headers enabled

**Secrets Management**
- Never commit secrets to git
- Use environment variables or secret stores
- Provide sensible defaults for development
- Require secrets for production
- Document required secrets clearly

**Rate Limiting**
- API endpoints rate-limited to prevent abuse
- WOPI endpoints limited per user
- Brute-force protection on authentication

**Access Control**
- Admin functions require elevated permissions
- Audit logs for all admin actions
- Principle of least privilege

### 5.4 Multi-Platform Support

The design should support both OCIS and Nextcloud integration:

**Shared Configuration**
- Same WOPI configuration pattern
- JWT token structure compatible
- Document Server settings identical

**Modular Architecture**
- WOPI protocol handling abstracted
- Platform-specific code isolated
- Easy to add new platforms (Nextcloud, Seafile)

**Unified Experience**
- Consistent UI/UX across platforms
- Same branding and terminology
- Compatible feature sets where possible

---

## 6. Decision Matrix

| Criterion | Approach 1: Deployment Companion | Approach 2: OCIS Extension | Approach 3: Management Dashboard |
|-----------|----------------------------------|-----------------------------|----------------------------------|
| **Complexity** | Low | High | Very High |
| **Development Time** | 4-6 weeks | 12-16 weeks | 24-32 weeks |
| **Value Delivered** | High (working deployment) | Medium (additional features) | High (comprehensive management) |
| **Dependencies** | Docker, OCIS, Document Server | Go, OCIS source, Database | Node.js, PostgreSQL, Redis |
| **Maintenance Burden** | Low (thin wrapper) | High (tightly coupled to OCIS) | Medium (full-stack app) |
| **User Impact** | Easy setup, standard OCIS UI | Enhanced features in OCIS UI | New dashboard UI |
| **Scalability** | Limited to Docker Compose | Highly scalable (microservices) | Highly scalable (modular backend) |
| **Learning Curve** | Low (mostly configuration) | High (Go, OCIS internals) | Medium (standard full-stack) |
| **Risk** | Low (leverages existing code) | High (breaking changes in OCIS) | Medium (complex app) |
| **Best For** | Quick deployments, MVP | Custom OCIS features | Large enterprise deployments |
| **Recommended Order** | **First** | Third | Second |

---

## 7. References

### OCIS Documentation
- WOPI Integration: https://doc.owncloud.com/ocis/next/deployment/wopi/wopi.html
- Office Integration Example: https://doc.owncloud.com/ocis/next/conf-examples/office/office-integration.html
- Docker Compose Example: https://doc.owncloud.com/ocis/next/depl-examples/ubuntu-compose/ubuntu-compose-prod.html
- OCIS GitHub: https://github.com/owncloud/ocis

### WOPI Protocol
- WOPI Protocol Specification: https://learn.microsoft.com/en-us/microsoft-365/cloud-storage-partner-program/rest/wopi-protocol
- Collabora WOPI Implementation: https://github.com/CollaboraOnline/online/blob/main/wsd/wopi/WopiStorage.cpp

### worldoffice-nextcloud
- Repository: C:\Users\Tobias\git\World-Office\integrations\nextcloud\
- JWT patterns in controllers/auth.js
- Config patterns in config/config.js
- Converter patterns in controllers/converter.js

### World-Office Document Server
- Documentation: https://codeberg.org/World-Office/DocumentServer
- Docker Image: worldoffice/documentserver

### Technology References
- Express.js: https://expressjs.com/
- Docker Compose: https://docs.docker.com/compose/
- Vue.js: https://vuejs.org/
- React: https://react.dev/
- PostgreSQL: https://www.postgresql.org/
- Redis: https://redis.io/

---

## 8. Next Steps

1. Implement Approach 1 (Deployment Companion) as MVP
2. Deploy and test with real OCIS instance
3. Gather user feedback on setup experience
4. Evaluate need for additional features
5. Consider Approach 3 (Management Dashboard) for enterprise deployments
6. Approach 2 (OCIS Extension) reserved for specific World Office feature requests

---

**Document End**
