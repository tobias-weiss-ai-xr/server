export function RecentFilesPanel({ visible }: { visible: boolean }) {
  const recentDocs = [
    { id: 1, title: "Untitled Document", date: "2026-04-10" },
    { id: 2, title: "Document.docx", date: "2026-04-09" },
    { id: 3, title: "Report.docx", date: "2026-04-08" },
  ]

  return (
    <div
      className="de-file-menu-content-box"
      style={{ display: visible ? "block" : "none", padding: "0 0 0 20px" }}
    >
      <div className="de-file-menu-header">Recent Files</div>
      <div className="de-file-menu-body">
        <p className="de-file-menu-instruction">Choose a recent document from the list to open.</p>
      </div>
      <div className="de-file-menu-footer">
        <button type="button" onClick={() => {}}>
          Cancel
        </button>
      </div>
      <div className="de-file-menu-list">
        {recentDocs.map((doc) => (
          <button key={doc.id} type="button" className="de-file-menu-item" onClick={() => {}}>
            <span className="de-file-menu-item-title">{doc.title}</span>
            <span className="de-file-menu-item-date">{doc.date}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
