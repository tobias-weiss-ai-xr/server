;(() => {
  ace.require(["ace/snippets/csharp"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
