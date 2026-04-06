# documents-app-android FOSS Compliance Audit Findings

## 1. REPOSITORY STRUCTURE

```
documents-app-android/
├── .github/
│   ├── workflows/upload-app.yml          # CI: AWS S3 upload, Google Play publish
│   └── secrets/
│       ├── encrypt_secret.sh             # Encrypts proprietary secrets
│       └── decrypt_secret.sh             # Decrypts proprietary secrets
├── app_manager/                          # MAIN BUILD (Gradle Kotlin DSL)
│   ├── appmanager/                       # Main Android app module
│   │   └── src/main/java/app/editors/manager/
│   ├── core/                            # Core business logic modules
│   │   ├── model/                        # Data models (Java library)
│   │   ├── network/                      # Network layer (cloud APIs)
│   │   └── database/                     # Room database layer
│   ├── libcompose/                       # Jetpack Compose UI library
│   ├── libshared/                        # Shared utilities
│   ├── buildSrc/translations.gradle.kts  # Translation management tasks
│   ├── gradle/libs.versions.toml         # Version catalog (ALL deps)
│   ├── gradlew, gradlew.bat
│   ├── build.gradle.kts                  # Root build script
│   └── settings.gradle.kts               # Module includes + external editor refs
├── app_manager_from_libs/                # ALTERNATE BUILD (from pre-built AARs)
│   ├── libx2t/                          # Format converter (AAR wrapper)
│   ├── libeditors/                      # Native editor base (AAR wrapper)
│   ├── libcells/                        # Spreadsheet native (AAR wrapper)
│   ├── libdocs/                         # Document native (AAR wrapper)
│   ├── libslides/                       # Presentation native (AAR wrapper)
│   ├── libgeditors/                     # JS editor base (AAR wrapper)
│   ├── libgdocs/                        # JS document editor (AAR wrapper)
│   ├── libgcells/                       # JS spreadsheet editor (AAR wrapper)
│   └── libgslides/                      # JS presentation editor (AAR wrapper)
├── toolkit/libtoolkit/                   # Shared toolkit library
├── libsnapshot/                          # Bootstrap native lib loader
├── fastlane/                            # Google Play deployment automation
├── translations/                        # Translation XML files (17 locales)
├── buildAar.sh                          # Build AAR artifacts script
├── buildAndInstall.sh
├── buildAndPublishEditors.sh
├── LICENSE.txt                          # AGPLv3
├── README.md
└── thirdparty.md                        # Third-party dependency list
```

