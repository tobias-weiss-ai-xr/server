;(() => {
  ace.require(["ace/snippets/elixir"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
