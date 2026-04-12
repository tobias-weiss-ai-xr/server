import { observer } from "mobx-react-lite"
import { documentStore } from "../../stores/DocumentStore"
import { ZOOM_LEVELS } from "../../types/document"

const ObservedViewTab = observer(function ObservedViewTab() {
  return (
    <section className="de-viewtab-panel" data-tab="view" role="tabpanel" aria-labelledby="view">
      {/* Show/Hide */}
      <div className="de-viewtab-group">
        <div className="de-viewtab-elset">
          <span className="de-viewtab-label">Show</span>
        </div>
        <div className="de-viewtab-elset">
          <label className="de-viewtab-checkbox">
            <input type="checkbox" />
            <span>Ruler</span>
          </label>
          <label className="de-viewtab-checkbox">
            <input type="checkbox" />
            <span>Gridlines</span>
          </label>
          <label className="de-viewtab-checkbox">
            <input type="checkbox" />
            <span>Navigation Pane</span>
          </label>
        </div>
      </div>

      <div className="de-viewtab-separator" />

      {/* Zoom */}
      <div className="de-viewtab-group">
        <div className="de-viewtab-elset">
          <span className="de-viewtab-label">Zoom</span>
        </div>
        <div className="de-viewtab-elset">
          <select
            className="de-viewtab-zoom-select"
            value={documentStore.zoomLevel}
            onChange={(e) => documentStore.setZoomLevel(Number(e.target.value))}
            aria-label="Zoom"
          >
            {ZOOM_LEVELS.map((level) => (
              <option key={level} value={level}>{`${level}%`}</option>
            ))}
          </select>
        </div>
        <div className="de-viewtab-elset">
          <button
            type="button"
            className={`de-viewtab-btn${documentStore.fitToPage ? " active" : ""}`}
            onClick={() => documentStore.setFitToPage(!documentStore.fitToPage)}
            title="Fit to Page"
          >
            Fit to Page
          </button>
        </div>
        <div className="de-viewtab-elset">
          <button
            type="button"
            className={`de-viewtab-btn${documentStore.fitToWidth ? " active" : ""}`}
            onClick={() => documentStore.setFitToWidth(!documentStore.fitToWidth)}
            title="Fit to Width"
          >
            Fit to Width
          </button>
        </div>
      </div>

      <div className="de-viewtab-separator" />

      {/* Views */}
      <div className="de-viewtab-group">
        <div className="de-viewtab-elset">
          <span className="de-viewtab-label">Views</span>
        </div>
        <div className="de-viewtab-elset">
          <button type="button" className="de-viewtab-btn" title="Page View">
            Page
          </button>
          <button type="button" className="de-viewtab-btn" title="Web View">
            Web
          </button>
          <button type="button" className="de-viewtab-btn" title="Read Mode">
            Read
          </button>
        </div>
      </div>

      <div className="de-viewtab-separator" />

      {/* Macros */}
      <div className="de-viewtab-group">
        <div className="de-viewtab-elset">
          <button type="button" className="de-viewtab-btn" title="Macros">
            Macros
          </button>
        </div>
      </div>
    </section>
  )
})

export { ObservedViewTab as ViewTab }
