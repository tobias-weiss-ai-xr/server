import type { JSX } from "react"

export function SaveAsPanel({ visible }: { visible: boolean }): JSX.Element {
  return (
    <div className="prese-file-menu-content-box" style={{ display: visible ? "block" : "none", padding: "0 0 0 20px" }}>
      <div className="prese-file-menu-header">Download as</div>
      <div className="prese-file-menu-formats">
        {["PPTX", "PPSX", "PDF", "ODP", "POTX", "PPTM", "PDFA", "PDF/A", "OTP", "JPG", "PNG"].map((format) => (
          <button
            key={format}
            type="button"
            className="prese-file-menu-format-btn"
            onClick={() => {}}
          >
            {format}
          </button>
        ))}
      </div>
    </div>
  )
}
