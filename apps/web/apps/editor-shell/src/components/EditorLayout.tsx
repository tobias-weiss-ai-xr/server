import type { ReactNode } from "react"
import { Toolbar } from "./Toolbar"
import { StatusBar } from "./StatusBar"
import { Canvas } from "./Canvas"
import { LeftPanel } from "./LeftPanel"
import { RightPanel } from "./RightPanel"
import { TabBar } from "./TabBar"
import type { EditorConfig } from "@/types/editor"

interface EditorLayoutProps {
  editorType: EditorConfig["type"]
  children?: ReactNode
  showLeftPanel?: boolean
  showRightPanel?: boolean
  showTabBar?: boolean
}

export function EditorLayout({
  editorType,
  children,
  showLeftPanel = false,
  showRightPanel = false,
  showTabBar = true,
}: EditorLayoutProps) {
  return (
    <div className="editor-layout">
      <div className="editor-toolbar">
        <Toolbar editorType={editorType} />
      </div>
      <div className="editor-body">
        {showTabBar && <TabBar editorType={editorType} />}
        {showLeftPanel && <LeftPanel />}
        <Canvas>{children}</Canvas>
        {showRightPanel && <RightPanel />}
      </div>
      <div className="editor-statusbar">
        <StatusBar />
      </div>
    </div>
  )
}
