;(() => {
  ace.require(["ace/snippets/html_ruby"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
