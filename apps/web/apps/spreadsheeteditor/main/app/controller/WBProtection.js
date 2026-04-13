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
 *  WBProtection.js
 *
 *  Created on 21.06.2021
 *
 */
define([
  "core",
  "common/main/lib/view/Protection",
  "spreadsheeteditor/main/app/view/WBProtection",
], () => {
  SSE.Controllers.WBProtection = Backbone.Controller.extend(
    _.extend(
      {
        models: [],
        collections: [],
        views: ["WBProtection"],
        sdkViewName: "#id_main",

        initialize: function () {
          this.addListeners({
            WBProtection: {
              "protect:workbook": _.bind(this.onWorkbookClick, this),
              "protect:sheet": _.bind(this.onSheetClick, this),
              "protect:allow-ranges": _.bind(this.onAllowRangesClick, this),
              "protect:lock-options": _.bind(this.onLockOptionClick, this),
              "protect:range": _.bind(this.onProtectRangeClick, this),
            },
          })
        },
        onLaunch: function () {
          this._state = {}
          this.wsLockOptions = [
            "SelectLockedCells",
            "SelectUnlockedCells",
            "FormatCells",
            "FormatColumns",
            "FormatRows",
            "InsertColumns",
            "InsertRows",
            "InsertHyperlinks",
            "DeleteColumns",
            "DeleteRows",
            "Sort",
            "AutoFilter",
            "PivotTables",
            "Objects",
            "Scenarios",
          ]
          Common.enumLock &&
            this.wsLockOptions.forEach((item) => {
              Common.enumLock[item] = item
            })

          Common.NotificationCenter.on("app:ready", this.onAppReady.bind(this))
          Common.NotificationCenter.on("protect:sheet", _.bind(this.onSheetClick, this))
        },
        setConfig: function (data, api) {
          this.setApi(api)

          if (data) {
            this.sdkViewName = data.sdkviewname || this.sdkViewName
          }
        },
        setApi: function (api) {
          if (api) {
            this.api = api
            this.api.asc_registerCallback(
              "asc_onChangeProtectWorkbook",
              _.bind(this.onChangeProtectWorkbook, this),
            )
            this.api.asc_registerCallback(
              "asc_onChangeProtectWorksheet",
              _.bind(this.onChangeProtectSheet, this),
            )
            this.api.asc_registerCallback(
              "asc_onActiveSheetChanged",
              _.bind(this.onActiveSheetChanged, this),
            )
            this.api.asc_registerCallback(
              "asc_onSelectionChanged",
              _.bind(this.onApiSelectionChanged, this),
            )
          }
        },

        setMode: function (mode) {
          this.appConfig = mode

          this.appConfig.isEdit &&
            this.appConfig.canProtect &&
            (this.view = this.createView("WBProtection", {
              mode: mode,
            }))

          return this
        },

        createToolbarPanel: function () {
          if (this.view) return this.view.getPanel()
        },

        getView: function (name) {
          return !name && this.view
            ? this.view
            : Backbone.Controller.prototype.getView.call(this, name)
        },

        onWorkbookClick: function (state) {
          this.view.btnProtectWB.toggle(!state, true)
          if (state) {
            let btn
            const win = new SSE.Views.ProtectDialog({
              type: "workbook",
              handler: (result, value) => {
                btn = result
                if (result === "ok") {
                  const props = this.api.asc_getProtectedWorkbook()
                  props.asc_setLockStructure(value)
                  this.api.asc_setProtectedWorkbook(props)
                }
                Common.NotificationCenter.trigger("edit:complete")
              },
            }).on("close", () => {
              if (btn !== "ok") this.view.btnProtectWB.toggle(false, true)
            })

            win.show()
          } else {
            let btn
            const props = this.api.asc_getProtectedWorkbook()
            if (props.asc_isPassword()) {
              const win = new Common.Views.OpenDialog({
                title: this.view.txtWBUnlockTitle,
                closable: true,
                type: Common.Utils.importTextType.DRM,
                txtOpenFile: this.view.txtWBUnlockDescription,
                validatePwd: false,
                handler: (result, value) => {
                  btn = result
                  if (result === "ok") {
                    if (this.api) {
                      props.asc_setLockStructure(
                        value?.drmOptions ? value.drmOptions.asc_getPassword() : undefined,
                      )
                      this.api.asc_setProtectedWorkbook(props)
                    }
                    Common.NotificationCenter.trigger("edit:complete")
                  }
                },
              }).on("close", () => {
                if (btn !== "ok") this.view.btnProtectWB.toggle(true, true)
              })

              win.show()
            } else {
              props.asc_setLockStructure()
              this.api.asc_setProtectedWorkbook(props)
            }
          }
        },

        onSheetClick: function (state) {
          this.view.btnProtectSheet.toggle(!state, true)
          if (state) {
            let btn
            const props = this.api.asc_getProtectedSheet()
            const win = new SSE.Views.ProtectDialog({
              type: "sheet",
              props: props,
              api: this.api,
              handler: (result, value, props) => {
                btn = result
                if (result === "ok") {
                  props.asc_setSheet(value)
                  this.api.asc_setProtectedSheet(props)
                }
                Common.NotificationCenter.trigger("edit:complete")
              },
            }).on("close", () => {
              if (btn !== "ok") this.view.btnProtectSheet.toggle(false, true)
            })

            win.show()
          } else {
            let btn
            const props = this.api.asc_getProtectedSheet()
            if (props.asc_isPassword()) {
              const win = new Common.Views.OpenDialog({
                title: this.view.txtSheetUnlockTitle,
                closable: true,
                type: Common.Utils.importTextType.DRM,
                txtOpenFile: this.view.txtSheetUnlockDescription,
                validatePwd: false,
                handler: (result, value) => {
                  btn = result
                  if (result === "ok") {
                    if (this.api) {
                      props.asc_setSheet(
                        value?.drmOptions ? value.drmOptions.asc_getPassword() : undefined,
                      )
                      this.api.asc_setProtectedSheet(props)
                    }
                    Common.NotificationCenter.trigger("edit:complete")
                  }
                },
              }).on("close", () => {
                if (btn !== "ok") this.view.btnProtectSheet.toggle(true, true)
              })

              win.show()
            } else {
              props.asc_setSheet()
              this.api.asc_setProtectedSheet(props)
            }
          }
        },

        onAllowRangesClick: function () {
          const props = this.api.asc_getProtectedRanges()
          const win = new SSE.Views.ProtectRangesDlg({
            api: this.api,
            props: props,
            handler: (result, settings) => {
              if (result === "protect-sheet") {
                this.api.asc_setProtectedRanges(settings.arr, settings.deletedArr)
                this.onSheetClick(true)
              } else if (result === "ok") {
                this.api.asc_setProtectedRanges(settings.arr, settings.deletedArr)
              }
              Common.NotificationCenter.trigger("edit:complete")
            },
          })

          win.show()
        },

        onLockOptionClick: function (type, value) {
          switch (type) {
            case 0: // cell
              this.api.asc_setCellLocked(value === "checked")
              break
            case 1: {
              // shape
              const props = new Asc.asc_CImgProperty()
              props.asc_putProtectionLocked(value === "checked")
              this.api.asc_setGraphicObjectProps(props)
              break
            }
            case 2: {
              // text
              const props = new Asc.asc_CImgProperty()
              props.asc_putProtectionLockText(value === "checked")
              this.api.asc_setGraphicObjectProps(props)
              break
            }
            case 3: // formula
              this.api.asc_setCellHiddenFormulas(value === "checked")
              break
          }
          Common.NotificationCenter.trigger("edit:complete", this)
        },

        onProtectRangeClick: function () {
          const win = new SSE.Views.ProtectedRangesManagerDlg({
            api: this.api,
            canRequestUsers: this.appConfig.canRequestUsers,
            currentUser: this.appConfig.user,
            handler: (result, settings) => {
              Common.NotificationCenter.trigger("edit:complete")
            },
          })

          win.show()
        },

        onAppReady: function (config) {
          if (!this.view) return
          new Promise((resolve) => {
            resolve()
          }).then(() => {
            this.view.btnProtectWB.toggle(this.api.asc_isProtectedWorkbook(), true)

            const props = this.getWSProps()
            if (props) {
              this.view.btnProtectSheet.toggle(props.wsLock, true) //current sheet
              Common.Utils.lockControls(Common.enumLock.Objects, props.wsProps.Objects, {
                array: [this.view.chLockedText, this.view.chLockedShape],
              })
              Common.Utils.lockControls(Common.enumLock.wsLock, props.wsLock, {
                array: [this.view.btnAllowRanges],
              })
            }
          })
        },

        onChangeProtectWorkbook: function () {
          this.view?.btnProtectWB.toggle(this.api.asc_isProtectedWorkbook(), true)
        },

        onChangeProtectSheet: function () {
          const props = this.getWSProps(true)

          if (this.view && props) {
            this.view.btnProtectSheet.toggle(props.wsLock, true) //current sheet
            Common.Utils.lockControls(Common.enumLock.Objects, props.wsProps.Objects, {
              array: [this.view.chLockedText, this.view.chLockedShape],
            })
            Common.Utils.lockControls(Common.enumLock.wsLock, props.wsLock, {
              array: [this.view.btnAllowRanges],
            })
          }
          Common.NotificationCenter.trigger("protect:wslock", props)
        },

        onActiveSheetChanged: function () {
          this.onChangeProtectSheet() //current sheet
        },

        getWSProps: function (update) {
          if (!this.appConfig || (!this.appConfig.isEdit && !this.appConfig.isRestrictedEdit))
            return

          if (update || !this._state.protection) {
            const wsProtected = !!this.api.asc_isProtectedSheet()
            let arr = []
            if (wsProtected) {
              arr = []
              const props = this.api.asc_getProtectedSheet()
              props &&
                this.wsLockOptions.forEach((item) => {
                  arr[item] = props[`asc_get${item}`] ? props[`asc_get${item}`]() : false
                })
            } else {
              this.wsLockOptions.forEach((item) => {
                arr[item] = false
              })
            }
            this._state.protection = { wsLock: wsProtected, wsProps: arr }
          }

          return this._state.protection
        },

        onApiSelectionChanged: function (info) {
          if (!this.view || !info) return
          if ($(".asc-window.enable-key-events:visible").length > 0) return

          const selectionType = info.asc_getSelectionType()
          const need_disable =
            selectionType === Asc.c_oAscSelectionType.RangeCells ||
            selectionType === Asc.c_oAscSelectionType.RangeCol ||
            selectionType === Asc.c_oAscSelectionType.RangeRow ||
            selectionType === Asc.c_oAscSelectionType.RangeMax
          Common.Utils.lockControls(Common.enumLock.selRange, need_disable, {
            array: [this.view.chLockedText, this.view.chLockedShape],
          })

          const xfs = info.asc_getXfs()
          this.view.chLockedCell.setValue(!!xfs.asc_getLocked(), true)
          this.view.chHiddenFormula.setValue(!!xfs.asc_getHidden(), true)

          if (
            selectionType === Asc.c_oAscSelectionType.RangeSlicer ||
            selectionType === Asc.c_oAscSelectionType.RangeImage ||
            selectionType === Asc.c_oAscSelectionType.RangeShape ||
            selectionType === Asc.c_oAscSelectionType.RangeShapeText ||
            selectionType === Asc.c_oAscSelectionType.RangeChart ||
            selectionType === Asc.c_oAscSelectionType.RangeChartText
          ) {
            const selectedObjects = this.api.asc_getGraphicObjectProps()
            for (let i = 0; i < selectedObjects.length; i++) {
              if (selectedObjects[i].asc_getObjectType() === Asc.c_oAscTypeSelectElement.Image) {
                const elValue = selectedObjects[i].asc_getObjectValue()
                const locktext = elValue.asc_getProtectionLockText()
                const lock = elValue.asc_getProtectionLocked()
                this.view.chLockedText.setValue(
                  locktext !== undefined ? !!locktext : "indeterminate",
                  true,
                )
                this.view.chLockedShape.setValue(
                  lock !== undefined ? !!lock : "indeterminate",
                  true,
                )
                Common.Utils.lockControls(Common.enumLock.wsLockText, locktext === null, {
                  array: [this.view.chLockedText],
                })
                Common.Utils.lockControls(Common.enumLock.wsLockShape, lock === null, {
                  array: [this.view.chLockedShape],
                })
                break
              }
            }
          }
          Common.Utils.lockControls(Common.enumLock.userProtected, !!info.asc_getUserProtected(), {
            array: [this.view.chLockedCell, this.view.chHiddenFormula],
          })
        },
      },
      SSE.Controllers.WBProtection || {},
    ),
  )
})
