;(() => {
  ace.require(["ace/snippets/nunjucks"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
