;(() => {
  ace.require(["ace/snippets/latte"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
