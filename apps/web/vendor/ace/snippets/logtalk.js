;(() => {
  ace.require(["ace/snippets/logtalk"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
