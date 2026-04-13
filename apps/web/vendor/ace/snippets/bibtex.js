;(() => {
  ace.require(["ace/snippets/bibtex"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
