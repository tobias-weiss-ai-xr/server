;(() => {
  ace.require(["ace/snippets/assembly_arm32"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
