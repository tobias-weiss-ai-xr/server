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
 *
 *  WatchDialog.js
 *
 *  Created on 24.06.22
 *
 */

define([
  "text!spreadsheeteditor/main/app/template/WatchDialog.template",
  "common/main/lib/view/AdvancedSettingsWindow",
], (contentTemplate) => {
  SSE.Views = SSE.Views || {}

  SSE.Views.WatchDialog = Common.Views.AdvancedSettingsWindow.extend(
    _.extend(
      {
        options: {
          alias: "WatchDialog",
          contentWidth: 560,
          modal: false,
          separator: false,
          buttons: ["close"],
        },

        initialize: function (options) {
          _.extend(
            this.options,
            {
              title: this.txtTitle,
              contentStyle: "padding: 10px 0 0;",
              contentTemplate: _.template(contentTemplate)({ scope: this }),
            },
            options,
          )

          this.api = options.api
          this.handler = options.handler

          this.wrapEvents = {
            onRefreshWatchList: _.bind(this.refreshList, this),
          }

          Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options)
        },
        render: function () {
          Common.Views.AdvancedSettingsWindow.prototype.render.call(this)

          this.watchList = new Common.UI.ListView({
            el: $("#watch-dialog-list", this.$window),
            multiSelect: true,
            store: new Common.UI.DataViewStore(),
            simpleAddMode: true,
            headers: [
              { name: this.textBook, width: 70 },
              { name: this.textSheet, width: 70 },
              { name: this.textName, width: 70 },
              { name: this.textCell, width: 70 },
              { name: this.textValue, width: 110 },
              { name: this.textFormula, width: 135 },
            ],
            itemTemplate: _.template(
              [
                '<div id="<%= id %>" class="list-item" style="width: 100%;display:inline-block;">',
                '<div class="padding-right-5" style="width:70px;"><%= Common.Utils.String.htmlEncode(book) %></div>',
                '<div class="padding-right-5" style="width:70px;"><%= Common.Utils.String.htmlEncode(sheet) %></div>',
                '<div class="padding-right-5" style="width:70px;"><%= Common.Utils.String.htmlEncode(name) %></div>',
                '<div class="padding-right-5" style="width:70px;"><%= cell %></div>',
                '<div class="padding-right-5" style="width:110px;" data-toggle="tooltip"><%= Common.Utils.String.htmlEncode(value) %></div>',
                '<div style="width:135px;" data-toggle="tooltip"><%= Common.Utils.String.htmlEncode(formula) %></div>',
                "</div>",
              ].join(""),
            ),
            tabindex: 1,
          })
          this.watchList
            .on("item:select", _.bind(this.onSelectWatch, this))
            .on("item:deselect", _.bind(this.onSelectWatch, this))
            .on("item:keydown", _.bind(this.onKeyDown, this))
            .on("item:dblclick", _.bind(this.onDblClickWatch, this))
            .on("entervalue", _.bind(this.onEnterValue, this))
            .on("item:add", _.bind(this.addTooltips, this))
            .on("item:change", _.bind(this.addTooltips, this))
            .on("reset:before", _.bind(this.resetItemsBefore, this))

          this.btnAdd = new Common.UI.Button({
            el: $("#watch-dialog-btn-add", this.$window),
          })
          this.btnAdd.on("click", _.bind(this.onAddWatch, this, false))

          this.btnDelete = new Common.UI.Button({
            parentEl: $("#watch-dialog-btn-delete", this.$window),
            cls: "btn-text-split-default auto",
            caption: this.textDelete,
            split: true,
            menu: new Common.UI.Menu({
              style: "min-width:100px;",
              items: [
                {
                  caption: this.textDelete,
                  value: 0,
                },
                {
                  caption: this.textDeleteAll,
                  value: 1,
                },
              ],
            }),
            takeFocusOnClose: true,
          })
          $(this.btnDelete.cmpEl.find("button")[0]).css("min-width", "87px")
          this.btnDelete.on("click", _.bind(this.onDeleteWatch, this))
          this.btnDelete.menu.on("item:click", _.bind(this.onDeleteMenu, this))
          this.afterRender()
        },

        afterRender: function () {
          this._setDefaults()
        },

        getFocusedComponents: function () {
          return [this.btnAdd, this.btnDelete, this.watchList]
        },

        getDefaultFocusableComponent: function () {
          return this.watchList
        },

        _setDefaults: function (props) {
          this.refreshList()
          this.api.asc_registerCallback(
            "asc_onUpdateCellWatches",
            this.wrapEvents.onRefreshWatchList,
          )
        },

        refreshList: function (watches) {
          if (watches) {
            // change existing watches
            for (const idx in watches) {
              if (watches.hasOwnProperty(idx)) {
                const index = Number.parseInt(idx)
                const item = watches[idx]
                const store = this.watchList.store
                if (index >= 0 && index < store.length) {
                  const rec = store.at(index)
                  rec.set({
                    book: item.asc_getWorkbook(),
                    sheet: item.asc_getSheet(),
                    name: item.asc_getName(),
                    cell: item.asc_getCell(),
                    value: item.asc_getValue(),
                    formula: item.asc_getFormula(),
                    props: item,
                  })
                }
              }
            }
          } else {
            // get list of watches
            const arr = []
            watches = this.api.asc_getCellWatches()
            if (watches) {
              for (let i = 0; i < watches.length; i++) {
                const watch = watches[i]
                arr.push({
                  book: watch.asc_getWorkbook(),
                  sheet: watch.asc_getSheet(),
                  name: watch.asc_getName(),
                  cell: watch.asc_getCell(),
                  value: watch.asc_getValue(),
                  formula: watch.asc_getFormula(),
                  props: watch,
                })
              }
            }
            this.watchList.store.reset(arr)
            if (this._deletedIndex !== undefined) {
              const store = this.watchList.store
              store.length > 0 &&
                this.watchList.selectByIndex(
                  this._deletedIndex < store.length ? this._deletedIndex : store.length - 1,
                )
              const selectedRec = this.watchList.getSelectedRec()
              selectedRec && selectedRec.length > 0 && this.watchList.scrollToRecord(selectedRec[0])
              this._fromKeyDown && this.watchList.focus()
              this._fromKeyDown = false
              this._deletedIndex = undefined
            }
            this.updateButtons()
          }
        },

        onAddWatch: function () {
          const range = ""
          if (this.api) {
            const handlerDlg = (dlg, result) => {
              if (result === "ok") {
                this.api.asc_addCellWatches(dlg.getSettings())
              }
            }

            const win = new SSE.Views.CellRangeDialog({
              handler: handlerDlg,
            }).on("close", () => {
              this.show()
            })

            const xy = Common.Utils.getOffset(this.$window)
            this.hide()
            win.show(this.$window, xy)
            win.setSettings({
              api: this.api,
              range: `${this.api.asc_getEscapeSheetName(this.api.asc_getWorksheetName(this.api.asc_getActiveWorksheetIndex()))}!${this.api.asc_getActiveRangeStr(Asc.referenceType.A)}`,
              type: Asc.c_oAscSelectionDialogType.Chart,
            })
          }
        },

        onDeleteWatch: function () {
          const rec = this.watchList.getSelectedRec()
          if (rec) {
            const props = []
            _.each(rec, (r, i) => {
              this._deletedIndex = this.watchList.store.indexOf(r) - props.length
              props[i] = r.get("props")
            })
            this.api.asc_deleteCellWatches(props)
          }
        },

        onDeleteMenu: function (menu, item) {
          if (item.value === 1) {
            this.api.asc_deleteCellWatches(undefined, true)
          } else this.onDeleteWatch()
        },

        onSelectWatch: function (lisvView, itemView, record) {
          this.updateButtons()
        },

        onDblClickWatch: function (lisvView, itemView, record) {
          record && this.api.asc_findCell(`\'${record.get("sheet")}\'!${record.get("cell")}`)
        },

        onEnterValue: function (lisvView, record) {
          if (this.watchList.store.length === 0) return
          record && this.api.asc_findCell(`\'${record.get("sheet")}\'!${record.get("cell")}`)
        },

        onKeyDown: function (lisvView, record, e) {
          if (e.keyCode === Common.UI.Keys.DELETE && !this.btnDelete.isDisabled()) {
            this._fromKeyDown = true
            this.onDeleteWatch()
          }
        },

        updateButtons: function () {
          const rec = this.watchList.getSelectedRec()
          this.btnDelete.setDisabled(!(rec && rec.length > 0))
          this.watchList.scroller?.update({ alwaysVisibleY: true })
        },

        close: function () {
          this.api.asc_unregisterCallback(
            "asc_onUpdateCellWatches",
            this.wrapEvents.onRefreshWatchList,
          )

          Common.Views.AdvancedSettingsWindow.prototype.close.call(this)
        },

        resetItemsBefore: function (dataview) {
          dataview.dataViewItems &&
            _.each(
              dataview.dataViewItems,
              (view) => {
                if (view.tipsArray) {
                  view.tipsArray.forEach((item) => {
                    if (item) {
                      if (item.dontShow === undefined) item.dontShow = true
                      item.tip().remove()
                    }
                  })
                }
              },
              this,
            )
        },

        addTooltips: function (dataview, view, record) {
          if (view.tipsArray) {
            view.tipsArray.forEach((item) => {
              if (item) {
                if (item.dontShow === undefined) item.dontShow = true
                item.tip().remove()
              }
            })
          }

          const el = document.createElement("span")
          const props = Common.UI.Themes.getThemeProps("font")
          el.style.fontSize = props?.size ? props.size : "11px"
          el.style.fontFamily = props?.name
            ? props.name
            : 'Arial, Helvetica, "Helvetica Neue", sans-serif'
          el.style.position = "absolute"
          el.style.top = "-1000px"
          el.style.left = "-1000px"
          document.body.appendChild(el)

          const divs = $(view.el).find(".list-item > div")
          this.checkTextOfItem(
            el,
            view,
            $(divs[4]),
            record.get("value"),
            this.watchList.options.headers[4].width,
          )
          this.checkTextOfItem(
            el,
            view,
            $(divs[5]),
            record.get("formula"),
            this.watchList.options.headers[5].width,
          )

          document.body.removeChild(el)
          view.tipsArray = []
        },

        checkTextOfItem: function (test_el, view, div, txt, limit) {
          test_el.innerHTML = Common.Utils.String.htmlEncode(txt)

          const dataview = this.watchList
          if (test_el.offsetWidth > limit) {
            div.one("mouseenter", (e) => {
              // hide tooltip when mouse is over menu
              const $target = $(e.target)
              $target.tooltip({
                title: txt, // use actual tip, because it can be changed
                placement: "cursor",
                zIndex: dataview.tipZIndex,
              })
              $target.mouseenter()
              view.tipsArray.push($target.data("bs.tooltip"))
            })
          }
        },

        txtTitle: "Watch Window",
        textAdd: "Add watch",
        textDelete: "Delete watch",
        textDeleteAll: "Delete all",
        closeButtonText: "Close",
        textBook: "Book",
        textSheet: "Sheet",
        textName: "Name",
        textCell: "Cell",
        textValue: "Value",
        textFormula: "Formula",
      },
      SSE.Views.WatchDialog || {},
    ),
  )
})
