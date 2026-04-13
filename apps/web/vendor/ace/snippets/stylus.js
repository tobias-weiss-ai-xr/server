;(() => {
  ace.require(["ace/snippets/stylus"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
