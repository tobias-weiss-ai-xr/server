;(() => {
  ace.require(["ace/snippets/plain_text"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
