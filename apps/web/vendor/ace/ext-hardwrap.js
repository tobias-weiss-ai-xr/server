ace.define(
  "ace/ext/hardwrap",
  ["require", "exports", "module", "ace/range", "ace/editor", "ace/config"],
  (e, t, n) => {
    function i(e, t) {
      function m(e, t, n) {
        if (e.length < t) return
        const r = e.slice(0, t)
        const i = e.slice(t)
        const s = /^(?:(\s+)|(\S+)(\s+))/.exec(i)
        const o = /(?:(\s+)|(\s+)(\S+))$/.exec(r)
        let u = 0
        let a = 0
        o && !o[2] && ((u = t - o[1].length), (a = t)),
          s && !s[2] && (u || (u = t), (a = t + s[1].length))
        if (u) return { start: u, end: a }
        if (o?.[2] && o.index > n) return { start: o.index, end: o.index + o[2].length }
        if (s?.[2]) return (u = t + s[2].length), { start: u, end: u + s[3].length }
      }
      const n = t.column || e.getOption("printMarginColumn")
      const i = t.allowMerge !== 0
      let s = Math.min(t.startRow, t.endRow)
      let o = Math.max(t.startRow, t.endRow)
      const u = e.session
      while (s <= o) {
        const a = u.getLine(s)
        if (a.length > n) {
          const f = m(a, n, 5)
          if (f) {
            const l = /^\s*/.exec(a)[0]
            u.replace(new r(s, f.start, s, f.end), `\n${l}`)
          }
          o++
        } else if (i && /\S/.test(a) && s !== o) {
          const c = u.getLine(s + 1)
          if (c && /\S/.test(c)) {
            const h = a.replace(/\s+$/, "")
            const p = c.replace(/^\s+/, "")
            const d = `${h} ${p}`
            const f = m(d, n, 5)
            if ((f && f.start > h.length) || d.length < n) {
              const v = new r(s, h.length, s + 1, c.length - p.length)
              u.replace(v, " "), s--, o--
            } else h.length < a.length && u.remove(new r(s, h.length, s, a.length))
          }
        }
        s++
      }
    }
    function s(e) {
      if (e.command.name === "insertstring" && /\S/.test(e.args)) {
        const t = e.editor
        const n = t.selection.cursor
        if (n.column <= t.renderer.$printMarginColumn) return
        const r = t.session.$undoManager.$lastDelta
        i(t, { startRow: n.row, endRow: n.row, allowMerge: !1 }),
          r !== t.session.$undoManager.$lastDelta && t.session.markUndoGroup()
      }
    }
    const r = e("../range").Range
    const o = e("../editor").Editor
    e("../config").defineOptions(o.prototype, "editor", {
      hardWrap: {
        set: function (e) {
          e ? this.commands.on("afterExec", s) : this.commands.off("afterExec", s)
        },
        value: !1,
      },
    }),
      (t.hardWrap = i)
  },
)
;(() => {
  ace.require(["ace/ext/hardwrap"], (m) => {
    if (typeof module === "object" && typeof exports === "object" && module) {
      module.exports = m
    }
  })
})()
