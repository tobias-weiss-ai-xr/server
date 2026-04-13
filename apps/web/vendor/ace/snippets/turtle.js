;(() => {
  ace.require(["ace/snippets/turtle"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
