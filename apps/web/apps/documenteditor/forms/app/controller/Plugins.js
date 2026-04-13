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
 * Date: 22.02.2022
 */

define(["core", "common/main/lib/collection/Plugins"], () => {
  DE.Controllers.Plugins = Backbone.Controller.extend(
    _.extend(
      {
        models: [],
        appOptions: {},
        configPlugins: { autostart: [] }, // {config: 'from editor config', plugins: 'loaded plugins', autostart: 'autostart guids'}
        serverPlugins: { autostart: [] }, // {config: 'from editor config', plugins: 'loaded plugins', autostart: 'autostart guids'}
        collections: ["Common.Collections.Plugins"],
        initialize: () => {},

        events: () => {},

        onLaunch: function () {
          this.autostart = []
          this.startOnPostLoad = false
          Common.Gateway.on("init", this.loadConfig.bind(this))
          Common.NotificationCenter.on("script:loaded", this.onPostLoadComplete.bind(this))
        },

        loadConfig: function (data) {
          this.configPlugins.config = data.config.plugins
          this.editor = "word"
        },

        loadPlugins: function () {
          if (this.configPlugins.config) {
            this.getPlugins(this.configPlugins.config.pluginsData)
              .then((loaded) => {
                this.configPlugins.plugins = loaded
                this.mergePlugins()
              })
              .catch((err) => {
                this.configPlugins.plugins = false
              })
            if (this.configPlugins.config.options)
              this.api.setPluginsOptions(this.configPlugins.config.options)
          } else this.configPlugins.plugins = false

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
        },

        setApi: function (api) {
          this.api = api

          if (!this.appOptions.customization || this.appOptions.customization.plugins !== false) {
            this.api.asc_registerCallback("asc_onPluginShow", _.bind(this.onPluginShow, this))
            this.api.asc_registerCallback("asc_onPluginClose", _.bind(this.onPluginClose, this))
            this.api.asc_registerCallback("asc_onPluginResize", _.bind(this.onPluginResize, this))
            this.api.asc_registerCallback("asc_onPluginsReset", _.bind(this.resetPluginsList, this))
            this.api.asc_registerCallback("asc_onPluginsInit", _.bind(this.onPluginsInit, this))

            this.loadPlugins()
          }
          return this
        },

        setMode: function (mode, api) {
          this.appOptions = mode
          this.api = api
          return this
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
          Common.Gateway.pluginsReady()
        },

        onPluginShow: function (plugin, variationIndex, frameId, urlAddition) {
          const variation = plugin.get_Variations()[variationIndex]
          if (variation.get_Visual()) {
            const lang = this.appOptions?.lang ? this.appOptions.lang.split(/[\-_]/)[0] : "en"
            let url = variation.get_Url()
            url = (plugin.get_BaseUrl().length === 0 ? url : plugin.get_BaseUrl()) + url
            if (urlAddition) url += urlAddition
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
              cls: isCustomWindow ? "plain" : "",
              header: !isCustomWindow,
              title: Common.Utils.String.htmlEncode(plugin.get_Name(lang)),
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
              modal: isModal !== undefined ? isModal : !variation.get_InsideMode(),
              resizable: !!variation.get_InsideMode(),
              minwidth: variation.get_InsideMode() ? 300 : undefined,
              minheight: variation.get_InsideMode() ? 300 : undefined,
              maxwidth: variation.get_InsideMode() ? Common.Utils.innerWidth() : undefined,
              maxheight: variation.get_InsideMode() ? Common.Utils.innerHeight() : undefined,
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
            })

            this.pluginDlg.show()
          }
        },

        onPluginClose: function (plugin) {
          if (this.pluginDlg) this.pluginDlg.close()
          this.runAutoStartPlugins()
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

        onPluginsInit: function (pluginsdata) {
          !Array.isArray(pluginsdata) && (pluginsdata = pluginsdata.pluginsData)
          this.parsePlugins(pluginsdata, true)
        },

        runAutoStartPlugins: function () {
          if (this.autostart && this.autostart.length > 0) {
            this.api.asc_pluginRun(this.autostart.shift(), 0, "")
          }
        },

        onPostLoadComplete: function () {
          this.startOnPostLoad && this.runAutoStartPlugins()
        },

        resetPluginsList: function () {
          this.getApplication().getCollection("Common.Collections.Plugins").reset()
        },

        parsePlugins: function (pluginsdata, forceUpdate) {
          const pluginStore = this.getApplication().getCollection("Common.Collections.Plugins")
          const isEdit = false
          const editor = this.editor
          const apiVersion = this.api ? this.api.GetVersion() : undefined
          if (Array.isArray(pluginsdata)) {
            let arr = []
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
              item.variations.forEach((itemVar) => {
                const isSystem =
                  true === itemVar.isSystem ||
                  Asc.PluginType.System === Asc.PluginType.getType(itemVar.type)
                const visible =
                  (isEdit || (itemVar.isViewer && itemVar.isDisplayedInViewer !== false)) &&
                  _.contains(itemVar.EditorsSupport, editor) &&
                  !isSystem
                if (visible) pluginVisible = true

                if (!item.isUICustomizer) {
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

                  model.set({
                    description: description,
                    index: variationsArr.length,
                    url: itemVar.url,
                    icons: itemVar.icons2 || itemVar.icons,
                    buttons: itemVar.buttons,
                    visible: visible,
                    help: itemVar.help,
                  })

                  variationsArr.push(model)
                }
              })

              if (variationsArr.length > 0 && !item.isUICustomizer) {
                let name = item.name
                if (typeof item.nameLocale === "object")
                  name = item.nameLocale[lang] || item.nameLocale.en || name || ""

                if (pluginVisible)
                  pluginVisible = this.checkPluginVersion(apiVersion, item.minVersion)

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
                }
                updatedItem ? updatedItem.set(props) : arr.push(new Common.Models.Plugin(props))
              }
            })

            if (pluginStore) {
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
            }
          } else {
            this.appOptions.canPlugins = false
          }

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
            this.parsePlugins(arr)
          }
        },
      },
      DE.Controllers.Plugins || {},
    ),
  )
})
