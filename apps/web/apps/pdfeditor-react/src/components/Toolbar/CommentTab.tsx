import { observer } from "mobx-react-lite"
import { pdfStore } from "../../stores/PdfStore"
import type { AnnotationTool } from "../../types/pdf"

const ObservedCommentTab = observer(function ObservedCommentTab() {
  function setAnnotationTool(tool: AnnotationTool | null) {
    pdfStore.setAnnotationTool(tool)
  }

  return (
    <section
      className="pdf-commenttab-panel"
      data-tab="comment"
      role="tabpanel"
      aria-labelledby="comment"
    >
      <div className="pdf-commenttab-group">
        <button
          type="button"
          className={`pdf-commenttab-btn${pdfStore.activeAnnotationTool === "text-comment" ? " active" : ""}`}
          onClick={() => setAnnotationTool("text-comment")}
          title="Text Comment"
        >
          Text Comment
        </button>
        <button
          type="button"
          className={`pdf-commenttab-btn${pdfStore.activeAnnotationTool === "stamp" ? " active" : ""}`}
          onClick={() => setAnnotationTool("stamp")}
          title="Stamp"
        >
          Stamp
        </button>
        <button
          type="button"
          className={`pdf-commenttab-btn${pdfStore.activeAnnotationTool === "shape-comment" ? " active" : ""}`}
          onClick={() => setAnnotationTool("shape-comment")}
          title="Shape Comment"
        >
          Shape Comment
        </button>
      </div>

      <div className="pdf-commenttab-separator" />

      <div className="pdf-commenttab-group">
        <div className="pdf-commenttab-elset">
          <button
            type="button"
            className={`pdf-commenttab-btn${pdfStore.activeAnnotationTool === "highlight" ? " active" : ""}`}
            onClick={() => setAnnotationTool("highlight")}
            title="Highlight"
          >
            Highlight
          </button>
        </div>
      </div>

      <div className="pdf-commenttab-separator" />

      <div className="pdf-commenttab-group">
        <div className="pdf-commenttab-elset">
          <button
            type="button"
            className={`pdf-commenttab-btn${pdfStore.activeAnnotationTool === "strikeout" ? " active" : ""}`}
            onClick={() => setAnnotationTool("strikeout")}
            title="Strikeout"
          >
            Strikeout
          </button>
        </div>
        <div className="pdf-commenttab-elset">
          <button
            type="button"
            className={`pdf-commenttab-btn${pdfStore.activeAnnotationTool === "underline" ? " active" : ""}`}
            onClick={() => setAnnotationTool("underline")}
            title="Underline"
          >
            Underline
          </button>
        </div>
      </div>
    </section>
  )
})

export { ObservedCommentTab as CommentTab }
