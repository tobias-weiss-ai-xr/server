;(() => {
  ace.require(["ace/snippets/gcode"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
