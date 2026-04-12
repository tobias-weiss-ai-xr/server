import { observer } from "mobx-react-lite"
import { documentStore } from "../../stores/DocumentStore"

const ObservedFileTab = observer(function ObservedFileTab() {
  const isActive = documentStore.isFileMenuOpen

  function handleClick() {
    if (isActive) {
      documentStore.setFileMenuOpen(false)
    } else {
      documentStore.setActiveTab("file")
    }
  }

  return (
    <button
      type="button"
      className={`de-toolbar-tab${isActive ? " active" : ""}`}
      data-tab="file"
      onClick={handleClick}
      aria-label="File"
    >
      File
    </button>
  )
})

export { ObservedFileTab as FileTab }
