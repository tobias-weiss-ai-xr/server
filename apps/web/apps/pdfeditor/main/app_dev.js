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
      "Common.Controllers.ExternalLinks",
      "Common.Controllers.Plugins",
      "Common.Controllers.ExternalDiagramEditor",
      // ,'Common.Controllers.ExternalOleEditor'
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
      "pdfeditor/main/app/controller/Navigation",
      "pdfeditor/main/app/controller/PageThumbnails",
      "pdfeditor/main/app/controller/Statusbar",
      "pdfeditor/main/app/controller/RightMenu",
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
      "common/main/lib/controller/Fonts",
      "common/main/lib/controller/History",
      "common/main/lib/controller/Comments",
      "common/main/lib/controller/Chat",
      "common/main/lib/controller/Plugins",
      "common/main/lib/controller/ExternalDiagramEditor",
      "common/main/lib/controller/ExternalLinks",
      // ,'common/main/lib/controller/ExternalOleEditor'
      "common/main/lib/controller/Draw",
      "common/main/lib/controller/Protection",
      "common/main/lib/controller/Shortcuts",
      "common/main/lib/controller/ReviewChanges",
    ], () => {
      app.postLaunchScripts = [
        "common/main/lib/controller/ScreenReaderFocus",
        "common/main/lib/component/ComboBoxDataView",
        "common/main/lib/view/AdvancedSettingsWindow",
        "common/main/lib/view/AutoCorrectDialog",
        "common/main/lib/view/DocumentAccessDialog",
        "common/main/lib/view/SaveAsDlg",
        "common/main/lib/view/CopyWarningDialog",
        "common/main/lib/view/TextInputDialog",
        "common/main/lib/view/SelectFileDlg",
        "common/main/lib/view/SymbolTableDialog",
        "common/main/lib/view/InsertTableDialog",
        "common/main/lib/view/SearchDialog",
        "common/main/lib/view/RenameDialog",
        "common/main/lib/view/ExternalEditor",
        "common/main/lib/view/ExternalDiagramEditor",
        "common/main/lib/view/FormatSettingsDialog",
        "common/main/lib/view/PluginDlg",
        "common/main/lib/view/PluginPanel",
        "common/main/lib/view/ShapeShadowDialog",
        "common/main/lib/view/DocumentHolderExt",
        "common/main/lib/util/define",
        "common/main/lib/view/ListSettingsDialog",
        "common/main/lib/view/ExternalLinksDlg",
        "common/main/lib/view/CustomizeQuickAccessDialog",
        "common/main/lib/view/PasswordDialog",
        "common/main/lib/view/MacrosDialog",
        "common/main/lib/view/MacrosAiDialog",
        "common/main/lib/component/TextareaField",
        "common/main/lib/view/ShortcutsDialog",
        "common/main/lib/view/ShortcutsEditDialog",
        "common/main/lib/component/MonacoEditor",

        "pdfeditor/main/app/controller/DocumentHolderExt",
        "pdfeditor/main/app/view/FileMenuPanels",
        "pdfeditor/main/app/view/DocumentHolderExt",
        "pdfeditor/main/app/view/FormsTab",
        "pdfeditor/main/app/view/FormSettings",
        "pdfeditor/main/app/view/ParagraphSettingsAdvanced",
        "pdfeditor/main/app/view/ImageSettingsAdvanced",
        "pdfeditor/main/app/view/HyperlinkSettingsDialog",
        "pdfeditor/main/app/view/ShapeSettingsAdvanced",
        "pdfeditor/main/app/view/TableSettingsAdvanced",
        "pdfeditor/main/app/view/FormatSettingsDialog",
        "pdfeditor/main/app/view/ChartSettingsAdvanced",
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
