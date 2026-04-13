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
 *  HeaderFooterTab.js
 *
 *  Created on 10.21.2025
 *
 */

define([
  "common/main/lib/util/utils",
  "common/main/lib/component/BaseView",
  "common/main/lib/component/Layout",
], () => {
  DE.Views.HeaderFooterTab = Common.UI.BaseView.extend(
    _.extend(
      (() => {
        const template =
          '<section class="panel" data-tab="headerfooter" role="tabpanel" aria-labelledby="headerfooter">' +
          '<div class="group">' +
          '<span class="btn-slot text x-huge slot-headerfooter"></span>' +
          "</div>" +
          '<div class="separator long"></div>' +
          '<div class="group">' +
          '<span class="btn-slot text x-huge slot-pagenumbers"></span>' +
          '<span class="btn-slot text x-huge slot-insertdatetime"></span>' +
          '<span class="btn-slot text x-huge slot-insertfield"></span>' +
          '<span class="btn-slot text x-huge slot-insertimage"></span>' +
          "</div>" +
          '<div class="separator long"></div>' +
          '<div class="group small">' +
          '<div class="elset" style="display: flex; align-items: baseline;">' +
          '<span class="btn-slot text font-size-normal margin-right-6" id="slot-lbl-header-top" style="flex-grow:1;"></span>' +
          '<span id="slot-spin-header-top" class="btn-slot text spinner"></span>' +
          "</div>" +
          '<div class="elset" style="display: flex; align-items: baseline;">' +
          '<span class="btn-slot text font-size-normal margin-right-6" id="slot-lbl-footer-bot" style="flex-grow:1;"></span>' +
          '<span id="slot-spin-footer-bot" class="btn-slot text spinner"></span>' +
          "</div>" +
          "</div>" +
          '<div class="separator long"></div>' +
          '<div class="group small">' +
          '<div class="elset">' +
          '<span class="btn-slot text" id="slot-chk-diff-odd-even"></span>' +
          "</div>" +
          '<div class="elset">' +
          '<span class="btn-slot text" id="slot-chk-diff-first"></span>' +
          "</div>" +
          "</div>" +
          '<div class="group small">' +
          '<div class="elset">' +
          '<span class="btn-slot text" id="slot-chk-sameas"></span>' +
          "</div>" +
          '<div class="elset"></div>' +
          "</div>" +
          '<div class="separator long"></div>' +
          '<div class="group">' +
          '<span class="btn-slot text x-huge" id="slot-btn-close-tab"></span>' +
          "</div>" +
          "</section>"

        return {
          options: {},

          setEvents: function () {
            this.btnsPageNumber.forEach((button) => {
              button.menu.on("item:click", (menu, item, e) => {
                this.fireEvent("headerfooter:inspagenumber", [item])
              })
            })
            this.numHeaderPosition.on("change", (field) => {
              this.fireEvent("headerfooter:headerfooterpos", [field, true])
            })
            this.numFooterPosition.on("change", (field) => {
              this.fireEvent("headerfooter:headerfooterpos", [field, false])
            })
            this.chDiffFirst.on("change", (field, newValue, oldValue, eOpts) => {
              this.fireEvent("headerfooter:difffirst", [field])
            })
            this.chDiffOddEven.on("change", (field, newValue, oldValue, eOpts) => {
              this.fireEvent("headerfooter:diffoddeven", [field])
            })
            this.chSameAs.on("change", (field, newValue, oldValue, eOpts) => {
              this.fireEvent("headerfooter:sameas", [field])
            })
            this.btnCloseTab.on("click", (field) => {
              this.fireEvent("headerfooter:close")
            })
            this.btnsHeaderFooter.forEach((button) => {
              button.menu.on("item:click", (menu, item, e) => {
                this.fireEvent("headerfooter:editremove", [item])
              })
            })
          },

          initialize: function (options) {
            Common.UI.BaseView.prototype.initialize.call(this)
            this.toolbar = options.toolbar
            this.appConfig = options.mode

            this.lockedControls = []
            this.paragraphControls = []
            const _set = Common.enumLock

            this.btnCloseTab = new Common.UI.Button({
              cls: "btn-toolbar x-huge icon-top",
              caption: this.txtCloseTab,
              iconCls: "toolbar__icon btn-close-tab",
              lock: [_set.lostConnect],
              dataHint: "1",
              dataHintDirection: "bottom",
              dataHintOffset: "small",
            })
            this.lockedControls.push(this.btnCloseTab)

            this.lblHeaderTop = new Common.UI.Label({
              caption: this.capHeaderTop,
              lock: [
                _set.paragraphLock,
                _set.headerLock,
                _set.viewMode,
                _set.docLockView,
                _set.previewReviewMode,
                _set.viewFormMode,
                _set.docLockComments,
                _set.docLockForms,
              ],
            })
            this.lockedControls.push(this.lblHeaderTop)
            this.paragraphControls.push(this.lblHeaderTop)

            this.lblFooterBottom = new Common.UI.Label({
              caption: this.capFooterBottom,
              lock: [
                _set.paragraphLock,
                _set.headerLock,
                _set.viewMode,
                _set.docLockView,
                _set.previewReviewMode,
                _set.viewFormMode,
                _set.docLockComments,
                _set.docLockForms,
              ],
            })
            this.lockedControls.push(this.lblFooterBottom)
            this.paragraphControls.push(this.lblFooterBottom)

            this.numHeaderPosition = new Common.UI.MetricSpinner({
              step: 0.1,
              width: 85,
              value: "1.25 cm",
              defaultUnit: "cm",
              defaultValue: 0,
              maxValue: 55.88,
              minValue: 0,
              lock: [
                _set.headerLock,
                _set.viewMode,
                _set.docLockView,
                _set.previewReviewMode,
                _set.viewFormMode,
                _set.docLockComments,
                _set.docLockForms,
              ],
              dataHint: "1",
              dataHintDirection: "bottom",
              dataHintOffset: "big",
            })
            this.lockedControls.push(this.numHeaderPosition)
            this.paragraphControls.push(this.numHeaderPosition)
            this.numHeaderPosition.on("inputleave", () => {
              this.fireEvent("editcomplete", this)
            })

            this.numFooterPosition = new Common.UI.MetricSpinner({
              step: 0.1,
              width: 85,
              value: "1.25 cm",
              defaultUnit: "cm",
              maxValue: 55.88,
              lock: [
                _set.headerLock,
                _set.viewMode,
                _set.docLockView,
                _set.previewReviewMode,
                _set.viewFormMode,
                _set.docLockComments,
                _set.docLockForms,
              ],
              minValue: 0,
              dataHint: "1",
              dataHintDirection: "bottom",
              dataHintOffset: "big",
            })
            this.lockedControls.push(this.numFooterPosition)
            this.paragraphControls.push(this.numFooterPosition)
            this.numFooterPosition.on("inputleave", () => {
              this.fireEvent("editcomplete", this)
            })

            this.chDiffFirst = new Common.UI.CheckBox({
              labelText: this.txtDiffFirst,
              dataHint: "1",
              lock: [
                _set.headerLock,
                _set.viewMode,
                _set.docLockView,
                _set.previewReviewMode,
                _set.viewFormMode,
                _set.docLockComments,
                _set.docLockForms,
              ],
              dataHintDirection: "left",
              dataHintOffset: "small",
            })
            this.lockedControls.push(this.chDiffFirst)
            this.paragraphControls.push(this.chDiffFirst)

            this.chDiffOddEven = new Common.UI.CheckBox({
              labelText: this.txtDiffOddEven,
              dataHint: "1",
              lock: [
                _set.headerLock,
                _set.viewMode,
                _set.docLockView,
                _set.previewReviewMode,
                _set.viewFormMode,
                _set.docLockComments,
                _set.docLockForms,
              ],
              dataHintDirection: "left",
              dataHintOffset: "small",
            })
            this.lockedControls.push(this.chDiffOddEven)
            this.paragraphControls.push(this.chDiffOddEven)

            this.chSameAs = new Common.UI.CheckBox({
              labelText: this.txtSameAs,
              dataHint: "1",
              lock: [
                _set.headerLock,
                _set.linkToPrevious,
                _set.viewMode,
                _set.docLockView,
                _set.previewReviewMode,
                _set.viewFormMode,
                _set.docLockComments,
                _set.docLockForms,
              ],
              dataHintDirection: "left",
              dataHintOffset: "small",
            })
            this.paragraphControls.push(this.chSameAs)

            this.mnuPageNumberPosPicker = {
              conf: { disabled: false },
              isDisabled: function () {
                return this.conf.disabled
              },
              setDisabled: function (val) {
                this.conf.disabled = val
              },
              options: {},
            }

            this.mnuPageNumberPosPicker.options.lock = [_set.headerFooterLock]

            Common.UI.LayoutManager.addControls(this.lockedControls)
            Common.NotificationCenter.on("app:ready", this.onAppReady.bind(this))
          },

          render: function (el) {
            if (el) el.html(this.getPanel())

            return this
          },

          getPanel: function () {
            this.$el = $(_.template(template)({}))
            const $host = this.$el

            const _injectComponent = (id, cmp) => {
              Common.Utils.injectComponent($host.findById(id), cmp)
            }
            const _set = Common.enumLock
            _injectComponent("#slot-spin-header-top", this.numHeaderPosition)
            _injectComponent("#slot-spin-footer-bot", this.numFooterPosition)
            this.btnsHeaderFooter = Common.Utils.injectButtons(
              $host
                .find(".btn-slot.slot-headerfooter")
                .add(this.toolbar.$el.find(".btn-slot.slot-headerfooter")),
              "tlbtn-headerfooter-",
              "toolbar__icon btn-editheader",
              this.txtHeaderFooter,
              [
                _set.previewReviewMode,
                _set.viewFormMode,
                _set.lostConnect,
                _set.docLockView,
                _set.docLockForms,
                _set.viewMode,
                _set.docLockComments,
              ],
              undefined,
              true,
              undefined,
              "1",
              "bottom",
              "small",
            )
            Array.prototype.push.apply(this.lockedControls, this.btnsHeaderFooter)

            this.btnsPageNumber = Common.Utils.injectButtons(
              $host
                .find(".btn-slot.slot-pagenumbers")
                .add(this.toolbar.$el.find(".btn-slot.slot-pagenumbers")),
              "tlbtn-insertpagenum-",
              "toolbar__icon btn-pagenum",
              this.txtPageNumbering,
              [
                _set.previewReviewMode,
                _set.viewFormMode,
                _set.lostConnect,
                _set.docLockView,
                _set.docLockForms,
                _set.viewMode,
                _set.docLockComments,
              ],
              undefined,
              true,
              undefined,
              "1",
              "bottom",
              "small",
            )
            Array.prototype.push.apply(this.lockedControls, this.btnsPageNumber)

            this.btnsInsDateTime = Common.Utils.injectButtons(
              $host
                .find(".btn-slot.slot-insertdatetime")
                .add(this.toolbar.$el.find(".btn-slot.slot-insertdatetime")),
              "tlbtn-insertdatetime-",
              "toolbar__icon btn-datetime",
              this.capBtnDateTime,
              [
                _set.paragraphLock,
                _set.headerLock,
                _set.richEditLock,
                _set.plainEditLock,
                _set.richDelLock,
                _set.plainDelLock,
                _set.noParagraphSelected,
                _set.previewReviewMode,
                _set.viewFormMode,
                _set.lostConnect,
                _set.disableOnStart,
                _set.docLockViewIns,
                _set.docLockForms,
                _set.docLockCommentsIns,
                _set.viewMode,
              ],
              undefined,
              undefined,
              undefined,
              "1",
              "bottom",
              "small",
            )
            Array.prototype.push.apply(this.lockedControls, this.btnsInsDateTime)
            Array.prototype.push.apply(this.paragraphControls, this.btnsInsDateTime)

            this.btnsInsField = Common.Utils.injectButtons(
              $host
                .find(".btn-slot.slot-insertfield")
                .add(this.toolbar.$el.find(".btn-slot.slot-insertfield")),
              "tlbtn-insertfield-",
              "toolbar__icon btn-quick-field",
              this.capBtnInsField,
              [
                _set.paragraphLock,
                _set.headerLock,
                _set.richEditLock,
                _set.plainEditLock,
                _set.richDelLock,
                _set.plainDelLock,
                _set.noParagraphSelected,
                _set.previewReviewMode,
                _set.viewFormMode,
                _set.lostConnect,
                _set.disableOnStart,
                _set.docLockViewIns,
                _set.docLockForms,
                _set.docLockCommentsIns,
                _set.viewMode,
              ],
              undefined,
              undefined,
              undefined,
              "1",
              "bottom",
              "small",
            )
            Array.prototype.push.apply(this.lockedControls, this.btnsInsField)
            Array.prototype.push.apply(this.paragraphControls, this.btnsInsField)

            this.btnsInsImage = Common.Utils.injectButtons(
              $host
                .find(".btn-slot.slot-insertimage")
                .add(this.toolbar.$el.find(".btn-slot.slot-insertimage")),
              "tlbtn-insertimage-",
              "toolbar__icon btn-insertimage",
              this.capBtnInsImage,
              [
                _set.paragraphLock,
                _set.headerLock,
                _set.inEquation,
                _set.controlPlain,
                _set.richDelLock,
                _set.plainDelLock,
                _set.contentLock,
                _set.cantAddImagePara,
                _set.previewReviewMode,
                _set.viewFormMode,
                _set.lostConnect,
                _set.disableOnStart,
                _set.docLockViewIns,
                _set.docLockForms,
                _set.docLockCommentsIns,
                _set.viewMode,
              ],
              undefined,
              true,
              undefined,
              "1",
              "bottom",
              "small",
              undefined,
              "insert-image",
            )
            Array.prototype.push.apply(this.lockedControls, this.btnsInsImage)
            Array.prototype.push.apply(this.paragraphControls, this.btnsInsImage)

            this.btnCloseTab?.render($host.find("#slot-btn-close-tab"))
            this.lblHeaderTop?.render($host.find("#slot-lbl-header-top"))
            this.lblFooterBottom?.render($host.find("#slot-lbl-footer-bot"))
            this.chDiffFirst?.render($host.find("#slot-chk-diff-first"))
            this.chDiffOddEven?.render($host.find("#slot-chk-diff-odd-even"))
            this.chSameAs?.render($host.find("#slot-chk-sameas"))
            return this.$el
          },

          onAppReady: function (config) {
            this.$el = $(_.template(template)({}))
            const _set = Common.enumLock

            this.mnuPageNumberPosPickers = []
            this.numOfPages = []
            this.numFormats = []
            this.numCurrPos = []

            this.btnsInsDateTime.forEach((button) => {
              button.updateHint(this.tipDateTime)

              button.on("click", () => {
                this.fireEvent("headerfooter:insdatetime")
              })
            })

            this.btnsInsField.forEach((button) => {
              button.updateHint(this.tipInsField)

              button.on("click", () => {
                this.fireEvent("headerfooter:insfield")
              })
            })

            this.btnsInsImage.forEach((button) => {
              button.updateHint(this.tipInsertImage)

              button.setMenu(
                new Common.UI.Menu({
                  items: [
                    { caption: this.mniImageFromFile, value: "file" },
                    { caption: this.mniImageFromUrl, value: "url" },
                    { caption: this.mniImageFromStorage, value: "storage" },
                  ],
                }).on("item:click", (menu, item, e) => {
                  this.fireEvent("headerfooter:insimage", [menu, item, e])
                }),
              )

              button.menu?.items[2].setVisible(
                config.canRequestInsertImage ||
                  (config.fileChoiceUrl && config.fileChoiceUrl.indexOf("{documentType}") > -1),
              )
            })

            this.btnsHeaderFooter.forEach((button) => {
              button.updateHint(this.tipHeaderFooter)

              const _menu = new Common.UI.Menu({
                items: [
                  { caption: this.txtEditHeader, value: "edit-header" },
                  { caption: this.txtEditFooter, value: "edit-footer" },
                  { caption: "--" },
                  { caption: this.txtRemoveHeader, value: "remove-header" },
                  { caption: this.txtRemoveFooter, value: "remove-footer" },
                ],
              })
              button.setMenu(_menu)
            })

            this.btnsPageNumber.forEach((button, index) => {
              button.updateHint(this.tipPageNumbering)
              const id = `id-toolbar-menu-pageposition${index}`

              const _menu = new Common.UI.Menu({
                style: "min-width: 90px;",
                items: [
                  { template: _.template(`<div id="${id}" class="menu-pageposition"></div>`) },
                  (this[`mnuPageNumCurrentPos${index}`] = new Common.UI.MenuItem({
                    caption: this.capCurrentPos,
                    lock: [
                      _set.paragraphLock,
                      _set.headerLock,
                      _set.richEditLock,
                      _set.plainEditLock,
                      _set.inEquation,
                    ],
                    value: "current",
                  })),
                  (this[`mnuPageNumOfPages${index}`] = new Common.UI.MenuItem({
                    caption: this.capNumOfPages,
                    lock: [
                      _set.paragraphLock,
                      _set.headerLock,
                      _set.richEditLock,
                      _set.plainEditLock,
                      _set.headerFooterLock,
                      _set.inEquation,
                    ],
                    value: "quantity",
                  })),
                  { caption: "--" },
                  (this[`mnuNumFormat${index}`] = new Common.UI.MenuItem({
                    caption: this.capFormatNums,
                    lock: [
                      _set.inHeader,
                      _set.paragraphLock,
                      _set.headerLock,
                      _set.headerFooterLock,
                    ],
                    value: "format",
                  })),
                ],
              })

              button.setMenu(_menu)

              const _conf = this.mnuPageNumberPosPicker
                ? this.mnuPageNumberPosPicker.conf
                : undefined
              const keepState = this.mnuPageNumberPosPicker
                ? this.mnuPageNumberPosPicker.keepState
                : undefined

              const picker = new Common.UI.DataView({
                el: $(`#${id}`),
                lock: this.mnuPageNumberPosPicker.options.lock,
                allowScrollbar: false,
                parentMenu: button.menu,
                outerMenu: { menu: button.menu, index: 0 },
                showLast: false,
                store: new Common.UI.DataViewStore([
                  {
                    iconname: "btn-page-number-top-left",
                    data: {
                      type: c_pageNumPosition.PAGE_NUM_POSITION_TOP,
                      subtype: c_pageNumPosition.PAGE_NUM_POSITION_LEFT,
                    },
                  },
                  {
                    iconname: "btn-page-number-top-center",
                    data: {
                      type: c_pageNumPosition.PAGE_NUM_POSITION_TOP,
                      subtype: c_pageNumPosition.PAGE_NUM_POSITION_CENTER,
                    },
                  },
                  {
                    iconname: "btn-page-number-top-right",
                    data: {
                      type: c_pageNumPosition.PAGE_NUM_POSITION_TOP,
                      subtype: c_pageNumPosition.PAGE_NUM_POSITION_RIGHT,
                    },
                  },
                  {
                    iconname: "btn-page-number-bottom-left",
                    data: {
                      type: c_pageNumPosition.PAGE_NUM_POSITION_BOTTOM,
                      subtype: c_pageNumPosition.PAGE_NUM_POSITION_LEFT,
                    },
                  },
                  {
                    iconname: "btn-page-number-bottom-center",
                    data: {
                      type: c_pageNumPosition.PAGE_NUM_POSITION_BOTTOM,
                      subtype: c_pageNumPosition.PAGE_NUM_POSITION_CENTER,
                    },
                  },
                  {
                    iconname: "btn-page-number-bottom-right",
                    data: {
                      type: c_pageNumPosition.PAGE_NUM_POSITION_BOTTOM,
                      subtype: c_pageNumPosition.PAGE_NUM_POSITION_RIGHT,
                    },
                  },
                ]),
                itemTemplate: _.template(
                  '<div id="<%= id %>" class="item-pagenumber options__icon options__icon-huge <%= iconname %>"></div>',
                ),
              }).on("item:click", (picker, item, record, e) => {
                this.fireEvent("headerfooter:pospick", [picker, item, record, e])
              })
              button.menu.setInnerMenu([{ menu: picker, index: 0 }])

              this.mnuPageNumberPosPickers.push(picker)
              this.numOfPages.push(this[`mnuPageNumOfPages${index}`])
              this.numFormats.push(this[`mnuNumFormat${index}`])
              this.numCurrPos.push(this[`mnuPageNumCurrentPos${index}`])

              picker.keepState = keepState
              _conf && picker.setDisabled(_conf.disabled)
            })

            Array.prototype.push.apply(this.paragraphControls, this.numOfPages)
            Array.prototype.push.apply(this.paragraphControls, this.numCurrPos)
            Array.prototype.push.apply(this.paragraphControls, this.numFormats)
            Array.prototype.push.apply(this.lockedControls, this.numFormats)
            this.btnCloseTab.updateHint(this.tipCloseTab)
          },

          show: function () {
            Common.UI.BaseView.prototype.show.call(this)
            this.fireEvent("show", this)
          },

          getButtons: function (type) {
            if (type === undefined) return this.lockedControls
            if (type === "insertbtns") return this.numCurrPos.concat(this.numOfPages)
            return []
          },

          SetDisabled: function (state) {
            this.lockedControls?.forEach((button) => {
              if (button) {
                button.setDisabled(state)
              }
            }, this)
          },
        }
      })(),
      DE.Views.HeaderFooterTab || {},
    ),
  )
})
