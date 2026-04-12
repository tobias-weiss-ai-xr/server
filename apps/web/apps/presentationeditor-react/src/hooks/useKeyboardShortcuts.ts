import { useEffect } from "react"
import { presentationStore } from "../stores/PresentationStore"

export function useKeyboardShortcuts(): void {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault()
          presentationStore.zoomIn()
        } else if (e.key === "-") {
          e.preventDefault()
          presentationStore.zoomOut()
        } else if (e.key === "0") {
          e.preventDefault()
          presentationStore.setZoomLevel(100)
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])
}
