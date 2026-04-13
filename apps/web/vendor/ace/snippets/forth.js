;(() => {
  ace.require(["ace/snippets/forth"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
