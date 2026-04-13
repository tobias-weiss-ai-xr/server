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
 *  SlicerSettings.js
 *
 *  Created on 5/26/20
 *
 */
define([
  "text!spreadsheeteditor/main/app/template/SlicerSettings.template",
  "jquery",
  "underscore",
  "backbone",
  "common/main/lib/component/Button",
  "common/main/lib/component/MetricSpinner",
], (menuTemplate, $, _, Backbone) => {
  SSE.Views.SlicerSettings = Backbone.View.extend(
    _.extend(
      {
        el: "#id-slicer-settings",

        // Compile our stats template
        template: _.template(menuTemplate),

        // Delegated events for creating new items, and clearing completed ones.
        events: {},

        options: {
          alias: "SlicerSettings",
        },

        initialize: function () {
          this._initSettings = true

          this._nRatio = 1
          this._state = {
            Width: 0,
            Height: 0,
            DisabledControls: false,
            keepRatio: false,
            ColCount: 0,
            ColWidth: 0,
            ColHeight: 0,
            PosVert: 0,
            PosHor: 0,
            PosLocked: false,
            SortOrder: undefined,
            IndNoData: false,
            ShowNoData: false,
            HideNoData: false,
            DisabledSizeControls: false,
          }
          this.spinners = []
          this.lockedControls = []
          this.sizeControls = []
          this._locked = false

          this._noApply = false
          this._originalProps = null
          this.styles = null

          this.render()
        },

        render: function () {
          const el = $(this.el)
          el.html(
            this.template({
              scope: this,
            }),
          )

          this.linkAdvanced = $("#slicer-advanced-link")
        },

        setApi: function (api) {
          if (api === undefined) return
          this.api = api
          this.api.asc_registerCallback(
            "asc_onSendThemeColors",
            _.bind(this.onSendThemeColors, this),
          )
          return this
        },

        setMode: function (mode) {
          this.mode = mode
        },

        updateMetricUnit: function () {
          if (this.spinners) {
            for (let i = 0; i < this.spinners.length; i++) {
              const spinner = this.spinners[i]
              spinner.setDefaultUnit(Common.Utils.Metric.getCurrentMetricName())
              spinner.setStep(
                Common.Utils.Metric.getCurrentMetric() === Common.Utils.Metric.c_MetricUnits.pt
                  ? 1
                  : 0.1,
              )
            }
            this.spnWidth?.setValue(
              this._state.Width !== null
                ? Common.Utils.Metric.fnRecalcFromMM(this._state.Width)
                : "",
              true,
            )
            this.spnHeight?.setValue(
              this._state.Height !== null
                ? Common.Utils.Metric.fnRecalcFromMM(this._state.Height)
                : "",
              true,
            )
            this.spnColWidth?.setValue(
              this._state.ColWidth !== null
                ? Common.Utils.Metric.fnRecalcFromMM(this._state.ColWidth)
                : "",
              true,
            )
            this.spnColHeight?.setValue(
              this._state.ColHeight !== null
                ? Common.Utils.Metric.fnRecalcFromMM(this._state.ColHeight)
                : "",
              true,
            )
            let val = this._state.PosHor
            this.spnHor?.setValue(
              val !== null && val !== undefined ? Common.Utils.Metric.fnRecalcFromMM(val) : "",
              true,
            )
            val = this._state.PosVert
            this.spnVert?.setValue(
              val !== null && val !== undefined ? Common.Utils.Metric.fnRecalcFromMM(val) : "",
              true,
            )
          }
        },

        createDelayedControls: function () {
          this.spnWidth = new Common.UI.MetricSpinner({
            el: $("#slicer-spin-width"),
            step: 0.1,
            width: 78,
            defaultUnit: "cm",
            value: "0 cm",
            maxValue: 5963.9,
            minValue: 0,
            dataHint: "1",
            dataHintDirection: "bottom",
            dataHintOffset: "big",
            ariaLabel: this.textWidth,
          })
          this.spinners.push(this.spnWidth)
          this.sizeControls.push(this.spnWidth)

          this.spnHeight = new Common.UI.MetricSpinner({
            el: $("#slicer-spin-height"),
            step: 0.1,
            width: 78,
            defaultUnit: "cm",
            value: "0 cm",
            maxValue: 5963.9,
            minValue: 0,
            dataHint: "1",
            dataHintDirection: "bottom",
            dataHintOffset: "big",
            ariaLabel: this.textHeight,
          })
          this.spinners.push(this.spnHeight)
          this.sizeControls.push(this.spnHeight)

          this.btnRatio = new Common.UI.Button({
            parentEl: $("#slicer-button-ratio"),
            cls: "btn-toolbar",
            iconCls: "toolbar__icon btn-advanced-ratio",
            style: "margin-bottom: 1px;",
            enableToggle: true,
            hint: this.textKeepRatio,
            dataHint: "1",
            dataHintDirection: "bottom",
            dataHintOffset: "big",
          })
          this.sizeControls.push(this.btnRatio)

          this.btnRatio.on(
            "click",
            _.bind(function (btn, e) {
              if (btn.pressed && this.spnHeight.getNumberValue() > 0) {
                this._nRatio = this.spnWidth.getNumberValue() / this.spnHeight.getNumberValue()
              }
              if (this.api) {
                if (this._originalProps) {
                  this._originalProps.asc_putLockAspect(btn.pressed)
                  this.api.asc_setGraphicObjectProps(this._originalProps)
                }
              }
              Common.NotificationCenter.trigger("edit:complete", this)
            }, this),
          )

          this.spnWidth.on("change", _.bind(this.onWidthChange, this))
          this.spnHeight.on("change", _.bind(this.onHeightChange, this))
          this.spnWidth.on("inputleave", () => {
            Common.NotificationCenter.trigger("edit:complete", this)
          })
          this.spnHeight.on("inputleave", () => {
            Common.NotificationCenter.trigger("edit:complete", this)
          })

          this.spnHor = new Common.UI.MetricSpinner({
            el: $("#slicer-spin-hor"),
            step: 0.1,
            width: 85,
            defaultUnit: "cm",
            value: "0 cm",
            maxValue: 5963.9,
            minValue: 0,
            dataHint: "1",
            dataHintDirection: "bottom",
            dataHintOffset: "big",
            ariaLabel: `${this.textPosition} ${this.textHor}`,
          })
          this.spinners.push(this.spnHor)
          this.sizeControls.push(this.spnHor)

          this.spnVert = new Common.UI.MetricSpinner({
            el: $("#slicer-spin-vert"),
            step: 0.1,
            width: 85,
            defaultUnit: "cm",
            value: "0 cm",
            maxValue: 5963.9,
            minValue: 0,
            dataHint: "1",
            dataHintDirection: "bottom",
            dataHintOffset: "big",
            ariaLabel: `${this.textPosition} ${this.textVert}`,
          })
          this.spinners.push(this.spnVert)
          this.sizeControls.push(this.spnVert)

          this.spnHor.on("change", _.bind(this.onHorChange, this))
          this.spnVert.on("change", _.bind(this.onVertChange, this))
          this.spnHor.on("inputleave", () => {
            Common.NotificationCenter.trigger("edit:complete", this)
          })
          this.spnVert.on("inputleave", () => {
            Common.NotificationCenter.trigger("edit:complete", this)
          })

          this.chLock = new Common.UI.CheckBox({
            el: $("#slicer-checkbox-disable-resize"),
            labelText: this.textLock,
            disabled: this._locked,
            dataHint: "1",
            dataHintDirection: "left",
            dataHintOffset: "small",
          })
          this.lockedControls.push(this.chLock)
          this.chLock.on("change", this.onLockSlicerChange.bind(this))

          this.spnColWidth = new Common.UI.MetricSpinner({
            el: $("#slicer-spin-col-width"),
            step: 0.1,
            width: 85,
            defaultUnit: "cm",
            value: "0 cm",
            maxValue: 5963.9,
            minValue: 0,
            dataHint: "1",
            dataHintDirection: "bottom",
            dataHintOffset: "big",
            ariaLabel: `${this.textColumns} ${this.textWidth}`,
          })
          this.spinners.push(this.spnColWidth)
          this.sizeControls.push(this.spnColWidth)

          this.spnColHeight = new Common.UI.MetricSpinner({
            el: $("#slicer-spin-col-height"),
            step: 0.1,
            width: 85,
            defaultUnit: "cm",
            value: "0 cm",
            maxValue: 5963.9,
            minValue: 0,
            dataHint: "1",
            dataHintDirection: "bottom",
            dataHintOffset: "big",
            ariaLabel: `${this.textColumns} ${this.textHeight}`,
          })
          this.spinners.push(this.spnColHeight)
          this.sizeControls.push(this.spnColHeight)

          this.numCols = new Common.UI.MetricSpinner({
            el: $("#slicer-spin-cols"),
            step: 1,
            width: 55,
            defaultUnit: "",
            defaultValue: 1,
            value: "1",
            allowDecimal: false,
            maxValue: 20000,
            minValue: 1,
            dataHint: "1",
            dataHintDirection: "bottom",
            dataHintOffset: "big",
            ariaLabel: this.textColumns,
          })
          this.sizeControls.push(this.numCols)

          this.spnColWidth.on("change", _.bind(this.onColWidthChange, this))
          this.spnColHeight.on("change", _.bind(this.onColHeightChange, this))
          this.numCols.on("change", _.bind(this.onColChange, this))
          this.spnColWidth.on("inputleave", () => {
            Common.NotificationCenter.trigger("edit:complete", this)
          })
          this.spnColHeight.on("inputleave", () => {
            Common.NotificationCenter.trigger("edit:complete", this)
          })
          this.numCols.on("inputleave", () => {
            Common.NotificationCenter.trigger("edit:complete", this)
          })

          // Sorting & Filtering

          this.radioAsc = new Common.UI.RadioBox({
            el: $("#slicer-radio-asc"),
            name: "asc-radio-slicer-sort",
            labelText: `${this.textAsc} (${this.textAZ})`,
            checked: true,
            dataHint: "1",
            dataHintDirection: "left",
            dataHintOffset: "small",
          })
          this.radioAsc.on(
            "change",
            _.bind(function (field, newValue, eOpts) {
              if (newValue && this.api) {
                if (this._originalProps) {
                  this._originalProps
                    .asc_getSlicerProperties()
                    .asc_setSortOrder(Asc.ST_tabularSlicerCacheSortOrder.Ascending)
                  this.api.asc_setGraphicObjectProps(this._originalProps)
                }
                Common.NotificationCenter.trigger("edit:complete", this)
              }
            }, this),
          )
          this.lockedControls.push(this.radioAsc)

          this.radioDesc = new Common.UI.RadioBox({
            el: $("#slicer-radio-desc"),
            name: "asc-radio-slicer-sort",
            labelText: `${this.textDesc} (${this.textZA})`,
            checked: false,
            dataHint: "1",
            dataHintDirection: "left",
            dataHintOffset: "small",
          })
          this.radioDesc.on(
            "change",
            _.bind(function (field, newValue, eOpts) {
              if (newValue && this.api) {
                if (this._originalProps) {
                  this._originalProps
                    .asc_getSlicerProperties()
                    .asc_setSortOrder(Asc.ST_tabularSlicerCacheSortOrder.Descending)
                  this.api.asc_setGraphicObjectProps(this._originalProps)
                }
                Common.NotificationCenter.trigger("edit:complete", this)
              }
            }, this),
          )
          this.lockedControls.push(this.radioDesc)

          this.chHideNoData = new Common.UI.CheckBox({
            el: $("#slicer-check-hide-nodata"),
            labelText: this.strHideNoData,
            dataHint: "1",
            dataHintDirection: "left",
            dataHintOffset: "small",
          })
          this.chHideNoData.on(
            "change",
            _.bind(function (field, newValue, oldValue, eOpts) {
              const checked = field.getValue() === "checked"
              if (this._originalProps && this.api) {
                this._originalProps.asc_getSlicerProperties().asc_setHideItemsWithNoData(checked)
                this.api.asc_setGraphicObjectProps(this._originalProps)
              }
              Common.NotificationCenter.trigger("edit:complete", this)
            }, this),
          )
          this.lockedControls.push(this.chHideNoData)

          this.chIndNoData = new Common.UI.CheckBox({
            el: $("#slicer-check-indicate-nodata"),
            labelText: this.strIndNoData,
            dataHint: "1",
            dataHintDirection: "left",
            dataHintOffset: "small",
          })
          this.chIndNoData.on(
            "change",
            _.bind(function (field, newValue, oldValue, eOpts) {
              const checked = field.getValue() === "checked"
              if (this._originalProps && this.api) {
                this._originalProps
                  .asc_getSlicerProperties()
                  .asc_setIndicateItemsWithNoData(checked)
                this.api.asc_setGraphicObjectProps(this._originalProps)
              }
              Common.NotificationCenter.trigger("edit:complete", this)
            }, this),
          )
          this.lockedControls.push(this.chIndNoData)

          this.chShowNoData = new Common.UI.CheckBox({
            el: $("#slicer-check-show-nodata-last"),
            disabled: true,
            labelText: this.strShowNoData,
            dataHint: "1",
            dataHintDirection: "left",
            dataHintOffset: "small",
          })
          this.chShowNoData.on(
            "change",
            _.bind(function (field, newValue, oldValue, eOpts) {
              if (this._originalProps && this.api) {
                this._originalProps
                  .asc_getSlicerProperties()
                  .asc_setShowItemsWithNoDataLast(field.getValue() === "checked")
                this.api.asc_setGraphicObjectProps(this._originalProps)
              }
              Common.NotificationCenter.trigger("edit:complete", this)
            }, this),
          )
          this.lockedControls.push(this.chShowNoData)

          this.chShowDel = new Common.UI.CheckBox({
            el: $("#slicer-check-show-deleted"),
            labelText: this.strShowDel,
            dataHint: "1",
            dataHintDirection: "left",
            dataHintOffset: "small",
          })
          this.chShowDel.on(
            "change",
            _.bind((field, newValue, oldValue, eOpts) => {
              // if (this._originalProps && this.api) {
              //     this._originalProps.asc_getSlicerProperties().asc_setIndicateItemsWithNoData(field.getValue()=='checked');
              //     this.api.asc_setGraphicObjectProps(this._originalProps);
              // }
            }, this),
          )
          this.lockedControls.push(this.chShowDel)

          $(this.el).on("click", "#slicer-advanced-link", _.bind(this.openAdvancedSettings, this))
        },

        createDelayedElements: function () {
          this.createDelayedControls()
          this.updateMetricUnit()
          this._initSettings = false
        },

        onSendThemeColors: function () {
          // get new table templates
          if (this.btnSlicerStyle && this._originalProps) {
            this.onInitStyles(this._originalProps.asc_getSlicerProperties().asc_getStylesPictures())
          }
        },

        openAdvancedSettings: function (e) {
          if (this.linkAdvanced.hasClass("disabled")) return
          let win
          if (this.api && !this._locked) {
            const selectedElements = this.api.asc_getGraphicObjectProps()
            if (selectedElements && selectedElements.length > 0) {
              let elType
              let elValue
              for (let i = selectedElements.length - 1; i >= 0; i--) {
                elType = selectedElements[i].asc_getObjectType()
                elValue = selectedElements[i].asc_getObjectValue()
                if (Asc.c_oAscTypeSelectElement.Image === elType) {
                  new SSE.Views.SlicerSettingsAdvanced({
                    imageProps: elValue,
                    api: this.api,
                    styles:
                      this.styles ||
                      this._originalProps.asc_getSlicerProperties().asc_getStylesPictures(),
                    handler: (result, value) => {
                      if (result === "ok") {
                        if (this.api) {
                          this.api.asc_setGraphicObjectProps(value.imageProps)
                        }
                      }
                      Common.NotificationCenter.trigger("edit:complete", this)
                    },
                  }).show()
                  break
                }
              }
            }
          }
        },

        ChangeSettings: function (props) {
          if (this._initSettings) this.createDelayedElements()

          if (props) {
            this._originalProps = new Asc.asc_CImgProperty(props)

            let value = props.asc_getWidth()
            if (
              Math.abs(this._state.Width - value) > 0.001 ||
              ((this._state.Width === null || value === null) && this._state.Width !== value)
            ) {
              this.spnWidth.setValue(
                value !== null ? Common.Utils.Metric.fnRecalcFromMM(value) : "",
                true,
              )
              this._state.Width = value
            }

            value = props.asc_getHeight()
            if (
              Math.abs(this._state.Height - value) > 0.001 ||
              ((this._state.Height === null || value === null) && this._state.Height !== value)
            ) {
              this.spnHeight.setValue(
                value !== null ? Common.Utils.Metric.fnRecalcFromMM(value) : "",
                true,
              )
              this._state.Height = value
            }

            if (props.asc_getHeight() > 0)
              this._nRatio = props.asc_getWidth() / props.asc_getHeight()

            value = props.asc_getLockAspect()
            if (this._state.keepRatio !== value) {
              this.btnRatio.toggle(value)
              this._state.keepRatio = value
            }

            value = props.get_Position()
            if (value) {
              const Position = { X: value.get_X(), Y: value.get_Y() }
              this.spnHor.setValue(
                Position.X !== null && Position.X !== undefined
                  ? Common.Utils.Metric.fnRecalcFromMM(Position.X)
                  : "",
                true,
              )
              this.spnVert.setValue(
                Position.Y !== null && Position.Y !== undefined
                  ? Common.Utils.Metric.fnRecalcFromMM(Position.Y)
                  : "",
                true,
              )
              this._state.PosHor = Position.X
              this._state.PosVert = Position.Y
            } else {
              this.spnHor.setValue("", true)
              this.spnVert.setValue("", true)
              this._state.PosHor = this._state.PosVert = null
            }

            const slicerprops = props.asc_getSlicerProperties()
            this.disableControls(
              this._locked,
              slicerprops ? slicerprops.asc_getLockedPosition() : false,
            )

            if (slicerprops) {
              value = slicerprops.asc_getColumnCount()
              if (
                Math.abs(this._state.ColCount - value) > 0.1 ||
                ((this._state.ColCount === null || value === null) &&
                  this._state.ColCount !== value)
              ) {
                this.numCols.setValue(value !== null ? value : "", true)
                this._state.ColCount = value
              }

              value = slicerprops.asc_getButtonWidth() / 36000
              if (
                Math.abs(this._state.ColWidth - value) > 0.001 ||
                ((this._state.ColWidth === null || value === null) &&
                  this._state.ColWidth !== value)
              ) {
                this.spnColWidth.setValue(
                  value !== null ? Common.Utils.Metric.fnRecalcFromMM(value) : "",
                  true,
                )
                this._state.ColWidth = value
              }

              value = slicerprops.asc_getRowHeight() / 36000
              if (
                Math.abs(this._state.ColHeight - value) > 0.001 ||
                ((this._state.ColHeight === null || value === null) &&
                  this._state.ColHeight !== value)
              ) {
                this.spnColHeight.setValue(
                  value !== null ? Common.Utils.Metric.fnRecalcFromMM(value) : "",
                  true,
                )
                this._state.ColHeight = value
              }

              if (!this.btnSlicerStyle) this.onInitStyles(slicerprops.asc_getStylesPictures())
              value = slicerprops.asc_getStyle()
              if (this._state.StyleType !== value || this._isTemplatesChanged) {
                this.btnSlicerStyle.suspendEvents()
                const rec = this.btnSlicerStyle.menuPicker.store.findWhere({ type: value })
                this.btnSlicerStyle.menuPicker.selectRecord(rec)
                this.btnSlicerStyle.resumeEvents()
                if (rec)
                  this.btnSlicerStyle.fillComboView(
                    this.btnSlicerStyle.menuPicker.getSelectedRec(),
                    true,
                  )
                else
                  this.btnSlicerStyle.fillComboView(
                    this.btnSlicerStyle.menuPicker.store.at(0),
                    true,
                  )

                this._state.StyleType = value
              }
              this._isTemplatesChanged = false

              value = slicerprops.asc_getLockedPosition()
              this.chLock.setValue(
                value !== null && value !== undefined ? !!value : "indeterminate",
                true,
              )

              // depends of data type
              // this.radioAsc.setCaption(this.textAsc + ' (' + this.textAZ + ')' );
              // this.radioDesc.setCaption(this.textDesc + ' (' + this.textZA + ')' );
              value = slicerprops.asc_getSortOrder()
              value === Asc.ST_tabularSlicerCacheSortOrder.Ascending
                ? this.radioAsc.setValue(true, true)
                : this.radioDesc.setValue(true, true)

              value = slicerprops.asc_getIndicateItemsWithNoData()
              if (this._state.IndNoData !== value) {
                this.chIndNoData.setValue(
                  value !== null && value !== undefined ? !!value : "indeterminate",
                  true,
                )
                this._state.IndNoData = value
              }

              value = slicerprops.asc_getShowItemsWithNoDataLast()
              if (this._state.ShowNoData !== value) {
                this.chShowNoData.setValue(
                  value !== null && value !== undefined ? !!value : "indeterminate",
                  true,
                )
                this._state.ShowNoData = value
              }

              value = slicerprops.asc_getHideItemsWithNoData()
              if (this._state.HideNoData !== value) {
                this.chHideNoData.setValue(
                  value !== null && value !== undefined ? !!value : "indeterminate",
                  true,
                )
                this._state.HideNoData = value
              }

              this.chIndNoData.setDisabled(value || this._locked)
              this.chShowNoData.setDisabled(
                value || this.chIndNoData.getValue() !== "checked" || this._locked,
              )
              this.chShowDel.setDisabled(value || this._locked)

              // value = slicerprops.asc_getShowDeleted();
              // if ( this._state.ShowDel!==value ) {
              //     this.chShowDel.setValue((value !== null && value !== undefined) ? !!value : 'indeterminate', true);
              //     this._state.ShowDel=value;
              // }
            }
          }
        },

        onWidthChange: function (field, newValue, oldValue, eOpts) {
          let w = field.getNumberValue()
          let h = this.spnHeight.getNumberValue()
          if (this.btnRatio.pressed) {
            h = w / this._nRatio
            if (h > this.spnHeight.options.maxValue) {
              h = this.spnHeight.options.maxValue
              w = h * this._nRatio
              this.spnWidth.setValue(w, true)
            }
            this.spnHeight.setValue(h, true)
          }
          if (this.api) {
            if (this._originalProps) {
              this._originalProps.asc_putWidth(Common.Utils.Metric.fnRecalcToMM(w))
              this._originalProps.asc_putHeight(Common.Utils.Metric.fnRecalcToMM(h))
              this.api.asc_setGraphicObjectProps(this._originalProps)
            }
          }
          Common.NotificationCenter.trigger("edit:complete", this)
        },

        onHeightChange: function (field, newValue, oldValue, eOpts) {
          let h = field.getNumberValue()
          let w = this.spnWidth.getNumberValue()
          if (this.btnRatio.pressed) {
            w = h * this._nRatio
            if (w > this.spnWidth.options.maxValue) {
              w = this.spnWidth.options.maxValue
              h = w / this._nRatio
              this.spnHeight.setValue(h, true)
            }
            this.spnWidth.setValue(w, true)
          }
          if (this.api) {
            if (this._originalProps) {
              this._originalProps.asc_putWidth(Common.Utils.Metric.fnRecalcToMM(w))
              this._originalProps.asc_putHeight(Common.Utils.Metric.fnRecalcToMM(h))
              this.api.asc_setGraphicObjectProps(this._originalProps)
            }
          }
          Common.NotificationCenter.trigger("edit:complete", this)
        },

        onHorChange: function (field, newValue, oldValue, eOpts) {
          const Position = new Asc.CPosition()
          if (field.getValue() !== "")
            Position.put_X(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()))
          if (this.spnVert.getValue() !== "")
            Position.put_Y(Common.Utils.Metric.fnRecalcToMM(this.spnVert.getNumberValue()))

          if (this.api) {
            if (this._originalProps) {
              this._originalProps.put_Position(Position)
              this.api.asc_setGraphicObjectProps(this._originalProps)
            }
          }
          Common.NotificationCenter.trigger("edit:complete", this)
        },

        onVertChange: function (field, newValue, oldValue, eOpts) {
          const Position = new Asc.CPosition()
          if (this.spnHor.getValue() !== "")
            Position.put_X(Common.Utils.Metric.fnRecalcToMM(this.spnHor.getNumberValue()))
          if (field.getValue() !== "")
            Position.put_Y(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()))

          if (this.api) {
            if (this._originalProps) {
              this._originalProps.put_Position(Position)
              this.api.asc_setGraphicObjectProps(this._originalProps)
            }
          }
          Common.NotificationCenter.trigger("edit:complete", this)
        },

        onColWidthChange: function (field, newValue, oldValue, eOpts) {
          if (this.api) {
            if (this._originalProps) {
              this._originalProps
                .asc_getSlicerProperties()
                .asc_setButtonWidth(
                  Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()) * 36000,
                )
              this.api.asc_setGraphicObjectProps(this._originalProps)
            }
          }
          Common.NotificationCenter.trigger("edit:complete", this)
        },

        onColHeightChange: function (field, newValue, oldValue, eOpts) {
          if (this.api) {
            if (this._originalProps) {
              this._originalProps
                .asc_getSlicerProperties()
                .asc_setRowHeight(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()) * 36000)
              this.api.asc_setGraphicObjectProps(this._originalProps)
            }
          }
          Common.NotificationCenter.trigger("edit:complete", this)
        },

        onColChange: function (field, newValue, oldValue, eOpts) {
          if (this.api) {
            if (this._originalProps) {
              this._originalProps
                .asc_getSlicerProperties()
                .asc_setColumnCount(field.getNumberValue())
              this.api.asc_setGraphicObjectProps(this._originalProps)
            }
          }
          Common.NotificationCenter.trigger("edit:complete", this)
        },

        onInitStyles: function (Templates) {
          this._isTemplatesChanged = true
          this.styles = Templates

          if (!this.btnSlicerStyle) {
            this.btnSlicerStyle = new Common.UI.ComboDataView({
              itemWidth: 36,
              itemHeight: 48,
              menuMaxHeight: 235,
              enableKeyEvents: true,
              cls: "combo-slicer-style",
              dataHint: "1",
              dataHintDirection: "bottom",
              dataHintOffset: "big",
              ariaLabel: this.textStyle,
              fillOnChangeVisibility: true,
            })
            this.btnSlicerStyle.render($("#slicer-btn-style"))
            this.btnSlicerStyle.on("click", _.bind(this.onSelectSlicerStyle, this))
            this.btnSlicerStyle.openButton.menu.on("show:after", () => {
              this.btnSlicerStyle.menuPicker.scroller.update({ alwaysVisibleY: true })
            })
            this.lockedControls.push(this.btnSlicerStyle)
            if (this._locked) this.btnSlicerStyle.setDisabled(this._locked)
          }

          if (Templates && Templates.length > 0) {
            const stylesStore = this.btnSlicerStyle.menuPicker.store
            if (stylesStore) {
              const count = stylesStore.length
              if (count > 0 && count === this.styles.length) {
                const data = stylesStore.models
                _.each(Templates, (style, index) => {
                  data[index].set("imageUrl", style.asc_getImage())
                })
              } else {
                const stylearray = []
                const selectedIdx = -1
                _.each(Templates, (item, index) => {
                  stylearray.push({
                    type: item.asc_getName(),
                    imageUrl: item.asc_getImage(),
                  })
                })
                stylesStore.reset(stylearray, { silent: false })
              }
            }
          } else {
            this.btnSlicerStyle.menuPicker.store.reset()
            this.btnSlicerStyle.clearComboView()
          }
          this.btnSlicerStyle.setDisabled(
            this.btnSlicerStyle.menuPicker.store.length < 1 || this._locked,
          )
        },

        onSelectSlicerStyle: function (combo, record) {
          if (this._noApply) return

          if (this._originalProps) {
            this._originalProps.asc_getSlicerProperties().asc_setStyle(record.get("type"))
            this.api.asc_setGraphicObjectProps(this._originalProps)
          }
          Common.NotificationCenter.trigger("edit:complete", this)
        },

        onLockSlicerChange: function (field, newValue, oldValue, eOpts) {
          if (this.api) {
            if (this._originalProps) {
              this._originalProps
                .asc_getSlicerProperties()
                .asc_setLockedPosition(field.getValue() === "checked")
              this.api.asc_setGraphicObjectProps(this._originalProps)
            }
          }
          Common.NotificationCenter.trigger("edit:complete", this)
        },

        setLocked: function (locked) {
          this._locked = locked
        },

        disableControls: function (disable, disableSize) {
          if (this._initSettings) return

          this.disableSizeControls(disable || disableSize)
          if (this._state.DisabledControls !== disable) {
            this._state.DisabledControls = disable
            _.each(this.lockedControls, (item) => {
              item.setDisabled(disable)
            })
            this.linkAdvanced.toggleClass("disabled", disable)
          }
        },

        disableSizeControls: function (disable) {
          if (this._state.DisabledSizeControls !== disable) {
            this._state.DisabledSizeControls = disable
            _.each(this.sizeControls, (item) => {
              item.setDisabled(disable)
            })
          }
        },

        textKeepRatio: "Constant Proportions",
        textSize: "Size",
        textWidth: "Width",
        textHeight: "Height",
        textAdvanced: "Show advanced settings",
        textPosition: "Position",
        textHor: "Horizontal",
        textVert: "Vertical",
        textButtons: "Buttons",
        textColumns: "Columns",
        textStyle: "Style",
        textLock: "Disable resizing or moving",
        strSorting: "Sorting and filtering",
        textAsc: "Ascending",
        textDesc: "Descending",
        textAZ: "A to Z",
        textZA: "Z to A",
        textOldNew: "oldest to newest",
        textNewOld: "newest to oldest",
        textSmallLarge: "smallest to largest",
        textLargeSmall: "largest to smallest",
        strHideNoData: "Hide items with no data",
        strIndNoData: "Visually indicate items with no data",
        strShowNoData: "Show items with no data last",
        strShowDel: "Show items deleted from the data source",
      },
      SSE.Views.SlicerSettings || {},
    ),
  )
})
