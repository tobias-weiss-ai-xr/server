;(() => {
  ace.require(["ace/snippets/crystal"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
