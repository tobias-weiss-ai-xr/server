;(() => {
  ace.require(["ace/snippets/logiql"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
