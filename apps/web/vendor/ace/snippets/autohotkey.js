;(() => {
  ace.require(["ace/snippets/autohotkey"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
