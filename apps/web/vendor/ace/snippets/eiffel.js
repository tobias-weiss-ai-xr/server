;(() => {
  ace.require(["ace/snippets/eiffel"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
