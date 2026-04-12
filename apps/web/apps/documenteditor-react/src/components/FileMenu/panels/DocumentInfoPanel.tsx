import { documentStore } from "../../../stores/DocumentStore"

export function DocumentInfoPanel({ visible }: { visible: boolean }) {
  const doc = documentStore.document

  return (
    <div className="de-file-menu-content-box" style={{ display: visible ? "block" : "none", padding: "0 0 0 20px" }}>
      <div className="de-file-menu-header">
        Document Info
      </div>
      <div className="de-file-menu-info-table">
        <tbody>
          <tr className="de-file-menu-info-row">
            <td className="de-file-menu-info-left">
              <span className="de-file-menu-label">Title:</span>
            </td>
            <td className="de-file-menu-info-right">
              <span className="de-file-menu-value">{doc?.title ?? "Untitled"}</span>
            </td>
          </tr>
          <tr className="de-file-menu-info-row">
            <td className="de-file-menu-info-left">
              <span className="de-file-menu-label">Author:</span>
            </td>
            <td className="de-file-menu-info-right">
              <span className="de-file-menu-value">{doc?.info?.author ?? "—"}</span>
            </td>
          </tr>
          <tr className="de-file-menu-info-row">
            <td className="de-file-menu-info-left">
              <span className="de-file-menu-label">Created:</span>
            </td>
            <td className="de-file-menu-info-right">
              <span className="de-file-menu-value">{doc?.info?.created ?? "—"}</span>
            </td>
          </tr>
          <tr className="de-file-menu-info-row">
            <td className="de-file-menu-info-left">
              <span className="de-file-menu-label">Modified:</span>
            </td>
            <td className="de-file-menu-info-right">
              <span className="de-file-menu-value">{doc?.info?.modified ?? "—"}</span>
            </td>
          </tr>
          <tr className="de-file-menu-info-divider td">
            <td colSpan={2} />
          </tr>
          <tr className="de-file-menu-info-row">
            <td className="de-file-menu-info-left">
              <span className="de-file-menu-label">Type:</span>
            </td>
            <td className="de-file-menu-info-right">
              <span className="de-file-menu-value">{doc?.fileType ?? "—"}</span>
            </td>
          </tr>
          <tr className="de-file-menu-info-row">
            <td className="de-file-menu-info-left">
              <span className="de-file-menu-label">Size:</span>
            </td>
            <td className="de-file-menu-info-right">
              <span className="de-file-menu-value">{doc?.info?.pageCount ?? "—"}</span>
            </td>
          </tr>
          <tr className="de-file-menu-info-row">
            <td className="de-file-menu-info-left">
              <span className="de-file-menu-label">Pages:</span>
            </td>
            <td className="de-file-menu-info-right">
              <span className="de-file-menu-value">{doc?.info?.pageCount ?? "—"}</span>
            </td>
          </tr>
          <tr className="de-file-menu-info-row">
            <td className="de-file-menu-info-left">
              <span className="de-file-menu-label">Format:</span>
            </td>
            <td className="de-file-menu-info-right">
              <span className="de-file-menu-value">{doc?.fileType ?? "—"}</span>
            </td>
          </tr>
          <tr className="de-file-menu-info-row">
            <td className="de-file-menu-info-left">
              <span className="de-file-menu-label">Language:</span>
            </td>
            <td className="de-file-menu-info-right">
              <span className="de-file-menu-value">{documentStore.languageCode ?? "en-US"}</span>
            </td>
          </tr>
        </tbody>
      </div>
    </div>
  )
}
