import { useEffect } from "react"
import { visioStore } from "../stores/VisioStore"

export function useKeyboardShortcuts(): void {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault()
          visioStore.zoomIn()
        } else if (e.key === "-") {
          e.preventDefault()
          visioStore.zoomOut()
        } else if (e.key === "0") {
          e.preventDefault()
          visioStore.setZoomLevel(100)
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])
}
