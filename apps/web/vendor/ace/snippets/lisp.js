;(() => {
  ace.require(["ace/snippets/lisp"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
