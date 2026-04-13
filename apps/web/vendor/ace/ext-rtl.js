ace.define(
  "ace/ext/rtl",
  ["require", "exports", "module", "ace/editor", "ace/config"],
  (e, t, n) => {
    function s(e, t) {
      const n = t.getSelection().lead
      t.session.$bidiHandler.isRtlLine(n.row) &&
        n.column === 0 &&
        (t.session.$bidiHandler.isMoveLeftOperation && n.row > 0
          ? t.getSelection().moveCursorTo(n.row - 1, t.session.getLine(n.row - 1).length)
          : t.getSelection().isEmpty()
            ? (n.column += 1)
            : n.setPosition(n.row, n.column + 1))
    }
    function o(e) {
      e.editor.session.$bidiHandler.isMoveLeftOperation =
        /gotoleft|selectleft|backspace|removewordleft/.test(e.command.name)
    }
    function u(e, t) {
      const n = t.session
      n.$bidiHandler.currentRow = null
      if (n.$bidiHandler.isRtlLine(e.start.row) && e.action === "insert" && e.lines.length > 1)
        for (let r = e.start.row; r < e.end.row; r++)
          n.getLine(r + 1).charAt(0) !== n.$bidiHandler.RLE &&
            (n.doc.$lines[r + 1] = n.$bidiHandler.RLE + n.getLine(r + 1))
    }
    function a(e, t) {
      const n = t.session
      const r = n.$bidiHandler
      const i = t.$textLayer.$lines.cells
      const s = `${t.layerConfig.width - t.layerConfig.padding}px`
      i.forEach((e) => {
        const t = e.element.style
        r?.isRtlLine(e.row)
          ? ((t.direction = "rtl"), (t.textAlign = "right"), (t.width = s))
          : ((t.direction = ""), (t.textAlign = ""), (t.width = ""))
      })
    }
    function f(e) {
      function n(e) {
        const t = e.element.style
        t.direction = t.textAlign = t.width = ""
      }
      const t = e.$textLayer.$lines
      t.cells.forEach(n), t.cellCache.forEach(n)
    }
    const r = [
      {
        name: "leftToRight",
        bindKey: { win: "Ctrl-Alt-Shift-L", mac: "Command-Alt-Shift-L" },
        exec: (e) => {
          e.session.$bidiHandler.setRtlDirection(e, !1)
        },
        readOnly: !0,
      },
      {
        name: "rightToLeft",
        bindKey: { win: "Ctrl-Alt-Shift-R", mac: "Command-Alt-Shift-R" },
        exec: (e) => {
          e.session.$bidiHandler.setRtlDirection(e, !0)
        },
        readOnly: !0,
      },
    ]
    const i = e("../editor").Editor
    e("../config").defineOptions(i.prototype, "editor", {
      rtlText: {
        set: function (e) {
          e
            ? (this.on("change", u),
              this.on("changeSelection", s),
              this.renderer.on("afterRender", a),
              this.commands.on("exec", o),
              this.commands.addCommands(r))
            : (this.off("change", u),
              this.off("changeSelection", s),
              this.renderer.off("afterRender", a),
              this.commands.off("exec", o),
              this.commands.removeCommands(r),
              f(this.renderer)),
            this.renderer.updateFull()
        },
      },
      rtl: {
        set: function (e) {
          ;(this.session.$bidiHandler.$isRtl = e),
            e
              ? (this.setOption("rtlText", !1),
                this.renderer.on("afterRender", a),
                (this.session.$bidiHandler.seenBidi = !0))
              : (this.renderer.off("afterRender", a), f(this.renderer)),
            this.renderer.updateFull()
        },
      },
    })
  },
)
;(() => {
  ace.require(["ace/ext/rtl"], (m) => {
    if (typeof module === "object" && typeof exports === "object" && module) {
      module.exports = m
    }
  })
})()
