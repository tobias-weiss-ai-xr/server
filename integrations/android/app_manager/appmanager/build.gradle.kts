@file:Suppress("UnstableApiUsage")

import com.android.build.gradle.internal.api.BaseVariantOutputImpl
import java.io.FileWriter
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

plugins {
    id("com.android.application")
    id("kotlinx-serialization")
    kotlin("android")
    kotlin("kapt")
    alias(libs.plugins.kotlin.ksp)
    alias(libs.plugins.kotlin.compose)
//    id("org.owasp.dependencycheck")
}

val withEditors: Boolean = project.findProperty("withEditors")?.toString()?.toBoolean() ?: true
val isBuildingBundle = gradle.startParameter.taskNames.any { it.lowercase().contains("bundle") }

// WorldOffice
val appId = "com.world-office.documents"
val appName = "world-office-manager"

android {

    namespace = "app.editors.manager"
    compileSdk = libs.versions.compileSdk.get().toInt()

    defaultConfig {
        minSdk = libs.versions.minSdk.get().toInt()
        targetSdk = libs.versions.targetSdk.get().toInt()
        versionCode = 707
        versionName = "9.3.1"
        multiDexEnabled = true
        applicationId = "com.world-office.documents"

        vectorDrawables {
            useSupportLibrary = true
        }

        buildConfigField("boolean", "IS_BETA", "false")
        buildConfigField("String", "RELEASE_ID", "\"" + appId + "\"")
        buildConfigField("String", "APP_NAME", "\"" + appName + "\"")

        // Proprietary API keys removed for FOSS build
        buildConfigField("String", "COMMUNITY_ID", "\"\"")
        buildConfigField("String", "TWITTER_CONSUMER_SECRET", "\"\"")
        buildConfigField("String", "TWITTER_CONSUMER_KEY", "\"\"")
        buildConfigField("String", "CAPTCHA_PUBLIC_KEY_INFO", "\"\"")
        buildConfigField("String", "CAPTCHA_PUBLIC_KEY_COM", "\"\"")
        buildConfigField("String", "FACEBOOK_APP_ID_INFO", "\"\"")
        buildConfigField("String", "FACEBOOK_APP_ID", "\"\"")

        buildConfigField("String", "PUSH_SCHEME", "\"" + "oodocuments" + "\"")
    }

    splits {
        abi {
            isEnable = !isBuildingBundle
            reset()
            include("armeabi-v7a", "arm64-v8a", "x86", "x86_64") //comment to armv7
            isUniversalApk = true
        }
    }

    buildTypes {

        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro")
            // FOSS build: use debug signing config (provide your own keystore for release)
            signingConfig = signingConfigs.getByName("debug")
            ndk {
                abiFilters.addAll(arrayOf("armeabi-v7a", "arm64-v8a", "x86", "x86_64"))
            }
        }

        debug {
            isMinifyEnabled = false
            ndk {
                if (System.getProperty("os.arch") == "aarch64") {
                    abiFilters.add("arm64-v8a")
                } else {
                    abiFilters.addAll(arrayOf("armeabi-v7a", "arm64-v8a", "x86", "x86_64"))
                }
            }
        }

        applicationVariants.all {
            val variant = this
            variant.outputs
                .map { it as BaseVariantOutputImpl }
                .forEach { output ->
                    val timeMark = SimpleDateFormat("MMMMM.dd_HH-mm", Locale.ENGLISH).format(Date())
                    val buildAbi = output.filters.find { it.filterType == "ABI" }?.identifier
                    val buildType = if (buildType.isDebuggable) "debug" else "release"
                    val buildCode = "_build-${output.versionCode}"

                    output.outputFileName = "${appName}-${versionName}-" +
                            "${flavorName.uppercase()}-" +
                            "${buildAbi}-${buildType}${buildCode}${timeMark}.apk"

                }
        }

    }

    tasks.preBuild {
        doFirst {
            delete(fileTree(mapOf("dir" to "build", "include" to listOf("**/*.apk"))))
        }
    }


    lint {
        checkReleaseBuilds = false
        abortOnError = false
    }

    buildFeatures {
        viewBinding = true
        compose = true
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    bundle {
        density {
            enableSplit = true
        }
        abi {
            enableSplit = true
        }
        language {
            enableSplit = false
        }
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
        packaging {
            jniLibs {
                pickFirsts.add("lib/armeabi-v7a/libc++_shared.so")
                pickFirsts.add("lib/x86/libc++_shared.so")
                pickFirsts.add("lib/arm64-v8a/libc++_shared.so")
                pickFirsts.add("lib/x86_64/libc++_shared.so")
            }
        }
    }
    composeOptions {
        kotlinCompilerExtensionVersion = libs.versions.composeCompiler.get()
    }
}

