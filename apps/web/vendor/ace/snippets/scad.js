;(() => {
  ace.require(["ace/snippets/scad"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
