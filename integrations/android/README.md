# World-Office Documents for Android — FOSS-Compliant Fork

![World-Office](https://codeberg.org/World-Office/artwork/raw/branch/main/assets/banner.png)
[![License](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![FOSS Compliant](https://img.shields.io/badge/FOSS-Compliant-success.svg)](https://codeberg.org/World-Office/documents-app-android)

> **Disclaimer:** World-Office is an independent open-source fork hosted on Codeberg and is not affiliated with, endorsed by, or controlled by any of the upstream projects or integration providers referenced in this repository (including WORLDOFFICE, Ascensio System SIA, and others). World-Office is entirely separate from "Euro-Office" (a GitHub organization associated with Nextcloud and IONOS). World-Office maintains its own development roadmap, release cycle, and support channels.

## About

This is a FOSS-compliant fork of the WORLDOFFICE Documents Android app. All proprietary SDKs and dependencies have been removed to enable a fully buildable-from-source application.

### What changed from upstream

The following proprietary components have been removed:
- **Firebase** (Core, Crashlytics, Messaging, Config) — replaced with no-op stubs
- **Google Play Services Auth** — removed Google Sign-In
- **Google Play In-App Review / App Update** — removed Play Store-specific features
- **Facebook Login SDK** — removed Facebook authentication
- **hCaptcha SDK** — removed captcha verification
- **Encrypted secrets** (`.gpg` files) — signing keys, API keys, Firebase config, license file
- **WORLDOFFICE license file** — proprietary license validation removed

### What remains

All FOSS dependencies are intact: AndroidX, Kotlin, Dagger, Room, Retrofit, Moxy, Koin, Glide, Jackson, RxJava, and more. The app retains its core document editing, spreadsheet, and presentation capabilities.

## Features

- **Document editor:** Full-featured text editing with formatting
- **Spreadsheet editor:** Advanced calculations with formula support
- **Presentation editor:** Create slideshows with rich media
- **PDF viewer:** View and annotate PDFs
- **Form filler:** Complete online forms
- **Media player:** Handle photos and videos alongside documents

## Building from Source

### Prerequisites

- Android Studio (latest stable recommended)
- Android SDK (API level 34+)
- Kotlin 2.0.0+
- Gradle 8.13+

### Steps

1. Clone the repository:
   ```bash
   git clone https://codeberg.org/World-Office/documents-app-android.git
   cd documents-app-android
   ```

2. Open `app_manager/` in Android Studio.

3. Sync Gradle and build:
   ```bash
   ./gradlew assembleDebug
   ```

### Notes

- The `app_manager_from_libs/` directory requires pre-built AAR files that are **not** included in this repository. Use the `app_manager/` build path instead.
- External editor modules (core, core-ext, document-android-editors) must be available alongside this repo or built separately. See `app_manager/settings.gradle.kts` for the expected paths.
- Cloud storage authentication (Dropbox, Google Drive, etc.) requires self-provided API keys configured as environment variables or BuildConfig fields.

## Cloud Integration

The app supports connecting to cloud storage services. For proprietary services (Dropbox, Google Drive, Box, OneDrive), you will need to provide your own API credentials.

For self-hosted solutions, the app supports:
- Nextcloud / ownCloud (via WebDAV)
- Any WebDAV-compatible cloud service

## License

World-Office Documents for Android is released under the [GNU AGPLv3 license](https://www.gnu.org/licenses/agpl-3.0.en.html). See the [LICENSE.txt](LICENSE.txt) file for complete licensing information.

## Related Projects

- [World-Office/core](https://codeberg.org/World-Office/core) — C++ rendering and conversion engine
- [World-Office/web-apps](https://codeberg.org/World-Office/web-apps) — Web editor interface
- [World-Office/DocumentServer](https://codeberg.org/World-Office/DocumentServer) — Document server deployment
- [World-Office/world-office-opencloud](https://codeberg.org/World-Office/world-office-opencloud) — OCIS deployment companion
- [World-Office/world-office-nextcloud](https://codeberg.org/World-Office/world-office-nextcloud) — Nextcloud integration

© 2024 World-Office. Released under AGPL-3.0.
