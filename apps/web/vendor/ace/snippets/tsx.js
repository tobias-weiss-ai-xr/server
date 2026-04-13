;(() => {
  ace.require(["ace/snippets/tsx"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
