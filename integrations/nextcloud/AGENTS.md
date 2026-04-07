# WORLD-OFFICE-NEXTCLOUD

**Generated:** 2026-03-31
**Source:** codeberg.org/World-Office/server (independent rewrite)
**Files:** ~153 | **License:** Apache-2.0 | **Version:** 11.0.0

## OVERVIEW

Nextcloud app that integrates World Office Document Server — enables editing DOCX/XLSX/PPTX/PDF from within Nextcloud with co-editing, track changes, watermarks, and 50+ format support.

## STRUCTURE

```
worldoffice-nextcloud/
├── appinfo/info.xml          # App metadata (NC 33-34, namespace: Worldoffice)
├── lib/                      # PHP backend
│   ├── Controller/EditorController.php  # Main editor endpoint
│   ├── AdminSettings.php     # Admin panel settings
│   ├── AppConfig.php         # App configuration
│   ├── DocumentService.php   # DocServer communication
│   ├── Crypt.php             # JWT token handling
│   ├── Hooks.php              # Nextcloud file hooks
│   ├── Preview.php            # Document preview generation
│   ├── FileCreator.php        # New file creation (doc/xls/ppt)
│   └── Cron/EditorsCheck.php # Background health check
├── src/                      # JS frontend (Vue 3 + Vite)
├── templates/                # PHP templates (editor.php)
├── l10n/                     # Translations
├── test-env/                 # Docker Compose test environment
├── .eslintrc.js              # ESLint config
├── .stylelintrc.json         # Stylelint config
├── composer.json             # PHP deps (firebase/php-jwt ^6.0, PHP 8.1-8.4)
└── package.json              # JS deps (@nextcloud/*, Vue 3.5, Vite 7)
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Editor controller | `lib/Controller/EditorController.php` | `create` + `index` methods |
| Admin settings | `lib/AdminSettings.php` | DocumentServerUrl, JWT, etc. |
| DocServer comms | `lib/DocumentService.php` | Builds config JSON for editor |
| JWT handling | `lib/Crypt.php` | Token generation/validation |
| JS frontend | `src/` | Vue 3 components |
| Editor template | `templates/editor.php` | Renders DocEditor JS config |
| File creation | `lib/FileCreator.php` | New doc/xls/ppt from templates |
| Health check | `lib/Cron/EditorsCheck.php` | Background connection checker |
| Test environment | `test-env/` | docker-compose.yml |

## REQUIREMENTS

- **Nextcloud:** 33-34
- **PHP:** 8.1 - 8.4
- **Node.js:** 20+ (for building)
- **Document Server:** World Office Docs (must be reachable from both Nextcloud server AND client browsers)
- **PHP deps:** `firebase/php-jwt ^6.0`

## KEY CONFIGURATION SETTINGS

| Setting | Description | Default |
|---------|-------------|---------|
| `DocumentServerUrl` | Public URL of DocServer | (required) |
| `DocumentServerInternalUrl` | Internal URL (server-to-server) | same as above |
| `StorageUrl` | Nextcloud URL visible to DocServer | (required) |
| `jwt_secret` | JWT shared secret | (auto-generated) |
| `VerifyPeerOff` | Disable SSL cert verification | false |

## BUILD

```bash
npm install
npm run build        # production build (vite)
npm run dev          # development build
composer install      # PHP dependencies
```

## ANTI-PATTERNS

- NEVER mismatch `jwt_secret` between Nextcloud and DocServer — causes 403 errors
- NEVER use `world-office` as app ID — this project uses `worldoffice`
- NEVER skip `composer install` — JWT handling depends on firebase/php-jwt
- NEVER forget `chown -R www-data:www-data` after copying app files

## TEST ENVIRONMENT

```bash
cd test-env
docker compose up -d
# Open http://localhost:8081 (admin/admin)
```

See `test-env/README.md` for full instructions.
