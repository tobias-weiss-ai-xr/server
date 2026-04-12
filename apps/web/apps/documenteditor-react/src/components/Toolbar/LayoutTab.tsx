import { observer } from "mobx-react-lite"

const ObservedLayoutTab = observer(function ObservedLayoutTab() {
  return (
    <section className="de-layouttab-panel" data-tab="layout" role="tabpanel" aria-labelledby="layout">
      {/* Page Setup */}
      <div className="de-layouttab-group">
        <div className="de-layouttab-elset">
          <span className="de-layouttab-label">Page Setup</span>
        </div>
        <div className="de-layouttab-elset">
          <button type="button" className="de-layouttab-btn" title="Margins">
            Margins
          </button>
          <button type="button" className="de-layouttab-btn" title="Orientation">
            Orientation
          </button>
          <button type="button" className="de-layouttab-btn" title="Size">
            Size
          </button>
          <button type="button" className="de-layouttab-btn" title="Columns">
            Columns
          </button>
        </div>
      </div>

      <div className="de-layouttab-separator" />

      {/* Page Background */}
      <div className="de-layouttab-group">
        <div className="de-layouttab-elset">
          <span className="de-layouttab-label">Page Background</span>
        </div>
        <div className="de-layouttab-elset">
          <button type="button" className="de-layouttab-btn" title="Watermark">
            Watermark
          </button>
          <button type="button" className="de-layouttab-btn" title="Page Color">
            Page Color
          </button>
          <button type="button" className="de-layouttab-btn" title="Page Borders">
            Page Borders
          </button>
        </div>
      </div>

      <div className="de-layouttab-separator" />

      {/* Paragraph */}
      <div className="de-layouttab-group">
        <div className="de-layouttab-elset">
          <span className="de-layouttab-label">Paragraph</span>
        </div>
        <div className="de-layouttab-elset">
          <button type="button" className="de-layouttab-btn" title="Indent">
            Indent
          </button>
          <button type="button" className="de-layouttab-btn" title="Spacing">
            Spacing
          </button>
        </div>
      </div>
    </section>
  )
})

export { ObservedLayoutTab as LayoutTab }
