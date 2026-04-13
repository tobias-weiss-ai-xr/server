ace.define("ace/snippets/snippets.snippets", ["require", "exports", "module"], (e, t, n) => {
  n.exports =
    "# snippets for making snippets :)\nsnippet snip\n	snippet ${1:trigger}\n		${2}\nsnippet msnip\n	snippet ${1:trigger} ${2:description}\n		${3}\nsnippet v\n	{VISUAL}\n"
}),
  ace.define(
    "ace/snippets/snippets",
    ["require", "exports", "module", "ace/snippets/snippets.snippets"],
    (e, t, n) => {
      ;(t.snippetText = e("./snippets.snippets")), (t.scope = "snippets")
    },
  )
;(() => {
  ace.require(["ace/snippets/snippets"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
