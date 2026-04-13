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
 *  Animation.js
 *
 *  View
 *
 *  Created on 13.10.21
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
  "common/main/lib/component/Label",
  "common/main/lib/component/Window",
  "common/main/lib/component/ThemeColorPalette",
], () => {
  PE.Views.Animation = Common.UI.BaseView.extend(
    _.extend(
      (() => {
        function setEvents() {
          if (this.listEffects) {
            this.listEffects.on(
              "click",
              _.bind((combo, record) => {
                this.fireEvent("animation:selecteffect", [combo, record])
              }, this),
            )
            this.listEffectsMore.on(
              "click",
              _.bind(() => {
                const rec = this.listEffects.menuPicker.getSelectedRec()
                this.fireEvent("animation:additional", [
                  !(rec && rec.get("value") === AscFormat.ANIM_PRESET_NONE),
                ]) // replace effect
              }, this),
            )
          }

          this.btnAddAnimation?.menu.on("item:click", (menu, item, e) => {
            item.value === "more" && this.fireEvent("animation:additional", [false]) // add effect
          })

          if (this.btnPreview) {
            this.btnPreview.on(
              "click",
              _.bind((btn) => {
                this.fireEvent("animation:preview", [this.btnPreview])
              }, this),
            )
            this.btnPreview.menu.on(
              "item:click",
              _.bind((menu, item, e) => {
                if (item.value === "preview") this.fireEvent("animation:preview", [this.btnPreview])
                else if (item.value === "auto")
                  Common.Utils.InternalSettings.set("pe-animation-no-auto-preview", !item.checked)
              }, this),
            )
          }

          if (this.cmbTrigger) {
            this.cmbTrigger.menu.on(
              "item:click",
              _.bind((menu, item, e) => {
                this.fireEvent("animation:trigger", [item])
              }, this),
            )
            this.btnClickOf.menu.on(
              "item:click",
              _.bind((menu, item, e) => {
                this.fireEvent("animation:triggerclickof", [item])
              }, this),
            )
          }

          if (this.btnParameters) {
            this.btnParameters.menu.on("item:click", (menu, item, e) => {
              this.fireEvent("animation:parameters", [
                item.value,
                item.options.isCustom ? "custompath" : item.toggleGroup,
              ])
            })
          }

          if (this.btnAnimationPane) {
            this.btnAnimationPane.on(
              "click",
              _.bind((btn) => {
                this.fireEvent("animation:animationpane", [this.btnAnimationPane])
              }, this),
            )
          }

          if (this.cmbDuration) {
            this.cmbDuration.on(
              "changed:before",
              (combo, record, e) => {
                this.fireEvent("animation:durationchange", [true, combo, record, e])
              },
              this,
            )
            this.cmbDuration.on(
              "changed:after",
              (combo, record, e) => {
                this.fireEvent("animation:durationchange", [false, combo, record, e])
              },
              this,
            )
            this.cmbDuration.on(
              "selected",
              (combo, record) => {
                this.fireEvent("animation:durationselected", [combo, record])
              },
              this,
            )
            this.cmbDuration.on(
              "show:after",
              (combo, e, params) => {
                this.fireEvent("animation:durationfocusin", [true, combo, e, params])
              },
              this,
            )
            this.cmbDuration.on(
              "combo:focusin",
              (combo) => {
                this.fireEvent("animation:durationfocusin", [false, combo])
              },
              this,
            )
          }

          if (this.numDelay) {
            this.numDelay.on(
              "change",
              (bth) => {
                this.fireEvent("animation:delay", [this.numDelay])
              },
              this,
            )
          }

          if (this.cmbStart) {
            this.cmbStart.on("selected", (combo, record) => {
              this.fireEvent("animation:startselect", [combo, record])
            })
          }

          if (this.cmbRepeat) {
            this.cmbRepeat.on(
              "changed:before",
              (combo, record, e) => {
                this.fireEvent("animation:repeatchange", [true, combo, record, e])
              },
              this,
            )
            this.cmbRepeat.on(
              "changed:after",
              (combo, record, e) => {
                this.fireEvent("animation:repeatchange", [false, combo, record, e])
              },
              this,
            )
            this.cmbRepeat.on(
              "selected",
              (combo, record) => {
                this.fireEvent("animation:repeatselected", [combo, record])
              },
              this,
            )
            this.cmbRepeat.on(
              "show:after",
              (combo, e, params) => {
                this.fireEvent("animation:repeatfocusin", [true, combo, e, params])
              },
              this,
            )
            this.cmbRepeat.on(
              "combo:focusin",
              (combo) => {
                this.fireEvent("animation:repeatfocusin", [false, combo])
              },
              this,
            )
          }

          if (this.chRewind) {
            this.chRewind.on(
              "change",
              _.bind((e) => {
                this.fireEvent("animation:checkrewind", [
                  this.chRewind,
                  this.chRewind.value,
                  this.chRewind.lastValue,
                ])
              }, this),
            )
          }

          this.btnMoveEarlier?.on(
            "click",
            _.bind((btn) => {
              this.fireEvent("animation:moveearlier", [this.btnMoveEarlier])
            }, this),
          )

          this.btnMoveLater?.on(
            "click",
            _.bind((btn) => {
              this.fireEvent("animation:movelater", [this.btnMoveLater])
            }, this),
          )
        }

        return {
          // el: '#transitions-panel',

          options: {},

          initialize: function (options) {
            this.triggers = {
              ClickSequence: 0,
              ClickOf: 1,
            }
            this.startIndexParam = 2
            this.allEffects = [
              {
                group: "none",
                value: AscFormat.ANIM_PRESET_NONE,
                iconCls: "animation-none",
                displayValue: this.textNone,
              },
            ].concat(Common.define.effectData.getEffectFullData())
            Common.UI.BaseView.prototype.initialize.call(this, options)
            this.toolbar = options.toolbar
            this.appConfig = options.mode
            this.$el = this.toolbar.toolbar.$el.find("#animation-panel")
            const me = this
            const _set = Common.enumLock
            this.lockedControls = []
            this._arrEffectName = [
              {
                group: "none",
                value: AscFormat.ANIM_PRESET_NONE,
                iconCls: "animation-none",
                displayValue: this.textNone,
              },
            ].concat(Common.define.effectData.getEffectData())
            _.forEach(this._arrEffectName, (elm) => {
              elm.tip = elm.displayValue
            })
            this._arrEffectOptions = []
            const itemWidth = 88
            const itemHeight = 40
            this.listEffectsMore = new Common.UI.MenuItem({
              caption: this.textMoreEffects,
            })
            this.listEffects = new Common.UI.ComboDataView({
              cls: "combo-transitions combo-animation",
              itemWidth: itemWidth,
              itemHeight: itemHeight,
              style: "min-width:210px;",
              autoWidth: true,
              itemTemplate: _.template(
                [
                  `<div  class = "btn_item x-huge" id = "<%= id %>" style = "width: ${itemWidth}px;height: ${itemHeight}px;">`,
                  '<div class = "icon toolbar__icon <%= iconCls %>"></div>',
                  '<div class = "caption"><%= displayValue %></div>',
                  "</div>",
                ].join(""),
              ),
              groups: new Common.UI.DataViewGroupStore(
                [{ id: "none", value: -10, caption: this.textNone }].concat(
                  Common.define.effectData.getEffectGroupData(),
                ),
              ),
              store: new Common.UI.DataViewStore(this._arrEffectName),
              additionalMenuItems: [{ caption: "--" }, this.listEffectsMore],
              enableKeyEvents: true,
              lock: [_set.slideDeleted, _set.noSlides, _set.noGraphic, _set.timingLock],
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

            this.btnPreview = new Common.UI.Button({
              cls: "btn-toolbar   x-huge  icon-top", // x-huge icon-top',
              caption: this.txtPreview,
              split: true,
              menu: true,
              iconCls: "toolbar__icon btn-animation-preview-start",
              lock: [_set.slideDeleted, _set.noSlides, _set.noAnimationPreview, _set.timingLock],
              dataHint: "1",
              dataHintDirection: "bottom",
              dataHintOffset: "small",
            })
            this.lockedControls.push(this.btnPreview)

            this.btnParameters = new Common.UI.Button({
              cls: "btn-toolbar  x-huge icon-top",
              caption: this.txtParameters,
              iconCls: "toolbar__icon icon btn-animation-parameters",
              menu: true,
              lock: [
                _set.slideDeleted,
                _set.noSlides,
                _set.noGraphic,
                _set.noAnimation,
                _set.noAnimationParam,
                _set.timingLock,
              ],
              dataHint: "1",
              dataHintDirection: "bottom",
              dataHintOffset: "small",
            })
            this.lockedControls.push(this.btnParameters)

            this.btnAnimationPane = new Common.UI.Button({
              cls: "btn-toolbar x-huge icon-top",
              caption: this.txtAnimationPane,
              iconCls: "toolbar__icon icon btn-animation-panel",
              lock: [_set.slideDeleted, _set.noSlides, _set.timingLock],
              enableToggle: true,
              dataHint: "1",
              dataHintDirection: "bottom",
              dataHintOffset: "small",
            })
            this.lockedControls.push(this.btnAnimationPane)

            this.btnAddAnimation = new Common.UI.Button({
              cls: "btn-toolbar  x-huge  icon-top",
              caption: this.txtAddEffect,
              iconCls: "toolbar__icon icon btn-add-animation",
              menu: true,
              action: "add-animation",
              lock: [_set.slideDeleted, _set.noSlides, _set.noGraphic, _set.timingLock],
              dataHint: "1",
              dataHintDirection: "bottom",
              dataHintOffset: "small",
            })

            this.lockedControls.push(this.btnAddAnimation)

            this.cmbDuration = new Common.UI.ComboBoxCustom({
              el: this.$el.find("#animation-spin-duration"),
              cls: "input-group-nr",
              menuStyle: "min-width: 100%;",
              editable: true,
              data: [
                { value: 20, displayValue: this.str20 },
                { value: 5, displayValue: this.str5 },
                { value: 3, displayValue: this.str3 },
                { value: 2, displayValue: this.str2 },
                { value: 1, displayValue: this.str1 },
                { value: 0.5, displayValue: this.str0_5 },
              ],
              lock: [
                _set.slideDeleted,
                _set.noSlides,
                _set.noGraphic,
                _set.noAnimation,
                _set.noAnimationDuration,
                _set.timingLock,
              ],
              dataHint: "1",
              dataHintDirection: "top",
              dataHintOffset: "small",
              updateFormControl: function (record) {
                record &&
                  record.get("value") >= 0 &&
                  this.setRawValue(`${record.get("value")} ${me.txtSec}`)
              },
            })
            this.lockedControls.push(this.cmbDuration)

            this.lblDuration = new Common.UI.Label({
              el: this.$el.find("#animation-duration"),
              iconCls: "toolbar__icon btn-animation-duration",
              caption: this.strDuration,
              lock: [
                _set.slideDeleted,
                _set.noSlides,
                _set.noGraphic,
                _set.noAnimation,
                _set.noAnimationDuration,
                _set.timingLock,
              ],
            })
            this.lockedControls.push(this.lblDuration)

            this.cmbTrigger = new Common.UI.Button({
              parentEl: $("#animation-trigger"),
              cls: "btn-toolbar",
              iconCls: "toolbar__icon btn-trigger",
              caption: this.strTrigger,
              lock: [
                _set.slideDeleted,
                _set.noSlides,
                _set.noGraphic,
                _set.noAnimation,
                _set.noTriggerObjects,
                _set.timingLock,
              ],
              menu: new Common.UI.Menu({
                items: [
                  {
                    caption: this.textOnClickSequence,
                    checkable: true,
                    toggleGroup: "animtrigger",
                    value: this.triggers.ClickSequence,
                  },
                  {
                    value: this.triggers.ClickOf,
                    caption: this.textOnClickOf,
                    menu: new Common.UI.Menu({
                      menuAlign: "tl-tr",
                      items: [],
                    }),
                  },
                ],
              }),
              dataHint: "1",
              dataHintDirection: "left",
              dataHintOffset: "medium",
            })
            this.lockedControls.push(this.cmbTrigger)
            this.btnClickOf = this.cmbTrigger.menu.items[1]

            this.numDelay = new Common.UI.MetricSpinner({
              el: this.$el.find("#animation-spin-delay"),
              step: 1,
              width: 55,
              value: "",
              defaultUnit: this.txtSec,
              maxValue: 60,
              minValue: 0,
              lock: [
                _set.slideDeleted,
                _set.noSlides,
                _set.noGraphic,
                _set.noAnimation,
                _set.timingLock,
              ],
              dataHint: "1",
              dataHintDirection: "bottom",
              dataHintOffset: "big",
            })
            this.lockedControls.push(this.numDelay)

            this.lblDelay = new Common.UI.Label({
              el: this.$el.find("#animation-delay"),
              iconCls: "toolbar__icon btn-animation-delay",
              caption: this.strDelay,
              lock: [
                _set.slideDeleted,
                _set.noSlides,
                _set.noGraphic,
                _set.noAnimation,
                _set.timingLock,
              ],
            })
            this.lockedControls.push(this.lblDelay)

            this.cmbStart = new Common.UI.ComboBox({
              cls: "input-group-nr",
              menuStyle: "min-width: 100%;",
              editable: false,
              lock: [
                _set.slideDeleted,
                _set.noSlides,
                _set.noGraphic,
                _set.noAnimation,
                _set.timingLock,
              ],
              data: [
                { value: AscFormat.NODE_TYPE_CLICKEFFECT, displayValue: this.textStartOnClick },
                { value: AscFormat.NODE_TYPE_WITHEFFECT, displayValue: this.textStartWithPrevious },
                {
                  value: AscFormat.NODE_TYPE_AFTEREFFECT,
                  displayValue: this.textStartAfterPrevious,
                },
              ],
              dataHint: "1",
              dataHintDirection: "top",
              dataHintOffset: "small",
            })
            this.lockedControls.push(this.cmbStart)

            this.lblStart = new Common.UI.Label({
              el: this.$el.find("#animation-label-start"),
              iconCls: "toolbar__icon btn-play",
              caption: this.strStart,
              lock: [
                _set.slideDeleted,
                _set.noSlides,
                _set.noGraphic,
                _set.noAnimation,
                _set.timingLock,
              ],
            })
            this.lockedControls.push(this.lblStart)

            this.chRewind = new Common.UI.CheckBox({
              el: this.$el.find("#animation-checkbox-rewind"),
              labelText: this.strRewind,
              lock: [
                _set.slideDeleted,
                _set.noSlides,
                _set.noGraphic,
                _set.noAnimation,
                _set.timingLock,
              ],
              dataHint: "1",
              dataHintDirection: "left",
              dataHintOffset: "small",
            })
            this.lockedControls.push(this.chRewind)

            this.cmbRepeat = new Common.UI.ComboBox({
              el: this.$el.find("#animation-spin-repeat"),
              cls: "input-group-nr",
              menuStyle: "min-width: 100%;",
              editable: true,
              lock: [
                _set.slideDeleted,
                _set.noSlides,
                _set.noGraphic,
                _set.noAnimation,
                _set.noAnimationRepeat,
                _set.timingLock,
              ],
              data: [
                { value: 1, displayValue: this.textNoRepeat },
                { value: 2, displayValue: "2" },
                { value: 3, displayValue: "3" },
                { value: 4, displayValue: "4" },
                { value: 5, displayValue: "5" },
                { value: 10, displayValue: "10" },
                { value: AscFormat.untilNextClick, displayValue: this.textUntilNextClick },
                { value: AscFormat.untilNextSlide, displayValue: this.textUntilEndOfSlide },
              ],
              dataHint: "1",
              dataHintDirection: "top",
              dataHintOffset: "small",
            })
            this.lockedControls.push(this.cmbRepeat)

            this.lblRepeat = new Common.UI.Label({
              el: this.$el.find("#animation-repeat"),
              iconCls: "toolbar__icon btn-animation-repeat",
              caption: this.strRepeat,
              lock: [
                _set.slideDeleted,
                _set.noSlides,
                _set.noGraphic,
                _set.noAnimation,
                _set.noAnimationRepeat,
                _set.timingLock,
              ],
            })
            this.lockedControls.push(this.lblRepeat)

            this.btnMoveEarlier = new Common.UI.Button({
              parentEl: $("#animation-moveearlier"),
              cls: "btn-toolbar",
              iconCls: "toolbar__icon btn-arrow-up",
              style: "min-width: 82px",
              caption: this.textMoveEarlier,
              lock: [
                _set.slideDeleted,
                _set.noSlides,
                _set.noGraphic,
                _set.noAnimation,
                _set.noTriggerObjects,
                _set.noMoveAnimationEarlier,
                _set.timingLock,
              ],
              dataHint: "1",
              dataHintDirection: "left",
              dataHintOffset: "medium",
            })
            this.lockedControls.push(this.btnMoveEarlier)

            this.btnMoveLater = new Common.UI.Button({
              parentEl: $("#animation-movelater"),
              cls: "btn-toolbar",
              iconCls: "toolbar__icon btn-arrow-down",
              style: "min-width: 82px",
              caption: this.textMoveLater,
              lock: [
                _set.slideDeleted,
                _set.noSlides,
                _set.noGraphic,
                _set.noAnimation,
                _set.noTriggerObjects,
                _set.noMoveAnimationLater,
                _set.timingLock,
              ],
              dataHint: "1",
              dataHintDirection: "left",
              dataHintOffset: "medium",
            })
            this.lockedControls.push(this.btnMoveLater)
            Common.UI.LayoutManager.addControls(this.lockedControls)
            Common.NotificationCenter.on("app:ready", this.onAppReady.bind(this))
          },

          render: function (el) {
            this.boxSdk = $("#editor_sdk")
            if (el) el.html(this.getPanel())
            return this
          },

          onAppReady: function (config) {
            new Promise((accept, reject) => {
              accept()
            }).then(() => {
              this.btnPreview.updateHint(this.txtPreview)
              this.btnParameters.updateHint(this.txtParameters)
              this.btnAnimationPane.updateHint(this.txtAnimationPane)
              this.btnAddAnimation.updateHint(this.txtAddEffect)
              this.cmbTrigger.updateHint(this.strTrigger)
              this.btnMoveEarlier.updateHint(this.textMoveEarlier)
              this.btnMoveLater.updateHint(this.textMoveLater)

              this.btnAddAnimation.setMenu(
                new Common.UI.Menu({
                  style: "width: 375px;padding-top: 12px;",
                  items: [
                    {
                      template: _.template(
                        '<div id="id-toolbar-menu-addanimation" class="menu-animation"></div>',
                      ),
                    },
                    { caption: "--" },
                    {
                      caption: this.textMoreEffects,
                      value: "more",
                    },
                  ],
                }),
              )

              const itemWidth = 88
              const itemHeight = 40
              const onShowBefore = (menu) => {
                const picker = new Common.UI.DataView({
                  el: $("#id-toolbar-menu-addanimation"),
                  cls: "no-borders-item",
                  parentMenu: menu,
                  outerMenu: { menu: this.btnAddAnimation.menu, index: 0 },
                  showLast: false,
                  restoreHeight: 300,
                  style: "max-height: 300px;",
                  scrollAlwaysVisible: true,
                  groups: new Common.UI.DataViewGroupStore(
                    Common.define.effectData.getEffectGroupData(),
                  ),
                  store: new Common.UI.DataViewStore(Common.define.effectData.getEffectData()),
                  itemTemplate: _.template(
                    [
                      `<div  class = "btn_item x-huge" id = "<%= id %>" style = "width: ${itemWidth}px;height: ${itemHeight}px;">`,
                      '<div class = "icon toolbar__icon <%= iconCls %>"></div>',
                      '<div class = "caption"><%= displayValue %></div>',
                      "</div>",
                    ].join(""),
                  ),
                })
                picker.on("item:click", (picker, item, record, e) => {
                  if (record) this.fireEvent("animation:addanimation", [picker, record])
                })
                menu.off("show:before", onShowBefore)
                menu.on("show:after", () => {
                  this.fireEvent("animation:addeffectshow", [picker])
                })
                this.btnAddAnimation.menu.setInnerMenu([{ menu: picker, index: 0 }])
              }
              this.btnAddAnimation.menu.on("show:before", onShowBefore)
              this.btnParameters.setMenu(
                new Common.UI.Menu({
                  items: [
                    {
                      toggleGroup: "themecolor",
                      template: _.template(
                        '<div id="id-toolbar-menu-parameters-color" style="width: 164px; display: inline-block;"></div>',
                      ),
                    },
                    { caption: "--" },
                  ],
                }),
              )
              const onShowBeforeParameters = (menu) => {
                const picker = new Common.UI.ThemeColorPalette({
                  el: $("#id-toolbar-menu-parameters-color"),
                  outerMenu: { menu: this.btnParameters.menu, index: 0 },
                })
                menu.off("show:before", onShowBeforeParameters)
                this.btnParameters.menu.setInnerMenu([{ menu: picker, index: 0 }])
                this.colorPickerParameters = picker
                this.updateColors()
                this.setColor()
                menu.on("show:after", () => {
                  this.isColor &&
                    picker &&
                    _.delay(() => {
                      picker.focus()
                    }, 10)
                })

                picker.on("select", (picker, item) => {
                  const color = item?.color ? item.color : item
                  this.fireEvent("animation:parameterscolor", [
                    Common.Utils.ThemeColor.getRgbColor(color),
                  ])
                })
              }
              this.btnParameters.menu.on("show:before", onShowBeforeParameters)

              this.btnPreview.setMenu(
                new Common.UI.Menu({
                  style: "min-width: auto;",
                  items: [
                    { caption: this.txtPreview, value: "preview" },
                    {
                      caption: this.textAutoPreview,
                      value: "auto",
                      checkable: true,
                      checked: !Common.Utils.InternalSettings.get("pe-animation-no-auto-preview"),
                    },
                  ],
                }),
              )

              setEvents.call(this)
            })
          },

          getPanel: function () {
            this.listEffects?.render(this.$el.find("#animation-field-effects"))
            this.btnPreview?.render(this.$el.find("#animation-button-preview"))
            this.btnParameters?.render(this.$el.find("#animation-button-parameters"))
            this.btnAnimationPane?.render(this.$el.find("#animation-button-pane"))
            this.btnAddAnimation?.render(this.$el.find("#animation-button-add-effect"))
            this.cmbStart?.render(this.$el.find("#animation-start"))
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
            return this.lockedControls
          },

          setMenuParameters: function (effectId, effectGroup, option) {
            // option = undefined - for add new effect or when selected 2 equal effects with different option (subtype)
            let arrEffectOptions
            let selectedElement
            const effect = _.findWhere(this.allEffects, { group: effectGroup, value: effectId })
            let updateFamilyEffect = true
            if (effect) {
              arrEffectOptions = Common.define.effectData.getEffectOptionsData(
                effect.group,
                effect.value,
              )
              updateFamilyEffect = this._familyEffect !== effect.familyEffect || !this._familyEffect // family of effects are different or both of them = undefined (null)
              this.isColor = effect.color
            }
            if (
              (this._effectId !== effectId && updateFamilyEffect) ||
              this._groupName !== effectGroup
            ) {
              this.btnParameters.menu.removeItems(
                this.startIndexParam,
                this.btnParameters.menu.getItemsLength() - this.startIndexParam,
              )
            }
            if (arrEffectOptions) {
              if (this.btnParameters.menu.items.length === this.startIndexParam) {
                if (
                  effectGroup === "menu-effect-group-path" &&
                  effectId === AscFormat.MOTION_CUSTOM_PATH
                ) {
                  arrEffectOptions.forEach(function (opt, index) {
                    this.btnParameters.menu.addItem(opt)
                    ;(opt.value === option || (option === undefined && !!opt.defvalue)) &&
                      (selectedElement =
                        this.btnParameters.menu.items[index + this.startIndexParam])
                  }, this)
                } else {
                  arrEffectOptions.forEach(function (opt, index) {
                    opt.checkable = true
                    opt.toggleGroup = "animateeffects"
                    this.btnParameters.menu.addItem(opt)
                    ;(opt.value === option || (option === undefined && !!opt.defvalue)) &&
                      (selectedElement =
                        this.btnParameters.menu.items[index + this.startIndexParam])
                  }, this)
                }
                effect?.familyEffect && this.btnParameters.menu.addItem({ caption: "--" })
              } else {
                this.btnParameters.menu.clearAll(true)
                this.btnParameters.menu.getItems().forEach((opt) => {
                  if (
                    (opt.toggleGroup === "animateeffects" ||
                      (effectGroup === "menu-effect-group-path" &&
                        effectId === AscFormat.MOTION_CUSTOM_PATH)) &&
                    (opt.value === option || (option === undefined && !!opt.options.defvalue))
                  )
                    selectedElement = opt
                }, this)
              }
              !(
                effectGroup === "menu-effect-group-path" &&
                effectId === AscFormat.MOTION_CUSTOM_PATH
              ) &&
                selectedElement &&
                selectedElement.setChecked(true)
            }
            if (effect?.familyEffect) {
              if (this._familyEffect !== effect.familyEffect) {
                const effectsArray = Common.define.effectData.getSimilarEffectsArray(
                  effect.familyEffect,
                )
                effectsArray.forEach(function (opt) {
                  opt.checkable = true
                  opt.toggleGroup = "animatesimilareffects"
                  this.btnParameters.menu.addItem(opt)
                  opt.value === effectId &&
                    this.btnParameters.menu.items[
                      this.btnParameters.menu.getItemsLength() - 1
                    ].setChecked(true)
                }, this)
              } else {
                this.btnParameters.menu.getItems().forEach((opt) => {
                  if (opt.toggleGroup === "animatesimilareffects" && opt.value === effectId)
                    opt.setChecked(true)
                })
              }
            }

            if (this.isColor) {
              this.btnParameters.menu.items[0].show()
              this.btnParameters.menu.getItemsLength() > this.startIndexParam &&
                this.btnParameters.menu.items[1].show()
            } else {
              this.btnParameters.menu.items[0].hide()
              this.btnParameters.menu.items[1].hide()
            }

            this._effectId = effectId
            this._groupName = effectGroup
            this._familyEffect = effect ? effect.familyEffect : undefined
            return selectedElement ? selectedElement.value : undefined
          },

          setColor: function (color) {
            this._effectColor = color
              ? Common.Utils.ThemeColor.getHexColor(
                  color.get_r(),
                  color.get_g(),
                  color.get_b(),
                ).toUpperCase()
              : this._effectColor
            !!this.colorPickerParameters &&
              this._effectColor &&
              this.colorPickerParameters.selectByRGB(this._effectColor, true)
          },

          updateColors: function () {
            this.colorPickerParameters?.updateColors(
              Common.Utils.ThemeColor.getEffectColors(),
              Common.Utils.ThemeColor.getStandartColors(),
            )
          },

          txtSec: "s",
          txtPreview: "Preview",
          txtParameters: "Parameters",
          txtAnimationPane: "Animation Pane",
          txtAddEffect: "Add animation",
          strDuration: "Duration",
          strDelay: "Delay",
          strStart: "Start",
          strRewind: "Rewind",
          strRepeat: "Repeat",
          strTrigger: "Trigger",
          textStartOnClick: "On Click",
          textStartWithPrevious: "With Previous",
          textStartAfterPrevious: "After Previous",
          textOnClickSequence: "On Click Sequence",
          textOnClickOf: "On Click of",
          textNone: "None",
          textMultiple: "Multiple",
          textMoreEffects: "Show More Effects",
          textMoveEarlier: "Move Earlier",
          textMoveLater: "Move Later",
          textNoRepeat: "(none)",
          textUntilNextClick: "Until Next Click",
          textUntilEndOfSlide: "Until End of Slide",
          str20: "20 s (Extremely Slow)",
          str5: "5 s (Very Slow)",
          str3: "3 s (Slow)",
          str2: "2 s (Medium)",
          str1: "1 s (Fast)",
          str0_5: "0.5 s (Very Fast)",
          textAutoPreview: "AutoPreview",
        }
      })(),
      PE.Views.Animation || {},
    ),
  )
})
