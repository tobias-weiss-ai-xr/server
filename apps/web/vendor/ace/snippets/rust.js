;(() => {
  ace.require(["ace/snippets/rust"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
