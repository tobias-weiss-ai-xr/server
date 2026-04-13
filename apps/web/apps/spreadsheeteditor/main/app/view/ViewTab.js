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
 *  ViewTab.js
 *
 *  Created on 08.07.2020
 *
 */

define([
  "common/main/lib/util/utils",
  "common/main/lib/component/BaseView",
  "common/main/lib/component/Layout",
], () => {
  SSE.Views.ViewTab = Common.UI.BaseView.extend(
    _.extend(
      (() => {
        const template =
          '<section class="panel" data-tab="view" role="tabpanel" aria-labelledby="view">' +
          '<div class="group sheet-views">' +
          '<span class="btn-slot text x-huge" id="slot-btn-sheet-view"></span>' +
          "</div>" +
          '<div class="group sheet-views small">' +
          '<div class="elset">' +
          '<span class="btn-slot text" id="slot-createview"></span>' +
          "</div>" +
          '<div class="elset">' +
          '<span class="btn-slot text" id="slot-closeview"></span>' +
          "</div>" +
          "</div>" +
          '<div class="separator long sheet-views"></div>' +
          '<div class="group doc-preview">' +
          '<span class="btn-slot text x-huge" id="slot-btn-view-normal"></span>' +
          '<span class="btn-slot text x-huge" id="slot-btn-view-pagebreak"></span>' +
          "</div>" +
          '<div class="separator long doc-preview"></div>' +
          '<div class="group small">' +
          '<div class="elset" style="display: flex;">' +
          '<span class="btn-slot" id="slot-field-zoom" style="flex-grow: 1;"></span>' +
          "</div>" +
          '<div class="elset" style="text-align: center;">' +
          '<span class="btn-slot text font-size-normal" id="slot-lbl-zoom" style="text-align: center;margin-top: 4px;"></span>' +
          "</div>" +
          "</div>" +
          '<div class="separator long"></div>' +
          '<div class="group">' +
          '<span class="btn-slot text x-huge" id="slot-btn-interface-theme"></span>' +
          "</div>" +
          '<div class="separator long separator-theme"></div>' +
          '<div class="group sheet-freeze">' +
          '<span class="btn-slot text x-huge" id="slot-btn-freeze"></span>' +
          "</div>" +
          '<div class="separator long sheet-freeze"></div>' +
          '<div class="group small sheet-formula">' +
          '<div class="elset">' +
          '<span class="btn-slot text" id="slot-chk-formula"></span>' +
          "</div>" +
          '<div class="elset">' +
          '<span class="btn-slot text" id="slot-chk-heading"></span>' +
          "</div>" +
          "</div>" +
          '<div class="group small sheet-gridlines">' +
          '<div class="elset">' +
          '<span class="btn-slot text" id="slot-chk-gridlines"></span>' +
          "</div>" +
          '<div class="elset">' +
          '<span class="btn-slot text" id="slot-chk-zeros"></span>' +
          "</div>" +
          "</div>" +
          '<div class="separator long separator-formula"></div>' +
          '<div class="group small">' +
          '<div class="elset">' +
          '<span class="btn-slot text" id="slot-chk-toolbar"></span>' +
          "</div>" +
          '<div class="elset">' +
          '<span class="btn-slot text" id="slot-chk-statusbar"></span>' +
          "</div>" +
          "</div>" +
          '<div class="group small">' +
          '<div class="elset">' +
          '<span class="btn-slot text" id="slot-chk-leftmenu"></span>' +
          "</div>" +
          '<div class="elset">' +
          '<span class="btn-slot text" id="slot-chk-rightmenu"></span>' +
          "</div>" +
          "</div>" +
          '<div class="separator long macro"></div>' +
          '<div class="group macro">' +
          '<span class="btn-slot text x-huge" id="slot-btn-macros"></span>' +
          "</div>" +
          '<div class="group small macro">' +
          '<div class="elset">' +
          '<span class="btn-slot text" id="slot-btn-macro-start" style="text-align: center;"></span>' +
          "</div>" +
          '<div class="elset">' +
          '<span class="btn-slot text" id="slot-btn-macro-pause" style="text-align: center;"></span>' +
          "</div>" +
          "</div>" +
          "</section>"

        function setEvents() {
          if (this.appConfig.canFeatureViews && this.appConfig.isEdit) {
            this.btnCloseView.on("click", (btn, e) => {
              this.fireEvent("viewtab:openview", [{ name: "default", value: "default" }])
            })
            this.btnCreateView.on("click", (btn, e) => {
              this.fireEvent("viewtab:createview")
            })
          }

          this.btnFreezePanes?.menu &&
            typeof this.btnFreezePanes.menu === "object" &&
            this.btnFreezePanes.menu.on("item:click", (menu, item, e) => {
              if (item.value === "shadow") {
                this.fireEvent("viewtab:freezeshadow", [item.checked])
              } else {
                this.fireEvent("viewtab:freeze", [item.value])
              }
            })
          this.chFormula.on("change", (field, value) => {
            this.fireEvent("viewtab:formula", [0, value === "checked"])
          })
          this.chHeadings?.on("change", (field, value) => {
            this.fireEvent("viewtab:headings", [1, value === "checked"])
          })
          this.chGridlines?.on("change", (field, value) => {
            this.fireEvent("viewtab:gridlines", [2, value === "checked"])
          })
          this.chZeros?.on("change", (field, value) => {
            this.fireEvent("viewtab:zeros", [3, value === "checked"])
          })
          this.chToolbar.on("change", (field, value) => {
            this.fireEvent("viewtab:showtoolbar", [field, value !== "checked"])
          })
          this.chStatusbar.on("change", (field, value) => {
            this.fireEvent("statusbar:setcompact", [field, value === "checked"])
          })
          this.cmbZoom
            .on("selected", (combo, record) => {
              this.fireEvent("zoom:selected", [combo, record])
            })
            .on("changed:before", (combo, record) => {
              this.fireEvent("zoom:changedbefore", [true, combo, record])
            })
            .on("changed:after", (combo, record) => {
              this.fireEvent("zoom:changedafter", [false, combo, record])
            })
            .on("combo:blur", () => {
              this.fireEvent("editcomplete", this)
            })
            .on("combo:focusin", _.bind(this.onComboOpen, this, false))
            .on("show:after", _.bind(this.onComboOpen, this, true))
          this.chLeftMenu.on(
            "change",
            _.bind((checkbox, state) => {
              this.fireEvent("leftmenu:hide", [this.chLeftMenu, state === "checked"])
            }, this),
          )
          this.chRightMenu.on(
            "change",
            _.bind((checkbox, state) => {
              this.fireEvent("rightmenu:hide", [this.chRightMenu, state === "checked"])
            }, this),
          )
          this.btnMacros?.on("click", () => {
            this.fireEvent("macros:click")
          })
          this.btnRecMacro?.on("click", () => {
            this.fireEvent("macros:record")
          })
          this.btnPauseMacro?.on("click", () => {
            this.fireEvent("macros:pause")
          })

          this.btnViewNormal?.on("click", (btn, e) => {
            btn.pressed && this.fireEvent("viewtab:viewmode", [Asc.c_oAscESheetViewType.normal])
          })
          this.btnViewPageBreak?.on("click", (btn, e) => {
            btn.pressed &&
              this.fireEvent("viewtab:viewmode", [Asc.c_oAscESheetViewType.pageBreakPreview])
          })
        }

        return {
          options: {},

          initialize: function (options) {
            Common.UI.BaseView.prototype.initialize.call(this)
            this.toolbar = options.toolbar
            this.appConfig = options.mode

            this.lockedControls = []
            const _set = Common.enumLock

            if (this.appConfig.canFeatureViews && this.appConfig.isEdit) {
              this.btnSheetView = new Common.UI.Button({
                cls: "btn-toolbar x-huge icon-top",
                iconCls: "toolbar__icon btn-big-sheet-view",
                caption: this.capBtnSheetView,
                lock: [_set.lostConnect, _set.coAuth, _set.editCell],
                menu: true,
                action: "sheet-view",
                dataHint: "1",
                dataHintDirection: "bottom",
                dataHintOffset: "small",
              })
              this.lockedControls.push(this.btnSheetView)

              this.btnCreateView = new Common.UI.Button({
                id: "id-toolbar-btn-createview",
                cls: "btn-toolbar",
                iconCls: "toolbar__icon btn-sheet-view-new",
                caption: this.textCreate,
                lock: [_set.coAuth, _set.lostConnect, _set.editCell],
                dataHint: "1",
                dataHintDirection: "left",
                dataHintOffset: "big",
              })
              this.lockedControls.push(this.btnCreateView)

              this.btnCloseView = new Common.UI.Button({
                id: "id-toolbar-btn-closeview",
                cls: "btn-toolbar",
                iconCls: "toolbar__icon btn-sheet-view-close",
                caption: this.textClose,
                lock: [_set.sheetView, _set.coAuth, _set.lostConnect, _set.editCell],
                dataHint: "1",
                dataHintDirection: "left",
                dataHintOffset: "big",
              })
              this.lockedControls.push(this.btnCloseView)
            }

            if (this.appConfig.isEdit) {
              this.btnFreezePanes = new Common.UI.Button({
                cls: "btn-toolbar x-huge icon-top",
                iconCls: "toolbar__icon btn-freeze-panes",
                caption: this.capBtnFreeze,
                menu: true,
                action: "freeze-panes",
                lock: [_set.sheetLock, _set.lostConnect, _set.coAuth, _set.editCell],
                dataHint: "1",
                dataHintDirection: "bottom",
                dataHintOffset: "small",
              })
              this.lockedControls.push(this.btnFreezePanes)

              this.chHeadings = new Common.UI.CheckBox({
                labelText: this.textHeadings,
                lock: [_set.sheetLock, _set.lostConnect, _set.coAuth, _set.editCell],
                dataHint: "1",
                dataHintDirection: "left",
                dataHintOffset: "small",
              })
              this.lockedControls.push(this.chHeadings)

              this.chGridlines = new Common.UI.CheckBox({
                labelText: this.textGridlines,
                lock: [_set.sheetLock, _set.lostConnect, _set.coAuth, _set.editCell],
                dataHint: "1",
                dataHintDirection: "left",
                dataHintOffset: "small",
              })
              this.lockedControls.push(this.chGridlines)

              this.chZeros = new Common.UI.CheckBox({
                labelText: this.textZeros,
                lock: [_set.sheetLock, _set.lostConnect, _set.coAuth, _set.editCell],
                dataHint: "1",
                dataHintDirection: "left",
                dataHintOffset: "small",
              })
              this.lockedControls.push(this.chZeros)

              this.btnViewNormal = new Common.UI.Button({
                cls: "btn-toolbar x-huge icon-top",
                iconCls: "toolbar__icon btn-normal-view",
                enableToggle: true,
                allowDepress: false,
                caption: this.txtViewNormal,
                lock: [_set.sheetLock, _set.lostConnect, _set.coAuth, _set.editCell],
                dataHint: "1",
                dataHintDirection: "bottom",
                dataHintOffset: "small",
              })
              this.lockedControls.push(this.btnViewNormal)

              this.btnViewPageBreak = new Common.UI.Button({
                cls: "btn-toolbar x-huge icon-top",
                iconCls: "toolbar__icon btn-page-break-preview",
                enableToggle: true,
                allowDepress: false,
                caption: this.txtViewPageBreak,
                lock: [_set.sheetLock, _set.lostConnect, _set.coAuth, _set.editCell],
                dataHint: "1",
                dataHintDirection: "bottom",
                dataHintOffset: "small",
              })
              this.lockedControls.push(this.btnViewPageBreak)

              if (
                this.appConfig.isEdit &&
                !(this.appConfig.customization && this.appConfig.customization.macros === false) &&
                !Common.Controllers.Desktop?.isWinXp()
              ) {
                this.btnMacros = new Common.UI.Button({
                  cls: "btn-toolbar x-huge icon-top",
                  iconCls: "toolbar__icon btn-macros",
                  lock: [
                    _set.selRangeEdit,
                    _set.editFormula,
                    _set.lostConnect,
                    _set.disableOnStart,
                  ],
                  caption: this.textMacros,
                  dataHint: "1",
                  dataHintDirection: "bottom",
                  dataHintOffset: "small",
                })
                this.lockedControls.push(this.btnMacros)

                this.btnRecMacro = new Common.UI.Button({
                  cls: "btn-toolbar",
                  iconCls: "toolbar__icon btn-macros-record",
                  lock: [
                    _set.selRangeEdit,
                    _set.editFormula,
                    _set.lostConnect,
                    _set.disableOnStart,
                  ],
                  caption: this.textRecMacro,
                  dataHint: "1",
                  dataHintDirection: "left",
                  dataHintOffset: "medium",
                })
                this.lockedControls.push(this.btnRecMacro)

                this.btnPauseMacro = new Common.UI.Button({
                  cls: "btn-toolbar",
                  iconCls: "toolbar__icon btn-macros-pause",
                  lock: [
                    _set.macrosStopped,
                    _set.selRangeEdit,
                    _set.editFormula,
                    _set.lostConnect,
                    _set.disableOnStart,
                  ],
                  caption: this.textPauseMacro,
                  dataHint: "1",
                  dataHintDirection: "left",
                  dataHintOffset: "medium",
                })
                this.lockedControls.push(this.btnPauseMacro)
              }
            }

            this.cmbZoom = new Common.UI.ComboBox({
              cls: "input-group-nr",
              menuStyle: "min-width: 55px;",
              hint: this.tipFontSize,
              editable: true,
              lock: [_set.lostConnect, _set.editCell],
              data: [
                { displayValue: "50%", value: 50 },
                { displayValue: "75%", value: 75 },
                { displayValue: "100%", value: 100 },
                { displayValue: "125%", value: 125 },
                { displayValue: "150%", value: 150 },
                { displayValue: "175%", value: 175 },
                { displayValue: "200%", value: 200 },
                { displayValue: "300%", value: 300 },
                { displayValue: "400%", value: 400 },
                { displayValue: "500%", value: 500 },
              ],
              dataHint: "1",
              dataHintDirection: "top",
              dataHintOffset: "small",
            })
            this.lockedControls.push(this.cmbZoom)

            this.btnInterfaceTheme = new Common.UI.Button({
              cls: "btn-toolbar x-huge icon-top",
              iconCls: "toolbar__icon btn-day",
              caption: this.textInterfaceTheme,
              menu: true,
              dataHint: "1",
              dataHintDirection: "bottom",
              dataHintOffset: "small",
              action: "interface-theme",
            })
            this.lockedControls.push(this.btnInterfaceTheme)

            this.chFormula = new Common.UI.CheckBox({
              labelText: this.textFormula,
              value: !Common.localStorage.getBool("sse-hidden-formula"),
              lock: [_set.lostConnect, _set.editCell],
              dataHint: "1",
              dataHintDirection: "left",
              dataHintOffset: "small",
            })
            this.lockedControls.push(this.chFormula)

            this.chStatusbar = new Common.UI.CheckBox({
              labelText: this.textCombineSheetAndStatusBars,
              value: Common.localStorage.getBool("sse-compact-statusbar", true),
              lock: [_set.lostConnect, _set.editCell],
              dataHint: "1",
              dataHintDirection: "left",
              dataHintOffset: "small",
            })
            this.lockedControls.push(this.chStatusbar)

            this.chToolbar = new Common.UI.CheckBox({
              labelText: this.textAlwaysShowToolbar,
              value: !options.compactToolbar,
              lock: [_set.lostConnect, _set.editCell],
              dataHint: "1",
              dataHintDirection: "left",
              dataHintOffset: "small",
            })
            this.lockedControls.push(this.chToolbar)

            this.chRightMenu = new Common.UI.CheckBox({
              lock: [_set.lostConnect],
              labelText: !Common.UI.isRTL() ? this.textRightMenu : this.textLeftMenu,
              dataHint: "1",
              dataHintDirection: "left",
              dataHintOffset: "small",
            })
            this.lockedControls.push(this.chRightMenu)

            this.chLeftMenu = new Common.UI.CheckBox({
              lock: [_set.lostConnect],
              labelText: !Common.UI.isRTL() ? this.textLeftMenu : this.textRightMenu,
              dataHint: "1",
              dataHintDirection: "left",
              dataHintOffset: "small",
            })
            this.lockedControls.push(this.chLeftMenu)

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

            this.btnSheetView?.render($host.find("#slot-btn-sheet-view"))
            this.btnCreateView?.render($host.find("#slot-createview"))
            this.btnCloseView?.render($host.find("#slot-closeview"))
            this.btnFreezePanes?.render($host.find("#slot-btn-freeze"))
            this.cmbZoom.render($host.find("#slot-field-zoom"))
            this.cmbZoom.setValue(100)
            $host.find("#slot-lbl-zoom").text(this.textZoom)
            this.btnInterfaceTheme.render($host.find("#slot-btn-interface-theme"))
            this.chFormula.render($host.find("#slot-chk-formula"))
            this.chStatusbar.render($host.find("#slot-chk-statusbar"))
            this.chToolbar.render($host.find("#slot-chk-toolbar"))
            this.chHeadings?.render($host.find("#slot-chk-heading"))
            this.chGridlines?.render($host.find("#slot-chk-gridlines"))
            this.chZeros?.render($host.find("#slot-chk-zeros"))
            this.chLeftMenu.render($host.find("#slot-chk-leftmenu"))
            this.chRightMenu.render($host.find("#slot-chk-rightmenu"))
            this.btnMacros?.render($host.find("#slot-btn-macros"))
            this.btnRecMacro?.render($host.find("#slot-btn-macro-start"))
            this.btnPauseMacro?.render($host.find("#slot-btn-macro-pause"))
            this.btnViewNormal?.render($host.find("#slot-btn-view-normal"))
            this.btnViewPageBreak?.render($host.find("#slot-btn-view-pagebreak"))
            Common.Utils.lockControls(Common.enumLock.macrosStopped, true, {
              array: [this.btnPauseMacro],
            })
            return this.$el
          },

          onAppReady: function (config) {
            const me = this
            new Promise((accept, reject) => {
              accept()
            }).then(() => {
              if (!(config.canFeatureViews && me.appConfig.isEdit)) {
                me.toolbar?.$el.find(".group.sheet-views").hide()
                me.toolbar?.$el.find(".separator.sheet-views").hide()
              } else {
                me.btnSheetView.updateHint(me.tipSheetView)
                me.setButtonMenu(me.btnSheetView)

                me.btnCreateView.updateHint(me.tipCreate)
                me.btnCloseView.updateHint(me.tipClose)
                Common.Utils.lockControls(
                  Common.enumLock.sheetView,
                  me.toolbar?.api?.asc_getActiveNamedSheetView &&
                    !me.toolbar.api.asc_getActiveNamedSheetView(
                      me.toolbar.api.asc_getActiveWorksheetIndex(),
                    ),
                  { array: [me.btnCloseView] },
                )
              }
              me.btnMacros?.updateHint(me.tipMacros)
              me.btnInterfaceTheme.updateHint(me.tipInterfaceTheme)
              me.btnRecMacro?.updateHint(me.tipRecMacro)
              me.btnPauseMacro?.updateHint(me.tipPauseMacro)

              if (config.isEdit) {
                me.btnFreezePanes.setMenu(
                  new Common.UI.Menu({
                    items: [
                      {
                        caption:
                          me.toolbar?.api &&
                          !!me.toolbar.api.asc_getSheetViewSettings().asc_getIsFreezePane()
                            ? me.textUnFreeze
                            : me.capBtnFreeze,
                        value: undefined,
                      },
                      {
                        caption: me.textFreezeRow,
                        value: Asc.c_oAscFrozenPaneAddType.firstRow,
                      },
                      {
                        caption: me.textFreezeCol,
                        value: Asc.c_oAscFrozenPaneAddType.firstCol,
                      },
                      { caption: "--" },
                      {
                        caption: me.textShowFrozenPanesShadow,
                        value: "shadow",
                        checkable: true,
                        checked: Common.localStorage.getBool("sse-freeze-shadow", true),
                      },
                    ],
                  }),
                )
                me.btnFreezePanes.updateHint(me.tipFreeze)
                me.btnViewNormal.updateHint(me.tipViewNormal)
                me.btnViewPageBreak.updateHint(me.tipViewPageBreak)
              } else {
                me.toolbar?.$el.find(".group.doc-preview").hide()
                me.toolbar?.$el.find(".separator.doc-preview").hide()
                me.toolbar?.$el.find(".group.sheet-freeze").hide()
                me.toolbar?.$el.find(".separator.sheet-freeze").hide()
                me.toolbar?.$el.find(".group.sheet-gridlines").hide()
              }
              if (
                !config.isEdit ||
                (config.customization && config.customization.macros === false) ||
                Common.Controllers.Desktop?.isWinXp()
              ) {
                me.toolbar.$el.find(".macro").remove()
              }

              if (!Common.UI.Themes.available()) {
                me.btnInterfaceTheme.$el.closest(".group").remove()
                me.$el.find(".separator-theme").remove()
              }

              const emptyGroup = []
              if (
                (config.canBrandingExt &&
                  config.customization &&
                  config.customization.statusBar === false) ||
                !Common.UI.LayoutManager.isElementVisible("statusBar")
              ) {
                emptyGroup.push(me.chStatusbar.$el.closest(".elset"))
                me.chStatusbar.$el.remove()
              }

              if (
                (config.canBrandingExt &&
                  config.customization &&
                  config.customization.leftMenu === false) ||
                !Common.UI.LayoutManager.isElementVisible("leftMenu")
              ) {
                emptyGroup.push(me.chLeftMenu.$el.closest(".elset"))
                me.chLeftMenu.$el.remove()
              } else if (emptyGroup.length > 0) {
                emptyGroup.push(me.chLeftMenu.$el.closest(".elset"))
                emptyGroup.shift().append(me.chLeftMenu.$el[0])
              }

              if (
                !config.isEdit ||
                (config.canBrandingExt &&
                  config.customization &&
                  config.customization.rightMenu === false) ||
                !Common.UI.LayoutManager.isElementVisible("rightMenu")
              ) {
                emptyGroup.push(me.chRightMenu.$el.closest(".elset"))
                me.chRightMenu.$el.remove()
              } else if (emptyGroup.length > 0) {
                emptyGroup.push(me.chRightMenu.$el.closest(".elset"))
                emptyGroup.shift().append(me.chRightMenu.$el[0])
              }
              if (emptyGroup.length > 1) {
                // remove empty group
                emptyGroup[emptyGroup.length - 1].closest(".group").remove()
              }

              if (Common.UI.Themes.available()) {
                function _add_tab_styles() {
                  const btn = me.btnInterfaceTheme
                  if (typeof btn.menu === "object") btn.menu.addItem({ caption: "--" }, true)
                  else btn.setMenu(new Common.UI.Menu())
                  const mni = new Common.UI.MenuItem({
                    value: -1,
                    caption: me.textTabStyle,
                    menu: new Common.UI.Menu({
                      menuAlign: "tl-tr",
                      items: [
                        {
                          value: "fill",
                          caption: me.textFill,
                          checkable: true,
                          toggleGroup: "tabstyle",
                        },
                        {
                          value: "line",
                          caption: me.textLine,
                          checkable: true,
                          toggleGroup: "tabstyle",
                        },
                      ],
                    }),
                  })
                  _.each(mni.menu.items, (item) => {
                    item.setChecked(
                      Common.Utils.InternalSettings.get("settings-tab-style") === item.value,
                      true,
                    )
                  })
                  mni.menu.on(
                    "item:click",
                    _.bind((menu, item) => {
                      Common.UI.TabStyler.setStyle(item.value)
                    }, me),
                  )
                  btn.menu.addItem(mni, true)
                  me.menuTabStyle = mni.menu
                }
                function _fill_themes() {
                  const btn = this.btnInterfaceTheme
                  if (typeof btn.menu === "object") btn.menu.removeAll(true)
                  else btn.setMenu(new Common.UI.Menu())

                  const currentTheme =
                    Common.UI.Themes.currentThemeId() || Common.UI.Themes.defaultThemeId()
                  let idx = 0
                  for (const t in Common.UI.Themes.map()) {
                    btn.menu.insertItem(idx++, {
                      value: t,
                      caption: Common.UI.Themes.get(t).text,
                      checked: t === currentTheme,
                      checkable: true,
                      toggleGroup: "interface-theme",
                    })
                  }
                  // Common.UI.FeaturesManager.canChange('tabStyle', true) && _add_tab_styles();
                }

                Common.NotificationCenter.on("uitheme:countchanged", _fill_themes.bind(me))
                _fill_themes.call(me)

                if (me.btnInterfaceTheme.menu.getItemsLength(true)) {
                  me.btnInterfaceTheme.menu.on(
                    "item:click",
                    _.bind((menu, item) => {
                      const value = item.value
                      Common.UI.Themes.setTheme(value)
                    }, me),
                  )
                }
              }

              let value = Common.UI.LayoutManager.getInitValue("leftMenu")
              value = value !== undefined ? !value : false
              me.chLeftMenu.setValue(!Common.localStorage.getBool("sse-hidden-leftmenu", value))

              value = Common.UI.LayoutManager.getInitValue("rightMenu")
              value = value !== undefined ? !value : false
              me.chRightMenu.setValue(!Common.localStorage.getBool("sse-hidden-rightmenu", value))

              setEvents.call(me)

              if (Common.Utils.InternalSettings.get("toolbar-active-tab") === "view")
                Common.NotificationCenter.trigger("tab:set-active", "view", true)
            })
          },

          setButtonMenu: function (btn) {
            const arr = [
              { caption: this.textDefault, value: "default", checkable: true, allowDepress: false },
            ]
            btn.setMenu(
              new Common.UI.Menu({
                items: [
                  {
                    template: _.template(
                      '<div id="id-toolbar-sheet-view-menu-" style="display: flex;" class="open"></div>',
                    ),
                  },
                  { caption: "--" },
                  {
                    caption: this.textManager,
                    value: "manager",
                  },
                ],
              }),
            )
            btn.menu.items[2].on("click", (item, e) => {
              this.fireEvent("viewtab:manager")
            })
            btn.menu
              .on("show:after", (menu, e) => {
                const internalMenu = menu._innerMenu
                internalMenu.scroller.update({ alwaysVisibleY: true })
                _.delay(() => {
                  menu._innerMenu?.cmpEl.focus()
                }, 10)
              })
              .on("show:before", (menu, e) => {
                this.fireEvent("viewtab:showview")
              })

            const menu = new Common.UI.Menu({
              maxHeight: 300,
              cls: "internal-menu",
              items: arr,
              outerMenu: { menu: btn.menu, index: 0 },
            })
            menu.render(btn.menu.items[0].cmpEl.children(":first"))
            menu.cmpEl.css({
              display: "block",
              position: "relative",
              left: 0,
              top: 0,
            })
            menu.cmpEl.attr({ tabindex: "-1" })
            menu.on("item:toggle", (menu, item, state, e) => {
              if (state)
                this.fireEvent("viewtab:openview", [{ name: item.caption, value: item.value }])
            })
            btn.menu._innerMenu = menu
            btn.menu.setInnerMenu([{ menu: menu, index: 0 }])
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

          onComboOpen: (needfocus, combo, e, params) => {
            if (params?.fromKeyDown) return
            _.delay(() => {
              const input = $("input", combo.cmpEl).select()
              if (needfocus) input.focus()
              else if (!combo.isMenuOpen())
                input.one("mouseup", (e) => {
                  e.preventDefault()
                })
            }, 10)
          },

          capBtnSheetView: "Sheet View",
          capBtnFreeze: "Freeze Panes",
          textZoom: "Zoom",
          tipSheetView: "Sheet view",
          textDefault: "Default",
          textManager: "View manager",
          tipFreeze: "Freeze panes",
          tipCreate: "Create sheet view",
          tipClose: "Close sheet view",
          textCreate: "New",
          textClose: "Close",
          textFormula: "Formula bar",
          textHeadings: "Headings",
          textGridlines: "Gridlines",
          textFreezeRow: "Freeze Top Row",
          textFreezeCol: "Freeze First Column",
          textUnFreeze: "Unfreeze Panes",
          textZeros: "Show zeros",
          textCombineSheetAndStatusBars: "Combine sheet and status bars",
          textAlwaysShowToolbar: "Always show toolbar",
          textInterfaceTheme: "Interface theme",
          textShowFrozenPanesShadow: "Show frozen panes shadow",
          tipInterfaceTheme: "Interface theme",
          textLeftMenu: "Left panel",
          textRightMenu: "Right panel",
          txtViewNormal: "Normal",
          txtViewPageBreak: "Page Break Preview",
          tipViewNormal: "See your document in Normal view",
          tipViewPageBreak: "See where the page breaks will appear when your document is printed",
          textTabStyle: "Tab style",
          textFill: "Fill",
          textLine: "Line",
          textMacros: "Macros",
          tipMacros: "Macros",
        }
      })(),
      SSE.Views.ViewTab || {},
    ),
  )
})
