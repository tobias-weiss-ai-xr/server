;(() => {
  ace.require(["ace/snippets/jsx"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
