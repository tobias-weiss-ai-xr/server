;(() => {
  ace.require(["ace/snippets/asl"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
