import { Popover, Popup, View, f7 } from "framework7-react"
import React, { useContext, useEffect } from "react"
import VersionHistoryController from "../../../../../common/mobile/lib/controller/VersionHistory"
import About from "../../../../../common/mobile/lib/view/About"
import { Device } from "../../../../../common/mobile/utils/device"
import ApplicationSettingsController from "../../controller/settings/ApplicationSettings.jsx"
import { DownloadWithTranslation } from "../../controller/settings/Download.jsx"
import SpreadsheetInfoController from "../../controller/settings/SpreadsheetInfo.jsx"
import SpreadsheetSettingsController from "../../controller/settings/SpreadsheetSettings.jsx"
import { MainContext } from "../../page/main"
import {
  FormulaLanguage,
  MacrosSettings,
  RegionalSettings,
  ThemeSettings,
} from "./ApplicationSettings.jsx"
import SettingsPage from "./SettingsPage"
import {
  SpreadsheetColorSchemes,
  SpreadsheetFormats,
  SpreadsheetMargins,
} from "./SpreadsheetSettings.jsx"

const routes = [
  {
    path: "/settings-page/",
    component: SettingsPage,
    keepAlive: true,
  },
  {
    path: "/spreadsheet-settings/",
    component: SpreadsheetSettingsController,
  },
  {
    path: "/color-schemes/",
    component: SpreadsheetColorSchemes,
  },
  {
    path: "/spreadsheet-formats/",
    component: SpreadsheetFormats,
  },
  {
    path: "/margins/",
    component: SpreadsheetMargins,
  },
  {
    path: "/download/",
    component: DownloadWithTranslation,
  },
  {
    path: "/application-settings/",
    component: ApplicationSettingsController,
  },
  {
    path: "/macros-settings/",
    component: MacrosSettings,
  },
  {
    path: "/theme-settings/",
    component: ThemeSettings,
  },
  {
    path: "/regional-settings/",
    component: RegionalSettings,
  },
  {
    path: "/formula-languages/",
    component: FormulaLanguage,
  },
  {
    path: "/spreadsheet-info/",
    component: SpreadsheetInfoController,
  },
  {
    path: "/about/",
    component: About,
  },
  // Version History
  {
    path: "/version-history",
    component: VersionHistoryController,
    options: {
      props: {
        isNavigate: true,
      },
    },
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
      <View routes={routes} url="/settings-page/" style={{ height: "410px" }}>
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
