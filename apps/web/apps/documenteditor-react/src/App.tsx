import { ThemeProvider } from "@world-office/design-system"
import { Viewport } from "./components/Viewport"
import { documentStore } from "./stores/DocumentStore"
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts"

export function App() {
  useKeyboardShortcuts()

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