### Build Systems
- **app_manager/**: Gradle 8.13.1, Kotlin 2.0.0, AGP, KSP, Compose
- **app_manager_from_libs/**: Same Gradle setup, references pre-built AARs
- **toolkit/**: Older Gradle (3.5.1), Kotlin 1.3.50 — legacy/standalone

### Module Count
- 21 build.gradle.kts files total
- 8 native/JS editor wrapper modules in app_manager_from_libs/
- 8 core/library modules in app_manager/

---

## 2. ENCRYPTED FILES (.gpg) — 7 FILES FOUND

| File | Purpose | FOSS Impact |
|------|---------|-------------|
| `app_manager/Word Office.jks.gpg` | **Signing keystore** (release APK signing) | CRITICAL: Cannot build release APK without. Must provide FOSS replacement keystore. |
| `app_manager/Word Office-keystore.properties.gpg` | **Signing credentials** (keyAlias, keyPassword, storeFile, storePassword) + API keys | CRITICAL: Contains all proprietary API keys/credentials |
| `app_manager/google_api.json.gpg` | **Google Play Console API key** (for fastlane upload) | HIGH: Only needed for Play Store publishing |
| `app_manager/appmanager/google-services.json.gpg` | **Firebase configuration** (project settings, API keys) | CRITICAL: Required by Firebase SDK initialization |
| `app_manager/auth_strings.xml.gpg` | **Authentication API keys** (Facebook, Dropbox, etc.) | CRITICAL: Decrypted to `toolkit/libtoolkit/src/main/res/values/auth_strings.xml` |
| `app_manager/Word Office-182ba7a9-5335-449e-9c63-2585101e45bc.lic.gpg` | **Word Office license file** | CRITICAL: Decrypted to app assets — proprietary license |
| `fastlane/.env.secret.gpg` | **Fastlane secrets** (Telegram bot token, etc.) | LOW: Deployment-only |

### Decryption Flow (from decrypt_secret.sh):
1. Decrypts all 7 .gpg files using `GIT_ANDROID_DOCUMENTS_PASSPHRASE` env var
2. Moves `auth_strings.xml` → `toolkit/libtoolkit/src/main/res/values/auth_strings.xml`
3. Moves `.lic` file → `app_manager/appmanager/src/main/assets/Word Office-...lic`

---

## 3. PROPRIETARY SDK DEPENDENCIES (from libs.versions.toml)

### CRITICAL — Must Remove/Replace

| SDK | Version | Library | Files Using It | FOSS Concern |
|-----|---------|---------|----------------|--------------|
| **Firebase Core** | 21.1.1 | `com.google.firebase:firebase-core` | App.kt, FirebaseUtils.kt, AppModule.kt, CloudLoginRepositoryImpl.kt | Google proprietary, requires google-services.json |
| **Firebase Crashlytics** | 20.0.3 | `com.google.firebase:firebase-crashlytics` | App.kt, FirebaseUtils.kt, build.gradle.kts (plugin) | Google proprietary crash reporting |
| **Firebase Messaging** | 25.0.1 | `com.google.firebase:firebase-messaging` | MessageService.kt, GoogleUtils.kt, core/build.gradle.kts | Google proprietary push notifications |
| **Firebase Config** | 23.0.1 | `com.google.firebase:firebase-config` | FirebaseUtils.kt (remote config for rating, captcha, coauthoring, ToS) | Google proprietary feature flags |
| **Google Play Services Auth** | 21.4.0 | `com.google.android.gms:play-services-auth` | SocialViews.kt (Google Sign-In), GoogleUtils.kt | Google proprietary authentication |
| **Google Play Review** | 2.0.2 | `com.google.android.play:review` | build.gradle.kts declared | Google proprietary in-app review |
| **Google App Update** | 2.1.0 | `com.google.android.play:app-update-ktx` | InAppUpdateUtils.kt | Google Play Store only |
| **Facebook Login** | 18.0.2 | `com.facebook.android:facebook-login` | SocialViews.kt, SignInActivity.kt, AndroidManifest.xml | Meta proprietary, requires app_id/secret |
| **hCaptcha** | 4.4.0 | `com.github.hCaptcha.hcaptcha-android-sdk:sdk` | EnterpriseCreateSignInFragment.kt, PasswordRecoveryFragment.kt | Proprietary captcha service |

### Buildscript Plugins — Must Remove

| Plugin | Library | Purpose |
|--------|---------|---------|
| `com.google.gms:google-services` | 4.4.4 | Processes google-services.json |
| `com.google.firebase:firebase-crashlytics-gradle` | 3.0.6 | Crashlytics build integration |

### Declared but NOT actively used in source (only in libs.versions.toml)

| SDK | Library | Notes |
|-----|---------|-------|
| Google ML Kit Text Recognition | `com.google.mlkit:text-recognition` | Declared in catalog but no source imports found |
| Google ML Kit Text Chinese | `com.google.mlkit:text-recognition-chinese` | Declared in catalog but no source imports found |
| Google ML Kit Object Detection | `com.google.mlkit:object-detection` | Declared in catalog but no source imports found |

### FOSS-Compatible Dependencies (no action needed)

All other deps are FOSS: AndroidX, Kotlin, Dagger, Room, Retrofit, Moxy, Koin, Glide, Jackson, RxJava, PageIndicator, PhotoView, libphonenumber.

---

## 4. SOURCE FILES WITH PROPRIETARY SDK REFERENCES

### Firebase (21 files across app)
- `app_manager/appmanager/src/.../app/App.kt` — FirebaseApp.initializeApp, FirebaseCrashlytics
- `app_manager/appmanager/src/.../managers/utils/FirebaseUtils.kt` — FirebaseAnalytics, Crashlytics, RemoteConfig
- `app_manager/appmanager/src/.../managers/utils/GoogleUtils.kt` — FirebaseMessaging token
- `app_manager/appmanager/src/.../managers/services/MessageService.kt` — FirebaseMessagingService
- `app_manager/appmanager/src/.../di/module/AppModule.kt` — FirebaseTool DI provider
- `app_manager/appmanager/src/.../managers/tools/ErrorHandler.kt` — FirebaseUtils crash logging
- `app_manager/core/src/.../utils/FirebaseTool.kt` — Interface for coauthoring check
- `app_manager/core/src/.../login/CloudLoginRepositoryImpl.kt` — FirebaseTool usage
- `app_manager/core/src/.../providers/CloudFileProvider.kt` — FirebaseTool reference
- + ~12 presenter/view files that call FirebaseUtils indirectly

### Facebook (4 files)
- `app_manager/appmanager/src/.../ui/views/custom/SocialViews.kt` — Facebook Login SDK
- `app_manager/appmanager/src/.../ui/fragments/login/PersonalPortalFragment.kt`
- `app_manager/appmanager/src/.../ui/fragments/login/EnterpriseSignInFragment.kt`
- `app_manager/appmanager/src/.../ui/activities/login/SignInActivity.kt`

### Google Play Services (9 files)
- `app_manager/appmanager/src/.../ui/views/custom/SocialViews.kt` — Google Sign-In
- `app_manager/appmanager/src/.../managers/utils/InAppUpdateUtils.kt` — Play Core updates
- `app_manager/appmanager/src/.../managers/utils/GoogleUtils.kt` — Play Services availability check
- + 6 login/fragment files with Google Sign-In

### hCaptcha (2 files)
- `app_manager/appmanager/src/.../ui/fragments/login/EnterpriseCreateSignInFragment.kt`
- `app_manager/appmanager/src/.../ui/fragments/login/PasswordRecoveryFragment.kt`

---

## 5. BUILD CONFIGURATION — PROPRIETARY ENTRIES

### Signing Config (appmanager/build.gradle.kts)
- `signingConfigs.Word Office` reads from `Word Office-keystore.properties`
- Release builds REQUIRE the keystore

### BuildConfig Fields from keystore.properties:
**appmanager module:**
- `FACEBOOK_APP_ID`, `FACEBOOK_APP_ID_INFO`
- `TWITTER_CONSUMER_SECRET`, `TWITTER_CONSUMER_KEY`
- `CAPTCHA_PUBLIC_KEY_INFO`, `CAPTCHA_PUBLIC_KEY_COM`
- `COMMUNITY_ID`
- `DROP_BOX_COM_CLIENT_ID` (manifestPlaceholder)
- `CUSTOM_TASKS` (manifestPlaceholder)

**core module:**
- `BOX_INFO_CLIENT_ID`, `BOX_INFO_REDIRECT_URL`
- `BOX_COM_CLIENT_ID`, `BOX_COM_REDIRECT_URL`
- `BOX_AUTH_URL`, `BOX_VALUE_RESPONSE_TYPE`

**core:network module:**
- `GOOGLE_INFO_CLIENT_ID`, `GOOGLE_INFO_REDIRECT_URL`
- `GOOGLE_COM_CLIENT_ID`, `GOOGLE_COM_CLIENT_SECRET`
- `GOOGLE_COM_REDIRECT_URL`, `GOOGLE_AUTH_URL`
- `DROP_BOX_COM_CLIENT_ID`, `DROP_BOX_INFO_CLIENT_ID`
- `ONE_DRIVE_INFO_CLIENT_ID`, `ONE_DRIVE_COM_CLIENT_ID`
- `SOCIALS_REDIRECT_URL`, `SOCIALS_STATE`
- `TWITTER_CLIENT_ID`, `TWITTER_SECRET_KEY`
- `ZOOM_CLIENT_ID`, `LINKEDIN_CLIENT_ID`, `APPLE_CLIENT_ID`

---

## 6. ANDROID MANIFEST — PROPRIETARY ENTRIES

In `app_manager/appmanager/src/main/AndroidManifest.xml`:
- `com.facebook.sdk.ApplicationId` meta-data (requires auth_strings.xml)
- `com.facebook.sdk.ClientToken` meta-data
- `com.facebook.FacebookActivity` activity declaration
- `com.facebook.CustomTabActivity` activity declaration (with fb:// scheme)
- `com.google.firebase.MESSAGING_EVENT` intent-filter (MessageService)
- `com.google.firebase.messaging.default_notification_icon` meta-data
- `com.google.firebase.messaging.default_notification_channel` meta-data
- `firebase_crashlytics_collection_enabled` meta-data
- `com.google.android.gms.permission.AD_ID` permission (removed)

---

## 7. PRE-BUILT AAR DEPENDENCIES (app_manager_from_libs/)

All 8 editor modules are thin wrappers around pre-built AAR files:
| Module | AAR File | Source |
|--------|----------|--------|
| libx2t | `libs/libx2t-release.aar` | core/X2tConverter (C++ native) |
| libeditors | `libs/libeditors-release.aar` | core-ext/native_base |
| libcells | `libs/libcells-release.aar` | core-ext/cell_android |
| libdocs | `libs/libdocs-release.aar` | core-ext/word_android |
| libslides | `libs/libslides-release.aar` | core-ext/slide_android |
| libgeditors | `libs/libgeditors-release.aar` | document-android-editors |
| libgdocs | `libs/libgdocs-release.aar` | document-android-editors |
| libgcells | `libs/libgcells-release.aar` | document-android-editors |
| libgslides | `libs/libgslides-release.aar` | document-android-editors |

**NOTE**: The `libs/` directory is EMPTY (no AARs present in repo). The AARs must be built from source via the `buildAar.sh` script which runs `./gradlew buildAar` from app_manager/. The settings.gradle.kts also supports building editors from source directly via `-PincludeEditors=true` and external repo references.

---

## 8. EXTERNAL REPOSITORY DEPENDENCIES (settings.gradle.kts)

The app_manager settings.gradle.kts references these external repos (not in this repo):
- `../../core/X2tConverter/build/Android/libx2t`
- `../../core-ext/native_base/android_base/libeditors`
- `../../core-ext/cell_android/libcells`
- `../../core-ext/word_android/libdocs`
- `../../core-ext/slide_android/libslides`
- `../../document-android-editors/editors_base/libgeditors`
- `../../document-android-editors/editors_base/libresources`
- `../../document-android-editors/editors_cells/libgcells`
- `../../document-android-editors/editors_docs/libgdocs`
- `../../document-android-editors/editors_slides/libgslides`
- `../libsnapshot`

These are other repos in the Word Office workspace (core, core-ext, document-android-editors).

---

## 9. CI/CD — PROPRIETARY

### .github/workflows/upload-app.yml
- Downloads APK from GitHub releases
- Uploads to **AWS S3** (proprietary cloud service)
- Uses **AWS CloudFront** cache invalidation
- References Word Office GitHub API

### fastlane/Fastfile
- `upload_to_play_store` — Google Play Store publishing
- `google_play_track_version_codes` — Play Store API
- Telegram notifications (bot token from .env.secret)
- Requires `GIT_ANDROID_DOCUMENTS_PASSPHRASE` for secret decryption

### fastlane/Appfile
- References `app_manager/google_api.json` (Play Console API key)

---

## 10. Word Office LICENSE FILE

`app_manager/Word Office-182ba7a9-5335-449e-9c63-2585101e45bc.lic.gpg`
- This is a proprietary Word Office license file
- Gets decrypted and placed into app assets
- Used for product licensing/validation
- **Must be removed for FOSS build**

---

## 11. SUMMARY: COMPLETE LIST OF FOSS COMPLIANCE ISSUES

### Must Remove/Replace (Build Blockers):
1. **Firebase SDK** (core, crashlytics, messaging, config) — Replace with FOSS alternatives
2. **Google Play Services Auth** — Remove Google Sign-In or replace
3. **Google Play In-App Review** — Remove (Play Store specific)
4. **Google Play App Update** — Remove (Play Store specific)
5. **Facebook Login SDK** — Remove Facebook login
6. **hCaptcha SDK** — Remove or replace with FOSS captcha
7. **google-services plugin** — Remove from buildscript
8. **firebase-crashlytics plugin** — Remove from buildscript
9. **google-services.json** — Remove (encrypted)
10. **Word Office.jks** — Replace with FOSS signing keystore
11. **Word Office-keystore.properties** — Replace with FOSS credentials
12. **auth_strings.xml** — Remove all proprietary API keys
13. **Word Office license file (.lic)** — Remove
14. **google_api.json** — Remove (Play Console API)

### Code Changes Required:
- Refactor/remove `FirebaseUtils.kt` (analytics, crash reporting, remote config)
- Refactor/remove `GoogleUtils.kt` (Play Services check, FCM token)
- Refactor/remove `MessageService.kt` (FirebaseMessagingService)
- Refactor/remove `InAppUpdateUtils.kt` (Play Core updates)
- Refactor/remove `SocialViews.kt` (Facebook + Google Sign-In)
- Remove Facebook activities from AndroidManifest.xml
- Remove Firebase meta-data from AndroidManifest.xml
- Refactor `App.kt` (FirebaseApp init, Crashlytics init)
- Refactor `AppModule.kt` (FirebaseTool DI)
- Refactor `ErrorHandler.kt` (Firebase crash logging)
- Refactor `FirebaseTool.kt` interface (coauthoring check via Firebase)
- Refactor `CloudLoginRepositoryImpl.kt` (Firebase messaging token)
- Remove hCaptcha from login fragments
- Strip all keystore.properties API key BuildConfig fields

### Conditional/Low Priority:
- `fastlane/` — Can be kept but won't work without Play Console access
- `.github/workflows/upload-app.yml` — AWS-specific, replace or remove
- ML Kit entries in version catalog — Declared but unused, clean up
- `buildAar.sh` — Utility script, harmless
