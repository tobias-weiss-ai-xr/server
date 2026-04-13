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
    allfonts: "../../sdkjs/common/AllFonts",
    sdk: "../../sdkjs/cell/sdk-all-min",
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
    sdk: {
      deps: ["jquery", "allfonts", "xregexp", "socketio"],
    },
    gateway: {
      deps: ["jquery"],
    },
    analytics: {
      deps: ["jquery"],
    },
  },
})

require(["sdk", "backbone", "underscore", "core", "analytics", "gateway", "locale"], (
  Sdk,
  Backbone,
  _,
  Core,
) => {
  if (Backbone.History?.started) return
  Backbone.history.start()
  window._ = _

  /**
   * Application instance with SSE namespace defined
   */
  const app = new Backbone.Application({
    nameSpace: "SSE",
    autoCreate: false,
    controllers: [
      "Viewport",
      "DocumentHolder",
      "CellEditor",
      "FormulaDialog",
      "Print",
      "Toolbar",
      "Statusbar",
      "RightMenu",
      "LeftMenu",
      "Spellcheck",
      "Main",
      "PivotTable",
      "DataTab",
      "ViewTab",
      "TableDesignTab",
      "Search",
      "WBProtection",
      "Common.Controllers.Fonts",
      "Common.Controllers.History",
      "Common.Controllers.Chat",
      "Common.Controllers.Comments",
      "Common.Controllers.Draw",
      "Common.Controllers.ExternalLinks",
      "Common.Controllers.Plugins",
      "Common.Controllers.ExternalOleEditor",
      "Common.Controllers.ReviewChanges",
      "Common.Controllers.Protection",
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
      "spreadsheeteditor/main/app/controller/Viewport",
      "spreadsheeteditor/main/app/controller/DocumentHolder",
      "spreadsheeteditor/main/app/controller/CellEditor",
      "spreadsheeteditor/main/app/controller/Toolbar",
      "spreadsheeteditor/main/app/controller/Statusbar",
      "spreadsheeteditor/main/app/controller/RightMenu",
      "spreadsheeteditor/main/app/controller/LeftMenu",
      "spreadsheeteditor/main/app/controller/Spellcheck",
      "spreadsheeteditor/main/app/controller/Main",
      "spreadsheeteditor/main/app/controller/Print",
      "spreadsheeteditor/main/app/controller/PivotTable",
      "spreadsheeteditor/main/app/controller/DataTab",
      "spreadsheeteditor/main/app/controller/ViewTab",
      "spreadsheeteditor/main/app/controller/TableDesignTab",
      "spreadsheeteditor/main/app/controller/Search",
      "spreadsheeteditor/main/app/controller/WBProtection",
      // 'spreadsheeteditor/main/app/view/ParagraphSettings',
      // 'spreadsheeteditor/main/app/view/ImageSettings',
      // 'spreadsheeteditor/main/app/view/ChartSettings',
      // 'spreadsheeteditor/main/app/view/ShapeSettings',
      // 'spreadsheeteditor/main/app/view/TextArtSettings',
      // 'spreadsheeteditor/main/app/view/PivotSettings',
      // 'spreadsheeteditor/main/app/view/SignatureSettings',
      "common/main/lib/util/utils",
      "common/main/lib/controller/Fonts",
      "common/main/lib/controller/History",
      "common/main/lib/controller/Comments",
      "common/main/lib/controller/Chat",
      "common/main/lib/controller/ExternalLinks",
      "common/main/lib/controller/Plugins",
      "common/main/lib/controller/ExternalOleEditor",
      "common/main/lib/controller/ReviewChanges",
      "common/main/lib/controller/Protection",
      "common/main/lib/controller/Shortcuts",
      "common/main/lib/controller/Draw",
    ], () => {
      const code_path = !window.isIEBrowser
        ? "spreadsheeteditor/main/code"
        : "spreadsheeteditor/main/ie/code"
      app.postLaunchScripts = [code_path]

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
