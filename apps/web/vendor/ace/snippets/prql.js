;(() => {
  ace.require(["ace/snippets/prql"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
