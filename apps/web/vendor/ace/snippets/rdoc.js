;(() => {
  ace.require(["ace/snippets/rdoc"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
