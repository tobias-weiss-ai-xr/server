import { ThemeProvider } from "@world-office/design-system"
import { Viewport } from "./components/Viewport"
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts"
import { presentationStore } from "./stores/PresentationStore"

export function App() {
  useKeyboardShortcuts()

  return (
    <ThemeProvider>
      <Viewport
        toolbarVisible={presentationStore.toolbarVisible}
        statusbarVisible={presentationStore.statusbarVisible}
        leftMenuVisible={presentationStore.leftMenuVisible}
        rightMenuVisible={presentationStore.rightMenuVisible}
        isCompactToolbar={presentationStore.isCompactToolbar}
      />
    </ThemeProvider>
  )
}
