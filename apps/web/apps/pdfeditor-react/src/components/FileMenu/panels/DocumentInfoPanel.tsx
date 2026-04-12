import { pdfStore } from "../../../stores/PdfStore"

export function DocumentInfoPanel({ visible }: { visible: boolean }) {
  const doc = pdfStore.document

  return (
    <div className="pdf-file-menu-content-box" style={{ display: visible ? "block" : "none", padding: "0 30px" }}>
      <div className="pdf-file-menu-header">
        Document Info
      </div>
      <table className="pdf-file-menu-info-table">
        <tbody>
          <tr className="pdf-file-menu-info-row">
            <td className="pdf-file-menu-info-left">
              <label>Title</label>
            </td>
            <td className="pdf-file-menu-info-right">
              <span>{doc?.title ?? "Untitled"}</span>
            </td>
          </tr>
          <tr className="pdf-file-menu-info-divider" />
          <tr className="pdf-file-menu-info-row">
            <td className="pdf-file-menu-info-left">
              <label>Author</label>
            </td>
            <td className="pdf-file-menu-info-right">
              <span>{doc?.info?.author ?? "—"}</span>
            </td>
          </tr>
          <tr className="pdf-file-menu-info-row">
            <td className="pdf-file-menu-info-left">
              <label>Created</label>
            </td>
            <td className="pdf-file-menu-info-right">
              <span>{doc?.info?.created ?? "—"}</span>
            </td>
          </tr>
          <tr className="pdf-file-menu-info-row">
            <td className="pdf-file-menu-info-left">
              <label>Modified</label>
            </td>
            <td className="pdf-file-menu-info-right">
              <span>{doc?.info?.modified ?? "—"}</span>
            </td>
          </tr>
          <tr className="pdf-file-menu-info-row">
            <td className="pdf-file-menu-info-left">
              <label>Pages</label>
            </td>
            <td className="pdf-file-menu-info-right">
              <span>{doc?.info?.pageCount ?? "—"}</span>
            </td>
          </tr>
          <tr className="pdf-file-menu-info-row">
            <td className="pdf-file-menu-info-left">
              <label>Format</label>
            </td>
            <td className="pdf-file-menu-info-right">
              <span>{doc?.fileType?.toUpperCase() ?? "—"}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
