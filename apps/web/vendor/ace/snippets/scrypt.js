;(() => {
  ace.require(["ace/snippets/scrypt"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
