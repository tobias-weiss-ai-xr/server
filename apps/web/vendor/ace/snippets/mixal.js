;(() => {
  ace.require(["ace/snippets/mixal"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
