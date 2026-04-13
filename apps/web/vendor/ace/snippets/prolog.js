;(() => {
  ace.require(["ace/snippets/prolog"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
