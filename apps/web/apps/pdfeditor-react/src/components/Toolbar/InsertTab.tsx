import { observer } from "mobx-react-lite"

const ObservedInsertTab = observer(function ObservedInsertTab() {
  return (
    <section
      className="pdf-inserttab-panel"
      data-tab="insert"
      role="tabpanel"
      aria-labelledby="insert"
    >
      <div className="pdf-inserttab-group">
        <div className="pdf-inserttab-elset">
          <button type="button" className="pdf-inserttab-btn" title="Table">
            Table
          </button>
          <button type="button" className="pdf-inserttab-btn" title="Image">
            Image
          </button>
          <button type="button" className="pdf-inserttab-btn" title="Shape">
            Shape
          </button>
        </div>
      </div>

      <div className="pdf-inserttab-separator" />

      <div className="pdf-inserttab-group">
        <div className="pdf-inserttab-elset">
          <button type="button" className="pdf-inserttab-btn" title="Text">
            Text
          </button>
          <button type="button" className="pdf-inserttab-btn" title="Equation">
            Equation
          </button>
        </div>
      </div>

      <div className="pdf-inserttab-separator" />

      <div className="pdf-inserttab-group">
        <div className="pdf-inserttab-elset">
          <button type="button" className="pdf-inserttab-btn" title="Chart">
            Chart
          </button>
          <button type="button" className="pdf-inserttab-btn" title="SmartArt">
            SmartArt
          </button>
        </div>
      </div>

      <div className="pdf-inserttab-separator" />

      <div className="pdf-inserttab-group">
        <div className="pdf-inserttab-elset">
          <button type="button" className="pdf-inserttab-btn" title="TextArt">
            TextArt
          </button>
          <button type="button" className="pdf-inserttab-btn" title="Symbol">
            Symbol
          </button>
          <button type="button" className="pdf-inserttab-btn" title="Hyperlink">
            Hyperlink
          </button>
        </div>
      </div>
    </section>
  )
})

export { ObservedInsertTab as InsertTab }
