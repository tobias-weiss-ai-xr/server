;(() => {
  ace.require(["ace/snippets/abap"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
