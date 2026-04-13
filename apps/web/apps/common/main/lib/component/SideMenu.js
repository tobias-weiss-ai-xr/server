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
 *  SideMenu.js
 *
 *  Created on 25/10/2023.
 *
 */

define(["underscore", "backbone", "common/main/lib/component/BaseView"], (_, Backbone) => {
  Common.UI.SideMenu = Backbone.View.extend(
    (() => ({
      buttons: [],
      btnMoreContainer: undefined,

      render: function () {
        this.btnMore = new Common.UI.Button({
          parentEl: this.btnMoreContainer,
          cls: "btn-side-more btn-category",
          iconCls: "toolbar__icon btn-more",
          onlyIcon: true,
          style: "width: 100%;",
          hint: this.tipMore,
          menu: new Common.UI.Menu({
            cls: "shifted-right",
            items: [],
          }),
        })
        this.btnMore.menu.on("item:click", _.bind(this.onMenuMore, this))
        this.btnMore.menu.on("item:custom-click", _.bind(this.onMenuMore, this))
        this.btnMore.menu.on("show:before", _.bind(this.onShowBeforeMoreMenu, this))
        this.btnMore.hide()

        $(window).on("resize", _.bind(this.setMoreButton, this))
      },

      setButtons: function (btns) {
        this.buttons = []
        btns.forEach(
          _.bind(function (button) {
            if (button?.cmpEl.is(":visible")) {
              this.buttons.push(button)
            }
          }, this),
        )
      },

      addButton: function (button) {
        this.buttons.push(button)
      },

      insertButton: function (button, $button) {
        this.btnMoreContainer.before($button)
        button.on(
          "click",
          _.bind(function () {
            this.fireEvent("button:click", [button])
          }, this),
        )
        this.addButton(button)
        this.setMoreButton()
      },

      insertPanel: function ($panel) {
        this.$el.find(".side-panel").append($panel)
      },

      setMoreButton: function () {
        if (!this.buttons.length) return

        const $more = this.btnMore

        const btnHeight = this.buttons[0].cmpEl.outerHeight(true)
        const padding = Number.parseFloat(this.$el.find(".tool-menu-btns").css("padding-top"))
        let height = padding + this.buttons.length * btnHeight
        const maxHeight = this.$el.height()

        if (height > maxHeight) {
          const arrMore = []
          let last
          let i
          height = padding
          for (i = 0; i < this.buttons.length; i++) {
            height += btnHeight
            if (height > maxHeight) {
              last = i - 1
              break
            }
          }
          this.buttons.forEach((btn, index) => {
            if (index >= last) {
              if (btn.options.iconImg) {
                arrMore.push({
                  caption: btn.hint,
                  iconImg: btn.options.iconImg,
                  template: _.template(
                    [
                      '<a id="<%= id %>" class="menu-item" tabindex="-1" type="menuitem">',
                      '<img class="menu-item-icon" src="<%= options.iconImg %>">',
                      "<%- caption %>",
                      "</a>",
                    ].join(""),
                  ),
                  value: index,
                  toggleGroup: "sideMenuItems",
                  checkmark: false,
                  checkable: true,
                })
              } else if (btn.options.iconsSet) {
                arrMore.push(
                  new Common.UI.MenuItemCustom({
                    caption: btn.hint,
                    iconsSet: btn.options.iconsSet,
                    baseUrl: btn.options.baseUrl,
                    value: index,
                    disabled: btn.isDisabled(),
                    toggleGroup: "sideMenuItems",
                    checkmark: false,
                    checkable: true,
                  }),
                )
              } else {
                arrMore.push({
                  caption: btn.hint,
                  iconCls: `menu__icon ${btn.iconCls}`,
                  value: index,
                  disabled: btn.isDisabled(),
                  toggleGroup: "sideMenuItems",
                  checkmark: false,
                  checkable: true,
                })
              }
              btn.cmpEl.hide()
            } else {
              btn.cmpEl.show()
            }
          })
          if (arrMore.length > 0) {
            this.btnMore.menu.removeAll()
            for (i = 0; i < arrMore.length; i++) {
              this.btnMore.menu.addItem(arrMore[i])
            }
            $more.show()
          }
        } else {
          this.buttons.forEach((btn) => {
            btn.cmpEl.show()
          })
          $more.hide()
        }
      },

      clearMoreButton: function () {
        this.buttons?.forEach((btn) => {
          btn.cmpEl.show()
        })
        this.btnMore.hide()
      },

      onMenuMore: function (menu, item) {
        const btn = this.buttons[item.value]
        if (btn.cmpEl.prop("id") !== "left-btn-support") btn.toggle(!btn.pressed)
        btn.trigger("click", btn)
      },

      onShowBeforeMoreMenu: function (menu) {
        menu.items.forEach((item) => {
          item.setChecked(false, true)
        })
        let index
        this.buttons.forEach((btn, ind) => {
          if (btn.pressed) {
            index = ind
          }
        })
        const menuItem = _.findWhere(menu.items, { value: index })
        if (menuItem) {
          menuItem.setChecked(true, true)
        }
      },

      setDisabledMoreMenuItem: function (btn, disabled) {
        if (this.btnMore && !btn.cmpEl.is(":visible")) {
          const index = _.indexOf(this.buttons, btn)
          const item = _.findWhere(this.btnMore.menu.items, { value: index })
          item?.setDisabled(disabled)
        }
      },

      setDisabledAllMoreMenuItems: function (disabled) {
        if (this.btnMore && this.btnMore.menu.items.length > 0) {
          this.btnMore.menu.items.forEach((item) => {
            item.setDisabled(disabled)
          })
        }
      },

      setDisabledPluginButtons: function (disabled) {
        this.buttons.forEach((btn) => {
          if (btn.options.type === "plugin") {
            btn.setDisabled(disabled)
            this.setDisabledMoreMenuItem(btn, disabled)
          }
        })
      },

      isButtonInMoreMenu: function (btn) {
        return _.indexOf(this.buttons, btn) > -1
      },

      getPluginButton: function (guid) {
        let btn
        for (let i = 0; i < this.buttons.length; i++) {
          if (this.buttons[i].options.value === guid) {
            btn = this.buttons[i]
            break
          }
        }
        return [btn, i]
      },

      openPlugin: function (guid) {
        const btn = this.getPluginButton(guid)[0]
        if (btn) {
          if (!btn.isDisabled() && !btn.pressed) {
            btn.toggle(true)
            this.fireEvent("button:click", [btn])
          }
        }
      },

      closePlugin: function (guid) {
        const arr = this.getPluginButton(guid)
        const btn = arr[0]
        const index = arr[1]
        btn.cmpEl.parent().remove()
        this.buttons.splice(index, 1)
        this.close?.()

        this.setMoreButton()
      },

      isPluginButtonPressed: function () {
        let pressed = false
        for (let i = 0; i < this.buttons.length; i++) {
          if (this.buttons[i].options.type === "plugin" && this.buttons[i].pressed) {
            pressed = true
            break
          }
        }
        return pressed
      },

      toggleActivePluginButton: function (toggle) {
        for (let i = 0; i < this.buttons.length; i++) {
          if (this.buttons[i].options.type === "plugin" && this.buttons[i].pressed) {
            this.buttons[i].toggle(toggle, true)
          }
        }
      },

      updatePluginButtonsIcons: function (icons) {
        icons.forEach((item) => {
          const arr = this.getPluginButton(item.guid)
          const btn = arr[0]
          const index = arr[1]
          const menuItem = _.findWhere(this.btnMore.menu.items, { value: index })
          const src = item.baseUrl + item.parsedIcons.normal
          if (!btn.options.iconsSet) {
            // updated automatically if has iconsSet
            btn.options.iconImg = src
            btn.cmpEl.find("img").attr("src", src)
          }
          if (menuItem && !menuItem.options.iconsSet) {
            // updated automatically if has iconsSet
            menuItem.cmpEl.find("img").attr("src", src)
          }
        })
      },
    }))(),
  )
})
