;(() => {
  ace.require(["ace/snippets/less"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
