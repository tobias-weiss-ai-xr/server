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
 *  DocumentHolder.js
 *
 *  DocumentHolder controller
 *
 *  Created on 1/15/14
 *
 */

const c_paragraphLinerule = {
  LINERULE_LEAST: 0,
  LINERULE_AUTO: 1,
  LINERULE_EXACT: 2,
}

const c_tableBorder = {
  BORDER_VERTICAL_LEFT: 0,
  BORDER_HORIZONTAL_TOP: 1,
  BORDER_VERTICAL_RIGHT: 2,
  BORDER_HORIZONTAL_BOTTOM: 3,
  BORDER_VERTICAL_CENTER: 4,
  BORDER_HORIZONTAL_CENTER: 5,
  BORDER_INNER: 6,
  BORDER_OUTER: 7,
  BORDER_ALL: 8,
  BORDER_NONE: 9,
  BORDER_ALL_TABLE: 10, // table border and all cell borders
  BORDER_NONE_TABLE: 11, // table border and no cell borders
  BORDER_INNER_TABLE: 12, // table border and inner cell borders
  BORDER_OUTER_TABLE: 13, // table border and outer cell borders
}

const c_paragraphTextAlignment = {
  RIGHT: 0,
  LEFT: 1,
  CENTERED: 2,
  JUSTIFIED: 3,
}

const c_paragraphSpecial = {
  NONE_SPECIAL: 0,
  FIRST_LINE: 1,
  HANGING: 2,
}

const c_oHyperlinkType = {
  InternalLink: 0,
  WebLink: 1,
}

