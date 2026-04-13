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
  if (window.DE?.Views?.DocumentHolder) {
    const dh = window.DE.Views.DocumentHolder.prototype

    dh.createDelayedElements = function () {
      if (this.menuInsertCaption || !window.document_content_ready) return // menu is already inited or editor styles are not loaded
      this.menuInsertCaption = new Common.UI.MenuItem({
        caption: this.txtInsertCaption,
      })
      const menuInsertCaptionSeparator = new Common.UI.MenuItem({ caption: "--" })

      this.menuSaveAsPicture = new Common.UI.MenuItem({
        caption: this.textSaveAsPicture,
      })

      const menuSaveAsPictureSeparator = new Common.UI.MenuItem({ caption: "--" })

      this.menuEquationInsertCaption = new Common.UI.MenuItem({
        caption: this.txtInsertCaption,
      })
      const menuEquationInsertCaptionSeparator = new Common.UI.MenuItem({ caption: "--" })

      this.menuImageAlign = new Common.UI.MenuItem({
        caption: this.textAlign,
        menu: new Common.UI.Menu({
          cls: "ppm-toolbar shifted-right",
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

      const _toolbar_view = DE.getController("Toolbar").getView()
      this.menuShapesMerge = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-combine-shapes",
        caption: this.textShapesMerge,
        menu: new Common.UI.Menu({
          cls: "ppm-toolbar shifted-right",
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
                    caption: this.textLeftPos,
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
                    caption: this.textLeftPos,
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

      this.mnuGroup = new Common.UI.MenuItem({
        caption: this.txtGroup,
        iconCls: "menu__icon btn-shape-group",
      })

      this.mnuUnGroup = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-shape-ungroup",
        caption: this.txtUngroup,
      })

      this.menuImageArrange = new Common.UI.MenuItem({
        caption: this.textArrange,
        menu: new Common.UI.Menu({
          cls: "ppm-toolbar shifted-right",
          menuAlign: "tl-tr",
          items: [
            new Common.UI.MenuItem({
              caption: this.textArrangeFront,
              iconCls: "menu__icon btn-arrange-front",
              valign: Asc.c_oAscChangeLevel.BringToFront,
            }),
            new Common.UI.MenuItem({
              caption: this.textArrangeBack,
              iconCls: "menu__icon btn-arrange-back",
              valign: Asc.c_oAscChangeLevel.SendToBack,
            }),
            new Common.UI.MenuItem({
              caption: this.textArrangeForward,
              iconCls: "menu__icon btn-arrange-forward",
              valign: Asc.c_oAscChangeLevel.BringForward,
            }),
            new Common.UI.MenuItem({
              caption: this.textArrangeBackward,
              iconCls: "menu__icon btn-arrange-backward",
              valign: Asc.c_oAscChangeLevel.BringBackward,
            }),
            { caption: "--" },
            this.mnuGroup,
            this.mnuUnGroup,
          ],
        }),
      })

      this.menuWrapPolygon = new Common.UI.MenuItem({
        caption: this.textEditWrapBoundary,
        cls: "no-icon-wrap-item",
      })

      this.menuImageWrap = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-small-wrap-inline",
        caption: this.textWrap,
        menu: new Common.UI.Menu({
          cls: "ppm-toolbar shifted-right",
          menuAlign: "tl-tr",
          items: [
            new Common.UI.MenuItem({
              caption: this.txtInline,
              iconCls: "menu__icon btn-small-wrap-inline",
              toggleGroup: "popuppicturewrapping",
              wrapType: Asc.c_oAscWrapStyle2.Inline,
              checkmark: false,
              checkable: true,
            }),
            { caption: "--" },
            new Common.UI.MenuItem({
              caption: this.txtSquare,
              iconCls: "menu__icon btn-small-wrap-square",
              toggleGroup: "popuppicturewrapping",
              wrapType: Asc.c_oAscWrapStyle2.Square,
              checkmark: false,
              checkable: true,
            }),
            new Common.UI.MenuItem({
              caption: this.txtTight,
              iconCls: "menu__icon btn-small-wrap-tight",
              toggleGroup: "popuppicturewrapping",
              wrapType: Asc.c_oAscWrapStyle2.Tight,
              checkmark: false,
              checkable: true,
            }),
            new Common.UI.MenuItem({
              caption: this.txtThrough,
              iconCls: "menu__icon btn-small-wrap-through",
              toggleGroup: "popuppicturewrapping",
              wrapType: Asc.c_oAscWrapStyle2.Through,
              checkmark: false,
              checkable: true,
            }),
            new Common.UI.MenuItem({
              caption: this.txtTopAndBottom,
              iconCls: "menu__icon btn-small-wrap-topandbottom",
              toggleGroup: "popuppicturewrapping",
              wrapType: Asc.c_oAscWrapStyle2.TopAndBottom,
              checkmark: false,
              checkable: true,
            }),
            { caption: "--" },
            new Common.UI.MenuItem({
              caption: this.txtInFront,
              iconCls: "menu__icon btn-small-wrap-infront",
              toggleGroup: "popuppicturewrapping",
              wrapType: Asc.c_oAscWrapStyle2.InFront,
              checkmark: false,
              checkable: true,
            }),
            new Common.UI.MenuItem({
              caption: this.txtBehind,
              iconCls: "menu__icon btn-small-wrap-behind",
              toggleGroup: "popuppicturewrapping",
              wrapType: Asc.c_oAscWrapStyle2.Behind,
              checkmark: false,
              checkable: true,
            }),
            { caption: "--" },
            this.menuWrapPolygon,
          ],
        }),
      })

      this.menuImageAdvanced = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-menu-image",
        caption: this.advancedText,
      })

      this.menuChartEdit = new Common.UI.MenuItem({
        caption: this.editChartText,
      })

      this.menuOriginalSize = new Common.UI.MenuItem({
        caption: this.originalSizeText,
      })

      this.menuImgReplace = new Common.UI.MenuItem({
        caption: this.textReplace,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            new Common.UI.MenuItem({ caption: this.textFromFile, value: 0 }),
            new Common.UI.MenuItem({ caption: this.textFromUrl, value: 1 }),
            new Common.UI.MenuItem({ caption: this.textFromStorage, value: 2 }),
          ],
        }),
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

      this.menuImgAccept = new Common.UI.MenuItem({
        caption: this.textAccept,
        value: "accept",
      })

      this.menuImgReject = new Common.UI.MenuItem({
        caption: this.textReject,
        value: "reject",
      })

      const menuImgReviewSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.menuImgPrint = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-print",
        caption: this.txtPrintSelection,
      })

      this.menuSignatureEditSign = new Common.UI.MenuItem({ caption: this.strSign, value: 0 })
      this.menuSignatureEditSetup = new Common.UI.MenuItem({ caption: this.strSetup, value: 2 })
      const menuEditSignSeparator = new Common.UI.MenuItem({ caption: "--" })

      this.menuImgRotate = new Common.UI.MenuItem({
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

      this.menuImgRemoveControl = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-cc-remove",
        caption: this.textRemoveControl,
        value: "remove",
      })

      this.menuImgControlSettings = new Common.UI.MenuItem({
        caption: this.textEditControls,
        value: "settings",
      })

      const menuImgControlSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.menuImgEditPoints = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-edit-points",
        caption: this.textEditPoints,
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

      this.menuImgStretchContentControl = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-resize-to-cell",
        caption: this.textStretchControl,
        value: "stretch",
      })

      this.menuTableStretchContentControl = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-resize-to-cell",
        caption: this.textStretchControl,
        value: "stretch",
      })

      this.pictureMenu = new Common.UI.Menu({
        cls: "shifted-right",
        restoreHeightAndTop: true,
        scrollToCheckedItem: false,
        initMenu: (value) => {
          if (_.isUndefined(value.imgProps)) return

          const notflow = !value.imgProps.value.get_CanBeFlow()
          const wrapping = value.imgProps.value.get_WrappingStyle()

          this.menuImageWrap._originalProps = value.imgProps.value

          let cls = "menu__icon "
          if (notflow) {
            for (let i = 0; i < 8; i++) {
              this.menuImageWrap.menu.items[i].setChecked(false)
            }
            cls += "btn-small-wrap-inline"
          } else {
            switch (wrapping) {
              case Asc.c_oAscWrapStyle2.Inline:
                this.menuImageWrap.menu.items[0].setChecked(true)
                cls += "btn-small-wrap-inline"
                break
              case Asc.c_oAscWrapStyle2.Square:
                this.menuImageWrap.menu.items[2].setChecked(true)
                cls += "btn-small-wrap-square"
                break
              case Asc.c_oAscWrapStyle2.Tight:
                this.menuImageWrap.menu.items[3].setChecked(true)
                cls += "btn-small-wrap-tight"
                break
              case Asc.c_oAscWrapStyle2.Through:
                this.menuImageWrap.menu.items[4].setChecked(true)
                cls += "btn-small-wrap-through"
                break
              case Asc.c_oAscWrapStyle2.TopAndBottom:
                this.menuImageWrap.menu.items[5].setChecked(true)
                cls += "btn-small-wrap-topandbottom"
                break
              case Asc.c_oAscWrapStyle2.Behind:
                this.menuImageWrap.menu.items[8].setChecked(true)
                cls += "btn-small-wrap-behind"
                break
              case Asc.c_oAscWrapStyle2.InFront:
                this.menuImageWrap.menu.items[7].setChecked(true)
                cls += "btn-small-wrap-infront"
                break
              default:
                for (let i = 0; i < 8; i++) {
                  this.menuImageWrap.menu.items[i].setChecked(false)
                }
                cls += "btn-small-wrap-infront"
                break
            }
          }
          this.menuImageWrap.setIconCls(cls)
          _.each(this.menuImageWrap.menu.items, (item) => {
            item.setDisabled(notflow)
          })

          const onlyCommonProps =
            (value.imgProps.isImg && value.imgProps.isChart) ||
            (value.imgProps.isImg && value.imgProps.isShape) ||
            (value.imgProps.isShape && value.imgProps.isChart)
          if (onlyCommonProps) {
            this.menuImageAdvanced.setCaption(this.advancedText)
            this.menuImageAdvanced.setIconCls("menu__icon btn-menu-image")
          } else {
            this.menuImageAdvanced.setCaption(
              value.imgProps.isImg
                ? this.imageText
                : value.imgProps.isChart
                  ? this.chartText
                  : this.shapeText,
            )
            this.menuImageAdvanced.setIconCls(
              `menu__icon ${value.imgProps.isImg ? "btn-menu-image" : value.imgProps.isChart ? "btn-menu-chart" : "btn-menu-shape"}`,
            )
          }

          this.menuChartEdit.setVisible(
            !_.isNull(value.imgProps.value.get_ChartProperties()) && !onlyCommonProps,
          )
          this.menuOriginalSize.setVisible(
            value.imgProps.isOnlyImg || (!value.imgProps.isChart && !value.imgProps.isShape),
          )

          const in_control = this.api.asc_IsContentControl()
          const control_props = in_control ? this.api.asc_GetContentControlProperties() : null
          const lock_type = control_props
            ? control_props.get_Lock()
            : Asc.c_oAscSdtLockType.Unlocked
          const content_locked =
            lock_type === Asc.c_oAscSdtLockType.SdtContentLocked ||
            lock_type === Asc.c_oAscSdtLockType.ContentLocked
          const is_form = control_props?.get_FormPr()

          this.menuImgStretchContentControl.setVisible(is_form)
          this.menuImgRemoveControl.setVisible(in_control)
          this.menuImgControlSettings.setVisible(
            in_control && this.mode.canEditContentControl && !is_form,
          )
          menuImgControlSeparator.setVisible(in_control)
          if (in_control) {
            this.menuImgRemoveControl.setDisabled(
              lock_type === Asc.c_oAscSdtLockType.SdtContentLocked ||
                lock_type === Asc.c_oAscSdtLockType.SdtLocked,
            )
            this.menuImgRemoveControl.setCaption(
              is_form ? this.getControlLabel(control_props) : this.textRemoveControl,
            )
          }

          const islocked = value.imgProps.locked || value.headerProps?.locked || content_locked
          const pluginGuid = value.imgProps.value.asc_getPluginGuid()
          this.menuImgReplace.setVisible(
            value.imgProps.isOnlyImg && (pluginGuid === null || pluginGuid === undefined),
          )
          if (this.menuImgReplace.isVisible())
            this.menuImgReplace.setDisabled(islocked || pluginGuid === null)

          const pluginGuidAvailable = pluginGuid !== null && pluginGuid !== undefined
          this.menuEditObject.setVisible(pluginGuidAvailable)
          this.menuEditObjectSeparator.setVisible(pluginGuidAvailable)

          if (pluginGuidAvailable) {
            const plugin = DE.getCollection("Common.Collections.Plugins").findWhere({
              guid: pluginGuid,
            })
            this.menuEditObject.setDisabled(
              (!this.api.asc_canEditTableOleObject() &&
                (plugin === null || plugin === undefined)) ||
                islocked,
            )
          }

          this.menuImgReplace.menu.items[2].setVisible(
            this.mode.canRequestInsertImage ||
              (this.mode.fileChoiceUrl && this.mode.fileChoiceUrl.indexOf("{documentType}") > -1),
          )

          this.menuImgRotate.setVisible(
            !value.imgProps.isChart && (pluginGuid === null || pluginGuid === undefined),
          )
          if (this.menuImgRotate.isVisible()) {
            this.menuImgRotate.setDisabled(islocked || value.imgProps.isSmartArt)
            this.menuImgRotate.menu.items[3].setDisabled(value.imgProps.isSmartArtInternal)
            this.menuImgRotate.menu.items[4].setDisabled(value.imgProps.isSmartArtInternal)
          }
          this.menuImgCrop.setVisible(this.api.asc_canEditCrop())
          if (this.menuImgCrop.isVisible()) this.menuImgCrop.setDisabled(islocked)

          this.menuImgResetCrop.setVisible(value.imgProps.value.asc_getIsCrop())
          if (this.menuImgResetCrop.isVisible()) this.menuImgResetCrop.setDisabled(islocked)

          if (this.menuChartEdit.isVisible())
            this.menuChartEdit.setDisabled(islocked || value.imgProps.value.get_SeveralCharts())

          this.menuOriginalSize.setDisabled(
            islocked ||
              value.imgProps.value.get_ImageUrl() === null ||
              value.imgProps.value.get_ImageUrl() === undefined,
          )
          this.menuImageAdvanced.setDisabled(islocked)
          this.menuImageAlign.setDisabled(islocked || wrapping === Asc.c_oAscWrapStyle2.Inline)
          if (!(islocked || wrapping === Asc.c_oAscWrapStyle2.Inline)) {
            const objcount = this.api.asc_getSelectedDrawingObjectsCount()
            const alignto = Common.Utils.InternalSettings.get("de-img-align-to") // 1 - page, 2 - margin, 3 - selected
            this.menuImageAlign.menu.items[7].setDisabled(
              objcount === 2 && (!alignto || alignto === 3),
            )
            this.menuImageAlign.menu.items[8].setDisabled(
              objcount === 2 && (!alignto || alignto === 3),
            )
          }
          this.menuShapesMerge.setDisabled(islocked || !this.api.asc_canMergeSelectedShapes())
          if (!this.menuShapesMerge.isDisabled()) {
            this.menuShapesMerge.menu.items.forEach((item) => {
              item.setDisabled(!this.api.asc_canMergeSelectedShapes(item.value))
            })
          }
          this.menuImageArrange.setDisabled(
            (wrapping === Asc.c_oAscWrapStyle2.Inline && !value.imgProps.value.get_FromGroup()) ||
              content_locked ||
              (this.api &&
                !this.api.CanUnGroup() &&
                !this.api.CanGroup() &&
                value.imgProps.isSmartArtInternal),
          )
          this.menuImageArrange.menu.items[0].setDisabled(value.imgProps.isSmartArtInternal)
          this.menuImageArrange.menu.items[1].setDisabled(value.imgProps.isSmartArtInternal)
          this.menuImageArrange.menu.items[2].setDisabled(value.imgProps.isSmartArtInternal)
          this.menuImageArrange.menu.items[3].setDisabled(value.imgProps.isSmartArtInternal)

          if (this.api) {
            this.mnuUnGroup.setDisabled(islocked || !this.api.CanUnGroup())
            this.mnuGroup.setDisabled(islocked || !this.api.CanGroup())
            this.menuWrapPolygon.setDisabled(islocked || !this.api.CanChangeWrapPolygon())
          }

          this.menuImageWrap.setDisabled(
            islocked ||
              value.imgProps.value.get_FromGroup() ||
              (notflow && this.menuWrapPolygon.isDisabled()) ||
              (!!control_props &&
                control_props.get_SpecificType() === Asc.c_oAscContentControlSpecificType.Picture &&
                !control_props.get_FormPr()),
          )

          const cancopy = this.api?.can_CopyCut()
          this.menuImgCopy.setDisabled(!cancopy)
          this.menuImgCut.setDisabled(islocked || !cancopy)
          this.menuImgPaste.setDisabled(islocked)
          this.menuImgPrint.setVisible(this.mode.canPrint)
          this.menuImgPrint.setDisabled(!cancopy)

          const lockreview = Common.Utils.InternalSettings.get("de-accept-reject-lock")
          this.menuImgAccept.setVisible(
            this.mode.canReview && !this.mode.isReviewOnly && !lockreview,
          )
          this.menuImgReject.setVisible(
            this.mode.canReview && !this.mode.isReviewOnly && !lockreview,
          )
          menuImgReviewSeparator.setVisible(
            this.mode.canReview && !this.mode.isReviewOnly && !lockreview,
          )

          const signGuid =
            value.imgProps?.value && this.mode.isSignatureSupport
              ? value.imgProps.value.asc_getSignatureId()
              : undefined
          const isInSign = !!signGuid
          this.menuSignatureEditSign.setVisible(isInSign)
          this.menuSignatureEditSetup.setVisible(isInSign)
          menuEditSignSeparator.setVisible(isInSign)

          if (isInSign) {
            this.menuSignatureEditSign.cmpEl.attr("data-value", signGuid) // sign
            this.menuSignatureEditSetup.cmpEl.attr("data-value", signGuid) // edit signature settings
          }

          const canEditPoints = this.api?.asc_canEditGeometry()
          this.menuImgEditPoints.setVisible(canEditPoints)
          canEditPoints && this.menuImgEditPoints.setDisabled(islocked)

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
          this.menuAddHyperlinkPic.setDisabled(islocked)
          menuHyperlinkPic.setDisabled(
            islocked ||
              (value.hyperProps !== undefined && value.hyperProps.isSeveralLinks === true),
          )
        },
        items: [
          this.menuImgCut,
          this.menuImgCopy,
          this.menuImgPaste,
          this.menuImgPrint,
          this.menuEditObjectSeparator,
          this.menuEditObject,
          { caption: "--" },
          this.menuImgAccept,
          this.menuImgReject,
          menuImgReviewSeparator,
          this.menuSignatureEditSign,
          this.menuSignatureEditSetup,
          menuEditSignSeparator,
          this.menuImgRemoveControl,
          this.menuImgControlSettings,
          menuImgControlSeparator,
          this.menuImageArrange,
          this.menuImageAlign,
          this.menuShapesMerge,
          this.menuImageWrap,
          this.menuImgRotate,
          { caption: "--" },
          this.menuInsertCaption,
          menuInsertCaptionSeparator,
          this.menuSaveAsPicture,
          menuSaveAsPictureSeparator,
          this.menuAddHyperlinkPic,
          menuHyperlinkPic,
          menuHyperlinkPicSeparator,
          this.menuImgCrop,
          this.menuImgResetCrop,
          this.menuOriginalSize,
          this.menuImgReplace,
          this.menuChartEdit,
          this.menuImgStretchContentControl,
          this.menuImgEditPoints,
          this.menuImageAdvanced,
        ],
      }).on("hide:after", (menu, e, isFromInputControl) => {
        this.clearCustomItems(menu)
        if (!isFromInputControl) this.fireEvent("editcomplete", this)
        this.currentMenu = null
      })

      /* table menu*/

      this.menuTableInsertCaption = new Common.UI.MenuItem({
        caption: this.txtInsertCaption,
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
              toggleGroup: "popuptablecellalign",
              checkmark: false,
              checkable: true,
              checked: false,
              valign: Asc.c_oAscVertAlignJc.Top,
            })),
            (this.menuTableCellCenter = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-middle",
              caption: this.AlignMiddle,
              toggleGroup: "popuptablecellalign",
              checkmark: false,
              checkable: true,
              checked: false,
              valign: Asc.c_oAscVertAlignJc.Center,
            })),
            (this.menuTableCellBottom = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-bottom",
              caption: this.AlignBottom,
              toggleGroup: "popuptablecellalign",
              checkmark: false,
              checkable: true,
              checked: false,
              valign: Asc.c_oAscVertAlignJc.Bottom,
            })),
            { caption: "--" },
            (this.menuTableCellLeft = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-left",
              caption: this.AlignLeft,
              toggleGroup: "popuptablecellhalign",
              checkmark: false,
              checkable: true,
              checked: false,
              halign: 1,
            })),
            (this.menuTableCellHCenter = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-center",
              caption: this.AlignCenter,
              toggleGroup: "popuptablecellhalign",
              checkmark: false,
              checkable: true,
              checked: false,
              halign: 2,
            })),
            (this.menuTableCellRight = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-right",
              caption: this.AlignRight,
              toggleGroup: "popuptablecellhalign",
              checkmark: false,
              checkable: true,
              checked: false,
              halign: 0,
            })),
            (this.menuTableCellJust = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-just",
              caption: this.AlignJust,
              toggleGroup: "popuptablecellhalign",
              checkmark: false,
              checkable: true,
              checked: false,
              halign: 3,
            })),
          ],
        }),
      })

      this.menuTableAdvanced = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-menu-table",
        caption: this.advancedTableText,
      })

      this.menuParagraphAdvancedInTable = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-paragraph",
        caption: this.advancedParagraphText,
      })

      this.menuStyleInTable = new Common.UI.MenuItem({
        caption: this.styleText,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            (this.menuStyleSaveInTable = new Common.UI.MenuItem({
              caption: this.saveStyleText,
            })),
            (this.menuStyleUpdateInTable = new Common.UI.MenuItem({
              caption: this.updateStyleText.replace("%1", window.currentStyleName),
            })),
          ],
        }),
      })

      const menuHyperlinkSeparator = new Common.UI.MenuItem({
        caption: "--",
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

      this.menuTableRemoveForm = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-cc-remove",
        caption: this.textRemove,
        value: "remove",
      })

      this.menuTableRemoveControl = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-cc-remove",
        caption: this.textRemoveControl,
        value: "remove",
      })

      this.menuTableControlSettings = new Common.UI.MenuItem({
        caption: this.textSettings,
        value: "settings",
      })

      const menuTableControl = new Common.UI.MenuItem({
        caption: this.textContentControls,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [this.menuTableRemoveControl, this.menuTableControlSettings],
        }),
      })

      this.menuTableTOC = new Common.UI.MenuItem({
        caption: this.textTOC,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            {
              caption: this.textSettings,
              value: "settings",
            },
            {
              caption: this.textUpdateAll,
              value: "all",
            },
            {
              caption: this.textUpdatePages,
              value: "pages",
            },
          ],
        }),
      })

      /** coauthoring begin **/
      this.menuAddCommentTable = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-add-comment",
        caption: this.addCommentText,
      })
      /** coauthoring end **/

      this.menuAddHyperlinkTable = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-inserthyperlink",
        caption: this.hyperlinkText,
      })

      this.menuTableFollow = new Common.UI.MenuItem({
        caption: this.textFollow,
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

      this.menuTableAccept = new Common.UI.MenuItem({
        caption: this.textAccept,
        value: "accept",
      })

      this.menuTableReject = new Common.UI.MenuItem({
        caption: this.textReject,
        value: "reject",
      })

      const menuTableReviewSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.menuTablePrint = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-print",
        caption: this.txtPrintSelection,
      })

      const menuEquationSeparatorInTable = new Common.UI.MenuItem({
        caption: "--",
      })

      this.menuTableDistRows = new Common.UI.MenuItem({
        caption: this.textDistributeRows,
        value: false,
      })

      this.menuTableDistCols = new Common.UI.MenuItem({
        caption: this.textDistributeCols,
        value: true,
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

      this.menuTableStartNewList = new Common.UI.MenuItem({
        caption: this.textStartNewList,
      })

      this.menuTableStartNumberingFrom = new Common.UI.MenuItem({
        caption: this.textStartNumberingFrom,
      })

      this.menuTableContinueNumbering = new Common.UI.MenuItem({
        caption: this.textContinueNumbering,
      })

      this.menuTableListIndents = new Common.UI.MenuItem({
        caption: this.textIndents,
      })

      const menuNumberingTable = new Common.UI.MenuItem({
        caption: this.bulletsText,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            this.menuTableStartNewList,
            this.menuTableStartNumberingFrom,
            this.menuTableContinueNumbering,
            this.menuTableListIndents,
          ],
        }),
      })

      this.menuTableRefreshField = new Common.UI.MenuItem({
        caption: this.textRefreshField,
      })
      this.menuTableEditField = new Common.UI.MenuItem({
        caption: this.textEditField,
      })
      this.menuTableFieldCodes = new Common.UI.MenuItem({
        caption: this.textFieldCodes,
      })

      const menuTableFieldSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.menuTableEquation = new Common.UI.MenuItem({
        caption: this.advancedEquationText,
        iconCls: "menu__icon btn-equation",
        menu: this.createEquationMenu("popuptableeqinput", "tl-tr"),
      })

      this.menuTableSelectText = new Common.UI.MenuItem({
        caption: this.selectText,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          style: "width: 100px",
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
            new Common.UI.MenuItem({
              caption: this.textSeveral,
              value: 4,
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
          style: "width: 100px",
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
            new Common.UI.MenuItem({
              caption: this.textCells,
              value: 3,
            }),
          ],
        }),
      })

      this.tableMenu = new Common.UI.Menu({
        cls: "shifted-right",
        restoreHeightAndTop: true,
        scrollToCheckedItem: false,
        initMenu: (value) => {
          // table properties
          if (_.isUndefined(value.tableProps)) return

          const isEquation = value.mathProps?.value

          for (let i = 11; i < 32; i++) {
            // from menuEquationSeparatorInTable to menuAddCommentTable (except menuAddCommentTable)
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

          const block_control_lock = value.paraProps
            ? !value.paraProps.value.can_EditBlockContentControl()
            : false
          let disabled = value.tableProps.locked || value.headerProps?.locked

          this.menuTableInsertText.setDisabled(disabled)
          this.menuTableDeleteText.setDisabled(disabled)

          if (this.api) {
            this.mnuTableMerge.setDisabled(disabled || !this.api.CheckBeforeMergeCells())
            this.mnuTableSplit.setDisabled(disabled || !this.api.CheckBeforeSplitCells())
          }

          this.menuTableDistRows.setDisabled(disabled)
          this.menuTableDistCols.setDisabled(disabled)
          this.menuTableCellAlign.setDisabled(disabled)
          this.menuTableDirection.setDisabled(disabled)
          this.menuTableAdvanced.setDisabled(disabled)

          const cancopy = this.api?.can_CopyCut()
          this.menuTableCopy.setDisabled(!cancopy)
          this.menuTableCut.setDisabled(disabled || !cancopy)
          this.menuTablePaste.setDisabled(disabled)
          this.menuTablePrint.setVisible(this.mode.canPrint)
          this.menuTablePrint.setDisabled(!cancopy)

          const lockreview = Common.Utils.InternalSettings.get("de-accept-reject-lock")
          this.menuTableAccept.setVisible(
            this.mode.canReview && !this.mode.isReviewOnly && !lockreview,
          )
          this.menuTableReject.setVisible(
            this.mode.canReview && !this.mode.isReviewOnly && !lockreview,
          )
          menuTableReviewSeparator.setVisible(
            this.mode.canReview && !this.mode.isReviewOnly && !lockreview,
          )

          // bullets & numbering
          const listId = this.api.asc_GetCurrentNumberingId()
          const in_list = listId !== null
          menuNumberingTable.setVisible(in_list)
          if (in_list) {
            const numLvl = this.api
              .asc_GetNumberingPr(listId)
              .get_Lvl(this.api.asc_GetCurrentNumberingLvl())
            const format = numLvl.get_Format()
            const start = this.api.asc_GetCalculatedNumberingValue()
            this.menuTableStartNewList.setVisible(numLvl.get_Start() !== start)
            this.menuTableStartNewList.value = { start: numLvl.get_Start() }
            this.menuTableStartNumberingFrom.setVisible(format !== Asc.c_oAscNumberingFormat.Bullet)
            this.menuTableStartNumberingFrom.value = { format: format, start: start }
            this.menuTableStartNewList.setCaption(
              format === Asc.c_oAscNumberingFormat.Bullet
                ? this.textSeparateList
                : this.textStartNewList,
            )
            this.menuTableContinueNumbering.setCaption(
              format === Asc.c_oAscNumberingFormat.Bullet
                ? this.textJoinList
                : this.textContinueNumbering,
            )
            this.menuTableListIndents.value = { format: format, props: numLvl }
          }

          // hyperlink properties
          let text = null
          if (this.api) {
            text = this.api.can_AddHyperlink()
          }
          this.menuAddHyperlinkTable.setVisible(value.hyperProps === undefined && text !== false)
          menuHyperlinkTable.setVisible(value.hyperProps !== undefined)

          this.menuEditHyperlinkTable.hyperProps = value.hyperProps
          this.menuRemoveHyperlinkTable.hyperProps = value.hyperProps

          if (text !== false) {
            this.menuAddHyperlinkTable.hyperProps = {}
            this.menuAddHyperlinkTable.hyperProps.value = new Asc.CHyperlinkProperty()
            this.menuAddHyperlinkTable.hyperProps.value.put_Text(text)
          }

          // review move
          const data = this.api.asc_GetRevisionsChangesStack()
          let move = false
          this.menuTableFollow.value = null
          _.each(data, (item) => {
            if (
              (item.get_Type() === Asc.c_oAscRevisionsChangeType.TextAdd ||
                item.get_Type() === Asc.c_oAscRevisionsChangeType.TextRem) &&
              item.get_MoveType() !== Asc.c_oAscRevisionsMove.NoMove
            ) {
              this.menuTableFollow.value = item
              move = true
            }
          })
          this.menuTableFollow.setVisible(move)

          menuHyperlinkSeparator.setVisible(
            this.menuAddHyperlinkTable.isVisible() ||
              menuHyperlinkTable.isVisible() ||
              menuNumberingTable.isVisible() ||
              this.menuTableFollow.isVisible(),
          )

          // paragraph properties
          this.menuParagraphAdvancedInTable.setVisible(value.paraProps !== undefined)

          this._currentParaObjDisabled = disabled =
            value.paraProps.locked || value.headerProps?.locked
          this.menuAddHyperlinkTable.setDisabled(disabled)
          menuHyperlinkTable.setDisabled(
            disabled ||
              (value.hyperProps !== undefined && value.hyperProps.isSeveralLinks === true),
          )
          this.menuParagraphAdvancedInTable.setDisabled(disabled || block_control_lock)

          this.menuSpellCheckTable.setVisible(
            value.spellProps !== undefined && value.spellProps.value.get_Checked() === false,
          )
          this.menuToDictionaryTable.setVisible(this.mode.isDesktopApp)
          menuSpellcheckTableSeparator.setVisible(
            value.spellProps !== undefined && value.spellProps.value.get_Checked() === false,
          )

          const isInChart =
            value.imgProps?.value && !_.isNull(value.imgProps.value.get_ChartProperties())
          const editStyle =
            this.mode.canEditStyles && !isInChart && !value.imgProps?.isSmartArtInternal
          this.menuStyleInTable.setVisible(editStyle)
          if (editStyle) {
            this.menuStyleUpdateInTable.setCaption(
              this.updateStyleText.replace(
                "%1",
                DE.getController("Main").translationTable[window.currentStyleName] ||
                  window.currentStyleName,
              ),
            )
            this.menuStyleSaveInTable.setDisabled(!window.styles_loaded)
          }

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
            eqlen = this.addEquationMenu(this.tableMenu, 10)
          } else this.clearEquationMenu(this.tableMenu, 10)
          menuEquationSeparatorInTable.setVisible(isEquation && eqlen > 0)

          this.menuTableEquation.setVisible(isEquation)
          this.menuTableEquation.setDisabled(disabled)
          if (isEquation) {
            const eq = this.api.asc_GetMathInputType()
            const isInlineMath = this.api.asc_IsInlineMath()
            const isEqToolbarHide = Common.Utils.InternalSettings.get("de-equation-toolbar-hide")

            this.menuTableEquation.menu.items[5].setChecked(eq === Asc.c_oAscMathInputType.Unicode)
            this.menuTableEquation.menu.items[6].setChecked(eq === Asc.c_oAscMathInputType.LaTeX)
            this.menuTableEquation.menu.items[8].options.isEquationInline = isInlineMath
            this.menuTableEquation.menu.items[8].setCaption(
              isInlineMath ? this.eqToDisplayText : this.eqToInlineText,
            )
            this.menuTableEquation.menu.items[9].options.isToolbarHide = isEqToolbarHide
            this.menuTableEquation.menu.items[9].setCaption(
              isEqToolbarHide ? this.showEqToolbar : this.hideEqToolbar,
            )
          }

          let control_lock = value.paraProps
            ? !value.paraProps.value.can_DeleteBlockContentControl() ||
              !value.paraProps.value.can_EditBlockContentControl() ||
              !value.paraProps.value.can_DeleteInlineContentControl() ||
              !value.paraProps.value.can_EditInlineContentControl()
            : false
          const in_toc = this.api.asc_GetTableOfContentsPr(true)
          const in_control = !in_toc && this.api.asc_IsContentControl()
          if (in_control) {
            const control_props = this.api.asc_GetContentControlProperties()
            const lock_type = control_props
              ? control_props.get_Lock()
              : Asc.c_oAscSdtLockType.Unlocked
            const is_form = control_props?.get_FormPr()
            this.menuTableRemoveForm.setVisible(is_form)
            this.menuTableStretchContentControl.setVisible(is_form)
            menuTableControl.setVisible(!is_form)
            if (is_form) {
              this.menuTableRemoveForm.setDisabled(
                lock_type === Asc.c_oAscSdtLockType.SdtContentLocked ||
                  lock_type === Asc.c_oAscSdtLockType.SdtLocked,
              )
              this.menuTableRemoveForm.setCaption(this.getControlLabel(control_props))
            } else {
              this.menuTableRemoveControl.setDisabled(
                lock_type === Asc.c_oAscSdtLockType.SdtContentLocked ||
                  lock_type === Asc.c_oAscSdtLockType.SdtLocked,
              )
              this.menuTableControlSettings.setVisible(this.mode.canEditContentControl)
            }
            const spectype = control_props
              ? control_props.get_SpecificType()
              : Asc.c_oAscContentControlSpecificType.None
            control_lock =
              control_lock ||
              spectype === Asc.c_oAscContentControlSpecificType.CheckBox ||
              spectype === Asc.c_oAscContentControlSpecificType.Picture ||
              spectype === Asc.c_oAscContentControlSpecificType.Signature ||
              spectype === Asc.c_oAscContentControlSpecificType.ComboBox ||
              spectype === Asc.c_oAscContentControlSpecificType.DropDownList ||
              spectype === Asc.c_oAscContentControlSpecificType.DateTime
          } else {
            menuTableControl.setVisible(in_control)
            this.menuTableRemoveForm.setVisible(in_control)
            this.menuTableStretchContentControl.setVisible(false)
          }
          this.menuTableTOC.setVisible(in_toc)

          /** coauthoring begin **/
          // comments
          this.menuAddCommentTable.setVisible(
            this.api.can_AddQuotedComment() !== false &&
              this.mode.canCoAuthoring &&
              this.mode.canComments &&
              !control_lock,
          )
          this.menuAddCommentTable.setDisabled(
            value.paraProps !== undefined && value.paraProps.locked === true,
          )
          /** coauthoring end **/

          const in_field = this.api.asc_HaveFields(true)
          this.menuTableRefreshField.setVisible(!!in_field)
          this.menuTableRefreshField.setDisabled(disabled)
          this.menuTableEditField.setVisible(!!in_field)
          this.menuTableEditField.setDisabled(disabled)
          this.menuTableFieldCodes.setVisible(!!in_field)
          this.menuTableFieldCodes.setDisabled(disabled)
          menuTableFieldSeparator.setVisible(!!in_field)
        },
        items: [
          this.menuSpellCheckTable,
          menuSpellcheckTableSeparator,
          this.menuTableCut,
          this.menuTableCopy,
          this.menuTablePaste,
          this.menuTablePrint,
          { caption: "--" },
          this.menuTableAccept,
          this.menuTableReject,
          menuTableReviewSeparator,
          menuEquationSeparatorInTable,
          this.menuTableRefreshField,
          this.menuTableEditField,
          this.menuTableFieldCodes,
          menuTableFieldSeparator,
          this.menuTableSelectText,
          this.menuTableInsertText,
          this.menuTableDeleteText,
          { caption: "--" },
          this.mnuTableMerge,
          this.mnuTableSplit,
          { caption: "--" },
          this.menuTableDistRows,
          this.menuTableDistCols,
          { caption: "--" },
          this.menuTableCellAlign,
          this.menuTableDirection,
          { caption: "--" },
          this.menuTableInsertCaption,
          { caption: "--" },
          this.menuTableAdvanced,
          { caption: "--" },
          /** coauthoring begin **/
          this.menuAddCommentTable,
          /** coauthoring end **/
          menuNumberingTable,
          this.menuAddHyperlinkTable,
          menuHyperlinkTable,
          this.menuTableFollow,
          menuHyperlinkSeparator,
          this.menuTableStretchContentControl,
          this.menuTableRemoveForm,
          menuTableControl,
          this.menuTableTOC,
          this.menuParagraphAdvancedInTable,
          this.menuTableEquation,
          this.menuStyleInTable,
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

      /* text menu */

      this.menuParagraphBreakBefore = new Common.UI.MenuItem({
        caption: this.breakBeforeText,
        checkable: true,
      })

      this.menuParagraphKeepLines = new Common.UI.MenuItem({
        caption: this.keepLinesText,
        checkable: true,
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
              checkmark: false,
              checkable: true,
              checked: false,
              toggleGroup: "popupparagraphvalign",
              valign: Asc.c_oAscVAlign.Top,
            })),
            (this.menuParagraphCenter = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-middle",
              caption: this.AlignMiddle,
              checkmark: false,
              checkable: true,
              checked: false,
              toggleGroup: "popupparagraphvalign",
              valign: Asc.c_oAscVAlign.Center,
            })),
            (this.menuParagraphBottom = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-bottom",
              caption: this.AlignBottom,
              checkmark: false,
              checkable: true,
              checked: false,
              toggleGroup: "popupparagraphvalign",
              valign: Asc.c_oAscVAlign.Bottom,
            })),
            { caption: "--" },
            (this.menuParagraphLeft = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-left",
              caption: this.AlignLeft,
              checkmark: false,
              checkable: true,
              checked: false,
              toggleGroup: "popupparagraphhalign",
              halign: 1,
            })),
            (this.menuParagraphHCenter = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-center",
              caption: this.AlignCenter,
              checkmark: false,
              checkable: true,
              checked: false,
              toggleGroup: "popupparagraphhalign",
              halign: 2,
            })),
            (this.menuParagraphRight = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-right",
              caption: this.AlignRight,
              checkmark: false,
              checkable: true,
              checked: false,
              toggleGroup: "popupparagraphhalign",
              halign: 0,
            })),
            (this.menuParagraphJust = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-just",
              caption: this.AlignJust,
              checkmark: false,
              checkable: true,
              checked: false,
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
          cls: "ppm-toolbar shifted-right",
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

      this.menuParagraphAdvanced = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-paragraph",
        caption: this.advancedParagraphText,
      })

      this.menuFrameAdvanced = new Common.UI.MenuItem({
        caption: this.advancedFrameText,
      })

      this.menuDropCapAdvanced = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-dropcap-intext icon-rtl",
        caption: this.advancedDropCapText,
      })

      this.menuParagraphEquation = new Common.UI.MenuItem({
        caption: this.advancedEquationText,
        iconCls: "menu__icon btn-equation",
        menu: this.createEquationMenu("popupparaeqinput", "tl-tr"),
      })
      /** coauthoring begin **/
      const menuCommentSeparatorPara = new Common.UI.MenuItem({
        caption: "--",
      })

      this.menuAddCommentPara = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-add-comment",
        caption: this.addCommentText,
      })
      /** coauthoring end **/

      const menuHyperlinkParaSeparator = new Common.UI.MenuItem({
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

      const menuStyleSeparator = new Common.UI.MenuItemSeparator()
      const menuStyle = new Common.UI.MenuItem({
        caption: this.styleText,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            (this.menuStyleSave = new Common.UI.MenuItem({
              caption: this.saveStyleText,
            })),
            (this.menuStyleUpdate = new Common.UI.MenuItem({
              caption: this.updateStyleText.replace("%1", window.currentStyleName),
            })),
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

      this.menuParaAccept = new Common.UI.MenuItem({
        caption: this.textAccept,
        value: "accept",
      })

      this.menuParaReject = new Common.UI.MenuItem({
        caption: this.textReject,
        value: "reject",
      })

      const menuParaReviewSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.menuParaPrint = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-print",
        caption: this.txtPrintSelection,
      })

      const menuEquationSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.menuParaRemoveControl = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-cc-remove",
        caption: this.textRemoveControl,
        value: "remove",
      })

      this.menuParaControlSettings = new Common.UI.MenuItem({
        caption: this.textEditControls,
        value: "settings",
      })

      const menuParaControlSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.menuParaTOCSettings = new Common.UI.MenuItem({
        caption: this.textTOCSettings,
        value: "settings",
      })

      this.menuParaTOCRefresh = new Common.UI.MenuItem({
        caption: this.textUpdateTOC,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            {
              caption: this.textUpdateAll,
              value: "all",
            },
            {
              caption: this.textUpdatePages,
              value: "pages",
            },
          ],
        }),
      })

      const menuParaTOCSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.menuParaRefreshField = new Common.UI.MenuItem({
        caption: this.textRefreshField,
      })
      this.menuParaEditField = new Common.UI.MenuItem({
        caption: this.textEditField,
      })
      this.menuParaFieldCodes = new Common.UI.MenuItem({
        caption: this.textFieldCodes,
      })

      const menuParaFieldSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.menuParaStartNewList = new Common.UI.MenuItem({
        caption: this.textStartNewList,
      })

      this.menuParaStartNumberingFrom = new Common.UI.MenuItem({
        caption: this.textStartNumberingFrom,
      })

      this.menuParaContinueNumbering = new Common.UI.MenuItem({
        caption: this.textContinueNumbering,
      })

      this.menuParaListIndents = new Common.UI.MenuItem({
        caption: this.textIndents,
      })

      const menuParaNumberingSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.menuParaFollow = new Common.UI.MenuItem({
        caption: this.textFollow,
      })

      const menuParaFollowSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.textMenu = new Common.UI.Menu({
        cls: "shifted-right",
        restoreHeightAndTop: true,
        scrollToCheckedItem: false,
        initMenu: (value) => {
          const isInShape =
            value.imgProps?.value && !_.isNull(value.imgProps.value.get_ShapeProperties())
          const isInChart =
            value.imgProps?.value && !_.isNull(value.imgProps.value.get_ChartProperties())
          const isEquation = value.mathProps?.value
          const in_toc = this.api.asc_GetTableOfContentsPr(true)
          const in_control = !in_toc && this.api.asc_IsContentControl()
          const control_props = in_control ? this.api.asc_GetContentControlProperties() : null
          const block_control_lock = value.paraProps
            ? !value.paraProps.value.can_EditBlockContentControl()
            : false
          const is_form = control_props?.get_FormPr()

          this.menuParagraphVAlign.setVisible(
            isInShape &&
              !isInChart &&
              !isEquation &&
              !(is_form && control_props.get_FormPr().get_Fixed()),
          ) // после того, как заголовок можно будет растягивать по вертикали, вернуть "|| isInChart" !!
          this.menuParagraphDirection.setVisible(
            isInShape &&
              !isInChart &&
              !isEquation &&
              !(is_form && control_props.get_FormPr().get_Fixed()),
          ) // после того, как заголовок можно будет растягивать по вертикали, вернуть "|| isInChart" !!
          if (isInShape || isInChart) {
            const align = value.imgProps.value.get_VerticalTextAlign()
            const halign = value.paraProps.value.get_Jc()
            this.menuParagraphTop.setChecked(align === Asc.c_oAscVAlign.Top)
            this.menuParagraphCenter.setChecked(align === Asc.c_oAscVAlign.Center)
            this.menuParagraphBottom.setChecked(align === Asc.c_oAscVAlign.Bottom)
            this.menuParagraphLeft.setChecked(halign === 1)
            this.menuParagraphHCenter.setChecked(halign === 2)
            this.menuParagraphRight.setChecked(halign === 0)
            this.menuParagraphJust.setChecked(halign === 3)

            const dir = value.imgProps.value.get_Vert()
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
          }
          this.menuParagraphAdvanced.isChart = value.imgProps?.isChart
          this.menuParagraphAdvanced.isSmartArtInternal = value.imgProps?.isSmartArtInternal
          this.menuParagraphBreakBefore.setVisible(!isInShape && !isInChart && !isEquation)
          this.menuParagraphKeepLines.setVisible(!isInShape && !isInChart && !isEquation)
          if (value.paraProps) {
            this.menuParagraphBreakBefore.setChecked(value.paraProps.value.get_PageBreakBefore())
            this.menuParagraphKeepLines.setChecked(value.paraProps.value.get_KeepLines())
          }

          let text = null
          if (this.api) {
            text = this.api.can_AddHyperlink()
          }
          this.menuAddHyperlinkPara.setVisible(value.hyperProps === undefined && text !== false)
          menuHyperlinkPara.setVisible(value.hyperProps !== undefined)
          menuHyperlinkParaSeparator.setVisible(
            this.menuAddHyperlinkPara.isVisible() || menuHyperlinkPara.isVisible(),
          )
          this.menuEditHyperlinkPara.hyperProps = value.hyperProps
          this.menuRemoveHyperlinkPara.hyperProps = value.hyperProps
          if (text !== false) {
            this.menuAddHyperlinkPara.hyperProps = {}
            this.menuAddHyperlinkPara.hyperProps.value = new Asc.CHyperlinkProperty()
            this.menuAddHyperlinkPara.hyperProps.value.put_Text(text)
          }
          const disabled = value.paraProps.locked || value.headerProps?.locked
          this._currentParaObjDisabled = disabled
          this.menuAddHyperlinkPara.setDisabled(disabled)
          menuHyperlinkPara.setDisabled(
            disabled ||
              (value.hyperProps !== undefined && value.hyperProps.isSeveralLinks === true),
          )

          // review move
          const data = this.api.asc_GetRevisionsChangesStack()
          let move = false
          this.menuParaFollow.value = null
          _.each(data, (item) => {
            if (
              (item.get_Type() === Asc.c_oAscRevisionsChangeType.TextAdd ||
                item.get_Type() === Asc.c_oAscRevisionsChangeType.TextRem) &&
              item.get_MoveType() !== Asc.c_oAscRevisionsMove.NoMove
            ) {
              this.menuParaFollow.value = item
              move = true
            }
          })
          this.menuParaFollow.setVisible(move)
          menuParaFollowSeparator.setVisible(move)

          this.menuParagraphBreakBefore.setDisabled(
            disabled ||
              block_control_lock ||
              !_.isUndefined(value.headerProps) ||
              !_.isUndefined(value.imgProps),
          )
          this.menuParagraphKeepLines.setDisabled(disabled || block_control_lock)
          this.menuParagraphAdvanced.setDisabled(
            disabled || block_control_lock || is_form?.get_Fixed(),
          )
          this.menuFrameAdvanced.setDisabled(disabled)
          this.menuDropCapAdvanced.setDisabled(disabled)
          this.menuParagraphVAlign.setDisabled(disabled)
          this.menuParagraphDirection.setDisabled(disabled)

          const cancopy = this.api?.can_CopyCut()
          this.menuParaCopy.setDisabled(!cancopy)
          this.menuParaCut.setDisabled(disabled || !cancopy)
          this.menuParaPaste.setDisabled(disabled)
          this.menuParaPrint.setVisible(this.mode.canPrint)
          this.menuParaPrint.setDisabled(!cancopy)

          const lockreview = Common.Utils.InternalSettings.get("de-accept-reject-lock")
          this.menuParaAccept.setVisible(
            this.mode.canReview && !this.mode.isReviewOnly && !lockreview,
          )
          this.menuParaReject.setVisible(
            this.mode.canReview && !this.mode.isReviewOnly && !lockreview,
          )
          menuParaReviewSeparator.setVisible(
            this.mode.canReview && !this.mode.isReviewOnly && !lockreview,
          )

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
            eqlen = this.addEquationMenu(this.textMenu, 18)
          } else this.clearEquationMenu(this.textMenu, 18)
          menuEquationSeparator.setVisible(isEquation && eqlen > 0)
          this.menuEquationInsertCaption.setVisible(isEquation)
          menuEquationInsertCaptionSeparator.setVisible(isEquation)

          this.menuParagraphEquation.setVisible(isEquation)
          this.menuParagraphEquation.setDisabled(disabled)
          if (isEquation) {
            const eq = this.api.asc_GetMathInputType()
            const isInlineMath = this.api.asc_IsInlineMath()
            const isEqToolbarHide = Common.Utils.InternalSettings.get("de-equation-toolbar-hide")

            this.menuParagraphEquation.menu.items[5].setChecked(
              eq === Asc.c_oAscMathInputType.Unicode,
            )
            this.menuParagraphEquation.menu.items[6].setChecked(
              eq === Asc.c_oAscMathInputType.LaTeX,
            )
            this.menuParagraphEquation.menu.items[8].options.isEquationInline = isInlineMath
            this.menuParagraphEquation.menu.items[8].setCaption(
              isInlineMath ? this.eqToDisplayText : this.eqToInlineText,
            )
            this.menuParagraphEquation.menu.items[9].options.isToolbarHide = isEqToolbarHide
            this.menuParagraphEquation.menu.items[9].setCaption(
              isEqToolbarHide ? this.showEqToolbar : this.hideEqToolbar,
            )
          }

          const frame_pr = value.paraProps.value.get_FramePr()
          this.menuFrameAdvanced.setVisible(frame_pr !== undefined)
          this.menuDropCapAdvanced.setVisible(frame_pr !== undefined)
          if (frame_pr)
            this.menuDropCapAdvanced.setIconCls(
              `${frame_pr.get_DropCap() === Asc.c_oAscDropCap.Drop ? "menu__icon btn-dropcap-intext" : "menu__icon btn-dropcap-inmargin"} icon-rtl`,
            )

          const edit_style =
            this.mode.canEditStyles && !isInChart && !value.imgProps?.isSmartArtInternal
          menuStyleSeparator.setVisible(edit_style)
          menuStyle.setVisible(edit_style)
          if (edit_style) {
            this.menuStyleUpdate.setCaption(
              this.updateStyleText.replace(
                "%1",
                DE.getController("Main").translationTable[window.currentStyleName] ||
                  window.currentStyleName,
              ),
            )
            this.menuStyleSave.setDisabled(!window.styles_loaded)
          }

          let control_lock = value.paraProps
            ? !value.paraProps.value.can_DeleteBlockContentControl() ||
              !value.paraProps.value.can_EditBlockContentControl() ||
              !value.paraProps.value.can_DeleteInlineContentControl() ||
              !value.paraProps.value.can_EditInlineContentControl()
            : false

          this.menuParaRemoveControl.setVisible(in_control)
          this.menuParaControlSettings.setVisible(
            in_control && this.mode.canEditContentControl && !is_form,
          )
          menuParaControlSeparator.setVisible(in_control)
          if (in_control) {
            const lock_type = control_props
              ? control_props.get_Lock()
              : Asc.c_oAscSdtLockType.Unlocked
            this.menuParaRemoveControl.setDisabled(
              lock_type === Asc.c_oAscSdtLockType.SdtContentLocked ||
                lock_type === Asc.c_oAscSdtLockType.SdtLocked,
            )
            this.menuParaRemoveControl.setCaption(
              is_form ? this.getControlLabel(control_props) : this.textRemoveControl,
            )

            const spectype = control_props
              ? control_props.get_SpecificType()
              : Asc.c_oAscContentControlSpecificType.None
            control_lock =
              control_lock ||
              spectype === Asc.c_oAscContentControlSpecificType.CheckBox ||
              spectype === Asc.c_oAscContentControlSpecificType.Picture ||
              spectype === Asc.c_oAscContentControlSpecificType.Signature ||
              spectype === Asc.c_oAscContentControlSpecificType.ComboBox ||
              spectype === Asc.c_oAscContentControlSpecificType.DropDownList ||
              spectype === Asc.c_oAscContentControlSpecificType.DateTime
          }
          this.menuParaTOCSettings.setVisible(in_toc)
          this.menuParaTOCRefresh.setVisible(in_toc)
          menuParaTOCSeparator.setVisible(in_toc)

          /** coauthoring begin **/
          let isVisible =
            !isInChart &&
            this.api.can_AddQuotedComment() !== false &&
            this.mode.canCoAuthoring &&
            this.mode.canComments &&
            !control_lock
          if (this.mode.compatibleFeatures) isVisible = isVisible && !isInShape
          menuCommentSeparatorPara.setVisible(isVisible)
          this.menuAddCommentPara.setVisible(isVisible)
          this.menuAddCommentPara.setDisabled(value.paraProps && value.paraProps.locked === true)
          /** coauthoring end **/

          const in_field = this.api.asc_HaveFields(true)
          this.menuParaRefreshField.setVisible(!!in_field)
          this.menuParaRefreshField.setDisabled(disabled)
          this.menuParaEditField.setVisible(!!in_field)
          this.menuParaEditField.setDisabled(disabled)
          this.menuParaFieldCodes.setVisible(!!in_field)
          this.menuParaFieldCodes.setDisabled(disabled)
          menuParaFieldSeparator.setVisible(!!in_field)

          const listId = this.api.asc_GetCurrentNumberingId()
          const in_list = listId !== null
          menuParaNumberingSeparator.setVisible(in_list) // hide when first item is selected
          this.menuParaStartNewList.setVisible(in_list)
          this.menuParaStartNumberingFrom.setVisible(in_list)
          this.menuParaContinueNumbering.setVisible(in_list)
          this.menuParaListIndents.setVisible(in_list)
          if (in_list) {
            const level = this.api.asc_GetCurrentNumberingLvl()
            const numLvl = this.api.asc_GetNumberingPr(listId).get_Lvl(level)
            const format = numLvl.get_Format()
            const start = this.api.asc_GetCalculatedNumberingValue()
            this.menuParaStartNewList.setVisible(numLvl.get_Start() !== start)
            this.menuParaStartNewList.value = { start: numLvl.get_Start() }
            this.menuParaStartNumberingFrom.setVisible(format !== Asc.c_oAscNumberingFormat.Bullet)
            this.menuParaStartNumberingFrom.value = { format: format, start: start }
            this.menuParaStartNewList.setCaption(
              format === Asc.c_oAscNumberingFormat.Bullet
                ? this.textSeparateList
                : this.textStartNewList,
            )
            this.menuParaContinueNumbering.setCaption(
              format === Asc.c_oAscNumberingFormat.Bullet
                ? this.textJoinList
                : this.textContinueNumbering,
            )
            this.menuParaListIndents.value = {
              listId: listId,
              level: level,
              format: format,
              props: numLvl,
            }
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
          this.menuParaPrint,
          menuParaReviewSeparator,
          this.menuParaAccept,
          this.menuParaReject,
          menuEquationInsertCaptionSeparator,
          this.menuEquationInsertCaption,
          { caption: "--" },
          menuEquationSeparator,
          this.menuParaRemoveControl,
          this.menuParaControlSettings,
          menuParaControlSeparator,
          this.menuParaRefreshField,
          this.menuParaEditField,
          this.menuParaFieldCodes,
          menuParaFieldSeparator,
          this.menuParaTOCSettings,
          this.menuParaTOCRefresh,
          menuParaTOCSeparator,
          this.menuParagraphBreakBefore,
          this.menuParagraphKeepLines,
          this.menuParagraphVAlign,
          this.menuParagraphDirection,
          this.menuParagraphAdvanced,
          this.menuFrameAdvanced,
          this.menuDropCapAdvanced,
          this.menuParagraphEquation,
          /** coauthoring begin **/
          menuCommentSeparatorPara,
          this.menuAddCommentPara,
          /** coauthoring end **/
          menuHyperlinkParaSeparator,
          this.menuAddHyperlinkPara,
          menuHyperlinkPara,
          menuParaFollowSeparator,
          this.menuParaFollow,
          menuParaNumberingSeparator,
          this.menuParaStartNewList,
          this.menuParaStartNumberingFrom,
          this.menuParaContinueNumbering,
          this.menuParaListIndents,
          menuStyleSeparator,
          menuStyle,
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

      /* header/footer menu */
      const menuEditHeaderFooter = new Common.UI.MenuItem({
        caption: this.editHeaderText,
      })

      this.hdrMenu = new Common.UI.Menu({
        cls: "shifted-right",
        initMenu: (value) => {
          menuEditHeaderFooter.setCaption(value.Header ? this.editHeaderText : this.editFooterText)
          menuEditHeaderFooter.off("click").on("click", (item) => {
            if (this.api) {
              if (value.Header) {
                this.api.GoToHeader(value.PageNum)
              } else this.api.GoToFooter(value.PageNum)
              this.fireEvent("editcomplete", this)
            }
          })
        },
        items: [menuEditHeaderFooter],
      }).on("hide:after", (menu, e, isFromInputControl) => {
        this.clearCustomItems(menu)
        if (!isFromInputControl) this.fireEvent("editcomplete", this)
        this.currentMenu = null
      })

      const shortcutHints = {}
      const nextpage = $("#id_buttonNextPage")
      nextpage.attr("data-toggle", "tooltip")
      shortcutHints.MoveToNextPage = {
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
      shortcutHints.MoveToPreviousPage = {
        label: this.textPrevPage,
        applyCallback: (item, hintText) => {
          prevpage.tooltip({
            title: hintText,
            placement: "top-right",
          })
        },
      }
      DE.getController("Common.Controllers.Shortcuts").updateShortcutHints(shortcutHints)

      this.fireEvent("createdelayedelements", [this, "edit"])
    }

    dh.createDelayedElementsViewer = function () {
      if (this.menuViewCopy) return // menu is already inited

      this.menuViewCopy = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-copy",
        caption: this.textCopy,
        value: "copy",
      })

      this.menuViewPaste = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-paste",
        caption: this.textPaste,
        value: "paste",
      })

      this.menuViewCut = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-cut",
        caption: this.textCut,
        value: "cut",
      })

      this.menuViewUndo = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-undo icon-rtl",
        caption: this.textUndo,
      })

      this.menuViewCopySeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.menuViewAddComment = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-add-comment",
        caption: this.addCommentText,
      })

      this.menuSignatureViewSign = new Common.UI.MenuItem({ caption: this.strSign, value: 0 })
      this.menuSignatureDetails = new Common.UI.MenuItem({ caption: this.strDetails, value: 1 })
      this.menuSignatureViewSetup = new Common.UI.MenuItem({ caption: this.strSetup, value: 2 })
      this.menuSignatureRemove = new Common.UI.MenuItem({ caption: this.strDelete, value: 3 })
      this.menuViewSignSeparator = new Common.UI.MenuItem({ caption: "--" })

      this.menuViewPrint = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-print",
        caption: this.txtPrintSelection,
      })

      this.viewModeMenu = new Common.UI.Menu({
        cls: "shifted-right",
        initMenu: (value) => {
          const isInChart =
            value.imgProps?.value && !_.isNull(value.imgProps.value.get_ChartProperties())
          const isInShape =
            value.imgProps?.value && !_.isNull(value.imgProps.value.get_ShapeProperties())
          const signGuid =
            value.imgProps?.value && this.mode.isSignatureSupport
              ? value.imgProps.value.asc_getSignatureId()
              : undefined
          const signProps = signGuid ? this.api.asc_getSignatureSetup(signGuid) : null
          const isInSign = !!signProps && this._canProtect
          const control_lock = value.paraProps
            ? !value.paraProps.value.can_DeleteBlockContentControl() ||
              !value.paraProps.value.can_EditBlockContentControl() ||
              !value.paraProps.value.can_DeleteInlineContentControl() ||
              !value.paraProps.value.can_EditInlineContentControl()
            : false
          let canComment =
            !isInChart &&
            this.api.can_AddQuotedComment() !== false &&
            this.mode.canCoAuthoring &&
            this.mode.canComments &&
            !this._isDisabled &&
            !control_lock
          let canEditControl = false

          if (this.mode.compatibleFeatures) canComment = canComment && !isInShape
          if (this.api.asc_IsContentControl()) {
            const control_props = this.api.asc_GetContentControlProperties()
            const spectype = control_props
              ? control_props.get_SpecificType()
              : Asc.c_oAscContentControlSpecificType.None
            canComment =
              canComment &&
              !(
                spectype === Asc.c_oAscContentControlSpecificType.CheckBox ||
                spectype === Asc.c_oAscContentControlSpecificType.Picture ||
                spectype === Asc.c_oAscContentControlSpecificType.Signature ||
                spectype === Asc.c_oAscContentControlSpecificType.ComboBox ||
                spectype === Asc.c_oAscContentControlSpecificType.DropDownList ||
                spectype === Asc.c_oAscContentControlSpecificType.DateTime
              )

            canEditControl =
              spectype !== undefined &&
              (spectype === Asc.c_oAscContentControlSpecificType.None ||
                spectype === Asc.c_oAscContentControlSpecificType.ComboBox ||
                spectype === Asc.c_oAscContentControlSpecificType.Complex) &&
              !control_lock
          }

          this.menuViewUndo.setVisible(
            this.mode.canCoAuthoring && this.mode.canComments && !this._isDisabled,
          )
          this.menuViewUndo.setDisabled(!this.api.asc_getCanUndo())
          this.menuViewCopySeparator.setVisible(isInSign)

          const isRequested = signProps ? signProps.asc_getRequested() : false
          this.menuSignatureViewSign.setVisible(isInSign && isRequested)
          this.menuSignatureDetails.setVisible(isInSign && !isRequested)
          this.menuSignatureViewSetup.setVisible(isInSign)
          this.menuSignatureRemove.setVisible(isInSign && !isRequested)
          this.menuViewSignSeparator.setVisible(canComment)

          if (isInSign) {
            this.menuSignatureViewSign.cmpEl.attr("data-value", signGuid) // sign
            this.menuSignatureDetails.cmpEl.attr("data-value", signProps.asc_getId()) // view certificate
            this.menuSignatureViewSetup.cmpEl.attr("data-value", signGuid) // view signature settings
            this.menuSignatureRemove.cmpEl.attr("data-value", signGuid)
          }

          this.menuViewAddComment.setVisible(canComment)
          this.menuViewAddComment.setDisabled(
            (value.paraProps && value.paraProps.locked === true) ||
              this._docProtection.isReadOnly ||
              this._docProtection.isFormsOnly,
          )

          const disabled = value.paraProps && value.paraProps.locked === true
          const cancopy = this.api?.can_CopyCut()
          this.menuViewCopy.setDisabled(!cancopy)
          this.menuViewCut.setVisible(this._fillFormMode && canEditControl)
          this.menuViewCut.setDisabled(
            disabled ||
              !cancopy ||
              this._docProtection.isReadOnly ||
              this._docProtection.isCommentsOnly,
          )
          this.menuViewPaste.setVisible(this._fillFormMode && canEditControl)
          this.menuViewPaste.setDisabled(
            disabled || this._docProtection.isReadOnly || this._docProtection.isCommentsOnly,
          )
          this.menuViewPrint.setVisible(this.mode.canPrint && !this._fillFormMode)
          this.menuViewPrint.setDisabled(!cancopy)
        },
        items: [
          this.menuViewCut,
          this.menuViewCopy,
          this.menuViewPaste,
          this.menuViewUndo,
          this.menuViewPrint,
          this.menuViewCopySeparator,
          this.menuSignatureViewSign,
          this.menuSignatureDetails,
          this.menuSignatureViewSetup,
          this.menuSignatureRemove,
          this.menuViewSignSeparator,
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

      this.fireEvent("createdelayedelements", [this, "view"])
    }

    dh.createDelayedElementsPDFViewer = function () {
      if (this.menuPDFViewCopy) return // menu is already inited

      this.menuPDFViewCopy = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-copy",
        caption: this.textCopy,
        value: "copy",
      })

      this.viewPDFModeMenu = new Common.UI.Menu({
        cls: "shifted-right",
        initMenu: (value) => {
          this.menuPDFViewCopy.setDisabled(!this.api?.can_CopyCut())
        },
        items: [this.menuPDFViewCopy],
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
        iconCls: "menu__icon btn-redo",
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
          let canFillRole = true
          if (value.controlProps?.formPr) {
            const oform = this.api.asc_GetOForm()
            if (oform && !oform.asc_canFillRole(value.controlProps.formPr.get_Role())) {
              canFillRole = false
            }
          }
          this.menuPDFFormsUndo.setDisabled(disabled || !this.api.asc_getCanUndo()) // undo
          this.menuPDFFormsRedo.setDisabled(disabled || !this.api.asc_getCanRedo()) // redo

          this.menuPDFFormsClear.setDisabled(
            disabled || !this.api.asc_IsContentControl() || !canFillRole,
          ) // clear
          this.menuPDFFormsCut.setDisabled(disabled || !cancopy || !canFillRole) // cut
          this.menuPDFFormsCopy.setDisabled(!cancopy) // copy
          this.menuPDFFormsPaste.setDisabled(
            disabled || !this.api.asc_IsContentControl() || !canFillRole,
          ) // paste;
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
  }
})
