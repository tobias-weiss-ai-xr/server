;(() => {
  ace.require(["ace/snippets/smithy"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
