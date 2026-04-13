;(() => {
  ace.require(["ace/snippets/julia"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
