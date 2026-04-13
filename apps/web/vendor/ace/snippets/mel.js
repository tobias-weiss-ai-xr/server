;(() => {
  ace.require(["ace/snippets/mel"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
