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
 *  OpenDialog.js
 *
 *  Select Codepage for open CSV/TXT format file.
 *
 *  Created on 29/04/14
 *
 */

define(["common/main/lib/component/Window"], () => {
  Common.Views.OpenDialog = Common.UI.Window.extend(
    _.extend(
      {
        applyFunction: undefined,

        initialize: function (options) {
          const _options = {}

          _.extend(
            _options,
            {
              closable: false, // true if save settings
              preview: options.preview,
              warning: options.warning,
              codepages: options.codepages,
              warningMsg: options.warningMsg,
              width: options.preview
                ? 414
                : options.type !== Common.Utils.importTextType.DRM
                  ? 340
                  : options.warning
                    ? 420
                    : 335,
              header: true,
              cls: "modal-dlg open-dlg",
              contentTemplate: "",
              toolcallback: _.bind(this.onToolClose, this),
              closeFile: false,
              buttons: ["ok"]
                .concat(
                  options.closeFile ? [{ value: "cancel", caption: this.closeButtonText }] : [],
                )
                .concat(options.closable ? ["cancel"] : []),
            },
            options,
          )

          this.txtOpenFile = options.txtOpenFile || this.txtOpenFile
          this.isTSV = options.isTSV || false
          this.template =
            options.template ||
            [
              '<div class="box">',
              '<div class="content-panel" >',
              "<% if (type == Common.Utils.importTextType.DRM) { %>",
              "<% if (warning) { %>",
              "<div>",
              '<div class="icon warn"></div>',
              `<div class="padding-left-50"><div style="font-size: 12px;word-break:break-word;">${typeof _options.warningMsg === "string" ? _options.warningMsg : this.txtProtected}</div>`,
              `<label class="header" style="margin-top: 15px;">${this.txtPassword}</label>`,
              '<div id="id-password-txt" style="width: 290px;"></div></div>',
              "</div>",
              "<% } else { %>",
              "<div>",
              `<label class="">${this.txtOpenFile}</label>`,
              '<div id="id-password-txt"></div>',
              "</div>",
              "<% } %>",
              "<% } else { %>",
              "<% if (codepages && codepages.length>0) { %>",
              '<div <% if (!!preview && (type == Common.Utils.importTextType.CSV || type == Common.Utils.importTextType.Paste || type == Common.Utils.importTextType.Columns)) { %> class="margin-right-10" style="width: 230px;display: inline-block;" <% } else { %> style="width: 100%;"<% } %> >',
              `<label class="header">${this.txtEncoding}</label>`,
              "<div>",
              '<div id="id-codepages-combo" class="input-group-nr" style="width: 100%; display: inline-block; vertical-align: middle;"></div>',
              "</div>",
              "</div>",
              "<% } %>",
              "<% if (type == Common.Utils.importTextType.CSV) { %>",
              '<div style="display: inline-block; <% if (!preview) { %> margin-top:15px;<% } %>">',
              `<label class="header">${this.txtDelimiter}</label>`,
              "<div>",
              '<div id="id-delimiters-combo" class="input-group-nr" style="max-width: 100px;display: inline-block; vertical-align: middle;"></div>',
              '<div id="id-delimiter-other" class="input-row margin-left-10" style="display: inline-block; vertical-align: middle;"></div>',
              "</div>",
              "</div>",
              "<% } %>",
              "<% if (type == Common.Utils.importTextType.Paste || type == Common.Utils.importTextType.Columns || type == Common.Utils.importTextType.Data) { %>",
              '<div style="display: inline-block; <% if (codepages && codepages.length>0) { %>margin-top:15px;<% } %>width: 100%;">',
              `<label class="header">${this.txtDelimiter}</label>`,
              '<div class="controll-panel <% if (type == Common.Utils.importTextType.Paste || type == Common.Utils.importTextType.Columns) { %>margin-top<% } %>">',
              "<% if (type == Common.Utils.importTextType.Paste || type == Common.Utils.importTextType.Columns) { %>",
              '<table id="id-delimiters-table">',
              "<tr>",
              "<td>",
              '<div id="id-delimiter-chk-comma"></div>',
              "</td>",
              "<td>",
              '<div id="id-delimiter-chk-tab"></div>',
              "</td>",
              "</tr>",
              "<tr>",
              "<td>",
              '<div id="id-delimiter-chk-semicolon"></div>',
              "</td>",
              "<td>",
              '<div id="id-delimiter-chk-space"></div>',
              "</td>",
              "</tr>",
              "<tr>",
              "<td>",
              '<div id="id-delimiter-chk-colon"></div>',
              "</td>",
              '<td id="id-delimiter-other-row">',
              '<div id="id-delimiter-chk-other"></div>',
              '<div id="id-delimiter-other"></div>',
              "</td>",
              "</tr>",
              "</table>",
              "<% } else { %>",
              '<div id="id-delimiters-combo" class="input-group-nr" style="max-width: 100px;display: inline-block; vertical-align: middle;"></div>',
              '<div id="id-delimiter-other" class="input-row margin-left-10" style="display: inline-block; vertical-align: middle;"></div>',
              "<% } %>",
              `<button type="button" class="btn auto btn-text-default float-right" id="id-delimiters-advanced" style="min-width:100px; display: inline-block;">${this.txtAdvanced}</button>`,
              "</div>",
              "</div>",
              "<% } %>",
              "<% if (!!preview) { %>",
              '<div style="margin-top:15px;">',
              `<label class="header">${this.txtPreview}</label>`,
              '<div style="position: relative;">',
              '<div style="width: 100%;">',
              '<div id="id-preview">',
              "<div>",
              '<div style="position: absolute; top: 0;"><div id="id-preview-data"></div></div>',
              "</div>",
              "</div>",
              "</div>",
              "</div>",
              "</div>",
              "<% } %>",
              "<% if (type == Common.Utils.importTextType.Data) { %>",
              `<label class="header" style="margin-top:15px;">${this.txtDestData}</label>`,
              '<div id="id-open-data-range" class="input-row" style="width: 100%;"></div>',
              "<% } %>",
              "<% } %>",
              "</div>",
              "</div>",
            ].join("")

          this.handler = _options.handler
          this.type = _options.type
          this.preview = _options.preview
          this.previewData = _options.previewData
          this.warning = _options.warning || false
          this.closable = _options.closable
          this.fromToolbar = _options.fromToolbar
          this.codepages = _options.codepages
          this.settings = _options.settings
          this.api = _options.api
          this.validatePwd = _options.validatePwd || false
          this.detectedDelimiter = false

          _options.tpl = _.template(this.template)(_options)

          this._previewTdWidth = []
          this._previewTdMaxLength = 0
          Common.UI.Window.prototype.initialize.call(this, _options)
        },
        render: function () {
          Common.UI.Window.prototype.render.call(this)

          if (this.$window) {
            if (!this.closable) this.$window.find(".tool").hide()
            this.$window.find(".dlg-btn").on("click", _.bind(this.onBtnClick, this))

            this.previewPanel = this.$window.find("#id-preview-data")
            this.previewParent = this.previewPanel.parent()
            this.previewScrolled = this.$window.find("#id-preview")
            this.previewInner = this.previewScrolled.find("> div:first-child")

            if (this.type === Common.Utils.importTextType.DRM) {
              this.inputPwd = new Common.UI.InputFieldBtnPassword({
                el: $("#id-password-txt"),
                type: "password",
                showCls: `${this.options.iconType === "svg" ? "svg-icon" : "toolbar__icon"} btn-sheet-view`,
                hideCls:
                  this.options.iconType === "svg"
                    ? "svg-icon hide-password"
                    : "toolbar__icon btn-hide-password",
                maxLength: this.options.maxPasswordLength,
                validateOnBlur: false,
                showPwdOnClick: false,
                validation: (value) => this.txtIncorrectPwd,
              })
            } else {
              this.initCodePages()
              if (this.preview) {
                this.previewData ? this.textCallback(this.previewData) : this.updatePreview()
              }
            }
            if (this.type === Common.Utils.importTextType.Data) {
              this.txtDestRange = new Common.UI.InputFieldBtn({
                el: $("#id-open-data-range"),
                name: "range",
                style: "width: 100%;",
                btnHint: this.textSelectData,
                allowBlank: true,
                validateOnChange: true,
                validateOnBlur: false,
              })
              this.txtDestRange.on("button:click", _.bind(this.onSelectData, this))
              this.dataDestValid = this.api.asc_getActiveRangeStr(Asc.referenceType.A, true)
              this.txtDestRange.setValue(this.dataDestValid)
            }

            this.onPrimary = () => {
              this._handleInput("ok")
              return false
            }
          }
        },

        getFocusedComponents: function () {
          let arr = []
          this.inputPwd && arr.push(this.inputPwd)
          this.cmbEncoding && arr.push(this.cmbEncoding)
          this.cmbDelimiter && arr.push(this.cmbDelimiter)
          this.delimiterCheckboxes && (arr = arr.concat(this.delimiterCheckboxes.map((i) => i.cmp)))
          this.inputDelimiter && arr.push(this.inputDelimiter)
          this.btnAdvanced && arr.push(this.btnAdvanced)
          this.txtDestRange && arr.push(this.txtDestRange)

          return arr.concat(this.getFooterButtons())
        },

        show: function () {
          Common.UI.Window.prototype.show.apply(this, arguments)
          if (this.type === Common.Utils.importTextType.DRM) {
            setTimeout(() => {
              this.inputPwd.focus()
              if (this.validatePwd) this.inputPwd.checkValidate()
            }, 500)
          } else {
            let cmp = this.txtDestRange || null
            !cmp && this.cmbEncoding && (cmp = this.cmbEncoding)
            !cmp && this.cmbDelimiter && (cmp = this.cmbDelimiter)
            !cmp && this.delimiterCheckboxes && (cmp = this.delimiterCheckboxes[0].cmp)

            cmp &&
              setTimeout(() => {
                cmp.focus()
              }, 500)
          }
        },

        onBtnClick: function (event) {
          this._handleInput(event.currentTarget.attributes.result.value)
        },

        onToolClose: function () {
          this._handleInput("cancel")
        },

        _handleInput: function (state) {
          if (this.handler) {
            if (this.type === Common.Utils.importTextType.DRM) {
              this.handler.call(this, state, {
                drmOptions: new Asc.asc_CDRMAdvancedOptions(this.inputPwd.getValue()),
              })
            } else {
              if (
                this.type === Common.Utils.importTextType.Data &&
                state === "ok" &&
                !this.isRangeValid()
              ) {
                return
              }

              const encoding =
                this.cmbEncoding && !this.cmbEncoding.isDisabled()
                  ? this.cmbEncoding.getValue()
                  : this.settings?.asc_getCodePage()
                    ? this.settings.asc_getCodePage()
                    : 0
              let delimiters = []
              let delimiterChar = null

              if (this.cmbDelimiter) {
                delimiters = [this.cmbDelimiter.getValue()]
              } else if (this.delimiterCheckboxes) {
                this.delimiterCheckboxes.forEach((checkbox) => {
                  checkbox.cmp.isChecked() && delimiters.push(checkbox.id)
                })
              }
              delimiterChar = delimiters.includes(-1) ? this.inputDelimiter.getValue() : null

              const delimForSave = JSON.stringify(!delimiters.length ? [-1] : delimiters)
              if (this.type === Common.Utils.importTextType.TXT) {
                //save last encoding only for txt files
                this._isEncodingChanged &&
                  Common.localStorage.setItem("de-settings-open-encoding", encoding)
              } else if (this.type === Common.Utils.importTextType.CSV) {
                // only for csv files
                this._isDelimChanged &&
                  Common.localStorage.setItem("sse-settings-csv-delimiter", delimForSave)
                this._isDelimCharChanged &&
                  Common.localStorage.setItem(
                    "sse-settings-csv-delimiter-char",
                    delimiterChar || "",
                  )
                this._isEncodingChanged &&
                  Common.localStorage.setItem("sse-settings-csv-encoding", encoding)
              } else if (
                this.type === Common.Utils.importTextType.Paste ||
                this.type === Common.Utils.importTextType.Columns ||
                this.type === Common.Utils.importTextType.Data
              ) {
                this._isDelimChanged &&
                  Common.localStorage.setItem("sse-settings-data-delimiter", delimForSave)
                this._isDelimCharChanged &&
                  Common.localStorage.setItem(
                    "sse-settings-data-delimiter-char",
                    delimiterChar || "",
                  )
                this._isEncodingChanged &&
                  Common.localStorage.setItem("sse-settings-data-encoding", encoding)
              }
              delimiters = delimiters.filter((el) => el !== -1)

              const decimal = this.separatorOptions ? this.separatorOptions.decimal : undefined
              const thousands = this.separatorOptions ? this.separatorOptions.thousands : undefined
              const qualifier = this.separatorOptions ? this.separatorOptions.qualifier : '"'
              const options = new Asc.asc_CTextOptions(encoding, delimiters, delimiterChar)
              decimal && options.asc_setNumberDecimalSeparator(decimal)
              thousands && options.asc_setNumberGroupSeparator(thousands)
              qualifier && options.asc_setTextQualifier(qualifier)
              this.handler.call(this, state, {
                textOptions: options,
                range: this.txtDestRange ? this.txtDestRange.getValue() : "",
                data: this.data,
              })
            }
          }

          this.close()
        },

        initCodePages: function () {
          let i
          let c
          let codepage
          let encodedata = []
          const listItems = []
          let length = 0
          let lcid_width = 0
          let utf8 = 0

          if (this.codepages) {
            encodedata = []
            for (i = 0; i < this.codepages.length; ++i) {
              codepage = this.codepages[i]
              c = []
              c[0] = codepage.asc_getCodePage()
              c[1] = codepage.asc_getCodePageName()
              c[2] = codepage.asc_getLcid()
              c[2] === 65001 && (utf8 = i)

              encodedata.push(c)
            }
            lcid_width = 50
          }
          length = encodedata.length

          if (length) {
            for (i = 0; i < length; ++i) {
              listItems.push({
                value: encodedata[i][0],
                displayValue: Common.Utils.String.htmlEncode(encodedata[i][1]),
                lcid: encodedata[i][2] || "",
              })
            }

            const itemsTemplate = _.template(
              [
                "<% _.each(items, function(item) { %>",
                '<li id="<%= item.id %>" data-value="<%= item.value %>"><a tabindex="-1" type="menuitem">',
                '<div style="display: inline-block;"><%= item.displayValue %></div>',
                `<label class="text-align-right" style="width:${lcid_width}px;"><%= item.lcid %></label>`,
                "</a></li>",
                "<% }); %>",
              ].join(""),
            )

            this.cmbEncoding = new Common.UI.ComboBox({
              el: $("#id-codepages-combo", this.$window),
              style: "width: 100%;",
              menuStyle: "min-width: 100%; max-height: 200px;",
              cls: "input-group-nr",
              menuCls: "scrollable-menu",
              data: listItems,
              editable: false,
              disabled: true,
              search: true,
              itemsTemplate: itemsTemplate,
              takeFocusOnClose: true,
            })

            this.cmbEncoding.setDisabled(false)
            let encoding = this.settings?.asc_getCodePage()
              ? this.settings.asc_getCodePage()
              : encodedata[utf8][0]
            if (encoding === -1) {
              if (this.type === Common.Utils.importTextType.TXT) {
                // only for opening txt files
                const value = Common.localStorage.getItem("de-settings-open-encoding")
                value && (encoding = Number.parseInt(value))
              } else if (this.type === Common.Utils.importTextType.CSV) {
                // only for csv files
                const value = Common.localStorage.getItem("sse-settings-csv-encoding")
                value && (encoding = Number.parseInt(value))
              } else if (this.type === Common.Utils.importTextType.Data) {
                const value = Common.localStorage.getItem("sse-settings-data-encoding")
                value && (encoding = Number.parseInt(value))
              }
              encoding === -1 && (encoding = encodedata[utf8][0])
            }
            this.cmbEncoding.setValue(encoding)
            this.cmbEncoding.on("selected", _.bind(this.onCmbEncodingSelect, this))

            const ul = this.cmbEncoding.cmpEl.find("ul")
            const a = ul.find("li:nth(0) a")
            const width =
              ul.width() -
              Number.parseInt(a.css("padding-left")) -
              Number.parseInt(a.css("padding-right")) -
              50
            ul.find("li div").width(width)
          }

          if (
            this.type === Common.Utils.importTextType.CSV ||
            this.type === Common.Utils.importTextType.Paste ||
            this.type === Common.Utils.importTextType.Columns ||
            this.type === Common.Utils.importTextType.Data
          ) {
            let delimiters = []
            let delimiterChar = ""
            if (!this.preview) {
              // don't need to detect delimiter (save to csv)
              ;(delimiters = this.settings?.asc_getDelimiter()
                ? this.settings.asc_getDelimiter()
                : [4]),
                (delimiterChar = this.settings?.asc_getDelimiterChar()
                  ? this.settings.asc_getDelimiterChar()
                  : "")
              let valueFromStorage = Common.localStorage.getItem(
                this.type === Common.Utils.importTextType.CSV
                  ? "sse-settings-csv-delimiter"
                  : "sse-settings-data-delimiter",
              )

              if (valueFromStorage) {
                let isDelitFromStorage = false

                valueFromStorage = JSON.parse(valueFromStorage)
                if (Array.isArray(valueFromStorage)) {
                  delimiters = valueFromStorage
                  isDelitFromStorage = true
                } else {
                  const intValue = Number.parseInt(valueFromStorage)
                  if (!Number.isNaN(intValue)) {
                    delimiters = [intValue]
                    isDelitFromStorage = true
                  }
                }

                if (isDelitFromStorage && delimiters.includes(-1)) {
                  const key =
                    this.type === Common.Utils.importTextType.CSV
                      ? "sse-settings-csv-delimiter-char"
                      : "sse-settings-data-delimiter-char"

                  delimiterChar = Common.localStorage.getItem(key) || ""
                }
              }
            }

            if (
              this.type === Common.Utils.importTextType.Paste ||
              this.type === Common.Utils.importTextType.Columns
            ) {
              this.delimiterCheckboxes = [
                {
                  id: 4,
                  cmp: new Common.UI.CheckBox({
                    el: $("#id-delimiter-chk-comma"),
                    labelText: this.txtComma,
                  }),
                },
                {
                  id: 2,
                  cmp: new Common.UI.CheckBox({
                    el: $("#id-delimiter-chk-semicolon"),
                    labelText: this.txtSemicolon,
                  }),
                },
                {
                  id: 3,
                  cmp: new Common.UI.CheckBox({
                    el: $("#id-delimiter-chk-colon"),
                    labelText: this.txtColon,
                  }),
                },
                {
                  id: 1,
                  cmp: new Common.UI.CheckBox({
                    el: $("#id-delimiter-chk-tab"),
                    labelText: this.txtTab,
                  }),
                },
                {
                  id: 5,
                  cmp: new Common.UI.CheckBox({
                    el: $("#id-delimiter-chk-space"),
                    labelText: this.txtSpace,
                  }),
                },
                {
                  id: -1,
                  cmp: new Common.UI.CheckBox({
                    el: $("#id-delimiter-chk-other"),
                    labelText: this.txtOther,
                    value: -1,
                  }),
                },
              ]
              this.delimiterCheckboxes.forEach((checkbox) => {
                checkbox.cmp.on("change", (field) => {
                  if (checkbox.id === -1) {
                    this.inputDelimiter.setVisible(field.isChecked())
                    field.isChecked() &&
                      setTimeout(() => {
                        this.inputDelimiter.focus()
                      }, 10)
                  }
                  this.preview && this.updatePreview()
                  this._isDelimChanged = true
                })
              })
            } else {
              this.cmbDelimiter = new Common.UI.ComboBox({
                el: $("#id-delimiters-combo", this.$window),
                style: "width: 100px;",
                menuStyle: "min-width: 100px;",
                cls: "input-group-nr",
                data: [
                  { value: 4, displayValue: this.txtComma },
                  { value: 2, displayValue: this.txtSemicolon },
                  { value: 3, displayValue: this.txtColon },
                  { value: 1, displayValue: this.txtTab },
                  { value: 5, displayValue: this.txtSpace },
                  { value: -1, displayValue: this.txtOther },
                ],
                editable: false,
                takeFocusOnClose: true,
              })
              this.cmbDelimiter.setValue(this.isTSV ? 1 : delimiters[0])
              this.cmbDelimiter.on("selected", _.bind(this.onCmbDelimiterSelect, this))
            }

            this.inputDelimiter = new Common.UI.InputField({
              el: $("#id-delimiter-other"),
              style: "width: 30px;",
              maxLength: 1,
              validateOnChange: true,
              validateOnBlur: false,
              value: delimiterChar,
            })
            this.inputDelimiter.setVisible(delimiters.includes(-1))
            this.inputDelimiter.on("changing", _.bind(this.onInputCharChanging, this))

            if (
              this.type === Common.Utils.importTextType.Paste ||
              this.type === Common.Utils.importTextType.Columns ||
              this.type === Common.Utils.importTextType.Data
            ) {
              this.btnAdvanced = new Common.UI.Button({
                el: $("#id-delimiters-advanced"),
              })
              this.btnAdvanced.on("click", _.bind(this.onAdvancedClick, this))
            }
          }
        },

        updatePreview: function () {
          this._previewTdWidth = []
          this._previewTdMaxLength = 0

          const encoding =
            this.cmbEncoding && !this.cmbEncoding.isDisabled()
              ? this.cmbEncoding.getValue()
              : this.settings?.asc_getCodePage()
                ? this.settings.asc_getCodePage()
                : 0

          switch (this.type) {
            case Common.Utils.importTextType.CSV:
            case Common.Utils.importTextType.TXT:
            case Common.Utils.importTextType.Data:
              this.api.asc_decodeBuffer(this.preview, encoding, _.bind(this.textCallback, this))
              break
            case Common.Utils.importTextType.Paste:
            case Common.Utils.importTextType.Columns:
              this.api.asc_TextImport(
                encoding,
                _.bind(this.textCallback, this),
                this.type === Common.Utils.importTextType.Paste,
                this.fromToolbar,
              )
              break
          }
        },

        textCallback: function (text) {
          let delimiters = []
          let delimiterChar
          const encoding =
            this.cmbEncoding && !this.cmbEncoding.isDisabled()
              ? this.cmbEncoding.getValue()
              : this.settings?.asc_getCodePage()
                ? this.settings.asc_getCodePage()
                : 0

          if (
            this.detectedDelimiter ||
            this.type === Common.Utils.importTextType.TXT ||
            this.isTSV
          ) {
            if (this.cmbDelimiter) {
              delimiters = [this.cmbDelimiter.getValue()]
            } else if (this.delimiterCheckboxes) {
              this.delimiterCheckboxes.forEach((checkbox) => {
                checkbox.cmp.isChecked() && delimiters.push(checkbox.id)
              })
            }
            delimiterChar = delimiters.includes(-1) ? this.inputDelimiter.getValue() : ""
          } else {
            const res = this.api.asc_getCSVDelimiter(text)
            text = res.text
            delimiters = [res.delimiter || -1]
            delimiterChar = delimiters.includes(-1) ? res.delimiterChar || "" : ""
            if (this.cmbDelimiter) {
              this.cmbDelimiter.setValue(delimiters[0])
            } else if (this.delimiterCheckboxes) {
              this.delimiterCheckboxes.forEach((checkbox) => {
                checkbox.cmp.setValue(delimiters.includes(checkbox.id), true)
              })
            }
            this.inputDelimiter.setVisible(delimiters.includes(-1))
            this.inputDelimiter.setValue(delimiterChar)
            this.detectedDelimiter = true
          }

          delimiters = delimiters.filter((el) => el !== -1)
          const options = new Asc.asc_CTextOptions(encoding, delimiters, delimiterChar)
          if (this.separatorOptions) {
            options.asc_setNumberDecimalSeparator(this.separatorOptions.decimal)
            options.asc_setNumberGroupSeparator(this.separatorOptions.thousands)
            options.asc_setTextQualifier(this.separatorOptions.qualifier)
          }
          this.previewCallback(this.api.asc_parseText(text, options))
        },

        previewCallback: function (data) {
          if (!data || !data.length) return

          this.data = data
          this.previewInner.height(data.length * 17)

          if (!this.scrollerY)
            this.scrollerY = new Common.UI.Scroller({
              el: this.previewScrolled,
              minScrollbarLength: 20,
              alwaysVisibleY: true,
              alwaysVisibleX: true,
              onChange: _.bind(function () {
                if (this.scrollerY) {
                  let startPos = this.scrollerY.getScrollTop()
                  let start = Math.floor(startPos / 17 + 0.5)
                  let end = start + Math.min(6, this.data.length)
                  if (end > this.data.length) {
                    end = this.data.length
                    start = this.data.length - 6
                    startPos = start * 17
                  }
                  this.previewParent.height(108)
                  this.previewParent.css({ top: startPos })
                  this.previewDataBlock(this.data.slice(start, end))
                }
              }, this),
            })
          this.scrollerY.update()
          this.scrollerY.scrollTop(0)
        },

        previewDataBlock: function (data) {
          if (!_.isUndefined(this.scrollerX)) {
            this.scrollerX.destroy()
            this.scrollerX = undefined
          }

          if (
            this.type === Common.Utils.importTextType.CSV ||
            this.type === Common.Utils.importTextType.Paste ||
            this.type === Common.Utils.importTextType.Columns ||
            this.type === Common.Utils.importTextType.Data
          ) {
            let maxlength = 0
            for (let i = 0; i < data.length; i++) {
              const str = data[i] || ""
              if (str.length > maxlength) maxlength = str.length
            }
            this._previewTdMaxLength = Math.max(this._previewTdMaxLength, maxlength)
            let tpl = '<table id="id-preview-table">'
            for (let i = 0; i < data.length; i++) {
              const str = data[i] || ""
              tpl += '<tr style="vertical-align: top;">'
              for (let j = 0; j < str.length; j++) {
                let style = ""
                if (i === 0 && this._previewTdWidth[j]) {
                  // set td style only for first tr
                  style = `style="min-width:${this._previewTdWidth[j]}px;"`
                }
                tpl += `<td ${style}>${Common.Utils.String.htmlEncode(str[j])}</td>`
              }
              for (j = str.length; j < this._previewTdMaxLength; j++) {
                let style = ""
                if (i === 0 && this._previewTdWidth[j]) {
                  // set td style only for first tr
                  style = `style="min-width:${this._previewTdWidth[j]}px;"`
                }
                tpl += `<td ${style}></td>`
              }
              tpl += "</tr>"
            }
            tpl += "</table>"
          } else {
            let tpl = '<table id="id-preview-table">'
            for (let i = 0; i < data.length; i++) {
              const str = data[i] || ""
              tpl += `<tr style="vertical-align: top;"><td>${Common.Utils.String.htmlEncode(str)}</td></tr>`
            }
            tpl += "</table>"
          }
          this.previewPanel.html(tpl)

          if (data.length > 0) {
            this._previewTdWidth.length === 0 && this.previewScrolled.scrollLeft(0)
            this.previewPanel.find("tr:first td").each((index, el) => {
              this._previewTdWidth[index] = Math.max(
                Math.max(Math.ceil($(el).outerWidth()), 30),
                this._previewTdWidth[index] || 0,
              )
            })
          }

          this.scrollerX = new Common.UI.Scroller({
            el: this.previewPanel,
            suppressScrollY: true,
            alwaysVisibleX: true,
            minScrollbarLength: 20,
          })
        },

        onCmbDelimiterSelect: function (combo, record) {
          this.inputDelimiter.setVisible(record.value === -1)
          if (record.value === -1)
            setTimeout(() => {
              this.inputDelimiter.focus()
            }, 10)
          if (this.preview) this.updatePreview()
          this._isDelimChanged = true
        },

        onInputCharChanging: function () {
          this.preview && this.updatePreview()
          this._isDelimCharChanged = true
        },

        onCmbEncodingSelect: function (combo, record) {
          this.preview && this.updatePreview()
          this._isEncodingChanged = true
        },

        onAdvancedClick: function () {
          if (!SSE) return
          const decimal = this.separatorOptions
            ? this.separatorOptions.decimal
            : this.api.asc_getDecimalSeparator()
          const thousands = this.separatorOptions
            ? this.separatorOptions.thousands
            : this.api.asc_getGroupSeparator()
          const qualifier = this.separatorOptions
            ? this.separatorOptions.qualifier
            : (this.settings || new Asc.asc_CTextOptions()).asc_getTextQualifier()
          new SSE.Views.AdvancedSeparatorDialog({
            props: {
              decimal: decimal,
              thousands: thousands,
              qualifier: qualifier,
            },
            handler: (result, value) => {
              if (result === "ok") {
                this.separatorOptions = {
                  decimal: value.decimal.length > 0 ? value.decimal : decimal,
                  thousands: value.thousands.length > 0 ? value.thousands : thousands,
                  qualifier: value.qualifier,
                }
                this.preview && this.updatePreview()
              }
            },
          })
            .on("close", () => {
              this.btnAdvanced.focus()
            })
            .show()
        },

        onSelectData: function (type) {
          const txtRange = this.txtDestRange

          if (this.api) {
            const handlerDlg = (dlg, result) => {
              if (result === "ok") {
                const txt = dlg.getSettings()
                this.dataDestValid = txt
                txtRange.setValue(txt)
                txtRange.checkValidate()
              }
            }

            const win = new SSE.Views.CellRangeDialog({
              handler: handlerDlg,
            }).on("close", () => {
              this.show()
              _.delay(() => {
                txtRange.focus()
              }, 1)
            })

            const xy = Common.Utils.getOffset(this.$window)
            this.hide()
            win.show(this.$window, xy)
            win.setSettings({
              api: this.api,
              range:
                !_.isEmpty(txtRange.getValue()) && txtRange.checkValidate() === true
                  ? txtRange.getValue()
                  : this.dataDestValid,
              type: Asc.c_oAscSelectionDialogType.Chart,
            })
          }
        },

        isRangeValid: function () {
          let isvalid = true
          let txtError = ""
          if (_.isEmpty(this.txtDestRange.getValue())) {
            isvalid = false
            txtError = this.txtEmpty
          } else {
            isvalid = this.api.asc_checkDataRange(
              Asc.c_oAscSelectionDialogType.Chart,
              this.txtDestRange.getValue(),
            )
            isvalid = isvalid === Asc.c_oAscError.ID.No
            !isvalid && (txtError = this.textInvalidRange)
          }
          if (!isvalid) {
            this.txtDestRange.showError([txtError])
            this.txtDestRange.focus()
            return isvalid
          }

          return isvalid
        },

        txtDelimiter: "Delimiter",
        txtEncoding: "Encoding ",
        txtSpace: "Space",
        txtTab: "Tab",
        txtTitle: "Choose %1 options",
        txtPassword: "Password",
        txtTitleProtected: "Protected File",
        txtOther: "Other",
        txtIncorrectPwd: "Password is incorrect.",
        closeButtonText: "Close File",
        txtPreview: "Preview",
        txtComma: "Comma",
        txtColon: "Colon",
        txtSemicolon: "Semicolon",
        txtProtected:
          "Once you enter the password and open the file, the current password to the file will be reset.",
        txtAdvanced: "Advanced",
        txtOpenFile: "Enter a password to open the file",
        textSelectData: "Select data",
        txtDestData: "Choose where to put the data",
        txtEmpty: "This field is required",
        textInvalidRange: "Invalid cells range",
      },
      Common.Views.OpenDialog || {},
    ),
  )
})
