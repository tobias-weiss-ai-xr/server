import { useEffect } from "react"
import { ThemeProvider } from "@world-office/design-system"
import { Viewport } from "./components/Viewport"
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts"
import { documentStore } from "./stores/DocumentStore"
import { isDesktop, listenForMenuEvents } from "./bridge"

export function App() {
  useKeyboardShortcuts()

  useEffect(() => {
    const desktop = isDesktop()
    documentStore.setIsDesktop(desktop)
    if (!desktop) return

    let unlisten: (() => void) | undefined
    listenForMenuEvents((payload) => {
      switch (payload.action) {
        case "save":
          break
        case "save-as":
          documentStore.setActiveTab("file")
          documentStore.setActiveFileMenuPanel("saveas")
          break
        case "open":
          documentStore.setActiveTab("file")
          documentStore.setActiveFileMenuPanel("recent")
          break
        case "new":
          documentStore.setFilePath(null)
          documentStore.setDirty(false)
          documentStore.setActiveFileMenuPanel("create-new")
          break
        case "print":
          documentStore.setActiveTab("file")
          documentStore.setActiveFileMenuPanel("printpreview")
          break
        case "close":
          documentStore.setActiveFileMenuPanel(null)
          documentStore.setFileMenuOpen(false)
          break
        case "toggle-sidebar":
          documentStore.setLeftMenuVisible(!documentStore.leftMenuVisible)
          break
        default:
          break
      }
    }).then((fn) => {
      unlisten = fn
    })

    return () => { unlisten?.() }
  }, [])

  return (
    <ThemeProvider>
      <Viewport
        toolbarVisible={documentStore.toolbarVisible}
        statusbarVisible={documentStore.statusbarVisible}
        leftMenuVisible={documentStore.leftMenuVisible}
        rightMenuVisible={documentStore.rightMenuVisible}
        isCompactToolbar={documentStore.isCompactToolbar}
      />
    </ThemeProvider>
  )
}
