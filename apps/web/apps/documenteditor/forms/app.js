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
      deps: ["jquery", "underscore", "allfonts", "xregexp", "socketio"],
    },
    gateway: {
      deps: ["jquery"],
    },
    analytics: {
      deps: ["jquery"],
    },
  },
})

require(["sdk", "backbone", "underscore", "core", "api", "analytics", "gateway", "locale"], (
  Sdk,
  Backbone,
  _,
  Core,
) => {
  if (Backbone.History?.started) return
  Backbone.history.start()
  window._ = _

  /**
   * Application instance with DE namespace defined
   */
  const app = new Backbone.Application({
    nameSpace: "DE",
    autoCreate: false,
    controllers: [
      "ApplicationController",
      "Plugins",
      "SearchBar",
      "Common.Controllers.Fonts",
      "Common.Controllers.Shortcuts",
    ],
    features: {
      uitype: "fillform",
    },
  })

  Common.Locale.apply(() => {
    require([
      "common/main/lib/mods/dropdown",
      "common/main/lib/mods/tooltip",
      "documenteditor/forms/app/controller/ApplicationController",
      "documenteditor/forms/app/controller/Plugins",
      "documenteditor/forms/app/controller/SearchBar",
      "documenteditor/forms/app/view/ApplicationView",
      "common/main/lib/util/utils",
      "common/main/lib/controller/Fonts",
      "common/main/lib/util/LocalStorage",
      "common/main/lib/controller/Scaling",
      "common/main/lib/controller/Themes",
      "common/main/lib/controller/Desktop",
      "common/main/lib/component/ComboBoxFonts",
      "common/main/lib/component/ColorButton",
      "common/main/lib/component/TextareaField",
      "common/main/lib/view/SearchBar",
      "common/main/lib/controller/Shortcuts",
      "common/forms/lib/view/modals",
    ], () => {
      const code_path = !window.isIEBrowser
        ? "documenteditor/forms/code"
        : "documenteditor/forms/ie/code"
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
