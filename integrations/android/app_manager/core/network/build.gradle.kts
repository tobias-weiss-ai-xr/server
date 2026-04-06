plugins {
    id("com.android.library")
    id("kotlinx-serialization")
    kotlin("android")
    alias(libs.plugins.kotlin.ksp)
}

android {
    namespace = "app.documents.core.network"
    compileSdk = libs.versions.compileSdk.get().toInt()

    defaultConfig {
        minSdk = libs.versions.minSdk.get().toInt()

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        consumerProguardFiles("consumer-rules.pro")

        // Proprietary API keys removed for FOSS build
        buildConfigField("String", "GOOGLE_INFO_CLIENT_ID", "\"\"")
        buildConfigField("String", "GOOGLE_INFO_REDIRECT_URL", "\"\"")
        buildConfigField("String", "GOOGLE_COM_CLIENT_ID", "\"\"")
        buildConfigField("String", "GOOGLE_COM_CLIENT_SECRET", "\"\"")
        buildConfigField("String", "GOOGLE_COM_REDIRECT_URL", "\"\"")
        buildConfigField("String", "GOOGLE_AUTH_URL", "\"\"")
        buildConfigField("String", "GOOGLE_VALUE_RESPONSE_TYPE", "\"\"")
        buildConfigField("String", "GOOGLE_VALUE_ACCESS_TYPE", "\"\"")
        buildConfigField("String", "GOOGLE_VALUE_APPROVAL_PROMPT", "\"\"")
        buildConfigField("String", "GOOGLE_VALUE_SCOPE", "\"\"")
        buildConfigField("String", "GOOGLE_WEB_ID", "\"\"")

        buildConfigField("String", "DROP_BOX_COM_CLIENT_ID", "\"\"")
        buildConfigField("String", "DROP_BOX_INFO_CLIENT_ID", "\"\"")
        buildConfigField("String", "DROP_BOX_INFO_REDIRECT_URL", "\"\"")
        buildConfigField("String", "DROP_BOX_COM_CLIENT_SECRET", "\"\"")
        buildConfigField("String", "DROP_BOX_COM_REDIRECT_URL", "\"\"")
        buildConfigField("String", "DROP_BOX_AUTH_URL", "\"\"")
        buildConfigField("String", "DROP_BOX_VALUE_RESPONSE_TYPE", "\"\"")

        buildConfigField("String", "ONE_DRIVE_INFO_CLIENT_ID", "\"\"")
        buildConfigField("String", "ONE_DRIVE_INFO_REDIRECT_URL", "\"\"")
        buildConfigField("String", "ONE_DRIVE_COM_CLIENT_ID", "\"\"")
        buildConfigField("String", "ONE_DRIVE_COM_CLIENT_SECRET", "\"\"")
        buildConfigField("String", "ONE_DRIVE_COM_REDIRECT_URL", "\"\"")
        buildConfigField("String", "ONE_DRIVE_AUTH_URL", "\"\"")
        buildConfigField("String", "ONE_DRIVE_VALUE_RESPONSE_TYPE", "\"\"")
        buildConfigField("String", "ONE_DRIVE_VALUE_SCOPE", "\"\"")

        buildConfigField("String", "SOCIALS_REDIRECT_URL", "\"\"")
        buildConfigField("String", "SOCIALS_STATE", "\"\"")
        buildConfigField("String", "TWITTER_CLIENT_ID", "\"\"")
        buildConfigField("String", "TWITTER_SECRET_KEY", "\"\"")
        buildConfigField("String", "TWITTER_OAUTH1_STATE", "\"\"")
        buildConfigField("String", "ZOOM_CLIENT_ID", "\"\"")
        buildConfigField("String", "LINKEDIN_CLIENT_ID", "\"\"")
        buildConfigField("String", "APPLE_CLIENT_ID", "\"\"")

    }
    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        buildConfig = true
    }
}

dependencies {
    implementation(project(":core:model"))

    implementation(libs.kotlin.coroutines)
    implementation(libs.kotlin.serialization.json)

    implementation(libs.dagger)
    ksp(libs.dagger.compiler)

    // Retrofit
    implementation(libs.retrofit)
    implementation(libs.retrofit.kotlin.serialization)
}