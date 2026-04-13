ace.define(
  "ace/mode/coffee_highlight_rules",
  ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules"],
  (e, t, n) => {
    function s() {
      const e = "[$A-Za-z_\\x7f-\\uffff][$\\w\\x7f-\\uffff]*"
      const t =
        "this|throw|then|try|typeof|super|switch|return|break|by|continue|catch|class|in|instanceof|is|isnt|if|else|extends|for|own|finally|function|while|when|new|no|not|delete|debugger|do|loop|of|off|or|on|unless|until|and|yes|yield|export|import|default"
      const n = "true|false|null|undefined|NaN|Infinity"
      const r =
        "case|const|function|var|void|with|enum|implements|interface|let|package|private|protected|public|static"
      const i =
        "Array|Boolean|Date|Function|Number|Object|RegExp|ReferenceError|String|Error|EvalError|InternalError|RangeError|ReferenceError|StopIteration|SyntaxError|TypeError|URIError|ArrayBuffer|Float32Array|Float64Array|Int16Array|Int32Array|Int8Array|Uint16Array|Uint32Array|Uint8Array|Uint8ClampedArray"
      const s =
        "Math|JSON|isNaN|isFinite|parseInt|parseFloat|encodeURI|encodeURIComponent|decodeURI|decodeURIComponent|String|"
      const o = "window|arguments|prototype|document"
      const u = this.createKeywordMapper(
        {
          keyword: t,
          "constant.language": n,
          "invalid.illegal": r,
          "language.support.class": i,
          "language.support.function": s,
          "variable.language": o,
        },
        "identifier",
      )
      const a = {
        token: ["paren.lparen", "variable.parameter", "paren.rparen", "text", "storage.type"],
        regex: /(?:(\()((?:"[^")]*?"|'[^')]*?'|\/[^\/)]*?\/|[^()"'\/])*?)(\))(\s*))?([\-=]>)/
          .source,
      }
      const f =
        /\\(?:x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|[0-2][0-7]{0,2}|3[0-6][0-7]?|37[0-7]?|[4-7][0-7]?|.)/
      ;(this.$rules = {
        start: [
          {
            token: "constant.numeric",
            regex: "(?:0x[\\da-fA-F]+|(?:\\d+(?:\\.\\d+)?|\\.\\d+)(?:[eE][+-]?\\d+)?)",
          },
          {
            stateName: "qdoc",
            token: "string",
            regex: "'''",
            next: [
              { token: "string", regex: "'''", next: "start" },
              { token: "constant.language.escape", regex: f },
              { defaultToken: "string" },
            ],
          },
          {
            stateName: "qqdoc",
            token: "string",
            regex: '"""',
            next: [
              { token: "string", regex: '"""', next: "start" },
              { token: "paren.string", regex: "#{", push: "start" },
              { token: "constant.language.escape", regex: f },
              { defaultToken: "string" },
            ],
          },
          {
            stateName: "qstring",
            token: "string",
            regex: "'",
            next: [
              { token: "string", regex: "'", next: "start" },
              { token: "constant.language.escape", regex: f },
              { defaultToken: "string" },
            ],
          },
          {
            stateName: "qqstring",
            token: "string.start",
            regex: '"',
            next: [
              { token: "string.end", regex: '"', next: "start" },
              { token: "paren.string", regex: "#{", push: "start" },
              { token: "constant.language.escape", regex: f },
              { defaultToken: "string" },
            ],
          },
          {
            stateName: "js",
            token: "string",
            regex: "`",
            next: [
              { token: "string", regex: "`", next: "start" },
              { token: "constant.language.escape", regex: f },
              { defaultToken: "string" },
            ],
          },
          {
            regex: "[{}]",
            onMatch: function (e, t, n) {
              this.next = ""
              if (e === "{" && n.length) return n.unshift("start", t), "paren"
              if (e === "}" && n.length) {
                n.shift(), (this.next = n.shift() || "")
                if (this.next.indexOf("string") !== -1) return "paren.string"
              }
              return "paren"
            },
          },
          { token: "string.regex", regex: "///", next: "heregex" },
          {
            token: "string.regex",
            regex:
              /(?:\/(?![\s=])[^[\/\n\\]*(?:(?:\\[\s\S]|\[[^\]\n\\]*(?:\\[\s\S][^\]\n\\]*)*])[^[\/\n\\]*)*\/)(?:[imgy]{0,4})(?!\w)/,
          },
          { token: "comment", regex: "###(?!#)", next: "comment" },
          { token: "comment", regex: "#.*" },
          { token: ["punctuation.operator", "text", "identifier"], regex: `(\\.)(\\s*)(${r})` },
          { token: "punctuation.operator", regex: "\\.{1,3}" },
          {
            token: [
              "keyword",
              "text",
              "language.support.class",
              "text",
              "keyword",
              "text",
              "language.support.class",
            ],
            regex: `(class)(\\s+)(${e})(?:(\\s+)(extends)(\\s+)(${e}))?`,
          },
          {
            token: ["entity.name.function", "text", "keyword.operator", "text"].concat(a.token),
            regex: `(${e})(\\s*)([=:])(\\s*)${a.regex}`,
          },
          a,
          { token: "variable", regex: `@(?:${e})?` },
          { token: u, regex: e },
          { token: "punctuation.operator", regex: "\\,|\\." },
          { token: "storage.type", regex: "[\\-=]>" },
          {
            token: "keyword.operator",
            regex:
              "(?:[-+*/%<>&|^!?=]=|>>>=?|\\-\\-|\\+\\+|::|&&=|\\|\\|=|<<=|>>=|\\?\\.|\\.{2,3}|[!*+-=><])",
          },
          { token: "paren.lparen", regex: "[({[]" },
          { token: "paren.rparen", regex: "[\\]})]" },
          { token: "text", regex: "\\s+" },
        ],
        heregex: [
          { token: "string.regex", regex: ".*?///[imgy]{0,4}", next: "start" },
          { token: "comment.regex", regex: "\\s+(?:#.*)?" },
          { token: "string.regex", regex: "\\S+" },
        ],
        comment: [{ token: "comment", regex: "###", next: "start" }, { defaultToken: "comment" }],
      }),
        this.normalizeRules()
    }
    const r = e("../lib/oop")
    const i = e("./text_highlight_rules").TextHighlightRules
    r.inherits(s, i), (t.CoffeeHighlightRules = s)
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
    "ace/mode/coffee",
    [
      "require",
      "exports",
      "module",
      "ace/mode/coffee_highlight_rules",
      "ace/mode/matching_brace_outdent",
      "ace/mode/folding/coffee",
      "ace/range",
      "ace/mode/text",
      "ace/worker/worker_client",
      "ace/lib/oop",
    ],
    (e, t, n) => {
      function l() {
        ;(this.HighlightRules = r), (this.$outdent = new i()), (this.foldingRules = new s())
      }
      const r = e("./coffee_highlight_rules").CoffeeHighlightRules
      const i = e("./matching_brace_outdent").MatchingBraceOutdent
      const s = e("./folding/coffee").FoldMode
      const o = e("../range").Range
      const u = e("./text").Mode
      const a = e("../worker/worker_client").WorkerClient
      const f = e("../lib/oop")
      f.inherits(l, u),
        function () {
          const e =
            /(?:[({[=:]|[-=]>|\b(?:else|try|(?:swi|ca)tch(?:\s+[$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*)?|finally))\s*$|^\s*(else\b\s*)?(?:if|for|while|loop)\b(?!.*\bthen\b)/
          ;(this.lineCommentStart = "#"),
            (this.blockComment = { start: "###", end: "###" }),
            (this.getNextLineIndent = function (t, n, r) {
              let i = this.$getIndent(n)
              const s = this.getTokenizer().getLineTokens(n, t).tokens
              return (
                (!s.length || s[s.length - 1].type !== "comment") &&
                  t === "start" &&
                  e.test(n) &&
                  (i += r),
                i
              )
            }),
            (this.checkOutdent = function (e, t, n) {
              return this.$outdent.checkOutdent(t, n)
            }),
            (this.autoOutdent = function (e, t, n) {
              this.$outdent.autoOutdent(t, n)
            }),
            (this.createWorker = (e) => {
              const t = new a(["ace"], "ace/mode/coffee_worker", "Worker")
              return (
                t.attachToDocument(e.getDocument()),
                t.on("annotate", (t) => {
                  e.setAnnotations(t.data)
                }),
                t.on("terminate", () => {
                  e.clearAnnotations()
                }),
                t
              )
            }),
            (this.$id = "ace/mode/coffee"),
            (this.snippetFileId = "ace/snippets/coffee")
        }.call(l.prototype),
        (t.Mode = l)
    },
  )
;(() => {
  ace.require(["ace/mode/coffee"], (m) => {
    if (typeof module === "object" && typeof exports === "object" && module) {
      module.exports = m
    }
  })
})()
