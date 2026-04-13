;(() => {
  ace.require(["ace/snippets/ftl"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
