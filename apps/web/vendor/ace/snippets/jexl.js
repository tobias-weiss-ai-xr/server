;(() => {
  ace.require(["ace/snippets/jexl"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
