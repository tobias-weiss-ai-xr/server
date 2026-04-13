ace.define(
  "ace/mode/diff_highlight_rules",
  ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules"],
  (e, t, n) => {
    const r = e("../lib/oop")
    const i = e("./text_highlight_rules").TextHighlightRules
    const s = function () {
      this.$rules = {
        start: [
          {
            regex: "^(?:\\*{15}|={67}|-{3}|\\+{3})$",
            token: "punctuation.definition.separator.diff",
            name: "keyword",
          },
          {
            regex: "^(@@)(\\s*.+?\\s*)(@@)(.*)$",
            token: ["constant", "constant.numeric", "constant", "comment.doc.tag"],
          },
          {
            regex: "^(\\d+)([,\\d]+)(a|d|c)(\\d+)([,\\d]+)(.*)$",
            token: [
              "constant.numeric",
              "punctuation.definition.range.diff",
              "constant.function",
              "constant.numeric",
              "punctuation.definition.range.diff",
              "invalid",
            ],
            name: "meta.",
          },
          { regex: "^(\\-{3}|\\+{3}|\\*{3})( .+)$", token: ["constant.numeric", "meta.tag"] },
          { regex: "^([!+>])(.*?)(\\s*)$", token: ["support.constant", "text", "invalid"] },
          { regex: "^([<\\-])(.*?)(\\s*)$", token: ["support.function", "string", "invalid"] },
          {
            regex: "^(diff)(\\s+--\\w+)?(.+?)( .+)?$",
            token: ["variable", "variable", "keyword", "variable"],
          },
          { regex: "^Index.+$", token: "variable" },
          { regex: "^\\s+$", token: "text" },
          { regex: "\\s*$", token: "invalid" },
          { defaultToken: "invisible", caseInsensitive: !0 },
        ],
      }
    }
    r.inherits(s, i), (t.DiffHighlightRules = s)
  },
),
  ace.define(
    "ace/mode/folding/diff",
    ["require", "exports", "module", "ace/lib/oop", "ace/mode/folding/fold_mode", "ace/range"],
    (e, t, n) => {
      const r = e("../../lib/oop")
      const i = e("./fold_mode").FoldMode
      const s = e("../../range").Range
      const o = (t.FoldMode = function (e, t) {
        ;(this.regExpList = e),
          (this.flag = t),
          (this.foldingStartMarker = RegExp(`^(${e.join("|")})`, this.flag))
      })
      r.inherits(o, i),
        function () {
          this.getFoldWidgetRange = function (e, t, n) {
            let r = e.getLine(n)
            const i = { row: n, column: r.length }
            const o = this.regExpList
            for (let u = 1; u <= o.length; u++) {
              const a = RegExp(`^(${o.slice(0, u).join("|")})`, this.flag)
              if (a.test(r)) break
            }
            for (const f = e.getLength(); ++n < f; ) {
              r = e.getLine(n)
              if (a.test(r)) break
            }
            if (n === i.row + 1) return
            return new s(i.row, i.column, n - 1, r.length)
          }
        }.call(o.prototype)
    },
  ),
  ace.define(
    "ace/mode/diff",
    [
      "require",
      "exports",
      "module",
      "ace/lib/oop",
      "ace/mode/text",
      "ace/mode/diff_highlight_rules",
      "ace/mode/folding/diff",
    ],
    (e, t, n) => {
      const r = e("../lib/oop")
      const i = e("./text").Mode
      const s = e("./diff_highlight_rules").DiffHighlightRules
      const o = e("./folding/diff").FoldMode
      const u = function () {
        ;(this.HighlightRules = s), (this.foldingRules = new o(["diff", "@@|\\*{5}"], "i"))
      }
      r.inherits(u, i),
        function () {
          ;(this.$id = "ace/mode/diff"), (this.snippetFileId = "ace/snippets/diff")
        }.call(u.prototype),
        (t.Mode = u)
    },
  )
;(() => {
  ace.require(["ace/mode/diff"], (m) => {
    if (typeof module === "object" && typeof exports === "object" && module) {
      module.exports = m
    }
  })
})()
