ace.define(
  "ace/ext/elastic_tabstops_lite",
  ["require", "exports", "module", "ace/editor", "ace/config"],
  (e, t, n) => {
    const r = (() => {
      function e(e) {
        this.$editor = e
        let n = []
        let r = !1
        ;(this.onAfterExec = () => {
          ;(r = !1), this.processRows(n), (n = [])
        }),
          (this.onExec = () => {
            r = !0
          }),
          (this.onChange = (e) => {
            r &&
              (n.indexOf(e.start.row) === -1 && n.push(e.start.row),
              e.end.row !== e.start.row && n.push(e.end.row))
          })
      }
      return (
        (e.prototype.processRows = function (e) {
          this.$inChange = !0
          const t = []
          for (let n = 0, r = e.length; n < r; n++) {
            const i = e[n]
            if (t.indexOf(i) > -1) continue
            const s = this.$findCellWidthsForBlock(i)
            const o = this.$setBlockCellWidthsToMax(s.cellWidths)
            let u = s.firstRow
            for (let a = 0, f = o.length; a < f; a++) {
              const l = o[a]
              t.push(u), this.$adjustRow(u, l), u++
            }
          }
          this.$inChange = !1
        }),
        (e.prototype.$findCellWidthsForBlock = function (e) {
          const t = []
          let n
          let r = e
          while (r >= 0) {
            n = this.$cellWidthsForRow(r)
            if (n.length === 0) break
            t.unshift(n), r--
          }
          const i = r + 1
          r = e
          const s = this.$editor.session.getLength()
          while (r < s - 1) {
            r++, (n = this.$cellWidthsForRow(r))
            if (n.length === 0) break
            t.push(n)
          }
          return { cellWidths: t, firstRow: i }
        }),
        (e.prototype.$cellWidthsForRow = function (e) {
          const t = this.$selectionColumnsForRow(e)
          const n = [-1].concat(this.$tabsForRow(e))
          const r = n.map((e) => 0).slice(1)
          const i = this.$editor.session.getLine(e)
          for (let s = 0, o = n.length - 1; s < o; s++) {
            const u = n[s] + 1
            const a = n[s + 1]
            const f = this.$rightmostSelectionInCell(t, a)
            const l = i.substring(u, a)
            r[s] = Math.max(l.replace(/\s+$/g, "").length, f - u)
          }
          return r
        }),
        (e.prototype.$selectionColumnsForRow = function (e) {
          const t = []
          const n = this.$editor.getCursorPosition()
          return this.$editor.session.getSelection().isEmpty() && e === n.row && t.push(n.column), t
        }),
        (e.prototype.$setBlockCellWidthsToMax = function (e) {
          let t = !0
          let n
          let r
          let i
          const s = this.$izip_longest(e)
          for (let o = 0, u = s.length; o < u; o++) {
            const a = s[o]
            if (!a.push) {
              console.error(a)
              continue
            }
            a.push(Number.NaN)
            for (let f = 0, l = a.length; f < l; f++) {
              const c = a[f]
              t && ((n = f), (i = 0), (t = !1))
              if (Number.isNaN(c)) {
                r = f
                for (let h = n; h < r; h++) e[h][o] = i
                t = !0
              }
              i = Math.max(i, c)
            }
          }
          return e
        }),
        (e.prototype.$rightmostSelectionInCell = (e, t) => {
          let n = 0
          if (e.length) {
            const r = []
            for (let i = 0, s = e.length; i < s; i++) e[i] <= t ? r.push(i) : r.push(0)
            n = Math.max.apply(Math, r)
          }
          return n
        }),
        (e.prototype.$tabsForRow = function (e) {
          const t = []
          const n = this.$editor.session.getLine(e)
          const r = /\t/g
          let i
          while ((i = r.exec(n)) != null) t.push(i.index)
          return t
        }),
        (e.prototype.$adjustRow = function (e, t) {
          const n = this.$tabsForRow(e)
          if (n.length === 0) return
          let r = 0
          let i = -1
          const s = this.$izip(t, n)
          for (let o = 0, u = s.length; o < u; o++) {
            const a = s[o][0]
            let f = s[o][1]
            ;(i += 1 + a), (f += r)
            const l = i - f
            if (l === 0) continue
            const c = this.$editor.session.getLine(e).substr(0, f)
            const h = c.replace(/\s*$/g, "")
            const p = c.length - h.length
            l > 0 &&
              (this.$editor.session
                .getDocument()
                .insertInLine({ row: e, column: f + 1 }, `${Array(l + 1).join(" ")}	`),
              this.$editor.session.getDocument().removeInLine(e, f, f + 1),
              (r += l)),
              l < 0 &&
                p >= -l &&
                (this.$editor.session.getDocument().removeInLine(e, f + l, f), (r += l))
          }
        }),
        (e.prototype.$izip_longest = (e) => {
          if (!e[0]) return []
          let t = e[0].length
          const n = e.length
          for (let r = 1; r < n; r++) {
            const i = e[r].length
            i > t && (t = i)
          }
          const s = []
          for (let o = 0; o < t; o++) {
            const u = []
            for (let r = 0; r < n; r++) e[r][o] === "" ? u.push(Number.NaN) : u.push(e[r][o])
            s.push(u)
          }
          return s
        }),
        (e.prototype.$izip = (e, t) => {
          const n = e.length >= t.length ? t.length : e.length
          const r = []
          for (let i = 0; i < n; i++) {
            const s = [e[i], t[i]]
            r.push(s)
          }
          return r
        }),
        e
      )
    })()
    t.ElasticTabstopsLite = r
    const i = e("../editor").Editor
    e("../config").defineOptions(i.prototype, "editor", {
      useElasticTabstops: {
        set: function (e) {
          e
            ? (this.elasticTabstops || (this.elasticTabstops = new r(this)),
              this.commands.on("afterExec", this.elasticTabstops.onAfterExec),
              this.commands.on("exec", this.elasticTabstops.onExec),
              this.on("change", this.elasticTabstops.onChange))
            : this.elasticTabstops &&
              (this.commands.removeListener("afterExec", this.elasticTabstops.onAfterExec),
              this.commands.removeListener("exec", this.elasticTabstops.onExec),
              this.removeListener("change", this.elasticTabstops.onChange))
        },
      },
    })
  },
)
;(() => {
  ace.require(["ace/ext/elastic_tabstops_lite"], (m) => {
    if (typeof module === "object" && typeof exports === "object" && module) {
      module.exports = m
    }
  })
})()
