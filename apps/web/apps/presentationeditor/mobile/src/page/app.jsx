import React from "react"

import {
  App,
  Block,
  BlockFooter,
  BlockTitle,
  Link,
  List,
  ListButton,
  ListInput,
  ListItem,
  NavRight,
  Navbar,
  Page,
  Panel,
  Popup,
  Toolbar,
  View,
  Views,
} from "framework7-react"
import { f7ready } from "framework7-react"

import "../../../../common/Analytics.js"

import "../../../../common/Gateway.js"
import "../../../../common/main/lib/util/utils.js"

import routes from "../router/routes.js"

import { Device } from "../../../../common/mobile/utils/device"
import Notifications from "../../../../common/mobile/utils/notifications.js"
import { MainController } from "../controller/Main"

// Framework7 Parameters
const f7params = {
  name: "Presentation Editor", // App name
  theme: "auto", // Automatic theme detection

  routes: routes, // App routes
}

export default class extends React.Component {
  constructor() {
    super()

    Common.Notifications = new Notifications()
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
