;(() => {
  ace.require(["ace/snippets/pascal"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
