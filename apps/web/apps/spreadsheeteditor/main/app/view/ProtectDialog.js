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
 *  ProtectDialog.js
 *
 *  Created on 21.06.2021
 *
 */

define([], () => {
  SSE.Views.ProtectDialog = Common.UI.Window.extend(
    _.extend(
      {
        initialize: function (options) {
          const _options = {}

          _.extend(
            _options,
            {
              title: options.title
                ? options.title
                : options.type === "sheet"
                  ? this.txtSheetTitle
                  : this.txtWBTitle,
              cls: "modal-dlg",
              width: options.type === "sheet" ? 380 : 350,
              height: "auto",
              buttons: options.buttons
                ? options.buttons
                : [
                    {
                      value: "ok",
                      caption: this.txtProtect,
                    },
                    "cancel",
                  ],
            },
            options,
          )

          this.handler = options.handler
          this.txtDescription = options.txtDescription || ""
          this.type = options.type || "workbook"
          this.props = options.props
          this.names = options.names
          this.isEdit = options.isEdit
          this.api = options.api
          this.winId = Common.UI.getId()

          this.template =
            options.template ||
            [
              '<div class="box">',
              '<% if (type=="range") { %>',
              '<div class="input-row">',
              `<label>${this.txtRangeName}</label>`,
              "</div>",
              `<div id="${this.winId}-id-range-name-txt" class="input-row" style="margin-bottom: 5px;"></div>`,
              '<div class="input-row">',
              `<label>${this.txtRange}</label>`,
              "</div>",
              `<div id="${this.winId}-id-range-txt" class="input-row" style="margin-bottom: 10px;"></div>`,
              '<% } else if (type=="sheet") { %>',
              '<div class="" style="margin-bottom: 10px;">',
              `<label>${this.txtSheetDescription} ${this.txtAllowDescription}</label>`,
              "</div>",
              `<button type="button" class="btn btn-text-default auto" id="${this.winId}-id-range-btn-allow" style="min-width: 100px;margin-bottom: 15px;">${this.txtAllowRanges}</button>`,
              "<% } else { %>",
              '<div class="" style="margin-bottom: 10px;">',
              `<label>${this.txtWBDescription}</label>`,
              "</div>",
              "<% } %>",
              '<% if (type=="sheet") { %>',
              '<table cols="2" style="width: 100%;">',
              "<tr>",
              '<td class="padding-right-5" style="width:50%;">',
              `<label class="input-label">${this.txtPassword} (${this.txtOptional})</label>`,
              `<div id="${this.winId}-id-password-txt" class="input-row" style="width: 100%;margin-bottom: 10px;"></div>`,
              "</td>",
              '<td class="padding-left-5" style="width:50%;">',
              `<label class="input-label">${this.txtRepeat}</label>`,
              `<div id="${this.winId}-id-repeat-txt" class="input-row" style="width: 100%;margin-bottom: 10px;"></div>`,
              "</td>",
              "</tr>",
              "<tr>",
              '<td colspan="2" style="padding-bottom: 10px;">',
              `<label class="light">${this.txtWarning}</label>`,
              "</td>",
              "</tr>",
              "</table>",
              '<div class="input-row">',
              `<label>${this.txtAllow}</label>`,
              "</div>",
              `<div id="${this.winId}-protect-dlg-options" class="" style="width: 100%; height: 116px; overflow: hidden;"></div>`,
              "<% } else { %>",
              '<div class="input-row">',
              `<label>${this.txtPassword} (${this.txtOptional})</label>`,
              "</div>",
              `<div id="${this.winId}-id-password-txt" class="input-row" style="margin-bottom: 5px;"></div>`,
              '<div class="input-row">',
              `<label>${this.txtRepeat}</label>`,
              "</div>",
              `<div id="${this.winId}-id-repeat-txt" class="input-row" style="margin-bottom: 10px;"></div>`,
              `<label class="light">${this.txtWarning}</label>`,
              "<% } %>",
              "</div>",
            ].join("")

          _options.tpl = _.template(this.template)(_options)

          Common.UI.Window.prototype.initialize.call(this, _options)
        },
        render: function () {
          Common.UI.Window.prototype.render.call(this)
          this.$window.find(".dlg-btn").on("click", _.bind(this.onBtnClick, this))

          this.repeatPwd = new Common.UI.InputField({
            el: $(`#${this.winId}-id-repeat-txt`),
            type: "password",
            allowBlank: true,
            style: "width: 100%;",
            maxLength: 255,
            validateOnBlur: false,
            validation: (value) => this.txtIncorrectPwd,
          })

          this.inputPwd = new Common.UI.InputFieldBtnPassword({
            el: $(`#${this.winId}-id-password-txt`),
            type: "password",
            allowBlank: true,
            style: "width: 100%;",
            maxLength: 255,
            validateOnBlur: false,
            repeatInput: this.repeatPwd,
            showPwdOnClick: false,
          })

          if (this.type === "sheet") {
            this.optionsList = new Common.UI.ListView({
              el: $(`#${this.winId}-protect-dlg-options`, this.$window),
              store: new Common.UI.DataViewStore(),
              simpleAddMode: true,
              scrollAlwaysVisible: true,
              template: _.template(
                ['<div class="listview inner protect-sheet-options" style=""></div>'].join(""),
              ),
              itemTemplate: _.template(
                [
                  '<div class="has-checkbox">',
                  Common.UI.CheckBoxTemplate,
                  '<div id="<%= id %>" class="list-item margin-left-20">',
                  '<div style="flex-grow: 1;"><%= Common.Utils.String.htmlEncode(value) %></div>',
                  "</div>",
                  "</div>",
                ].join(""),
              ),
              tabindex: 1,
            })
            this.optionsList.on({
              "item:change": this.onItemChanged.bind(this),
              "item:add": this.onItemChanged.bind(this),
              "item:select": this.onCellCheck.bind(this),
            })
            this.optionsList.onKeyDown = _.bind(this.onListKeyDown, this)
            this.optionsList.on("entervalue", _.bind(this.onPrimary, this))

            this.btnAllowRanges = new Common.UI.Button({
              el: $(`#${this.winId}-id-range-btn-allow`, this.$window),
            })
            this.btnAllowRanges.on("click", _.bind(this.onAllowRangesClick, this, false))
          }

          if (this.type === "range") {
            this.inputRangeName = new Common.UI.InputField({
              el: $(`#${this.winId}-id-range-name-txt`),
              allowBlank: false,
              blankError: this.txtEmpty,
              style: "width: 100%;",
              maxLength: 255,
              validateOnBlur: false,
              validateOnChange: false,
              validation: (value) => {
                if (value === "") return true

                const res = this.api.asc_checkProtectedRangeName(value)
                switch (res) {
                  case Asc.c_oAscDefinedNameReason.WrongName:
                    return this.textInvalidName
                    break
                  case Asc.c_oAscDefinedNameReason.Existed:
                    return this.isEdit &&
                      this.props.asc_getName().toLowerCase() === value.toLowerCase()
                      ? true
                      : this.textExistName
                  case Asc.c_oAscDefinedNameReason.OK: {
                    const index = this.names.indexOf(value.toLowerCase())
                    return index < 0 ||
                      (this.isEdit &&
                        this.props.asc_getName().toLowerCase() === value.toLowerCase())
                      ? true
                      : this.textExistName
                  }
                  default:
                    return this.textInvalidName
                }
              },
            })
            this.txtDataRange = new Common.UI.InputFieldBtn({
              el: $(`#${this.winId}-id-range-txt`),
              name: "range",
              style: "width: 100%;",
              allowBlank: false,
              btnHint: this.textSelectData,
              blankError: this.txtEmpty,
              validateOnChange: true,
              validateOnBlur: false,
              validation: (value) => {
                const isvalid = this.api.asc_checkDataRange(
                  Asc.c_oAscSelectionDialogType.ConditionalFormattingRule,
                  value,
                  true,
                )
                return isvalid !== Asc.c_oAscError.ID.DataRangeError ? true : this.textInvalidRange
              },
            })
            this.txtDataRange.on("button:click", _.bind(this.onSelectData, this))
          }
          this.afterRender()
        },

        getFocusedComponents: function () {
          let arr = []
          this.type === "range" && (arr = arr.concat([this.inputRangeName, this.txtDataRange]))
          arr = arr.concat([this.inputPwd, this.repeatPwd])
          this.type === "sheet" &&
            (arr = [this.btnAllowRanges].concat(arr).concat([this.optionsList]))
          return arr.concat(this.getFooterButtons())
        },

        getDefaultFocusableComponent: function () {
          return this.type === "range" ? this.inputRangeName : this.inputPwd
        },

        afterRender: function () {
          this._setDefaults(this.props)
        },

        onPrimary: function (event) {
          this._handleInput("ok")
          return false
        },

        onBtnClick: function (event) {
          this._handleInput(event.currentTarget.attributes.result.value)
        },

        _handleInput: function (state) {
          if (this.handler) {
            if (state === "ok") {
              if (this.inputRangeName && this.inputRangeName.checkValidate() !== true) {
                this.inputRangeName.focus()
                return
              }
              if (this.txtDataRange && this.txtDataRange.checkValidate() !== true) {
                this.txtDataRange.focus()
                return
              }
              if (this.inputPwd.checkValidate() !== true) {
                this.inputPwd.focus()
                return
              }
              if (this.inputPwd.getValue() !== this.repeatPwd.getValue()) {
                this.repeatPwd.checkValidate()
                this.repeatPwd.focus()
                return
              }
            }
            this.handler.call(
              this,
              state,
              this.inputPwd.getValue(),
              state === "ok" ? this.getSettings() : undefined,
            )
          }

          this.close()
        },

        _setDefaults: function (props) {
          this.optionsList && this.updateOptionsList(props)
          this.type === "range" && this.updateRangeSettings(props)
        },

        onItemChanged: (view, record) => {
          const state = record.model.get("check")
          if (state === "indeterminate")
            $("input[type=checkbox]", record.$el).prop("indeterminate", true)
          else $("input[type=checkbox]", record.$el).prop({ checked: state, indeterminate: false })
        },

        onCellCheck: function (listView, itemView, record) {
          if (this.checkCellTrigerBlock) return

          let target = ""
          let isLabel = false
          let bound = null

          const event = window.event ? window.event : window._event
          if (event) {
            target = $(event.currentTarget).find(".list-item")

            if (target.length) {
              bound = Common.Utils.getBoundingClientRect(target.get(0))
              const _clientX = event.clientX * Common.Utils.zoom()
              const _clientY = event.clientY * Common.Utils.zoom()
              if (
                bound.left < _clientX &&
                _clientX < bound.right &&
                bound.top < _clientY &&
                _clientY < bound.bottom
              ) {
                isLabel = true
              }
            }

            if (
              isLabel ||
              (event.target.className.match("checkbox") && event.target.localName !== "input")
            ) {
              this.updateCellCheck(listView, record)

              _.delay(
                () => {
                  listView.focus()
                },
                100,
                this,
              )
            }
          }
        },

        onListKeyDown: function (e, data) {
          const record = null
          const listView = this.optionsList

          if (listView.disabled) return
          if (_.isUndefined(undefined)) data = e

          if (data.keyCode === Common.UI.Keys.SPACE) {
            data.preventDefault()
            data.stopPropagation()

            this.updateCellCheck(listView, listView.getSelectedRec())
          } else {
            Common.UI.DataView.prototype.onKeyDown.call(this.optionsList, e, data)
          }
        },

        updateCellCheck: function (listView, record) {
          if (record && listView) {
            record.set("check", !record.get("check"))
            if (record.get("optionName") === "SelectLockedCells" && record.get("check"))
              this.optionsList.store
                .findWhere({ optionName: "SelectUnlockedCells" })
                .set("check", true)
            if (record.get("optionName") === "SelectUnlockedCells" && !record.get("check"))
              this.optionsList.store
                .findWhere({ optionName: "SelectLockedCells" })
                .set("check", false)
            // listView.scroller.update({minScrollbarLength  : 40, alwaysVisibleY: true, suppressScrollX: true});
          }
        },
        updateRangeSettings: function (props) {
          if (props) {
            this.inputRangeName.setValue(props.asc_getName())
            this.txtDataRange.setValue(props.asc_getSqref())
          }
        },

        updateOptionsList: function (props) {
          const optionsArr = [
            { value: this.txtSelLocked, optionName: "SelectLockedCells" },
            { value: this.txtSelUnLocked, optionName: "SelectUnlockedCells" },
            { value: this.txtFormatCells, optionName: "FormatCells" },
            { value: this.txtFormatCols, optionName: "FormatColumns" },
            { value: this.txtFormatRows, optionName: "FormatRows" },
            { value: this.txtInsCols, optionName: "InsertColumns" },
            { value: this.txtInsRows, optionName: "InsertRows" },
            { value: this.txtInsHyper, optionName: "InsertHyperlinks" },
            { value: this.txtDelCols, optionName: "DeleteColumns" },
            { value: this.txtDelRows, optionName: "DeleteRows" },
            { value: this.txtSort, optionName: "Sort" },
            { value: this.txtAutofilter, optionName: "AutoFilter" },
            { value: this.txtPivot, optionName: "PivotTables" },
            { value: this.txtObjs, optionName: "Objects" },
            { value: this.txtScen, optionName: "Scenarios" },
          ]

          const arr = []
          optionsArr.forEach((item, index) => {
            arr.push(
              new Common.UI.DataViewModel({
                selected: false,
                allowSelected: true,
                value: item.value,
                optionName: item.optionName,
                check: props?.[`asc_get${item.optionName}`]
                  ? !props[`asc_get${item.optionName}`]()
                  : false,
              }),
            )
          })

          this.optionsList.store.reset(arr)
          this.optionsList.scroller.update({
            minScrollbarLength: this.optionsList.minScrollbarLength,
            alwaysVisibleY: true,
            suppressScrollX: true,
          })
        },

        getSettings: function () {
          if (this.type === "sheet") return this.getSheetSettings()
          if (this.type === "range") return this.getRangeSettings()
        },

        getSheetSettings: function () {
          const props = this.props ? this.props : new Asc.CSheetProtection()
          this.optionsList.store.each((item, index) => {
            props?.[`asc_set${item.get("optionName")}`] &&
              props[`asc_set${item.get("optionName")}`](!item.get("check"))
          })
          return props
        },

        getRangeSettings: function () {
          const props = this.props ? this.props : new Asc.CProtectedRange()
          props.asc_setName(this.inputRangeName.getValue())
          props.asc_setSqref(this.txtDataRange.getValue())
          return props
        },

        onSelectData: function () {
          if (this.api) {
            const handlerDlg = (dlg, result) => {
              if (result === "ok") {
                this.dataRangeValid = dlg.getSettings()
                this.txtDataRange.setValue(this.dataRangeValid)
                this.txtDataRange.checkValidate()
              }
            }

            const win = new SSE.Views.CellRangeDialog({
              handler: handlerDlg,
            }).on("close", () => {
              this.show()
              _.delay(() => {
                this.txtDataRange.focus()
              }, 1)
            })

            const xy = Common.Utils.getOffset(this.$window)
            this.hide()
            win.show(this.$window, xy)
            win.setSettings({
              api: this.api,
              range:
                !_.isEmpty(this.txtDataRange.getValue()) &&
                this.txtDataRange.checkValidate() === true
                  ? this.txtDataRange.getValue()
                  : this.dataRangeValid,
              type: Asc.c_oAscSelectionDialogType.ConditionalFormattingRule,
              validation: () => true,
            })
          }
        },

        onAllowRangesClick: function () {
          const xy = Common.Utils.getOffset(this.$window)
          const props = this.api.asc_getProtectedRanges()
          const win = new SSE.Views.ProtectRangesDlg({
            api: this.api,
            props: props,
            handler: (result, settings) => {
              if (result === "ok") {
                this.api.asc_setProtectedRanges(settings.arr, settings.deletedArr)
              }
            },
          }).on("close", () => {
            this.show()
            setTimeout(() => {
              this.getDefaultFocusableComponent().focus()
            }, 100)
          })

          this.hide()
          win.show(xy.left - 65, xy.top + 45)
        },

        txtPassword: "Password",
        txtRepeat: "Repeat password",
        txtIncorrectPwd: "Confirmation password is not identical",
        txtWarning:
          "Warning: If you lose or forget the password, it cannot be recovered. Please keep it in a safe place.",
        txtOptional: "optional",
        txtProtect: "Protect",
        txtSelLocked: "Select locked cells",
        txtSelUnLocked: "Select unlocked cells",
        txtFormatCells: "Format cells",
        txtFormatCols: "Format columns",
        txtFormatRows: "Format rows",
        txtInsCols: "Insert columns",
        txtInsRows: "Insert rows",
        txtInsHyper: "Insert hyperlink",
        txtDelCols: "Delete columns",
        txtDelRows: "Delete rows",
        txtSort: "Sort",
        txtAutofilter: "Use AutoFilter",
        txtPivot: "Use PivotTable and PivotChart",
        txtObjs: "Edit objects",
        txtScen: "Edit scenarios",
        txtWBDescription:
          "To prevent other users from viewing hidden worksheets, adding, moving, deleting, or hiding worksheets and renaming worksheets, you can protect the structure of your workbook with a password.",
        txtWBTitle: "Protect Workbook structure",
        txtSheetDescription:
          "Prevent unwanted changes from others by limiting their ability to edit.",
        txtSheetTitle: "Protect Sheet",
        txtAllow: "Allow all users of this sheet to",
        txtRangeName: "Title",
        txtRange: "Range",
        txtEmpty: "This field is required",
        textSelectData: "Select Data",
        textInvalidRange: "ERROR! Invalid cells range",
        textInvalidName:
          "The range title must begin with a letter and may only contain letters, numbers, and spaces.",
        textExistName: "ERROR! Range with such a title already exists",
        txtAllowRanges: "Allow edit ranges",
        txtAllowDescription: "You can unlock specific ranges for editing.",
      },
      SSE.Views.ProtectDialog || {},
    ),
  )
})
