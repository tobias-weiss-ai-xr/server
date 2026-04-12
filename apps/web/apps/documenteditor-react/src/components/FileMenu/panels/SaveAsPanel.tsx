export function SaveAsPanel({ visible }: { visible: boolean }) {
  return (
    <div
      className="de-file-menu-content-box"
      style={{ display: visible ? "block" : "none", padding: "0 0 0 20px" }}
    >
      <div className="de-file-menu-header">Download as</div>
      <div className="de-file-menu-formats">
        {[
          "DOCX",
          "PDF",
          "ODT",
          "DOTX",
          "DOCM",
          "PDFA",
          "OTT",
          "MD",
          "RTF",
          "TXT",
          "FB2",
          "EPUB",
          "HTML",
          "JPG",
          "PNG",
        ].map((format) => (
          <button key={format} type="button" className="de-file-menu-format-btn" onClick={() => {}}>
            {format}
          </button>
        ))}
      </div>
    </div>
  )
}
