;(() => {
  ace.require(["ace/snippets/sac"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
