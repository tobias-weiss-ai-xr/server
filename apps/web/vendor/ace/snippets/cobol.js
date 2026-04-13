;(() => {
  ace.require(["ace/snippets/cobol"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
