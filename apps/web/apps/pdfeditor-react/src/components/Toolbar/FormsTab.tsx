import { observer } from "mobx-react-lite"
import type { FormFieldType } from "../../types/pdf"

const ObservedFormsTab = observer(function ObservedFormsTab() {
  const formFields: Array<{ type: FormFieldType; label: string }> = [
    { type: "text", label: "Text Field" },
    { type: "combobox", label: "Combo" },
    { type: "dropdown", label: "Dropdown" },
    { type: "checkbox", label: "Checkbox" },
    { type: "radiobox", label: "Radio" },
    { type: "picture", label: "Image" },
    { type: "email", label: "Email" },
    { type: "phone", label: "Phone" },
    { type: "datetime", label: "DateTime" },
    { type: "zipcode", label: "ZipCode" },
    { type: "credit", label: "Credit" },
  ]

  return (
    <section className="pdf-formstab-panel" data-tab="forms" role="tabpanel" aria-labelledby="forms">
      <div className="pdf-formstab-group">
        <div className="pdf-formstab-elset">
          {formFields.map(({ type, label }) => (
            <button
              key={type}
              type="button"
              className="pdf-formstab-btn"
              title={label}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
})

export { ObservedFormsTab as FormsTab }
