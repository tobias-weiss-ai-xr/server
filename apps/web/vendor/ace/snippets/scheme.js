;(() => {
  ace.require(["ace/snippets/scheme"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
