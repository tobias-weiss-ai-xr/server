;(() => {
  ace.require(["ace/snippets/apex"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
