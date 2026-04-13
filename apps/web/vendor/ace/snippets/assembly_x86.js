;(() => {
  ace.require(["ace/snippets/assembly_x86"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
