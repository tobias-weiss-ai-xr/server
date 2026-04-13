;(() => {
  ace.require(["ace/snippets/slim"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
