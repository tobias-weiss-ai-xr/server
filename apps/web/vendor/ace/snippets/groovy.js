;(() => {
  ace.require(["ace/snippets/groovy"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
