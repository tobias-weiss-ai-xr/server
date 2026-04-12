export function CreateNewPanel({ visible }: { visible: boolean }) {
  return (
    <div
      className="de-file-menu-content-box"
      style={{ display: visible ? "block" : "none", padding: "0 0 0 20px" }}
    >
      <div className="de-file-menu-header">Create New</div>
      <div className="de-file-menu-formats">
        {["Blank", "Office Open", "Template", "Content", "Education", "Business", "Calendar"].map(
          (format) => (
            <button
              key={format}
              type="button"
              className="de-file-menu-format-btn"
              onClick={() => {}}
            >
              {format}
            </button>
          ),
        )}
      </div>
    </div>
  )
}
