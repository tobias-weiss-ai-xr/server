;(() => {
  ace.require(["ace/snippets/zeek"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
