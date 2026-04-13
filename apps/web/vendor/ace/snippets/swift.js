;(() => {
  ace.require(["ace/snippets/swift"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
