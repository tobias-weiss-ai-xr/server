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
 *  NameManagerDlg.js
 *
 *  Created on 01.06.15
 *
 */

define([
  "text!spreadsheeteditor/main/app/template/NameManagerDlg.template",
  "common/main/lib/view/AdvancedSettingsWindow",
], (contentTemplate) => {
  SSE.Views = SSE.Views || {}

  SSE.Views.NameManagerDlg = Common.Views.AdvancedSettingsWindow.extend(
    _.extend(
      {
        options: {
          alias: "NameManagerDlg",
          contentWidth: 540,
          buttons: ["close"],
          separator: false,
          id: "window-name-manager",
        },

        initialize: function (options) {
          _.extend(
            this.options,
            {
              title: this.txtTitle,
              contentStyle: "padding: 5px 0 0;",
              contentTemplate: _.template(contentTemplate)({ scope: this }),
            },
            options,
          )

          this.api = options.api
          this.handler = options.handler
          this.sheets = options.sheets || []
          this.sheetNames = options.sheetNames || []
          this.ranges = options.ranges || []
          this.props = options.props
          this.sort = options.sort || { type: "name", direction: 1 } // ascend
          this.locked = options.locked || false
          this.userTooltip = true
          this.currentNamedRange = undefined

          this.rangesStore = new Common.UI.DataViewStore()

          this.wrapEvents = {
            onRefreshDefNameList: _.bind(this.onRefreshDefNameList, this),
            onLockDefNameManager: _.bind(this.onLockDefNameManager, this),
          }

          Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options)
        },
        render: function () {
          Common.Views.AdvancedSettingsWindow.prototype.render.call(this)

          this.cmbFilter = new Common.UI.ComboBox({
            el: $("#name-manager-combo-filter"),
            menuStyle: "min-width: 100%;",
            editable: false,
            cls: "input-group-nr",
            data: [
              { value: 0, displayValue: this.textFilterAll },
              { value: 1, displayValue: this.textFilterDefNames },
              { value: 2, displayValue: this.textFilterTableNames },
              { value: 3, displayValue: this.textFilterSheet },
              { value: 4, displayValue: this.textFilterWorkbook },
            ],
            takeFocusOnClose: true,
          }).on("selected", (combo, record) => {
            this.refreshRangeList(null, 0)
          })
          this.cmbFilter.setValue(0)

          this.rangeList = new Common.UI.ListView({
            el: $("#name-manager-range-list", this.$window),
            store: new Common.UI.DataViewStore(),
            simpleAddMode: true,
            emptyText: this.textEmpty,
            headers: [
              {
                name: this.textRanges,
                width: 171,
                sortType: "name",
                style: `padding-${Common.UI.isRTL()}` ? "left" : "right" + ": 12px;",
              },
              {
                name: this.textScope,
                width: 122,
                sortType: "scopeName",
                style: `padding-${Common.UI.isRTL()}` ? "left" : "right" + ": 12px;",
              },
              { name: this.textDataRange, width: 213 },
            ],
            initSort: { type: this.sort.type, direction: this.sort.direction },
            itemTemplate: _.template(
              [
                '<div id="<%= id %>" class="list-item" style="width: 100%;display:inline-block;<% if (!lock) { %>pointer-events:none;<% } %>">',
                '<div class="listitem-icon toolbar__icon margin-right-5 <% print(isTable?"btn-menu-table":(isSlicer ? "btn-slicer" : "btn-named-range")) %>"></div>',
                '<div style="width:146px;padding-<% if (Common.UI.isRTL()) { %>left<% } else {%>right<% } %>: 5px;"><%= Common.Utils.String.htmlEncode(name) %></div>',
                '<div style="width:122px;padding-<% if (Common.UI.isRTL()) { %>left<% } else {%>right<% } %>: 5px;"><%= Common.Utils.String.htmlEncode(scopeName) %></div>',
                '<div style="width:209px;"><%= Common.Utils.String.htmlEncode(range) %></div>',
                "<% if (lock) { %>",
                '<div class="lock-user"><%=Common.Utils.String.htmlEncode(lockuser)%></div>',
                "<% } %>",
                "</div>",
              ].join(""),
            ),
            tabindex: 1,
          })
          this.rangeList.store.comparator = (item1, item2) => {
            const n1 = item1.get(this.sort.type).toLowerCase()
            const n2 = item2.get(this.sort.type).toLowerCase()
            if (n1 === n2) return 0
            return n1 < n2 ? -this.sort.direction : this.sort.direction
          }
          this.rangeList
            .on("item:select", _.bind(this.onSelectRangeItem, this))
            .on("item:keydown", _.bind(this.onKeyDown, this))
            .on("item:dblclick", _.bind(this.onDblClickItem, this))
            .on("entervalue", _.bind(this.onDblClickItem, this))

          this.btnNewRange = new Common.UI.Button({
            el: $("#name-manager-btn-new"),
          })
          this.btnNewRange.on("click", _.bind(this.onEditRange, this, false))

          this.btnEditRange = new Common.UI.Button({
            el: $("#name-manager-btn-edit"),
          })
          this.btnEditRange.on("click", _.bind(this.onEditRange, this, true))

          this.btnDeleteRange = new Common.UI.Button({
            el: $("#name-manager-btn-delete"),
          })
          this.btnDeleteRange.on("click", _.bind(this.onDeleteRange, this))

          this.rangeList.on("header:click", _.bind(this.onSortNames, this))
          this.afterRender()
        },

        getFocusedComponents: function () {
          return [
            this.cmbFilter,
            this.btnNewRange,
            this.btnEditRange,
            this.btnDeleteRange,
            this.rangeList,
          ].concat(this.getFooterButtons())
        },

        getDefaultFocusableComponent: function () {
          return this.rangeList
        },

        afterRender: function () {
          this._setDefaults(this.props)
        },

        _setDefaults: function (props) {
          this.refreshRangeList(this.ranges, 0)
          this.api.asc_registerCallback(
            "asc_onLockDefNameManager",
            this.wrapEvents.onLockDefNameManager,
          )
          this.api.asc_registerCallback(
            "asc_onRefreshDefNameList",
            this.wrapEvents.onRefreshDefNameList,
          )
          this.initListHeaders()
        },

        initListHeaders: function () {
          this.rangeList.setHeaderWidth(
            0,
            Number.parseInt(Common.UI.Themes.getThemeProps("small-btn-size")) +
              146 /*first column*/ +
              5 /*padding*/,
          )
        },

        onRefreshDefNameList: function () {
          this.refreshRangeList(
            this.api.asc_getDefinedNames(Asc.c_oAscGetDefinedNamesList.All),
            this.currentNamedRange,
          )
        },

        refreshRangeList: function (ranges, selectedItem) {
          if (ranges) {
            this.ranges = ranges
            const arr = []
            for (let i = 0; i < this.ranges.length; i++) {
              const scope = this.ranges[i].asc_getScope()
              const id = this.ranges[i].asc_getIsLock()
              const type = this.ranges[i].asc_getType()
              arr.push({
                name: this.ranges[i].asc_getName(true),
                scope: scope,
                scopeName: scope === null ? this.textWorkbook : this.sheetNames[scope],
                range: type === Asc.c_oAscDefNameType.slicer ? "" : this.ranges[i].asc_getRef(),
                lock: id !== null && id !== undefined,
                lockuser: id
                  ? this.isUserVisible(id)
                    ? this.getUserName(id)
                    : this.lockText
                  : this.guestText,
                type: type,
                isTable: type === Asc.c_oAscDefNameType.table,
                isSlicer: type === Asc.c_oAscDefNameType.slicer,
              })
            }
            this.rangesStore.reset(arr)
            this.rangeList.setEmptyText(
              this.rangesStore.length > 0 ? this.textnoNames : this.textEmpty,
            )
          }
          const store = this.rangeList.store
          let models = this.rangesStore.models
          let val = this.cmbFilter.getValue()
          const isTableFilter = val < 3 ? val === 2 : -1
          const isWorkbook = val > 2 ? val === 4 : -1
          if (val > 0)
            models = this.rangesStore.filter((item) => {
              if (isTableFilter !== -1) return isTableFilter === item.get("isTable")
              if (isWorkbook !== -1) return isWorkbook === (item.get("scope") === null)
              return false
            })

          store.reset(models, { silent: false })

          val = store.length
          this.btnEditRange.setDisabled(!val)
          this.btnDeleteRange.setDisabled(!val)
          if (val > 0) {
            if (selectedItem === undefined || selectedItem === null) selectedItem = 0
            if (_.isNumber(selectedItem)) {
              if (selectedItem > val - 1) selectedItem = val - 1
              this.rangeList.selectByIndex(selectedItem)
              setTimeout(() => {
                this.rangeList.scrollToRecord(store.at(selectedItem))
              }, 50)
            } else if (selectedItem) {
              // object
              const rec = store.findWhere({
                name: selectedItem.asc_getName(true),
                scope: selectedItem.asc_getScope(),
              })
              if (rec) {
                this.rangeList.selectRecord(rec)
                setTimeout(() => {
                  this.rangeList.scrollToRecord(rec)
                }, 50)
              }
            }

            if (this.userTooltip === true && this.rangeList.cmpEl.find(".lock-user").length > 0)
              this.rangeList.cmpEl
                .on("mouseover", _.bind(this.onMouseOverLock, this))
                .on("mouseout", _.bind(this.onMouseOutLock, this))
          }
          _.delay(
            () => {
              this.rangeList.scroller.update({ alwaysVisibleY: true })
            },
            100,
            this,
          )
        },

        onMouseOverLock: function (evt, el, opt) {
          if (this.userTooltip === true && $(evt.target).hasClass("lock-user")) {
            const tipdata = $(evt.target)
              .tooltip({ title: this.tipIsLocked, trigger: "manual" })
              .data("bs.tooltip")

            this.userTooltip = tipdata.tip()
            this.userTooltip.css("z-index", Number.parseInt(this.$window.css("z-index")) + 10)
            tipdata.show()

            setTimeout(() => {
              this.userTipHide()
            }, 5000)
          }
        },

        userTipHide: function () {
          if (typeof this.userTooltip === "object") {
            this.userTooltip.remove()
            this.userTooltip = undefined
            this.rangeList.cmpEl.off("mouseover").off("mouseout")
          }
        },

        onMouseOutLock: function (evt, el, opt) {
          if (typeof this.userTooltip === "object") this.userTipHide()
        },

        onEditRange: function (isEdit) {
          if (this._isWarningVisible) return

          if (this.locked) {
            Common.NotificationCenter.trigger("namedrange:locked")
            return
          }
          const xy = Common.Utils.getOffset(this.$window)
          const rec = this.rangeList.getSelectedRec()
          const idx = _.indexOf(this.rangeList.store.models, rec)
          const oldname =
            isEdit && rec
              ? new Asc.asc_CDefName(
                  rec.get("name"),
                  rec.get("range"),
                  rec.get("scope"),
                  rec.get("type"),
                  undefined,
                  undefined,
                  undefined,
                  true,
                )
              : null

          const win = new SSE.Views.NamedRangeEditDlg({
            api: this.api,
            sheets: this.sheets,
            props: isEdit ? oldname : this.props,
            isEdit: isEdit,
            handler: (result, settings) => {
              if (result === "ok" && settings) {
                if (isEdit) {
                  this.currentNamedRange = settings
                  this.api.asc_editDefinedNames(oldname, settings)
                } else {
                  this.cmbFilter.setValue(0)
                  this.currentNamedRange = settings
                  this.api.asc_setDefinedNames(settings)
                }
              }
            },
          }).on("close", () => {
            this.show()
            setTimeout(() => {
              this.getDefaultFocusableComponent().focus()
            }, 100)
          })

          this.hide()
          win.show(xy.left + 65, xy.top + 77)
        },

        onDeleteRange: function () {
          const rec = this.rangeList.getSelectedRec()
          if (rec) {
            this._isWarningVisible = true
            Common.UI.warning({
              msg: Common.Utils.String.format(this.warnDelete, rec.get("name")),
              buttons: ["ok", "cancel"],
              callback: (btn) => {
                if (btn === "ok") {
                  this.currentNamedRange = _.indexOf(this.rangeList.store.models, rec)
                  this.api.asc_delDefinedNames(
                    new Asc.asc_CDefName(
                      rec.get("name"),
                      rec.get("range"),
                      rec.get("scope"),
                      rec.get("type"),
                      undefined,
                      undefined,
                      undefined,
                      true,
                    ),
                  )
                }
                setTimeout(() => {
                  this.getDefaultFocusableComponent().focus()
                }, 100)
                this._isWarningVisible = false
              },
            })
          }
        },

        getSettings: function () {
          return this.sort
        },

        onPrimary: () => true,

        onDlgBtnClick: function (event) {
          this.handler?.call(this, event.currentTarget.attributes.result.value)
          this.close()
        },

        onSortNames: function (type, direction) {
          this.sort = { type: type, direction: direction }

          this.rangeList.store.sort()
          this.rangeList.onResetItems()
          this.rangeList.scroller.update({ alwaysVisibleY: true })
        },

        getUserName: function (id) {
          const usersStore = SSE.getCollection("Common.Collections.Users")
          if (usersStore) {
            const rec = usersStore.findUser(id)
            if (rec) return AscCommon.UserInfoParser.getParsedName(rec.get("username"))
          }
          return this.guestText
        },

        isUserVisible: (id) => {
          const usersStore = SSE.getCollection("Common.Collections.Users")
          if (usersStore) {
            const rec = usersStore.findUser(id)
            if (rec) return !rec.get("hidden")
          }
          return true
        },

        onSelectRangeItem: function (lisvView, itemView, record) {
          if (!record) return

          this.userTipHide()
          let rawData = {}
          const isViewSelect = _.isFunction(record.toJSON)

          if (isViewSelect) {
            if (record.get("selected")) {
              rawData = record.toJSON()
            } else {
              // record deselected
              return
            }
            this.currentNamedRange = _.indexOf(this.rangeList.store.models, record)
            this.btnEditRange.setDisabled(rawData.lock)
            this.btnDeleteRange.setDisabled(rawData.lock || rawData.isTable || rawData.isSlicer)
          }
        },

        hide: function () {
          this.userTipHide()
          Common.UI.Window.prototype.hide.call(this)
        },

        close: function () {
          this.userTipHide()
          this.api.asc_unregisterCallback(
            "asc_onLockDefNameManager",
            this.wrapEvents.onLockDefNameManager,
          )
          this.api.asc_unregisterCallback(
            "asc_onRefreshDefNameList",
            this.wrapEvents.onRefreshDefNameList,
          )

          Common.UI.Window.prototype.close.call(this)
        },

        onKeyDown: function (lisvView, record, e) {
          if (e.keyCode === Common.UI.Keys.DELETE && !this.btnDeleteRange.isDisabled())
            this.onDeleteRange()
        },

        onDblClickItem: function (lisvView, record, e) {
          if (!this.btnEditRange.isDisabled()) this.onEditRange(true)
        },

        onLockDefNameManager: function (state) {
          this.locked = state === Asc.c_oAscDefinedNameReason.LockDefNameManager
        },

        txtTitle: "Name Manager",
        closeButtonText: "Close",
        textDataRange: "Data Range",
        textNew: "New",
        textEdit: "Edit",
        textDelete: "Delete",
        textRanges: "Named Ranges",
        textScope: "Scope",
        textFilter: "Filter",
        textEmpty:
          "No named ranges have been created yet.<br>Create at least one named range and it will appear in this field.",
        textnoNames: "No named ranges matching your filter could be found.",
        textFilterAll: "All",
        textFilterDefNames: "Defined names",
        textFilterTableNames: "Table names",
        textFilterSheet: "Names Scoped to Sheet",
        textFilterWorkbook: "Names Scoped to Workbook",
        textWorkbook: "Workbook",
        guestText: "Guest",
        tipIsLocked: "This element is being edited by another user.",
        warnDelete: "Are you sure you want to delete the name {0}?",
        lockText: "Locked",
      },
      SSE.Views.NameManagerDlg || {},
    ),
  )
})
