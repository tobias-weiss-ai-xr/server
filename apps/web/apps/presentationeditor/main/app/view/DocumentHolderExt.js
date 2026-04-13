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

define([], () => {
  if (window.PE?.Views?.DocumentHolder) {
    const dh = window.PE.Views.DocumentHolder.prototype

    dh.createDelayedElementsViewer = function () {
      if (this.menuViewCopy) return // menu is already inited

      this.menuViewCopy = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-copy",
        caption: this.textCopy,
        value: "copy",
      })

      this.menuViewUndo = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-undo icon-rtl",
        caption: this.textUndo,
      })

      const menuViewCopySeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.menuViewAddComment = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-add-comment",
        caption: this.addCommentText,
      })

      this.viewModeMenu = new Common.UI.Menu({
        cls: "shifted-right",
        initMenu: (value) => {
          this.menuViewUndo.setVisible(
            this.mode.canCoAuthoring && this.mode.canComments && !this._isDisabled,
          )
          this.menuViewUndo.setDisabled(!this.api.asc_getCanUndo())
          menuViewCopySeparator.setVisible(
            !value.isChart &&
              this.api.can_AddQuotedComment() !== false &&
              this.mode.canCoAuthoring &&
              this.mode.canComments &&
              !this._isDisabled,
          )
          this.menuViewAddComment.setVisible(
            !value.isChart &&
              this.api.can_AddQuotedComment() !== false &&
              this.mode.canCoAuthoring &&
              this.mode.canComments &&
              !this._isDisabled,
          )
          this.menuViewAddComment.setDisabled(value.locked)
          const cancopy = this.api?.can_CopyCut()
          this.menuViewCopy.setDisabled(!cancopy)
        },
        items: [
          this.menuViewCopy,
          this.menuViewUndo,
          menuViewCopySeparator,
          this.menuViewAddComment,
        ],
      }).on("hide:after", (menu, e, isFromInputControl) => {
        this.clearCustomItems(menu)
        this.currentMenu = null
        if (this.suppressEditComplete) {
          this.suppressEditComplete = false
          return
        }

        if (!isFromInputControl) this.fireEvent("editcomplete", this)
      })

      this.mnuPreview = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-preview",
        caption: this.txtPreview,
      })

      this.mnuSelectAll = new Common.UI.MenuItem({
        caption: this.txtSelectAll,
      })

      this.mnuPrintSelection = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-print",
        caption: this.txtPrintSelection,
      })

      this.viewModeMenuSlide = new Common.UI.Menu({
        cls: "shifted-right",
        initMenu: (value) => {
          this.mnuSelectAll.setDisabled(this.slidesCount < 2)
          this.mnuPrintSelection.setVisible(this.mode.canPrint && value.fromThumbs === true)
          this.mnuPrintSelection.setDisabled(this.slidesCount < 1)
          this.mnuPreview.setDisabled(this.slidesCount < 1)
        },
        items: [this.mnuSelectAll, this.mnuPrintSelection, { caption: "--" }, this.mnuPreview],
      }).on("hide:after", (menu, e, isFromInputControl) => {
        this.clearCustomItems(menu)
        this.currentMenu = null
        if (this.suppressEditComplete) {
          this.suppressEditComplete = false
          return
        }

        if (!isFromInputControl) this.fireEvent("editcomplete", this)
      })

      this.fireEvent("createdelayedelements", [this, "view"])
    }

    dh.createDelayedElements = function () {
      if (this.mnuDeleteSlide || !window.styles_loaded) return // menu is already inited or editor styles are not loaded

      this.mnuDeleteSlide = new Common.UI.MenuItem({
        caption: this.txtDeleteSlide,
      })

      this.mnuChangeSlide = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-changeslide",
        caption: this.txtChangeLayout,
        menu: new Common.UI.Menu({
          menuAlign: "tl-tr",
          items: [
            {
              template: _.template(
                '<div id="id-docholder-menu-changeslide" class="menu-layouts" style="width: 302px; margin: 0 4px;"></div>',
              ),
            },
          ],
        }),
      })

      this.mnuResetSlide = new Common.UI.MenuItem({
        caption: this.txtResetLayout,
      })

      this.mnuNewSlide = new Common.UI.MenuItem({
        caption: this.txtNewSlide,
      })

      this.mnuDuplicateSlide = new Common.UI.MenuItem({
        caption: this.txtDuplicateSlide,
      })

      const mnuChangeTheme = new Common.UI.MenuItem({
        caption: this.txtChangeTheme,
        menu: new Common.UI.Menu({
          menuAlign: "tl-tr",
          items: [
            {
              template: _.template(
                '<div id="id-docholder-menu-changetheme" style="width: 289px; margin: 0 4px;"></div>',
              ),
            },
          ],
        }),
      })

      this.mnuPreview = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-preview",
        caption: this.txtPreview,
      })

      this.mnuSelectAll = new Common.UI.MenuItem({
        caption: this.txtSelectAll,
      })

      this.mnuPrintSelection = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-print",
        caption: this.txtPrintSelection,
      })

      this.mnuMoveSlideToStart = new Common.UI.MenuItem({
        caption: this.txtMoveSlidesToStart,
      })

      this.mnuMoveSlideToEnd = new Common.UI.MenuItem({
        caption: this.txtMoveSlidesToEnd,
      })

      this.menuSlidePaste = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-paste",
        caption: this.textPaste,
        value: "paste",
      })

      this.menuSlideSettings = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-menu-slide",
        caption: this.textSlideSettings,
        value: null,
      })

      this.mnuSlideHide = new Common.UI.MenuItem({
        caption: this.txtSlideHide,
        checkable: true,
        checked: false,
      })

      this.mnuGuides = new Common.UI.MenuItem({
        caption: this.textGuides,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            { caption: this.textShowGuides, value: "show", checkable: true },
            { caption: "--" },
            {
              caption: this.textAddVGuides,
              iconCls: "menu__icon btn-vertical-guide",
              value: "add-vert",
            },
            {
              caption: this.textAddHGuides,
              iconCls: "menu__icon btn-horizontal-guide",
              value: "add-hor",
            },
            { caption: this.textDeleteGuide, value: "del-guide" },
            { caption: "--" },
            { caption: this.textSmartGuides, value: "smart", checkable: true },
            { caption: this.textClearGuides, value: "clear" },
          ],
        }),
      })
      this.mnuGridlines = new Common.UI.MenuItem({
        caption: this.textGridlines,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            { caption: this.textShowGridlines, value: "show", checkable: true },
            { caption: this.textSnapObjects, value: "snap", checkable: true },
            { caption: "--" },
            { caption: "--" },
            { caption: this.textCustom, value: "custom" },
          ],
        }),
      })
      this.mnuRulers = new Common.UI.MenuItem({
        caption: this.textRulers,
        checkable: true,
      })

      this.slideMenu = new Common.UI.Menu({
        cls: "shifted-right",
        restoreHeightAndTop: true,
        scrollToCheckedItem: false,
        initMenu: (value) => {
          const selectedLast = this.api.asc_IsLastSlideSelected()
          const selectedFirst = this.api.asc_IsFirstSlideSelected()
          this.slideMenu.options.fromThumbs = value.fromThumbs
          this.menuSlidePaste.setVisible(value.fromThumbs !== true)
          this.mnuNewSlide.setVisible(value.fromThumbs === true) // New Slide
          this.mnuDuplicateSlide.setVisible(value.isSlideSelect === true) // Duplicate Slide
          this.mnuDeleteSlide.setVisible(value.isSlideSelect === true)
          this.mnuSlideHide.setVisible(value.isSlideSelect === true)
          this.mnuSlideHide.setChecked(value.isSlideHidden === true)
          this.slideMenu.items[5].setVisible(
            value.isSlideSelect === true || value.fromThumbs !== true,
          )
          this.mnuChangeSlide.setVisible(
            !this.api.asc_IsMasterMode() &&
              (value.isSlideSelect === true || value.fromThumbs !== true),
          )
          this.mnuResetSlide.setVisible(
            !this.api.asc_IsMasterMode() &&
              (value.isSlideSelect === true || value.fromThumbs !== true),
          )
          mnuChangeTheme.setVisible(value.isSlideSelect === true || value.fromThumbs !== true)
          this.menuSlideSettings.setVisible(
            value.isSlideSelect === true || value.fromThumbs !== true,
          )
          this.menuSlideSettings.options.value = null

          this.slideMenu.items[10].setVisible(!value.fromThumbs) // guides separator
          this.mnuGuides.setVisible(!value.fromThumbs)
          this.mnuGridlines.setVisible(!value.fromThumbs)
          this.mnuRulers.setVisible(!value.fromThumbs)
          this.slideMenu.items[14].setVisible(value.fromThumbs === true)
          this.mnuSelectAll.setVisible(value.fromThumbs === true)

          this.mnuPrintSelection.setVisible(this.mode.canPrint && value.fromThumbs === true)
          this.slideMenu.items[17].setVisible(
            (!selectedLast || !selectedFirst) && value.isSlideSelect === true,
          )
          this.mnuMoveSlideToEnd.setVisible(!selectedLast && value.isSlideSelect === true)
          this.mnuMoveSlideToStart.setVisible(!selectedFirst && value.isSlideSelect === true)
          this.slideMenu.items[20].setVisible(value.fromThumbs === true)
          this.mnuPreview.setVisible(value.fromThumbs === true)

          if (!value.fromThumbs) {
            this.mnuGuides.menu.items[0].setChecked(this.api.asc_getShowGuides(), true)
            if (value.guide) {
              // change visibility only on asc_onContextMenu event
              this.mnuGuides.menu.items[4].setVisible(!!value.guide.guideId)
              this.mnuGuides.menu.items[4].options.guideId = value.guide.guideId
            }
            this.mnuGuides.menu.items[6].setChecked(this.api.asc_getShowSmartGuides(), true)

            const viewPropsLock = !!Common.Utils.InternalSettings.get("pe-lock-view-props")
            this.mnuGuides.menu.items[2].setDisabled(viewPropsLock)
            this.mnuGuides.menu.items[3].setDisabled(viewPropsLock)
            this.mnuGuides.menu.items[4].setDisabled(viewPropsLock)
            this.mnuGuides.menu.items[7].setDisabled(
              viewPropsLock || !this.api.asc_canClearGuides(),
            )

            this.mnuGridlines.menu.items[0].setChecked(this.api.asc_getShowGridlines(), true)
            this.mnuGridlines.menu.items[1].setChecked(this.api.asc_getSnapToGrid(), true)

            const spacing = Common.Utils.Metric.fnRecalcFromMM(
              this.api.asc_getGridSpacing() / 36000,
            )
            const items = this.mnuGridlines.menu.items
            if (this._state.unitsChanged) {
              for (let i = 3; i < items.length - 2; i++) {
                this.mnuGridlines.menu.removeItem(items[i])
                i--
              }
              const arr = Common.define.gridlineData.getGridlineData(
                Common.Utils.Metric.getCurrentMetric(),
              )
              for (let i = 0; i < arr.length; i++) {
                const menuItem = new Common.UI.MenuItem({
                  caption: arr[i].caption,
                  value: arr[i].value,
                  checkable: true,
                  toggleGroup: "mnu-gridlines",
                })
                this.mnuGridlines.menu.insertItem(3 + i, menuItem)
              }
              this._state.unitsChanged = false
            }

            for (let i = 3; i < items.length - 2; i++) {
              const item = items[i]
              if (item.value < 1 && Math.abs(item.value - spacing) < 0.005) item.setChecked(true)
              else if (item.value >= 1 && Math.abs(item.value - spacing) < 0.001)
                item.setChecked(true)
              else item.setChecked(false)
              item.setDisabled(viewPropsLock)
            }
            this.mnuGridlines.menu.items[1].setDisabled(viewPropsLock)
            this.mnuGridlines.menu.items[items.length - 1].setDisabled(viewPropsLock)
            this.mnuRulers.setChecked(!Common.Utils.InternalSettings.get("pe-hidden-rulers"))
          }

          const selectedElements = this.api.getSelectedElements()
          let locked = false
          let lockedDeleted = false
          let lockedLayout = false
          if (selectedElements && _.isArray(selectedElements)) {
            _.each(selectedElements, (element, index) => {
              if (Asc.c_oAscTypeSelectElement.Slide === element.get_ObjectType()) {
                const elValue = element.get_ObjectValue()
                locked = elValue.get_LockDelete()
                lockedDeleted = elValue.get_LockRemove()
                lockedLayout = elValue.get_LockLayout()
                this.menuSlideSettings.options.value = element
                this.slideLayoutMenu.options.layout_index = elValue.get_LayoutIndex()
                return false
              }
            })
          }
          for (let i = 0; i < 3; i++) {
            this.slideMenu.items[i].setDisabled(locked)
          }
          this.mnuPreview.setDisabled(this.slidesCount < 1)
          this.mnuSelectAll.setDisabled(this.slidesCount < 2)
          this.mnuDeleteSlide.setDisabled(lockedDeleted || locked)
          this.mnuChangeSlide.setDisabled(lockedLayout || locked)
          this.mnuResetSlide.setDisabled(lockedLayout || locked)
          mnuChangeTheme.setDisabled(this._state.themeLock || locked)
          this.mnuSlideHide.setDisabled(lockedLayout || locked)
          this.mnuPrintSelection.setDisabled(this.slidesCount < 1)
        },
        items: [
          this.menuSlidePaste,
          this.mnuNewSlide,
          this.mnuDuplicateSlide,
          this.mnuDeleteSlide,
          this.mnuSlideHide,
          { caption: "--" },
          this.mnuChangeSlide,
          this.mnuResetSlide,
          mnuChangeTheme,
          this.menuSlideSettings,
          { caption: "--" },
          this.mnuGuides,
          this.mnuGridlines,
          this.mnuRulers,
          { caption: "--" },
          this.mnuSelectAll,
          this.mnuPrintSelection,
          { caption: "--" },
          this.mnuMoveSlideToStart,
          this.mnuMoveSlideToEnd,
          { caption: "--" },
          this.mnuPreview,
        ],
      })
        .on("hide:after", (menu, e, isFromInputControl) => {
          this.clearCustomItems(menu)
          this.currentMenu = null
          if (this.suppressEditComplete) {
            this.suppressEditComplete = false
            return
          }

          if (!isFromInputControl) this.fireEvent("editcomplete", this)
        })
        .on("render:after", (cmp) => {
          this.slideLayoutMenu = new Common.UI.DataView({
            el: $("#id-docholder-menu-changeslide"),
            parentMenu: this.mnuChangeSlide.menu,
            style: "max-height: 300px;",
            restoreWidth: 302,
            store: PE.getCollection("SlideLayouts"),
            itemTemplate: _.template(
              [
                '<div class="layout" id="<%= id %>" style="width: <%= itemWidth %>px;">',
                '<div style="background-image: url(<%= imageUrl %>); width: <%= itemWidth %>px; height: <%= itemHeight %>px;background-size: contain;"></div>',
                '<div class="title"><%- title %></div> ',
                "</div>",
              ].join(""),
            ),
          }).on("item:click", (picker, item, record, e) => {
            if (e.type !== "click") this.slideMenu.hide()
            this.fireEvent("layout:change", [record])
          })

          if (this.slideMenu) {
            this.mnuChangeSlide.menu.on("show:after", (menu) => {
              this.onSlidePickerShowAfter(this.slideLayoutMenu)
              this.slideLayoutMenu.scroller.update({ alwaysVisibleY: true })

              const record = this.slideLayoutMenu.store.findLayoutByIndex(
                this.slideLayoutMenu.options.layout_index,
              )
              if (record) {
                this.slideLayoutMenu.selectRecord(record, true)
                this.slideLayoutMenu.scrollToRecord(record)
              }
            })
          }
          this.slideLayoutMenu._needRecalcSlideLayout = true
          this.listenTo(PE.getCollection("SlideLayouts"), "reset", () => {
            this.slideLayoutMenu._needRecalcSlideLayout = true
          })

          this.slideThemeMenu = new Common.UI.DataView({
            el: $("#id-docholder-menu-changetheme"),
            parentMenu: mnuChangeTheme.menu,
            // restoreHeight: 300,
            style: "max-height: 300px;",
            store: PE.getCollection("SlideThemes"),
            itemTemplate: _.template(
              [
                '<div class="style" id="<%= id %>"">',
                '<div class="item-theme" style="' +
                  '<% if (typeof imageUrl !== "undefined") { %>' +
                  "background-image: url(<%= imageUrl %>);" +
                  '<% } %> background-position: 0 -<%= offsety %>px;"></div>',
                "</div>",
              ].join(""),
            ),
          }).on("item:click", (picker, item, record, e) => {
            if (e.type !== "click") this.slideMenu.hide()
            this.fireEvent("theme:change", [record])
          })

          if (this.slideMenu) {
            mnuChangeTheme.menu.on("show:after", (menu) => {
              const record = this.slideThemeMenu.store.findWhere({ themeId: this._state.themeId })
              this.slideThemeMenu.selectRecord(record, true)

              this.slideThemeMenu.scroller.update({ alwaysVisibleY: true })
              this.slideThemeMenu.scroller.scrollTop(0)
            })
          }
        })

      this.mnuInsertMaster = new Common.UI.MenuItem({
        caption: this.textInsertSlideMaster,
        value: "ins-master",
      })

      this.mnuInsertLayout = new Common.UI.MenuItem({
        caption: this.textInsertLayout,
        value: "ins-layout",
      })

      this.mnuDuplicateMaster = new Common.UI.MenuItem({
        caption: this.textDuplicateSlideMaster,
        value: "duplicate-master",
      })

      this.mnuPreserveMaster = new Common.UI.MenuItem({
        caption: this.textPreserveSlideMaster,
        value: "preserve-master",
        checkable: true,
      })

      this.mnuDeleteMaster = new Common.UI.MenuItem({
        caption: this.textDeleteMaster,
        value: "delete-master",
      })

      this.mnuDuplicateLayout = new Common.UI.MenuItem({
        caption: this.textDuplicateLayout,
        value: "duplicate-master",
      })

      this.mnuDeleteLayout = new Common.UI.MenuItem({
        caption: this.textDeleteLayout,
        value: "delete-layout",
      })

      this.mnuRenameMaster = new Common.UI.MenuItem({
        caption: this.textRenameMaster,
        value: "Rename-master",
      })

      this.mnuRenameLayout = new Common.UI.MenuItem({
        caption: this.textRenameLayout,
        value: "Rename-layout",
      })

      this.slideMasterMenu = new Common.UI.Menu({
        //cls: 'shifted-right',
        restoreHeightAndTop: true,
        scrollToCheckedItem: false,
        initMenu: (value) => {
          const isMaster = value.isMaster
          let currentName = ""

          const selectedElements = this.api.getSelectedElements()
          if (selectedElements && _.isArray(selectedElements)) {
            _.each(selectedElements, (element) => {
              if (Asc.c_oAscTypeSelectElement.Slide === element.get_ObjectType()) {
                const elValue = element.get_ObjectValue()
                currentName = isMaster ? elValue.get_MasterName() : elValue.get_LayoutName()
              }
            })
          }

          this.mnuRenameMaster.setDisabled(currentName === undefined)
          this.mnuRenameLayout.setDisabled(currentName === undefined)

          this.mnuDuplicateMaster.setVisible(isMaster)
          this.mnuPreserveMaster.setVisible(isMaster)
          this.mnuPreserveMaster.setChecked(value.isPreserve, true)
          this.mnuDeleteMaster.setVisible(isMaster)
          this.mnuRenameMaster.setVisible(isMaster)
          this.mnuDuplicateLayout.setVisible(!isMaster)
          this.mnuDeleteLayout.setVisible(!isMaster)
          this.mnuRenameLayout.setVisible(!isMaster)

          isMaster && this.mnuDeleteMaster.setDisabled(!this.api.asc_CanDeleteMaster())
          !isMaster && this.mnuDeleteLayout.setDisabled(!this.api.asc_CanDeleteLayout())
        },
        items: [
          this.mnuInsertMaster,
          this.mnuInsertLayout,
          this.mnuDuplicateMaster,
          this.mnuPreserveMaster,
          this.mnuDuplicateLayout,
          { caption: "--" },
          this.mnuDeleteMaster,
          this.mnuRenameMaster,
          this.mnuDeleteLayout,
          this.mnuRenameLayout,
        ],
      })

      this.mnuTableMerge = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-merge-cells",
        caption: this.mergeCellsText,
      })

      this.mnuTableSplit = new Common.UI.MenuItem({
        caption: this.splitCellsText,
      })

      this.menuTableCellAlign = new Common.UI.MenuItem({
        caption: this.AlignText,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            (this.menuTableCellTop = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-top",
              caption: this.AlignTop,
              checkable: true,
              checkmark: false,
              toggleGroup: "popuptablecellalign",
              value: Asc.c_oAscVertAlignJc.Top,
            })),
            (this.menuTableCellCenter = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-middle",
              caption: this.AlignMiddle,
              checkable: true,
              checkmark: false,
              toggleGroup: "popuptablecellalign",
              value: Asc.c_oAscVertAlignJc.Center,
            })),
            (this.menuTableCellBottom = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-bottom",
              caption: this.AlignBottom,
              checkable: true,
              checkmark: false,
              toggleGroup: "popuptablecellalign",
              value: Asc.c_oAscVertAlignJc.Bottom,
            })),
            { caption: "--" },
            (this.menuTableCellLeft = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-left",
              caption: this.AlignLeft,
              checkable: true,
              checkmark: false,
              toggleGroup: "popuptablecellhalign",
              halign: 1,
            })),
            (this.menuTableCellHCenter = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-center",
              caption: this.AlignCenter,
              checkable: true,
              checkmark: false,
              toggleGroup: "popuptablecellhalign",
              halign: 2,
            })),
            (this.menuTableCellRight = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-right",
              caption: this.AlignRight,
              checkable: true,
              checkmark: false,
              toggleGroup: "popuptablecellhalign",
              halign: 0,
            })),
            (this.menuTableCellJust = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-just",
              caption: this.AlignJust,
              checkable: true,
              checkmark: false,
              toggleGroup: "popuptablecellhalign",
              halign: 3,
            })),
          ],
        }),
      })

      this.menuTableSaveAsPicture = new Common.UI.MenuItem({
        caption: this.textSaveAsPicture,
      })

      const menuTableSaveAsPictureSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.menuTableDistRows = new Common.UI.MenuItem({
        caption: this.textDistributeRows,
      })

      this.menuTableDistCols = new Common.UI.MenuItem({
        caption: this.textDistributeCols,
      })

      this.menuTableDirection = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-text-orient-hor",
        caption: this.directionText,
        menu: new Common.UI.Menu({
          cls: "ppm-toolbar shifted-right",
          menuAlign: "tl-tr",
          items: [
            (this.menuTableDirectH = new Common.UI.MenuItem({
              caption: this.directHText,
              iconCls: "menu__icon btn-text-orient-hor",
              checkable: true,
              checkmark: false,
              checked: false,
              toggleGroup: "popuptabledirect",
              direction: Asc.c_oAscCellTextDirection.LRTB,
            })),
            (this.menuTableDirect90 = new Common.UI.MenuItem({
              caption: this.direct90Text,
              iconCls: "menu__icon btn-text-orient-rdown",
              checkable: true,
              checkmark: false,
              checked: false,
              toggleGroup: "popuptabledirect",
              direction: Asc.c_oAscCellTextDirection.TBRL,
            })),
            (this.menuTableDirect270 = new Common.UI.MenuItem({
              caption: this.direct270Text,
              iconCls: "menu__icon btn-text-orient-rup",
              checkable: true,
              checkmark: false,
              checked: false,
              toggleGroup: "popuptabledirect",
              direction: Asc.c_oAscCellTextDirection.BTLR,
            })),
          ],
        }),
      })

      this.menuTableSelectText = new Common.UI.MenuItem({
        caption: this.selectText,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            new Common.UI.MenuItem({
              caption: this.rowText,
              value: 0,
            }),
            new Common.UI.MenuItem({
              caption: this.columnText,
              value: 1,
            }),
            new Common.UI.MenuItem({
              caption: this.cellText,
              value: 2,
            }),
            new Common.UI.MenuItem({
              caption: this.tableText,
              value: 3,
            }),
          ],
        }),
      })

      this.menuTableInsertText = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-addcell",
        caption: this.insertText,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          style: "width: 100px",
          items: [
            new Common.UI.MenuItem({
              caption: this.insertColumnLeftText,
              value: 0,
            }),
            new Common.UI.MenuItem({
              caption: this.insertColumnRightText,
              value: 1,
            }),
            new Common.UI.MenuItem({
              caption: this.insertRowAboveText,
              value: 2,
            }),
            new Common.UI.MenuItem({
              caption: this.insertRowBelowText,
              value: 3,
            }),
          ],
        }),
      })

      this.menuTableDeleteText = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-delcell",
        caption: this.deleteText,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            new Common.UI.MenuItem({
              caption: this.rowText,
              value: 0,
            }),
            new Common.UI.MenuItem({
              caption: this.columnText,
              value: 1,
            }),
            new Common.UI.MenuItem({
              caption: this.tableText,
              value: 2,
            }),
          ],
        }),
      })

      this.menuSpellTable = new Common.UI.MenuItem({
        caption: this.loadSpellText,
        disabled: true,
      })

      this.menuSpellMoreTable = new Common.UI.MenuItem({
        caption: this.moreText,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          restoreHeight: true,
          items: [],
        }),
      })

      const langTemplate = _.template(
        [
          '<a id="<%= id %>" tabindex="-1" type="menuitem" langval="<%= value %>" class="<% if (checked) { %> checked <% } %>">',
          "<div>",
          '<i class="icon <% if (spellcheck) { %> toolbar__icon btn-ic-docspell spellcheck-lang <% } %>"></i>',
          "<%= caption %>",
          "</div>",
          '<label style="opacity: 0.6"><%= captionEn %></label>',
          "</a>",
        ].join(""),
      )

      this.langTableMenu = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-ic-doclang",
        caption: this.langText,
        menu: new Common.UI.MenuSimple({
          cls: "lang-menu shifted-right",
          menuAlign: "tl-tr",
          restoreHeight: 285,
          items: [],
          itemTemplate: langTemplate,
          search: true,
          searchFields: ["caption", "captionEn"],
          focusToCheckedItem: true,
        }),
      })

      this.menuIgnoreSpellTable = new Common.UI.MenuItem({
        caption: this.ignoreSpellText,
        value: false,
      })

      this.menuIgnoreAllSpellTable = new Common.UI.MenuItem({
        caption: this.ignoreAllSpellText,
        value: true,
      })

      this.menuToDictionaryTable = new Common.UI.MenuItem({
        caption: this.toDictionaryText,
      })

      const menuIgnoreSpellTableSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      const menuSpellcheckTableSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.menuSpellCheckTable = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-ic-docspell",
        caption: this.spellcheckText,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            this.menuSpellTable,
            this.menuSpellMoreTable,
            menuIgnoreSpellTableSeparator,
            this.menuIgnoreSpellTable,
            this.menuIgnoreAllSpellTable,
            this.menuToDictionaryTable,
            { caption: "--" },
            this.langTableMenu,
          ],
        }),
      })

      this.menuSpellPara = new Common.UI.MenuItem({
        caption: this.loadSpellText,
        disabled: true,
      })

      this.menuSpellMorePara = new Common.UI.MenuItem({
        caption: this.moreText,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          restoreHeight: true,
          items: [],
        }),
      })

      this.langParaMenu = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-ic-doclang",
        caption: this.langText,
        menu: new Common.UI.MenuSimple({
          cls: "lang-menu shifted-right",
          menuAlign: "tl-tr",
          restoreHeight: 285,
          items: [],
          itemTemplate: langTemplate,
          search: true,
          searchFields: ["caption", "captionEn"],
          focusToCheckedItem: true,
        }),
      })

      this.menuIgnoreSpellPara = new Common.UI.MenuItem({
        caption: this.ignoreSpellText,
        value: false,
      })

      this.menuIgnoreAllSpellPara = new Common.UI.MenuItem({
        caption: this.ignoreAllSpellText,
        value: true,
      })

      this.menuToDictionaryPara = new Common.UI.MenuItem({
        caption: this.toDictionaryText,
      })

      const menuIgnoreSpellParaSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      const menuSpellcheckParaSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.menuTableAdvanced = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-menu-table",
        caption: this.advancedTableText,
      })

      const menuTableSettingsSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.menuImageAdvanced = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-menu-image",
        caption: this.advancedImageText,
      })

      this.menuShapeAdvanced = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-menu-shape",
        caption: this.advancedShapeText,
      })

      this.menuParagraphAdvanced = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-paragraph",
        caption: this.advancedParagraphText,
      })

      this.menuChartAdvanced = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-menu-chart",
        caption: this.advancedChartText,
      })

      const menuAdvancedSettingsSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      const menuCommentParaSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.menuAddHyperlinkPara = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-inserthyperlink",
        caption: this.hyperlinkText,
      })

      this.menuEditHyperlinkPara = new Common.UI.MenuItem({
        caption: this.editHyperlinkText,
      })

      this.menuRemoveHyperlinkPara = new Common.UI.MenuItem({
        caption: this.removeHyperlinkText,
      })

      const menuHyperlinkPara = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-inserthyperlink",
        caption: this.hyperlinkText,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [this.menuEditHyperlinkPara, this.menuRemoveHyperlinkPara],
        }),
      })

      this.menuAddHyperlinkTable = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-inserthyperlink",
        caption: this.hyperlinkText,
      })

      this.menuEditHyperlinkTable = new Common.UI.MenuItem({
        caption: this.editHyperlinkText,
      })

      this.menuRemoveHyperlinkTable = new Common.UI.MenuItem({
        caption: this.removeHyperlinkText,
      })

      const menuHyperlinkTable = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-inserthyperlink",
        caption: this.hyperlinkText,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [this.menuEditHyperlinkTable, this.menuRemoveHyperlinkTable],
        }),
      })

      this.mnuGroupImg = new Common.UI.MenuItem({
        caption: this.txtGroup,
        iconCls: "menu__icon btn-shape-group",
      })

      this.mnuUnGroupImg = new Common.UI.MenuItem({
        caption: this.txtUngroup,
        iconCls: "menu__icon btn-shape-ungroup",
      })

      this.mnuArrangeFront = new Common.UI.MenuItem({
        caption: this.textArrangeFront,
        iconCls: "menu__icon btn-arrange-front",
      })

      this.mnuArrangeBack = new Common.UI.MenuItem({
        caption: this.textArrangeBack,
        iconCls: "menu__icon btn-arrange-back",
      })

      this.mnuArrangeForward = new Common.UI.MenuItem({
        caption: this.textArrangeForward,
        iconCls: "menu__icon btn-arrange-forward",
      })

      this.mnuArrangeBackward = new Common.UI.MenuItem({
        caption: this.textArrangeBackward,
        iconCls: "menu__icon btn-arrange-backward",
      })

      const menuImgShapeArrange = new Common.UI.MenuItem({
        caption: this.txtArrange,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            this.mnuArrangeFront,
            this.mnuArrangeBack,
            this.mnuArrangeForward,
            this.mnuArrangeBackward,
            { caption: "--" },
            this.mnuGroupImg,
            this.mnuUnGroupImg,
          ],
        }),
      })

      this.menuImgShapeAlign = new Common.UI.MenuItem({
        caption: this.txtAlign,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            new Common.UI.MenuItem({
              caption: this.textShapeAlignLeft,
              iconCls: "menu__icon btn-shape-align-left",
              value: Asc.c_oAscAlignShapeType.ALIGN_LEFT,
            }),
            new Common.UI.MenuItem({
              caption: this.textShapeAlignCenter,
              iconCls: "menu__icon btn-shape-align-center",
              value: Asc.c_oAscAlignShapeType.ALIGN_CENTER,
            }),
            new Common.UI.MenuItem({
              caption: this.textShapeAlignRight,
              iconCls: "menu__icon btn-shape-align-right",
              value: Asc.c_oAscAlignShapeType.ALIGN_RIGHT,
            }),
            new Common.UI.MenuItem({
              caption: this.textShapeAlignTop,
              iconCls: "menu__icon btn-shape-align-top",
              value: Asc.c_oAscAlignShapeType.ALIGN_TOP,
            }),
            new Common.UI.MenuItem({
              caption: this.textShapeAlignMiddle,
              iconCls: "menu__icon btn-shape-align-middle",
              value: Asc.c_oAscAlignShapeType.ALIGN_MIDDLE,
            }),
            new Common.UI.MenuItem({
              caption: this.textShapeAlignBottom,
              iconCls: "menu__icon btn-shape-align-bottom",
              value: Asc.c_oAscAlignShapeType.ALIGN_BOTTOM,
            }),
            { caption: "--" },
            new Common.UI.MenuItem({
              caption: this.txtDistribHor,
              iconCls: "menu__icon btn-shape-distribute-hor",
              value: 6,
            }),
            new Common.UI.MenuItem({
              caption: this.txtDistribVert,
              iconCls: "menu__icon btn-shape-distribute-vert",
              value: 7,
            }),
          ],
        }),
      })

      const _toolbar_view = PE.getController("Toolbar").getView("Toolbar")
      this.menuShapesMerge = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-combine-shapes",
        caption: this.textShapesMerge,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            new Common.UI.MenuItem({
              caption: _toolbar_view.textShapesUnion,
              iconCls: "menu__icon btn-union-shapes",
              value: "unite",
            }),
            new Common.UI.MenuItem({
              caption: _toolbar_view.textShapesCombine,
              iconCls: "menu__icon btn-combine-shapes",
              value: "exclude",
            }),
            new Common.UI.MenuItem({
              caption: _toolbar_view.textShapesFragment,
              iconCls: "menu__icon btn-fragment-shapes",
              value: "divide",
            }),
            new Common.UI.MenuItem({
              caption: _toolbar_view.textShapesIntersect,
              iconCls: "menu__icon btn-intersect-shapes",
              value: "intersect",
            }),
            new Common.UI.MenuItem({
              caption: _toolbar_view.textShapesSubstract,
              iconCls: "menu__icon btn-substract-shapes",
              value: "subtract",
            }),
          ],
        }),
      })

      this.menuChartElement = new Common.UI.MenuItem({
        menu: new Common.UI.Menu({
          items: [
            {
              caption: this.textAxes,
              value: "axes",
              disabled: false,
              menu: new Common.UI.Menu({
                cls: "shifted-right",
                menuAlign: "tl-tr",
                items: [
                  {
                    caption: this.textHorAxis,
                    value: "bShowHorAxis",
                    stopPropagation: true,
                    checkable: true,
                  },
                  {
                    caption: this.textVertAxis,
                    value: "bShowVertAxis",
                    stopPropagation: true,
                    checkable: true,
                  },
                  {
                    caption: this.textHorAxisSec,
                    value: "bShowHorAxSec",
                    stopPropagation: true,
                    checkable: true,
                  },
                  {
                    caption: this.textVertAxisSec,
                    value: "bShowVertAxSec",
                    stopPropagation: true,
                    checkable: true,
                  },
                  {
                    caption: this.DepthAxis,
                    value: "bShowDepthAxes",
                    stopPropagation: true,
                    checkable: true,
                  },
                ],
              }),
            },
            {
              caption: this.textAxisTitles,
              value: "axisTitles",
              disabled: false,
              menu: new Common.UI.Menu({
                cls: "shifted-right",
                menuAlign: "tl-tr",
                items: [
                  {
                    caption: this.textHorAxis,
                    value: "bShowHorAxTitle",
                    stopPropagation: true,
                    checkable: true,
                  },
                  {
                    caption: this.textVertAxis,
                    value: "bShowVertAxTitle",
                    stopPropagation: true,
                    checkable: true,
                  },
                  {
                    caption: this.textHorAxisSec,
                    value: "bShowHorAxTitleSec",
                    stopPropagation: true,
                    checkable: true,
                  },
                  {
                    caption: this.textVertAxisSec,
                    value: "bShowVertAxisTitleSec",
                    stopPropagation: true,
                    checkable: true,
                  },
                  {
                    caption: this.DepthAxis,
                    value: "bShowDepthAxesTitle",
                    stopPropagation: true,
                    checkable: true,
                  },
                ],
              }),
            },
            {
              caption: this.textChartTitle,
              value: "chartTitle",
              disabled: false,
              menu: new Common.UI.Menu({
                cls: "shifted-right",
                menuAlign: "tl-tr",
                items: [
                  {
                    caption: this.textNone,
                    value: "bShowChartTitleNone",
                    stopPropagation: true,
                    toggleGroup: "chartTitle",
                    checkable: true,
                  },
                  {
                    caption: this.textNoOverlay,
                    value: "bShowChartTitle",
                    stopPropagation: true,
                    toggleGroup: "chartTitle",
                    checkable: true,
                  },
                  {
                    caption: this.textOverlay,
                    value: "bOverlayTitle",
                    stopPropagation: true,
                    toggleGroup: "chartTitle",
                    checkable: true,
                  },
                ],
              }),
            },
            {
              caption: this.textDataLabels,
              value: "dataLabels",
              disabled: false,
              menu: new Common.UI.Menu({
                cls: "shifted-right",
                menuAlign: "tl-tr",
                items: [
                  {
                    caption: this.textNone,
                    value: "bShowDataLabels",
                    stopPropagation: true,
                    toggleGroup: "dataLabels",
                    checkable: true,
                  },
                  {
                    caption: this.textCenter,
                    value: "CenterData",
                    stopPropagation: true,
                    toggleGroup: "dataLabels",
                    checkable: true,
                  },
                  {
                    caption: this.textInnerBottom,
                    value: "InnerBottomData",
                    stopPropagation: true,
                    toggleGroup: "dataLabels",
                    checkable: true,
                  },
                  {
                    caption: this.textInnerTop,
                    value: "InnerTopData",
                    stopPropagation: true,
                    toggleGroup: "dataLabels",
                    checkable: true,
                  },
                  {
                    caption: this.textOuterTop,
                    value: "OuterTopData",
                    stopPropagation: true,
                    toggleGroup: "dataLabels",
                    checkable: true,
                  },
                  {
                    caption: this.textTop,
                    value: "TopData",
                    stopPropagation: true,
                    toggleGroup: "dataLabels",
                    checkable: true,
                  },
                  {
                    caption: this.textLeft,
                    value: "LeftData",
                    stopPropagation: true,
                    toggleGroup: "dataLabels",
                    checkable: true,
                  },
                  {
                    caption: this.textRight,
                    value: "RightData",
                    stopPropagation: true,
                    toggleGroup: "dataLabels",
                    checkable: true,
                  },
                  {
                    caption: this.textBottom,
                    value: "BottomData",
                    stopPropagation: true,
                    toggleGroup: "dataLabels",
                    checkable: true,
                  },
                  {
                    caption: this.textFit,
                    value: "FitWidthData",
                    stopPropagation: true,
                    toggleGroup: "dataLabels",
                    checkable: true,
                  },
                ],
              }),
            },
            // {
            //     caption: me.textDataTable,
            //     value: 'dataTable',
            //     disabled: false,
            //     menu: new Common.UI.Menu({
            //         cls: 'shifted-right',
            //         menuAlign: 'tl-tr',
            //         items: [
            //             {
            //                 caption: me.textNone,
            //                 value: 'bShowDataNone'
            //             },
            //             {
            //                 caption: me.textShowDataTable,
            //                 value: 'bShowDataTable'
            //             },
            //             {
            //                 caption: me.textShowLegendKeys,
            //                 value: 'bShowLegendKeys'
            //             }
            //         ]
            //     })
            // },
            {
              caption: this.textErrorBars,
              value: "errorBars",
              disabled: false,
              menu: new Common.UI.Menu({
                cls: "shifted-right",
                menuAlign: "tl-tr",
                items: [
                  {
                    caption: this.textNone,
                    value: "noneError",
                    stopPropagation: true,
                    disabled: false,
                  },
                  {
                    caption: this.textStandardError,
                    value: "standardError",
                    stopPropagation: true,
                    disabled: false,
                  },
                  {
                    caption: this.txtPercentage,
                    value: "percentage",
                    stopPropagation: true,
                    disabled: false,
                  },
                  {
                    caption: this.textStandardDeviation,
                    value: "standardDeviation",
                    stopPropagation: true,
                    disabled: false,
                  },
                ],
              }),
            },
            {
              caption: this.textGridLines,
              value: "gridLines",
              disabled: false,
              menu: new Common.UI.Menu({
                cls: "shifted-right",
                menuAlign: "tl-tr",
                items: [
                  {
                    caption: this.textHorizontalMajor,
                    value: "bShowHorMajor",
                    stopPropagation: true,
                    checkable: true,
                  },
                  {
                    caption: this.textVerticalMajor,
                    value: "bShowVerMajor",
                    stopPropagation: true,
                    checkable: true,
                  },
                  {
                    caption: this.textHorizontalMinor,
                    value: "bShowHorMinor",
                    stopPropagation: true,
                    checkable: true,
                  },
                  {
                    caption: this.textVerticalMinor,
                    value: "bShowVerMinor",
                    stopPropagation: true,
                    checkable: true,
                  },
                ],
              }),
            },
            {
              caption: this.textLegendPos,
              value: "legend",
              disabled: false,
              menu: new Common.UI.Menu({
                cls: "shifted-right",
                menuAlign: "tl-tr",
                items: [
                  {
                    caption: this.textNone,
                    value: "NoneLegend",
                    stopPropagation: true,
                    toggleGroup: "legend",
                    checkable: true,
                  },
                  {
                    caption: this.textTop,
                    value: "TopLegend",
                    stopPropagation: true,
                    toggleGroup: "legend",
                    checkable: true,
                  },
                  {
                    caption: this.textLeft,
                    value: "LeftLegend",
                    stopPropagation: true,
                    toggleGroup: "legend",
                    checkable: true,
                  },
                  {
                    caption: this.textRight,
                    value: "RightLegend",
                    stopPropagation: true,
                    toggleGroup: "legend",
                    checkable: true,
                  },
                  {
                    caption: this.textBottom,
                    value: "BottomLegend",
                    stopPropagation: true,
                    toggleGroup: "legend",
                    checkable: true,
                  },
                  {
                    caption: this.textLeftOverlay,
                    value: "LeftOverlay",
                    stopPropagation: true,
                    toggleGroup: "legend",
                    checkable: true,
                  },
                  {
                    caption: this.textRightOverlay,
                    value: "RightOverlay",
                    stopPropagation: true,
                    toggleGroup: "legend",
                    checkable: true,
                  },
                ],
              }),
            },
            {
              caption: this.textTrendline,
              value: "trendLines",
              disabled: false,
              menu: new Common.UI.Menu({
                cls: "shifted-right",
                menuAlign: "tl-tr",
                items: [
                  {
                    caption: this.textNone,
                    stopPropagation: true,
                    value: "trendLineNone",
                  },
                  {
                    caption: this.textLinear,
                    stopPropagation: true,
                    value: "trendLineLinear",
                  },
                  {
                    caption: this.textExponential,
                    stopPropagation: true,
                    value: "trendLineExponential",
                  },
                  {
                    caption: this.textLinearForecast,
                    stopPropagation: true,
                    value: "trendLineForecast",
                  },
                  {
                    caption: this.textMovingAverage,
                    stopPropagation: true,
                    value: "trendLineMovingAverage",
                  },
                ],
              }),
            },
            {
              caption: this.textUpDownBars,
              value: "upDownBars",
              disabled: false,
              menu: new Common.UI.Menu({
                cls: "shifted-right",
                menuAlign: "tl-tr",
                items: [
                  {
                    caption: this.textNone,
                    stopPropagation: true,
                    value: "bShowUpDownNone",
                  },
                  {
                    caption: this.textShowUpDown,
                    stopPropagation: true,
                    value: "bShowUpDownBars",
                  },
                ],
              }),
            },
          ],
        }),
      })

      this.menuChartEdit = new Common.UI.MenuItem({
        caption: this.editChartText,
      })

      this.menuParagraphVAlign = new Common.UI.MenuItem({
        caption: this.AlignText,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            (this.menuParagraphTop = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-top",
              caption: this.AlignTop,
              checkable: true,
              checkmark: false,
              toggleGroup: "popupparagraphvalign",
              value: Asc.c_oAscVAlign.Top,
            })),
            (this.menuParagraphCenter = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-middle",
              caption: this.AlignMiddle,
              checkable: true,
              checkmark: false,
              toggleGroup: "popupparagraphvalign",
              value: Asc.c_oAscVAlign.Center,
            })),
            (this.menuParagraphBottom = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-bottom",
              caption: this.AlignBottom,
              checkable: true,
              checkmark: false,
              toggleGroup: "popupparagraphvalign",
              value: Asc.c_oAscVAlign.Bottom,
            })),
            { caption: "--" },
            (this.menuParagraphLeft = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-left",
              caption: this.AlignLeft,
              checkable: true,
              checkmark: false,
              toggleGroup: "popupparagraphhalign",
              halign: 1,
            })),
            (this.menuParagraphHCenter = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-center",
              caption: this.AlignCenter,
              checkable: true,
              checkmark: false,
              toggleGroup: "popupparagraphhalign",
              halign: 2,
            })),
            (this.menuParagraphRight = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-right",
              caption: this.AlignRight,
              checkable: true,
              checkmark: false,
              toggleGroup: "popupparagraphhalign",
              halign: 0,
            })),
            (this.menuParagraphJust = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-just",
              caption: this.AlignJust,
              checkable: true,
              checkmark: false,
              toggleGroup: "popupparagraphhalign",
              halign: 3,
            })),
          ],
        }),
      })

      this.menuParagraphDirection = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-text-orient-hor",
        caption: this.directionText,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            (this.menuParagraphDirectH = new Common.UI.MenuItem({
              caption: this.directHText,
              iconCls: "menu__icon btn-text-orient-hor",
              checkable: true,
              checkmark: false,
              checked: false,
              toggleGroup: "popupparagraphdirect",
              direction: Asc.c_oAscVertDrawingText.normal,
            })),
            (this.menuParagraphDirect90 = new Common.UI.MenuItem({
              caption: this.direct90Text,
              iconCls: "menu__icon btn-text-orient-rdown",
              checkable: true,
              checkmark: false,
              checked: false,
              toggleGroup: "popupparagraphdirect",
              direction: Asc.c_oAscVertDrawingText.vert,
            })),
            (this.menuParagraphDirect270 = new Common.UI.MenuItem({
              caption: this.direct270Text,
              iconCls: "menu__icon btn-text-orient-rup",
              checkable: true,
              checkmark: false,
              checked: false,
              toggleGroup: "popupparagraphdirect",
              direction: Asc.c_oAscVertDrawingText.vert270,
            })),
          ],
        }),
      })

      const menuImgShapeSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.menuImgOriginalSize = new Common.UI.MenuItem({
        caption: this.originalSizeText,
      })

      this.menuImgReplace = new Common.UI.MenuItem({
        caption: this.textReplace,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            new Common.UI.MenuItem({
              caption: this.textFromFile,
              value: 0,
            }),
            new Common.UI.MenuItem({
              caption: this.textFromUrl,
              value: 1,
            }),
            new Common.UI.MenuItem({
              caption: this.textFromStorage,
              value: 2,
            }),
          ],
        }),
      })

      this.menuImgShapeRotate = new Common.UI.MenuItem({
        caption: this.textRotate,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            new Common.UI.MenuItem({
              iconCls: "menu__icon btn-rotate-90",
              caption: this.textRotate90,
              value: 1,
            }),
            new Common.UI.MenuItem({
              iconCls: "menu__icon btn-rotate-270",
              caption: this.textRotate270,
              value: 0,
            }),
            { caption: "--" },
            new Common.UI.MenuItem({
              iconCls: "menu__icon btn-flip-hor",
              caption: this.textFlipH,
              value: 1,
            }),
            new Common.UI.MenuItem({
              iconCls: "menu__icon btn-flip-vert",
              caption: this.textFlipV,
              value: 0,
            }),
          ],
        }),
      })

      this.menuImgCrop = new Common.UI.MenuItem({
        caption: this.textCrop,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            new Common.UI.MenuItem({
              caption: this.textCrop,
              checkable: true,
              allowDepress: true,
              value: 0,
            }),
            new Common.UI.MenuItem({
              caption: this.textCropFill,
              value: 1,
            }),
            new Common.UI.MenuItem({
              caption: this.textCropFit,
              value: 2,
            }),
          ],
        }),
      })

      this.menuImgResetCrop = new Common.UI.MenuItem({
        caption: this.textResetCrop,
        iconCls: "menu__icon btn-reset",
      })

      this.menuImgSaveAsPicture = new Common.UI.MenuItem({
        caption: this.textSaveAsPicture,
      })

      const menuImgSaveAsPictureSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      /** coauthoring begin **/
      this.menuAddCommentPara = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-add-comment",
        caption: this.addCommentText,
      })
      this.menuAddCommentPara.hide()

      this.menuAddCommentTable = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-add-comment",
        caption: this.addCommentText,
      })
      this.menuAddCommentTable.hide()

      this.menuAddCommentImg = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-add-comment",
        caption: this.addCommentText,
      })
      this.menuAddCommentImg.hide()
      /** coauthoring end **/

      this.menuParaCopy = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-copy",
        caption: this.textCopy,
        value: "copy",
      })

      this.menuParaPaste = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-paste",
        caption: this.textPaste,
        value: "paste",
      })

      this.menuParaCut = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-cut",
        caption: this.textCut,
        value: "cut",
      })

      this.menuImgCopy = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-copy",
        caption: this.textCopy,
        value: "copy",
      })

      this.menuImgPaste = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-paste",
        caption: this.textPaste,
        value: "paste",
      })

      this.menuImgCut = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-cut",
        caption: this.textCut,
        value: "cut",
      })

      this.menuTableCopy = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-copy",
        caption: this.textCopy,
        value: "copy",
      })

      this.menuTablePaste = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-paste",
        caption: this.textPaste,
        value: "paste",
      })

      this.menuTableCut = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-cut",
        caption: this.textCut,
        value: "cut",
      })

      const menuEquationSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      const menuTableEquationSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      const menuTableEquationSettingsSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.menuParagraphEquation = new Common.UI.MenuItem({
        caption: this.advancedEquationText,
        iconCls: "menu__icon btn-equation",
        menu: this.createEquationMenu("popupparaeqinput", "tl-tr"),
      })

      this.menuTableEquationSettings = new Common.UI.MenuItem({
        caption: this.advancedEquationText,
        iconCls: "menu__icon btn-equation",
        menu: this.createEquationMenu("popuptableeqinput", "tl-tr"),
      })

      this.menuImgEditPoints = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-edit-points",
        caption: this.textEditPoints,
      })

      this.textMenu = new Common.UI.Menu({
        cls: "shifted-right",
        scrollToCheckedItem: false,
        initMenu: (value) => {
          const isInShape = value.shapeProps && !_.isNull(value.shapeProps.value)
          const isInChart = value.chartProps && !_.isNull(value.chartProps.value)

          const disabled =
            value.paraProps?.locked ||
            value.slideProps?.locked ||
            (isInShape && value.shapeProps.locked)
          const isEquation = value.mathProps?.value
          this._currentParaObjDisabled = disabled

          this.menuParagraphVAlign.setVisible(isInShape && !isInChart && !isEquation) // после того, как заголовок можно будет растягивать по вертикали, вернуть "|| isInChart" !!
          this.menuParagraphDirection.setVisible(isInShape && !isInChart && !isEquation) // после того, как заголовок можно будет растягивать по вертикали, вернуть "|| isInChart" !!
          if (isInShape || isInChart) {
            const align = value.shapeProps.value.get_VerticalTextAlign()
            const halign = value.paraProps.value.get_Jc()
            this.menuParagraphTop.setChecked(align === Asc.c_oAscVAlign.Top)
            this.menuParagraphCenter.setChecked(align === Asc.c_oAscVAlign.Center)
            this.menuParagraphBottom.setChecked(align === Asc.c_oAscVAlign.Bottom)
            this.menuParagraphLeft.setChecked(halign === 1)
            this.menuParagraphHCenter.setChecked(halign === 2)
            this.menuParagraphRight.setChecked(halign === 0)
            this.menuParagraphJust.setChecked(halign === 3)

            const dir = value.shapeProps.value.get_Vert()
            let cls = ""
            switch (dir) {
              case Asc.c_oAscVertDrawingText.normal:
                cls = "menu__icon btn-text-orient-hor"
                break
              case Asc.c_oAscVertDrawingText.vert:
                cls = "menu__icon btn-text-orient-rdown"
                break
              case Asc.c_oAscVertDrawingText.vert270:
                cls = "menu__icon btn-text-orient-rup"
                break
            }
            this.menuParagraphDirection.setIconCls(cls)
            this.menuParagraphDirectH.setChecked(dir === Asc.c_oAscVertDrawingText.normal)
            this.menuParagraphDirect90.setChecked(dir === Asc.c_oAscVertDrawingText.vert)
            this.menuParagraphDirect270.setChecked(dir === Asc.c_oAscVertDrawingText.vert270)
          } else {
            this.menuParagraphVAlign.setIconCls("")
            this.menuParagraphDirection.setIconCls("")
          }
          this.menuParagraphVAlign.setDisabled(disabled)
          this.menuParagraphDirection.setDisabled(disabled)

          let text = null

          if (this.api) {
            text = this.api.can_AddHyperlink()
          }

          this.menuAddHyperlinkPara.setVisible(value.hyperProps === undefined && text !== false)
          menuHyperlinkPara.setVisible(value.hyperProps !== undefined)

          this.menuEditHyperlinkPara.hyperProps = value.hyperProps

          if (text !== false) {
            this.menuAddHyperlinkPara.hyperProps = {}
            this.menuAddHyperlinkPara.hyperProps.value = new Asc.CHyperlinkProperty()
            this.menuAddHyperlinkPara.hyperProps.value.put_Text(text)
          }

          /** coauthoring begin **/
          this.menuAddCommentPara.setVisible(
            !isInChart &&
              isInShape &&
              this.api.can_AddQuotedComment() !== false &&
              this.mode.canCoAuthoring &&
              this.mode.canComments,
          )
          /** coauthoring end **/

          menuCommentParaSeparator.setVisible(
            /** coauthoring begin **/ this.menuAddCommentPara.isVisible() ||
              /** coauthoring end **/ this.menuAddHyperlinkPara.isVisible() ||
              menuHyperlinkPara.isVisible(),
          )
          this.menuAddHyperlinkPara.setDisabled(disabled)
          menuHyperlinkPara.setDisabled(disabled)

          /** coauthoring begin **/
          this.menuAddCommentPara.setDisabled(disabled)
          /** coauthoring end **/

          this.menuParagraphAdvanced.setDisabled(disabled)
          const cancopy = this.api?.can_CopyCut()
          this.menuParaCopy.setDisabled(!cancopy)
          this.menuParaCut.setDisabled(disabled || !cancopy)
          this.menuParaPaste.setDisabled(disabled)

          // spellCheck
          const spell =
            value.spellProps !== undefined && value.spellProps.value.get_Checked() === false
          this.menuSpellPara.setVisible(spell)
          menuSpellcheckParaSeparator.setVisible(spell)
          this.menuIgnoreSpellPara.setVisible(spell)
          this.menuIgnoreAllSpellPara.setVisible(spell)
          this.menuToDictionaryPara.setVisible(spell && this.mode.isDesktopApp)
          this.langParaMenu.setVisible(spell)
          this.langParaMenu.setDisabled(disabled)
          menuIgnoreSpellParaSeparator.setVisible(spell)

          if (
            spell &&
            value.spellProps.value.get_Variants() !== null &&
            value.spellProps.value.get_Variants() !== undefined
          ) {
            this.addWordVariants(true)
          } else {
            this.menuSpellPara.setCaption(this.loadSpellText)
            this.clearWordVariants(true)
            this.menuSpellMorePara.setVisible(false)
          }
          if (this.langParaMenu.isVisible() && this._currLang.id !== this._currLang.paraid) {
            this.changeLanguageMenu(this.langParaMenu.menu)
            this._currLang.paraid = this._currLang.id
          }

          //equation menu
          let eqlen = 0
          if (isEquation) {
            eqlen = this.addEquationMenu(this.textMenu, 12)
          } else this.clearEquationMenu(this.textMenu, 12)
          menuEquationSeparator.setVisible(isEquation && eqlen > 0)

          this.menuParagraphEquation.setVisible(isEquation)
          this.menuParagraphEquation.setDisabled(disabled)
          if (isEquation) {
            const eq = this.api.asc_GetMathInputType()
            const isEqToolbarHide = Common.Utils.InternalSettings.get("pe-equation-toolbar-hide")

            this.menuParagraphEquation.menu.items[5].setChecked(
              eq === Asc.c_oAscMathInputType.Unicode,
            )
            this.menuParagraphEquation.menu.items[6].setChecked(
              eq === Asc.c_oAscMathInputType.LaTeX,
            )
            this.menuParagraphEquation.menu.items[8].options.isToolbarHide = isEqToolbarHide
            this.menuParagraphEquation.menu.items[8].setCaption(
              isEqToolbarHide ? this.showEqToolbar : this.hideEqToolbar,
            )
          }
        },
        items: [
          this.menuSpellPara,
          this.menuSpellMorePara,
          menuSpellcheckParaSeparator,
          this.menuIgnoreSpellPara,
          this.menuIgnoreAllSpellPara,
          this.menuToDictionaryPara,
          this.langParaMenu,
          menuIgnoreSpellParaSeparator,
          this.menuParaCut,
          this.menuParaCopy,
          this.menuParaPaste,
          menuEquationSeparator,
          { caption: "--" },
          this.menuParagraphVAlign,
          this.menuParagraphDirection,
          this.menuParagraphAdvanced,
          this.menuParagraphEquation,
          menuCommentParaSeparator,
          /** coauthoring begin **/
          this.menuAddCommentPara,
          /** coauthoring end **/
          this.menuAddHyperlinkPara,
          menuHyperlinkPara,
        ],
      }).on("hide:after", (menu, e, isFromInputControl) => {
        this.clearCustomItems(menu)
        this.currentMenu = null
        if (this.suppressEditComplete) {
          this.suppressEditComplete = false
          return
        }

        if (!isFromInputControl) this.fireEvent("editcomplete", this)
      })

      this.tableMenu = new Common.UI.Menu({
        cls: "shifted-right",
        restoreHeightAndTop: true,
        scrollToCheckedItem: false,
        initMenu: (value) => {
          // table properties
          if (_.isUndefined(value.tableProps)) return

          const isEquation = value.mathProps?.value
          for (let i = 6; i < 19; i++) {
            this.tableMenu.items[i].setVisible(!isEquation)
          }

          const disabled = value.slideProps?.locked

          const align = value.tableProps.value.get_CellsVAlign()
          const halign = value.paraProps.value.get_Jc()
          this.menuTableCellTop.setChecked(align === Asc.c_oAscVertAlignJc.Top)
          this.menuTableCellCenter.setChecked(align === Asc.c_oAscVertAlignJc.Center)
          this.menuTableCellBottom.setChecked(align === Asc.c_oAscVertAlignJc.Bottom)
          this.menuTableCellLeft.setChecked(halign === 1)
          this.menuTableCellHCenter.setChecked(halign === 2)
          this.menuTableCellRight.setChecked(halign === 0)
          this.menuTableCellJust.setChecked(halign === 3)

          const dir = value.tableProps.value.get_CellsTextDirection()
          let cls = ""
          switch (dir) {
            case Asc.c_oAscCellTextDirection.LRTB:
              cls = "menu__icon btn-text-orient-hor"
              break
            case Asc.c_oAscCellTextDirection.TBRL:
              cls = "menu__icon btn-text-orient-rdown"
              break
            case Asc.c_oAscCellTextDirection.BTLR:
              cls = "menu__icon btn-text-orient-rup"
              break
          }
          this.menuTableDirection.setIconCls(cls)
          this.menuTableDirectH.setChecked(dir === Asc.c_oAscCellTextDirection.LRTB)
          this.menuTableDirect90.setChecked(dir === Asc.c_oAscCellTextDirection.TBRL)
          this.menuTableDirect270.setChecked(dir === Asc.c_oAscCellTextDirection.BTLR)

          if (this.api) {
            this.mnuTableMerge.setDisabled(
              value.tableProps.locked || disabled || !this.api.CheckBeforeMergeCells(),
            )
            this.mnuTableSplit.setDisabled(
              value.tableProps.locked || disabled || !this.api.CheckBeforeSplitCells(),
            )
          }

          this.menuTableDistRows.setDisabled(value.tableProps.locked || disabled)
          this.menuTableDistCols.setDisabled(value.tableProps.locked || disabled)

          this.menuTableInsertText.setDisabled(value.tableProps.locked || disabled)
          this.menuTableDeleteText.setDisabled(value.tableProps.locked || disabled)
          this.menuTableDirection.setDisabled(value.tableProps.locked || disabled)

          this.menuTableCellAlign.setDisabled(value.tableProps.locked || disabled)

          this.menuTableSaveAsPicture.setVisible(!isEquation)
          menuTableSaveAsPictureSeparator.setVisible(!isEquation)

          this.menuTableAdvanced.setVisible(!isEquation)
          this.menuTableAdvanced.setDisabled(value.tableProps.locked || disabled)
          menuTableSettingsSeparator.setVisible(this.menuTableAdvanced.isVisible())

          const cancopy = this.api?.can_CopyCut()
          this.menuTableCopy.setDisabled(!cancopy)
          this.menuTableCut.setDisabled(value.tableProps.locked || disabled || !cancopy)
          this.menuTablePaste.setDisabled(value.tableProps.locked || disabled)

          // hyperlink properties
          let text = null

          if (this.api) {
            text = this.api.can_AddHyperlink()
          }

          this.menuAddHyperlinkTable.setVisible(
            !_.isUndefined(value.paraProps) && _.isUndefined(value.hyperProps) && text !== false,
          )
          menuHyperlinkTable.setVisible(
            !_.isUndefined(value.paraProps) && !_.isUndefined(value.hyperProps),
          )

          this.menuEditHyperlinkTable.hyperProps = value.hyperProps

          if (text !== false) {
            this.menuAddHyperlinkTable.hyperProps = {}
            this.menuAddHyperlinkTable.hyperProps.value = new Asc.CHyperlinkProperty()
            this.menuAddHyperlinkTable.hyperProps.value.put_Text(text)
          }
          if (!_.isUndefined(value.paraProps)) {
            this.menuAddHyperlinkTable.setDisabled(value.paraProps.locked || disabled)
            menuHyperlinkTable.setDisabled(value.paraProps.locked || disabled)
            this._currentParaObjDisabled = value.paraProps.locked || disabled
          }

          /** coauthoring begin **/
          this.menuAddCommentTable.setVisible(
            this.api.can_AddQuotedComment() !== false &&
              this.mode.canCoAuthoring &&
              this.mode.canComments,
          )
          this.menuAddCommentTable.setDisabled(
            (!_.isUndefined(value.paraProps) && value.paraProps.locked) || disabled,
          )
          /** coauthoring end **/

          this.menuSpellCheckTable.setVisible(
            value.spellProps !== undefined && value.spellProps.value.get_Checked() === false,
          )
          this.menuToDictionaryTable.setVisible(this.mode.isDesktopApp)
          menuSpellcheckTableSeparator.setVisible(
            value.spellProps !== undefined && value.spellProps.value.get_Checked() === false,
          )

          this.langTableMenu.setDisabled(disabled)
          if (
            value.spellProps !== undefined &&
            value.spellProps.value.get_Checked() === false &&
            value.spellProps.value.get_Variants() !== null &&
            value.spellProps.value.get_Variants() !== undefined
          ) {
            this.addWordVariants(false)
          } else {
            this.menuSpellTable.setCaption(this.loadSpellText)
            this.clearWordVariants(false)
            this.menuSpellMoreTable.setVisible(false)
          }

          if (
            this.menuSpellCheckTable.isVisible() &&
            this._currLang.id !== this._currLang.tableid
          ) {
            this.changeLanguageMenu(this.langTableMenu.menu)
            this._currLang.tableid = this._currLang.id
          }

          //equation menu
          let eqlen = 0
          if (isEquation) {
            eqlen = this.addEquationMenu(this.tableMenu, 6)
          } else this.clearEquationMenu(this.tableMenu, 6)

          menuTableEquationSeparator.setVisible(eqlen > 0)
          this.menuTableEquationSettings.setVisible(isEquation)
          menuTableEquationSettingsSeparator.setVisible(isEquation)
          this.menuTableEquationSettings.setDisabled(disabled)
          if (isEquation) {
            const eq = this.api.asc_GetMathInputType()
            const isEqToolbarHide = Common.Utils.InternalSettings.get("pe-equation-toolbar-hide")

            this.menuTableEquationSettings.menu.items[5].setChecked(
              eq === Asc.c_oAscMathInputType.Unicode,
            )
            this.menuTableEquationSettings.menu.items[6].setChecked(
              eq === Asc.c_oAscMathInputType.LaTeX,
            )
            this.menuTableEquationSettings.menu.items[8].options.isToolbarHide = isEqToolbarHide
            this.menuTableEquationSettings.menu.items[8].setCaption(
              isEqToolbarHide ? this.showEqToolbar : this.hideEqToolbar,
            )
          }
        },
        items: [
          this.menuSpellCheckTable, //0
          menuSpellcheckTableSeparator, //1
          this.menuTableCut, //2
          this.menuTableCopy, //3
          this.menuTablePaste, //4
          { caption: "--" }, //5
          this.menuTableSelectText, //6
          this.menuTableInsertText, //7
          this.menuTableDeleteText, //8
          { caption: "--" }, //9
          this.mnuTableMerge, //10
          this.mnuTableSplit, //11
          { caption: "--" }, //12
          this.menuTableDistRows, //13
          this.menuTableDistCols, //14
          { caption: "--" }, //15
          this.menuTableCellAlign, //16
          this.menuTableDirection, //17
          { caption: "--" }, //18
          menuTableEquationSeparator, //19
          this.menuTableSaveAsPicture, //20
          menuTableSaveAsPictureSeparator, //21
          this.menuTableAdvanced, //22
          menuTableSettingsSeparator, //23
          this.menuTableEquationSettings, //24
          menuTableEquationSettingsSeparator, //25
          /** coauthoring begin **/
          this.menuAddCommentTable, //26
          /** coauthoring end **/
          this.menuAddHyperlinkTable, //27
          menuHyperlinkTable, //28
        ],
      }).on("hide:after", (menu, e, isFromInputControl) => {
        this.clearCustomItems(menu)
        this.currentMenu = null
        if (this.suppressEditComplete) {
          this.suppressEditComplete = false
          return
        }

        if (!isFromInputControl) this.fireEvent("editcomplete", this)
      })

      this.menuEditObjectSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.menuEditObject = new Common.UI.MenuItem({
        caption: this.textEditObject,
      })

      const menuHyperlinkPicSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.menuAddHyperlinkPic = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-inserthyperlink",
        caption: this.hyperlinkText,
      })

      this.menuEditHyperlinkPic = new Common.UI.MenuItem({
        caption: this.editHyperlinkText,
      })

      this.menuRemoveHyperlinkPic = new Common.UI.MenuItem({
        caption: this.removeHyperlinkText,
      })

      const menuHyperlinkPic = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-inserthyperlink",
        caption: this.hyperlinkText,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [this.menuEditHyperlinkPic, this.menuRemoveHyperlinkPic],
        }),
      })

      this.pictureMenu = new Common.UI.Menu({
        cls: "shifted-right",
        restoreHeightAndTop: true,
        scrollToCheckedItem: false,
        initMenu: (value) => {
          if (this.api) {
            this.mnuUnGroupImg.setDisabled(!this.api.canUnGroup())
            this.mnuGroupImg.setDisabled(!this.api.canGroup())
          }

          const isimage =
            (_.isUndefined(value.shapeProps) || value.shapeProps.value.get_FromImage()) &&
            _.isUndefined(value.chartProps)
          const imgdisabled = value.imgProps?.locked
          const shapedisabled = value.shapeProps?.locked
          const chartdisabled = value.chartProps?.locked
          const disabled = imgdisabled || shapedisabled || chartdisabled || value.slideProps?.locked
          const pluginGuid = value.imgProps ? value.imgProps.value.asc_getPluginGuid() : null
          const inSmartartInternal = value.shapeProps?.value.get_FromSmartArtInternal()

          const pluginGuidAvailable = pluginGuid !== null && pluginGuid !== undefined
          this.menuEditObject.setVisible(pluginGuidAvailable)
          this.menuEditObjectSeparator.setVisible(pluginGuidAvailable)

          if (pluginGuidAvailable) {
            const plugin = PE.getCollection("Common.Collections.Plugins").findWhere({
              guid: pluginGuid,
            })
            this.menuEditObject.setDisabled(
              (!this.api.asc_canEditTableOleObject() &&
                (plugin === null || plugin === undefined)) ||
                disabled,
            )
          }

          this.mnuArrangeFront.setDisabled(inSmartartInternal)
          this.mnuArrangeBack.setDisabled(inSmartartInternal)
          this.mnuArrangeForward.setDisabled(inSmartartInternal)
          this.mnuArrangeBackward.setDisabled(inSmartartInternal)

          this.menuImgShapeRotate.setVisible(
            _.isUndefined(value.chartProps) && (pluginGuid === null || pluginGuid === undefined),
          )
          if (this.menuImgShapeRotate.isVisible()) {
            this.menuImgShapeRotate.setDisabled(
              disabled || value.shapeProps?.value.get_FromSmartArt(),
            )
            this.menuImgShapeRotate.menu.items[3].setDisabled(inSmartartInternal)
            this.menuImgShapeRotate.menu.items[4].setDisabled(inSmartartInternal)
          }

          // image properties
          this.menuImgOriginalSize.setVisible(isimage)
          if (this.menuImgOriginalSize.isVisible())
            this.menuImgOriginalSize.setDisabled(
              disabled ||
                _.isNull(value.imgProps.value.get_ImageUrl()) ||
                _.isUndefined(value.imgProps.value.get_ImageUrl()),
            )

          this.menuImgReplace.setVisible(
            isimage && (pluginGuid === null || pluginGuid === undefined),
          )
          if (this.menuImgReplace.isVisible())
            this.menuImgReplace.setDisabled(disabled || pluginGuid === null)
          this.menuImgReplace.menu.items[2].setVisible(
            this.mode.canRequestInsertImage ||
              (this.mode.fileChoiceUrl && this.mode.fileChoiceUrl.indexOf("{documentType}") > -1),
          )

          this.menuImgCrop.setVisible(this.api.asc_canEditCrop())
          if (this.menuImgCrop.isVisible()) this.menuImgCrop.setDisabled(disabled)

          this.menuImgResetCrop.setVisible(isimage && value.imgProps.value.asc_getIsCrop())
          if (this.menuImgResetCrop.isVisible()) this.menuImgResetCrop.setDisabled(disabled)

          const canEditPoints = this.api?.asc_canEditGeometry()
          this.menuImgEditPoints.setVisible(canEditPoints)
          canEditPoints && this.menuImgEditPoints.setDisabled(disabled)

          this.menuImageAdvanced.setVisible(isimage)
          this.menuShapeAdvanced.setVisible(
            _.isUndefined(value.imgProps) && _.isUndefined(value.chartProps),
          )
          this.menuChartEdit.setVisible(
            _.isUndefined(value.imgProps) &&
              !_.isUndefined(value.chartProps) &&
              (_.isUndefined(value.shapeProps) || value.shapeProps.isChart),
          )
          this.menuChartAdvanced.setVisible(
            _.isUndefined(value.imgProps) &&
              !_.isUndefined(value.chartProps) &&
              (_.isUndefined(value.shapeProps) || value.shapeProps.isChart),
          )
          menuImgShapeSeparator.setVisible(
            this.menuImageAdvanced.isVisible() ||
              this.menuShapeAdvanced.isVisible() ||
              this.menuChartEdit.isVisible() ||
              this.menuChartAdvanced.isVisible(),
          )
          menuAdvancedSettingsSeparator.setVisible(
            this.menuImgCrop.isVisible() ||
              this.menuImgOriginalSize.isVisible() ||
              this.menuImgReplace.isVisible() ||
              this.menuImageAdvanced.isVisible() ||
              this.menuImgEditPoints.isVisible() ||
              this.menuShapeAdvanced.isVisible() ||
              this.menuChartEdit.isVisible() ||
              this.menuChartAdvanced.isVisible(),
          )

          /** coauthoring begin **/
          this.menuAddCommentImg.setVisible(
            this.api.can_AddQuotedComment() !== false &&
              this.mode.canCoAuthoring &&
              this.mode.canComments,
          )
          this.menuAddCommentImg.setDisabled(disabled)
          /** coauthoring end **/
          this.menuImgShapeAlign.setDisabled(disabled)
          if (!disabled) {
            const objcount = this.api.asc_getSelectedDrawingObjectsCount()
            const slide_checked = Common.Utils.InternalSettings.get("pe-align-to-slide") || false
            this.menuImgShapeAlign.menu.items[7].setDisabled(objcount === 2 && !slide_checked)
            this.menuImgShapeAlign.menu.items[8].setDisabled(objcount === 2 && !slide_checked)
          }
          this.menuShapesMerge.setDisabled(disabled || !this.api.asc_canMergeSelectedShapes())
          if (!this.menuShapesMerge.isDisabled()) {
            this.menuShapesMerge.menu.items.forEach((item) => {
              item.setDisabled(!this.api.asc_canMergeSelectedShapes(item.value))
            })
          }
          this.menuImageAdvanced.setDisabled(disabled)
          this.menuShapeAdvanced.setDisabled(disabled)
          this.menuChartAdvanced.setDisabled(disabled)
          if (this.menuChartEdit.isVisible()) this.menuChartEdit.setDisabled(disabled)

          const cancopy = this.api?.can_CopyCut()
          this.menuImgCopy.setDisabled(!cancopy)
          this.menuImgCut.setDisabled(disabled || !cancopy)
          this.menuImgPaste.setDisabled(disabled)
          menuImgShapeArrange.setDisabled(disabled)

          let text = null
          if (this.api) {
            text = this.api.can_AddHyperlink()
          }
          this.menuAddHyperlinkPic.setVisible(value.hyperProps === undefined && text !== false)
          menuHyperlinkPic.setVisible(value.hyperProps !== undefined)
          menuHyperlinkPicSeparator.setVisible(
            this.menuAddHyperlinkPic.isVisible() || menuHyperlinkPic.isVisible(),
          )
          this.menuEditHyperlinkPic.hyperProps = value.hyperProps
          this.menuRemoveHyperlinkPic.hyperProps = value.hyperProps
          if (text !== false) {
            this.menuAddHyperlinkPic.hyperProps = {}
            this.menuAddHyperlinkPic.hyperProps.value = new Asc.CHyperlinkProperty()
            this.menuAddHyperlinkPic.hyperProps.value.put_Text(text)
          }
          this.menuAddHyperlinkPic.setDisabled(disabled)
          menuHyperlinkPic.setDisabled(
            disabled ||
              (value.hyperProps !== undefined && value.hyperProps.isSeveralLinks === true),
          )
        },
        items: [
          this.menuImgCut,
          this.menuImgCopy,
          this.menuImgPaste,
          this.menuEditObjectSeparator,
          this.menuEditObject,
          { caption: "--" }, //Separator
          menuImgShapeArrange,
          this.menuImgShapeAlign,
          this.menuShapesMerge,
          this.menuImgShapeRotate,
          menuImgShapeSeparator, //Separator
          this.menuImgSaveAsPicture,
          menuImgSaveAsPictureSeparator, //Separator
          this.menuAddHyperlinkPic,
          menuHyperlinkPic,
          menuHyperlinkPicSeparator,
          this.menuImgCrop,
          this.menuImgResetCrop,
          this.menuImgOriginalSize,
          this.menuImgReplace,
          this.menuImageAdvanced,
          this.menuImgEditPoints,
          this.menuShapeAdvanced,
          this.menuChartEdit,
          this.menuChartAdvanced,
          menuAdvancedSettingsSeparator, //Separator
          /** coauthoring begin **/
          this.menuAddCommentImg,
        ],
      }).on("hide:after", (menu, e, isFromInputControl) => {
        this.clearCustomItems(menu)
        this.currentMenu = null
        if (this.suppressEditComplete) {
          this.suppressEditComplete = false
          return
        }

        if (!isFromInputControl) this.fireEvent("editcomplete", this)
      })

      this.menuAnimStartOnClick = new Common.UI.MenuItem({
        caption: this.textStartOnClick,
        checkable: true,
        value: AscFormat.NODE_TYPE_CLICKEFFECT,
      })

      this.menuAnimStartWithPrevious = new Common.UI.MenuItem({
        caption: this.textStartWithPrevious,
        checkable: true,
        value: AscFormat.NODE_TYPE_WITHEFFECT,
      })

      this.menuAnimStartAfterPrevious = new Common.UI.MenuItem({
        caption: this.textStartAfterPrevious,
        checkable: true,
        value: AscFormat.NODE_TYPE_AFTEREFFECT,
      })

      this.menuAnimRemove = new Common.UI.MenuItem({
        caption: this.textRemove,
        value: "remove",
      })

      this.animEffectMenu = new Common.UI.Menu({
        restoreHeightAndTop: true,
        scrollToCheckedItem: false,
        style: "min-width: auto;",
        initMenu: (value) => {
          this.menuAnimStartOnClick.setChecked(
            value.effect === AscFormat.NODE_TYPE_CLICKEFFECT,
            true,
          )
          this.menuAnimStartWithPrevious.setChecked(
            value.effect === AscFormat.NODE_TYPE_WITHEFFECT,
            true,
          )
          this.menuAnimStartAfterPrevious.setChecked(
            value.effect === AscFormat.NODE_TYPE_AFTEREFFECT,
            true,
          )
        },
        items: [
          this.menuAnimStartOnClick,
          this.menuAnimStartWithPrevious,
          this.menuAnimStartAfterPrevious,
          { caption: "--" },
          this.menuAnimRemove,
        ],
      }).on("hide:after", (menu, e, isFromInputControl) => {
        this.clearCustomItems(menu)
        this.currentMenu = null
        if (this.suppressEditComplete) {
          this.suppressEditComplete = false
          return
        }

        if (!isFromInputControl) this.fireEvent("editcomplete", this)
      })

      const shortcutHints = {}
      const nextpage = $("#id_buttonNextPage")
      nextpage.attr("data-toggle", "tooltip")
      shortcutHints.GoToNextSlide = {
        label: this.textNextPage,
        applyCallback: (item, hintText) => {
          nextpage.tooltip({
            title: hintText,
            placement: "top-right",
          })
        },
      }

      const prevpage = $("#id_buttonPrevPage")
      prevpage.attr("data-toggle", "tooltip")
      shortcutHints.GoToPreviousSlide = {
        label: this.textPrevPage,
        applyCallback: (item, hintText) => {
          nextpage.tooltip({
            title: hintText,
            placement: "top-right",
          })
        },
      }
      PE.getController("Common.Controllers.Shortcuts").updateShortcutHints(shortcutHints)

      this.fireEvent("createdelayedelements", [this, "edit"])
    }
  }
})
