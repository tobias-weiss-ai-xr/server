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
 * PageLayout.js
 *
 * PageLayout controller
 *
 * Extra controller for toolbar
 *
 * Created on 3/31/2017.
 */

define(["core"], () => {
  DE.Controllers.PageLayout = Backbone.Controller.extend(
    (() => {
      let _imgOriginalProps

      return {
        initialize: () => {},

        onLaunch: function (view) {
          this.toolbar = view
          this.editMode = true
          this._state = {
            LeftIndent: null,
            RightIndent: null,
            LineSpacingBefore: null,
            LineSpacingAfter: null,
          }
          return this
        },

        onAppReady: function (config) {
          const toolbar = this.toolbar

          toolbar.btnImgAlign.menu.on("item:click", this.onClickMenuAlign.bind(this))
          toolbar.btnImgAlign.menu.on("show:before", this.onBeforeShapeAlign.bind(this))
          toolbar.btnImgWrapping.menu.on("item:click", this.onClickMenuWrapping.bind(this))
          toolbar.btnImgGroup.menu.on("item:click", this.onClickMenuGroup.bind(this))
          toolbar.btnImgForward.menu.on("item:click", this.onClickMenuForward.bind(this))
          toolbar.btnImgBackward.menu.on("item:click", this.onClickMenuForward.bind(this))

          toolbar.btnImgForward.on("click", this.onClickMenuForward.bind(this, "forward"))
          toolbar.btnImgBackward.on("click", this.onClickMenuForward.bind(this, "backward"))

          toolbar.btnShapesMerge.menu.on("item:click", this.onClickMenuShapesMerge.bind(this))
          toolbar.btnShapesMerge.menu.on("show:before", this.onBeforeShapesMerge.bind(this))

          toolbar.btnsPageBreak.forEach((btn) => {
            const _menu_section_break = btn.menu.items[2].menu
            _menu_section_break.on("item:click", (menu, item, e) => {
              toolbar.fireEvent("insert:break", [item.value])
            })

            btn.menu.on("item:click", (menu, item, e) => {
              if (!(item.value === "section")) toolbar.fireEvent("insert:break", [item.value])
            })

            btn.on("click", (e) => {
              toolbar.fireEvent("insert:break", ["page"])
            })
          })
          toolbar.numSpacingBefore.on("change", this.onNumSpacingBeforeChange.bind(this))
          toolbar.numSpacingAfter.on("change", this.onNumSpacingAfterChange.bind(this))
          toolbar.numSpacingBefore.on("inputleave", () => {
            toolbar.fireEvent("editcomplete", toolbar)
          })
          toolbar.numSpacingAfter.on("inputleave", () => {
            toolbar.fireEvent("editcomplete", toolbar)
          })
          toolbar.numIndentsLeft.on("change", this.onNumIndentsLeftChange.bind(this))
          toolbar.numIndentsRight.on("change", this.onNumIndentsRightChange.bind(this))
          toolbar.numIndentsLeft.on("inputleave", () => {
            toolbar.fireEvent("editcomplete", toolbar)
          })
          toolbar.numIndentsRight.on("inputleave", () => {
            toolbar.fireEvent("editcomplete", toolbar)
          })
        },

        setApi: function (api) {
          this.api = api

          this.api.asc_registerCallback(
            "asc_onImgWrapStyleChanged",
            this.onApiWrappingStyleChanged.bind(this),
          )
          this.api.asc_registerCallback(
            "asc_onCoAuthoringDisconnect",
            this.onApiCoAuthoringDisconnect.bind(this),
          )
          this.api.asc_registerCallback("asc_onFocusObject", this.onApiFocusObject.bind(this))
          return this
        },

        onApiWrappingStyleChanged: function (type) {
          const menu = this.toolbar.btnImgWrapping.menu

          switch (type) {
            case Asc.c_oAscWrapStyle2.Inline:
              menu.items[0].setChecked(true)
              break
            case Asc.c_oAscWrapStyle2.Square:
              menu.items[2].setChecked(true)
              break
            case Asc.c_oAscWrapStyle2.Tight:
              menu.items[3].setChecked(true)
              break
            case Asc.c_oAscWrapStyle2.Through:
              menu.items[4].setChecked(true)
              break
            case Asc.c_oAscWrapStyle2.TopAndBottom:
              menu.items[5].setChecked(true)
              break
            case Asc.c_oAscWrapStyle2.Behind:
              menu.items[8].setChecked(true)
              break
            case Asc.c_oAscWrapStyle2.InFront:
              menu.items[7].setChecked(true)
              break
            default:
              menu.clearAll(true)
          }
        },

        onApiFocusObject: function (objects) {
          if (!this.editMode) return
          const disable = {}
          let type
          let islocked = false
          let shapeProps
          let canGroupUngroup = false
          let wrapping
          let content_locked = false
          let no_object = true
          let in_para = false
          let paraProps

          for (const i in objects) {
            type = objects[i].get_ObjectType()
            if (type === Asc.c_oAscTypeSelectElement.Image) {
              const props = objects[i].get_ObjectValue()
              const notflow = !props.get_CanBeFlow()
              shapeProps = props.get_ShapeProperties()
              islocked = props.get_Locked()
              wrapping = props.get_WrappingStyle()
              no_object = false
              this.onApiWrappingStyleChanged(notflow ? -1 : wrapping)

              _.each(this.toolbar.btnImgWrapping.menu.getItems(true), (item) => {
                item.setDisabled(notflow)
              })
              this.toolbar.btnImgWrapping.menu.items[10].setDisabled(
                !this.api.CanChangeWrapPolygon(),
              )

              const control_props = this.api.asc_IsContentControl()
                ? this.api.asc_GetContentControlProperties()
                : null
              const lock_type = control_props
                ? control_props.get_Lock()
                : Asc.c_oAscSdtLockType.Unlocked

              content_locked =
                lock_type === Asc.c_oAscSdtLockType.SdtContentLocked ||
                lock_type === Asc.c_oAscSdtLockType.ContentLocked
              disable.arrange = wrapping === Asc.c_oAscWrapStyle2.Inline && !props.get_FromGroup()
              disable.wrapping =
                props.get_FromGroup() ||
                (notflow && !this.api.CanChangeWrapPolygon()) ||
                (!!control_props &&
                  (control_props.get_SpecificType() ===
                    Asc.c_oAscContentControlSpecificType.Picture ||
                    control_props.get_SpecificType() ===
                      Asc.c_oAscContentControlSpecificType.Signature) &&
                  !control_props.get_FormPr())
              disable.group = islocked || wrapping === Asc.c_oAscWrapStyle2.Inline || content_locked
              canGroupUngroup = this.api.CanGroup() || this.api.CanUnGroup()
              if (!disable.group && canGroupUngroup) {
                this.toolbar.btnImgGroup.menu.items[0].setDisabled(!this.api.CanGroup())
                this.toolbar.btnImgGroup.menu.items[1].setDisabled(!this.api.CanUnGroup())
              }

              _imgOriginalProps = props
            } else if (type === Asc.c_oAscTypeSelectElement.Paragraph) {
              in_para = true
              paraProps = objects[i].get_ObjectValue()
            }
          }
          this.toolbar.lockToolbar(
            Common.enumLock.cantMergeShape,
            !this.api.asc_canMergeSelectedShapes(),
            { array: [this.toolbar.btnShapesMerge] },
          )
          this.toolbar.lockToolbar(Common.enumLock.noObjectSelected, no_object, {
            array: [
              this.toolbar.btnImgAlign,
              this.toolbar.btnImgGroup,
              this.toolbar.btnImgWrapping,
              this.toolbar.btnImgForward,
              this.toolbar.btnImgBackward,
              this.toolbar.btnShapesMerge,
            ],
          })
          this.toolbar.lockToolbar(Common.enumLock.imageLock, islocked, {
            array: [
              this.toolbar.btnImgAlign,
              this.toolbar.btnImgGroup,
              this.toolbar.btnImgWrapping,
              this.toolbar.btnShapesMerge,
            ],
          })
          this.toolbar.lockToolbar(Common.enumLock.contentLock, content_locked, {
            array: [
              this.toolbar.btnImgAlign,
              this.toolbar.btnImgGroup,
              this.toolbar.btnImgWrapping,
              this.toolbar.btnImgForward,
              this.toolbar.btnImgBackward,
              this.toolbar.btnShapesMerge,
            ],
          })
          this.toolbar.lockToolbar(
            Common.enumLock.inImageInline,
            wrapping === Asc.c_oAscWrapStyle2.Inline,
            {
              array: [
                this.toolbar.btnImgAlign,
                this.toolbar.btnImgGroup,
                this.toolbar.btnShapesMerge,
              ],
            },
          )
          this.toolbar.lockToolbar(
            Common.enumLock.inSmartartInternal,
            shapeProps?.asc_getFromSmartArtInternal(),
            { array: [this.toolbar.btnImgForward, this.toolbar.btnImgBackward] },
          )
          this.toolbar.lockToolbar(Common.enumLock.cantGroup, !canGroupUngroup, {
            array: [this.toolbar.btnImgGroup],
          })
          this.toolbar.lockToolbar(Common.enumLock.cantWrap, disable.wrapping, {
            array: [this.toolbar.btnImgWrapping],
          })
          this.toolbar.lockToolbar(Common.enumLock.cantArrange, disable.arrange, {
            array: [this.toolbar.btnImgForward, this.toolbar.btnImgBackward],
          })
          this.toolbar.lockToolbar(Common.enumLock.noParagraphSelected, !in_para, {
            array: [
              this.toolbar.numIndentsLeft,
              this.toolbar.numIndentsRight,
              this.toolbar.lblIndentsLeft,
              this.toolbar.lblIndentsRight,
              this.toolbar.numSpacingAfter,
              this.toolbar.numSpacingBefore,
              this.toolbar.lblSpacingAfter,
              this.toolbar.lblSpacingBefore,
            ],
          })
          this.ChangeSettingsPara(paraProps)
        },

        onApiCoAuthoringDisconnect: function () {
          this.editMode = false
        },

        onBeforeShapeAlign: function () {
          const value = this.api.asc_getSelectedDrawingObjectsCount()
          const alignto = Common.Utils.InternalSettings.get("de-img-align-to")
          this.toolbar.mniAlignObjects.setDisabled(value < 2)
          this.toolbar.mniAlignObjects.setChecked(value > 1 && (!alignto || alignto === 3), true)
          this.toolbar.mniAlignToMargin.setChecked((value < 2 && !alignto) || alignto === 2, true)
          this.toolbar.mniAlignToPage.setChecked(alignto === 1, true)
          this.toolbar.mniDistribHor.setDisabled(
            value < 3 && this.toolbar.mniAlignObjects.isChecked(),
          )
          this.toolbar.mniDistribVert.setDisabled(
            value < 3 && this.toolbar.mniAlignObjects.isChecked(),
          )
        },

        onClickMenuAlign: function (menu, item, e) {
          const value = this.toolbar.mniAlignToPage.isChecked()
            ? Asc.c_oAscObjectsAlignType.Page
            : this.toolbar.mniAlignToMargin.isChecked()
              ? Asc.c_oAscObjectsAlignType.Margin
              : Asc.c_oAscObjectsAlignType.Selected
          if (item.value > -1 && item.value < 6) {
            this.api.put_ShapesAlign(item.value, value)
            Common.component.Analytics.trackEvent("ToolBar", "Shape Align")
          } else if (item.value === 6) {
            this.api.DistributeHorizontally(value)
            Common.component.Analytics.trackEvent("ToolBar", "Distribute")
          } else if (item.value === 7) {
            this.api.DistributeVertically(value)
            Common.component.Analytics.trackEvent("ToolBar", "Distribute")
          }
          this.toolbar.fireEvent("editcomplete", this.toolbar)
        },

        onBeforeShapesMerge: function () {
          this.toolbar.btnShapesMerge.menu.getItems(true).forEach(function (item) {
            item.setDisabled(!this.api.asc_canMergeSelectedShapes(item.value))
          }, this)
        },

        onClickMenuShapesMerge: function (menu, item, e) {
          if (item?.value) {
            this.api.asc_mergeSelectedShapes(item.value)
            Common.component.Analytics.trackEvent("ToolBar", "Shapes Merge")
          }
          this.toolbar.fireEvent("editcomplete", this.toolbar)
        },

        onClickMenuWrapping: function (menu, item, e) {
          if (item.options.wrapType === "edit") {
            this.api.StartChangeWrapPolygon()
            this.toolbar.fireEvent("editcomplete", this.toolbar)
            return
          }

          const props = new Asc.asc_CImgProperty()
          props.put_WrappingStyle(item.options.wrapType)

          if (
            _imgOriginalProps.get_WrappingStyle() === Asc.c_oAscWrapStyle2.Inline &&
            item.options.wrapType !== Asc.c_oAscWrapStyle2.Inline
          ) {
            props.put_PositionH(new Asc.CImagePositionH())
            props.get_PositionH().put_UseAlign(false)
            props.get_PositionH().put_RelativeFrom(Asc.c_oAscRelativeFromH.Column)

            let val = _imgOriginalProps.get_Value_X(Asc.c_oAscRelativeFromH.Column)
            props.get_PositionH().put_Value(val)

            props.put_PositionV(new Asc.CImagePositionV())
            props.get_PositionV().put_UseAlign(false)
            props.get_PositionV().put_RelativeFrom(Asc.c_oAscRelativeFromV.Paragraph)

            val = _imgOriginalProps.get_Value_Y(Asc.c_oAscRelativeFromV.Paragraph)
            props.get_PositionV().put_Value(val)
          }

          this.api.ImgApply(props)
          this.toolbar.fireEvent("editcomplete", this.toolbar)
        },

        onClickMenuGroup: function (menu, item, e) {
          const props = new Asc.asc_CImgProperty()
          props.put_Group(item.options.groupval)

          this.api.ImgApply(props)
          this.toolbar.fireEvent("editcomplete", this.toolbar)
        },

        onClickMenuForward: function (menu, item, e) {
          const props = new Asc.asc_CImgProperty()

          if (menu === "forward") props.put_ChangeLevel(Asc.c_oAscChangeLevel.BringForward)
          else if (menu === "backward") props.put_ChangeLevel(Asc.c_oAscChangeLevel.BringBackward)
          else props.put_ChangeLevel(item.options.valign)

          this.api.ImgApply(props)
          this.toolbar.fireEvent("editcomplete", this.toolbar)
        },

        onNumSpacingBeforeChange: function (field, newValue, oldValue, eOpts) {
          if (this.api) {
            const num = field.getNumberValue()
            this._state.LineSpacingBefore = num < 0 ? -1 : Common.Utils.Metric.fnRecalcToMM(num)
            this.api.put_LineSpacingBeforeAfter(0, this._state.LineSpacingBefore)
          }
        },

        onNumSpacingAfterChange: function (field, newValue, oldValue, eOpts) {
          if (this.api) {
            const num = field.getNumberValue()
            this._state.LineSpacingAfter = num < 0 ? -1 : Common.Utils.Metric.fnRecalcToMM(num)
            this.api.put_LineSpacingBeforeAfter(1, this._state.LineSpacingAfter)
          }
        },

        onNumIndentsLeftChange: function (field, newValue, oldValue, eOpts) {
          let left = Common.Utils.Metric.fnRecalcToMM(field.getNumberValue())
          if (this._state.FirstLine < 0) {
            left = left - this._state.FirstLine
          }
          const props = new Asc.asc_CParagraphProperty()
          props.put_Ind(new Asc.asc_CParagraphInd())
          props.get_Ind().put_Left(left)
          if (this.api) this.api.paraApply(props)
        },

        onNumIndentsRightChange: function (field, newValue, oldValue, eOpts) {
          const props = new Asc.asc_CParagraphProperty()
          props.put_Ind(new Asc.asc_CParagraphInd())
          props.get_Ind().put_Right(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()))
          if (this.api) this.api.paraApply(props)
        },

        ChangeSettingsPara: function (prop) {
          let left = 0
          let right = 0
          let before = 0
          let after = 0
          if (prop) {
            const indents = prop.get_Ind()
            const first = indents !== null ? indents.get_FirstLine() : null
            left = indents !== null ? indents.get_Left() : null
            if (first < 0 && left !== null) left = left + first

            right = indents !== null ? indents.get_Right() : null

            before = prop.get_Spacing().get_Before()
            after = prop.get_Spacing().get_After()
          }
          if (
            Math.abs(this._state.LeftIndent - left) > 0.001 ||
            ((this._state.LeftIndent === null || left === null) && this._state.LeftIndent !== left)
          ) {
            this.toolbar.numIndentsLeft.setValue(
              left !== null ? Common.Utils.Metric.fnRecalcFromMM(left) : "",
              true,
            )
            this._state.LeftIndent = left
          }
          if (
            Math.abs(this._state.RightIndent - right) > 0.001 ||
            ((this._state.RightIndent === null || right === null) &&
              this._state.RightIndent !== right)
          ) {
            this.toolbar.numIndentsRight.setValue(
              right !== null ? Common.Utils.Metric.fnRecalcFromMM(right) : "",
              true,
            )
            this._state.RightIndent = right
          }
          if (
            Math.abs(this._state.LineSpacingBefore - before) > 0.001 ||
            ((this._state.LineSpacingBefore === null || before === null) &&
              this._state.LineSpacingBefore !== before)
          ) {
            this.toolbar.numSpacingBefore.setValue(
              before !== null
                ? before < 0
                  ? before
                  : Common.Utils.Metric.fnRecalcFromMM(before)
                : "",
              true,
            )
            this._state.LineSpacingBefore = before
          }

          if (
            Math.abs(this._state.LineSpacingAfter - after) > 0.001 ||
            ((this._state.LineSpacingAfter === null || after === null) &&
              this._state.LineSpacingAfter !== after)
          ) {
            this.toolbar.numSpacingAfter.setValue(
              after !== null ? (after < 0 ? after : Common.Utils.Metric.fnRecalcFromMM(after)) : "",
              true,
            )
            this._state.LineSpacingAfter = after
          }
        },
      }
    })(),
  )
})
