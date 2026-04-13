;(() => {
  ace.require(["ace/snippets/dockerfile"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
