import type { JSX } from "react"

export function CreateNewPanel({ visible }: { visible: boolean }): JSX.Element {
  return (
    <div
      className="prese-file-menu-content-box"
      style={{ display: visible ? "block" : "none", padding: "0 0 0 20px" }}
    >
      <div className="prese-file-menu-header">Create New</div>
      <div className="prese-file-menu-formats">
        {["Blank", "Office Open", "Template", "Content", "Education", "Business", "Calendar"].map(
          (format) => (
            <button
              key={format}
              type="button"
              className="prese-file-menu-format-btn"
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
