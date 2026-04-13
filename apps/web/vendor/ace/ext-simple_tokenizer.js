ace.define(
  "ace/ext/simple_tokenizer",
  ["require", "exports", "module", "ace/tokenizer", "ace/layer/text_util"],
  (e, t, n) => {
    function o(e, t) {
      const n = new s(e, new r(t.getRules()))
      const o = []
      for (let u = 0; u < n.getLength(); u++) {
        const a = n.getTokens(u)
        o.push(
          a.map((e) => ({
            className: i(e.type) ? undefined : `ace_${e.type.replace(/\./g, " ace_")}`,
            value: e.value,
          })),
        )
      }
      return o
    }
    const r = e("../tokenizer").Tokenizer
    const i = e("../layer/text_util").isTextToken
    const s = (() => {
      function e(e, t) {
        ;(this._lines = e.split(/\r\n|\r|\n/)), (this._states = []), (this._tokenizer = t)
      }
      return (
        (e.prototype.getTokens = function (e) {
          const t = this._lines[e]
          const n = this._states[e - 1]
          const r = this._tokenizer.getLineTokens(t, n)
          return (this._states[e] = r.state), r.tokens
        }),
        (e.prototype.getLength = function () {
          return this._lines.length
        }),
        e
      )
    })()
    n.exports = { tokenize: o }
  },
)
;(() => {
  ace.require(["ace/ext/simple_tokenizer"], (m) => {
    if (typeof module === "object" && typeof exports === "object" && module) {
      module.exports = m
    }
  })
})()
