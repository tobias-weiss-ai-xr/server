;(() => {
  ace.require(["ace/snippets/mysql"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
