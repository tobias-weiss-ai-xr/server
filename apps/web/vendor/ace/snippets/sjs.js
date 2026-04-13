;(() => {
  ace.require(["ace/snippets/sjs"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