define(["core", "presentationeditor/main/app/view/DocumentHolder"], () => {
  PE.Controllers.DocumentHolder = Backbone.Controller.extend(
    _.extend(
      {
        models: [],
        collections: [],
        views: ["DocumentHolder"],

        initialize: function () {
          this.usertips = []
          this._TtHeight = 20
          this.fastcoauthtips = []
          this._state = {}
          this.mode = {}
          this._isDisabled = false
          this.lastMathTrackBounds = []
          this.showMathTrackOnLoad = false
          this.mouseMoveData = null
          this.isTooltipHiding = false

          this.screenTip = {
            strTip: "",
            isHidden: true,
            isVisible: false,
          }
          this.eyedropperTip = {
            isHidden: true,
            isVisible: false,
            eyedropperColor: null,
            tipInterval: null,
            isTipVisible: false,
          }

          this.userTooltip = true
          this.wrapEvents = {
            userTipMousover: _.bind(this.userTipMousover, this),
            userTipMousout: _.bind(this.userTipMousout, this),
            onKeyUp: _.bind(this.onKeyUp, this),
            onMouseLeave: _.bind(this.onMouseLeave, this),
          }

          this.guideTip = { ttHeight: 20 }
          // Hotkeys
          // ---------------------
          const keymap = {}
          this.hkComments = Common.Utils.isMac ? "command+alt+a" : "alt+h"
          keymap[this.hkComments] = () => {
            if (this.api.can_AddQuotedComment() !== false && this.documentHolder.slidesCount > 0) {
              this.addComment()
            }
            return false
          }

          this.hkPreview = Common.Utils.isMac ? "command+shift+enter" : "ctrl+f5"
          keymap[this.hkPreview] = (e) => {
            const isResized = false
            e.preventDefault()
            e.stopPropagation()
            if (this.documentHolder.slidesCount > 0) {
              Common.NotificationCenter.trigger("preview:start", 0)
            }
          }
          Common.util.Shortcuts.delegateShortcuts({ shortcuts: keymap })

          Common.Utils.InternalSettings.set(
            "pe-equation-toolbar-hide",
            Common.localStorage.getBool("pe-equation-toolbar-hide"),
          )
        },

        onLaunch: function () {
          this.documentHolder = this.createView("DocumentHolder").render()
          this.documentHolder.el.tabIndex = -1
          this.onAfterRender()
          Common.NotificationCenter.on({
            "window:show": (e) => {
              this.hideScreenTip()
              /** coauthoring begin **/
              this.userTipHide()
              /** coauthoring end **/
              this.hideEyedropper()
              this.mode?.isDesktopApp && this.api && this.api.asc_onShowPopupWindow()
            },
            "modal:show": (e) => {
              this.hideTips()
            },
            "layout:changed": (e) => {
              this.hideScreenTip()
              /** coauthoring begin **/
              this.userTipHide()
              /** coauthoring end **/
              this.hideTips()
              this.hideEyedropper()
              this.onDocumentHolderResize()
            },
            "preview:show": (e) => {
              this.isPreviewVisible = true
              this.screenTip && (this.screenTip.tipLength = -1) // redraw link tip
            },
            "preview:hide": (e) => {
              this.isPreviewVisible = false
              this.screenTip && (this.screenTip.tipLength = -1) // redraw link tip
            },
          })
          Common.NotificationCenter.on("script:loaded", _.bind(this.createPostLoadElements, this))
        },

        setApi: function (api) {
          this.api = api
          if (this.api) {
            this.api.asc_registerCallback("asc_onCountPages", _.bind(this.onApiCountPages, this))
            this.api.asc_registerCallback(
              "asc_onStartDemonstration",
              _.bind(this.onApiStartDemonstration, this),
            )
            this.api.asc_registerCallback(
              "asc_onCoAuthoringDisconnect",
              _.bind(this.onCoAuthoringDisconnect, this),
            )
            Common.NotificationCenter.on(
              "api:disconnect",
              _.bind(this.onCoAuthoringDisconnect, this),
            )
            this.api.asc_registerCallback("asc_onTextLanguage", _.bind(this.onTextLanguage, this))
            this.api.asc_registerCallback(
              "asc_onUpdateThemeIndex",
              _.bind(this.onApiUpdateThemeIndex, this),
            )
            this.api.asc_registerCallback(
              "asc_onLockDocumentTheme",
              _.bind(this.onApiLockDocumentTheme, this),
            )
            this.api.asc_registerCallback(
              "asc_onUnLockDocumentTheme",
              _.bind(this.onApiUnLockDocumentTheme, this),
            )
            this.documentHolder.slidesCount = this.api.getCountPages()
            this.documentHolder.setApi(this.api)
          }

          return this
        },

        setMode: function (mode) {
          this.mode = mode
          /** coauthoring begin **/
          !(this.mode.canCoAuthoring && this.mode.canComments)
            ? Common.util.Shortcuts.suspendEvents(this.hkComments)
            : Common.util.Shortcuts.resumeEvents(this.hkComments)
          /** coauthoring end **/

          this.editorConfig = { user: mode.user }
          this.documentHolder.setMode(mode)
        },

        onAfterRender: function (ct) {
          const meEl = this.documentHolder.cmpEl
          if (meEl) {
            meEl.on("contextmenu", (e) => {
              e.preventDefault()
              e.stopPropagation()
              return false
            })
            meEl.on("click", (e) => {
              if (e.target.localName === "canvas") {
                if (this._preventClick) this._preventClick = false
                else {
                  if (e.target.getAttribute?.("oo_no_focused")) return
                  meEl.focus()
                }
              }
            })
            meEl.on("mousedown", (e) => {
              if (e.target.localName === "canvas") Common.UI.Menu.Manager.hideAll()
            })
            meEl.on("touchstart", (e) => {
              if (e.target.localName === "canvas") Common.UI.Menu.Manager.hideAll()
            })

            //NOTE: set mouse wheel handler

            const addEvent = (elem, type, fn) => {
              elem.addEventListener
                ? elem.addEventListener(type, fn, false)
                : elem.attachEvent(`on${type}`, fn)
            }

            const eventname = /Firefox/i.test(navigator.userAgent) ? "DOMMouseScroll" : "mousewheel"
            addEvent(this.documentHolder.el, eventname, _.bind(this.handleDocumentWheel, this))
          }

          !Common.Utils.isChrome
            ? $(document).on("mousewheel", _.bind(this.handleDocumentWheel, this))
            : document.addEventListener("mousewheel", _.bind(this.handleDocumentWheel, this), {
                passive: false,
              })
          $(document).on("keydown", _.bind(this.handleDocumentKeyDown, this))
          $(window).on("resize", _.bind(this.onDocumentHolderResize, this))
          const viewport = this.getApplication().getController("Viewport").getView("Viewport")
          viewport.hlayout.on("layout:resizedrag", _.bind(this.onDocumentHolderResize, this))
        },

        createPostLoadElements: function () {
          this.setEvents()
          this.mode.isEdit
            ? this.getView().createDelayedElements()
            : this.getView().createDelayedElementsViewer()

          if (!this.mode.isEdit) {
            return
          }

          this.initExternalEditors()
          this.showMathTrackOnLoad && this.onShowMathTrack(this.lastMathTrackBounds)
          this.documentHolder?.setLanguages()
        },

        createDelayedElements: (view, type) => {},

        getView: function (name) {
          return !name ? this.documentHolder : Backbone.Controller.prototype.getView.call()
        },

        showPopupMenu: function (menu, value, event, docElement, eOpts) {
          if (!_.isUndefined(menu) && menu !== null) {
            Common.UI.Menu.Manager.hideAll()

            const showPoint = [event.get_X(), event.get_Y()]
            let menuContainer = $(this.documentHolder.el).find(
              Common.Utils.String.format("#menu-container-{0}", menu.id),
            )

            if (event.get_Type() === Asc.c_oAscContextMenuTypes.Thumbnails) {
              showPoint[0] -= 3
              showPoint[1] -= 3
            } else {
              value && (value.guide = { guideId: event.get_Guide() })
            }

            if (!menu.rendered) {
              // Prepare menu container
              if (menuContainer.length < 1) {
                menuContainer = $(
                  Common.Utils.String.format(
                    '<div id="menu-container-{0}" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>',
                    menu.id,
                  ),
                )
                $(this.documentHolder.el).append(menuContainer)
              }

              menu.render(menuContainer)
              menu.cmpEl.attr({ tabindex: "-1" })
            }

            if (event.get_Type() === Asc.c_oAscContextMenuTypes.AnimEffect) {
              if (event.get_ButtonWidth()) {
                showPoint[0] += event.get_ButtonWidth() + 2
                showPoint[1] += event.get_ButtonHeight() + 2
                menu.menuAlign = "tr-br"
                if (
                  Common.Utils.getOffset(this.documentHolder.cmpEl).top +
                    showPoint[1] +
                    menu.menuRoot.outerHeight() >
                  Common.Utils.innerHeight() - 10
                ) {
                  showPoint[1] -= event.get_ButtonHeight() + 4
                  menu.menuAlign = "br-tr"
                }
              } else {
                menu.menuAlign = "tl-tr"
              }
              this.hideScreenTip()
            }

            menuContainer.css({
              left: showPoint[0],
              top: showPoint[1],
            })

            menu.show()

            if (_.isFunction(menu.options.initMenu)) {
              menu.options.initMenu(value)
              menu.alignPosition()
            }
            _.delay(() => {
              menu.cmpEl.focus()
            }, 10)

            this.documentHolder.currentMenu = menu
            this.api.onPluginContextMenuShow?.(event)
          }
        },

        fillMenuProps: (selectedElements) => {},

        fillViewMenuProps: (selectedElements) => {},

        showObjectMenu: function (event, docElement, eOpts) {
          if (this.api) {
            const obj =
              this.mode.isEdit && !this._isDisabled
                ? this.fillMenuProps(this.api.getSelectedElements())
                : this.fillViewMenuProps(this.api.getSelectedElements())
            if (obj) this.showPopupMenu(obj.menu_to_show, obj.menu_props, event, docElement, eOpts)
          }
        },

        onContextMenu: function (event) {
          if (Common.UI.HintManager.isHintVisible()) Common.UI.HintManager.clearHints()
          _.delay(() => {
            if (event.get_Type() === Asc.c_oAscContextMenuTypes.Thumbnails) {
              this.showPopupMenu.call(
                this,
                this.mode.isEdit && !this._isDisabled
                  ? this.documentHolder.slideMenu
                  : this.documentHolder.viewModeMenuSlide,
                {
                  isSlideSelect: event.get_IsSlideSelect(),
                  isSlideHidden: event.get_IsSlideHidden(),
                  fromThumbs: true,
                },
                event,
              )
            } else if (event.get_Type() === Asc.c_oAscContextMenuTypes.AnimEffect) {
              this.showPopupMenu.call(
                this,
                this.documentHolder.animEffectMenu,
                { effect: event.get_EffectStartType() },
                event,
              )
            } else if (event.get_Type() === Asc.c_oAscContextMenuTypes.Master) {
              this.showPopupMenu.call(
                this,
                this.documentHolder.slideMasterMenu,
                { isMaster: true, isPreserve: event.get_IsSlidePreserve() },
                event,
              )
            } else if (event.get_Type() === Asc.c_oAscContextMenuTypes.Layout) {
              this.showPopupMenu.call(
                this,
                this.documentHolder.slideMasterMenu,
                { isMaster: false },
                event,
              )
            } else {
              this.showObjectMenu.call(this, event)
            }
          }, 10)
        },

        onFocusObject: function (selectedElements) {
          const currentMenu = this.documentHolder.currentMenu
          if (currentMenu?.isVisible()) {
            if (this.api.asc_getCurrentFocusObject() === 0) {
              // thumbnails
              if (
                this.documentHolder.slideMenu === currentMenu &&
                !!this.documentHolder.slideMenu.options.fromThumbs &&
                !this._isDisabled
              ) {
                let isHidden = false
                _.each(selectedElements, (element, index) => {
                  if (Asc.c_oAscTypeSelectElement.Slide === element.get_ObjectType()) {
                    isHidden = element.get_ObjectValue().get_IsHidden()
                  }
                })

                currentMenu.options.initMenu({
                  isSlideSelect: this.documentHolder.slideMenu.items[2].isVisible(),
                  isSlideHidden: isHidden,
                  fromThumbs: true,
                })
                currentMenu.alignPosition()
              }
            } else {
              const obj =
                this.mode.isEdit && !this._isDisabled
                  ? this.fillMenuProps(selectedElements)
                  : this.fillViewMenuProps(selectedElements)
              if (obj) {
                if (
                  obj.menu_to_show === currentMenu &&
                  (this.documentHolder.slideMenu !== currentMenu ||
                    !this.documentHolder.slideMenu.options.fromThumbs)
                ) {
                  currentMenu.options.initMenu(obj.menu_props)
                  currentMenu.alignPosition()
                }
              }
            }
          }

          if (this.mode?.isEdit) {
            let i = -1
            let in_equation = false
            let in_chart = false
            let locked = false
            while (++i < selectedElements.length) {
              const type = selectedElements[i].get_ObjectType()
              if (type === Asc.c_oAscTypeSelectElement.Math) {
                in_equation = true
              } else if (type === Asc.c_oAscTypeSelectElement.Slide) {
                const value = selectedElements[i].get_ObjectValue()
                value && (locked = locked || value.get_LockDelete())
              } else if (type === Asc.c_oAscTypeSelectElement.Paragraph) {
                const value = selectedElements[i].get_ObjectValue()
                value && (locked = locked || value.get_Locked())
              } else if (type === Asc.c_oAscTypeSelectElement.Chart) {
                in_chart = true
                const value = selectedElements[i].get_ObjectValue()
                value && (locked = locked || value.get_Locked())
              }
            }
            if (in_equation) {
              this._state.equationLocked = locked
              this.disableEquationBar()
            }
            if (in_chart) {
              this._state.chartLocked = locked
              this.disableChartElementButton()
            }
          }
        },

        handleDocumentWheel: function (event) {
          if (!this.api) return

          if (!this._isScrolling) {
            this._isScrolling = true
            this._ctrlPressedAtScrollStart = event.ctrlKey
          }

          clearTimeout(this._scrollEndTimeout)
          this._scrollEndTimeout = setTimeout(() => {
            this._isScrolling = false
          }, 100)

          let delta = _.isUndefined(event.originalEvent)
            ? event.wheelDelta
            : event.originalEvent.wheelDelta
          if (_.isUndefined(delta)) {
            delta = event.deltaY
          }

          if (this._ctrlPressedAtScrollStart && !event.altKey) {
            if (delta < 0) {
              this.api.zoomOut()
              this._handleZoomWheel = true
            } else if (delta > 0) {
              this.api.zoomIn()
              this._handleZoomWheel = true
            }

            event.preventDefault()
            event.stopPropagation()
          }
        },

        handleDocumentKeyDown: function (event) {
          if (this.api) {
            const key = event.keyCode
            if (this.hkSpecPaste) {
              this._needShowSpecPasteMenu =
                !event.shiftKey && !event.altKey && event.keyCode === Common.UI.Keys.CTRL
            }
            if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey) {
              if (
                key === Common.UI.Keys.NUM_PLUS ||
                key === Common.UI.Keys.EQUALITY ||
                (Common.Utils.isGecko && key === Common.UI.Keys.EQUALITY_FF) ||
                (Common.Utils.isOpera && key === 43)
              ) {
                this.api.zoomIn()
                event.preventDefault()
                event.stopPropagation()
                return false
              }
              if (
                key === Common.UI.Keys.NUM_MINUS ||
                key === Common.UI.Keys.MINUS ||
                (Common.Utils.isGecko && key === Common.UI.Keys.MINUS_FF) ||
                (Common.Utils.isOpera && key === 45)
              ) {
                this.api.zoomOut()
                event.preventDefault()
                event.stopPropagation()
                return false
              }
              if (key === Common.UI.Keys.ZERO || key === Common.UI.Keys.NUM_ZERO) {
                // 0
                this.api.zoomFitToPage()
                event.preventDefault()
                event.stopPropagation()
                return false
              }
            }
            if (this.documentHolder.currentMenu?.isVisible()) {
              if (key === Common.UI.Keys.UP || key === Common.UI.Keys.DOWN) {
                $("ul.dropdown-menu", this.documentHolder.currentMenu.el).focus()
              }
            }
            if (key === Common.UI.Keys.ESC) {
              Common.UI.Menu.Manager.hideAll()
            }
          }
        },

        onDocumentHolderResize: function () {
          this._Height = this.documentHolder.cmpEl.height()
          this._Width = this.documentHolder.cmpEl.width()
          this._BodyWidth = $("body").width()
          this._XY = undefined

          if (this.slideNumDiv) {
            this.slideNumDiv.remove()
            this.slideNumDiv = undefined
          }
        },

        hideScreenTip: function () {
          this.screenTip.toolTip?.hide()
          this.screenTip.isVisible = false
        },

        onMouseLeave: function () {
          this.hideScreenTip()
        },

        getUserName: function (id) {
          const usersStore = PE.getCollection("Common.Collections.Users")
          if (usersStore) {
            const rec = usersStore.findUser(id)
            if (rec) return AscCommon.UserInfoParser.getParsedName(rec.get("username"))
          }
          return this.documentHolder.guestText
        },

        isUserVisible: (id) => {
          const usersStore = PE.getCollection("Common.Collections.Users")
          if (usersStore) {
            const rec = usersStore.findUser(id)
            if (rec) return !rec.get("hidden")
          }
          return true
        },

        userTipMousover: function (evt, el, opt) {
          if (this.userTooltip === true) {
            this.userTooltip = new Common.UI.Tooltip({
              owner: evt.currentTarget,
              title: this.documentHolder.tipIsLocked,
            })

            this.userTooltip.show()
          }
        },

        userTipHide: function () {
          if (typeof this.userTooltip === "object") {
            this.userTooltip.hide()
            this.userTooltip = undefined

            for (let i = 0; i < this.usertips.length; i++) {
              this.usertips[i].off("mouseover", this.wrapEvents.userTipMousover)
              this.usertips[i].off("mouseout", this.wrapEvents.userTipMousout)
            }
          }
        },

        userTipMousout: function (evt, el, opt) {
          if (typeof this.userTooltip === "object") {
            if (this.userTooltip.$element && evt.currentTarget === this.userTooltip.$element[0]) {
              this.userTipHide()
            }
          }
        },

        hideTips: function () {
          if (typeof this.userTooltip === "object") {
            this.userTooltip.hide()
            this.userTooltip = true
          }
          _.each(this.usertips, (item) => {
            item.remove()
          })
          this.usertips = []
          this.usertipcount = 0
        },

        onMouseMoveStart: function () {
          this.screenTip.isHidden = true
          /** coauthoring begin **/
          if (this.usertips.length > 0) {
            if (typeof this.userTooltip === "object") {
              this.userTooltip.hide()
              this.userTooltip = true
            }
            _.each(this.usertips, (item) => {
              item.remove()
            })
          }
          this.usertips = []
          this.usertipcount = 0
          /** coauthoring end **/
        },

        onMouseMoveEnd: function () {
          if (this.screenTip.isHidden && this.screenTip.isVisible) {
            this.screenTip.isVisible = false
            this.isTooltipHiding = true
            this.screenTip.toolTip?.hide(() => {
              this.isTooltipHiding = false
              if (this.mouseMoveData) this.onMouseMove(this.mouseMoveData)
              this.mouseMoveData = null
            })
          }
          if (this.eyedropperTip.isHidden) {
            this.hideEyedropper()
          }
        },

        onMouseMove: (moveData) => {},

        hideEyedropper: function () {
          if (this.eyedropperTip.isVisible) {
            this.eyedropperTip.isVisible = false
            this.eyedropperTip.eyedropperColor.css({ left: "-1000px", top: "-1000px" })
          }
          if (this.eyedropperTip.isTipVisible) {
            this.eyedropperTip.isTipVisible = false
            this.eyedropperTip.toolTip.hide()
          }
        },

        onCoAuthoringDisconnect: function () {
          this.mode.isEdit = false
        },

        changePosition: function () {
          const cmpEl = this.documentHolder.cmpEl
          this._XY = [
            Common.Utils.getOffset(cmpEl).left - $(window).scrollLeft(),
            Common.Utils.getOffset(cmpEl).top - $(window).scrollTop(),
          ]
          this.onMouseMoveStart()
        },

        onApiStartDemonstration: function () {
          if (this.documentHolder.slidesCount > 0) {
            Common.NotificationCenter.trigger("preview:start", 0, null, true)
          }
        },

        onApiCountPages: function (count) {
          this.documentHolder.slidesCount = count
        },

        onTextLanguage: function (langid) {
          this.documentHolder._currLang.id = langid
        },

        onApiUpdateThemeIndex: function (v) {
          this._state.themeId = v
        },

        onApiLockDocumentTheme: function () {
          this.documentHolder && (this.documentHolder._state.themeLock = true)
        },

        onApiUnLockDocumentTheme: function () {
          this.documentHolder && (this.documentHolder._state.themeLock = false)
        },

        onKeyUp: function (e) {
          if (
            e.keyCode === Common.UI.Keys.CTRL &&
            this._needShowSpecPasteMenu &&
            !this._handleZoomWheel &&
            !this.btnSpecialPaste.menu.isVisible() &&
            /area_id/.test(e.target.id)
          ) {
            $("button", this.btnSpecialPaste.cmpEl).click()
            e.preventDefault()
          }
          this._handleZoomWheel = false
          this._needShowSpecPasteMenu = false
        },

        /** coauthoring begin **/
        addComment: function (item, e, eOpt) {
          if (this.api && this.mode.canCoAuthoring && this.mode.canComments) {
            this.documentHolder.suppressEditComplete = true

            const controller = PE.getController("Common.Controllers.Comments")
            if (controller) {
              controller.addDummyComment()
            }
          }
        },
        /** coauthoring end **/

        SetDisabled: function (state) {
          this._isDisabled = state
          this.documentHolder.SetDisabled(state)
          this.disableEquationBar()
          this.disableSpecialPaste()
          this.disableChartElementButton()
        },

        clearSelection: function () {
          this.onHideMathTrack()
          this.onHideSpecialPasteOptions()
          this.onHideChartElementButton()
        },

        onHideMathTrack: () => {},

        onHideSpecialPasteOptions: () => {},

        onHideChartElementButton: () => {},

        disableEquationBar: () => {},

        disableSpecialPaste: () => {},

        disableChartElementButton: () => {},

        editComplete: function () {
          this.documentHolder?.fireEvent("editcomplete", this.documentHolder)
        },
      },
      PE.Controllers.DocumentHolder || {},
    ),
  )
})
