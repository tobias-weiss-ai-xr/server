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
 *  Created on 11/07/24
 *
 */

define(["core", "visioeditor/main/app/view/DocumentHolder"], () => {
  VE.Controllers.DocumentHolder = Backbone.Controller.extend({
    models: [],
    collections: [],
    views: ["DocumentHolder"],

    initialize: function () {
      //
      this.addListeners({
        DocumentHolder: {
          createdelayedelements: this.createDelayedElements,
        },
      })

      this._TtHeight = 20
      this._isDisabled = false
      this._state = {}
      this.mode = {}
      this.mouseMoveData = null
      this.isTooltipHiding = false

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
    },

    onLaunch: function () {
      this.documentHolder = this.createView("DocumentHolder").render()
      this.documentHolder.el.tabIndex = -1
      this.onAfterRender()
      Common.NotificationCenter.on({
        "window:show": (e) => {
          this.screenTip.toolTip.hide()
          this.screenTip.isVisible = false
          this.mode?.isDesktopApp && this.api && this.api.asc_onShowPopupWindow()
        },
        "modal:show": (e) => {},
        "layout:changed": (e) => {
          this.screenTip.toolTip.hide()
          this.screenTip.isVisible = false
          this.onDocumentHolderResize()
        },
      })
      Common.NotificationCenter.on("script:loaded", _.bind(this.createPostLoadElements, this))
    },

    setApi: function (o) {
      this.api = o

      if (this.api) {
        this.api.asc_registerCallback("asc_onContextMenu", _.bind(this.onContextMenu, this))
        this.api.asc_registerCallback("asc_onMouseMoveStart", _.bind(this.onMouseMoveStart, this))
        this.api.asc_registerCallback("asc_onMouseMoveEnd", _.bind(this.onMouseMoveEnd, this))

        //hyperlink
        this.api.asc_registerCallback("asc_onHyperlinkClick", _.bind(this.onHyperlinkClick, this))
        this.api.asc_registerCallback("asc_onMouseMove", _.bind(this.onMouseMove, this))

        if (this.mode.isEdit === true) {
        }
        this.api.asc_registerCallback(
          "asc_onCoAuthoringDisconnect",
          _.bind(this.onCoAuthoringDisconnect, this),
        )
        Common.NotificationCenter.on("api:disconnect", _.bind(this.onCoAuthoringDisconnect, this))

        this.api.asc_registerCallback("asc_onFocusObject", _.bind(this.onFocusObject, this))
        this.api.asc_registerCallback("onPluginContextMenu", _.bind(this.onPluginContextMenu, this))

        this.documentHolder.setApi(this.api)
      }

      return this
    },

    setMode: function (m) {
      this.mode = m
      this.documentHolder.setMode(m)
    },

    createPostLoadElements: () => {},

    createDelayedElements: function (view, type) {
      const view = this.documentHolder

      if (type === "view") {
        view.menuViewCopy.on("click", _.bind(this.onCutCopyPaste, this))
      } else if (type === "edit") {
        view.menuEditCopy.on("click", _.bind(this.onCutCopyPaste, this))
      }
    },

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

    fillViewMenuProps: function (selectedElements) {
      const documentHolder = this.documentHolder
      if (!documentHolder.viewModeMenu) documentHolder.createDelayedElementsViewer()

      const menu_props = {}
      return { menu_to_show: documentHolder.viewModeMenu, menu_props: menu_props }
    },

    fillEditMenuProps: function (selectedElements) {
      const documentHolder = this.documentHolder
      if (!documentHolder.editModeMenu) documentHolder.createDelayedElementsEditor()

      if (!selectedElements || !_.isArray(selectedElements) || selectedElements.length < 1)
        return { menu_to_show: documentHolder.editModeMenu, menu_props: {} }
      const menu_props = {}
      const menu_to_show = null
      return { menu_to_show: menu_to_show, menu_props: menu_props }
    },

    applyEditorMode: function () {
      if (this.mode?.isEdit && !this.documentHolder.editModeMenu) {
        this.documentHolder.createDelayedElementsEditor()
      }
    },

    showObjectMenu: function (event, docElement, eOpts) {
      return // no getSelectedElements
      if (this.api) {
        const obj = this.mode?.isEdit
          ? this.fillEditMenuProps(this.api.getSelectedElements())
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
        if (event.get_Type() === Asc.c_oAscContextMenuTypes.Thumbnails) {
        } else {
          this.showObjectMenu.call(this, event)
        }
      }, 10)
    },

    onFocusObject: function (selectedElements) {
      const currentMenu = this.documentHolder.currentMenu
      if (currentMenu?.isVisible()) {
        const obj = this.mode?.isEdit
          ? this.fillEditMenuProps(selectedElements)
          : this.fillViewMenuProps(selectedElements)
        if (obj) {
          if (obj.menu_to_show === currentMenu) {
            currentMenu.options.initMenu(obj.menu_props)
            currentMenu.alignPosition()
          }
        }
      }
      if (this.mode?.isEdit) {
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

    onDocumentHolderResize: function (e) {
      this._XY = undefined
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

    onHyperlinkClick: function (url) {
      if (url) {
        const type = this.api.asc_getUrlType(url)
        if (type === AscCommon.c_oAscUrlType.Http || type === AscCommon.c_oAscUrlType.Email)
          window.open(url)
        else {
          setTimeout(function () {
            Common.UI.warning({
              maxwidth: 500,
              msg: Common.Utils.String.format(this.txtWarnUrl, url),
              buttons: ["no", "yes"],
              primary: "no",
              callback: (btn) => {
                try {
                  btn === "yes" && window.open(url)
                } catch (err) {
                  err && console.log(err.stack)
                }
              },
            })
          }, 1)
        }
      }
    },

    onMouseMoveStart: function () {
      this.screenTip.isHidden = true
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
    },

    onMouseMove: function (moveData) {
      const cmpEl = this.documentHolder.cmpEl
      const screenTip = this.screenTip
      if (_.isUndefined(this._XY)) {
        this._XY = [
          Common.Utils.getOffset(cmpEl).left - $(window).scrollLeft(),
          Common.Utils.getOffset(cmpEl).top - $(window).scrollTop(),
        ]
        this._Width = cmpEl.width()
        this._Height = cmpEl.height()
        this._BodyWidth = $("body").width()
      }

      if (moveData) {
        let showPoint
        let ToolTip
        const type = moveData.get_Type()

        if (type === Asc.c_oAscMouseMoveDataTypes.Hyperlink) {
          if (this.isTooltipHiding) {
            this.mouseMoveData = moveData
            return
          }

          const hyperProps = moveData.get_Hyperlink()
          if (!hyperProps) return
          ToolTip = _.isEmpty(hyperProps.get_ToolTip())
            ? hyperProps.get_Value()
            : hyperProps.get_ToolTip()
          if (ToolTip.length > 256) ToolTip = `${ToolTip.substr(0, 256)}...`

          let recalc = false
          screenTip.isHidden = false

          ToolTip = Common.Utils.String.htmlEncode(ToolTip)

          if (
            screenTip.tipType !== type ||
            screenTip.tipLength !== ToolTip.length ||
            screenTip.strTip.indexOf(ToolTip) < 0
          ) {
            screenTip.toolTip.setTitle(
              type === Asc.c_oAscMouseMoveDataTypes.Hyperlink
                ? `${ToolTip}<br><b>${Common.Utils.String.platformKey("Ctrl", this.documentHolder.txtPressLink)}</b>`
                : ToolTip,
            )
            screenTip.tipLength = ToolTip.length
            screenTip.strTip = ToolTip
            screenTip.tipType = type
            recalc = true
          }

          showPoint = [moveData.get_X(), moveData.get_Y()]
          showPoint[1] += this._XY[1] - 15
          showPoint[0] += this._XY[0] + 5

          if (!screenTip.isVisible || recalc) {
            screenTip.isVisible = true
            screenTip.toolTip.show([-10000, -10000])
          }

          if (recalc) {
            screenTip.tipHeight = screenTip.toolTip.getBSTip().$tip.height()
            screenTip.tipWidth = screenTip.toolTip.getBSTip().$tip.width()
          }

          recalc = false
          if (showPoint[0] + screenTip.tipWidth > this._BodyWidth) {
            showPoint[0] = this._BodyWidth - screenTip.tipWidth
            recalc = true
          }
          showPoint[1] -= screenTip.tipHeight
          if (showPoint[1] < 0) showPoint[1] = 0
          if (showPoint[0] + screenTip.tipWidth > this._BodyWidth)
            showPoint[0] = this._BodyWidth - screenTip.tipWidth
          screenTip.toolTip
            .getBSTip()
            .$tip.css({ top: `${showPoint[1]}px`, left: `${showPoint[0]}px` })
        }
      }
    },

    onCoAuthoringDisconnect: function () {
      this.mode.isEdit = false
    },

    SetDisabled: function (state) {
      this._isDisabled = state
      this.documentHolder.SetDisabled(state)
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

    onCutCopyPaste: function (item, e) {
      if (this.api) {
        const res =
          item.value === "cut"
            ? this.api.Cut()
            : item.value === "copy"
              ? this.api.Copy()
              : this.api.Paste()
        if (!res) {
          if (
            !Common.localStorage.getBool("ve-hide-copywarning") &&
            (item.value === "paste" || this.mode.canCopy)
          ) {
            new Common.Views.CopyWarningDialog({
              handler: (dontshow) => {
                if (dontshow) Common.localStorage.setItem("ve-hide-copywarning", 1)
                this.editComplete()
              },
            }).show()
          }
        }
      }
      this.editComplete()
    },

    onPluginContextMenu: function (data) {
      if (
        data &&
        data.length > 0 &&
        this.documentHolder &&
        this.documentHolder.currentMenu &&
        this.documentHolder.currentMenu.isVisible()
      ) {
        this.documentHolder.updateCustomItems(this.documentHolder.currentMenu, data)
      }
    },

    editComplete: function () {
      this.documentHolder?.fireEvent("editcomplete", this.documentHolder)
    },

    clearSelection: () => {},
  })
})
