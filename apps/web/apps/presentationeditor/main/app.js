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
    sdk: "../../sdkjs/slide/sdk-all-min",
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
   * Application instance with PE namespace defined
   */
  const app = new Backbone.Application({
    nameSpace: "PE",
    autoCreate: false,
    controllers: [
      "Viewport",
      "DocumentHolder",
      "Toolbar",
      "Statusbar",
      "RightMenu",
      "LeftMenu",
      "Main",
      "ViewTab",
      "SlideMasterTab",
      "Search",
      "Print",
      "Common.Controllers.Fonts",
      "Common.Controllers.History",
      /** coauthoring begin **/
      "Common.Controllers.Chat",
      "Common.Controllers.Comments",
      "Common.Controllers.Draw",
      /** coauthoring end **/
      "Common.Controllers.ExternalLinks",
      "Common.Controllers.Plugins",
      "Common.Controllers.ExternalDiagramEditor",
      "Common.Controllers.ExternalOleEditor",
      "Common.Controllers.ReviewChanges",
      "Common.Controllers.Protection",
      "Common.Controllers.Shortcuts",
      "Transitions",
      "Animation",
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
      "presentationeditor/main/app/controller/Viewport",
      "presentationeditor/main/app/controller/DocumentHolder",
      "presentationeditor/main/app/controller/Toolbar",
      "presentationeditor/main/app/controller/Statusbar",
      "presentationeditor/main/app/controller/RightMenu",
      "presentationeditor/main/app/controller/LeftMenu",
      "presentationeditor/main/app/controller/Main",
      "presentationeditor/main/app/controller/ViewTab",
      "presentationeditor/main/app/controller/SlideMasterTab",
      "presentationeditor/main/app/controller/Search",
      "presentationeditor/main/app/controller/Print",
      // 'presentationeditor/main/app/view/ParagraphSettings',
      // 'presentationeditor/main/app/view/ImageSettings',
      // 'presentationeditor/main/app/view/ShapeSettings',
      // 'presentationeditor/main/app/view/SlideSettings',
      // 'presentationeditor/main/app/view/TableSettings',
      // 'presentationeditor/main/app/view/TextArtSettings',
      // 'presentationeditor/main/app/view/SignatureSettings',
      "common/main/lib/util/utils",
      "common/main/lib/controller/Fonts",
      "common/main/lib/controller/History",
      /** coauthoring begin **/
      "common/main/lib/controller/Comments",
      "common/main/lib/controller/Chat",
      /** coauthoring end **/
      "common/main/lib/controller/ExternalLinks",
      "common/main/lib/controller/Plugins",
      "presentationeditor/main/app/view/ChartSettings",
      "common/main/lib/controller/ExternalDiagramEditor",
      "common/main/lib/controller/ExternalOleEditor",
      "common/main/lib/controller/ReviewChanges",
      "common/main/lib/controller/Protection",
      "common/main/lib/controller/Shortcuts",
      "common/main/lib/controller/Draw",
      "presentationeditor/main/app/controller/Transitions",
      "presentationeditor/main/app/controller/Animation",
    ], () => {
      const code_path = !window.isIEBrowser
        ? "presentationeditor/main/code"
        : "presentationeditor/main/ie/code"
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
