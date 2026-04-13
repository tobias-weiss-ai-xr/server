ace.define("ace/snippets/maze.snippets", ["require", "exports", "module"], (e, t, n) => {
  n.exports =
    "snippet >\ndescription assignment\nscope maze\n	-> ${1}= ${2}\n\nsnippet >\ndescription if\nscope maze\n	-> IF ${2:**} THEN %${3:L} ELSE %${4:R}\n"
}),
  ace.define(
    "ace/snippets/maze",
    ["require", "exports", "module", "ace/snippets/maze.snippets"],
    (e, t, n) => {
      ;(t.snippetText = e("./maze.snippets")), (t.scope = "maze")
    },
  )
;(() => {
  ace.require(["ace/snippets/maze"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
