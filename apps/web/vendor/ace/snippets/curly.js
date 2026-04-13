;(() => {
  ace.require(["ace/snippets/curly"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
