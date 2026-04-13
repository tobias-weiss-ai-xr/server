ace.define(
  "ace/ext/linking",
  ["require", "exports", "module", "ace/editor", "ace/config"],
  (e, t, n) => {
    function i(e) {
      const n = e.editor
      const r = e.getAccelKey()
      if (r) {
        const n = e.editor
        const i = e.getDocumentPosition()
        const s = n.session
        const o = s.getTokenAt(i.row, i.column)
        t.previousLinkingHover && t.previousLinkingHover !== o && n._emit("linkHoverOut"),
          n._emit("linkHover", { position: i, token: o }),
          (t.previousLinkingHover = o)
      } else t.previousLinkingHover && (n._emit("linkHoverOut"), (t.previousLinkingHover = !1))
    }
    function s(e) {
      const t = e.getAccelKey()
      const n = e.getButton()
      if (n === 0 && t) {
        const r = e.editor
        const i = e.getDocumentPosition()
        const s = r.session
        const o = s.getTokenAt(i.row, i.column)
        r._emit("linkClick", { position: i, token: o })
      }
    }
    const r = e("../editor").Editor
    e("../config").defineOptions(r.prototype, "editor", {
      enableLinking: {
        set: function (e) {
          e
            ? (this.on("click", s), this.on("mousemove", i))
            : (this.off("click", s), this.off("mousemove", i))
        },
        value: !1,
      },
    }),
      (t.previousLinkingHover = !1)
  },
)
;(() => {
  ace.require(["ace/ext/linking"], (m) => {
    if (typeof module === "object" && typeof exports === "object" && module) {
      module.exports = m
    }
  })
})()
