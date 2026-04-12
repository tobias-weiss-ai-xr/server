export function SettingsPanel({ visible }: { visible: boolean }) {
  return (
    <div
      className="pdf-file-menu-content-box"
      style={{ display: visible ? "block" : "none", padding: 0, flexDirection: "column" }}
    >
      <div className="pdf-file-menu-header">Advanced Settings</div>
      <table className="pdf-file-menu-settings-table">
        <tbody>
          <tr className="pdf-file-menu-settings-group">
            <td className="pdf-file-menu-settings-label" colSpan={2}>
              Theme
            </td>
          </tr>
          <tr>
            <td className="pdf-file-menu-settings-left">
              <span>Interface theme</span>
            </td>
            <td className="pdf-file-menu-settings-right">
              <select className="pdf-file-menu-select" defaultValue="default">
                <option value="default">Default</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="dark-contrast">Dark Contrast</option>
              </select>
            </td>
          </tr>
          <tr className="pdf-file-menu-settings-divider" />
          <tr className="pdf-file-menu-settings-group">
            <td className="pdf-file-menu-settings-label" colSpan={2}>
              Font Rendering
            </td>
          </tr>
          <tr>
            <td className="pdf-file-menu-settings-left">
              <span>Spell Checking</span>
            </td>
            <td className="pdf-file-menu-settings-right">
              <input type="checkbox" defaultChecked />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
