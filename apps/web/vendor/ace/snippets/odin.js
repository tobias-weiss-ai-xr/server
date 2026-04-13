;(() => {
  ace.require(["ace/snippets/odin"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
