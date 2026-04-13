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
 *    Viewport.js
 *
 *    Controller for the viewport
 *
 *    Created on 26 March 2014
 *
 */

define([
  "core",
  "common/main/lib/view/Header",
  "common/main/lib/view/SearchBar",
  "presentationeditor/main/app/view/DocumentPreview",
  "presentationeditor/main/app/view/Viewport",
  //    'documenteditor/main/app/view/LeftMenu'
], (Viewport) => {
  PE.Controllers.Viewport = Backbone.Controller.extend(
    _.assign(
      {
        // Specifying a Viewport model
        models: [],

        // Specifying a collection of out Viewport
        collections: [],

        // Specifying application views
        views: [
          "Viewport", // is main application layout
          "Common.Views.Header",
          "DocumentPreview",
        ],

        // When controller is created let's setup view event listeners
        initialize: function () {
          // This most important part when we will tell our controller what events should be handled
          this.addListeners({
            FileMenu: {
              "menu:hide": this.onFileMenu.bind(this, "hide"),
              "menu:show": this.onFileMenu.bind(this, "show"),
              "settings:apply": this.applySettings.bind(this),
            },
            Toolbar: {
              "render:before": (toolbar) => {
                const config = PE.getController("Main").appOptions
                toolbar.setExtra("right", this.header.getPanel("right", config))
                if (!config.twoLevelHeader || config.compactHeader)
                  toolbar.setExtra("left", this.header.getPanel("left", config))
                this.toolbar = toolbar
                /*var value = Common.localStorage.getBool("pe-settings-quick-print-button", true);
                        Common.Utils.InternalSettings.set("pe-settings-quick-print-button", value);
                        if (me.header && me.header.btnPrintQuick)
                            me.header.btnPrintQuick[value ? 'show' : 'hide']();*/
              },
              "view:compact": (toolbar, state) => {
                this.viewport.vlayout.getItem("toolbar").height = state
                  ? Common.Utils.InternalSettings.get("toolbar-height-compact")
                  : Common.Utils.InternalSettings.get("toolbar-height-normal")
              },
              "undo:disabled": (state) => {
                this.header.lockHeaderBtns("undo", state, Common.enumLock.undoLock)
              },
              "redo:disabled": (state) => {
                this.header.lockHeaderBtns("redo", state, Common.enumLock.redoLock)
              },
              "print:disabled": (state) => {
                if (this.header.btnPrint) this.header.btnPrint.setDisabled(state)
                if (this.header.btnPrintQuick) this.header.btnPrintQuick.setDisabled(state)
              },
              "save:disabled": (state) => {
                if (this.header.btnSave) this.header.btnSave.setDisabled(state)
              },
              "startover:disabled": (state) => {
                if (this.header.btnStartOver) this.header.btnStartOver.setDisabled(state)
              },
            },
          })
          Common.NotificationCenter.on("preview:start", this.onPreviewStart.bind(this))
          Common.NotificationCenter.on("tabstyle:changed", this.onTabStyleChange.bind(this))
          Common.NotificationCenter.on(
            "tabbackground:changed",
            this.onTabBackgroundChange.bind(this),
          )
          this._isDisabledPreview = false
        },

        setApi: function (api) {
          this.api = api
          this.api.asc_registerCallback(
            "asc_onCoAuthoringDisconnect",
            this.onApiCoAuthoringDisconnect.bind(this),
          )
          Common.NotificationCenter.on("api:disconnect", this.onApiCoAuthoringDisconnect.bind(this))
        },

        getApi: function () {
          return this.api
        },

        // When our application is ready, lets get started
        onLaunch: function () {
          // Create and render main view
          this.viewport = this.createView("Viewport").render()

          this.api = new Asc.asc_docs_api({
            "id-view": "editor_sdk",
            translate: this.getApplication().getController("Main").translationTable,
            isRtlInterface: Common.UI.isRTL(),
            "thumbnails-position": Common.UI.isRTL() ? "right" : "left",
          })

          this.header = this.createView("Common.Views.Header", {
            headerCaption: "Presentation Editor",
            storeUsers: PE.getCollection("Common.Collections.Users"),
          })
          this.docPreview = this.createView("DocumentPreview", {}).render()

          Common.NotificationCenter.on("layout:changed", _.bind(this.onLayoutChanged, this))
          $(window).on("resize", _.bind(this.onWindowResize, this))

          const leftPanel = $("#left-menu")
          const histPanel = $("#left-panel-history")
          const rightPanel = $("#right-menu")
          this.viewport.hlayout.on(
            "layout:resizedrag",
            function () {
              this.api.Resize()

              const leftPanelWidth = histPanel.is(":visible")
                ? histPanel.width() + SCALE_MIN
                : leftPanel.width()
              if (leftPanelWidth > SCALE_MIN) {
                Common.localStorage.setItem("pe-mainmenu-width", leftPanelWidth)
              }

              const rightPanelWidth = rightPanel.width()
              if (rightPanelWidth > SCALE_MIN) {
                Common.localStorage.setItem("pe-rightmenu-width", rightPanelWidth)
              }
            },
            this,
          )

          this.boxSdk = $("#editor_sdk")
          this.boxSdk.css("border-left", "none")

          Common.NotificationCenter.on("app:face", this.onAppShowed.bind(this))
          Common.NotificationCenter.on("app:ready", this.onAppReady.bind(this))
          Common.NotificationCenter.on("search:show", _.bind(this.onSearchShow, this))
          Common.NotificationCenter.on("uitheme:changed", this.onThemeChanged.bind(this))
        },

        onAppShowed: function (config) {
          this.appConfig = config

          const _intvars = Common.Utils.InternalSettings
          const $filemenu = $(".toolbar-fullview-panel")
          $filemenu.css(
            "top",
            Common.UI.LayoutManager.isElementVisible("toolbar")
              ? _intvars.get("toolbar-height-tabs")
              : 0,
          )

          if (
            !config.isEdit ||
            (!Common.localStorage.itemExists("pe-compact-toolbar") &&
              config.customization &&
              config.customization.compactToolbar)
          ) {
            this.viewport.vlayout.getItem("toolbar").height = _intvars.get("toolbar-height-compact")
          }

          if (config.twoLevelHeader && !config.compactHeader) {
            const $title = this.viewport.vlayout.getItem("title").el
            $title.html(this.header.getPanel("title", config)).show()
            $title.find(".extra").html(this.header.getPanel("left", config))

            let toolbar = this.viewport.vlayout.getItem("toolbar")
            toolbar.el.addClass("top-title")
            toolbar.height -=
              _intvars.get("toolbar-height-tabs") - _intvars.get("toolbar-height-tabs-top-title")

            const _tabs_new_height = _intvars.get("toolbar-height-tabs-top-title")
            _intvars.set("toolbar-height-tabs", _tabs_new_height)
            _intvars.set("toolbar-height-compact", _tabs_new_height)
            _intvars.set(
              "toolbar-height-normal",
              _tabs_new_height + _intvars.get("toolbar-height-controls"),
            )

            $filemenu.css(
              "top",
              (Common.UI.LayoutManager.isElementVisible("toolbar") ? _tabs_new_height : 0) +
                _intvars.get("document-title-height"),
            )

            toolbar = this.getApplication().getController("Toolbar").getView("Toolbar")
            toolbar.btnCollabChanges = this.header.btnSave
          }

          this.onTabStyleChange()
          this.onTabBackgroundChange()
          if (config.customization?.toolbarHideFileName)
            this.viewport.vlayout.getItem("toolbar").el.addClass("style-skip-docname")

          this.header.btnSearch.on("toggle", this.onSearchToggle.bind(this))
        },

        onAppReady: (config) => {},

        onLayoutChanged: function (area) {
          switch (area) {
            default:
              this.viewport.vlayout.doLayout()
            case "rightmenu":
              this.viewport.hlayout.doLayout()
              break
            case "history": {
              const panel = this.viewport.hlayout.getItem("history")
              if (panel.resize.el) {
                this.boxSdk.css("border-left", "")
                panel.resize.el.show()
              }
              this.viewport.hlayout.doLayout()
              break
            }
            case "leftmenu": {
              const panel = this.viewport.hlayout.getItem("left")
              if (panel.resize.el) {
                if (panel.el.width() > 40) {
                  this.boxSdk.css("border-left", "")
                  panel.resize.el.show()
                } else {
                  panel.resize.el.hide()
                  this.boxSdk.css("border-left", "0 none")
                }
              }
              this.viewport.hlayout.doLayout()
              break
            }
            case "header":
            case "toolbar":
            case "status":
              this.viewport.vlayout.doLayout()
              break
          }
          this.api.Resize()
        },

        onWindowResize: function (e) {
          this.onLayoutChanged("window")
          Common.NotificationCenter.trigger("window:resize")
        },

        onPreviewStart: function (slidenum, presenter, fromApiEvent, isCurrent) {
          this.previewPanel = this.previewPanel || this.getView("DocumentPreview")
          let isResized = false
          const print = PE.getController?.("Print")

          if (print?._isPreviewVisible) return

          const reporterObject = presenter ? PE.getController("Main").document : null
          if (reporterObject) {
            reporterObject.translations = {
              reset: this.previewPanel.txtReset,
              endSlideshow: this.previewPanel.txtEndSlideshow,
              slideOf: this.previewPanel.slideIndexText,
              finalMessage: this.previewPanel.txtFinalMessage,
              pen: this.previewPanel.txtPen,
              highlighter: this.previewPanel.txtHighlighter,
              inkColor: this.previewPanel.txtInkColor,
              eraser: this.previewPanel.txtEraser,
              eraseScreen: this.previewPanel.txtEraseScreen,
              play: this.previewPanel.txtPlay,
              pause: this.previewPanel.txtPause,
              prevSlide: this.previewPanel.txtPrev,
              nextSlide: this.previewPanel.txtNext,
              pointer: this.previewPanel.txtPointer,
              draw: this.previewPanel.txtDraw,
            }
            reporterObject.token = this.api.asc_getSessionToken()
            reporterObject.customization = this.viewport.mode.customization
          }

          if (this.previewPanel && !this.previewPanel.isVisible() && this.api) {
            setTimeout(() => {
              Common.UI.Menu.Manager.hideAll()
            }, 100)
            this.previewPanel.show()
            this.previewPanel.btnDraw?.setDisabled(this._isDisabledPreview)
            const _onWindowResize = () => {
              if (isResized) return
              isResized = true
              Common.NotificationCenter.off("window:resize", _onWindowResize)
              isCurrent
                ? this.api.StartDemonstrationFromCurrentSlide(
                    "presentation-preview",
                    reporterObject,
                  )
                : this.api.StartDemonstrationFromBeginning("presentation-preview", reporterObject)
              Common.component.Analytics.trackEvent("Viewport", "Preview")
            }
            if (
              !this.viewport.mode.isDesktopApp &&
              !Common.Utils.isIE11 &&
              !presenter &&
              !!document.fullscreenEnabled
            ) {
              Common.NotificationCenter.on("window:resize", _onWindowResize)
              !fromApiEvent && Common.Utils.startFullscreenForElement($("#pe-preview").get(0))
              setTimeout(() => {
                _onWindowResize()
              }, 100)
            } else _onWindowResize()
          }
        },

        onFileMenu: function (opts) {
          const _need_disable = opts === "show"

          this.header.lockHeaderBtns("undo", _need_disable, Common.enumLock.fileMenuOpened)
          this.header.lockHeaderBtns("redo", _need_disable, Common.enumLock.fileMenuOpened)
          this.header.lockHeaderBtns("users", _need_disable)
        },

        applySettings: () => {
          // var value = Common.localStorage.getBool("pe-settings-quick-print-button", true);
          // Common.Utils.InternalSettings.set("pe-settings-quick-print-button", value);
          // if (this.header && this.header.btnPrintQuick)
          //     this.header.btnPrintQuick[value ? 'show' : 'hide']();
        },

        onApiCoAuthoringDisconnect: function (enableDownload) {
          if (this.header) {
            if (this.header.btnDownload && !enableDownload) this.header.btnDownload.hide()
            if (this.header.btnPrint && !enableDownload) this.header.btnPrint.hide()
            if (this.header.btnEdit) this.header.btnEdit.hide()
            if (this.header.btnPrintQuick && !enableDownload) this.header.btnPrintQuick.hide()
            this.header.lockHeaderBtns("rename-user", true)
          }
        },

        SetDisabled: function (disable) {
          this.header?.lockHeaderBtns("rename-user", disable)
        },

        onNotesShow: function (bIsShow) {
          this.header?.mnuitemHideNotes.setChecked(!bIsShow, true)
          Common.localStorage.setBool("pe-hidden-notes", !bIsShow)
        },

        onSearchShow: function () {
          this.header.btnSearch?.toggle(true)
        },

        onSearchToggle: function () {
          const leftMenu = this.getApplication().getController("LeftMenu")
          if (leftMenu.isSearchPanelVisible()) {
            this.header.btnSearch.toggle(false, true)
            leftMenu.getView("LeftMenu").panelSearch.focus()
            return
          }
          if (!this.searchBar) {
            const hideLeftPanel =
              this.appConfig.canBrandingExt &&
              (!Common.UI.LayoutManager.isElementVisible("leftMenu") ||
                (this.appConfig.customization && this.appConfig.customization.leftMenu === false))
            this.searchBar = new Common.UI.SearchBar(
              hideLeftPanel
                ? {
                    showOpenPanel: false,
                    width: 303,
                  }
                : {},
            )
            this.searchBar.on(
              "hide",
              _.bind(function () {
                this.header.btnSearch.toggle(false, true)
                Common.NotificationCenter.trigger("edit:complete")
              }, this),
            )
          }
          if (this.header.btnSearch.pressed) {
            const selectedText = this.api.asc_GetSelectedText()
            const searchController = this.getApplication().getController("Search")
            const resultsNumber = searchController.getResultsNumber()
            this.searchBar.show(selectedText?.trim() || searchController.getSearchText())
            this.searchBar.updateResultsNumber(resultsNumber[0], resultsNumber[1])
          } else {
            this.searchBar.hide()
          }
        },

        isSearchBarVisible: function () {
          return this.searchBar?.isVisible()
        },

        onTabStyleChange: function (style) {
          style = style || Common.Utils.InternalSettings.get("settings-tab-style")
          this.viewport.vlayout.getItem("toolbar").el.toggleClass("lined-tabs", style === "line")
        },

        onTabBackgroundChange: function (background) {
          background = background || Common.Utils.InternalSettings.get("settings-tab-background")
          this.viewport.vlayout
            .getItem("toolbar")
            .el.toggleClass("style-off-tabs", background === "toolbar")
        },

        setDisabledPreview: function (disable) {
          this._isDisabledPreview = disable
        },

        onThemeChanged: function () {
          if (Common.UI.Themes.available()) {
            const _intvars = Common.Utils.InternalSettings
            const $filemenu = $(".toolbar-fullview-panel")

            const computed_style = window.getComputedStyle(document.body)
            _intvars.set(
              "toolbar-height-controls",
              Number.parseInt(computed_style.getPropertyValue("--toolbar-height-controls") || 84),
            )
            _intvars.set(
              "toolbar-height-normal",
              _intvars.get("toolbar-height-tabs") + _intvars.get("toolbar-height-controls"),
            )
            $filemenu.css(
              "top",
              (Common.UI.LayoutManager.isElementVisible("toolbar")
                ? _intvars.get("toolbar-height-tabs")
                : 0) +
                (this.appConfig.twoLevelHeader && !this.appConfig.compactHeader
                  ? _intvars.get("document-title-height")
                  : 0),
            )

            this.viewport.vlayout.getItem("toolbar").height = this.toolbar?.isCompact()
              ? _intvars.get("toolbar-height-compact")
              : _intvars.get("toolbar-height-normal")

            this.viewport.vlayout.getItem("statusbar").height = Number.parseInt(
              computed_style.getPropertyValue("--statusbar-height") || 25,
            )

            Common.NotificationCenter.trigger("layout:changed", "toolbar")
          }
        },

        textFitPage: "Fit to Page",
        textFitWidth: "Fit to Width",
      },
      PE.Controllers.Viewport,
    ),
  )
})
