import { useEffect } from "react"
import { pdfStore } from "../stores/PdfStore"

export function useKeyboardShortcuts(): void {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault()
          pdfStore.zoomIn()
        } else if (e.key === "-") {
          e.preventDefault()
          pdfStore.zoomOut()
        } else if (e.key === "0") {
          e.preventDefault()
          pdfStore.setZoomLevel(100)
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])
}
