import { observer } from "mobx-react-lite"

const ObservedAnimationTab = observer(function ObservedAnimationTab() {
  return (
    <section className="prese-animationtab-panel" data-tab="animation" role="tabpanel" aria-labelledby="animation">
      {/* Animations */}
      <div className="prese-animationtab-group">
        <div className="prese-animationtab-elset">
          <span className="prese-animationtab-label">Animations</span>
        </div>
        <div className="prese-animationtab-elset">
          <button type="button" className="prese-animationtab-btn" title="None">
            None
          </button>
        </div>
      </div>

      <div className="prese-animationtab-separator" />

      <div className="prese-animationtab-group">
        <div className="prese-animationtab-elset">
          <button type="button" className="prese-animationtab-btn" title="Entrance">
            Entrance
          </button>
        </div>
        <div className="prese-animationtab-elset">
          <button type="button" className="prese-animationtab-btn" title="Emphasis">
            Emphasis
          </button>
        </div>
        <div className="prese-animationtab-elset">
          <button type="button" className="prese-animationtab-btn" title="Exit">
            Exit
          </button>
        </div>
        <div className="prese-animationtab-elset">
          <button type="button" className="prese-animationtab-btn" title="Motion Paths">
            Motion Paths
          </button>
        </div>
        <div className="prese-animationtab-elset">
          <button type="button" className="prese-animationtab-btn" title="More...">
            More...
          </button>
        </div>
      </div>

      <div className="prese-animationtab-separator" />

      <div className="prese-animationtab-group">
        <div className="prese-animationtab-elset">
          <span className="prese-animationtab-label">Preview</span>
        </div>
        <div className="prese-animationtab-elset">
          <button type="button" className="prese-animationtab-btn" title="Preview Animation">
            Preview
          </button>
        </div>
      </div>

      <div className="prese-animationtab-separator" />

      {/* Advanced Animation */}
      <div className="prese-animationtab-group">
        <div className="prese-animationtab-elset">
          <span className="prese-animationtab-label">Advanced Animation</span>
        </div>
        <div className="prese-animationtab-elset">
          <button type="button" className="prese-animationtab-btn" title="Animation Pane">
            Animation Pane
          </button>
        </div>
      </div>

      <div className="prese-animationtab-separator" />

      {/* Timing */}
      <div className="prese-animationtab-group">
        <div className="prese-animationtab-elset">
          <span className="prese-animationtab-label">Timing</span>
        </div>
        <div className="prese-animationtab-elset">
          <button type="button" className="prese-animationtab-btn" title="Start: On Click">
            Start: On Click
          </button>
        </div>
        <div className="prese-animationtab-elset">
          <button type="button" className="prese-animationtab-btn" title="Start: With Previous">
            Start: With Previous
          </button>
        </div>
        <div className="prese-animationtab-elset">
          <button type="button" className="prese-animationtab-btn" title="Start: After Previous">
            Start: After Previous
          </button>
        </div>
      </div>

      <div className="prese-animationtab-separator" />

      <div className="prese-animationtab-group">
        <div className="prese-animationtab-elset">
          <span className="prese-animationtab-label">Duration</span>
        </div>
        <div className="prese-animationtab-elset">
          <button type="button" className="prese-animationtab-btn" title="Fast (0.5s)">
            Fast
          </button>
          <button type="button" className="prese-animationtab-btn" title="Normal (1s)">
            Normal
          </button>
          <button type="button" className="prese-animationtab-btn" title="Slow (2s)">
            Slow
          </button>
          <button type="button" className="prese-animationtab-btn" title="Very Slow (5s)">
            Very Slow
          </button>
        </div>
      </div>

      <div className="prese-animationtab-separator" />

      <div className="prese-animationtab-group">
        <div className="prese-animationtab-elset">
          <span className="prese-animationtab-label">Delay</span>
        </div>
        <div className="prese-animationtab-elset">
          <button type="button" className="prese-animationtab-btn" title="0s">
            0s
          </button>
          <button type="button" className="prese-animationtab-btn" title="0.25s">
            0.25s
          </button>
          <button type="button" className="prese-animationtab-btn" title="0.5s">
            0.5s
          </button>
          <button type="button" className="prese-animationtab-btn" title="1s">
            1s
          </button>
        </div>
      </div>

      <div className="prese-animationtab-separator" />

      <div className="prese-animationtab-group">
        <div className="prese-animationtab-elset">
          <span className="prese-animationtab-label">Reorder</span>
        </div>
        <div className="prese-animationtab-elset">
          <button type="button" className="prese-animationtab-btn" title="Move Earlier">
            Move Earlier
          </button>
          <button type="button" className="prese-animationtab-btn" title="Move Later">
            Move Later
          </button>
        </div>
      </div>
    </section>
  )
})

export { ObservedAnimationTab as AnimationTab }
