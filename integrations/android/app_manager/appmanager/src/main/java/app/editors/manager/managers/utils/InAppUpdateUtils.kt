package app.editors.manager.managers.utils

import android.content.Context
import android.content.SharedPreferences
import androidx.core.content.edit
import androidx.fragment.app.FragmentActivity
import app.editors.manager.BuildConfig
import app.editors.manager.ui.fragments.onboarding.WhatsNewDialog

/**
 * FOSS stub: Google Play In-App Update removed.
 * Only the "What's New" dialog functionality is preserved.
 */
object InAppUpdateUtils {

    const val PREFS_NAME = "InAppUpdatePrefs"
    private const val LAST_VERSION_KEY = "last_version"
    private const val UPDATE_COMPLETED_KEY = "update_completed"

    fun checkForUpdate(activity: FragmentActivity) {
        // FOSS stub: in-app update via Google Play Core removed
        // Only show "What's New" dialog if applicable
        if (shouldShowWhatsNew(activity)) {
            WhatsNewDialog.show(activity.supportFragmentManager)
        }
    }

    private fun setUpdateCompleted(context: Context, completed: Boolean) {
        val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit {
            putBoolean(UPDATE_COMPLETED_KEY, completed)
        }
    }

    fun shouldShowWhatsNew(context: Context, currentVersion: String = BuildConfig.VERSION_NAME): Boolean {
        val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val lastVersion = prefs.getString(LAST_VERSION_KEY, null)
        val updateCompleted = prefs.getBoolean(UPDATE_COMPLETED_KEY, false)
        return if (lastVersion != currentVersion || updateCompleted) {
            prefs.edit { putString(LAST_VERSION_KEY, currentVersion) }
            setUpdateCompleted(context, false)
            true
        } else {
            false
        }
    }

    fun handleActivityResult(requestCode: Int, resultCode: Int, activity: FragmentActivity) {
        // FOSS stub: no-op (in-app update removed)
    }
}
