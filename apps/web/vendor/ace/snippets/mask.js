;(() => {
  ace.require(["ace/snippets/mask"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
