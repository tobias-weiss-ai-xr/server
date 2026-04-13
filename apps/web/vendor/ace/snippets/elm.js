;(() => {
  ace.require(["ace/snippets/elm"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
