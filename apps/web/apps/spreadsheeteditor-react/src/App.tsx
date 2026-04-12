import { ThemeProvider } from "@world-office/design-system"
import { Viewport } from "./components/Viewport"
import { spreadsheetStore } from "./stores/SpreadsheetStore"
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts"

export function App() {
  useKeyboardShortcuts()

  return (
    <ThemeProvider>
      <Viewport
        toolbarVisible={spreadsheetStore.toolbarVisible}
        statusbarVisible={spreadsheetStore.statusbarVisible}
        leftMenuVisible={spreadsheetStore.leftMenuVisible}
        rightMenuVisible={spreadsheetStore.rightMenuVisible}
        isCompactToolbar={spreadsheetStore.isCompactToolbar}
      />
    </ThemeProvider>
  )
}