dependencies {
    implementation(fileTree(mapOf("dir" to "libs", "include" to listOf("*.jar"))))
    implementation(project(":core"))
    implementation(project(":core:model"))
    implementation(project(":core:database"))
    implementation(project(":core:network"))
    implementation(project(":libcompose"))
    implementation(project(":libtoolkit"))
    implementation(project(":libshared"))
    // Dynamic connection of editors
    if (withEditors) {
        val editorModules = listOf(
            ":libx2t",
            ":libeditors",
            ":libcells",
            ":libdocs",
            ":libslides",
            ":libgeditors",
            ":libgcells",
            ":libgdocs",
            ":libgslides",
            ":libsnapshot"
        )

        editorModules.forEach { modulePath ->
            try {
                implementation(project(modulePath))
                println("✅ The $modulePath editor module is enabled")
            } catch (e: UnknownProjectException) {
                println("⚠️ The $modulePath editor module is missing and will be skipped.")
            }
        }
    } else {
        println("ℹ️ Build mode without editors")
    }

    // Google libs (FOSS-compatible only)
    implementation(libs.google.material)
    implementation(libs.google.gson)

    // Androidx
    implementation(libs.appcompat)
    implementation(libs.biometric)
    implementation(libs.fragmentKtx)

    // RecyclerView
    implementation(libs.recyclerView)
    implementation(libs.recyclerViewSelection)

    implementation(libs.cardView)
    implementation(libs.constraint)

    // Dagger
    implementation(libs.dagger)
    ksp(libs.dagger.compiler)

    // Retrofit
    implementation(libs.retrofit)
    implementation(libs.retrofit.gson)
    implementation(libs.retrofit.xml) { exclude(group="xpp3", module= "xpp3" )}
    implementation(libs.retrofit.rx)
    implementation(libs.retrofit.kotlin.serialization)

    // Moxy
    implementation(libs.moxy)
    implementation(libs.moxy.material)
    implementation(libs.moxy.ktx)
    kapt(libs.moxy.compiler)

    // Kotlin
    implementation(libs.kotlin.core)
    implementation(libs.kotlin.coroutines)
    implementation(libs.kotlin.coroutines.android)
    implementation(libs.kotlin.serialization.json)

    // RX
    implementation(libs.rx.java)
    implementation(libs.rx.relay)

    // Room
    implementation(libs.room.ktx)
    implementation(libs.room.runtime)
    ksp(libs.room.compiler)

    // Other
    implementation(libs.phoneNumber)
    implementation(libs.pageIndicator)
    implementation(libs.glide)
    implementation(libs.glideCompose)
    implementation(libs.photoView)
    implementation(libs.androidWorkManager)
    implementation(libs.androidCustomTabs)

    //TODO add to base module
    implementation(libs.lifecycle.viewmodel)
    implementation(libs.lifecycle.livedata)
    implementation(libs.lifecycle.runtime)

    //Compose
    implementation(libs.compose.ui)
    implementation(libs.compose.material)
    implementation(libs.compose.uiToolingPreview)
    implementation(libs.compose.navigation)
    implementation(libs.compose.livedata)
    implementation(libs.compose.constraint.layout)
    debugImplementation(libs.compose.uiTooling)

    //Jackson
    implementation(libs.jackson)
    implementation(libs.jackson.annotations)
    implementation(libs.jackson.databind)
}

//tasks.register("copySamples") {
//    println("Copy samples")
//
//    val documentSamplesPath = "../../../document-templates/sample"
//    val documentNewPath = "../../../document-templates/new"
//
//    val assetsSamplePath = projectDir.absolutePath + "/src/main/assets/samples"
//    val assetsNewPath = projectDir.absolutePath + "/src/main/assets/templates"
//
//    if (!File(assetsSamplePath).exists()) {
//        File(assetsSamplePath).mkdirs()
//    }
//
//    if (!File(assetsNewPath).exists()) {
//        File(assetsNewPath).mkdirs()
//    }
//
//    copy {
//        from(documentSamplesPath)
//        into(assetsSamplePath)
//    }
//
//    copy {
//        from(documentNewPath)
//        into(assetsNewPath)
//    }
//}

