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
 *  DataTab.js
 *
 *  Created on 30.05.2019
 *
 */

define(["core", "spreadsheeteditor/main/app/view/DataTab"], () => {
  SSE.Controllers.DataTab = Backbone.Controller.extend(
    _.extend(
      {
        models: [],
        collections: [],
        views: ["DataTab"],
        sdkViewName: "#id_main",

        initialize: function () {
          this._state = {
            CSVOptions: new Asc.asc_CTextOptions(0, 4, ""),
          }
        },
        onLaunch: () => {},

        setApi: function (api) {
          if (api) {
            this.api = api
            this.api.asc_registerCallback(
              "asc_onSelectionChanged",
              _.bind(this.onSelectionChanged, this),
            )
            this.api.asc_registerCallback(
              "asc_onWorksheetLocked",
              _.bind(this.onWorksheetLocked, this),
            )
            this.api.asc_registerCallback(
              "asc_onChangeProtectWorkbook",
              _.bind(this.onChangeProtectWorkbook, this),
            )
            this.api.asc_registerCallback(
              "asc_onGoalSeekUpdate",
              _.bind(this.onUpdateGoalSeekStatus, this),
            )
            this.api.asc_registerCallback(
              "asc_onCoAuthoringDisconnect",
              _.bind(this.onCoAuthoringDisconnect, this),
            )
            this.api.asc_registerCallback(
              "asc_onSolverResultDlgOpen",
              _.bind(this.onSolverResultDlgOpen, this),
            )
            this.api.asc_registerCallback(
              "asc_onSolverTrialDlgOpen",
              _.bind(this.onSolverTrialDlgOpen, this),
            )
            Common.NotificationCenter.on(
              "api:disconnect",
              _.bind(this.onCoAuthoringDisconnect, this),
            )
            Common.NotificationCenter.on("protect:wslock", _.bind(this.onChangeProtectSheet, this))
            Common.NotificationCenter.on("document:ready", _.bind(this.onDocumentReady, this))
          }
          return this
        },

        setConfig: function (config) {
          this.toolbar = config.toolbar
          this.view = this.createView("DataTab", {
            toolbar: this.toolbar.toolbar,
          })
          this.addListeners({
            DataTab: {
              "data:group": this.onGroup,
              "data:ungroup": this.onUngroup,
              "data:tocolumns": this.onTextToColumn,
              "data:show": this.onShowClick,
              "data:hide": this.onHideClick,
              "data:groupsettings": this.onGroupSettings,
              "data:sortcustom": this.onCustomSort,
              "data:remduplicates": this.onRemoveDuplicates,
              "data:datavalidation": this.onDataValidation,
              "data:fromtext": this.onDataFromText,
              "data:goalseek": this.onGoalSeek,
              "data:solver": this.onSolver,
            },
            Statusbar: {
              "sheet:changed": this.onApiSheetChanged,
            },
          })
          Common.NotificationCenter.on("data:remduplicates", _.bind(this.onRemoveDuplicates, this))
          Common.NotificationCenter.on("data:sortcustom", _.bind(this.onCustomSort, this))
        },

        SetDisabled: function (state) {
          this.view?.SetDisabled(state)
        },

        getView: function (name) {
          return !name && this.view
            ? this.view
            : Backbone.Controller.prototype.getView.call(this, name)
        },

        onCoAuthoringDisconnect: function () {
          this.SetDisabled(true)
        },

        onSelectionChanged: function (info) {
          if (!this.toolbar.editMode || !this.view) return

          const view = this.view
          // special disable conditions
          Common.Utils.lockControls(
            Common.enumLock.multiselectCols,
            info.asc_getSelectedColsCount() > 1,
            { array: [view.btnTextToColumns] },
          )
          Common.Utils.lockControls(Common.enumLock.multiselect, info.asc_getMultiselect(), {
            array: [view.btnTextToColumns],
          })
          Common.Utils.lockControls(Common.enumLock.userProtected, info.asc_getUserProtected(), {
            array: view.lockedControls,
          })
        },

        onUngroup: function (type) {
          if (type === "rows") {
            this.api.asc_checkAddGroup(true) !== undefined && this.api.asc_ungroup(true)
          } else if (type === "columns") {
            this.api.asc_checkAddGroup(true) !== undefined && this.api.asc_ungroup(false)
          } else if (type === "clear") {
            this.api.asc_clearOutline()
          } else {
            const val = this.api.asc_checkAddGroup(true)
            if (val === null) {
              new Common.Views.OptionsDialog({
                title: this.view.capBtnUngroup,
                items: [
                  { caption: this.textRows, value: true, checked: true },
                  { caption: this.textColumns, value: false, checked: false },
                ],
                handler: (dlg, result) => {
                  if (result === "ok") {
                    this.api.asc_ungroup(dlg.getSettings())
                  }
                  Common.NotificationCenter.trigger("edit:complete", this.toolbar)
                },
              }).show()
            } else if (val !== undefined)
              //undefined - error, true - rows, false - columns
              this.api.asc_ungroup(val)
          }
          Common.NotificationCenter.trigger("edit:complete", this.toolbar)
        },

        onGroup: function (type, checked) {
          if (type === "rows") {
            this.api.asc_checkAddGroup() !== undefined && this.api.asc_group(true)
          } else if (type === "columns") {
            this.api.asc_checkAddGroup() !== undefined && this.api.asc_group(false)
          } else if (type === "below") {
            this.api.asc_setGroupSummary(checked, false)
          } else if (type === "right") {
            this.api.asc_setGroupSummary(checked, true)
          } else {
            const val = this.api.asc_checkAddGroup()
            if (val === null) {
              new Common.Views.OptionsDialog({
                title: this.view.capBtnGroup,
                items: [
                  { caption: this.textRows, value: true, checked: true },
                  { caption: this.textColumns, value: false, checked: false },
                ],
                handler: (dlg, result) => {
                  if (result === "ok") {
                    this.api.asc_group(dlg.getSettings())
                  }
                  Common.NotificationCenter.trigger("edit:complete", this.toolbar)
                },
              }).show()
            } else if (val !== undefined)
              //undefined - error, true - rows, false - columns
              this.api.asc_group(val)
          }
          Common.NotificationCenter.trigger("edit:complete", this.toolbar)
        },

        onGroupSettings: function (menu) {
          let value = this.api.asc_getGroupSummaryBelow()
          menu.items[3].setChecked(!!value, true)
          value = this.api.asc_getGroupSummaryRight()
          menu.items[4].setChecked(!!value, true)
        },

        onTextToColumn: function () {
          this.api.asc_TextImport(
            this._state.CSVOptions.asc_getCodePage(),
            _.bind(this.onTextToColumnCallback, this),
            false,
          )
        },

        onTextToColumnCallback: function (data) {
          if (!data || !data.length) return
          new Common.Views.OpenDialog({
            title: this.textWizard,
            closable: true,
            type: Common.Utils.importTextType.Columns,
            preview: true,
            previewData: data,
            settings: this._state.CSVOptions,
            api: this.api,
            handler: (result, settings) => {
              if (result === "ok" && this.api) {
                this.api.asc_TextToColumns(settings.textOptions)
              }
            },
          }).show()
        },

        onDataFromText: function (type) {
          if (type === "file") {
            if (this.api)
              this.api.asc_TextFromFileOrUrl(
                this._state.CSVOptions,
                _.bind(this.onDataFromTextCallback, this),
              )

            Common.NotificationCenter.trigger("edit:complete", this.toolbar)
          } else if (type === "url") {
            new Common.Views.ImageFromUrlDialog({
              label: this.txtUrlTitle,
              handler: (result, value) => {
                if (result === "ok") {
                  if (this.api) {
                    const checkUrl = value.replace(/\s/g, "")
                    if (!_.isEmpty(checkUrl)) {
                      this.api.asc_TextFromFileOrUrl(
                        this._state.CSVOptions,
                        _.bind(this.onDataFromTextCallback, this),
                        checkUrl,
                      )
                    } else {
                      Common.UI.warning({
                        msg: this.textEmptyUrl,
                      })
                    }
                  }

                  Common.NotificationCenter.trigger("edit:complete", this.toolbar)
                }
              },
            }).show()
          } else if (type === "storage") {
            // Common.NotificationCenter.trigger('storage:data-load', 'add');
          } else if (type === "xml") {
            Common.Utils.InternalSettings.set("import-xml-start", true)
            this.api?.asc_ImportXmlStart(_.bind(this.onDataFromXMLCallback, this))
          }
        },

        onDataFromTextCallback: function (advOptions) {
          new Common.Views.OpenDialog({
            title: this.txtImportWizard,
            closable: true,
            type: Common.Utils.importTextType.Data,
            preview: advOptions.asc_getData(),
            settings: advOptions ? advOptions.asc_getRecommendedSettings() : this._state.CSVOptions,
            codepages: advOptions ? advOptions.asc_getCodePages() : null,
            api: this.api,
            handler: (result, settings) => {
              if (result === "ok" && this.api) {
                this.api.asc_TextToColumns(settings.textOptions, settings.data, settings.range)
              }
            },
          }).show()
        },

        onDataFromXMLCallback: function (fileContent) {
          setTimeout(() => {
            Common.Utils.InternalSettings.set("import-xml-start", false)
          }, 500)

          if (!fileContent) return
          new SSE.Views.ImportFromXmlDialog({
            api: this.api,
            handler: (result, settings) => {
              if (result === "ok" && settings) {
                if (settings.destination)
                  this.api.asc_ImportXmlEnd(
                    fileContent,
                    settings.destination,
                    this.api.asc_getWorksheetName(this.api.asc_getActiveWorksheetIndex()),
                  )
                else this.api.asc_ImportXmlEnd(fileContent, null, this.createSheetName())
              }
              Common.NotificationCenter.trigger("edit:complete", this)
            },
          }).show()
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

        onShowClick: function () {
          this.api.asc_changeGroupDetails(true)
        },

        onHideClick: function () {
          this.api.asc_changeGroupDetails(false)
        },

        onCustomSort: function () {
          Common.NotificationCenter.trigger("protect:check", this.onCustomSortCallback, this)
        },

        onCustomSortCallback: function () {
          if (this.api) {
            const res = this.api.asc_sortCellsRangeExpand()
            switch (res) {
              case Asc.c_oAscSelectionSortExpand.showExpandMessage: {
                const config = {
                  width: 500,
                  title: this.toolbar.txtSorting,
                  msg: this.toolbar.txtExpandSort,
                  buttons: [
                    { caption: this.toolbar.txtExpand, primary: true, value: "expand" },
                    { caption: this.toolbar.txtSortSelected, value: "sort" },
                    "cancel",
                  ],
                  callback: (btn) => {
                    if (btn === "expand" || btn === "sort") {
                      setTimeout(() => {
                        this.showCustomSort(btn === "expand")
                      }, 1)
                    }
                  },
                }
                Common.UI.alert(config)
                break
              }
              case Asc.c_oAscSelectionSortExpand.showLockMessage: {
                const config = {
                  width: 500,
                  title: this.toolbar.txtSorting,
                  msg: this.toolbar.txtLockSort,
                  buttons: ["yes", "no"],
                  primary: "yes",
                  callback: (btn) => {
                    btn === "yes" &&
                      setTimeout(() => {
                        this.showCustomSort(false)
                      }, 1)
                  },
                }
                Common.UI.alert(config)
                break
              }
              case Asc.c_oAscSelectionSortExpand.expandAndNotShowMessage:
              case Asc.c_oAscSelectionSortExpand.notExpandAndNotShowMessage:
                this.showCustomSort(res === Asc.c_oAscSelectionSortExpand.expandAndNotShowMessage)
                break
            }
          }
        },

        showCustomSort: function (expand) {
          if (this.api.asc_getCellInfo().asc_getPivotTableInfo()) {
            const info = this.api.asc_getPivotInfo()
            if (info) {
              const dlgSort = new SSE.Views.SortFilterDialog({ api: this.api }).on({
                close: () => {
                  Common.NotificationCenter.trigger("edit:complete")
                },
              })
              dlgSort.setSettings({
                filter: info.asc_getFilter(),
                rowFilter: info.asc_getFilterRow(),
                colFilter: info.asc_getFilterCol(),
              })
              dlgSort.show()
            }
          } else {
            const props = this.api.asc_getSortProps(expand)
            // props = new Asc.CSortProperties();
            if (props) {
              new SSE.Views.SortDialog({
                props: props,
                api: this.api,
                handler: (result, settings) => {
                  if (this?.api) {
                    this.api.asc_setSortProps(settings, result !== "ok")
                  }
                },
              }).show()
            }
          }
        },

        onRemoveDuplicates: function () {
          if (this.api) {
            const res = this.api.asc_sortCellsRangeExpand()
            if (res === Asc.c_oAscSelectionSortExpand.showExpandMessage) {
              const config = {
                width: 500,
                title: this.txtRemDuplicates,
                msg: this.txtExpandRemDuplicates,
                buttons: [
                  { caption: this.txtExpand, primary: true, value: "expand" },
                  { caption: this.txtRemSelected, value: "remove" },
                  "cancel",
                ],
                callback: (btn) => {
                  if (btn === "expand" || btn === "remove") {
                    setTimeout(() => {
                      this.showRemDuplicates(btn === "expand")
                    }, 1)
                  }
                },
              }
              Common.UI.alert(config)
            } else if (res !== Asc.c_oAscSelectionSortExpand.showLockMessage)
              this.showRemDuplicates(res === Asc.c_oAscSelectionSortExpand.expandAndNotShowMessage)
          }
        },

        showRemDuplicates: function (expand) {
          const props = this.api.asc_getRemoveDuplicates(expand)
          if (props) {
            new SSE.Views.RemoveDuplicatesDialog({
              props: props,
              api: this.api,
              handler: (result, settings) => {
                if (this?.api) {
                  this.api.asc_setRemoveDuplicates(settings, result !== "ok")
                }
              },
            }).show()
          }
        },

        onDataValidation: function () {
          if (this.api) {
            const res = this.api.asc_getDataValidationProps()
            if (typeof res !== "object") {
              const config = {
                maxwidth: 500,
                title: this.txtDataValidation,
                msg:
                  res === Asc.c_oAscError.ID.MoreOneTypeDataValidate
                    ? this.txtRemoveDataValidation
                    : this.txtExtendDataValidation,
                buttons:
                  res === Asc.c_oAscError.ID.MoreOneTypeDataValidate
                    ? ["ok", "cancel"]
                    : ["yes", "no", "cancel"],
                primary: res === Asc.c_oAscError.ID.MoreOneTypeDataValidate ? "ok" : ["yes", "no"],
                callback: (btn) => {
                  if (btn === "yes" || btn === "no" || btn === "ok") {
                    setTimeout(() => {
                      const props = this.api.asc_getDataValidationProps(
                        btn === "ok" ? null : btn === "yes",
                      )
                      this.showDataValidation(props)
                    }, 1)
                  }
                },
              }
              Common.UI.alert(config)
            } else this.showDataValidation(res)
          }
        },

        showDataValidation: function (props) {
          if (props) {
            new SSE.Views.DataValidationDialog({
              title: this.txtDataValidation,
              props: props,
              api: this.api,
              handler: (result, settings) => {
                if (this?.api && result === "ok") {
                  this.api.asc_setDataValidation(settings)
                }
              },
            }).show()
          }
        },

        onGoalSeek: function () {
          new SSE.Views.GoalSeekDlg({
            api: this.api,
            handler: (result, settings) => {
              if (result === "ok" && settings) {
                this.api.asc_StartGoalSeek(
                  settings.formulaCell,
                  settings.expectedValue,
                  settings.changingCell,
                )
              }
              Common.NotificationCenter.trigger("edit:complete")
            },
          }).show()
        },

        onSolver: function () {
          let res
          new SSE.Views.SolverDlg({
            api: this.api,
            lang: this.toolbar.mode.lang,
            props: this.api.asc_GetSolverParams(),
            handler: (result, settings) => {
              res = result
              if (result === "ok" && settings) {
                this.api.asc_StartSolver(settings)
              }
              Common.NotificationCenter.trigger("edit:complete")
            },
          })
            .on("close", () => {
              if (res !== "ok") this.api.asc_CloseSolver(false)
            })
            .show()
        },

        onSolverResultDlgOpen: function (id) {
          let keepSolution = false
          let openParams = false
          const win = new SSE.Views.SolverResultsDlg({
            handler: (dlg, result) => {
              if (result === "ok") {
                const settings = dlg.getSettings()
                keepSolution = settings.keepSolution
                openParams = settings.openParams
              }
            },
          }).on("close", () => {
            this.api.asc_CloseSolver(keepSolution)
            openParams ? this.onSolver() : Common.NotificationCenter.trigger("edit:complete")
          })
          win.show()
          win.setSettings(id)
        },

        onSolverTrialDlgOpen: function (id) {
          let msg
          switch (id) {
            case AscCommonExcel.c_oAscResultStatus.maxIterationsReached:
              msg = this.txtMaxIterations
              break
            case AscCommonExcel.c_oAscResultStatus.maxTimeReached:
              msg = this.txtMaxTime
              break
            case AscCommonExcel.c_oAscResultStatus.maxFeasibleSolutionReached:
              msg = this.txtMaxFeasible
              break
            case AscCommonExcel.c_oAscResultStatus.maxSubproblemSolutionReached:
              msg = this.txtMaxSubproblem
              break
          }
          msg &&
            Common.UI.alert({
              title: this.txtTrialSolution,
              msg: msg,
              buttons: [
                {
                  value: "ok",
                  caption: this.txtContinue,
                },
                {
                  value: "cancel",
                  caption: this.txtStop,
                },
              ],
              primary: "ok",
              callback: (btn) => {
                btn === "cancel" ? this.api.asc_StopSolver() : this.api.asc_ContinueSolver()
              },
            })
        },

        onUpdateGoalSeekStatus: function (targetValue, currentValue, iteration, cellName) {
          if (!this.GoalSeekStatusDlg) {
            this.GoalSeekStatusDlg = new SSE.Views.GoalSeekStatusDlg({
              api: this.api,
              handler: (result) => {
                this.api.asc_CloseGoalClose(result === "ok")
                this.GoalSeekStatusDlg = undefined
                Common.NotificationCenter.trigger("edit:complete")
              },
            })
            this.GoalSeekStatusDlg.on("close", () => {
              if (this.GoalSeekStatusDlg !== undefined) {
                this.api.asc_CloseGoalClose(false)
                this.GoalSeekStatusDlg = undefined
              }
            })
            this.GoalSeekStatusDlg.show()
          }
          this.GoalSeekStatusDlg.setSettings({
            targetValue: targetValue,
            currentValue: currentValue,
            iteration: iteration,
            cellName: cellName,
          })
        },

        onWorksheetLocked: function (index, locked) {
          if (index === this.api.asc_getActiveWorksheetIndex()) {
            Common.Utils.lockControls(Common.enumLock.sheetLock, locked, {
              array: this.view.btnsSortDown.concat(
                this.view.btnsSortUp,
                this.view.btnCustomSort,
                this.view.btnGroup,
                this.view.btnUngroup,
              ),
            })
          }
        },

        onChangeProtectWorkbook: function () {
          Common.Utils.lockControls(Common.enumLock.wbLock, this.api.asc_isProtectedWorkbook(), {
            array: [this.view.btnDataFromText, this.view.btnExternalLinks],
          })
        },

        onApiSheetChanged: function () {
          if (
            !this.toolbar.mode ||
            !this.toolbar.mode.isEdit ||
            this.toolbar.mode.isEditDiagram ||
            this.toolbar.mode.isEditMailMerge ||
            this.toolbar.mode.isEditOle
          )
            return

          const currentSheet = this.api.asc_getActiveWorksheetIndex()
          this.onWorksheetLocked(
            currentSheet,
            this.api.asc_isWorksheetLockedOrDeleted(currentSheet),
          )
        },

        onChangeProtectSheet: function (props) {
          if (!props) {
            const wbprotect = this.getApplication().getController("WBProtection")
            props = wbprotect ? wbprotect.getWSProps() : null
          }
          props?.wsProps &&
            Common.Utils.lockControls(Common.enumLock.Sort, props.wsProps.Sort, {
              array: this.view.btnsSortDown.concat(this.view.btnsSortUp, this.view.btnCustomSort),
            })
        },

        onDocumentReady: function () {
          this.onChangeProtectSheet()
        },

        textWizard: "Text to Columns Wizard",
        txtRemDuplicates: "Remove Duplicates",
        txtExpandRemDuplicates:
          "The data next to the selection will not be removed. Do you want to expand the selection to include the adjacent data or continue with the currently selected cells only?",
        txtExpand: "Expand",
        txtRemSelected: "Remove in selected",
        textRows: "Rows",
        textColumns: "Columns",
        txtDataValidation: "Data Validation",
        txtExtendDataValidation:
          "The selection contains some cells without Data Validation settings.<br>Do you want to extend Data Validation to these cells?",
        txtRemoveDataValidation:
          "The selection contains more than one type of validation.<br>Erase current settings and continue?",
        textEmptyUrl: "You need to specify URL.",
        txtImportWizard: "Text Import Wizard",
        txtUrlTitle: "Paste a data URL",
        txtErrorExternalLink: "Error: updating is failed",
        strSheet: "Sheet",
        textAddExternalData:
          "The link to an external source has been added. You can update such links in the Data tab.",
      },
      SSE.Controllers.DataTab || {},
    ),
  )
})
