;(() => {
  ace.require(["ace/snippets/xml"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
