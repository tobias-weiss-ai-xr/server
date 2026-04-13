;(() => {
  ace.require(["ace/snippets/text"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
