ace.define(
  "ace/theme/textmate",
  ["require", "exports", "module", "ace/theme/textmate-css", "ace/lib/dom"],
  (e, t, n) => {
    ;(t.isDark = !1),
      (t.cssClass = "ace-tm"),
      (t.cssText = e("./textmate-css")),
      (t.$id = "ace/theme/textmate")
    var r = e("../lib/dom")
    r.importCssString(t.cssText, t.cssClass, !1)
  },
)
;(() => {
  ace.require(["ace/theme/textmate"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
