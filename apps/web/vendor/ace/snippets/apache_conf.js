;(() => {
  ace.require(["ace/snippets/apache_conf"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
