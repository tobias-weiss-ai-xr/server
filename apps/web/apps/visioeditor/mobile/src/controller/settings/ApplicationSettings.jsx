import { f7 } from "framework7-react"
import { inject, observer } from "mobx-react"
import React, { Component } from "react"
import { withTranslation } from "react-i18next"
import { ThemesContext } from "../../../../../common/mobile/lib/controller/Themes"
import { LocalStorage } from "../../../../../common/mobile/utils/LocalStorage.mjs"
import { ApplicationSettings } from "../../view/settings/ApplicationSettings"

class ApplicationSettingsController extends Component {
  static contextType = ThemesContext

  render() {
    return <ApplicationSettings changeTheme={this.context.changeTheme} />
  }
}

export default inject(
  "storeApplicationSettings",
  "storeAppOptions",
)(observer(withTranslation()(ApplicationSettingsController)))
