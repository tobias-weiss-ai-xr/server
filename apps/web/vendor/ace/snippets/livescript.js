;(() => {
  ace.require(["ace/snippets/livescript"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
