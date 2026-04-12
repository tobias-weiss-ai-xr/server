import { useEffect } from "react"
import { documentStore } from "../stores/DocumentStore"

export function useKeyboardShortcuts(): void {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault()
          documentStore.zoomIn()
        } else if (e.key === "-") {
          e.preventDefault()
          documentStore.zoomOut()
        } else if (e.key === "0") {
          e.preventDefault()
          documentStore.setZoomLevel(100)
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])
}
