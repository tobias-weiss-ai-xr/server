ace.define("ace/snippets/haml.snippets", ["require", "exports", "module"], (e, t, n) => {
  n.exports =
    "snippet t\n	%table\n		%tr\n			%th\n				${1:headers}\n		%tr\n			%td\n				${2:headers}\nsnippet ul\n	%ul\n		%li\n			${1:item}\n		%li\nsnippet =rp\n	= render :partial => '${1:partial}'\nsnippet =rpl\n	= render :partial => '${1:partial}', :locals => {}\nsnippet =rpc\n	= render :partial => '${1:partial}', :collection => @$1\n\n"
}),
  ace.define(
    "ace/snippets/haml",
    ["require", "exports", "module", "ace/snippets/haml.snippets"],
    (e, t, n) => {
      ;(t.snippetText = e("./haml.snippets")), (t.scope = "haml")
    },
  )
;(() => {
  ace.require(["ace/snippets/haml"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
