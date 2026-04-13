;(() => {
  ace.require(["ace/snippets/verilog"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
