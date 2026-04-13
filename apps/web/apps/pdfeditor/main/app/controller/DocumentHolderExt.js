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
 *  Created on 12/09/24
 *
 */

define([], () => {
  if (window.PDFE?.Controllers?.DocumentHolder) {
    const dh = window.PDFE.Controllers.DocumentHolder.prototype

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
        },
        FileMenu: {
          "settings:apply": _.bind(this.applySettings, this),
        },
      })

      if (this.api) {
        this.api.asc_registerCallback("asc_onContextMenu", _.bind(this.onContextMenu, this))
        this.api.asc_registerCallback("asc_onMouseMoveStart", _.bind(this.onMouseMoveStart, this))
        this.api.asc_registerCallback("asc_onMouseMoveEnd", _.bind(this.onMouseMoveEnd, this))
        this.api.asc_registerCallback("asc_onMouseMove", _.bind(this.onMouseMove, this))

        if (this.mode.isEdit === true) {
          this.api.asc_registerCallback("asc_onHideEyedropper", _.bind(this.hideEyedropper, this))
          this.api.asc_registerCallback(
            "asc_onShowPDFFormsActions",
            _.bind(this.onShowFormsPDFActions, this),
          )
          this.api.asc_registerCallback(
            "asc_onHidePdfFormsActions",
            _.bind(this.onHidePdfFormsActions, this),
          )
          if (this.mode.canComments) {
            // for text
            this.api.asc_registerCallback(
              "asc_onShowAnnotTextPrTrack",
              _.bind(this.onShowTextBar, this),
            )
            this.api.asc_registerCallback(
              "asc_onHideAnnotTextPrTrack",
              _.bind(this.onHideTextBar, this),
            )
            this.api.asc_registerCallback(
              "asc_onShowTextSelectTrack",
              _.bind(this.onShowAnnotBar, this),
            )
            this.api.asc_registerCallback(
              "asc_onHideTextSelectTrack",
              _.bind(this.onHideAnnotBar, this),
            )
            this.api.asc_registerCallback(
              "asc_onShowAnnotSelectTrack",
              _.bind(this.onShowAnnotSelectBar, this),
            )
            this.api.asc_registerCallback(
              "asc_onHideAnnotSelectTrack",
              _.bind(this.onHideAnnotSelectBar, this),
            )
          }
        }
        if (this.mode.isRestrictedEdit) {
          this.api.asc_registerCallback(
            "asc_onShowContentControlsActions",
            _.bind(this.onShowContentControlsActions, this),
          )
          this.api.asc_registerCallback(
            "asc_onHideContentControlsActions",
            _.bind(this.onHideContentControlsActions, this),
          )
          Common.Gateway.on("insertimage", _.bind(this.insertImage, this))
          Common.NotificationCenter.on(
            "storage:image-load",
            _.bind(this.openImageFromStorage, this),
          ) // try to load image from storage
          Common.NotificationCenter.on(
            "storage:image-insert",
            _.bind(this.insertImageFromStorage, this),
          ) // set loaded image to control
        }
        this.api.asc_registerCallback(
          "asc_onCoAuthoringDisconnect",
          _.bind(this.onCoAuthoringDisconnect, this),
        )
        Common.NotificationCenter.on("api:disconnect", _.bind(this.onCoAuthoringDisconnect, this))

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

    dh.createDelayedElements = function (view, type) {
      const view = this.documentHolder

      if (type === "pdf") {
        view.menuViewCopyPage.on("click", _.bind(this.onCutCopyPaste, this))
        view.menuPDFViewCopy.on("click", _.bind(this.onCutCopyPaste, this))
        view.menuAddComment.on("click", _.bind(this.addComment, this))
        view.menuRemoveComment.on("click", _.bind(this.removeComment, this))
      } else if (type === "forms") {
        view.menuPDFFormsUndo.on("click", _.bind(this.onUndo, this))
        view.menuPDFFormsRedo.on("click", _.bind(this.onRedo, this))
        view.menuPDFFormsClear.on("click", _.bind(this.onClear, this))
        view.menuPDFFormsCut.on("click", _.bind(this.onCutCopyPaste, this))
        view.menuPDFFormsCopy.on("click", _.bind(this.onCutCopyPaste, this))
        view.menuPDFFormsPaste.on("click", _.bind(this.onCutCopyPaste, this))
      } else if (type === "edit") {
        view.menuPDFEditCopy.on("click", _.bind(this.onCutCopyPaste, this))
        view.menuEditAddComment.on("click", _.bind(this.addComment, this))
        view.menuEditRemoveComment.on("click", _.bind(this.removeComment, this))
        /*
                 var oleEditor = this.getApplication().getController('Common.Controllers.ExternalOleEditor').getView('Common.Views.ExternalOleEditor');
                 if (oleEditor) {
                 oleEditor.on('internalmessage', _.bind(function(cmp, message) {
                 var command = message.data.command;
                 var data = message.data.data;
                 if (this.api) {
                 oleEditor.isEditMode()
                 ? this.api.asc_editTableOleObject(data)
                 : this.api.asc_addTableOleObject(data);
                 }
                 }, this));
                 oleEditor.on('hide', _.bind(function(cmp, message) {
                 if (this.api) {
                 this.api.asc_enableKeyEvents(true);
                 this.api.asc_onCloseFrameEditor();
                 }
                 var me = this;
                 setTimeout(function(){
                 me.editComplete();
                 }, 10);
                 }, this));
                 }
                 */
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
        view.menuEditHyperlinkPara.on("click", _.bind(this.editHyperlink, this))
        view.menuEditHyperlinkTable.on("click", _.bind(this.editHyperlink, this))
        view.menuPDFEditHyperlink.on("click", _.bind(this.editHyperlink, this))
        view.menuRemoveHyperlinkPara.on("click", _.bind(this.removeHyperlink, this))
        view.menuRemoveHyperlinkTable.on("click", _.bind(this.removeHyperlink, this))
        view.menuChartEdit.on("click", _.bind(this.editChartClick, this, undefined))
        view.menuImgSaveAsPicture.on("click", _.bind(this.saveAsPicture, this))
        view.menuTableSaveAsPicture.on("click", _.bind(this.saveAsPicture, this))
        view.menuAddCommentPara.on("click", _.bind(this.addComment, this))
        view.menuAddCommentTable.on("click", _.bind(this.addComment, this))
        view.menuAddCommentImg.on("click", _.bind(this.addComment, this))
        view.mnuTableMerge.on("click", _.bind(this.onTableMerge, this))
        view.mnuTableSplit.on("click", _.bind(this.onTableSplit, this))
        view.menuTableCellAlign.menu.on("item:click", _.bind(this.tableCellsVAlign, this))
        view.menuTableDistRows.on("click", _.bind(this.onTableDistRows, this))
        view.menuTableDistCols.on("click", _.bind(this.onTableDistCols, this))
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
        view.menuTableEquationSettings.menu.on("item:click", _.bind(this.convertEquation, this))
        view.menuParagraphEquation.menu.on("item:click", _.bind(this.convertEquation, this))
        view.mnuNewPageBefore.on("click", _.bind(this.onNewPage, this))
        view.mnuNewPageAfter.on("click", _.bind(this.onNewPage, this))
        view.mnuDeletePage.on("click", _.bind(this.onDeletePage, this))
        view.mnuRotatePageRight.on("click", _.bind(this.onRotatePage, this, 90))
        view.mnuRotatePageLeft.on("click", _.bind(this.onRotatePage, this, -90))
        view.mnuCopyPage.on("click", _.bind(this.onCutCopyPaste, this))
        view.mnuCutPage.on("click", _.bind(this.onCutCopyPaste, this))
        view.mnuPastePageBefore.on("click", _.bind(this.onCutCopyPaste, this))
        view.mnuPastePageAfter.on("click", _.bind(this.onCutCopyPaste, this))
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
        view.menuImgReplace.menu.on("item:click", _.bind(this.onImgReplace, this))
      }
    }

    dh.applyEditorMode = function () {
      if (
        this.mode?.isPDFEdit &&
        this._state.initEditorEvents &&
        Common.Controllers.LaunchController.isScriptLoaded()
      ) {
        this.initExternalEditors()
        this.documentHolder.createDelayedElementsPDFEditor()
        this._state.initEditorEvents = false
        this.api.asc_registerCallback("asc_onShowMathTrack", _.bind(this.onShowMathTrack, this))
        this.api.asc_registerCallback("asc_onHideMathTrack", _.bind(this.onHideMathTrack, this))
        this.api.asc_registerCallback(
          "asc_onDialogAddHyperlink",
          _.bind(this.onDialogAddHyperlink, this),
        )
        this.api.asc_registerCallback("asc_ChangeCropState", _.bind(this.onChangeCropState, this))
        this.api.asc_registerCallback(
          "asc_doubleClickOnChart",
          _.bind(this.onDoubleClickOnChart, this),
        )
        this.api.asc_registerCallback(
          "asc_onSingleChartSelectionChanged",
          _.bind(this.onSingleChartSelectionChanged, this),
        )
        this.api.asc_registerPlaceholderCallback(
          AscCommon.PlaceholderButtonType.Image,
          _.bind(this.onInsertImage, this),
        )
        this.api.asc_registerPlaceholderCallback(
          AscCommon.PlaceholderButtonType.ImageUrl,
          _.bind(this.onInsertImageUrl, this),
        )
      }
      if (this.mode) {
        if (this.mode.isPDFEdit) this.onHideTextBar()
        else {
          this.onHideMathTrack()
          this.onHideChartElementButton()
        }
      }
    }

    dh.fillViewMenuProps = function (selectedElements) {
      // if (!selectedElements || !_.isArray(selectedElements)) return;

      const documentHolder = this.documentHolder
      if (!documentHolder.viewPDFModeMenu) documentHolder.createDelayedElementsPDFViewer()

      const menu_props = {}
      selectedElements &&
        _.each(selectedElements, (element, index) => {
          const elType = element.get_ObjectType()
          const elValue = element.get_ObjectValue()
          if (Asc.c_oAscTypeSelectElement.Annot === elType) {
            menu_props.annotProps = {}
            menu_props.annotProps.value = elValue
          } else if (Asc.c_oAscTypeSelectElement.PdfPage === elType) {
            menu_props.pageProps = {}
            menu_props.pageProps.value = elValue
            menu_props.pageProps.locked = elValue ? elValue.asc_getDeleteLock() : false
          }
        })

      return { menu_to_show: documentHolder.viewPDFModeMenu, menu_props: menu_props }
    }

    dh.fillPDFEditMenuProps = function (selectedElements) {
      const documentHolder = this.documentHolder
      if (!documentHolder.editPDFModeMenu) documentHolder.createDelayedElementsPDFEditor()

      if (!selectedElements || !_.isArray(selectedElements) || selectedElements.length < 1)
        return { menu_to_show: documentHolder.editPDFModeMenu, menu_props: {} }
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
          menu_props.shapeProps = {}
          menu_props.shapeProps.value = elValue
          menu_props.shapeProps.locked = elValue ? elValue.get_Locked() : false
          if (elValue.get_FromChart()) menu_props.shapeProps.isChart = true
          if (menu_props.paraProps?.value && elValue.asc_getCanEditText())
            // text in shape, need to show paragraph menu with vertical align
            menu_to_show = documentHolder.textMenu
          else menu_to_show = documentHolder.pictureMenu
        } else if (Asc.c_oAscTypeSelectElement.Chart === elType) {
          menu_to_show = documentHolder.pictureMenu
          menu_props.chartProps = {}
          menu_props.chartProps.value = elValue
          menu_props.chartProps.locked = elValue ? elValue.get_Locked() : false
        } else if (Asc.c_oAscTypeSelectElement.Paragraph === elType) {
          menu_props.paraProps = {}
          menu_props.paraProps.value = elValue
          menu_props.paraProps.locked = elValue ? elValue.get_Locked() : false
          if (menu_props.shapeProps?.value?.asc_getCanEditText())
            // text in shape, need to show paragraph menu with vertical align
            menu_to_show = documentHolder.textMenu
        } else if (Asc.c_oAscTypeSelectElement.Math === elType) {
          menu_props.mathProps = {}
          menu_props.mathProps.value = elValue
          documentHolder._currentMathObj = elValue
        } else if (Asc.c_oAscTypeSelectElement.Annot === elType) {
          menu_to_show = documentHolder.editPDFModeMenu
          menu_props.annotProps = {}
          menu_props.annotProps.value = elValue
        } else if (Asc.c_oAscTypeSelectElement.PdfPage === elType) {
          menu_props.pageProps = {}
          menu_props.pageProps.value = elValue
          menu_props.pageProps.locked = elValue ? elValue.asc_getDeleteLock() : false
        }
      })
      if (menu_to_show === null) {
        if (!_.isUndefined(menu_props.paraProps)) menu_to_show = documentHolder.textMenu
      }

      return { menu_to_show: menu_to_show, menu_props: menu_props }
    }

    dh.fillFormsMenuProps = function (selectedElements) {
      if (!selectedElements || !_.isArray(selectedElements)) return

      const documentHolder = this.documentHolder
      if (!documentHolder.formsPDFMenu) documentHolder.createDelayedElementsPDFForms()

      const menu_props = {}
      let noobject = true
      for (let i = 0; i < selectedElements.length; i++) {
        const elType = selectedElements[i].get_ObjectType()
        const elValue = selectedElements[i].get_ObjectValue()
        if (Asc.c_oAscTypeSelectElement.Image === elType) {
          //image
          menu_props.imgProps = {}
          menu_props.imgProps.value = elValue
          menu_props.imgProps.locked = elValue ? elValue.get_Locked() : false

          const control_props = this.api.asc_IsContentControl()
            ? this.api.asc_GetContentControlProperties()
            : null
          const lock_type = control_props
            ? control_props.get_Lock()
            : Asc.c_oAscSdtLockType.Unlocked
          menu_props.imgProps.content_locked =
            lock_type === Asc.c_oAscSdtLockType.SdtContentLocked ||
            lock_type === Asc.c_oAscSdtLockType.ContentLocked

          noobject = false
        } else if (Asc.c_oAscTypeSelectElement.Paragraph === elType) {
          menu_props.paraProps = {}
          menu_props.paraProps.value = elValue
          menu_props.paraProps.locked = elValue ? elValue.get_Locked() : false
          noobject = false
        } else if (Asc.c_oAscTypeSelectElement.Header === elType) {
          menu_props.headerProps = {}
          menu_props.headerProps.locked = elValue ? elValue.get_Locked() : false
        }
      }

      return !noobject
        ? { menu_to_show: documentHolder.formsPDFMenu, menu_props: menu_props }
        : null
    }

    dh.onShowTextBar = function (bounds) {
      if (this.mode && !(!this.mode.isPDFEdit && this.mode.isEdit)) return

      this.checkEditorOffsets()

      this.lastTextBarBounds = bounds
      if (bounds[3] < 0 || bounds[1] > this._Height) {
        this.onHideTextBar()
        return
      }
      const documentHolder = this.documentHolder
      let textContainer = documentHolder.cmpEl.find("#text-bar-container")

      // Prepare menu container
      if (textContainer.length < 1) {
        this.textBarBtns = []
        textContainer = documentHolder.createTextBar(this.textBarBtns)
        documentHolder.cmpEl.append(textContainer)
        documentHolder.cmbFontSize.options.menuAlignEl =
          documentHolder.cmbFontName.options.menuAlignEl = documentHolder.cmpEl

        const bringForward = (menu) => {
          textContainer.addClass("has-open-menu")
        }
        const sendBackward = (menu) => {
          textContainer.removeClass("has-open-menu")
        }
        this.textBarBtns.forEach((item) => {
          if (item?.menu) {
            item.menu.on("show:before", bringForward)
            item.menu.on("hide:after", sendBackward)
          }
        })
        // annotation text bar
        this.api.asc_registerCallback("asc_onFontSize", _.bind(this.onApiFontSize, this))
        this.api.asc_registerCallback("asc_onBold", _.bind(this.onApiBold, this))
        this.api.asc_registerCallback("asc_onItalic", _.bind(this.onApiItalic, this))
        this.api.asc_registerCallback("asc_onUnderline", _.bind(this.onApiUnderline, this))
        this.api.asc_registerCallback("asc_onStrikeout", _.bind(this.onApiStrikeout, this))
        this.api.asc_registerCallback("asc_onVerticalAlign", _.bind(this.onApiVerticalAlign, this))
        Common.NotificationCenter.on("fonts:change", _.bind(this.onApiChangeFont, this))
        this.api.asc_registerCallback("asc_onTextColor", _.bind(this.onApiTextColor, this))
        this.api.asc_registerCallback("asc_onPrAlign", _.bind(this.onApiParagraphAlign, this))
        this.api.asc_registerCallback("asc_onTextDirection", _.bind(this.onApiTextDirection, this))

        documentHolder.btnBold.on("click", _.bind(this.onBold, this))
        documentHolder.btnItalic.on("click", _.bind(this.onItalic, this))
        documentHolder.btnTextUnderline.on("click", _.bind(this.onTextUnderline, this))
        documentHolder.btnTextStrikeout.on("click", _.bind(this.onTextStrikeout, this))
        documentHolder.btnSuperscript.on("click", _.bind(this.onSuperscript, this))
        documentHolder.btnSubscript.on("click", _.bind(this.onSubscript, this))
        documentHolder.btnFontColor.on("click", _.bind(this.onBtnFontColor, this))
        documentHolder.btnFontColor.on("color:select", _.bind(this.onSelectFontColor, this))
        documentHolder.cmbFontSize.on("selected", _.bind(this.onFontSizeSelect, this))
        documentHolder.cmbFontSize.on("changed:before", _.bind(this.onFontSizeChanged, this, true))
        documentHolder.cmbFontSize.on("changed:after", _.bind(this.onFontSizeChanged, this, false))
        documentHolder.cmbFontSize.on("show:after", _.bind(this.onComboOpen, this, true))
        documentHolder.cmbFontSize.on("hide:after", _.bind(this.onHideMenus, this))
        documentHolder.cmbFontSize.on("combo:blur", _.bind(this.onComboBlur, this))
        documentHolder.cmbFontSize.on("combo:focusin", _.bind(this.onComboOpen, this, false))
        documentHolder.cmbFontName.on("selected", _.bind(this.onFontNameSelect, this))
        documentHolder.cmbFontName.on("show:after", _.bind(this.onComboOpen, this, true))
        documentHolder.cmbFontName.on("hide:after", _.bind(this.onHideMenus, this))
        documentHolder.cmbFontName.on("combo:blur", _.bind(this.onComboBlur, this))
        documentHolder.cmbFontName.on("combo:focusin", _.bind(this.onComboOpen, this, false))
        documentHolder.btnHorizontalAlign.menu.on(
          "item:click",
          _.bind(this.onMenuHorizontalAlignSelect, this),
        )
        documentHolder.btnTextDir.menu.on("item:click", _.bind(this.onTextDirClick, this))

        this.api.UpdateInterfaceState()
      }

      const showPoint = [
        (bounds[0] + bounds[2]) / 2 - textContainer.outerWidth() / 2,
        bounds[1] - textContainer.outerHeight() - 10,
      ]
      showPoint[0] < 0 && (showPoint[0] = 0)
      if (showPoint[1] < 0) {
        showPoint[1] = bounds[3] > this._Height ? 0 : bounds[3] + 10
      }
      showPoint[1] = Math.min(this._Height - textContainer.outerHeight(), Math.max(0, showPoint[1]))
      textContainer.css({ left: showPoint[0], top: showPoint[1] })

      const diffDown = this._Height - showPoint[1] - textContainer.outerHeight()
      const diffUp = this._XY[1] + showPoint[1]
      let menuAlign = diffDown < 220 && diffDown < diffUp * 0.9 ? "bl-tl" : "tl-bl"
      if (Common.UI.isRTL()) {
        menuAlign = menuAlign === "bl-tl" ? "br-tr" : "tr-br"
      }
      this.textBarBtns.forEach((item) => {
        item?.menu && (item.menu.menuAlign = menuAlign)
      })
      if (!textContainer.is(":visible")) {
        textContainer.show()
      }
      this.disableTextBar()
    }

    dh.onHideTextBar = function () {
      if (!this.documentHolder || !this.documentHolder.cmpEl) return
      const textContainer = this.documentHolder.cmpEl.find("#text-bar-container")
      if (textContainer.is(":visible")) {
        textContainer.hide()
      }
    }

    dh.disableTextBar = function () {
      const textContainer = this.documentHolder.cmpEl.find("#text-bar-container")
      const disabled = this._isDisabled

      if (textContainer.length > 0 && textContainer.is(":visible")) {
        this.textBarBtns.forEach((item) => {
          item?.setDisabled(!!disabled)
        })
      }
    }

    dh.onApiChangeFont = function (font) {
      if (!this.mode.isPDFAnnotate || !this.mode.isEdit) return
      this._state.fontname = font
      !Common.Utils.ModalWindow.isVisible() && this.documentHolder.cmbFontName.onApiChangeFont(font)
    }

    dh.onApiFontSize = function (size) {
      if (!this.mode.isPDFAnnotate || !this.mode.isEdit) return
      if (this._state.fontsize !== size) {
        this.documentHolder.cmbFontSize.setValue(size)
        this._state.fontsize = size
      }
    }

    dh.onApiBold = function (on) {
      if (!this.mode.isPDFAnnotate || !this.mode.isEdit) return
      if (this._state.bold !== on) {
        this.documentHolder.btnBold.toggle(on === true, true)
        this._state.bold = on
      }
    }

    dh.onApiItalic = function (on) {
      if (!this.mode.isPDFAnnotate || !this.mode.isEdit) return
      if (this._state.italic !== on) {
        this.documentHolder.btnItalic.toggle(on === true, true)
        this._state.italic = on
      }
    }

    dh.onApiUnderline = function (on) {
      if (!this.mode.isPDFAnnotate || !this.mode.isEdit) return
      if (this._state.underline !== on) {
        this.documentHolder.btnTextUnderline.toggle(on === true, true)
        this._state.underline = on
      }
    }

    dh.onApiStrikeout = function (on) {
      if (!this.mode.isPDFAnnotate || !this.mode.isEdit) return
      if (this._state.strike !== on) {
        this.documentHolder.btnTextStrikeout.toggle(on === true, true)
        this._state.strike = on
      }
    }

    dh.onApiVerticalAlign = function (typeBaseline) {
      if (!this.mode.isPDFAnnotate || !this.mode.isEdit) return
      if (this._state.valign !== typeBaseline) {
        this.documentHolder.btnSuperscript.toggle(typeBaseline === Asc.vertalign_SuperScript, true)
        this.documentHolder.btnSubscript.toggle(typeBaseline === Asc.vertalign_SubScript, true)
        this._state.valign = typeBaseline
      }
    }

    dh.onApiTextColor = function (color) {
      if (!this.mode.isPDFAnnotate || !this.mode.isEdit) return
      let clr
      const picker = this.documentHolder.mnuFontColorPicker

      if (color) {
        if (color.get_type() === Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
          clr = {
            color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()),
            effectValue: color.get_value(),
          }
        } else
          clr = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b())
      }

      const type1 = typeof clr
      const type2 = typeof this._state.clrtext

      if (
        type1 !== type2 ||
        (type1 === "object" &&
          (clr.effectValue !== this._state.clrtext.effectValue ||
            this._state.clrtext.color.indexOf(clr.color) < 0)) ||
        (type1 !== "object" && this._state.clrtext.indexOf(clr) < 0)
      ) {
        Common.Utils.ThemeColor.selectPickerColorByEffect(clr, picker)
        this._state.clrtext = clr
      }
      this._state.clrtext_asccolor = color
    }

    dh.onApiParagraphAlign = function (v) {
      if (!this.mode.isPDFAnnotate || !this.mode.isEdit) return
      if (this._state.pralign !== v) {
        this._state.pralign = v

        let index = -1
        let align
        const btnHorizontalAlign = this.documentHolder.btnHorizontalAlign

        switch (v) {
          case 0:
            index = 2
            align = "btn-align-right"
            break
          case 1:
            index = 0
            align = "btn-align-left"
            break
          case 2:
            index = 1
            align = "btn-align-center"
            break
          case 3:
            index = 3
            align = "btn-align-just"
            break
          default:
            index = -255
            align = "btn-align-left"
            break
        }
        if (!(index < 0)) {
          btnHorizontalAlign.menu.items[index].setChecked(true)
        } else if (index === -255) {
          btnHorizontalAlign.menu.clearAll(true)
        }

        if (btnHorizontalAlign.rendered && btnHorizontalAlign.$icon) {
          btnHorizontalAlign.$icon.removeClass(btnHorizontalAlign.options.icls).addClass(align)
          btnHorizontalAlign.options.icls = align
        }
      }
    }

    dh.onApiTextDirection = function (isRtl) {
      if (!this.mode.isPDFAnnotate || !this.mode.isEdit) return
      const documentHolder = this.documentHolder
      const oldRtl = documentHolder.btnTextDir.options.dirRtl
      const newRtl = !!isRtl
      if (oldRtl !== newRtl) {
        documentHolder.btnTextDir.changeIcon({
          next: newRtl ? "btn-rtl" : "btn-ltr",
          curr: oldRtl ? "btn-rtl" : "btn-ltr",
        })
        documentHolder.btnTextDir.options.dirRtl = !!isRtl
      }
    }

    dh.onBold = function (btn, e) {
      this._state.bold = undefined
      if (this.api) this.api.put_TextPrBold(btn.pressed)

      Common.NotificationCenter.trigger("edit:complete", this.documentHolder)
    }

    dh.onItalic = function (btn, e) {
      this._state.italic = undefined
      if (this.api) this.api.put_TextPrItalic(btn.pressed)

      Common.NotificationCenter.trigger("edit:complete", this.documentHolder)
    }

    dh.onTextUnderline = function (btn, e) {
      this._state.underline = undefined
      if (this.api) this.api.put_TextPrUnderline(btn.pressed)

      Common.NotificationCenter.trigger("edit:complete", this.documentHolder)
    }

    dh.onTextStrikeout = function (btn, e) {
      this._state.strike = undefined
      if (this.api) this.api.put_TextPrStrikeout(btn.pressed)

      Common.NotificationCenter.trigger("edit:complete", this.documentHolder)
    }

    dh.onSuperscript = function (btn, e) {
      if (!this.documentHolder.btnSubscript.pressed) {
        this._state.valign = undefined
        if (this.api)
          this.api.put_TextPrBaseline(
            btn.pressed ? Asc.vertalign_SuperScript : Asc.vertalign_Baseline,
          )

        Common.NotificationCenter.trigger("edit:complete", this.documentHolder)
      }
    }

    dh.onSubscript = function (btn, e) {
      if (!this.documentHolder.btnSuperscript.pressed) {
        this._state.valign = undefined
        if (this.api)
          this.api.put_TextPrBaseline(
            btn.pressed ? Asc.vertalign_SubScript : Asc.vertalign_Baseline,
          )

        Common.NotificationCenter.trigger("edit:complete", this.documentHolder)
      }
    }

    dh.onSelectFontColor = function (btn, color) {
      this._state.clrtext = this._state.clrtext_asccolor = undefined

      this.documentHolder.btnFontColor.currentColor = color
      this.documentHolder.btnFontColor.setColor(typeof color === "object" ? color.color : color)

      this.documentHolder.mnuFontColorPicker.currentColor = color
      if (this.api) this.api.put_TextColor(Common.Utils.ThemeColor.getRgbColor(color))
    }

    dh.onBtnFontColor = function () {
      this.documentHolder.mnuFontColorPicker.trigger(
        "select",
        this.documentHolder.mnuFontColorPicker,
        this.documentHolder.mnuFontColorPicker.currentColor ||
          this.documentHolder.btnFontColor.currentColor,
      )
    }

    dh.onComboBlur = function () {
      Common.NotificationCenter.trigger("edit:complete", this.documentHolder)
    }

    dh.onHideMenus = function (e) {
      Common.NotificationCenter.trigger("edit:complete", this.documentHolder)
    }

    dh.onFontNameSelect = function (combo, record) {
      if (this.api) {
        if (record.isNewFont) {
          !Common.Utils.ModalWindow.isVisible() &&
            Common.UI.warning({
              width: 500,
              msg: this.documentHolder.confirmAddFontName,
              buttons: ["yes", "no"],
              primary: "yes",
              callback: _.bind(function (btn) {
                if (btn === "yes") {
                  this.api.put_TextPrFontName(record.name)
                } else {
                  this.documentHolder.cmbFontName.setValue(
                    this.api.get_TextProps().get_TextPr().get_FontFamily().get_Name(),
                  )
                }
                Common.NotificationCenter.trigger("edit:complete", this.documentHolder)
              }, this),
            })
        } else {
          this.api.put_TextPrFontName(record.name)
        }
      }
      Common.NotificationCenter.trigger("edit:complete", this.documentHolder)
    }

    dh.onComboOpen = (needfocus, combo, e, params) => {
      if (params?.fromKeyDown) return
      _.delay(() => {
        const input = $("input", combo.cmpEl).select()
        if (needfocus) input.focus()
        else if (!combo.isMenuOpen())
          input.one("mouseup", (e) => {
            e.preventDefault()
          })
      }, 10)
    }

    dh.onFontSizeSelect = function (combo, record) {
      this._state.fontsize = undefined
      if (this.api) this.api.put_TextPrFontSize(record.value)

      Common.NotificationCenter.trigger("edit:complete", this.documentHolder)
    }

    dh.onFontSizeChanged = function (before, combo, record, e) {
      let value

      if (before) {
        const item = combo.store.findWhere({
          displayValue: record.value,
        })

        if (!item) {
          value = /^\+?(\d*(\.|,).?\d+)$|^\+?(\d+(\.|,)?\d*)$/.exec(record.value)

          if (!value) {
            value = this._getApiTextSize()
            setTimeout(() => {
              Common.UI.warning({
                msg: this.documentHolder.textFontSizeErr,
                callback: () => {
                  _.defer((btn) => {
                    $("input", combo.cmpEl).focus()
                  })
                },
              })
            }, 1)
            combo.setRawValue(value)
            e.preventDefault()
            return false
          }
        }
      } else {
        value = Common.Utils.String.parseFloat(record.value)
        value = value > 300 ? 300 : value < 1 ? 1 : Math.floor((value + 0.4) * 2) / 2

        combo.setRawValue(value)

        this._state.fontsize = undefined
        if (this.api) {
          this.api.put_TextPrFontSize(value)
        }

        Common.NotificationCenter.trigger("edit:complete", this.documentHolder)
      }
    }

    dh.onTextDirClick = function (menu, item) {
      this.api?.asc_setRtlTextDirection(!!item.value)
      Common.NotificationCenter.trigger("edit:complete", this.documentHolder)
    }

    dh.onMenuHorizontalAlignSelect = function (menu, item) {
      this._state.pralign = undefined
      const btnHorizontalAlign = this.documentHolder.btnHorizontalAlign

      btnHorizontalAlign.$icon.removeClass(btnHorizontalAlign.options.icls)
      btnHorizontalAlign.options.icls = !item.checked ? "btn-align-left" : item.options.icls
      btnHorizontalAlign.$icon.addClass(btnHorizontalAlign.options.icls)

      if (this.api && item.checked) this.api.put_PrAlign(item.value)

      Common.NotificationCenter.trigger("edit:complete", this.documentHolder)
    }

    dh._getApiTextSize = function () {
      let out_value = 12
      const textPr = this.api.get_TextProps()

      if (textPr?.get_TextPr) {
        out_value = textPr.get_TextPr().get_FontSize()
      }

      return out_value
    }

    dh.onShowAnnotBar = function (bounds, mouseOnTop) {
      if (this.mode && !this.mode.isEdit) return

      this.checkEditorOffsets()

      this.lastAnnotBarBounds = bounds
      mouseOnTop !== undefined && (this.lastAnnotBarOnTop = mouseOnTop)
      if (
        bounds[3] < 0 ||
        bounds[1] > this._Height ||
        !Common.Utils.InternalSettings.get("pdfe-settings-annot-bar")
      ) {
        this.onHideAnnotBar()
        return
      }
      const documentHolder = this.documentHolder
      let textContainer = documentHolder.cmpEl.find("#annot-bar-container")

      // Prepare menu container
      if (textContainer.length < 1) {
        this.annotBarBtns = []
        textContainer = documentHolder.createAnnotBar(this.annotBarBtns)
        documentHolder.cmpEl.append(textContainer)

        const bringForward = (menu) => {
          textContainer.addClass("has-open-menu")
        }
        const sendBackward = (menu) => {
          textContainer.removeClass("has-open-menu")
        }
        this.annotBarBtns.forEach((item) => {
          if (item?.menu) {
            item.menu.on("show:before", bringForward)
            item.menu.on("hide:after", sendBackward)
          }
        })
        // annotation text bar
        documentHolder.btnCopy.on(
          "click",
          _.bind(this.onCutCopyPaste, this, { value: "copy", isFromBar: true }),
        )
        documentHolder.btnAddComment.on("click", _.bind(this.addComment, this, { isFromBar: true }))
        if ((this.mode.isPDFAnnotate && this.mode.canPDFEdit) || this.mode.isPDFEdit)
          documentHolder.btnRedact.on("click", _.bind(this.redactText, this))
        else documentHolder.btnRedact.cmpEl.parent().hide()
        if (
          this.mode.isEditTextSupport &&
          ((this.mode.isPDFAnnotate && this.mode.canPDFEdit) || this.mode.isPDFEdit)
        )
          documentHolder.btnEditText.on("click", _.bind(this.editText, this))
        else documentHolder.btnEditText.cmpEl.parent().hide().prev(".separator").hide()

        this.api.UpdateInterfaceState()
      }

      const showPoint = [
        (bounds[0] + bounds[2]) / 2 - textContainer.outerWidth() / 2,
        this.lastAnnotBarOnTop ? bounds[1] - textContainer.outerHeight() - 10 : bounds[3] + 10,
      ]
      showPoint[0] < 0 && (showPoint[0] = 0)
      showPoint[1] = Math.min(this._Height - textContainer.outerHeight(), Math.max(0, showPoint[1]))
      textContainer.css({ left: showPoint[0], top: showPoint[1] })

      const diffDown = this._Height - showPoint[1] - textContainer.outerHeight()
      const diffUp = this._XY[1] + showPoint[1]
      let menuAlign = diffDown < 220 && diffDown < diffUp * 0.9 ? "bl-tl" : "tl-bl"
      if (Common.UI.isRTL()) {
        menuAlign = menuAlign === "bl-tl" ? "br-tr" : "tr-br"
      }
      this.annotBarBtns.forEach((item) => {
        item?.menu && (item.menu.menuAlign = menuAlign)
      })
      if (!textContainer.is(":visible")) {
        textContainer.show()
      }
      this.disableAnnotBar()
    }

    dh.onHideAnnotBar = function () {
      if (!this.documentHolder || !this.documentHolder.cmpEl) return
      const textContainer = this.documentHolder.cmpEl.find("#annot-bar-container")
      if (textContainer.is(":visible")) {
        textContainer.hide()
      }
    }

    dh.disableAnnotBar = function () {
      const textContainer = this.documentHolder.cmpEl.find("#annot-bar-container")
      const disabled = this._isDisabled

      if (textContainer.length > 0 && textContainer.is(":visible")) {
        this.annotBarBtns.forEach((item) => {
          item?.setDisabled(!!disabled)
        })
        this.documentHolder.btnCopy?.setDisabled(!this.api.can_CopyCut() || !!disabled)
      }
    }

    dh.onShowAnnotSelectBar = function (bounds, mouseOnTop) {
      if (this.mode && !this.mode.isEdit) return

      this.checkEditorOffsets()

      this.lastAnnotSelBarBounds = bounds
      mouseOnTop !== undefined && (this.lastAnnotSelBarOnTop = mouseOnTop)
      if (
        bounds[3] < 0 ||
        bounds[1] > this._Height ||
        !Common.Utils.InternalSettings.get("pdfe-settings-annot-sel-bar")
      ) {
        this.onHideAnnotSelectBar()
        return
      }
      const documentHolder = this.documentHolder
      let textContainer = documentHolder.cmpEl.find("#annot-sel-bar-container")

      // Prepare menu container
      if (textContainer.length < 1) {
        this.annotSelectBarBtns = []
        textContainer = documentHolder.createAnnotSelectBar(this.annotSelectBarBtns)
        documentHolder.cmpEl.append(textContainer)

        const bringForward = (menu) => {
          textContainer.addClass("has-open-menu")
        }
        const sendBackward = (menu) => {
          textContainer.removeClass("has-open-menu")
        }
        this.annotSelectBarBtns.forEach((item) => {
          if (item?.menu) {
            item.menu.on("show:before", bringForward)
            item.menu.on("hide:after", sendBackward)
          }
        })
        // annotation text bar
        documentHolder.btnRemAnnot.on("click", _.bind(this.removeComment, this))
        documentHolder.btnAddAnnotComment.on(
          "click",
          _.bind(this.addComment, this, { isFromSelBar: true }),
        )
        documentHolder.mnuStrokeHighlightColorPicker.on(
          "select",
          _.bind(this.onSelectStrokeColor, this, documentHolder.btnStrokeHighlightColor),
        )
        documentHolder.mnuStrokeColorPicker.on(
          "select",
          _.bind(this.onSelectStrokeColor, this, documentHolder.btnStrokeColor),
        )
        documentHolder.btnStrokeColor.menu.on("show:after", _.bind(this.onStrokeShowAfter, this))
        documentHolder.btnStrokeHighlightColor.menu.on(
          "show:after",
          _.bind(this.onStrokeShowAfter, this),
        )
        this.api.UpdateInterfaceState()
      }

      const selectedElements = this.api.getSelectedElements()
      let annotType = AscPDF.ANNOTATIONS_TYPES.Highlight
      if (selectedElements && _.isArray(selectedElements)) {
        _.each(selectedElements, (el, i) => {
          if (selectedElements[i].get_ObjectType() === Asc.c_oAscTypeSelectElement.Annot) {
            annotType = selectedElements[i].get_ObjectValue().asc_getType()
          }
        })
      }
      documentHolder.btnStrokeHighlightColor.setVisible(
        annotType === AscPDF.ANNOTATIONS_TYPES.Highlight,
      )
      documentHolder.btnStrokeColor.setVisible(annotType !== AscPDF.ANNOTATIONS_TYPES.Highlight)
      let color = this.api.GetAnnotStrokeColor()
      const btn =
        annotType === AscPDF.ANNOTATIONS_TYPES.Highlight
          ? documentHolder.btnStrokeHighlightColor
          : documentHolder.btnStrokeColor
      color = Common.Utils.ThemeColor.getHexColor(color.r, color.g, color.b)
      btn.currentColor = color
      btn.setColor(btn.currentColor)
      btn.getPicker().select(btn.currentColor, true)
      if (annotType !== AscPDF.ANNOTATIONS_TYPES.Highlight) {
        // hide opacity for redact
        btn.menu.items[btn.menu.items.length - 1].setVisible(
          annotType !== AscPDF.ANNOTATIONS_TYPES.Redact,
        )
        btn.menu.items[btn.menu.items.length - 2].setVisible(
          annotType !== AscPDF.ANNOTATIONS_TYPES.Redact,
        )
      }

      const showPoint = [
        (bounds[0] + bounds[2]) / 2 - textContainer.outerWidth() / 2,
        this.lastAnnotSelBarOnTop ? bounds[1] - textContainer.outerHeight() - 10 : bounds[3] + 10,
      ]
      showPoint[0] < 0 && (showPoint[0] = 0)
      showPoint[1] = Math.min(this._Height - textContainer.outerHeight(), Math.max(0, showPoint[1]))

      const popover = this.getApplication()
        .getController("Common.Controllers.Comments")
        .getPopover()
      if (popover?.isVisible()) {
        const bounds = {
          left: popover.getLeft(),
          right: popover.getLeft() + popover.getWidth(),
          top: popover.getTop(),
          bottom: popover.getTop() + popover.getHeight(),
        }
        const right = showPoint[0] + textContainer.outerWidth()
        const bottom = showPoint[1] + textContainer.outerHeight()
        if (
          ((right > bounds.left && right < bounds.right) ||
            (showPoint[0] > bounds.left && showPoint[0] < bounds.right)) &&
          ((showPoint[1] > bounds.top && showPoint[1] < bounds.bottom) ||
            (bottom > bounds.top && bottom < bounds.bottom))
        ) {
          showPoint[0] = Common.UI.isRTL() ? bounds.right : bounds.left - textContainer.outerWidth()
        }
      }
      textContainer.css({ left: showPoint[0], top: showPoint[1] })

      const diffDown = this._Height - showPoint[1] - textContainer.outerHeight()
      const diffUp = this._XY[1] + showPoint[1]
      let menuAlign = diffDown < 220 && diffDown < diffUp * 0.9 ? "bl-tl" : "tl-bl"
      if (Common.UI.isRTL()) {
        menuAlign = menuAlign === "bl-tl" ? "br-tr" : "tr-br"
      }
      this.annotSelectBarBtns.forEach((item) => {
        item?.menu && (item.menu.menuAlign = menuAlign)
      })
      if (!textContainer.is(":visible")) {
        textContainer.show()
      }
      this.disableAnnotSelectBar()
    }

    dh.onHideAnnotSelectBar = function () {
      if (!this.documentHolder || !this.documentHolder.cmpEl) return
      const textContainer = this.documentHolder.cmpEl.find("#annot-sel-bar-container")
      if (textContainer.is(":visible")) {
        textContainer.hide()
      }
    }

    dh.disableAnnotSelectBar = function () {
      const textContainer = this.documentHolder.cmpEl.find("#annot-sel-bar-container")
      const disabled = this._isDisabled

      if (textContainer.length > 0 && textContainer.is(":visible")) {
        this.annotSelectBarBtns.forEach((item) => {
          item?.setDisabled(!!disabled)
        })
      }
    }

    dh.onShowMathTrack = function (bounds) {
      if (this.mode && !(this.mode.isPDFEdit && this.mode.isEdit)) return

      this.lastMathTrackBounds = bounds
      if (!Common.Controllers.LaunchController.isScriptLoaded()) {
        this.showMathTrackOnLoad = true
        return
      }
      if (bounds[3] < 0 || Common.Utils.InternalSettings.get("pdfe-equation-toolbar-hide")) {
        this.onHideMathTrack()
        return
      }
      const documentHolder = this.documentHolder
      let eqContainer = documentHolder.cmpEl.find("#equation-container")

      // Prepare menu container
      if (eqContainer.length < 1) {
        const equationsStore = this.getApplication().getCollection("EquationGroups")
        let eqStr = '<div id="equation-container" style="position: absolute;">'

        this.getApplication()
          .getController("InsTab")
          .onMathTypes(this.getApplication().getController("Toolbar")._equationTemp)

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
          const isEqToolbarHide = Common.Utils.InternalSettings.get("pdfe-equation-toolbar-hide")

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
            "pdfe-equation-input-latex",
            item.value === Asc.c_oAscMathInputType.LaTeX,
          )
        } else if (item.options.type === "view")
          this.api.asc_ConvertMathView(item.value.linear, item.value.all)
        else if (item.options.type === "hide") {
          item.options.isToolbarHide = !item.options.isToolbarHide
          Common.Utils.InternalSettings.set(
            "pdfe-equation-toolbar-hide",
            item.options.isToolbarHide,
          )
          Common.localStorage.setBool("pdfe-equation-toolbar-hide", item.options.isToolbarHide)
          if (item.options.isToolbarHide) this.onHideMathTrack()
          else this.onShowMathTrack(this.lastMathTrackBounds)
        }
      }
    }

    dh.onMouseMove = function (moveData) {
      const cmpEl = this.documentHolder.cmpEl
      const screenTip = this.screenTip
      this.checkEditorOffsets()

      if (moveData) {
        let showPoint
        let ToolTip
        const type = moveData.get_Type()

        if (
          type === Asc.c_oAscMouseMoveDataTypes.Hyperlink ||
          type === Asc.c_oAscMouseMoveDataTypes.Eyedropper ||
          type === Asc.c_oAscMouseMoveDataTypes.Form
        ) {
          if (this.isTooltipHiding) {
            this.mouseMoveData = moveData
            return
          }

          if (type === Asc.c_oAscMouseMoveDataTypes.Hyperlink) {
            const hyperProps = moveData.get_Hyperlink()
            if (!hyperProps) return
            ToolTip = _.isEmpty(hyperProps.get_ToolTip())
              ? hyperProps.get_Value()
              : hyperProps.get_ToolTip()
            if (ToolTip.length > 256) ToolTip = `${ToolTip.substr(0, 256)}...`
          } else if (type === Asc.c_oAscMouseMoveDataTypes.Form) {
            ToolTip = moveData.get_FormHelpText()
            if (ToolTip.length > 1000) ToolTip = `${ToolTip.substr(0, 1000)}...`
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
            return
          }

          let recalc = false
          screenTip.isHidden = false

          ToolTip = Common.Utils.String.htmlEncode(ToolTip)

          if (
            screenTip.tipType !== type ||
            screenTip.tipLength !== ToolTip.length ||
            screenTip.strTip.indexOf(ToolTip) < 0 ||
            (hyperProps && screenTip.noCtrl !== hyperProps.get_NoCtrl())
          ) {
            screenTip.toolTip.setTitle(
              type === Asc.c_oAscMouseMoveDataTypes.Hyperlink && !hyperProps.get_NoCtrl()
                ? `${ToolTip}<br><b>${Common.Utils.String.platformKey("Ctrl", this.documentHolder.txtPressLink)}</b>`
                : ToolTip,
            )
            screenTip.tipLength = ToolTip.length
            screenTip.strTip = ToolTip
            screenTip.tipType = type
            screenTip.noCtrl = !!hyperProps && hyperProps.get_NoCtrl()
            recalc = true
          }

          showPoint = [moveData.get_X(), moveData.get_Y()]
          showPoint[1] += this._XY[1] - 15
          showPoint[0] += this._XY[0] + 5

          if (!screenTip.isVisible || recalc) {
            screenTip.isVisible = true
            screenTip.toolTip.show([-10000, -10000])
          }

          if (recalc) {
            screenTip.tipHeight = screenTip.toolTip.getBSTip().$tip.height()
            screenTip.tipWidth = screenTip.toolTip.getBSTip().$tip.width()
          }

          recalc = false
          if (showPoint[0] + screenTip.tipWidth > this._BodyWidth) {
            showPoint[0] = this._BodyWidth - screenTip.tipWidth
            recalc = true
          }
          if (showPoint[1] - screenTip.tipHeight < 0) {
            showPoint[1] = recalc ? showPoint[1] + 30 : 0
          } else showPoint[1] -= screenTip.tipHeight

          screenTip.toolTip
            .getBSTip()
            .$tip.css({ top: `${showPoint[1]}px`, left: `${showPoint[0]}px` })
        } else if (
          /** coauthoring begin **/
          moveData.get_Type() === Asc.c_oAscMouseMoveDataTypes.LockedObject &&
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
          } else {
            src.css({ visibility: "hidden" })
          }
        }
        /** coauthoring end **/
      }
    }

    dh.onCutCopyPaste = function (item, e) {
      if (this.api) {
        const res =
          item.value === "cut"
            ? this.api.Cut()
            : item.value === "copy"
              ? this.api.Copy()
              : this.api.Paste(item.value === "paste-before")
        if (!res) {
          if (
            !Common.localStorage.getBool("pdfe-hide-copywarning") &&
            (item.value === "paste" || this.mode.canCopy)
          ) {
            new Common.Views.CopyWarningDialog({
              handler: (dontshow) => {
                if (dontshow) Common.localStorage.setItem("pdfe-hide-copywarning", 1)
                this.editComplete()
              },
            }).show()
          }
        }
        item.isFromBar && this.api.SetShowTextSelectPanel(false)
      }
      this.editComplete()
    }

    dh.onUndo = function () {
      this.api?.Undo()
    }

    dh.onRedo = function () {
      this.api?.Redo()
    }

    dh.onClear = function () {
      if (this.api) {
        const props = this.api.asc_IsContentControl()
          ? this.api.asc_GetContentControlProperties()
          : null
        if (props) {
          this.api.asc_ClearContentControl(props.get_InternalId())
        }
      }
    }

    dh.onPrintSelection = function (item) {
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

    dh.onSignatureClick = function (item) {
      const datavalue = item.cmpEl.attr("data-value")
      switch (item.value) {
        case 0:
          Common.NotificationCenter.trigger("protect:sign", datavalue) //guid
          break
        case 1:
          this.api.asc_ViewCertificate(datavalue) //certificate id
          break
        case 2: {
          const docProtection = this.documentHolder._docProtection
          Common.NotificationCenter.trigger(
            "protect:signature",
            "visible",
            this._isDisabled ||
              docProtection.isReadOnly ||
              docProtection.isFormsOnly ||
              docProtection.isCommentsOnly,
            datavalue,
          ) //guid, can edit settings for requested signature
          break
        }
        case 3: {
          Common.UI.warning({
            title: this.documentHolder.notcriticalErrorTitle,
            msg: this.documentHolder.txtRemoveWarning,
            buttons: ["ok", "cancel"],
            primary: "ok",
            callback: (btn) => {
              if (btn === "ok") {
                this.api.asc_RemoveSignature(datavalue)
              }
            },
          })
          break
        }
      }
    }

    dh.saveAsPicture = function () {
      if (this.api) {
        this.api.asc_SaveDrawingAsPicture()
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

    dh.onHidePdfFormsActions = function () {
      this.listControlMenuPdf?.isVisible() && this.listControlMenuPdf.hide()
      const controlsContainer = this.documentHolder.cmpEl.find("#calendar-control-container-pdf")
      if (controlsContainer.is(":visible")) controlsContainer.hide()
    }

    dh.onShowFormsPDFActions = function (obj, x, y) {
      switch (obj.type) {
        case AscPDF.FIELD_TYPES.combobox:
          setTimeout(() => {
            this.onShowListActionsPDF(obj, x, y)
          }, 1)
          break
        case AscPDF.FIELD_TYPES.text:
          setTimeout(() => {
            this.onShowDateActionsPDF(obj, x, y)
          }, 1)
          break
      }
    }

    dh.onShowListActionsPDF = function (obj) {
      const isForm = true
      const cmpEl = this.documentHolder.cmpEl
      let menu = this.listControlMenuPdf
      let menuContainer = menu
        ? cmpEl.find(Common.Utils.String.format("#menu-container-{0}", menu.id))
        : null

      this._listObjPdf = obj
      this._fromShowContentControls = true
      Common.UI.Menu.Manager.hideAll()

      if (!menu) {
        this.listControlMenuPdf = menu = new Common.UI.Menu({
          maxHeight: 207,
          menuAlign: "tr-bl",
          items: [],
        })
        menu.on("item:click", (menu, item) => {
          setTimeout(() => {
            item.value !== -1 && this.api.asc_SelectPDFFormListItem(item.value)
          }, 1)
        })

        // Prepare menu container
        if (!menuContainer || menuContainer.length < 1) {
          menuContainer = $(
            Common.Utils.String.format(
              '<div id="menu-container-{0}" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>',
              menu.id,
            ),
          )
          cmpEl.append(menuContainer)
        }

        menu.render(menuContainer)
        menu.cmpEl.attr({ tabindex: "-1" })
        menu.on("hide:after", () => {
          this.listControlMenuPdf.removeAll()
          if (!this._fromShowContentControls) this.api.asc_UncheckContentControlButtons()
        })
      }

      const options = obj.getOptions()
      const count = options.length
      for (let i = 0; i < count; i++) {
        menu.addItem(
          new Common.UI.MenuItem({
            caption: Array.isArray(options[i]) ? options[i][0] : options[i],
            value: i,
            template: _.template(
              [
                '<a id="<%= id %>" style="<%= style %>" tabindex="-1" type="menuitem">',
                "<%= Common.Utils.String.htmlEncode(caption) %>",
                "</a>",
              ].join(""),
            ),
          }),
        )
      }
      if (!isForm && menu.items.length < 1) {
        menu.addItem(
          new Common.UI.MenuItem({
            caption: this.documentHolder.txtEmpty,
            value: -1,
          }),
        )
      }

      const pagepos = obj.getPagePos()
      const oGlobalCoords = AscPDF.GetGlobalCoordsByPageCoords(
        pagepos.x + pagepos.w,
        pagepos.y + pagepos.h,
        obj.getPage(),
        true,
      )

      menuContainer.css({ left: oGlobalCoords.X, top: oGlobalCoords.Y })
      menuContainer.attr("data-value", "prevent-canvas-click")
      this._preventClick = true
      menu.show()

      _.delay(() => {
        menu.cmpEl.focus()
      }, 10)
      this._fromShowContentControls = false
    }

    dh.onShowDateActionsPDF = function (obj, x, y) {
      const cmpEl = this.documentHolder.cmpEl
      let controlsContainer = cmpEl.find("#calendar-control-container-pdf")

      this._dateObjPdf = obj

      if (controlsContainer.length < 1) {
        controlsContainer = $(
          '<div id="calendar-control-container-pdf" style="position: absolute;z-index: 1000;"><div id="id-document-calendar-control-pdf" style="position: fixed; left: -1000px; top: -1000px;"></div></div>',
        )
        cmpEl.append(controlsContainer)
      }

      Common.UI.Menu.Manager.hideAll()

      const pagepos = obj.getPagePos()
      const oGlobalCoords = AscPDF.GetGlobalCoordsByPageCoords(
        pagepos.x + pagepos.w,
        pagepos.y + pagepos.h,
        obj.getPage(),
        true,
      )

      controlsContainer.css({ left: oGlobalCoords.X, top: oGlobalCoords.Y })
      controlsContainer.show()

      if (!this.cmpCalendarPdf) {
        this.cmpCalendarPdf = new Common.UI.Calendar({
          el: cmpEl.find("#id-document-calendar-control-pdf"),
          enableKeyEvents: true,
          firstday: 1,
        })
        this.cmpCalendarPdf.on("date:click", (cmp, date) => {
          const specProps = new AscCommon.CSdtDatePickerPr()
          specProps.put_FullDate(new Date(date))
          this.api.asc_SetTextFormDatePickerDate(specProps)
          controlsContainer.hide()
        })
        this.cmpCalendarPdf.on("calendar:keydown", (cmp, e) => {
          if (e.keyCode === Common.UI.Keys.ESC) {
            controlsContainer.hide()
          }
        })
        $(document).on("mousedown", (e) => {
          if (
            e.target.localName !== "canvas" &&
            controlsContainer.is(":visible") &&
            controlsContainer.find(e.target).length === 0
          ) {
            controlsContainer.hide()
          }
        })
      }
      let val = this._dateObjPdf ? this._dateObjPdf.asc_GetValue() : undefined
      if (val) {
        val = new Date(val)
        if (Object.prototype.toString.call(val) !== "[object Date]" || Number.isNaN(val))
          val = undefined
      }
      !val && (val = new Date())
      this.cmpCalendarPdf.setDate(val)

      // align
      const offset = Common.Utils.getOffset(controlsContainer)
      const docW = Common.Utils.innerWidth()
      const docH = Common.Utils.innerHeight() - 10 // Yep, it's magic number
      const menuW = this.cmpCalendarPdf.cmpEl.outerWidth()
      const menuH = this.cmpCalendarPdf.cmpEl.outerHeight()
      const buttonOffset = 22
      let left = offset.left - menuW
      let top = offset.top
      if (top + menuH > docH) {
        top = docH - menuH
        left -= buttonOffset
      }
      if (top < 0) top = 0
      if (left + menuW > docW) left = docW - menuW
      this.cmpCalendarPdf.cmpEl.css({ left: left, top: top })

      this._preventClick = true
    }

    dh.onShowContentControlsActions = function (obj, x, y) {
      if (this._isDisabled) return
      switch (obj.type) {
        case Asc.c_oAscContentControlSpecificType.DateTime:
          this.onShowDateActions(obj, x, y)
          break
        case Asc.c_oAscContentControlSpecificType.Picture:
          if (obj.pr?.get_Lock) {
            const lock = obj.pr.get_Lock()
            if (
              lock === Asc.c_oAscSdtLockType.SdtContentLocked ||
              lock === Asc.c_oAscSdtLockType.ContentLocked
            )
              return
          }
          this.onShowImageActions(obj, x, y)
          break
        case Asc.c_oAscContentControlSpecificType.DropDownList:
        case Asc.c_oAscContentControlSpecificType.ComboBox:
          this.onShowListActions(obj, x, y)
          break
      }
    }

    dh.onHideContentControlsActions = function () {
      this.listControlMenu?.isVisible() && this.listControlMenu.hide()
      const controlsContainer = this.documentHolder.cmpEl.find("#calendar-control-container")
      if (controlsContainer.is(":visible")) controlsContainer.hide()
    }

    dh.onShowImageActions = function (obj, x, y) {
      const cmpEl = this.documentHolder.cmpEl
      let menu = this.imageControlMenu
      let menuContainer = menu
        ? cmpEl.find(Common.Utils.String.format("#menu-container-{0}", menu.id))
        : null

      this.internalFormObj = obj ? obj.pr : null
      this._fromShowContentControls = true
      Common.UI.Menu.Manager.hideAll()

      if (!menu) {
        this.imageControlMenu = menu = new Common.UI.Menu({
          maxHeight: 207,
          menuAlign: "tl-bl",
          items: [
            { caption: this.documentHolder.mniImageFromFile, value: "file" },
            { caption: this.documentHolder.mniImageFromUrl, value: "url" },
            {
              caption: this.documentHolder.mniImageFromStorage,
              value: "storage",
              visible:
                this.mode.canRequestInsertImage ||
                (this.mode.fileChoiceUrl && this.mode.fileChoiceUrl.indexOf("{documentType}") > -1),
            },
          ],
        })
        menu.on("item:click", (menu, item) => {
          setTimeout(() => {
            this.onImageSelect(menu, item)
          }, 1)
          setTimeout(() => {
            this.api.asc_UncheckContentControlButtons()
          }, 500)
        })

        // Prepare menu container
        if (!menuContainer || menuContainer.length < 1) {
          menuContainer = $(
            Common.Utils.String.format(
              '<div id="menu-container-{0}" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>',
              menu.id,
            ),
          )
          cmpEl.append(menuContainer)
        }

        menu.render(menuContainer)
        menu.cmpEl.attr({ tabindex: "-1" })
        menu.on("hide:after", () => {
          if (!this._fromShowContentControls) this.api.asc_UncheckContentControlButtons()
        })
      }
      menuContainer.css({ left: x, top: y })
      menuContainer.attr("data-value", "prevent-canvas-click")
      this._preventClick = true
      menu.show()

      _.delay(() => {
        menu.cmpEl.focus()
      }, 10)
      this._fromShowContentControls = false
    }

    dh.onImageSelect = function (menu, item) {
      if (item.value === "url") {
        new Common.Views.ImageFromUrlDialog({
          handler: (result, value) => {
            if (result === "ok") {
              if (this.api) {
                const checkUrl = value.replace(/ /g, "")
                if (!_.isEmpty(checkUrl)) {
                  this.setImageUrl(checkUrl)
                }
              }
            }
          },
        }).show()
      } else if (item.value === "storage") {
        Common.NotificationCenter.trigger("storage:image-load", "control")
      } else {
        if (this._isFromFile) return
        this._isFromFile = true
        this.api.asc_addImage(this.internalFormObj)
        this._isFromFile = false
      }
    }

    dh.openImageFromStorage = function (type) {
      if (this.mode.canRequestInsertImage) {
        Common.Gateway.requestInsertImage(type)
      } else {
        new Common.Views.SelectFileDlg({
          fileChoiceUrl: this.mode.fileChoiceUrl
            .replace("{fileExt}", "")
            .replace("{documentType}", "ImagesOnly"),
        })
          .on("selectfile", (obj, file) => {
            file && (file.c = type)
            !file.images && (file.images = [{ fileType: file.fileType, url: file.url }]) // SelectFileDlg uses old format for inserting image
            file.url = null
            this.insertImage(file)
          })
          .show()
      }
    }

    dh.setImageUrl = function (url, token) {
      this.api.asc_SetContentControlPictureUrl(
        url,
        this.internalFormObj ? this.internalFormObj.get_InternalId() : null,
        token,
      )
    }

    dh.insertImage = (data) => {
      // gateway
      if (data && (data.url || data.images)) {
        data.url &&
          console.log(
            "Obsolete: The 'url' parameter of the 'insertImage' method is deprecated. Please use 'images' parameter instead.",
          )

        const arr = []
        if (data.images && data.images.length > 0) {
          for (let i = 0; i < data.images.length; i++) {
            data.images[i]?.url && arr.push(data.images[i].url)
          }
        } else data.url && arr.push(data.url)
        data._urls = arr
      }
      Common.NotificationCenter.trigger("storage:image-insert", data)
    }

    dh.insertImageFromStorage = function (data) {
      if (data?._urls && data.c === "control") {
        this.setImageUrl(data._urls[0], data.token)
      }
    }

    dh.onShowListActions = function (obj, x, y) {
      const type = obj.type
      const props = obj.pr
      const specProps =
        type === Asc.c_oAscContentControlSpecificType.ComboBox
          ? props.get_ComboBoxPr()
          : props.get_DropDownListPr()
      const formProps = props.get_FormPr()
      const cmpEl = this.documentHolder.cmpEl
      let menu = this.listControlMenu
      let menuContainer = menu
        ? cmpEl.find(Common.Utils.String.format("#menu-container-{0}", menu.id))
        : null

      this._listObj = props

      this._fromShowContentControls = true
      Common.UI.Menu.Manager.hideAll()

      if (!menu) {
        this.listControlMenu = menu = new Common.UI.Menu({
          maxHeight: 207,
          menuAlign: "tr-bl",
          items: [],
        })
        menu.on("item:click", (menu, item) => {
          setTimeout(() => {
            item.value !== -1 &&
              this.api.asc_SelectContentControlListItem(item.value, this._listObj.get_InternalId())
          }, 1)
        })

        // Prepare menu container
        if (!menuContainer || menuContainer.length < 1) {
          menuContainer = $(
            Common.Utils.String.format(
              '<div id="menu-container-{0}" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>',
              menu.id,
            ),
          )
          cmpEl.append(menuContainer)
        }

        menu.render(menuContainer)
        menu.cmpEl.attr({ tabindex: "-1" })
        menu.on("hide:after", () => {
          this.listControlMenu.removeAll()
          if (!this._fromShowContentControls) this.api.asc_UncheckContentControlButtons()
        })
      }
      if (specProps) {
        const count = specProps.get_ItemsCount()
        if (formProps) {
          if (!formProps.get_Required() || count < 1) {
            // for required or empty dropdown/combobox form control always add placeholder item
            const text = props.get_PlaceholderText()
            menu.addItem(
              new Common.UI.MenuItem({
                caption: text.trim() !== "" ? text : this.documentHolder.txtEmpty,
                value: "",
                template: _.template(
                  [
                    '<a id="<%= id %>" tabindex="-1" type="menuitem" style="<% if (options.value=="") { %> opacity: 0.6 <% } %>">',
                    "<%= Common.Utils.String.htmlEncode(caption) %>",
                    "</a>",
                  ].join(""),
                ),
              }),
            )
          }
        }
        for (let i = 0; i < count; i++) {
          ;(specProps.get_ItemValue(i) !== "" || !formProps) &&
            menu.addItem(
              new Common.UI.MenuItem({
                caption: specProps.get_ItemDisplayText(i),
                value: specProps.get_ItemValue(i),
                template: _.template(
                  [
                    '<a id="<%= id %>" style="<%= style %>" tabindex="-1" type="menuitem">',
                    "<%= Common.Utils.String.htmlEncode(caption) %>",
                    "</a>",
                  ].join(""),
                ),
              }),
            )
        }
        if (!formProps && menu.items.length < 1) {
          menu.addItem(
            new Common.UI.MenuItem({
              caption: this.documentHolder.txtEmpty,
              value: -1,
            }),
          )
        }
      }

      menuContainer.css({ left: x, top: y })
      menuContainer.attr("data-value", "prevent-canvas-click")
      this._preventClick = true
      menu.show()

      _.delay(() => {
        menu.cmpEl.focus()
      }, 10)
      this._fromShowContentControls = false
    }

    dh.onShowDateActions = function (obj, x, y) {
      const props = obj.pr
      const specProps = props.get_DateTimePr()
      const cmpEl = this.documentHolder.cmpEl
      let controlsContainer = cmpEl.find("#calendar-control-container")

      this._dateObj = props

      if (controlsContainer.length < 1) {
        controlsContainer = $(
          '<div id="calendar-control-container" style="position: absolute;z-index: 1000;"><div id="id-document-calendar-control" style="position: fixed; left: -1000px; top: -1000px;"></div></div>',
        )
        cmpEl.append(controlsContainer)
      }

      Common.UI.Menu.Manager.hideAll()

      controlsContainer.css({ left: x, top: y })
      controlsContainer.show()

      if (!this.cmpCalendar) {
        this.cmpCalendar = new Common.UI.Calendar({
          el: cmpEl.find("#id-document-calendar-control"),
          enableKeyEvents: true,
          firstday: 1,
        })
        this.cmpCalendar.on("date:click", (cmp, date) => {
          const specProps = this._dateObj.get_DateTimePr()
          specProps.put_FullDate(new Date(date))
          this.api.asc_SetContentControlDatePickerDate(specProps)
          controlsContainer.hide()
          this.api.asc_UncheckContentControlButtons()
        })
        this.cmpCalendar.on("calendar:keydown", (cmp, e) => {
          if (e.keyCode === Common.UI.Keys.ESC) {
            controlsContainer.hide()
            this.api.asc_UncheckContentControlButtons()
          }
        })
        $(document).on("mousedown", (e) => {
          if (
            e.target.localName !== "canvas" &&
            controlsContainer.is(":visible") &&
            controlsContainer.find(e.target).length === 0
          ) {
            controlsContainer.hide()
            this.api.asc_UncheckContentControlButtons()
          }
        })
      }
      const val = specProps ? specProps.get_FullDate() : undefined
      this.cmpCalendar.setDate(val ? new Date(val) : new Date())

      // align
      const offset = Common.Utils.getOffset(controlsContainer)
      const docW = Common.Utils.innerWidth()
      const docH = Common.Utils.innerHeight() - 10 // Yep, it's magic number
      const menuW = this.cmpCalendar.cmpEl.outerWidth()
      const menuH = this.cmpCalendar.cmpEl.outerHeight()
      const buttonOffset = 22
      let left = offset.left - menuW
      let top = offset.top
      if (top + menuH > docH) {
        top = docH - menuH
        left -= buttonOffset
      }
      if (top < 0) top = 0
      if (left + menuW > docW) left = docW - menuW
      this.cmpCalendar.cmpEl.css({ left: left, top: top })

      this._preventClick = true
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
        win = new PDFE.Views.HyperlinkSettingsDialog({
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
        const isAnnotation = item.annotProps?.value
        for (let i = 0; i < this.api.getCountPages(); i++) {
          _arr.push({
            displayValue: i + 1,
            value: i,
          })
        }
        win = new PDFE.Views.HyperlinkSettingsDialog({
          api: this.api,
          appOptions: this.mode,
          handler: (dlg, result) => {
            if (result === "ok") {
              this.api.change_Hyperlink(
                win.getSettings(),
                isAnnotation ? item.annotProps.value.asc_getIds() : undefined,
              )
            } else if (result === "view") {
              this.api.SetLinkAnnotGoToAction(
                isAnnotation ? item.annotProps.value.asc_getIds() : undefined,
              )
            }
            this.editComplete()
          },
          slides: _arr,
          isAnnotation: isAnnotation,
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

    dh.onInsertImageUrl = function (placeholder, obj, x, y) {
      new Common.Views.ImageFromUrlDialog({
        handler: (result, value) => {
          if (result === "ok") {
            if (this.api) {
              const checkUrl = value.replace(/ /g, "")
              if (!_.isEmpty(checkUrl)) {
                const props = new Asc.asc_CImgProperty()
                props.put_ImageUrl(checkUrl)
                this.api.ImgApply(props, obj)
              }
            }
          }
          this.editComplete()
        },
      }).show()
    }

    dh.onImgReplace = function (menu, item, e) {
      if (item.value === 1) {
        this.onInsertImageUrl(false)
      } else if (item.value === 2) {
        Common.NotificationCenter.trigger("storage:image-load", "change")
      } else {
        setTimeout(() => {
          this.api.ChangeImageFromFile()
        }, 10)
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
              new PDFE.Views.TableSettingsAdvanced({
                tableProps: elValue,
                slideSize: { width: this.api.get_PageWidth(), height: this.api.get_PageHeight() },
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

              new PDFE.Views.ImageSettingsAdvanced({
                imageProps: elValue,
                sizeOriginal: imgsizeOriginal,
                slideSize: { width: this.api.get_PageWidth(), height: this.api.get_PageHeight() },
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
      this.api.ImgApply(properties)
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
              new PDFE.Views.ShapeSettingsAdvanced({
                shapeProps: elValue,
                slideSize: { width: this.api.get_PageWidth(), height: this.api.get_PageHeight() },
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
              new PDFE.Views.ChartSettingsAdvanced({
                chartProps: elValue,
                slideSize: PDFE.getController("Toolbar").currentPageSize,
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
              new PDFE.Views.ParagraphSettingsAdvanced({
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
          Common.Utils.InternalSettings.get("pdfe-align-to-slide")
        value = value ? Asc.c_oAscObjectsAlignType.Page : Asc.c_oAscObjectsAlignType.Selected
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

    dh.onNewPage = function (item) {
      this.api?.asc_AddPage(
        item.value
          ? Math.min.apply(null, this.api.getSelectedPages())
          : Math.max.apply(null, this.api.getSelectedPages()) + 1,
      )

      Common.NotificationCenter.trigger("edit:complete", this.documentHolder)
    }

    dh.onDeletePage = function () {
      this.api?.asc_RemovePage()

      Common.NotificationCenter.trigger("edit:complete", this.documentHolder)
    }

    dh.onRotatePage = function (angle, item) {
      this.api?.asc_RotatePage(angle)

      Common.NotificationCenter.trigger("edit:complete", this.documentHolder)
    }

    dh.removeComment = function (item, e, eOpt) {
      this.api?.asc_remove()
      this.editComplete()
    }

    dh.equationCallback = function (eqObj) {
      eqObj && this.api.asc_SetMathProps(eqObj)
      this.editComplete()
    }

    dh.onChangeCropState = function (state) {
      this.documentHolder.menuImgCrop?.menu.items[0].setChecked(state, true)
    }

    dh.onDialogAddHyperlink = function () {
      let win
      let props
      let text
      if (
        this.api &&
        this.mode.isEdit &&
        !this._isDisabled &&
        !PDFE.getController("LeftMenu").leftMenu.menuFile.isVisible() &&
        !this._state.no_paragraph
      ) {
        // show dialog only for table/shape
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
          win = new PDFE.Views.HyperlinkSettingsDialog({
            api: this.api,
            appOptions: this.mode,
            handler: handlerDlg,
            slides: _arr,
          })

          props = new Asc.CHyperlinkProperty()
          props.put_Text(text)

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
            win = new PDFE.Views.HyperlinkSettingsDialog({
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
        this.documentHolder.cmpEl.append(src)
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

    dh.onSelectStrokeColor = function (btn, picker, color) {
      const r = color[0] + color[1]
      const g = color[2] + color[3]
      const b = color[4] + color[5]
      if (
        !this.api.SetAnnotStrokeColor(
          Number.parseInt(r, 16),
          Number.parseInt(g, 16),
          Number.parseInt(b, 16),
        )
      ) {
        color = this.api.GetAnnotStrokeColor()
        color = Common.Utils.ThemeColor.getHexColor(color.r, color.g, color.b)
      }
      btn.currentColor = color
      btn.setColor(btn.currentColor)
      picker.select(btn.currentColor, true)
    }

    dh.onSetStrokeOpacity = function (sizePicker, direction) {
      let val = this.api.GetAnnotOpacity()
      const oldval = val
      if (direction === "up") {
        if (val % 10 > 0.1) {
          val = Math.ceil(val / 10) * 10
        } else {
          val += 10
        }
        val = Math.min(100, val)
      } else {
        if (val % 10 > 0.1) {
          val = Math.floor(val / 10) * 10
        } else {
          val -= 10
        }
        val = Math.max(0, val)
      }
      if (!this.api.SetAnnotOpacity(val)) val = oldval
      sizePicker.setValue(`${val}%`)
    }

    dh.onStrokeShowAfter = function (menu) {
      if (!menu.sizePicker) {
        menu.sizePicker = new Common.UI.UpDownPicker({
          el: menu.cmpEl.find(".custom-scale"),
          caption: this.documentHolder.txtOpacity,
          minWidth: 40,
        })
        menu.sizePicker.on("click", _.bind(this.onSetStrokeOpacity, this, menu.sizePicker))
      }
      menu.sizePicker.setValue(`${this.api.GetAnnotOpacity()}%`)
    }

    dh.applySettings = function () {
      !Common.Utils.InternalSettings.get("pdfe-settings-annot-bar") && this.onHideAnnotBar()
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
    }

    dh.onDoubleClickOnChart = function (chart) {
      if (!Common.Controllers.LaunchController.isScriptLoaded()) return
      if (this.mode?.isEdit && this.mode.isPDFEdit && !this._isDisabled) {
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

    dh.editChartClick = function () {
      if (!Common.Controllers.LaunchController.isScriptLoaded()) return
      this.api.asc_editChartInFrameEditor()
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
      if (!(this.mode?.isPDFEdit && this.mode.isEdit)) return
      const documentHolderView = this.documentHolder
      let chartContainer = documentHolderView.cmpEl.find("#chart-element-container")
      this._state.currentChartRect = asc_CRect

      this.getCurrentChartProps = () => {
        const selectedElements = this.api.getSelectedElements()
        if (selectedElements && selectedElements.length > 0) {
          let elType
          let elValue
          for (let i = selectedElements.length - 1; i >= 0; i--) {
            elType = selectedElements[i].get_ObjectType()
            elValue = selectedElements[i].get_ObjectValue()

            if (elType === Asc.c_oAscTypeSelectElement.Chart) {
              return elValue.get_ChartProperties()
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
        const offsetLeft = chartContainer.width() === 40 ? 50 : 42
        const leftSide = x - offsetLeft
        const rightSide = x + width + 7

        if (this.isRtlSheet) {
          if (leftSide >= 0) {
            btn = leftSide + 15
          } else if (rightSide + btnWidth <= this._Width) {
            btn = rightSide + 15
          } else {
            chartContainer.hide()
            return
          }
        } else {
          if (rightSide + btnWidth <= this._Width + 18) {
            btn = rightSide
          } else if (leftSide >= 0) {
            btn = leftSide
          } else {
            chartContainer.hide()
            return
          }
        }

        if (btnTop < 0) btnTop = 0

        if (y < 0) {
          const chartBottom = y + height
          if (chartBottom < 20) {
            chartContainer.hide()
            return
          }
        }

        chartContainer
          .css({
            left: `${btn}px`,
            top: `${btnTop}px`,
          })
          .show()

        this.disableChartElementButton()
      } else {
        chartContainer.hide()
      }
    }

    dh.onHideChartElementButton = function () {
      if (!this.documentHolder || !this.documentHolder.cmpEl) return
      const chartContainer = this.documentHolder.cmpEl.find("#chart-element-container")
      if (chartContainer.is(":visible")) {
        chartContainer.hide()
      }
    }

    dh.disableChartElementButton = function () {
      const chartContainer = this.documentHolder.cmpEl.find("#chart-element-container")
      const disabled = this._isDisabled || this._state.chartLocked

      if (chartContainer.length > 0 && chartContainer.is(":visible")) {
        this.btnChartElement.setDisabled(!!disabled)
      }
    }

    dh.onInsertImage = function (obj, x, y) {
      if (!this.documentHolder || !(this.mode?.isPDFEdit && this.mode.isEdit) || this._isDisabled)
        return

      if (this.api) this.api.asc_addImage(obj)
      this.editComplete()
    }

    dh.onInsertImageUrl = function (obj, x, y) {
      if (!this.documentHolder || !(this.mode?.isPDFEdit && this.mode.isEdit) || this._isDisabled)
        return
      new Common.Views.ImageFromUrlDialog({
        handler: (result, value) => {
          if (result === "ok") {
            if (this.api) {
              const checkUrl = value.replace(/ /g, "")
              if (!_.isEmpty(checkUrl)) {
                this.api.AddImageUrl([checkUrl], undefined, undefined, obj)
              }
            }
          }
          this.editComplete()
        },
      }).show()
    }
  }
})
