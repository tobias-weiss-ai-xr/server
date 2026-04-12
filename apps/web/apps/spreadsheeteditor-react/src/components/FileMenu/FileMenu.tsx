import type { CSSProperties } from "react"
import { spreadsheetStore } from "../../stores/SpreadsheetStore"
import { SaveAsPanel } from "./panels/SaveAsPanel"
import { SaveCopyPanel } from "./panels/SaveCopyPanel"
import { RecentFilesPanel } from "./panels/RecentFilesPanel"
import { CreateNewPanel } from "./panels/CreateNewPanel"
import { DocumentInfoPanel } from "./panels/DocumentInfoPanel"
import { DocumentRightsPanel } from "./panels/DocumentRightsPanel"
import { SettingsPanel } from "./panels/SettingsPanel"
import { HelpPanel } from "./panels/HelpPanel"
import { ProtectPanel } from "./panels/ProtectPanel"
import { PrintPreviewPanel } from "./panels/PrintPreviewPanel"
import { SuggestPanel } from "./panels/SuggestPanel"
import { FileMenuItems } from "./FileMenuItems"

const panelContainerStyle: CSSProperties = {
  width: "100%",
  paddingLeft: "260px",
  backgroundColor: "var(--wo-color-bg-primary, #ffffff)",
}

const contentBoxBaseStyle: CSSProperties = {
  height: "100%",
  padding: "0 20px",
  position: "relative",
  overflow: "hidden",
  display: "none",
}

export function FileMenu() {
  const activePanel = spreadsheetStore.activeFileMenuPanel

  function handleMenuClick(action: string, hasPanel: boolean): void {
    if (hasPanel) {
      const newPanel = spreadsheetStore.activeFileMenuPanel === action ? null : action
      spreadsheetStore.setActiveFileMenuPanel(newPanel)
    } else {
      spreadsheetStore.setFileMenuOpen(false)
    }
  }

  function handleBack(): void {
    spreadsheetStore.setActiveFileMenuPanel(null)
    spreadsheetStore.setFileMenuOpen(false)
  }

  return (
    <div className="se-file-menu">
      <div className="se-file-menu-list" role="menubar" aria-label="File menu">
        <FileMenuItems onMenuClick={handleMenuClick} onBack={handleBack} />
      </div>
      <div style={panelContainerStyle}>
        <div className="se-file-menu-panel-box" style={contentBoxBaseStyle}>
          <SaveAsPanel visible={activePanel === "saveas"} />
          <SaveCopyPanel visible={activePanel === "save-copy"} />
          <RecentFilesPanel visible={activePanel === "recent"} />
          <CreateNewPanel visible={activePanel === "create-new"} />
          <DocumentInfoPanel visible={activePanel === "info"} />
          <DocumentRightsPanel visible={activePanel === "rights"} />
          <SettingsPanel visible={activePanel === "opts"} />
          <HelpPanel visible={activePanel === "help"} />
          <ProtectPanel visible={activePanel === "protect"} />
          <PrintPreviewPanel visible={activePanel === "printpreview"} />
          <SuggestPanel visible={activePanel === "suggest"} />
        </div>
      </div>
    </div>
  )
}
