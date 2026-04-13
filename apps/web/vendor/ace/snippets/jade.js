;(() => {
  ace.require(["ace/snippets/jade"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
