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
 *  CustomColumnsDialog.js
 *
 *  Created on 6/23/17
 *
 */

define([], () => {
  DE.Views.CustomColumnsDialog = Common.UI.Window.extend(
    _.extend(
      {
        options: {
          width: 300,
          header: true,
          style: "min-width: 216px;",
          cls: "modal-dlg",
          id: "window-custom-columns",
          buttons: ["ok", "cancel"],
        },

        initialize: function (options) {
          _.extend(
            this.options,
            {
              title: this.textTitle,
            },
            options || {},
          )

          this.template = [
            '<div class="box">',
            '<div class="input-row" style="margin-bottom: 10px;">',
            `<label class="input-label">${this.textColumns}</label><div id="custom-columns-spin-num" class="float-right"></div>`,
            "</div>",
            '<div id="custom-columns-list" style="width:100%; height: 122px;"></div>',
            '<div class="input-row" style="margin: 10px 0;">',
            '<div id="custom-columns-equal-width"></div>',
            "</div>",
            '<div class="input-row">',
            '<div id="custom-columns-separator"></div>',
            "</div>",
            "</div>",
          ].join("")

          this.options.tpl = _.template(this.template)(this.options)

          this.totalWidth = 558.7
          this.minWidthCol = 10 //Minimum column width in mm
          this.defaultSpacing = 12.5 //Default spacing for 2 columns in mm
          this._noApply = false

          Common.UI.Window.prototype.initialize.call(this, this.options)
        },

        render: function () {
          Common.UI.Window.prototype.render.call(this)
          this.spnColumns = new Common.UI.MetricSpinner({
            el: $("#custom-columns-spin-num"),
            step: 1,
            allowDecimal: false,
            width: 45,
            defaultUnit: "",
            value: 1,
            maxValue: 30,
            minValue: 1,
            maskExp: /[0-9]/,
          })
          this.spnColumns.on("change", (field, newValue, oldValue, eOpts) => {
            const num = Number.parseInt(newValue)
            const storeLength = this.columnsList.store.length
            const isIncrease = num > storeLength
            const isEqualWidth = this.chEqualWidth.getValue() === "checked"
            const arrColumnObj = []

            if (storeLength === 0 || num === storeLength) return

            if (isEqualWidth) {
              let spacing =
                storeLength === 1
                  ? this.defaultSpacing
                  : this.columnsList.store.at(0).get("spacing")
              let columnWidth = (this.totalWidth - spacing * (num - 1)) / num

              if (columnWidth < this.minWidthCol) {
                columnWidth = this.minWidthCol
                spacing = (this.totalWidth - columnWidth * num) / (num - 1)
              }
              for (let i = 0; i < num; i++) {
                arrColumnObj.push({
                  width: columnWidth,
                  spacing: spacing,
                })
              }
            } else {
              let allSpacing = 0
              const koef =
                (this.columnsList.store.at(storeLength - 1).get("width") +
                  (storeLength > 1
                    ? this.columnsList.store.at(storeLength - 2).get("spacing")
                    : 0)) /
                this.totalWidth
              const widthKoefArr = [1]

              for (let i = 0, previosSpacing = this.defaultSpacing; i < num; i++) {
                let columnSpacing = 0

                //Calculation spacing
                //y = curSpacing / (koef*x + 1 - curNum*koef)   y <-- spacing when 'x' columns
                //                                              x <-- num columns
                //                                              curSpacing <-- current spacing for column
                //                                              curNum <-- cur columns
                //                                              koef <-- (lastWidth + lastSpacing) / totalWidth
                if (i < num - 1) {
                  if (i < storeLength - 1) {
                    const curSpacing =
                      storeLength > 1
                        ? this.columnsList.store.at(i).get("spacing")
                        : this.defaultSpacing
                    columnSpacing = curSpacing / (koef * num + 1 - storeLength * koef)
                  } else {
                    columnSpacing = previosSpacing
                  }

                  previosSpacing = columnSpacing
                }

                if (i < storeLength)
                  widthKoefArr[i] =
                    this.columnsList.store.at(i).get("width") /
                    this.columnsList.store.at(0).get("width")
                else widthKoefArr[i] = widthKoefArr[storeLength - 1]

                arrColumnObj.push({ spacing: columnSpacing })
                allSpacing += columnSpacing
              }

              const totalWidthWithoutSpacing = this.totalWidth - allSpacing
              const widthFirstColumn =
                totalWidthWithoutSpacing / widthKoefArr.reduce((a, b) => a + b)

              for (let i = 0; i < num; i++) {
                arrColumnObj[i].width = widthFirstColumn * widthKoefArr[i]
              }
            }
            this.updateColumnsList(arrColumnObj)
            this.setMaxValueSpinsForColumns()
            if (!isIncrease && !isEqualWidth) this.setMaxColumns()

            this.chEqualWidth.setDisabled(num < 2)
            this.chSeparator.setDisabled(num < 2)
          })

          this.columnsList = new Common.UI.ListView({
            el: $("#custom-columns-list", this.$window),
            store: new Common.UI.DataViewStore(),
            showLast: false,
            handleSelect: false,
            tabindex: 0,
            template: _.template(['<div class="listview inner" style=""></div>'].join("")),
            headers: [
              { name: "#", width: 26 },
              { name: this.textWidth, width: 115 },
              { name: this.textTitleSpacing, width: 113 },
            ],
            itemTemplate: _.template(
              [
                '<div id="custom-columns-list-item-<%= index %>" class="list-item" style="display:flex; align-items:center; width=100%;">',
                '<label class="level-caption padding-right-5" style="flex-shrink:0; width:20px;"><%= index + 1 %></label>',
                '<div style="display:inline-block;flex-grow: 1;">',
                '<div style="padding: 0 5px;display: inline-block;vertical-align: top;"><div id="custom-columns-list-item-spin-width-<%= index %>" class="input-group-nr" style=""></div></div>',
                '<div style="padding: 0 5px;display: inline-block;vertical-align: top;"><div id="custom-columns-list-item-spin-spacing-<%= index %>" class="input-group-nr"></div></div>',
                "</div>",
                "</div>",
              ].join(""),
            ),
          })

          this.columnsList.on("item:add", _.bind(this.addControls, this))

          this.chEqualWidth = new Common.UI.CheckBox({
            el: $("#custom-columns-equal-width"),
            labelText: this.textEqualWidth,
          }).on("change", (item, newValue, oldValue) => {
            this.lockSpinsForEqualColumns(newValue === "checked")
            if (newValue === "checked") {
              this.setEqualWidthColumns()
            }
            if (this.columnsList.store.length > 0) {
              this.setMaxColumns()
              this.setMaxValueSpinsForColumns()
            }
          })

          this.chSeparator = new Common.UI.CheckBox({
            el: $("#custom-columns-separator"),
            labelText: this.textSeparator,
          })

          this.getChild().find(".dlg-btn").on("click", _.bind(this.onBtnClick, this))
        },

        getFocusedComponents: function () {
          return [this.spnColumns, this.chEqualWidth, this.chSeparator].concat(
            this.getFooterButtons(),
          )
        },

        getDefaultFocusableComponent: function () {
          return this.spnColumns
        },

        _handleInput: function (state) {
          if (this.options.handler) {
            this.options.handler.call(this, this, state)
          }

          this.close()
        },

        onBtnClick: function (event) {
          this._handleInput(event.currentTarget.attributes.result.value)
        },

        onPrimary: function () {
          this._handleInput("ok")
          return false
        },

        setSettings: function (props) {
          if (props) {
            const equal = props.get_EqualWidth()
            const num = equal ? props.get_Num() : props.get_ColsCount()
            const total = props.get_TotalWidth()
            const arrColumnObj = []

            this.totalWidth = total
            this.spnColumns.setValue(num, true)

            const calcWidthForEqual =
              equal && num > 1 ? this.calcWidthForEqualColumns(num, props.get_Space()) : total

            for (let i = 0; i < num; i++) {
              if (!equal && num > 1) {
                const currentCol = props.get_Col(i)
                arrColumnObj.push({
                  width: currentCol.get_W(),
                  spacing: currentCol.get_Space(),
                })

                if (currentCol.get_W() < this.minWidthCol) this.minWidthCol = currentCol.get_W()
              } else {
                arrColumnObj.push({
                  width: calcWidthForEqual,
                  spacing: props.get_Space(),
                })
              }
            }

            this.chEqualWidth.setValue(equal, true)
            this.chEqualWidth.setDisabled(num < 2)
            this.chSeparator.setValue(props.get_Sep())
            this.chSeparator.setDisabled(num < 2)

            this.updateColumnsList(arrColumnObj)

            this.setMaxColumns()
            this.setMaxValueSpinsForColumns()
          }
        },

        getSettings: function () {
          const props = new Asc.CDocumentColumnsProps()

          props.put_Num(this.spnColumns.getNumberValue())
          props.put_Space(this.columnsList.store.at(0).get("spacing"))
          props.put_EqualWidth(this.chEqualWidth.getValue() === "checked")
          props.put_Sep(this.chSeparator.getValue() === "checked")

          if (this.chEqualWidth.getValue() !== "checked") {
            this.columnsList.store.each((col, index) => {
              props.put_ColByValue(index, col.get("width"), col.get("spacing"))
            })
          }
          return props
        },

        updateColumnsList: function (arrColumnObj) {
          const arrItems = arrColumnObj.map((item, itemIndex) => ({
            index: itemIndex,
            allowSelected: false,
            width: item.width,
            spacing: itemIndex !== arrColumnObj.length - 1 ? item.spacing : 0,
            widthSpin: null,
            spacingSpin: null,
          }))

          this.columnsList.store.reset(arrItems)
        },

        setMaxColumns: function () {
          const maxPossibleColumns = Math.floor(this.totalWidth / this.minWidthCol)

          if (this.chEqualWidth.getValue() === "checked") {
            this.spnColumns.setMaxValue(maxPossibleColumns)
          } else {
            let curNumColumns = this.columnsList.store.length
            let koef = null
            let widthKoefArr = []

            if (curNumColumns > 1) {
              for (let i = 0; i < curNumColumns; i++) {
                widthKoefArr[i] =
                  this.columnsList.store.at(i).get("width") /
                  this.columnsList.store.at(0).get("width")
              }
              koef =
                (this.columnsList.store.at(curNumColumns - 1).get("width") +
                  this.columnsList.store.at(curNumColumns - 2).get("spacing")) /
                this.totalWidth
            } else {
              curNumColumns = 2
              widthKoefArr = [1, 1]
              koef = (this.totalWidth - this.defaultSpacing) / (2 * this.totalWidth)
            }

            const minWidthKoef = _.min(widthKoefArr)
            widthKoefArr = widthKoefArr.map((item) => item / minWidthKoef)

            //Calculation max columns
            //Quadratic equation
            //n     <-- number current columns
            //MAX   <-- max columns
            //w(i)  <-- width 'i' column when the minimum column width is 'this.minWidthColumn'
            //s(i)  <-- current spacing 'i' column
            //(koef*w(n)) * MAX^2 + ((1-n*koef)*w(n) - koef*this.totalWidth + summ(w(1), w(2), ..., w(n-1))*koef + (1-n)*koef*w(n) + s(n-1)) + (this.totalWidth*(1-n*koef) + summ(w(1), w(2), ..., w(n-1))*(1-n*koef) + w(n)*(1-n)*(1-n*koef) + summ(s(1), s(2), ..., w(n-2)) + s(n-1)*(1-n)) = 0
            const lastWidth = widthKoefArr.pop() * this.minWidthCol
            const summWidthWithoutLast = widthKoefArr.reduce((a, b) => a + b) * this.minWidthCol
            const lastSpacing =
              this.columnsList.store.length > 1
                ? this.columnsList.store.at(curNumColumns - 2).get("spacing")
                : this.defaultSpacing
            let summSpacingWithoutLast = 0

            this.columnsList.store.each((item, index) => {
              if (index < this.columnsList.store.length - 2)
                summSpacingWithoutLast += item.get("spacing")
            })

            const a = koef * lastWidth
            const b =
              (1 - curNumColumns * koef) * lastWidth -
              koef * this.totalWidth +
              koef * summWidthWithoutLast +
              (1 - curNumColumns) * koef * lastWidth +
              lastSpacing
            const c =
              -this.totalWidth * (1 - curNumColumns * koef) +
              summWidthWithoutLast * (1 - curNumColumns * koef) +
              lastWidth * (1 - curNumColumns) * (1 - curNumColumns * koef) +
              summSpacingWithoutLast +
              lastSpacing * (1 - curNumColumns)
            const maxColumn = (Math.sqrt(b * b - 4 * a * c) - b) / (2 * a)

            this.spnColumns.setMaxValue(Math.floor(maxColumn + 0.01))
          }
        },

        lockSpinsForEqualColumns: function (bool) {
          const num = this.columnsList.store.length
          this.columnsList.store.each((col, index) => {
            col.get("widthSpin").setDisabled(bool)
            col.get("spacingSpin").setDisabled((index !== 0 && bool) || index === num - 1)
          })
        },

        calcWidthForEqualColumns: function (num, spacing) {
          return (this.totalWidth - (num - 1) * spacing) / num
        },

        setEqualWidthColumns: function () {
          if (this.columnsList.store.length === 0) return
          const num = this.spnColumns.getNumberValue()
          let spacing = this.columnsList.store.at(0).get("spacing")
          let width = this.calcWidthForEqualColumns(num, spacing)

          if (width < this.minWidthCol) {
            width = this.minWidthCol + 0.0001
            spacing = num > 1 ? (this.totalWidth - num * width) / (num - 1) : 0
          }

          this.columnsList.store.each((col, index) => {
            this.setWidthColumnValue(col, width)
            if (index !== num - 1) {
              this.setSpacingColumnValue(col, spacing)
            }
          })
        },

        setWidthColumnValue: function (item, value) {
          const widthSpin = item.get("widthSpin")
          const valueInUserMetric = Common.Utils.Metric.fnRecalcFromMM(value)

          item.set("width", value, { silent: true })
          if (widthSpin.getMaxValue() < valueInUserMetric) {
            widthSpin.setMaxValue(this.decimalRouding(valueInUserMetric))
          }
          widthSpin.setValue(valueInUserMetric, true)
        },

        setSpacingColumnValue: (item, value) => {
          item.set("spacing", value, { silent: true })
          item.get("spacingSpin").setValue(Common.Utils.Metric.fnRecalcFromMM(value), true)
        },

        setMaxValueSpinsForColumns: function () {
          if (this.chEqualWidth.getValue() === "checked") {
            const item = this.columnsList.store.at(0)
            const num = this.columnsList.store.length
            const width = this.minWidthCol
            const maxSpacing =
              num > 1
                ? Common.Utils.Metric.fnRecalcFromMM((this.totalWidth - num * width) / (num - 1))
                : 0

            item.get("widthSpin").setMaxValue(1000000)
            item.get("spacingSpin").setMaxValue(num > 1 ? this.decimalRouding(maxSpacing) : 0)
          } else {
            const num = this.columnsList.store.length
            const maxWidth = Common.Utils.Metric.fnRecalcFromMM(
              this.totalWidth - this.minWidthCol * (num - 1),
            )
            const maxSpacing = Common.Utils.Metric.fnRecalcFromMM(
              this.totalWidth - this.minWidthCol * num,
            )

            this.columnsList.store.each((item) => {
              item.get("widthSpin").setMaxValue(this.decimalRouding(maxWidth))
              item.get("spacingSpin").setMaxValue(this.decimalRouding(maxSpacing))
            })
          }
        },

        decimalRouding: (a, precision) => {
          const x = 10 ** (precision ? precision : 2)
          return Math.round(a * x) / x
        },

        //type = width/spacing
        setNewValueSpinsForColumns: function (changedItemIndex, difference, type) {
          const me = this
          let newWidthArr = []
          let newSpacingArr = []
          let diffFirstItemInArr = 0

          newWidthArr = fillArrNewValues("width", changedItemIndex + 1, me.columnsList.store.length)
          if (type === "width") {
            if (difference !== 0) {
              newSpacingArr = fillArrNewValues("spacing", 0, me.columnsList.store.length - 1)
            }
            if (difference !== 0) {
              const newWidthArrBeforeCur = fillArrNewValues("width", 0, changedItemIndex)
              newWidthArrBeforeCur.forEach((val, index) => {
                newWidthArr[index] = val
              })
            }
          } else {
            if (difference !== 0) {
              const newWidthArrBeforeCur = fillArrNewValues("width", 0, changedItemIndex + 1)
              newWidthArrBeforeCur.forEach((val, index) => {
                newWidthArr[index] = val
              })
            }
            if (difference !== 0) {
              newSpacingArr = fillArrNewValues(
                "spacing",
                0,
                me.columnsList.store.length - 1,
                changedItemIndex,
              )
            }
          }

          newWidthArr.forEach((val, index) => {
            me.setWidthColumnValue(me.columnsList.store.at(index), val)
          })

          newSpacingArr.forEach((val, index) => {
            me.setSpacingColumnValue(me.columnsList.store.at(index), val)
          })

          //type = width/spacing
          function fillArrNewValues(type, indexStart, indexEnd, excludedIndex) {
            const koefArr = getKoefs(type, indexStart, indexEnd, difference < 0, excludedIndex)
            const minValue = type === "width" ? me.minWidthCol : 0
            const resultArr = []

            while (
              koefArr.length > 0 &&
              koefArr.reduce((a, b) => a + (b ? 1 : 0)) > 0 &&
              difference !== 0
            ) {
              diffFirstItemInArr = difference / koefArr.reduce((a, b) => a + b)
              for (let i = indexStart; i < indexEnd; i++) {
                if (!koefArr[i] || (excludedIndex !== undefined && excludedIndex === i)) continue

                let term = diffFirstItemInArr * koefArr[i]
                const oldWidth =
                  resultArr[i] !== undefined ? resultArr[i] : me.columnsList.store.at(i).get(type)
                let newWidth = oldWidth - term

                if (newWidth < minValue) {
                  term = oldWidth - minValue
                  newWidth = minValue
                  koefArr[i] = 0
                }
                resultArr[i] = newWidth
                difference -= term
              }
              difference = me.decimalRouding(difference, 6)
            }
            return resultArr
          }

          //type = width/spacing
          function getKoefs(type, indexStart, indexEnd, positive, excludedIndex) {
            if (positive === undefined) positive = false

            const resultArr = []
            for (let i = indexStart, firstIndexNotMinimumVal; i < indexEnd; i++) {
              if (excludedIndex !== undefined && excludedIndex === i) continue

              const curColumnVal = me.columnsList.store.at(i).get(type)
              if (
                (type === "width" && (positive || curColumnVal > me.minWidthCol)) ||
                (type === "spacing" && curColumnVal > 0)
              ) {
                if (firstIndexNotMinimumVal === undefined) firstIndexNotMinimumVal = i

                resultArr[i] =
                  curColumnVal / me.columnsList.store.at(firstIndexNotMinimumVal).get(type)
              }
            }
            if (positive && resultArr.length === 0) {
              for (let i = indexStart, firstIndexNotMinimumVal; i < indexEnd; i++) {
                resultArr[i] = 1
              }
            }
            return resultArr
          }
        },

        addControls: function (listView, itemView, item) {
          if (!item) return
          const index = item.get("index")
          const isLastItem = index === this.columnsList.store.length - 1
          const isEqualWidth = this.chEqualWidth.getValue() === "checked"
          const metricName = Common.Utils.Metric.getCurrentMetricName()

          const spinWidth = new Common.UI.MetricSpinner({
            el: $(`#custom-columns-list-item-spin-width-${index}`),
            step:
              Common.Utils.Metric.getCurrentMetric() === Common.Utils.Metric.c_MetricUnits.pt
                ? 1
                : 0.1,
            width: 105,
            tabindex: 1,
            defaultUnit: metricName,
            value: `${this.decimalRouding(Common.Utils.Metric.fnRecalcFromMM(item.get("width")))} ${metricName}`,
            maxValue: 120,
            minValue: this.decimalRouding(Common.Utils.Metric.fnRecalcFromMM(this.minWidthCol)),
            disabled: isEqualWidth || (index === 0 && isLastItem),
          }).on("change", (field, newValue, oldValue, eOpts) => {
            const difference = Common.Utils.Metric.fnRecalcToMM(
              Number.parseFloat(newValue) -
                Common.Utils.Metric.fnRecalcFromMM(item.get("width")).toFixed(2),
            )
            item.set("width", item.get("width") + difference, { silent: true })

            this.setNewValueSpinsForColumns(index, difference, "width")
            this.setMaxColumns()
          })

          const spinSpacing = new Common.UI.MetricSpinner({
            el: $(`#custom-columns-list-item-spin-spacing-${index}`),
            step:
              Common.Utils.Metric.getCurrentMetric() === Common.Utils.Metric.c_MetricUnits.pt
                ? 1
                : 0.1,
            width: 105,
            tabindex: 1,
            defaultUnit: metricName,
            value: !isLastItem
              ? `${this.decimalRouding(Common.Utils.Metric.fnRecalcFromMM(item.get("spacing")))} ${metricName}`
              : "",
            maxValue: 120,
            minValue: 0,
            disabled: (isEqualWidth && index !== 0) || isLastItem,
          }).on("change", (field, newValue, oldValue, eOpts) => {
            const difference = Common.Utils.Metric.fnRecalcToMM(
              Number.parseFloat(newValue) -
                Common.Utils.Metric.fnRecalcFromMM(item.get("spacing")).toFixed(2),
            )
            item.set("spacing", item.get("spacing") + difference, { silent: true })

            if (this.chEqualWidth.getValue() === "checked") this.setEqualWidthColumns()
            else this.setNewValueSpinsForColumns(index, difference, "spacing")

            this.setMaxColumns()
          })

          item.set("widthSpin", spinWidth, { silent: true })
          item.set("spacingSpin", spinSpacing, { silent: true })
        },

        textTitle: "Columns",
        textColumns: "Number of columns",
        textWidth: "Width",
        textTitleSpacing: "Spacing",
        textEqualWidth: "Equal column width",
        textSeparator: "Column divider",
      },
      DE.Views.CustomColumnsDialog || {},
    ),
  )
})
