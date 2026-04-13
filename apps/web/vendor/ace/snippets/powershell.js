;(() => {
  ace.require(["ace/snippets/powershell"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
