;(() => {
  ace.require(["ace/snippets/mediawiki"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
