import { observer } from "mobx-react-lite"

const ObservedInsertTab = observer(function ObservedInsertTab() {
  return (
    <section
      className="de-inserttab-panel"
      data-tab="insert"
      role="tabpanel"
      aria-labelledby="insert"
    >
      {/* Pages */}
      <div className="de-inserttab-group">
        <div className="de-inserttab-elset">
          <button type="button" className="de-inserttab-btn" title="Cover Page">
            Cover Page
          </button>
          <button type="button" className="de-inserttab-btn" title="Blank Page">
            Blank Page
          </button>
          <button type="button" className="de-inserttab-btn" title="Page Break">
            Page Break
          </button>
        </div>
      </div>

      <div className="de-inserttab-separator" />

      {/* Tables */}
      <div className="de-inserttab-group">
        <div className="de-inserttab-elset">
          <button type="button" className="de-inserttab-btn" title="Table">
            Table
          </button>
        </div>
      </div>

      <div className="de-inserttab-separator" />

      {/* Illustrations */}
      <div className="de-inserttab-group">
        <div className="de-inserttab-elset">
          <button type="button" className="de-inserttab-btn" title="Shapes">
            Shapes
          </button>
          <button type="button" className="de-inserttab-btn" title="Icons">
            Icons
          </button>
          <button type="button" className="de-inserttab-btn" title="3D Models">
            3D Models
          </button>
        </div>
      </div>

      <div className="de-inserttab-separator" />

      {/* Images */}
      <div className="de-inserttab-group">
        <div className="de-inserttab-elset">
          <button type="button" className="de-inserttab-btn" title="Pictures">
            Pictures
          </button>
          <button type="button" className="de-inserttab-btn" title="Online Pictures">
            Online Pictures
          </button>
          <button type="button" className="de-inserttab-btn" title="Screenshot">
            Screenshot
          </button>
        </div>
      </div>

      <div className="de-inserttab-separator" />

      {/* Links */}
      <div className="de-inserttab-group">
        <div className="de-inserttab-elset">
          <button type="button" className="de-inserttab-btn" title="Link">
            Link
          </button>
        </div>
      </div>

      <div className="de-inserttab-separator" />

      {/* Headers & Footers */}
      <div className="de-inserttab-group">
        <div className="de-inserttab-elset">
          <button type="button" className="de-inserttab-btn" title="Header">
            Header
          </button>
          <button type="button" className="de-inserttab-btn" title="Footer">
            Footer
          </button>
        </div>
        <div className="de-inserttab-elset">
          <button type="button" className="de-inserttab-btn" title="Page Number">
            Page Number
          </button>
        </div>
      </div>

      <div className="de-inserttab-separator" />

      {/* Text */}
      <div className="de-inserttab-group">
        <div className="de-inserttab-elset">
          <button type="button" className="de-inserttab-btn" title="Text Box">
            Text Box
          </button>
        </div>
        <div className="de-inserttab-elset">
          <button type="button" className="de-inserttab-btn" title="Drop Cap">
            Drop Cap
          </button>
        </div>
      </div>

      <div className="de-inserttab-separator" />

      {/* Symbols */}
      <div className="de-inserttab-group">
        <div className="de-inserttab-elset">
          <button type="button" className="de-inserttab-btn" title="Equation">
            Equation
          </button>
        </div>
        <div className="de-inserttab-elset">
          <button type="button" className="de-inserttab-btn" title="Symbol">
            Symbol
          </button>
        </div>
      </div>
    </section>
  )
})

export { ObservedInsertTab as InsertTab }
