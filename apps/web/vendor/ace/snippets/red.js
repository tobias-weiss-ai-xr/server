;(() => {
  ace.require(["ace/snippets/red"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
