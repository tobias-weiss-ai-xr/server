export function HelpPanel({ visible }: { visible: boolean }) {
  return (
    <div className="pdf-file-menu-content-box" style={{ display: visible ? "block" : "none", padding: 0, overflowY: "hidden" }}>
      <div className="pdf-file-menu-header">Help</div>
      <div className="pdf-file-menu-help-content">
        <p>Visit the World Office documentation for detailed guides and tutorials.</p>
      </div>
    </div>
  )
}
