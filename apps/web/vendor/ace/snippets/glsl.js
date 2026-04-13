;(() => {
  ace.require(["ace/snippets/glsl"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
