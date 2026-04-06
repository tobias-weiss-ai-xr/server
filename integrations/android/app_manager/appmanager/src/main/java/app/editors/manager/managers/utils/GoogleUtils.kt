package app.editors.manager.managers.utils

import android.content.Context

/**
 * FOSS stub: Google Play Services check and FCM token methods removed.
 * isGooglePlayServicesAvailable always returns false (no proprietary Google dependencies).
 */
object GoogleUtils {

    fun isGooglePlayServicesAvailable(context: Context): Boolean {
        // FOSS stub: always return false — no Google Play Services dependency
        return false
    }

    fun getDeviceToken(result: (resultListener: String) -> Unit, errorListener: (error: Throwable) -> Unit) {
        // FOSS stub: no FCM token available
        errorListener(UnsupportedOperationException("Firebase Messaging removed in FOSS build"))
    }

}
