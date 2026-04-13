;(() => {
  ace.require(["ace/snippets/php_laravel_blade"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
