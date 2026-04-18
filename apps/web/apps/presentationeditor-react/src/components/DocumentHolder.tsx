import { observer } from "mobx-react-lite"
import { useEffect, useRef } from "react"
import { presentationStore } from "../stores/PresentationStore"
import { getTotalPages, init, renderPage, setTotalPages } from "../lib/wasm-renderer"

const DEMO_SLIDE_COUNT = 4

const ObservedDocumentHolder = observer(function ObservedDocumentHolder() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const initialized = useRef(false)

  // Initialize renderer once on mount
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || initialized.current) return
    initialized.current = true

    init(canvas)
    setTotalPages(DEMO_SLIDE_COUNT)
    presentationStore.setTotalSlides(DEMO_SLIDE_COUNT)
    renderPage(presentationStore.currentSlide, presentationStore.zoomLevel)
  }, [])

  // Re-render when slide or zoom changes
  useEffect(() => {
    if (!initialized.current) return
    renderPage(presentationStore.currentSlide, presentationStore.zoomLevel)
  }, [presentationStore.currentSlide, presentationStore.zoomLevel])

  const totalPages = getTotalPages()
  const canPrev = presentationStore.currentSlide > 0
  const canNext = presentationStore.currentSlide < totalPages - 1

  return (
    <div className="prese-document-holder" style={{ display: "flex", flexDirection: "column", alignItems: "center", overflow: "auto", height: "100%", backgroundColor: "#2d2d2d" }}>
      {/* Canvas container with shadow */}
      <div style={{ margin: "16px auto", flexShrink: 0, display: "flex", justifyContent: "center" }}>
        <canvas
          ref={canvasRef}
          className="prese-document-canvas"
          style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}
        />
      </div>

      {/* Slide navigation controls */}
      <div className="prese-slide-nav" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", flexShrink: 0 }}>
        <button
          type="button"
          className="prese-slide-nav-btn"
          disabled={!canPrev}
          onClick={() => presentationStore.setCurrentSlide(presentationStore.currentSlide - 1)}
          aria-label="Previous slide"
          style={{
            padding: "4px 10px",
            cursor: canPrev ? "pointer" : "default",
            opacity: canPrev ? 1 : 0.4,
            border: "1px solid #555",
            borderRadius: "3px",
            background: "#444",
            color: "#fff",
            fontSize: "13px",
          }}
        >
          ‹ Prev
        </button>

        <span
          className="prese-slide-nav-label"
          style={{ fontSize: "12px", color: "#aaa", minWidth: "80px", textAlign: "center" }}
        >
          Slide {presentationStore.currentSlide + 1} of {totalPages}
        </span>

        <button
          type="button"
          className="prese-slide-nav-btn"
          disabled={!canNext}
          onClick={() => presentationStore.setCurrentSlide(presentationStore.currentSlide + 1)}
          aria-label="Next slide"
          style={{
            padding: "4px 10px",
            cursor: canNext ? "pointer" : "default",
            opacity: canNext ? 1 : 0.4,
            border: "1px solid #555",
            borderRadius: "3px",
            background: "#444",
            color: "#fff",
            fontSize: "13px",
          }}
        >
          Next ›
        </button>
      </div>
    </div>
  )
})

export { ObservedDocumentHolder as DocumentHolder }
