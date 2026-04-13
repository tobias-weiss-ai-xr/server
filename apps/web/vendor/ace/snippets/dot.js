;(() => {
  ace.require(["ace/snippets/dot"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
