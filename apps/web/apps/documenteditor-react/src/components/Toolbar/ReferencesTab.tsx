import { observer } from "mobx-react-lite"

const ObservedReferencesTab = observer(function ObservedReferencesTab() {
  return (
    <section
      className="de-referencestab-panel"
      data-tab="references"
      role="tabpanel"
      aria-labelledby="references"
    >
      {/* Table of Contents */}
      <div className="de-referencestab-group">
        <div className="de-referencestab-elset">
          <button type="button" className="de-referencestab-btn" title="Table of Contents">
            Table of Contents
          </button>
        </div>
      </div>

      <div className="de-referencestab-separator" />

      {/* Footnotes */}
      <div className="de-referencestab-group">
        <div className="de-referencestab-elset">
          <button type="button" className="de-referencestab-btn" title="Insert Footnote">
            Insert Footnote
          </button>
          <button type="button" className="de-referencestab-btn" title="Next Footnote">
            Next Footnote
          </button>
        </div>
      </div>

      <div className="de-referencestab-separator" />

      {/* Citations & Bibliography */}
      <div className="de-referencestab-group">
        <div className="de-referencestab-elset">
          <button type="button" className="de-referencestab-btn" title="Insert Citation">
            Insert Citation
          </button>
          <button type="button" className="de-referencestab-btn" title="Manage Sources">
            Manage Sources
          </button>
          <button type="button" className="de-referencestab-btn" title="Bibliography">
            Bibliography
          </button>
        </div>
      </div>

      <div className="de-referencestab-separator" />

      {/* Captions */}
      <div className="de-referencestab-group">
        <div className="de-referencestab-elset">
          <button type="button" className="de-referencestab-btn" title="Insert Caption">
            Insert Caption
          </button>
        </div>
      </div>

      <div className="de-referencestab-separator" />

      {/* Index */}
      <div className="de-referencestab-group">
        <div className="de-referencestab-elset">
          <button type="button" className="de-referencestab-btn" title="Mark Entry">
            Mark Entry
          </button>
          <button type="button" className="de-referencestab-btn" title="Insert Index">
            Insert Index
          </button>
        </div>
      </div>
    </section>
  )
})

export { ObservedReferencesTab as ReferencesTab }
