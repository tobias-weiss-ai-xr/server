;(() => {
  ace.require(["ace/snippets/mips"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
