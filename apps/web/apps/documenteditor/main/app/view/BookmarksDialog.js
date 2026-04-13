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
 *  BookmarksDialog.js.js
 *
 *  Created on 15.02.2018
 *
 */

define(["common/main/lib/view/AdvancedSettingsWindow"], () => {
  DE.Views.BookmarksDialog = Common.Views.AdvancedSettingsWindow.extend(
    _.extend(
      {
        options: {
          contentWidth: 320,
          buttons: ["close"],
          separator: false,
          id: "window-bookmarks",
        },

        initialize: function (options) {
          _.extend(
            this.options,
            {
              title: this.textTitle,
              keydowncallback: (event) => {
                if (this.appOptions?.canMakeActionLink && event.keyCode === Common.UI.Keys.ESC) {
                  let isExit = false
                  ;[this.copyDropdownUpper, this.copyDropdownLower].forEach((dropdown) => {
                    const parent = dropdown.box.parent()
                    if (parent.hasClass("open")) {
                      parent.removeClass("open")
                      dropdown.parentBtn.focus()
                      isExit = true
                    }
                  })
                  return isExit
                }
              },
              contentStyle: "padding: 5px 5px 0;",
              contentTemplate: _.template(
                [
                  '<div class="settings-panel active">',
                  '<div class="inner-content">',
                  '<table cols="1" style="width: 100%;">',
                  "<tr>",
                  '<td class="padding-extra-small">',
                  '<label class="input-label">',
                  this.textBookmarkName,
                  "</label>",
                  "</td>",
                  "</tr>",
                  "<tr>",
                  '<td class="padding-large" style="display: flex;">',
                  '<div id="bookmarks-txt-name" class="margin-right-10" style="display:inline-block;vertical-align: top;flex-grow:1;"></div>',
                  '<div id="bookmarks-btn-add" style="display: inline-block; position: relative;"></div>',
                  '<div id="bookmarks-btn-add-copy-dropdown" class="form-control-size" style="display: inline-block; position: relative; vertical-align: top; width: 0px">',
                  //Invisible button, needed for boostrap dropdown logic to work
                  '<button type="button" class="dropdown-toggle" data-toggle="dropdown" style="display: none"></button>',
                  "</div>",
                  "</td>",
                  "</tr>",
                  "<tr>",
                  '<td class="padding-extra-small">',
                  '<label class="header margin-right-10 vertical-align-middle">',
                  this.textSort,
                  "</label>",
                  '<div id="bookmarks-radio-name" class="margin-right-10"></div>',
                  '<div id="bookmarks-radio-location"></div>',
                  "</td>",
                  "</tr>",
                  "<tr>",
                  '<td class="padding-small">',
                  '<div id="bookmarks-list" style="width:100%; height: 139px;"></div>',
                  "</td>",
                  "</tr>",
                  "<tr>",
                  '<td class="padding-large">',
                  '<button type="button" class="btn btn-text-default margin-right-5" id="bookmarks-btn-goto">',
                  this.textGoto,
                  "</button>",
                  '<div style="display: inline-block; position: relative;">',
                  '<button type="button" class="btn btn-text-default auto dropdown-toggle move-focus" id="bookmarks-btn-link" style="min-width: 75px;" data-toggle="dropdown">',
                  this.textGetLink,
                  "</button>",
                  "</div>",
                  '<button type="button" class="btn btn-text-default float-right" id="bookmarks-btn-delete">',
                  this.textDelete,
                  "</button>",
                  "</td>",
                  "</tr>",
                  "<tr>",
                  "<td>",
                  '<div id="bookmarks-checkbox-hidden"></div>',
                  "</td>",
                  "</tr>",
                  "</table>",
                  "</div></div>",
                ].join(""),
              )({ scope: this }),
            },
            options,
          )

          this.api = options.api
          this.handler = options.handler
          this.props = options.props
          this.appOptions = options.appOptions

          Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options)
        },

        render: function () {
          Common.Views.AdvancedSettingsWindow.prototype.render.call(this)

          this.txtName = new Common.UI.InputField({
            el: $("#bookmarks-txt-name"),
            allowBlank: true,
            validateOnChange: true,
            validateOnBlur: true,
            value: "",
            maxLength: 40,
            validation: (value) => {
              const check = this.props.asc_CheckNewBookmarkName(value)
              const exist = this.props.asc_HaveBookmark(value)
              this.btnAdd.setDisabled(!check && !exist)
              return check || _.isEmpty(value) || exist ? true : this.txtInvalidName
            },
          }).on("changing", (input, value) => {
            const exist = this.props.asc_HaveBookmark(value)
            if (exist) {
              const rec = this.bookmarksList.store.findWhere({ value: value })
              this.bookmarksList.selectRecord(rec)
              this.bookmarksList.scrollToRecord(rec)
            } else this.bookmarksList.deselectAll()
            this.btnGoto.setDisabled(!exist)
            this.btnDelete.setDisabled(!exist)
            this.btnGetLink.setDisabled(!exist)
          })

          this.radioName = new Common.UI.RadioBox({
            el: $("#bookmarks-radio-name"),
            labelText: this.textName,
            name: "asc-radio-bookmark-sort",
          })
          this.radioName.on("change", _.bind(this.onRadioSort, this))

          this.radioLocation = new Common.UI.RadioBox({
            el: $("#bookmarks-radio-location"),
            labelText: this.textLocation,
            name: "asc-radio-bookmark-sort",
          })
          this.radioLocation.on("change", _.bind(this.onRadioSort, this))
          Common.Utils.InternalSettings.get("de-bookmarks-sort-location")
            ? this.radioLocation.setValue(true, true)
            : this.radioName.setValue(true, true)

          this.bookmarksList = new Common.UI.ListView({
            el: $("#bookmarks-list", this.$window),
            store: new Common.UI.DataViewStore(),
            tabindex: 1,
            cls: "dbl-clickable",
            itemTemplate: _.template(
              '<div id="<%= id %>" class="list-item" style="overflow: hidden; text-overflow: ellipsis;"><%= Common.Utils.String.htmlEncode(value) %></div>',
            ),
          })
          this.bookmarksList.store.comparator = (rec) =>
            this.radioName.getValue() ? rec.get("value") : rec.get("location")
          this.bookmarksList.on("item:dblclick", _.bind(this.onDblClickBookmark, this))
          this.bookmarksList.on("entervalue", _.bind(this.onPrimary, this))
          this.bookmarksList.on("item:select", _.bind(this.onSelectBookmark, this))

          this.btnAdd = new Common.UI.Button({
            parentEl: $("#bookmarks-btn-add"),
            disabled: true,
            caption: this.textAdd,
            cls: this.appOptions.canMakeActionLink ? "btn-text-split-default" : "btn-text-default",
            split: this.appOptions.canMakeActionLink,
            menu: this.appOptions.canMakeActionLink,
            takeFocusOnClose: true,
          })
          this.btnAdd.on("click", _.bind(this.addBookmark, this, true))
          if (this.appOptions.canMakeActionLink) {
            this.btnAdd.setMenu(
              new Common.UI.Menu({
                menuAlign: "tr-br",
                style: "min-width: 150px;",
                items: [
                  {
                    caption: this.textAdd,
                    value: 1,
                  },
                  {
                    caption: this.textAddAndGetLink,
                    value: 2,
                  },
                ],
              }),
            )
            this.btnAdd.menu.on("item:click", _.bind(this.onAddMenu, this))
          }

          this.btnGoto = new Common.UI.Button({
            el: $("#bookmarks-btn-goto"),
            disabled: true,
          })
          this.btnGoto.on("click", _.bind(this.gotoBookmark, this))

          this.btnDelete = new Common.UI.Button({
            el: $("#bookmarks-btn-delete"),
            disabled: true,
          })
          this.btnDelete.on("click", _.bind(this.deleteBookmark, this))

          this.btnGetLink = new Common.UI.Button({
            el: $("#bookmarks-btn-link"),
            disabled: true,
          })
          this.btnGetLink.on("click", _.bind(this.getBookmarkLink, this))

          this.chHidden = new Common.UI.CheckBox({
            el: $("#bookmarks-checkbox-hidden"),
            labelText: this.textHidden,
            value: Common.Utils.InternalSettings.get("de-bookmarks-hidden") || false,
          })
          this.chHidden.on("change", _.bind(this.onChangeHidden, this))

          if (this.appOptions.canMakeActionLink) {
            this.copyDropdownUpper = this.createCopyDropdown(
              this.btnAdd,
              $("#bookmarks-btn-add-copy-dropdown"),
              { right: 0 },
            )
            this.copyDropdownLower = this.createCopyDropdown(
              this.btnGetLink,
              this.btnGetLink.$el.parent(),
              { left: -80 },
            )
          }

          this.afterRender()
        },

        getFocusedComponents: function () {
          let arr = [
            this.txtName,
            this.radioName,
            this.radioLocation,
            this.bookmarksList,
            this.btnAdd,
          ]
          this.copyDropdownUpper &&
            (arr = arr.concat([this.copyDropdownUpper.input, this.copyDropdownUpper.button]))
          arr = arr.concat([
            this.btnAdd,
            this.btnGoto,
            this.btnGetLink,
            this.btnDelete,
            this.chHidden,
          ])
          this.copyDropdownLower &&
            (arr = arr.concat([this.copyDropdownLower.input, this.copyDropdownLower.button]))

          return arr.concat(this.getFooterButtons())
        },

        afterRender: function () {
          this._setDefaults(this.props)
          const onApiBookmarksUpdate = () => {
            let rec = this.bookmarksList.getSelectedRec()
            this.refreshBookmarks()
            if (rec) {
              rec = this.bookmarksList.store.findWhere({ value: rec.get("value") })
              if (rec) {
                this.bookmarksList.selectRecord(rec)
                this.bookmarksList.scrollToRecord(rec)
              } else {
                this.txtName.setValue("")
                this.btnAdd.setDisabled(true)
                this.btnGoto.setDisabled(true)
                this.btnDelete.setDisabled(true)
                this.btnGetLink.setDisabled(true)
              }
            }
          }
          this.api.asc_registerCallback("asc_onBookmarksUpdate", onApiBookmarksUpdate)
          this.on("close", (obj) => {
            this.api.asc_unregisterCallback("asc_onBookmarksUpdate", onApiBookmarksUpdate)
          })
        },

        show: function () {
          Common.Views.AdvancedSettingsWindow.prototype.show.apply(this, arguments)
          _.delay(() => {
            $("input", this.txtName.cmpEl).select().focus()
          }, 100)
        },

        close: function () {
          Common.Views.AdvancedSettingsWindow.prototype.close.apply(this, arguments)
          Common.Utils.InternalSettings.set(
            "de-bookmarks-hidden",
            this.chHidden.getValue() === "checked",
          )
          Common.Utils.InternalSettings.set(
            "de-bookmarks-sort-location",
            this.radioLocation.getValue(),
          )
        },

        _setDefaults: function (props) {
          this.refreshBookmarks()
          this.btnGetLink.setVisible(this.appOptions.canMakeActionLink)
        },

        getSettings: () => ({}),

        onDlgBtnClick: function (event) {
          this.close()
        },

        onPrimary: () => true,

        createCopyDropdown: function (parentBtn, parentEl, xOffset) {
          let cssOffset = ""
          if (xOffset) {
            cssOffset += `right: ${xOffset.right !== undefined ? `${xOffset.right}px;` : "auto;"}`
            cssOffset += `left: ${xOffset.left !== undefined ? `${xOffset.left}px;` : "auto;"}`
          }

          const copyBox = $(
            `<div class="bookmark-copy-dropdown dropdown-menu" style="width: 291px; ${cssOffset} padding: 10px;"><div class="bookmark-copy-dropdown-input display-inline-block-middle"></div><button class="bookmark-copy-dropdown-btn btn btn-text-default margin-left-5 display-inline-block-middle" style="width: 86px;">${this.textCopy}</button></div>`,
          )
          parentEl.append(copyBox)
          copyBox.on(
            "click",
            _.bind(() => false, this),
          )
          parentEl.on({
            "shown.bs.dropdown": () => {
              _.delay(() => {
                input._input.select().focus()
              }, 100)
            },
            "hide.bs.dropdown": () => {
              this.txtName._input.select().focus()
            },
          })

          const input = new Common.UI.InputField({
            el: parentEl.find(".bookmark-copy-dropdown-input"),
            editable: false,
            style: "width: 176px;",
          })

          const button = new Common.UI.Button({
            el: copyBox.find("button"),
          })
          button.on("click", () => {
            input._input.select()
            document.execCommand("copy")
          })

          Common.Gateway.on("setactionlink", (url) => {
            input.setValue(url)
          })

          return {
            parentBtn: parentBtn,
            box: copyBox,
            input: input,
            button: button,
          }
        },

        refreshBookmarks: function () {
          if (this.props) {
            const store = this.bookmarksList.store
            const count = this.props.asc_GetCount()
            const showHidden = this.chHidden.getValue() === "checked"
            const arr = []
            for (let i = 0; i < count; i++) {
              const name = this.props.asc_GetName(i)
              if (
                !this.props.asc_IsInternalUseBookmark(name) &&
                (showHidden || !this.props.asc_IsHiddenBookmark(name))
              ) {
                const rec = new Common.UI.DataViewModel()
                rec.set({
                  value: name,
                  location: i,
                })
                arr.push(rec)
              }
            }
            store.reset(arr, { silent: false })
          }
        },

        onSelectBookmark: function (listView, itemView, record) {
          if (!record) return

          const value = record.get("value")
          this.txtName.setValue(value)
          this.btnAdd.setDisabled(false)
          this.btnGoto.setDisabled(false)
          this.btnDelete.setDisabled(false)
          this.btnGetLink.setDisabled(false)
        },

        gotoBookmark: function (btn, eOpts) {
          const rec = this.bookmarksList.getSelectedRec()
          if (rec) this.props.asc_SelectBookmark(rec.get("value"))
          else if (this.txtName.getValue() !== "")
            this.props.asc_SelectBookmark(this.txtName.getValue())
        },

        addBookmark: function (isCloseModal) {
          this.props.asc_AddBookmark(this.txtName.getValue())
          this.refreshBookmarks()
          const rec = this.bookmarksList.store.findWhere({ value: this.txtName.getValue() })
          this.bookmarksList.selectRecord(rec)
          this.bookmarksList.scrollToRecord(rec)
          this.txtName.focus()
          if (isCloseModal) {
            this.close()
          }
        },

        onAddMenu: function (menu, item) {
          if (item.value === 1) {
            this.addBookmark(true)
          } else if (item.value === 2) {
            this.addBookmark()
            this.getBookmarkLink(this.btnAdd)

            //Trigger "click" for invisible button, to open dropdown
            setTimeout(() => {
              $("#bookmarks-btn-add-copy-dropdown button").click()
            }, 5)
          }
        },

        onDblClickBookmark: function (listView, itemView, record) {
          this.props.asc_SelectBookmark(record.get("value"))
        },

        deleteBookmark: function (btn, eOpts) {
          const rec = this.bookmarksList.getSelectedRec()
          if (rec) {
            this.props.asc_RemoveBookmark(rec.get("value"))
            const store = this.bookmarksList.store
            const idx = _.indexOf(store.models, rec)
            store.remove(rec)
            this.txtName.setValue("")
            this.btnAdd.setDisabled(true)
            this.btnGoto.setDisabled(true)
            this.btnDelete.setDisabled(true)
            this.btnGetLink.setDisabled(true)
          }
        },

        getBookmarkLink: function (btn) {
          if (btn.cmpEl?.parent().hasClass("open")) return

          const rec = this.bookmarksList.getSelectedRec()
          rec &&
            Common.Gateway.requestMakeActionLink({
              action: {
                type: "bookmark",
                data: rec.get("value"),
              },
            })
        },

        onRadioSort: function (field, newValue, eOpts) {
          if (newValue) {
            this.bookmarksList.store.sort()
            this.bookmarksList.onResetItems()
          }
        },

        onChangeHidden: function (field, newValue, oldValue, eOpts) {
          this.refreshBookmarks()
        },

        textTitle: "Bookmarks",
        textLocation: "Location",
        textBookmarkName: "Bookmark name",
        textSort: "Sort by",
        textName: "Name",
        textAdd: "Add",
        textAddAndGetLink: "Add & Get Link",
        textGoto: "Go to",
        textDelete: "Delete",
        textClose: "Close",
        textHidden: "Hidden bookmarks",
        txtInvalidName:
          "Bookmark name can only contain letters, digits and underscores, and should begin with the letter",
        textGetLink: "Get Link",
        textCopy: "Copy",
      },
      DE.Views.BookmarksDialog || {},
    ),
  )
})
