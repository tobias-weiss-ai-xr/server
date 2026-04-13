;(() => {
  ace.require(["ace/ext/error_marker"], (m) => {
    if (typeof module === "object" && typeof exports === "object" && module) {
      module.exports = m
    }
  })
})()
