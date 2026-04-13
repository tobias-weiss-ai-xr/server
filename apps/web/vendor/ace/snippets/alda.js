;(() => {
  ace.require(["ace/snippets/alda"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
