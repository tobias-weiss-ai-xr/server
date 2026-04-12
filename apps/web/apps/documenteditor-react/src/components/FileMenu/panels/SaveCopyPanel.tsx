export function SaveCopyPanel({ visible }: { visible: boolean }) {
  return (
    <div
      className="de-file-menu-content-box"
      style={{ display: visible ? "block" : "none", padding: "0 0 0 20px" }}
    >
      <div className="de-file-menu-header">Save Copy as</div>
      <div className="de-file-menu-body">
        <p className="de-file-menu-instruction">Select a location to save a document copy.</p>
      </div>
      <div className="de-file-menu-footer">
        <button type="button" onClick={() => {}}>
          Cancel
        </button>
      </div>
    </div>
  )
}
