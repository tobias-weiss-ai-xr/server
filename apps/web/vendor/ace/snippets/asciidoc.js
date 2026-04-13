;(() => {
  ace.require(["ace/snippets/asciidoc"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
