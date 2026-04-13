;(() => {
  ace.require(["ace/snippets/nim"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
