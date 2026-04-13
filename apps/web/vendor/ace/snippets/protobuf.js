;(() => {
  ace.require(["ace/snippets/protobuf"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
