import type { EditorConfig } from "@/types/editor"

interface ToolbarProps {
  editorType: EditorConfig["type"]
}

export function Toolbar({ editorType }: ToolbarProps) {
  return (
    <div className="toolbar-container" role="toolbar" aria-label={`${editorType} toolbar`}>
      <span>{editorType.charAt(0).toUpperCase() + editorType.slice(1)} Editor Toolbar</span>
    </div>
  )
}
