import { type CSSProperties, forwardRef, useCallback, useEffect, useRef, useState } from "react"
import { colors, spacing } from "../../tokens"

interface ResizableSplitProps {
  children: [React.ReactNode, React.ReactNode]
  direction?: "horizontal" | "vertical"
  initialSize?: number
  minSize?: number
  maxSize?: number
  style?: CSSProperties
}

export const ResizableSplit = forwardRef<HTMLDivElement, ResizableSplitProps>(
  (
    { children, direction = "horizontal", initialSize = 250, minSize = 100, maxSize = 600, style },
    ref,
  ) => {
    const [size, setSize] = useState(initialSize)
    const dragging = useRef(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const handlePointerDown = useCallback(() => {
      dragging.current = true
      document.body.style.cursor = direction === "horizontal" ? "col-resize" : "row-resize"
      document.body.style.userSelect = "none"
    }, [direction])

    useEffect(() => {
      function handlePointerMove(e: PointerEvent) {
        if (!dragging.current || !containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const isHorizontal = direction === "horizontal"
        const pos = isHorizontal ? e.clientX - rect.left : e.clientY - rect.top
        const clamped = Math.max(minSize, Math.min(maxSize, pos))
        setSize(clamped)
      }

      function handlePointerUp() {
        if (!dragging.current) return
        dragging.current = false
        document.body.style.cursor = ""
        document.body.style.userSelect = ""
      }

      document.addEventListener("pointermove", handlePointerMove)
      document.addEventListener("pointerup", handlePointerUp)
      return () => {
        document.removeEventListener("pointermove", handlePointerMove)
        document.removeEventListener("pointerup", handlePointerUp)
      }
    }, [direction, minSize, maxSize])

    const isHorizontal = direction === "horizontal"
    const firstStyle: CSSProperties = isHorizontal
      ? { width: size, minWidth: 0, flexShrink: 0 }
      : { height: size, minHeight: 0, flexShrink: 0, overflow: "hidden" }
    const secondStyle: CSSProperties = { flex: 1, minWidth: 0, minHeight: 0, overflow: "hidden" }
    const dividerStyle: CSSProperties = isHorizontal
      ? {
          width: 1,
          cursor: "col-resize",
          backgroundColor: colors.semantic.border,
          margin: `${spacing[1]} 0`,
          flexShrink: 0,
          touchAction: "none",
        }
      : {
          height: 1,
          cursor: "row-resize",
          backgroundColor: colors.semantic.border,
          margin: `0 ${spacing[1]}`,
          flexShrink: 0,
          touchAction: "none",
        }

    return (
      <div
        ref={(node) => {
          ;(containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
        }}
        style={{
          display: "flex",
          flexDirection: isHorizontal ? "row" : "column",
          height: "100%",
          width: "100%",
          overflow: "hidden",
          ...style,
        }}
      >
        <div style={firstStyle}>{children[0]}</div>
        <div onPointerDown={handlePointerDown} style={dividerStyle} />
        <div style={secondStyle}>{children[1]}</div>
      </div>
    )
  },
)
ResizableSplit.displayName = "ResizableSplit"
