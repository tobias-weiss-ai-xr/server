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
window.initCounter = 0

function on_init_server(type) {
  if (type === (window.initCounter & type)) return
  window.initCounter |= type
  if (window.initCounter === 3) {
    load_library("Word Office", `../libs/${window.editorType}/api.js`)
    _postMessage({
      command: "aceEditorReady",
      referer: "ace-editor",
    })
  }
}

function load_library(name, url) {
  const xhr = new XMLHttpRequest()
  xhr.open("GET", url, true)
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      const EditSession = ace.require("ace/edit_session").EditSession
      const editDoc = new EditSession(xhr.responseText, "ace/mode/javascript")
      editor.ternServer.addDoc(name, editDoc)
    }
  }
  xhr.send()
}

const editor = ace.edit("editor")
editor.session.setMode("ace/mode/javascript")
editor.container.style.lineHeight = "20px"
editor.setValue("")

editor.getSession().setUseWrapMode(true)
editor.getSession().setWrapLimitRange(null, null)
editor.setShowPrintMargin(false)
editor.$blockScrolling = Number.POSITIVE_INFINITY

ace.config.loadModule("ace/ext/tern", () => {
  editor.setOptions({
    enableTern: {
      defs: ["browser", "ecma5"],
      plugins: { doc_comment: { fullDocs: true } },
      useWorker: !!window.Worker,
      switchToDoc: (name, start) => {},
      startedCb: () => {
        on_init_server(1)
      },
    },
    enableSnippets: false,
    // tooltipContainer: '#code-editor'
  })
})

const firstLineNumber = 1
if (!window.isIE) {
  ace.config.loadModule("ace/ext/language_tools", () => {
    editor.setOptions({
      enableBasicAutocompletion: false,
      enableLiveAutocompletion: true,
      firstLineNumber: firstLineNumber,
    })
  })
}

ace.config.loadModule("ace/ext/html_beautify", (beautify) => {
  editor.setOptions({
    autoBeautify: true,
    htmlBeautify: true,
  })
  window.beautifyOptions = beautify.options
})

