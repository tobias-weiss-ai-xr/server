;(() => {
  ace.require(["ace/snippets/kotlin"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
