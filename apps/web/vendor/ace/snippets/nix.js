;(() => {
  ace.require(["ace/snippets/nix"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
