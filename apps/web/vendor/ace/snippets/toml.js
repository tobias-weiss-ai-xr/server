;(() => {
  ace.require(["ace/snippets/toml"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