const _postMessage = (msg) => {
  window.parent && window.JSON && window.parent.postMessage(window.JSON.stringify(msg), "*")
}
;((window, undefined) => {
  let _dropDisabled = undefined

  editor.getSession().on("change", () => {
    if (window.isDisable) return
    _postMessage({
      command: "changeValue",
      data: { value: editor.getValue(), pos: editor.getCursorPosition() },
      referer: "ace-editor",
    })
  })

  on_init_server(2)

  const editorSetValue = (data) => {
    window.isDisable = true
    editor.setValue(data.value || "")
    editor.setReadOnly(!!data.readonly)
    if (!data.readonly) {
      editor.focus()
      editor.selection.clearSelection()
      editor.moveCursorToPosition(data.currentPos ? data.currentPos : { row: 0, column: 0 })
      editor.scrollToLine((data.currentPos ? data.currentPos.row : 0) + firstLineNumber, true)
    }
    window.isDisable = false
  }

  const editorDisableDrop = (disable) => {
    if (_dropDisabled === undefined) {
      const el = document.getElementById("editor")
      el.ondrop = (e) => {
        if (!_dropDisabled) return
        if (e?.preventDefault) e.preventDefault()
        return false
      }
      el.ondragenter = (e) => {
        if (!_dropDisabled) return
        if (e?.preventDefault) e.preventDefault()
        return false
      }
      el.ondragover = (e) => {
        if (!_dropDisabled) return
        if (e?.preventDefault) e.preventDefault()
        if (e?.dataTransfer) e.dataTransfer.dropEffect = "none"
        return false
      }
    }
    _dropDisabled = disable
  }

  const fillDefaultColors = (colors) => {
    if (colors.type === "dark") {
      const defColors = {
        "text-normal": "rgba(255, 255, 255, 0.8)",
        "icon-normal": "rgba(255, 255, 255, 0.8)",
        "background-normal": "#333",
        "background-toolbar": "#404040",
        "highlight-button-hover": "#555",
        "canvas-background": "#555",
        "border-divider": "#505050",
        "canvas-scroll-thumb-pressed": "#adadad",
        "canvas-scroll-thumb": "#404040",
      }
      let hasOwnProps = false
      for (const color in defColors) {
        if (colors.hasOwnProperty(color)) {
          hasOwnProps = true
          break
        }
      }
      if (!hasOwnProps) {
        for (const color in defColors) {
          colors[color] = defColors[color]
        }
      }
    }
  }

  const onThemeChanged = (colors) => {
    if (!colors) return

    const styles = document.querySelectorAll("style")
    let i = 0
    if (styles) {
      while (i < styles.length) {
        if (styles[i].id === "ace-chrome" || styles[i].id === "ace-custom-theme") {
          styles[i].parentNode.removeChild(styles[i])
        }
        i++
      }
    }

    fillDefaultColors(colors)

    let _css = ""
    if (colors["text-normal"])
      _css += `.ace_content, .ace_layer.ace_gutter-layer.ace_folding-enabled, .ace_cursor, .Ace-Tern-tooltip, .Ace-Tern-jsdoc-param-description { color: ${colors["text-normal"]} !important; }`

    if (colors["icon-normal"])
      _css += `.Ace-Tern-tooltip .Ace-Tern-tooltip-boxclose { color: ${colors["icon-normal"]} !important; }`

    if (colors["background-normal"]) {
      _css += `.ace_editor, .ace_content, .ace_gutter, .gutter_bg { background: ${colors["background-normal"]} !important; }`
      _css += `.ace_active-line, .ace_gutter-active-line, .ace_gutter-active-line-bg { background-color: ${colors["background-normal"]} !important; }`
    }

    if (colors["background-toolbar"])
      _css += `.Ace-Tern-tooltip, .Ace-Tern-jsdoc-param-description { background-color: ${colors["background-toolbar"]} !important; }`

    if (colors["highlight-button-hover"])
      _css += `.ace_line-hover, .ace_autocomplete .ace_active-line { background-color: ${colors["highlight-button-hover"]} !important; }`

    if (colors["canvas-background"])
      _css += `.ace_active-line, .ace_gutter-active-line, .ace_gutter-active-line-bg { border-color: ${colors["canvas-background"]} !important; }`

    if (colors["border-divider"])
      _css += `.Ace-Tern-tooltip { border-color: ${colors["border-divider"]} !important; }`

    if (colors["canvas-scroll-thumb-pressed"] && colors["canvas-scroll-thumb"])
      _css += `.ace_autocomplete { scrollbar-color: ${colors["canvas-scroll-thumb-pressed"]} ${colors["canvas-scroll-thumb"]} !important; }`

    if (_css) {
      const style = document.createElement("style")
      style.id = "ace-custom-theme"
      style.type = "text/css"
      style.innerHTML = _css
      document.getElementsByTagName("head")[0].appendChild(style)
    }

    if (colors.type === "dark") editor.setTheme("ace/theme/vs-dark")
    else editor.setTheme("ace/theme/vs-light")
  }

  const _onMessage = (msg) => {
    const data = msg.data
    if (Object.prototype.toString.apply(data) !== "[object String]" || !window.JSON) {
      return
    }
    let cmd
    let handler

    try {
      cmd = window.JSON.parse(data)
    } catch (e) {
      cmd = ""
    }

    if (cmd && cmd.referer === "ace-editor") {
      if (cmd.command === "setValue") {
        editorSetValue(cmd.data)
      } else if (cmd.command === "setTheme") {
        onThemeChanged(cmd.data)
      } else if (cmd.command === "disableDrop") {
        editorDisableDrop(cmd.data)
      }
    }
  }

  const fn = (e) => {
    _onMessage(e)
  }
  if (window.attachEvent) {
    window.attachEvent("onmessage", fn)
  } else {
    window.addEventListener("message", fn, false)
  }
})(window, undefined)
