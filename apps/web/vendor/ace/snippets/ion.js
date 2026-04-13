;(() => {
  ace.require(["ace/snippets/ion"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
