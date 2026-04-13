import type { EditorConfig } from "@/types/editor"
import { useState } from "react"

interface TabBarProps {
  editorType: EditorConfig["type"]
}

interface TabItem {
  id: string
  icon: string
  label: string
}

function getTabsForType(type: EditorConfig["type"]): TabItem[] {
  const common: TabItem[] = [
    { id: "file", icon: "📄", label: "File" },
    { id: "home", icon: "🏠", label: "Home" },
    { id: "insert", icon: "📌", label: "Insert" },
    { id: "layout", icon: "📐", label: "Layout" },
  ]

  const byType: Record<EditorConfig["type"], TabItem[]> = {
    document: [
      ...common,
      { id: "references", icon: "📖", label: "References" },
      { id: "mailings", icon: "✉️", label: "Mailings" },
      { id: "review", icon: "👁️", label: "Review" },
    ],
    spreadsheet: [
      ...common,
      { id: "formulas", icon: "🔢", label: "Formulas" },
      { id: "data", icon: "📊", label: "Data" },
      { id: "review", icon: "👁️", label: "Review" },
      { id: "view", icon: "🔍", label: "View" },
    ],
    presentation: [
      ...common,
      { id: "transitions", icon: "✨", label: "Transitions" },
      { id: "animations", icon: "🎬", label: "Animations" },
      { id: "show", icon: "🖥️", label: "Slide Show" },
    ],
    pdf: [
      { id: "file", icon: "📄", label: "File" },
      { id: "home", icon: "🏠", label: "Home" },
      { id: "view", icon: "🔍", label: "View" },
      { id: "annotate", icon: "✏️", label: "Annotate" },
    ],
    visio: [
      { id: "file", icon: "📄", label: "File" },
      { id: "home", icon: "🏠", label: "Home" },
      { id: "view", icon: "🔍", label: "View" },
    ],
  }

  return byType[type]
}

export function TabBar({ editorType }: TabBarProps) {
  const tabs = getTabsForType(editorType)
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "")

  return (
    <div className="editor-tabbar" role="tablist" aria-label="Editor tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`tabbar-item ${tab.id === activeTab ? "active" : ""}`}
          title={tab.label}
          role="tab"
          aria-selected={tab.id === activeTab}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.icon}
        </button>
      ))}
    </div>
  )
}
