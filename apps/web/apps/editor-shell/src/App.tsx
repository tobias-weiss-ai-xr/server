import { ThemeProvider } from "@world-office/design-system"
import { EditorLayout } from "./components/EditorLayout"

const defaultConfig = {
  type: "document" as const,
  lang: "en",
}

function App() {
  return (
    <ThemeProvider>
      <EditorLayout editorType={defaultConfig.type} />
    </ThemeProvider>
  )
}

export default App
