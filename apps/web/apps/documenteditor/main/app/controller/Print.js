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
define(["core"], () => {
  DE.Controllers.Print = Backbone.Controller.extend(
    _.extend(
      {
        views: ["PrintWithPreview"],

        initialize: function () {
          this.adjPrintParams = new Asc.asc_CAdjustPrint()
          this._state = {
            lock_doc: false,
            firstPrintPage: 0,
            shouldUpdateCmbPrinter: false,
            currentPrinter: null,
            printersList: [],
          }

          this._navigationPreview = {
            pageCount: false,
            currentPage: 0,
            currentPreviewPage: 0,
          }

          this._isPreviewVisible = false

          this.addListeners({
            PrintWithPreview: {
              show: _.bind(this.onShowMainSettingsPrint, this),
              "render:after": _.bind(this.onAfterRender, this),
            },
          })
          Common.NotificationCenter.on("script:loaded", _.bind(this.onPostLoadComplete, this))
        },

        onLaunch: () => {},

        onPostLoadComplete: function () {
          this.views = this.getApplication().getClasseRefs("view", ["PrintWithPreview"])
          this.printSettings = this.createView("PrintWithPreview")
          this.setMode(this.mode)
        },

        onAfterRender: function (view) {
          this.printSettings.menu.on("menu:hide", _.bind(this.onHidePrintMenu, this))
          this.printSettings.btnPrintSystemDialog.on(
            "click",
            _.bind(this.onBtnPrint, this, true, true),
          )
          this.printSettings.btnPrint.on("click", _.bind(this.onBtnPrint, this, true, false))
          this.printSettings.btnPrintPdf.on("click", _.bind(this.onBtnPrint, this, false, false))
          this.printSettings.btnPrevPage.on("click", _.bind(this.onChangePreviewPage, this, false))
          this.printSettings.btnNextPage.on("click", _.bind(this.onChangePreviewPage, this, true))
          this.printSettings.txtNumberPage.on({
            "keypress:after": _.bind(this.onKeypressPageNumber, this),
            "keyup:after": _.bind(this.onKeyupPageNumber, this),
          })
          this.printSettings.txtNumberPage.cmpEl
            .find("input")
            .on("blur", _.bind(this.onBlurPageNumber, this))
          this.printSettings.cmbPaperSize.on("selected", _.bind(this.onPaperSizeSelect, this))
          this.printSettings.cmbPaperOrientation.on(
            "selected",
            _.bind(this.onPaperOrientSelect, this),
          )
          this.printSettings.cmbPaperMargins.on("selected", _.bind(this.onPaperMarginsSelect, this))
          this.printSettings.cmbRange.on("selected", _.bind(this.comboRangeChange, this))
          this.printSettings.inputPages.on("changing", _.bind(this.inputPagesChanging, this))
          this.printSettings.inputPages.validation = (value) => {
            if (!_.isEmpty(value) && /[0-9,\-]/.test(value)) {
              const res = []
              const arr = value.split(",")

              for (let i = 0; i < arr.length; i++) {
                const item = arr[i]
                if (!item)
                  // empty
                  return this.txtPrintRangeInvalid
                const str = item.match(/\-/g)
                if (str && str.length > 1)
                  // more than 1 symbol '-'
                  return this.txtPrintRangeInvalid
                if (!str) {
                  // one number
                  const num = Number.parseInt(item) - 1
                  num >= 0 && res.push(num)
                } else {
                  // range
                  const pages = item.split("-")
                  let start = pages[0] ? Number.parseInt(pages[0]) - 1 : 0
                  let end = pages[1]
                    ? Number.parseInt(pages[1]) - 1
                    : this._navigationPreview.pageCount - 1
                  if (start > end) {
                    const num = start
                    start = end
                    end = num
                  }
                  for (let j = start; j <= end; j++) {
                    j >= 0 && res.push(j)
                  }
                }
              }
              if (res.length > 0) {
                this._state.firstPrintPage = res[0]
                return true
              }
            }

            return this.txtPrintRangeInvalid
          }

          Common.NotificationCenter.on(
            "window:resize",
            _.bind(function () {
              if (this._isPreviewVisible) {
                this.api.asc_drawPrintPreview(this._navigationPreview.currentPreviewPage)
              }
            }, this),
          )
          Common.NotificationCenter.on(
            "margins:update",
            _.bind(this.onUpdateLastCustomMargins, this),
          )

          const eventname = /Firefox/i.test(navigator.userAgent) ? "DOMMouseScroll" : "mousewheel"
          this.printSettings.$previewBox.on(eventname, _.bind(this.onPreviewWheel, this))
        },

        setMode: function (mode) {
          this.mode = mode
          this.printSettings?.setMode(mode)
        },

        setApi: function (o) {
          this.api = o
          this.api.asc_registerCallback("asc_onDocSize", _.bind(this.onApiPageSize, this))
          this.api.asc_registerCallback("asc_onPageOrient", _.bind(this.onApiPageOrient, this))
          this.api.asc_registerCallback("asc_onSectionProps", _.bind(this.onSectionProps, this))
          this.api.asc_registerCallback("asc_onCountPages", _.bind(this.onCountPages, this))
          this.api.asc_registerCallback("asc_onCurrentPage", _.bind(this.onCurrentPage, this))
          this.api.asc_registerCallback(
            "asc_onLockDocumentProps",
            _.bind(this.onApiLockDocumentProps, this),
          )
          this.api.asc_registerCallback(
            "asc_onUnLockDocumentProps",
            _.bind(this.onApiUnLockDocumentProps, this),
          )

          return this
        },

        findPagePreset: function (w, h) {
          const width = w < h ? w : h
          const height = w < h ? h : w
          const panel = this.printSettings
          const store = panel.cmbPaperSize.store
          let item = null
          for (let i = 0; i < store.length - 1; i++) {
            const rec = store.at(i)
            const size = rec.get("size")
            const pagewidth = size[0]
            const pageheight = size[1]
            if (Math.abs(pagewidth - width) < 0.1 && Math.abs(pageheight - height) < 0.1) {
              item = rec
              break
            }
          }
          return item ? item.get("caption") : undefined
        },

        onApiPageSize: function (w, h) {
          this._state.pgsize = [w, h]
          if (this.printSettings?.isVisible()) {
            const width = this._state.pgorient ? w : h
            const height = this._state.pgorient ? h : w
            const panel = this.printSettings
            const store = panel.cmbPaperSize.store
            const cmbPaperSizeRecord = panel.cmbPaperSize.getSelectedRecord()
            let item = null

            panel.setOriginalPageSize(w, h)

            if (
              cmbPaperSizeRecord &&
              Math.abs(w - cmbPaperSizeRecord.size[0]) < 0.1 &&
              Math.abs(h - cmbPaperSizeRecord.size[1]) < 0.1
            ) {
              return
            }
            for (let i = 0; i < store.length - 1; i++) {
              const rec = store.at(i)
              const size = rec.get("size")
              const pagewidth = size[0]
              const pageheight = size[1]
              if (Math.abs(pagewidth - width) < 0.1 && Math.abs(pageheight - height) < 0.1) {
                item = rec
                break
              }
            }
            if (item) panel.cmbPaperSize.setValue(item.get("value"))
            else {
              if (panel.$el.prop("id") === "panel-print") {
                panel.cmbPaperSize.setValue(undefined, [
                  this.txtCustom,
                  Number.parseFloat(Common.Utils.Metric.fnRecalcFromMM(width).toFixed(2)),
                  Number.parseFloat(Common.Utils.Metric.fnRecalcFromMM(height).toFixed(2)),
                  Common.Utils.Metric.getCurrentMetricName(),
                ])
              } else {
                panel.cmbPaperSize.setValue(
                  `${this.txtCustom} (${Number.parseFloat(Common.Utils.Metric.fnRecalcFromMM(width).toFixed(2))}${Common.Utils.Metric.getCurrentMetricName()} x ${Number.parseFloat(Common.Utils.Metric.fnRecalcFromMM(height).toFixed(2))}${Common.Utils.Metric.getCurrentMetricName()})`,
                )
              }
            }
          } else {
            this.isFillProps = false
          }
        },

        onApiPageOrient: function (isportrait) {
          this._state.pgorient = !!isportrait
          if (this.printSettings?.isVisible()) {
            let value
            if (this._state.pgorientAuto) {
              value = "auto"
            } else if (this._state.pgorient) {
              value = Asc.c_oAscPageOrientation.PagePortrait
            } else {
              value = Asc.c_oAscPageOrientation.PageLandscape
            }
            const item = this.printSettings.cmbPaperOrientation.store.findWhere({ value: value })
            item && this.printSettings.cmbPaperOrientation.setValue(item.get("value"))
          }
        },

        onSectionProps: function (props) {
          if (!props) return

          this._state.sectionprops = props
          if (this.printSettings?.isVisible()) {
            const left = props.get_LeftMargin()
            const top = props.get_TopMargin()
            const right = props.get_RightMargin()
            const bottom = props.get_BottomMargin()

            this._state.pgmargins = [top, left, bottom, right]
            const store = this.printSettings.cmbPaperMargins.store
            let item = null
            for (let i = 0; i < store.length - 1; i++) {
              const rec = store.at(i)
              const size = rec.get("size")
              if (
                typeof size === "object" &&
                Math.abs(size[0] - top) < 0.1 &&
                Math.abs(size[1] - left) < 0.1 &&
                Math.abs(size[2] - bottom) < 0.1 &&
                Math.abs(size[3] - right) < 0.1
              ) {
                item = rec
              }
            }
            if (item) this.printSettings.cmbPaperMargins.setValue(item.get("value"))
            else this.printSettings.cmbPaperMargins.setValue(this.txtCustom)
          }
        },

        comboRangeChange: function (combo, record) {
          if (record.value === -1) {
            setTimeout(() => {
              this.printSettings.inputPages.focus()
            }, 50)
          } else {
            this.printSettings.inputPages.setValue("")
          }
          this.printSettings.inputPages.showError()
        },

        onCountPages: function (count) {
          this._navigationPreview.pageCount = count
          if (this._navigationPreview.currentPreviewPage > count - 1) {
            this._navigationPreview.currentPreviewPage = Math.max(0, count - 1)
            if (this.printSettings?.isVisible()) {
              this.api.asc_drawPrintPreview(this._navigationPreview.currentPreviewPage)
              this.updateNavigationButtons(this._navigationPreview.currentPreviewPage, count)
            }
          }
        },

        onCurrentPage: function (number) {
          this._navigationPreview.currentPreviewPage = number
          if (this.printSettings?.isVisible()) {
            this.api.asc_drawPrintPreview(this._navigationPreview.currentPreviewPage)
            this.updateNavigationButtons(
              this._navigationPreview.currentPreviewPage,
              this._navigationPreview.pageCount,
            )

            const item = this.printSettings.cmbPaperOrientation.store.findWhere({ value: "auto" })
            item && this.printSettings.cmbPaperOrientation.setValue(item.get("value"))
          }
        },

        onShowMainSettingsPrint: function () {
          this.printSettings.$previewBox.removeClass("hidden")

          this._state.pgorientAuto = true
          this.onUpdateLastCustomMargins(this._state.lastmargins)
          this._state.pgsize && this.onApiPageSize(this._state.pgsize[0], this._state.pgsize[1])
          this.onApiPageOrient(this._state.pgorient)
          this._state.sectionprops && this.onSectionProps(this._state.sectionprops)

          const opts = new Asc.asc_CDownloadOptions(
            null,
            Common.Utils.isChrome ||
              Common.Utils.isOpera ||
              (Common.Utils.isGecko && Common.Utils.firefoxVersion > 86),
          )
          opts.asc_setAdvancedOptions(this.adjPrintParams)
          this.api.asc_initPrintPreview("print-preview", opts)

          this._navigationPreview.currentPreviewPage = this._navigationPreview.currentPage =
            this.api.getCurrentPage()
          this.api.asc_drawPrintPreview(this._navigationPreview.currentPreviewPage)
          this.updateNavigationButtons(
            this._navigationPreview.currentPreviewPage,
            this._navigationPreview.pageCount,
          )
          this.SetDisabled()
          this._isPreviewVisible = true

          if (this._state.shouldUpdateCmbPrinter) {
            this.updateCmbPrinter()
          }
        },

        onPaperSizeSelect: function (combo, record) {
          this._state.pgsize = [0, 0]
          if (record.value !== -1) {
            if (this.checkPageSize(record.size[0], record.size[1])) {
              const section = this.api.asc_GetSectionProps()
              this.onApiPageSize(section.get_W(), section.get_H())
              return
            }
            this.api.change_DocSize(record.size[0], record.size[1])
          } else {
            let win
            let props
            win = new DE.Views.PageSizeDialog({
              checkPageSize: _.bind(this.checkPageSize, this),
              handler: (dlg, result) => {
                if (result === "ok") {
                  props = dlg.getSettings()
                  this.api.change_DocSize(props[0], props[1])
                  Common.NotificationCenter.trigger("edit:complete")
                }
              },
            })
            win.show()
            win.setSettings(this.api.asc_GetSectionProps())
          }

          Common.NotificationCenter.trigger("edit:complete")
        },

        onPaperMarginsSelect: function (combo, record) {
          this._state.pgmargins = undefined
          if (record.value !== -1) {
            if (
              this.checkPageSize(
                undefined,
                undefined,
                record.size[1],
                record.size[3],
                record.size[0],
                record.size[2],
              )
            ) {
              this.onSectionProps(this.api.asc_GetSectionProps())
              return
            }
            const props = new Asc.CDocumentSectionProps()
            props.put_TopMargin(record.size[0])
            props.put_LeftMargin(record.size[1])
            props.put_BottomMargin(record.size[2])
            props.put_RightMargin(record.size[3])
            this.api.asc_SetSectionProps(props)
          } else {
            let win
            let props
            win = new DE.Views.PageMarginsDialog({
              api: this.api,
              handler: (dlg, result) => {
                if (result === "ok") {
                  props = dlg.getSettings()
                  Common.localStorage.setItem("de-pgmargins-top", props.get_TopMargin())
                  Common.localStorage.setItem("de-pgmargins-left", props.get_LeftMargin())
                  Common.localStorage.setItem("de-pgmargins-bottom", props.get_BottomMargin())
                  Common.localStorage.setItem("de-pgmargins-right", props.get_RightMargin())
                  Common.NotificationCenter.trigger("margins:update", props)

                  this.api.asc_SetSectionProps(props)
                  Common.NotificationCenter.trigger("edit:complete")
                }
              },
            })
            win.show()
            win.setSettings(this.api.asc_GetSectionProps())
          }

          Common.NotificationCenter.trigger("edit:complete")
        },

        onUpdateLastCustomMargins: function (props) {
          this._state.lastmargins = props
          if (this.printSettings?.isVisible()) {
            const top = props
              ? props.get_TopMargin()
              : Common.localStorage.getItem("de-pgmargins-top")
            const left = props
              ? props.get_LeftMargin()
              : Common.localStorage.getItem("de-pgmargins-left")
            const bottom = props
              ? props.get_BottomMargin()
              : Common.localStorage.getItem("de-pgmargins-bottom")
            const right = props
              ? props.get_RightMargin()
              : Common.localStorage.getItem("de-pgmargins-right")
            if (top !== null && left !== null && bottom !== null && right !== null) {
              const rec = this.printSettings.cmbPaperMargins.store.at(0)
              if (rec.get("value") === -2)
                rec.set("size", [
                  Number.parseFloat(top),
                  Number.parseFloat(left),
                  Number.parseFloat(bottom),
                  Number.parseFloat(right),
                ])
              else
                this.printSettings.cmbPaperMargins.store.unshift({
                  value: -2,
                  displayValue: this.textMarginsLast,
                  size: [
                    Number.parseFloat(top),
                    Number.parseFloat(left),
                    Number.parseFloat(bottom),
                    Number.parseFloat(right),
                  ],
                })
              this.printSettings.cmbPaperMargins.onResetItems()
            }
          }
        },

        onPaperOrientSelect: function (combo, record) {
          this._state.pgorient = undefined
          if (this.api) {
            this._state.pgorientAuto = record.value === "auto"
            if (record.value !== "auto") {
              this.api.change_PageOrient(record.value === Asc.c_oAscPageOrientation.PagePortrait)
            }
          }

          Common.NotificationCenter.trigger("edit:complete")
        },

        setPrintersInfo: function (currentPrinter, list, isWaitingForPrinters) {
          this._state.currentPrinter = currentPrinter || this._state.currentPrinter
          this._state.printersList = _.uniq(
            _.union(this._state.printersList, list),
            (option) => option.name,
          )
          this._state.isWaitingForPrinters = !!isWaitingForPrinters
          this._state.shouldUpdateCmbPrinter = true

          if (this.printSettings?.isVisible() && this._state.shouldUpdateCmbPrinter) {
            this.updateCmbPrinter()
          }
        },

        updateCmbPrinter: function () {
          this.printSettings.updateCmbPrinter(
            this._state.currentPrinter,
            this._state.printersList,
            this._state.isWaitingForPrinters,
          )
          this._state.shouldUpdateCmbPrinter = false
        },

        checkPageSize: function (width, height, left, right, top, bottom) {
          const section = this.api.asc_GetSectionProps()
          width === undefined && (width = Number.parseFloat(section.get_W().toFixed(4)))
          height === undefined && (height = Number.parseFloat(section.get_H().toFixed(4)))
          left === undefined && (left = Number.parseFloat(section.get_LeftMargin().toFixed(4)))
          right === undefined && (right = Number.parseFloat(section.get_RightMargin().toFixed(4)))
          top === undefined && (top = Number.parseFloat(section.get_TopMargin().toFixed(4)))
          bottom === undefined &&
            (bottom = Number.parseFloat(section.get_BottomMargin().toFixed(4)))
          const gutterLeft = section.get_GutterAtTop()
            ? 0
            : Number.parseFloat(section.get_Gutter().toFixed(4))
          const gutterTop = section.get_GutterAtTop()
            ? Number.parseFloat(section.get_Gutter().toFixed(4))
            : 0

          let errmsg = null
          if (left + right + gutterLeft > width - 12.7) errmsg = this.txtMarginsW
          else if (top + bottom + gutterTop > height - 2.6) errmsg = this.txtMarginsH
          if (errmsg) {
            Common.UI.warning({
              title: this.notcriticalErrorTitle,
              msg: errmsg,
              callback: () => {
                Common.NotificationCenter.trigger("edit:complete")
              },
            })
            return true
          }
        },

        getPrintParams: function () {
          return this.adjPrintParams
        },

        onHidePrintMenu: function () {
          if (this._isPreviewVisible) {
            this.api.asc_closePrintPreview?.()
            this._isPreviewVisible = false
          }
        },

        onChangePreviewPage: function (next) {
          let index = this._navigationPreview.currentPreviewPage
          if (next) {
            index++
            index = Math.min(index, this._navigationPreview.pageCount - 1)
          } else {
            index--
            index = Math.max(index, 0)
          }
          this.api.goToPage(index)
        },

        onKeypressPageNumber: function (input, e) {
          if (e.keyCode === Common.UI.Keys.RETURN) {
            const box = this.printSettings.$el.find("#print-number-page")
            const edit = box.find("input[type=text]")
            const page = Number.parseInt(edit.val())
            if (!page || page > this._navigationPreview.pageCount || page < 0) {
              edit.select()
              this.printSettings.txtNumberPage.setValue(
                this._navigationPreview.currentPreviewPage + 1,
              )
              this.printSettings.txtNumberPage.checkValidate()
              return false
            }

            box.focus() // for IE

            this.api.goToPage(page - 1)
            return false
          }
        },

        onKeyupPageNumber: function (input, e) {
          if (e.keyCode === Common.UI.Keys.ESC) {
            const box = this.printSettings.$el.find("#print-number-page")
            box.focus() // for IE
            this.api.asc_enableKeyEvents(true)
            return false
          }
        },

        onBlurPageNumber: function () {
          if (
            this.printSettings.txtNumberPage.getValue() !==
            this._navigationPreview.currentPreviewPage + 1
          ) {
            this.printSettings.txtNumberPage.setValue(
              this._navigationPreview.currentPreviewPage + 1,
            )
            this.printSettings.txtNumberPage.checkValidate()
          }
        },

        onPreviewWheel: function (e) {
          if (e.ctrlKey) {
            e.preventDefault()
            e.stopImmediatePropagation()
          }
          const forward = (e.deltaY || (e.detail && -e.detail) || e.wheelDelta) < 0
          this.onChangePreviewPage(forward)
        },

        updateNavigationButtons: function (page, count) {
          this._navigationPreview.currentPage = page
          this.printSettings.updateCurrentPage(page)
          this._navigationPreview.pageCount = count
          this.printSettings.updateCountOfPages(count)
          this.disableNavButtons()
        },

        disableNavButtons: function (force) {
          if (force) {
            this.printSettings.btnPrevPage.setDisabled(true)
            this.printSettings.btnNextPage.setDisabled(true)
            return
          }
          const curPage = this._navigationPreview.currentPage
          const pageCount = this._navigationPreview.pageCount
          this.printSettings.btnPrevPage.setDisabled(curPage < 1)
          this.printSettings.btnNextPage.setDisabled(curPage > pageCount - 2)
        },

        onBtnPrint: function (print, useSystemDialog) {
          this._isPrint = print
          if (
            this.printSettings.cmbRange.getValue() === -1 &&
            this.printSettings.inputPages.checkValidate() !== true
          ) {
            this.printSettings.inputPages.focus()
            this.isInputFirstChange = true
            return
          }

          let pages
          if (this.printSettings.cmbRange.getValue() === -1) {
            pages = this.printSettings.inputPages.getValue()
          } else if (this.printSettings.cmbRange.getValue() === "all") {
            pages = "all"
            this._state.firstPrintPage = 0
          } else if (this.printSettings.cmbRange.getValue() === "current") {
            pages = String(this._navigationPreview.currentPage + 1)
            this._state.firstPrintPage = this._navigationPreview.currentPage
          }

          const size = this.api.asc_getPageSize(this._state.firstPrintPage)
          const printerOption = this.printSettings.cmbPrinter.getSelectedRecord()
          const orientationOption = this.printSettings.cmbPaperOrientation.getSelectedRecord()
          let paperOrientation = null
          if (orientationOption && orientationOption.value === "auto") {
            paperOrientation = "auto"
          } else if (size) {
            paperOrientation = size.H > size.W ? "portrait" : "landscape"
          }
          this.adjPrintParams.asc_setNativeOptions({
            usesystemdialog: useSystemDialog,
            printer: printerOption ? printerOption.value : null,
            colorMode: this.printSettings.cmbColorPrinting.getValue() === "color",
            pages: pages,
            paperSize: {
              w: size ? size.W : undefined,
              h: size ? size.H : undefined,
              preset: size ? this.findPagePreset(size.W, size.H) : undefined,
            },
            paperOrientation: paperOrientation,
            copies: this.printSettings.spnCopies.getNumberValue() || 1,
            sides: this.printSettings.cmbSides.getValue(),
          })

          this.printSettings.menu.hide()
          if (print) {
            const opts = new Asc.asc_CDownloadOptions(
              null,
              Common.Utils.isChrome ||
                Common.Utils.isOpera ||
                (Common.Utils.isGecko && Common.Utils.firefoxVersion > 86),
            )
            opts.asc_setAdvancedOptions(this.adjPrintParams)
            this.api.asc_Print(opts)
          } else {
            const opts = new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.PDF)
            opts.asc_setAdvancedOptions(this.adjPrintParams)
            this.api.asc_DownloadAs(opts)
          }
        },

        inputPagesChanging: function (input, value) {
          this.isInputFirstChange && this.printSettings.inputPages.showError()
          this.isInputFirstChange = false

          if (value.length < 1) this.printSettings.cmbRange.setValue("all")
          else if (this.printSettings.cmbRange.getValue() !== -1)
            this.printSettings.cmbRange.setValue(-1)
        },

        onApiLockDocumentProps: function () {
          this._state.lock_doc = true
          this.SetDisabled()
        },

        onApiUnLockDocumentProps: function () {
          this._state.lock_doc = false
          this.SetDisabled()
        },

        SetDisabled: function () {
          if (this.printSettings?.isVisible()) {
            const disable = !this.mode.isEdit || this._state.lock_doc
            this.printSettings.cmbPaperSize.setDisabled(disable)
            this.printSettings.cmbPaperMargins.setDisabled(disable)
            this.printSettings.cmbPaperOrientation.setDisabled(disable)
          }
        },

        txtCustom: "Custom",
        txtPrintRangeInvalid: "Invalid print range",
        textMarginsLast: "Last Custom",
      },
      DE.Controllers.Print || {},
    ),
  )
})
