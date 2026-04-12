import type { JSX } from "react"
import { observer } from "mobx-react-lite"
import { pdfStore } from "../../stores/PdfStore"

function ZoomControls(): JSX.Element {
  return (
    <>
      <div className="pdf-statusbar-separator" />
      <button
        type="button"
        className={`pdf-statusbar-btn${pdfStore.fitToPage ? " active" : ""}`}
        title="Fit to page"
        onClick={() => pdfStore.setFitToPage(!pdfStore.fitToPage)}
      >
        ⊞
      </button>
      <button
        type="button"
        className={`pdf-statusbar-btn${pdfStore.fitToWidth ? " active" : ""}`}
        title="Fit to width"
        onClick={() => pdfStore.setFitToWidth(!pdfStore.fitToWidth)}
      >
        ⇔
      </button>
      <button
        type="button"
        className="pdf-statusbar-btn"
        title="Zoom Out"
        onClick={() => pdfStore.zoomOut()}
      >
        −
      </button>
      <div className="pdf-statusbar-zoom-label">
        <label className="pdf-statusbar-label">{`${pdfStore.zoomLevel}%`}</label>
      </div>
      <button
        type="button"
        className="pdf-statusbar-btn"
        title="Zoom In"
        onClick={() => pdfStore.zoomIn()}
      >
        +
      </button>
    </>
  )
}

const ObservedStatusBar = observer(function ObservedStatusBar(): JSX.Element {
  return (
    <div className="pdf-statusbar">
      {/* Page navigation */}
      <div className="pdf-statusbar-page-nav">
        <label className="pdf-statusbar-page-label">
          {pdfStore.pageCount > 0
            ? `Page ${pdfStore.currentPage + 1} of ${pdfStore.pageCount}`
            : ""}
        </label>
        <button
          type="button"
          className="pdf-statusbar-btn"
          title="Previous page"
          disabled={pdfStore.currentPage <= 0}
          onClick={() => pdfStore.setCurrentPage(pdfStore.currentPage - 1)}
        >
          ‹
        </button>
        <button
          type="button"
          className="pdf-statusbar-btn"
          title="Next page"
          disabled={pdfStore.currentPage >= pdfStore.pageCount - 1}
          onClick={() => pdfStore.setCurrentPage(pdfStore.currentPage + 1)}
        >
          ›
        </button>
      </div>

      {/* Tool buttons */}
      <div className="pdf-statusbar-tools">
        <button
          type="button"
          className={`pdf-statusbar-btn${pdfStore.currentTool === "select" ? " active" : ""}`}
          title="Select Tool"
          onClick={() => pdfStore.setCurrentTool("select")}
        >
          ⊙
        </button>
        <button
          type="button"
          className={`pdf-statusbar-btn${pdfStore.currentTool === "hand" ? " active" : ""}`}
          title="Hand Tool"
          onClick={() => pdfStore.setCurrentTool("hand")}
        >
          ✋
        </button>
      </div>

      {/* Zoom controls */}
      <div className="pdf-statusbar-zoom-box">
        <ZoomControls />
      </div>
    </div>
  )
})

export { ObservedStatusBar as StatusBar }
