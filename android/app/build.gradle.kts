plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "app.lumen"
    compileSdk = 37 // Compose 1.12 requires API 37

    defaultConfig {
        applicationId = "app.lumen"
        minSdk = 26
        targetSdk = 36
        // Defaults. CI overrides them for one build: ./gradlew assembleRelease -PversionName=0.3.0 -PversionCode=5
        versionCode = providers.gradleProperty("versionCode").map(String::toInt).getOrElse(4) // +1 for every release
        versionName = providers.gradleProperty("versionName").getOrElse("0.2.0") // keep in step with package.json; the release tag is v + this
    }

    // The keystore lives outside git. CI passes it through environment variables from GitHub Secrets.
    signingConfigs {
        create("release") {
            val keystore = System.getenv("LUMEN_KEYSTORE")
            if (keystore != null) {
                storeFile = file(keystore)
                storePassword = System.getenv("LUMEN_KEYSTORE_PASSWORD")
                keyAlias = System.getenv("LUMEN_KEY_ALIAS")
                keyPassword = System.getenv("LUMEN_KEY_PASSWORD")
            }
        }
    }

    buildTypes {
        release {
            if (System.getenv("LUMEN_KEYSTORE") != null) signingConfig = signingConfigs.getByName("release")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.compose.foundation)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.ui)
}
