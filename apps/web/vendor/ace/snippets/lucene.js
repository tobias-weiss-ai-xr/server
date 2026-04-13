;(() => {
  ace.require(["ace/snippets/lucene"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
