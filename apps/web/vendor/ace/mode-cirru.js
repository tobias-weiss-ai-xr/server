ace.define(
  "ace/mode/cirru_highlight_rules",
  ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules"],
  (e, t, n) => {
    const r = e("../lib/oop")
    const i = e("./text_highlight_rules").TextHighlightRules
    const s = function () {
      this.$rules = {
        start: [
          { token: "constant.numeric", regex: /[\d\.]+/ },
          { token: "comment.line.double-dash", regex: /--/, next: "comment" },
          { token: "storage.modifier", regex: /\(/ },
          { token: "storage.modifier", regex: /,/, next: "line" },
          { token: "support.function", regex: /[^\(\)"\s{}\[\]]+/, next: "line" },
          { token: "string.quoted.double", regex: /"/, next: "string" },
          { token: "storage.modifier", regex: /\)/ },
        ],
        comment: [{ token: "comment.line.double-dash", regex: / +[^\n]+/, next: "start" }],
        string: [
          { token: "string.quoted.double", regex: /"/, next: "line" },
          { token: "constant.character.escape", regex: /\\/, next: "escape" },
          { token: "string.quoted.double", regex: /[^\\"]+/ },
        ],
        escape: [{ token: "constant.character.escape", regex: /./, next: "string" }],
        line: [
          { token: "constant.numeric", regex: /[\d\.]+/ },
          { token: "markup.raw", regex: /^\s*/, next: "start" },
          { token: "storage.modifier", regex: /\$/, next: "start" },
          { token: "variable.parameter", regex: /[^\(\)"\s{}\[\]]+/ },
          { token: "storage.modifier", regex: /\(/, next: "start" },
          { token: "storage.modifier", regex: /\)/ },
          { token: "markup.raw", regex: /^ */, next: "start" },
          { token: "string.quoted.double", regex: /"/, next: "string" },
        ],
      }
    }
    r.inherits(s, i), (t.CirruHighlightRules = s)
  },
),
  ace.define(
    "ace/mode/folding/coffee",
    ["require", "exports", "module", "ace/lib/oop", "ace/mode/folding/fold_mode", "ace/range"],
    (e, t, n) => {
      const r = e("../../lib/oop")
      const i = e("./fold_mode").FoldMode
      const s = e("../../range").Range
      const o = (t.FoldMode = () => {})
      r.inherits(o, i),
        function () {
          ;(this.commentBlock = (e, t) => {
            const n = /\S/
            let r = e.getLine(t)
            const i = r.search(n)
            if (i === -1 || r[i] !== "#") return
            const o = r.length
            const u = e.getLength()
            const a = t
            let f = t
            while (++t < u) {
              r = e.getLine(t)
              const l = r.search(n)
              if (l === -1) continue
              if (r[l] !== "#") break
              f = t
            }
            if (f > a) {
              const c = e.getLine(f).length
              return new s(a, o, f, c)
            }
          }),
            (this.getFoldWidgetRange = function (e, t, n) {
              let r = this.indentationBlock(e, n)
              if (r) return r
              r = this.commentBlock(e, n)
              if (r) return r
            }),
            (this.getFoldWidget = (e, t, n) => {
              const r = e.getLine(n)
              const i = r.search(/\S/)
              const s = e.getLine(n + 1)
              const o = e.getLine(n - 1)
              const u = o.search(/\S/)
              const a = s.search(/\S/)
              if (i === -1) return (e.foldWidgets[n - 1] = u !== -1 && u < a ? "start" : ""), ""
              if (u === -1) {
                if (i === a && r[i] === "#" && s[i] === "#")
                  return (e.foldWidgets[n - 1] = ""), (e.foldWidgets[n + 1] = ""), "start"
              } else if (
                u === i &&
                r[i] === "#" &&
                o[i] === "#" &&
                e.getLine(n - 2).search(/\S/) === -1
              )
                return (e.foldWidgets[n - 1] = "start"), (e.foldWidgets[n + 1] = ""), ""
              return (
                u !== -1 && u < i ? (e.foldWidgets[n - 1] = "start") : (e.foldWidgets[n - 1] = ""),
                i < a ? "start" : ""
              )
            })
        }.call(o.prototype)
    },
  ),
  ace.define(
    "ace/mode/cirru",
    [
      "require",
      "exports",
      "module",
      "ace/lib/oop",
      "ace/mode/text",
      "ace/mode/cirru_highlight_rules",
      "ace/mode/folding/coffee",
    ],
    (e, t, n) => {
      const r = e("../lib/oop")
      const i = e("./text").Mode
      const s = e("./cirru_highlight_rules").CirruHighlightRules
      const o = e("./folding/coffee").FoldMode
      const u = function () {
        ;(this.HighlightRules = s),
          (this.foldingRules = new o()),
          (this.$behaviour = this.$defaultBehaviour)
      }
      r.inherits(u, i),
        function () {
          ;(this.lineCommentStart = "--"), (this.$id = "ace/mode/cirru")
        }.call(u.prototype),
        (t.Mode = u)
    },
  )
;(() => {
  ace.require(["ace/mode/cirru"], (m) => {
    if (typeof module === "object" && typeof exports === "object" && module) {
      module.exports = m
    }
  })
})()
