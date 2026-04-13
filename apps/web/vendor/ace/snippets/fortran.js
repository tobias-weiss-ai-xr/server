;(() => {
  ace.require(["ace/snippets/fortran"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
