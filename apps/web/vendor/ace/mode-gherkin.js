ace.define(
  "ace/mode/gherkin_highlight_rules",
  ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules"],
  (e, t, n) => {
    const r = e("../lib/oop")
    const i = e("./text_highlight_rules").TextHighlightRules
    const s = "\\\\(x[0-9A-Fa-f]{2}|[0-7]{3}|[\\\\abfnrtv'\"]|U[0-9A-Fa-f]{8}|u[0-9A-Fa-f]{4})"
    const o = function () {
      const e = [
        {
          name: "en",
          labels: "Feature|Background|Scenario(?: Outline)?|Examples",
          keywords: "Given|When|Then|And|But",
        },
      ]
      const t = e.map((e) => e.labels).join("|")
      const n = e.map((e) => e.keywords).join("|")
      ;(this.$rules = {
        start: [
          { token: "constant.numeric", regex: "(?:(?:[1-9]\\d*)|(?:0))" },
          { token: "comment", regex: "#.*$" },
          { token: "keyword", regex: `(?:${t}):|(?:${n})\\b` },
          { token: "keyword", regex: "\\*" },
          { token: "string", regex: '"{3}', next: "qqstring3" },
          { token: "string", regex: '"', next: "qqstring" },
          {
            token: "text",
            regex: "^\\s*(?=@[\\w])",
            next: [
              { token: "text", regex: "\\s+" },
              { token: "variable.parameter", regex: "@[\\w]+" },
              { token: "empty", regex: "", next: "start" },
            ],
          },
          { token: "comment", regex: "<[^>]+>" },
          { token: "comment", regex: "\\|(?=.)", next: "table-item" },
          { token: "comment", regex: "\\|$", next: "start" },
        ],
        qqstring3: [
          { token: "constant.language.escape", regex: s },
          { token: "string", regex: '"{3}', next: "start" },
          { defaultToken: "string" },
        ],
        qqstring: [
          { token: "constant.language.escape", regex: s },
          { token: "string", regex: "\\\\$", next: "qqstring" },
          { token: "string", regex: '"|$', next: "start" },
          { defaultToken: "string" },
        ],
        "table-item": [
          { token: "comment", regex: /$/, next: "start" },
          { token: "comment", regex: /\|/ },
          { token: "string", regex: /\\./ },
          { defaultToken: "string" },
        ],
      }),
        this.normalizeRules()
    }
    r.inherits(o, i), (t.GherkinHighlightRules = o)
  },
),
  ace.define(
    "ace/mode/gherkin",
    [
      "require",
      "exports",
      "module",
      "ace/lib/oop",
      "ace/mode/text",
      "ace/mode/gherkin_highlight_rules",
    ],
    (e, t, n) => {
      const r = e("../lib/oop")
      const i = e("./text").Mode
      const s = e("./gherkin_highlight_rules").GherkinHighlightRules
      const o = function () {
        ;(this.HighlightRules = s), (this.$behaviour = this.$defaultBehaviour)
      }
      r.inherits(o, i),
        function () {
          ;(this.lineCommentStart = "#"),
            (this.$id = "ace/mode/gherkin"),
            (this.getNextLineIndent = function (e, t, n) {
              let r = this.$getIndent(t)
              const i = "  "
              const s = this.getTokenizer().getLineTokens(t, e)
              const o = s.tokens
              return (
                t.match("[ ]*\\|") && (r += "| "),
                o.length && o[o.length - 1].type === "comment"
                  ? r
                  : (e === "start" &&
                      (t.match("Scenario:|Feature:|Scenario Outline:|Background:")
                        ? (r += i)
                        : t.match("(Given|Then).+(:)$|Examples:")
                          ? (r += i)
                          : t.match("\\*.+") && (r += "* ")),
                    r)
              )
            })
        }.call(o.prototype),
        (t.Mode = o)
    },
  )
;(() => {
  ace.require(["ace/mode/gherkin"], (m) => {
    if (typeof module === "object" && typeof exports === "object" && module) {
      module.exports = m
    }
  })
})()
