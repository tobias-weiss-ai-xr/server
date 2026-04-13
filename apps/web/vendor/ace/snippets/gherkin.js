;(() => {
  ace.require(["ace/snippets/gherkin"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
