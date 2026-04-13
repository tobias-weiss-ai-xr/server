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
 *  FormulaWizard.js
 *
 *  Created on 17.04.20
 *
 */

define(["common/main/lib/view/AdvancedSettingsWindow"], () => {
  SSE.Views.FormulaWizard = Common.Views.AdvancedSettingsWindow.extend(
    _.extend(
      {
        options: {
          contentWidth: 580,
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
                  '<table style="width: 100%;">',
                  "<tr><td>",
                  '<div id="formula-wizard-panel-desc" style="word-break: break-word;">',
                  '<label id="formula-wizard-args" style="display: block;margin-bottom: 2px;"></label>',
                  '<label id="formula-wizard-desc" style="display: inline;margin-bottom: 8px;opacity: 0.7;" class="margin-right-5"></label>',
                  `<label id="formula-wizard-help" style="margin-bottom: 8px;" class="link">${this.textReadMore}</label>`,
                  "</div>",
                  '<div id="formula-wizard-panel-args" style="">',
                  '<div style="overflow: hidden;position: relative;padding-top:8px;" class="padding-left-8">',
                  '<table cols="3" id="formula-wizard-tbl-args" style="width: 100%;">',
                  "</table>",
                  "</div>",
                  "</div>",
                  '<div style="margin-top: 8px;">',
                  '<div id="formula-wizard-lbl-val-func" class="input-label float-right" style="width: 200px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;"></div>',
                  `<label id="formula-wizard-lbl-func-res" class="float-right margin-right-5">${this.textFunctionRes}</label>`,
                  "</div>",
                  "</td></tr>",
                  '<tr><td style="padding-bottom: 8px;padding-top: 8px;">',
                  '<div id="formula-wizard-panel-args-desc" style="padding: 8px;">',
                  '<label id="formula-wizard-arg-desc" style="min-height:30px; height:30px; overflow: hidden;"></label>',
                  "</div>",
                  "</td></tr>",
                  "<tr><td>",
                  '<div style="word-break: break-word;">',
                  '<label id="formula-wizard-value" style="display: block;margin-bottom: 8px;">Formula result:</label>',
                  "</div>",
                  "</td></tr>",
                  "</table>",
                  "</div></div>",
                ].join(""),
              )({ scope: this }),
            },
            options,
          )

          this.props = this.options.props
          this.funcprops = this.options.funcprops
          this.api = this.options.api
          this.lang = this.options.lang

          this._noApply = false
          this.args = []
          this.argsNames = []
          this.argsDesc = []
          this.repeatedIdx = 1
          this.repeatedArg = undefined
          this.helpUrl = undefined
          this.minArgCount = 1
          this.maxArgCount = 1
          this.minArgWidth = 50
          this.itemHeight = 30

          Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options)
        },

        render: function () {
          Common.Views.AdvancedSettingsWindow.prototype.render.call(this)

          const $window = this.getChild()
          $window.find("input").on("keypress", _.bind(this.onKeyPress, this))

          this.panelArgs = $window.find("#formula-wizard-panel-args")
          this.tableArgs = $window.find("#formula-wizard-tbl-args")
          this.lblArgDesc = $window.find("#formula-wizard-arg-desc")
          this.lblFormulaResult = $window.find("#formula-wizard-value")
          this.lblFunctionResult = $window.find("#formula-wizard-lbl-val-func")

          this._preventCloseCellEditor = false

          this.afterRender()
        },

        afterRender: function () {
          this._setDefaults()
        },

        _handleInput: function (state) {
          if (this.options.handler)
            this.options.handler.call(this, state, state === "ok" ? this.getSettings() : undefined)
          this._preventCloseCellEditor = state === "ok"
          this.close()
        },

        onDlgBtnClick: function (event) {
          this._handleInput(event.currentTarget.attributes.result.value)
        },

        onKeyPress: function (event) {
          if (event.keyCode === Common.UI.Keys.RETURN) {
            this._handleInput("ok")
          }
        },

        onPrimary: function () {
          this._handleInput("ok")
          return false
        },

        _setDefaults: function () {
          Common.UI.FocusManager.add(this, this.getFooterButtons())
          if (this.funcprops) {
            const props = this.funcprops
            props.args
              ? $("#formula-wizard-args").html(`<b>${props.name}</b>${props.args}`)
              : $("#formula-wizard-args").addClass("hidden")
            props.desc
              ? $("#formula-wizard-desc").text(props.desc)
              : $("#formula-wizard-desc").addClass("hidden")
            props.name
              ? $("#formula-wizard-name").html(`${this.textFunction}: ${props.name}`)
              : $("#formula-wizard-name").addClass("hidden")
            this.argsDesc = props.argsDesc || []
            this.parseArgsDesc(props.args)

            props.custom
              ? this.$window.find("#formula-wizard-help").css("visibility", "hidden")
              : this.$window.find("#formula-wizard-help").on("click", (e) => {
                  this.showHelp()
                })
          }

          if (this.props) {
            // fill arguments
            const props = this.props
            this.minArgCount = props.asc_getArgumentMin()
            this.maxArgCount = props.asc_getArgumentMax()

            this.recalcArgTableSize()

            let result = props.asc_getFunctionResult()
            this.lblFunctionResult.html(
              `= ${result !== undefined && result !== null ? result : ""}`,
            )
            result = props.asc_getFormulaResult()
            this.lblFormulaResult.html(
              `${this.textValue}: ${result !== undefined && result !== null ? result : ""}`,
            )

            const argres = props.asc_getArgumentsResult()
            const argtype = props.asc_getArgumentsType()
            const argval = props.asc_getArgumentsValue()

            if (argtype) {
              for (let i = 0; i < argtype.length; i++) {
                const type = argtype[i]
                let types = []

                if (typeof type === "object") {
                  this.repeatedArg = type
                  this.fillRepeatedNames()
                  types = type
                } else types.push(type)
                this.fillArgs(types, argval, argres)
              }
              if (argval && this.args.length < argval.length && this.repeatedArg) {
                // add repeated
                while (this.args.length < argval.length) {
                  this.fillArgs(this.repeatedArg, argval, argres)
                }
              }
              this.scrollerY.update()
              this.scrollerY.scrollTop(0)
            }
          }
          if (this.args.length < 1) {
            this.panelArgs.addClass("hidden")
            this.lblFunctionResult.parent().addClass("hidden")
            this.lblArgDesc.text(this.textNoArgs)
          } else {
            if (this.argsDesc.length < 1) this.lblArgDesc.parent().addClass("hidden")

            if (
              this.args.length === 1 &&
              this.repeatedArg &&
              this.repeatedArg.length < this.maxArgCount
            ) {
              // add new repeated arguments
              this.fillArgs(this.repeatedArg)
              this.scrollerY.update()
            }
            this.recalcMaxArgDesc()

            _.delay(() => {
              this._noApply = true
              this.args[0].argInput.focus()
              this._noApply = false
            }, 100)
          }
        },

        recalcArgTableSize: function () {
          if (this.maxArgCount > 5) this.tableArgs.parent().css("height", this.itemHeight * 5 + 8)
          if (!this.scrollerY)
            this.scrollerY = new Common.UI.Scroller({
              el: this.tableArgs.parent(),
              minScrollbarLength: 20,
              alwaysVisibleY: true,
            })
          else this.scrollerY.update()
        },

        recalcMaxArgDesc: function (isSaveContent) {
          const minHeight = Number.parseInt(this.lblArgDesc.css("min-height"))
          const oldHeight = Number.parseInt(this.lblArgDesc.css("height"))
          let maxHeight = minHeight
          const content = this.lblArgDesc.html()
          this.argsDesc?.forEach((item, index) => {
            const name = this.args[index] ? this.args[index].argName || "" : ""
            item && this.lblArgDesc.html(`<b>${name}: </b><span>${item}</span>`)
            const height = Number.parseInt(this.lblArgDesc.find("span").height())
            if (height > maxHeight) maxHeight = height
          })

          this.lblArgDesc.html(isSaveContent ? content : "")
          maxHeight > minHeight && (maxHeight += 4)

          if (maxHeight !== oldHeight) {
            this.lblArgDesc.css("height", maxHeight)
            this.setInnerHeight()
          }
        },

        parseArgsDesc: function (args) {
          if (args.charAt(0) === "(") args = args.substring(1)
          if (args.charAt(args.length - 1) === ")") args = args.substring(0, args.length - 1)
          const arr = args.split(this.api.asc_getFunctionArgumentSeparator())
          arr.forEach((item, index) => {
            let str = item.trim()
            if (str.charAt(0) === "[") str = str.substring(1)
            if (str.charAt(str.length - 1) === "]") str = str.substring(0, str.length - 1)
            str = str.trim()
            arr[index] = str.charAt(0).toUpperCase().concat(str.substring(1))
          })
          this.argsNames = arr
        },

        fillRepeatedNames: function () {
          if (this.argsNames.length < 1) return
          if (
            this.repeatedArg &&
            this.repeatedArg.length > 0 &&
            this.argsNames[this.argsNames.length - 1] === "..."
          ) {
            const req = this.argsNames.length - 1 - this.repeatedArg.length // required/no-repeated
            for (let i = 0; i < this.repeatedArg.length; i++) {
              const str = this.argsNames[this.argsNames.length - 2 - i]
              const ch = str.charAt(str.length - 1)
              if ("123456789".indexOf(ch) > -1) {
                this.repeatedIdx = Number.parseInt(ch)
                this.argsNames[this.argsNames.length - 2 - i] = str.substring(0, str.length - 1)
              }
            }
          }
        },

        getArgumentName: function (argcount) {
          let name = ""
          const namesLen = this.argsNames.length
          if (
            (!this.repeatedArg || this.repeatedArg.length < 1) &&
            argcount < namesLen &&
            this.argsNames[argcount] !== "..."
          ) {
            // no repeated args
            name = this.argsNames[argcount]
            name === "" &&
              (name = this.textArgument + (this.maxArgCount > 1 ? ` ${argcount + 1}` : ""))
          } else if (
            this.repeatedArg &&
            this.repeatedArg.length > 0 &&
            this.argsNames[namesLen - 1] === "..."
          ) {
            const repeatedLen = this.repeatedArg.length
            const req = namesLen - 1 - repeatedLen // required/no-repeated
            if (argcount < req)
              // get required args as is
              name = this.argsNames[argcount]
            else {
              const idx = repeatedLen - ((argcount - req) % repeatedLen)
              const num = Math.floor((argcount - req) / repeatedLen) + this.repeatedIdx
              name = this.argsNames[namesLen - 1 - idx] + num
            }
          } else name = this.textArgument + (this.maxArgCount > 1 ? ` ${argcount + 1}` : "")

          return name
        },

        getArgumentDesc: function (argcount) {
          let desc = this.textNoArgsDesc
          const descLen = this.argsDesc.length
          if ((!this.repeatedArg || this.repeatedArg.length < 1) && argcount < descLen) {
            // no repeated args
            desc = this.argsDesc[argcount] || this.textNoArgsDesc
          } else if (this.repeatedArg && this.repeatedArg.length > 0) {
            const repeatedLen = this.repeatedArg.length
            const req = descLen - repeatedLen // required/no-repeated
            if (argcount < req)
              // get required args as is
              argcount < descLen && (desc = this.argsDesc[argcount])
            else {
              const idx = repeatedLen - ((argcount - req) % repeatedLen)
              descLen - idx < descLen && (desc = this.argsDesc[descLen - idx])
            }
          }

          return desc
        },

        fillArgs: function (types, argval, argres) {
          let argcount = this.args.length
          for (let j = 0; j < types.length; j++) {
            this.setControls(
              argcount,
              types[j],
              argval ? argval[argcount] : undefined,
              argres ? argres[argcount] : undefined,
            )
            argcount++
          }
        },

        setControls: function (argcount, argtype, argval, argres) {
          const argtpl = `<tr><td class="padding-right-10" style="padding-bottom: 8px;vertical-align: middle;"><div id="formula-wizard-lbl-name-arg{0}" style="min-width:${this.minArgWidth}px;white-space: nowrap;margin-top: 1px;"></div></td><td class="padding-right-5" style="padding-bottom: 8px;width: 100%;vertical-align: middle;"><div id="formula-wizard-txt-arg{0}"></div></td><td style="padding-bottom: 8px;vertical-align: middle;"><div id="formula-wizard-lbl-val-arg{0}" class="input-label" style="margin-top: 1px;width: 200px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;"></div></td></tr>`
          const div = $(Common.Utils.String.format(argtpl, argcount))
          this.tableArgs.append(div)

          const txt = new Common.UI.InputFieldBtn({
            el: div.find(`#formula-wizard-txt-arg${argcount}`),
            index: argcount,
            validateOnChange: true,
            validateOnBlur: false,
          })
            .on("changed:after", (input, newValue, oldValue, e) => {
              if ($(e.target).parent().find(e.relatedTarget).length < 1)
                this.onInputChanging(input, true, newValue, oldValue)
            })
            .on("changing", (input, newValue, oldValue, e) => {
              if (newValue === oldValue) return
              this.onInputChanging(input, false, newValue, oldValue)
            })
            .on("button:click", _.bind(this.onSelectData, this))
          txt.setValue(argval !== undefined && argval !== null ? argval : "")
          txt._input.on("focus", _.bind(this.onSelectArgument, this, txt))

          this.args.push({
            index: argcount,
            lblName: div.find(`#formula-wizard-lbl-name-arg${argcount}`),
            lblValue: div.find(`#formula-wizard-lbl-val-arg${argcount}`),
            argInput: txt,
            argName: this.getArgumentName(argcount),
            argDesc: this.getArgumentDesc(argcount),
            argType: argtype,
            argTypeName: this.getArgType(argtype),
          })
          if (argcount < this.minArgCount)
            this.args[argcount].lblName.html(`<b>${this.args[argcount].argName}</b>`)
          else this.args[argcount].lblName.html(this.args[argcount].argName)
          this.args[argcount].lblValue.html(
            `= ${argres !== null && argres !== undefined ? argres : `<span style="opacity: 0.6; font-weight: bold;">${this.args[argcount].argTypeName}</span>`}`,
          )

          Common.UI.FocusManager.insert(this, txt, -1 * this.getFooterButtons().length)
        },

        onInputChanging: function (input, endInsert, newValue, oldValue, e) {
          const index = input.options.index
          const arg = this.args[index]
          const res = this.api.asc_insertArgumentsInFormula(
            this.getArgumentsValue(),
            index,
            arg.argType,
            this.funcprops ? this.funcprops.origin : undefined,
            !!endInsert,
          )
          let argres = res ? res.asc_getArgumentsResult() : undefined
          argres = argres ? argres[index] : undefined
          arg.lblValue.html(
            `= ${argres !== null && argres !== undefined ? argres : `<span style="opacity: 0.6; font-weight: bold;">${arg.argTypeName}</span>`}`,
          )

          let result = res ? res.asc_getFunctionResult() : undefined
          this.lblFunctionResult.html(`= ${result !== undefined && result !== null ? result : ""}`)
          result = res ? res.asc_getFormulaResult() : undefined
          this.lblFormulaResult.html(
            `${this.textValue}:${result !== undefined && result !== null ? result : ""}`,
          )
          if (endInsert && res) {
            argres = res.asc_getArguments()
            argres && arg.argInput.setValue(argres[index])
          }
        },

        getArgumentsValue: function () {
          const res = []
          const len = this.args.length
          let empty = true
          for (let i = len - 1; i >= 0; i--) {
            const val = this.args[i].argInput.getValue()
            empty && (empty = !val)
            !empty && (res[i] = val)
          }
          return res
        },

        getArgType: function (type) {
          let str = ""
          switch (type) {
            case Asc.c_oAscFormulaArgumentType.number:
              str = this.textNumber
              break
            case Asc.c_oAscFormulaArgumentType.text:
              str = this.textText
              break
            case Asc.c_oAscFormulaArgumentType.reference:
              str = this.textRef
              break
            case Asc.c_oAscFormulaArgumentType.any:
              str = this.textAny
              break
            case Asc.c_oAscFormulaArgumentType.logical:
              str = this.textLogical
              break
          }
          return str
        },

        onSelectArgument: function (input) {
          const index = input.options.index
          const arg = this.args[index]
          this.lblArgDesc.html(
            `<b>${arg.argName}: </b><span style="opacity: 0.7;">${arg.argDesc || this.textNoArgsDesc}</span>`,
          )
          if (
            !this._noApply &&
            index === this.args.length - 1 &&
            this.repeatedArg &&
            index + this.repeatedArg.length < this.maxArgCount
          ) {
            // add new repeated arguments
            this.fillArgs(this.repeatedArg)
            this.scrollerY.update()
          }
        },

        onSelectData: function (input) {
          this.onSelectArgument(input)
          if (this.api) {
            let changedValue = input.getValue()
            const handlerDlg = (dlg, result) => {
              if (result === "ok") {
                changedValue = dlg.getSettings()
              }
            }

            const win = new SSE.Views.CellRangeDialog({
              allowBlank: true,
              handler: handlerDlg,
            }).on("close", () => {
              input.setValue(changedValue)
              this.onInputChanging(input)
              this.show()
              _.delay(() => {
                this._noApply = true
                input.focus()
                this._noApply = false
              }, 1)
            })

            const xy = Common.Utils.getOffset(this.$window)
            this.hide()
            win.show(this.$window, xy)
            win.setSettings({
              api: this.api,
              range: !_.isEmpty(input.getValue()) ? input.getValue() : "",
              type: Asc.c_oAscSelectionDialogType.Function,
              selection: {
                start: input._input[0].selectionStart,
                end: input._input[0].selectionEnd,
              },
              argvalues: this.getArgumentsValue(),
              argindex: input.options.index,
            })
          }
        },

        onThemeChanged: function () {
          this.recalcMaxArgDesc(true)
          Common.Views.AdvancedSettingsWindow.prototype.onThemeChanged.call(this)
        },

        showHelp: function () {
          if (this.helpUrl === undefined) {
            if (!this.funcprops || !this.funcprops.origin) {
              this.helpUrl = null
              return
            }
            let lang = Common.Utils.InternalSettings.get("sse-settings-func-help")
            if (!lang) lang = this.lang ? this.lang.split(/[\-\_]/)[0] : "en"
            const func = this.funcprops.origin.toLocaleLowerCase().replace(/\./g, "-")
            const name = `/Functions/${func}.htm`
            let url = `resources/help/${lang}${name}`

            if (Common.Controllers.Desktop.isActive()) {
              if (Common.Controllers.Desktop.isHelpAvailable())
                url = Common.Controllers.Desktop.helpUrl() + name
              else {
                const helpCenter = Common.Utils.InternalSettings.get("url-help-center")
                if (helpCenter) {
                  const _url_obj = new URL(helpCenter)
                  if (_url_obj.searchParams) _url_obj.searchParams.set("function", func)

                  window.open(_url_obj.toString(), "_blank")
                }

                this.helpUrl = null
                return
              }
            }

            fetch(url).then((response) => {
              if (response.ok) {
                Common.Utils.InternalSettings.set("sse-settings-func-help", lang)
                this.helpUrl = url
                this.showHelp()
              } else {
                url = `resources/help/{{DEFAULT_LANG}}${name}`
                fetch(url).then((response) => {
                  if (response.ok) {
                    Common.Utils.InternalSettings.set("sse-settings-func-help", "{{DEFAULT_LANG}}")
                    this.helpUrl = url
                    this.showHelp()
                  } else {
                    this.helpUrl = null
                  }
                })
              }
            })
          } else if (this.helpUrl) {
            window.open(this.helpUrl)
          }
        },

        getSettings: () => ({}),

        close: function () {
          Common.Views.AdvancedSettingsWindow.prototype.close.call(this)
          this.api.asc_closeCellEditor(!this._preventCloseCellEditor)
        },

        textTitle: "Function Argumens",
        textValue: "Formula result",
        textFunctionRes: "Function result",
        textFunction: "Function",
        textHelp: "Help on this function",
        textNoArgs: "This function has no arguments",
        textArgument: "Argument",
        textNumber: "number",
        textText: "text",
        textRef: "reference",
        textAny: "any",
        textLogical: "logical",
        textNoArgsDesc: "this argument has no description",
        textReadMore: "Read more",
      },
      SSE.Views.FormulaWizard || {},
    ),
  )
})
