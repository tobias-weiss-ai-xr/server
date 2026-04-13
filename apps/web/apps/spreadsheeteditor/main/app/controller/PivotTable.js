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
 *  PivotTable.js
 *
 *  Created on 06.27.17
 *
 */

define(["core", "spreadsheeteditor/main/app/view/PivotTable"], () => {
  SSE.Controllers.PivotTable = Backbone.Controller.extend(
    _.extend(
      {
        models: [],
        views: ["PivotTable"],
        sdkViewName: "#id_main",

        initialize: function () {
          this.addListeners({
            PivotTable: {
              // comments handlers
              "pivottable:rowscolumns": _.bind(this.onCheckTemplateChange, this),
              "pivottable:create": _.bind(this.onCreateClick, this),
              "pivottable:refresh": _.bind(this.onRefreshClick, this),
              "pivottable:select": _.bind(this.onSelectClick, this),
              "pivottable:calculated": _.bind(this.onCalculatedClick, this),
              "pivottable:expand": _.bind(this.onExpandClick, this),
              "pivottable:collapse": _.bind(this.onCollapseClick, this),
              "pivottable:style": _.bind(this.onPivotStyleSelect, this),
              "pivottable:layout": _.bind(this.onPivotLayout, this),
              "pivottable:blankrows": _.bind(this.onPivotBlankRows, this),
              "pivottable:subtotals": _.bind(this.onPivotSubtotals, this),
              "pivottable:grandtotals": _.bind(this.onPivotGrandTotals, this),
              "pivot:open": _.bind(this.onPivotOpen, this),
            },
            TableDesignTab: {
              "pivottable:create": _.bind(this.onCreateClick, this),
            },
            Toolbar: {
              "tab:active": _.bind(this.onActiveTab, this),
            },
          })
        },
        onLaunch: function () {
          this._state = {
            TableName: "",
            TemplateName: "",
            RowHeader: undefined,
            RowBanded: undefined,
            ColHeader: undefined,
            ColBanded: undefined,
            DisabledControls: false,
          }
          this._originalProps = null

          Common.NotificationCenter.on("app:ready", this.onAppReady.bind(this))
          Common.NotificationCenter.on("api:disconnect", _.bind(this.SetDisabled, this))
          Common.NotificationCenter.on("more:toggle", _.bind(this.onMoreToggle, this))
        },

        setConfig: function (config) {
          this.view = this.createView("PivotTable", {
            toolbar: config.toolbar.toolbar,
          })
        },

        setApi: function (api) {
          if (api) {
            this.api = api
            this.api.asc_registerCallback(
              "asc_onCoAuthoringDisconnect",
              _.bind(this.SetDisabled, this),
            )
            Common.NotificationCenter.on("api:disconnect", _.bind(this.SetDisabled, this))
            this.api.asc_registerCallback(
              "asc_onSendThemeColors",
              _.bind(this.onSendThemeColors, this),
            )
            this.api.asc_registerCallback(
              "asc_onSelectionChanged",
              _.bind(this.onSelectionChanged, this),
            )
            Common.NotificationCenter.on("cells:range", _.bind(this.onCellsRange, this))
          }
          return this
        },

        setMode: function (mode) {
          this.appConfig = mode
          return this
        },

        SetDisabled: function () {
          this.view?.SetDisabled(true)
        },

        // helpers

        onCheckTemplateChange: function (type, value) {
          // this._state[stateName] = undefined;
          // if (this.api)
          //     this.api.asc_changeFormatTableInfo(this._state.TableName, type, value=='checked');
          // for test
          switch (type) {
            case 0:
              this._originalProps
                .asc_getStyleInfo()
                .asc_setShowRowHeaders(this.api, this._originalProps, value === "checked")
              break
            case 1:
              this._originalProps
                .asc_getStyleInfo()
                .asc_setShowColHeaders(this.api, this._originalProps, value === "checked")
              break
            case 2:
              this._originalProps
                .asc_getStyleInfo()
                .asc_setShowRowStripes(this.api, this._originalProps, value === "checked")
              break
            case 3:
              this._originalProps
                .asc_getStyleInfo()
                .asc_setShowColStripes(this.api, this._originalProps, value === "checked")
              break
          }
          Common.NotificationCenter.trigger("edit:complete", this)
        },

        createSheetName: function () {
          const items = []
          let wc = this.api.asc_getWorksheetsCount()
          while (wc--) {
            items.push(this.api.asc_getWorksheetName(wc).toLowerCase())
          }

          let index = 0
          let name
          while (++index < 1000) {
            name = this.strSheet + index
            if (items.indexOf(name.toLowerCase()) < 0) break
          }

          return name
        },

        onCreateClick: function (btn, opts) {
          if (this.api) {
            const options = this.api.asc_getAddPivotTableOptions()
            if (options) {
              new SSE.Views.CreatePivotDialog({
                props: options,
                api: this.api,
                handler: (result, settings) => {
                  if (result === "ok" && settings) {
                    this.view?.fireEvent("insertpivot", this.view)
                    if (settings.destination)
                      this.api.asc_insertPivotExistingWorksheet(
                        settings.source,
                        settings.destination,
                      )
                    else
                      this.api.asc_insertPivotNewWorksheet(settings.source, this.createSheetName())
                  }
                  Common.NotificationCenter.trigger("edit:complete", this)
                },
              }).show()
            }
          }
          Common.NotificationCenter.trigger("edit:complete", this)
        },

        onRefreshClick: function (type) {
          if (this.api) {
            if (type === "current") this._originalProps.asc_refresh(this.api)
            else if (type === "all") this.api.asc_refreshAllPivots()
          }
          Common.NotificationCenter.trigger("edit:complete", this)
        },

        onSelectClick: function (btn, opts) {
          if (this.api) {
            this._originalProps.asc_select(this.api)
          }
          Common.NotificationCenter.trigger("edit:complete", this)
        },

        onCalculatedClick: function (btn, opts) {
          const me = this
          const pivotInfo = this.api.asc_getCellInfo().asc_getPivotTableInfo()
          const pivotFieldIndex = pivotInfo.asc_getFieldIndexByActiveCell()
          const error = pivotInfo.asc_hasTablesErrorForCalculatedItems(pivotFieldIndex)

          function getWarningMessage(error) {
            let message = ""
            switch (error) {
              case Asc.c_oAscError.ID.PivotItemNameNotFound:
                message = me.txtPivotItemNameNotFound
                break
              case Asc.c_oAscError.ID.CalculatedItemInPageField:
                message = me.txtCalculatedItemInPageField
                break
              case Asc.c_oAscError.ID.NotUniqueFieldWithCalculated:
                message = me.txtNotUniqueFieldWithCalculated
                break
              case Asc.c_oAscError.ID.WrongDataFieldSubtotalForCalculatedItems:
                message = me.txtWrongDataFieldSubtotalForCalculatedItems
                break
              case Asc.c_oAscError.ID.PivotFieldCustomSubtotalsWithCalculatedItems:
                message = me.txtPivotFieldCustomSubtotalsWithCalculatedItems
                break
              default:
                message = me.txtCalculatedItemWarningDefault
            }
            return message
          }

          function showWarningDialog(error) {
            Common.UI.warning({
              msg: getWarningMessage(error),
              maxwidth: 600,
            })
          }

          if (error) {
            showWarningDialog(error)
          } else {
            const winList = new SSE.Views.PivotCalculatedItemsDialog({
              api: this.api,
              handlerWarning: (error) => {
                showWarningDialog(error)
              },
              getWarningMessage: getWarningMessage,
            })
            winList.show()
          }
        },

        onExpandClick: function () {
          if (this.api) {
            this._originalProps.asc_setExpandCollapseByActiveCell(this.api, true, true)
          }
          Common.NotificationCenter.trigger("edit:complete", this)
        },

        onCollapseClick: function () {
          if (this.api) {
            this._originalProps.asc_setExpandCollapseByActiveCell(this.api, true, false)
          }
          Common.NotificationCenter.trigger("edit:complete", this)
        },

        onPivotStyleSelect: function (record) {
          if (this.api) {
            this._originalProps
              .asc_getStyleInfo()
              .asc_setName(this.api, this._originalProps, record.get("name"))
          }
          Common.NotificationCenter.trigger("edit:complete", this)
        },

        onPivotBlankRows: function (type) {
          if (this.api) {
            const props = new Asc.CT_pivotTableDefinition()
            props.asc_setInsertBlankRow(type === "insert")
            this._originalProps.asc_set(this.api, props)
          }
          Common.NotificationCenter.trigger("edit:complete", this)
        },

        onPivotLayout: function (type) {
          if (this.api) {
            const props = new Asc.CT_pivotTableDefinition()
            switch (type) {
              case 0:
                props.asc_setCompact(true)
                props.asc_setOutline(true)
                break
              case 1:
                props.asc_setCompact(false)
                props.asc_setOutline(true)
                break
              case 2:
                props.asc_setCompact(false)
                props.asc_setOutline(false)
                break
              case 3:
                props.asc_setFillDownLabelsDefault(true)
                break
              case 4:
                props.asc_setFillDownLabelsDefault(false)
                break
            }
            this._originalProps.asc_set(this.api, props)
          }
          Common.NotificationCenter.trigger("edit:complete", this)
        },

        onPivotGrandTotals: function (type) {
          if (this.api) {
            const props = new Asc.CT_pivotTableDefinition()
            props.asc_setColGrandTotals(type === 1 || type === 2)
            props.asc_setRowGrandTotals(type === 1 || type === 3)
            this._originalProps.asc_set(this.api, props)
          }
          Common.NotificationCenter.trigger("edit:complete", this)
        },

        onPivotSubtotals: function (type) {
          if (this.api) {
            const props = new Asc.CT_pivotTableDefinition()
            switch (type) {
              case 0:
                props.asc_setDefaultSubtotal(false)
                break
              case 1:
                props.asc_setDefaultSubtotal(true)
                props.asc_setSubtotalTop(false)
                break
              case 2:
                props.asc_setDefaultSubtotal(true)
                props.asc_setSubtotalTop(true)
                break
            }
            this._originalProps.asc_set(this.api, props)
          }
          Common.NotificationCenter.trigger("edit:complete", this)
        },

        ChangeSettings: function (props) {
          if (props) {
            this._originalProps = props

            const view = this.view
            let needTablePictures = false
            const styleInfo = props.asc_getStyleInfo()
            let value = styleInfo.asc_getShowRowHeaders()
            if (this._state.RowHeader !== value) {
              view.chRowHeader.setValue(value, true)
              this._state.RowHeader = value
              needTablePictures = true
            }

            value = styleInfo.asc_getShowColHeaders()
            if (this._state.ColHeader !== value) {
              view.chColHeader.setValue(value, true)
              this._state.ColHeader = value
              needTablePictures = true
            }

            value = styleInfo.asc_getShowColStripes()
            if (this._state.ColBanded !== value) {
              view.chColBanded.setValue(value, true)
              this._state.ColBanded = value
              needTablePictures = true
            }

            value = styleInfo.asc_getShowRowStripes()
            if (this._state.RowBanded !== value) {
              view.chRowBanded.setValue(value, true)
              this._state.RowBanded = value
              needTablePictures = true
            }

            value = props.asc_getColGrandTotals()
            if (this._state.ColGrandTotals !== value) {
              this._state.ColGrandTotals = value
              needTablePictures = true
            }

            value = props.asc_getRowGrandTotals()
            if (this._state.RowGrandTotals !== value) {
              this._state.RowGrandTotals = value
              needTablePictures = true
            }

            if (needTablePictures)
              this.onApiInitPivotStyles(this.api.asc_getTablePictures(this._originalProps, true))

            //for table-template
            value = styleInfo.asc_getName()
            if (this._state.TemplateName !== value || this._isTemplatesChanged) {
              view.pivotStyles.suspendEvents()
              const rec = view.pivotStyles.menuPicker.store.findWhere({
                name: value,
              })
              view.pivotStyles.menuPicker.selectRecord(rec)
              view.pivotStyles.resumeEvents()

              if (this._isTemplatesChanged) {
                if (rec)
                  view.pivotStyles.fillComboView(view.pivotStyles.menuPicker.getSelectedRec(), true)
                else view.pivotStyles.fillComboView(view.pivotStyles.menuPicker.store.at(0), true)
              }
              this._state.TemplateName = value
            }
            this._isTemplatesChanged = false
          }
        },

        onSendThemeColors: function () {
          // get new table templates
          if (this.view.pivotStyles && this._originalProps) {
            this.onApiInitPivotStyles(this.api.asc_getTablePictures(this._originalProps, true))
            this.view.pivotStyles.menuPicker.scroller.update({ alwaysVisibleY: true })
          }
        },

        onApiInitPivotStyles: function (Templates) {
          const styles = this.view.pivotStyles
          this._isTemplatesChanged = true
          const count = styles.menuPicker.store.length

          if (count > 0 && count === Templates.length) {
            const data = styles.menuPicker.dataViewItems
            const findDataViewItem = (template) => {
              for (let i = 0; i < data.length; i++) {
                if (
                  data[i].model.get("name") &&
                  data[i].model.get("name") === template.asc_getName()
                )
                  return data[i]
                if (data[i].model.get("caption") === template.asc_getDisplayName()) return data[i]
              }
              return undefined
            }

            data &&
              _.each(Templates, (template, index) => {
                const img = template.asc_getImage()
                const dataViewItem = findDataViewItem(template)
                dataViewItem?.model.set("imageUrl", img, { silent: true })
                dataViewItem && $(dataViewItem.el).find("img").attr("src", img)
              })
            styles.fieldPicker.store.reset(styles.fieldPicker.store.models)
          } else {
            styles.menuPicker.store.reset([])
            let templates = []
            let groups = [
              {
                id: "menu-table-group-custom",
                caption: this.view.txtGroupPivot_Custom,
                templates: [],
              },
              {
                id: "menu-table-group-light",
                caption: this.view.txtGroupPivot_Light,
                templates: [],
              },
              {
                id: "menu-table-group-medium",
                caption: this.view.txtGroupPivot_Medium,
                templates: [],
              },
              { id: "menu-table-group-dark", caption: this.view.txtGroupPivot_Dark, templates: [] },
              { id: "menu-table-group-no-name", caption: "&nbsp", templates: [] },
            ]
            _.each(Templates, (template, index) => {
              let tip = template.asc_getDisplayName()
              let groupItem = ""
              let lastWordInTip = null

              if (template.asc_getType() === 0) {
                let arr = tip.split(" ")
                lastWordInTip = arr.pop()

                if (template.asc_getName() === null) {
                  groupItem = "menu-table-group-light"
                } else {
                  if (arr.length > 0) {
                    groupItem = `menu-table-group-${arr[arr.length - 1].toLowerCase()}`
                  }
                  if (groups.some((item) => item.id === groupItem) === false) {
                    groupItem = "menu-table-group-no-name"
                  }
                }
                arr = `txtTable_${arr.join("")}`
                tip = this.view[arr] ? `${this.view[arr]} ${lastWordInTip}` : tip
                lastWordInTip = Number.parseInt(lastWordInTip)
              } else {
                groupItem = "menu-table-group-custom"
              }
              groups
                .filter((item) => item.id === groupItem)[0]
                .templates.push({
                  id: Common.UI.getId(),
                  name: template.asc_getName(),
                  caption: template.asc_getDisplayName(),
                  type: template.asc_getType(),
                  imageUrl: template.asc_getImage(),
                  group: groupItem,
                  allowSelected: true,
                  selected: false,
                  tip: tip,
                  numInGroup:
                    lastWordInTip != null && !Number.isNaN(lastWordInTip) ? lastWordInTip : null,
                })
            })

            const sortFunc = (a, b) => {
              const aNum = a.numInGroup
              const bNum = b.numInGroup
              return aNum - bNum
            }

            groups[1].templates.sort(sortFunc)
            groups[2].templates.sort(sortFunc)
            groups[3].templates.sort(sortFunc)

            groups = groups.filter((item, index) => item.templates.length > 0)

            groups.forEach((item) => {
              templates = templates.concat(item.templates)
              item.templates = undefined
            })

            styles.groups.reset(groups)
            styles.menuPicker.store.reset(templates)
          }
        },

        onPivotOpen: function () {
          const styles = this.view.pivotStyles
          if (styles?.needFillComboView && styles.menuPicker.store.length > 0 && styles.rendered) {
            let styleRec
            if (this._state.TemplateName)
              styleRec = styles.menuPicker.store.findWhere({ name: this._state.TemplateName })
            styles.fillComboView(styleRec ? styleRec : styles.menuPicker.store.at(0), true)
          }
        },

        onSelectionChanged: function (info) {
          if (this.rangeSelectionMode || !this.appConfig.isEdit || !this.view) return

          const pivotInfo = info.asc_getPivotTableInfo()

          Common.Utils.lockControls(Common.enumLock.noPivot, !pivotInfo, {
            array: this.view.lockedControls,
          })
          Common.Utils.lockControls(
            Common.enumLock.pivotLock,
            pivotInfo && info.asc_getLockedPivotTable() === true,
            { array: this.view.lockedControls },
          )
          Common.Utils.lockControls(Common.enumLock.editPivot, !!pivotInfo, {
            array: this.view.btnsAddPivot,
          })
          Common.Utils.lockControls(
            Common.enumLock.pivotExpandLock,
            !pivotInfo?.asc_canExpandCollapseByActiveCell(this.api),
            { array: [this.view.btnExpandField, this.view.btnCollapseField] },
          )
          Common.Utils.lockControls(
            Common.enumLock.pivotCalcItemsLock,
            !pivotInfo?.asc_canChangeCalculatedItemByActiveCell(),
            { array: [this.view.btnCalculatedItems] },
          )

          if (pivotInfo) this.ChangeSettings(pivotInfo)
        },

        onCellsRange: function (status) {
          this.rangeSelectionMode = status !== Asc.c_oAscSelectionDialogType.None
        },

        createToolbarPanel: function () {
          return this.view.getPanel()
        },

        getView: function (name) {
          return !name && this.view
            ? this.view
            : Backbone.Controller.prototype.getView.call(this, name)
        },

        onAppReady: (config) => {
          new Promise((resolve) => {
            resolve()
          }).then(() => {})
        },

        onMoreToggle: function (btn, state, e) {
          if (this.view?.toolbar?.isTabActive("pivot") && state) {
            const styles = this.view.pivotStyles
            if (
              styles?.needFillComboView &&
              styles.menuPicker.store.length > 0 &&
              styles.rendered
            ) {
              let styleRec
              if (this._state.TemplateName)
                styleRec = styles.menuPicker.store.findWhere({ name: this._state.TemplateName })
              styles.fillComboView(styleRec ? styleRec : styles.menuPicker.store.at(0), true)
            }
          }
        },

        onActiveTab: (tab) => {},

        strSheet: "Sheet",
        txtPivotItemNameNotFound:
          "An item name cannot be found. Check that you've typed name correctly and the item is present in the PivotTable report.",
        txtCalculatedItemInPageField:
          "The item cannot be added or modified. PivotTable report has this field in Filters.",
        txtNotUniqueFieldWithCalculated:
          "If one or more PivotTable have calculated items, no fields can be used in data area two or more times, or in the data area and another area at the same time.",
        txtWrongDataFieldSubtotalForCalculatedItems:
          "Averages, standard deviations, and variances are not supported when a PivotTable report has calculated items.",
        txtPivotFieldCustomSubtotalsWithCalculatedItems:
          "Calculated items do not work with custom subtotals.",
        txtCalculatedItemWarningDefault:
          "No actions with calculated items are allowed for this active cell.",
      },
      SSE.Controllers.PivotTable || {},
    ),
  )
})
