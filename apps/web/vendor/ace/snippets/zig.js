;(() => {
  ace.require(["ace/snippets/zig"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
