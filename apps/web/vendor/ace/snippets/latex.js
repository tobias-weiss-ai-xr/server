;(() => {
  ace.require(["ace/snippets/latex"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
