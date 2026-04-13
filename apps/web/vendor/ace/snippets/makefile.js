ace.define("ace/snippets/makefile.snippets", ["require", "exports", "module"], (e, t, n) => {
  n.exports = "snippet ifeq\n	ifeq (${1:cond0},${2:cond1})\n		${3:code}\n	endif\n"
}),
  ace.define(
    "ace/snippets/makefile",
    ["require", "exports", "module", "ace/snippets/makefile.snippets"],
    (e, t, n) => {
      ;(t.snippetText = e("./makefile.snippets")), (t.scope = "makefile")
    },
  )
;(() => {
  ace.require(["ace/snippets/makefile"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
