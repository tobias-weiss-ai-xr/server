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
 *  DocumentHolderExt.js
 *
 *  DocumentHolder controller
 *
 *  Created on 13/12/24
 *
 */

define([], () => {
  if (window.PE?.Controllers?.DocumentHolder) {
    const dh = window.PE.Controllers.DocumentHolder.prototype

    dh.checkEditorOffsets = function () {
      if (_.isUndefined(this._XY)) {
        const cmpEl = this.documentHolder.cmpEl
        this._XY = [
          Common.Utils.getOffset(cmpEl).left - $(window).scrollLeft(),
          Common.Utils.getOffset(cmpEl).top - $(window).scrollTop(),
        ]
        this._Width = cmpEl.width()
        this._Height = cmpEl.height()
        this._BodyWidth = $("body").width()
      }
    }

    dh.setEvents = function () {
      this.addListeners({
        DocumentHolder: {
          createdelayedelements: this.createDelayedElements,
          "equation:callback": this.equationCallback,
          "layout:change": this.onLayoutChange,
          "theme:change": this.onThemeChange,
        },
      })

      if (this.api) {
        this.api.asc_registerCallback("asc_onContextMenu", _.bind(this.onContextMenu, this))
        this.api.asc_registerCallback("asc_onMouseMoveStart", _.bind(this.onMouseMoveStart, this))
        this.api.asc_registerCallback("asc_onMouseMoveEnd", _.bind(this.onMouseMoveEnd, this))
        this.api.asc_registerCallback("asc_onPaintSlideNum", _.bind(this.onPaintSlideNum, this))
        this.api.asc_registerCallback(
          "asc_onEndPaintSlideNum",
          _.bind(this.onEndPaintSlideNum, this),
        )
        this.api.asc_registerCallback("asc_onCurrentPage", _.bind(this.onApiCurrentPages, this))
        this.documentHolder.slidesCount = this.api.getCountPages()

        //hyperlink
        this.api.asc_registerCallback("asc_onHyperlinkClick", _.bind(this.onHyperlinkClick, this))
        this.api.asc_registerCallback("asc_onMouseMove", _.bind(this.onMouseMove, this))

        if (this.mode.isEdit === true) {
          this.api.asc_registerCallback(
            "asc_onDialogAddHyperlink",
            _.bind(this.onDialogAddHyperlink, this),
          )
          this.api.asc_registerCallback(
            "asc_doubleClickOnChart",
            _.bind(this.onDoubleClickOnChart, this),
          )
          this.api.asc_registerCallback(
            "asc_doubleClickOnTableOleObject",
            _.bind(this.onDoubleClickOnTableOleObject, this),
          )
          this.api.asc_registerCallback(
            "asc_onSpellCheckVariantsFound",
            _.bind(this.onSpellCheckVariantsFound, this),
          )
          this.api.asc_registerCallback(
            "asc_onShowSpecialPasteOptions",
            _.bind(this.onShowSpecialPasteOptions, this),
          )
          this.api.asc_registerCallback(
            "asc_onHideSpecialPasteOptions",
            _.bind(this.onHideSpecialPasteOptions, this),
          )
          this.api.asc_registerCallback("asc_ChangeCropState", _.bind(this.onChangeCropState, this))
          this.api.asc_registerCallback(
            "asc_onHidePlaceholderActions",
            _.bind(this.onHidePlaceholderActions, this),
          )
          this.api.asc_registerPlaceholderCallback(
            AscCommon.PlaceholderButtonType.Image,
            _.bind(this.onInsertImage, this, true),
          )
          this.api.asc_registerPlaceholderCallback(
            AscCommon.PlaceholderButtonType.ImageUrl,
            _.bind(this.onInsertImageUrl, this, true),
          )
          this.api.asc_registerPlaceholderCallback(
            AscCommon.PlaceholderButtonType.Chart,
            _.bind(this.onClickPlaceholderChart, this),
          )
          this.api.asc_registerPlaceholderCallback(
            AscCommon.PlaceholderButtonType.Table,
            _.bind(this.onClickPlaceholderTable, this),
          )
          this.api.asc_registerPlaceholderCallback(
            AscCommon.PlaceholderButtonType.Video,
            _.bind(this.onClickPlaceholder, this, AscCommon.PlaceholderButtonType.Video),
          )
          this.api.asc_registerPlaceholderCallback(
            AscCommon.PlaceholderButtonType.Audio,
            _.bind(this.onClickPlaceholder, this, AscCommon.PlaceholderButtonType.Audio),
          )
          this.api.asc_registerPlaceholderCallback(
            AscCommon.PlaceholderButtonType.SmartArt,
            _.bind(this.onClickPlaceholderSmartArt, this),
          )
          this.api.asc_registerCallback("asc_onTrackGuide", _.bind(this.onTrackGuide, this))
          this.api.asc_registerCallback("asc_onShowMathTrack", _.bind(this.onShowMathTrack, this))
          this.api.asc_registerCallback("asc_onHideMathTrack", _.bind(this.onHideMathTrack, this))
          this.api.asc_registerCallback(
            "asc_onLockViewProps",
            _.bind(this.onLockViewProps, this, true),
          )
          this.api.asc_registerCallback(
            "asc_onUnLockViewProps",
            _.bind(this.onLockViewProps, this, false),
          )
          this.api.asc_registerCallback("asc_onHideEyedropper", _.bind(this.hideEyedropper, this))
          this.api.asc_SetMathInputType(
            Common.localStorage.getBool("pe-equation-input-latex")
              ? Asc.c_oAscMathInputType.LaTeX
              : Asc.c_oAscMathInputType.Unicode,
          )
          this.api.asc_registerCallback(
            "asc_onRemoveUnpreserveMasters",
            _.bind(this.onRemoveUnpreserveMasters, this),
          )
          this.api.asc_registerCallback(
            "asc_onSingleChartSelectionChanged",
            _.bind(this.onSingleChartSelectionChanged, this),
          )
        }
        this.api.asc_registerCallback(
          "asc_onShowForeignCursorLabel",
          _.bind(this.onShowForeignCursorLabel, this),
        )
        this.api.asc_registerCallback(
          "asc_onHideForeignCursorLabel",
          _.bind(this.onHideForeignCursorLabel, this),
        )
        this.api.asc_registerCallback("asc_onFocusObject", _.bind(this.onFocusObject, this))
        this.api.asc_registerCallback("onPluginContextMenu", _.bind(this.onPluginContextMenu, this))
      }
    }

    dh.initExternalEditors = function () {
      const me = this
      const diagramEditor = this.getApplication()
        .getController("Common.Controllers.ExternalDiagramEditor")
        .getView("Common.Views.ExternalDiagramEditor")
      if (diagramEditor) {
        diagramEditor.on(
          "internalmessage",
          _.bind(function (cmp, message) {
            const command = message.data.command
            const data = message.data.data
            if (this.api) {
              diagramEditor.isEditMode()
                ? this.api.asc_editChartDrawingObject(data)
                : this.api.asc_addChartDrawingObject(data, diagramEditor.getPlaceholder())
            }
          }, this),
        )
        diagramEditor.on(
          "hide",
          _.bind(function (cmp, message) {
            if (this.api) {
              this.api.asc_onCloseFrameEditor()
              this.api.asc_enableKeyEvents(true)
            }
            setTimeout(() => {
              me.editComplete()
            }, 10)
          }, this),
        )
      }

      const oleEditor = this.getApplication()
        .getController("Common.Controllers.ExternalOleEditor")
        .getView("Common.Views.ExternalOleEditor")
      if (oleEditor) {
        oleEditor.on(
          "internalmessage",
          _.bind(function (cmp, message) {
            const command = message.data.command
            const data = message.data.data
            if (this.api) {
              oleEditor.isEditMode()
                ? this.api.asc_editTableOleObject(data)
                : this.api.asc_addTableOleObject(data)
            }
          }, this),
        )
        oleEditor.on(
          "hide",
          _.bind(function (cmp, message) {
            if (this.api) {
              this.api.asc_enableKeyEvents(true)
              this.api.asc_onCloseFrameEditor()
            }
            setTimeout(() => {
              me.editComplete()
            }, 10)
          }, this),
        )
      }
    }

    dh.createDelayedElements = function (view, type) {
      const view = this.documentHolder

      if (type === "view") {
        view.menuViewCopy.on("click", _.bind(this.onCutCopyPaste, this))
        view.menuViewAddComment.on("click", _.bind(this.addComment, this))
        view.menuViewUndo.on("click", _.bind(this.onUndo, this))
        view.mnuPreview.on("click", _.bind(this.onPreview, this))
        view.mnuSelectAll.on("click", _.bind(this.onSelectAll, this))
        view.mnuPrintSelection.on("click", _.bind(this.onPrintSelection, this))
        return
      }

      view.menuEditObject.on("click", _.bind(this.onEditObject, this))
      view.menuSlidePaste.on("click", _.bind(this.onCutCopyPaste, this))
      view.menuParaCopy.on("click", _.bind(this.onCutCopyPaste, this))
      view.menuParaPaste.on("click", _.bind(this.onCutCopyPaste, this))
      view.menuParaCut.on("click", _.bind(this.onCutCopyPaste, this))
      view.menuImgCopy.on("click", _.bind(this.onCutCopyPaste, this))
      view.menuImgPaste.on("click", _.bind(this.onCutCopyPaste, this))
      view.menuImgCut.on("click", _.bind(this.onCutCopyPaste, this))
      view.menuTableCopy.on("click", _.bind(this.onCutCopyPaste, this))
      view.menuTablePaste.on("click", _.bind(this.onCutCopyPaste, this))
      view.menuTableCut.on("click", _.bind(this.onCutCopyPaste, this))
      view.menuAddHyperlinkPara.on("click", _.bind(this.addHyperlink, this))
      view.menuAddHyperlinkTable.on("click", _.bind(this.addHyperlink, this))
      view.menuAddHyperlinkPic.on("click", _.bind(this.addHyperlink, this))
      view.menuEditHyperlinkPara.on("click", _.bind(this.editHyperlink, this))
      view.menuEditHyperlinkTable.on("click", _.bind(this.editHyperlink, this))
      view.menuEditHyperlinkPic.on("click", _.bind(this.editHyperlink, this))
      view.menuRemoveHyperlinkPara.on("click", _.bind(this.removeHyperlink, this))
      view.menuRemoveHyperlinkTable.on("click", _.bind(this.removeHyperlink, this))
      view.menuRemoveHyperlinkPic.on("click", _.bind(this.removeHyperlink, this))
      view.menuChartEdit.on("click", _.bind(this.editChartClick, this, undefined))
      view.menuImgSaveAsPicture.on("click", _.bind(this.saveAsPicture, this))
      view.menuTableSaveAsPicture.on("click", _.bind(this.saveAsPicture, this))
      view.menuAddCommentPara.on("click", _.bind(this.addComment, this))
      view.menuAddCommentTable.on("click", _.bind(this.addComment, this))
      view.menuAddCommentImg.on("click", _.bind(this.addComment, this))
      view.menuImgReplace.menu.on("item:click", _.bind(this.onImgReplace, this))
      view.langParaMenu.menu.on("item:click", _.bind(this.onLangMenu, this, "para"))
      view.langTableMenu.menu.on("item:click", _.bind(this.onLangMenu, this, "table"))
      view.mnuPreview.on("click", _.bind(this.onPreview, this))
      view.mnuSelectAll.on("click", _.bind(this.onSelectAll, this))
      view.mnuPrintSelection.on("click", _.bind(this.onPrintSelection, this))
      view.mnuNewSlide.on("click", _.bind(this.onNewSlide, this))
      view.mnuDuplicateSlide.on("click", _.bind(this.onDuplicateSlide, this))
      view.mnuDeleteSlide.on("click", _.bind(this.onDeleteSlide, this))
      view.mnuResetSlide.on("click", _.bind(this.onResetSlide, this))
      view.mnuMoveSlideToStart.on("click", _.bind(this.onMoveSlideToStart, this))
      view.mnuMoveSlideToEnd.on("click", _.bind(this.onMoveSlideToEnd, this))
      view.menuSlideSettings.on("click", _.bind(this.onSlideSettings, this))
      view.mnuSlideHide.on("click", _.bind(this.onSlideHide, this))
      view.mnuTableMerge.on("click", _.bind(this.onTableMerge, this))
      view.mnuTableSplit.on("click", _.bind(this.onTableSplit, this))
      view.menuTableCellAlign.menu.on("item:click", _.bind(this.tableCellsVAlign, this))
      view.menuTableDistRows.on("click", _.bind(this.onTableDistRows, this))
      view.menuTableDistCols.on("click", _.bind(this.onTableDistCols, this))
      view.menuTableDirection.menu.on("item:click", _.bind(this.tableDirection, this))
      view.menuIgnoreSpellTable.on("click", _.bind(this.onIgnoreSpell, this))
      view.menuIgnoreSpellPara.on("click", _.bind(this.onIgnoreSpell, this))
      view.menuIgnoreAllSpellTable.on("click", _.bind(this.onIgnoreSpell, this))
      view.menuIgnoreAllSpellPara.on("click", _.bind(this.onIgnoreSpell, this))
      view.menuToDictionaryTable.on("click", _.bind(this.onToDictionary, this))
      view.menuToDictionaryPara.on("click", _.bind(this.onToDictionary, this))
      view.menuTableAdvanced.on("click", _.bind(this.onTableAdvanced, this))
      view.menuImageAdvanced.on("click", _.bind(this.onImageAdvanced, this))
      view.menuImgOriginalSize.on("click", _.bind(this.onImgOriginalSize, this))
      view.menuImgShapeRotate.menu.items[0].on("click", _.bind(this.onImgRotate, this))
      view.menuImgShapeRotate.menu.items[1].on("click", _.bind(this.onImgRotate, this))
      view.menuImgShapeRotate.menu.items[3].on("click", _.bind(this.onImgFlip, this))
      view.menuImgShapeRotate.menu.items[4].on("click", _.bind(this.onImgFlip, this))
      view.menuImgCrop.menu.on("item:click", _.bind(this.onImgCrop, this))
      view.menuImgResetCrop.on("click", _.bind(this.onImgResetCrop, this))
      view.menuImgEditPoints.on("click", _.bind(this.onImgEditPoints, this))
      view.menuShapeAdvanced.on("click", _.bind(this.onShapeAdvanced, this))
      view.menuParagraphAdvanced.on("click", _.bind(this.onParagraphAdvanced, this))
      view.menuChartAdvanced.on("click", _.bind(this.onChartAdvanced, this))
      view.mnuGroupImg.on("click", _.bind(this.onGroupImg, this))
      view.mnuUnGroupImg.on("click", _.bind(this.onUnGroupImg, this))
      view.mnuArrangeFront.on("click", _.bind(this.onArrangeFront, this))
      view.mnuArrangeBack.on("click", _.bind(this.onArrangeBack, this))
      view.mnuArrangeForward.on("click", _.bind(this.onArrangeForward, this))
      view.mnuArrangeBackward.on("click", _.bind(this.onArrangeBackward, this))
      view.menuImgShapeAlign.menu.on("item:click", _.bind(this.onImgShapeAlign, this))
      view.menuShapesMerge.menu.on("item:click", _.bind(this.onShapesMerge, this))
      view.menuParagraphVAlign.menu.on("item:click", _.bind(this.onParagraphVAlign, this))
      view.menuParagraphDirection.menu.on("item:click", _.bind(this.onParagraphDirection, this))
      view.menuTableSelectText.menu.on("item:click", _.bind(this.tableSelectText, this))
      view.menuTableInsertText.menu.on("item:click", _.bind(this.tableInsertText, this))
      view.menuTableDeleteText.menu.on("item:click", _.bind(this.tableDeleteText, this))
      view.mnuGuides.menu.on("item:click", _.bind(this.onGuidesClick, this))
      view.mnuGridlines.menu.on("item:click", _.bind(this.onGridlinesClick, this))
      view.mnuRulers.on("click", _.bind(this.onRulersClick, this))
      view.menuTableEquationSettings.menu.on("item:click", _.bind(this.convertEquation, this))
      view.menuParagraphEquation.menu.on("item:click", _.bind(this.convertEquation, this))
      view.animEffectMenu.on("item:click", _.bind(this.onAnimEffect, this))
      view.mnuInsertMaster.on("click", _.bind(this.onInsertMaster, this))
      view.mnuInsertLayout.on("click", _.bind(this.onInsertLayout, this))
      view.mnuDuplicateMaster.on("click", _.bind(this.onDuplicateMaster, this))
      view.mnuPreserveMaster.on("toggle", _.bind(this.onPreserveMaster, this))
      view.mnuDuplicateLayout.on("click", _.bind(this.onDuplicateLayout, this))
      view.mnuDeleteMaster.on("click", _.bind(this.onDeleteMaster, this))
      view.mnuDeleteLayout.on("click", _.bind(this.onDeleteLayout, this))
      view.mnuRenameMaster.on("click", _.bind(this.onRename, this))
      view.mnuRenameLayout.on("click", _.bind(this.onRename, this))
      view.menuChartElement.on("item:click", _.bind(this.onChartElement, this))
      view.menuChartElement.menu.items.forEach((item) => {
        if (item.menu) {
          item.menu.items.forEach((item) => {
            item.on("click", () => {
              this.onChartElement(item.menu, item)
            })
          })
        }
      })
    }

    dh.fillMenuProps = function (selectedElements) {
      if (!selectedElements || !_.isArray(selectedElements)) return
      const documentHolder = this.documentHolder
      const menu_props = {}
      let menu_to_show = null
      _.each(selectedElements, (element, index) => {
        const elType = element.get_ObjectType()
        const elValue = element.get_ObjectValue()

        if (Asc.c_oAscTypeSelectElement.Image === elType) {
          menu_to_show = documentHolder.pictureMenu
          menu_props.imgProps = {}
          menu_props.imgProps.value = elValue
          menu_props.imgProps.locked = elValue ? elValue.get_Locked() : false
        } else if (Asc.c_oAscTypeSelectElement.Table === elType) {
          menu_to_show = documentHolder.tableMenu
          menu_props.tableProps = {}
          menu_props.tableProps.value = elValue
          menu_props.tableProps.locked = elValue ? elValue.get_Locked() : false
        } else if (Asc.c_oAscTypeSelectElement.Hyperlink === elType) {
          menu_props.hyperProps = {}
          menu_props.hyperProps.value = elValue
        } else if (Asc.c_oAscTypeSelectElement.Shape === elType) {
          // shape
          menu_to_show = documentHolder.pictureMenu
          menu_props.shapeProps = {}
          menu_props.shapeProps.value = elValue
          menu_props.shapeProps.locked = elValue ? elValue.get_Locked() : false
          if (elValue.get_FromChart()) menu_props.shapeProps.isChart = true
        } else if (Asc.c_oAscTypeSelectElement.Chart === elType) {
          menu_to_show = documentHolder.pictureMenu
          menu_props.chartProps = {}
          menu_props.chartProps.value = elValue
          menu_props.chartProps.locked = elValue ? elValue.get_Locked() : false
        } else if (Asc.c_oAscTypeSelectElement.Slide === elType) {
          menu_props.slideProps = {}
          menu_props.slideProps.value = elValue
          menu_props.slideProps.locked = elValue ? elValue.get_LockDelete() : false
        } else if (Asc.c_oAscTypeSelectElement.Paragraph === elType) {
          menu_props.paraProps = {}
          menu_props.paraProps.value = elValue
          menu_props.paraProps.locked = elValue ? elValue.get_Locked() : false
          if (
            (menu_props.shapeProps?.value || menu_props.chartProps?.value) && // text in shape, need to show paragraph menu with vertical align
            _.isUndefined(menu_props.tableProps)
          )
            menu_to_show = documentHolder.textMenu
        } else if (Asc.c_oAscTypeSelectElement.SpellCheck === elType) {
          menu_props.spellProps = {}
          menu_props.spellProps.value = elValue
          documentHolder._currentSpellObj = elValue
        } else if (Asc.c_oAscTypeSelectElement.Math === elType) {
          menu_props.mathProps = {}
          menu_props.mathProps.value = elValue
          documentHolder._currentMathObj = elValue
        }
      })
      if (menu_to_show === null) {
        if (!_.isUndefined(menu_props.paraProps)) menu_to_show = documentHolder.textMenu
        else if (!_.isUndefined(menu_props.slideProps)) {
          menu_to_show = documentHolder.slideMenu
        }
      }

      return { menu_to_show: menu_to_show, menu_props: menu_props }
    }

    dh.fillViewMenuProps = function (selectedElements) {
      if (!selectedElements || !_.isArray(selectedElements)) return
      const documentHolder = this.documentHolder
      if (!documentHolder.viewModeMenu) documentHolder.createDelayedElementsViewer()

      const menu_props = {}
      let menu_to_show = null
      _.each(selectedElements, (element, index) => {
        const elType = element.get_ObjectType()
        const elValue = element.get_ObjectValue()

        if (
          Asc.c_oAscTypeSelectElement.Image === elType ||
          Asc.c_oAscTypeSelectElement.Table === elType ||
          Asc.c_oAscTypeSelectElement.Shape === elType ||
          Asc.c_oAscTypeSelectElement.Chart === elType ||
          Asc.c_oAscTypeSelectElement.Paragraph === elType
        ) {
          menu_to_show = documentHolder.viewModeMenu
          menu_props.locked = menu_props.locked || (elValue ? elValue.get_Locked() : false)
          if (Asc.c_oAscTypeSelectElement.Chart === elType) menu_props.isChart = true
        } else if (Asc.c_oAscTypeSelectElement.Slide === elType) {
          menu_props.locked = menu_props.locked || (elValue ? elValue.get_LockDelete() : false)
        }
      })

      return menu_to_show ? { menu_to_show: menu_to_show, menu_props: menu_props } : null
    }

    dh.onHyperlinkClick = function (url) {
      if (url) {
        const type = this.api.asc_getUrlType(url)
        if (type === AscCommon.c_oAscUrlType.Http || type === AscCommon.c_oAscUrlType.Email)
          window.open(url)
        else {
          setTimeout(() => {
            Common.UI.warning({
              maxwidth: 500,
              msg: Common.Utils.String.format(this.documentHolder.txtWarnUrl, url),
              buttons: ["no", "yes"],
              primary: "no",
              callback: (btn) => {
                try {
                  btn === "yes" && window.open(url)
                } catch (err) {
                  err && console.log(err.stack)
                }
              },
            })
          }, 1)
        }
      }
    }

    dh.onMouseMove = function (moveData) {
      const cmpEl = this.documentHolder.cmpEl
      const screenTip = this.screenTip

      this.checkEditorOffsets()

      if (moveData) {
        let showPoint
        let ToolTip = ""
        const type = moveData.get_Type()

        if (
          type === Asc.c_oAscMouseMoveDataTypes.Hyperlink ||
          type === Asc.c_oAscMouseMoveDataTypes.Placeholder ||
          type === Asc.c_oAscMouseMoveDataTypes.EffectInfo
        ) {
          if (this.isTooltipHiding) {
            this.mouseMoveData = moveData
            return
          }
          if (type === Asc.c_oAscMouseMoveDataTypes.Hyperlink) {
            const hyperProps = moveData.get_Hyperlink()
            if (hyperProps) {
              ToolTip = _.isEmpty(hyperProps.get_ToolTip())
                ? hyperProps.get_Value()
                : hyperProps.get_ToolTip()
              ToolTip = Common.Utils.String.htmlEncode(ToolTip)
              if (ToolTip.length > 256) ToolTip = `${ToolTip.substr(0, 256)}...`
            }
          } else if (type === Asc.c_oAscMouseMoveDataTypes.Placeholder) {
            switch (moveData.get_PlaceholderType()) {
              case AscCommon.PlaceholderButtonType.Image:
                ToolTip = this.documentHolder.txtInsImage
                break
              case AscCommon.PlaceholderButtonType.ImageUrl:
                ToolTip = this.documentHolder.txtInsImageUrl
                break
              case AscCommon.PlaceholderButtonType.Chart:
                ToolTip = this.documentHolder.txtInsChart
                break
              case AscCommon.PlaceholderButtonType.Table:
                ToolTip = this.documentHolder.txtInsTable
                break
              case AscCommon.PlaceholderButtonType.Video:
                ToolTip = this.documentHolder.txtInsVideo
                break
              case AscCommon.PlaceholderButtonType.Audio:
                ToolTip = this.documentHolder.txtInsAudio
                break
              case AscCommon.PlaceholderButtonType.SmartArt:
                ToolTip = this.documentHolder.txtInsSmartArt
                break
            }
          } else if (type === Asc.c_oAscMouseMoveDataTypes.EffectInfo) {
            if (this.documentHolder.currentMenu?.isVisible()) return
            let tip = moveData.get_EffectText()
            if (!tip) {
              tip =
                this.getApplication()
                  .getController("Animation")
                  .getAnimationPanelTip(moveData.get_EffectDescription()) || ""
            }
            ToolTip = tip
          }
          let recalc = false
          screenTip.isHidden = false

          if (!this.screenTip.toolTip) {
            this.screenTip.toolTip = new Common.UI.Tooltip({
              owner: this,
              html: true,
              title: "<br><b>Press Ctrl and click link</b>",
            })
            this.screenTip.toolTip.on("tooltip:show", () => {
              $("#id_main_parent").on("mouseleave", this.wrapEvents.onMouseLeave)
            })
            this.screenTip.toolTip.on("tooltip:hide", () => {
              $("#id_main_parent").off("mouseleave", this.wrapEvents.onMouseLeave)
            })
          }

          if (
            screenTip.tipType !== type ||
            screenTip.tipLength !== ToolTip.length ||
            screenTip.strTip.indexOf(ToolTip) < 0
          ) {
            screenTip.toolTip.setTitle(
              type === Asc.c_oAscMouseMoveDataTypes.Hyperlink
                ? ToolTip +
                    (this.isPreviewVisible
                      ? ""
                      : `<br><b>${Common.Utils.String.platformKey("Ctrl", this.documentHolder.txtPressLink)}</b>`)
                : ToolTip,
            )
            screenTip.tipLength = ToolTip.length
            screenTip.strTip = ToolTip
            screenTip.tipType = type
            recalc = true
            screenTip.toolTip.getBSTip().options.container = this.isPreviewVisible
              ? "#pe-preview"
              : "body"
          }

          showPoint = [moveData.get_X(), moveData.get_Y()]
          showPoint[1] += (this.isPreviewVisible ? 0 : this._XY[1]) - 15
          showPoint[0] += (this.isPreviewVisible ? 0 : this._XY[0]) + 5

          if (!screenTip.isVisible || recalc) {
            screenTip.isVisible = true
            screenTip.toolTip.show([-10000, -10000])
          }

          if (recalc) {
            screenTip.tipHeight = screenTip.toolTip.getBSTip().$tip.height()
            screenTip.tipWidth = screenTip.toolTip.getBSTip().$tip.width()
          }
          showPoint[1] -= screenTip.tipHeight
          if (showPoint[1] < 0) showPoint[1] = 0
          if (showPoint[0] + screenTip.tipWidth > this._BodyWidth)
            showPoint[0] = this._BodyWidth - screenTip.tipWidth
          screenTip.toolTip
            .getBSTip()
            .$tip.css({ top: `${showPoint[1]}px`, left: `${showPoint[0]}px` })
        } else if (type === Asc.c_oAscMouseMoveDataTypes.Eyedropper) {
          if (this.eyedropperTip.isTipVisible) {
            this.eyedropperTip.isTipVisible = false
            this.eyedropperTip.toolTip.hide()
          }

          if (!this.eyedropperTip.toolTip) {
            const tipEl = $(
              '<div id="tip-container-eyedroppertip" style="position: absolute; z-index: 10000;"></div>',
            )
            this.documentHolder.cmpEl.append(tipEl)
            this.eyedropperTip.toolTip = new Common.UI.Tooltip({
              owner: tipEl,
              html: true,
              cls: "eyedropper-tooltip",
            })
          }

          const color = moveData.get_EyedropperColor().asc_getColor()
          const r = color.get_r()
          const g = color.get_g()
          const b = color.get_b()
          const hex = Common.Utils.ThemeColor.getHexColor(r, g, b)
          if (!this.eyedropperTip.eyedropperColor) {
            const colorEl = $(document.createElement("div"))
            colorEl.addClass("eyedropper-color")
            colorEl.appendTo(document.body)
            this.eyedropperTip.eyedropperColor = colorEl
            $("#id_main_view").on("mouseleave", _.bind(this.hideEyedropper, this))
          }
          this.eyedropperTip.eyedropperColor.css({
            backgroundColor: `#${hex}`,
            left: `${moveData.get_X() + this._XY[0] + 23}px`,
            top: `${moveData.get_Y() + this._XY[1] - 53}px`,
          })
          this.eyedropperTip.isVisible = true

          if (this.eyedropperTip.tipInterval) {
            clearInterval(this.eyedropperTip.tipInterval)
          }
          this.eyedropperTip.tipInterval = setInterval(() => {
            clearInterval(this.eyedropperTip.tipInterval)
            if (this.eyedropperTip.isVisible) {
              ToolTip = `<div>RGB (${r},${g},${b})</div><div>${moveData.get_EyedropperColor().asc_getName()}</div>`
              this.eyedropperTip.toolTip.setTitle(ToolTip)
              this.eyedropperTip.isTipVisible = true
              this.eyedropperTip.toolTip.show([-10000, -10000])
              this.eyedropperTip.tipWidth = this.eyedropperTip.toolTip.getBSTip().$tip.width()
              showPoint = [moveData.get_X(), moveData.get_Y()]
              showPoint[1] += this._XY[1] - 57
              showPoint[0] += this._XY[0] + 58
              if (showPoint[0] + this.eyedropperTip.tipWidth > this._BodyWidth) {
                showPoint[0] = showPoint[0] - this.eyedropperTip.tipWidth - 40
              }
              this.eyedropperTip.toolTip.getBSTip().$tip.css({
                top: `${showPoint[1]}px`,
                left: `${showPoint[0]}px`,
              })
            }
          }, 800)
          this.eyedropperTip.isHidden = false
        } else if (
          /** coauthoring begin **/
          type === Asc.c_oAscMouseMoveDataTypes.LockedObject &&
          this.mode.isEdit &&
          this.isUserVisible(moveData.get_UserId())
        ) {
          // 2 - locked object
          let src
          if (this.usertipcount >= this.usertips.length) {
            src = $(document.createElement("div"))
            src.addClass("username-tip")
            src.css({
              height: `${this._TtHeight}px`,
              "line-height": `${this._TtHeight}px`,
              position: "absolute",
              zIndex: "900",
              visibility: "visible",
            })
            $(document.body).append(src)
            if (this.userTooltip) {
              src.on("mouseover", this.wrapEvents.userTipMousover)
              src.on("mouseout", this.wrapEvents.userTipMousout)
            }

            this.usertips.push(src)
          }
          src = this.usertips[this.usertipcount]
          this.usertipcount++

          ToolTip = this.getUserName(moveData.get_UserId())

          showPoint = [moveData.get_X() + this._XY[0], moveData.get_Y() + this._XY[1]]
          const maxwidth = showPoint[0]
          showPoint[0] = this._BodyWidth - showPoint[0]
          showPoint[1] -= moveData.get_LockedObjectType() === 2 ? this._TtHeight : 0

          if (
            showPoint[1] > this._XY[1] &&
            showPoint[1] + this._TtHeight < this._XY[1] + this._Height
          ) {
            src.text(ToolTip)
            src.css({
              visibility: "visible",
              top: `${showPoint[1]}px`,
              right: `${showPoint[0]}px`,
              "max-width": `${maxwidth}px`,
            })
          }
        }
        /** coauthoring end **/
      }
    }

    dh.onShowForeignCursorLabel = function (UserId, X, Y, color) {
      if (!this.isUserVisible(UserId)) return
      let src
      for (let i = 0; i < this.fastcoauthtips.length; i++) {
        if (this.fastcoauthtips[i].attr("userid") === UserId) {
          src = this.fastcoauthtips[i]
          break
        }
      }

      if (!src) {
        src = $(document.createElement("div"))
        src.addClass("username-tip")
        src.attr("userid", UserId)
        src.css({
          height: `${this._TtHeight}px`,
          "line-height": `${this._TtHeight}px`,
          position: "absolute",
          zIndex: "900",
          display: "none",
          "pointer-events": "none",
          "background-color": `#${Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b())}`,
        })
        src.text(this.getUserName(UserId))
        $("#id_main_parent").append(src)
        this.fastcoauthtips.push(src)
        src.fadeIn(150)
      }
      src.css({ top: `${Y - this._TtHeight}px`, left: `${X}px` })
      /** coauthoring end **/
    }

    dh.onHideForeignCursorLabel = function (UserId) {
      for (let i = 0; i < this.fastcoauthtips.length; i++) {
        if (this.fastcoauthtips[i].attr("userid") === UserId) {
          const src = this.fastcoauthtips[i]
          this.fastcoauthtips[i].fadeOut(150, () => {
            src.remove()
          })
          this.fastcoauthtips.splice(i, 1)
          break
        }
      }
      /** coauthoring end **/
    }

    dh.onDialogAddHyperlink = function (isButton) {
      let win
      let props
      let text
      if (
        this.api &&
        this.mode.isEdit &&
        !this._isDisabled &&
        !PE.getController("LeftMenu").leftMenu.menuFile.isVisible()
      ) {
        const handlerDlg = (dlg, result) => {
          if (result === "ok") {
            props = dlg.getSettings()
            text !== false ? this.api.add_Hyperlink(props) : this.api.change_Hyperlink(props)
          }

          this.editComplete()
        }

        text = this.api.can_AddHyperlink()

        const _arr = []
        for (let i = 0; i < this.api.getCountPages(); i++) {
          _arr.push({
            displayValue: i + 1,
            value: i,
          })
        }
        if (text !== false) {
          win = new PE.Views.HyperlinkSettingsDialog({
            api: this.api,
            appOptions: this.mode,
            handler: handlerDlg,
            type: isButton === true ? c_oHyperlinkType.InternalLink : undefined,
            slides: _arr,
          })

          if (isButton && isButton instanceof Asc.CHyperlinkProperty) props = isButton
          else {
            props = new Asc.CHyperlinkProperty()
            props.put_Text(text)
          }

          win.show()
          win.setSettings(props)
        } else {
          const selectedElements = this.api.getSelectedElements()
          if (selectedElements && _.isArray(selectedElements)) {
            _.each(selectedElements, (el, i) => {
              if (selectedElements[i].get_ObjectType() === Asc.c_oAscTypeSelectElement.Hyperlink)
                props = selectedElements[i].get_ObjectValue()
            })
          }
          if (props) {
            win = new PE.Views.HyperlinkSettingsDialog({
              api: this.api,
              appOptions: this.mode,
              handler: handlerDlg,
              slides: _arr,
            })
            win.show()
            win.setSettings(props)
          }
        }
      }
      Common.component.Analytics.trackEvent("DocumentHolder", "Add Hyperlink")
    }

    dh.onPaintSlideNum = function (slideNum) {
      this.checkEditorOffsets()

      if (_.isUndefined(this.slideNumDiv)) {
        this.slideNumDiv = $(document.createElement("div"))
        this.slideNumDiv.addClass("slidenum-div")
        this.slideNumDiv.css({
          position: "absolute",
          display: "block",
          zIndex: "900",
          top: `${this._XY[1] + this._Height / 2}px`,
          right: `${this._BodyWidth - this._XY[0] - this._Width + 22}px`,
        })
        $(document.body).append(this.slideNumDiv)
      }

      this.slideNumDiv.html(`${this.documentHolder.txtSlide} ${slideNum + 1}`)
      this.slideNumDiv.show()
    }

    dh.onEndPaintSlideNum = function () {
      if (this.slideNumDiv) this.slideNumDiv.hide()
    }

    dh.onSpellCheckVariantsFound = function () {
      const selectedElements = this.api.getSelectedElements(true)
      let props
      if (selectedElements && _.isArray(selectedElements)) {
        for (let i = 0; i < selectedElements.length; i++) {
          if (selectedElements[i].get_ObjectType() === Asc.c_oAscTypeSelectElement.SpellCheck) {
            props = selectedElements[i].get_ObjectValue()
            this.documentHolder._currentSpellObj = props
            break
          }
        }
      }
      if (
        props &&
        props.get_Checked() === false &&
        props.get_Variants() !== null &&
        props.get_Variants() !== undefined
      ) {
        this.documentHolder.addWordVariants()
        if (this.documentHolder.textMenu?.isVisible()) {
          this.documentHolder.textMenu.alignPosition()
        }
      }
    }

    dh.equationCallback = function (eqObj) {
      eqObj && this.api.asc_SetMathProps(eqObj)
      this.editComplete()
    }

    dh.onApiCurrentPages = function (number) {
      if (
        this.documentHolder.currentMenu?.isVisible() &&
        this._isFromSlideMenu !== true &&
        this._isFromSlideMenu !== number
      )
        setTimeout(() => {
          this.documentHolder.currentMenu?.hide()
        }, 1)

      this._isFromSlideMenu = number
    }

    const _set = Asc.c_oAscChartTypeSettings
    const chartElementMap = {
      [_set.barNormal]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "dataTable",
        "errorBars",
        "gridLines",
        "legend",
        "trendLines",
      ],
      [_set.barStacked]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "dataTable",
        "errorBars",
        "gridLines",
        "legend",
      ],
      [_set.barStackedPer]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "dataTable",
        "errorBars",
        "gridLines",
        "legend",
      ],
      [_set.barNormal3d]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "dataTable",
        "gridLines",
        "legend",
      ],
      [_set.barStacked3d]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "dataTable",
        "gridLines",
        "legend",
      ],
      [_set.barStackedPer3d]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "dataTable",
        "gridLines",
        "legend",
      ],
      [_set.barNormal3dPerspective]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "dataTable",
        "gridLines",
        "legend",
      ],
      [_set.lineNormal]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "dataTable",
        "errorBars",
        "gridLines",
        "legend",
        "trendLines",
        "upDownBars",
      ],
      [_set.lineStacked]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "dataTable",
        "errorBars",
        "gridLines",
        "legend",
        "upDownBars",
      ],
      [_set.lineStackedPer]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "dataTable",
        "errorBars",
        "gridLines",
        "legend",
        "trendLines",
        "upDownBars",
      ],
      [_set.lineNormalMarker]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "dataTable",
        "errorBars",
        "gridLines",
        "legend",
        "trendLines",
        "upDownBars",
      ],
      [_set.lineStackedMarker]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "dataTable",
        "errorBars",
        "gridLines",
        "legend",
        "upDownBars",
      ],
      [_set.lineStackedPerMarker]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "dataTable",
        "errorBars",
        "gridLines",
        "legend",
        "upDownBars",
      ],
      [_set.line3d]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "dataTable",
        "gridLines",
        "legend",
      ],
      [_set.pie]: ["chartTitle", "dataLabels", "legend"],
      [_set.pie3d]: ["chartTitle", "dataLabels", "legend"],
      [_set.hBarNormal]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "dataTable",
        "errorBars",
        "gridLines",
        "legend",
        "trendLines",
      ],
      [_set.hBarStacked]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "dataTable",
        "errorBars",
        "gridLines",
        "legend",
      ],
      [_set.hBarStackedPer]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "dataTable",
        "errorBars",
        "gridLines",
        "legend",
      ],
      [_set.hBarNormal3d]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "dataTable",
        "gridLines",
        "legend",
      ],
      [_set.hBarStacked3d]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "dataTable",
        "gridLines",
        "legend",
      ],
      [_set.hBarStackedPer3d]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "dataTable",
        "gridLines",
        "legend",
      ],
      [_set.areaNormal]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "dataTable",
        "errorBars",
        "gridLines",
        "legend",
      ],
      [_set.areaStacked]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "dataTable",
        "errorBars",
        "gridLines",
        "legend",
      ],
      [_set.areaStackedPer]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "dataTable",
        "errorBars",
        "gridLines",
        "legend",
      ],
      [_set.doughnut]: ["chartTitle", "dataLabels", "legend"],
      [_set.stock]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "dataTable",
        "errorBars",
        "gridLines",
        "legend",
        "trendLines",
        "upDownBars",
      ],
      [_set.scatter]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "errorBars",
        "gridLines",
        "legend",
        "trendLines",
      ],
      [_set.scatterLine]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "errorBars",
        "gridLines",
        "legend",
        "trendLines",
      ],
      [_set.scatterLineMarker]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "errorBars",
        "gridLines",
        "legend",
        "trendLines",
      ],
      [_set.scatterMarker]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "errorBars",
        "gridLines",
        "legend",
        "trendLines",
      ],
      [_set.scatterNone]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "errorBars",
        "gridLines",
        "legend",
        "trendLines",
      ],
      [_set.scatterSmooth]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataTable",
        "errorBars",
        "gridLines",
        "legend",
        "trendLines",
      ],
      [_set.scatterSmoothMarker]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataTable",
        "errorBars",
        "gridLines",
        "legend",
        "trendLines",
      ],
      [_set.surfaceNormal]: ["axes", "axisTitles", "chartTitle", "gridLines", "legend"],
      [_set.surfaceWireframe]: ["axes", "axisTitles", "chartTitle", "gridLines", "legend"],
      [_set.contourNormal]: ["axes", "axisTitles", "chartTitle", "gridLines", "legend"],
      [_set.contourWireframe]: ["axes", "axisTitles", "chartTitle", "gridLines", "legend"],
      [_set.comboCustom]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "dataTable",
        "errorBars",
        "gridLines",
        "legend",
        "trendLines",
      ],
      [_set.comboBarLine]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "dataTable",
        "errorBars",
        "gridLines",
        "legend",
        "trendLines",
      ],
      [_set.comboBarLineSecondary]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "dataTable",
        "errorBars",
        "gridLines",
        "legend",
        "trendLines",
      ],
      [_set.comboAreaBar]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "dataTable",
        "errorBars",
        "gridLines",
        "legend",
      ],
      [_set.radar]: ["axes", "chartTitle", "dataLabels", "gridLines", "legend"],
      [_set.radarMarker]: ["axes", "chartTitle", "dataLabels", "gridLines", "legend"],
      [_set.radarFilled]: ["axes", "chartTitle", "dataLabels", "gridLines", "legend"],
      [_set.unknown]: [
        "axes",
        "axisTitles",
        "chartTitle",
        "dataLabels",
        "dataTable",
        "errorBars",
        "gridLines",
        "legend",
        "trendLines",
        "upDownBars",
      ],
    }

    dh.onChartElement = function (menu, item) {
      const chartProps = this.chartProps
      const HorAxis = chartProps.getHorAxesProps?.()[0]
      const SecHorAxis = chartProps.getHorAxesProps?.()[1]
      const VertAxis = chartProps.getVertAxesProps?.()[0]
      const SecVertAxis = chartProps.getVertAxesProps?.()[1]
      const DepthAxis = chartProps.getDepthAxesProps?.()[0]
      const HorMajorGridlines =
        HorAxis && (HorAxis.getGridlines() === 1 || HorAxis.getGridlines() === 3)
      const HorMinorGridlines =
        HorAxis && (HorAxis.getGridlines() === 2 || HorAxis.getGridlines() === 3)
      const VertMajorGridlines =
        VertAxis && (VertAxis.getGridlines() === 1 || VertAxis.getGridlines() === 3)
      const VertMinorGridlines =
        VertAxis && (VertAxis.getGridlines() === 2 || VertAxis.getGridlines() === 3)

      const value = item.value
      const type = chartProps.getType()
      const RadarChart = [_set.radar, _set.radarMarker, _set.radarFilled].includes(type)
      const hBarChart = [
        _set.hBarNormal,
        _set.hBarStacked,
        _set.hBarStackedPer,
        _set.hBarNormal3d,
        _set.hBarStacked3d,
        _set.hBarStackedPer3d,
      ].includes(type)
      const scatterChart = [
        _set.scatter,
        _set.scatterLine,
        _set.scatterLineMarker,
        _set.scatterMarker,
        _set.scatterNone,
        _set.scatterSmooth,
        _set.scatterSmoothMarker,
        _set.surfaceNormal,
      ].includes(type)
      const comboCustom = [_set.comboCustom].includes(type)

      switch (value) {
        case "bShowHorAxis":
          if (hBarChart) {
            chartProps.setDisplayAxes(
              VertAxis?.getShow(),
              SecVertAxis?.getShow(),
              item.checked,
              SecHorAxis?.getShow(),
              DepthAxis?.getShow(),
            )
          } else if (scatterChart) {
            chartProps.setDisplayAxes(
              SecVertAxis?.getShow(),
              SecHorAxis?.getShow(),
              item.checked,
              VertAxis?.getShow(),
              DepthAxis?.getShow(),
            )
          } else if (comboCustom) {
            chartProps.setDisplayAxes(
              item.checked,
              SecVertAxis?.getShow(),
              VertAxis?.getShow(),
              SecHorAxis?.getShow(),
              DepthAxis?.getShow(),
            )
          } else {
            chartProps.setDisplayAxes(
              item.checked,
              SecHorAxis?.getShow(),
              VertAxis?.getShow(),
              SecVertAxis?.getShow(),
              DepthAxis?.getShow(),
            )
          }
          break
        case "bShowVertAxis":
          if (hBarChart) {
            chartProps.setDisplayAxes(
              item.checked,
              SecVertAxis?.getShow(),
              HorAxis?.getShow(),
              SecHorAxis?.getShow(),
              DepthAxis?.getShow(),
            )
          } else if (scatterChart) {
            chartProps.setDisplayAxes(
              SecVertAxis?.getShow(),
              SecHorAxis?.getShow(),
              HorAxis?.getShow(),
              item.checked,
              DepthAxis?.getShow(),
            )
          } else if (comboCustom) {
            chartProps.setDisplayAxes(
              HorAxis?.getShow(),
              SecVertAxis?.getShow(),
              item.checked,
              SecHorAxis?.getShow(),
              DepthAxis?.getShow(),
            )
          } else {
            chartProps.setDisplayAxes(
              HorAxis?.getShow(),
              SecHorAxis?.getShow(),
              item.checked,
              SecVertAxis?.getShow(),
              DepthAxis?.getShow(),
            )
          }
          break
        case "bShowHorAxSec":
          if (comboCustom) {
            chartProps.setDisplayAxes(
              HorAxis?.getShow(),
              SecVertAxis?.getShow(),
              VertAxis?.getShow(),
              item.checked,
              DepthAxis?.getShow(),
            )
          } else {
            chartProps.setDisplayAxes(
              HorAxis?.getShow(),
              item.checked,
              VertAxis?.getShow(),
              SecVertAxis?.getShow(),
              DepthAxis?.getShow(),
            )
          }
          break
        case "bShowVertAxSec":
          if (comboCustom) {
            chartProps.setDisplayAxes(
              HorAxis?.getShow(),
              item.checked,
              VertAxis?.getShow(),
              SecHorAxis?.getShow(),
              DepthAxis?.getShow(),
            )
          } else {
            chartProps.setDisplayAxes(
              HorAxis?.getShow(),
              SecHorAxis?.getShow(),
              VertAxis?.getShow(),
              item.checked,
              DepthAxis?.getShow(),
            )
          }
          break
        case "bShowDepthAxes":
          chartProps.setDisplayAxes(
            HorAxis?.getShow(),
            SecHorAxis?.getShow(),
            VertAxis?.getShow(),
            SecVertAxis?.getShow(),
            item.checked,
          )
          break
        case "bShowHorAxTitle":
          if (hBarChart) {
            chartProps.setDisplayAxisTitles(
              VertAxis && VertAxis.getLabel() === 1,
              SecVertAxis && SecVertAxis.getLabel() === 1,
              item.checked,
              SecHorAxis && SecHorAxis.getLabel() === 1,
              DepthAxis && DepthAxis.getLabel() === 1,
            )
          } else if (scatterChart) {
            chartProps.setDisplayAxisTitles(
              SecHorAxis && SecHorAxis.getLabel() === 1,
              SecVertAxis && SecVertAxis.getLabel() === 1,
              item.checked,
              VertAxis && VertAxis.getLabel() === 1,
              DepthAxis && DepthAxis.getLabel() === 1,
            )
          } else if (comboCustom) {
            chartProps.setDisplayAxisTitles(
              item.checked,
              SecVertAxis && SecVertAxis.getLabel() === 1,
              VertAxis && VertAxis.getLabel() === 1,
              SecHorAxis && SecHorAxis.getLabel() === 1,
              DepthAxis && DepthAxis.getLabel() === 1,
            )
          } else {
            chartProps.setDisplayAxisTitles(
              item.checked,
              SecHorAxis && SecHorAxis.getLabel() === 1,
              VertAxis && VertAxis.getLabel() === 1,
              SecVertAxis && SecVertAxis.getLabel() === 1,
              DepthAxis && DepthAxis.getLabel() === 1,
            )
          }
          break
        case "bShowVertAxTitle":
          if (hBarChart) {
            chartProps.setDisplayAxisTitles(
              item.checked,
              SecVertAxis && SecVertAxis.getLabel() === 1,
              HorAxis && HorAxis.getLabel() === 1,
              SecHorAxis && SecHorAxis.getLabel() === 1,
              DepthAxis && DepthAxis.getLabel() === 1,
            )
          } else if (scatterChart) {
            chartProps.setDisplayAxisTitles(
              SecHorAxis && SecHorAxis.getLabel() === 1,
              SecVertAxis && SecVertAxis.getLabel() === 1,
              HorAxis && HorAxis.getLabel() === 1,
              item.checked,
              DepthAxis && DepthAxis.getLabel() === 1,
            )
          } else if (comboCustom) {
            chartProps.setDisplayAxisTitles(
              HorAxis && HorAxis.getLabel() === 1,
              SecVertAxis && SecVertAxis.getLabel() === 1,
              item.checked,
              SecHorAxis && SecHorAxis.getLabel() === 1,
              DepthAxis && DepthAxis.getLabel() === 1,
            )
          } else {
            chartProps.setDisplayAxisTitles(
              HorAxis && HorAxis.getLabel() === 1,
              SecHorAxis && SecHorAxis.getLabel() === 1,
              item.checked,
              SecVertAxis && SecVertAxis.getLabel() === 1,
              DepthAxis && DepthAxis.getLabel() === 1,
            )
          }
          break
        case "bShowHorAxTitleSec":
          if (comboCustom) {
            chartProps.setDisplayAxisTitles(
              HorAxis && HorAxis.getLabel() === 1,
              SecVertAxis && SecVertAxis.getLabel() === 1,
              VertAxis && VertAxis.getLabel() === 1,
              item.checked,
              DepthAxis && DepthAxis.getLabel() === 1,
            )
          } else {
            chartProps.setDisplayAxisTitles(
              HorAxis && HorAxis.getLabel() === 1,
              item.checked,
              VertAxis && VertAxis.getLabel() === 1,
              SecVertAxis && SecVertAxis.getLabel() === 1,
              DepthAxis && DepthAxis.getLabel() === 1,
            )
          }
          break
        case "bShowVertAxisTitleSec":
          if (comboCustom) {
            chartProps.setDisplayAxisTitles(
              HorAxis && HorAxis.getLabel() === 1,
              item.checked,
              VertAxis && VertAxis.getLabel() === 1,
              SecHorAxis && SecHorAxis.getLabel() === 1,
              DepthAxis && DepthAxis.getLabel() === 1,
            )
          } else {
            chartProps.setDisplayAxisTitles(
              HorAxis && HorAxis.getLabel() === 1,
              SecHorAxis && SecHorAxis.getLabel() === 1,
              VertAxis && VertAxis.getLabel() === 1,
              item.checked,
              DepthAxis && DepthAxis.getLabel() === 1,
            )
          }
          break
        case "bShowDepthAxisTitle":
          chartProps.setDisplayAxes(
            HorAxis && HorAxis.getLabel() === 1,
            SecHorAxis && SecHorAxis.getLabel() === 1,
            VertAxis && VertAxis.getLabel() === 1,
            SecVertAxis && SecVertAxis.getLabel() === 1,
            item.checked,
          )
          break
        case "bShowChartTitleNone":
          chartProps.setDisplayChartTitle(false, false)
          break
        case "bShowChartTitle":
          chartProps.setDisplayChartTitle(true, false)
          break
        case "bOverlayTitle":
          chartProps.setDisplayChartTitle(true, true)
          break
        case "CenterData":
          chartProps.setDisplayDataLabels(true, Asc.c_oAscChartDataLabelsPos.ctr)
          break
        case "InnerBottomData":
          chartProps.setDisplayDataLabels(true, Asc.c_oAscChartDataLabelsPos.inBase)
          break
        case "InnerTopData":
          chartProps.setDisplayDataLabels(true, Asc.c_oAscChartDataLabelsPos.inEnd)
          break
        case "OuterTopData":
          chartProps.setDisplayDataLabels(true, Asc.c_oAscChartDataLabelsPos.outEnd)
          break
        case "TopData":
          chartProps.setDisplayDataLabels(true, Asc.c_oAscChartDataLabelsPos.t)
          break
        case "LeftData":
          chartProps.setDisplayDataLabels(true, Asc.c_oAscChartDataLabelsPos.l)
          break
        case "RightData":
          chartProps.setDisplayDataLabels(true, Asc.c_oAscChartDataLabelsPos.r)
          break
        case "BottomData":
          chartProps.setDisplayDataLabels(true, Asc.c_oAscChartDataLabelsPos.b)
          break
        case "FitWidthData":
          chartProps.setDisplayDataLabels(true, Asc.c_oAscChartDataLabelsPos.bestFit)
          break
        case "bShowDataLabels":
          chartProps.setDisplayDataLabels(false, false)
          break
        // case 'bShowDataNone':
        //     chartProps.setDisplayDataTable(false, false);
        //     break;
        // case 'bShowDataTable':
        //     chartProps.setDisplayDataTable(true, false);
        //     break;
        // case 'bShowLegendKeys':
        //     chartProps.setDisplayDataTable(true, true);
        //     break;
        case "noneError":
          chartProps.setDisplayErrorBars(false)
          break
        case "standardError":
          chartProps.setDisplayErrorBars(true, 4)
          break
        case "percentage":
          chartProps.setDisplayErrorBars(true, 2)
          break
        case "standardDeviation":
          chartProps.setDisplayErrorBars(true, 3)
          break
        case "bShowHorMajor":
          if (hBarChart) {
            chartProps.setDisplayGridlines(
              HorMajorGridlines,
              item.checked,
              HorMinorGridlines,
              VertMinorGridlines,
            )
          } else
            chartProps.setDisplayGridlines(
              item.checked,
              HorMajorGridlines,
              VertMinorGridlines,
              HorMinorGridlines,
            )
          break
        case "bShowVerMajor":
          if (hBarChart || RadarChart) {
            chartProps.setDisplayGridlines(
              item.checked,
              VertMajorGridlines,
              HorMinorGridlines,
              VertMinorGridlines,
            )
          } else
            chartProps.setDisplayGridlines(
              VertMajorGridlines,
              item.checked,
              VertMinorGridlines,
              HorMinorGridlines,
            )
          break
        case "bShowHorMinor":
          if (hBarChart) {
            chartProps.setDisplayGridlines(
              HorMajorGridlines,
              VertMajorGridlines,
              HorMinorGridlines,
              item.checked,
            )
          } else
            chartProps.setDisplayGridlines(
              VertMajorGridlines,
              HorMajorGridlines,
              item.checked,
              HorMinorGridlines,
            )
          break
        case "bShowVerMinor":
          if (hBarChart || RadarChart) {
            chartProps.setDisplayGridlines(
              HorMajorGridlines,
              VertMajorGridlines,
              item.checked,
              VertMinorGridlines,
            )
          } else
            chartProps.setDisplayGridlines(
              VertMajorGridlines,
              HorMajorGridlines,
              VertMinorGridlines,
              item.checked,
            )
          break
        case "NoneLegend":
          chartProps.setDisplayLegend(false, Asc.c_oAscChartLegendShowSettings.none)
          break
        case "LeftLegend":
          chartProps.setDisplayLegend(true, Asc.c_oAscChartLegendShowSettings.left)
          break
        case "TopLegend":
          chartProps.setDisplayLegend(true, Asc.c_oAscChartLegendShowSettings.top)
          break
        case "RightLegend":
          chartProps.setDisplayLegend(true, Asc.c_oAscChartLegendShowSettings.right)
          break
        case "BottomLegend":
          chartProps.setDisplayLegend(true, Asc.c_oAscChartLegendShowSettings.bottom)
          break
        case "LeftOverlay":
          chartProps.setDisplayLegend(true, Asc.c_oAscChartLegendShowSettings.leftOverlay)
          break
        case "RightOverlay":
          chartProps.setDisplayLegend(true, Asc.c_oAscChartLegendShowSettings.rightOverlay)
          break
        case "trendLineNone":
          chartProps.setDisplayTrendlines(false, false, 0, 0)
          break
        case "trendLineLinear":
          chartProps.setDisplayTrendlines(true, 1, 0, 0)
          break
        case "trendLineExponential":
          chartProps.setDisplayTrendlines(true, 0, 0, 0)
          break
        case "trendLineForecast":
          chartProps.setDisplayTrendlines(true, 1, 2, 0)
          break
        case "trendLineMovingAverage":
          chartProps.setDisplayTrendlines(true, 3, 0, 0)
          break
        case "bShowUpDownBars":
          chartProps.setDisplayUpDownBars(true)
          break
        case "bShowUpDownNone":
          chartProps.setDisplayUpDownBars(false)
          break
      }
    }

    dh.updateChartElementMenu = (menu, chartProps) => {
      const type = chartProps.getType()
      const horAxes = chartProps.getHorAxesProps?.()
      const vertAxes = chartProps.getVertAxesProps?.()
      const depthAxes = chartProps.getDepthAxesProps?.()
      const dataLabelsPos = chartProps.getDataLabelsPos?.()
      const title = chartProps.getTitle?.()
      const legendPos = chartProps.getLegendPos?.()
      const GridMajor = Asc.c_oAscGridLinesSettings.major
      const GridMinor = Asc.c_oAscGridLinesSettings.minor
      const GridMajorMinor = Asc.c_oAscGridLinesSettings.majorMinor
      const ComboChart = [
        _set.comboCustom,
        _set.comboBarLine,
        _set.comboBarLineSecondary,
        _set.comboAreaBar,
      ].includes(type)
      const RadarChart = [_set.radar, _set.radarMarker, _set.radarFilled].includes(type)
      const LabelGroup1Types = [
        _set.barNormal,
        _set.barStacked,
        _set.barStackedPer,
        _set.hBarNormal,
        _set.hBarStacked,
        _set.hBarStackedPer,
      ]
      const LabelGroup2Types = [
        _set.barNormal,
        _set.barStacked,
        _set.barStackedPer,
        _set.pie,
        _set.pie3d,
        _set.hBarNormal,
        _set.hBarStacked,
        _set.hBarStackedPer,
      ]
      const LabelGroup3Types = [_set.barNormal, _set.pie, _set.pie3d, _set.hBarNormal]
      const LabelGroup4Types = [
        _set.lineNormal,
        _set.lineStacked,
        _set.lineStackedPer,
        _set.lineNormalMarker,
        _set.lineStackedMarker,
        _set.lineStackedPerMarker,
        _set.stock,
        _set.scatter,
        _set.scatterLine,
        _set.scatterLineMarker,
        _set.scatterSmooth,
        _set.scatterSmoothMarker,
      ]
      const LabelGroup5Types = [_set.pie, _set.pie3d]
      const comboType = ComboChart ? chartProps.getSeries?.()[0]?.asc_getChartType() : type
      const LabelGroup1 = LabelGroup1Types.includes(comboType)
      const LabelGroup2 = LabelGroup2Types.includes(comboType)
      const LabelGroup3 = LabelGroup3Types.includes(comboType)
      const LabelGroup4 = LabelGroup4Types.includes(comboType)
      const LabelGroup5 = LabelGroup5Types.includes(comboType)

      const axesMenu = menu.items[0].menu
      axesMenu.items[0].setVisible(!RadarChart)
      axesMenu.items[0].setChecked(!RadarChart && horAxes && horAxes[0] && horAxes[0].getShow())
      axesMenu.items[1].setChecked(vertAxes?.[0]?.getShow())
      axesMenu.items[4].setVisible(depthAxes?.[0])
      axesMenu.items[4].setChecked(depthAxes?.[0]?.getShow())
      if (ComboChart) {
        axesMenu.items[2].setVisible(horAxes?.[1])
        axesMenu.items[2].setChecked(horAxes?.[1]?.getShow())
        axesMenu.items[3].setVisible(vertAxes?.[1])
        axesMenu.items[3].setChecked(vertAxes?.[1]?.getShow())
      } else {
        axesMenu.items[2].setVisible(false)
        axesMenu.items[3].setVisible(false)
      }

      const titlesMenu = menu.items[1].menu
      titlesMenu.items[0].setChecked(
        horAxes?.[0] && horAxes[0].getLabel() === Asc.c_oAscChartHorAxisLabelShowSettings.noOverlay,
      )
      titlesMenu.items[1].setChecked(
        vertAxes?.[0] &&
          vertAxes[0].getLabel() === Asc.c_oAscChartVertAxisLabelShowSettings.rotated,
      )
      titlesMenu.items[4].setVisible(depthAxes?.[0])
      titlesMenu.items[4].setChecked(
        depthAxes?.[0] &&
          depthAxes[0].getLabel() === Asc.c_oAscChartVertAxisLabelShowSettings.rotated,
      )
      if (ComboChart) {
        titlesMenu.items[2].setVisible(horAxes?.[1])
        titlesMenu.items[2].setChecked(
          horAxes?.[1] &&
            horAxes[1].getLabel() === Asc.c_oAscChartHorAxisLabelShowSettings.noOverlay,
        )
        titlesMenu.items[3].setVisible(vertAxes?.[1])
        titlesMenu.items[3].setChecked(
          vertAxes?.[1] &&
            vertAxes[1].getLabel() === Asc.c_oAscChartVertAxisLabelShowSettings.rotated,
        )
      } else {
        titlesMenu.items[2].setVisible(false)
        titlesMenu.items[3].setVisible(false)
      }

      const titleMenu = menu.items[2].menu
      titleMenu.items[0].setChecked(title === Asc.c_oAscChartTitleShowSettings.none)
      titleMenu.items[1].setChecked(title === Asc.c_oAscChartTitleShowSettings.noOverlay)
      titleMenu.items[2].setChecked(title === Asc.c_oAscChartTitleShowSettings.overlay)

      const labelsMenu = menu.items[3].menu
      labelsMenu.items[0].setChecked(dataLabelsPos === Asc.c_oAscChartDataLabelsPos.none)
      labelsMenu.items[1].setChecked(dataLabelsPos === Asc.c_oAscChartDataLabelsPos.ctr)
      labelsMenu.items[2].setChecked(
        LabelGroup1 && dataLabelsPos === Asc.c_oAscChartDataLabelsPos.inBase,
      )
      labelsMenu.items[3].setChecked(
        LabelGroup2 && dataLabelsPos === Asc.c_oAscChartDataLabelsPos.inEnd,
      )
      labelsMenu.items[4].setChecked(
        LabelGroup3 && dataLabelsPos === Asc.c_oAscChartDataLabelsPos.outEnd,
      )
      labelsMenu.items[5].setChecked(
        LabelGroup4 && dataLabelsPos === Asc.c_oAscChartDataLabelsPos.t,
      )
      labelsMenu.items[6].setChecked(
        LabelGroup4 && dataLabelsPos === Asc.c_oAscChartDataLabelsPos.l,
      )
      labelsMenu.items[7].setChecked(
        LabelGroup4 && dataLabelsPos === Asc.c_oAscChartDataLabelsPos.r,
      )
      labelsMenu.items[8].setChecked(
        LabelGroup4 && dataLabelsPos === Asc.c_oAscChartDataLabelsPos.b,
      )
      labelsMenu.items[9].setChecked(
        LabelGroup5 && dataLabelsPos === Asc.c_oAscChartDataLabelsPos.bestFit,
      )
      if (dataLabelsPos !== undefined) {
        labelsMenu.items[2].setVisible(LabelGroup1)
        labelsMenu.items[3].setVisible(LabelGroup2)
        labelsMenu.items[4].setVisible(LabelGroup3)
        labelsMenu.items[5].setVisible(LabelGroup4)
        labelsMenu.items[6].setVisible(LabelGroup4)
        labelsMenu.items[7].setVisible(LabelGroup4)
        labelsMenu.items[8].setVisible(LabelGroup4)
        labelsMenu.items[9].setVisible(LabelGroup5)
      }

      // const tableMenu = menu.items[4].menu;
      // highlightSubmenuItem(tableMenu.items[0], false, 'table');
      // highlightSubmenuItem(tableMenu.items[1], false, 'table');
      // highlightSubmenuItem(tableMenu.items[2], false,'table');

      const gridMenu = menu.items[5].menu
      gridMenu.items[0].setVisible(true)
      gridMenu.items[2].setVisible(true)
      if (RadarChart) {
        gridMenu.items[0].setVisible(false)
        gridMenu.items[0].setChecked(false)
        gridMenu.items[1].setChecked(
          vertAxes?.[0] &&
            (vertAxes[0].getGridlines() === GridMajor ||
              vertAxes[0].getGridlines() === GridMajorMinor),
        )
        gridMenu.items[2].setChecked(false)
        gridMenu.items[2].setVisible(false)
        gridMenu.items[3].setChecked(
          vertAxes?.[0] &&
            (vertAxes[0].getGridlines() === GridMinor ||
              vertAxes[0].getGridlines() === GridMajorMinor),
        )
      } else if (
        type !== Asc.c_oAscChartTypeSettings.pie &&
        type !== Asc.c_oAscChartTypeSettings.pie3d
      ) {
        gridMenu.items[0].setChecked(
          vertAxes?.[0] &&
            (vertAxes[0].getGridlines() === GridMajor ||
              vertAxes[0].getGridlines() === GridMajorMinor),
        )
        gridMenu.items[1].setChecked(
          horAxes?.[0] &&
            (horAxes[0].getGridlines() === GridMajor ||
              horAxes[0].getGridlines() === GridMajorMinor),
        )
        gridMenu.items[2].setChecked(
          vertAxes?.[0] &&
            (vertAxes[0].getGridlines() === GridMinor ||
              vertAxes[0].getGridlines() === GridMajorMinor),
        )
        gridMenu.items[3].setChecked(
          horAxes?.[0] &&
            (horAxes[0].getGridlines() === GridMinor ||
              horAxes[0].getGridlines() === GridMajorMinor),
        )
      }

      const legendMenu = menu.items[6].menu
      legendMenu.items[0].setChecked(legendPos === Asc.c_oAscChartLegendShowSettings.none)
      legendMenu.items[1].setChecked(legendPos === Asc.c_oAscChartLegendShowSettings.top)
      legendMenu.items[2].setChecked(legendPos === Asc.c_oAscChartLegendShowSettings.left)
      legendMenu.items[3].setChecked(legendPos === Asc.c_oAscChartLegendShowSettings.right)
      legendMenu.items[4].setChecked(legendPos === Asc.c_oAscChartLegendShowSettings.bottom)
      legendMenu.items[5].setChecked(legendPos === Asc.c_oAscChartLegendShowSettings.leftOverlay)
      legendMenu.items[6].setChecked(legendPos === Asc.c_oAscChartLegendShowSettings.rightOverlay)

      const supportedElements = chartElementMap[type] || []
      menu.items.forEach((item) => {
        item.setVisible(supportedElements.includes(item.value))
      })
    }

    dh.onSingleChartSelectionChanged = function (asc_CRect) {
      if (this.mode && !this.mode.isEdit) return
      const documentHolderView = this.documentHolder
      let chartContainer = documentHolderView.cmpEl.find("#chart-element-container")
      this._state.currentChartRect = asc_CRect

      this.getCurrentChartProps = () => {
        const selectedElements = this.api.getSelectedElements()
        if (selectedElements && selectedElements.length > 0) {
          let elType
          for (let i = selectedElements.length - 1; i >= 0; i--) {
            elType = selectedElements[i].get_ObjectType()

            if (elType === Asc.c_oAscTypeSelectElement.Chart) {
              return this.api.asc_getChartSettings(true)
            }
          }
        }
        return null
      }

      this.chartProps = this.getCurrentChartProps()

      if (chartContainer.length < 1) {
        chartContainer = $(
          '<div id="chart-element-container" style="position: absolute; z-index: 990;"><div id="id-document-holder-btn-chart-element"></div></div>',
        )
        documentHolderView.cmpEl.append(chartContainer)
      }

      this.isRtlSheet = this.api ? Common.UI.isRTL() : false

      if (this.chartProps) {
        if (!this.btnChartElement) {
          this.btnChartElement = new Common.UI.Button({
            parentEl: $("#id-document-holder-btn-chart-element"),
            cls: "btn-toolbar",
            iconCls: "toolbar__icon btn-chart-elements",
            hint: this.documentHolder.btnChart,
            menu: this.documentHolder.menuChartElement.menu,
          })

          this.btnChartElement.on("click", () => {
            this.chartProps = this.getCurrentChartProps()
            if (this.chartProps) {
              this.updateChartElementMenu(
                this.documentHolder.menuChartElement.menu,
                this.chartProps,
              )
            }
            Common.UI.TooltipManager.closeTip("chartElements")
          })
        }

        this._XY = undefined
        this.checkEditorOffsets()
        const x = asc_CRect.asc_getX()
        const y = asc_CRect.asc_getY()
        const width = asc_CRect.asc_getWidth()
        const height = asc_CRect.asc_getHeight()
        let btn
        let btnTop = y
        const btnWidth = 50
        const leftMenuWidth = $("#id_panel_thumbnails").outerWidth() || 0
        const offsetLeft = chartContainer.width() === 40 ? 48 : 40
        const leftSide = x - offsetLeft
        const rightSide = x + width + 10

        if (this.isRtlSheet) {
          if (leftSide >= 0) {
            btn = leftSide
          } else if (rightSide + btnWidth <= this._Width - leftMenuWidth) {
            btn = rightSide
          } else {
            chartContainer.hide()
            Common.UI.TooltipManager.closeTip("chartElements")
            return
          }
        } else {
          if (rightSide + btnWidth <= this._Width + 20) {
            btn = rightSide
          } else if (leftSide >= leftMenuWidth) {
            btn = leftSide
          } else {
            chartContainer.hide()
            Common.UI.TooltipManager.closeTip("chartElements")
            return
          }
        }

        if (btnTop < 0) btnTop = 0

        if (y < 0) {
          const chartBottom = y + height
          if (chartBottom < 20) {
            chartContainer.hide()
            Common.UI.TooltipManager.closeTip("chartElements")
            return
          }
        }

        chartContainer
          .css({
            left: `${btn}px`,
            top: `${btnTop}px`,
          })
          .show()
        setTimeout(() => {
          Common.UI.TooltipManager.showTip("chartElements")
          Common.UI.TooltipManager.applyPlacement("chartElements")
        }, 100)

        this.disableChartElementButton()
      } else {
        chartContainer.hide()
        Common.UI.TooltipManager.closeTip("chartElements")
      }
    }

    dh.onHideChartElementButton = function () {
      if (!this.documentHolder || !this.documentHolder.cmpEl) return
      const chartContainer = this.documentHolder.cmpEl.find("#chart-element-container")
      if (chartContainer.is(":visible")) {
        chartContainer.hide()
        Common.UI.TooltipManager.closeTip("chartElements")
      }
    }

    dh.disableChartElementButton = function () {
      const chartContainer = this.documentHolder.cmpEl.find("#chart-element-container")
      const disabled = this._isDisabled || this._state.chartLocked

      if (chartContainer.length > 0 && chartContainer.is(":visible")) {
        this.btnChartElement.setDisabled(!!disabled)
      }
    }

    dh.onShowSpecialPasteOptions = function (specialPasteShowOptions) {
      if (this.mode && !this.mode.isEdit) return
      const documentHolder = this.documentHolder
      const coord = specialPasteShowOptions.asc_getCellCoord()
      let pasteContainer = documentHolder.cmpEl.find("#special-paste-container")
      const pasteItems = specialPasteShowOptions.asc_getOptions()
      if (!pasteItems) return

      // Prepare menu container
      if (pasteContainer.length < 1) {
        this._arrSpecialPaste = []
        this._arrSpecialPaste[Asc.c_oSpecialPasteProps.paste] = documentHolder.textPaste
        this._arrSpecialPaste[Asc.c_oSpecialPasteProps.keepTextOnly] =
          documentHolder.txtKeepTextOnly
        this._arrSpecialPaste[Asc.c_oSpecialPasteProps.picture] = documentHolder.txtPastePicture
        this._arrSpecialPaste[Asc.c_oSpecialPasteProps.sourceformatting] =
          documentHolder.txtPasteSourceFormat
        this._arrSpecialPaste[Asc.c_oSpecialPasteProps.destinationFormatting] =
          documentHolder.txtPasteDestFormat
        this._arrSpecialPaste[Asc.c_oSpecialPasteProps.sourceFormattingEmbedding] =
          documentHolder.txtSourceEmbed
        this._arrSpecialPaste[Asc.c_oSpecialPasteProps.destinationFormattingEmbedding] =
          documentHolder.txtDestEmbed
        this._arrSpecialPaste[Asc.c_oSpecialPasteProps.sourceFormattingLink] =
          documentHolder.txtSourceLink
        this._arrSpecialPaste[Asc.c_oSpecialPasteProps.destinationFormattingLink] =
          documentHolder.txtDestLink

        pasteContainer = $(
          '<div id="special-paste-container" style="position: absolute;"><div id="id-document-holder-btn-special-paste"></div></div>',
        )
        documentHolder.cmpEl.append(pasteContainer)

        this.btnSpecialPaste = new Common.UI.Button({
          parentEl: $("#id-document-holder-btn-special-paste"),
          cls: "btn-toolbar",
          iconCls: "toolbar__icon btn-paste",
          caption: Common.Utils.String.format("({0})", Common.Utils.String.textCtrl),
          menu: new Common.UI.Menu({ items: [] }),
        })
        this.initSpecialPasteEvents()
      }

      if (pasteItems.length > 0) {
        const menu = this.btnSpecialPaste.menu
        for (let i = 0; i < menu.items.length; i++) {
          menu.removeItem(menu.items[i])
          i--
        }

        const group_prev = -1
        _.each(pasteItems, (menuItem, index) => {
          const mnu = new Common.UI.MenuItem({
            caption: `${this._arrSpecialPaste[menuItem]} (${this.hkSpecPaste[menuItem]})`,
            value: menuItem,
            checkable: true,
            toggleGroup: "specialPasteGroup",
          }).on("click", _.bind(this.onSpecialPasteItemClick, this))
          menu.addItem(mnu)
        })
        menu.items.length > 0 && menu.items[0].setChecked(true, true)
      }
      if (coord.asc_getX() < 0 || coord.asc_getY() < 0) {
        if (pasteContainer.is(":visible")) pasteContainer.hide()
        $(document).off("keyup", this.wrapEvents.onKeyUp)
      } else {
        let offsetLeft = 0
        const sdkPanelLeft = documentHolder.cmpEl.find("#id_panel_left")
        if (sdkPanelLeft.length)
          offsetLeft += sdkPanelLeft.css("display") !== "none" ? sdkPanelLeft.width() : 0

        const showPoint = [
          Math.max(0, coord.asc_getX() + coord.asc_getWidth() + 3 - offsetLeft),
          coord.asc_getY() + coord.asc_getHeight() + 3,
        ]
        if (showPoint[0] > this._Width || showPoint[1] > this._Height) {
          if (pasteContainer.is(":visible")) pasteContainer.hide()
          $(document).off("keyup", this.wrapEvents.onKeyUp)
          return
        }
        if (showPoint[1] + pasteContainer.height() > this._Height)
          showPoint[1] = this._Height - pasteContainer.height()
        if (showPoint[0] + pasteContainer.width() > this._Width)
          showPoint[0] = this._Width - pasteContainer.width()
        if (
          this.btnSpecialPaste.menu.isVisible() &&
          (Number.parseInt(pasteContainer.css("left")) !== showPoint[0] ||
            Number.parseInt(pasteContainer.css("top")) !== showPoint[1])
        ) {
          this.btnSpecialPaste.menu.hide()
        }

        pasteContainer.css({ left: showPoint[0], top: showPoint[1] })
        pasteContainer.show()
        setTimeout(() => {
          $(document).on("keyup", this.wrapEvents.onKeyUp)
        }, 10)
      }
      this.disableSpecialPaste()
    }

    dh.onHideSpecialPasteOptions = function () {
      if (!this.documentHolder || !this.documentHolder.cmpEl) return
      const pasteContainer = this.documentHolder.cmpEl.find("#special-paste-container")
      if (pasteContainer.is(":visible")) {
        pasteContainer.hide()
        $(document).off("keyup", this.wrapEvents.onKeyUp)
      }
    }

    dh.disableSpecialPaste = function () {
      const pasteContainer = this.documentHolder.cmpEl.find("#special-paste-container")
      if (pasteContainer.length > 0 && pasteContainer.is(":visible")) {
        this.btnSpecialPaste.setDisabled(!!this._isDisabled)
      }
    }

    dh.initSpecialPasteEvents = function () {
      const me = this
      me.hkSpecPaste = []
      me.hkSpecPaste[Asc.c_oSpecialPasteProps.paste] = "P"
      me.hkSpecPaste[Asc.c_oSpecialPasteProps.keepTextOnly] = "T"
      me.hkSpecPaste[Asc.c_oSpecialPasteProps.picture] = "U"
      me.hkSpecPaste[Asc.c_oSpecialPasteProps.sourceformatting] = "K"
      me.hkSpecPaste[Asc.c_oSpecialPasteProps.destinationFormatting] = "H"
      me.hkSpecPaste[Asc.c_oSpecialPasteProps.sourceFormattingEmbedding] = "K"
      me.hkSpecPaste[Asc.c_oSpecialPasteProps.destinationFormattingEmbedding] = "H"
      me.hkSpecPaste[Asc.c_oSpecialPasteProps.sourceFormattingLink] = "F"
      me.hkSpecPaste[Asc.c_oSpecialPasteProps.destinationFormattingLink] = "L"

      let str = ""
      for (const key in me.hkSpecPaste) {
        if (me.hkSpecPaste.hasOwnProperty(key)) {
          if (str.indexOf(me.hkSpecPaste[key]) < 0) str += `${me.hkSpecPaste[key]},`
        }
      }
      str = str.substring(0, str.length - 1)
      const keymap = {}
      keymap[str] = _.bind(function (e) {
        const menu = this.btnSpecialPaste.menu
        for (let i = 0; i < menu.items.length; i++) {
          if (this.hkSpecPaste[menu.items[i].value] === String.fromCharCode(e.keyCode)) {
            return me.onSpecialPasteItemClick({ value: menu.items[i].value })
          }
        }
      }, me)
      Common.util.Shortcuts.delegateShortcuts({ shortcuts: keymap })
      Common.util.Shortcuts.suspendEvents(str, undefined, true)

      me.btnSpecialPaste.menu
        .on("show:after", (menu) => {
          Common.util.Shortcuts.resumeEvents(str)
        })
        .on("hide:after", (menu) => {
          Common.util.Shortcuts.suspendEvents(str, undefined, true)
        })
    }

    dh.onChangeCropState = function (state) {
      this.documentHolder.menuImgCrop?.menu.items[0].setChecked(state, true)
    }

    dh.onDoubleClickOnTableOleObject = function (frameBinary) {
      if (!Common.Controllers.LaunchController.isScriptLoaded()) return
      if (this.mode.isEdit && !this._isDisabled) {
        const oleEditor = PE.getController("Common.Controllers.ExternalOleEditor").getView(
          "Common.Views.ExternalOleEditor",
        )
        if (oleEditor && frameBinary) {
          oleEditor.setEditMode(true)
          oleEditor.show()
          oleEditor.setOleData(frameBinary)
        }
      }
    }

    dh.addHyperlink = function (item) {
      let win
      if (this.api) {
        const _arr = []
        for (let i = 0; i < this.api.getCountPages(); i++) {
          _arr.push({
            displayValue: i + 1,
            value: i,
          })
        }
        win = new PE.Views.HyperlinkSettingsDialog({
          api: this.api,
          appOptions: this.mode,
          handler: (dlg, result) => {
            if (result === "ok") {
              this.api.add_Hyperlink(dlg.getSettings())
            }
            this.editComplete()
          },
          slides: _arr,
        })

        win.show()
        win.setSettings(item.hyperProps.value)

        Common.component.Analytics.trackEvent("DocumentHolder", "Add Hyperlink")
      }
    }

    dh.editHyperlink = function (item, e) {
      let win
      if (this.api) {
        const _arr = []
        for (let i = 0; i < this.api.getCountPages(); i++) {
          _arr.push({
            displayValue: i + 1,
            value: i,
          })
        }
        win = new PE.Views.HyperlinkSettingsDialog({
          api: this.api,
          appOptions: this.mode,
          handler: (dlg, result) => {
            if (result === "ok") {
              this.api.change_Hyperlink(win.getSettings())
            }
            this.editComplete()
          },
          slides: _arr,
        })
        win.show()
        win.setSettings(item.hyperProps.value)

        Common.component.Analytics.trackEvent("DocumentHolder", "Edit Hyperlink")
      }
    }

    dh.removeHyperlink = function (item) {
      if (this.api) {
        this.api.remove_Hyperlink()
      }

      this.editComplete()
      Common.component.Analytics.trackEvent("DocumentHolder", "Remove Hyperlink")
    }

    dh.saveAsPicture = function () {
      if (this.api) {
        this.api.asc_SaveDrawingAsPicture()
      }
    }

    dh.editChartClick = function (chart, placeholder) {
      if (!Common.Controllers.LaunchController.isScriptLoaded()) return
      this.api.asc_editChartInFrameEditor()
    }

    dh.onDoubleClickOnChart = function (chart) {
      if (!Common.Controllers.LaunchController.isScriptLoaded()) return

      if (this.mode.isEdit && !this._isDisabled) {
        const diagramEditor = this.getApplication()
          .getController("Common.Controllers.ExternalDiagramEditor")
          .getView("Common.Views.ExternalDiagramEditor")
        if (diagramEditor && chart) {
          let x
          let y
          if (this._state.currentChartRect) {
            this.checkEditorOffsets()

            diagramEditor.setSize(
              diagramEditor.initConfig.initwidth,
              diagramEditor.initConfig.initheight,
            )

            const dlgW = diagramEditor.getWidth() || diagramEditor.initConfig.initwidth
            const dlgH = diagramEditor.getHeight() || diagramEditor.initConfig.initheight
            const rect_x = this._state.currentChartRect.asc_getX()
            const rect_y = this._state.currentChartRect.asc_getY()
            const w = this._state.currentChartRect.asc_getWidth()
            const h = this._state.currentChartRect.asc_getHeight()
            y = this._XY[1] + rect_y + h
            if (y + dlgH > Common.Utils.innerHeight()) {
              y = this._XY[1] + rect_y - dlgH
              if (y < 0) {
                y = Common.Utils.innerHeight() - dlgH
              }
            }
            x = this._XY[0] + rect_x - (dlgW - w) / 2
            if (x + dlgW > Common.Utils.innerWidth()) x = Common.Utils.innerWidth() - dlgW
          }
          diagramEditor.setEditMode(true)
          diagramEditor.show(x, y)
          diagramEditor.setChartData(chart)
        }
      }
    }

    dh.onEditObject = function () {
      if (!Common.Controllers.LaunchController.isScriptLoaded()) return
      if (this.api) {
        const oleobj = this.api.asc_canEditTableOleObject()
        if (oleobj) {
          this.api.asc_editOleTableInFrameEditor()
        } else {
          this.api.asc_startEditCurrentOleObject()
        }
      }
    }

    dh.onCutCopyPaste = function (item, e) {
      if (this.api) {
        const res =
          item.value === "cut"
            ? this.api.Cut()
            : item.value === "copy"
              ? this.api.Copy()
              : this.api.Paste()
        if (!res) {
          if (
            !Common.localStorage.getBool("pe-hide-copywarning") &&
            (item.value === "paste" || this.mode.canCopy)
          ) {
            new Common.Views.CopyWarningDialog({
              handler: (dontshow) => {
                if (dontshow) Common.localStorage.setItem("pe-hide-copywarning", 1)
                this.editComplete()
              },
            }).show()
          }
        }
      }
      this.editComplete()
    }

    dh.onInsertImage = function (placeholder, obj, x, y) {
      if (placeholder) {
        this.hideScreenTip()
        this.onHidePlaceholderActions()
      }
      if (this.api) placeholder ? this.api.asc_addImage(obj) : this.api.ChangeImageFromFile()
      this.editComplete()
    }

    dh.onInsertImageUrl = function (placeholder, obj, x, y) {
      if (!Common.Controllers.LaunchController.isScriptLoaded()) return

      if (placeholder) {
        this.hideScreenTip()
        this.onHidePlaceholderActions()
      }
      new Common.Views.ImageFromUrlDialog({
        handler: (result, value) => {
          if (result === "ok") {
            if (this.api) {
              const checkUrl = value.replace(/ /g, "")
              if (!_.isEmpty(checkUrl)) {
                if (placeholder) this.api.AddImageUrl([checkUrl], undefined, undefined, obj)
                else {
                  const props = new Asc.asc_CImgProperty()
                  props.put_ImageUrl(checkUrl)
                  this.api.ImgApply(props, obj)
                }
              }
            }
          }
          this.editComplete()
        },
      }).show()
    }

    dh.onClickPlaceholderChart = function (obj, x, y) {
      if (!this.api || !Common.Controllers.LaunchController.isScriptLoaded()) return

      this._state.placeholderObj = obj
      let menu = this.placeholderMenuChart
      let menuContainer = menu
        ? this.documentHolder.cmpEl.find(Common.Utils.String.format("#menu-container-{0}", menu.id))
        : null
      this._fromShowPlaceholder = true
      Common.UI.Menu.Manager.hideAll()

      if (!menu) {
        this.placeholderMenuChart = menu = new Common.UI.Menu({
          style: "width: 364px;padding-top: 12px;",
          items: [
            {
              template: _.template(
                '<div id="id-placeholder-menu-chart" class="menu-insertchart"></div>',
              ),
            },
          ],
        })
        // Prepare menu container
        menuContainer = $(
          Common.Utils.String.format(
            '<div id="menu-container-{0}" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>',
            menu.id,
          ),
        )
        this.documentHolder.cmpEl.append(menuContainer)
        menu.render(menuContainer)
        menu.cmpEl.attr({ tabindex: "-1" })
        menu.on("hide:after", () => {
          if (!this._fromShowPlaceholder) this.api.asc_uncheckPlaceholders()
        })

        const picker = new Common.UI.DataView({
          el: $("#id-placeholder-menu-chart"),
          parentMenu: menu,
          showLast: false,
          // restoreHeight: 421,
          groups: new Common.UI.DataViewGroupStore(Common.define.chartData.getChartGroupData()),
          store: new Common.UI.DataViewStore(Common.define.chartData.getChartData()),
          itemTemplate: _.template(
            '<div id="<%= id %>" class="item-chartlist"><svg width="40" height="40" class="icon uni-scale"><use xlink:href="#chart-<%= iconCls %>"></use></svg></div>',
          ),
        })
        picker.on("item:click", (picker, item, record, e) => {
          this.api.asc_addChartDrawingObject(record.get("type"), this._state.placeholderObj, true)
        })
      }
      menuContainer.css({ left: x, top: y })
      menuContainer.attr("data-value", "prevent-canvas-click")
      this._preventClick = true
      setTimeout(() => {
        menu.show()

        menu.alignPosition()
        _.delay(() => {
          menu.cmpEl.find(".dataview").focus()
        }, 10)
      }, 1)
      this._fromShowPlaceholder = false
    }

    dh.onClickPlaceholderTable = function (obj, x, y) {
      if (!this.api) return

      this._state.placeholderObj = obj
      let menu = this.placeholderMenuTable
      let menuContainer = menu
        ? this.documentHolder.cmpEl.find(Common.Utils.String.format("#menu-container-{0}", menu.id))
        : null
      this._fromShowPlaceholder = true
      Common.UI.Menu.Manager.hideAll()

      if (!menu) {
        this.placeholderMenuTable = menu = new Common.UI.Menu({
          cls: "shifted-left",
          items: [
            {
              template: _.template(
                '<div id="id-placeholder-menu-tablepicker" class="dimension-picker" style="margin: 5px 10px;"></div>',
              ),
            },
            { caption: this.documentHolder.mniCustomTable, value: "custom" },
          ],
        })
        // Prepare menu container
        menuContainer = $(
          Common.Utils.String.format(
            '<div id="menu-container-{0}" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>',
            menu.id,
          ),
        )
        this.documentHolder.cmpEl.append(menuContainer)
        menu.render(menuContainer)
        menu.cmpEl.attr({ tabindex: "-1" })
        menu.on("hide:after", () => {
          if (!this._fromShowPlaceholder) this.api.asc_uncheckPlaceholders()
        })

        const picker = new Common.UI.DimensionPicker({
          el: $("#id-placeholder-menu-tablepicker"),
          minRows: 8,
          minColumns: 10,
          maxRows: 8,
          maxColumns: 10,
        })
        picker.on("select", (picker, columns, rows) => {
          this.api.put_Table(columns, rows, this._state.placeholderObj)
          this.editComplete()
        })
        menu.on("item:click", (menu, item, e) => {
          if (item.value === "custom") {
            new Common.Views.InsertTableDialog({
              handler: (result, value) => {
                if (result === "ok")
                  this.api.put_Table(value.columns, value.rows, this._state.placeholderObj)
                this.editComplete()
              },
            }).show()
          }
        })
      }
      menuContainer.css({ left: x, top: y })
      menuContainer.attr("data-value", "prevent-canvas-click")
      this._preventClick = true
      setTimeout(() => {
        menu.show()

        menu.alignPosition()
        _.delay(() => {
          menu.cmpEl.focus()
        }, 10)
      }, 1)
      this._fromShowPlaceholder = false
    }

    dh.onClickPlaceholderSmartArt = function (obj, x, y) {
      if (!this.api || !Common.Controllers.LaunchController.isScriptLoaded()) return

      this._state.placeholderObj = obj
      let menu = this.placeholderMenuSmartArt
      let menuContainer = menu
        ? this.documentHolder.cmpEl.find(Common.Utils.String.format("#menu-container-{0}", menu.id))
        : null
      this._fromShowPlaceholder = true
      Common.UI.Menu.Manager.hideAll()

      if (!menu) {
        this.placeholderMenuSmartArt = menu = new Common.UI.Menu({
          cls: "shifted-right",
          items: [],
        })
        const smartArtData = Common.define.smartArt.getSmartArtData()
        smartArtData.forEach((item, index) => {
          const length = item.items.length
          let width = 399
          if (length < 5) {
            width = length * (70 + 8) + 9 // 4px margin + 4px margin
          }
          menu.addItem({
            caption: item.caption,
            value: item.sectionId,
            itemId: item.id,
            itemsLength: length,
            iconCls: item.icon ? `menu__icon ${item.icon}` : undefined,
            menu: new Common.UI.Menu({
              items: [
                {
                  template: _.template(
                    `<div id="placeholder-${item.id}" class="menu-add-smart-art margin-left-5" style="width: ${width}px; height: 500px;"></div>`,
                  ),
                },
              ],
              menuAlign: "tl-tr",
            }),
          })
        })
        // Prepare menu container
        menuContainer = $(
          Common.Utils.String.format(
            '<div id="menu-container-{0}" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>',
            menu.id,
          ),
        )
        this.documentHolder.cmpEl.append(menuContainer)
        menu.render(menuContainer)
        menu.cmpEl.attr({ tabindex: "-1" })
        menu.on("hide:after", () => {
          if (!this._fromShowPlaceholder) this.api.asc_uncheckPlaceholders()
        })

        const onShowBeforeSmartArt = (menu) => {
          menu.items.forEach((item, index) => {
            const items = []
            for (let i = 0; i < item.options.itemsLength; i++) {
              items.push({
                isLoading: true,
              })
            }
            item.menuPicker = new Common.UI.DataView({
              el: $(`#placeholder-${item.options.itemId}`),
              parentMenu: menu.items[index].menu,
              itemTemplate: _.template(
                [
                  "<% if (isLoading) { %>",
                  '<div class="loading-item" style="width: 70px; height: 70px;">',
                  '<i class="loading-spinner"></i>',
                  "</div>",
                  "<% } else { %>",
                  "<div>",
                  `<img src="<%= imageUrl %>" width="${70}" height="${70}" />`,
                  "</div>",
                  "<% } %>",
                ].join(""),
              ),
              store: new Common.UI.DataViewStore(items),
              delayRenderTips: true,
              scrollAlwaysVisible: true,
              showLast: false,
            })
            item.menuPicker.on("item:click", (picker, item, record, e) => {
              if (record && record.get("value") !== null) {
                this.api.asc_createSmartArt(record.get("value"), this._state.placeholderObj)
              }
              Common.NotificationCenter.trigger("edit:complete", this)
            })
            item.menuPicker.loaded = false
            item.$el.on("mouseenter", () => {
              if (!item.menuPicker.loaded) {
                this.documentHolder.fireEvent("smartart:mouseenter", [item.value, menu])
              }
            })
            item.$el.on("mouseleave", () => {
              this.documentHolder.fireEvent("smartart:mouseleave", [item.value])
            })
          })
          menu.off("show:before", onShowBeforeSmartArt)
        }
        menu.on("show:before", onShowBeforeSmartArt)
      }
      menuContainer.css({ left: x, top: y })
      menuContainer.attr("data-value", "prevent-canvas-click")
      this._preventClick = true
      setTimeout(() => {
        menu.show()

        menu.alignPosition()
        _.delay(() => {
          menu.cmpEl.focus()
        }, 10)
      }, 1)
      this._fromShowPlaceholder = false
    }

    dh.onHidePlaceholderActions = function () {
      this.placeholderMenuChart?.hide()
      this.placeholderMenuTable?.hide()
      this.placeholderMenuSmartArt?.hide()
    }

    dh.onClickPlaceholder = function (type, obj, x, y) {
      if (!this.api) return
      this.hideScreenTip()
      this.onHidePlaceholderActions()
      if (type === AscCommon.PlaceholderButtonType.Video) {
        this.api.asc_AddVideo(obj)
      } else if (type === AscCommon.PlaceholderButtonType.Audio) {
        this.api.asc_AddAudio(obj)
      }
      this.editComplete()
    }

    dh.onImgReplace = function (menu, item, e) {
      if (item.value === 1) {
        this.onInsertImageUrl(false)
      } else if (item.value === 2) {
        Common.NotificationCenter.trigger("storage:image-load", "change")
      } else {
        setTimeout(() => {
          this.onInsertImage()
        }, 10)
      }
    }

    dh.onLangMenu = function (type, menu, item) {
      if (this.api) {
        if (!_.isUndefined(item.langid)) this.api.put_TextPrLang(item.langid)

        type === "para"
          ? (this.documentHolder._currLang.paraid = item.langid)
          : (this.documentHolder._currLang.tableid = item.langid)
        this.editComplete()
      }
    }

    dh.onUndo = function () {
      this.api.Undo()
    }

    dh.onPreview = function () {
      const current = this.api.getCurrentPage()
      Common.NotificationCenter.trigger(
        "preview:start",
        _.isNumber(current) ? current : 0,
        false,
        false,
        true,
      )
    }

    dh.onSelectAll = function () {
      if (this.api) {
        this.api.SelectAllSlides()

        this.editComplete()
        Common.component.Analytics.trackEvent("DocumentHolder", "Select All Slides")
      }
    }

    dh.onPrintSelection = function () {
      if (this.api) {
        const printopt = new Asc.asc_CAdjustPrint()
        printopt.asc_setPrintType(Asc.c_oAscPrintType.Selection)
        const opts = new Asc.asc_CDownloadOptions(
          null,
          Common.Utils.isChrome ||
            Common.Utils.isOpera ||
            (Common.Utils.isGecko && Common.Utils.firefoxVersion > 86),
        ) // if isChrome or isOpera == true use asc_onPrintUrl event
        opts.asc_setAdvancedOptions(printopt)
        this.api.asc_Print(opts)
        this.editComplete()
        Common.component.Analytics.trackEvent("DocumentHolder", "Print Selection")
      }
    }

    dh.onNewSlide = function () {
      if (this.api) {
        this._isFromSlideMenu = true
        this.api.AddSlide()

        this.editComplete()
        Common.component.Analytics.trackEvent("DocumentHolder", "Add Slide")
      }
    }

    dh.onDuplicateSlide = function () {
      if (this.api) {
        this._isFromSlideMenu = true
        this.api.DublicateSlide()

        this.editComplete()
        Common.component.Analytics.trackEvent("DocumentHolder", "Dublicate Slide")
      }
    }

    dh.onDeleteSlide = function () {
      if (this.api) {
        this._isFromSlideMenu = true
        this.api.DeleteSlide()

        this.editComplete()
        Common.component.Analytics.trackEvent("DocumentHolder", "Delete Slide")
      }
    }

    dh.onResetSlide = function () {
      if (this.api) {
        this.api.ResetSlide()

        this.editComplete()
        Common.component.Analytics.trackEvent("DocumentHolder", "Reset Slide")
      }
    }

    dh.onMoveSlideToStart = function () {
      if (this.api) {
        this.api.asc_moveSelectedSlidesToStart()

        this.editComplete()
        Common.component.Analytics.trackEvent("DocumentHolder", "Move Slide to Start")
      }
    }

    dh.onMoveSlideToEnd = function () {
      if (this.api) {
        this.api.asc_moveSelectedSlidesToEnd()

        this.editComplete()
        Common.component.Analytics.trackEvent("DocumentHolder", "Move Slide to End")
      }
    }

    dh.onSlideSettings = (item) => {
      PE.getController("RightMenu").onDoubleClickOnObject(item.options.value)
    }

    dh.onSlideHide = function (item) {
      if (this.api) {
        this.api.asc_HideSlides(item.checked)

        this.editComplete()
        Common.component.Analytics.trackEvent("DocumentHolder", "Hide Slides")
      }
    }

    dh.onLayoutChange = function (record) {
      if (this.api) {
        this.api.ChangeLayout(record.get("data").idx)
        this.editComplete()
        Common.component.Analytics.trackEvent("DocumentHolder", "Change Layout")
      }
    }

    dh.onThemeChange = function (record) {
      if (this.api) {
        this.api.ChangeTheme(record.get("themeId"), true)
        this.editComplete()
        Common.component.Analytics.trackEvent("DocumentHolder", "Change Layout")
      }
    }

    dh.onTableMerge = function () {
      this.api?.MergeCells()
    }

    dh.onTableSplit = function () {
      if (this.api) {
        new Common.Views.InsertTableDialog({
          split: true,
          handler: (result, value) => {
            if (result === "ok") {
              if (this.api) {
                this.api.SplitCell(value.columns, value.rows)
              }
              Common.component.Analytics.trackEvent("DocumentHolder", "Table Split")
            }
            this.editComplete()
          },
        }).show()
      }
    }

    dh.tableCellsVAlign = function (menu, item, e) {
      if (this.api) {
        if (item.options.halign != null) {
          const type = item.options.halign
          this.api.put_PrAlign(type)
          return
        }

        const properties = new Asc.CTableProp()
        properties.put_CellsVAlign(item.value)
        this.api.tblApply(properties)
      }

      this.editComplete()
      Common.component.Analytics.trackEvent("DocumentHolder", "Table Cell Align")
    }

    dh.onTableDistRows = function () {
      this.api?.asc_DistributeTableCells(false)
      this.editComplete()
    }

    dh.onTableDistCols = function () {
      this.api?.asc_DistributeTableCells(true)
      this.editComplete()
    }

    dh.tableDirection = function (menu, item, e) {
      if (this.api) {
        const properties = new Asc.CTableProp()
        properties.put_CellsTextDirection(item.options.direction)
        this.api.tblApply(properties)
      }
    }

    dh.onIgnoreSpell = function (item, e) {
      this.api?.asc_ignoreMisspelledWord(this.documentHolder._currentSpellObj, !!item.value)
      this.editComplete()
    }

    dh.onToDictionary = function (item, e) {
      this.api?.asc_spellCheckAddToDictionary(this.documentHolder._currentSpellObj)
      this.editComplete()
    }

    dh.onTableAdvanced = function (item, e) {
      if (this.api) {
        const selectedElements = this.api.getSelectedElements()

        if (selectedElements && selectedElements.length > 0) {
          let elType
          let elValue
          for (let i = selectedElements.length - 1; i >= 0; i--) {
            elType = selectedElements[i].get_ObjectType()
            elValue = selectedElements[i].get_ObjectValue()

            if (Asc.c_oAscTypeSelectElement.Table === elType) {
              new PE.Views.TableSettingsAdvanced({
                tableProps: elValue,
                slideSize: PE.getController("Toolbar").currentPageSize,
                handler: (result, value) => {
                  if (result === "ok") {
                    if (this.api) {
                      this.api.tblApply(value.tableProps)
                    }
                  }
                  this.editComplete()
                  Common.component.Analytics.trackEvent("DocumentHolder", "Table Settings Advanced")
                },
              }).show()
              break
            }
          }
        }
      }
    }

    dh.onImageAdvanced = function (item) {
      if (this.api) {
        const selectedElements = this.api.getSelectedElements()
        if (selectedElements && selectedElements.length > 0) {
          let elType
          let elValue

          for (let i = selectedElements.length - 1; i >= 0; i--) {
            elType = selectedElements[i].get_ObjectType()
            elValue = selectedElements[i].get_ObjectValue()

            if (Asc.c_oAscTypeSelectElement.Image === elType) {
              let imgsizeOriginal

              if (!this.documentHolder.menuImgOriginalSize.isDisabled()) {
                imgsizeOriginal = this.api.asc_getCropOriginalImageSize()
                if (imgsizeOriginal)
                  imgsizeOriginal = {
                    width: imgsizeOriginal.get_ImageWidth(),
                    height: imgsizeOriginal.get_ImageHeight(),
                  }
              }

              new PE.Views.ImageSettingsAdvanced({
                imageProps: elValue,
                sizeOriginal: imgsizeOriginal,
                slideSize: PE.getController("Toolbar").currentPageSize,
                handler: (result, value) => {
                  if (result === "ok") {
                    if (this.api) {
                      this.api.ImgApply(value.imageProps)
                    }
                  }
                  this.editComplete()
                  Common.component.Analytics.trackEvent("DocumentHolder", "Image Settings Advanced")
                },
              }).show()
              break
            }
          }
        }
      }
    }

    dh.onImgOriginalSize = function (item) {
      if (this.api) {
        const originalImageSize = this.api.asc_getCropOriginalImageSize()

        if (originalImageSize) {
          const properties = new Asc.asc_CImgProperty()

          properties.put_Width(originalImageSize.get_ImageWidth())
          properties.put_Height(originalImageSize.get_ImageHeight())
          properties.put_Rot(0)
          this.api.ImgApply(properties)
        }

        this.editComplete()
        Common.component.Analytics.trackEvent("DocumentHolder", "Set Image Original Size")
      }
    }

    dh.onImgRotate = function (item) {
      const properties = new Asc.asc_CShapeProperty()
      properties.asc_putRotAdd(((item.value === 1 ? 90 : 270) * Math.PI) / 180)
      this.api.ShapeApply(properties)
      this.editComplete()
    }

    dh.onImgFlip = function (item) {
      const properties = new Asc.asc_CShapeProperty()
      if (item.value === 1) properties.asc_putFlipHInvert(true)
      else properties.asc_putFlipVInvert(true)
      this.api.ShapeApply(properties)
      this.editComplete()
    }

    dh.onImgCrop = function (menu, item) {
      if (item.value === 1) {
        this.api.asc_cropFill()
      } else if (item.value === 2) {
        this.api.asc_cropFit()
      } else {
        item.checked ? this.api.asc_startEditCrop() : this.api.asc_endEditCrop()
      }
      this.editComplete()
    }

    dh.onImgResetCrop = function () {
      if (this.api) {
        const properties = new Asc.asc_CImgProperty()
        properties.put_ResetCrop(true)
      }
      this.api.ShapeApply(properties)
      this.editComplete()
    }

    dh.onImgEditPoints = function (item) {
      this.api?.asc_editPointsGeometry()
    }

    dh.onShapeAdvanced = function (item) {
      if (this.api) {
        const selectedElements = this.api.getSelectedElements()
        if (selectedElements && selectedElements.length > 0) {
          let elType
          let elValue
          for (let i = selectedElements.length - 1; i >= 0; i--) {
            elType = selectedElements[i].get_ObjectType()
            elValue = selectedElements[i].get_ObjectValue()
            if (Asc.c_oAscTypeSelectElement.Shape === elType) {
              new PE.Views.ShapeSettingsAdvanced({
                shapeProps: elValue,
                slideSize: PE.getController("Toolbar").currentPageSize,
                handler: (result, value) => {
                  if (result === "ok") {
                    if (this.api) {
                      this.api.ShapeApply(value.shapeProps)
                    }
                  }
                  this.editComplete()
                  Common.component.Analytics.trackEvent("DocumentHolder", "Image Shape Advanced")
                },
              }).show()
              break
            }
          }
        }
      }
    }

    dh.onParagraphAdvanced = function (item) {
      if (this.api) {
        const selectedElements = this.api.getSelectedElements()

        if (selectedElements && selectedElements.length > 0) {
          let elType
          let elValue
          for (let i = selectedElements.length - 1; i >= 0; i--) {
            elType = selectedElements[i].get_ObjectType()
            elValue = selectedElements[i].get_ObjectValue()

            if (Asc.c_oAscTypeSelectElement.Paragraph === elType) {
              new PE.Views.ParagraphSettingsAdvanced({
                paragraphProps: elValue,
                api: this.api,
                handler: (result, value) => {
                  if (result === "ok") {
                    if (this.api) {
                      this.api.paraApply(value.paragraphProps)
                    }
                  }
                  this.editComplete()
                  Common.component.Analytics.trackEvent(
                    "DocumentHolder",
                    "Image Paragraph Advanced",
                  )
                },
              }).show()
              break
            }
          }
        }
      }
    }

    dh.onChartAdvanced = function (item, e) {
      if (this.api) {
        const selectedElements = this.api.getSelectedElements()

        if (selectedElements && selectedElements.length > 0) {
          let elType
          let elValue
          for (let i = selectedElements.length - 1; i >= 0; i--) {
            elType = selectedElements[i].get_ObjectType()
            elValue = selectedElements[i].get_ObjectValue()

            if (Asc.c_oAscTypeSelectElement.Chart === elType) {
              new PE.Views.ChartSettingsAdvanced({
                chartProps: elValue,
                slideSize: PE.getController("Toolbar").currentPageSize,
                chartSettings: this.api.asc_getChartSettings(),
                api: this.api,
                handler: (result, value) => {
                  if (result === "ok") {
                    if (this.api) {
                      this.api.ChartApply(value.chartProps)
                    }
                  }
                  this.editComplete()
                  Common.component.Analytics.trackEvent("DocumentHolder", "Chart Settings Advanced")
                },
              }).show()
              break
            }
          }
        }
      }
    }

    dh.onGroupImg = function (item) {
      this.api?.groupShapes()
      this.editComplete()
      Common.component.Analytics.trackEvent("DocumentHolder", "Group Image")
    }

    dh.onUnGroupImg = function (item) {
      this.api?.unGroupShapes()
      this.editComplete()
      Common.component.Analytics.trackEvent("DocumentHolder", "UnGroup Image")
    }

    dh.onArrangeFront = function (item) {
      this.api?.shapes_bringToFront()
      this.editComplete()
      Common.component.Analytics.trackEvent("DocumentHolder", "Bring To Front")
    }

    dh.onArrangeBack = function (item) {
      this.api?.shapes_bringToBack()
      this.editComplete()
      Common.component.Analytics.trackEvent("DocumentHolder", "Bring To Back")
    }

    dh.onArrangeForward = function (item) {
      this.api?.shapes_bringForward()
      this.editComplete()
      Common.component.Analytics.trackEvent("DocumentHolder", "Send Forward")
    }

    dh.onArrangeBackward = function (item) {
      this.api?.shapes_bringBackward()
      this.editComplete()
      Common.component.Analytics.trackEvent("DocumentHolder", "Send Backward")
    }

    dh.onImgShapeAlign = function (menu, item) {
      if (this.api) {
        let value =
          this.api.asc_getSelectedDrawingObjectsCount() < 2 ||
          Common.Utils.InternalSettings.get("pe-align-to-slide")
        value = value ? Asc.c_oAscObjectsAlignType.Slide : Asc.c_oAscObjectsAlignType.Selected
        if (item.value < 6) {
          this.api.put_ShapesAlign(item.value, value)
          Common.component.Analytics.trackEvent("DocumentHolder", "Shape Align")
        } else if (item.value === 6) {
          this.api.DistributeHorizontally(value)
          Common.component.Analytics.trackEvent("DocumentHolder", "Distribute Horizontally")
        } else if (item.value === 7) {
          this.api.DistributeVertically(value)
          Common.component.Analytics.trackEvent("DocumentHolder", "Distribute Vertically")
        }
        this.editComplete()
      }
    }

    dh.onShapesMerge = function (menu, item, e) {
      if (item?.value) {
        this.api.asc_mergeSelectedShapes(item.value)
        Common.component.Analytics.trackEvent("DocumentHolder", "Shapes Merge")
      }
      this.editComplete()
    }

    dh.onParagraphVAlign = function (menu, item) {
      if (this.api) {
        if (item.options.halign != null) {
          const type = item.options.halign
          this.api.put_PrAlign(type)
          return
        }

        const properties = new Asc.asc_CShapeProperty()
        properties.put_VerticalTextAlign(item.value)

        this.api.ShapeApply(properties)
      }

      this.editComplete()
      Common.component.Analytics.trackEvent("DocumentHolder", "Text Vertical Align")
    }

    dh.onParagraphDirection = function (menu, item) {
      if (this.api) {
        const properties = new Asc.asc_CShapeProperty()
        properties.put_Vert(item.options.direction)
        this.api.ShapeApply(properties)
      }
      this.editComplete()
      Common.component.Analytics.trackEvent("DocumentHolder", "Text Direction")
    }

    dh.tableSelectText = function (menu, item) {
      if (this.api) {
        switch (item.value) {
          case 0:
            this.api.selectRow()
            break
          case 1:
            this.api.selectColumn()
            break
          case 2:
            this.api.selectCell()
            break
          case 3:
            this.api.selectTable()
            break
        }
      }
    }

    dh.tableInsertText = function (menu, item) {
      if (this.api) {
        switch (item.value) {
          case 0:
            this.api.addColumnLeft()
            break
          case 1:
            this.api.addColumnRight()
            break
          case 2:
            this.api.addRowAbove()
            break
          case 3:
            this.api.addRowBelow()
            break
        }
      }
    }

    dh.tableDeleteText = function (menu, item) {
      if (this.api) {
        switch (item.value) {
          case 0:
            this.api.remRow()
            break
          case 1:
            this.api.remColumn()
            break
          case 2:
            this.api.remTable()
            break
        }
      }
    }

    dh.onSpecialPasteItemClick = function (item, e) {
      if (this.api) {
        this.api.asc_SpecialPaste(item.value)
        const menu = this.btnSpecialPaste.menu
        if (!item.cmpEl) {
          for (let i = 0; i < menu.items.length; i++) {
            menu.items[i].setChecked(menu.items[i].value === item.value, true)
          }
        }
        setTimeout(() => {
          menu.hide()
        }, 100)
      }
      return false
    }

    dh.onGuidesClick = function (menu, item) {
      if (item.value === "del-guide" && item.options.guideId)
        this.documentHolder.fireEvent("guides:delete", [item.options.guideId])
      else if (item.value === "add-vert" || item.value === "add-hor")
        this.documentHolder.fireEvent("guides:add", [item.value])
      else if (item.value === "clear") this.documentHolder.fireEvent("guides:clear")
      else if (item.value === "smart")
        this.documentHolder.fireEvent("guides:smart", [item.isChecked()])
      else this.documentHolder.fireEvent("guides:show", [item.isChecked()])
    }

    dh.onGridlinesClick = function (menu, item) {
      if (item.value === "custom") this.documentHolder.fireEvent("gridlines:custom")
      else if (item.value === "snap")
        this.documentHolder.fireEvent("gridlines:snap", [item.isChecked()])
      else if (item.value === "show")
        this.documentHolder.fireEvent("gridlines:show", [item.isChecked()])
      else this.documentHolder.fireEvent("gridlines:spacing", [item.value])
    }

    dh.onRulersClick = function (item) {
      this.documentHolder.fireEvent("rulers:change", [item.isChecked()])
    }

    dh.onTrackGuide = function (dPos, x, y) {
      const tip = this.guideTip
      if (dPos === undefined || x < 0 || y < 0) {
        if (!tip.isHidden && tip.ref) {
          tip.ref.hide()
          tip.ref = undefined
          tip.text = ""
          tip.isHidden = true
        }
      } else {
        this.checkEditorOffsets()
        if (!tip.parentEl) {
          tip.parentEl = $(
            '<div id="tip-container-guide" style="position: absolute; z-index: 10000;"></div>',
          )
          this.documentHolder.cmpEl.append(tip.parentEl)
        }

        const str = dPos.toFixed(2)
        if (tip.ref?.isVisible()) {
          if (tip.text !== str) {
            tip.text = str
            tip.ref.setTitle(str)
            tip.ref.updateTitle()
          }
        }

        if (!tip.ref || !tip.ref.isVisible()) {
          tip.text = str
          tip.ref = new Common.UI.Tooltip({
            owner: tip.parentEl,
            html: true,
            title: str,
          })

          tip.ref.show([-10000, -10000])
          tip.isHidden = false
        }
        const showPoint = [x, y]
        showPoint[0] += this._XY[0] + 6
        showPoint[1] += this._XY[1] - 20 - tip.ttHeight

        const tipwidth = tip.ref.getBSTip().$tip.width()
        if (showPoint[0] + tipwidth > this._BodyWidth)
          showPoint[0] = this._BodyWidth - tipwidth - 20

        tip.ref.getBSTip().$tip.css({
          top: `${showPoint[1]}px`,
          left: `${showPoint[0]}px`,
        })
      }
    }

    dh.onShowMathTrack = function (bounds) {
      if (this.mode && !this.mode.isEdit) return

      this.lastMathTrackBounds = bounds
      if (!Common.Controllers.LaunchController.isScriptLoaded()) {
        this.showMathTrackOnLoad = true
        return
      }
      if (bounds[3] < 0 || Common.Utils.InternalSettings.get("pe-equation-toolbar-hide")) {
        this.onHideMathTrack()
        return
      }
      const documentHolder = this.documentHolder
      let eqContainer = documentHolder.cmpEl.find("#equation-container")

      // Prepare menu container
      if (eqContainer.length < 1) {
        const equationsStore = this.getApplication().getCollection("EquationGroups")
        let eqStr = '<div id="equation-container" style="position: absolute;">'

        this.getApplication().getController("Toolbar").onMathTypes()

        this.equationBtns = []
        for (let i = 0; i < equationsStore.length; ++i) {
          eqStr += `<span id="id-document-holder-btn-equation-${i}"></span>`
        }
        eqStr += '<div class="separator"></div>'
        eqStr += '<span id="id-document-holder-btn-equation-settings"></span>'
        eqStr += "</div>"
        eqContainer = $(eqStr)
        documentHolder.cmpEl.append(eqContainer)
        const onShowBefore = (menu) => {
          const index = menu.options.value
          const group = equationsStore.at(index)
          const equationPicker = new Common.UI.DataViewSimple({
            el: $(`#id-document-holder-btn-equation-menu-${index}`, menu.cmpEl),
            parentMenu: menu,
            store: group.get("groupStore"),
            scrollAlwaysVisible: true,
            showLast: false,
            restoreHeight: 450,
            itemTemplate: _.template(
              '<div class="item-equation" style="" >' +
                '<div class="equation-icon" style="background-position:<%= posX %>px <%= posY %>px;width:<%= width %>px;height:<%= height %>px;" id="<%= id %>"></div>' +
                "</div>",
            ),
          })
          equationPicker.on("item:click", (picker, item, record, e) => {
            if (this.api) {
              if (record) this.api.asc_AddMath(record.get("data").equationType)
            }
          })
          menu.off("show:before", onShowBefore)
        }
        const bringForward = (menu) => {
          eqContainer.addClass("has-open-menu")
        }
        const sendBackward = (menu) => {
          eqContainer.removeClass("has-open-menu")
        }
        for (let i = 0; i < equationsStore.length; ++i) {
          const equationGroup = equationsStore.at(i)
          const btn = new Common.UI.Button({
            parentEl: $(`#id-document-holder-btn-equation-${i}`, documentHolder.cmpEl),
            cls: "btn-toolbar no-caret",
            iconCls: `svgicon ${equationGroup.get("groupIcon")}`,
            hint: equationGroup.get("groupName"),
            menu: new Common.UI.Menu({
              value: i,
              items: [
                {
                  template: _.template(
                    `<div id="id-document-holder-btn-equation-menu-${i}" class="menu-shape margin-left-5" style="width:${equationGroup.get("groupWidth") + 8}px; ${equationGroup.get("groupHeightStr")}"></div>`,
                  ),
                },
              ],
            }),
          })
          btn.menu.on("show:before", onShowBefore)
          btn.menu.on("show:before", bringForward)
          btn.menu.on("hide:after", sendBackward)
          this.equationBtns.push(btn)
        }

        this.equationSettingsBtn = new Common.UI.Button({
          parentEl: $("#id-document-holder-btn-equation-settings", documentHolder.cmpEl),
          cls: "btn-toolbar no-caret",
          iconCls: "toolbar__icon btn-more-vertical",
          hint: this.documentHolder.advancedEquationText,
          menu: this.documentHolder.createEquationMenu("popuptbeqinput", "tl-bl"),
        })
        this.equationSettingsBtn.menu.options.initMenu = () => {
          const eq = this.api.asc_GetMathInputType()
          const menu = this.equationSettingsBtn.menu
          const isEqToolbarHide = Common.Utils.InternalSettings.get("pe-equation-toolbar-hide")

          menu.items[5].setChecked(eq === Asc.c_oAscMathInputType.Unicode)
          menu.items[6].setChecked(eq === Asc.c_oAscMathInputType.LaTeX)
          menu.items[8].options.isToolbarHide = isEqToolbarHide
          menu.items[8].setCaption(
            isEqToolbarHide ? this.documentHolder.showEqToolbar : this.documentHolder.hideEqToolbar,
            true,
          )
        }
        this.equationSettingsBtn.menu.on("item:click", _.bind(this.convertEquation, this))
        this.equationSettingsBtn.menu.on("show:before", (menu) => {
          bringForward()
          menu.options.initMenu()
        })
        this.equationSettingsBtn.menu.on("hide:after", sendBackward)
      }

      const showPoint = [
        (bounds[0] + bounds[2]) / 2 - eqContainer.outerWidth() / 2,
        bounds[1] - eqContainer.outerHeight() - 10,
      ]
      showPoint[0] < 0 && (showPoint[0] = 0)
      if (showPoint[1] < 0) {
        showPoint[1] = bounds[3] + 10
      }
      showPoint[1] = Math.min(this._Height - eqContainer.outerHeight(), Math.max(0, showPoint[1]))
      eqContainer.css({ left: showPoint[0], top: showPoint[1] })

      this.checkEditorOffsets()

      const diffDown = this._Height - showPoint[1] - eqContainer.outerHeight()
      const diffUp = this._XY[1] + showPoint[1]
      let menuAlign = diffDown < 220 && diffDown < diffUp * 0.9 ? "bl-tl" : "tl-bl"
      if (Common.UI.isRTL()) {
        menuAlign = menuAlign === "bl-tl" ? "br-tr" : "tr-br"
      }
      this.equationBtns.forEach((item) => {
        item && (item.menu.menuAlign = menuAlign)
      })
      this.equationSettingsBtn.menu.menuAlign = menuAlign
      if (eqContainer.is(":visible")) {
        if (this.equationSettingsBtn.menu.isVisible()) {
          this.equationSettingsBtn.menu.options.initMenu()
          this.equationSettingsBtn.menu.alignPosition()
        }
      } else {
        eqContainer.show()
      }
      this.disableEquationBar()
    }

    dh.onHideMathTrack = function () {
      if (!this.documentHolder || !this.documentHolder.cmpEl) return
      if (!Common.Controllers.LaunchController.isScriptLoaded()) {
        this.showMathTrackOnLoad = false
        return
      }
      const eqContainer = this.documentHolder.cmpEl.find("#equation-container")
      if (eqContainer.is(":visible")) {
        eqContainer.hide()
      }
    }

    dh.disableEquationBar = function () {
      const eqContainer = this.documentHolder.cmpEl.find("#equation-container")
      const disabled = this._isDisabled || this._state.equationLocked

      if (eqContainer.length > 0 && eqContainer.is(":visible")) {
        this.equationBtns.forEach((item) => {
          item?.setDisabled(!!disabled)
        })
        this.equationSettingsBtn.setDisabled(!!disabled)
      }
    }

    dh.convertEquation = function (menu, item, e) {
      if (this.api) {
        if (item.options.type === "input") {
          this.api.asc_SetMathInputType(item.value)
          Common.localStorage.setBool(
            "pe-equation-input-latex",
            item.value === Asc.c_oAscMathInputType.LaTeX,
          )
        } else if (item.options.type === "view")
          this.api.asc_ConvertMathView(item.value.linear, item.value.all)
        else if (item.options.type === "hide") {
          item.options.isToolbarHide = !item.options.isToolbarHide
          Common.Utils.InternalSettings.set("pe-equation-toolbar-hide", item.options.isToolbarHide)
          Common.localStorage.setBool("pe-equation-toolbar-hide", item.options.isToolbarHide)
          if (item.options.isToolbarHide) this.onHideMathTrack()
          else this.onShowMathTrack(this.lastMathTrackBounds)
        }
      }
    }

    dh.onLockViewProps = function (lock) {
      Common.Utils.InternalSettings.set("pe-lock-view-props", lock)
      const currentMenu = this.documentHolder.currentMenu
      if (currentMenu?.isVisible() && this.documentHolder.slideMenu === currentMenu) {
        if (this.api.asc_getCurrentFocusObject() !== 0) {
          // not thumbnails
          if (!this._isDisabled && this.mode.isEdit) {
            // update slide menu items
            const obj = this.fillMenuProps(this.api.getSelectedElements())
            if (obj) {
              if (obj.menu_to_show === currentMenu) {
                currentMenu.options.initMenu(obj.menu_props)
                currentMenu.alignPosition()
              }
            }
          }
        }
      }
    }

    dh.onPluginContextMenu = function (data) {
      if (
        data &&
        data.length > 0 &&
        this.documentHolder &&
        this.documentHolder.currentMenu &&
        this.documentHolder.currentMenu.isVisible()
      ) {
        this.documentHolder.updateCustomItems(this.documentHolder.currentMenu, data)
      }
    }

    dh.onAnimEffect = function (menu, item) {
      if (item.value === "remove") {
        this.api.asc_RemoveSelectedAnimEffects()
      } else {
        this.api.asc_SetSelectedAnimEffectsStartType(item.value)
      }
    }

    dh.onInsertMaster = function () {
      this.api.asc_AddMasterSlide()
    }

    dh.onInsertLayout = function () {
      this.api.asc_AddSlideLayout()
    }

    dh.onDuplicateMaster = function () {
      this.api.asc_DuplicateMaster()
    }

    dh.onPreserveMaster = function (item) {
      this.api.asc_setPreserveSlideMaster(item.checked)
    }

    dh.onRemoveUnpreserveMasters = function (deleteMasterCallback) {
      Common.UI.warning({
        msg: this.documentHolder.textRemoveUnpreserveMasters,
        buttons: ["yes", "no"],
        primary: "yes",
        callback: (btn) => {
          deleteMasterCallback(btn === "yes")
        },
      })
    }

    dh.onDuplicateLayout = function () {
      this.api.asc_DuplicateLayout()
    }

    dh.onDeleteMaster = function () {
      this.api.asc_DeleteMaster()
    }

    dh.onDeleteLayout = function () {
      this.api.asc_DeleteLayout()
    }

    dh.onRename = function () {
      let currentName = ""
      const selectedElements = this.api.getSelectedElements()
      let isMaster
      if (selectedElements && _.isArray(selectedElements)) {
        _.each(selectedElements, (element) => {
          if (Asc.c_oAscTypeSelectElement.Slide === element.get_ObjectType()) {
            const elValue = element.get_ObjectValue()
            isMaster = elValue.get_IsMasterSelected()
            currentName = isMaster ? elValue.get_MasterName() : elValue.get_LayoutName()
          }
        })
      }
      new Common.Views.TextInputDialog({
        title: isMaster ? this.textRenameTitleMaster : this.textRenameTitleLayout,
        label: isMaster ? this.textNameMaster : this.textNameLayout,
        value: currentName || "",
        inputConfig: {
          allowBlank: false,
          validation: (value) => (value.length < 255 ? true : this.textLongName),
        },
        handler: (result, value) => {
          if (result === "ok" && value) {
            this.api[isMaster ? "asc_SetMasterName" : "asc_SetLayoutName"](value)
          }
        },
      }).show()
    }
  }
})
