;(() => {
  ace.require(["ace/snippets/sparql"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
