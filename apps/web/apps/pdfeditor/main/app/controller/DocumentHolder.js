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

define(["core", "pdfeditor/main/app/view/DocumentHolder"], () => {
  PDFE.Controllers.DocumentHolder = Backbone.Controller.extend({
    models: [],
    collections: [],
    views: ["DocumentHolder"],

    initialize: function () {
      this._TtHeight = 20
      this.usertips = []
      this.fastcoauthtips = []
      this._isDisabled = false
      this._state = { initEditorEvents: true }
      this.mode = {}
      this.mouseMoveData = null
      this.isTooltipHiding = false
      this.lastMathTrackBounds = []
      this.showMathTrackOnLoad = false
      this.lastTextBarBounds = []
      this.lastAnnotBarBounds = []
      this.lastAnnotBarOnTop = true
      this.lastAnnotSelBarOnTop = true

      this.screenTip = {
        toolTip: new Common.UI.Tooltip({
          owner: this,
          html: true,
          title: "<br><b>Press Ctrl and click link</b>",
          cls: "link-tooltip",
          //                    style: 'word-wrap: break-word;'
        }),
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
      }

      const keymap = {}
      this.hkComments = Common.Utils.isMac ? "command+alt+a" : "alt+h"
      keymap[this.hkComments] = () => {
        if (this.api.can_AddQuotedComment() !== false) {
          this.addComment()
        }
        return false
      }
      Common.util.Shortcuts.delegateShortcuts({ shortcuts: keymap })
    },

    onLaunch: function () {
      this.documentHolder = this.createView("DocumentHolder").render()
      this.documentHolder.el.tabIndex = -1
      this.onAfterRender()
      Common.NotificationCenter.on({
        "window:show": (e) => {
          this.screenTip.toolTip.hide()
          this.screenTip.isVisible = false
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
          this.screenTip.toolTip.hide()
          this.screenTip.isVisible = false
          /** coauthoring begin **/
          this.userTipHide()
          /** coauthoring end **/
          this.hideTips()
          this.hideEyedropper()
          this.onDocumentHolderResize()
        },
      })
      Common.NotificationCenter.on("script:loaded", _.bind(this.createPostLoadElements, this))
    },

    setApi: function (o) {
      this.api = o
      if (this.api) {
        this.mode.isEdit === true &&
          this.api.asc_registerCallback("asc_onCountPages", _.bind(this.onCountPages, this))
        this.documentHolder.setApi(this.api)
      }
      return this
    },

    setMode: function (m) {
      this.mode = m
      /** coauthoring begin **/
      !(this.mode.canCoAuthoring && this.mode.canComments)
        ? Common.util.Shortcuts.suspendEvents(this.hkComments)
        : Common.util.Shortcuts.resumeEvents(this.hkComments)
      /** coauthoring end **/
      this.documentHolder.setMode(m)
    },

    createPostLoadElements: function () {
      this.setEvents()
      this.applyEditorMode()
      this.showMathTrackOnLoad && this.onShowMathTrack(this.lastMathTrackBounds)
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

    fillViewMenuProps: (selectedElements) => {},

    fillPDFEditMenuProps: (selectedElements) => {},

    applyEditorMode: () => {},

    fillFormsMenuProps: (selectedElements) => {},

    showObjectMenu: function (event, docElement, eOpts) {
      if (this.api) {
        const obj = this.mode?.isRestrictedEdit
          ? event.get_Type() === 0
            ? this.fillFormsMenuProps(this.api.getSelectedElements())
            : null
          : this.mode?.isEdit && this.mode.isPDFEdit
            ? this.fillPDFEditMenuProps(this.api.getSelectedElements())
            : this.fillViewMenuProps(this.api.getSelectedElements())
        if (obj) this.showPopupMenu(obj.menu_to_show, obj.menu_props, event, docElement, eOpts)
      }
    },

    onContextMenu: function (event) {
      if (Common.UI.HintManager.isHintVisible()) Common.UI.HintManager.clearHints()
      if (!event) {
        Common.UI.Menu.Manager.hideAll()
        return
      }
      _.delay(() => {
        if (event.get_Type() === Asc.c_oAscPdfContextMenuTypes.Thumbnails) {
          if (this.mode?.isEdit) {
            !this.mode.isPDFEdit &&
              !this.documentHolder.viewPDFModeMenu &&
              this.documentHolder.createDelayedElementsPDFViewer()
            this.showPopupMenu.call(
              this,
              this.mode.isPDFEdit ? this.documentHolder.pageMenu : this.documentHolder.viewPageMenu,
              { isPageSelect: event.get_IsPageSelect(), pageNum: event.get_PageNum() },
              event,
            )
          }
        } else this.showObjectMenu.call(this, event)
      }, 10)
    },

    onFocusObject: function (selectedElements) {
      const currentMenu = this.documentHolder.currentMenu
      if (currentMenu?.isVisible()) {
        const obj = this.mode?.isRestrictedEdit
          ? this.fillFormsMenuProps(selectedElements)
          : this.mode?.isEdit && this.mode.isPDFEdit
            ? this.fillPDFEditMenuProps(selectedElements)
            : this.fillViewMenuProps(selectedElements)
        if (obj && obj.menu_to_show === currentMenu) {
          currentMenu.options.initMenu(obj.menu_props)
          currentMenu.alignPosition()
        } else {
          if (
            currentMenu ===
            (this.mode.isPDFEdit ? this.documentHolder.pageMenu : this.documentHolder.viewPageMenu)
          ) {
            currentMenu.options.initMenu()
            currentMenu.alignPosition()
          }
        }
      }

      let i = -1
      let in_equation = false
      let in_chart = false
      let no_paragraph = true
      let page_edit_text = false
      let locked = false
      while (++i < selectedElements.length) {
        const type = selectedElements[i].get_ObjectType()
        if (type === Asc.c_oAscTypeSelectElement.Math) {
          in_equation = true
        } else if (type === Asc.c_oAscTypeSelectElement.Paragraph) {
          const value = selectedElements[i].get_ObjectValue()
          value && (locked = locked || value.get_Locked())
          no_paragraph = false
        } else if (type === Asc.c_oAscTypeSelectElement.Shape) {
          // shape
          const value = selectedElements[i].get_ObjectValue()
          if (value?.get_FromChart()) {
            in_chart = true
            locked = locked || value.get_Locked()
          }
          if (value && !value.get_FromImage() && !value.get_FromChart()) no_paragraph = false
        } else if (type === Asc.c_oAscTypeSelectElement.Table) {
          no_paragraph = false
        } else if (type === Asc.c_oAscTypeSelectElement.PdfPage) {
          const value = selectedElements[i].get_ObjectValue()
          page_edit_text = value.asc_getEditLock()
        }
      }
      if (
        page_edit_text &&
        this.documentHolder.btnEditText &&
        this.documentHolder.btnEditText.cmpEl
      ) {
        this.documentHolder.btnEditText.cmpEl.parent().hide().prev(".separator").hide()
      } else if (
        !page_edit_text &&
        this.documentHolder.btnEditText &&
        this.documentHolder.btnEditText.cmpEl
      ) {
        this.documentHolder.btnEditText.cmpEl.parent().show().prev(".separator").show()
      }
      if (this.mode?.isEdit && this.mode.isPDFEdit) {
        if (in_equation) {
          this._state.equationLocked = locked
          this.disableEquationBar()
        }
        if (in_chart) {
          this._state.chartLocked = locked
          this.disableChartElementButton()
        }
        this._state.no_paragraph = no_paragraph
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
        } else if (delta > 0) {
          this.api.zoomIn()
        }

        event.preventDefault()
        event.stopPropagation()
      }
    },

    handleDocumentKeyDown: function (event) {
      if (this.api) {
        const key = event.keyCode
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
            this.api.zoom(100)
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

    onDocumentHolderResize: function (e) {
      this._XY = [
        Common.Utils.getOffset(this.documentHolder.cmpEl).left - $(window).scrollLeft(),
        Common.Utils.getOffset(this.documentHolder.cmpEl).top - $(window).scrollTop(),
      ]
      this._Height = this.documentHolder.cmpEl.height()
      this._Width = this.documentHolder.cmpEl.width()
      this._BodyWidth = $("body").width()
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
          if (e.target.localName === "canvas" && $(e.target).closest("[type=menuitem]").length < 1)
            Common.UI.Menu.Manager.hideAll()
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

    getUserName: function (id) {
      const usersStore = PDFE.getCollection("Common.Collections.Users")
      if (usersStore) {
        const rec = usersStore.findUser(id)
        if (rec) return AscCommon.UserInfoParser.getParsedName(rec.get("username"))
      }
      return this.documentHolder.guestText
    },

    isUserVisible: (id) => {
      const usersStore = PDFE.getCollection("Common.Collections.Users")
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
      /** coauthoring begin **/
      if (typeof this.userTooltip === "object") {
        this.userTooltip.hide()
        this.userTooltip = true
      }
      _.each(this.usertips, (item) => {
        item.remove()
      })
      this.usertips = []
      this.usertipcount = 0
      /** coauthoring end **/
    },

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
        this.screenTip.toolTip.hide(() => {
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

    onCoAuthoringDisconnect: function () {
      this.mode.isEdit = false
    },

    SetDisabled: function (state, canProtect, fillFormMode) {
      this._isDisabled = state
      this.documentHolder.SetDisabled(state, canProtect, fillFormMode)
      this.disableEquationBar()
      this.disableChartElementButton()
    },

    changePosition: function () {
      const cmpEl = this.documentHolder.cmpEl
      this._XY = [
        Common.Utils.getOffset(cmpEl).left - $(window).scrollLeft(),
        Common.Utils.getOffset(cmpEl).top - $(window).scrollTop(),
      ]
      this._Height = cmpEl.height()
      this._Width = cmpEl.width()
      this._BodyWidth = $("body").width()
      this.onMouseMoveStart()
    },

    addComment: function (item, e, eOpt) {
      if (this.api && this.mode.canCoAuthoring && this.mode.canComments) {
        this.documentHolder.suppressEditComplete = true

        const controller = PDFE.getController("Common.Controllers.Comments")
        if (controller) {
          controller.addDummyComment()
          item?.isFromBar && this.api.SetShowTextSelectPanel(false)
        }
      }
    },

    redactText: function (item, e, eOpt) {
      if (this.mode) {
        if (!this.mode.isPDFEdit) {
          Common.NotificationCenter.trigger("pdf:mode-apply", "edit", undefined, () => {
            if (this.mode.isPDFEdit) {
              Common.NotificationCenter.trigger("tab:set-active", "red", false)
              this.api?.AddRedactBySelect()
            }
          })
        } else {
          Common.NotificationCenter.trigger("tab:set-active", "red", false)
          this.api?.AddRedactBySelect()
        }
      }
    },

    onCountPages: function (count) {
      this.documentHolder && (this.documentHolder._pagesCount = count)
    },

    onDialogAddHyperlink: () => {},

    onShowMathTrack: () => {},

    onHideMathTrack: () => {},

    onHideChartElementButton: () => {},

    onHideTextBar: () => {},

    disableEquationBar: () => {},

    disableChartElementButton: () => {},

    onHideAnnotBar: () => {},

    onHideAnnotSelectBar: () => {},

    editText: function () {
      if (this.mode) {
        if (this.mode.isPDFEdit) {
          this.api?.asc_EditPage()
        } else {
          Common.NotificationCenter.trigger("pdf:mode-apply", "edit", undefined, () => {
            this.api && this.mode.isPDFEdit && this.api.asc_EditPage()
          })
        }
      }
    },

    clearSelection: function () {
      this.onHideMathTrack()
      this.onHideTextBar()
      this.onHideAnnotBar()
      this.onHideAnnotSelectBar()
      this.onHideChartElementButton()
    },

    editComplete: function () {
      this.documentHolder?.fireEvent("editcomplete", this.documentHolder)
    },
  })
})
