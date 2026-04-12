export function RightsPanel({ visible }: { visible: boolean }) {
  return (
    <div
      className="de-file-menu-content-box"
      style={{ display: visible ? "block" : "none", padding: "0 0 0 20px" }}
    >
      <div className="de-file-menu-header">Access Rights</div>
      <div className="de-file-menu-body">
        <p className="de-file-menu-instruction">
          Configure document permissions and access rights.
        </p>
        <div className="de-file-menu-footer">
          <button type="button" onClick={() => {}}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
