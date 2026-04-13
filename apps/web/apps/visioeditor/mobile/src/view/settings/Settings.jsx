import { Popover, Popup, View, f7 } from "framework7-react"
import React, { useContext, useEffect } from "react"
import About from "../../../../../common/mobile/lib/view/About"
import { Device } from "../../../../../common/mobile/utils/device"
import ApplicationSettingsController from "../../controller/settings/ApplicationSettings"
import DownloadController from "../../controller/settings/Download"
import VisioInfoController from "../../controller/settings/VisioInfo"
import { MainContext } from "../../page/main"
import { ThemeSettings } from "./ApplicationSettings"
import SettingsPage from "./SettingsPage"

const routes = [
  {
    path: "/settings-page/",
    component: SettingsPage,
    keepAlive: true,
  },
  {
    path: "/application-settings/",
    component: ApplicationSettingsController,
  },
  {
    path: "/theme-settings/",
    component: ThemeSettings,
  },
  {
    path: "/download/",
    component: DownloadController,
  },
  {
    path: "/visio-info/",
    component: VisioInfoController,
  },
  {
    path: "/about/",
    component: About,
  },
]

routes.forEach((route) => {
  route.options = {
    ...route.options,
    transition: "f7-push",
  }
})

const SettingsView = () => {
  const mainContext = useContext(MainContext)

  useEffect(() => {
    if (Device.phone) {
      f7.popup.open(".settings-popup")
    } else {
      f7.popover.open("#settings-popover", "#btn-settings")
    }
  }, [])

  return !Device.phone ? (
    <Popover
      id="settings-popover"
      closeByOutsideClick={false}
      className="popover__titled"
      onPopoverClosed={() => mainContext.closeOptions("settings")}
    >
      <View style={{ height: "410px" }} routes={routes} url="/settings-page/">
        <SettingsPage />
      </View>
    </Popover>
  ) : (
    <Popup className="settings-popup" onPopupClosed={() => mainContext.closeOptions("settings")}>
      <View routes={routes} url="/settings-page/">
        <SettingsPage />
      </View>
    </Popup>
  )
}

export default SettingsView
