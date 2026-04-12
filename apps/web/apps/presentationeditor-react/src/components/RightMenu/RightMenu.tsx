import type { JSX } from "react"
import { observer } from "mobx-react-lite"
import { presentationStore } from "../../stores/PresentationStore"
import type { RightMenuPanel } from "../../types/presentation"
import { RightMenuButton } from "./RightMenuButton"

const BUTTONS: Array<{ action: RightMenuPanel; title: string; icon: string }> = [
  { action: "paragraph", title: "Paragraph", icon: "¶" },
  { action: "table", title: "Table", icon: "⊞" },
  { action: "image", title: "Image", icon: "🖼" },
  { action: "slide", title: "Slide", icon: "📄" },
  { action: "chart", title: "Chart", icon: "📊" },
  { action: "shape", title: "Shape", icon: "⬡" },
  { action: "textart", title: "TextArt", icon: "Aa" },
]

function RightMenuInner(): JSX.Element {
  return (
    <div className="prese-right-menu" role="menubar" aria-orientation="vertical" aria-label="Right menu">
      <div className="prese-right-menu-btns">
        {BUTTONS.map(({ action, title, icon }) => (
          <RightMenuButton
            key={action}
            action={action}
            title={title}
            icon={icon}
            active={presentationStore.activeRightPanel === action}
            onClick={() => presentationStore.toggleRightPanel(action)}
          />
        ))}
      </div>
      <div className="prese-right-panel-side" />
    </div>
  )
}

export const RightMenu = observer(RightMenuInner)
