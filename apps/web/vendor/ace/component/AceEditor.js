;((window, document) => {
  /*
   * config = {
   *   editorType: 'cell'/'slide'/'word'
   *   events: {
   *       onChangeValue // text in editor is changed
   *       onEditorReady // editor is ready for use
   *       onLoad // frame with editor is loaded
   *   }
   * }
   * */

  window.AceEditor = function (placeholderId, config) {
    const _config = config || {}
    const parentEl = document.getElementById(placeholderId)
    let iframe

    const _setValue = (value, currentPos, readonly) => {
      _postMessage(iframe.contentWindow, {
        command: "setValue",
        referer: "ace-editor",
        data: {
          value: value,
          readonly: readonly,
          currentPos: currentPos,
        },
      })
    }

    const _updateTheme = (type, colors) => {
      _postMessage(iframe.contentWindow, {
        command: "setTheme",
        referer: "ace-editor",
        data: {
          type: type,
          colors: colors,
        },
      })
    }

    const _disableDrop = (disable) => {
      _postMessage(iframe.contentWindow, {
        command: "disableDrop",
        referer: "ace-editor",
        data: disable,
      })
    }

    const _destroyEditor = () => {
      if (iframe) {
        _msgDispatcher?.unbindEvents()
        iframe.parentNode?.removeChild(iframe)
      }
    }

    const _onMessage = (msg) => {
      let data = msg.data
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
        const events = _config.events || {}
        let handler
        data = {}
        switch (cmd.command) {
          case "changeValue":
            handler = events.onChangeValue
            data = cmd.data
            break
          case "aceEditorReady":
            handler = events.onEditorReady
            data = cmd.data
            break
        }
        if (handler && typeof handler === "function") {
          res = handler.call(this, { target: this, data: data })
        }
      }
    }

    const _onLoad = () => {
      const handler = _config.events?.onLoad
      if (handler && typeof handler === "function") {
        res = handler.call(this)
      }
    }

    if (parentEl) {
      iframe = createIframe(_config)
      iframe.onload = _onLoad
      const _msgDispatcher = new MessageDispatcher(_onMessage, this)
      parentEl.appendChild(iframe)
    }

    return {
      setValue: _setValue, // string // set text to editor
      disableDrop: _disableDrop, // true/false // disable/enable drop elements to editor
      destroyEditor: _destroyEditor,
      updateTheme: _updateTheme, // type: 'dark'/'light',
      // colors: {'text-normal': '', 'icon-normal': '', 'background-normal': '', 'background-toolbar': '', 'highlight-button-hover': '',
      // 'canvas-background': '', 'border-divider': '', 'canvas-scroll-thumb-pressed': '', 'canvas-scroll-thumb': ''}
    }
  }

  function getBasePath() {
    const scripts = document.getElementsByTagName("script")
    let match

    for (let i = scripts.length - 1; i >= 0; i--) {
      match = scripts[i].src.match(/(.*)AceEditor.js/i)
      if (match) {
        return match[1]
      }
    }

    return ""
  }

  function createIframe(config) {
    iframe = document.createElement("iframe")
    iframe.width = "100%"
    iframe.height = "100%"
    iframe.align = "top"
    iframe.frameBorder = 0
    iframe.scrolling = "no"
    iframe.src = `${getBasePath()}AceEditor.html${config.editorType ? `?editorType=${config.editorType}` : ""}`

    return iframe
  }

  function _postMessage(wnd, msg) {
    if (wnd?.postMessage && window.JSON) {
      wnd.postMessage(window.JSON.stringify(msg), "*")
    }
  }

  MessageDispatcher = function (fn, scope) {
    const _fn = fn
    const _scope = scope || window
    const eventFn = (msg) => {
      _fn.call(_scope, msg)
    }

    const _bindEvents = () => {
      if (window.addEventListener) {
        window.addEventListener("message", eventFn, false)
      } else if (window.attachEvent) {
        window.attachEvent("onmessage", eventFn)
      }
    }

    const _unbindEvents = () => {
      if (window.removeEventListener) {
        window.removeEventListener("message", eventFn, false)
      } else if (window.detachEvent) {
        window.detachEvent("onmessage", eventFn)
      }
    }

    _bindEvents.call(this)

    return {
      unbindEvents: _unbindEvents,
    }
  }
})(window, document)
