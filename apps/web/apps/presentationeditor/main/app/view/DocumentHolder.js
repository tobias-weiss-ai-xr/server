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
define([
  "jquery",
  "underscore",
  "backbone",
  "gateway",
  "common/main/lib/util/utils",
  "common/main/lib/component/Menu",
  //    'common/main/lib/view/InsertTableDialog',
], ($, _, Backbone, gateway) => {
  PE.Views.DocumentHolder = Backbone.View.extend(
    _.extend(
      {
        el: "#editor_sdk",

        // Compile our stats template
        template: null,

        // Delegated events for creating new items, and clearing completed ones.
        events: {},

        initialize: function () {
          this.slidesCount = 0
          this._currentMathObj = undefined
          this._currentParaObjDisabled = false
          this._currentSpellObj = undefined
          this._currentTranslateObj = this
          this._currLang = {}
          this._state = { unitsChanged: true }
          this._isDisabled = false
          this._preventCustomClick = null
          this._hasCustomItems = false
          this._langs = null

          Common.NotificationCenter.on("settings:unitschanged", _.bind(this.unitsChanged, this))
        },

        render: function () {
          this.fireEvent("render:before", this)

          this.cmpEl = $(this.el)

          this.fireEvent("render:after", this)
          return this
        },

        setApi: function (o) {
          this.api = o
          return this
        },

        setMode: function (m) {
          this.mode = m
          return this
        },

        focus: function () {
          _.defer(() => {
            this.cmpEl.focus()
          }, 50)
        },

        changeLanguageMenu: function (menu) {
          if (this._currLang.id === null || this._currLang.id === undefined) {
            menu.clearAll()
          } else {
            const index = _.findIndex(menu.items, { langid: this._currLang.id })
            index > -1 && !menu.items[index].checked && menu.setChecked(index, true)
          }
        },

        addWordVariants: function (isParagraph) {
          if (!this.textMenu || (!this.textMenu.isVisible() && !this.tableMenu.isVisible())) return

          if (_.isUndefined(isParagraph)) {
            isParagraph = this.textMenu.isVisible()
          }

          this.clearWordVariants(isParagraph)

          const moreMenu = isParagraph ? this.menuSpellMorePara : this.menuSpellMoreTable
          const spellMenu = isParagraph ? this.menuSpellPara : this.menuSpellTable
          const arr = []
          const arrMore = []
          const variants = this._currentSpellObj.get_Variants()

          if (variants.length > 0) {
            moreMenu.setVisible(variants.length > 3)
            moreMenu.setDisabled(this._currentParaObjDisabled)

            _.each(variants, (variant, index) => {
              const mnu = new Common.UI.MenuItem({
                caption: variant,
                spellword: true,
                disabled: this._currentParaObjDisabled,
              }).on("click", (item, e) => {
                if (this.api) {
                  this.api.asc_replaceMisspelledWord(item.caption, this._currentSpellObj)
                  this.fireEvent("editcomplete", this)
                }
              })

              index < 3 ? arr.push(mnu) : arrMore.push(mnu)
            })

            if (arr.length > 0) {
              if (isParagraph) {
                _.each(arr, (variant, index) => {
                  this.textMenu.insertItem(index, variant)
                })
              } else {
                _.each(arr, (variant, index) => {
                  this.menuSpellCheckTable.menu.insertItem(index, variant)
                })
              }
            }

            if (arrMore.length > 0) {
              _.each(arrMore, (variant, index) => {
                moreMenu.menu.addItem(variant)
              })
            }

            spellMenu.setVisible(false)
          } else {
            moreMenu.setVisible(false)
            spellMenu.setVisible(true)
            spellMenu.setCaption(this.noSpellVariantsText)
          }
        },

        clearWordVariants: function (isParagraph) {
          const spellMenu = isParagraph ? this.textMenu : this.menuSpellCheckTable.menu

          for (let i = 0; i < spellMenu.items.length; i++) {
            if (spellMenu.items[i].options.spellword) {
              if (spellMenu.checkeditem === spellMenu.items[i]) {
                spellMenu.checkeditem = undefined
                spellMenu.activeItem = undefined
              }

              spellMenu.removeItem(spellMenu.items[i])
              i--
            }
          }
          isParagraph
            ? this.menuSpellMorePara.menu.removeAll()
            : this.menuSpellMoreTable.menu.removeAll()

          this.menuSpellMorePara.menu.checkeditem = undefined
          this.menuSpellMorePara.menu.activeItem = undefined
          this.menuSpellMoreTable.menu.checkeditem = undefined
          this.menuSpellMoreTable.menu.activeItem = undefined
        },

        onSlidePickerShowAfter: (picker) => {
          if (!picker._needRecalcSlideLayout) return

          if (picker.cmpEl && picker.dataViewItems.length > 0) {
            const dataViewItems = picker.dataViewItems
            const el = $(dataViewItems[0].el)
            const itemW =
              el.outerWidth() +
              Number.parseInt(el.css("margin-left")) +
              Number.parseInt(el.css("margin-right"))
            const columnCount = Math.floor(picker.options.restoreWidth / itemW + 0.5) || 1 // try to use restore width
            let col = 0
            let maxHeight = 0

            picker.cmpEl.width(itemW * columnCount + 11)

            for (let i = 0; i < dataViewItems.length; i++) {
              const div = $(dataViewItems[i].el).find(".title")
              const height = div.height()

              if (height > maxHeight) maxHeight = height
              else div.css({ height: maxHeight })

              col++
              if (col > columnCount - 1) {
                col = 0
                maxHeight = 0
              }
            }
            picker._needRecalcSlideLayout = false
          }
        },

        createDelayedElementsViewer: () => {},

        createDelayedElements: () => {},

        setLanguages: function (langs) {
          if (!langs) langs = this._langs
          if (langs && langs.length > 0) {
            if (!this.langParaMenu || !this.langTableMenu) {
              this._langs = langs
              return
            }
            this._langs = null
            const arrPara = []
            const arrTable = []
            _.each(langs, (lang) => {
              const item = {
                caption: lang.displayValue,
                captionEn: lang.displayValueEn,
                value: lang.value,
                checkable: true,
                langid: lang.code,
                spellcheck: lang.spellcheck,
              }
              arrPara.push(item)
              arrTable.push(_.clone(item))
            })
            const lckey = "app-settings-recent-langs"
            this.langParaMenu.menu.setRecent({
              count: Common.Utils.InternalSettings.get(`${lckey}-count`) || 5,
              offset: Common.Utils.InternalSettings.get(`${lckey}-offset`) || 0,
              key: lckey,
              valueField: "value",
            })
            this.langTableMenu.menu.setRecent({
              count: Common.Utils.InternalSettings.get(`${lckey}-count`) || 5,
              offset: Common.Utils.InternalSettings.get(`${lckey}-offset`) || 0,
              key: lckey,
              valueField: "value",
            })
            this.langParaMenu.menu.resetItems(arrPara)
            this.langTableMenu.menu.resetItems(arrTable)
          }
        },

        createEquationMenu: function (toggleGroup, menuAlign) {
          return new Common.UI.Menu({
            cls: "ppm-toolbar shifted-right",
            menuAlign: menuAlign,
            items: [
              new Common.UI.MenuItem({
                caption: this.currProfText,
                iconCls: "menu__icon btn-professional-equation",
                type: "view",
                value: { all: false, linear: false },
              }),
              new Common.UI.MenuItem({
                caption: this.currLinearText,
                iconCls: "menu__icon btn-linear-equation",
                type: "view",
                value: { all: false, linear: true },
              }),
              new Common.UI.MenuItem({
                caption: this.allProfText,
                iconCls: "menu__icon btn-professional-equation",
                type: "view",
                value: { all: true, linear: false },
              }),
              new Common.UI.MenuItem({
                caption: this.allLinearText,
                iconCls: "menu__icon btn-linear-equation",
                type: "view",
                value: { all: true, linear: true },
              }),
              { caption: "--" },
              new Common.UI.MenuItem({
                caption: this.unicodeText,
                checkable: true,
                checked: false,
                toggleGroup: toggleGroup,
                type: "input",
                value: Asc.c_oAscMathInputType.Unicode,
              }),
              new Common.UI.MenuItem({
                caption: this.latexText,
                checkable: true,
                checked: false,
                toggleGroup: toggleGroup,
                type: "input",
                value: Asc.c_oAscMathInputType.LaTeX,
              }),
              { caption: "--" },
              new Common.UI.MenuItem({
                caption: this.hideEqToolbar,
                isToolbarHide: false,
                type: "hide",
              }),
            ],
          })
        },

        unitsChanged: function (m) {
          this._state.unitsChanged = true
        },

        SetDisabled: function (state) {
          this._isDisabled = state
        },

        addEquationMenu: () => {},

        clearEquationMenu: () => {},

        equationCallback: () => {},

        initEquationMenu: () => {},

        updateCustomItems: () => {},

        clearCustomItems: () => {},

        parseIcons: () => {},
      },
      PE.Views.DocumentHolder || {},
    ),
  )
})
