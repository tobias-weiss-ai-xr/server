;(() => {
  ace.require(["ace/snippets/ada"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
