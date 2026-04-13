;(() => {
  ace.require(["ace/snippets/ini"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
