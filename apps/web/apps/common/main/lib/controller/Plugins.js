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
 * Date: 17.05.16
 */

define([
  "core",
  "common/main/lib/collection/Plugins",
  "common/main/lib/view/Plugins",
  "common/main/lib/component/Switcher",
], () => {
  Common.Controllers.Plugins = Backbone.Controller.extend(
    _.extend(
      {
        models: [],
        appOptions: {},
        configPlugins: { autostart: [] }, // {config: 'from editor config', plugins: 'loaded plugins', UIplugins: 'loaded customization plugins', autostart: 'autostart guids'}
        serverPlugins: { autostart: [] }, // {config: 'from editor config', plugins: 'loaded plugins', autostart: 'autostart guids'}
        collections: ["Common.Collections.Plugins"],
        views: ["Common.Views.Plugins"],

        initialize: function () {
          const me = this
          this.addListeners({
            Toolbar: {
              "render:before": (toolbar) => {
                const appOptions = me.getApplication().getController("Main").appOptions

                if (
                  !appOptions.isEditMailMerge &&
                  !appOptions.isEditDiagram &&
                  !appOptions.isEditOle
                ) {
                  const tab = {
                    action: "plugins",
                    caption: me.viewPlugins.groupCaption,
                    dataHintTitle: "E",
                    layoutname: "toolbar-plugins",
                  }
                  me.$toolbarPanelPlugins = me.viewPlugins.getPanel()
                  me.toolbar = toolbar
                  toolbar.addTab(tab, me.$toolbarPanelPlugins, Common.UI.LayoutManager.lastTabIdx) // TODO: clear plugins list in left panel
                }
              },
              "tab:active": this.onActiveTab,
            },
            "Common.Views.Plugins": {
              "plugin:select": function (guid, type, isRun, closePanel) {
                if (
                  !this.viewPlugins.pluginPanels[guid] ||
                  (this.viewPlugins.pluginPanels[guid] && type > 0)
                ) {
                  !isRun || type > 0
                    ? me.api.asc_pluginRun(guid, type, "")
                    : me.api.asc_pluginStop(guid)
                } else {
                  closePanel
                    ? me.onToolClose(this.viewPlugins.pluginPanels[guid])
                    : me.openUIPlugin(guid)
                }
              },
            },
            LeftMenu: {
              "plugins:showpanel": (guid) => {
                me.viewPlugins.showPluginPanel(true, guid)
              },
              "plugins:hidepanel": (guid) => {
                me.viewPlugins.showPluginPanel(false, guid)
              },
            },
            RightMenu: {
              "plugins:showpanel": (guid) => {
                me.viewPlugins.showPluginPanel(true, guid)
              },
              "plugins:hidepanel": (guid) => {
                me.viewPlugins.showPluginPanel(false, guid)
              },
            },
          })
        },

        onLaunch: function () {
          const store = this.getApplication().getCollection("Common.Collections.Plugins")
          this.viewPlugins = this.createView("Common.Views.Plugins", {
            storePlugins: store,
          })

          store.on({
            add: this.onAddPlugin.bind(this),
            reset: this.onResetPlugins.bind(this),
          })

          this.autostart = []
          this.pluginsWinToShow = []
          this.startOnPostLoad = false
          this.customPluginsDlg = []

          this.newInstalledBackgroundPlugins = []
          this.customButtonsArr = []

          Common.Gateway.on("init", this.loadConfig.bind(this))
          Common.NotificationCenter.on("app:face", this.onAppShowed.bind(this))
          Common.NotificationCenter.on("uitheme:changed", this.updatePluginsButtons.bind(this))
          Common.NotificationCenter.on("window:resize", this.updatePluginsButtons.bind(this))
          Common.NotificationCenter.on("app:ready", this.onAppReady.bind(this))
          Common.NotificationCenter.on("doc:mode-changed", this.onChangeDocMode.bind(this))
          Common.NotificationCenter.on("modal:close", this.onModalClose.bind(this))
          Common.NotificationCenter.on("script:loaded", this.onPostLoadComplete.bind(this))
        },

        loadConfig: function (data) {
          this.configPlugins.config = data.config.plugins
          this.editor = window.PDFE
            ? "pdf"
            : window.DE
              ? "word"
              : window.PE
                ? "slide"
                : window.VE
                  ? "diagram"
                  : "cell"
          this.isPDFEditor = !!window.PDFE
        },

        loadPlugins: function () {
          this.configPlugins.plugins = this.serverPlugins.plugins = undefined

          if (this.configPlugins.config) {
            this.getPlugins(this.configPlugins.config.pluginsData)
              .then((loaded) => {
                me.configPlugins.plugins = loaded
                me.mergePlugins()
              })
              .catch((err) => {
                me.configPlugins.plugins = false
              })

            if (this.configPlugins.config.options)
              this.api.setPluginsOptions(this.configPlugins.config.options)
          } else this.configPlugins.plugins = false

          if (!Common.Controllers.Desktop.isActive() || !Common.Controllers.Desktop.isOffline()) {
            const server_plugins_url = "../../../../plugins.json"
            Common.Utils.loadConfig(server_plugins_url, (obj) => {
              if (obj !== "error") {
                this.serverPlugins.config = obj
                this.getPlugins(this.serverPlugins.config.pluginsData)
                  .then((loaded) => {
                    this.serverPlugins.plugins = loaded
                    this.mergePlugins()
                  })
                  .catch((err) => {
                    this.serverPlugins.plugins = false
                  })
              } else this.serverPlugins.plugins = false
            })
          }
        },

        onAppShowed: (config) => {},

        onAppReady: function (config) {
          new Promise((accept, reject) => {
            accept()
          }).then(() => {
            this.onChangeProtectDocument()
            Common.NotificationCenter.on(
              "protect:doclock",
              _.bind(this.onChangeProtectDocument, this),
            )
          })
        },

        setApi: function (api) {
          this.api = api

          if (!this.appOptions.customization || this.appOptions.customization.plugins !== false) {
            this.api.asc_registerCallback("asc_onPluginShow", _.bind(this.onPluginShow, this))
            this.api.asc_registerCallback("asc_onPluginClose", _.bind(this.onPluginClose, this))
            this.api.asc_registerCallback("asc_onPluginResize", _.bind(this.onPluginResize, this))
            this.api.asc_registerCallback("asc_onPluginsReset", _.bind(this.resetPluginsList, this))
            this.api.asc_registerCallback("asc_onPluginsInit", _.bind(this.onPluginsInit, this))
            this.api.asc_registerCallback(
              "asc_onPluginShowButton",
              _.bind(this.onPluginShowButton, this),
            )
            this.api.asc_registerCallback(
              "asc_onPluginHideButton",
              _.bind(this.onPluginHideButton, this),
            )

            this.api.asc_registerCallback(
              "asc_onPluginWindowShow",
              _.bind(this.onApiPluginWindowShow, this),
            )
            this.api.asc_registerCallback(
              "asc_onPluginWindowClose",
              _.bind(this.onPluginWindowClose, this),
            )
            this.api.asc_registerCallback(
              "asc_onPluginWindowResize",
              _.bind(this.onPluginWindowResize, this),
            )
            this.api.asc_registerCallback(
              "asc_onPluginWindowActivate",
              _.bind(this.openUIPlugin, this),
            )

            this.loadPlugins()
          }
          return this
        },

        setMode: function (mode, api) {
          this.appOptions = mode
          this.api = api
          this.customPluginsComplete = !this.appOptions.canBrandingExt
          if (this.appOptions.canBrandingExt) this.getAppCustomPlugins(this.configPlugins)
          return this
        },

        onAfterRender: function (panel, guid, isActivated) {
          isActivated && this.openUIPlugin(guid)
          panel.pluginClose.on("click", _.bind(this.onToolClose, this, panel))
          panel.pluginHide?.on("click", _.bind(this.onToolHide, this, panel))
          Common.NotificationCenter.on({
            "layout:resizestart": (e) => {
              if (panel) {
                panel.enablePointerEvents?.(false)
                this.api.asc_pluginEnableMouseEvents(true)
              }
            },
            "layout:resizestop": (e) => {
              if (panel) {
                panel.enablePointerEvents?.(true)
                this.api.asc_pluginEnableMouseEvents(false)
              }
            },
          })
        },

        refreshPluginsList: function () {
          const storePlugins = this.getApplication().getCollection("Common.Collections.Plugins")
          const arr = []
          storePlugins.each((item) => {
            const plugin = new Asc.CPlugin()
            plugin.deserialize(item.get("original"))
            item.set("pluginObj", plugin)
            arr.push(plugin)
          })
          this.api.asc_pluginsRegister("", arr)
          if (storePlugins.hasVisible())
            Common.NotificationCenter.trigger(
              "tab:visible",
              "plugins",
              Common.UI.LayoutManager.isElementVisible("toolbar-plugins"),
            )
          Common.Gateway.pluginsReady()
        },

        onAddPlugin: function (model) {
          if (this.$toolbarPanelPlugins) {
            const btn = this.viewPlugins.createPluginButton(model)
            if (!btn) return

            const _group = $("> .group", this.$toolbarPanelPlugins)
            const $slot = $('<span class="btn-slot text x-huge"></span>').appendTo(_group)
            btn.render($slot)
            const docProtection = this.viewPlugins._state.docProtection
            Common.Utils.lockControls(Common.enumLock.docLockView, docProtection.isReadOnly, {
              array: btn,
            })
            Common.Utils.lockControls(Common.enumLock.docLockForms, docProtection.isFormsOnly, {
              array: btn,
            })
            Common.Utils.lockControls(
              Common.enumLock.docLockComments,
              docProtection.isCommentsOnly,
              { array: btn },
            )
          }
        },

        addBackgroundPluginsButton: function (group) {
          group.appendTo(this.$toolbarPanelPlugins) // append previous button (Plugin Manager)
          //$('<div class="separator long"></div>').appendTo(me.$toolbarPanelPlugins);
          group = $(
            `<div class="group" style="${Common.UI.isRTL() ? "padding-right: 0;" : "padding-left: 0;"}"></div>`,
          )
          this.viewPlugins.backgroundBtn = this.viewPlugins.createBackgroundPluginsButton()
          const $backgroundSlot = $(
            '<span class="btn-slot text x-huge" id="slot-background-plugin"></span>',
          ).appendTo(group)
          this.viewPlugins.backgroundBtn.render($backgroundSlot)
          this.viewPlugins.backgroundBtn.hide()

          return group
        },

        turnOffBackgroundPlugin: function (guid) {
          if (this.backgroundPluginsSwitchers) {
            let switcher
            this.backgroundPluginsSwitchers.forEach((item) => {
              if (item.options.pluginGuid === guid) {
                switcher = item
              }
            })
            if (switcher) {
              switcher.updateHint(this.viewPlugins.textStart)
              switcher.setValue(false)
              return true
            }
            return false
          }
        },

        onShowBeforeBackgroundPlugins: function (menu) {
          this.clickInsideMenu = false
          const hideActiveMenu = () => {
            const activeMenu = menu.cmpEl.find(".dropdown-toggle.active")
            for (let i = 0; i < activeMenu.length; i++) {
              const m = activeMenu[i]
              const b = $(m).parent()
              b.toggleClass("open", false)
              $(m).trigger($.Event("hide.bs.dropdown"))
            }
          }
          this.backgroundPluginsSwitchers = []
          const usedPlugins = this.api.getUsedBackgroundPlugins()
          this.backgroundPlugins.forEach((model) => {
            const modes = model.get("variations")
            const icons = modes[model.get("currentVariation")].get("icons")
            const guid = model.get("guid")
            const isRun = _.indexOf(usedPlugins, guid) !== -1
            model.set("parsedIcons", this.viewPlugins.parseIcons(icons))
            const menuItem = new Common.UI.MenuItemCustom({
              value: guid,
              caption: model.get("name"),
              iconsSet: this.viewPlugins.iconsStr2IconsObj(icons),
              baseUrl: model.get("baseUrl"), // icons have a relative path, so need to use the base url
              template: _.template(
                [
                  '<div id="<%= id %>" class="menu-item" <% if(!_.isUndefined(options.stopPropagation)) { %> data-stopPropagation="true" <% } %> >',
                  '<img class="menu-item-icon" src="<%= options.iconImg %>">',
                  '<div class="plugin-caption"><%- caption %></div>',
                  '<div class="plugin-tools">',
                  '<div class="plugin-toggle"></div>',
                  '<div class="plugin-settings"></div>',
                  "</span>",
                  "</a>",
                ].join(""),
              ),
              stopPropagation: true,
            })
            menu.addItem(menuItem)
            model.set("backgroundPlugin", menuItem)
            const switcher = new Common.UI.Switcher({
              el: menuItem.$el.find(".plugin-toggle")[0],
              value: !!model.isSystem || isRun,
              disabled: !!model.isSystem,
              pluginGuid: guid,
              hint: isRun ? this.viewPlugins.textStop : this.viewPlugins.textStart,
            })
            switcher.on("change", (element, value) => {
              switcher.updateHint(value ? this.viewPlugins.textStop : this.viewPlugins.textStart)
              this.viewPlugins.fireEvent("plugin:select", [switcher.options.pluginGuid, 0, !value])
            })
            this.backgroundPluginsSwitchers.push(switcher)
            const menuItems = []
            _.each(modes, (variation, index) => {
              if (index > 0 && variation.get("visible"))
                menuItems.push({
                  caption: variation.get("description"),
                  value: Number.parseInt(variation.get("index")),
                })
            })
            if (menuItems.length > 0) {
              const btn = new Common.UI.Button({
                parentEl: menuItem.$el.find(".plugin-settings"),
                cls: "btn-toolbar",
                iconCls: "menu__icon btn-more",
                menu: new Common.UI.Menu({
                  menuAlign: "tl-bl",
                  items: menuItems,
                  pluginGuid: guid,
                }),
                onlyIcon: true,
                stopPropagation: true,
                hint: this.viewPlugins.textSettings,
              })
              btn.menu.on("item:click", (menu, item, e) => {
                Common.UI.Menu.Manager.hideAll()
                this.viewPlugins.fireEvent("plugin:select", [
                  menu.options.pluginGuid,
                  item.value,
                  false,
                ])
                this.clickInsideMenu = false
              })
              btn.menu.on("keydown:before", (menu, e) => {
                if (e.keyCode === Common.UI.Keys.ESC) {
                  hideActiveMenu()
                  _.delay(() => {
                    btn.cmpEl
                      .closest(".btn-group.open")
                      .find("[data-toggle=dropdown]:first")
                      .focus()
                  }, 10)
                }
              })
              btn.menu.cmpEl.find("li").on("mousedown", () => {
                this.clickInsideMenu = true
              })
              btn.cmpEl.on("mousedown", () => {
                this.clickInsideMenu = true
              })
              btn.on("click", () => {
                const btnGroup = btn.$el.find(".btn-group")
                const isOpen = btnGroup.hasClass("open")
                if (!isOpen) hideActiveMenu()
                btnGroup.toggleClass("open", !isOpen)
                $(btn.menu.el).trigger($.Event(!isOpen ? "show.bs.dropdown" : "hide.bs.dropdown"))
                this.clickInsideMenu = false
              })
            }
          })
          menu.cmpEl.find("li").on("mousedown", () => {
            if (this.clickInsideMenu) return
            hideActiveMenu()
          })
        },

        onResetPlugins: function (collection) {
          this.customButtonsArr.forEach((item) => {
            this.toolbar?.addCustomControls({ action: item.tab }, undefined, [item.btn])
          })
          this.customButtonsArr = []

          this.appOptions.canPlugins = !collection.isEmpty()
          if (this.$toolbarPanelPlugins) {
            this.backgroundPlugins = []
            this.$toolbarPanelPlugins.empty()
            this.toolbar?.clearMoreButton("plugins")

            let _group = $('<div class="group"></div>')
            let rank = -1
            let rank_plugins = 0
            let isBackground = false
            collection.each((model) => {
              const new_rank = model.get("groupRank")
              const isBackgroundPlugin = model.get("isBackgroundPlugin")
              if (isBackgroundPlugin) {
                this.backgroundPlugins.push(model)
                return
              }
              if (model.get("tab")) {
                const tab = model.get("tab")
                const btn = this.viewPlugins.createPluginButton(model)
                if (btn) {
                  btn.options.separator = tab.separator
                  this.toolbar?.addCustomControls(tab, [btn])
                  this.customButtonsArr.push({ tab: tab.action, btn: btn })
                }
                return
              }

              //if (new_rank === 1 || new_rank === 2) return; // for test
              if ((new_rank === 0 || new_rank === 2) && !isBackground) {
                _group = this.addBackgroundPluginsButton(_group)
                isBackground = true
                rank = 1.5
                rank_plugins++
              }

              const btn = this.viewPlugins.createPluginButton(model)
              if (btn) {
                if (new_rank !== rank && rank > -1 && rank_plugins > 0) {
                  _group.appendTo(this.$toolbarPanelPlugins)
                  $('<div class="separator long"></div>').appendTo(this.$toolbarPanelPlugins)
                  _group = $('<div class="group"></div>')
                  rank_plugins = 0
                } else if (rank_plugins > 0) {
                  _group.appendTo(this.$toolbarPanelPlugins)
                  $('<div class="separator long invisible"></div>').appendTo(
                    this.$toolbarPanelPlugins,
                  )
                  _group = $(
                    `<div class="group" style="${Common.UI.isRTL() ? "padding-right: 0;" : "padding-left: 0;"}"></div>`,
                  )
                }

                const $slot = $('<span class="btn-slot text x-huge"></span>').appendTo(_group)
                btn.render($slot)
                rank_plugins++
                rank = new_rank
              }
              if (new_rank === 1 && !isBackground) {
                _group = this.addBackgroundPluginsButton(_group)
                isBackground = true
              }
            })
            _group.appendTo(this.$toolbarPanelPlugins)
            if (this.backgroundPlugins.length > 0) {
              this.viewPlugins.backgroundBtn.show()
              const onShowBefore = (menu) => {
                this.onShowBeforeBackgroundPlugins(menu)
                menu.off("show:before", onShowBefore)
              }
              this.viewPlugins.backgroundBtn.menu.on("show:before", onShowBefore)
              this.viewPlugins.backgroundBtn.on("click", () => {
                this.closeBackPluginsTip()
              })
            }

            this.toolbar?.isTabActive("plugins") && this.toolbar.processPanelVisible(null, true)
            const docProtection = this.viewPlugins._state.docProtection
            Common.Utils.lockControls(Common.enumLock.docLockView, docProtection.isReadOnly, {
              array: this.viewPlugins.lockedControls,
            })
            Common.Utils.lockControls(Common.enumLock.docLockForms, docProtection.isFormsOnly, {
              array: this.viewPlugins.lockedControls,
            })
            Common.Utils.lockControls(
              Common.enumLock.docLockComments,
              docProtection.isCommentsOnly,
              { array: this.viewPlugins.lockedControls },
            )
          } else {
            console.error("toolbar panel isnot created")
          }
        },

        updatePluginsButtons: function () {
          const storePlugins = this.getApplication().getCollection("Common.Collections.Plugins")
          const iconsInLeftMenu = []
          const iconsInRightMenu = []
          storePlugins.each((item) => {
            this.viewPlugins.updatePluginIcons(item)
            const guid = item.get("guid")
            if (this.viewPlugins.pluginPanels[guid] && item.get("parsedIcons")) {
              const menu =
                this.viewPlugins.pluginPanels[guid].menu === "right"
                  ? iconsInRightMenu
                  : iconsInLeftMenu
              menu.push({
                guid: guid,
                baseUrl: item.get("baseUrl"),
                parsedIcons: item.get("parsedIcons"),
              })
            }
          })
          for (const key in this.viewPlugins.customPluginPanels) {
            const panel = this.viewPlugins.customPluginPanels[key]
            if (panel.icons) {
              const menu = panel.menu === "right" ? iconsInRightMenu : iconsInLeftMenu
              menu.push({
                guid: panel.frameId,
                baseUrl: panel.baseUrl,
                parsedIcons: this.viewPlugins.parseIcons(panel.icons),
              })
            }
          }
          if (iconsInLeftMenu.length > 0) {
            this.viewPlugins.fireEvent("pluginsleft:updateicons", [iconsInLeftMenu])
          }
          if (iconsInRightMenu.length > 0) {
            this.viewPlugins.fireEvent("pluginsright:updateicons", [iconsInRightMenu])
          }
        },

        onSelectPlugin: function (picker, item, record, e) {
          const btn = $(e.target)
          if (btn?.hasClass("plugin-caret")) {
            const menu = this.viewPlugins.pluginMenu
            if (menu.isVisible()) {
              menu.hide()
              return
            }

            let showPoint
            const currentTarget = $(e.currentTarget)
            const parent = $(this.viewPlugins.el)
            const offset = currentTarget.offset()
            const offsetParent = parent.offset()

            showPoint = [
              offset.left - offsetParent.left + currentTarget.width(),
              offset.top - offsetParent.top + currentTarget.height() / 2,
            ]

            if (record !== undefined) {
              for (let i = 0; i < menu.items.length; i++) {
                menu.removeItem(menu.items[i])
                i--
              }
              menu.removeAll()

              const variations = record.get("variations")
              for (let i = 0; i < variations.length; i++) {
                const variation = variations[i]
                const mnu = new Common.UI.MenuItem({
                  caption: i > 0 ? variation.get("description") : this.viewPlugins.textStart,
                  value: Number.parseInt(variation.get("index")),
                }).on("click", (item, e) => {
                  if (this.api) {
                    this.api.asc_pluginRun(record.get("guid"), item.value, "")
                  }
                })
                menu.addItem(mnu)
              }
            }

            let menuContainer = parent.find("#menu-plugin-container")
            if (!menu.rendered) {
              if (menuContainer.length < 1) {
                menuContainer = $(
                  '<div id="menu-plugin-container" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>',
                  menu.id,
                )
                parent.append(menuContainer)
              }
              menu.render(menuContainer)
              menu.cmpEl.attr({ tabindex: "-1" })

              menu.on({
                "show:after": (cmp) => {
                  if (cmp?.menuAlignEl) cmp.menuAlignEl.toggleClass("over", true)
                },
                "hide:after": (cmp) => {
                  if (cmp?.menuAlignEl) cmp.menuAlignEl.toggleClass("over", false)
                },
              })
            }

            menuContainer.css({ left: showPoint[0], top: showPoint[1] })

            menu.menuAlignEl = currentTarget
            menu.setOffset(-20, -currentTarget.height() / 2 - 3)
            menu.show()
            _.delay(() => {
              menu.cmpEl.focus()
            }, 10)
            e.stopPropagation()
            e.preventDefault()
          } else this.api.asc_pluginRun(record.get("guid"), 0, "")
        },

        addPluginToSideMenu: function (plugin, variation, langName, menu, frameId, url) {
          function createUniqueName(name) {
            const n = name.toLowerCase().replace(/[^a-z0-9\-_:]/g, "-")
            let panelName = n
            let index = 0
            while (true) {
              if ($(`#panel-plugins-${panelName}`).length < 1) break
              index++
              panelName = `${n}-${index}`
            }
            return panelName
          }
          const pluginGuid = plugin.get_Guid()
          const model = this.viewPlugins.storePlugins.findWhere({ guid: pluginGuid })
          const name = createUniqueName(plugin.get_Name("en"))
          const icons = model.get("variations")[model.get("currentVariation")].get("icons")
          model.set({ menu: menu })
          let icon_cls
          if (!icons) {
            icon_cls = "icon toolbar__icon btn-plugin-panel-default"
          }
          const $button = $(`<div id="slot-btn-plugins${name}"></div>`)
          const button = new Common.UI.ButtonCustom({
            cls: "btn-category plugin-buttons",
            hint: langName,
            enableToggle: true,
            toggleGroup: menu === "right" ? "tabpanelbtnsGroup" : "leftMenuGroup",
            iconCls: icon_cls,
            iconsSet: this.viewPlugins.iconsStr2IconsObj(icons),
            baseUrl: model.get("baseUrl"),
            onlyIcon: true,
            value: pluginGuid,
            type: "plugin",
          })
          button.render($button)
          const $panel = $(
            `<div id="panel-plugins-${name}" class="plugin-panel${menu !== "right" ? " content-box" : ""}" style="height: 100%;"></div>`,
          )
          this.viewPlugins.fireEvent(
            menu === "right" ? "plugins:addtoright" : "plugins:addtoleft",
            [button, $button, $panel],
          )
          this.viewPlugins.pluginPanels[pluginGuid] = new Common.Views.PluginPanel({
            el: `#panel-plugins-${name}`,
            menu: menu,
            sideMenuButton: button,
            isCanDocked: variation.get_IsCanDocked ? variation.get_IsCanDocked() : false,
          })
          this.viewPlugins.pluginPanels[pluginGuid].on(
            "render:after",
            _.bind(
              this.onAfterRender,
              this,
              this.viewPlugins.pluginPanels[pluginGuid],
              pluginGuid,
              true,
            ),
          )
          this.viewPlugins.pluginPanels[pluginGuid].on(
            "docked",
            _.bind(function () {
              this.onPluginClose(plugin)
              this.addPluginToWindow(plugin, variation, langName, menu, frameId, url)
              this.savePluginDockedPosition(pluginGuid, Asc.PluginType.Window)
            }, this),
          )

          if (
            !this.viewPlugins.pluginPanels[plugin.get_Guid()].openInsideMode(
              langName,
              url,
              frameId,
              plugin.get_Guid(),
            )
          )
            this.api.asc_pluginButtonClick(-1, plugin.get_Guid())
        },

        addPluginToWindow: function (plugin, variation, langName, menu, frameId, url) {
          const createPluginDlg = () => {
            const isCustomWindow = variation.get_CustomWindow()
            const arrBtns = variation.get_Buttons()
            const newBtns = []
            let size = variation.get_Size()
            const isModal = variation.get_Modal()
            if (!size || size.length < 2) size = [800, 600]

            if (_.isArray(arrBtns)) {
              _.each(arrBtns, (b, index) => {
                if (b.visible)
                  newBtns[index] = { caption: b.text, value: index, primary: b.primary }
              })
            }

            const help = variation.get_Help()
            this.pluginDlg = new Common.Views.PluginDlg({
              guid: plugin.get_Guid(),
              cls: isCustomWindow ? "plain" : "",
              header: !isCustomWindow,
              title: Common.Utils.String.htmlEncode(langName),
              width: size[0], // inner width
              height: size[1], // inner height
              url: url,
              frameId: frameId,
              buttons: isCustomWindow ? undefined : newBtns,
              toolcallback: (event) => {
                this.api.asc_pluginButtonClick(-1, plugin.get_Guid())
              },
              help: !!help,
              loader: plugin.get_Loader(),
              modal: isModal !== undefined ? isModal : true,
              isCanDocked: variation.get_IsCanDocked ? variation.get_IsCanDocked() : false,
            })
            this.pluginDlg.on({
              "render:after": (obj) => {
                obj.getChild(".footer .dlg-btn").on("click", (event) => {
                  this.api.asc_pluginButtonClick(
                    Number.parseInt(event.currentTarget.attributes.result.value),
                    plugin.get_Guid(),
                  )
                })
                this.pluginContainer = this.pluginDlg.$window.find("#id-plugin-container")
              },
              close: (obj) => {
                this.pluginDlg = undefined
              },
              drag: (args) => {
                this.api.asc_pluginEnableMouseEvents(args[1] === "start")
                args[0].enablePointerEvents(args[1] !== "start")
              },
              resize: (args) => {
                this.api.asc_pluginEnableMouseEvents(args[1] === "start")
                args[0].enablePointerEvents(args[1] !== "start")
              },
              help: () => {
                help && window.open(help, "_blank")
              },
              docked: () => {
                this.onPluginClose(plugin)
                this.addPluginToSideMenu(plugin, variation, langName, menu, frameId, url)
                this.savePluginDockedPosition(plugin.get_Guid(), Asc.PluginType.Panel)
              },
              "header:click": (type) => {
                this.api.asc_pluginButtonClick(type, plugin.get_Guid())
              },
            })

            this.pluginDlg.show()
          }

          if (this.pluginDlg) {
            this.api.asc_pluginButtonClick(-1, this.pluginDlg.guid)
            setTimeout(createPluginDlg, 10)
          } else {
            createPluginDlg()
          }
        },

        closePluginInPanel: function (guid) {
          const panel = this.viewPlugins.pluginPanels[guid]
          if (panel?.iframePlugin) {
            panel.closeInsideMode(guid)
            this.viewPlugins.pluginPanels[guid].$el.remove()
            delete this.viewPlugins.pluginPanels[guid]
            const model = this.viewPlugins.storePlugins.findWhere({ guid: guid })
            this.viewPlugins.fireEvent(
              model.get("menu") === "right" ? "pluginsright:close" : "pluginsleft:close",
              [guid],
            )
            return true
          }
          return false
        },

        savePluginDockedPosition: (guid, position) => {
          let state = Common.localStorage.getItem("plugins-docked-position") || "{}"
          state = JSON.parse(state)
          state[guid] = position
          Common.localStorage.setItem("plugins-docked-position", JSON.stringify(state))
        },

        getPluginDockedPosition: (guid) => {
          let state = Common.localStorage.getItem("plugins-docked-position") || "{}"
          state = JSON.parse(state)
          return state[guid]
        },

        openUIPlugin: function (id) {
          const model = this.viewPlugins.storePlugins.findWhere({ guid: id })
          const menu = model ? model.get("menu") : this.viewPlugins.customPluginPanels[id]?.menu
          this.viewPlugins.fireEvent(menu === "right" ? "pluginsright:open" : "pluginsleft:open", [
            id,
          ])
        },

        onPluginShow: function (plugin, variationIndex, frameId, urlAddition) {
          const variation = plugin.get_Variations()[variationIndex]
          if (variation.get_Visual()) {
            const lang = this.appOptions?.lang ? this.appOptions.lang.split(/[\-_]/)[0] : "en"
            let url = variation.get_Url()
            const langName = plugin.get_Name(lang)
            const isCanDocked = variation.get_IsCanDocked ? variation.get_IsCanDocked() : false
            const dockedPosition = this.getPluginDockedPosition(plugin.get_Guid())
            let menu = this.isPDFEditor
              ? "left"
              : variation.get_Type() === Asc.PluginType.PanelRight
                ? "right"
                : "left"
            let isInsideMode = variation.get_InsideMode()

            if (isCanDocked) {
              isInsideMode =
                dockedPosition === Asc.PluginType.Panel ||
                dockedPosition === Asc.PluginType.PanelRight
              menu = isInsideMode
                ? dockedPosition === Asc.PluginType.PanelRight
                  ? "right"
                  : "left"
                : menu
            }

            !menu && (menu = "left")
            url = (plugin.get_BaseUrl().length === 0 ? url : plugin.get_BaseUrl()) + url
            if (urlAddition) url += urlAddition
            if (isInsideMode) {
              this.addPluginToSideMenu(plugin, variation, langName, menu, frameId, url)
            } else {
              this.addPluginToWindow(plugin, variation, langName, menu, frameId, url)
            }
            this.viewPlugins.openedPluginMode(plugin.get_Guid(), isInsideMode)
          } else {
            this.viewPlugins.openedPluginMode(plugin.get_Guid(), variation.get_InsideMode())
          }
        },

        onPluginClose: function (plugin) {
          let isIframePlugin = false
          const guid = plugin.get_Guid()
          if (this.pluginDlg && this.pluginDlg.guid === guid) this.pluginDlg.close()
          else {
            const successClosed = this.closePluginInPanel(guid)
            successClosed && (isIframePlugin = true)
          }
          !this.turnOffBackgroundPlugin(guid) &&
            this.viewPlugins.closedPluginMode(guid, isIframePlugin)

          this.runAutoStartPlugins()

          Common.UI.LayoutManager.clearCustomMenuItems(guid) // remove custom menu items in toolbar
          Common.UI.LayoutManager.clearCustomControls(guid) // remove custom toolbar buttons
        },

        onPluginResize: function (size, minSize, maxSize, callback) {
          if (this.pluginDlg) {
            const resizable =
              minSize &&
              minSize.length > 1 &&
              maxSize &&
              maxSize.length > 1 &&
              (maxSize[0] > minSize[0] ||
                maxSize[1] > minSize[1] ||
                maxSize[0] === 0 ||
                maxSize[1] === 0)
            this.pluginDlg.setResizable(resizable, minSize, maxSize)
            this.pluginDlg.setInnerSize(size[0], size[1])
            if (callback) callback.call()
          }
        },

        onToolClose: function (panel) {
          this.api.asc_pluginButtonClick(-1, panel?._state.insidePlugin, panel?.frameId)
        },

        onToolHide: (panel) => {
          panel?.sideMenuButton?.click()
        },

        onPluginsInit: function (pluginsdata, fromManager) {
          !Array.isArray(pluginsdata) && (pluginsdata = pluginsdata.pluginsData)
          this.parsePlugins(pluginsdata, false, true, fromManager)
        },

        onPluginShowButton: function (id, toRight) {
          this.pluginDlg?.showButton(id, toRight)
        },

        onPluginHideButton: function (id) {
          this.pluginDlg?.hideButton(id)
        },

        runAutoStartPlugins: function () {
          if (this.autostart && this.autostart.length > 0) {
            this.api.asc_pluginRun(this.autostart.shift(), 0, "")
          }
        },

        resetPluginsList: function () {
          this.getApplication().getCollection("Common.Collections.Plugins").reset()
        },

        applyUICustomization: function () {
          return new Promise((resolve, reject) => {
            const timer_sl = setInterval(() => {
              if (this.customPluginsComplete) {
                clearInterval(timer_sl)
                try {
                  this.configPlugins.UIplugins?.forEach((c) => {
                    if (c.code) eval(c.code)
                  })
                } catch (e) {}
                resolve()
              }
            }, 10)
          })
        },

        parsePlugins: function (pluginsdata, uiCustomize, forceUpdate, fromManager) {
          this.closeBackPluginsTip()
          const pluginStore = this.getApplication().getCollection("Common.Collections.Plugins")
          const isEdit = this.appOptions.isEdit
          const editor = this.editor
          const apiVersion = this.api ? this.api.GetVersion() : undefined
          if (Array.isArray(pluginsdata)) {
            let arr = []
            const arrUI = []
            const lang = this.appOptions.lang.split(/[\-_]/)[0]
            pluginsdata.forEach((item) => {
              let updatedItem
              if (forceUpdate) {
                updatedItem = arr.find(
                  (i) => i.get("baseUrl") === item.baseUrl || i.get("guid") === item.guid,
                )
                !updatedItem && (updatedItem = pluginStore.findWhere({ baseUrl: item.baseUrl }))
                !updatedItem && (updatedItem = pluginStore.findWhere({ guid: item.guid }))
              } else {
                if (
                  arr.some(
                    (i) => i.get("baseUrl") === item.baseUrl || i.get("guid") === item.guid,
                  ) ||
                  pluginStore.findWhere({ baseUrl: item.baseUrl }) ||
                  pluginStore.findWhere({ guid: item.guid })
                ) {
                  return
                }
              }

              const variationsArr = []
              let pluginVisible = false
              let isDisplayedInViewer = false
              let isBackgroundPlugin = false
              let isSystem
              item.variations?.forEach((itemVar, itemInd) => {
                const variationType = Asc.PluginType.getType(itemVar.type)
                isSystem = true === itemVar.isSystem || Asc.PluginType.System === variationType
                const visible =
                  (isEdit || (itemVar.isViewer && itemVar.isDisplayedInViewer !== false)) &&
                  _.contains(itemVar.EditorsSupport, editor) &&
                  !isSystem
                if (visible) pluginVisible = true
                if (itemVar.isViewer && itemVar.isDisplayedInViewer !== false)
                  isDisplayedInViewer = true

                if (item.isUICustomizer) {
                  visible &&
                    arrUI.push({
                      url: item.baseUrl + itemVar.url,
                    })
                } else {
                  const model = new Common.Models.PluginVariation(itemVar)
                  let description = itemVar.description
                  if (typeof itemVar.descriptionLocale === "object")
                    description =
                      itemVar.descriptionLocale[lang] ||
                      itemVar.descriptionLocale.en ||
                      description ||
                      ""

                  _.each(itemVar.buttons, (b, index) => {
                    if (typeof b.textLocale === "object")
                      b.text = b.textLocale[lang] || b.textLocale.en || b.text || ""
                    b.visible = isEdit || b.isViewer !== false
                  })

                  let icons =
                    (typeof itemVar.icons === "string" && itemVar.icons.indexOf("%") !== -1) ||
                    !itemVar.icons2
                      ? itemVar.icons
                      : itemVar.icons2
                  if (!icons) icons = ""

                  model.set({
                    description: description,
                    index: variationsArr.length,
                    url: itemVar.url,
                    icons: icons,
                    buttons: itemVar.buttons,
                    visible: visible,
                    help: itemVar.help,
                  })

                  variationsArr.push(model)
                  if (itemInd === 0) {
                    isBackgroundPlugin = itemVar.type
                      ? variationType === Asc.PluginType.Background
                      : false
                  }
                }
              })

              if (variationsArr.length > 0 && !item.isUICustomizer) {
                let name = item.name
                if (typeof item.nameLocale === "object")
                  name = item.nameLocale[lang] || item.nameLocale.en || name || ""

                if (pluginVisible)
                  pluginVisible = this.checkPluginVersion(apiVersion, item.minVersion)

                if (item.guid === "asc.{E6978D28-0441-4BD7-8346-82FAD68BCA3B}") {
                  // item.tab = {
                  //     "id": "view",
                  //     "separator": true
                  // }
                  return // hide macros plugin
                }

                const props = {
                  name: name,
                  guid: item.guid,
                  baseUrl: item.baseUrl,
                  variations: variationsArr,
                  currentVariation: 0,
                  visible: pluginVisible,
                  groupName: item.group ? item.group.name : "",
                  groupRank: item.group ? item.group.rank : 0,
                  minVersion: item.minVersion,
                  original: item,
                  isDisplayedInViewer: isDisplayedInViewer,
                  isBackgroundPlugin: pluginVisible && isBackgroundPlugin,
                  isSystem: isSystem,
                  tab: item.tab
                    ? {
                        action: item.tab.id,
                        caption:
                          (typeof item.tab.text === "object"
                            ? item.tab.text[lang] || item.tab.text.en
                            : item.tab.text) || "",
                        separator: item.tab.separator,
                      }
                    : undefined,
                }
                updatedItem ? updatedItem.set(props) : arr.push(new Common.Models.Plugin(props))
                if (fromManager && !updatedItem && props.isBackgroundPlugin) {
                  this.newInstalledBackgroundPlugins.push({
                    name: name,
                    guid: item.guid,
                  })
                }
              }
            })

            if (uiCustomize !== false)
              // from ui customizer in editor config or desktop event
              this.configPlugins.UIplugins = arrUI

            if (!uiCustomize && pluginStore) {
              arr = pluginStore.models.concat(arr)
              arr.sort((a, b) => {
                const rank_a = a.get("groupRank")
                const rank_b = b.get("groupRank")
                if (rank_a < rank_b) return rank_a === 0 ? 1 : -1
                if (rank_a > rank_b) return rank_b === 0 ? -1 : 1
                return 0
              })
              pluginStore.reset(arr)
              this.appOptions.canPlugins = !pluginStore.isEmpty()
              this.newInstalledBackgroundPlugins = _.filter(
                this.newInstalledBackgroundPlugins,
                (item) => !!pluginStore.findWhere({ guid: item.guid }),
              )
            }
          } else if (!uiCustomize) {
            this.appOptions.canPlugins = false
          }

          if (!uiCustomize) this.getApplication().getController("LeftMenu").enablePlugins()

          if (this.appOptions.canPlugins) {
            this.refreshPluginsList()
            this.startOnPostLoad = !Common.Controllers.LaunchController.isScriptLoaded()
            !this.startOnPostLoad && this.runAutoStartPlugins()
          }
        },

        checkPluginVersion: (apiVersion, pluginVersion) => {
          if (
            apiVersion &&
            apiVersion !== "develop" &&
            pluginVersion &&
            typeof pluginVersion === "string"
          ) {
            const res = pluginVersion.match(/^([0-9]+)(?:.([0-9]+))?(?:.([0-9]+))?$/)
            const apires = apiVersion.match(/^([0-9]+)(?:.([0-9]+))?(?:.([0-9]+))?$/)
            if (res && res.length > 1 && apires && apires.length > 1) {
              for (let i = 0; i < 3; i++) {
                const pluginVer = res[i + 1] ? Number.parseInt(res[i + 1]) : 0
                const apiVer = apires[i + 1] ? Number.parseInt(apires[i + 1]) : 0
                if (pluginVer > apiVer) return false
                if (pluginVer < apiVer) return true
              }
            }
          }
          return true
        },

        getPlugins: (pluginsData, fetchFunction) => {
          if (!pluginsData || pluginsData.length < 1) return Promise.resolve([])

          fetchFunction =
            fetchFunction ||
            ((url) =>
              fetch(url)
                .then((response) => {
                  if (response.ok) return response.json()
                  return Promise.reject(url)
                })
                .then((json) => {
                  json.baseUrl = url.substring(0, url.lastIndexOf("config.json"))
                  return json
                }))

          const loaded = []
          return pluginsData
            .map(fetchFunction)
            .reduce(
              (previousPromise, currentPromise) =>
                previousPromise
                  .then(() => currentPromise)
                  .then((item) => {
                    loaded.push(item)
                    return Promise.resolve(item)
                  })
                  .catch((item) => Promise.resolve(item)),
              Promise.resolve(),
            )
            .then(() => Promise.resolve(loaded))
        },

        mergePlugins: function () {
          if (
            this.serverPlugins.plugins !== undefined &&
            this.configPlugins.plugins !== undefined
          ) {
            // undefined - plugins are loading
            let autostart = []
            let arr = []
            let plugins = this.configPlugins
            let warn = false
            if (plugins.plugins && plugins.plugins.length > 0) arr = plugins.plugins
            if (plugins?.config) {
              let val = plugins.config.autostart || plugins.config.autoStartGuid
              if (typeof val === "string") val = [val]
              warn = !!plugins.config.autoStartGuid
              autostart = val || []
            }

            plugins = this.serverPlugins
            if (plugins.plugins && plugins.plugins.length > 0) arr = arr.concat(plugins.plugins)
            if (plugins?.config) {
              val = plugins.config.autostart || plugins.config.autoStartGuid
              if (typeof val === "string") val = [val]
              ;(warn || plugins.config.autoStartGuid) &&
                console.warn(
                  "Obsolete: The autoStartGuid parameter is deprecated. Please check the documentation for new plugin connection configuration.",
                )
              autostart = autostart.concat(val || [])
            }

            this.autostart = autostart
            this.parsePlugins(arr, false)
          }
        },

        getAppCustomPlugins: function (plugins) {
          const funcComplete = () => {
            this.customPluginsComplete = true
          }
          if (plugins.config) {
            this.getPlugins(plugins.config.UIpluginsData).then((loaded) => {
              this.parsePlugins(loaded, true)
              this.getPlugins(plugins.UIplugins, (item) =>
                fetch(item.url)
                  .then((response) => {
                    if (response.ok) return response.text()
                    return Promise.reject()
                  })
                  .then((text) => {
                    item.code = text
                    return text
                  }),
              ).then(funcComplete, funcComplete)
            }, funcComplete)
          } else funcComplete()
        },

        onChangeProtectDocument: function (props) {
          if (!props) {
            const docprotect = this.getApplication().getController("DocProtection")
            props = docprotect ? docprotect.getDocProps() : null
          }
          if (props && this.viewPlugins) {
            this.viewPlugins._state.docProtection = props
            Common.Utils.lockControls(Common.enumLock.docLockView, props.isReadOnly, {
              array: this.viewPlugins.lockedControls,
            })
            Common.Utils.lockControls(Common.enumLock.docLockForms, props.isFormsOnly, {
              array: this.viewPlugins.lockedControls,
            })
            Common.Utils.lockControls(Common.enumLock.docLockComments, props.isCommentsOnly, {
              array: this.viewPlugins.lockedControls,
            })
          }
        },

        onChangeDocMode: function (type) {
          if (type === "view" && this.pluginDlg) {
            this.api.asc_pluginButtonClick(-1, this.pluginDlg.guid)
          }
        },

        // Plugin can create windows
        onPluginWindowShow: function (frameId, variation, lang) {
          const isCustomWindow = variation.isCustomWindow
          const arrBtns = variation.buttons
          const newBtns = []
          let size = variation.size
          const isModal = variation.isModal
          const variationType = Asc.PluginType.getType(variation.type)
          const isPanel =
            variationType === Asc.PluginType.Panel || variationType === Asc.PluginType.PanelRight
          if (!size || size.length < 2) size = [800, 600]

          let description = variation.description
          if (typeof variation.descriptionLocale === "object")
            description =
              variation.descriptionLocale[lang] ||
              variation.descriptionLocale.en ||
              description ||
              ""

          _.isArray(arrBtns) &&
            _.each(arrBtns, (b, index) => {
              if (typeof b.textLocale === "object")
                b.text = b.textLocale[lang] || b.textLocale.en || b.text || ""
              if (this.appOptions.isEdit || b.isViewer !== false)
                newBtns[index] = {
                  caption: b.text,
                  value: index,
                  primary: b.primary,
                  frameId: frameId,
                }
            })

          const help = variation.help
          this.customPluginsDlg[frameId] = new Common.Views.PluginDlg({
            cls:
              (isCustomWindow ? "plain" : "") +
              (variation.transparent ? " " + "no-background" : ""),
            header: !isCustomWindow,
            title: Common.Utils.String.htmlEncode(description),
            width: size[0], // inner width
            height: size[1], // inner height
            url: variation.url,
            frameId: frameId,
            buttons: isCustomWindow ? undefined : newBtns,
            toolcallback: (event) => {
              this.api.asc_pluginButtonClick(-1, variation.guid, frameId)
            },
            help: !!help,
            isCanDocked: variation.isCanDocked,
            modal: isModal !== undefined ? isModal : true,
          })
          this.customPluginsDlg[frameId].on({
            "render:after": (obj) => {
              obj.getChild(".footer .dlg-btn").on("click", (event) => {
                this.api.asc_pluginButtonClick(
                  Number.parseInt(event.currentTarget.attributes.result.value),
                  variation.guid,
                  frameId,
                )
              })
              this.customPluginsDlg[frameId].options.pluginContainer =
                this.customPluginsDlg[frameId].$window.find("#id-plugin-container")
            },
            close: (obj) => {
              this.customPluginsDlg[frameId] = undefined
            },
            drag: (args) => {
              this.api.asc_pluginEnableMouseEvents(args[1] === "start", frameId)
              args[0].enablePointerEvents(args[1] !== "start")
            },
            resize: (args) => {
              this.api.asc_pluginEnableMouseEvents(args[1] === "start", frameId)
              args[0].enablePointerEvents(args[1] !== "start")
            },
            help: () => {
              help && window.open(help, "_blank")
            },
            docked: (frameId) => {
              const docked_place = isPanel
                ? variation.type
                : variation.dockedPlace
                  ? variation.dockedPlace
                  : "panelRight"
              this.api.asc_pluginButtonDockChanged(docked_place, variation.guid, frameId, () => {
                setTimeout(() => {
                  this.customPluginsDlg[frameId].close()
                  this.onPluginPanelShow(frameId, variation, lang)
                }, 0)
              })
            },
            "header:click": (type) => {
              this.api.asc_pluginButtonClick(type, variation.guid, frameId)
            },
          })

          this.customPluginsDlg[frameId].show(variation.positionX, variation.positionY)
        },

        onApiPluginWindowShow: function (frameId, variation) {
          if (!Common.Controllers.LaunchController.isScriptLoaded()) {
            this.pluginsWinToShow.push({ frameId: frameId, variation: variation })
            return
          }
          if (variation.isVisual) {
            if (this.customPluginsDlg[frameId] || this.viewPlugins.customPluginPanels[frameId])
              return

            const lang = this.appOptions?.lang ? this.appOptions.lang.split(/[\-_]/)[0] : "en"
            const variationType = Asc.PluginType.getType(variation.type)
            const isSystem = true === variation.isSystem || Asc.PluginType.System === variationType
            const isPanel =
              variationType === Asc.PluginType.Panel || variationType === Asc.PluginType.PanelRight
            const visible =
              (this.appOptions.isEdit ||
                this.appOptions.canSubmitForms ||
                (variation.isViewer && variation.isDisplayedInViewer !== false)) &&
              _.contains(variation.EditorsSupport, this.editor) &&
              !isSystem
            if (visible && isPanel) {
              this.onPluginPanelShow(frameId, variation, lang)
            } else if (visible && !variation.isInsideMode) {
              this.onPluginWindowShow(frameId, variation, lang)
            }
          }
          if (this.pluginsWinToShow.length > 0) {
            const plg = this.pluginsWinToShow.shift()
            plg && this.onApiPluginWindowShow(plg.frameId, plg.variation)
          }
        },

        onPluginWindowClose: function (frameId) {
          if (this.pluginsWinToShow.length > 0) {
            this.pluginsWinToShow = _.reject(
              this.pluginsWinToShow,
              (item) => item.frameId === frameId,
            )
          }
          if (this.customPluginsDlg[frameId]) {
            this.customPluginsDlg[frameId].close()
          } else if (this.viewPlugins.customPluginPanels[frameId]) {
            const panel = this.viewPlugins.customPluginPanels[frameId]
            if (panel?.iframePlugin) {
              panel.closeInsideMode()
              panel.$el.remove()
              delete this.viewPlugins.customPluginPanels[frameId]
              this.viewPlugins.fireEvent(
                panel.menu === "right" ? "pluginsright:close" : "pluginsleft:close",
                [frameId],
              )
            }
          }
        },

        onPluginWindowResize: function (frameId, size, minSize, maxSize, callback) {
          if (this.customPluginsDlg[frameId]) {
            const resizable =
              minSize &&
              minSize.length > 1 &&
              maxSize &&
              maxSize.length > 1 &&
              (maxSize[0] > minSize[0] ||
                maxSize[1] > minSize[1] ||
                maxSize[0] === 0 ||
                maxSize[1] === 0)
            this.customPluginsDlg[frameId].setResizable(resizable, minSize, maxSize)
            this.customPluginsDlg[frameId].setInnerSize(size[0], size[1])
          }
          if (callback) {
            callback.call()
          }
        },

        onPluginPanelShow: function (frameId, variation, lang) {
          const guid = variation.guid
          let menu = this.isPDFEditor ? "left" : variation.type === "panelRight" ? "right" : "left"
          !menu && (menu = "left")

          let description = variation.description
          if (typeof variation.descriptionLocale === "object")
            description =
              variation.descriptionLocale[lang] ||
              variation.descriptionLocale.en ||
              description ||
              ""

          let baseUrl = variation.baseUrl || ""
          const model = this.viewPlugins.storePlugins.findWhere({ guid: guid })
          let icons = variation.icons
          let icon_cls
          const isActivated = variation.isActivated !== false

          if (model) {
            if ("" === baseUrl) baseUrl = model.get("baseUrl")
            if (!icons) {
              const modes = model.get("variations")
              icons = modes[model.get("currentVariation")].get("icons")
            }
          }

          if (!icons) {
            icon_cls = "icon toolbar__icon btn-plugin-panel-default"
          }

          const $button = $(`<div id="slot-btn-plugins-${frameId}"></div>`)
          const button = new Common.UI.ButtonCustom({
            cls: "btn-category plugin-buttons",
            hint: description,
            enableToggle: true,
            toggleGroup: menu === "right" ? "tabpanelbtnsGroup" : "leftMenuGroup",
            iconCls: icon_cls,
            iconsSet: this.viewPlugins.iconsStr2IconsObj(icons),
            baseUrl: baseUrl, // icons have a relative path, so need to use the base url
            onlyIcon: true,
            value: frameId,
            type: "plugin",
          })
          button.render($button)
          const $panel = $(
            `<div id="panel-plugins-${frameId}" class="plugin-panel${menu !== "right" ? " content-box" : ""}" style="height: 100%;"></div>`,
          )
          this.viewPlugins.fireEvent(
            menu === "right" ? "plugins:addtoright" : "plugins:addtoleft",
            [button, $button, $panel],
          )
          this.viewPlugins.customPluginPanels[frameId] = new Common.Views.PluginPanel({
            el: `#panel-plugins-${frameId}`,
            menu: menu,
            frameId: frameId,
            baseUrl: baseUrl,
            icons: icons,
            sideMenuButton: button,
            isCanDocked: variation.isCanDocked,
          })
          this.viewPlugins.customPluginPanels[frameId].on(
            "render:after",
            _.bind(
              this.onAfterRender,
              this,
              this.viewPlugins.customPluginPanels[frameId],
              frameId,
              isActivated,
            ),
          )
          this.viewPlugins.customPluginPanels[frameId].on(
            "docked",
            _.bind(function (frameId) {
              const _plugins = this
              this.api.asc_pluginButtonDockChanged("window", variation.guid, frameId, function () {
                setTimeout(
                  _.bind(() => {
                    _plugins.onPluginWindowClose(frameId)
                    _plugins.onPluginWindowShow(frameId, variation, lang)
                  }, this),
                  0,
                )
              })
            }, this),
          )

          if (
            !this.viewPlugins.customPluginPanels[frameId].openInsideMode(
              description,
              variation.url,
              frameId,
              guid,
            )
          )
            this.api.asc_pluginButtonClick(-1, guid, frameId)
        },

        onModalClose: function () {
          const plugins = this.newInstalledBackgroundPlugins
          if (
            plugins &&
            plugins.length > 0 &&
            this.viewPlugins.backgroundBtn &&
            this.viewPlugins.backgroundBtn.isVisible()
          ) {
            const text =
              plugins.length > 1
                ? this.textPluginsSuccessfullyInstalled
                : Common.Utils.String.format(this.textPluginSuccessfullyInstalled, plugins[0].name)
            if (this.backgroundPluginsTip?.isVisible()) {
              this.backgroundPluginsTip.close()
            }
            this.backgroundPluginsTip = new Common.UI.SynchronizeTip({
              extCls: "colored",
              placement: "bottom",
              target: this.viewPlugins.backgroundBtn.$el,
              text: text,
              showLink: true,
              textLink: plugins.length > 1 ? this.textRunInstalledPlugins : this.textRunPlugin,
            })
            this.backgroundPluginsTip.on(
              "dontshowclick",
              function () {
                this.backgroundPluginsTip.close()
                this.backgroundPluginsTip = undefined
                this.newInstalledBackgroundPlugins.forEach(
                  _.bind(function (item) {
                    this.api.asc_pluginRun(item.guid, 0, "")
                  }, this),
                )
                this.newInstalledBackgroundPlugins.length = 0
              },
              this,
            )
            this.backgroundPluginsTip.on(
              "closeclick",
              function () {
                this.closeBackPluginsTip()
              },
              this,
            )
            this.backgroundPluginsTip.show()
          }
        },

        onActiveTab: function (tab) {
          if (tab === "plugins") {
          } else {
            this.closeBackPluginsTip()
          }
        },

        closeBackPluginsTip: function () {
          if (this.backgroundPluginsTip) {
            this.backgroundPluginsTip.close()
            this.backgroundPluginsTip = undefined
            this.newInstalledBackgroundPlugins && (this.newInstalledBackgroundPlugins.length = 0)
          }
        },

        onPostLoadComplete: function () {
          if (this.pluginsWinToShow.length > 0) {
            const plg = this.pluginsWinToShow.shift()
            plg && this.onApiPluginWindowShow(plg.frameId, plg.variation)
          }
          this.startOnPostLoad && this.runAutoStartPlugins()
        },

        textRunPlugin: "Run plugin",
        textRunInstalledPlugins: "Run installed plugins",
        textPluginSuccessfullyInstalled:
          "<b>{0}</b> is successfully installed. You can access all background plugins here.",
        textPluginsSuccessfullyInstalled:
          "Plugins are successfully installed. You can access all background plugins here.",
      },
      Common.Controllers.Plugins || {},
    ),
  )
})
