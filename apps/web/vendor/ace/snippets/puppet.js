;(() => {
  ace.require(["ace/snippets/puppet"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
