;(() => {
  ace.require(["ace/snippets/d"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
