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
    "ace/mode/dot_highlight_rules",
    [
      "require",
      "exports",
      "module",
      "ace/lib/oop",
      "ace/lib/lang",
      "ace/mode/text_highlight_rules",
      "ace/mode/doc_comment_highlight_rules",
    ],
    (e, t, n) => {
      const r = e("../lib/oop")
      const i = e("../lib/lang")
      const s = e("./text_highlight_rules").TextHighlightRules
      const o = e("./doc_comment_highlight_rules").DocCommentHighlightRules
      const u = function () {
        const e = i.arrayToMap("strict|node|edge|graph|digraph|subgraph".split("|"))
        const t = i.arrayToMap(
          "damping|k|url|area|arrowhead|arrowsize|arrowtail|aspect|bb|bgcolor|center|charset|clusterrank|color|colorscheme|comment|compound|concentrate|constraint|decorate|defaultdist|dim|dimen|dir|diredgeconstraints|distortion|dpi|edgeurl|edgehref|edgetarget|edgetooltip|epsilon|esep|fillcolor|fixedsize|fontcolor|fontname|fontnames|fontpath|fontsize|forcelabels|gradientangle|group|headurl|head_lp|headclip|headhref|headlabel|headport|headtarget|headtooltip|height|href|id|image|imagepath|imagescale|label|labelurl|label_scheme|labelangle|labeldistance|labelfloat|labelfontcolor|labelfontname|labelfontsize|labelhref|labeljust|labelloc|labeltarget|labeltooltip|landscape|layer|layerlistsep|layers|layerselect|layersep|layout|len|levels|levelsgap|lhead|lheight|lp|ltail|lwidth|margin|maxiter|mclimit|mindist|minlen|mode|model|mosek|nodesep|nojustify|normalize|nslimit|nslimit1|ordering|orientation|outputorder|overlap|overlap_scaling|pack|packmode|pad|page|pagedir|pencolor|penwidth|peripheries|pin|pos|quadtree|quantum|rank|rankdir|ranksep|ratio|rects|regular|remincross|repulsiveforce|resolution|root|rotate|rotation|samehead|sametail|samplepoints|scale|searchsize|sep|shape|shapefile|showboxes|sides|size|skew|smoothing|sortv|splines|start|style|stylesheet|tailurl|tail_lp|tailclip|tailhref|taillabel|tailport|tailtarget|tailtooltip|target|tooltip|truecolor|vertices|viewport|voro_margin|weight|width|xlabel|xlp|z".split(
            "|",
          ),
        )
        this.$rules = {
          start: [
            { token: "comment", regex: /\/\/.*$/ },
            { token: "comment", regex: /#.*$/ },
            { token: "comment", merge: !0, regex: /\/\*/, next: "comment" },
            { token: "string", regex: "'(?=.)", next: "qstring" },
            { token: "string", regex: '"(?=.)', next: "qqstring" },
            { token: "constant.numeric", regex: /[+\-]?\d+(?:(?:\.\d*)?(?:[eE][+\-]?\d+)?)?\b/ },
            { token: "keyword.operator", regex: /\+|=|\->/ },
            { token: "punctuation.operator", regex: /,|;/ },
            { token: "paren.lparen", regex: /[\[{]/ },
            { token: "paren.rparen", regex: /[\]}]/ },
            { token: "comment", regex: /^#!.*$/ },
            {
              token: (n) =>
                e.hasOwnProperty(n.toLowerCase())
                  ? "keyword"
                  : t.hasOwnProperty(n.toLowerCase())
                    ? "variable"
                    : "text",
              regex: "\\-?[a-zA-Z_][a-zA-Z0-9_\\-]*",
            },
          ],
          comment: [
            { token: "comment", regex: "\\*\\/", next: "start" },
            { defaultToken: "comment" },
          ],
          qqstring: [
            { token: "string", regex: '[^"\\\\]+', merge: !0 },
            { token: "string", regex: "\\\\$", next: "qqstring", merge: !0 },
            { token: "string", regex: '"|$', next: "start", merge: !0 },
          ],
          qstring: [
            { token: "string", regex: "[^'\\\\]+", merge: !0 },
            { token: "string", regex: "\\\\$", next: "qstring", merge: !0 },
            { token: "string", regex: "'|$", next: "start", merge: !0 },
          ],
        }
      }
      r.inherits(u, s), (t.DotHighlightRules = u)
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
    "ace/mode/dot",
    [
      "require",
      "exports",
      "module",
      "ace/lib/oop",
      "ace/mode/text",
      "ace/mode/matching_brace_outdent",
      "ace/mode/dot_highlight_rules",
      "ace/mode/folding/cstyle",
    ],
    (e, t, n) => {
      const r = e("../lib/oop")
      const i = e("./text").Mode
      const s = e("./matching_brace_outdent").MatchingBraceOutdent
      const o = e("./dot_highlight_rules").DotHighlightRules
      const u = e("./folding/cstyle").FoldMode
      const a = function () {
        ;(this.HighlightRules = o),
          (this.$outdent = new s()),
          (this.foldingRules = new u()),
          (this.$behaviour = this.$defaultBehaviour)
      }
      r.inherits(a, i),
        function () {
          ;(this.lineCommentStart = ["//", "#"]),
            (this.blockComment = { start: "/*", end: "*/" }),
            (this.getNextLineIndent = function (e, t, n) {
              let r = this.$getIndent(t)
              const i = this.getTokenizer().getLineTokens(t, e)
              const s = i.tokens
              const o = i.state
              if (s.length && s[s.length - 1].type === "comment") return r
              if (e === "start") {
                const u = t.match(/^.*(?:\bcase\b.*:|[\{\(\[])\s*$/)
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
            (this.$id = "ace/mode/dot")
        }.call(a.prototype),
        (t.Mode = a)
    },
  )
;(() => {
  ace.require(["ace/mode/dot"], (m) => {
    if (typeof module === "object" && typeof exports === "object" && module) {
      module.exports = m
    }
  })
})()
