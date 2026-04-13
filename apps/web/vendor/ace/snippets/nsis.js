;(() => {
  ace.require(["ace/snippets/nsis"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
