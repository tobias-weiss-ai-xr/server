;(() => {
  ace.require(["ace/snippets/csound_score"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
