import { ThemeProvider } from "@world-office/design-system"
import { Viewport } from "./components/Viewport"
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts"
import { visioStore } from "./stores/VisioStore"

export function App() {
  useKeyboardShortcuts()

  return (
    <ThemeProvider>
      <Viewport
        toolbarVisible={visioStore.toolbarVisible}
        statusbarVisible={visioStore.statusbarVisible}
        leftMenuVisible={visioStore.leftMenuVisible}
        isCompactToolbar={visioStore.isCompactToolbar}
      />
    </ThemeProvider>
  )
}
