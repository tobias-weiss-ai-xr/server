import { observer } from "mobx-react-lite"

const ObservedDesignTab = observer(function ObservedDesignTab() {
  return (
    <section className="prese-designtab-panel" data-tab="design" role="tabpanel" aria-labelledby="design">
      {/* Themes */}
      <div className="prese-designtab-group">
        <div className="prese-designtab-elset">
          <span className="prese-designtab-label">Themes</span>
        </div>
        <div className="prese-designtab-elset">
          <button type="button" className="prese-designtab-btn" title="Theme Gallery">
            Gallery
          </button>
        </div>
      </div>

      <div className="prese-designtab-separator" />

      {/* Slide Size */}
      <div className="prese-designtab-group">
        <div className="prese-designtab-elset">
          <span className="prese-designtab-label">Slide Size</span>
        </div>
        <div className="prese-designtab-elset">
          <button type="button" className="prese-designtab-btn" title="Standard (4:3)">
            Standard (4:3)
          </button>
        </div>
        <div className="prese-designtab-elset">
          <button type="button" className="prese-designtab-btn" title="Widescreen (16:9)">
            Widescreen (16:9)
          </button>
        </div>
        <div className="prese-designtab-elset">
          <button type="button" className="prese-designtab-btn" title="Custom Slide Size...">
            Custom Slide Size...
          </button>
        </div>
      </div>
    </section>
  )
})

export { ObservedDesignTab as DesignTab }
