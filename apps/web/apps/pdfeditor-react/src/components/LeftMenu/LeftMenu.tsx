import { observer } from "mobx-react-lite"
import type { JSX } from "react"
import { pdfStore } from "../../stores/PdfStore"
import type { LeftMenuAction } from "../../types/pdf"
import { LeftMenuButton } from "./LeftMenuButton"

const BUTTONS: Array<{ action: LeftMenuAction; title: string; icon: string }> = [
  { action: "search", title: "Search", icon: "🔍" },
  { action: "comments", title: "Comments", icon: "💬" },
  { action: "chat", title: "Chat", icon: "💬" },
  { action: "navigation", title: "Navigation", icon: "📑" },
  { action: "thumbnails", title: "Thumbnails", icon: "📷" },
  { action: "about", title: "About", icon: "ℹ" },
]

function LeftMenuInner(): JSX.Element {
  return (
    <div
      className="pdf-left-menu"
      role="menubar"
      aria-orientation="vertical"
      aria-label="Left menu"
    >
      <div className="pdf-left-menu-btns">
        {BUTTONS.map(({ action, title, icon }) => (
          <LeftMenuButton
            key={action}
            action={action}
            title={title}
            icon={icon}
            active={pdfStore.activeLeftPanel === action}
            onClick={() => pdfStore.toggleLeftPanel(action)}
          />
        ))}
      </div>
      <div className="pdf-left-panel-side">
        <div
          className="pdf-left-panel-chat"
          style={{ display: pdfStore.activeLeftPanel === "chat" ? "block" : "none" }}
        />
      </div>
    </div>
  )
}

export const LeftMenu = observer(LeftMenuInner)
