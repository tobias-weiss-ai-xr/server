;(() => {
  ace.require(["ace/snippets/praat"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
