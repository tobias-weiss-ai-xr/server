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
 *  Transitions.js
 *
 *  View
 *
 *  Created on 15.07.21
 *
 */

define([
  "common/main/lib/util/utils",
  "common/main/lib/component/Button",
  "common/main/lib/component/DataView",
  "common/main/lib/component/ComboDataView",
  "common/main/lib/component/Layout",
  "presentationeditor/main/app/view/SlideSettings",
  "common/main/lib/component/MetricSpinner",
  "common/main/lib/component/Window",
], () => {
  PE.Views.Transitions = Common.UI.BaseView.extend(
    _.extend(
      (() => {
        function setEvents() {
          if (this.listEffects) {
            this.listEffects.on(
              "click",
              _.bind((combo, record) => {
                this.fireEvent("transit:selecteffect", [combo, record])
              }, this),
            )
          }

          if (this.btnPreview) {
            this.btnPreview.on(
              "click",
              _.bind((btn) => {
                this.fireEvent("transit:preview", [this.btnPreview])
              }, this),
            )
          }

          if (this.btnParameters) {
            this.btnParameters.menu.on("item:click", (menu, item, e) => {
              this.fireEvent("transit:parameters", [item.value])
            })
          }

          if (this.btnApplyToAll) {
            this.btnApplyToAll.on(
              "click",
              _.bind((btn) => {
                this.fireEvent("transit:applytoall", [this.btnApplyToAll])
              }, this),
            )
          }

          if (this.numDuration) {
            this.numDuration.on(
              "change",
              (bth) => {
                this.fireEvent("transit:duration", [this.numDuration])
              },
              this,
            )
          }

          if (this.numDelay) {
            this.numDelay.on(
              "change",
              (bth) => {
                this.fireEvent("transit:delay", [this.numDelay])
              },
              this,
            )
          }

          if (this.chStartOnClick) {
            this.chStartOnClick.on(
              "change",
              _.bind((e) => {
                this.fireEvent("transit:startonclick", [
                  this.chStartOnClick,
                  this.chStartOnClick.value,
                  this.chStartOnClick.lastValue,
                ])
              }, this),
            )
          }

          if (this.chDelay) {
            this.chDelay.on(
              "change",
              _.bind((e) => {
                this.fireEvent("transit:checkdelay", [
                  this.chDelay,
                  this.chDelay.value,
                  this.chDelay.lastValue,
                ])
              }, this),
            )
          }
        }

        return {
          // el: '#transitions-panel',

          options: {},

          initialize: function (options) {
            Common.UI.BaseView.prototype.initialize.call(this, options)
            this.toolbar = options.toolbar
            this.appConfig = options.mode
            this.$el = this.toolbar.toolbar.$el.find("#transitions-panel")
            const _set = Common.enumLock
            this.lockedControls = []

            this._arrEffectName = [
              {
                title: this.textNone,
                imageUrl: "btn-transition-none",
                value: Asc.c_oAscSlideTransitionTypes.None,
                id: Common.UI.getId(),
              },
              {
                title: this.textMorph,
                imageUrl: "btn-transition-morph",
                value: Asc.c_oAscSlideTransitionTypes.Morph,
                id: Common.UI.getId(),
              },
              {
                title: this.textFade,
                imageUrl: "btn-transition-fade",
                value: Asc.c_oAscSlideTransitionTypes.Fade,
                id: Common.UI.getId(),
              },
              {
                title: this.textPush,
                imageUrl: "btn-transition-push",
                value: Asc.c_oAscSlideTransitionTypes.Push,
                id: Common.UI.getId(),
              },
              {
                title: this.textWipe,
                imageUrl: "btn-transition-wipe",
                value: Asc.c_oAscSlideTransitionTypes.Wipe,
                id: Common.UI.getId(),
              },
              {
                title: this.textSplit,
                imageUrl: "btn-transition-split",
                value: Asc.c_oAscSlideTransitionTypes.Split,
                id: Common.UI.getId(),
              },
              {
                title: this.textUnCover,
                imageUrl: "btn-transition-uncover",
                value: Asc.c_oAscSlideTransitionTypes.UnCover,
                id: Common.UI.getId(),
              },
              {
                title: this.textCover,
                imageUrl: "btn-transition-cover",
                value: Asc.c_oAscSlideTransitionTypes.Cover,
                id: Common.UI.getId(),
              },
              {
                title: this.textClock,
                imageUrl: "btn-transition-clock",
                value: Asc.c_oAscSlideTransitionTypes.Clock,
                id: Common.UI.getId(),
              },
              {
                title: this.textZoom,
                imageUrl: "btn-transition-zoom",
                value: Asc.c_oAscSlideTransitionTypes.Zoom,
                id: Common.UI.getId(),
              },
              {
                title: this.textRandom,
                imageUrl: "btn-transition-random",
                value: Asc.c_oAscSlideTransitionTypes.Random,
                id: Common.UI.getId(),
                cls: "last-item",
              },
            ]
            this._arrEffectName.forEach((item) => {
              item.tip = item.title
            })

            const itemWidth = 88
            const itemHeight = 40
            this.listEffects = new Common.UI.ComboDataView({
              cls: "combo-transitions",
              itemWidth: itemWidth,
              itemHeight: itemHeight,
              style: "min-width:115px;",
              autoWidth: true,
              itemTemplate: _.template(
                [
                  `<div  class = "btn_item x-huge" id = "<%= id %>" style = "width: ${itemWidth}px;height: ${itemHeight}px;">`,
                  '<div class = "icon toolbar__icon options__icon <%= imageUrl %>"></div>',
                  '<div class = "caption"><%= title %></div>',
                  "</div>",
                ].join(""),
              ),
              enableKeyEvents: true,
              lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart, _set.transitLock],
              dataHint: "1",
              dataHintDirection: "bottom",
              dataHintOffset: "-16, 0",
              delayRenderTips: true,
              beforeOpenHandler: function (e) {
                const menu = this.openButton.menu

                if (menu.cmpEl) {
                  menu.menuAlignEl = this.cmpEl
                  menu.menuAlign = Common.UI.isRTL() ? "tr-tr" : "tl-tl"
                  menu.cmpEl.css({
                    width: this.cmpEl.width() - this.openButton.$el.width(),
                    "min-height": this.cmpEl.height(),
                  })
                }

                if (this.menuPicker.scroller) {
                  this.menuPicker.scroller.update({
                    includePadding: true,
                    suppressScrollX: true,
                  })
                }

                this.removeTips()
              },
            })
            this.lockedControls.push(this.listEffects)
            this.listEffects.menuPicker.store.add(this._arrEffectName)

            this.btnPreview = new Common.UI.Button({
              cls: "btn-toolbar", // x-huge icon-top',
              caption: this.txtPreview,
              split: false,
              iconCls: "toolbar__icon btn-preview-transitions",
              lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart, _set.transitLock],
              dataHint: "1",
              dataHintDirection: "left",
              dataHintOffset: "medium",
            })
            this.lockedControls.push(this.btnPreview)

            this.btnParameters = new Common.UI.Button({
              cls: "btn-toolbar x-huge icon-top",
              caption: this.txtParameters,
              iconCls: "toolbar__icon btn-transition-none",
              menu: new Common.UI.Menu({
                items: this.createParametersMenuItems(),
              }),
              lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart, _set.transitLock],
              dataHint: "1",
              dataHintDirection: "bottom",
              dataHintOffset: "small",
            })
            this.lockedControls.push(this.btnParameters)

            this.btnApplyToAll = new Common.UI.Button({
              cls: "btn-toolbar",
              caption: this.txtApplyToAll,
              split: true,
              iconCls: "toolbar__icon btn-transition-apply-all",
              lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart, _set.transitLock],
              dataHint: "1",
              dataHintDirection: "left",
              dataHintOffset: "medium",
            })
            this.lockedControls.push(this.btnApplyToAll)

            this.numDuration = new Common.UI.MetricSpinner({
              el: this.$el.find("#transit-spin-duration"),
              step: 1,
              width: 55,
              value: "",
              defaultUnit: this.txtSec,
              maxValue: 300,
              minValue: 0,
              lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart, _set.transitLock],
              dataHint: "1",
              dataHintDirection: "top",
              dataHintOffset: "small",
            })
            this.lockedControls.push(this.numDuration)

            this.lblDuration = new Common.UI.Label({
              el: this.$el.find("#transit-duration"),
              iconCls: "toolbar__icon btn-animation-duration",
              caption: this.strDuration,
              lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart, _set.transitLock],
            })
            this.lockedControls.push(this.lblDuration)

            this.numDelay = new Common.UI.MetricSpinner({
              el: this.$el.find("#transit-spin-delay"),
              step: 1,
              width: 55,
              value: "",
              defaultUnit: this.txtSec,
              maxValue: 300,
              minValue: 0,
              lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart, _set.transitLock],
              dataHint: "1",
              dataHintDirection: "bottom",
              dataHintOffset: "big",
            })
            this.lockedControls.push(this.numDelay)

            this.chStartOnClick = new Common.UI.CheckBox({
              el: this.$el.find("#transit-checkbox-startonclick"),
              labelText: this.strStartOnClick,
              lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart, _set.transitLock],
              dataHint: "1",
              dataHintDirection: "left",
              dataHintOffset: "small",
            })
            this.lockedControls.push(this.chStartOnClick)

            this.chDelay = new Common.UI.CheckBox({
              el: this.$el.find("#transit-checkbox-delay"),
              labelText: this.strDelay,
              lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart, _set.transitLock],
              dataHint: "1",
              dataHintDirection: "left",
              dataHintOffset: "small",
            })
            this.lockedControls.push(this.chDelay)
            Common.UI.LayoutManager.addControls(this.lockedControls)
            Common.Utils.lockControls(Common.enumLock.disableOnStart, true, {
              array: this.lockedControls,
            })

            Common.NotificationCenter.on("app:ready", this.onAppReady.bind(this))
          },

          render: function (el) {
            this.boxSdk = $("#editor_sdk")
            if (el) el.html(this.getPanel())
            return this
          },

          createParametersMenuItems: function () {
            const arrEffectType = [
              { caption: this.textSmoothly, value: Asc.c_oAscSlideTransitionParams.Fade_Smoothly },
              {
                caption: this.textBlack,
                value: Asc.c_oAscSlideTransitionParams.Fade_Through_Black,
              },
              { caption: this.textLeft, value: Asc.c_oAscSlideTransitionParams.Param_Left },
              { caption: this.textTop, value: Asc.c_oAscSlideTransitionParams.Param_Top },
              { caption: this.textRight, value: Asc.c_oAscSlideTransitionParams.Param_Right },
              { caption: this.textBottom, value: Asc.c_oAscSlideTransitionParams.Param_Bottom },
              { caption: this.textTopLeft, value: Asc.c_oAscSlideTransitionParams.Param_TopLeft },
              { caption: this.textTopRight, value: Asc.c_oAscSlideTransitionParams.Param_TopRight },
              {
                caption: this.textBottomLeft,
                value: Asc.c_oAscSlideTransitionParams.Param_BottomLeft,
              },
              {
                caption: this.textBottomRight,
                value: Asc.c_oAscSlideTransitionParams.Param_BottomRight,
              },
              {
                caption: this.textVerticalIn,
                value: Asc.c_oAscSlideTransitionParams.Split_VerticalIn,
              },
              {
                caption: this.textVerticalOut,
                value: Asc.c_oAscSlideTransitionParams.Split_VerticalOut,
              },
              {
                caption: this.textHorizontalIn,
                value: Asc.c_oAscSlideTransitionParams.Split_HorizontalIn,
              },
              {
                caption: this.textHorizontalOut,
                value: Asc.c_oAscSlideTransitionParams.Split_HorizontalOut,
              },
              {
                caption: this.textClockwise,
                value: Asc.c_oAscSlideTransitionParams.Clock_Clockwise,
              },
              {
                caption: this.textCounterclockwise,
                value: Asc.c_oAscSlideTransitionParams.Clock_Counterclockwise,
              },
              { caption: this.textWedge, value: Asc.c_oAscSlideTransitionParams.Clock_Wedge },
              { caption: this.textZoomIn, value: Asc.c_oAscSlideTransitionParams.Zoom_In },
              { caption: this.textZoomOut, value: Asc.c_oAscSlideTransitionParams.Zoom_Out },
              {
                caption: this.textZoomRotate,
                value: Asc.c_oAscSlideTransitionParams.Zoom_AndRotate,
              },
              {
                caption: this.textMorphObjects,
                value: Asc.c_oAscSlideTransitionParams.Morph_Objects,
              },
              { caption: this.textMorphWord, value: Asc.c_oAscSlideTransitionParams.Morph_Words },
              {
                caption: this.textMorphLetters,
                value: Asc.c_oAscSlideTransitionParams.Morph_Letters,
              },
            ]

            const itemsMenu = []
            _.each(arrEffectType, (item) => {
              itemsMenu.push({
                caption: item.caption,
                value: item.value,
                checkable: true,
                toggleGroup: "effects",
              })
            })
            return itemsMenu
          },

          onAppReady: function (config) {
            new Promise((accept, reject) => {
              accept()
            }).then(() => {
              setEvents.call(this)
            })
          },

          getPanel: function () {
            this.listEffects?.render(this.$el.find("#transit-field-effects"))
            this.btnPreview?.render(this.$el.find("#transit-button-preview"))
            this.btnParameters?.render(this.$el.find("#transit-button-parameters"))
            this.btnApplyToAll?.render(this.$el.find("#transit-button-apply"))
            this.renderComponent("#transit-spin-duration", this.numDuration)
            this.renderComponent("#transit-spin-delay", this.numDelay)
            this.renderComponent("#transit-checkbox-startonclick", this.chStartOnClick)
            this.$el.find("#label-delay").innerText = this.strDelay
            return this.$el
          },

          renderComponent: function (compid, obj) {
            const element = this.$el.find(compid)
            element.parent().append(obj.el)
          },

          show: function () {
            Common.UI.BaseView.prototype.show.call(this)
            this.fireEvent("show", this)
          },

          getButtons: function (type) {
            if (type === undefined) return this.lockedControls
            return []
          },

          setDisabled: function (state) {
            this.lockedControls?.forEach((button) => {
              button.setDisabled(state)
            }, this)
          },

          setMenuParameters: function (effect, value) {
            let minMax = [-1, -1]
            switch (effect) {
              case Asc.c_oAscSlideTransitionTypes.Fade:
                minMax = [0, 1]
                break
              case Asc.c_oAscSlideTransitionTypes.Push:
                minMax = [2, 5]
                break
              case Asc.c_oAscSlideTransitionTypes.Wipe:
                minMax = [2, 9]
                break
              case Asc.c_oAscSlideTransitionTypes.Split:
                minMax = [10, 13]
                break
              case Asc.c_oAscSlideTransitionTypes.UnCover:
                minMax = [2, 9]
                break
              case Asc.c_oAscSlideTransitionTypes.Cover:
                minMax = [2, 9]
                break
              case Asc.c_oAscSlideTransitionTypes.Clock:
                minMax = [14, 16]
                break
              case Asc.c_oAscSlideTransitionTypes.Zoom:
                minMax = [17, 19]
                break
              case Asc.c_oAscSlideTransitionTypes.Morph:
                minMax = [20, 22]
                break
            }

            let selectedElement

            _.each(this.btnParameters.menu.getItems(), (element, index) => {
              if (index >= minMax[0] && index <= minMax[1]) {
                element.setVisible(true)
                if (value !== undefined) {
                  if (value === element.value) selectedElement = element
                }
              } else element.setVisible(false)
            })

            if (selectedElement === undefined)
              selectedElement = this.btnParameters.menu.items[minMax[0]]

            if (effect !== Asc.c_oAscSlideTransitionTypes.None && selectedElement)
              selectedElement.setChecked(true)

            if (!this.listEffects.isDisabled()) {
              this.numDelay.setDisabled(this.chDelay.getValue() !== "checked")
              this.btnParameters.setDisabled(
                effect === Asc.c_oAscSlideTransitionTypes.None ||
                  effect === Asc.c_oAscSlideTransitionTypes.Random,
              )
              this.btnPreview.setDisabled(effect === Asc.c_oAscSlideTransitionTypes.None)
              this.numDuration.setDisabled(effect === Asc.c_oAscSlideTransitionTypes.None)
              this.lblDuration.setDisabled(effect === Asc.c_oAscSlideTransitionTypes.None)
            }
            return selectedElement ? selectedElement.value : -1
          },
        }
      })(),
      PE.Views.Transitions || {},
    ),
  )
})
