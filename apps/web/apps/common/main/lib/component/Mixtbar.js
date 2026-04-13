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
 *  Mixtbar.js
 *
 *  Combined component for toolbar's and header's elements
 *
 *
 *  Created on 4/11/2017.
 *
 */

define(["backbone", "common/main/lib/component/BaseView", "common/main/lib/mods/transition"], (
  Backbone,
) => {
  Common.UI.Mixtbar = Common.UI.BaseView.extend(
    (() => {
      let $boxTabs
      let $scrollL
      let $scrollR
      const optsFold = { timeout: 2000 }
      const config = {}
      const btnsMore = []

      function setScrollButtonsDisabeled() {
        const scrollLeft = $boxTabs.scrollLeft()
        ;(Common.UI.isRTL() ? $scrollR : $scrollL).toggleClass(
          "disabled",
          Math.abs(Math.floor(scrollLeft)) <= (Common.UI.isRTL() ? 1 : 0),
        )
        ;(Common.UI.isRTL() ? $scrollL : $scrollR).toggleClass(
          "disabled",
          Math.abs(Math.ceil(scrollLeft)) >=
            $boxTabs[0].scrollWidth - $boxTabs[0].clientWidth - (Common.UI.isRTL() ? 1 : 0),
        )
      }

      const onScrollTabs = (opts, e) => {
        if ($(e.target).hasClass("disabled")) return
        const sv = $boxTabs.scrollLeft()
        if (sv || opts === "right" || (Common.UI.isRTL() && opts === "left")) {
          $boxTabs.animate(
            { scrollLeft: opts === "left" ? sv - 100 : sv + 100 },
            200,
            setScrollButtonsDisabeled,
          )
        }
      }

      const onWheelTabs = (e) => {
        e.preventDefault()
        const deltaX = e.deltaX || e.detail || e.deltaY
        $boxTabs.scrollLeft($boxTabs.scrollLeft() + deltaX * 60)
        setScrollButtonsDisabeled()
      }

      function onTabDblclick(e) {
        const tab = $(e.currentTarget).find("> a[data-tab]").data("tab")
        if (this.dblclick_el === tab) {
          this.fireEvent("change:compact", [tab])
          this.dblclick_el = undefined
        }
      }

      function onShowFullviewPanel(state) {
        if (state) optsFold.$bar.addClass("cover")
        else optsFold.$bar.removeClass("cover")
      }

      function onClickDocument(e) {
        if (this.isFolded) {
          if ($(e.target).parents(".toolbar, #file-menu-panel").length) {
          } else {
            optsFold.$bar?.hasClass("expanded") && this.collapse()
          }
        }
      }

      return {
        $tabs: undefined,
        $panels: undefined,
        isFolded: false,

        initialize: function (options) {
          Common.UI.BaseView.prototype.initialize.call(this, options)

          const _template_tabs = !Common.UI.isRTL()
            ? '<section class="tabs">' +
              '<a class="scroll left" data-hint="0" data-hint-direction="bottom" data-hint-offset="-7, 0" data-hint-title="V"></a>' +
              '<ul role="tablist">' +
              "<% for(var i in items) { %>" +
              '<% if (typeof items[i] == "object") { %>' +
              '<li class="ribtab' +
              '<% if (items[i].haspanel===false) print(" x-lone") %>' +
              "<% if (items[i].extcls) print(' ' + items[i].extcls) %>\"" +
              "<% if (typeof items[i].layoutname == \"string\") print(\" data-layout-name=\" + ' ' +  items[i].layoutname) + ' ' %>>" +
              '<a role="tab" id="<%= items[i].action %>" data-tab="<%= items[i].action %>" data-title="<%= items[i].caption %>" data-hint="0" data-hint-direction="bottom" data-hint-offset="small" <% if (typeof items[i].dataHintTitle !== "undefined") { %> data-hint-title="<%= items[i].dataHintTitle %>" <% } %>><%= items[i].caption %></a>' +
              "</li>" +
              "<% } %>" +
              "<% } %>" +
              "</ul>" +
              '<a class="scroll right" data-hint="0" data-hint-direction="bottom" data-hint-offset="-7, 0" data-hint-title="R"></a>' +
              "</section>"
            : '<section class="tabs">' +
              '<a class="scroll right" data-hint="0" data-hint-direction="bottom" data-hint-offset="-7, 0" data-hint-title="R"></a>' +
              '<ul role="tablist">' +
              "<% for(var i in items) { %>" +
              '<% if (typeof items[i] == "object") { %>' +
              '<li class="ribtab' +
              '<% if (items[i].haspanel===false) print(" x-lone") %>' +
              "<% if (items[i].extcls) print(' ' + items[i].extcls) %>\"" +
              "<% if (typeof items[i].layoutname == \"string\") print(\" data-layout-name=\" + ' ' +  items[i].layoutname) + ' ' %>>" +
              '<a role="tab" id="<%= items[i].action %>" data-tab="<%= items[i].action %>" data-title="<%= items[i].caption %>" data-hint="0" data-hint-direction="bottom" data-hint-offset="small" <% if (typeof items[i].dataHintTitle !== "undefined") { %> data-hint-title="<%= items[i].dataHintTitle %>" <% } %>><%= items[i].caption %></a>' +
              "</li>" +
              "<% } %>" +
              "<% } %>" +
              "</ul>" +
              '<a class="scroll left" data-hint="0" data-hint-direction="bottom" data-hint-offset="-7, 0" data-hint-title="V"></a>' +
              "</section>"

          this.$layout = $(
            options.template({
              tabsmarkup: _.template(_template_tabs)({ items: options.tabs }),
              isRTL: Common.UI.isRTL(),
              config: options.config,
            }),
          )

          config.tabs = options.tabs
          $(document.body).on("click", onClickDocument.bind(this))

          Common.NotificationCenter.on(
            "tab:visible",
            _.bind(function (action, visible) {
              this.setVisible(action, visible)
            }, this),
          )
          Common.NotificationCenter.on("tab:resize", _.bind(this.onResizeTabs, this))
          Common.NotificationCenter.on(
            "app:repaint",
            _.bind(function () {
              this.repaintMoreBtns()
            }, this),
          )
          Common.NotificationCenter.on(
            "uitheme:changed",
            _.bind(function () {
              this.clearActiveData()
              this.processPanelVisible()
              this.repaintMoreBtns()
            }, this),
          )
        },

        afterRender: function () {
          $boxTabs = this.$(".tabs > ul")
          this.$tabs = $boxTabs.find("> li")
          this.$boxpanels = this.$(".box-panels")
          this.$panels = this.$boxpanels.find("> .panel")

          optsFold.$bar = this.$(".toolbar")
          $scrollR = this.$(".tabs .scroll.right")
          $scrollL = this.$(".tabs .scroll.left")

          $scrollL.on("click", onScrollTabs.bind(this, "left"))
          $scrollR.on("click", onScrollTabs.bind(this, "right"))

          $boxTabs.on("dblclick", "> .ribtab", onTabDblclick.bind(this))
          $boxTabs.on("click", "> .ribtab", this.onTabClick.bind(this))
          $boxTabs.on("mousewheel", onWheelTabs)
        },

        isTabActive: function (tag) {
          const t = this.$tabs.filter(".active").find("> a")
          return t.length && t.data("tab") === tag
        },

        setFolded: function (value) {
          this.isFolded = value
          if (!optsFold.$box) optsFold.$box = this.$el.find(".box-controls")

          if (this.isFolded) {
            optsFold.$bar.addClass("folded z-clear").toggleClass("expanded", false)
            optsFold.$bar.find(".tabs .ribtab").removeClass("active")
            optsFold.$bar.on($.support.transition.end, (e) => {
              if (optsFold.$bar.hasClass("folded") && !optsFold.$bar.hasClass("expanded"))
                optsFold.$bar.toggleClass("z-clear", true)
            })
            optsFold.$box.on({
              mouseleave: (e) => {
                // optsFold.timer = setTimeout( function(e) {
                //     clearTimeout(optsFold.timer);
                //     me.collapse();
                // }, optsFold.timeout);
              },
              mouseenter: (e) => {
                // clearTimeout(optsFold.timer);
              },
            })

            // $(document.body).on('focus', 'input, textarea', function(e) {
            // });
            //
            // $(document.body).on('blur', 'input, textarea', function(e) {
            // });
            //
            // Common.NotificationCenter.on({
            //     'modal:show': function(){
            //     },
            //     'modal:close': function(dlg) {
            //     },
            //     'modal:hide': function(dlg) {
            //     },
            //     'dataview:focus': function(e){
            //     },
            //     'dataview:blur': function(e){
            //     },
            //     'menu:show': function(e){
            //     },
            //     'menu:hide': function(e){
            //     },
            //     'edit:complete': _.bind(me.onEditComplete, me)
            // });
          } else {
            // clearTimeout(optsFold.timer);
            optsFold.$bar.removeClass("folded z-clear")
            optsFold.$box.off()

            const active_panel = optsFold.$box.find(".panel.active")
            if (active_panel.length) {
              const tab = active_panel.data("tab")
              this.$tabs.find(`> a[data-tab=${tab}]`).parent().toggleClass("active", true)
            } else {
              tab = this.$tabs
                .siblings(":not(.x-lone):visible")
                .first()
                .find("> a[data-tab]")
                .data("tab")
              this.setTab(tab)
            }
          }
        },

        collapse: function () {
          Common.UI.Menu.Manager.hideAll()
          // clearTimeout(optsFold.timer);

          if (this.isFolded && optsFold.$bar) {
            optsFold.$bar.removeClass("expanded")
            optsFold.$bar.find(".tabs .ribtab").removeClass("active")
          }
          this.fireEvent("tab:collapse")
        },

        expand: () => {
          // clearTimeout(optsFold.timer);

          optsFold.$bar.removeClass("z-clear")
          optsFold.$bar.addClass("expanded")
          // optsFold.timer = setTimeout(this.collapse, optsFold.timeout);
        },

        onResizeTabs: function (e) {
          if (this.hasTabInvisible()) {
            if (!$boxTabs.parent().hasClass("short")) {
              $boxTabs.parent().addClass("short")
              setScrollButtonsDisabeled()
            }
          } else if ($boxTabs.parent().hasClass("short")) {
            $boxTabs.parent().removeClass("short")
          }
        },

        onResize: function (e) {
          this.onResizeTabs()
          this.hideMoreBtns()
          this.processPanelVisible()
        },

        onTabClick: function (e) {
          const $target = $(e.currentTarget)
          const tab = $target.find("> a[data-tab]").data("tab")
          if ($target.hasClass("x-lone")) {
            this.isFolded && this.collapse()
          } else {
            if ($target.hasClass("active")) {
              if (!this._timerSetTab) {
                this.dblclick_el = tab
                if (this.isFolded) {
                  this.collapse()
                  setTimeout(() => {
                    this.dblclick_el = undefined
                  }, 500)
                }
              }
            } else {
              this._timerSetTab = true
              setTimeout(() => {
                this._timerSetTab = false
              }, 500)
              this.setTab(tab)
              this.fireEvent("tab:click", [tab])
              // me.processPanelVisible();
              if (!this.isFolded) {
                if (this.dblclick_timer) clearTimeout(this.dblclick_timer)
                this.dblclick_timer = setTimeout(() => {
                  this.dblclick_el = tab
                  this.dblclick_timer = undefined
                }, 500)
              } else this.dblclick_el = tab
            }
          }
        },

        setTab: function (tab) {
          if (!tab) {
            // onShowFullviewPanel.call(this, false);

            if (this.isFolded) {
              this.collapse()
            } else tab = this.lastPanel
          }

          if (tab) {
            this.fireEvent("tab:active:before", [tab])

            this.$tabs.removeClass("active")
            this.$panels.removeClass("active")
            this.hideMoreBtns()

            const panel = this.$panels.filter(`[data-tab=${tab}]`)
            if (panel.length) {
              this.lastPanel = tab
              panel.addClass("active")
              this.setMoreButton(tab, panel)
              this.processPanelVisible(null, true)
            }

            if (panel.length) {
              if (this.isFolded) this.expand()
            } else {
              // onShowFullviewPanel.call(this, true);
              if (this.isFolded) this.collapse()
            }

            const $tp = this.$tabs.find(`> a[data-tab=${tab}]`).parent()
            if ($tp.length) {
              $tp.addClass("active")
            }

            this.fireEvent("tab:active", [tab])
            Common.NotificationCenter.trigger("tab:active", [tab])
          }
        },

        addTab: function (tab, panel, after) {
          function _get_tab_action(index) {
            if (!config.tabs[index]) return _get_tab_action(--index)

            return config.tabs[index].action
          }

          const _tabTemplate = _.template(
            '<li class="ribtab" style="display: none;" <% if (typeof layoutname == "string") print(" data-layout-name=" + \' \' +  layoutname) + \' \' %>><a role="tab" id="<%= action %>" data-tab="<%= action %>" data-title="<%= caption %>" data-hint="0" data-hint-direction="bottom" data-hint-offset="small" <% if (typeof dataHintTitle !== "undefined") { %> data-hint-title="<%= dataHintTitle %>" <% } %> ><%= caption %></a></li>',
          )

          if (after === undefined || tab.aux) after = config.tabs.length - 1

          if (tab.aux) {
            // alwayw show tab at the end of toolbar
            config.tabs.push(tab)
          } else if (config.tabs[after + 1]) {
            let index = -1
            for (let i = after + 2; i < config.tabs.length; i++) {
              if (config.tabs[i] === undefined) {
                index = i
                break
              }
            }
            if (index < 0 || index > config.tabs.length - 1) config.tabs.splice(after + 1, 0, tab)
            else {
              config.tabs.splice(index, 1)
              config.tabs.splice(after + 1, 0, tab)
            }
          } else {
            config.tabs[after + 1] = tab
          }
          const _after_action = _get_tab_action(after)

          let _elements = this.$tabs || this.$layout.find(".tabs")
          let $target = _elements.find(`a[data-tab=${_after_action}]`)
          if ($target.length) {
            $target.parent().after(_tabTemplate(tab))

            if (panel) {
              _elements = this.$panels || this.$layout.find(".box-panels > .panel")
              $target = _elements.filter(`[data-tab=${_after_action}]`)

              if ($target.length) {
                $target.after(panel)
              } else {
                panel.appendTo(this.$layout.find(".box-panels"))
              }
            }

            // synchronize matched elements
            this.$tabs && (this.$tabs = $boxTabs.find("> li"))
            this.$panels && (this.$panels = this.$el.find(".box-panels > .panel"))
          }
        },

        getTab: function (tab) {
          if (tab && this.$panels) {
            const panel = this.$panels.filter(`[data-tab=${tab}]`)
            return panel.length ? panel : undefined
          }
        },

        createTab: function (tab, visible) {
          if (!tab.action || !tab.caption) return

          const _panel = $(
            `<section id="${tab.action}" class="panel" data-tab="${tab.action}"></section>`,
          )
          this.addTab(tab, _panel, this.getLastTabIdx())
          this.setVisible(tab.action, !!visible)
          return _panel
        },

        getMorePanel: (tab) => (tab && btnsMore[tab] ? btnsMore[tab].panel : null),

        getLastTabIdx: () => {
          const index = _.findIndex(config.tabs, { aux: true })
          return index < 0 ? config.tabs.length - 1 : index - 1
        },

        isCompact: function () {
          return this.isFolded
        },

        isExpanded: function () {
          return !this.isFolded || optsFold.$bar?.hasClass("expanded")
        },

        hasTabInvisible: function () {
          if ($boxTabs.length < 1) return false

          const _left_bound_ = Math.round(Common.Utils.getOffset($boxTabs).left)
          const _right_bound_ = Math.round(_left_bound_ + $boxTabs.width())

          let tab = this.$tabs.filter(Common.UI.isRTL() ? ":visible:last" : ":visible:first").get(0)
          if (!tab) return false

          let rect = Common.Utils.getBoundingClientRect(tab)

          if (!(Math.round(rect.left) < _left_bound_)) {
            tab = this.$tabs.filter(Common.UI.isRTL() ? ":visible:first" : ":visible:last").get(0)
            rect = Common.Utils.getBoundingClientRect(tab)

            if (!(Math.round(rect.right) > _right_bound_)) return false
          }

          return true
        },

        /**
         * in case panel partly visible.
         * hide button's caption to decrease panel width
         * ##adopt-panel-width
         **/
        processPanelVisible: function (panel, reset, force) {
          const me = this
          function _fc(reset) {
            const $active = panel || me.$panels.filter(".active")
            if ($active?.length) {
              const _maxright = $active.parents(".box-controls").width()
              let _staticPanelWidth = $active
                .parents(".box-controls")
                .find(".panel.static")
                .outerWidth()
              if (!_staticPanelWidth) _staticPanelWidth = 0
              const data = $active.data()
              let _rightedge = data.rightedge
              let _btns = data.buttons
              let _flex = data.flex
              const more_section = $active.find(".more-box")
              if (more_section.length === 0) {
                me.setMoreButton($active.attr("data-tab"), $active)
              }
              if (!_rightedge) {
                _rightedge = $active.outerWidth() + _staticPanelWidth
              }
              if (!_btns) {
                _btns = []
                _.each($active.find(".btn-slot .x-huge"), (item) => {
                  _btns.push($(item).closest(".btn-slot"))
                })
                btnsMore[data.tab] &&
                  btnsMore[data.tab].panel &&
                  _.each(btnsMore[data.tab].panel.find(".btn-slot .x-huge"), (item) => {
                    _btns.push($(item).closest(".btn-slot"))
                  })
                data.buttons = _btns
              }
              if (!_flex) {
                _flex = []
                _.each($active.find(".group.flex"), (item) => {
                  const el = $(item)
                  _flex.push({ el: el, width: el.attr("data-group-width") || el.attr("max-width") }) //save flex element and it's initial width
                })
                data.flex = _flex
              }

              if (_rightedge > _maxright) {
                if (!more_section.is(":visible")) {
                  if (_flex.length > 0) {
                    for (let i = 0; i < _flex.length; i++) {
                      const item = _flex[i].el
                      _rightedge = $active.outerWidth() + _staticPanelWidth
                      if (Math.floor(item.outerWidth()) > Number.parseInt(item.css("min-width"))) {
                        data.rightedge = _rightedge
                        return
                      }
                      item.css("width", item.css("min-width"))
                    }
                  }
                  for (let i = _btns.length - 1; i >= 0; i--) {
                    const btn = _btns[i]
                    if (!btn.hasClass("compactwidth") && !btn.hasClass("slot-btn-more")) {
                      btn.addClass("compactwidth")
                      _rightedge = $active.outerWidth() + _staticPanelWidth
                      if (_rightedge <= _maxright) break
                    }
                  }
                  data.rightedge = _rightedge
                }
                me.resizeToolbar(reset)
              } else {
                more_section.is(":visible") && me.resizeToolbar(reset)
                if (!more_section.is(":visible")) {
                  for (let i = 0; i < _btns.length; i++) {
                    const btn = _btns[i]
                    if (btn.hasClass("compactwidth")) {
                      btn.removeClass("compactwidth")
                      _rightedge = $active.outerWidth() + _staticPanelWidth
                      if (_rightedge > _maxright) {
                        btn.addClass("compactwidth")
                        _rightedge = $active.outerWidth() + _staticPanelWidth
                        break
                      }
                    }
                  }
                  data.rightedge = _rightedge
                  if (_flex.length > 0 && $active.find(".btn-slot.compactwidth").length < 1) {
                    for (let i = 0; i < _flex.length; i++) {
                      const item = _flex[i]
                      let checkedwidth
                      if (item.el.find(".combo-dataview").hasClass("auto-width")) {
                        checkedwidth = Common.UI.ComboDataView.prototype.checkAutoWidth(
                          item.el,
                          me.$boxpanels.width() - $active.outerWidth() + item.el.width(),
                        )
                      }
                      item.el.css(
                        "width",
                        checkedwidth
                          ? `${checkedwidth + Number.parseFloat(item.el.css("padding-left")) + Number.parseFloat(item.el.css("padding-right"))}px`
                          : item.width,
                      )
                      data.rightedge = Common.Utils.getBoundingClientRect($active.get(0)).right
                    }
                  }
                }
              }
            }
          }

          if (!me._timer_id || force) {
            me._timer_id && clearInterval(me._timer_id)
            _fc(reset)
            me._needProcessPanel = false
            me._timer_id = setInterval(() => {
              if (me._needProcessPanel) {
                _fc(me._needProcessPanel.reset)
                me._needProcessPanel = false
              } else {
                clearInterval(me._timer_id)
                me._timer_id = undefined
              }
            }, 100)
          } else
            me._needProcessPanel = {
              reset: me._needProcessPanel ? me._needProcessPanel.reset || reset : reset,
            }
        },
        /**/

        setExtra: function (place, el) {
          if (el) {
            if (this.$tabs) {
            } else {
              if (place === "right") {
                this.$layout.find(".extra.right").html(el)
              } else if (place === "left") {
                this.$layout.find(".extra.left").html(el)
              }
            }
          }
        },

        setVisible: function (tab, visible) {
          if (tab && this.$tabs) {
            this.$tabs
              .find(`> a[data-tab=${tab}]`)
              .parent()
              .css("display", visible ? "" : "none")
            this.onResize()
          }
        },

        setMoreButton: function (tab, panel) {
          if (!btnsMore[tab]) {
            const top = Common.Utils.getPosition(panel).top
            const box = $(
              `<div class="more-box" style="top:${top}px;"><div class="separator long" style="position: relative;display: table-cell;"></div><div class="group" style=""><span class="btn-slot text x-huge slot-btn-more"></span></div></div>`,
            )
            panel.append(box)
            btnsMore[tab] = new Common.UI.Button({
              cls: "btn-toolbar x-huge icon-top dropdown-manual",
              caption: Common.Locale.get("textMoreButton", {
                name: "Common.Translation",
                default: "More",
              }),
              iconCls: "toolbar__icon btn-big-more",
              enableToggle: true,
            })
            btnsMore[tab].render(box.find(".slot-btn-more"))
            btnsMore[tab].on("toggle", (btn, state, e) => {
              state ? this.onMoreShow(btn, e) : this.onMoreHide(btn, e)
              Common.NotificationCenter.trigger("more:toggle", btn, state)
            })
            const moreContainer = $(
              `<div class="dropdown-menu more-container" data-tab="${tab}"><div style="display: inline;"></div></div>`,
            )
            optsFold.$bar.append(moreContainer)
            btnsMore[tab].panel = moreContainer.find("div")
          } else if (btnsMore[tab].needRepaint && panel.is(":visible")) {
            btnsMore[tab].cmpEl.closest(".more-box").css("top", Common.Utils.getPosition(panel).top)
            btnsMore[tab].needRepaint = false
          }
          this.$moreBar = btnsMore[tab].panel
        },

        repaintMoreBtns: () => {
          for (const btn in btnsMore) {
            if (btnsMore[btn]?.cmpEl) {
              const box = btnsMore[btn].cmpEl.closest(".more-box")
              const panel = box.parent()
              const isVisible = panel.is(":visible")
              isVisible && box.css("top", Common.Utils.getPosition(panel).top)
              btnsMore[btn].needRepaint = !isVisible
            }
          }
        },

        clearMoreButton: function (tab) {
          const panel = this.$panels.filter(`[data-tab=${tab}]`)
          if (panel.length) {
            const data = panel.data()
            data.buttons = data.flex = data.rightedge = data.leftedge = undefined
            panel.find(".more-box").remove()
          }
          if (btnsMore[tab]) {
            const moreContainer = optsFold.$bar.find(`.more-container[data-tab="${tab}"]`)
            moreContainer.remove()
            btnsMore[tab].remove()
            delete btnsMore[tab]
          }
        },

        moveAllFromMoreButton: function (tab) {
          if (btnsMore[tab]) {
            const moreBar = btnsMore[tab].panel
            const items = moreBar ? moreBar.children() : []
            if (items.length > 0) {
              items.removeAttr("hidden-on-resize")
              items.removeAttr("data-hidden-tb-item")
              items.removeAttr("group-state")
              const panel = this.$panels.filter(`[data-tab=${tab}]`)
              panel.length && panel.find(".more-box").before(items)
              this.clearMoreButton(tab)
            }
          }
          this.clearActiveData()
        },

        clearActiveData: function (tab) {
          const panel = tab
            ? this.$panels.filter(`[data-tab=${tab}]`)
            : this.$panels.filter(".active")
          if (panel.length) {
            const data = panel.data()
            data.buttons = data.flex = data.rightedge = data.leftedge = undefined
          }
        },

        addCustomControls: function (tab, added, removed) {
          if (!tab.action) return

          let $panel = tab.action
            ? this.getTab(tab.action) || this.createTab(tab, true) || this.getTab("plugins")
            : null
          const $morepanel = this.getMorePanel(tab.action)
          let $moresection = $panel ? $panel.find(".more-box") : null
          let compactcls = ""
          $moresection.length < 1 && ($moresection = null)
          if ($panel) {
            if (removed) {
              removed.forEach((button, index) => {
                if (button.cmpEl) {
                  const group = button.cmpEl.closest(".group")
                  button.cmpEl.closest(".btn-slot").remove()
                  if (group.children().length < 1) {
                    const in_more = group.closest(".more-container").length > 0
                    in_more || group.prev().length === 0
                      ? group.next(".separator").remove()
                      : group.prev(".separator").remove() // remove separator before empty group or after first empty group
                    group.remove()
                    if (in_more && $morepanel.children().filter(".group").length === 0) {
                      btnsMore[tab.action] &&
                        btnsMore[tab.action].isActive() &&
                        btnsMore[tab.action].toggle(false)
                      $moresection?.css("display", "none")
                    }
                  }
                }
              })
              $panel.find(".btn-slot:not(.slot-btn-more).x-huge").last().hasClass("compactwidth") &&
                (compactcls = "compactwidth")
            }
            added?.forEach((button, index) => {
              let _groups
              let _group
              if ($morepanel) {
                _groups = $morepanel.children().filter(".group")
                if (_groups.length > 0) {
                  $moresection = null
                  $panel = $morepanel
                  compactcls = "compactwidth"
                }
              }
              if (!_groups || _groups.length < 1) _groups = $panel.children().filter(".group")

              if (_groups.length > 0 && !button.options.separator && index > 0)
                // add first button to new group
                _group = $(_groups[_groups.length - 1])
              else {
                if (button.options.separator) {
                  const el = $('<div class="separator long"></div>')
                  $moresection ? $moresection.before(el) : el.appendTo($panel)
                }
                _group = $('<div class="group"></div>')
                $moresection ? $moresection.before(_group) : _group.appendTo($panel)
              }
              const $slot = $(
                `<span class="btn-slot text x-huge ${!(button.options.caption || "").trim() ? "nocaption " : " "}${compactcls}"></span>`,
              ).appendTo(_group)
              button.render($slot)
            })
          }
          this.clearActiveData(tab.action)
          this.processPanelVisible(null, true)

          const visible =
            !this.isTabEmpty(tab.action) &&
            Common.UI.LayoutManager.isElementVisible(`toolbar-${tab.action}`)
          this.setVisible(tab.action, visible)
          if (!visible && this.isTabActive(tab.action) && this.isExpanded()) {
            if (this.getTab("home")) this.setTab("home")
            else {
              tab = this.$tabs
                .siblings(":not(.x-lone):visible")
                .first()
                .find("> a[data-tab]")
                .data("tab")
              this.setTab(tab)
            }
          }
        },

        isTabEmpty: function (tab) {
          const $panel = this.getTab(tab)
          const $morepanel = this.getMorePanel(tab)
          let $moresection = $panel ? $panel.find(".more-box") : null
          $moresection && $moresection.length < 1 && ($moresection = null)
          return $panel
            ? !(
                $panel.find("> .group").length > 0 ||
                ($morepanel && $morepanel.find(".group").length > 0)
              )
            : false
        },

        resizeToolbar: function (reset) {
          const $active = this.$panels.filter(".active")
          const more_section = $active.find(".more-box")

          if (more_section.length === 0) {
            this.setMoreButton($active.attr("data-tab"), $active)
          }

          const more_section_width = Number.parseInt(more_section.css("width")) || 0
          const box_controls_width = $active.parents(".box-controls").width()
          let _staticPanelWidth = $active
            .parents(".box-controls")
            .find(".panel.static")
            .outerWidth()
          let _maxright = box_controls_width
          if (!_staticPanelWidth) _staticPanelWidth = 0
          let _rightedge = $active.outerWidth() + _staticPanelWidth
          const delta = this._prevBoxWidth !== undefined ? _maxright - this._prevBoxWidth : -1
          let hideAllMenus = false
          this._prevBoxWidth = _maxright
          more_section.is(":visible") && (_maxright -= more_section_width)

          if (this.$moreBar?.parent().is(":visible")) {
            this.$moreBar.parent().css("max-width", Common.Utils.innerWidth())
          }

          if ((reset || delta < 0) && _rightedge > _maxright) {
            // from toolbar to more section
            if (!more_section.is(":visible")) {
              more_section.css("display", "block")
              _maxright -= Number.parseInt(more_section.css("width"))
            }
            let last_separator = null
            let last_group = null
            let prevchild = this.$moreBar.children().filter("[data-hidden-tb-item!=true]")
            if (prevchild.length > 0) {
              prevchild = $(prevchild[0])
              if (prevchild.hasClass("separator")) last_separator = prevchild
              if (prevchild.hasClass("group") && prevchild.attr("group-state") === "open")
                last_group = prevchild
            }
            const items = $active.find("> div:not(.more-box)")
            let need_break = false
            for (let i = items.length - 1; i >= 0; i--) {
              const item = $(items[i])
              if (!item.is(":visible") && !item.attr("hidden-on-resize")) {
                // move invisible items as is and set special attr
                item.attr("data-hidden-tb-item", true)
                this.$moreBar.prepend(item)
                hideAllMenus = true
              } else if (item.hasClass("group")) {
                //_rightedge = $active.get(0).getBoundingClientRect().right;
                _rightedge = $active.outerWidth() + _staticPanelWidth
                if (_rightedge <= _maxright)
                  // stop moving items
                  break

                const rect = Common.Utils.getBoundingClientRect(item.get(0))
                const item_width = item.outerWidth()
                const children = item.children()
                if (!item.attr("inner-width") && item.attr("group-state") !== "open") {
                  item.attr("inner-width", item_width)
                  for (let j = children.length - 1; j >= 0; j--) {
                    const child = $(children[j])
                    child.attr("inner-width", child.outerWidth())
                  }
                }
                if (
                  (rect.left > _maxright ||
                    (Common.UI.isRTL() && box_controls_width - rect.right > _maxright) ||
                    children.length === 1) &&
                  item.attr("group-state") !== "open"
                ) {
                  // move group
                  this.$moreBar.prepend(item)
                  if (last_separator) {
                    last_separator.css("display", "")
                    last_separator.removeAttr("hidden-on-resize")
                  }
                  hideAllMenus = true
                } else if (
                  (Common.UI.isRTL() ? box_controls_width - rect.right : rect.left) + item_width >
                  _maxright
                ) {
                  // move buttons from group
                  for (let j = children.length - 1; j >= 0; j--) {
                    const child = $(children[j])
                    if (child.hasClass("elset")) {
                      this.$moreBar.prepend(item)
                      if (last_separator) {
                        last_separator.css("display", "")
                        last_separator.removeAttr("hidden-on-resize")
                      }
                      hideAllMenus = true
                      break
                    }
                    const child_rect = Common.Utils.getBoundingClientRect(child.get(0))
                    const child_width = child.outerWidth()
                    if (
                      (Common.UI.isRTL()
                        ? box_controls_width - child_rect.right
                        : child_rect.left) +
                        child_width >
                      _maxright
                    ) {
                      if (!last_group) {
                        last_group = $("<div></div>")
                        last_group.addClass(items[i].className)
                        const attrs = items[i].attributes
                        for (let k = 0; k < attrs.length; k++) {
                          last_group.attr(attrs[k].name, attrs[k].value)
                        }
                        this.$moreBar.prepend(last_group)
                        if (last_separator) {
                          last_separator.css("display", "")
                          last_separator.removeAttr("hidden-on-resize")
                        }
                      }
                      last_group.prepend(child)
                      hideAllMenus = true
                    } else {
                      need_break = true
                      break
                    }
                  }
                  if (item.children().length < 1) {
                    // all buttons are moved
                    item.remove()
                    last_group
                      ?.removeAttr("group-state")
                      .attr("inner-width", item.attr("inner-width"))
                    last_group = null
                  } else {
                    last_group?.attr("group-state", "open") && item.attr("group-state", "open")
                  }
                  if (need_break) break
                } else {
                  break
                }
                last_separator = null
              } else if (item.hasClass("separator")) {
                this.$moreBar.prepend(item)
                item.css("display", "none")
                item.attr("hidden-on-resize", true)
                last_separator = item
                hideAllMenus = true
              }
            }
          } else if ((reset || delta > 0) && more_section.is(":visible")) {
            let last_separator = null
            let last_group = null
            let prevchild = $active.find("> div:not(.more-box)")
            let last_width = 0
            if (prevchild.length > 0) {
              prevchild = $(prevchild[prevchild.length - 1])
              if (prevchild.hasClass("separator")) {
                last_separator = prevchild
                last_width =
                  Number.parseInt(last_separator.css("margin-left")) +
                  Number.parseInt(last_separator.css("margin-right")) +
                  1
              }
              if (prevchild.hasClass("group") && prevchild.attr("group-state") === "open")
                last_group = prevchild
            }

            const items = this.$moreBar.children()
            if (items.length > 0) {
              // from more panel to toolbar
              for (let i = 0; i < items.length; i++) {
                const item = $(items[i])
                _rightedge = $active.outerWidth() + _staticPanelWidth
                if (!item.is(":visible") && item.attr("data-hidden-tb-item")) {
                  // move invisible items as is
                  item.removeAttr("data-hidden-tb-item")
                  more_section.before(item)
                  if (this.$moreBar.children().filter(".group").length === 0) {
                    this.hideMoreBtns()
                    more_section.css("display", "none")
                  }
                } else if (item.hasClass("group")) {
                  let islast = false
                  if (this.$moreBar.children().filter(".group").length === 1) {
                    _maxright = box_controls_width // try to move last group
                    islast = true
                  }

                  const item_width = Number.parseInt(item.attr("inner-width") || 0)
                  if (
                    _rightedge + last_width + item_width < _maxright &&
                    item.attr("group-state") !== "open"
                  ) {
                    // move group
                    more_section.before(item)
                    if (last_separator) {
                      last_separator.css("display", "")
                      last_separator.removeAttr("hidden-on-resize")
                    }
                    if (this.$moreBar.children().filter(".group").length === 0) {
                      this.hideMoreBtns()
                      more_section.css("display", "none")
                    }
                    hideAllMenus = true
                  } else if (_rightedge + last_width < _maxright) {
                    // move buttons from group
                    const children = item.children()
                    _maxright = box_controls_width - more_section_width
                    for (let j = 0; j < children.length; j++) {
                      if (islast && j === children.length - 1) _maxright = box_controls_width // try to move last item from last group
                      _rightedge = $active.outerWidth() + _staticPanelWidth
                      const child = $(children[j])
                      if (child.hasClass("elset")) {
                        // don't add group - no enough space
                        need_break = true
                        break
                      }
                      const child_width =
                        Number.parseInt(child.attr("inner-width") || 0) +
                        (!last_group ? Number.parseInt(item.css("padding-left")) : 0) // if new group is started add left-padding
                      if (_rightedge + last_width + child_width < _maxright) {
                        if (!last_group) {
                          last_group = $("<div></div>")
                          last_group.addClass(items[i].className)
                          const attrs = items[i].attributes
                          for (let k = 0; k < attrs.length; k++) {
                            last_group.attr(attrs[k].name, attrs[k].value)
                          }
                          if (last_group.hasClass("flex")) {
                            // need to update flex groups list
                            $active.data().flex = null
                          }
                          more_section.before(last_group)
                          if (last_separator) {
                            last_separator.css("display", "")
                            last_separator.removeAttr("hidden-on-resize")
                          }
                        }
                        last_group.append(child)
                        hideAllMenus = true
                      } else {
                        need_break = true
                        break
                      }
                    }
                    if (item.children().length < 1) {
                      // all buttons are moved
                      item.remove()
                      last_group
                        ?.removeAttr("group-state")
                        .attr("inner-width", item.attr("inner-width"))
                      last_group = null
                      if (this.$moreBar.children().filter(".group").length === 0) {
                        this.hideMoreBtns()
                        more_section.css("display", "none")
                      }
                    } else {
                      last_group?.attr("group-state", "open") && item.attr("group-state", "open")
                    }
                    if (need_break) break
                  } else {
                    break
                  }
                  last_separator = null
                  last_width = 0
                } else if (item.hasClass("separator")) {
                  more_section.before(item)
                  item.css("display", "none")
                  item.attr("hidden-on-resize", true)
                  last_separator = item
                  last_width =
                    Number.parseInt(last_separator.css("margin-left")) +
                    Number.parseInt(last_separator.css("margin-right")) +
                    1
                  hideAllMenus = true
                }
              }
            } else {
              this.hideMoreBtns()
              more_section.css("display", "none")
            }
          }
          hideAllMenus && Common.UI.Menu.Manager.hideAll()
        },

        onMoreHide: function (btn, e) {
          const moreContainer = btn.panel.parent()
          if (btn.pressed) {
            btn.toggle(false, true)
          }
          if (moreContainer.is(":visible")) {
            moreContainer.hide()
            Common.NotificationCenter.trigger("edit:complete", this.toolbar, btn)
          }
        },

        onMoreShow: (btn, e) => {
          const moreContainer = btn.panel.parent()
          const parentxy = Common.Utils.getOffset(moreContainer.parent())
          const target = btn.$el
          const showxy = Common.Utils.getOffset(target)
          const right = Common.Utils.innerWidth() - (showxy.left - parentxy.left + target.width())
          const top = showxy.top - parentxy.top + target.height() + 10

          const styles = Common.UI.isRTL()
            ? {
                left: "6px",
                right: "auto",
                top: top,
                "max-width": `${Common.Utils.innerWidth()}px`,
              }
            : {
                right: right,
                left: "auto",
                top: top,
                "max-width": `${Common.Utils.innerWidth()}px`,
              }
          moreContainer.css(styles)
          moreContainer.show()
        },

        hideMoreBtns: () => {
          for (const btn in btnsMore) {
            btnsMore[btn]?.isActive() && btnsMore[btn].toggle(false)
          }
        },
      }
    })(),
  )
})
