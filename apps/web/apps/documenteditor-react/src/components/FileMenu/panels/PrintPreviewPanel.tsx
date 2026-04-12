export function PrintPreviewPanel({ visible }: { visible: boolean }) {
  return (
    <div
      className="de-file-menu-content-box"
      style={{ display: visible ? "block" : "none", padding: "0 0 0 20px" }}
    >
      <div className="de-file-menu-header">Print Preview</div>
      <div className="de-file-menu-body">
        <div className="de-print-preview-container">
          <p className="de-print-preview-instruction">
            Print preview of current page or all pages.
          </p>
        </div>
        <div className="de-print-preview-footer">
          <button type="button" onClick={() => {}}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
