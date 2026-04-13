;(() => {
  ace.require(["ace/snippets/soy_template"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
