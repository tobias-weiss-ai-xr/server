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
 *  Created on 3/28/14
 *
 */

const c_paragraphLinerule = {
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

define([
  "core",
  "common/main/lib/util/utils",
  "common/main/lib/util/Shortcuts",
  "spreadsheeteditor/main/app/view/DocumentHolder",
], () => {
  SSE.Controllers.DocumentHolder = Backbone.Controller.extend(
    _.extend(
      {
        models: [],
        collections: [],
        views: ["DocumentHolder"],

        initialize: function () {
          this.tooltips = {
            hyperlink: {},
            /** coauthoring begin **/
            comment: {},
            /** coauthoring end **/
            coauth: {
              ttHeight: 20,
            },
            row_column: {
              ttHeight: 20,
            },
            slicer: {
              ttHeight: 20,
            },
            filter: { ttHeight: 40 },
            func_arg: {},
            input_msg: {},
            foreignSelect: {
              ttHeight: 20,
            },
            eyedropper: {
              isHidden: true,
            },
            placeholder: {},
          }
          this.mouse = {}
          this.popupmenu = false
          this.rangeSelectionMode = false
          this.namedrange_locked = false
          this._currentMathObj = undefined
          this._currentParaObjDisabled = false
          this._isDisabled = false
          this._state = { wsLock: false, wsProps: [] }
          this.fastcoauthtips = []
          this._TtHeight = 20
          this.lastMathTrackBounds = []
          this.showMathTrackOnLoad = false

          /** coauthoring begin **/
          this.wrapEvents = {
            apiHideComment: _.bind(this.onApiHideComment, this),
            onKeyUp: _.bind(this.onKeyUp, this),
          }
          /** coauthoring end **/

          const keymap = {}
          this.hkComments = Common.Utils.isMac ? "command+alt+a" : "alt+h"
          keymap[this.hkComments] = () => {
            this.onAddComment()
            return false
          }
          Common.util.Shortcuts.delegateShortcuts({ shortcuts: keymap })

          Common.Utils.InternalSettings.set(
            "sse-equation-toolbar-hide",
            Common.localStorage.getBool("sse-equation-toolbar-hide"),
          )
        },

        onLaunch: function () {
          this.documentHolder = this.createView("DocumentHolder")
          this.documentHolder._currentTranslateObj = this

          //            me.documentHolder.on('render:after', _.bind(me.onAfterRender, me));

          this.documentHolder.render()
          this.documentHolder.el.tabIndex = -1

          $(document).on("mousedown", _.bind(this.onDocumentRightDown, this))
          $(document).on("mouseup", _.bind(this.onDocumentRightUp, this))
          $(document).on("keydown", _.bind(this.onDocumentKeyDown, this))
          $(document).on("mousemove", _.bind(this.onDocumentMouseMove, this))
          $(window).on("resize", _.bind(this.onDocumentResize, this))
          const viewport = SSE.getController("Viewport").getView("Viewport")
          viewport.hlayout.on("layout:resizedrag", _.bind(this.onDocumentResize, this))

          Common.NotificationCenter.on({
            "window:show": (e) => {
              this.hideHyperlinkTip()
              this.permissions?.isDesktopApp && this.api && this.api.asc_onShowPopupWindow()
            },
            "modal:show": (e) => {
              this.hideCoAuthTips()
              this.hideForeignSelectTips()
            },
            "layout:changed": (e) => {
              this.hideHyperlinkTip()
              this.hideCoAuthTips()
              this.hideForeignSelectTips()
              this.onDocumentResize()
              if (this.api && !this.tooltips.input_msg.isHidden && this.tooltips.input_msg.text) {
                this.changeInputMessagePosition(this.tooltips.input_msg)
              }
            },
            "cells:range": (status) => {
              this.onCellsRange(status)
            },
            "protect:wslock": _.bind(this.onChangeProtectSheet, this),
          })
          Common.Gateway.on("processmouse", _.bind(this.onProcessMouse, this))
          Common.NotificationCenter.on("script:loaded", _.bind(this.createPostLoadElements, this))
        },

        onCreateDelayedElements: (view, type) => {},

        createPostLoadElements: function () {
          this.setEvents()
          this.permissions.isEdit
            ? this.documentHolder.createDelayedElements()
            : this.documentHolder.createDelayedElementsViewer()

          if (this.type !== "edit") {
            return
          }

          this.initExternalEditors()
          this.showMathTrackOnLoad && this.onShowMathTrack(this.lastMathTrackBounds)
        },

        loadConfig: function (data) {
          this.editorConfig = data.config
        },

        setMode: function (permissions) {
          this.permissions = permissions
          /** coauthoring begin **/
          !(this.permissions.canCoAuthoring && this.permissions.canComments)
            ? Common.util.Shortcuts.suspendEvents(this.hkComments)
            : Common.util.Shortcuts.resumeEvents(this.hkComments)
          /** coauthoring end **/
          this.documentHolder.setMode(permissions)
        },

        setApi: function (api) {
          this.api = api
          if (this.api) {
            this.api.asc_registerCallback(
              "asc_onCoAuthoringDisconnect",
              _.bind(this.onApiCoAuthoringDisconnect, this),
            )
            Common.NotificationCenter.on(
              "api:disconnect",
              _.bind(this.onApiCoAuthoringDisconnect, this),
            )
            this.permissions &&
              this.permissions.isEdit === true &&
              this.api.asc_registerCallback(
                "asc_onLockDefNameManager",
                _.bind(this.onLockDefNameManager, this),
              )
          }
          return this
        },

        resetApi: function (api) {
          /** coauthoring begin **/
          this.api.asc_unregisterCallback("asc_onHideComment", this.wrapEvents.apiHideComment)
          //            this.api.asc_unregisterCallback('asc_onShowComment',    this.wrapEvents.apiShowComment);
          this.api.asc_registerCallback("asc_onHideComment", this.wrapEvents.apiHideComment)
          //            this.api.asc_registerCallback('asc_onShowComment',      this.wrapEvents.apiShowComment);
          /** coauthoring end **/
        },

        onAddComment: function (item) {
          if (this._state.wsProps.Objects) return

          if (this.api && this.permissions.canCoAuthoring && this.permissions.canComments) {
            const controller = SSE.getController("Common.Controllers.Comments")
            const cellinfo = this.api.asc_getCellInfo()
            if (controller) {
              const comments = cellinfo.asc_getComments()
              if (comments && !comments.length && this.permissions.canCoAuthoring) {
                controller.addDummyComment()
              }
            }
          }
        },

        onApiCoAuthoringDisconnect: function () {
          this.permissions.isEdit = false
        },

        onLockDefNameManager: function (state) {
          this.namedrange_locked = state === Asc.c_oAscDefinedNameReason.LockDefNameManager
        },

        hideCoAuthTips: function () {
          if (this.tooltips.coauth.ref) {
            $(this.tooltips.coauth.ref).remove()
            this.tooltips.coauth.ref = undefined
            this.tooltips.coauth.x_point = undefined
            this.tooltips.coauth.y_point = undefined
          }
        },

        hideForeignSelectTips: function () {
          if (this.tooltips.foreignSelect.ref) {
            $(this.tooltips.foreignSelect.ref).remove()
            this.tooltips.foreignSelect.ref = undefined
            this.tooltips.foreignSelect.userId = undefined
            this.tooltips.foreignSelect.x_point = undefined
            this.tooltips.foreignSelect.y_point = undefined
          }
        },

        hideHyperlinkTip: function () {
          if (!this.tooltips.hyperlink.isHidden && this.tooltips.hyperlink.ref) {
            this.tooltips.hyperlink.ref.hide()
            this.tooltips.hyperlink.ref = undefined
            this.tooltips.hyperlink.text = ""
            this.tooltips.hyperlink.isHidden = true
          }
        },

        hideEyedropperTip: function () {
          if (!this.tooltips.eyedropper.isHidden && this.tooltips.eyedropper.color) {
            this.tooltips.eyedropper.color.css({ left: "-1000px", top: "-1000px" })
            if (this.tooltips.eyedropper.ref) {
              this.tooltips.eyedropper.ref.hide()
              this.tooltips.eyedropper.ref = undefined
            }
            this.tooltips.eyedropper.isHidden = true
          }
        },

        hidePlaceholderTip: function () {
          if (!this.tooltips.placeholder.isHidden && this.tooltips.placeholder.ref) {
            this.tooltips.placeholder.ref.hide()
            this.tooltips.placeholder.ref = undefined
            this.tooltips.placeholder.text = ""
            this.tooltips.placeholder.isHidden = true
          }
        },

        onApiHideComment: function () {
          this.tooltips.comment.viewCommentId =
            this.tooltips.comment.editCommentId =
            this.tooltips.comment.moveCommentId =
              undefined
        },

        onApiContextMenu: function (event, type) {
          if (Common.UI.HintManager.isHintVisible()) Common.UI.HintManager.clearHints()
          _.delay(() => {
            this.showObjectMenu.call(this, event, type)
          }, 10)
        },

        onAfterRender: (view) => {},

        onDocumentResize: function (e) {
          if (this.documentHolder) {
            this.tooltips.coauth.XY = [
              Common.Utils.getOffset(this.documentHolder.cmpEl).left - $(window).scrollLeft(),
              Common.Utils.getOffset(this.documentHolder.cmpEl).top - $(window).scrollTop(),
            ]
            this.tooltips.coauth.apiHeight = this.documentHolder.cmpEl.height()
            this.tooltips.coauth.apiWidth = this.documentHolder.cmpEl.width()
            const rightMenu = $("#right-menu")
            this.tooltips.coauth.rightMenuWidth = rightMenu.is(":visible") ? rightMenu.width() : 0
            this.tooltips.coauth.bodyWidth = Common.Utils.innerWidth()
            this.tooltips.coauth.bodyHeight = Common.Utils.innerHeight()
          }
        },

        onDocumentWheel: function (e) {
          if (this.api && !this.isEditCell) {
            let delta = _.isUndefined(e.originalEvent) ? e.wheelDelta : e.originalEvent.wheelDelta
            if (_.isUndefined(delta)) {
              delta = e.deltaY
            }

            if (e.ctrlKey && !e.altKey) {
              let factor = this.api.asc_getZoom()
              if (delta < 0) {
                factor = Math.ceil(factor * 10) / 10
                factor -= 0.1
                if (!(factor < 0.1)) {
                  this.api.asc_setZoom(factor)
                  this._handleZoomWheel = true
                }
              } else if (delta > 0) {
                factor = Math.floor(factor * 10) / 10
                factor += 0.1
                if (factor > 0 && !(factor > 5)) {
                  this.api.asc_setZoom(factor)
                  this._handleZoomWheel = true
                }
              }

              e.preventDefault()
              e.stopPropagation()
            }
          }
        },

        onDocumentKeyDown: function (event) {
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
                if (!this.api.isCellEdited) {
                  let factor = Math.floor(this.api.asc_getZoom() * 10) / 10
                  factor += 0.1
                  if (factor > 0 && !(factor > 5)) {
                    this.api.asc_setZoom(factor)
                  }

                  event.preventDefault()
                  event.stopPropagation()
                  return false
                }
                if (
                  this.permissions.isEditMailMerge ||
                  this.permissions.isEditDiagram ||
                  this.permissions.isEditOle
                ) {
                  event.preventDefault()
                  event.stopPropagation()
                  return false
                }
              } else if (
                key === Common.UI.Keys.NUM_MINUS ||
                key === Common.UI.Keys.MINUS ||
                (Common.Utils.isGecko && key === Common.UI.Keys.MINUS_FF) ||
                (Common.Utils.isOpera && key === 45)
              ) {
                if (!this.api.isCellEdited) {
                  factor = Math.ceil(this.api.asc_getZoom() * 10) / 10
                  factor -= 0.1
                  if (!(factor < 0.1)) {
                    this.api.asc_setZoom(factor)
                  }

                  event.preventDefault()
                  event.stopPropagation()
                  return false
                }
                if (
                  this.permissions.isEditMailMerge ||
                  this.permissions.isEditDiagram ||
                  this.permissions.isEditOle
                ) {
                  event.preventDefault()
                  event.stopPropagation()
                  return false
                }
              } else if (key === Common.UI.Keys.ZERO || key === Common.UI.Keys.NUM_ZERO) {
                // 0
                if (!this.api.isCellEdited) {
                  this.api.asc_setZoom(1)
                  event.preventDefault()
                  event.stopPropagation()
                  return false
                }
              }
            } else if (key === Common.UI.Keys.F10 && event.shiftKey) {
              this.showObjectMenu(event)
              event.preventDefault()
              event.stopPropagation()
              return false
            } else if (
              key === Common.UI.Keys.ESC &&
              !this.tooltips.input_msg.isHidden &&
              this.tooltips.input_msg.text
            ) {
              this.onInputMessage()
            }
          }
        },

        onDocumentRightDown: function (event) {
          event.button === 0 && (this.mouse.isLeftButtonDown = true)
          //            event.button == 2 && (this.mouse.isRightButtonDown = true);
        },

        onDocumentRightUp: function (event) {
          event.button === 0 && (this.mouse.isLeftButtonDown = false)
        },

        onProcessMouse: function (data) {
          data.type === "mouseup" && (this.mouse.isLeftButtonDown = false)
        },

        onDragEndMouseUp: function () {
          this.mouse.isLeftButtonDown = false
        },

        onDocumentMouseMove: function (e) {
          if (e && e.target.localName !== "canvas") {
            this.hideHyperlinkTip()
          }
        },

        showObjectMenu: function (event, type) {
          if (this.api && !this.mouse.isLeftButtonDown && !this.rangeSelectionMode) {
            if (
              type === Asc.c_oAscContextMenuTypes.changeSeries &&
              this.permissions.isEdit &&
              !this._isDisabled
            ) {
              this.fillSeriesMenuProps(this.api.asc_GetSeriesSettings(), event, type)
              return
            }
            this.permissions.isEdit && !this._isDisabled
              ? this.fillMenuProps(this.api.asc_getCellInfo(), true, event)
              : this.fillViewMenuProps(this.api.asc_getCellInfo(), true, event)
          }
        },

        onApiMouseMove: (dataarray) => {},

        fillMenuProps: (cellinfo, showMenu, event) => {},

        fillViewMenuProps: (cellinfo, showMenu, event) => {},

        showPopupMenu: function (menu, value, event, type) {
          if (!_.isUndefined(menu) && menu !== null && event) {
            Common.UI.Menu.Manager.hideAll()
            const documentHolderView = this.documentHolder
            const showPoint = [
              event.pageX * Common.Utils.zoom() -
                Common.Utils.getOffset(documentHolderView.cmpEl).left,
              event.pageY * Common.Utils.zoom() -
                Common.Utils.getOffset(documentHolderView.cmpEl).top,
            ]
            let menuContainer = documentHolderView.cmpEl.find(
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
                documentHolderView.cmpEl.append(menuContainer)
              }

              menu.render(menuContainer)
              menu.cmpEl.attr({ tabindex: "-1" })
            }

            if (/*!this.mouse.isRightButtonDown &&*/ event.button !== 2) {
              const coord = this.api.asc_getActiveCellCoord()
              const offset = { left: 0, top: 0 } /*documentHolderView.cmpEl.offset()*/

              showPoint[0] = coord.asc_getX() + coord.asc_getWidth() + offset.left
              showPoint[1] =
                (coord.asc_getY() < 0 ? 0 : coord.asc_getY()) + coord.asc_getHeight() + offset.top
            }

            menuContainer.css({
              left: showPoint[0],
              top: showPoint[1],
            })

            if (_.isFunction(menu.options.initMenu)) {
              menu.options.initMenu(value)
              menu.alignPosition()
            }
            _.delay(() => {
              menu.cmpEl.focus()
            }, 10)

            menu.show()
            this.currentMenu = menu
            type !== Asc.c_oAscContextMenuTypes.changeSeries &&
              this.api.onPluginContextMenuShow &&
              this.api.onPluginContextMenuShow(event)
          }
        },

        onHideSpecialPasteOptions: function () {
          if (!this.documentHolder || !this.documentHolder.cmpEl) return
          const pasteContainer = this.documentHolder.cmpEl.find("#special-paste-container")
          if (pasteContainer.is(":visible")) {
            pasteContainer.hide()
            $(document).off("keyup", this.wrapEvents.onKeyUp)
          }
        },

        disableSpecialPaste: function () {
          const pasteContainer = this.documentHolder.cmpEl.find("#special-paste-container")
          if (pasteContainer.length > 0 && pasteContainer.is(":visible")) {
            this.btnSpecialPaste.setDisabled(!!this._isDisabled)
          }
        },

        onHideChartElementButton: function () {
          if (!this.documentHolder || !this.documentHolder.cmpEl) return
          const chartContainer = this.documentHolder.cmpEl.find("#chart-element-container")
          if (chartContainer.is(":visible")) {
            chartContainer.hide()
            Common.UI.TooltipManager.closeTip("chartElements")
          }
        },

        disableChartElementButton: function () {
          const chartContainer = this.documentHolder.cmpEl.find("#chart-element-container")
          const disabled = this._isDisabled || this._state.chartLocked

          if (chartContainer.length > 0 && chartContainer.is(":visible")) {
            this.btnChartElement.setDisabled(!!disabled)
          }
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

        onChangeProtectSheet: function (props) {
          if (!props) {
            const wbprotect = this.getApplication().getController("WBProtection")
            props = wbprotect ? wbprotect.getWSProps() : null
          }
          if (props) {
            this._state.wsProps = props.wsProps
            this._state.wsLock = props.wsLock
          }
        },

        onHideMathTrack: function () {
          if (!this.documentHolder || !this.documentHolder.cmpEl) return

          if (!Common.Controllers.LaunchController.isScriptLoaded()) {
            this.showMathTrackOnLoad = false
            return
          }

          const eqContainer = this.documentHolder.cmpEl.find("#equation-container")
          if (eqContainer.is(":visible")) {
            eqContainer.hide()
          }
        },

        disableEquationBar: function () {
          const eqContainer = this.documentHolder.cmpEl.find("#equation-container")
          const disabled = this._isDisabled || this._state.equationLocked

          if (eqContainer.length > 0 && eqContainer.is(":visible")) {
            this.equationBtns.forEach((item) => {
              item?.setDisabled(!!disabled)
            })
            this.equationSettingsBtn.setDisabled(!!disabled)
          }
        },

        getUserName: function (id) {
          const usersStore = SSE.getCollection("Common.Collections.Users")
          if (usersStore) {
            const rec = usersStore.findUser(id)
            if (rec) return AscCommon.UserInfoParser.getParsedName(rec.get("username"))
          }
          return this.guestText
        },

        isUserVisible: (id) => {
          const usersStore = SSE.getCollection("Common.Collections.Users")
          if (usersStore) {
            const rec = usersStore.findUser(id)
            if (rec) return !rec.get("hidden")
          }
          return true
        },

        SetDisabled: function (state, canProtect) {
          this._isDisabled = state
          this._canProtect = state ? canProtect : true
          this.disableEquationBar()
          this.disableSpecialPaste()
          this.disableChartElementButton()
        },

        clearSelection: function () {
          this.onHideMathTrack()
          this.onHideSpecialPasteOptions()
          this.onHideChartElementButton()
        },

        onPluginContextMenu: function (data) {
          if (
            data &&
            data.length > 0 &&
            this.documentHolder &&
            this.currentMenu &&
            this.currentMenu !== this.documentHolder.copyPasteMenu &&
            this.currentMenu !== this.documentHolder.fillMenu &&
            this.currentMenu.isVisible()
          ) {
            this.documentHolder.updateCustomItems(this.currentMenu, data)
          }
        },
      },
      SSE.Controllers.DocumentHolder || {},
    ),
  )
})
