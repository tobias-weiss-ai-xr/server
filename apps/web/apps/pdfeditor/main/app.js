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
    sdk: "../../sdkjs/word/sdk-all-min",
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
   * Application instance with PDFE namespace defined
   */
  const app = new Backbone.Application({
    nameSpace: "PDFE",
    autoCreate: false,
    controllers: [
      "Viewport",
      "DocumentHolder",
      "Toolbar",
      "Statusbar",
      "RightMenu",
      "Navigation",
      "PageThumbnails",
      "LeftMenu",
      "Main",
      "ViewTab",
      "InsTab",
      "RedactTab",
      "Search",
      "Print",
      "FormsTab",
      "Common.Controllers.Fonts",
      "Common.Controllers.History",
      "Common.Controllers.Chat",
      "Common.Controllers.Comments",
      "Common.Controllers.Draw",
      "Common.Controllers.Plugins",
      "Common.Controllers.ExternalLinks",
      "Common.Controllers.ExternalDiagramEditor",
      // 'Common.Controllers.ExternalOleEditor',
      "Common.Controllers.Protection",
      "Common.Controllers.Shortcuts",
      "Common.Controllers.ReviewChanges",
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
      "pdfeditor/main/app/controller/Viewport",
      "pdfeditor/main/app/controller/DocumentHolder",
      "pdfeditor/main/app/controller/Toolbar",
      "pdfeditor/main/app/controller/Statusbar",
      "pdfeditor/main/app/controller/RightMenu",
      "pdfeditor/main/app/controller/Navigation",
      "pdfeditor/main/app/controller/PageThumbnails",
      "pdfeditor/main/app/controller/LeftMenu",
      "pdfeditor/main/app/controller/Main",
      "pdfeditor/main/app/controller/ViewTab",
      "pdfeditor/main/app/controller/InsTab",
      "pdfeditor/main/app/controller/RedactTab",
      "pdfeditor/main/app/controller/Search",
      "pdfeditor/main/app/controller/Print",
      "pdfeditor/main/app/controller/FormsTab",
      "pdfeditor/main/app/view/ChartSettings",
      "common/main/lib/util/utils",
      "common/main/lib/controller/History",
      "common/main/lib/controller/Fonts",
      "common/main/lib/controller/Comments",
      "common/main/lib/controller/Chat",
      /** coauthoring end **/
      "common/main/lib/controller/ExternalLinks",
      "common/main/lib/controller/Plugins",
      "common/main/lib/controller/ExternalDiagramEditor",
      // 'common/main/lib/controller/ExternalOleEditor',
      "common/main/lib/controller/Draw",
      "common/main/lib/controller/Protection",
      "common/main/lib/controller/Shortcuts",
      "common/main/lib/controller/ReviewChanges",
    ], () => {
      const code_path = !window.isIEBrowser ? "pdfeditor/main/code" : "pdfeditor/main/ie/code"
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
