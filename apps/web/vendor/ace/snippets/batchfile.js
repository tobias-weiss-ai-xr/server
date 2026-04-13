;(() => {
  ace.require(["ace/snippets/batchfile"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
