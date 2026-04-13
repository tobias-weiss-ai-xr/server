;(() => {
  ace.require(["ace/snippets/pig"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
