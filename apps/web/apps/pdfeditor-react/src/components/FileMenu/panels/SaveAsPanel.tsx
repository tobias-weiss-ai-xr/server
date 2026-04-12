export function SaveAsPanel({ visible }: { visible: boolean }) {
  const formats = ["PDF", "PDF/A", "XPS", "DjVu", "PNG", "JPG"]

  return (
    <div
      className="pdf-file-menu-content-box"
      style={{ display: visible ? "block" : "none", padding: "0 0 0 20px" }}
    >
      <div className="pdf-file-menu-header">Download as</div>
      <div className="pdf-file-menu-saveas-formats">
        {formats.map((format) => (
          <button key={format} type="button" className="pdf-file-menu-format-btn">
            <div className="pdf-file-menu-format-icon">
              <span>{format}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
