import { observer } from "mobx-react-lite"

const ObservedTransitionsTab = observer(function ObservedTransitionsTab() {
  return (
    <section className="prese-transitionstab-panel" data-tab="transitions" role="tabpanel" aria-labelledby="transitions">
      {/* Transition to This Slide */}
      <div className="prese-transitionstab-group">
        <div className="prese-transitionstab-elset">
          <span className="prese-transitionstab-label">Transition to This Slide</span>
        </div>
        <div className="prese-transitionstab-elset">
          <button type="button" className="prese-transitionstab-btn" title="No Transition">
            None
          </button>
        </div>
      </div>
      <div className="prese-transitiontab-separator" />

      <div className="prese-transitionstab-group">
        <div className="prese-transitionstab-elset">
          <span className="prese-transitionstab-label">Effect</span>
        </div>
        <div className="prese-transitionstab-elset">
          <button type="button" className="prese-transitionstab-btn" title="Fade">
            Fade
          </button>
          <button type="button" className="prese-transitionstab-btn" title="Push">
            Push
          </button>
          <button type="button" className="prese-transitionstab-btn" title="Wipe">
            Wipe
          </button>
          <button type="button" className="prese-transitionstab-btn" title="Split">
            Split
          </button>
          <button type="button" className="prese-transitionstab-btn" title="Reveal">
            Reveal
          </button>
          <button type="button" className="prese-transitionstab-btn" title="Checker">
            Checker
          </button>
          <button type="button" className="prese-transitionstab-btn" title="Zoom">
            Zoom
          </button>
          <button type="button" className="prese-transitionstab-btn" title="Morph">
            Morph
          </button>
          <button type="button" className="prese-transitionstab-btn" title="Circle">
            Circle
          </button>
          <button type="button" className="prese-transitionstab-btn" title="Uncover">
            Uncover
          </button>
          <button type="button" className="prese-transitionstab-btn" title="Cover">
            Cover
          </button>
        </div>
      </div>

      <div className="prese-transitiontab-separator" />

      <div className="prese-transitionstab-group">
        <div className="prese-transitionstab-elset">
          <span className="prese-transitionstab-label">Duration</span>
        </div>
        <div className="prese-transitionstab-elset">
          <button type="button" className="prese-transitionstab-btn" title="Very Fast (0.1s)">
            Very Fast
          </button>
          <button type="button" className="prese-transitionstab-btn" title="Fast (0.25s)">
            Fast
          </button>
          <button type="button" className="prese-transitionstab-btn" title="Normal (0.5s)">
            Normal
          </button>
          <button type="button" className="prese-transitionstab-btn" title="Slow (1s)">
            Slow
          </button>
          <button type="button" className="prese-transitionstab-btn" title="Very Slow (2s)">
            Very Slow
          </button>
        </div>
      </div>

      <div className="prese-transitiontab-separator" />

      <div className="prese-transitionstab-group">
        <div className="prese-transitionstab-elset">
          <span className="prese-transitionstab-label">Sound</span>
        </div>
        <div className="prese-transitionstab-elset">
          <button type="button" className="prese-transitionstab-btn" title="No Sound">
            No Sound
          </button>
          <button type="button" className="prese-transitionstab-btn" title="Sound">
            Sound
          </button>
        </div>
      </div>

      <div className="prese-transitiontab-separator" />

      <div className="prese-transitionstab-group">
        <div className="prese-transitionstab-elset">
          <span className="prese-transitionstab-label">Advance Slide</span>
        </div>
        <div className="prese-transitionstab-elset">
          <button type="button" className="prese-transitionstab-btn" title="On Mouse Click">
            On Mouse Click
          </button>
          <button type="button" className="prese-transitionstab-btn" title="After">
            After
          </button>
        </div>
        <div className="prese-transitionstab-elset">
          <button type="button" className="prese-transitionstab-btn" title="After (0s)">
            0s
          </button>
          <button type="button" className="prese-transitionstab-btn" title="After (2s)">
            2s
          </button>
          <button type="button" className="prese-transitionstab-btn" title="After (3s)">
            3s
          </button>
          <button type="button" className="prese-transitionstab-btn" title="After (5s)">
            5s
          </button>
          <button type="button" className="prese-transitionstab-btn" title="After (10s)">
            10s
          </button>
        </div>
      </div>

      <div className="prese-transitiontab-separator" />

      <div className="prese-transitionstab-group">
        <div className="prese-transitionstab-elset">
          <button type="button" className="prese-transitionstab-btn" title="Apply to All Slides">
            Apply to All
          </button>
        </div>
      </div>
    </section>
  )
})

export { ObservedTransitionsTab as TransitionsTab }
