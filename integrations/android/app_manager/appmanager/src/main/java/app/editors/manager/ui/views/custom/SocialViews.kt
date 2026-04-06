package app.editors.manager.ui.views.custom

import android.accounts.Account
import android.content.Intent
import android.util.Log
import android.view.View
import androidx.core.view.isVisible
import androidx.fragment.app.FragmentActivity
import app.documents.core.network.common.contracts.ApiContract
import app.editors.manager.databinding.IncludeSocialNetworksLayoutBinding
import app.editors.manager.managers.utils.GoogleUtils

/**
 * FOSS stub: Facebook Login SDK references removed.
 * Google Sign-In kept as optional (behind try-catch with class not found).
 */
class SocialViews(
    private val activity: FragmentActivity, view: View?,
    private val facebookId: String?
) {

    interface OnSocialNetworkCallbacks {
        fun onTwitterSuccess(token: String)
        fun onTwitterFailed()
        fun onFacebookSuccess(token: String)
        fun onFacebookLogin(message: String)
        fun onFacebookCancel()
        fun onFacebookFailed()
        fun onGoogleSuccess(account: Account)
        fun onGoogleFailed()
        fun onGoogleCancelled()
        fun onSocialClick(social: String)
    }

    private var onSocialNetworkCallbacks: OnSocialNetworkCallbacks? = null
    private var viewBinding: IncludeSocialNetworksLayoutBinding? = null

    init {
        viewBinding = view?.let { IncludeSocialNetworksLayoutBinding.bind(it) }
        initListeners()
    }

    fun setProviders(providers: List<String>?) {
        if (providers == null) return
        viewBinding?.let {
            // Google Sign-In: only show if Play Services available
            it.loginSocialGoogleButton.isVisible = providers.contains(ApiContract.Social.GOOGLE)
                    && GoogleUtils.isGooglePlayServicesAvailable(activity)
            // Facebook login removed in FOSS build
            it.loginSocialFacebookButton.isVisible = false
            it.loginSocialAppleidButton.isVisible = false
            it.loginSocialZoomButton.isVisible = providers.contains(ApiContract.Social.ZOOM)
            it.loginSocialLinkedinButton.isVisible = providers.contains(ApiContract.Social.LINKEDIN)
            it.loginSocialTwitterButton.isVisible = false
        }
    }

    private fun initListeners() {
        viewBinding?.let {
            it.loginSocialFacebookButton.setOnClickListener { onFacebookClick() }
            it.loginSocialGoogleButton.setOnClickListener { onGoogleClick() }
            it.loginSocialAppleidButton.setOnClickListener {
                onSocialNetworkCallbacks?.onSocialClick(ApiContract.Social.APPLE_ID)
            }
            it.loginSocialZoomButton.setOnClickListener {
                onSocialNetworkCallbacks?.onSocialClick(ApiContract.Social.ZOOM)
            }
            it.loginSocialLinkedinButton.setOnClickListener {
                onSocialNetworkCallbacks?.onSocialClick(ApiContract.Social.LINKEDIN)
            }
        }
    }

    /*
    * Google Sign-In: kept as optional behind try-catch (Play Services may not be available)
    * */
    private fun onGoogleClick() {
        // FOSS stub: Google Play Services not available in FOSS build
        // Google Sign-In requires proprietary play-services-auth SDK
        onSocialNetworkCallbacks?.onGoogleFailed()
    }

    /*
    * Facebook click: stubbed out — Facebook Login SDK removed in FOSS build.
    * */
    private fun onFacebookClick() {
        onSocialNetworkCallbacks?.onFacebookFailed()
    }

    fun onFacebookContinue() {
        // FOSS stub: no-op
    }

    fun onFacebookLogout() {
        // FOSS stub: no-op
    }

    /*
    * Lifecycle methods
    * */
    fun onDestroyView() {
        setOnSocialNetworkCallbacks(null)
        viewBinding = null
    }

    fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        // FOSS stub: no-op — Facebook and Google Sign-In SDKs removed
    }

    /*
    * Getters/Setters
    * */
    fun setOnSocialNetworkCallbacks(onSocialNetworkCallbacks: OnSocialNetworkCallbacks?) {
        this.onSocialNetworkCallbacks = onSocialNetworkCallbacks
    }

    companion object {
        val TAG = SocialViews::class.java.simpleName
        const val GOOGLE_PERMISSION = 1212
        private const val RC_SIGN_IN = 9001
        private const val SIGN_IN_CANCELLED = 12501
    }

}
