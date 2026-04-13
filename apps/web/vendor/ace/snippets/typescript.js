;(() => {
  ace.require(["ace/snippets/typescript"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
