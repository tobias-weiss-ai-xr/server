import { ThemeProvider } from "@world-office/design-system"
import { Viewport } from "./components/Viewport"
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts"
import { pdfStore } from "./stores/PdfStore"

export function App() {
  useKeyboardShortcuts()

  return (
    <ThemeProvider>
      <Viewport
        toolbarVisible={pdfStore.toolbarVisible}
        statusbarVisible={pdfStore.statusbarVisible}
        leftMenuVisible={pdfStore.leftMenuVisible}
        rightMenuVisible={pdfStore.rightMenuVisible}
        isCompactToolbar={pdfStore.isCompactToolbar}
      />
    </ThemeProvider>
  )
}
