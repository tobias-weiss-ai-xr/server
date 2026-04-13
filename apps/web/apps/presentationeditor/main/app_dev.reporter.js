let reqerr
require.config({
  // The shim config allows us to configure dependencies for
  // scripts that do not call define() to register a module
  baseUrl: "../../",
  paths: {
    jquery: "../vendor/jquery/jquery",
    underscore: "../vendor/underscore/underscore",
    xregexp: "../vendor/xregexp/xregexp-all-min",
    socketio: "../vendor/socketio/socket.io.min",
    allfonts: "../../sdkjs/common/AllFonts",
  },
  shim: {
    sdk: {
      deps: ["jquery", "underscore", "allfonts", "xregexp", "socketio"],
    },
  },
})

require(["underscore", "socketio", "xregexp"], (_) => {
  window._ = _

  const _msg_func = (msg) => {
    const data = msg.data
    let cmd

    try {
      cmd = window.JSON.parse(data)
    } catch (e) {}

    if (cmd) {
      if (cmd.type === "file:open") {
        load_document(cmd.data)
      }
    }
  }

  if (window.attachEvent) window.attachEvent("onmessage", _msg_func)
  else window.addEventListener("message", _msg_func, false)

  let lang = /(?:&|^)lang=([^&]+)&?/i.exec(window.location.search.substring(1))
  lang = lang?.[1] ? lang[1].split(/[\-\_]/)[0].toLowerCase() : ""

  const api = new Asc.asc_docs_api({
    "id-view": "editor_sdk",
    using: "reporter",
    skin: localStorage.getItem("ui-theme-id"),
    isRtlInterface: lang && (lang.lastIndexOf("ar", 0) === 0 || lang.lastIndexOf("he", 0) === 0),
  })

  const setDocumentTitle = (title) => {
    title && (window.document.title += ` - ${title}`)
  }

  function load_document(data) {
    let docInfo = {}

    if (data) {
      docInfo = new Asc.asc_CDocInfo()
      docInfo.put_Id(data.key)
      docInfo.put_Url(data.url)
      docInfo.put_DirectUrl(data.directUrl)
      docInfo.put_Title(data.title)
      docInfo.put_Format(data.fileType)
      docInfo.put_VKey(data.vkey)
      docInfo.put_Options(data.options)
      docInfo.put_Token(data.token)
      docInfo.put_Permissions(data.permissions || {})
      setDocumentTitle(data.title)
    }

    api.preloadReporter(data)
    api.SetThemesPath("../../../../sdkjs/slide/themes/")
    api.asc_setDocInfo(docInfo)
    api.asc_getEditorPermissions()
    api.asc_setViewMode(true)
  }

  const onDocumentContentReady = () => {
    api.SetDrawingFreeze(false)
    $("#loading-mask").hide().remove()
  }

  const onOpenDocument = (progress) => {
    const proc =
      (progress.asc_getCurrentFont() + progress.asc_getCurrentImage()) /
      (progress.asc_getFontsCount() + progress.asc_getImagesCount())
    console.log(`progress: ${proc}`)
  }

  const onEditorPermissions = (params) => {
    api.asc_LoadDocument()
  }

  api.asc_registerCallback("asc_onDocumentContentReady", onDocumentContentReady)
  // api.asc_registerCallback('asc_onOpenDocumentProgress', onOpenDocument);
  api.asc_registerCallback("asc_onGetEditorPermissions", onEditorPermissions)

  window.postMessage("i:am:ready", "*")
}, (err) => {
  if (err.requireType === "timeout" && !reqerr && window.requireTimeourError) {
    reqerr = window.requireTimeourError()
    window.alert(reqerr)
    window.location.reload()
  }
})
