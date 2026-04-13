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

define([
  "text!documenteditor/main/app/template/StatusBar.template",
  "jquery",
  "underscore",
  "backbone",
  "tip",
  "common/main/lib/component/Menu",
  "common/main/lib/component/Window",
  "documenteditor/main/app/model/Pages",
  "common/main/lib/component/InputField",
], (template, $, _, Backbone) => {
  function _onCountPages(count) {
    this.pages.set("count", count)
  }

  function _onCurrentPage(number) {
    this.pages.set("current", number + 1)
  }

  const _tplPages = _.template("Page <%= current %> of <%= count %>")

  function _updatePagesCaption(model, value, opts) {
    $(".statusbar #label-pages", this.$el).text(
      Common.Utils.String.format(this.pageIndexText, model.get("current"), model.get("count")),
    )
  }

  function _clickLanguage(menu, item) {
    this.langMenu.prevTip = item.value
    this.btnLanguage.setCaption(item.caption)
    this.fireEvent("langchanged", [this, item.code, item.caption])
  }

  function _onAppReady(config) {
    this.btnZoomToPage.updateHint(this.tipFitPage)
    this.btnMultiplePages.updateHint(this.tipMultiplePages)
    this.btnZoomToWidth.updateHint(this.tipFitWidth)
    DE.getController("Common.Controllers.Shortcuts").updateShortcutHints({
      ZoomOut: {
        btn: this.btnZoomDown,
        label: this.tipZoomOut,
      },
      ZoomIn: {
        btn: this.btnZoomUp,
        label: this.tipZoomIn,
      },
    })

    if (config.canUseSelectHandTools) {
      this.btnSelectTool.updateHint(this.tipSelectTool)
      this.btnHandTool.updateHint(this.tipHandTool)
    }

    if (this.btnLanguage?.cmpEl) {
      this.btnLanguage.updateHint(this.tipSetLang)
      this.langMenu.on("item:click", _.bind(_clickLanguage, this))
    }

    this.cntZoom.updateHint(this.tipZoomFactor)
    this.cntZoom.cmpEl.on({
      "show.bs.dropdown": () => {
        _.defer(() => {
          this.cntZoom.cmpEl.find("ul").focus()
        }, 100)
      },
      "hide.bs.dropdown": () => {
        _.defer(() => {
          this.api.asc_enableKeyEvents(true)
        }, 100)
      },
    })

    this.txtGoToPage.on({
      "keypress:after": (input, e) => {
        if (e.keyCode === Common.UI.Keys.RETURN) {
          const box = this.$el.find("#status-goto-box")
          const edit = box.find("input[type=text]")
          let page = Number.parseInt(edit.val())
          if (!page || page-- > this.pages.get("count") || page < 0) {
            edit.select()
            return false
          }

          box.focus() // for IE
          box.parent().removeClass("open")

          this.api.goToPage(page)
          this.api.asc_enableKeyEvents(true)

          return false
        }
      },
      "keyup:after": (input, e) => {
        if (e.keyCode === Common.UI.Keys.ESC) {
          const box = this.$el.find("#status-goto-box")
          box.focus() // for IE
          box.parent().removeClass("open")
          this.api.asc_enableKeyEvents(true)
          return false
        }
      },
    })

    const goto = this.$el.find("#status-goto-box")
    goto.on("click", () => false)
    goto.parent().on({
      "show.bs.dropdown": () => {
        this.txtGoToPage.setValue(this.api.getCurrentPage() + 1)
        this.txtGoToPage.checkValidate()
        const edit = this.txtGoToPage.$el.find("input")
        _.defer(() => {
          edit.focus().select()
        }, 100)
      },
      "hide.bs.dropdown": () => {
        const box = this.$el.find("#status-goto-box")
        if (this.api && box) {
          box.focus() // for IE
          box.parent().removeClass("open")

          this.api.asc_enableKeyEvents(true)
        }
      },
    })

    this.zoomMenu.on("item:click", (menu, item) => {
      this.fireEvent("zoom:value", [item.value])
    })

    this.btnMultiplePages.on("click", (btn) => {
      Common.UI.TooltipManager.closeTip("multipageViewStatusbar")
      this.fireEvent("pages:multiple", [btn.pressed])
    })

    this.btnDocInfo.menu.on("show:after", _.bind(this.onDocInfoShow, this))

    this.onChangeProtectDocument()
  }

  DE.Views.Statusbar = Backbone.View.extend(
    _.extend(
      {
        el: "#statusbar",
        template: _.template(template),

        events: {},

        api: undefined,
        pages: undefined,

        initialize: function (options) {
          _.extend(this, options)
          this.pages = new DE.Models.Pages({ current: 1, count: 1 })
          this.pages.on("change", _.bind(_updatePagesCaption, this))
          this._state = {
            docProtection: {
              isReadOnly: false,
              isReviewOnly: false,
              isFormsOnly: false,
              isCommentsOnly: false,
            },
          }
          this._isDisabled = false
          this.$layout = $(
            this.template({
              textGotoPage: this.goToPageText,
              textPageNumber: Common.Utils.String.format(this.pageIndexText, 1, 1),
            }),
          )

          this.btnSelectTool = new Common.UI.Button({
            hintAnchor: "top",
            toggleGroup: "select-tools",
            enableToggle: true,
            allowDepress: false,
          })

          this.btnHandTool = new Common.UI.Button({
            hintAnchor: "top",
            toggleGroup: "select-tools",
            enableToggle: true,
            allowDepress: false,
          })

          this.btnMultiplePages = new Common.UI.Button({
            hintAnchor: "top",
            toggleGroup: "multiple-pages",
            pressed: Common.localStorage.getBool("de-zoom-multipage", false),
            enableToggle: true,
          })

          this.btnZoomToPage = new Common.UI.Button({
            hintAnchor: "top",
            toggleGroup: "status-zoom",
            enableToggle: true,
          })

          this.btnZoomToWidth = new Common.UI.Button({
            hintAnchor: "top",
            toggleGroup: "status-zoom",
            enableToggle: true,
          })

          this.cntZoom = new Common.UI.Button({
            hintAnchor: "top",
          })

          this.btnZoomDown = new Common.UI.Button({
            hintAnchor: "top",
          })

          this.btnZoomUp = new Common.UI.Button({
            hintAnchor: "top-right",
          })

          this.btnLanguage = new Common.UI.Button({
            cls: "btn-toolbar",
            scaling: false,
            caption: "English – United States",
            hintAnchor: "top-left",
            disabled: true,
            dataHint: "0",
            dataHintDirection: "top",
            menu: true,
          })

          this.langMenu = new Common.UI.MenuSimple({
            cls: "lang-menu shifted-right",
            style: "margin-top:-5px;",
            restoreHeight: 285,
            itemTemplate: _.template(
              [
                '<a id="<%= id %>" tabindex="-1" type="menuitem" langval="<%= value %>" class="<% if (checked) { %> checked <% } %>">',
                "<div>",
                '<i class="icon <% if (spellcheck) { %> toolbar__icon btn-ic-docspell spellcheck-lang <% } %>"></i>',
                "<%= caption %>",
                "</div>",
                '<label style="opacity: 0.6"><%= captionEn %></label>',
                "</a>",
              ].join(""),
            ),
            menuAlign: "bl-tl",
            search: true,
            searchFields: ["caption", "captionEn"],
            focusToCheckedItem: true,
          })
          this.zoomMenu = new Common.UI.Menu({
            style: "margin-top:-5px;",
            menuAlign: "bl-tl",
            items: [
              { caption: "50%", value: 50 },
              { caption: "75%", value: 75 },
              { caption: "100%", value: 100 },
              { caption: "125%", value: 125 },
              { caption: "150%", value: 150 },
              { caption: "175%", value: 175 },
              { caption: "200%", value: 200 },
              { caption: "300%", value: 300 },
              { caption: "400%", value: 400 },
              { caption: "500%", value: 500 },
            ],
          })

          this.txtGoToPage = new Common.UI.InputField({
            allowBlank: true,
            validateOnChange: true,
            style: "width: 60px;",
            maskExp: /[0-9]/,
            validation: (value) => {
              if (/(^[0-9]+$)/.test(value)) {
                value = Number.parseInt(value)
                if (undefined !== value && value > 0 && value <= this.pages.get("count"))
                  return true
              }

              return this.txtPageNumInvalid
            },
          })

          const template = _.template(
            // '<a id="<%= id %>" tabindex="-1" type="menuitem">' +
            '<div style="display: flex;padding: 5px 20px;line-height: 16px;">' +
              '<div style="flex-grow: 1;"><%= caption %></div>' +
              '<div class="margin-left-20 text-align-right" style="word-break: normal; min-width: 35px;"><%= options.value%></div>' +
              "</div>",
            // '</a>'
          )

          this.btnDocInfo = new Common.UI.Button({
            cls: "btn-toolbar no-caret",
            caption: this.txtWordCount,
            iconCls: "toolbar__icon btn-word-count",
            hintAnchor: "top-left",
            dataHint: "0",
            dataHintDirection: "top",
            menu: new Common.UI.Menu({
              style: "margin-top:-5px;",
              menuAlign: "bl-tl",
              itemTemplate: template,
              items: [
                { caption: this.txtPages, value: 0 },
                { caption: this.txtParagraphs, value: 0 },
                { caption: this.txtWords, value: 0 },
                { caption: this.txtSymbols, value: 0 },
                { caption: this.txtSpaces, value: 0 },
              ],
            }),
          })

          const promise = new Promise((accept, reject) => {
            accept()
          })

          Common.NotificationCenter.on(
            "app:ready",
            function (mode) {
              promise.then(_onAppReady.bind(this, mode))
            }.bind(this),
          )
        },

        render: function (config) {
          function _btn_render(button, slot) {
            button.setElement(slot, false)
            button.render()
          }

          this.fireEvent("render:before", [this.$layout])

          _btn_render(this.btnMultiplePages, $("#status-btn-multiple-pages", this.$layout))
          _btn_render(this.btnZoomToPage, $("#btn-zoom-topage", this.$layout))
          _btn_render(this.btnZoomToWidth, $("#btn-zoom-towidth", this.$layout))
          _btn_render(this.cntZoom, $(".cnt-zoom", this.$layout))
          _btn_render(this.btnZoomDown, $("#btn-zoom-down", this.$layout))
          _btn_render(this.btnZoomUp, $("#btn-zoom-up", this.$layout))
          _btn_render(this.txtGoToPage, $("#status-goto-page", this.$layout))

          if (!config || config.isEdit) {
            this.btnLanguage.render($("#btn-cnt-lang", this.$layout))
            this.btnLanguage.setMenu(this.langMenu)
            this.langMenu.prevTip = "en"
          }
          this.btnDocInfo.render($("#slot-status-btn-info", this.$layout))

          if (config.canUseSelectHandTools) {
            _btn_render(this.btnSelectTool, $("#status-btn-select-tool", this.$layout))
            _btn_render(this.btnHandTool, $("#status-btn-hand-tool", this.$layout))
          }

          this.zoomMenu.render($(".cnt-zoom", this.$layout))
          this.zoomMenu.cmpEl.attr({ tabindex: -1 })

          this.$el.html(this.$layout)
          this.fireEvent("render:after", [this])

          return this
        },

        setApi: function (api) {
          this.api = api

          if (this.api) {
            this.api.asc_registerCallback("asc_onCountPages", _.bind(_onCountPages, this))
            this.api.asc_registerCallback("asc_onCurrentPage", _.bind(_onCurrentPage, this))
            this.api.asc_registerCallback(
              "asc_onGetDocInfoStart",
              _.bind(this.onGetDocInfoStart, this),
            )
            this.api.asc_registerCallback(
              "asc_onGetDocInfoStop",
              _.bind(this.onGetDocInfoEnd, this),
            )
            this.api.asc_registerCallback("asc_onDocInfo", _.bind(this.onDocInfo, this))
            this.api.asc_registerCallback("asc_onGetDocInfoEnd", _.bind(this.onGetDocInfoEnd, this))
            this.api.asc_registerCallback(
              "asc_onCoAuthoringDisconnect",
              _.bind(this.onApiCoAuthoringDisconnect, this),
            )
            Common.NotificationCenter.on(
              "api:disconnect",
              _.bind(this.onApiCoAuthoringDisconnect, this),
            )
            Common.NotificationCenter.on(
              "protect:doclock",
              _.bind(this.onChangeProtectDocument, this),
            )
          }
          return this
        },

        setMode: function (mode) {
          this.mode = mode
        },

        setVisible: function (visible) {
          visible ? this.show() : this.hide()
        },

        isVisible: function () {
          return this.$el?.is(":visible")
        },

        reloadLanguages: function (array) {
          const arr = []
          const saved = this.langMenu.saved
          _.each(array, (item) => {
            arr.push({
              caption: item.displayValue,
              captionEn: item.displayValueEn,
              value: item.value,
              code: item.code,
              checkable: true,
              spellcheck: item.spellcheck,
            })
          })
          this.langMenu.setRecent({
            count: Common.Utils.InternalSettings.get("app-settings-recent-langs-count") || 5,
            offset: Common.Utils.InternalSettings.get("app-settings-recent-langs-offset") || 0,
            key: "app-settings-recent-langs",
            valueField: "value",
          })
          this.langMenu.resetItems(arr)
          if (this.langMenu.items.length > 0) {
            const index = _.findIndex(this.langMenu.items, { caption: saved })
            index > -1 && this.langMenu.setChecked(index, true)
            const isProtected =
              this._state.docProtection.isReadOnly ||
              this._state.docProtection.isFormsOnly ||
              this._state.docProtection.isCommentsOnly
            this.btnLanguage.setDisabled(
              this._isDisabled || !!this.mode.isDisconnected || isProtected,
            )
          }
        },

        setLanguage: function (info) {
          if (this.langMenu.prevTip !== info.value && info.code !== undefined) {
            this.btnLanguage.setCaption(info.displayValue)
            this.langMenu.prevTip = info.value

            const index = _.findIndex(this.langMenu.items, { caption: info.displayValue })
            if (index > -1) {
              this.langMenu.setChecked(index, true)
            } else {
              this.langMenu.saved = info.displayValue
              this.langMenu.clearAll()
            }
          }
        },

        getStatusLabel: () => $(".statusbar #label-action"),

        showStatusMessage: function (message) {
          this.getStatusLabel().text(message)
        },

        clearStatusMessage: function () {
          this.getStatusLabel().text("")
        },

        SetDisabled: function (disable) {
          this._isDisabled = disable
          const isProtected =
            this._state.docProtection.isReadOnly ||
            this._state.docProtection.isFormsOnly ||
            this._state.docProtection.isCommentsOnly
          this.btnLanguage.setDisabled(disable || this.langMenu.items.length < 1 || isProtected)
          this.btnTurnReview?.setDisabled(disable || isProtected)
        },

        onChangeProtectDocument: function (props) {
          if (!props) {
            const docprotect = DE.getController("DocProtection")
            props = docprotect ? docprotect.getDocProps() : null
          }
          if (props) {
            this._state.docProtection = props
            this.SetDisabled(this._isDisabled)
          }
        },

        onDocInfoShow: function () {
          this.api?.startGetDocInfo()
        },

        onGetDocInfoStart: function () {
          this.infoObj = {
            PageCount: 0,
            WordsCount: 0,
            ParagraphCount: 0,
            SymbolsCount: 0,
            SymbolsWSCount: 0,
          }
        },

        onDocInfo: function (obj) {
          if (obj && this.btnDocInfo && this.btnDocInfo.menu) {
            if (obj.get_PageCount() > -1)
              this.btnDocInfo.menu.items[0].options.value = obj.get_PageCount()
            if (obj.get_ParagraphCount() > -1)
              this.btnDocInfo.menu.items[1].options.value = obj.get_ParagraphCount()
            if (obj.get_WordsCount() > -1)
              this.btnDocInfo.menu.items[2].options.value = obj.get_WordsCount()
            if (obj.get_SymbolsCount() > -1)
              this.btnDocInfo.menu.items[3].options.value = obj.get_SymbolsCount()
            if (obj.get_SymbolsWSCount() > -1)
              this.btnDocInfo.menu.items[4].options.value = obj.get_SymbolsWSCount()
            if (!this.timerDocInfo) {
              // start timer for filling info
              this.timerDocInfo = setInterval(() => {
                this.fillDocInfo()
              }, 300)
              this.fillDocInfo()
            }
          }
        },

        onGetDocInfoEnd: function () {
          clearInterval(this.timerDocInfo)
          this.timerDocInfo = undefined
          this.fillDocInfo()
        },

        fillDocInfo: function () {
          if (!this.btnDocInfo || !this.btnDocInfo.menu || !this.btnDocInfo.menu.isVisible()) return

          this.btnDocInfo.menu.items.forEach((item) => {
            $(item.el).html(
              item.template({ id: item.id, caption: item.caption, options: item.options }),
            )
          })
        },

        onApiCoAuthoringDisconnect: function () {
          this.setMode({ isDisconnected: true })
          this.SetDisabled(true)
        },

        pageIndexText: "Page {0} of {1}",
        goToPageText: "Go to Page",
        tipFitPage: "Fit to Page",
        tipFitWidth: "Fit to Width",
        tipZoomIn: "Zoom In",
        tipZoomOut: "Zoom Out",
        tipZoomFactor: "Magnification",
        tipSetLang: "Set Text Language",
        txtPageNumInvalid: "Page number invalid",
        textTrackChanges: "Track Changes",
        textChangesPanel: "Changes panel",
        tipSelectTool: "Select tool",
        tipHandTool: "Hand tool",
        txtWordCount: "Word count",
        txtPages: "Pages",
        txtWords: "Words",
        txtParagraphs: "Paragraphs",
        txtSymbols: "Symbols",
        txtSpaces: "Symbols with spaces",
      },
      DE.Views.Statusbar || {},
    ),
  )
})
