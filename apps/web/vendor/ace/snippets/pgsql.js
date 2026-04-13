;(() => {
  ace.require(["ace/snippets/pgsql"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
