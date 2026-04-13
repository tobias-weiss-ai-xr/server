;(() => {
  ace.require(["ace/snippets/visualforce"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
