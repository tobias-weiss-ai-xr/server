export function HelpPanel({ visible }: { visible: boolean }) {
  return (
    <div className="de-file-menu-content-box" style={{ display: visible ? "block" : "none", padding: "0 20px 0" }}>
      <div className="de-file-menu-header">Help</div>
      <div className="de-file-menu-help-content">
        <p>Visit World Office documentation for detailed guides and tutorials.</p>
      </div>
    </div>
  )
}
