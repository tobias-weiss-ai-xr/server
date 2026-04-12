import type { JSX } from "react"
import { observer } from "mobx-react-lite"
import { presentationStore } from "../../stores/PresentationStore"

function ZoomControls(): JSX.Element {
  return (
    <>
      <div className="prese-statusbar-separator" />
      <button
        type="button"
        className={`prese-statusbar-btn${presentationStore.fitToPage ? " active" : ""}`}
        title="Fit to page"
        onClick={() => presentationStore.setFitToPage(!presentationStore.fitToPage)}
      >
        ⊞
      </button>
      <button
        type="button"
        className={`prese-statusbar-btn${presentationStore.fitToWidth ? " active" : ""}`}
        title="Fit to width"
        onClick={() => presentationStore.setFitToWidth(!presentationStore.fitToWidth)}
      >
        ⇔
      </button>
      <button
        type="button"
        className="prese-statusbar-btn"
        title="Zoom Out"
        onClick={() => presentationStore.zoomOut()}
      >
        −
      </button>
      <div className="prese-statusbar-zoom-label">
        <label className="prese-statusbar-label">{`${presentationStore.zoomLevel}%`}</label>
      </div>
      <button
        type="button"
        className="prese-statusbar-btn"
        title="Zoom In"
        onClick={() => presentationStore.zoomIn()}
      >
        +
      </button>
    </>
  )
}

const ObservedStatusBar = observer(function ObservedStatusBar(): JSX.Element {
  const { totalSlides, currentSlide } = presentationStore

  return (
    <div className="prese-statusbar">
      {/* Slide navigation */}
      <div className="prese-statusbar-slide-nav">
        <button
          type="button"
          className="prese-statusbar-btn"
          title="Previous slide"
          disabled={currentSlide <= 0}
          onClick={() => presentationStore.setCurrentSlide(currentSlide - 1)}
        >
          ‹
        </button>
        <label className="prese-statusbar-page-label">
          Slide {currentSlide + 1} of {totalSlides}
        </label>
        <button
          type="button"
          className="prese-statusbar-btn"
          title="Next slide"
          disabled={currentSlide >= totalSlides - 1}
          onClick={() => presentationStore.setCurrentSlide(currentSlide + 1)}
        >
          ›
        </button>
      </div>

      {/* Slideshow button */}
      <div className="prese-statusbar-tools">
        <button
          type="button"
          className="prese-statusbar-btn"
          title="Slideshow"
        >
          ▶
        </button>
      </div>

      <div className="prese-statusbar-separator" />

      {/* Language selector */}
      <div className="prese-statusbar-tools">
        <select
          className="prese-statusbar-select"
          value={presentationStore.languageCode}
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

      {/* Zoom controls */}
      <div className="prese-statusbar-zoom-box">
        <ZoomControls />
      </div>
    </div>
  )
})

export { ObservedStatusBar as StatusBar }
