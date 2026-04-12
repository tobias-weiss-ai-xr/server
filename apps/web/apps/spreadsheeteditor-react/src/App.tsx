import { ThemeProvider } from "@world-office/design-system"
import { Viewport } from "./components/Viewport"
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts"
import { spreadsheetStore } from "./stores/SpreadsheetStore"

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
