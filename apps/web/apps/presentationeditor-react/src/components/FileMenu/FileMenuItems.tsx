import type { FileMenuAction } from "../../types/presentation"
import { presentationStore } from "../../stores/PresentationStore"

interface FileMenuItemsProps {
  onMenuClick: (action: string, hasPanel: boolean) => void
  onBack: () => void
}

interface MenuItem {
  action: FileMenuAction | "close-editor"
  caption: string
  hasPanel: boolean
}

const MENU_ITEMS: MenuItem[] = [
  { action: "back", caption: "Back", hasPanel: false },
  { action: "saveas", caption: "Download as...", hasPanel: true },
  { action: "save-copy", caption: "Save Copy as...", hasPanel: true },
  { action: "save-desktop", caption: "Save as...", hasPanel: false },
  { action: "print", caption: "Print", hasPanel: false },
  { action: "printpreview", caption: "Print with Preview", hasPanel: false },
  { action: "rename", caption: "Rename...", hasPanel: false },
  { action: "info", caption: "Document Info...", hasPanel: true },
  { action: "rights", caption: "Access Rights...", hasPanel: true },
  { action: "history", caption: "Version History...", hasPanel: true },
  { action: "opts", caption: "Advanced Settings...", hasPanel: true },
  { action: "help", caption: "Help...", hasPanel: true },
  { action: "exit", caption: "Go to Documents", hasPanel: false },
  { action: "close-editor", caption: "Close Editor", hasPanel: false },
  { action: "external-help", caption: "External Help", hasPanel: false },
  { action: "suggest", caption: "Suggest Feature", hasPanel: false },
  { action: "create-new", caption: "Create New", hasPanel: false },
  { action: "open-recent", caption: "Open Recent", hasPanel: false },
]

export function FileMenuItems({ onMenuClick, onBack }: FileMenuItemsProps) {
  const activePanel = presentationStore.activeFileMenuPanel

  function handleBack(): void {
    onBack()
  }

  return (
    <ul className="prese-file-menu-items">
      <li
        className="prese-file-menu-item"
        role="menuitem"
        onClick={handleBack}
      >
        <span className="prese-file-menu-item-icon">←</span>
        <span className="prese-file-menu-item-caption">Back</span>
      </li>
      <li className="prese-file-menu-divider" />
        {MENU_ITEMS.map((item) => (
          <li
            key={item.action}
            className={`prese-file-menu-item${activePanel === item.action ? " active" : ""}`}
            role="menuitem"
            onClick={() => onMenuClick(item.action, item.hasPanel)}
          >
            <span className="prese-file-menu-item-caption">{item.caption}</span>
          </li>
        ))}
    </ul>
  )
}
