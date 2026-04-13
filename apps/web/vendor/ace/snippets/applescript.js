;(() => {
  ace.require(["ace/snippets/applescript"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
