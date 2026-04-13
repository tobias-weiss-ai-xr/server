;(() => {
  ace.require(["ace/snippets/nginx"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
