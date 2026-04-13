;(() => {
  ace.require(["ace/snippets/terraform"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
