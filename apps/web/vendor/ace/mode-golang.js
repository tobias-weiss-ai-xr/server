ace.define(
  "ace/mode/doc_comment_highlight_rules",
  ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules"],
  (e, t, n) => {
    const r = e("../lib/oop")
    const i = e("./text_highlight_rules").TextHighlightRules
    const s = function () {
      this.$rules = {
        start: [
          { token: "comment.doc.tag", regex: "@\\w+(?=\\s|$)" },
          s.getTagRule(),
          { defaultToken: "comment.doc.body", caseInsensitive: !0 },
        ],
      }
    }
    r.inherits(s, i),
      (s.getTagRule = (e) => ({
        token: "comment.doc.tag.storage.type",
        regex: "\\b(?:TODO|FIXME|XXX|HACK)\\b",
      })),
      (s.getStartRule = (e) => ({ token: "comment.doc", regex: /\/\*\*(?!\/)/, next: e })),
      (s.getEndRule = (e) => ({ token: "comment.doc", regex: "\\*\\/", next: e })),
      (t.DocCommentHighlightRules = s)
  },
),
  ace.define(
    "ace/mode/golang_highlight_rules",
    [
      "require",
      "exports",
      "module",
      "ace/lib/oop",
      "ace/mode/doc_comment_highlight_rules",
      "ace/mode/text_highlight_rules",
    ],
    (e, t, n) => {
      const r = e("../lib/oop")
      const i = e("./doc_comment_highlight_rules").DocCommentHighlightRules
      const s = e("./text_highlight_rules").TextHighlightRules
      const o = function () {
        const e =
          "else|break|case|return|goto|if|const|select|continue|struct|default|switch|for|range|func|import|package|chan|defer|fallthrough|go|interface|map|range|select|type|var"
        const t =
          "string|uint8|uint16|uint32|uint64|int8|int16|int32|int64|float32|float64|complex64|complex128|byte|rune|uint|int|uintptr|bool|error"
        const n =
          "new|close|cap|copy|panic|panicln|print|println|len|make|delete|real|recover|imag|append"
        const r = "nil|true|false|iota"
        const s = this.createKeywordMapper(
          { keyword: e, "constant.language": r, "support.function": n, "support.type": t },
          "",
        )
        const o = "\\\\(?:[0-7]{3}|x\\h{2}|u{4}|U\\h{6}|[abfnrtv'\"\\\\])".replace(
          /\\h/g,
          "[a-fA-F\\d]",
        )
        ;(this.$rules = {
          start: [
            { token: "comment", regex: "\\/\\/.*$" },
            i.getStartRule("doc-start"),
            { token: "comment.start", regex: "\\/\\*", next: "comment" },
            { token: "string", regex: /"(?:[^"\\]|\\.)*?"/ },
            { token: "string", regex: "`", next: "bqstring" },
            {
              token: "constant.numeric",
              regex: `'(?:[^\\'\ud800-\udbff]|[\ud800-\udbff][\udc00-\udfff]|${o.replace('"', "")})'`,
            },
            { token: "constant.numeric", regex: "0[xX][0-9a-fA-F]+\\b" },
            { token: "constant.numeric", regex: "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b" },
            {
              token: ["keyword", "text", "entity.name.function"],
              regex: "(func)(\\s+)([a-zA-Z_$][a-zA-Z0-9_$]*)\\b",
            },
            {
              token: (e) =>
                e[e.length - 1] === "("
                  ? [
                      { type: s(e.slice(0, -1)) || "support.function", value: e.slice(0, -1) },
                      { type: "paren.lparen", value: e.slice(-1) },
                    ]
                  : s(e) || "identifier",
              regex: "[a-zA-Z_$][a-zA-Z0-9_$]*\\b\\(?",
            },
            {
              token: "keyword.operator",
              regex:
                "!|\\$|%|&|\\*|\\-\\-|\\-|\\+\\+|\\+|~|==|=|!=|<=|>=|<<=|>>=|>>>=|<>|<|>|!|&&|\\|\\||\\?\\:|\\*=|%=|\\+=|\\-=|&=|\\^=",
            },
            { token: "punctuation.operator", regex: "\\?|\\:|\\,|\\;|\\." },
            { token: "paren.lparen", regex: "[[({]" },
            { token: "paren.rparen", regex: "[\\])}]" },
            { token: "text", regex: "\\s+" },
          ],
          comment: [
            { token: "comment.end", regex: "\\*\\/", next: "start" },
            { defaultToken: "comment" },
          ],
          bqstring: [{ token: "string", regex: "`", next: "start" }, { defaultToken: "string" }],
        }),
          this.embedRules(i, "doc-", [i.getEndRule("start")])
      }
      r.inherits(o, s), (t.GolangHighlightRules = o)
    },
  ),
  ace.define(
    "ace/mode/matching_brace_outdent",
    ["require", "exports", "module", "ace/range"],
    (e, t, n) => {
      const r = e("../range").Range
      const i = () => {}
      ;(function () {
        ;(this.checkOutdent = (e, t) => (/^\s+$/.test(e) ? /^\s*\}/.test(t) : !1)),
          (this.autoOutdent = function (e, t) {
            const n = e.getLine(t)
            const i = n.match(/^(\s*\})/)
            if (!i) return 0
            const s = i[1].length
            const o = e.findMatchingBracket({ row: t, column: s })
            if (!o || o.row === t) return 0
            const u = this.$getIndent(e.getLine(o.row))
            e.replace(new r(t, 0, t, s - 1), u)
          }),
          (this.$getIndent = (e) => e.match(/^\s*/)[0])
      }).call(i.prototype),
        (t.MatchingBraceOutdent = i)
    },
  ),
  ace.define(
    "ace/mode/folding/cstyle",
    ["require", "exports", "module", "ace/lib/oop", "ace/range", "ace/mode/folding/fold_mode"],
    (e, t, n) => {
      const r = e("../../lib/oop")
      const i = e("../../range").Range
      const s = e("./fold_mode").FoldMode
      const o = (t.FoldMode = function (e) {
        e &&
          ((this.foldingStartMarker = new RegExp(
            this.foldingStartMarker.source.replace(/\|[^|]*?$/, `|${e.start}`),
          )),
          (this.foldingStopMarker = new RegExp(
            this.foldingStopMarker.source.replace(/\|[^|]*?$/, `|${e.end}`),
          )))
      })
      r.inherits(o, s),
        function () {
          ;(this.foldingStartMarker = /([\{\[\(])[^\}\]\)]*$|^\s*(\/\*)/),
            (this.foldingStopMarker = /^[^\[\{\(]*([\}\]\)])|^[\s\*]*(\*\/)/),
            (this.singleLineBlockCommentRe = /^\s*(\/\*).*\*\/\s*$/),
            (this.tripleStarBlockCommentRe = /^\s*(\/\*\*\*).*\*\/\s*$/),
            (this.startRegionRe = /^\s*(\/\*|\/\/)#?region\b/),
            (this._getFoldWidgetBase = this.getFoldWidget),
            (this.getFoldWidget = function (e, t, n) {
              const r = e.getLine(n)
              if (
                this.singleLineBlockCommentRe.test(r) &&
                !this.startRegionRe.test(r) &&
                !this.tripleStarBlockCommentRe.test(r)
              )
                return ""
              const i = this._getFoldWidgetBase(e, t, n)
              return !i && this.startRegionRe.test(r) ? "start" : i
            }),
            (this.getFoldWidgetRange = function (e, t, n, r) {
              const i = e.getLine(n)
              if (this.startRegionRe.test(i)) return this.getCommentRegionBlock(e, i, n)
              const s = i.match(this.foldingStartMarker)
              if (s) {
                const o = s.index
                if (s[1]) return this.openingBracketBlock(e, s[1], n, o)
                let u = e.getCommentFoldRange(n, o + s[0].length, 1)
                return (
                  u &&
                    !u.isMultiLine() &&
                    (r ? (u = this.getSectionRange(e, n)) : t !== "all" && (u = null)),
                  u
                )
              }
              if (t === "markbegin") return
              const s = i.match(this.foldingStopMarker)
              if (s) {
                const o = s.index + s[0].length
                return s[1]
                  ? this.closingBracketBlock(e, s[1], n, o)
                  : e.getCommentFoldRange(n, o, -1)
              }
            }),
            (this.getSectionRange = function (e, t) {
              let n = e.getLine(t)
              const r = n.search(/\S/)
              const s = t
              const o = n.length
              t += 1
              let u = t
              const a = e.getLength()
              while (++t < a) {
                n = e.getLine(t)
                const f = n.search(/\S/)
                if (f === -1) continue
                if (r > f) break
                const l = this.getFoldWidgetRange(e, "all", t)
                if (l) {
                  if (l.start.row <= s) break
                  if (l.isMultiLine()) t = l.end.row
                  else if (r === f) break
                }
                u = t
              }
              return new i(s, o, u, e.getLine(u).length)
            }),
            (this.getCommentRegionBlock = (e, t, n) => {
              const r = t.search(/\s*$/)
              const s = e.getLength()
              const o = n
              const u = /^\s*(?:\/\*|\/\/|--)#?(end)?region\b/
              let a = 1
              while (++n < s) {
                t = e.getLine(n)
                const f = u.exec(t)
                if (!f) continue
                f[1] ? a-- : a++
                if (!a) break
              }
              const l = n
              if (l > o) return new i(o, r, l, t.length)
            })
        }.call(o.prototype)
    },
  ),
  ace.define(
    "ace/mode/golang",
    [
      "require",
      "exports",
      "module",
      "ace/lib/oop",
      "ace/mode/text",
      "ace/mode/golang_highlight_rules",
      "ace/mode/matching_brace_outdent",
      "ace/mode/folding/cstyle",
    ],
    (e, t, n) => {
      const r = e("../lib/oop")
      const i = e("./text").Mode
      const s = e("./golang_highlight_rules").GolangHighlightRules
      const o = e("./matching_brace_outdent").MatchingBraceOutdent
      const u = e("./folding/cstyle").FoldMode
      const a = function () {
        ;(this.HighlightRules = s),
          (this.$outdent = new o()),
          (this.foldingRules = new u()),
          (this.$behaviour = this.$defaultBehaviour)
      }
      r.inherits(a, i),
        function () {
          ;(this.lineCommentStart = "//"),
            (this.blockComment = { start: "/*", end: "*/" }),
            (this.getNextLineIndent = function (e, t, n) {
              let r = this.$getIndent(t)
              const i = this.getTokenizer().getLineTokens(t, e)
              const s = i.tokens
              const o = i.state
              if (s.length && s[s.length - 1].type === "comment") return r
              if (e === "start") {
                const u = t.match(/^.*[\{\(\[]\s*$/)
                u && (r += n)
              }
              return r
            }),
            (this.checkOutdent = function (e, t, n) {
              return this.$outdent.checkOutdent(t, n)
            }),
            (this.autoOutdent = function (e, t, n) {
              this.$outdent.autoOutdent(t, n)
            }),
            (this.$id = "ace/mode/golang")
        }.call(a.prototype),
        (t.Mode = a)
    },
  )
;(() => {
  ace.require(["ace/mode/golang"], (m) => {
    if (typeof module === "object" && typeof exports === "object" && module) {
      module.exports = m
    }
  })
})()
