package app.editors.manager.mvp.views.login

import app.editors.manager.mvp.views.base.BaseView
import moxy.viewstate.strategy.OneExecutionStateStrategy
import moxy.viewstate.strategy.StateStrategyType

interface WorldOfficeCloudView : BaseView {

    @StateStrategyType(OneExecutionStateStrategy::class)
    fun checkAccounts(isEmpty: Boolean)
}