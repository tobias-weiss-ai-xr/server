;(() => {
  ace.require(["ace/snippets/hjson"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
