import { observer } from "mobx-react-lite"
import { pdfStore } from "../../stores/PdfStore"

const ObservedFileTab = observer(function ObservedFileTab() {
  const isActive = pdfStore.isFileMenuOpen

  function handleClick() {
    if (isActive) {
      pdfStore.setFileMenuOpen(false)
    } else {
      pdfStore.setActiveTab("file")
    }
  }

  return (
    <button
      type="button"
      className={`pdf-toolbar-tab${isActive ? " active" : ""}`}
      data-tab="file"
      onClick={handleClick}
      aria-label="File"
    >
      File
    </button>
  )
})

export { ObservedFileTab as FileTab }
