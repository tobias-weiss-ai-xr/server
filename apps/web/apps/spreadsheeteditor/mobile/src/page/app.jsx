import React from "react"

import { App, Link, NavLeft, NavRight, Navbar, View, Views } from "framework7-react"
import { f7ready } from "framework7-react"

import "../../../../common/Analytics.js"

import "../../../../common/Gateway.js"

import routes from "../router/routes.js"

import "../../../../common/main/lib/util/utils.js"
import "../../../../common/main/lib/util/LanguageInfo.js"
import { LocalStorage } from "../../../../common/mobile/utils/LocalStorage.mjs"
import { Device } from "../../../../common/mobile/utils/device"
import Notifications from "../../../../common/mobile/utils/notifications.js"
import CellEditor from "../controller/CellEditor"
import { MainController } from "../controller/Main"

const f7params = {
  name: "Spreadsheet Editor", // App name
  theme: "auto", // Automatic theme detection

  routes: routes, // App routes
}

export default class extends React.Component {
  constructor() {
    super()

    Common.Notifications = new Notifications()
    Common.localStorage = LocalStorage
  }

  render() {
    return (
      <App {...f7params} className={"app-layout"}>
        {/* Your main view, should have "view-main" class */}
        <View main className="safe-areas" url="/" />
        <MainController />
      </App>
    )
  }

  componentDidMount() {
    f7ready((f7) => {
      Device.initDom()
    })

    // clean duplicate of app's root element
    const app = $$("#app")
    if (app.length) {
      for (const a of app) if (!a.children.length) a.remove()
    }
  }
}
