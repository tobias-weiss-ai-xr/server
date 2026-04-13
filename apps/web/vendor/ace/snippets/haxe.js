;(() => {
  ace.require(["ace/snippets/haxe"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
