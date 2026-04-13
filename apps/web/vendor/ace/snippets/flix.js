;(() => {
  ace.require(["ace/snippets/flix"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
