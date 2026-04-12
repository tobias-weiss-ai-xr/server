export function SettingsPanel({ visible }: { visible: boolean }) {
  return (
    <div
      className="de-file-menu-content-box"
      style={{ display: visible ? "block" : "none", padding: "0", flexDirection: "column" }}
    >
      <div className="de-file-menu-header">Advanced Settings</div>
      <div className="de-file-menu-settings-table">
        <tbody>
          <tr className="de-file-menu-row">
            <td className="de-file-menu-group td">
              <span className="de-file-menu-label">Interface Theme</span>
            </td>
            <td className="de-file-menu-right">
              <select className="de-file-menu-select" defaultValue="default">
                <option value="default">Default</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="dark-contrast">Dark Contrast</option>
              </select>
            </td>
          </tr>
          <tr className="de-file-menu-row">
            <td className="de-file-menu-group td">
              <span className="de-file-menu-label">Font Rendering</span>
            </td>
            <td className="de-file-menu-right">
              <select className="de-file-menu-select" defaultValue="auto">
                <option value="auto">Auto</option>
                <option value="windows">Windows GDI</option>
                <option value="gdi">GDI</option>
                <option value="mac">macOS</option>
                <option value="linux">Linux X11</option>
              </select>
            </td>
          </tr>
          <tr className="de-file-menu-row">
            <td className="de-file-menu-group td">
              <span className="de-file-menu-label">Spell Checking</span>
            </td>
            <td className="de-file-menu-right">
              <label className="de-file-menu-checkbox">
                <input type="checkbox" defaultChecked={false} />
                <span>Spell Check as you type</span>
              </label>
            </td>
          </tr>
          <tr className="de-file-menu-row">
            <td className="de-file-menu-group td">
              <span className="de-file-menu-label">Cache Mode</span>
            </td>
            <td className="de-file-menu-right">
              <label className="de-file-menu-checkbox">
                <input type="checkbox" defaultChecked={false} />
                <span>Cache as you type</span>
              </label>
            </td>
          </tr>
          <tr className="de-file-menu-row">
            <td className="de-file-menu-group td">
              <span className="de-file-menu-label">Autosave</span>
            </td>
            <td className="de-file-menu-right">
              <label className="de-file-menu-checkbox">
                <input type="checkbox" defaultChecked={false} />
                <span>Autosave every 5 min</span>
              </label>
            </td>
          </tr>
          <tr className="de-file-menu-row">
            <td className="de-file-menu-group td">
              <span className="de-file-menu-label">Co-Authoring</span>
            </td>
            <td className="de-file-menu-right">
              <label className="de-file-menu-checkbox">
                <input type="checkbox" defaultChecked={false} />
                <span>Track changes</span>
              </label>
            </td>
          </tr>
        </tbody>
      </div>
      <div className="de-file-menu-footer">
        <button type="button" onClick={() => {}}>
          Close
        </button>
      </div>
    </div>
  )
}
