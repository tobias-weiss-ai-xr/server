ace.define("ace/snippets/csound_document.snippets", ["require", "exports", "module"], (e, t, n) => {
  n.exports =
    "# <CsoundSynthesizer>\nsnippet synth\n	<CsoundSynthesizer>\n	<CsInstruments>\n	${1}\n	</CsInstruments>\n	<CsScore>\n	e\n	</CsScore>\n	</CsoundSynthesizer>\n"
}),
  ace.define(
    "ace/snippets/csound_document",
    ["require", "exports", "module", "ace/snippets/csound_document.snippets"],
    (e, t, n) => {
      ;(t.snippetText = e("./csound_document.snippets")), (t.scope = "csound_document")
    },
  )
;(() => {
  ace.require(["ace/snippets/csound_document"], (m) => {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m
    }
  })
})()
