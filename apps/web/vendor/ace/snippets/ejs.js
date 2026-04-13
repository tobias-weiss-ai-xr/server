;(() => {
  ace.require(["ace/snippets/ejs"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
