/*
 * (c) Copyright Ascensio System SIA 2010-2024
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */
/**
 *    LeftMenu.js
 *
 *    Controller
 *
 *    Created on 11/07/24
 *
 */

define([
  "core",
  "common/main/lib/util/Shortcuts",
  "visioeditor/main/app/view/LeftMenu",
  "visioeditor/main/app/view/FileMenu",
  "visioeditor/main/app/view/ViewTab",
], () => {
  VE.Controllers.LeftMenu = Backbone.Controller.extend(
    _.extend(
      {
        views: ["LeftMenu", "FileMenu", "ViewTab"],

        initialize: function () {
          this.addListeners({
            "Common.Views.Chat": {
              hide: _.bind(this.onHideChat, this),
            },
            "Common.Views.Header": {
              rename: _.bind(function (value) {
                this.mode?.wopi && this.api
                  ? this.api.asc_wopi_renameFile(value)
                  : Common.Gateway.requestRename(value)
              }, this),
            },
            "Common.Views.About": {
              show: _.bind(this.aboutShowHide, this, false),
              hide: _.bind(this.aboutShowHide, this, true),
            },
            "Common.Views.Plugins": {
              "plugins:addtoleft": _.bind(this.addNewPlugin, this),
              "pluginsleft:open": _.bind(this.openPlugin, this),
              "pluginsleft:close": _.bind(this.closePlugin, this),
              "pluginsleft:hide": _.bind(this.onHidePlugins, this),
              "pluginsleft:updateicons": _.bind(this.updatePluginButtonsIcons, this),
            },
            LeftMenu: {
              "panel:show": _.bind(this.menuExpand, this),
              "button:click": _.bind(this.onBtnCategoryClick, this),
            },
            FileMenu: {
              "menu:hide": _.bind(this.menuFilesShowHide, this, "hide"),
              "menu:show": _.bind(this.menuFilesShowHide, this, "show"),
              "item:click": _.bind(this.clickMenuFileItem, this),
              "saveas:format": _.bind(this.clickSaveAsFormat, this),
              "savecopy:format": _.bind(function (menu, format, ext) {
                if (this.mode?.wopi && ext !== undefined) {
                  // save copy as in wopi
                  this.saveAsInWopi(menu, format, ext)
                } else this.clickSaveCopyAsFormat(menu, format, ext)
              }, this),
              "settings:apply": _.bind(this.applySettings, this),
              "create:new": _.bind(this.onCreateNew, this),
              "recent:open": _.bind(this.onOpenRecent, this),
            },
            Toolbar: {
              "file:settings": _.bind(this.clickToolbarSettings, this),
              "file:open": this.clickToolbarTab.bind(this, "file"),
              "file:close": this.clickToolbarTab.bind(this, "other"),
            },
            ViewTab: {
              "leftmenu:hide": _.bind(this.onLeftMenuHide, this),
            },
            // 'SearchBar': {
            //     'search:show': _.bind(this.onShowHideSearch, this)
            // }
          })

          Common.NotificationCenter.on("leftmenu:change", _.bind(this.onMenuChange, this))
          Common.NotificationCenter.on("file:print", _.bind(this.clickToolbarPrint, this))
        },

        onLaunch: function () {
          this.leftMenu = this.createView("LeftMenu").render()
          this.leftMenu.btnThumbs.on("toggle", _.bind(this.onShowTumbnails, this))
          this.leftMenu.btnSearchBar.on("toggle", _.bind(this.onMenuSearchBar, this))
          this._state = {
            disableEditing: false,
          }

          const keymap = {
            "command+shift+s,ctrl+shift+s": _.bind(this.onShortcut, this, "save"),
            // 'command+f,ctrl+f': _.bind(this.onShortcut, this, 'search'),
            esc: _.bind(this.onShortcut, this, "escape"),
            f1: _.bind(this.onShortcut, this, "help"),
          }
          keymap[Common.Utils.isMac ? "ctrl+alt+f" : "alt+f"] = _.bind(
            this.onShortcut,
            this,
            "file",
          )
          keymap[Common.Utils.isMac ? "ctrl+alt+q" : "alt+q"] = _.bind(
            this.onShortcut,
            this,
            "chat",
          )
          Common.util.Shortcuts.delegateShortcuts({ shortcuts: keymap })
          Common.util.Shortcuts.suspendEvents()
        },

        setApi: function (api) {
          this.api = api
          this.api.asc_registerCallback("asc_onThumbnailsShow", _.bind(this.onThumbnailsShow, this))
          this.api.asc_registerCallback(
            "asc_onCoAuthoringDisconnect",
            _.bind(this.onApiServerDisconnect, this),
          )
          Common.NotificationCenter.on("api:disconnect", _.bind(this.onApiServerDisconnect, this))
          this.api.asc_registerCallback("asc_onDownloadUrl", _.bind(this.onDownloadUrl, this))
          if (this.mode.canCoAuthoring) {
            if (this.mode.canChat)
              this.api.asc_registerCallback(
                "asc_onCoAuthoringChatReceiveMessage",
                _.bind(this.onApiChatMessage, this),
              )
          }
          let value = Common.UI.LayoutManager.getInitValue("leftMenu")
          value = value !== undefined ? !value : false
          this.isThumbsShown = !Common.localStorage.getBool("ve-hidden-leftmenu", value)
          this.leftMenu.btnThumbs.toggle(this.isThumbsShown)
          this.leftMenu.getMenu("file").setApi(api)
          // this.getApplication().getController('Search').setApi(this.api).setMode(this.mode);
          // this.leftMenu.setOptionsPanel('advancedsearch', this.getApplication().getController('Search').getView('Common.Views.SearchPanel'));
          return this
        },

        setMode: function (mode) {
          this.mode = mode
          this.leftMenu.setMode(mode)
          this.leftMenu.getMenu("file").setMode(mode)
          return this
        },

        createDelayedElements: function () {
          if (this.mode.canCoAuthoring) {
            this.leftMenu.btnChat[
              this.mode.canChat && !this.mode.isLightVersion ? "show" : "hide"
            ]()
            if (this.mode.canChat)
              this.leftMenu.setOptionsPanel(
                "chat",
                this.getApplication()
                  .getController("Common.Controllers.Chat")
                  .getView("Common.Views.Chat"),
              )
          } else {
            this.leftMenu.btnChat.hide()
          }
          ;(this.mode.trialMode || this.mode.isBeta) &&
            this.leftMenu.setDeveloperMode(
              this.mode.trialMode,
              this.mode.isBeta,
              this.mode.buildVersion,
            )
          Common.util.Shortcuts.resumeEvents()
          this.leftMenu.setButtons()
          this.leftMenu.setMoreButton()
          return this
        },

        enablePlugins: function () {
          ;(this.mode.trialMode || this.mode.isBeta) &&
            this.leftMenu.setDeveloperMode(
              this.mode.trialMode,
              this.mode.isBeta,
              this.mode.buildVersion,
            )
        },

        clickMenuFileItem: function (menu, action, isopts) {
          let close_menu = true
          switch (action) {
            case "back":
              break
            case "save-desktop":
              this.api.asc_DownloadAs()
              break
            case "saveas":
              if (isopts) close_menu = false
              else this.clickSaveAsFormat()
              break
            case "save-copy":
              if (isopts) close_menu = false
              else this.clickSaveAsFormat(undefined, undefined, true)
              break
            case "print":
              this.api.asc_Print(
                new Asc.asc_CDownloadOptions(
                  null,
                  Common.Utils.isChrome ||
                    Common.Utils.isOpera ||
                    (Common.Utils.isGecko && Common.Utils.firefoxVersion > 86),
                ),
              )
              break
            case "exit":
              Common.NotificationCenter.trigger("goback")
              break
            case "edit":
              // this.getApplication().getController('Statusbar').setStatusCaption(this.requestEditRightsText);
              // Common.Gateway.requestEditRights();
              break
            case "new":
              if (isopts) close_menu = false
              else this.onCreateNew(undefined, "blank")
              break
            case "rename": {
              const documentCaption = this.api.asc_getDocumentName()
              new Common.Views.RenameDialog({
                filename: documentCaption,
                maxLength: this.mode.wopi ? this.mode.wopi.FileNameMaxLength : undefined,
                handler: (result, value) => {
                  if (
                    result === "ok" &&
                    !_.isEmpty(value.trim()) &&
                    documentCaption !== value.trim()
                  ) {
                    this.mode.wopi
                      ? this.api.asc_wopi_renameFile(value)
                      : Common.Gateway.requestRename(value)
                  }
                  Common.NotificationCenter.trigger("edit:complete", this)
                },
              }).show()
              break
            }
            case "external-help":
              close_menu = !!isopts
              break
            case "close-editor":
              Common.NotificationCenter.trigger("close")
              break
            case "switch:mobile":
              Common.Gateway.switchEditorType("mobile", true)
              break
            case "suggest":
              Common.NotificationCenter.trigger("suggest")
              break
            default:
              close_menu = false
          }

          if (close_menu && menu) {
            menu.hide()
          }
        },

        clickSaveAsFormat: function (menu, format) {
          this.api.asc_DownloadAs(new Asc.asc_CDownloadOptions(format))
          menu.hide()
        },

        clickSaveCopyAsFormat: function (menu, format, ext, wopiPath) {
          this.isFromFileDownloadAs = ext
          const options = new Asc.asc_CDownloadOptions(format, true)
          options.asc_setIsSaveAs(true)
          wopiPath && options.asc_setWopiSaveAsPath(wopiPath)
          this.api.asc_DownloadAs(options)

          menu.hide()
        },

        saveAsInWopi: function (menu, format, ext) {
          let defFileName = this.getApplication()
            .getController("Viewport")
            .getView("Common.Views.Header")
            .getDocumentCaption()
          !defFileName && (defFileName = this.txtUntitled)
          const idx = defFileName.lastIndexOf(".")
          if (idx > 0) defFileName = defFileName.substring(0, idx)
          new Common.Views.TextInputDialog({
            label: this.textSelectPath,
            value: defFileName || "",
            inputFixedConfig: { fixedValue: ext, fixedWidth: 40 },
            inputConfig: {
              maxLength: this.mode.wopi.FileNameMaxLength,
            },
            handler: (result, value) => {
              if (result === "ok") {
                if (typeof ext === "string") value = value + ext
                this.clickSaveAsFormat(menu, format, ext, value)
              }
            },
          }).show()
        },

        onDownloadUrl: function (url, fileType) {
          if (this.isFromFileDownloadAs) {
            let defFileName = this.getApplication()
              .getController("Viewport")
              .getView("Common.Views.Header")
              .getDocumentCaption()
            !defFileName && (defFileName = this.txtUntitled)

            if (typeof this.isFromFileDownloadAs === "string") {
              const idx = defFileName.lastIndexOf(".")
              if (idx > 0) defFileName = defFileName.substring(0, idx) + this.isFromFileDownloadAs
            }

            if (this.mode.canRequestSaveAs) {
              Common.Gateway.requestSaveAs(url, defFileName, fileType)
            } else {
              this._saveCopyDlg = new Common.Views.SaveAsDlg({
                saveFolderUrl: this.mode.saveAsUrl,
                saveFileUrl: url,
                defFileName: defFileName,
              })
              this._saveCopyDlg
                .on("saveaserror", (obj, err) => {
                  const config = {
                    closable: false,
                    title: this.notcriticalErrorTitle,
                    msg: err,
                    iconCls: "warn",
                    buttons: ["ok"],
                    callback: (btn) => {
                      Common.NotificationCenter.trigger("edit:complete", this)
                    },
                  }
                  Common.UI.alert(config)
                })
                .on("close", (obj) => {
                  this._saveCopyDlg = undefined
                })
              this._saveCopyDlg.show()
            }
          }
          this.isFromFileDownloadAs = false
        },

        applySettings: function (menu) {
          let value = Common.localStorage.getBool("ve-settings-cachemode", true)
          Common.Utils.InternalSettings.set("ve-settings-cachemode", value)
          this.api.asc_setDefaultBlitMode(value)

          value = Common.localStorage.getItem("ve-settings-fontrender")
          Common.Utils.InternalSettings.set("ve-settings-fontrender", value)
          this.api.SetFontRenderingMode(Number.parseInt(value))

          value = Common.localStorage.getBool("app-settings-screen-reader")
          Common.Utils.InternalSettings.set("app-settings-screen-reader", value)
          this.api.setSpeechEnabled(value)

          /* update zoom */
          const newZoomValue = Common.localStorage.getItem("ve-settings-zoom")
          const oldZoomValue = Common.Utils.InternalSettings.get("ve-settings-zoom")
          const lastZoomValue = Common.Utils.InternalSettings.get("ve-last-zoom")

          if (oldZoomValue === null || oldZoomValue === lastZoomValue || oldZoomValue === -3) {
            if (newZoomValue === -1) {
              this.api.zoomFitToPage()
            } else if (newZoomValue === -2) {
              this.api.zoomFitToWidth()
            } else if (newZoomValue > 0) {
              this.api.zoom(newZoomValue)
            }
          }

          Common.Utils.InternalSettings.set("ve-settings-zoom", newZoomValue)

          menu.hide()
        },

        onCreateNew: function (menu, type) {
          if (!Common.Controllers.Desktop.process("create:new")) {
            if (type === "blank" && this.mode.canRequestCreateNew) Common.Gateway.requestCreateNew()
            else {
              const newDocumentPage = window.open(
                type === "blank" ? this.mode.createUrl : type,
                "_blank",
              )
              if (newDocumentPage) newDocumentPage.focus()
            }
          }

          if (menu) {
            menu.hide()
          }
        },

        onOpenRecent: (menu, url) => {
          if (menu) {
            menu.hide()
          }

          const recentDocPage = window.open(url)
          if (recentDocPage) recentDocPage.focus()

          Common.component.Analytics.trackEvent("Open Recent")
        },

        clickToolbarSettings: function (obj) {
          this.leftMenu.showMenu("file:opts")
        },

        clickToolbarTab: function (tab, e) {
          if (tab === "file") this.leftMenu.showMenu("file")
          else this.leftMenu.menuFile.hide()
        },

        clickToolbarPrint: function () {
          if (this.mode.canPreviewPrint) this.leftMenu.showMenu("file:printpreview")
          else if (this.mode.canPrint) this.clickMenuFileItem(null, "print")
        },

        onHideChat: function () {
          $(this.leftMenu.btnChat.el).blur()
          Common.NotificationCenter.trigger("layout:changed", "leftmenu")
        },

        onHidePlugins: () => {
          Common.NotificationCenter.trigger("layout:changed", "leftmenu")
        },

        addNewPlugin: function (button, $button, $panel) {
          this.leftMenu.insertButton(button, $button)
          this.leftMenu.insertPanel($panel)
        },

        onBtnCategoryClick: function (btn) {
          if (btn.options.type === "plugin" && !btn.isDisabled()) {
            if (btn.pressed) {
              this.tryToShowLeftMenu()
              this.leftMenu.fireEvent("plugins:showpanel", [btn.options.value]) // show plugin panel
            } else {
              this.leftMenu.fireEvent("plugins:hidepanel", [btn.options.value])
            }
            this.leftMenu.onBtnMenuClick(btn)
          }
        },

        openPlugin: function (guid) {
          this.leftMenu.openPlugin(guid)
        },

        closePlugin: function (guid) {
          this.leftMenu.closePlugin(guid)
          Common.NotificationCenter.trigger("layout:changed", "leftmenu")
        },

        updatePluginButtonsIcons: function (icons) {
          this.leftMenu.updatePluginButtonsIcons(icons)
        },

        onApiServerDisconnect: function (enableDownload) {
          this.mode.isEdit = false
          this.leftMenu.close()

          this.leftMenu.btnChat.setDisabled(true)
          this.leftMenu.setDisabledPluginButtons(true)

          this.leftMenu
            .getMenu("file")
            .setMode({ isDisconnected: true, enableDownload: !!enableDownload })
        },

        setPreviewMode: function (mode) {
          this._state.disableEditing = mode
          this.updatePreviewMode()
        },

        updatePreviewMode: function () {
          const viewmode = this._state.disableEditing
          if (this.viewmode === viewmode) return
          this.viewmode = viewmode
          this.leftMenu.setDisabledPluginButtons(this.viewmode)
        },

        SetDisabled: function (disable, options) {
          if (this.leftMenu._state.disabled !== disable) {
            this.leftMenu._state.disabled = disable
            if (this.mode) {
              if (disable) {
                this.previsEdit = this.mode.isEdit
                this.prevcanEdit = this.mode.canEdit
                this.mode.isEdit = this.mode.canEdit = !disable
              } else {
                this.mode.isEdit = this.previsEdit
                this.mode.canEdit = this.prevcanEdit
              }
            }
          }

          if (disable) this.leftMenu.close()

          if (!options || options.chat) this.leftMenu.btnChat.setDisabled(disable)
          this.leftMenu.btnThumbs.setDisabled(disable)
          this.leftMenu.setDisabledPluginButtons(disable)
        },

        onApiChatMessage: function () {
          this.leftMenu.markCoauthOptions("chat")
        },

        aboutShowHide: function (value) {
          if (this.api) this.api.asc_enableKeyEvents(value)
          if (value) $(this.leftMenu.btnAbout.el).blur()
          if (value && this.leftMenu._state.pluginIsRunning) {
            this.leftMenu.panelPlugins.show()
            if (this.mode.canCoAuthoring) {
              this.mode.canChat && this.leftMenu.panelChat.hide()
            }
          }
        },

        menuFilesShowHide: (state) => {
          state === "hide" && Common.NotificationCenter.trigger("menu:hide")
        },

        onMenuChange: function (value) {
          if ("hide" === value) {
            if (this.api) {
              if (this.leftMenu.btnSearchBar.isActive()) {
                this.leftMenu.btnSearchBar.toggle(false)
                this.leftMenu.onBtnMenuClick(this.leftMenu.btnSearchBar)
              } else if (this.leftMenu.btnChat.isActive()) {
                this.leftMenu.btnChat.toggle(false)
                this.leftMenu.onBtnMenuClick(this.leftMenu.btnChat)
              }
            }
          }
        },

        onShortcut: function (s, e) {
          if (!this.mode) return

          switch (s) {
            case "search": {
              return false
              Common.UI.Menu.Manager.hideAll()
              const full_menu_pressed = this.leftMenu.btnAbout.pressed
              this.leftMenu.btnAbout.toggle(false)
              full_menu_pressed && this.menuExpand(this.leftMenu.btnAbout, "files", false)

              const selectedText = "" //this.api.asc_GetSelectedText();
              if (this.isSearchPanelVisible()) {
                selectedText && this.leftMenu.panelSearch.setFindText(selectedText)
                this.leftMenu.panelSearch.focus(selectedText !== "" ? s : "search")
                this.leftMenu.fireEvent(
                  "search:aftershow",
                  selectedText ? [selectedText] : undefined,
                )
                return false
              }
              if (this.getApplication().getController("Viewport").isSearchBarVisible()) {
                const viewport = this.getApplication().getController("Viewport")
                if (s === "replace") {
                  viewport.header.btnSearch.toggle(false)
                  this.onShowHideSearch(true, viewport.searchBar.inputSearch.val())
                } else {
                  selectedText && viewport.searchBar.setText(selectedText)
                  viewport.searchBar.focus()
                  return false
                }
              } else if (s === "search") {
                Common.NotificationCenter.trigger("search:show")
                return false
              } else {
                this.onShowHideSearch(true, selectedText ? selectedText : undefined)
              }
              this.leftMenu.btnSearchBar.toggle(true, true)
              this.leftMenu.panelSearch.focus(selectedText ? s : "search")
              return false
            }
            case "save":
              if (this.mode.canDownload) {
                if (this.mode.isDesktopApp && this.mode.isOffline) this.api.asc_DownloadAs()
                else {
                  if (this.mode.canDownload) {
                    Common.UI.Menu.Manager.hideAll()
                    this.leftMenu.showMenu("file:saveas")
                  }
                }
              }
              return false
            case "help":
              if (this.mode.canHelp) {
                // TODO: unlock 'help' for 'view' mode
                Common.UI.Menu.Manager.hideAll()
                this.leftMenu.showMenu("file:help")
              }
              return false
            case "file":
              Common.UI.Menu.Manager.hideAll()
              this.leftMenu.showMenu("file")
              return false
            case "escape": {
              //                        if (!this.leftMenu.isOpened()) return true;
              const btnSearch = this.getApplication().getController("Viewport").header.btnSearch
              btnSearch.pressed && btnSearch.toggle(false)

              if (this.leftMenu.menuFile.isVisible()) {
                if (Common.UI.HintManager.needCloseFileMenu()) this.leftMenu.menuFile.hide()
                return false
              }

              const statusbar = VE.getController("Statusbar")
              let menu_opened = statusbar.statusbar.$el.find('.open > [data-toggle="dropdown"]')
              if (menu_opened.length) {
                $.fn.dropdown.Constructor.prototype.keydown.call(menu_opened[0], e)
                return false
              }
              if (this.mode.canPlugins && this.leftMenu.panelPlugins) {
                menu_opened = this.leftMenu.panelPlugins.$el.find(
                  '#menu-plugin-container.open > [data-toggle="dropdown"]',
                )
                if (menu_opened.length) {
                  $.fn.dropdown.Constructor.prototype.keydown.call(menu_opened[0], e)
                  return false
                }
              }
              if (this.leftMenu.btnAbout.pressed) {
                if (!Common.UI.HintManager.isHintVisible()) {
                  this.leftMenu.close()
                  Common.NotificationCenter.trigger("layout:changed", "leftmenu")
                }
                return false
              }
              break
            }
            case "chat":
              if (this.mode.canCoAuthoring && this.mode.canChat && !this.mode.isLightVersion) {
                Common.UI.Menu.Manager.hideAll()
                this.leftMenu.showMenu("chat")
              }
              return false
          }
        },

        onPluginOpen: function (panel, type, action) {
          if (type === "onboard") {
            if (action === "open") {
              this.tryToShowLeftMenu()
              this.leftMenu.close()
              this.leftMenu.panelPlugins.show()
              this.leftMenu.onBtnMenuClick({ pressed: true, options: { action: "plugins" } })
              this.leftMenu._state.pluginIsRunning = true
            } else {
              this.leftMenu._state.pluginIsRunning = false
              this.leftMenu.close()
            }
          }
        },

        onShowHideChat: function (state) {
          if (this.mode.canCoAuthoring && this.mode.canChat && !this.mode.isLightVersion) {
            if (state) {
              Common.UI.Menu.Manager.hideAll()
              this.tryToShowLeftMenu()
              this.leftMenu.showMenu("chat")
            } else {
              this.leftMenu.btnChat.toggle(false, true)
              this.leftMenu.onBtnMenuClick(this.leftMenu.btnChat)
            }
          }
        },

        onShowHideSearch: function (state, findText) {
          if (state) {
            Common.UI.Menu.Manager.hideAll()
            this.tryToShowLeftMenu()
            this.leftMenu.showMenu("advancedsearch", undefined, true)
            this.leftMenu.fireEvent("search:aftershow", this.leftMenu, findText)
          } else {
            this.leftMenu.btnSearchBar.toggle(false, true)
            this.leftMenu.onBtnMenuClick(this.leftMenu.btnSearchBar)
          }
        },

        onMenuSearchBar: function (obj, show) {
          if (show) {
            this.leftMenu.panelSearch.setSearchMode("no-replace")
          }
        },

        isSearchPanelVisible: function () {
          return this.leftMenu?.panelSearch?.isVisible()
        },

        onLeftMenuHide: function (view, status) {
          if (this.leftMenu) {
            if (status) {
              this.leftMenu.show()
            } else {
              this.menuExpand(this, "thumbs", false)
              this.leftMenu.close()
              this.leftMenu.hide()
            }
            Common.localStorage.setBool("ve-hidden-leftmenu", !status)

            !view && this.leftMenu.fireEvent("view:hide", [this, !status])
          }

          Common.NotificationCenter.trigger("layout:changed", "main")
          Common.NotificationCenter.trigger("edit:complete", this.leftMenu)
        },

        tryToShowLeftMenu: function () {
          if (
            (!this.mode.canBrandingExt ||
              !this.mode.customization ||
              this.mode.customization.leftMenu !== false) &&
            Common.UI.LayoutManager.isElementVisible("leftMenu")
          )
            this.onLeftMenuHide(null, true)
        },

        onShowTumbnails: function (obj, show) {
          this.api.ShowThumbnails(show)
        },

        onThumbnailsShow: function (isShow) {
          if (isShow && !this.isThumbsShown) {
            this.leftMenu.btnThumbs.toggle(true, false)
          } else if (!isShow && this.isThumbsShown) this.leftMenu.btnThumbs.toggle(false, false)
          this.isThumbsShown = isShow
        },

        menuExpand: function (obj, panel, show) {
          if (panel === "thumbs") {
            this.isThumbsShown = show
          } else {
            if (
              !show &&
              this.isThumbsShown &&
              !this.leftMenu._state.pluginIsRunning &&
              !this.leftMenu._state.historyIsRunning
            ) {
              this.leftMenu.btnThumbs.toggle(true, false)
            }
          }
        },

        textNoTextFound: "Text not found",
        newDocumentTitle: "Unnamed document",
        requestEditRightsText: "Requesting editing rights...",
        notcriticalErrorTitle: "Warning",
        txtUntitled: "Untitled",
        textSelectPath: "Enter a new name for saving the file copy",
      },
      VE.Controllers.LeftMenu || {},
    ),
  )
})
