;(() => {
  ace.require(["ace/snippets/partiql"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
