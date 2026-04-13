let reqerr
require.config({
  // The shim config allows us to configure dependencies for
  // scripts that do not call define() to register a module
  baseUrl: "../../",
  paths: {
    jquery: "../vendor/jquery/jquery",
    underscore: "../vendor/underscore/underscore",
    backbone: "../vendor/backbone/backbone",
    text: "../vendor/requirejs-text/text",
    perfectscrollbar: "common/main/lib/mods/perfect-scrollbar",
    jmousewheel: "../vendor/perfect-scrollbar/src/jquery.mousewheel",
    xregexp: "../vendor/xregexp/xregexp-all-min",
    socketio: "../vendor/socketio/socket.io.min",
    api: "api/documents/api",
    core: "common/main/lib/core/application",
    notification: "common/main/lib/core/NotificationCenter",
    keymaster: "common/main/lib/core/keymaster",
    tip: "common/main/lib/util/Tip",
    localstorage: "common/main/lib/util/LocalStorage",
    analytics: "common/Analytics",
    gateway: "common/Gateway",
    locale: "common/locale",
    irregularstack: "common/IrregularStack",
  },

  shim: {
    backbone: {
      deps: ["underscore", "jquery"],
      exports: "Backbone",
    },
    perfectscrollbar: {
      deps: ["jmousewheel"],
    },
    notification: {
      deps: ["backbone"],
    },
    core: {
      deps: ["backbone", "notification", "irregularstack"],
    },
    gateway: {
      deps: ["jquery"],
    },
    analytics: {
      deps: ["jquery"],
    },
  },
})

require(["backbone", "underscore", "core", "analytics", "gateway", "locale", "socketio"], (
  Backbone,
  _,
  Core,
) => {
  if (Backbone.History?.started) return
  Backbone.history.start()
  window._ = _

  /**
   * Application instance with VE namespace defined
   */
  const app = new Backbone.Application({
    nameSpace: "VE",
    autoCreate: false,
    controllers: [
      "Viewport",
      "DocumentHolder",
      "Toolbar",
      "Statusbar",
      "LeftMenu",
      "Main",
      "ViewTab",
      "Print",
      // 'Search',
      "Common.Controllers.Chat",
      "Common.Controllers.Plugins",
      "Common.Controllers.Shortcuts",
    ],
  })

  Common.Locale.apply(() => {
    require([
      "common/main/lib/mods/dropdown",
      "common/main/lib/mods/tooltip",
      "common/main/lib/util/LocalStorage",
      "common/main/lib/controller/Scaling",
      "common/main/lib/controller/Themes",
      "common/main/lib/controller/TabStyler",
      "common/main/lib/controller/Desktop",
      "visioeditor/main/app/controller/Viewport",
      "visioeditor/main/app/controller/DocumentHolder",
      "visioeditor/main/app/controller/Toolbar",
      "visioeditor/main/app/controller/Statusbar",
      "visioeditor/main/app/controller/LeftMenu",
      "visioeditor/main/app/controller/Main",
      "visioeditor/main/app/controller/ViewTab",
      "visioeditor/main/app/controller/Print",
      // 'visioeditor/main/app/controller/Search',
      "common/main/lib/util/utils",
      "common/main/lib/controller/Chat",
      "common/main/lib/controller/Plugins",
      "common/main/lib/controller/Shortcuts",
    ], () => {
      app.postLaunchScripts = [
        "common/main/lib/controller/ScreenReaderFocus",
        "common/main/lib/view/AdvancedSettingsWindow",
        "common/main/lib/view/DocumentAccessDialog",
        "common/main/lib/view/SaveAsDlg",
        "common/main/lib/view/CopyWarningDialog",
        "common/main/lib/view/TextInputDialog",
        "common/main/lib/view/SelectFileDlg",
        // 'common/main/lib/view/SearchDialog',
        "common/main/lib/view/RenameDialog",
        "common/main/lib/view/PluginDlg",
        "common/main/lib/view/PluginPanel",
        "common/main/lib/view/DocumentHolderExt",
        "common/main/lib/view/CustomizeQuickAccessDialog",
        // 'common/main/lib/view/ShortcutsDialog',
        // 'common/main/lib/view/ShortcutsEditDialog',

        "visioeditor/main/app/view/FileMenuPanels",
        "visioeditor/main/app/view/DocumentHolderExt",
      ]

      window.compareVersions = true
      app.start()
    })
  })
}, (err) => {
  if (err.requireType === "timeout" && !reqerr && window.requireTimeourError) {
    reqerr = window.requireTimeourError()
    window.alert(reqerr)
    window.location.reload()
  }
})
