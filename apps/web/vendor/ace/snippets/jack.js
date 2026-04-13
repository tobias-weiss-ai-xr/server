;(() => {
  ace.require(["ace/snippets/jack"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
