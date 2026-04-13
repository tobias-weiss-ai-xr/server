;(() => {
  ace.require(["ace/snippets/nasal"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
