;(() => {
  ace.require(["ace/snippets/yaml"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
