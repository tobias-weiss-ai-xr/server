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
    "ace/mode/c_cpp_highlight_rules",
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
      const o = (t.cFunctions =
        "hypot|hypotf|hypotl|sscanf|system|snprintf|scanf|scalbn|scalbnf|scalbnl|scalbln|scalblnf|scalblnl|sin|sinh|sinhf|sinhl|sinf|sinl|signal|signbit|strstr|strspn|strncpy|strncat|strncmp|strcspn|strchr|strcoll|strcpy|strcat|strcmp|strtoimax|strtod|strtoul|strtoull|strtoumax|strtok|strtof|strtol|strtold|strtoll|strerror|strpbrk|strftime|strlen|strrchr|strxfrm|sprintf|setjmp|setvbuf|setlocale|setbuf|sqrt|sqrtf|sqrtl|swscanf|swprintf|srand|nearbyint|nearbyintf|nearbyintl|nexttoward|nexttowardf|nexttowardl|nextafter|nextafterf|nextafterl|nan|nanf|nanl|csin|csinh|csinhf|csinhl|csinf|csinl|csqrt|csqrtf|csqrtl|ccos|ccosh|ccoshf|ccosf|ccosl|cimag|cimagf|cimagl|ctime|ctan|ctanh|ctanhf|ctanhl|ctanf|ctanl|cos|cosh|coshf|coshl|cosf|cosl|conj|conjf|conjl|copysign|copysignf|copysignl|cpow|cpowf|cpowl|cproj|cprojf|cprojl|ceil|ceilf|ceill|cexp|cexpf|cexpl|clock|clog|clogf|clogl|clearerr|casin|casinh|casinhf|casinhl|casinf|casinl|cacos|cacosh|cacoshf|cacoshl|cacosf|cacosl|catan|catanh|catanhf|catanhl|catanf|catanl|calloc|carg|cargf|cargl|cabs|cabsf|cabsl|creal|crealf|creall|cbrt|cbrtf|cbrtl|time|toupper|tolower|tan|tanh|tanhf|tanhl|tanf|tanl|trunc|truncf|truncl|tgamma|tgammaf|tgammal|tmpnam|tmpfile|isspace|isnormal|isnan|iscntrl|isinf|isdigit|isunordered|isupper|ispunct|isprint|isfinite|iswspace|iswcntrl|iswctype|iswdigit|iswupper|iswpunct|iswprint|iswlower|iswalnum|iswalpha|iswgraph|iswxdigit|iswblank|islower|isless|islessequal|islessgreater|isalnum|isalpha|isgreater|isgreaterequal|isgraph|isxdigit|isblank|ilogb|ilogbf|ilogbl|imaxdiv|imaxabs|div|difftime|_Exit|ungetc|ungetwc|pow|powf|powl|puts|putc|putchar|putwc|putwchar|perror|printf|erf|erfc|erfcf|erfcl|erff|erfl|exit|exp|exp2|exp2f|exp2l|expf|expl|expm1|expm1f|expm1l|vsscanf|vsnprintf|vscanf|vsprintf|vswscanf|vswprintf|vprintf|vfscanf|vfprintf|vfwscanf|vfwprintf|vwscanf|vwprintf|va_start|va_copy|va_end|va_arg|qsort|fscanf|fsetpos|fseek|fclose|ftell|fopen|fdim|fdimf|fdiml|fpclassify|fputs|fputc|fputws|fputwc|fprintf|feholdexcept|fesetenv|fesetexceptflag|fesetround|feclearexcept|fetestexcept|feof|feupdateenv|feraiseexcept|ferror|fegetenv|fegetexceptflag|fegetround|fflush|fwscanf|fwide|fwprintf|fwrite|floor|floorf|floorl|fabs|fabsf|fabsl|fgets|fgetc|fgetpos|fgetws|fgetwc|freopen|free|fread|frexp|frexpf|frexpl|fmin|fminf|fminl|fmod|fmodf|fmodl|fma|fmaf|fmal|fmax|fmaxf|fmaxl|ldiv|ldexp|ldexpf|ldexpl|longjmp|localtime|localeconv|log|log1p|log1pf|log1pl|log10|log10f|log10l|log2|log2f|log2l|logf|logl|logb|logbf|logbl|labs|lldiv|llabs|llrint|llrintf|llrintl|llround|llroundf|llroundl|lrint|lrintf|lrintl|lround|lroundf|lroundl|lgamma|lgammaf|lgammal|wscanf|wcsstr|wcsspn|wcsncpy|wcsncat|wcsncmp|wcscspn|wcschr|wcscoll|wcscpy|wcscat|wcscmp|wcstoimax|wcstod|wcstoul|wcstoull|wcstoumax|wcstok|wcstof|wcstol|wcstold|wcstoll|wcstombs|wcspbrk|wcsftime|wcslen|wcsrchr|wcsrtombs|wcsxfrm|wctob|wctomb|wcrtomb|wprintf|wmemset|wmemchr|wmemcpy|wmemcmp|wmemmove|assert|asctime|asin|asinh|asinhf|asinhl|asinf|asinl|acos|acosh|acoshf|acoshl|acosf|acosl|atoi|atof|atol|atoll|atexit|atan|atanh|atanhf|atanhl|atan2|atan2f|atan2l|atanf|atanl|abs|abort|gets|getc|getchar|getenv|getwc|getwchar|gmtime|rint|rintf|rintl|round|roundf|roundl|rename|realloc|rewind|remove|remquo|remquof|remquol|remainder|remainderf|remainderl|rand|raise|bsearch|btowc|modf|modff|modfl|memset|memchr|memcpy|memcmp|memmove|mktime|malloc|mbsinit|mbstowcs|mbsrtowcs|mbtowc|mblen|mbrtowc|mbrlen")
      const u = function (e) {
        const t =
          "break|case|continue|default|do|else|for|goto|if|_Pragma|return|switch|while|catch|operator|try|throw|using"
        const n =
          "asm|__asm__|auto|bool|_Bool|char|_Complex|double|enum|float|_Imaginary|int|int8_t|int16_t|int32_t|int64_t|long|short|signed|size_t|struct|typedef|uint8_t|uint16_t|uint32_t|uint64_t|union|unsigned|void|class|wchar_t|template|char16_t|char32_t"
        const r =
          "const|extern|register|restrict|static|volatile|inline|private|protected|public|friend|explicit|virtual|export|mutable|typename|constexpr|new|delete|alignas|alignof|decltype|noexcept|thread_local"
        const s =
          "and|and_eq|bitand|bitor|compl|not|not_eq|or|or_eq|typeid|xor|xor_eq|const_cast|dynamic_cast|reinterpret_cast|static_cast|sizeof|namespace"
        const u = "NULL|true|false|TRUE|FALSE|nullptr"
        const a = (this.$keywords = this.createKeywordMapper(
          Object.assign(
            {
              "keyword.control": t,
              "storage.type": n,
              "storage.modifier": r,
              "keyword.operator": s,
              "variable.language": "this",
              "constant.language": u,
              "support.function.C99.c": o,
            },
            e,
          ),
          "identifier",
        ))
        const f = "[a-zA-Z\\$_\u00a1-\uffff][a-zA-Z\\d\\$_\u00a1-\uffff]*\\b"
        const l = /\\(?:['"?\\abfnrtv]|[0-7]{1,3}|x[a-fA-F\d]{2}|u[a-fA-F\d]{4}U[a-fA-F\d]{8}|.)/
          .source
        const c = `%${/(\d+\$)?/.source}${/[#0\- +']*/.source}${/[,;:_]?/.source}${/((-?\d+)|\*(-?\d+\$)?)?/.source}${/(\.((-?\d+)|\*(-?\d+\$)?)?)?/.source}${/(hh|h|ll|l|j|t|z|q|L|vh|vl|v|hv|hl)?/.source}${/(\[[^"\]]+\]|[diouxXDOUeEfFgGaACcSspn%])/.source}`
        ;(this.$rules = {
          start: [
            { token: "comment", regex: "//$", next: "start" },
            { token: "comment", regex: "//", next: "singleLineComment" },
            i.getStartRule("doc-start"),
            { token: "comment", regex: "\\/\\*", next: "comment" },
            { token: "string", regex: `'(?:${l}|.)?'` },
            {
              token: "string.start",
              regex: '"',
              stateName: "qqstring",
              next: [
                { token: "string", regex: /\\\s*$/, next: "qqstring" },
                { token: "constant.language.escape", regex: l },
                { token: "constant.language.escape", regex: c },
                { token: "string.end", regex: '"|$', next: "start" },
                { defaultToken: "string" },
              ],
            },
            {
              token: "string.start",
              regex: 'R"\\(',
              stateName: "rawString",
              next: [
                { token: "string.end", regex: '\\)"', next: "start" },
                { defaultToken: "string" },
              ],
            },
            {
              token: "constant.numeric",
              regex: "0[xX][0-9a-fA-F]+(L|l|UL|ul|u|U|F|f|ll|LL|ull|ULL)?\\b",
            },
            {
              token: "constant.numeric",
              regex:
                "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?(L|l|UL|ul|u|U|F|f|ll|LL|ull|ULL)?\\b",
            },
            {
              token: "keyword",
              regex: "#\\s*(?:include|import|pragma|line|define|undef)\\b",
              next: "directive",
            },
            { token: "keyword", regex: "#\\s*(?:endif|if|ifdef|else|elif|ifndef)\\b" },
            { token: a, regex: "[a-zA-Z_$][a-zA-Z0-9_$]*" },
            {
              token: "keyword.operator",
              regex: /--|\+\+|<<=|>>=|>>>=|<>|&&|\|\||\?:|[*%\/+\-&\^|~!<>=]=?/,
            },
            { token: "punctuation.operator", regex: "\\?|\\:|\\,|\\;|\\." },
            { token: "paren.lparen", regex: "[[({]" },
            { token: "paren.rparen", regex: "[\\])}]" },
            { token: "text", regex: "\\s+" },
          ],
          comment: [
            { token: "comment", regex: "\\*\\/", next: "start" },
            { defaultToken: "comment" },
          ],
          singleLineComment: [
            { token: "comment", regex: /\\$/, next: "singleLineComment" },
            { token: "comment", regex: /$/, next: "start" },
            { defaultToken: "comment" },
          ],
          directive: [
            { token: "constant.other.multiline", regex: /\\/ },
            { token: "constant.other.multiline", regex: /.*\\/ },
            { token: "constant.other", regex: "\\s*<.+?>", next: "start" },
            {
              token: "constant.other",
              regex: '\\s*["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]',
              next: "start",
            },
            {
              token: "constant.other",
              regex: "\\s*['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']",
              next: "start",
            },
            { token: "constant.other", regex: /[^\\\/]+/, next: "start" },
          ],
        }),
          this.embedRules(i, "doc-", [i.getEndRule("start")]),
          this.normalizeRules()
      }
      r.inherits(u, s), (t.c_cppHighlightRules = u)
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
    "ace/mode/c_cpp",
    [
      "require",
      "exports",
      "module",
      "ace/lib/oop",
      "ace/mode/text",
      "ace/mode/c_cpp_highlight_rules",
      "ace/mode/matching_brace_outdent",
      "ace/mode/folding/cstyle",
    ],
    (e, t, n) => {
      const r = e("../lib/oop")
      const i = e("./text").Mode
      const s = e("./c_cpp_highlight_rules").c_cppHighlightRules
      const o = e("./matching_brace_outdent").MatchingBraceOutdent
      const u = e("./folding/cstyle").FoldMode
      const a = function () {
        ;(this.HighlightRules = s),
          (this.$outdent = new o()),
          (this.$behaviour = this.$defaultBehaviour),
          (this.foldingRules = new u())
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
              } else if (e === "doc-start") {
                if (o === "start") return ""
                const u = t.match(/^\s*(\/?)\*/)
                u && (u[1] && (r += " "), (r += "* "))
              }
              return r
            }),
            (this.checkOutdent = function (e, t, n) {
              return this.$outdent.checkOutdent(t, n)
            }),
            (this.autoOutdent = function (e, t, n) {
              this.$outdent.autoOutdent(t, n)
            }),
            (this.$id = "ace/mode/c_cpp"),
            (this.snippetFileId = "ace/snippets/c_cpp")
        }.call(a.prototype),
        (t.Mode = a)
    },
  ),
  ace.define(
    "ace/mode/glsl_highlight_rules",
    ["require", "exports", "module", "ace/lib/oop", "ace/mode/c_cpp_highlight_rules"],
    (e, t, n) => {
      const r = e("../lib/oop")
      const i = e("./c_cpp_highlight_rules").c_cppHighlightRules
      const s = function () {
        const e =
          "attribute|const|uniform|varying|break|continue|do|for|while|if|else|in|out|inout|float|int|void|bool|true|false|lowp|mediump|highp|precision|invariant|discard|return|mat2|mat3|mat4|vec2|vec3|vec4|ivec2|ivec3|ivec4|bvec2|bvec3|bvec4|sampler2D|samplerCube|struct"
        const t =
          "radians|degrees|sin|cos|tan|asin|acos|atan|pow|exp|log|exp2|log2|sqrt|inversesqrt|abs|sign|floor|ceil|fract|mod|min|max|clamp|mix|step|smoothstep|length|distance|dot|cross|normalize|faceforward|reflect|refract|matrixCompMult|lessThan|lessThanEqual|greaterThan|greaterThanEqual|equal|notEqual|any|all|not|dFdx|dFdy|fwidth|texture2D|texture2DProj|texture2DLod|texture2DProjLod|textureCube|textureCubeLod|gl_MaxVertexAttribs|gl_MaxVertexUniformVectors|gl_MaxVaryingVectors|gl_MaxVertexTextureImageUnits|gl_MaxCombinedTextureImageUnits|gl_MaxTextureImageUnits|gl_MaxFragmentUniformVectors|gl_MaxDrawBuffers|gl_DepthRangeParameters|gl_DepthRange|gl_Position|gl_PointSize|gl_FragCoord|gl_FrontFacing|gl_PointCoord|gl_FragColor|gl_FragData"
        const n = this.createKeywordMapper(
          { "variable.language": "this", keyword: e, "constant.language": t },
          "identifier",
        )
        ;(this.$rules = new i().$rules),
          this.$rules.start.forEach((e) => {
            typeof e.token === "function" && (e.token = n)
          })
      }
      r.inherits(s, i), (t.glslHighlightRules = s)
    },
  ),
  ace.define(
    "ace/mode/glsl",
    [
      "require",
      "exports",
      "module",
      "ace/lib/oop",
      "ace/mode/c_cpp",
      "ace/mode/glsl_highlight_rules",
      "ace/mode/matching_brace_outdent",
      "ace/mode/folding/cstyle",
    ],
    (e, t, n) => {
      const r = e("../lib/oop")
      const i = e("./c_cpp").Mode
      const s = e("./glsl_highlight_rules").glslHighlightRules
      const o = e("./matching_brace_outdent").MatchingBraceOutdent
      const u = e("./folding/cstyle").FoldMode
      const a = function () {
        ;(this.HighlightRules = s),
          (this.$outdent = new o()),
          (this.$behaviour = this.$defaultBehaviour),
          (this.foldingRules = new u())
      }
      r.inherits(a, i),
        function () {
          this.$id = "ace/mode/glsl"
        }.call(a.prototype),
        (t.Mode = a)
    },
  )
;(() => {
  ace.require(["ace/mode/glsl"], (m) => {
    if (typeof module === "object" && typeof exports === "object" && module) {
      module.exports = m
    }
  })
})()
