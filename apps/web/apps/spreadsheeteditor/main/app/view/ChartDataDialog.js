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
 *  ChartDataDialog.js
 *
 *  Created on 06.07.2020
 *
 */

define(["common/main/lib/view/AdvancedSettingsWindow"], () => {
  SSE.Views.ChartDataDialog = Common.Views.AdvancedSettingsWindow.extend(
    _.extend(
      {
        options: {
          contentWidth: 370,
          id: "window-chart-data",
        },

        initialize: function (options) {
          _.extend(
            this.options,
            {
              title: this.textTitle,
              contentStyle: "padding: 5px 5px 0;",
              contentTemplate: _.template(
                [
                  '<div class="settings-panel active">',
                  '<div class="inner-content">',
                  '<table cols="1" style="width: 100%;">',
                  "<tr>",
                  "<td>",
                  '<label class="input-label">',
                  this.textData,
                  "</label>",
                  "</td>",
                  "</tr>",
                  "<tr>",
                  '<td class="padding-small" width="200">',
                  '<div id="chart-dlg-txt-range" class="input-row" style=""></div>',
                  "</td>",
                  "</tr>",
                  "<tr>",
                  '<td class="padding-small">',
                  '<label class="input-label">',
                  this.textSeries,
                  "</label>",
                  '<div id="chart-dlg-series-list" class="" style="width:100%; height: 93px;"></div>',
                  "</td>",
                  "</tr>",
                  "<tr>",
                  '<td class="padding-large">',
                  '<button type="button" class="btn btn-text-default auto margin-right-5" id="chart-dlg-btn-add">',
                  this.textAdd,
                  "</button>",
                  '<button type="button" class="btn btn-text-default auto margin-right-5" id="chart-dlg-btn-edit">',
                  this.textEdit,
                  "</button>",
                  '<button type="button" class="btn btn-text-default auto margin-right-5" id="chart-dlg-btn-delete">',
                  this.textDelete,
                  "</button>",
                  '<div class="up-down-btns float-right">',
                  '<div id="chart-dlg-btn-up" class="margin-right-2"></div>',
                  '<div id="chart-dlg-btn-down"></div>',
                  "</div>",
                  "</td>",
                  "</tr>",
                  "<tr>",
                  '<td class="padding-large">',
                  '<button type="button" class="btn btn-text-default auto margin-right-5" id="chart-dlg-btn-switch" style="min-width: 70px;">',
                  this.textSwitch,
                  "</button>",
                  "</td>",
                  "</tr>",
                  "<tr>",
                  '<td class="padding-small">',
                  '<label class="input-label">',
                  this.textCategory,
                  "</label>",
                  '<div id="chart-dlg-category-list" class="" style="width:100%; height: 93px;"></div>',
                  "</td>",
                  "</tr>",
                  "<tr>",
                  '<td class="padding-large">',
                  '<button type="button" class="btn btn-text-default auto margin-right-5" id="chart-dlg-btn-category-edit" style="min-width: 70px;">',
                  this.textEdit,
                  "</button>",
                  "</td>",
                  "</tr>",
                  "</table>",
                  "</div></div>",
                ].join(""),
              )({ scope: this }),
            },
            options,
          )

          this.handler = options.handler

          Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options)

          this._noApply = true
          this._changedProps = null

          this.api = this.options.api
          this.chartSettings = this.options.chartSettings
          this.currentChartType = Asc.c_oAscChartTypeSettings.barNormal

          this._isOpen = false
        },

        render: function () {
          Common.Views.AdvancedSettingsWindow.prototype.render.call(this)

          this.on("animate:after", _.bind(this.onAnimateAfter, this))

          this.txtDataRange = new Common.UI.InputFieldBtn({
            el: $("#chart-dlg-txt-range"),
            name: "range",
            style: "width: 100%;",
            btnHint: this.textSelectData,
            allowBlank: true,
            // validateOnChange: true
          })
          this.txtDataRange.on("button:click", _.bind(this.onSelectData, this))
          this.txtDataRange.on("changed:after", (input, newValue, oldValue, e) => {
            if (newValue === oldValue) return
            this.changeChartRange(newValue)
          })

          // Chart data
          this.seriesList = new Common.UI.ListView({
            el: $("#chart-dlg-series-list", this.$window),
            store: new Common.UI.DataViewStore(),
            emptyText: "",
            scrollAlwaysVisible: true,
            itemTemplate: _.template(
              '<div id="<%= id %>" class="list-item" style="min-height: 15px;"><%= Common.Utils.String.htmlEncode(value) %></div>',
            ),
            tabindex: 1,
          })
          this.seriesList.onKeyDown = _.bind(this.onListKeyDown, this, "series")
          this.seriesList.on("item:select", _.bind(this.onSelectSeries, this))
          this.seriesList.store.comparator = (rec) => rec.get("order")

          this.btnAdd = new Common.UI.Button({
            el: $("#chart-dlg-btn-add"),
          })
          this.btnAdd.on("click", _.bind(this.onAddSeries, this, false))

          this.btnDelete = new Common.UI.Button({
            el: $("#chart-dlg-btn-delete"),
          })
          this.btnDelete.on("click", _.bind(this.onDeleteSeries, this))

          this.btnEdit = new Common.UI.Button({
            el: $("#chart-dlg-btn-edit"),
          })
          this.btnEdit.on("click", _.bind(this.onEditSeries, this, false))

          this.btnUp = new Common.UI.Button({
            parentEl: $("#chart-dlg-btn-up"),
            cls: "btn-toolbar bg-white",
            iconCls: "caret-up",
            scaling: false,
            hint: this.textUp,
          })
          this.btnUp.on("click", _.bind(this.onMoveClick, this, true))

          this.btnDown = new Common.UI.Button({
            parentEl: $("#chart-dlg-btn-down"),
            cls: "btn-toolbar bg-white",
            iconCls: "caret-down",
            scaling: false,
            hint: this.textDown,
          })
          this.btnDown.on("click", _.bind(this.onMoveClick, this, false))

          this.btnSwitch = new Common.UI.Button({
            el: $("#chart-dlg-btn-switch"),
          })
          this.btnSwitch.on("click", _.bind(this.onSwitch, this))

          this.categoryList = new Common.UI.ListView({
            el: $("#chart-dlg-category-list", this.$window),
            store: new Common.UI.DataViewStore(),
            emptyText: "",
            scrollAlwaysVisible: true,
            itemTemplate: _.template(
              '<div id="<%= id %>" class="list-item" style="min-height: 15px;"><%= Common.Utils.String.htmlEncode(value) %></div>',
            ),
            tabindex: 1,
          })

          this.btnEditCategory = new Common.UI.Button({
            el: $("#chart-dlg-btn-category-edit"),
          })
          this.btnEditCategory.on("click", _.bind(this.onEditCategory, this, false))

          this.afterRender()
        },

        getFocusedComponents: function () {
          return [
            this.txtDataRange,
            this.seriesList,
            this.btnAdd,
            this.btnEdit,
            this.btnDelete,
            this.btnUp,
            this.btnDown,
            this.btnSwitch,
            this.categoryList,
            this.btnEditCategory,
          ].concat(this.getFooterButtons())
        },

        getDefaultFocusableComponent: function () {
          return this.txtDataRange
        },

        afterRender: function () {
          this._setDefaults(this.chartSettings)
        },

        onAnimateAfter: function () {
          if (this.chartSettings && !this._isOpen) {
            this.updateCategoryList(this.chartSettings.getCatValues(), true)
            this._isOpen = true
          }
        },

        close: function () {
          this.clearCategoryListTimer()

          this.api.asc_onCloseFrameEditor()
          Common.Views.AdvancedSettingsWindow.prototype.close.apply(this, arguments)
        },

        _setDefaults: function (props) {
          if (props) {
            this.chartSettings = props

            this.currentChartType = props.getType()

            const value = props.getRange()
            this.txtDataRange.setValue(value ? value : "")

            this.txtDataRange.validation = (value) => true

            this.updateSeriesList(props.getSeries(), 0)
            this.updateCategoryList(props.getCatValues())
          }
          this.updateButtons()
        },

        getSettings: function () {
          return { chartSettings: this.chartSettings }
        },

        onDlgBtnClick: function (event) {
          const state =
            typeof event === "object" ? event.currentTarget.attributes.result.value : event
          if (state === "ok") {
            if (!this.isRangeValid()) return
            this.handler?.call(this, state, state === "ok" ? this.getSettings() : undefined)
          }

          this.close()
        },

        onPrimary: function () {
          this.onDlgBtnClick("ok")
          return false
        },

        isRangeValid: function () {
          let isvalid
          isvalid = this.chartSettings.isValidRange(this.txtDataRange.getValue())
          if (isvalid === true || isvalid === Asc.c_oAscError.ID.No) return true

          let error = this.textInvalidRange
          switch (isvalid) {
            case Asc.c_oAscError.ID.StockChartError:
              error = this.errorStockChart
              break
            case Asc.c_oAscError.ID.MaxDataSeriesError:
              error = this.errorMaxRows
              break
            case Asc.c_oAscError.ID.MaxDataPointsError:
              error = this.errorMaxPoints
              break
            case Asc.c_oAscError.ID.ErrorInFormula:
              error = this.errorInFormula
              break
            case Asc.c_oAscError.ID.InvalidReference:
              error = this.errorInvalidReference
              break
            case Asc.c_oAscError.ID.NoSingleRowCol:
              error = this.errorNoSingleRowCol
              break
            case Asc.c_oAscError.ID.NoValues:
              error = this.errorNoValues
              break
          }
          Common.UI.warning({ msg: error, maxwidth: 600 })
          return false
        },

        changeChartRange: function (settings) {
          if (this.isRangeValid(settings)) {
            this.txtDataRange.checkValidate()
            this.chartSettings.setRange(settings)

            this.updateSeriesList(this.chartSettings.getSeries(), 0)
            this.updateCategoryList(this.chartSettings.getCatValues())
            this.updateButtons()
          }
        },

        onSelectData: function (input) {
          if (this.api) {
            const handlerDlg = (dlg, result) => {
              if (result === "ok") {
                input.setValue(dlg.getSettings())
                _.delay(() => {
                  this.changeChartRange(dlg.getSettings())
                }, 10)
              }
            }

            const win = new SSE.Views.CellRangeDialog({
              handler: handlerDlg,
            }).on("close", () => {
              this.show()
            })

            const xy = Common.Utils.getOffset(this.$window)
            this.hide()
            win.show(this.$window, xy)
            win.setSettings({
              api: this.api,
              range: this.txtDataRange.getValue(),
              type: Asc.c_oAscSelectionDialogType.Chart,
              validation: () => true,
            })
          }
        },

        onListKeyDown: function (type, e, data) {
          const record = null
          const listView = this.seriesList

          if (listView.disabled) return
          if (_.isUndefined(data)) data = e

          if (data.keyCode === Common.UI.Keys.DELETE && !this.btnDelete.isDisabled()) {
            // this.onDeleteSeries();
          } else {
            Common.UI.DataView.prototype.onKeyDown.call(listView, e, data)
          }
        },

        onSelectSeries: function (lisvView, itemView, record) {
          this.updateMoveButtons()
        },

        updateRange: function () {
          this.txtDataRange.setValue(this.chartSettings.getRange() || "")
        },

        updateButtons: function () {
          this.btnEdit.setDisabled(this.seriesList.store.length < 1)
          this.btnDelete.setDisabled(this.seriesList.store.length < 1)
          this.btnSwitch.setDisabled(
            this.seriesList.store.length < 1 || !this.chartSettings.getRange(),
          )
          this.updateMoveButtons()
        },

        updateMoveButtons: function () {
          const rec = this.seriesList.getSelectedRec()
          const index = rec ? this.seriesList.store.indexOf(rec) : -1
          this.btnUp.setDisabled(index < 1)
          this.btnDown.setDisabled(index < 0 || index === this.seriesList.store.length - 1)
        },

        onAddSeries: function () {
          this.chartSettings.startEditData()
          const series = this.chartSettings.addSeries()
          const isScatter = series.asc_IsScatter()

          const handlerDlg = (dlg, result) => {
            if (result === "ok") {
              this.updateRange()
              this.updateSeriesList(
                this.chartSettings.getSeries(),
                this.seriesList.store.length - 1,
              )
              this.updateCategoryList(this.chartSettings.getCatValues())
              this.updateButtons()
              this.chartSettings.endEditData()
              this._isEditRanges = false
            }
          }
          this.changeDataRange(1, { series: series, isScatter: isScatter }, handlerDlg)
        },

        onDeleteSeries: function () {
          const rec = this.seriesList.getSelectedRec()
          if (rec) {
            const order = rec.get("order")
            rec.get("series").asc_Remove()
            this.updateRange()
            this.updateSeriesList(this.chartSettings.getSeries(), order)
            this.updateCategoryList(this.chartSettings.getCatValues())
            this.updateButtons()
          }
        },

        onEditSeries: function () {
          const rec = this.seriesList.getSelectedRec()
          if (rec) {
            const series = rec.get("series")
            const isScatter = series.asc_IsScatter()
            const handlerDlg = (dlg, result) => {
              if (result === "ok") {
                rec.set("value", series.asc_getSeriesName())
                this.updateRange()
                this.updateCategoryList(this.chartSettings.getCatValues())
                this.updateButtons()
                this.chartSettings.endEditData()
                this._isEditRanges = false
              }
            }
            this.chartSettings.startEditData()
            this.changeDataRange(1, { series: series, isScatter: isScatter }, handlerDlg)
          }
        },

        onEditCategory: function () {
          const handlerDlg = (dlg, result) => {
            if (result === "ok") {
              this.updateCategoryList(this.chartSettings.getCatValues())
              this.updateRange()
              this.updateButtons()
              this.chartSettings.endEditData()
              this._isEditRanges = false
            }
          }
          this.chartSettings.startEditData()
          this.changeDataRange(
            0,
            {
              category: this.chartSettings.getCatFormula(),
              values: this.chartSettings.getCatValues(),
            },
            handlerDlg,
          )
        },

        changeDataRange: function (type, props, handlerDlg) {
          const win = new SSE.Views.ChartDataRangeDialog({
            type: type, //series
            isScatter: !!props.isScatter,
            handler: handlerDlg,
          }).on("close", () => {
            this._isEditRanges && this.chartSettings.cancelEditData()
            this._isEditRanges = false
            this.show()
          })

          this._isEditRanges = true
          const xy = Common.Utils.getOffset(this.$window)
          this.hide()
          win.show(
            xy.left + (this.$window.outerWidth() - win.options.width) / 2,
            xy.top + (this.$window.outerHeight() - 150) / 2,
          )
          win.setSettings({
            api: this.api,
            props: props,
            chartSettings: this.chartSettings,
          })
        },

        onMoveClick: function (up) {
          const store = this.seriesList.store
          const length = store.length
          const rec = this.seriesList.getSelectedRec()
          if (rec) {
            const index = store.indexOf(rec)
            const order = rec.get("order")
            const newindex = up ? Math.max(0, index - 1) : Math.min(length - 1, index + 1)
            const newrec = store.at(newindex)
            const neworder = newrec.get("order")
            store.add(store.remove(rec), { at: newindex })
            rec.set("order", neworder)
            newrec.set("order", order)
            up ? rec.get("series").asc_MoveUp() : rec.get("series").asc_MoveDown()
            this.seriesList.selectRecord(rec)
            this.seriesList.scrollToRecord(rec)
            this.updateRange()
            this.updateCategoryList(this.chartSettings.getCatValues())
            this.updateButtons()
          }
        },

        updateSeriesList: function (series, index) {
          this.btnEditCategory.setDisabled(
            series && series.length > 0 ? series[0].asc_IsScatter() : false,
          )

          const arr = []
          const store = this.seriesList.store
          for (let i = 0, len = series.length; i < len; i++) {
            const item = series[i]
            const rec = new Common.UI.DataViewModel()
            rec.set({
              value: item.asc_getSeriesName(),
              index: item.asc_getIdx(),
              order: item.asc_getOrder(),
              series: item,
            })
            arr.push(rec)
          }
          store.reset(arr)
          len > 0 && this.seriesList.selectByIndex(Math.min(index || 0, store.length - 1))
        },

        updateCategoryList: function (categories, afterAnimate) {
          this.clearCategoryListTimer()
          const store = this.categoryList.store
          const len = categories.length
          const getModels = (data) => {
            const models = []
            for (let i = 0, len = data.length; i < len; i++) {
              const item = data[i]
              const rec = new Common.UI.DataViewModel()
              rec.set({
                value: item,
              })
              models.push(rec)
            }
            return models
          }
          const loadCategoryList = (index) => {
            this._categoryListIndex = index
            this._loadCategoryListTimer = setInterval(() => {
              if (this._categoryListIndex + 1 >= len) {
                this.clearCategoryListTimer()
                return
              }
              store.add(
                getModels(categories.slice(this._categoryListIndex, this._categoryListIndex + 10)),
              )
              this._categoryListIndex += 10
            }, 10)
          }
          if (!afterAnimate) {
            if (categories.length < 10) {
              store.reset(getModels(categories))
            } else {
              store.reset(getModels(categories.slice(0, 9)))

              if (this._isOpen) {
                _.defer(() => {
                  loadCategoryList(10)
                }, 0)
              }
            }
            len > 0 && this.categoryList.selectByIndex(0)
          } else if (len > store.length) {
            loadCategoryList(10)
          }
        },

        clearCategoryListTimer: function () {
          if (this._loadCategoryListTimer) {
            clearInterval(this._loadCategoryListTimer)
            this._loadCategoryListTimer = undefined
          }
        },

        onSwitch: function () {
          const res = this.chartSettings.switchRowCol()
          if (res === Asc.c_oAscError.ID.MaxDataSeriesError)
            Common.UI.warning({ msg: this.errorMaxRows, maxwidth: 600 })
          else {
            this.updateSeriesList(this.chartSettings.getSeries(), 0)
            this.updateCategoryList(this.chartSettings.getCatValues())
            this.updateRange()
            this.updateButtons()
          }
        },

        textTitle: "Chart Data",
        textInvalidRange: "Invalid cells range",
        textSelectData: "Select data",
        errorMaxRows: "The maximum number of data series per chart is 255.",
        errorStockChart:
          "Incorrect row order. To build a stock chart place the data on the sheet in the following order:<br> opening price, max price, min price, closing price.",
        errorMaxPoints: "The maximum number of points in series per chart is 4096.",
        textSeries: "Legend Entries (Series)",
        textAdd: "Add",
        textEdit: "Edit",
        textDelete: "Remove",
        textSwitch: "Switch Row/Column",
        textCategory: "Horizontal (Category) Axis Labels",
        textUp: "Up",
        textDown: "Down",
        textData: "Chart data range",
        errorInFormula: "There's an error in formula you entered.",
        errorInvalidReference:
          "The reference is not valid. Reference must be to an open worksheet.",
        errorNoSingleRowCol:
          "The reference is not valid. References for titles, values, sizes, or data labels must be a single cell, row, or column.",
        errorNoValues: "To create a chart, the series must contain at least one value.",
      },
      SSE.Views.ChartDataDialog || {},
    ),
  )
})
