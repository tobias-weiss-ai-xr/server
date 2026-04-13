/**
 *
 * (c) Copyright Ascensio System SIA 2021
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

;((a, t) => {
  function v(c) {
    a.Asc.plugin.ie_channel ? a.Asc.plugin.ie_channel.postMessage(c) : a.parent.postMessage(c, "*")
  }
  function r(c, d) {
    if (!c || ("object" !== typeof c && "array" !== typeof c)) return c
    d = d === t ? {} : d
    for (const g in c)
      c.hasOwnProperty(g) && (d[g] = c[g] && "object" === typeof c[g] ? r(c[g]) : c[g])
    return d
  }
  function p(c) {
    const d = a.location.search
    let g = `${c}=`
    c = d.indexOf(g)
    return 0 <= c
      ? ((c += g.length), (g = d.indexOf("&", c)), 0 > g && (g = d.length), d.substring(c, g))
      : t
  }
  function m() {
    const c = p("windowID")
    c &&
      ((a.Asc.plugin.windowID = c),
      a.Asc.plugin.guid || (a.Asc.plugin.guid = decodeURIComponent(p("guid"))))
    return t !== c ? !0 : !1
  }
  function q(c) {
    if (a.Asc?.plugin)
      if (a.plugin_onMessage) a.Asc.supportOrigins[c.origin] && a.plugin_onMessage(c)
      else if (a.Asc.plugin._initInternal && "string" === typeof c.data) {
        let d = {}
        try {
          d = JSON.parse(c.data)
        } catch (g) {
          d = {}
        }
        "plugin_init" === d.type &&
          ((a.Asc.supportOrigins[c.origin] = !0), a.Asc.plugin.ie_channel_check(c), eval(d.data))
      }
  }
  a.Asc = a.Asc || {}
  a.Asc.plugin = {}
  a.Asc.plugin.ie_channel = null
  a.Asc.plugin.ie_channel_check = function (c) {
    const d = navigator.userAgent.toLowerCase()
    ;(-1 < d.indexOf("msie") || -1 < d.indexOf("trident")) &&
      c.ports &&
      c.ports[0] &&
      (this.ie_channel = c.ports[0])
  }
  a.Asc.plugin.tr_init = !1
  a.Asc.plugin.tr = (c) => c
  a.Asc.scope = {}
  a.Asc.scope.prototype = {
    clear: () => {
      for (const c in a.Asc.scope) delete a.Asc.scope[c]
    },
  }
  a.onload = () => {
    if (a.Asc?.plugin) {
      const c = new XMLHttpRequest()
      c.open("get", "./config.json", !0)
      c.responseType = "json"
      c.onload = () => {
        if (a.Asc?.plugin) {
          if (404 === c.status) return c.onerror()
          if (200 === c.status || (0 === c.status && 4 === c.readyState)) {
            let d = c.response
            "string" === typeof d && (d = JSON.parse(d))
            r(d, a.Asc.plugin)
            d = { type: "initialize", guid: a.Asc.plugin.guid }
            m() && (d.windowID = a.Asc.plugin.windowID)
            const g = document.body
            g &&
              !0 !== a.Asc.plugin.enableDrops &&
              ((g.ondrop = (k) => {
                k?.preventDefault?.()
                return !1
              }),
              (g.ondragenter = (k) => {
                k?.preventDefault?.()
                return !1
              }),
              (g.ondragover = (k) => {
                k?.preventDefault?.()
                k?.dataTransfer && (k.dataTransfer.dropEffect = "none")
                return !1
              }))
            a.Asc.plugin._initInternal = !0
            a.parent.postMessage(JSON.stringify(d), "*")
          }
        }
      }
      c.onerror = () => {
        if (a.Asc?.plugin && m()) {
          const d = { type: "initialize", guid: a.Asc.plugin.guid }
          d.windowID = a.Asc.plugin.windowID
          a.Asc.plugin._initInternal = !0
          a.parent.postMessage(JSON.stringify(d), "*")
        }
      }
      c.send()
    }
  }
  a.Asc.supportOrigins = {}
  a.Asc.supportOrigins[a.origin] = !0
  a.addEventListener ? a.addEventListener("message", q, !1) : a.attachEvent("onmessage", q)
  a.Asc.plugin._attachCustomMenuClickEvent = function (c, d, g) {
    this[c] || (this[c] = {})
    this[c][d] = g
  }
  a.Asc.plugin._onCustomMenuClick = function (c, d) {
    let g = t
    const k = d.indexOf("_oo_sep_")
    ;-1 !== k && ((g = d.substring(k + 8)), (d = d.substring(0, k)))
    this[c]?.[d]?.call(this, g)
  }
  a.Asc.plugin.attachContextMenuClickEvent = function (c, d) {
    this._attachCustomMenuClickEvent("contextMenuEvents", c, d)
  }
  a.Asc.plugin.event_onContextMenuClick = function (c) {
    this._onCustomMenuClick("contextMenuEvents", c)
  }
  a.Asc.plugin.attachToolbarMenuClickEvent = function (c, d) {
    this._attachCustomMenuClickEvent("toolbarMenuEvents", c, d)
  }
  a.Asc.plugin.event_onToolbarMenuClick = function (c) {
    this._onCustomMenuClick("toolbarMenuEvents", c)
  }
  a.Asc.plugin.attachEvent = (c, d) => {
    const g = a.Asc.plugin
    g._events || (g._events = {})
    g._events[c] = d
  }
  a.Asc.plugin.detachEvent = (c) => {
    const d = a.Asc.plugin
    d._events?.[c] && delete d._events[c]
  }
  a.Asc.plugin.onEvent = (c, d) => {
    const g = a.Asc.plugin
    g._events?.[c]?.call(g, d)
  }
  a.Asc.plugin.attachEditorEvent = (c, d) => {
    a.Asc.plugin[`event_${c}`] = d.bind(a.Asc.plugin)
    v(JSON.stringify({ guid: a.Asc.plugin.guid, type: "attachEvent", name: c }))
  }
  a.Asc.plugin.detachEditorEvent = (c) => {
    a.Asc.plugin[`event_${c}`] && delete a.Asc.plugin[`event_${c}`]
    v(JSON.stringify({ guid: a.Asc.plugin.guid, type: "detachEvent", name: c }))
  }
  a.onunload = () => {
    a.addEventListener ? a.removeEventListener("message", q, !1) : a.detachEvent("onmessage", q)
  }
})(window, void 0)
;((a, t) => {
  function v() {
    function b() {
      return (65536 + e[h++]).toString(16).substring(1)
    }
    if (!a.crypto || !a.crypto.getRandomValues) {
      function f() {
        return Math.floor(65536 * (1 + Math.random()))
          .toString(16)
          .substring(1)
      }
      return `${f() + f()}-${f()}-${f()}-${f()}-${f()}${f()}${f()}`
    }
    const e = new Uint16Array(8)
    a.crypto.getRandomValues(e)
    let h = 0
    return `${b() + b()}-${b()}-${b()}-${b()}-${b()}${b()}${b()}`
  }
  function r(b) {
    return a.Asc.plugin.tr(b)
  }
  function p(b, e) {
    this.itemType = k.None
    this.editors = ["word", "cell", "slide"]
    this.id = e === t ? v() : e
    this.icons = null
    this.text = ""
    this.hint = null
    this.data = ""
    this.separator = !1
    this.lockInViewMode = !0
    this.removed = this.disabled = this.enableToggle = !1
    this.parent = b ? b : null
    this.childs = null
    this.parent && (this.parent.childs || (this.parent.childs = []), this.parent.childs.push(this))
  }
  function m(b, e) {
    p.call(this, b, e)
    this.itemType = k.ContextMenu
    this.showOnOptionsType = []
    d.Buttons.ButtonsContextMenu.push(this)
  }
  function q(b, e) {
    p.call(this, b, e)
    this.itemType = k.Toolbar
    this.type = g.BigButton
    this.tab = ""
    d.Buttons.ButtonsToolbar.push(this)
  }
  function c(b, e) {
    p.call(this, b, e)
    this.itemType = k.ContentControl
    this.checker = null
    0 === d.Buttons.ButtonsContentControl.length && d.Buttons.registerContentControl()
    d.Buttons.ButtonsContentControl.push(this)
  }
  a.Asc = a.Asc || {}
  const d = a.Asc
  d.Buttons = {}
  d.Buttons.ButtonsContextMenu = []
  d.Buttons.ButtonsToolbar = []
  d.Buttons.ButtonsContentControl = []
  d.Buttons.registerContextMenu = () => {
    a.Asc.plugin.attachEvent("onContextMenuShow", (b) => {
      if (b) {
        const e = { guid: a.Asc.plugin.guid }
        for (let h = 0, f = d.Buttons.ButtonsContextMenu.length; h < f; h++) {
          const l = d.Buttons.ButtonsContextMenu[h]
          if (null === l.parent) l.onContextMenuShow(b, e)
        }
        e.items && a.Asc.plugin.executeMethod("AddContextMenuItem", [e])
      }
    })
  }
  d.Buttons.registerToolbarMenu = () => {
    const b = { guid: a.Asc.plugin.guid, tabs: [] }
    for (let e = 0, h = d.Buttons.ButtonsToolbar.length; e < h; e++) {
      const f = d.Buttons.ButtonsToolbar[e]
      null === f.parent && f.toToolbar(b)
      if (f.menu)
        for (const l in f.menu) {
          const n = f.menu.hasOwnProperty(l) ? f.menu[l] : null
          n?.onclick && a.Asc.plugin.attachToolbarMenuClickEvent(n.id, n.onclick)
        }
    }
    0 < b.tabs.length && a.Asc.plugin.executeMethod("AddToolbarMenuItem", [b])
  }
  d.Buttons.updateToolbarMenu = (b, e, h) => {
    b = new d.ButtonToolbar(null, b)
    b.text = e
    e = { guid: a.Asc.plugin.guid, tabs: [] }
    b.childs = h
    for (let f = 0, l = h.length; f < l; f++) h[f].parent = b
    b.toToolbar(e)
    0 < e.tabs.length && a.Asc.plugin.executeMethod("UpdateToolbarMenuItem", [e])
  }
  d.Buttons.registerContentControl = () => {
    a.Asc.plugin.attachEditorEvent("onShowContentControlTrack", (e) => {
      const h = { guid: a.Asc.plugin.guid, items: {} }
      const f = []
      for (let l = 0, n = d.Buttons.ButtonsContentControl.length; l < n; ++l)
        f.push(d.Buttons.ButtonsContentControl[l].onShowTrack(e, h.items))
      Promise.all(f).then(() => {
        for (const l in h.items) {
          a.Asc.plugin.executeMethod("AddContentControlButtons", [h])
          break
        }
      })
    })
    a.Asc.plugin._attachContentControlButtonClickEvent = function (e, h) {
      this.ContentControlButtonEvents || (this.ContentControlButtonEvents = {})
      this.ContentControlButtonEvents[e] = h
    }
    const b = a.Asc.plugin
    a.Asc.plugin.attachEditorEvent("onContentControlButtonClick", (e) => {
      const h = e?.buttonId ? e.buttonId : null
      e = e?.contentControlId ? e.contentControlId : null
      h &&
        e &&
        b.ContentControlButtonEvents &&
        b.ContentControlButtonEvents[h] &&
        b.ContentControlButtonEvents[h].call(b, e)
    })
  }
  const g = { Button: "button", BigButton: "big-button" }
  const k = { None: 0, ContextMenu: 1, Toolbar: 2, ContentControl: 3 }
  p.prototype.toItem = function () {
    const b = { id: this.id, text: r(this.text) }
    null !== this.hint && (b.hint = r("" === this.hint ? this.hint : this.text))
    this.separator && (b.separator = !0)
    this.data && (b.data = this.data)
    this.lockInViewMode && (b.lockInViewMode = !0)
    this.enableToggle && (b.enableToggle = !0)
    b.disabled = this.disabled ? !0 : !1
    this.removed && (b.removed = !0)
    this.icons && (b.icons = this.icons)
    this.itemType === k.Toolbar && (b.type = this.type)
    this.menu &&
      (b.items = this.menu.map((e) => {
        e.text = r(e.text)
        return e
      }))
    this.split && (b.split = !0)
    return b
  }
  p.prototype.attachOnClick = (b) => {}
  p.prototype.onClick = function () {
    console.log(`BUTTON: ${this.text}`)
  }
  m.prototype = Object.create(p.prototype)
  m.prototype.constructor = m
  m.prototype.copy = function () {
    const b = new m(this.parent, this.id)
    b.editors = this.editors
    b.separator = this.separator
    b.lockInViewMode = this.lockInViewMode
    b.enableToggle = this.enableToggle
    b.disabled = this.disabled
    b.showOnOptionsType = this.showOnOptionsType.slice()
    return b
  }
  m.prototype.addCheckers = function () {
    const b = arguments.length
    this.showOnOptionsType = Array(b)
    for (let e = 0; e < b; e++) this.showOnOptionsType[e] = arguments[e]
  }
  m.prototype.attachOnClick = function (b) {
    a.Asc.plugin.attachContextMenuClickEvent(this.id, b)
  }
  m.prototype.onContextMenuShowAnalyze = (b, e) => !1
  m.prototype.onContextMenuShowExtendItem = (b, e) => {}
  m.prototype.onContextMenuShow = function (b, e) {
    if (!this.onContextMenuShowAnalyze(b, e)) {
      let h = !1
      for (let f = 0, l = this.editors.length; f < l; f++)
        if (d.plugin.info.editorType === this.editors[f]) {
          h = !0
          break
        }
      if (h)
        for (let f = 0, l = this.showOnOptionsType.length; f < l; f++)
          if (b.type === this.showOnOptionsType[f] || "All" === this.showOnOptionsType[f]) {
            e.items || (e.items = [])
            h = this.toItem()
            this.onContextMenuShowExtendItem(b, h)
            if (this.childs)
              for (let n = 0, x = this.childs.length; n < x; n++)
                this.childs[n].onContextMenuShow(b, h)
            e.items.push(h)
            break
          }
    }
  }
  q.prototype = Object.create(p.prototype)
  q.prototype.constructor = q
  q.prototype.attachOnClick = function (b) {
    a.Asc.plugin.attachToolbarMenuClickEvent(this.id, b)
  }
  q.prototype.toItem = function (b) {
    b = p.prototype.toItem.call(this)
    b.type = this.type
    return b
  }
  q.prototype.toToolbar = function (b) {
    if (null === this.parent) {
      const e = { id: this.id, text: r(this.text), items: [] }
      null !== this.hint && (e.hint = r("" === this.hint ? this.hint : this.text))
      b.tabs.push(e)
    } else (e = this.toItem()), b.items || (b.items = []), b.items.push(e)
    if (this.childs) for (let h = 0, f = this.childs.length; h < f; h++) this.childs[h].toToolbar(e)
  }
  c.prototype = Object.create(p.prototype)
  c.prototype.constructor = c
  c.prototype.attachOnClick = function (b) {
    a.Asc.plugin._attachContentControlButtonClickEvent(this.id, b)
  }
  c.prototype.addChecker = function (b) {
    b && "function" === typeof b && (this.checker = b)
  }
  c.prototype.onShowTrack = function (b, e) {
    const h = this.checker
    const f = []
    const l = this.toItem()
    for (let n = 0, x = b.length; n < x; ++n) {
      const w = b[n]
      f.push(
        new Promise((u) => {
          if (h) {
            const y = h(w)
            y instanceof Promise
              ? y.then((z) => {
                  u(z)
                })
              : u(!!y)
          } else u(!0)
        }).then((u) => {
          u && (e[w] || (e[w] = []), e[w].push(l))
        }),
      )
    }
    return Promise.all(f)
  }
  d.ToolbarButtonType = g
  d.ButtonContextMenu = m
  d.ButtonToolbar = q
  d.ButtonContentControl = c
})(window)
