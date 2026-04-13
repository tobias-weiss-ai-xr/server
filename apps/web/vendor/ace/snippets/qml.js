;(() => {
  ace.require(["ace/snippets/qml"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
