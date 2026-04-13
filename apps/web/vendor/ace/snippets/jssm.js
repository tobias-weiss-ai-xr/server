;(() => {
  ace.require(["ace/snippets/jssm"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
