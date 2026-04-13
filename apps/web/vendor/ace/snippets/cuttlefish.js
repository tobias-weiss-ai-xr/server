;(() => {
  ace.require(["ace/snippets/cuttlefish"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
