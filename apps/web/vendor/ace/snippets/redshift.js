;(() => {
  ace.require(["ace/snippets/redshift"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
