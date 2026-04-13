;(() => {
  ace.require(["ace/snippets/twig"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
