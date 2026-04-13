ace.define("ace/ext/static-css", ["require", "exports", "module"], (e, t, n) => {
  n.exports =
    ".ace_static_highlight {\n    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'Source Code Pro', 'source-code-pro', 'Droid Sans Mono', monospace;\n    font-size: 12px;\n    white-space: pre-wrap\n}\n\n.ace_static_highlight .ace_gutter {\n    width: 2em;\n    text-align: right;\n    padding: 0 3px 0 0;\n    margin-right: 3px;\n    contain: none;\n}\n\n.ace_static_highlight.ace_show_gutter .ace_line {\n    padding-left: 2.6em;\n}\n\n.ace_static_highlight .ace_line { position: relative; }\n\n.ace_static_highlight .ace_gutter-cell {\n    -moz-user-select: -moz-none;\n    -khtml-user-select: none;\n    -webkit-user-select: none;\n    user-select: none;\n    top: 0;\n    bottom: 0;\n    left: 0;\n    position: absolute;\n}\n\n\n.ace_static_highlight .ace_gutter-cell:before {\n    content: counter(ace_line, decimal);\n    counter-increment: ace_line;\n}\n.ace_static_highlight {\n    counter-reset: ace_line;\n}\n"
}),
  ace.define(
    "ace/ext/static_highlight",
    [
      "require",
      "exports",
      "module",
      "ace/edit_session",
      "ace/layer/text",
      "ace/ext/static-css",
      "ace/config",
      "ace/lib/dom",
      "ace/lib/lang",
    ],
    (e, t, n) => {
      const r = e("../edit_session").EditSession
      const i = e("../layer/text").Text
      const s = e("./static-css")
      const o = e("../config")
      const u = e("../lib/dom")
      const a = e("../lib/lang").escapeHTML
      const f = (() => {
        function e(e) {
          this.className, (this.type = e), (this.style = {}), (this.textContent = "")
        }
        return (
          (e.prototype.cloneNode = function () {
            return this
          }),
          (e.prototype.appendChild = function (e) {
            this.textContent += e.toString()
          }),
          (e.prototype.toString = function () {
            const e = []
            if (this.type !== "fragment") {
              e.push("<", this.type), this.className && e.push(" class='", this.className, "'")
              const t = []
              for (const n in this.style) t.push(n, ":", this.style[n])
              t.length && e.push(" style='", t.join(""), "'"), e.push(">")
            }
            return (
              this.textContent && e.push(this.textContent),
              this.type !== "fragment" && e.push("</", this.type, ">"),
              e.join("")
            )
          }),
          e
        )
      })()
      const l = {
        createTextNode: (e, t) => a(e),
        createElement: (e) => new f(e),
        createFragment: () => new f("fragment"),
      }
      const c = function () {
        ;(this.config = {}), (this.dom = l)
      }
      c.prototype = i.prototype
      const h = (e, t, n) => {
        const r = e.className.match(/lang-(\w+)/)
        const i = t.mode || (r && `ace/mode/${r[1]}`)
        if (!i) return !1
        const s = t.theme || "ace/theme/textmate"
        let o = ""
        const a = []
        if (e.firstElementChild) {
          let f = 0
          for (let l = 0; l < e.childNodes.length; l++) {
            const c = e.childNodes[l]
            c.nodeType === 3 ? ((f += c.data.length), (o += c.data)) : a.push(f, c)
          }
        } else (o = e.textContent), t.trim && (o = o.trim())
        h.render(o, i, s, t.firstLineNumber, !t.showGutter, (t) => {
          u.importCssString(t.css, "ace_highlight", !0), (e.innerHTML = t.html)
          const r = e.firstChild.firstChild
          for (let i = 0; i < a.length; i += 2) {
            const s = t.session.doc.indexToPosition(a[i])
            const o = a[i + 1]
            const f = r.children[s.row]
            f?.appendChild(o)
          }
          n?.()
        })
      }
      ;(h.render = (e, t, n, i, s, u) => {
        function c() {
          const r = h.renderSync(e, t, n, i, s)
          return u ? u(r) : r
        }
        let a = 1
        const f = r.prototype.$modes
        typeof n === "string" &&
          (a++,
          o.loadModule(["theme", n], (e) => {
            ;(n = e), --a || c()
          }))
        let l
        return (
          t && typeof t === "object" && !t.getTokenizer && ((l = t), (t = l.path)),
          typeof t === "string" &&
            (a++,
            o.loadModule(["mode", t], (e) => {
              if (!f[t] || l) f[t] = new e.Mode(l)
              ;(t = f[t]), --a || c()
            })),
          --a || c()
        )
      }),
        (h.renderSync = (e, t, n, i, o) => {
          i = Number.parseInt(i || 1, 10)
          const u = new r("")
          u.setUseWorker(!1), u.setMode(t)
          const a = new c()
          a.setSession(u),
            Object.keys(a.$tabStrings).forEach((e) => {
              if (typeof a.$tabStrings[e] === "string") {
                const t = l.createFragment()
                ;(t.textContent = a.$tabStrings[e]), (a.$tabStrings[e] = t)
              }
            }),
            u.setValue(e)
          const f = u.getLength()
          const h = l.createElement("div")
          h.className = n.cssClass
          const p = l.createElement("div")
          ;(p.className = `ace_static_highlight${o ? "" : " ace_show_gutter"}`),
            (p.style["counter-reset"] = `ace_line ${i - 1}`)
          for (let d = 0; d < f; d++) {
            const v = l.createElement("div")
            v.className = "ace_line"
            if (!o) {
              const m = l.createElement("span")
              ;(m.className = "ace_gutter ace_gutter-cell"), (m.textContent = ""), v.appendChild(m)
            }
            a.$renderLine(v, d, !1), (v.textContent += "\n"), p.appendChild(v)
          }
          return h.appendChild(p), { css: s + n.cssText, html: h.toString(), session: u }
        }),
        (n.exports = h),
        (n.exports.highlight = h)
    },
  )
;(() => {
  ace.require(["ace/ext/static_highlight"], (m) => {
    if (typeof module === "object" && typeof exports === "object" && module) {
      module.exports = m
    }
  })
})()
