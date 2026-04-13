ace.define("ace/snippets/razor.snippets", ["require", "exports", "module"], (e, t, n) => {
  n.exports = "snippet if\n(${1} == ${2}) {\n	${3}\n}"
}),
  ace.define(
    "ace/snippets/razor",
    ["require", "exports", "module", "ace/snippets/razor.snippets"],
    (e, t, n) => {
      ;(t.snippetText = e("./razor.snippets")), (t.scope = "razor")
    },
  )
;(() => {
  ace.require(["ace/snippets/razor"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
