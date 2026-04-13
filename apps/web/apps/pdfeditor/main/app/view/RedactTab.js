/*
 * (c) Copyright Ascensio System SIA 2010-2023
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
 *  RedactTab.js
 *
 *  Created on 09.01.2025
 *
 */

define([
  "common/main/lib/util/utils",
  "common/main/lib/component/BaseView",
  "common/main/lib/component/Layout",
], () => {
  PDFE.Views.RedactTab = Common.UI.BaseView.extend(
    _.extend(
      (() => {
        const template =
          '<section class="panel" data-tab="red" role="tabpanel">' +
          '<div class="group">' +
          '<span class="btn-slot text x-huge" id="slot-btn-markredact"></span>' +
          '<span class="btn-slot text x-huge" id="slot-btn-redactpages"></span>' +
          '<span class="btn-slot text x-huge" id="slot-btn-findredact"></span>' +
          "</div>" +
          '<div class="separator long"></div>' +
          '<div class="group">' +
          '<span class="btn-slot text x-huge" id="slot-btn-apply-redactions"></span>' +
          "</div>" +
          "</section>"

        return {
          options: {},

          setEvents: function () {
            this.btnMarkForRedact.on("click", (btn) => {
              this.fireEvent("redact:start", [!!btn.pressed])
            })
            this.btnApplyRedactions.on("click", (menu, item, e) => {
              this.fireEvent("redact:apply", [item.value])
            })
            this.btnFindRedact?.on("click", (btn) => {
              this.fireEvent("search:showredact", [btn.pressed])
            })
          },

          initialize: function (options) {
            Common.UI.BaseView.prototype.initialize.call(this)
            this.toolbar = options.toolbar
            this.appConfig = options.mode

            this.lockedControls = []
            const _set = Common.enumLock

            this.btnMarkForRedact = new Common.UI.Button({
              cls: "btn-toolbar x-huge icon-top",
              iconCls: "toolbar__icon btn-big-redact-text",
              style: "min-width: 45px;",
              lock: [_set.lostConnect, _set.disableOnStart],
              caption: this.capMarkRedact,
              enableToggle: true,
              dataHint: "1",
              dataHintDirection: "bottom",
              dataHintOffset: "small",
            })
            this.lockedControls.push(this.btnMarkForRedact)

            this.btnRedactPages = new Common.UI.Button({
              cls: "btn-toolbar x-huge icon-top",
              iconCls: "toolbar__icon btn-redact-pages",
              lock: [_set.lostConnect, _set.disableOnStart],
              caption: this.capRedactPages,
              menu: true,
              dataHint: "1",
              dataHintDirection: "bottom",
              dataHintOffset: "small",
            })
            this.lockedControls.push(this.btnRedactPages)

            this.btnFindRedact = new Common.UI.Button({
              cls: "btn-toolbar x-huge icon-top",
              iconCls: "toolbar__icon btn-find-to-redact",
              lock: [_set.lostConnect, _set.disableOnStart],
              caption: this.capFindRedact,
              enableToggle: true,
              dataHint: "1",
              dataHintDirection: "bottom",
              dataHintOffset: "small",
            })
            this.lockedControls.push(this.btnFindRedact)

            this.btnApplyRedactions = new Common.UI.Button({
              cls: "btn-toolbar x-huge icon-top",
              iconCls: "toolbar__icon btn-redact-apply",
              style: "min-width: 45px;",
              lock: [_set.lostConnect, _set.disableOnStart],
              caption: this.capApplyRedactions,
              dataHint: "1",
              dataHintDirection: "bottom",
              dataHintOffset: "small",
            })
            this.lockedControls.push(this.btnApplyRedactions)

            Common.UI.LayoutManager.addControls(this.lockedControls)
            Common.Utils.lockControls(_set.disableOnStart, true, { array: this.lockedControls })
          },

          turnFindRedact: function (state) {
            this.btnFindRedact?.toggle(state, true)
          },

          render: function (el) {
            if (el) el.html(this.getPanel())

            return this
          },

          getPanel: function () {
            this.$el = $(_.template(template)({}))
            const $host = this.$el
            const _injectComponent = (id, cmp) => {
              Common.Utils.injectComponent($host.find(id), cmp)
            }
            _injectComponent("#slot-btn-markredact", this.btnMarkForRedact)
            _injectComponent("#slot-btn-redactpages", this.btnRedactPages)
            _injectComponent("#slot-btn-apply-redactions", this.btnApplyRedactions)
            _injectComponent("#slot-btn-findredact", this.btnFindRedact)

            return this.$el
          },

          onAppReady: function (config) {
            this.btnRedactPages.setMenu(
              new Common.UI.Menu({
                items: [
                  { caption: this.txtMarkCurrentPage, value: "current" },
                  { caption: this.txtSelectRange, value: "range" },
                ],
              }).on("item:click", (menu, item, e) => {
                if (item.value === "current") {
                  this.fireEvent("redact:page")
                } else {
                  this.fireEvent("redact:pages")
                }
              }),
            )

            this.btnMarkForRedact.updateHint(this.tipMarkForRedact)
            this.btnRedactPages.updateHint(this.tipRedactPages)
            this.btnApplyRedactions.updateHint(this.tipApplyRedactions)
            this.btnFindRedact.updateHint(this.tipFindRedact)
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
        }
      })(),
      PDFE.Views.RedactTab || {},
    ),
  )
})
