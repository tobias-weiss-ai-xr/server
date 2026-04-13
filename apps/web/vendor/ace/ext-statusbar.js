ace.define(
  "ace/ext/statusbar",
  ["require", "exports", "module", "ace/lib/dom", "ace/lib/lang"],
  (e, t, n) => {
    const r = e("../lib/dom")
    const i = e("../lib/lang")
    const s = (() => {
      function e(e, t) {
        ;(this.element = r.createElement("div")),
          (this.element.className = "ace_status-indicator"),
          (this.element.style.cssText = "display: inline-block;"),
          t.appendChild(this.element)
        const n = i
          .delayedCall(
            function () {
              this.updateStatus(e)
            }.bind(this),
          )
          .schedule.bind(null, 100)
        e.on("changeStatus", n), e.on("changeSelection", n), e.on("keyboardActivity", n)
      }
      return (
        (e.prototype.updateStatus = function (e) {
          function n(e, n) {
            e && t.push(e, n || "|")
          }
          const t = []
          n(e.keyBinding.getStatusText(e)), e.commands.recording && n("REC")
          const r = e.selection
          const i = r.lead
          if (!r.isEmpty()) {
            const s = e.getSelectionRange()
            n(`(${s.end.row - s.start.row}:${s.end.column - s.start.column})`, " ")
          }
          n(`${i.row}:${i.column}`, " "),
            r.rangeCount && n(`[${r.rangeCount}]`, " "),
            t.pop(),
            (this.element.textContent = t.join(""))
        }),
        e
      )
    })()
    t.StatusBar = s
  },
)
;(() => {
  ace.require(["ace/ext/statusbar"], (m) => {
    if (typeof module === "object" && typeof exports === "object" && module) {
      module.exports = m
    }
  })
})()
