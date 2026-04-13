ace.define(
  "ace/ext/code_lens",
  [
    "require",
    "exports",
    "module",
    "ace/line_widgets",
    "ace/lib/event",
    "ace/lib/lang",
    "ace/lib/dom",
    "ace/editor",
    "ace/config",
  ],
  (e, t, n) => {
    function u(e) {
      const t = e.$textLayer
      const n = t.$lenses
      n?.forEach((e) => {
        e.remove()
      }),
        (t.$lenses = null)
    }
    function a(e, t) {
      const n = e & t.CHANGE_LINES || e & t.CHANGE_FULL || e & t.CHANGE_SCROLL || e & t.CHANGE_TEXT
      if (!n) return
      const r = t.session
      const i = t.session.lineWidgets
      const s = t.$textLayer
      let a = s.$lenses
      if (!i) {
        a && u(t)
        return
      }
      const f = t.$textLayer.$lines.cells
      const l = t.layerConfig
      const c = t.$padding
      a || (a = s.$lenses = [])
      let h = 0
      for (let p = 0; p < f.length; p++) {
        const d = f[p].row
        const v = i[d]
        const m = v?.lenses
        if (!m || !m.length) continue
        let g = a[h]
        g || (g = a[h] = o.buildDom(["div", { class: "ace_codeLens" }], t.container)),
          (g.style.height = `${l.lineHeight}px`),
          h++
        for (let y = 0; y < m.length; y++) {
          let b = g.childNodes[2 * y]
          b ||
            (y !== 0 && g.appendChild(o.createTextNode("\u00a0|\u00a0")),
            (b = o.buildDom(["a"], g))),
            (b.textContent = m[y].title),
            (b.lensCommand = m[y])
        }
        while (g.childNodes.length > 2 * y - 1) g.lastChild.remove()
        const w =
          t.$cursorLayer.getPixelPosition({ row: d, column: 0 }, !0).top -
          l.lineHeight * v.rowsAbove -
          l.offset
        g.style.top = `${w}px`
        let E = t.gutterWidth
        let S = r.getLine(d).search(/\S|$/)
        S === -1 && (S = 0), (E += S * l.characterWidth), (g.style.paddingLeft = `${c + E}px`)
      }
      while (h < a.length) a.pop().remove()
    }
    function f(e) {
      if (!e.lineWidgets) return
      const t = e.widgetManager
      e.lineWidgets.forEach((e) => {
        e?.lenses && t.removeLineWidget(e)
      })
    }
    function l(e) {
      ;(e.codeLensProviders = []),
        e.renderer.on("afterRender", a),
        e.$codeLensClickHandler ||
          ((e.$codeLensClickHandler = (t) => {
            const n = t.target.lensCommand
            if (!n) return
            e.execCommand(n.id, n.arguments), e._emit("codeLensClick", t)
          }),
          i.addListener(e.container, "click", e.$codeLensClickHandler, e)),
        (e.$updateLenses = () => {
          function o() {
            const r = n.selection.cursor
            const i = n.documentToScreenRow(r)
            const o = n.getScrollTop()
            const u = t.setLenses(n, s)
            const a = n.$undoManager?.$lastDelta
            if (a && a.action === "remove" && a.lines.length > 1) return
            const f = n.documentToScreenRow(r)
            const l = e.renderer.layerConfig.lineHeight
            let c = n.getScrollTop() + (f - i) * l
            u === 0 && o < l / 4 && o > -l / 4 && (c = -l), n.setScrollTop(c)
          }
          const n = e.session
          if (!n) return
          n.widgetManager || ((n.widgetManager = new r(n)), n.widgetManager.attach(e))
          let i = e.codeLensProviders.length
          const s = []
          e.codeLensProviders.forEach((e) => {
            e.provideCodeLenses(n, (e, t) => {
              if (e) return
              t.forEach((e) => {
                s.push(e)
              }),
                i--,
                i === 0 && o()
            })
          })
        })
      const n = s.delayedCall(e.$updateLenses)
      ;(e.$updateLensesOnInput = () => {
        n.delay(250)
      }),
        e.on("input", e.$updateLensesOnInput)
    }
    function c(e) {
      e.off("input", e.$updateLensesOnInput),
        e.renderer.off("afterRender", a),
        e.$codeLensClickHandler && e.container.removeEventListener("click", e.$codeLensClickHandler)
    }
    const r = e("../line_widgets").LineWidgets
    const i = e("../lib/event")
    const s = e("../lib/lang")
    const o = e("../lib/dom")
    ;(t.setLenses = (e, t) => {
      let n = Number.MAX_VALUE
      return (
        f(e),
        t?.forEach((t) => {
          const r = t.start.row
          const i = t.start.column
          let s = e.lineWidgets?.[r]
          if (!s || !s.lenses)
            s = e.widgetManager.$registerLineWidget({
              rowCount: 1,
              rowsAbove: 1,
              row: r,
              column: i,
              lenses: [],
            })
          s.lenses.push(t.command), r < n && (n = r)
        }),
        e._emit("changeFold", { data: { start: { row: n } } }),
        n
      )
    }),
      (t.registerCodeLensProvider = (e, t) => {
        e.setOption("enableCodeLens", !0), e.codeLensProviders.push(t), e.$updateLensesOnInput()
      }),
      (t.clear = (e) => {
        t.setLenses(e, null)
      })
    const h = e("../editor").Editor
    e("../config").defineOptions(h.prototype, "editor", {
      enableCodeLens: {
        set: function (e) {
          e ? l(this) : c(this)
        },
      },
    }),
      o.importCssString(
        "\n.ace_codeLens {\n    position: absolute;\n    color: #aaa;\n    font-size: 88%;\n    background: inherit;\n    width: 100%;\n    display: flex;\n    align-items: flex-end;\n    pointer-events: none;\n}\n.ace_codeLens > a {\n    cursor: pointer;\n    pointer-events: auto;\n}\n.ace_codeLens > a:hover {\n    color: #0000ff;\n    text-decoration: underline;\n}\n.ace_dark > .ace_codeLens > a:hover {\n    color: #4e94ce;\n}\n",
        "codelense.css",
        !1,
      )
  },
)
;(() => {
  ace.require(["ace/ext/code_lens"], (m) => {
    if (typeof module === "object" && typeof exports === "object" && module) {
      module.exports = m
    }
  })
})()
