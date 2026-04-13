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
  "text!pdfeditor/main/app/template/StatusBar.template",
  "jquery",
  "underscore",
  "backbone",
  "tip",
  "common/main/lib/component/Menu",
  "common/main/lib/component/Window",
  "pdfeditor/main/app/model/Pages",
], (template, $, _, Backbone) => {
  function _onCountPages(count) {
    this.pages.set("count", count)
    this.btnPagePrev?.setDisabled(this.pages.get("current") - 1 < 1)
    this.btnPageNext?.setDisabled(this.pages.get("current") - 1 >= this.pages.get("count") - 1)
  }

  function _onCurrentPage(number) {
    this.pages.set("current", number + 1)
    this.btnPagePrev?.setDisabled(number < 1)
    this.btnPageNext?.setDisabled(number >= this.pages.get("count") - 1)
  }

  const _tplPages = _.template("Page <%= current %> of <%= count %>")

  function _updatePagesCaption(model, value, opts) {
    $(".statusbar #label-pages", this.$el).text(
      Common.Utils.String.format(this.pageIndexText, model.get("current"), model.get("count")),
    )
  }

  function _onAppReady(config) {
    if (config.canUseSelectHandTools) {
      this.btnSelectTool.updateHint(this.tipSelectTool)
      this.btnHandTool.updateHint(this.tipHandTool)
    }
    this.btnZoomToPage.updateHint(this.tipFitPage)
    this.btnZoomToWidth.updateHint(this.tipFitWidth)
    this.btnPagePrev.updateHint(this.tipPagePrev)
    this.btnPageNext.updateHint(this.tipPageNext)
    PDFE.getController("Common.Controllers.Shortcuts").updateShortcutHints({
      ZoomOut: {
        btn: this.btnZoomDown,
        label: this.tipZoomOut,
      },
      ZoomIn: {
        btn: this.btnZoomUp,
        label: this.tipZoomIn,
      },
    })

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
  }

  PDFE.Views.Statusbar = Backbone.View.extend(
    _.extend(
      {
        el: "#statusbar",
        template: _.template(template),

        events: {},

        api: undefined,
        pages: undefined,

        initialize: function (options) {
          _.extend(this, options)
          this.pages = new PDFE.Models.Pages({ current: 1, count: 1 })
          this.pages.on("change", _.bind(_updatePagesCaption, this))
          this._state = {}
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

          this.btnPagePrev = new Common.UI.Button({
            cls: "btn-toolbar",
            iconCls: "toolbar__icon btn-previtem icon-rtl",
            disabled: true,
            hintAnchor: "top",
            dataHint: "0",
            dataHintDirection: "top",
          })

          this.btnPageNext = new Common.UI.Button({
            cls: "btn-toolbar",
            iconCls: "toolbar__icon btn-nextitem icon-rtl",
            disabled: true,
            hintAnchor: "top-left",
            dataHint: "0",
            dataHintDirection: "top",
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

          _btn_render(this.btnZoomToPage, $("#btn-zoom-topage", this.$layout))
          _btn_render(this.btnZoomToWidth, $("#btn-zoom-towidth", this.$layout))
          _btn_render(this.cntZoom, $(".cnt-zoom", this.$layout))
          _btn_render(this.btnZoomDown, $("#btn-zoom-down", this.$layout))
          _btn_render(this.btnZoomUp, $("#btn-zoom-up", this.$layout))
          _btn_render(this.txtGoToPage, $("#status-goto-page", this.$layout))

          this.zoomMenu.render($(".cnt-zoom", this.$layout))
          this.zoomMenu.cmpEl.attr({ tabindex: -1 })
          this.btnPagePrev.render($("#slot-status-btn-prev", this.$layout))
          this.btnPageNext.render($("#slot-status-btn-next", this.$layout))

          if (config.canUseSelectHandTools) {
            _btn_render(this.btnSelectTool, $("#status-btn-select-tool", this.$layout))
            _btn_render(this.btnHandTool, $("#status-btn-hand-tool", this.$layout))
          }

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
              "asc_onCoAuthoringDisconnect",
              _.bind(this.onApiCoAuthoringDisconnect, this),
            )
            Common.NotificationCenter.on(
              "api:disconnect",
              _.bind(this.onApiCoAuthoringDisconnect, this),
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

        getStatusLabel: () => $(".statusbar #label-action"),

        showStatusMessage: function (message) {
          this.getStatusLabel().text(message)
        },

        clearStatusMessage: function () {
          this.getStatusLabel().text("")
        },

        SetDisabled: function (disable) {
          this._isDisabled = disable
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
        txtPageNumInvalid: "Page number invalid",
        tipPagePrev: "Go to previous page",
        tipPageNext: "Go to nex page",
        tipSelectTool: "Select tool",
        tipHandTool: "Hand tool",
      },
      PDFE.Views.Statusbar || {},
    ),
  )
})
