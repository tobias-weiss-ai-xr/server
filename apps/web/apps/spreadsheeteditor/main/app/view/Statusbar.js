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
 *  StatusBar View
 *
 *  Created on 27 March 2014
 *
 */

define([
  "text!spreadsheeteditor/main/app/template/StatusBar.template",
  "tip",
  "common/main/lib/component/TabBar",
  "common/main/lib/component/Menu",
  "common/main/lib/component/Window",
  "common/main/lib/component/ThemeColorPalette",
], (template) => {
  if (SSE.Views.Statusbar) {
    const RenameDialog = SSE.Views.Statusbar.RenameDialog
    const CopyDialog = SSE.Views.Statusbar.CopyDialog
  }

  SSE.Views.Statusbar = Common.UI.BaseView.extend(
    _.extend(
      {
        el: "#statusbar",
        template: _.template(template),

        events: function () {
          return {
            "click #status-btn-tabback": _.bind(this.onBtnTabScroll, this, "backward"),
            "click #status-btn-tabnext": _.bind(this.onBtnTabScroll, this, "forward"),
          }
        },

        api: undefined,

        initialize: function (options) {
          _.extend(this, options)
          Common.NotificationCenter.on(
            "uitheme:changed",
            _.bind(function () {
              this.setMode()
            }, this),
          )
        },

        render: function () {
          $(this.el).html(
            this.template({
              scope: this,
            }),
          )

          this.cntStatusbar = $(".statusbar", this.el)
          this.isCompact = Common.localStorage.getBool("sse-compact-statusbar", true)
          if (!this.isCompact) {
            this.cntStatusbar.addClass("no-compact")
          }

          this.editMode = false
          this.rangeSelectionMode = Asc.c_oAscSelectionDialogType.None
          this.isRtlSheet = false
          this.tabBarDefPosition = 141

          this.btnZoomDown = new Common.UI.Button({
            el: $("#status-btn-zoomdown", this.el),
            hint: `${this.tipZoomOut} (Ctrl+-)`,
            hintAnchor: "top",
          })

          this.btnZoomUp = new Common.UI.Button({
            el: $("#status-btn-zoomup", this.el),
            hint: `${this.tipZoomIn} (Ctrl++)`,
            hintAnchor: "top-right",
          })

          this.btnScrollBack = new Common.UI.Button({
            el: $("#status-btn-tabback", this.el),
            hint: this.tipPrev,
            disabled: true,
            hintAnchor: "top",
          })

          this.btnScrollNext = new Common.UI.Button({
            el: $("#status-btn-tabnext", this.el),
            hint: this.tipNext,
            disabled: true,
            hintAnchor: "top",
          })

          this.btnAddWorksheet = new Common.UI.Button({
            el: $("#status-btn-addtab", this.el),
            hint: this.tipAddTab,
            disabled: true,
            hintAnchor: "top",
          })

          const cnttablist = $(".cnt-tabslist", this.el)
          this.cntSheetList = new Common.UI.Button({
            el: cnttablist,
            hint: this.tipListOfSheets,
            hintAnchor: "top",
          })
          this.btnSheetList = $("#status-btn-tabslist", this.$el)
          this.sheetListMenu = new Common.UI.Menu({
            style: "margin-top:-3px;",
            menuAlign: "bl-tl",
            search: true,
            maxHeight: 300,
          })
          this.sheetListMenu.on("item:click", (obj, item) => {
            this.fireEvent("show:tab", [item.value])
          })
          this.cntSheetList.cmpEl.on({
            "show.bs.dropdown": () => {
              _.defer(() => {
                this.cntSheetList.cmpEl.find("ul").focus()
              }, 100)
            },
            "hide.bs.dropdown": () => {
              _.defer(() => {
                this.api.asc_enableKeyEvents(true)
              }, 100)
            },
          })
          this.sheetListMenu.render(cnttablist)
          this.sheetListMenu.cmpEl.attr({ tabindex: -1 })
          cnttablist.on("app:scaling", () => {
            this.setMode()
          })

          this.cntZoom = new Common.UI.Button({
            el: $(".cnt-zoom", this.el),
            hint: this.tipZoomFactor,
            hintAnchor: "top",
          })
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
          this.zoomMenu.render($(".cnt-zoom", this.el))
          this.zoomMenu.cmpEl.attr({ tabindex: -1 })

          this.labelZoom = $("#status-label-zoom", this.$el)

          this.tabBarBox = $("#status-sheets-bar-box", this.el)
          this.tabbar = new Common.UI.TabBar({
            el: "#status-sheets-bar",
            placement: "bottom",
            draggable: false,
          }).render()

          this.tabbar.on({
            "tab:invisible": _.bind(this.onTabInvisible, this),
            "tab:changed": _.bind(this.onSheetChanged, this),
            //'tab:manual'        : _.bind(this.onAddTabClick, this),
            "tab:contextmenu": _.bind(this.onTabMenu, this),
            "tab:dblclick": _.bind(() => {
              if (
                this.editMode &&
                !this.mode?.isDisconnected &&
                !this.mode?.isBackgroundOpen &&
                this.rangeSelectionMode !== Asc.c_oAscSelectionDialogType.Chart &&
                this.rangeSelectionMode !== Asc.c_oAscSelectionDialogType.FormatTable &&
                this.rangeSelectionMode !== Asc.c_oAscSelectionDialogType.PrintTitles
              ) {
                this.fireEvent("sheet:changename")
              }
            }, this),
          })

          const menuHiddenItems = new Common.UI.Menu({
            maxHeight: 267,
            menuAlign: "tl-tr",
          }).on("show:after", function () {
            this.scroller.update({ alwaysVisibleY: true })
          })
          menuHiddenItems.on("item:click", (obj, item, e) => {
            this.fireEvent("show:hidden", [this, item.value])
          })

          const menuColorItems = new Common.UI.Menu({
            menuAlign: "tl-tr",
            cls: "color-tab",
            items: [
              {
                template: _.template(
                  '<div id="id-tab-menu-color" style="width: 164px;display: inline-block;"></div>',
                ),
              },
              { caption: "--" },
              {
                id: "id-tab-menu-new-color",
                template: _.template(
                  `<a tabindex="-1" type="menuitem" style="${this.isRtlSheet ? "padding-right: 12px;" : "padding-left: 12px;"}">${this.textNewColor}</a>`,
                ),
              },
            ],
          })

          function dummyCmp() {
            return {
              isDummy: true,
              on: () => {},
            }
          }

          this.mnuTabColor = dummyCmp()
          this.tabMenu = new Common.UI.Menu({
            menuAlign: "bl-tl",
            items: [
              { caption: this.itemInsert, value: "ins" },
              { caption: this.itemDelete, value: "del" },
              { caption: this.itemRename, value: "ren" },
              { caption: this.itemMoveOrCopy, value: "move-copy" },
              { caption: this.itemHide, value: "hide" },
              {
                caption: this.itemHidden,
                menu: menuHiddenItems,
              },
              { caption: this.itemProtect, value: "protect" },
              {
                caption: this.itemTabColor,
                menu: menuColorItems,
              },
              { caption: "--" },
              { caption: this.selectAllSheets, value: "selectall" },
              { caption: this.ungroupSheets, value: "noselect" },
            ],
          }).on("render:after", (btn) => {
            this.mnuTabColor = new Common.UI.ThemeColorPalette({
              el: $("#id-tab-menu-color"),
              outerMenu: { menu: menuColorItems, index: 0, focusOnShow: true },
              transparent: true,
            })
            menuColorItems.setInnerMenu([{ menu: this.mnuTabColor, index: 0 }])
            this.mnuTabColor.on("select", (picker, color) => {
              this.fireEvent("sheet:setcolor", [color])
              setTimeout(() => {
                this.tabMenu.hide()
              }, 1)
            })
          })

          const customizeStatusBarMenuTemplate = _.template(
            '<a id="<%= id %>" tabindex="-1" type="menuitem">' +
              '<div style="position: relative;">' +
              '<div class="item-caption"><%= caption %></div>' +
              '<label class="item-value"><%= options.exampleval ? options.exampleval : "" %></label>' +
              "</div></a>",
          )

          this.customizeStatusBarMenu = new Common.UI.Menu({
            menuAlign: "bl-tl",
            menuAlignEl: $(this.el),
            items: [
              //{template: _.template('<div style="padding-left: 6px; padding-top: 2px;">' + this.textCustomizeStatusBar + '</div>')},
              //{caption: '--'},
              {
                id: "saved-status",
                caption: this.itemStatus,
                value: "status",
                checkable: true,
                checked: true,
                template: customizeStatusBarMenuTemplate,
                exampleval: "",
              },
              { caption: "--" },
              {
                id: "math-item-average",
                caption: this.itemAverage,
                value: "average",
                checkable: true,
                checked: true,
                template: customizeStatusBarMenuTemplate,
                exampleval: "",
              },
              {
                id: "math-item-count",
                caption: this.itemCount,
                value: "count",
                checkable: true,
                checked: true,
                template: customizeStatusBarMenuTemplate,
                exampleval: "",
              },
              {
                id: "math-item-min",
                caption: this.itemMinimum,
                value: "min",
                checkable: true,
                checked: true,
                template: customizeStatusBarMenuTemplate,
                exampleval: "",
              },
              {
                id: "math-item-max",
                caption: this.itemMaximum,
                value: "max",
                checkable: true,
                checked: true,
                template: customizeStatusBarMenuTemplate,
                exampleval: "",
              },
              {
                id: "math-item-sum",
                caption: this.itemSum,
                value: "sum",
                checkable: true,
                checked: true,
                template: customizeStatusBarMenuTemplate,
                exampleval: "",
              },
            ],
          })

          this.tabbar.$el.append(
            '<div class="dropdown-toggle" data-toggle="dropdown" style="width:0; height:0;"></div>',
          )
          this.tabMenu.render(this.tabbar.$el)
          this.tabMenu.cmpEl.attr({ tabindex: -1 })
          this.tabMenu.on("show:after", _.bind(this.onTabMenuAfterShow, this))
          this.tabMenu.on("hide:after", _.bind(this.onTabMenuAfterHide, this))
          this.tabMenu.on("item:click", _.bind(this.onTabMenuClick, this))

          this.boxMath = $("#status-math-box", this.el)
          this.labelSum = $("#status-math-sum", this.boxMath)
          this.labelCount = $("#status-math-count", this.boxMath)
          this.labelAverage = $("#status-math-average", this.boxMath)
          this.labelMin = $("#status-math-min", this.boxMath)
          this.labelMax = $("#status-math-max", this.boxMath)
          this.boxMath.hide()

          this.boxFiltered = $("#status-filtered-box", this.el)
          this.labelFiltered = $("#status-filtered-records", this.boxFiltered)
          this.boxFiltered.hide()

          this.boxZoom = $("#status-zoom-box", this.el)
          this.boxZoom.find(".separator").css("border-left-color", "transparent")

          this.boxNumberSheets = $("#status-number-of-sheet", this.el)
          this.isCompact && this.boxNumberSheets.hide()
          this.labelNumberSheets = $("#label-sheets", this.boxNumberSheets)

          this.boxAction = $("#status-action", this.el)
          this.boxAction.hide()
          this.labelAction = $("#label-action", this.boxAction)

          this.$el.append('<div id="statusbar-menu" style="width:0; height:0;"></div>')
          this.$customizeStatusBarMenu = this.$el.find("#statusbar-menu")
          this.$customizeStatusBarMenu.on({
            "show.bs.dropdown": () => {
              _.defer(() => {
                this.$customizeStatusBarMenu.find("ul").focus()
              }, 100)
            },
            "hide.bs.dropdown": () => {
              _.defer(() => {
                this.api.asc_enableKeyEvents(true)
              }, 100)
            },
          })
          this.$customizeStatusBarMenu.append(
            '<div class="dropdown-toggle" data-toggle="dropdown" style="width:0; height:0;"></div>',
          )
          this.customizeStatusBarMenu.render(this.$customizeStatusBarMenu)
          this.customizeStatusBarMenu.cmpEl.attr({ tabindex: -1 })
          this.customizeStatusBarMenu.on(
            "show:after",
            _.bind(this.onCustomizeStatusBarAfterShow, this),
          )
          this.customizeStatusBarMenu.on(
            "hide:after",
            _.bind(this.onCustomizeStatusBarAfterHide, this),
          )
          this.customizeStatusBarMenu.on("item:click", _.bind(this.onCustomizeStatusBarClick, this))
          this.$el.on("contextmenu", _.bind(this.showCustomizeStatusBar, this))

          return this
        },

        setApi: function (api) {
          this.api = api
          this.api.asc_registerCallback("asc_onSheetsChanged", _.bind(this.update, this))
          this.api.asc_registerCallback(
            "asc_onUpdateSheetViewSettings",
            _.bind(this.onUpdateSheetViewSettings, this),
          )
          this.api.asc_registerCallback(
            "asc_onChangeActiveNamedSheetView",
            _.bind(this.update, this),
          )
          return this
        },

        setMode: function (mode) {
          this.mode = _.extend({}, this.mode, mode)
          //                this.$el.find('.el-edit')[mode.isEdit?'show':'hide']();
          //this.btnAddWorksheet.setVisible(this.mode.isEdit);
          $("#status-addtabs-box")[this.mode.isEdit ? "show" : "hide"]()
          this.tabBarDefPosition =
            Number.parseInt($("#status-tabs-scroll").css("width")) +
            Number.parseInt(this.cntStatusbar.css("padding-left"))
          this.tabBarDefPosition += this.mode.isEdit
            ? Number.parseFloat($("#status-addtabs-box").css("width"))
            : 0
          this.btnAddWorksheet.setDisabled(
            this.mode.isDisconnected ||
              this.mode.isBackgroundOpen ||
              (this.api && (this.api.asc_isWorkbookLocked() || this.api.isCellEdited)) ||
              this.rangeSelectionMode !== Asc.c_oAscSelectionDialogType.None ||
              !!this.mode.isExternalChart,
          )
          this.btnSheetList[this.mode.isBackgroundOpen ? "addClass" : "removeClass"]("disabled")
          if (this.mode.isEditOle || this.mode.isEditDiagram) {
            // change hints order
            this.btnAddWorksheet.$el
              .find("button")
              .addBack()
              .filter("button")
              .attr("data-hint", "1")
            this.btnScrollBack.$el.find("button").addBack().filter("button").attr("data-hint", "1")
            this.btnScrollNext.$el.find("button").addBack().filter("button").attr("data-hint", "1")
            this.cntSheetList.$el.find("button").attr("data-hint", "1")
            this.cntSheetList.$el.find("button").removeAttr("data-hint-title") // 'v' hint is used for paste
            this.cntZoom.$el.find(".dropdown-toggle").attr("data-hint", "1")
          }
          this.updateTabbarBorders()
        },

        setVisible: function (visible) {
          visible ? this.show() : this.hide()
        },

        isVisible: function () {
          return this.$el?.is(":visible")
        },

        update: function () {
          const renamingWorksheet = this.controller?.renamingWorksheet
          this.tabbar.empty(true)
          this.tabMenu.items[5].menu.removeAll()
          this.tabMenu.items[5].hide()
          this.btnAddWorksheet.setDisabled(true)
          this.sheetListMenu.removeAll()
          if (this.api) {
            const wc = this.api.asc_getWorksheetsCount()
            let i = -1
            this.hiddenItems = []
            const items = []
            const allItems = []
            let tab
            let locked
            let name
            const sindex = this.api.asc_getActiveWorksheetIndex()
            const wbprotected = this.api.asc_isProtectedWorkbook()
            const sid = this.api.asc_getActiveWorksheetId()

            while (++i < wc) {
              locked = this.api.asc_isWorksheetLockedOrDeleted(i)
              name = this.api.asc_getActiveNamedSheetView
                ? this.api.asc_getActiveNamedSheetView(i) || ""
                : ""
              const sheetid = this.api.asc_getWorksheetId(i)
              tab = {
                sheetindex: i,
                sheetid: sheetid,
                index: items.length,
                active: renamingWorksheet ? renamingWorksheet === sheetid : sid === sheetid,
                label: this.api.asc_getWorksheetName(i),
                //                          reorderable   : !locked,
                cls: locked ? "coauth-locked" : "",
                disabled: this.mode.isBackgroundOpen,
                isLockTheDrag:
                  locked || this.mode.isDisconnected || this.mode.isBackgroundOpen || wbprotected,
                iconCls: "btn-sheet-view",
                iconTitle: name,
                iconVisible: name !== "",
              }
              this.api.asc_isWorksheetHidden(i) ? this.hiddenItems.push(tab) : items.push(tab)
              allItems.push(tab)
            }
            if (this.hiddenItems.length) {
              this.hiddenItems.forEach((item) => {
                this.tabMenu.items[5].menu.addItem(
                  new Common.UI.MenuItem({
                    style: "white-space: pre-wrap",
                    caption: item.label,
                    value: item.sheetindex,
                  }),
                )
              })
              this.tabMenu.items[5].show()
            }

            this.tabbar.add(items)

            if (renamingWorksheet) {
              const tab = _.findWhere(this.tabbar.tabs, { sheetid: renamingWorksheet })
              if (tab) {
                setTimeout(() => {
                  this.onSheetChanged(0, tab.index, tab)
                  this.controller.renameWorksheet(renamingWorksheet, true)
                }, 50)
              } else {
                setTimeout(() => {
                  this.tabbar.setActive(sindex)
                }, 50)
              }
            }

            allItems.forEach((item) => {
              const hidden = this.api.asc_isWorksheetHidden(item.sheetindex)
              this.sheetListMenu.addItem(
                new Common.UI.MenuItem({
                  style: "white-space: pre",
                  caption: Common.Utils.String.htmlEncode(item.label),
                  value: item.sheetindex,
                  sheetid: item.sheetid,
                  checkable: true,
                  checked: item.active,
                  hidden: hidden,
                  visible: !hidden || !wbprotected,
                  textHidden: this.itemHidden,
                  template: _.template(
                    [
                      '<a id="<%= id %>" style="<%= style %>" tabindex="-1" type="menuitem" <% if (options.hidden) { %> data-hidden="true" <% } %>>',
                      '<div class="color"></div>',
                      '<span class="name"><%= caption %></span>',
                      '<span class="hidden-mark"><% if (options.hidden) { %><%=  options.textHidden %><% } else { %><% } %></span>',
                      "</a>",
                    ].join(""),
                  ),
                }),
              )
            })

            if (!_.isUndefined(this.tabBarScroll)) {
              this.tabbar.$bar.scrollLeft(this.tabBarScroll.scrollLeft)
              this.tabBarScroll = undefined
            }

            this.updateRtlSheet(true)

            this.btnAddWorksheet.setDisabled(
              this.mode.isDisconnected ||
                this.mode.isBackgroundOpen ||
                this.api.asc_isWorkbookLocked() ||
                wbprotected ||
                this.api.isCellEdited ||
                !!this.mode.isExternalChart,
            )
            this.btnSheetList[this.mode.isBackgroundOpen ? "addClass" : "removeClass"]("disabled")
            if (this.mode.isEdit) {
              this.tabbar.addDataHint(
                _.findIndex(items, (item) => item.sheetindex === sindex),
                this.mode.isEditOle || this.mode.isEditDiagram ? "1" : "0",
              )
            }

            this.labelZoom.text(
              Common.Utils.String.format(
                this.zoomText,
                Math.floor((this.api.asc_getZoom() + 0.005) * 100),
              ),
            )

            this.updateNumberOfSheet(sindex, wc)

            this.fireEvent("sheet:changed", [this, sindex])
            this.fireEvent("sheet:updateColors", [true])
            Common.NotificationCenter.trigger(
              "comments:updatefilter",
              ["doc", `sheet${this.api.asc_getActiveWorksheetId()}`],
              false,
            )
          }
        },

        getHiddenWorksheets: function () {
          return this.hiddenItems
        },

        onUpdateSheetViewSettings: function () {
          this.updateRtlSheet()
        },

        updateRtlSheet: function (force) {
          const oldRtl = this.isRtlSheet
          this.isRtlSheet = this.api
            ? !!this.api.asc_getSheetViewSettings().asc_getRightToLeft()
            : false
          this.cntStatusbar.toggleClass("rtl-sheet", this.isRtlSheet)
          this.cntStatusbar.attr({ dir: this.isRtlSheet ? "rtl" : "ltr" })
          this.tabbar.setDirection(this.isRtlSheet)
          const dir = (this.isCompact ? this.isRtlSheet : Common.UI.isRTL()) ? "rtl" : "ltr"
          this.boxZoom.attr({ dir: dir })
          this.labelZoom.attr({ dir: Common.UI.isRTL() ? "rtl" : "ltr" })
          this.boxMath.attr({ dir: dir })
          this.boxFiltered.attr({ dir: dir })
          this.sheetListMenu.menuAlign = this.isRtlSheet ? "br-tr" : "bl-tl"

          if (oldRtl !== this.isRtlSheet || force) this.updateTabbarBorders()

          const index = this.api ? this.api.asc_getActiveWorksheetIndex() : 0
          const tab = _.findWhere(this.tabbar.tabs, { sheetindex: index })
          tab && !this.tabbar.isTabVisible(tab.index) && this.tabbar.setTabVisible(tab.index)
        },

        setMathInfo: function (info) {
          if (info.count > 1) {
            if (!this.boxMath.is(":visible")) this.boxMath.show()
            this.labelCount.text(`${this.textCount}: ${info.count}`)
            this.labelMin.text(info.min?.length ? `${this.textMin}: ${info.min}` : "")
            this.labelMax.text(info.max?.length ? `${this.textMax}: ${info.max}` : "")
            this.labelSum.text(info.sum?.length ? `${this.textSum}: ${info.sum}` : "")
            this.labelAverage.text(
              info.average?.length ? `${this.textAverage}: ${info.average}` : "",
            )

            this.labelMin[info.min && info.min.length > 0 ? "show" : "hide"]()
            this.labelMax[info.max && info.max.length > 0 ? "show" : "hide"]()
            this.labelSum[info.sum && info.sum.length > 0 ? "show" : "hide"]()
            this.labelAverage[info.average && info.average.length > 0 ? "show" : "hide"]()

            this.customizeStatusBarMenu.items.forEach((item) => {
              if (item.options.id === "math-item-average") {
                item.options.exampleval = info.average?.length ? info.average : ""
              } else if (item.options.id === "math-item-min") {
                item.options.exampleval = info.min?.length ? info.min : ""
              } else if (item.options.id === "math-item-max") {
                item.options.exampleval = info.max?.length ? info.max : ""
              } else if (item.options.id === "math-item-count") {
                item.options.exampleval = info.count ? String(info.count) : ""
              } else if (item.options.id === "math-item-sum") {
                item.options.exampleval = info.sum?.length ? info.sum : ""
              }
              $(item.el).find("label").text(item.options.exampleval)
            })
          } else {
            this.customizeStatusBarMenu.items.forEach((item) => {
              item.options.exampleval = ""
              $(item.el).find("label").text("")
            })
            if (this.boxMath.is(":visible")) this.boxMath.hide()
          }
          _.delay(() => {
            this.updateVisibleItemsBoxMath()
            this.updateTabbarBorders()
            this.onTabInvisible(undefined, this.tabbar.checkInvisible(true))
          }, 30)
        },

        setFilteredInfo: function (countFilter, countRecords) {
          if (countFilter > 0 && countRecords > 0) {
            //filter is applied
            if (!this.boxFiltered.is(":visible")) this.boxFiltered.show()
            this.labelFiltered.text(
              Common.Utils.String.format(this.filteredRecordsText, countFilter, countRecords),
            )
          } else if (countFilter) {
            // filter mode
            if (!this.boxFiltered.is(":visible")) this.boxFiltered.show()
            this.labelFiltered.text(this.filteredText)
          } else if (countFilter !== undefined && countFilter !== null) {
            if (this.boxFiltered.is(":visible")) this.boxFiltered.hide()
          } else {
            const filterInfo = this.api.asc_getCellInfo().asc_getAutoFilterInfo()
            const need_disable = !filterInfo || filterInfo.asc_getIsApplyAutoFilter() !== true
            this.setFilteredInfo(!need_disable)
          }
          _.delay(() => {
            this.onTabInvisible(undefined, this.tabbar.checkInvisible(true))
          }, 30)
        },

        onSheetChanged: function (o, index, tab) {
          this.api.asc_showWorksheet(tab.sheetindex)
          this.updateNumberOfSheet(tab.sheetindex, this.api.asc_getWorksheetsCount())
          this.updateRtlSheet(true)

          if (this.mode.isEdit) {
            this.tabbar.addDataHint(
              index,
              this.mode.isEditOle || this.mode.isEditDiagram ? "1" : "0",
            )
          }

          this.fireEvent("sheet:changed", [this, tab.sheetindex])
          this.fireEvent("sheet:updateColors", [true])

          // Common.NotificationCenter.trigger('comments:updatefilter', ['doc', 'sheet' + this.api.asc_getActiveWorksheetId()], false); //  hide popover
        },

        onTabMenu: function (o, index, tab, select) {
          if (
            this.mode.isEdit &&
            !this.isEditFormula &&
            this.rangeSelectionMode !== Asc.c_oAscSelectionDialogType.Chart &&
            this.rangeSelectionMode !== Asc.c_oAscSelectionDialogType.FormatTable &&
            this.rangeSelectionMode !== Asc.c_oAscSelectionDialogType.PrintTitles &&
            !this.mode.isDisconnected &&
            !this.mode.isBackgroundOpen &&
            !this.mode.isExternalChart
          ) {
            if (tab && tab.sheetindex >= 0) {
              if (!tab.isActive()) this.tabbar.setActive(tab)

              if (!_.isUndefined(select)) {
                let issheetlocked = false
                select.forEach((item) => {
                  if (this.api.asc_isWorksheetLockedOrDeleted(item.sheetindex)) {
                    issheetlocked = true
                  }
                })
              } else {
                const issheetlocked = this.api.asc_isWorksheetLockedOrDeleted(tab.sheetindex)
              }

              const isdoclocked = this.api.asc_isWorkbookLocked()
              const isdocprotected = this.api.asc_isProtectedWorkbook()

              this.tabMenu.items[0].setDisabled(isdoclocked || isdocprotected)
              this.tabMenu.items[1].setDisabled(issheetlocked || isdocprotected)
              this.tabMenu.items[2].setDisabled(issheetlocked || isdocprotected)
              this.tabMenu.items[3].setDisabled(issheetlocked || isdocprotected)
              this.tabMenu.items[4].setDisabled(issheetlocked || isdocprotected)
              this.tabMenu.items[5].setDisabled(isdoclocked || isdocprotected)
              this.tabMenu.items[6].setDisabled(select.length > 1)
              this.tabMenu.items[7].setDisabled(issheetlocked || isdocprotected)

              this.tabMenu.items[6].setVisible(
                !this.mode.isEditOle && !this.mode.isEditDiagram && this.mode.canProtect,
              )
              this.tabMenu.items[6].setCaption(
                this.api.asc_isProtectedSheet() ? this.itemUnProtect : this.itemProtect,
              )

              if (select.length === 1) {
                this.tabMenu.items[10].hide()
              } else {
                this.tabMenu.items[10].show()
              }

              this.tabMenu.items[9].setDisabled(issheetlocked || isdocprotected)
              this.tabMenu.items[10].setDisabled(issheetlocked || isdocprotected)

              this.api.asc_closeCellEditor()
              this.api.asc_enableKeyEvents(false)

              const tabEl = tab.$el
              this.tabMenu.atposition = () => {
                const parentEl = tabEl.parent()
                if (parentEl.length < 1) return

                const rect = Common.Utils.getBoundingClientRect(tabEl.get(0))
                const parentPos = Common.Utils.getOffset(parentEl)
                return {
                  top: rect.top,
                  left: rect.left - parentPos.left - 2,
                  right: rect.right - parentPos.left + 2,
                }
              }

              this.tabMenu.hide()
              this.tabMenu.show()
              const menu = this.tabMenu
              _.defer(() => {
                menu.cmpEl.focus()
              }, 10)
            }
          }
        },

        onTabMenuAfterShow: function (obj) {
          if (obj.atposition) {
            const pos = this.tabMenu.atposition()
            pos && obj.setOffset(Common.UI.isRTL() ? pos.right - $(obj.el).width() : pos.left)
          }

          this.enableKeyEvents = true
        },

        onTabMenuAfterHide: function () {
          if (!_.isUndefined(this.enableKeyEvents)) {
            if (this.api) {
              this.api.asc_enableKeyEvents(this.enableKeyEvents)
            }

            this.enableKeyEvents = undefined
          }
        },

        onTabMenuClick: function (o, item) {
          if (item && this.api) {
            this.enableKeyEvents = item.value === "ins" || item.value === "hide"
            if (item.value === "selectall") {
              this.tabbar.setSelectAll(true)
            } else if (item.value === "noselect") {
              this.tabbar.setSelectAll(false)
            }
          }
        },

        onTabInvisible: function (obj, opts) {
          if (this.btnScrollBack.isDisabled() !== !opts.first) {
            this.btnScrollBack.setDisabled(!opts.first)
          }
          if (this.btnScrollNext.isDisabled() !== !opts.last) {
            this.btnScrollNext.setDisabled(!opts.last)
          }
          this.hasTabInvisible = opts.first || opts.last
        },

        onBtnTabScroll: function (action, e) {
          this.tabbar.setTabVisible(action)
        },

        updateTabbarBorders: function () {
          let visible = false
          let right = Number.parseFloat(this.boxZoom.css("width"))
          if (this.boxMath.is(":visible")) {
            if ((this.isCompact && this.isRtlSheet) || (!this.isCompact && Common.UI.isRTL())) {
              this.boxMath.css({ left: `${right}px`, right: "auto" })
            } else {
              this.boxMath.css({ right: `${right}px`, left: "auto" })
            }
            right += Number.parseFloat(this.boxMath.css("width"))
            visible = true
          }
          if (this.boxFiltered.is(":visible")) {
            if ((this.isCompact && this.isRtlSheet) || (!this.isCompact && Common.UI.isRTL())) {
              this.boxFiltered.css({ left: `${right}px`, right: "auto" })
            } else {
              this.boxFiltered.css({ right: `${right}px`, left: "auto" })
            }
            right += Number.parseFloat(this.boxFiltered.css("width"))
            visible = true
          }

          if (this.isCompact) {
            const tabsWidth = this.tabbar.getWidth()
            if (this.boxAction.is(":visible")) {
              const actionWidth = this.actionWidth || 140
              if (
                Common.Utils.innerWidth() -
                  right -
                  this.tabBarDefPosition -
                  actionWidth -
                  tabsWidth >
                0
              ) {
                // docWidth - right - left - this.boxAction.width
                const left = tabsWidth + this.tabBarDefPosition
                if (this.isRtlSheet) {
                  this.boxAction.css({ left: `${right}px`, right: `${left}px`, width: "auto" })
                  this.boxAction.find(".separator").css("border-right-color", "transparent")
                } else {
                  this.boxAction.css({ right: `${right}px`, left: `${left}px`, width: "auto" })
                  this.boxAction.find(".separator").css("border-left-color", "transparent")
                }
              } else {
                if (this.isRtlSheet) {
                  this.boxAction.css({
                    left: `${right}px`,
                    right: "auto",
                    width: `${actionWidth}px`,
                  })
                  this.boxAction.find(".separator").css("border-right-color", "")
                } else {
                  this.boxAction.css({
                    right: `${right}px`,
                    left: "auto",
                    width: `${actionWidth}px`,
                  })
                  this.boxAction.find(".separator").css("border-left-color", "")
                }
                visible = true
              }
              right += Number.parseInt(this.boxAction.css("width"))
            } else if (Common.Utils.innerWidth() - right - this.tabBarDefPosition - tabsWidth <= 0)
              visible = true

            this.boxMath.is(":visible") && this.boxMath.css({ top: "0px", bottom: "auto" })
            this.boxFiltered.is(":visible") && this.boxFiltered.css({ top: "0px", bottom: "auto" })
            this.boxZoom.css({ top: "0px", bottom: "auto" })
            if (this.isRtlSheet) {
              this.tabBarBox.css("left", `${right}px`)
              this.tabBarBox.css("right", `${this.tabBarDefPosition}px`)
              this.boxZoom
                .find(".separator")
                .css("border-right-color", visible ? "" : "transparent")
            } else {
              this.tabBarBox.css("left", `${this.tabBarDefPosition}px`)
              this.tabBarBox.css("right", `${right}px`)
              this.boxZoom.find(".separator").css("border-left-color", visible ? "" : "transparent")
            }
          } else {
            if (this.boxAction.is(":visible")) {
              if (Common.UI.isRTL()) {
                this.boxAction.css({ left: `${right}px`, right: "135px", width: "auto" })
                this.boxAction.find(".separator").css("border-right-color", "transparent")
              } else {
                this.boxAction.css({ right: `${right}px`, left: "135px", width: "auto" })
                this.boxAction.find(".separator").css("border-left-color", "transparent")
              }
            }
            this.boxMath.is(":visible") && this.boxMath.css({ top: "auto", bottom: "0px" })
            this.boxFiltered.is(":visible") && this.boxFiltered.css({ top: "auto", bottom: "0px" })
            this.boxZoom.css({ top: "auto", bottom: "0px" })
            this.boxZoom
              .find(".separator")
              .css(
                Common.UI.isRTL() ? "border-right-color" : "border-left-color",
                visible ? "" : "transparent",
              )
            if (this.isRtlSheet) {
              this.tabBarBox.css("left", "0px")
              this.tabBarBox.css("right", `${this.tabBarDefPosition}px`)
            } else {
              this.tabBarBox.css("left", `${this.tabBarDefPosition}px`)
              this.tabBarBox.css("right", "0px")
            }
          }

          if (this.statusMessage) {
            const status = this.getStatusMessage(this.statusMessage)
            if (status !== this.boxAction.text().trim()) {
              this.labelAction.text(status)
            }
          }
        },

        updateVisibleItemsBoxMath: function () {
          const widthStatusbar = Number.parseInt(this.$el.css("width"))
          let width =
            Number.parseInt(this.boxZoom.css("width")) +
            Number.parseInt($("#status-tabs-scroll").css("width")) +
            Number.parseInt($("#status-addtabs-box").css("width"))
          if (this.boxFiltered.is(":visible")) {
            width += Number.parseInt(this.boxFiltered.css("width"))
          }
          this.$el.find(".over-box").removeClass("over-box")
          while (width + Number.parseInt(this.boxMath.css("width")) + 100 > widthStatusbar) {
            const items = this.boxMath.find("label:not(.hide, .over-box)")
            items.length > 0 && $(items[items.length - 1]).addClass("over-box")
            if (items.length <= 1) break
          }
        },

        changeViewMode: function (mode) {
          const edit = mode.isEdit
          const styleLeft = this.isRtlSheet ? "right" : "left"
          if (edit) {
            this.tabBarBox.css(styleLeft, `${this.tabBarDefPosition}px`)
          } else {
            this.tabBarBox.css(styleLeft, "")
          }

          this.tabbar.options.draggable = edit
          this.editMode = edit
        },

        showCustomizeStatusBar: function (e) {
          const el = $(e.target)
          if (
            $("#status-zoom-box").find(el).length > 0 ||
            $(e.target).closest(".statusbar .list-item").length > 0 ||
            $("#status-tabs-scroll").find(el).length > 0 ||
            $("#status-addtabs-box").find(el).length > 0
          )
            return
          this.customizeStatusBarMenu.hide()
          this.customizeStatusBarMenu.atposition = {
            left: e.clientX * Common.Utils.zoom(),
            top: e.clientY * Common.Utils.zoom(),
          }
          this.customizeStatusBarMenu.show()
        },

        onCustomizeStatusBarAfterShow: function (obj) {
          if (obj.atposition) {
            const statusHeight = $(this.el).height()
            const offsetTop =
              !this.isCompact &&
              obj.atposition.top - Common.Utils.getOffset($(this.el)).top > statusHeight / 2
                ? statusHeight / 2
                : 0
            obj.setOffset(
              Common.UI.isRTL()
                ? obj.atposition.left - $(this.el).width() + 2
                : obj.atposition.left,
              offsetTop,
            )
          }
          this.enableKeyEvents = true
        },

        onCustomizeStatusBarAfterHide: function () {
          if (!_.isUndefined(this.enableKeyEvents)) {
            if (this.api) {
              this.api.asc_enableKeyEvents(this.enableKeyEvents)
            }

            this.enableKeyEvents = undefined
          }
        },

        onCustomizeStatusBarClick: function (o, item, event) {
          const value = item.value
          const checked = item.checked
          if (value === "status") {
            this.boxAction[checked ? "removeClass" : "addClass"]("hide")
          } else {
            this.boxMath.find(`#status-math-${value}`)[checked ? "removeClass" : "addClass"]("hide")
            if (this.boxMath.find("label").length === this.boxMath.find("label.hide").length) {
              this.boxMath.find(".separator").hide()
            } else {
              if (this.boxMath.find(".separator").is(":hidden")) {
                this.boxMath.find(".separator").show()
              }
            }
          }
          this.updateVisibleItemsBoxMath()
          this.updateTabbarBorders()
          this.onTabInvisible(undefined, this.tabbar.checkInvisible(true))
          event.stopPropagation()
          item.$el.find("a").blur()
        },

        onChangeCompact: function (compact) {
          this.isCompact = compact
          if (compact) {
            this.cntStatusbar.removeClass("no-compact")
            this.boxNumberSheets.hide()
            //this.boxAction.hide();
          } else {
            this.cntStatusbar.addClass("no-compact")
            this.boxNumberSheets.show()
            //this.boxAction.show();
          }
          this.updateRtlSheet(true)
          this.tabbar.getCount() > 0 &&
            this.onTabInvisible(undefined, this.tabbar.checkInvisible(true))
        },

        updateNumberOfSheet: function (active, count) {
          this.labelNumberSheets.text(
            Common.Utils.String.format(this.sheetIndexText, active + 1, count),
          )
        },

        getStatusMessage: function (message) {
          let _message
          if (this.isCompact && message.length > 23 && this.boxAction.width() < 180) {
            _message = `${message.substr(0, 23).trim()}...`
          } else {
            _message = message
          }
          return _message
        },

        showStatusMessage: function (message, callback) {
          this.statusMessage = message
          if (!this.actionWidth) {
            this.actionWidth = message.length > 22 ? 166 : 140
          }
          this.labelAction.text(this.getStatusMessage(message))
          this.customizeStatusBarMenu.items.forEach((item) => {
            if (item.options.id === "saved-status") {
              item.options.exampleval = message
            }
            $(item.el).find("label").text(item.options.exampleval)
          })
          if (!this.boxAction.is(":visible")) {
            this.boxAction.show()
          }
          _.delay(() => {
            this.updateTabbarBorders()
            this.onTabInvisible(undefined, this.tabbar.checkInvisible(true))
            callback?.()
          }, 30)
        },

        clearStatusMessage: function () {
          this.labelAction.text("")
          this.statusMessage = undefined
        },

        hideStatusMessage: function () {
          this.boxAction.hide()
        },

        getStatusLabel: function () {
          return this.labelAction
        },

        sheetIndexText: "Sheet {0} of {1}",
        tipZoomIn: "Zoom In",
        tipZoomOut: "Zoom Out",
        tipZoomFactor: "Magnification",
        tipPrev: "Previous Sheet",
        tipNext: "Next Sheet",
        tipAddTab: "Add Worksheet",
        tipListOfSheets: "List of Sheets",
        itemInsert: "Insert",
        itemDelete: "Delete",
        itemRename: "Rename",
        itemMoveOrCopy: "Move or copy",
        itemHide: "Hide",
        itemHidden: "Hidden",
        itemTabColor: "Tab Color",
        textNoColor: "No Color",
        textNewColor: "Add New Custom Color",
        zoomText: "Zoom {0}%",
        textSum: "Sum",
        textCount: "Count",
        textAverage: "Average",
        textMin: "Min",
        textMax: "Max",
        filteredRecordsText: "{0} of {1} records filtered",
        filteredText: "Filter mode",
        selectAllSheets: "Select All Sheets",
        ungroupSheets: "Ungroup Sheets",
        //textCustomizeStatusBar: 'Customize status bar',
        itemAverage: "Average",
        itemCount: "Count",
        itemMinimum: "Minimum",
        itemMaximum: "Maximum",
        itemSum: "Sum",
        itemStatus: "Saving status",
        itemProtect: "Protect",
        itemUnProtect: "Unprotect",
      },
      SSE.Views.Statusbar || {},
    ),
  )

  SSE.Views.Statusbar.RenameDialog = Common.UI.Window.extend(
    _.extend(
      {
        options: {
          header: false,
          width: 280,
          cls: "modal-dlg",
          buttons: ["ok", "cancel"],
        },

        template:
          '<div class="box">' +
          '<div class="input-row">' +
          "<label><%= label %></label>" +
          "</div>" +
          '<div class="input-row" id="txt-sheet-name"></div>' +
          "</div>",

        initialize: function (options) {
          _.extend(this.options, options || {}, {
            label: this.labelSheetName,
          })
          this.options.tpl = _.template(this.template)(this.options)

          Common.UI.Window.prototype.initialize.call(this, this.options)
        },

        render: function () {
          Common.UI.Window.prototype.render.call(this)

          const $window = this.getChild()
          $window.find(".dlg-btn").on("click", _.bind(this.onBtnClick, this))

          this.txtName = new Common.UI.InputField({
            el: $window.find("#txt-sheet-name"),
            style: "width:100%;",
            value: this.options.current,
            allowBlank: false,
            maxLength: 31,
            validation: _.bind(this.nameValidator, this),
          })
        },

        getFocusedComponents: function () {
          return [this.txtName].concat(this.getFooterButtons())
        },

        getDefaultFocusableComponent: function () {
          return this.txtName
        },

        show: function (x, y) {
          Common.UI.Window.prototype.show.apply(this, arguments)
          const edit = this.txtName.$el.find("input")
          _.delay(
            (me) => {
              edit.focus()
              edit.select()
            },
            100,
            this,
          )
        },

        onBtnClick: function (event) {
          this.doClose(event.currentTarget.attributes.result.value)
        },

        doClose: function (res) {
          if (res === "ok") {
            if (this.txtName.checkValidate() !== true) {
              _.delay(
                (me) => {
                  me.txtName.focus()
                },
                100,
                this,
              )
              return
            }
          }

          if (this.options.handler) {
            this.options.handler.call(this, res, this.txtName.getValue())
          }

          this.close()
        },

        onPrimary: function (e) {
          this.doClose("ok")
          return false
        },

        nameValidator: function (value) {
          let items = this.options.names
          if (!items && this.options.api) {
            const api = this.options.api
            const sindex = api.asc_getActiveWorksheetIndex()
            let wc = api.asc_getWorksheetsCount()
            items = []
            while (wc--) {
              if (sindex !== wc) {
                items.push(api.asc_getWorksheetName(wc).toLowerCase())
              }
            }
          }
          if (items) {
            const testval = value.toLowerCase()
            for (let i = items.length - 1; i >= 0; --i) {
              if (items[i] === testval) {
                return this.errNameExists
              }
            }
          }

          if (!/^(\')|[:\\\/\*\?\[\]]|(\')$/.test(value)) return true

          return this.errNameWrongChar
        },

        errNameExists: "Worksheet with such name already exist.",
        errNameWrongChar:
          "A sheet name cannot contains characters: \\, /, *, ?, [, ], : or the character ' as first or last character",
        labelSheetName: "Sheet Name",
      },
      RenameDialog || {},
    ),
  )

  SSE.Views.Statusbar.CopyDialog = Common.UI.Window.extend(
    _.extend(
      {
        options: {
          width: 270,
          cls: "modal-dlg",
          buttons: ["ok", "cancel"],
        },

        template:
          '<div class="box">' +
          "<% if ( supportBooks ) { %>" +
          '<div class="input-row">' +
          "<label><%= labelSpreadsheet %></label>" +
          "</div>" +
          '<div id="status-cmb-spreadsheet" style="padding-bottom: 12px;"></div>' +
          "<% } %>" +
          '<div class="input-row">' +
          "<label><%= labelMoveBefore %></label>" +
          "</div>" +
          '<div id="status-list-names" style="height: 178px;padding-bottom: 16px;"></div>' +
          '<div id="status-ch-create-copy"></div>' +
          "</div>",

        initialize: function (options) {
          _.extend(this.options, options || {}, {
            labelSpreadsheet: this.textSpreadsheet,
            labelMoveBefore: this.textMoveBefore,
            supportBooks: !!options.supportBooks,
          })
          this.options.tpl = _.template(this.template)(this.options)

          this.spreadsheets = {
            data: [{ displayValue: this.options.spreadsheetName, value: "current", index: 0 }],
            changed: false,
            opened: false,
          }
          if (this.options.isDesktopApp && this.options.isOffline) {
            this.spreadsheets.data.push({
              displayValue: this.textCreateNewSpreadsheet,
              value: "new",
              index: -1,
            })
          }

          this.sheets = [this.options.sheets]

          Common.UI.Window.prototype.initialize.call(this, this.options)
        },

        render: function () {
          Common.UI.Window.prototype.render.call(this)

          const $window = this.getChild()
          $window.find(".dlg-btn").on("click", _.bind(this.onBtnClick, this))

          this.cmbSpreadsheet = new Common.UI.ComboBox({
            el: $("#status-cmb-spreadsheet", this.$window),
            menuStyle: "min-width: 100%;",
            data: this.spreadsheets.data,
            cls: "input-group-nr",
            editable: false,
          })
          this.cmbSpreadsheet.setValue("current")
          const showBefore = () => {
            this.spreadsheets.opened = true
            if (this.spreadsheets.changed) {
              this.cmbSpreadsheet.setData(this.spreadsheets.data)
              this.cmbSpreadsheet.setValue("current")
            }
            this.cmbSpreadsheet.off("show:before", showBefore)
          }
          this.cmbSpreadsheet.on("show:before", showBefore)
          this.cmbSpreadsheet.on("selected", _.bind(this.onChangeSpreadsheet, this))

          const pages = []
          this.sheets[0].forEach((item) => {
            pages.push(new Common.UI.DataViewModel(item))
          }, this)

          if (pages.length) {
            pages.push(
              new Common.UI.DataViewModel({
                value: this.itemMoveToEnd,
                inindex: -255,
              }),
            )
          }

          this.listNames = new Common.UI.ListView({
            el: $("#status-list-names", $window),
            store: new Common.UI.DataViewStore(pages),
            cls: "dbl-clickable",
            itemTemplate: _.template(
              '<div id="<%= id %>" class="list-item"><%= Common.Utils.String.htmlEncode(value) %></div>',
            ),
            tabindex: 1,
          })

          this.listNames.selectByIndex(0)
          this.listNames.on("entervalue", _.bind(this.onPrimary, this))
          this.listNames.on("item:dblclick", _.bind(this.onPrimary, this))

          this.chCreateCopy = new Common.UI.CheckBox({
            el: $("#status-ch-create-copy", $window),
            labelText: this.textCreateCopy,
            value: false,
          })

          this.mask = $(".modals-mask")
          this.mask.on("mousedown", _.bind(this.onUpdateFocus, this))
        },

        changeSpreadsheets: function (workbooks) {
          this.spreadsheets.changed = true
          const data = this.spreadsheets.data
          const arr = this.options.isDesktopApp ? data.slice(0, data.length - 1) : data
          const ind = arr.length
          workbooks.forEach((workbook, index) => {
            arr.push({
              displayValue: workbook.asc_getName(),
              value: workbook.asc_getId(),
              index: ind + index,
            })
            const sheets = workbook.asc_getSheets()
            const arrSheets = []
            sheets.forEach((sheet) => {
              arrSheets.push({
                value: sheet.asc_getName(),
                inindex: sheet.asc_getIndex(),
              })
            })
            this.sheets[ind + index] = arrSheets
          })
          this.options.isDesktopApp && arr.push(data[data.length - 1])
          this.spreadsheets.data = arr
          if (this.spreadsheets.opened) {
            this.cmbSpreadsheet.setData(this.spreadsheets.data)
            this.cmbSpreadsheet.setValue("current")
          }
        },

        onChangeSpreadsheet: function (combo, record) {
          const index = record.index
          const sheets = this.sheets[index]
          if (sheets) {
            const pages = []
            sheets.forEach((item) => {
              pages.push(new Common.UI.DataViewModel(item))
            }, this)

            if (pages.length) {
              pages.push(
                new Common.UI.DataViewModel({
                  value: this.itemMoveToEnd,
                  inindex: -255,
                }),
              )
            }
            this.listNames.store.reset(pages)
            this.listNames.selectByIndex(0)
          } else {
            this.listNames.store.reset([])
          }
        },

        getFocusedComponents: function () {
          return [this.cmbSpreadsheet, this.listNames, this.chCreateCopy].concat(
            this.getFooterButtons(),
          )
        },

        getDefaultFocusableComponent: function () {
          return this.listNames
        },

        show: function (x, y) {
          Common.UI.Window.prototype.show.apply(this, arguments)

          _.delay(
            (me) => {
              me.listNames.focus()
            },
            100,
            this,
          )
        },

        hide: function () {
          Common.UI.Window.prototype.hide.apply(this, arguments)

          this.mask.off("mousedown", _.bind(this.onUpdateFocus, this))
        },

        onBtnClick: function (event) {
          if (this.options.handler) {
            const active = this.listNames.getSelectedRec()
            let index = active ? active.get("inindex") : 0
            if (index === -255)
              index = this.listNames.store.length - 1 + this.options.hiddenWorksheets.length

            const record = this.cmbSpreadsheet.getSelectedRecord()
            this.options.handler.call(
              this,
              event.currentTarget.attributes.result.value,
              index,
              this.chCreateCopy.getValue() === "checked",
              record.value,
            )
          }

          this.close()
        },

        onPrimary: function () {
          if (this.options.handler) {
            const active = this.listNames.getSelectedRec()
            let index = active ? active.get("inindex") : 0
            if (index === -255)
              index = this.listNames.store.length - 1 + this.options.hiddenWorksheets.length

            const record = this.cmbSpreadsheet.getSelectedRecord()
            this.options.handler.call(
              this,
              "ok",
              index,
              this.chCreateCopy.getValue() === "checked",
              record.value,
            )
          }

          this.close()
        },

        onUpdateFocus: function () {
          _.delay(
            (me) => {
              me.listNames.focus()
            },
            100,
            this,
          )
        },

        itemMoveToEnd: "(Move to end)",
        textMoveBefore: "Move before sheet",
        textCreateCopy: "Create a copy",
        textSpreadsheet: "Spreadsheet",
        textCreateNewSpreadsheet: "(Create new spreadsheet)",
      },
      CopyDialog || {},
    ),
  )
})
