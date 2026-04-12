import type { JSX } from "react"
import { observer } from "mobx-react-lite"
import { documentStore } from "../../stores/DocumentStore"

function ZoomControls(): JSX.Element {
  return (
    <>
      <div className="de-statusbar-separator" />
      <button
        type="button"
        className={`de-statusbar-btn${documentStore.fitToPage ? " active" : ""}`}
        title="Fit to page"
        onClick={() => documentStore.setFitToPage(!documentStore.fitToPage)}
      >
        ⊞
      </button>
      <button
        type="button"
        className={`de-statusbar-btn${documentStore.fitToWidth ? " active" : ""}`}
        title="Fit to width"
        onClick={() => documentStore.setFitToWidth(!documentStore.fitToWidth)}
      >
        ⇔
      </button>
      <button
        type="button"
        className="de-statusbar-btn"
        title="Zoom Out"
        onClick={() => documentStore.zoomOut()}
      >
        −
      </button>
      <div className="de-statusbar-zoom-label">
        <label className="de-statusbar-label">{`${documentStore.zoomLevel}%`}</label>
      </div>
      <button
        type="button"
        className="de-statusbar-btn"
        title="Zoom In"
        onClick={() => documentStore.zoomIn()}
      >
        +
      </button>
    </>
  )
}

const ObservedStatusBar = observer(function ObservedStatusBar(): JSX.Element {
  const { currentPage, totalPages, languageCode, wordCount, trackChanges, spellingEnabled } = documentStore

  return (
    <div className="de-statusbar">
      {/* Page navigation */}
      <div className="de-statusbar-page-nav">
        <button
          type="button"
          className="de-statusbar-btn"
          title="Previous page"
          disabled={currentPage <= 0}
          onClick={() => documentStore.setCurrentPage(currentPage - 1)}
        >
          ‹
        </button>
        <label className="de-statusbar-page-label">
          Page {currentPage + 1} of {totalPages}
        </label>
        <button
          type="button"
          className="de-statusbar-btn"
          title="Next page"
          disabled={currentPage >= totalPages - 1}
          onClick={() => documentStore.setCurrentPage(currentPage + 1)}
        >
          ›
        </button>
      </div>

      {/* Select/Hand tool */}
      <div className="de-statusbar-tools">
        <button
          type="button"
          className="de-statusbar-btn"
          title="Select Tool"
        >
          ↖
        </button>
        <button
          type="button"
          className="de-statusbar-btn"
          title="Hand Tool"
        >
          ✋
        </button>
      </div>

      <div className="de-statusbar-separator" />

      {/* Language selector */}
      <div className="de-statusbar-tools">
        <select
          className="de-statusbar-select"
          value={languageCode}
          aria-label="Language"
        >
          <option value="en-US">English (US)</option>
          <option value="es-ES">Spanish (ES)</option>
          <option value="fr-FR">French (FR)</option>
          <option value="de-DE">German (DE)</option>
          <option value="it-IT">Italian (IT)</option>
          <option value="pt-BR">Portuguese (PT)</option>
          <option value="ru-RU">Russian (RU)</option>
          <option value="zh-CN">Chinese (ZH)</option>
          <option value="ja-JP">Japanese (JA)</option>
        </select>
      </div>

      {/* Word count */}
      <div className="de-statusbar-tools">
        <label className="de-statusbar-label">Words: {wordCount}</label>
      </div>

      <div className="de-statusbar-separator" />

      {/* Track changes */}
      <div className="de-statusbar-tools">
        <button
          type="button"
          className={`de-statusbar-btn${trackChanges ? " active" : ""}`}
          title="Track Changes"
          onClick={() => documentStore.setTrackChanges(!trackChanges)}
        >
          📝
        </button>
      </div>

      {/* Spelling */}
      <div className="de-statusbar-tools">
        <button
          type="button"
          className={`de-statusbar-btn${spellingEnabled ? " active" : ""}`}
          title="Spelling"
          onClick={() => documentStore.setSpellingEnabled(!spellingEnabled)}
        >
          ✓
        </button>
      </div>

      {/* Zoom controls */}
      <div className="de-statusbar-zoom-box">
        <ZoomControls />
      </div>
    </div>
  )
})

export { ObservedStatusBar as StatusBar }
