;(() => {
  ace.require(["ace/snippets/golang"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
