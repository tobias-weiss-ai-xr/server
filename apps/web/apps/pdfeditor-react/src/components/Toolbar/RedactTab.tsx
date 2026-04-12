import { observer } from "mobx-react-lite"
import { pdfStore } from "../../stores/PdfStore"

const ObservedRedactTab = observer(function ObservedRedactTab() {
  return (
    <section
      className="pdf-redacttab-panel"
      data-tab="redact"
      role="tabpanel"
      aria-labelledby="redact"
    >
      <div className="pdf-redacttab-group">
        <div className="pdf-redacttab-elset">
          <button type="button" className="pdf-redacttab-btn" title="Mark for Redaction">
            Mark for Redaction
          </button>
        </div>
      </div>

      <div className="pdf-redacttab-separator" />

      <div className="pdf-redacttab-group">
        <div className="pdf-redacttab-elset">
          <button type="button" className="pdf-redacttab-btn" title="Redact Pages">
            Redact Pages
          </button>
        </div>
      </div>

      <div className="pdf-redacttab-separator" />

      <div className="pdf-redacttab-group">
        <div className="pdf-redacttab-elset">
          <button
            type="button"
            className={`pdf-redacttab-btn${pdfStore.redactionApplied ? " active" : ""}`}
            title="Apply Redactions"
          >
            Apply Redactions
          </button>
        </div>
      </div>

      <div className="pdf-redacttab-separator" />

      <div className="pdf-redacttab-group">
        <div className="pdf-redacttab-elset">
          <button type="button" className="pdf-redacttab-btn" title="Find to Redact">
            Find to Redact
          </button>
        </div>
      </div>
    </section>
  )
})

export { ObservedRedactTab as RedactTab }
