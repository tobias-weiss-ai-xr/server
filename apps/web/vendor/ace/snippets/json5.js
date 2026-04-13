;(() => {
  ace.require(["ace/snippets/json5"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
