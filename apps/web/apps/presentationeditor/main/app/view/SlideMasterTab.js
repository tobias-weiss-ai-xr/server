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
 *  SlideMasterTab.js
 *
 *  Created on 01.06.2025
 *
 */

define([
  "common/main/lib/util/utils",
  "common/main/lib/component/BaseView",
  "common/main/lib/component/Layout",
], () => {
  PE.Views.SlideMasterTab = Common.UI.BaseView.extend(
    _.extend(
      (() => {
        const template =
          '<section class="panel" data-tab="slideMaster" role="tabpanel" aria-labelledby="view">' +
          '<div class="group">' +
          '<span class="btn-slot text x-huge" id="id-toolbar-btn-add-slide-master"></span>' +
          '<span class="btn-slot text x-huge" id="id-toolbar-btn-add-layout"></span>' +
          "</div>" +
          '<div class="separator long"></div>' +
          '<div class="group master-slide-mode">' +
          '<span class="btn-slot text x-huge" id="tlbtn-insertplaceholder"></span>' +
          "</div>" +
          '<div class="group master-slide-mode">' +
          '<div class="elset">' +
          '<span class="btn-slot text x-huge" id="slot-chk-title"></span>' +
          "</div>" +
          '<div class="elset">' +
          '<span class="btn-slot text x-huge" id="slot-chk-footers"></span>' +
          "</div>" +
          "</div>" +
          '<div class="group master-slide-mode">' +
          '<span class="btn-slot text x-huge" id="slot-btn-closeslidemaster"></span>' +
          "</div>" +
          "</section>"
        return {
          options: {},

          setEvents: function () {
            this.btnCloseSlideMaster?.on(
              "click",
              _.bind((btn, state) => {
                this.fireEvent("mode:normal", [state])
              }),
            )
            this.chTitle?.on(
              "change",
              _.bind((checkbox, state) => {
                this.fireEvent("title:hide", [this.chTitle, state === "checked"])
              }, this),
            )
            this.chFooters?.on(
              "change",
              _.bind((checkbox, state) => {
                this.fireEvent("footers:hide", [this.chFooters, state === "checked"])
              }, this),
            )
            this.btnInsertPlaceholder?.on("click", (btn, e) => {
              this.fireEvent("insert:placeholder-btn", [btn, e])
            })
          },

          initialize: function (options) {
            Common.UI.BaseView.prototype.initialize.call(this)
            this.appConfig = options.mode
            const _set = Common.enumLock
            this.lockedControls = []

            if (this.appConfig.isEdit) {
              this.btnAddLayout = new Common.UI.Button({
                id: "id-toolbar-btn-add-layout",
                cls: "btn-toolbar x-huge icon-top",
                iconCls: "toolbar__icon btn-add-layout",
                caption: this.capAddLayout,
                lock: [_set.menuFileOpen, _set.lostConnect, _set.disableOnStart],
                dataHint: "1",
                dataHintDirection: "bottom",
                dataHintOffset: "small",
              }).on(
                "click",
                function (btn, e) {
                  this.fireEvent("insert:layout", [btn, e])
                }.bind(this),
              )
              this.lockedControls.push(this.btnAddLayout)

              this.btnAddSlideMaster = new Common.UI.Button({
                id: "id-toolbar-btn-add-slide-master",
                cls: "btn-toolbar x-huge icon-top",
                iconCls: "toolbar__icon btn-add-slide-master",
                caption: this.capAddSlideMaster,
                lock: [_set.menuFileOpen, _set.lostConnect, _set.disableOnStart],
                dataHint: "1",
                dataHintDirection: "bottom",
                dataHintOffset: "small",
              }).on(
                "click",
                function (btn, e) {
                  this.fireEvent("insert:slide-master", [btn, e])
                }.bind(this),
              )
              this.lockedControls.push(this.btnAddSlideMaster)

              this.btnInsertPlaceholder = new Common.UI.Button({
                id: "tlbtn-insertplaceholder",
                cls: "btn-toolbar x-huge icon-top",
                iconCls: "toolbar__icon btn-ins-content-placeholder",
                caption: this.capInsertPlaceholder,
                lock: [
                  _set.slideDeleted,
                  _set.lostConnect,
                  _set.noSlides,
                  _set.disableOnStart,
                  _set.inSlideMaster,
                ],
                menu: true,
                split: true,
                action: "insert-placeholder",
                enableToggle: true,
                currentType: 1,
                dataHint: "1",
                dataHintDirection: "bottom",
                dataHintOffset: "small",
              })
              this.lockedControls.push(this.btnInsertPlaceholder)

              this.btnInsertPlaceholder.setMenu(
                new Common.UI.Menu({
                  cls: "menu-insert-placeholder",
                  items: [
                    new Common.UI.MenuItem({
                      caption: this.textContent,
                      iconCls: "icon toolbar__icon btn-ins-content-placeholder",
                      iconClsForMainBtn: "btn-ins-content-placeholder",
                      hintForMainBtn: this.tipInsertContentPlaceholder,
                      value: 1,
                    }),
                    new Common.UI.MenuItem({
                      caption: this.textContentVertical,
                      iconCls: "icon toolbar__icon btn-ins-vertical-content-placeholder",
                      iconClsForMainBtn: "btn-ins-vertical-content-placeholder",
                      hintForMainBtn: this.tipInsertContentVerticalPlaceholder,
                      value: 2,
                    }),
                    new Common.UI.MenuItem({
                      caption: this.textText,
                      iconCls: "icon toolbar__icon btn-ins-text-placeholder",
                      iconClsForMainBtn: "btn-ins-text-placeholder",
                      hintForMainBtn: this.tipInsertTextPlaceholder,
                      value: 3,
                    }),
                    new Common.UI.MenuItem({
                      caption: this.textTextVertical,
                      iconCls: "icon toolbar__icon btn-ins-vertical-text-placeholder",
                      iconClsForMainBtn: "btn-ins-vertical-text-placeholder",
                      hintForMainBtn: this.tipInsertTextVerticalPlaceholder,
                      value: 4,
                    }),
                    new Common.UI.MenuItem({
                      caption: this.textPicture,
                      iconCls: "icon toolbar__icon btn-ins-picture-placeholder",
                      iconClsForMainBtn: "btn-ins-picture-placeholder",
                      hintForMainBtn: this.tipInsertPicturePlaceholder,
                      value: 5,
                    }),
                    new Common.UI.MenuItem({
                      caption: this.textChart,
                      iconCls: "icon toolbar__icon btn-ins-chart-placeholder",
                      iconClsForMainBtn: "btn-ins-chart-placeholder",
                      hintForMainBtn: this.tipInsertChartPlaceholder,
                      value: 6,
                    }),
                    new Common.UI.MenuItem({
                      caption: this.textTable,
                      iconCls: "icon toolbar__icon btn-ins-table-placeholder",
                      iconClsForMainBtn: "btn-ins-table-placeholder",
                      hintForMainBtn: this.tipInsertTablePlaceholder,
                      value: 7,
                    }),
                    new Common.UI.MenuItem({
                      caption: this.textSmartArt,
                      iconCls: "icon toolbar__icon btn-ins-smartart-placeholder",
                      iconClsForMainBtn: "btn-ins-smartart-placeholder",
                      hintForMainBtn: this.tipInsertSmartArtPlaceholder,
                      value: 8,
                    }),
                  ],
                }).on("item:click", (btn, e) => {
                  this.btnInsertPlaceholder.toggle(true)
                  this.fireEvent("insert:placeholder-menu", [this.btnInsertPlaceholder, e])
                }),
              )

              this.chTitle = new Common.UI.CheckBox({
                id: "slot-chk-title",
                lock: [
                  _set.slideDeleted,
                  _set.lostConnect,
                  _set.noSlides,
                  _set.disableOnStart,
                  _set.inSlideMaster,
                ],
                labelText: this.textTitle,
                dataHint: "1",
                dataHintDirection: "left",
                dataHintOffset: "small",
              })
              this.lockedControls.push(this.chTitle)

              this.chFooters = new Common.UI.CheckBox({
                id: "slot-chk-footers",
                lock: [
                  _set.slideDeleted,
                  _set.lostConnect,
                  _set.noSlides,
                  _set.disableOnStart,
                  _set.inSlideMaster,
                ],
                labelText: this.textFooters,
                dataHint: "1",
                dataHintDirection: "left",
                dataHintOffset: "small",
              })
              this.lockedControls.push(this.chFooters)

              this.btnCloseSlideMaster = new Common.UI.Button({
                id: "slot-btn-closeslidemaster",
                cls: "btn-toolbar x-huge icon-top",
                iconCls: "toolbar__icon btn-close-tab",
                lock: [_set.slideDeleted, _set.lostConnect, _set.noSlides, _set.disableOnStart],
                caption: this.capCloseMaster,
                dataHint: "1",
                dataHintDirection: "bottom",
                dataHintOffset: "small",
              })
              this.lockedControls.push(this.btnCloseSlideMaster)
            }

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

            this.btnAddLayout?.render($host.find("#id-toolbar-btn-add-layout"))
            this.btnInsertPlaceholder?.render($host.find("#tlbtn-insertplaceholder"))
            this.btnAddSlideMaster?.render($host.find("#id-toolbar-btn-add-slide-master"))
            this.chTitle?.render($host.find("#slot-chk-title"))
            this.chFooters?.render($host.find("#slot-chk-footers"))
            this.btnCloseSlideMaster?.render($host.find("#slot-btn-closeslidemaster"))
            $host.find("#slot-lbl-zoom").text(this.textZoom)
            return this.$el
          },

          onAppReady: function (config) {
            new Promise((accept, reject) => {
              accept()
            }).then(() => {
              this.btnAddLayout?.updateHint(this.tipAddLayout)
              this.btnAddSlideMaster?.updateHint(this.tipAddSlideMaster)
              this.btnInsertPlaceholder?.updateHint(this.tipInsertPlaceholder)
              this.btnCloseSlideMaster?.updateHint(this.tipCloseMaster)

              this.setEvents()
            })
          },

          show: function () {
            Common.UI.BaseView.prototype.show.call(this)
            this.fireEvent("show", this)
          },

          getButtons: function (type) {
            if (type === undefined) return this.lockedControls
            return []
          },

          SetDisabled: function (state) {
            this.lockedControls?.forEach((button) => {
              if (button) {
                button.setDisabled(state)
              }
            }, this)
          },

          capAddSlideMaster: "Add Slide Master",
          tipAddSlideMaster: "Add slide master",
          capAddLayout: "Add Layout",
          tipAddLayout: "Add layout",
          textTitle: "Title",
          textFooters: "Footers",
          textContent: "Content",
          textContentVertical: "Content (Vertical)",
          textText: "Text",
          textTextVertical: "Text (Vertical)",
          textPicture: "Picture",
          textChart: "Chart",
          textTable: "Table",
          textSmartArt: "SmartArt",
          capCloseMaster: "Close Master",
          tipCloseMaster: "Close master",
          capInsertPlaceholder: "Insert Placeholder",
          tipInsertPlaceholder: "Insert placeholder",
          tipInsertContentPlaceholder: "Insert content placeholder",
          tipInsertContentVerticalPlaceholder: "Insert content (vertical) placeholder",
          tipInsertTextPlaceholder: "Insert text placeholder",
          tipInsertTextVerticalPlaceholder: "Insert text (vertical) placeholder",
          tipInsertPicturePlaceholder: "Insert picture placeholder",
          tipInsertChartPlaceholder: "Insert chart placeholder",
          tipInsertTablePlaceholder: "Insert table placeholder",
          tipInsertSmartArtPlaceholder: "Insert SmartArt placeholder",
        }
      })(),
      PE.Views.SlideMasterTab || {},
    ),
  )
})
