;(() => {
  ace.require(["ace/snippets/scala"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
