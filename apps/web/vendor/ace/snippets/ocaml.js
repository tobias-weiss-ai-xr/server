;(() => {
  ace.require(["ace/snippets/ocaml"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
