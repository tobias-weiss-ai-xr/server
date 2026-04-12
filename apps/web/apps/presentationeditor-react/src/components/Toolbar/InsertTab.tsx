import { observer } from "mobx-react-lite"

const ObservedInsertTab = observer(function ObservedInsertTab() {
  return (
    <section
      className="prese-inserttab-panel"
      data-tab="insert"
      role="tabpanel"
      aria-labelledby="insert"
    >
      {/* Slides */}
      <div className="prese-inserttab-group">
        <div className="prese-inserttab-elset">
          <button type="button" className="prese-inserttab-btn" title="New Slide">
            New Slide
          </button>
        </div>
      </div>

      <div className="prese-inserttab-separator" />

      {/* Tables */}
      <div className="prese-inserttab-group">
        <div className="prese-inserttab-elset">
          <button type="button" className="prese-inserttab-btn" title="Table">
            Table
          </button>
        </div>
      </div>

      <div className="prese-inserttab-separator" />

      {/* Illustrations */}
      <div className="prese-inserttab-group">
        <div className="prese-inserttab-elset">
          <button type="button" className="prese-inserttab-btn" title="Shapes">
            Shapes
          </button>
          <button type="button" className="prese-inserttab-btn" title="Icons">
            Icons
          </button>
          <button type="button" className="prese-inserttab-btn" title="3D Models">
            3D Models
          </button>
        </div>
      </div>

      <div className="prese-inserttab-separator" />

      {/* Images */}
      <div className="prese-inserttab-group">
        <div className="prese-inserttab-elset">
          <button type="button" className="prese-inserttab-btn" title="Pictures">
            Pictures
          </button>
          <button type="button" className="prese-inserttab-btn" title="Online Pictures">
            Online Pictures
          </button>
          <button type="button" className="prese-inserttab-btn" title="Photo Album">
            Photo Album
          </button>
        </div>
      </div>

      <div className="prese-inserttab-separator" />

      {/* Links */}
      <div className="prese-inserttab-group">
        <div className="prese-inserttab-elset">
          <button type="button" className="prese-inserttab-btn" title="Link">
            Link
          </button>
        </div>
      </div>

      <div className="prese-inserttab-separator" />

      {/* Text */}
      <div className="prese-inserttab-group">
        <div className="prese-inserttab-elset">
          <button type="button" className="prese-inserttab-btn" title="Text Box">
            Text Box
          </button>
        </div>
        <div className="prese-inserttab-elset">
          <button type="button" className="prese-inserttab-btn" title="WordArt">
            WordArt
          </button>
        </div>
        <div className="prese-inserttab-elset">
          <button type="button" className="prese-inserttab-btn" title="Header & Footer">
            Header & Footer
          </button>
        </div>
        <div className="prese-inserttab-elset">
          <button type="button" className="prese-inserttab-btn" title="Date & Time">
            Date & Time
          </button>
        </div>
        <div className="prese-inserttab-elset">
          <button type="button" className="prese-inserttab-btn" title="Slide Number">
            Slide Number
          </button>
        </div>
      </div>

      <div className="prese-inserttab-separator" />

      {/* Media */}
      <div className="prese-inserttab-group">
        <div className="prese-inserttab-elset">
          <button type="button" className="prese-inserttab-btn" title="Video">
            Video
          </button>
        </div>
        <div className="prese-inserttab-elset">
          <button type="button" className="prese-inserttab-btn" title="Audio">
            Audio
          </button>
        </div>
      </div>

      <div className="prese-inserttab-separator" />

      {/* Symbols */}
      <div className="prese-inserttab-group">
        <div className="prese-inserttab-elset">
          <button type="button" className="prese-inserttab-btn" title="Equation">
            Equation
          </button>
        </div>
        <div className="prese-inserttab-elset">
          <button type="button" className="prese-inserttab-btn" title="Symbol">
            Symbol
          </button>
        </div>
      </div>
    </section>
  )
})

export { ObservedInsertTab as InsertTab }
