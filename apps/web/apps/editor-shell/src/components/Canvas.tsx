import type { ReactNode } from "react"

interface CanvasProps {
  children?: ReactNode
}

export function Canvas({ children }: CanvasProps) {
  return (
    <div className="canvas-container">
      {children ?? (
        <div className="canvas-placeholder">
          <p>Document canvas will be rendered here.</p>
          <p>Connects to the SDK bridge for document rendering.</p>
        </div>
      )}
    </div>
  )
}
