ace.define(
  "ace/mode/gitignore_highlight_rules",
  ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules"],
  (e, t, n) => {
    const r = e("../lib/oop")
    const i = e("./text_highlight_rules").TextHighlightRules
    const s = function () {
      ;(this.$rules = {
        start: [
          { token: "comment", regex: /^\s*#.*$/ },
          { token: "keyword", regex: /^\s*!.*$/ },
        ],
      }),
        this.normalizeRules()
    }
    ;(s.metaData = { fileTypes: ["gitignore"], name: "Gitignore" }),
      r.inherits(s, i),
      (t.GitignoreHighlightRules = s)
  },
),
  ace.define(
    "ace/mode/gitignore",
    [
      "require",
      "exports",
      "module",
      "ace/lib/oop",
      "ace/mode/text",
      "ace/mode/gitignore_highlight_rules",
    ],
    (e, t, n) => {
      const r = e("../lib/oop")
      const i = e("./text").Mode
      const s = e("./gitignore_highlight_rules").GitignoreHighlightRules
      const o = function () {
        ;(this.HighlightRules = s), (this.$behaviour = this.$defaultBehaviour)
      }
      r.inherits(o, i),
        function () {
          ;(this.lineCommentStart = "#"), (this.$id = "ace/mode/gitignore")
        }.call(o.prototype),
        (t.Mode = o)
    },
  )
;(() => {
  ace.require(["ace/mode/gitignore"], (m) => {
    if (typeof module === "object" && typeof exports === "object" && module) {
      module.exports = m
    }
  })
})()
