import { observer } from "mobx-react-lite"

const ObservedHeaderFooterTab = observer(function ObservedHeaderFooterTab() {
  return (
    <section
      className="de-headerfootertab-panel"
      data-tab="headerfooter"
      role="tabpanel"
      aria-labelledby="headerfooter"
    >
      {/* Header & Footer */}
      <div className="de-headerfootertab-group">
        <div className="de-headerfootertab-elset">
          <button type="button" className="de-headerfootertab-btn" title="Header">
            Header
          </button>
          <button type="button" className="de-headerfootertab-btn" title="Footer">
            Footer
          </button>
        </div>
        <div className="de-headerfootertab-elset">
          <button type="button" className="de-headerfootertab-btn" title="Page Number">
            Page Number
          </button>
        </div>
      </div>

      <div className="de-headerfootertab-separator" />

      {/* Options */}
      <div className="de-headerfootertab-group">
        <div className="de-headerfootertab-elset">
          <span className="de-headerfootertab-label">Options</span>
        </div>
        <div className="de-headerfootertab-elset">
          <label className="de-headerfootertab-checkbox">
            <input type="checkbox" />
            <span>Different First Page</span>
          </label>
          <label className="de-headerfootertab-checkbox">
            <input type="checkbox" />
            <span>Different Odd & Even</span>
          </label>
        </div>
      </div>

      <div className="de-headerfootertab-separator" />

      {/* Position */}
      <div className="de-headerfootertab-group">
        <div className="de-headerfootertab-elset">
          <span className="de-headerfootertab-label">Position</span>
        </div>
        <div className="de-headerfootertab-elset">
          <button type="button" className="de-headerfootertab-btn" title="Insert Page Number">
            Insert Page Number
          </button>
        </div>
      </div>

      <div className="de-headerfootertab-separator" />

      {/* Remove */}
      <div className="de-headerfootertab-group">
        <div className="de-headerfootertab-elset">
          <button type="button" className="de-headerfootertab-btn" title="Remove Header">
            Remove Header
          </button>
          <button type="button" className="de-headerfootertab-btn" title="Remove Footer">
            Remove Footer
          </button>
        </div>
      </div>
    </section>
  )
})

export { ObservedHeaderFooterTab as HeaderFooterTab }
