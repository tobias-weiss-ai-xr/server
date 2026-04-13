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
  if (window.PDFE?.Views?.DocumentHolder) {
    const dh = window.PDFE.Views.DocumentHolder.prototype

    dh.createDelayedElementsPDFViewer = function () {
      if (this.menuPDFViewCopy) return // menu is already inited

      this.menuPDFViewCopy = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-copy",
        caption: this.textCopy,
        value: "copy",
      })

      this.menuAddComment = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-add-comment",
        caption: this.addCommentText,
      })

      this.menuRemoveComment = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-cc-remove",
        caption: this.removeCommentText,
      })

      this.viewPDFModeMenu = new Common.UI.Menu({
        cls: "shifted-right",
        initMenu: (value) => {
          const disabled = value.pageProps?.locked
          this.menuPDFViewCopy.setDisabled(!this.api?.can_CopyCut())
          this.menuAddComment.setVisible(this.mode?.canComments)
          this.menuAddComment.setDisabled(disabled)
          this.menuRemoveComment.setVisible(value?.annotProps?.value)
          this.menuRemoveComment.setDisabled(disabled)
        },
        items: [this.menuPDFViewCopy, this.menuAddComment, this.menuRemoveComment],
      }).on("hide:after", (menu, e, isFromInputControl) => {
        this.clearCustomItems(menu)
        this.currentMenu = null
        if (this.suppressEditComplete) {
          this.suppressEditComplete = false
          return
        }

        if (!isFromInputControl) this.fireEvent("editcomplete", this)
      })

      this.menuViewCopyPage = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-copy",
        caption: this.textCopy,
        value: "copy",
      })

      this.viewPageMenu = new Common.UI.Menu({
        cls: "shifted-right",
        initMenu: (value) => {
          if (value) this.options.eventProps = value
          else value = this.options.eventProps
          value && this.menuViewCopyPage.setDisabled(value.isPageSelect !== true)
        },
        items: [this.menuViewCopyPage],
      }).on("hide:after", (menu, e, isFromInputControl) => {
        this.clearCustomItems(menu)
        this.currentMenu = null
        if (this.suppressEditComplete) {
          this.suppressEditComplete = false
          return
        }

        if (!isFromInputControl) this.fireEvent("editcomplete", this)
      })

      this.fireEvent("createdelayedelements", [this, "pdf"])
    }

    dh.createDelayedElementsPDFEditor = function () {
      if (this.menuPDFEditCopy) return // menu is already inited

      this.menuPDFEditCopy = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-copy",
        caption: this.textCopy,
        value: "copy",
      })

      this.menuEditAddComment = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-add-comment",
        caption: this.addCommentText,
      })

      this.menuEditRemoveComment = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-cc-remove",
        caption: this.removeCommentText,
      })

      this.menuPDFEditHyperlink = new Common.UI.MenuItem({
        caption: this.editHyperlinkText,
      })

      this.editPDFModeMenu = new Common.UI.Menu({
        cls: "shifted-right",
        initMenu: (value) => {
          const disabled = value.pageProps?.locked
          this.menuPDFEditCopy.setDisabled(!this.api?.can_CopyCut())
          this.menuEditAddComment.setVisible(this.mode?.canComments)
          this.menuEditAddComment.setDisabled(disabled)
          this.menuEditRemoveComment.setVisible(value?.annotProps?.value)
          this.menuEditRemoveComment.setDisabled(disabled)

          this.menuPDFEditHyperlink.setVisible(
            value.annotProps?.value &&
              value.annotProps.value.asc_getType() === AscPDF.ANNOTATIONS_TYPES.Link &&
              !_.isUndefined(value.hyperProps),
          )
          this.menuPDFEditHyperlink.setDisabled(disabled)
          this.menuPDFEditHyperlink.hyperProps = value.hyperProps
          this.menuPDFEditHyperlink.annotProps = value.annotProps
        },
        items: [
          this.menuPDFEditCopy,
          this.menuEditAddComment,
          this.menuPDFEditHyperlink,
          this.menuEditRemoveComment,
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

      // Table
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

      this.menuTableAdvanced = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-menu-table",
        caption: this.advancedTableText,
      })

      const menuTableSettingsSeparator = new Common.UI.MenuItem({
        caption: "--",
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

      this.menuAddCommentTable = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-add-comment",
        caption: this.addCommentText,
      })
      this.menuAddCommentTable.hide()

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

      const menuTableEquationSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      const menuTableEquationSettingsSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.menuTableEquationSettings = new Common.UI.MenuItem({
        caption: this.advancedEquationText,
        iconCls: "menu__icon btn-equation",
        menu: this.createEquationMenu("popuptableeqinput", "tl-tr"),
      })

      this.tableMenu = new Common.UI.Menu({
        cls: "shifted-right",
        restoreHeightAndTop: true,
        scrollToCheckedItem: false,
        initMenu: (value) => {
          // table properties
          if (_.isUndefined(value.tableProps)) return

          const isEquation = value.mathProps?.value
          for (let i = 4; i < 16; i++) {
            this.tableMenu.items[i].setVisible(!isEquation)
          }

          const align = value.tableProps.value.get_CellsVAlign()
          const halign = value.paraProps.value.get_Jc()
          this.menuTableCellTop.setChecked(align === Asc.c_oAscVertAlignJc.Top)
          this.menuTableCellCenter.setChecked(align === Asc.c_oAscVertAlignJc.Center)
          this.menuTableCellBottom.setChecked(align === Asc.c_oAscVertAlignJc.Bottom)
          this.menuTableCellLeft.setChecked(halign === 1)
          this.menuTableCellHCenter.setChecked(halign === 2)
          this.menuTableCellRight.setChecked(halign === 0)
          this.menuTableCellJust.setChecked(halign === 3)

          if (this.api) {
            this.mnuTableMerge.setDisabled(
              value.tableProps.locked || !this.api.CheckBeforeMergeCells(),
            )
            this.mnuTableSplit.setDisabled(
              value.tableProps.locked || !this.api.CheckBeforeSplitCells(),
            )
          }
          this.menuTableDistRows.setDisabled(value.tableProps.locked)
          this.menuTableDistCols.setDisabled(value.tableProps.locked)

          this.tableMenu.items[5].setDisabled(value.tableProps.locked)
          this.tableMenu.items[6].setDisabled(value.tableProps.locked)

          this.menuTableCellAlign.setDisabled(value.tableProps.locked)

          this.menuTableSaveAsPicture.setVisible(!isEquation)
          menuTableSaveAsPictureSeparator.setVisible(!isEquation)

          this.menuTableAdvanced.setVisible(!isEquation)
          this.menuTableAdvanced.setDisabled(value.tableProps.locked)
          menuTableSettingsSeparator.setVisible(this.menuTableAdvanced.isVisible())

          const cancopy = this.api?.can_CopyCut()
          this.menuTableCopy.setDisabled(!cancopy)
          this.menuTableCut.setDisabled(value.tableProps.locked || !cancopy)
          this.menuTablePaste.setDisabled(value.tableProps.locked)

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
            this.menuAddHyperlinkTable.setDisabled(value.paraProps.locked)
            menuHyperlinkTable.setDisabled(value.paraProps.locked)
            this._currentParaObjDisabled = value.paraProps.locked
          }

          this.menuAddCommentTable.setVisible(this.mode?.canComments)

          //equation menu
          let eqlen = 0
          if (isEquation) {
            eqlen = this.addEquationMenu(this.tableMenu, 4)
          } else this.clearEquationMenu(this.tableMenu, 4)

          menuTableEquationSeparator.setVisible(eqlen > 0)
          this.menuTableEquationSettings.setVisible(isEquation)
          menuTableEquationSettingsSeparator.setVisible(isEquation)
          if (isEquation) {
            const eq = this.api.asc_GetMathInputType()
            const isEqToolbarHide = Common.Utils.InternalSettings.get("pdfe-equation-toolbar-hide")

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
          this.menuTableCut, //0
          this.menuTableCopy, //1
          this.menuTablePaste, //2
          { caption: "--" }, //3
          this.menuTableSelectText, //4
          this.menuTableInsertText, //5
          this.menuTableDeleteText, //6
          { caption: "--" }, //7
          this.mnuTableMerge, //8
          this.mnuTableSplit, //9
          { caption: "--" }, //10
          this.menuTableDistRows, //11
          this.menuTableDistCols, //12
          { caption: "--" }, //13
          this.menuTableCellAlign, //14
          { caption: "--" }, //15
          menuTableEquationSeparator, //16
          this.menuTableSaveAsPicture, //17
          menuTableSaveAsPictureSeparator, //18
          this.menuTableAdvanced, //19
          menuTableSettingsSeparator, //20
          this.menuTableEquationSettings, //21
          menuTableEquationSettingsSeparator, //22
          /** coauthoring begin **/
          this.menuAddCommentTable, //23
          /** coauthoring end **/
          this.menuAddHyperlinkTable, //24
          menuHyperlinkTable,
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

      // Image
      this.menuImageAdvanced = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-menu-image",
        caption: this.advancedImageText,
      })

      this.menuShapeAdvanced = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-menu-shape",
        caption: this.advancedShapeText,
      })

      const menuAdvancedSettingsSeparator = new Common.UI.MenuItem({
        caption: "--",
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
            // {caption: '--'},
            // me.mnuGroupImg,
            // me.mnuUnGroupImg
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

      const _toolbar_view = PDFE.getController("Toolbar").getView("Toolbar")
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

      this.menuAddCommentImg = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-add-comment",
        caption: this.addCommentText,
      })
      this.menuAddCommentImg.hide()

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

      this.menuImgEditPoints = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-edit-points",
        caption: this.textEditPoints,
      })

      this.menuChartEdit = new Common.UI.MenuItem({
        caption: this.editChartText,
      })

      this.menuChartAdvanced = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-menu-chart",
        caption: this.advancedChartText,
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
          const disabled = imgdisabled || shapedisabled || chartdisabled
          const pluginGuid = value.imgProps ? value.imgProps.value.asc_getPluginGuid() : null
          const inSmartartInternal = value.shapeProps?.value.get_FromSmartArtInternal()
          let lastSeparator = menuImgSaveAsPictureSeparator

          this.mnuArrangeFront.setDisabled(inSmartartInternal)
          this.mnuArrangeBack.setDisabled(inSmartartInternal)
          this.mnuArrangeForward.setDisabled(inSmartartInternal)
          this.mnuArrangeBackward.setDisabled(inSmartartInternal)

          this.menuImgShapeRotate.setVisible(
            _.isUndefined(value.chartProps) &&
              !value.shapeProps?.isChart &&
              (pluginGuid === null || pluginGuid === undefined),
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
            _.isUndefined(value.imgProps) &&
              _.isUndefined(value.chartProps) &&
              !value.shapeProps?.isChart,
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
          menuAdvancedSettingsSeparator.isVisible() &&
            (lastSeparator = menuAdvancedSettingsSeparator)

          /** coauthoring begin **/
          this.menuAddCommentImg.setVisible(this.mode?.canComments)
          !this.menuAddCommentImg.isVisible() && lastSeparator.setVisible(false)
          /** coauthoring end **/
          this.menuImgShapeAlign.setDisabled(disabled)
          if (!disabled) {
            const objcount = this.api.asc_getSelectedDrawingObjectsCount()
            const slide_checked = Common.Utils.InternalSettings.get("pdfe-align-to-slide") || false
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
        },
        items: [
          this.menuImgCut,
          this.menuImgCopy,
          this.menuImgPaste,
          { caption: "--" }, //Separator
          menuImgShapeArrange,
          this.menuImgShapeAlign,
          this.menuShapesMerge,
          this.menuImgShapeRotate,
          menuImgShapeSeparator, //Separator
          this.menuImgSaveAsPicture,
          menuImgSaveAsPictureSeparator, //Separator
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

      // Paragraph
      this.menuParagraphAdvanced = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-paragraph",
        caption: this.advancedParagraphText,
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

      this.menuAddCommentPara = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-add-comment",
        caption: this.addCommentText,
      })
      this.menuAddCommentPara.hide()

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

      const menuEquationSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.menuParagraphEquation = new Common.UI.MenuItem({
        caption: this.advancedEquationText,
        iconCls: "menu__icon btn-equation",
        menu: this.createEquationMenu("popupparaeqinput", "tl-tr"),
      })

      this.textMenu = new Common.UI.Menu({
        cls: "shifted-right",
        scrollToCheckedItem: false,
        initMenu: (value) => {
          const isInShape = value.shapeProps && !_.isNull(value.shapeProps.value)
          const isInChart =
            (value.chartProps && !_.isNull(value.chartProps.value)) || value.shapeProps?.isChart
          const disabled = value.paraProps?.locked || (isInShape && value.shapeProps.locked)
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
          this.menuAddCommentPara.setVisible(this.mode?.canComments)
          /** coauthoring end **/

          menuCommentParaSeparator.setVisible(
            /** coauthoring begin **/ this.menuAddCommentPara.isVisible() ||
              /** coauthoring end **/ this.menuAddHyperlinkPara.isVisible() ||
              menuHyperlinkPara.isVisible(),
          )
          this.menuAddHyperlinkPara.setDisabled(disabled)
          menuHyperlinkPara.setDisabled(disabled)

          this.menuParagraphAdvanced.setDisabled(disabled)
          const cancopy = this.api?.can_CopyCut()
          this.menuParaCopy.setDisabled(!cancopy)
          this.menuParaCut.setDisabled(disabled || !cancopy)
          this.menuParaPaste.setDisabled(disabled)

          //equation menu
          let eqlen = 0
          if (isEquation) {
            eqlen = this.addEquationMenu(this.textMenu, 4)
          } else this.clearEquationMenu(this.textMenu, 4)
          menuEquationSeparator.setVisible(isEquation && eqlen > 0)

          this.menuParagraphEquation.setVisible(isEquation)
          this.menuParagraphEquation.setDisabled(disabled)
          if (isEquation) {
            const eq = this.api.asc_GetMathInputType()
            const isEqToolbarHide = Common.Utils.InternalSettings.get("pdfe-equation-toolbar-hide")

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

      this.mnuDeletePage = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-cc-remove",
        caption: this.deleteText,
      })
      this.mnuNewPageBefore = new Common.UI.MenuItem({
        caption: this.txtNewPageBefore,
        value: true,
      })
      this.mnuNewPageAfter = new Common.UI.MenuItem({
        caption: this.txtNewPageAfter,
        value: false,
      })
      this.mnuRotatePageRight = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-rotate-90",
        caption: this.txtRotateRight,
      })
      this.mnuRotatePageLeft = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-rotate-270",
        caption: this.txtRotateLeft,
      })
      this.mnuCutPage = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-cut",
        caption: this.textCut,
        value: "cut",
      })
      this.mnuCopyPage = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-copy",
        caption: this.textCopy,
        value: "copy",
      })
      this.mnuPastePageBefore = new Common.UI.MenuItem({
        caption: this.txtPastePageBefore,
        value: "paste-before",
      })
      this.mnuPastePageAfter = new Common.UI.MenuItem({
        caption: this.txtPastePageAfter,
        value: "paste",
      })

      const menuPageDelSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      const menuPageNewSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      const menuPagePasteSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.pageMenu = new Common.UI.Menu({
        cls: "shifted-right",
        restoreHeightAndTop: true,
        scrollToCheckedItem: false,
        initMenu: (value) => {
          if (value) this.options.eventProps = value
          else value = this.options.eventProps

          if (this.api) {
            let i = -1
            let page_deleted = false
            let page_rotate_lock = false
            const selectedElements = this.api.getSelectedElements()
            while (++i < selectedElements.length) {
              if (selectedElements[i].get_ObjectType() === Asc.c_oAscTypeSelectElement.PdfPage) {
                page_deleted = selectedElements[i].get_ObjectValue().asc_getDeleteLock()
                page_rotate_lock = selectedElements[i].get_ObjectValue().asc_getRotateLock()
              }
            }
          }

          if (value) {
            this.mnuRotatePageRight.options.value = this.mnuRotatePageLeft.options.value =
              value.pageNum
            this.mnuRotatePageRight.setVisible(value.isPageSelect === true)
            this.mnuRotatePageLeft.setVisible(value.isPageSelect === true)
            this.mnuDeletePage.setVisible(value.isPageSelect === true)
            this.mnuCopyPage.setVisible(value.isPageSelect === true)
            this.mnuCutPage.setVisible(value.isPageSelect === true)
            menuPageNewSeparator.setVisible(value.isPageSelect === true)
            menuPagePasteSeparator.setVisible(value.isPageSelect === true)
            menuPageDelSeparator.setVisible(value.isPageSelect === true)
          }

          const canRotate = this.api.asc_CanRotatePages()
          this.mnuRotatePageRight.setDisabled(page_rotate_lock || page_deleted || !canRotate)
          this.mnuRotatePageLeft.setDisabled(page_rotate_lock || page_deleted || !canRotate)
          const canRemove = this.api.asc_CanRemovePages()
          this.mnuDeletePage.setDisabled(this._pagesCount < 2 || page_deleted || !canRemove)
          this.mnuCutPage.setDisabled(this._pagesCount < 2 || page_deleted || !canRemove)
          const canPaste = this.api.asc_CanPastePage()
          this.mnuPastePageBefore.setDisabled(!canPaste)
          this.mnuPastePageAfter.setDisabled(!canPaste)
        },
        items: [
          this.mnuCutPage,
          this.mnuCopyPage,
          menuPagePasteSeparator,
          this.mnuPastePageBefore,
          this.mnuPastePageAfter,
          { caption: "--" },
          this.mnuNewPageBefore,
          this.mnuNewPageAfter,
          menuPageNewSeparator,
          this.mnuRotatePageRight,
          this.mnuRotatePageLeft,
          menuPageDelSeparator,
          this.mnuDeletePage,
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

      this.fireEvent("createdelayedelements", [this, "edit"])
    }

    dh.createDelayedElementsPDFForms = function () {
      if (this.menuPDFFormsCopy) return // menu is already inited

      this.menuPDFFormsCopy = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-copy",
        caption: this.textCopy,
        value: "copy",
      })

      this.menuPDFFormsPaste = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-paste",
        caption: this.textPaste,
        value: "paste",
      })

      this.menuPDFFormsCut = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-cut",
        caption: this.textCut,
        value: "cut",
      })

      this.menuPDFFormsUndo = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-undo icon-rtl",
        caption: this.textUndo,
      })

      this.menuPDFFormsRedo = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-redo icon-rtl",
        caption: this.textRedo,
      })

      this.menuPDFFormsClear = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-clearstyle",
        caption: this.textClearField,
      })

      this.formsPDFMenu = new Common.UI.Menu({
        cls: "shifted-right",
        initMenu: (value) => {
          const cancopy = this.api.can_CopyCut()
          const disabled =
            value.paraProps?.locked ||
            value.headerProps?.locked ||
            (value.imgProps && (value.imgProps.locked || value.imgProps.content_locked)) ||
            this._isDisabled
          this.menuPDFFormsUndo.setDisabled(disabled || !this.api.asc_getCanUndo()) // undo
          this.menuPDFFormsRedo.setDisabled(disabled || !this.api.asc_getCanRedo()) // redo

          this.menuPDFFormsClear.setDisabled(disabled || !this.api.asc_IsContentControl()) // clear
          this.menuPDFFormsCut.setDisabled(disabled || !cancopy) // cut
          this.menuPDFFormsCopy.setDisabled(!cancopy) // copy
          this.menuPDFFormsPaste.setDisabled(disabled) // paste;
        },
        items: [
          this.menuPDFFormsUndo,
          this.menuPDFFormsRedo,
          { caption: "--" },
          this.menuPDFFormsClear,
          { caption: "--" },
          this.menuPDFFormsCut,
          this.menuPDFFormsCopy,
          this.menuPDFFormsPaste,
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

      this.fireEvent("createdelayedelements", [this, "forms"])
    }

    dh.createTextBar = function (textBarBtns) {
      const container = $(
        '<div id="text-bar-container" style="position: absolute;">' +
          '<div id="text-bar-fonts" style="display:inline-block;" class="margin-right-2"></div>' +
          '<div id="text-bar-font-size" style="display:inline-block;" class="margin-right-4"></div>' +
          '<div id="text-bar-bold" style="display:inline-block;" class="margin-right-4"></div>' +
          '<div id="text-bar-italic" style="display:inline-block;" class="margin-right-4"></div>' +
          '<div id="text-bar-underline" style="display:inline-block;" class="margin-right-4"></div>' +
          '<div id="text-bar-strikeout" style="display:inline-block;" class="margin-right-4"></div>' +
          '<div id="text-bar-super" style="display:inline-block;" class="margin-right-4"></div>' +
          '<div id="text-bar-sub" style="display:inline-block;" class="margin-right-4"></div>' +
          '<div id="text-bar-textcolor" style="display:inline-block;"></div>' +
          '<div class="separator margin-left-6"></div>' +
          '<div id="text-bar-halign" style="display:inline-block;" class="margin-left-13"></div>' +
          '<div id="text-bar-direction" style="display:inline-block;" class="margin-left-4"></div>' +
          "</div>",
      )
      const toolbarController = PDFE.getController("Toolbar")
      const toolbar = toolbarController.getView("Toolbar")

      this.cmbFontName = new Common.UI.ComboBoxFonts({
        el: $("#text-bar-fonts", container),
        cls: "input-group-nr",
        style: "width: 100px;",
        menuCls: "scrollable-menu menu-absolute",
        menuStyle: "min-width: 100%;max-height: 270px;",
        restoreMenuHeightAndTop: 220,
        store: new Common.Collections.Fonts(),
        hint: toolbar.tipFontName,
      })
      textBarBtns.push(this.cmbFontName)
      toolbarController.fillFontsStore(this.cmbFontName)

      this.cmbFontSize = new Common.UI.ComboBox({
        el: $("#text-bar-font-size", container),
        cls: "input-group-nr",
        style: "width: 45px;",
        menuCls: "scrollable-menu menu-absolute",
        menuStyle: "min-width: 45px;max-height: 270px;",
        restoreMenuHeightAndTop: 220,
        hint: toolbar.tipFontSize,
        data: [
          { value: 8, displayValue: "8" },
          { value: 9, displayValue: "9" },
          { value: 10, displayValue: "10" },
          { value: 11, displayValue: "11" },
          { value: 12, displayValue: "12" },
          { value: 14, displayValue: "14" },
          { value: 16, displayValue: "16" },
          { value: 18, displayValue: "18" },
          { value: 20, displayValue: "20" },
          { value: 22, displayValue: "22" },
          { value: 24, displayValue: "24" },
          { value: 26, displayValue: "26" },
          { value: 28, displayValue: "28" },
          { value: 36, displayValue: "36" },
          { value: 48, displayValue: "48" },
          { value: 72, displayValue: "72" },
          { value: 96, displayValue: "96" },
        ],
      })
      this.cmbFontSize.setValue("")
      textBarBtns.push(this.cmbFontSize)

      this.btnBold = new Common.UI.Button({
        parentEl: $("#text-bar-bold", container),
        cls: "btn-toolbar",
        iconCls: "toolbar__icon btn-bold",
        enableToggle: true,
        hint: toolbar.textBold,
      })
      textBarBtns.push(this.btnBold)

      this.btnItalic = new Common.UI.Button({
        parentEl: $("#text-bar-italic", container),
        cls: "btn-toolbar",
        iconCls: "toolbar__icon btn-italic",
        enableToggle: true,
        hint: toolbar.textItalic,
      })
      textBarBtns.push(this.btnItalic)

      this.btnTextUnderline = new Common.UI.Button({
        parentEl: $("#text-bar-underline", container),
        cls: "btn-toolbar",
        iconCls: "toolbar__icon btn-underline",
        enableToggle: true,
        hint: toolbar.textUnderline,
      })
      textBarBtns.push(this.btnTextUnderline)

      this.btnTextStrikeout = new Common.UI.Button({
        parentEl: $("#text-bar-strikeout", container),
        cls: "btn-toolbar",
        iconCls: "toolbar__icon btn-strikeout",
        enableToggle: true,
        hint: toolbar.textStrikeout,
      })
      textBarBtns.push(this.btnTextStrikeout)

      this.btnSuperscript = new Common.UI.Button({
        parentEl: $("#text-bar-super", container),
        cls: "btn-toolbar",
        iconCls: "toolbar__icon btn-superscript",
        enableToggle: true,
        toggleGroup: "superscriptGroup",
        hint: toolbar.textSuperscript,
      })
      textBarBtns.push(this.btnSuperscript)

      this.btnSubscript = new Common.UI.Button({
        parentEl: $("#text-bar-sub", container),
        cls: "btn-toolbar",
        iconCls: "toolbar__icon btn-subscript",
        enableToggle: true,
        toggleGroup: "superscriptGroup",
        hint: toolbar.textSubscript,
      })
      textBarBtns.push(this.btnSubscript)

      const config = Common.UI.simpleColorsConfig
      this.btnFontColor = new Common.UI.ButtonColored({
        parentEl: $("#text-bar-textcolor", container),
        cls: "btn-toolbar",
        iconCls: "toolbar__icon btn-fontcolor",
        split: true,
        menu: true,
        colors: config.colors,
        color: "000000",
        dynamiccolors: config.dynamiccolors,
        themecolors: config.themecolors,
        effects: config.effects,
        columns: config.columns,
        paletteCls: config.cls,
        paletteWidth: config.paletteWidth,
        hint: toolbar.tipFontColor,
      })
      textBarBtns.push(this.btnFontColor)
      this.btnFontColor.setMenu()
      this.mnuFontColorPicker = this.btnFontColor.getPicker()
      this.btnFontColor.currentColor = this.btnFontColor.color

      this.btnTextDir = new Common.UI.Button({
        parentEl: $("#text-bar-direction", container),
        cls: "btn-toolbar",
        iconCls: "toolbar__icon btn-ltr",
        icls: "btn-ltr",
        action: "text-direction",
        dirRtl: false,
        hint: toolbar.tipTextDir,
        menu: new Common.UI.Menu({
          items: [
            { caption: toolbar.textDirLtr, value: false, iconCls: "menu__icon btn-ltr" },
            { caption: toolbar.textDirRtl, value: true, iconCls: "menu__icon btn-rtl" },
          ],
        }),
      })
      textBarBtns.push(this.btnTextDir)

      this.btnHorizontalAlign = new Common.UI.Button({
        parentEl: $("#text-bar-halign", container),
        cls: "btn-toolbar",
        iconCls: "toolbar__icon btn-align-left",
        icls: "btn-align-left",
        hint: toolbar.tipHAligh,
        menu: new Common.UI.Menu({
          items: [
            {
              caption: toolbar.textAlignLeft,
              iconCls: "menu__icon btn-align-left",
              icls: "btn-align-left",
              checkable: true,
              checkmark: false,
              toggleGroup: "halignGroup",
              checked: true,
              value: 1,
            },
            {
              caption: toolbar.textAlignCenter,
              iconCls: "menu__icon btn-align-center",
              icls: "btn-align-center",
              checkable: true,
              checkmark: false,
              toggleGroup: "halignGroup",
              value: 2,
            },
            {
              caption: toolbar.textAlignRight,
              iconCls: "menu__icon btn-align-right",
              icls: "btn-align-right",
              checkable: true,
              checkmark: false,
              toggleGroup: "halignGroup",
              value: 0,
            },
          ],
        }),
        action: "align-horizontal",
      })
      textBarBtns.push(this.btnHorizontalAlign)

      return container
    }

    dh.createAnnotBar = function (annotBarBtns) {
      const container = $(
        '<div id="annot-bar-container" style="position: absolute;">' +
          '<div id="annot-bar-copy" style="display:inline-block;" class=""></div>' +
          '<div class="separator margin-left-6"></div>' +
          '<div id="annot-bar-add-comment" style="display:inline-block;" class="margin-left-13"></div>' +
          '<div id="annot-bar-highlight" style="display:inline-block;" class="margin-left-4"></div>' +
          '<div id="annot-bar-underline" style="display:inline-block;" class="margin-left-4"></div>' +
          '<div id="annot-bar-strikeout" style="display:inline-block;" class="margin-left-4"></div>' +
          '<div id="annot-bar-redact" style="display:inline-block;" class="margin-left-4"></div>' +
          '<div class="separator margin-left-6"></div>' +
          '<div id="annot-bar-edit-text" class="margin-left-13" style="display:inline-block;"></div>' +
          "</div>",
      )
      const toolbarController = PDFE.getController("Toolbar")
      const toolbar = toolbarController.getView("Toolbar")

      this.btnCopy = new Common.UI.Button({
        parentEl: $("#annot-bar-copy", container),
        cls: "btn-toolbar",
        iconCls: "toolbar__icon btn-copy",
        hint: toolbar.tipCopy,
      })
      annotBarBtns.push(this.btnCopy)

      this.btnAddComment = new Common.UI.Button({
        parentEl: $("#annot-bar-add-comment", container),
        cls: "btn-toolbar",
        iconCls: "toolbar__icon btn-add-comment",
        hint: toolbar.tipAddComment,
      })
      annotBarBtns.push(this.btnAddComment)

      const config = Common.UI.simpleColorsConfig
      this.btnUnderline = new Common.UI.ButtonColored({
        parentEl: $("#annot-bar-underline", container),
        cls: "btn-toolbar",
        iconCls: "toolbar__icon btn-underline",
        enableToggle: true,
        allowDepress: true,
        split: true,
        menu: true,
        colorLine: false,
        colors: config.colors,
        color: "3D8A44",
        additionalItemsAfter: [
          { caption: "--" },
          new Common.UI.MenuItem({
            template: _.template('<div class="custom-scale" data-stopPropagation="true"></div>'),
            stopPropagation: true,
          }),
        ],
        dynamiccolors: config.dynamiccolors,
        themecolors: config.themecolors,
        effects: config.effects,
        columns: config.columns,
        paletteCls: config.cls,
        paletteWidth: config.paletteWidth,
        storageSuffix: "-draw",
        hideColorsSeparator: true,
        hint: toolbar.textUnderline,
        type: AscPDF.ANNOTATIONS_TYPES.Underline,
      })
      annotBarBtns.push(this.btnUnderline)

      this.btnStrikeout = new Common.UI.ButtonColored({
        parentEl: $("#annot-bar-strikeout", container),
        cls: "btn-toolbar",
        iconCls: "toolbar__icon btn-strikeout",
        enableToggle: true,
        allowDepress: true,
        split: true,
        menu: true,
        colorLine: false,
        colors: config.colors,
        color: "D43230",
        additionalItemsAfter: [
          { caption: "--" },
          new Common.UI.MenuItem({
            template: _.template('<div class="custom-scale" data-stopPropagation="true"></div>'),
            stopPropagation: true,
          }),
        ],
        dynamiccolors: config.dynamiccolors,
        themecolors: config.themecolors,
        effects: config.effects,
        columns: config.columns,
        paletteCls: config.cls,
        paletteWidth: config.paletteWidth,
        storageSuffix: "-draw",
        hideColorsSeparator: true,
        hint: toolbar.textStrikeout,
        type: AscPDF.ANNOTATIONS_TYPES.Strikeout,
      })
      annotBarBtns.push(this.btnStrikeout)

      this.btnRedact = new Common.UI.Button({
        parentEl: $("#annot-bar-redact", container),
        cls: "btn-toolbar",
        iconCls: "toolbar__icon btn-redact-text",
        caption: this.textRedact,
        hint: toolbar.tipRedact,
      })
      annotBarBtns.push(this.btnRedact)

      this.btnHighlight = new Common.UI.ButtonColored({
        parentEl: $("#annot-bar-highlight", container),
        cls: "btn-toolbar",
        iconCls: "toolbar__icon btn-highlight",
        enableToggle: true,
        allowDepress: true,
        split: true,
        menu: true,
        additionalItemsAfter: [
          { caption: "--" },
          new Common.UI.MenuItem({
            template: _.template('<div class="custom-scale" data-stopPropagation="true"></div>'),
            stopPropagation: true,
          }),
        ],
        colors: [
          "FFFC54",
          "72F54A",
          "74F9FD",
          "EB51F7",
          "A900F9",
          "EF8B3A",
          "7272FF",
          "FF63A4",
          "1DFF92",
          "03DA18",
          "249B01",
          "C504D2",
          "0633D1",
          "FFF7A0",
          "FF0303",
          "FFFFFF",
          "D3D3D4",
          "969696",
          "606060",
          "000000",
        ],
        color: "FFFC54",
        dynamiccolors: config.dynamiccolors,
        themecolors: config.themecolors,
        effects: config.effects,
        columns: config.columns,
        paletteCls: config.cls,
        paletteWidth: config.paletteWidth,
        storageSuffix: "-draw",
        hideColorsSeparator: true,
        hint: toolbar.textHighlight,
        type: AscPDF.ANNOTATIONS_TYPES.Highlight,
      })
      annotBarBtns.push(this.btnHighlight)

      this.btnEditText = new Common.UI.Button({
        parentEl: $("#annot-bar-edit-text", container),
        cls: "btn-toolbar",
        iconCls: "toolbar__icon btn-magic-wand",
        caption: this.textRecognize,
        hint: this.tipRecognize,
      })
      annotBarBtns.push(this.btnEditText)
      this.fireEvent("annotbar:create", [this.btnStrikeout, this.btnUnderline, this.btnHighlight])

      return container
    }

    dh.createAnnotSelectBar = function (annotSelectBarBtns) {
      const container = $(
        '<div id="annot-sel-bar-container" style="position: absolute;">' +
          '<div id="annot-sel-bar-stroke"></div>' +
          '<div id="annot-sel-bar-highlight"></div>' +
          '<div id="annot-sel-bar-add-comment" class="margin-left-4"></div>' +
          '<div class="separator margin-left-6"></div>' +
          '<div id="annot-sel-bar-remove" class="margin-left-13"></div>' +
          "</div>",
      )
      const toolbarController = PDFE.getController("Toolbar")
      const toolbar = toolbarController.getView("Toolbar")

      this.btnRemAnnot = new Common.UI.Button({
        parentEl: $("#annot-sel-bar-remove", container),
        cls: "btn-toolbar",
        iconCls: "toolbar__icon btn-cc-remove",
        hint: this.removeCommentText,
      })
      annotSelectBarBtns.push(this.btnRemAnnot)

      this.btnAddAnnotComment = new Common.UI.Button({
        parentEl: $("#annot-sel-bar-add-comment", container),
        cls: "btn-toolbar",
        iconCls: "toolbar__icon btn-add-comment",
        hint: toolbar.tipAddComment,
      })
      annotSelectBarBtns.push(this.btnAddAnnotComment)

      const config = Common.UI.simpleColorsConfig
      this.btnStrokeHighlightColor = new Common.UI.ButtonColored({
        parentEl: $("#annot-sel-bar-highlight", container),
        cls: "btn-toolbar no-caret no-icon",
        iconCls: "toolbar__icon",
        menu: true,
        colorLine: "box",
        colors: [
          "FFFC54",
          "72F54A",
          "74F9FD",
          "EB51F7",
          "A900F9",
          "EF8B3A",
          "7272FF",
          "FF63A4",
          "1DFF92",
          "03DA18",
          "249B01",
          "C504D2",
          "0633D1",
          "FFF7A0",
          "FF0303",
          "FFFFFF",
          "D3D3D4",
          "969696",
          "606060",
          "000000",
        ],
        color: "FFFC54",
        additionalItemsAfter: [
          { caption: "--" },
          new Common.UI.MenuItem({
            template: _.template('<div class="custom-scale" data-stopPropagation="true"></div>'),
            stopPropagation: true,
          }),
        ],
        dynamiccolors: config.dynamiccolors,
        themecolors: config.themecolors,
        effects: config.effects,
        columns: config.columns,
        paletteCls: config.cls,
        paletteWidth: config.paletteWidth,
        storageSuffix: "-draw",
        hideColorsSeparator: true,
        hint: this.textColor,
      })
      annotSelectBarBtns.push(this.btnStrokeHighlightColor)
      this.btnStrokeHighlightColor.setMenu()
      this.mnuStrokeHighlightColorPicker = this.btnStrokeHighlightColor.getPicker()
      this.btnStrokeHighlightColor.currentColor = this.btnStrokeHighlightColor.color

      this.btnStrokeColor = new Common.UI.ButtonColored({
        parentEl: $("#annot-sel-bar-stroke", container),
        cls: "btn-toolbar no-caret no-icon",
        iconCls: "toolbar__icon",
        menu: true,
        colorLine: "box",
        colors: config.colors,
        color: "3D8A44",
        additionalItemsAfter: [
          { caption: "--" },
          new Common.UI.MenuItem({
            template: _.template('<div class="custom-scale" data-stopPropagation="true"></div>'),
            stopPropagation: true,
          }),
        ],
        dynamiccolors: config.dynamiccolors,
        themecolors: config.themecolors,
        effects: config.effects,
        columns: config.columns,
        paletteCls: config.cls,
        paletteWidth: config.paletteWidth,
        storageSuffix: "-draw",
        hideColorsSeparator: true,
        hint: this.textColor,
      })
      annotSelectBarBtns.push(this.btnStrokeColor)
      this.btnStrokeColor.setMenu()
      this.mnuStrokeColorPicker = this.btnStrokeColor.getPicker()
      this.btnStrokeColor.currentColor = this.btnStrokeColor.color

      return container
    }
  }
})
