;(() => {
  ace.require(["ace/snippets/raku"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
