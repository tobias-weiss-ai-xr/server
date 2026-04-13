;(() => {
  ace.require(["ace/snippets/handlebars"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
