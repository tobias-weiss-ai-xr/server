ace.define(
  "ace/snippets",
  [
    "require",
    "exports",
    "module",
    "ace/lib/dom",
    "ace/lib/oop",
    "ace/lib/event_emitter",
    "ace/lib/lang",
    "ace/range",
    "ace/range_list",
    "ace/keyboard/hash_handler",
    "ace/tokenizer",
    "ace/clipboard",
    "ace/editor",
  ],
  (e, t, n) => {
    function p(e) {
      const t = new Date().toLocaleString("en-us", e)
      return t.length === 1 ? `0${t}` : t
    }
    const r = e("./lib/dom")
    const i = e("./lib/oop")
    let s = e("./lib/event_emitter").EventEmitter
    const o = e("./lib/lang")
    const u = e("./range").Range
    const a = e("./range_list").RangeList
    const f = e("./keyboard/hash_handler").HashHandler
    const l = e("./tokenizer").Tokenizer
    const c = e("./clipboard")
    const h = {
      CURRENT_WORD: (e) => e.session.getTextRange(e.session.getWordRange()),
      SELECTION: (e, t, n) => {
        const r = e.session.getTextRange()
        return n ? r.replace(/\n\r?([ \t]*\S)/g, `\n${n}$1`) : r
      },
      CURRENT_LINE: (e) => e.session.getLine(e.getCursorPosition().row),
      PREV_LINE: (e) => e.session.getLine(e.getCursorPosition().row - 1),
      LINE_INDEX: (e) => e.getCursorPosition().row,
      LINE_NUMBER: (e) => e.getCursorPosition().row + 1,
      SOFT_TABS: (e) => (e.session.getUseSoftTabs() ? "YES" : "NO"),
      TAB_SIZE: (e) => e.session.getTabSize(),
      CLIPBOARD: (e) => c.getText?.(),
      FILENAME: function (e) {
        return /[^/\\]*$/.exec(this.FILEPATH(e))[0]
      },
      FILENAME_BASE: function (e) {
        return /[^/\\]*$/.exec(this.FILEPATH(e))[0].replace(/\.[^.]*$/, "")
      },
      DIRECTORY: function (e) {
        return this.FILEPATH(e).replace(/[^/\\]*$/, "")
      },
      FILEPATH: (e) => "/not implemented.txt",
      WORKSPACE_NAME: () => "Unknown",
      FULLNAME: () => "Unknown",
      BLOCK_COMMENT_START: (e) => {
        const t = e.session.$mode || {}
        return t.blockComment?.start || ""
      },
      BLOCK_COMMENT_END: (e) => {
        const t = e.session.$mode || {}
        return t.blockComment?.end || ""
      },
      LINE_COMMENT: (e) => {
        const t = e.session.$mode || {}
        return t.lineCommentStart || ""
      },
      CURRENT_YEAR: p.bind(null, { year: "numeric" }),
      CURRENT_YEAR_SHORT: p.bind(null, { year: "2-digit" }),
      CURRENT_MONTH: p.bind(null, { month: "numeric" }),
      CURRENT_MONTH_NAME: p.bind(null, { month: "long" }),
      CURRENT_MONTH_NAME_SHORT: p.bind(null, { month: "short" }),
      CURRENT_DATE: p.bind(null, { day: "2-digit" }),
      CURRENT_DAY_NAME: p.bind(null, { weekday: "long" }),
      CURRENT_DAY_NAME_SHORT: p.bind(null, { weekday: "short" }),
      CURRENT_HOUR: p.bind(null, { hour: "2-digit", hour12: !1 }),
      CURRENT_MINUTE: p.bind(null, { minute: "2-digit" }),
      CURRENT_SECOND: p.bind(null, { second: "2-digit" }),
    }
    h.SELECTED_TEXT = h.SELECTION
    const d = (() => {
      function e() {
        ;(this.snippetMap = {}), (this.snippetNameMap = {}), (this.variables = h)
      }
      return (
        (e.prototype.getTokenizer = function () {
          return e.$tokenizer || this.createTokenizer()
        }),
        (e.prototype.createTokenizer = () => {
          function t(e) {
            return (
              (e = e.substr(1)),
              /^\d+$/.test(e) ? [{ tabstopId: Number.parseInt(e, 10) }] : [{ text: e }]
            )
          }
          function n(e) {
            return `(?:[^\\\\${e}]|\\\\.)`
          }
          const r = {
            regex: `/(${n("/")}+)/`,
            onMatch: (e, t, n) => {
              const r = n[0]
              return (r.fmtString = !0), (r.guard = e.slice(1, -1)), (r.flag = ""), ""
            },
            next: "formatString",
          }
          return (
            (e.$tokenizer = new l({
              start: [
                {
                  regex: /\\./,
                  onMatch: (e, t, n) => {
                    const r = e[1]
                    return (
                      r === "}" && n.length ? (e = r) : "`$\\".indexOf(r) !== -1 && (e = r), [e]
                    )
                  },
                },
                { regex: /}/, onMatch: (e, t, n) => [n.length ? n.shift() : e] },
                { regex: /\$(?:\d+|\w+)/, onMatch: t },
                {
                  regex: /\$\{[\dA-Z_a-z]+/,
                  onMatch: (e, n, r) => {
                    const i = t(e.substr(1))
                    return r.unshift(i[0]), i
                  },
                  next: "snippetVar",
                },
                { regex: /\n/, token: "newline", merge: !1 },
              ],
              snippetVar: [
                {
                  regex: `\\|${n("\\|")}*\\|`,
                  onMatch: (e, t, n) => {
                    const r = e
                      .slice(1, -1)
                      .replace(/\\[,|\\]|,/g, (e) => (e.length === 2 ? e[1] : "\0"))
                      .split("\0")
                      .map((e) => ({ value: e }))
                    return (n[0].choices = r), [r[0]]
                  },
                  next: "start",
                },
                r,
                { regex: "([^:}\\\\]|\\\\.)*:?", token: "", next: "start" },
              ],
              formatString: [
                {
                  regex: /:/,
                  onMatch: (e, t, n) =>
                    n.length && n[0].expectElse
                      ? ((n[0].expectElse = !1), (n[0].ifEnd = { elseEnd: n[0] }), [n[0].ifEnd])
                      : ":",
                },
                {
                  regex: /\\./,
                  onMatch: (e, t, n) => {
                    const r = e[1]
                    return (
                      r === "}" && n.length
                        ? (e = r)
                        : "`$\\".indexOf(r) !== -1
                          ? (e = r)
                          : r === "n"
                            ? (e = "\n")
                            : r === "t"
                              ? (e = "	")
                              : "ulULE".indexOf(r) !== -1 &&
                                (e = { changeCase: r, local: r > "a" }),
                      [e]
                    )
                  },
                },
                {
                  regex: "/\\w*}",
                  onMatch: function (e, t, n) {
                    const r = n.shift()
                    return (
                      r && (r.flag = e.slice(1, -1)),
                      (this.next = r?.tabstopId ? "start" : ""),
                      [r || e]
                    )
                  },
                  next: "start",
                },
                { regex: /\$(?:\d+|\w+)/, onMatch: (e, t, n) => [{ text: e.slice(1) }] },
                {
                  regex: /\${\w+/,
                  onMatch: (e, t, n) => {
                    const r = { text: e.slice(2) }
                    return n.unshift(r), [r]
                  },
                  next: "formatStringVar",
                },
                { regex: /\n/, token: "newline", merge: !1 },
                {
                  regex: /}/,
                  onMatch: function (e, t, n) {
                    const r = n.shift()
                    return (this.next = r?.tabstopId ? "start" : ""), [r || e]
                  },
                  next: "start",
                },
              ],
              formatStringVar: [
                {
                  regex: /:\/\w+}/,
                  onMatch: (e, t, n) => {
                    const r = n[0]
                    return (r.formatFunction = e.slice(2, -1)), [n.shift()]
                  },
                  next: "formatString",
                },
                r,
                {
                  regex: /:[\?\-+]?/,
                  onMatch: (e, t, n) => {
                    e[1] === "+" && (n[0].ifEnd = n[0]), e[1] === "?" && (n[0].expectElse = !0)
                  },
                  next: "formatString",
                },
                { regex: "([^:}\\\\]|\\\\.)*:?", token: "", next: "formatString" },
              ],
            })),
            e.$tokenizer
          )
        }),
        (e.prototype.tokenizeTmSnippet = function (e, t) {
          return this.getTokenizer()
            .getLineTokens(e, t)
            .tokens.map((e) => e.value || e)
        }),
        (e.prototype.getVariableValue = function (e, t, n) {
          if (/^\d+$/.test(t)) returnthis.variables.__?.[t] || ""
          if (/^[A-Z]\d+$/.test(t)) returnthis.variables[`${t[0]}__`]?.[t.substr(1)] || ""
          t = t.replace(/^TM_/, "")
          if (!this.variables.hasOwnProperty(t)) return ""
          let r = this.variables[t]
          return typeof r === "function" && (r = this.variables[t](e, t, n)), r == null ? "" : r
        }),
        (e.prototype.tmStrFormat = function (e, t, n) {
          if (!t.fmt) return e
          const r = t.flag || ""
          let i = t.guard
          i = new RegExp(i, r.replace(/[^gim]/g, ""))
          const s =
            typeof t.fmt === "string" ? this.tokenizeTmSnippet(t.fmt, "formatString") : t.fmt
          const u = e.replace(i, () => {
            const e = this.variables.__
            this.variables.__ = [].slice.call(arguments)
            const t = this.resolveVariables(s, n)
            let r = "E"
            for (let i = 0; i < t.length; i++) {
              const u = t[i]
              if (typeof u === "object") {
                t[i] = ""
                if (u.changeCase && u.local) {
                  const a = t[i + 1]
                  a &&
                    typeof a === "string" &&
                    (u.changeCase === "u"
                      ? (t[i] = a[0].toUpperCase())
                      : (t[i] = a[0].toLowerCase()),
                    (t[i + 1] = a.substr(1)))
                } else u.changeCase && (r = u.changeCase)
              } else r === "U" ? (t[i] = u.toUpperCase()) : r === "L" && (t[i] = u.toLowerCase())
            }
            return (this.variables.__ = e), t.join("")
          })
          return u
        }),
        (e.prototype.tmFormatFunction = (e, t, n) =>
          t.formatFunction === "upcase"
            ? e.toUpperCase()
            : t.formatFunction === "downcase"
              ? e.toLowerCase()
              : e),
        (e.prototype.resolveVariables = function (e, t) {
          function f(t) {
            const n = e.indexOf(t, s + 1)
            n !== -1 && (s = n)
          }
          const n = []
          let r = ""
          let i = !0
          for (let s = 0; s < e.length; s++) {
            const o = e[s]
            if (typeof o === "string") {
              n.push(o),
                o === "\n"
                  ? ((i = !0), (r = ""))
                  : i && ((r = /^\t*/.exec(o)[0]), (i = /\S/.test(o)))
              continue
            }
            if (!o) continue
            i = !1
            if (o.fmtString) {
              let u = e.indexOf(o, s + 1)
              u === -1 && (u = e.length), (o.fmt = e.slice(s + 1, u)), (s = u)
            }
            if (o.text) {
              let a = `${this.getVariableValue(t, o.text, r)}`
              o.fmtString && (a = this.tmStrFormat(a, o, t)),
                o.formatFunction && (a = this.tmFormatFunction(a, o, t)),
                a && !o.ifEnd ? (n.push(a), f(o)) : !a && o.ifEnd && f(o.ifEnd)
            } else
              o.elseEnd
                ? f(o.elseEnd)
                : o.tabstopId != null
                  ? n.push(o)
                  : o.changeCase != null && n.push(o)
          }
          return n
        }),
        (e.prototype.getDisplayTextForSnippet = function (e, t) {
          const n = v.call(this, e, t)
          return n.text
        }),
        (e.prototype.insertSnippetForSelection = function (e, t, n) {
          n === void 0 && (n = {})
          const r = v.call(this, e, t, n)
          const i = e.getSelectionRange()
          const s = e.session.replace(i, r.text)
          const o = new m(e)
          const u = e.inVirtualSelectionMode && e.selection.index
          o.addTabstops(r.tabstops, i.start, s, u)
        }),
        (e.prototype.insertSnippet = function (e, t, n) {
          n === void 0 && (n = {})
          if (e.inVirtualSelectionMode) return this.insertSnippetForSelection(e, t, n)
          e.forEachSelection(
            () => {
              this.insertSnippetForSelection(e, t, n)
            },
            null,
            { keepOrder: !0 },
          ),
            e.tabstopManager?.tabNext()
        }),
        (e.prototype.$getScope = (e) => {
          let t = e.session.$mode.$id || ""
          t = t.split("/").pop()
          if (t === "html" || t === "php") {
            t === "php" && !e.session.$mode.inlinePhp && (t = "html")
            const n = e.getCursorPosition()
            let r = e.session.getState(n.row)
            typeof r === "object" && (r = r[0]),
              r.substring &&
                (r.substring(0, 3) === "js-"
                  ? (t = "javascript")
                  : r.substring(0, 4) === "css-"
                    ? (t = "css")
                    : r.substring(0, 4) === "php-" && (t = "php"))
          }
          return t
        }),
        (e.prototype.getActiveScopes = function (e) {
          const t = this.$getScope(e)
          const n = [t]
          const r = this.snippetMap
          return r[t]?.includeScopes && n.push.apply(n, r[t].includeScopes), n.push("_"), n
        }),
        (e.prototype.expandWithTab = function (e, t) {
          const r = e.forEachSelection(() => this.expandSnippetForSelection(e, t), null, {
            keepOrder: !0,
          })
          return r && e.tabstopManager && e.tabstopManager.tabNext(), r
        }),
        (e.prototype.expandSnippetForSelection = function (e, t) {
          const n = e.getCursorPosition()
          const r = e.session.getLine(n.row)
          const i = r.substring(0, n.column)
          const s = r.substr(n.column)
          const o = this.snippetMap
          let u
          return (
            this.getActiveScopes(e).some(function (e) {
              const t = o[e]
              return t && (u = this.findMatchingSnippet(t, i, s)), !!u
            }, this),
            u
              ? t?.dryRun
                ? !0
                : (e.session.doc.removeInLine(
                    n.row,
                    n.column - u.replaceBefore.length,
                    n.column + u.replaceAfter.length,
                  ),
                  (this.variables.M__ = u.matchBefore),
                  (this.variables.T__ = u.matchAfter),
                  this.insertSnippetForSelection(e, u.content),
                  (this.variables.M__ = this.variables.T__ = null),
                  !0)
              : !1
          )
        }),
        (e.prototype.findMatchingSnippet = (e, t, n) => {
          for (let r = e.length; r--; ) {
            const i = e[r]
            if (i.startRe && !i.startRe.test(t)) continue
            if (i.endRe && !i.endRe.test(n)) continue
            if (!i.startRe && !i.endRe) continue
            return (
              (i.matchBefore = i.startRe ? i.startRe.exec(t) : [""]),
              (i.matchAfter = i.endRe ? i.endRe.exec(n) : [""]),
              (i.replaceBefore = i.triggerRe ? i.triggerRe.exec(t)[0] : ""),
              (i.replaceAfter = i.endTriggerRe ? i.endTriggerRe.exec(n)[0] : ""),
              i
            )
          }
        }),
        (e.prototype.register = function (e, t) {
          function s(e) {
            return e && !/^\^?\(.*\)\$?$|^\\b$/.test(e) && (e = `(?:${e})`), e || ""
          }
          function u(e, t, n) {
            return (
              (e = s(e)),
              (t = s(t)),
              n
                ? ((e = t + e), e && e[e.length - 1] !== "$" && (e += "$"))
                : ((e += t), e && e[0] !== "^" && (e = `^${e}`)),
              new RegExp(e)
            )
          }
          function a(e) {
            e.scope || (e.scope = t || "_"), (t = e.scope), n[t] || ((n[t] = []), (r[t] = {}))
            const s = r[t]
            if (e.name) {
              const a = s[e.name]
              a && i.unregister(a), (s[e.name] = e)
            }
            n[t].push(e),
              e.prefix && (e.tabTrigger = e.prefix),
              !e.content &&
                e.body &&
                (e.content = Array.isArray(e.body) ? e.body.join("\n") : e.body),
              e.tabTrigger &&
                !e.trigger &&
                (!e.guard && /^\w/.test(e.tabTrigger) && (e.guard = "\\b"),
                (e.trigger = o.escapeRegExp(e.tabTrigger)))
            if (!e.trigger && !e.guard && !e.endTrigger && !e.endGuard) return
            ;(e.startRe = u(e.trigger, e.guard, !0)),
              (e.triggerRe = new RegExp(e.trigger)),
              (e.endRe = u(e.endTrigger, e.endGuard, !0)),
              (e.endTriggerRe = new RegExp(e.endTrigger))
          }
          const n = this.snippetMap
          const r = this.snippetNameMap
          e || (e = []),
            Array.isArray(e)
              ? e.forEach(a)
              : Object.keys(e).forEach((t) => {
                  a(e[t])
                }),
            this._signal("registerSnippets", { scope: t })
        }),
        (e.prototype.unregister = function (e, t) {
          function i(e) {
            const i = r[e.scope || t]
            if (i?.[e.name]) {
              delete i[e.name]
              const s = n[e.scope || t]
              const o = s?.indexOf(e)
              o >= 0 && s.splice(o, 1)
            }
          }
          const n = this.snippetMap
          const r = this.snippetNameMap
          e.content ? i(e) : Array.isArray(e) && e.forEach(i)
        }),
        (e.prototype.parseSnippetFile = (e) => {
          e = e.replace(/\r/g, "")
          const t = []
          let n = {}
          const r = /^#.*|^({[\s\S]*})\s*$|^(\S+) (.*)$|^((?:\n*\t.*)+)/gm
          let i
          while ((i = r.exec(e))) {
            if (i[1])
              try {
                ;(n = JSON.parse(i[1])), t.push(n)
              } catch (s) {}
            if (i[4]) (n.content = i[4].replace(/^\t/gm, "")), t.push(n), (n = {})
            else {
              const o = i[2]
              const u = i[3]
              if (o === "regex") {
                const a = /\/((?:[^\/\\]|\\.)*)|$/g
                ;(n.guard = a.exec(u)[1]),
                  (n.trigger = a.exec(u)[1]),
                  (n.endTrigger = a.exec(u)[1]),
                  (n.endGuard = a.exec(u)[1])
              } else
                o === "snippet"
                  ? ((n.tabTrigger = u.match(/^\S*/)[0]), n.name || (n.name = u))
                  : o && (n[o] = u)
            }
          }
          return t
        }),
        (e.prototype.getSnippetByName = function (e, t) {
          const n = this.snippetNameMap
          let r
          return (
            this.getActiveScopes(t).some((t) => {
              const i = n[t]
              return i && (r = i[e]), !!r
            }, this),
            r
          )
        }),
        e
      )
    })()
    i.implement(d.prototype, s)
    const v = function (e, t, n) {
      function l(e) {
        const t = []
        for (let n = 0; n < e.length; n++) {
          let r = e[n]
          if (typeof r === "object") {
            if (f[r.tabstopId]) continue
            const i = e.lastIndexOf(r, n - 1)
            r = t[i] || { tabstopId: r.tabstopId }
          }
          t[n] = r
        }
        return t
      }
      n === void 0 && (n = {})
      const r = e.getCursorPosition()
      const i = e.session.getLine(r.row)
      const s = e.session.getTabString()
      let o = i.match(/^\s*/)[0]
      r.column < o.length && (o = o.slice(0, r.column)), (t = t.replace(/\r/g, ""))
      let u = this.tokenizeTmSnippet(t)
      ;(u = this.resolveVariables(u, e)),
        (u = u.map((e) =>
          e === "\n" && !n.excludeExtraIndent
            ? e + o
            : typeof e === "string"
              ? e.replace(/\t/g, s)
              : e,
        ))
      const a = []
      u.forEach((e, t) => {
        if (typeof e !== "object") return
        const n = e.tabstopId
        let r = a[n]
        r || ((r = a[n] = []), (r.index = n), (r.value = ""), (r.parents = {}))
        if (r.indexOf(e) !== -1) return
        e.choices && !r.choices && (r.choices = e.choices), r.push(e)
        const i = u.indexOf(e, t + 1)
        if (i === -1) return
        const s = u.slice(t + 1, i)
        const o = s.some((e) => typeof e === "object")
        o && !r.value
          ? (r.value = s)
          : s.length && (!r.value || typeof r.value !== "string") && (r.value = s.join(""))
      }),
        a.forEach((e) => {
          e.length = 0
        })
      const f = {}
      for (let c = 0; c < u.length; c++) {
        const h = u[c]
        if (typeof h !== "object") continue
        const p = h.tabstopId
        const d = a[p]
        const v = u.indexOf(h, c + 1)
        if (f[p]) {
          f[p] === h &&
            (delete f[p],
            Object.keys(f).forEach((e) => {
              d.parents[e] = !0
            }))
          continue
        }
        f[p] = h
        let m = d.value
        typeof m !== "string" ? (m = l(m)) : h.fmt && (m = this.tmStrFormat(m, h, e)),
          u.splice.apply(u, [c + 1, Math.max(0, v - c)].concat(m, h)),
          d.indexOf(h) === -1 && d.push(h)
      }
      let g = 0
      let y = 0
      let b = ""
      return (
        u.forEach((e) => {
          if (typeof e === "string") {
            const t = e.split("\n")
            t.length > 1 ? ((y = t[t.length - 1].length), (g += t.length - 1)) : (y += e.length),
              (b += e)
          } else
            e && (e.start ? (e.end = { row: g, column: y }) : (e.start = { row: g, column: y }))
        }),
        { text: b, tabstops: a, tokens: u }
      )
    }
    const m = (() => {
      function e(e) {
        ;(this.index = 0), (this.ranges = []), (this.tabstops = [])
        if (e.tabstopManager) return e.tabstopManager
        ;(e.tabstopManager = this),
          (this.$onChange = this.onChange.bind(this)),
          (this.$onChangeSelection = o.delayedCall(this.onChangeSelection.bind(this)).schedule),
          (this.$onChangeSession = this.onChangeSession.bind(this)),
          (this.$onAfterExec = this.onAfterExec.bind(this)),
          this.attach(e)
      }
      return (
        (e.prototype.attach = function (e) {
          ;(this.$openTabstops = null),
            (this.selectedTabstop = null),
            (this.editor = e),
            (this.session = e.session),
            this.editor.on("change", this.$onChange),
            this.editor.on("changeSelection", this.$onChangeSelection),
            this.editor.on("changeSession", this.$onChangeSession),
            this.editor.commands.on("afterExec", this.$onAfterExec),
            this.editor.keyBinding.addKeyboardHandler(this.keyboardHandler)
        }),
        (e.prototype.detach = function () {
          this.tabstops.forEach(this.removeTabstopMarkers, this),
            (this.ranges.length = 0),
            (this.tabstops.length = 0),
            (this.selectedTabstop = null),
            this.editor.off("change", this.$onChange),
            this.editor.off("changeSelection", this.$onChangeSelection),
            this.editor.off("changeSession", this.$onChangeSession),
            this.editor.commands.off("afterExec", this.$onAfterExec),
            this.editor.keyBinding.removeKeyboardHandler(this.keyboardHandler),
            (this.editor.tabstopManager = null),
            (this.session = null),
            (this.editor = null)
        }),
        (e.prototype.onChange = function (e) {
          const t = e.action[0] === "r"
          const n = this.selectedTabstop || {}
          const r = n.parents || {}
          const i = this.tabstops.slice()
          for (let s = 0; s < i.length; s++) {
            const o = i[s]
            const u = o === n || r[o.index]
            o.rangeList.$bias = u ? 0 : 1
            if (e.action === "remove" && o !== n) {
              const a = o.parents?.[n.index]
              let f = o.rangeList.pointIndex(e.start, a)
              f = f < 0 ? -f - 1 : f + 1
              let l = o.rangeList.pointIndex(e.end, a)
              l = l < 0 ? -l - 1 : l - 1
              const c = o.rangeList.ranges.slice(f, l)
              for (let h = 0; h < c.length; h++) this.removeRange(c[h])
            }
            o.rangeList.$onChange(e)
          }
          const p = this.session
          !this.$inChange && t && p.getLength() === 1 && !p.getValue() && this.detach()
        }),
        (e.prototype.updateLinkedFields = function () {
          const e = this.selectedTabstop
          if (!e || !e.hasLinkedRanges || !e.firstNonLinked) return
          this.$inChange = !0
          const n = this.session
          const r = n.getTextRange(e.firstNonLinked)
          for (let i = 0; i < e.length; i++) {
            const s = e[i]
            if (!s.linked) continue
            const o = s.original
            const u = t.snippetManager.tmStrFormat(r, o, this.editor)
            n.replace(s, u)
          }
          this.$inChange = !1
        }),
        (e.prototype.onAfterExec = function (e) {
          e.command && !e.command.readOnly && this.updateLinkedFields()
        }),
        (e.prototype.onChangeSelection = function () {
          if (!this.editor) return
          const e = this.editor.selection.lead
          const t = this.editor.selection.anchor
          const n = this.editor.selection.isEmpty()
          for (let r = 0; r < this.ranges.length; r++) {
            if (this.ranges[r].linked) continue
            const i = this.ranges[r].contains(e.row, e.column)
            const s = n || this.ranges[r].contains(t.row, t.column)
            if (i && s) return
          }
          this.detach()
        }),
        (e.prototype.onChangeSession = function () {
          this.detach()
        }),
        (e.prototype.tabNext = function (e) {
          const t = this.tabstops.length
          let n = this.index + (e || 1)
          ;(n = Math.min(Math.max(n, 1), t)),
            n === t && (n = 0),
            this.selectTabstop(n),
            this.updateTabstopMarkers(),
            n === 0 && this.detach()
        }),
        (e.prototype.selectTabstop = function (e) {
          this.$openTabstops = null
          let t = this.tabstops[this.index]
          t && this.addTabstopMarkers(t), (this.index = e), (t = this.tabstops[this.index])
          if (!t || !t.length) return
          this.selectedTabstop = t
          const n = t.firstNonLinked || t
          t.choices && (n.cursor = n.start)
          if (!this.editor.inVirtualSelectionMode) {
            const r = this.editor.multiSelect
            r.toSingleRange(n)
            for (let i = 0; i < t.length; i++) {
              if (t.hasLinkedRanges && t[i].linked) continue
              r.addRange(t[i].clone(), !0)
            }
          } else this.editor.selection.fromOrientedRange(n)
          this.editor.keyBinding.addKeyboardHandler(this.keyboardHandler),
            this.selectedTabstop?.choices &&
              this.editor.execCommand("startAutocomplete", {
                matches: this.selectedTabstop.choices,
              })
        }),
        (e.prototype.addTabstops = function (e, t, n) {
          const r = this.useLink || !this.editor.getOption("enableMultiselect")
          this.$openTabstops || (this.$openTabstops = [])
          if (!e[0]) {
            const i = u.fromPoints(n, n)
            y(i.start, t), y(i.end, t), (e[0] = [i]), (e[0].index = 0)
          }
          const s = this.index
          const o = [s + 1, 0]
          const f = this.ranges
          const l = (this.snippetId = (this.snippetId || 0) + 1)
          e.forEach(function (e, n) {
            const i = this.$openTabstops[n] || e
            i.snippetId = l
            for (let s = 0; s < e.length; s++) {
              const c = e[s]
              const h = u.fromPoints(c.start, c.end || c.start)
              g(h.start, t),
                g(h.end, t),
                (h.original = c),
                (h.tabstop = i),
                f.push(h),
                i !== e ? i.unshift(h) : (i[s] = h),
                c.fmtString || (i.firstNonLinked && r)
                  ? ((h.linked = !0), (i.hasLinkedRanges = !0))
                  : i.firstNonLinked || (i.firstNonLinked = h)
            }
            i.firstNonLinked || (i.hasLinkedRanges = !1),
              i === e && (o.push(i), (this.$openTabstops[n] = i)),
              this.addTabstopMarkers(i),
              (i.rangeList = i.rangeList || new a()),
              (i.rangeList.$bias = 0),
              i.rangeList.addList(i)
          }, this),
            o.length > 2 &&
              (this.tabstops.length && o.push(o.splice(2, 1)[0]),
              this.tabstops.splice.apply(this.tabstops, o))
        }),
        (e.prototype.addTabstopMarkers = function (e) {
          const t = this.session
          e.forEach((e) => {
            e.markerId || (e.markerId = t.addMarker(e, "ace_snippet-marker", "text"))
          })
        }),
        (e.prototype.removeTabstopMarkers = function (e) {
          const t = this.session
          e.forEach((e) => {
            t.removeMarker(e.markerId), (e.markerId = null)
          })
        }),
        (e.prototype.updateTabstopMarkers = function () {
          if (!this.selectedTabstop) return
          let e = this.selectedTabstop.snippetId
          this.selectedTabstop.index === 0 && e--,
            this.tabstops.forEach(function (t) {
              t.snippetId === e ? this.addTabstopMarkers(t) : this.removeTabstopMarkers(t)
            }, this)
        }),
        (e.prototype.removeRange = function (e) {
          let t = e.tabstop.indexOf(e)
          t !== -1 && e.tabstop.splice(t, 1),
            (t = this.ranges.indexOf(e)),
            t !== -1 && this.ranges.splice(t, 1),
            (t = e.tabstop.rangeList.ranges.indexOf(e)),
            t !== -1 && e.tabstop.splice(t, 1),
            this.session.removeMarker(e.markerId),
            e.tabstop.length ||
              ((t = this.tabstops.indexOf(e.tabstop)),
              t !== -1 && this.tabstops.splice(t, 1),
              this.tabstops.length || this.detach())
        }),
        e
      )
    })()
    ;(m.prototype.keyboardHandler = new f()),
      m.prototype.keyboardHandler.bindKeys({
        Tab: (e) => {
          if (t.snippetManager?.expandWithTab(e)) return
          e.tabstopManager.tabNext(1), e.renderer.scrollCursorIntoView()
        },
        "Shift-Tab": (e) => {
          e.tabstopManager.tabNext(-1), e.renderer.scrollCursorIntoView()
        },
        Esc: (e) => {
          e.tabstopManager.detach()
        },
      })
    const g = (e, t) => {
      e.row === 0 && (e.column += t.column), (e.row += t.row)
    }
    const y = (e, t) => {
      e.row === t.row && (e.column -= t.column), (e.row -= t.row)
    }
    r.importCssString(
      "\n.ace_snippet-marker {\n    -moz-box-sizing: border-box;\n    box-sizing: border-box;\n    background: rgba(194, 193, 208, 0.09);\n    border: 1px dotted rgba(211, 208, 235, 0.62);\n    position: absolute;\n}",
      "snippets.css",
      !1,
    ),
      (t.snippetManager = new d())
    const b = e("./editor").Editor
    ;(function () {
      ;(this.insertSnippet = function (e, n) {
        return t.snippetManager.insertSnippet(this, e, n)
      }),
        (this.expandSnippet = function (e) {
          return t.snippetManager.expandWithTab(this, e)
        })
    }).call(b.prototype)
  },
),
  ace.define(
    "ace/ext/emmet",
    [
      "require",
      "exports",
      "module",
      "ace/keyboard/hash_handler",
      "ace/editor",
      "ace/snippets",
      "ace/range",
      "ace/config",
      "resources",
      "resources",
      "tabStops",
      "resources",
      "utils",
      "actions",
    ],
    (e, t, n) => {
      const r = e("../keyboard/hash_handler").HashHandler
      const i = e("../editor").Editor
      let s = e("../snippets").snippetManager
      const o = e("../range").Range
      const u = e("../config")
      let a
      let f
      const l = (() => {
        function e() {}
        return (
          (e.prototype.setupContext = function (e) {
            ;(this.ace = e), (this.indentation = e.session.getTabString()), a || (a = window.emmet)
            const t = a.resources || a.require("resources")
            t.setVariable("indentation", this.indentation),
              (this.$syntax = null),
              (this.$syntax = this.getSyntax())
          }),
          (e.prototype.getSelectionRange = function () {
            const e = this.ace.getSelectionRange()
            const t = this.ace.session.doc
            return { start: t.positionToIndex(e.start), end: t.positionToIndex(e.end) }
          }),
          (e.prototype.createSelection = function (e, t) {
            const n = this.ace.session.doc
            this.ace.selection.setRange({ start: n.indexToPosition(e), end: n.indexToPosition(t) })
          }),
          (e.prototype.getCurrentLineRange = function () {
            const e = this.ace
            const t = e.getCursorPosition().row
            const n = e.session.getLine(t).length
            const r = e.session.doc.positionToIndex({ row: t, column: 0 })
            return { start: r, end: r + n }
          }),
          (e.prototype.getCaretPos = function () {
            const e = this.ace.getCursorPosition()
            return this.ace.session.doc.positionToIndex(e)
          }),
          (e.prototype.setCaretPos = function (e) {
            const t = this.ace.session.doc.indexToPosition(e)
            this.ace.selection.moveToPosition(t)
          }),
          (e.prototype.getCurrentLine = function () {
            const e = this.ace.getCursorPosition().row
            return this.ace.session.getLine(e)
          }),
          (e.prototype.replaceContent = function (e, t, n, r) {
            n == null && (n = t == null ? this.getContent().length : t), t == null && (t = 0)
            const i = this.ace
            const u = i.session.doc
            const a = o.fromPoints(u.indexToPosition(t), u.indexToPosition(n))
            i.session.remove(a),
              (a.end = a.start),
              (e = this.$updateTabstops(e)),
              s.insertSnippet(i, e)
          }),
          (e.prototype.getContent = function () {
            return this.ace.getValue()
          }),
          (e.prototype.getSyntax = function () {
            if (this.$syntax) return this.$syntax
            let e = this.ace.session.$modeId.split("/").pop()
            if (e === "html" || e === "php") {
              const t = this.ace.getCursorPosition()
              let n = this.ace.session.getState(t.row)
              typeof n !== "string" && (n = n[0]),
                n && ((n = n.split("-")), n.length > 1 ? (e = n[0]) : e === "php" && (e = "html"))
            }
            return e
          }),
          (e.prototype.getProfileName = function () {
            const e = a.resources || a.require("resources")
            switch (this.getSyntax()) {
              case "css":
                return "css"
              case "xml":
              case "xsl":
                return "xml"
              case "html": {
                let t = e.getVariable("profile")
                return (
                  t ||
                    (t =
                      this.ace.session
                        .getLines(0, 2)
                        .join("")
                        .search(/<!DOCTYPE[^>]+XHTML/i) !== -1
                        ? "xhtml"
                        : "html"),
                  t
                )
              }
              default: {
                const n = this.ace.session.$mode
                return n.emmetConfig?.profile || "xhtml"
              }
            }
          }),
          (e.prototype.prompt = (e) => prompt(e)),
          (e.prototype.getSelection = function () {
            return this.ace.session.getTextRange()
          }),
          (e.prototype.getFilePath = () => ""),
          (e.prototype.$updateTabstops = (e) => {
            const t = 1e3
            let n = 0
            let r = null
            const i = a.tabStops || a.require("tabStops")
            const s = a.resources || a.require("resources")
            const o = s.getVocabulary("user")
            const u = {
              tabstop: (e) => {
                let s = Number.parseInt(e.group, 10)
                const o = s === 0
                o ? (s = ++n) : (s += t)
                let a = e.placeholder
                a && (a = i.processText(a, u))
                const f = `\${${s}${a ? `:${a}` : ""}}`
                return o && (r = [e.start, f]), f
              },
              escape: (e) => (e === "$" ? "\\$" : e === "\\" ? "\\\\" : e),
            }
            e = i.processText(e, u)
            if (o.variables.insert_final_tabstop && !/\$\{0\}$/.test(e)) e += "${0}"
            else if (r) {
              const f = a.utils ? a.utils.common : a.require("utils")
              e = f.replaceSubstring(e, "${0}", r[0], r[1])
            }
            return e
          }),
          e
        )
      })()
      const c = {
        expand_abbreviation: { mac: "ctrl+alt+e", win: "alt+e" },
        match_pair_outward: { mac: "ctrl+d", win: "ctrl+," },
        match_pair_inward: { mac: "ctrl+j", win: "ctrl+shift+0" },
        matching_pair: { mac: "ctrl+alt+j", win: "alt+j" },
        next_edit_point: "alt+right",
        prev_edit_point: "alt+left",
        toggle_comment: { mac: "command+/", win: "ctrl+/" },
        split_join_tag: { mac: "shift+command+'", win: "shift+ctrl+`" },
        remove_tag: { mac: "command+'", win: "shift+ctrl+;" },
        evaluate_math_expression: { mac: "shift+command+y", win: "shift+ctrl+y" },
        increment_number_by_1: "ctrl+up",
        decrement_number_by_1: "ctrl+down",
        increment_number_by_01: "alt+up",
        decrement_number_by_01: "alt+down",
        increment_number_by_10: { mac: "alt+command+up", win: "shift+alt+up" },
        decrement_number_by_10: { mac: "alt+command+down", win: "shift+alt+down" },
        select_next_item: { mac: "shift+command+.", win: "shift+ctrl+." },
        select_previous_item: { mac: "shift+command+,", win: "shift+ctrl+," },
        reflect_css_value: { mac: "shift+command+r", win: "shift+ctrl+r" },
        encode_decode_data_url: { mac: "shift+ctrl+d", win: "ctrl+'" },
        expand_abbreviation_with_tab: "Tab",
        wrap_with_abbreviation: { mac: "shift+ctrl+a", win: "shift+ctrl+a" },
      }
      const h = new l()
      ;(t.commands = new r()),
        (t.runEmmetCommand = function v(e) {
          if (this.action === "expand_abbreviation_with_tab") {
            if (!e.selection.isEmpty()) return !1
            const n = e.selection.lead
            const r = e.session.getTokenAt(n.row, n.column)
            if (r && /\btag\b/.test(r.type)) return !1
          }
          try {
            h.setupContext(e)
            const i = a.actions || a.require("actions")
            if (this.action === "wrap_with_abbreviation")
              return setTimeout(() => {
                i.run("wrap_with_abbreviation", h)
              }, 0)
            const s = i.run(this.action, h)
          } catch (o) {
            if (!a) {
              const f = t.load(v.bind(this, e))
              return this.action === "expand_abbreviation_with_tab" ? !1 : f
            }
            e._signal("changeStatus", typeof o === "string" ? o : o.message), u.warn(o), (s = !1)
          }
          return s
        })
      for (const p in c)
        t.commands.addCommand({
          name: `emmet:${p}`,
          action: p,
          bindKey: c[p],
          exec: t.runEmmetCommand,
          multiSelectAction: "forEach",
        })
      ;(t.updateCommands = (e, n) => {
        n
          ? e.keyBinding.addKeyboardHandler(t.commands)
          : e.keyBinding.removeKeyboardHandler(t.commands)
      }),
        (t.isSupportedMode = (e) => {
          if (!e) return !1
          if (e.emmetConfig) return !0
          const t = e.$id || e
          return /css|less|scss|sass|stylus|html|php|twig|ejs|handlebars/.test(t)
        }),
        (t.isAvailable = (e, n) => {
          if (/(evaluate_math_expression|expand_abbreviation)$/.test(n)) return !0
          const r = e.session.$mode
          let i = t.isSupportedMode(r)
          if (i && r.$modes)
            try {
              h.setupContext(e), /js|php/.test(h.getSyntax()) && (i = !1)
            } catch (s) {}
          return i
        })
      const d = (e, n) => {
        const r = n
        if (!r) return
        let i = t.isSupportedMode(r.session.$mode)
        e.enableEmmet === !1 && (i = !1), i && t.load(), t.updateCommands(r, i)
      }
      ;(t.load = (e) =>
        typeof f !== "string"
          ? (u.warn("script for emmet-core is not loaded"), !1)
          : (u.loadModule(f, () => {
              ;(f = null), e?.()
            }),
            !0)),
        (t.AceEmmetEditor = l),
        u.defineOptions(i.prototype, "editor", {
          enableEmmet: {
            set: function (e) {
              this[e ? "on" : "removeListener"]("changeMode", d), d({ enableEmmet: !!e }, this)
            },
            value: !0,
          },
        }),
        (t.setCore = (e) => {
          typeof e === "string" ? (f = e) : (a = e)
        })
    },
  )
;(() => {
  ace.require(["ace/ext/emmet"], (m) => {
    if (typeof module === "object" && typeof exports === "object" && module) {
      module.exports = m
    }
  })
})()
