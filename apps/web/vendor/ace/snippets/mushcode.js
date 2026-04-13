;(() => {
  ace.require(["ace/snippets/mushcode"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
