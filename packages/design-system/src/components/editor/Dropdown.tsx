import { type CSSProperties, type ReactNode, forwardRef, useEffect, useRef, useState } from "react"
import { colors, radii, shadows, spacing } from "../../tokens"

interface DropdownProps {
  trigger: ReactNode
  children: ReactNode
  align?: "left" | "right"
  style?: CSSProperties
}

export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  ({ trigger, children, align = "left", style }, ref) => {
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (!open) return
      function handleClick(e: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false)
        }
      }
      function handleKey(e: KeyboardEvent) {
        if (e.key === "Escape") setOpen(false)
      }
      document.addEventListener("mousedown", handleClick)
      document.addEventListener("keydown", handleKey)
      return () => {
        document.removeEventListener("mousedown", handleClick)
        document.removeEventListener("keydown", handleKey)
      }
    }, [open])

    return (
      <div
        ref={(node) => {
          ;(containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
        }}
        style={{ position: "relative", display: "inline-flex", ...style }}
      >
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: spacing[0.5],
            color: "inherit",
            fontSize: "inherit",
          }}
        >
          {trigger}
        </button>
        {open && (
          <div
            role="menu"
            style={{
              position: "absolute",
              top: "100%",
              zIndex: 50,
              marginTop: spacing[0.5],
              backgroundColor: colors.semantic.background,
              border: `1px solid ${colors.semantic.border}`,
              borderRadius: radii.md,
              boxShadow: shadows.lg,
              padding: `${spacing[0.5]} 0`,
              minWidth: 160,
              ...(align === "right" ? { right: 0 } : { left: 0 }),
            }}
          >
            {children}
          </div>
        )}
      </div>
    )
  },
)
Dropdown.displayName = "Dropdown"
