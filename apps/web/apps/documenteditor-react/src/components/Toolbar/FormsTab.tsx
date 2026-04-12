import { observer } from "mobx-react-lite"

const ObservedFormsTab = observer(function ObservedFormsTab() {
  return (
    <section className="de-formstab-panel" data-tab="forms" role="tabpanel" aria-labelledby="forms">
      {/* Form Fields */}
      <div className="de-formstab-group">
        <div className="de-formstab-elset">
          <span className="de-formstab-label">Form Fields</span>
        </div>
        <div className="de-formstab-elset">
          <button type="button" className="de-formstab-btn" title="Text Input">
            Text Input
          </button>
          <button type="button" className="de-formstab-btn" title="Checkbox">
            Checkbox
          </button>
          <button type="button" className="de-formstab-btn" title="Dropdown">
            Dropdown
          </button>
        </div>
        <div className="de-formstab-elset">
          <button type="button" className="de-formstab-btn" title="Date Picker">
            Date Picker
          </button>
        </div>
        <div className="de-formstab-elset">
          <button type="button" className="de-formstab-btn" title="Combo Box">
            Combo Box
          </button>
        </div>
      </div>

      <div className="de-formstab-separator" />

      {/* Legacy Tools */}
      <div className="de-formstab-group">
        <div className="de-formstab-elset">
          <span className="de-formstab-label">Legacy Tools</span>
        </div>
        <div className="de-formstab-elset">
          <button type="button" className="de-formstab-btn" title="Legacy Form Fields">
            Legacy Form Fields
          </button>
        </div>
      </div>
    </section>
  )
})

export { ObservedFormsTab as FormsTab }
