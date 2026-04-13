import SvgIcon from "@common/lib/component/SvgIcon"
import IconEditMode from "@icons/icon-edit-mode.svg"
import { Icon, Navbar, Page, Subnavbar, View, f7 } from "framework7-react"
import { inject, observer } from "mobx-react"
import React, { createContext, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { CSSTransition } from "../../../../common/mobile/lib/component/CSSTransition"
import { DrawController } from "../../../../common/mobile/lib/controller/Draw"
import { Themes } from "../../../../common/mobile/lib/controller/Themes"
import VersionHistoryController from "../../../../common/mobile/lib/controller/VersionHistory"
import CollaborationView from "../../../../common/mobile/lib/view/collaboration/Collaboration.jsx"
import { Device } from "../../../../common/mobile/utils/device"
import Snackbar from "../components/Snackbar/Snackbar"
import ContextMenu from "../controller/ContextMenu"
import { Search, SearchSettings } from "../controller/Search"
import ToolbarController from "../controller/Toolbar"
import { AddLinkController } from "../controller/add/AddLink"
import EditHyperlink from "../controller/edit/EditHyperlink"
import NavigationController from "../controller/settings/Navigation"
import SettingsController from "../controller/settings/Settings"
import AddOptions from "../view/add/Add"
import EditView from "../view/edit/Edit"

export const MainContext = createContext()

const MainPage = inject(
  "storeDocumentInfo",
  "users",
  "storeAppOptions",
  "storeVersionHistory",
  "storeToolbarSettings",
  "storeThemes",
)(
  observer((props) => {
    const { t } = useTranslation()
    const [state, setState] = useState({
      editOptionsVisible: false,
      addOptionsVisible: false,
      addShowOptions: null,
      settingsVisible: false,
      collaborationVisible: false,
      navigationVisible: false,
      addLinkSettingsVisible: false,
      editLinkSettingsVisible: false,
      snackbarVisible: false,
      fabVisible: true,
      isOpenModal: false,
    })
    const appOptions = props.storeAppOptions
    const storeThemes = props.storeThemes
    const colorTheme = storeThemes.colorTheme
    const storeVersionHistory = props.storeVersionHistory
    const isVersionHistoryMode = storeVersionHistory.isVersionHistoryMode
    const storeDocumentInfo = props.storeDocumentInfo
    const docExt = storeDocumentInfo.dataDoc?.fileType || ""
    const isAvailableExt = docExt && docExt !== "djvu" && docExt !== "pdf" && docExt !== "xps"
    const storeToolbarSettings = props.storeToolbarSettings
    const isFabShow =
      appOptions.isViewer &&
      !storeToolbarSettings.disabledSettings &&
      !storeToolbarSettings.disabledControls &&
      !props.users.isDisconnected &&
      isAvailableExt &&
      appOptions.isEdit &&
      (!appOptions.isProtected ||
        appOptions.typeProtection === Asc.c_oAscEDocProtect.TrackedChanges)
    const config = appOptions.config
    const { customization = {} } = config
    const isShowPlaceholder =
      !appOptions.isDocReady &&
      (!customization || !(customization.loaderName || customization.loaderLogo))

    let isBranding = true
    let isHideLogo = true
    let customLogoImage = ""
    let customLogoUrl = ""

    if (!appOptions.isDisconnected && appOptions.isDocReady) {
      const { logo } = customization
      isBranding = appOptions.canBranding || appOptions.canBrandingExt

      if (logo && isBranding) {
        isHideLogo = logo.visible === false

        if (logo.image || logo.imageDark || logo.imageLight) {
          customLogoImage =
            colorTheme.type === "dark"
              ? (logo.imageDark ?? logo.image ?? logo.imageLight)
              : (logo.imageLight ?? logo.image ?? logo.imageDark)
          customLogoUrl = logo.url
        }
      } else {
        isHideLogo = false
      }
    }

    const touchMoveHandler = (e) => {
      if (e.touches.length > 1 && !e.target.closest("#editor_sdk")) {
        e.preventDefault()
      }
    }

    const gesturePreventHandler = (e) => {
      e.preventDefault()
    }

    useEffect(() => {
      document.addEventListener("touchmove", touchMoveHandler)

      if (Device.ios) {
        document.addEventListener("gesturestart", gesturePreventHandler)
        document.addEventListener("gesturechange", gesturePreventHandler)
        document.addEventListener("gestureend", gesturePreventHandler)
      }

      return () => {
        document.removeEventListener("touchmove", touchMoveHandler)

        if (Device.ios) {
          document.removeEventListener("gesturestart", gesturePreventHandler)
          document.removeEventListener("gesturechange", gesturePreventHandler)
          document.removeEventListener("gestureend", gesturePreventHandler)
        }
      }
    }, [])

    const handleClickToOpenOptions = (opts, showOpts) => {
      f7.popover.close(".document-menu.modal-in", false)

      setState((prevState) => {
        if (opts === "edit") {
          return {
            ...prevState,
            editOptionsVisible: true,
            isOpenModal: true,
          }
        }
        if (opts === "add") {
          return {
            ...prevState,
            addOptionsVisible: true,
            addShowOptions: showOpts,
            isOpenModal: true,
          }
        }
        if (opts === "settings") {
          return {
            ...prevState,
            settingsVisible: true,
            isOpenModal: true,
          }
        }
        if (opts === "coauth") {
          return {
            ...prevState,
            collaborationVisible: true,
            addShowOptions: showOpts,
            isOpenModal: true,
          }
        }
        if (opts === "navigation") {
          return {
            ...prevState,
            navigationVisible: true,
          }
        }
        if (opts === "add-link") {
          return {
            ...prevState,
            addLinkSettingsVisible: true,
          }
        }
        if (opts === "edit-link") {
          return {
            ...prevState,
            editLinkSettingsVisible: true,
          }
        }
        if (opts === "snackbar") {
          return {
            ...prevState,
            snackbarVisible: true,
          }
        }
        if (opts === "fab") {
          return {
            ...prevState,
            fabVisible: true,
          }
        }
        if (opts === "history") {
          return {
            ...prevState,
            historyVisible: true,
          }
        }
      })

      if ((opts === "edit" || opts === "coauth") && Device.phone) {
        f7.navbar.hide(".main-navbar")
      }
    }

    const handleOptionsViewClosed = (opts) => {
      setState((prevState) => {
        if (opts === "edit") {
          return {
            ...prevState,
            editOptionsVisible: false,
            isOpenModal: false,
          }
        }
        if (opts === "add") {
          return {
            ...prevState,
            addOptionsVisible: false,
            addShowOptions: null,
            isOpenModal: false,
          }
        }
        if (opts === "settings") {
          return {
            ...prevState,
            settingsVisible: false,
            isOpenModal: false,
          }
        }
        if (opts === "coauth") {
          return {
            ...prevState,
            collaborationVisible: false,
            isOpenModal: false,
          }
        }
        if (opts === "navigation") {
          return {
            ...prevState,
            navigationVisible: false,
          }
        }
        if (opts === "add-link") {
          return {
            ...prevState,
            addLinkSettingsVisible: false,
          }
        }
        if (opts === "edit-link") {
          return {
            ...prevState,
            editLinkSettingsVisible: false,
          }
        }
        if (opts === "snackbar") {
          return {
            ...prevState,
            snackbarVisible: false,
          }
        }
        if (opts === "fab") {
          return {
            ...prevState,
            fabVisible: false,
          }
        }
        if (opts === "history") {
          return {
            ...prevState,
            historyVisible: false,
          }
        }
      })

      if ((opts === "edit" || opts === "coauth") && Device.phone) {
        f7.navbar.show(".main-navbar")
      }
    }

    const turnOffViewerMode = () => {
      const api = Common.EditorApi.get()

      f7.popover.close(".document-menu.modal-in", false)
      f7.navbar.show(".main-navbar", false)

      appOptions.changeViewerMode(false)
      api.asc_removeRestriction(Asc.c_oAscRestrictionType.View)
      api.asc_addRestriction(Asc.c_oAscRestrictionType.None)
    }

    return (
      <Themes fileType={docExt}>
        <MainContext.Provider
          value={{
            openOptions: handleClickToOpenOptions,
            closeOptions: handleOptionsViewClosed,
            showPanels: state.addShowOptions,
            isBranding,
            isViewer: appOptions.isViewer,
          }}
        >
          <Page name="home" className={`editor${!isHideLogo ? " page-with-logo" : ""}`}>
            <Navbar
              id="editor-navbar"
              className={`main-navbar${!isHideLogo ? " navbar-with-logo" : ""}`}
            >
              {!isHideLogo && (
                <div
                  className="main-logo"
                  onClick={() => {
                    window.open(
                      `${customLogoImage && customLogoUrl ? customLogoUrl : __PUBLISHER_URL__}`,
                      "_blank",
                    )
                  }}
                >
                  {customLogoImage ? (
                    <img className="custom-logo-image" src={customLogoImage} />
                  ) : (
                    <Icon icon="icon-logo" />
                  )}
                </div>
              )}
              {
                <Subnavbar>
                  <ToolbarController
                    openOptions={handleClickToOpenOptions}
                    closeOptions={handleOptionsViewClosed}
                    isOpenModal={state.isOpenModal}
                  />
                  <Search useSuspense={false} />
                </Subnavbar>
              }
            </Navbar>
            <View id="editor_sdk" />
            <Navbar id="drawbar" style={{ display: !appOptions.isDrawMode && "none" }}>
              <DrawController />
            </Navbar>
            {isShowPlaceholder ? (
              <div className="doc-placeholder-container">
                <div className="doc-placeholder">
                  <div className="line" />
                  <div className="line" />
                  <div className="line" />
                  <div className="line" />
                  <div className="line" />
                  <div className="line" />
                  <div className="line" />
                  <div className="line" />
                  <div className="line" />
                  <div className="line" />
                  <div className="line" />
                  <div className="line" />
                  <div className="line" />
                  <div className="line" />
                  <div className="line" />
                  <div className="line" />
                  <div className="line" />
                  <div className="line" />
                  <div className="line" />
                  <div className="line" />
                </div>
              </div>
            ) : null}
            <Snackbar
              isShowSnackbar={state.snackbarVisible}
              closeCallback={() => handleOptionsViewClosed("snackbar")}
              message={
                appOptions.isMobileView
                  ? t("Toolbar.textSwitchedMobileView")
                  : t("Toolbar.textSwitchedStandardView")
              }
            />
            <SearchSettings useSuspense={false} />
            {!state.editOptionsVisible ? null : <EditView />}
            {!state.addOptionsVisible ? null : <AddOptions />}
            {!state.addLinkSettingsVisible ? null : (
              <AddLinkController closeOptions={handleOptionsViewClosed} />
            )}
            {!state.editLinkSettingsVisible ? null : (
              <EditHyperlink closeOptions={handleOptionsViewClosed} />
            )}
            {!state.settingsVisible ? null : <SettingsController />}
            {!state.collaborationVisible ? null : (
              <CollaborationView
                closeOptions={handleOptionsViewClosed}
                showOptions={state.addShowOptions}
              />
            )}
            {!state.navigationVisible ? null : <NavigationController />}
            {!state.historyVisible ? null : (
              <VersionHistoryController onclosed={() => handleOptionsViewClosed("history")} />
            )}
            {isFabShow && !isVersionHistoryMode && (
              <CSSTransition
                in={state.fabVisible}
                timeout={500}
                classNames="fab"
                mountOnEnter
                unmountOnExit
              >
                <div className="fab fab-right-bottom" onClick={() => turnOffViewerMode()}>
                  <a href="#">
                    <SvgIcon symbolId={IconEditMode.id} className="icon icon-svg" />
                  </a>
                </div>
              </CSSTransition>
            )}
            {appOptions.isDocReady && <ContextMenu openOptions={handleClickToOpenOptions} />}
          </Page>
        </MainContext.Provider>
      </Themes>
    )
  }),
)

export default MainPage
