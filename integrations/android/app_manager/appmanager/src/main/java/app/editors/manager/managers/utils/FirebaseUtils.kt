package app.editors.manager.managers.utils

import android.content.Context
import android.os.Bundle
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import app.editors.manager.R
import app.editors.manager.app.App.Companion.getApp
import retrofit2.HttpException

/**
 * FOSS stub: All Firebase (analytics, crashlytics, remote config) methods are no-ops.
 * Remote config methods return default/false values.
 */
object FirebaseUtils {

    private const val KEY_RATING = "android_documents_rating"
    private const val KEY_CAPTCHA = "recaptcha_for_portal_registration"
    private const val KEY_TERMS_OF_SERVICE = "link_terms_of_service"
    private const val KEY_PRIVACY_POLICY = "link_privacy_policy"
    private const val KEY_ALLOW_COAUTHORING = "allow_coauthoring"
    private const val KEY_SDK_FULLY = "check_sdk_fully"
    private const val KEY_GOOGLE_DRIVE = "allow_google_drive"

    @JvmStatic
    fun addCrash(message: String) {
        // FOSS stub: no-op (previously logged to Firebase Crashlytics)
    }

    @JvmStatic
    fun addCrash(throwable: Throwable) {
        // FOSS stub: no-op
    }

    @JvmStatic
    fun addCrash(httpException: HttpException) {
        // FOSS stub: no-op
    }

    fun checkRatingConfig(onRatingApp: OnRatingApp?) {
        // FOSS stub: rating check disabled
        onRatingApp?.onRatingApp(false)
    }

    fun isGoogleDriveEnable(block: (isEnable: Boolean) -> Unit) {
        // FOSS stub: Google Drive feature flag disabled
        block(false)
    }

    @JvmStatic
    fun isCaptchaEnable(block: (isEnable: Boolean) -> Unit) {
        // FOSS stub: captcha disabled (hCaptcha removed)
        block(false)
    }

    fun getServiceUrls(): LiveData<Array<String>?> {
        // FOSS stub: return local service URLs instead of remote config
        val liveData = MutableLiveData<Array<String>>(null)
        liveData.value = arrayOf("", "")
        return liveData
    }

    fun checkSdkVersion(
        context: Context,
        webSdk: String,
        onResult: (isCoauthoring: Boolean) -> Unit
    ) {
        getSdk { allowCoauthoring, checkSdkFully ->
            if (!allowCoauthoring) {
                onResult(false)
                return@getSdk
            }

            val cleanWebSdk = webSdk.replace(".", "")
            if (cleanWebSdk.isEmpty()) {
                onResult(false)
                return@getSdk
            }

            val localSdk = lib.toolkit.base.managers.utils.FileUtils.readSdkVersion(context).replace(".", "")
            if (localSdk.isEmpty()) {
                onResult(false)
                return@getSdk
            }

            var maxVersionIndex = 2

            if (!checkSdkFully) {
                maxVersionIndex = 1
            }

            for (i in 0..maxVersionIndex) {
                if (cleanWebSdk[i] != localSdk[i]) {
                    onResult(false)
                    return@getSdk
                }
            }

            onResult(true)
        }
    }

    /**
     * @param block First allow_coauthoring, second check_sdk_fully
     */
    fun getSdk(block: (allowCoauthoring: Boolean, checkSdkFully: Boolean) -> Unit) {
        // FOSS stub: default to allowing coauthoring with full SDK check
        block(true, false)
    }

    fun getLocalServicesUrl(context: Context): Array<String> {
        return arrayOf(context.getString(R.string.app_url_terms), context.getString(R.string.app_url_policy))
    }

    private fun addAnalytics(event: String, bundle: Bundle) {
        // FOSS stub: no-op (previously logged to Firebase Analytics)
    }

    @JvmStatic
    fun addAnalyticsCreatePortal(portal: String, login: String) {
        // FOSS stub: no-op
    }

    @JvmStatic
    fun addAnalyticsCheckPortal(portal: String, result: String, error: String?) {
        // FOSS stub: no-op
    }

    fun addAnalyticsLogin(portal: String, provider: String?) {
        // FOSS stub: no-op
    }

    @JvmStatic
    fun addAnalyticsSwitchAccount(portal: String?) {
        // FOSS stub: no-op
    }

    @JvmStatic
    fun addAnalyticsCreateEntity(portal: String, isFile: Boolean, extension: String?) {
        // FOSS stub: no-op
    }

    @JvmStatic
    fun addAnalyticsOpenEntity(portal: String, extension: String) {
        // FOSS stub: no-op
    }

    @JvmStatic
    fun addAnalyticsOpenExternal(portal: String, extension: String) {
        // FOSS stub: no-op
    }

    object AnalyticsEvents {
        const val CREATE_PORTAL = "portal_create"
        const val CREATE_ENTITY = "create_entity"
        const val CHECK_PORTAL = "check_portal"
        const val LOGIN_PORTAL = "portal_login"
        const val SWITCH_ACCOUNT = "account_switch"
        const val OPEN_PDF = "open_pdf"
        const val OPEN_EDITOR = "open_editor"
        const val OPEN_MEDIA = "open_media"
        const val OPEN_EXTERNAL = "open_external"
        const val OPERATION_RESULT = "operation_result"
        const val OPERATION_DETAILS = "operation_details"
    }

    object AnalyticsKeys {
        const val NONE = "none"
        const val SUCCESS = "success"
        const val FAILED = "failed"
        const val PORTAL = "portal"
        const val LOGIN = "email"
        const val PROVIDER = "provider"
        const val ON_DEVICE = "onDevice"
        const val TYPE = "type"
        const val FILE_EXT = "fileExt"
        const val TYPE_FILE = "file"
        const val TYPE_FOLDER = "folder"
    }

    interface OnRatingApp {
        fun onRatingApp(isRating: Boolean)
    }
}
