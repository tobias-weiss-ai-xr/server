ace.define(
  "ace/mode/doc_comment_highlight_rules",
  ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules"],
  (e, t, n) => {
    const r = e("../lib/oop")
    const i = e("./text_highlight_rules").TextHighlightRules
    const s = function () {
      this.$rules = {
        start: [
          { token: "comment.doc.tag", regex: "@\\w+(?=\\s|$)" },
          s.getTagRule(),
          { defaultToken: "comment.doc.body", caseInsensitive: !0 },
        ],
      }
    }
    r.inherits(s, i),
      (s.getTagRule = (e) => ({
        token: "comment.doc.tag.storage.type",
        regex: "\\b(?:TODO|FIXME|XXX|HACK)\\b",
      })),
      (s.getStartRule = (e) => ({ token: "comment.doc", regex: /\/\*\*(?!\/)/, next: e })),
      (s.getEndRule = (e) => ({ token: "comment.doc", regex: "\\*\\/", next: e })),
      (t.DocCommentHighlightRules = s)
  },
),
  ace.define(
    "ace/mode/edifact_highlight_rules",
    [
      "require",
      "exports",
      "module",
      "ace/lib/oop",
      "ace/mode/doc_comment_highlight_rules",
      "ace/mode/text_highlight_rules",
    ],
    (e, t, n) => {
      const r = e("../lib/oop")
      const i = e("./doc_comment_highlight_rules").DocCommentHighlightRules
      const s = e("./text_highlight_rules").TextHighlightRules
      const o = function () {
        const e = "UNH"
        const t =
          "ADR|AGR|AJT|ALC|ALI|APP|APR|ARD|ARR|ASI|ATT|AUT|BAS|BGM|BII|BUS|CAV|CCD|CCI|CDI|CDS|CDV|CED|CIN|CLA|CLI|CMP|CNI|CNT|COD|COM|COT|CPI|CPS|CPT|CST|CTA|CUX|DAM|DFN|DGS|DII|DIM|DLI|DLM|DMS|DOC|DRD|DSG|DSI|DTM|EDT|EFI|ELM|ELU|ELV|EMP|EQA|EQD|EQN|ERC|ERP|EVE|FCA|FII|FNS|FNT|FOR|FSQ|FTX|GDS|GEI|GID|GIN|GIR|GOR|GPO|GRU|HAN|HYN|ICD|IDE|IFD|IHC|IMD|IND|INP|INV|IRQ|LAN|LIN|LOC|MEA|MEM|MKS|MOA|MSG|MTD|NAD|NAT|PAC|PAI|PAS|PCC|PCD|PCI|PDI|PER|PGI|PIA|PNA|POC|PRC|PRI|PRV|PSD|PTY|PYT|QRS|QTY|QUA|QVR|RCS|REL|RFF|RJL|RNG|ROD|RSL|RTE|SAL|SCC|SCD|SEG|SEL|SEQ|SFI|SGP|SGU|SPR|SPS|STA|STC|STG|STS|TAX|TCC|TDT|TEM|TMD|TMP|TOD|TPL|TRU|TSR|UNB|UNZ|UNT|UGH|UGT|UNS|VLI"
        const e = "UNH"
        const n = "null|Infinity|NaN|undefined"
        const r = ""
        const s = "BY|SE|ON|INV|JP|UNOA"
        const o = this.createKeywordMapper(
          {
            "variable.language": "this",
            keyword: s,
            "entity.name.segment": t,
            "entity.name.header": e,
            "constant.language": n,
            "support.function": r,
          },
          "identifier",
        )
        ;(this.$rules = {
          start: [
            { token: "punctuation.operator", regex: "\\+.\\+" },
            { token: "constant.language.boolean", regex: "(?:true|false)\\b" },
            { token: o, regex: "[a-zA-Z_$][a-zA-Z0-9_$]*\\b" },
            { token: "keyword.operator", regex: "\\+" },
            { token: "punctuation.operator", regex: "\\:|'" },
            { token: "identifier", regex: "\\:D\\:" },
          ],
        }),
          this.embedRules(i, "doc-", [i.getEndRule("start")])
      }
      ;(o.metaData = {
        fileTypes: ["edi"],
        keyEquivalent: "^~E",
        name: "Edifact",
        scopeName: "source.edifact",
      }),
        r.inherits(o, s),
        (t.EdifactHighlightRules = o)
    },
  ),
  ace.define(
    "ace/mode/edifact",
    [
      "require",
      "exports",
      "module",
      "ace/lib/oop",
      "ace/mode/text",
      "ace/mode/edifact_highlight_rules",
    ],
    (e, t, n) => {
      const r = e("../lib/oop")
      const i = e("./text").Mode
      const s = e("./edifact_highlight_rules").EdifactHighlightRules
      const o = function () {
        ;(this.HighlightRules = s), (this.$behaviour = this.$defaultBehaviour)
      }
      r.inherits(o, i),
        function () {
          ;(this.$id = "ace/mode/edifact"), (this.snippetFileId = "ace/snippets/edifact")
        }.call(o.prototype),
        (t.Mode = o)
    },
  )
;(() => {
  ace.require(["ace/mode/edifact"], (m) => {
    if (typeof module === "object" && typeof exports === "object" && module) {
      module.exports = m
    }
  })
})()
