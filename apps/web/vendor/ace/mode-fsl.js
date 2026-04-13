ace.define(
  "ace/mode/fsl_highlight_rules",
  ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules"],
  (e, t, n) => {
    const r = e("../lib/oop")
    const i = e("./text_highlight_rules").TextHighlightRules
    const s = function () {
      ;(this.$rules = {
        start: [
          {
            token: "punctuation.definition.comment.mn",
            regex: /\/\*/,
            push: [
              { token: "punctuation.definition.comment.mn", regex: /\*\//, next: "pop" },
              { defaultToken: "comment.block.fsl" },
            ],
          },
          {
            token: "comment.line.fsl",
            regex: /\/\//,
            push: [
              { token: "comment.line.fsl", regex: /$/, next: "pop" },
              { defaultToken: "comment.line.fsl" },
            ],
          },
          {
            token: "entity.name.function",
            regex: /\${/,
            push: [
              { token: "entity.name.function", regex: /}/, next: "pop" },
              { defaultToken: "keyword.other" },
            ],
            comment: "js outcalls",
          },
          { token: "constant.numeric", regex: /[0-9]*\.[0-9]*\.[0-9]*/, comment: "semver" },
          {
            token: "constant.language.fslLanguage",
            regex:
              "(?:graph_layout|machine_name|machine_author|machine_license|machine_comment|machine_language|machine_version|machine_reference|npm_name|graph_layout|on_init|on_halt|on_end|on_terminate|on_finalize|on_transition|on_action|on_stochastic_action|on_legal|on_main|on_forced|on_validation|on_validation_failure|on_transition_refused|on_forced_transition_refused|on_action_refused|on_enter|on_exit|start_states|end_states|terminal_states|final_states|fsl_version)\\s*:",
          },
          {
            token: "keyword.control.transition.fslArrow",
            regex: /<->|<-|->|<=>|=>|<=|<~>|~>|<~|<-=>|<=->|<-~>|<~->|<=~>|<~=>/,
          },
          {
            token: "constant.numeric.fslProbability",
            regex: /[0-9]+%/,
            comment: "edge probability annotation",
          },
          {
            token: "constant.character.fslAction",
            regex: /\'[^']*\'/,
            comment: "action annotation",
          },
          {
            token: "string.quoted.double.fslLabel.doublequoted",
            regex: /\"[^"]*\"/,
            comment: "fsl label annotation",
          },
          {
            token: "entity.name.tag.fslLabel.atom",
            regex: /[a-zA-Z0-9_.+&()#@!?,]/,
            comment: "fsl label annotation",
          },
        ],
      }),
        this.normalizeRules()
    }
    ;(s.metaData = { fileTypes: ["fsl", "fsl_state"], name: "FSL", scopeName: "source.fsl" }),
      r.inherits(s, i),
      (t.FSLHighlightRules = s)
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
    "ace/mode/fsl",
    [
      "require",
      "exports",
      "module",
      "ace/lib/oop",
      "ace/mode/text",
      "ace/mode/fsl_highlight_rules",
      "ace/mode/folding/cstyle",
    ],
    (e, t, n) => {
      const r = e("../lib/oop")
      const i = e("./text").Mode
      const s = e("./fsl_highlight_rules").FSLHighlightRules
      const o = e("./folding/cstyle").FoldMode
      const u = function () {
        ;(this.HighlightRules = s), (this.foldingRules = new o())
      }
      r.inherits(u, i),
        function () {
          ;(this.lineCommentStart = "//"),
            (this.blockComment = { start: "/*", end: "*/" }),
            (this.$id = "ace/mode/fsl"),
            (this.snippetFileId = "ace/snippets/fsl")
        }.call(u.prototype),
        (t.Mode = u)
    },
  )
;(() => {
  ace.require(["ace/mode/fsl"], (m) => {
    if (typeof module === "object" && typeof exports === "object" && module) {
      module.exports = m
    }
  })
})()
