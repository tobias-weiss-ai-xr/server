;(() => {
  ace.require(["ace/snippets/space"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
