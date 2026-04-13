;(() => {
  ace.require(["ace/snippets/rhtml"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
