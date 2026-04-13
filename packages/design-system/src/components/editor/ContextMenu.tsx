import { type CSSProperties, forwardRef, useEffect, useRef, useState } from "react"
import { colors, radii, shadows, spacing, typography } from "../../tokens"

interface ContextMenuItem {
  label: string
  shortcut?: string
  disabled?: boolean
  separator?: boolean
  onClick?: () => void
}

interface ContextMenuProps {
  x: number
  y: number
  items: ContextMenuItem[]
  onClose: () => void
  style?: CSSProperties
}

export const ContextMenu = forwardRef<HTMLDivElement, ContextMenuProps>(
  ({ x, y, items, onClose, style }, ref) => {
    const menuRef = useRef<HTMLDivElement>(null)
    const [position, setPosition] = useState({ x, y })

    useEffect(() => {
      if (!menuRef.current) return
      const rect = menuRef.current.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight
      setPosition({
        x: x + rect.width > vw ? vw - rect.width - 8 : x,
        y: y + rect.height > vh ? vh - rect.height - 8 : y,
      })
    }, [x, y])

    useEffect(() => {
      function handleClick(e: MouseEvent) {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
          onClose()
        }
      }
      function handleKey(e: KeyboardEvent) {
        if (e.key === "Escape") onClose()
      }
      document.addEventListener("mousedown", handleClick)
      document.addEventListener("keydown", handleKey)
      return () => {
        document.removeEventListener("mousedown", handleClick)
        document.removeEventListener("keydown", handleKey)
      }
    }, [onClose])

    return (
      <div
        ref={(node) => {
          ;(menuRef as React.MutableRefObject<HTMLDivElement | null>).current = node
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
        }}
        role="menu"
        style={{
          position: "fixed",
          left: position.x,
          top: position.y,
          zIndex: 9999,
          backgroundColor: colors.semantic.background,
          border: `1px solid ${colors.semantic.border}`,
          borderRadius: radii.md,
          boxShadow: shadows.lg,
          padding: `${spacing[0.5]} 0`,
          minWidth: 180,
          ...style,
        }}
      >
        {items.map((item, i) => {
          if (item.separator) {
            return (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: separators have no unique identifier
                key={`sep-${i}`}
                role="separator"
                tabIndex={-1}
                style={{
                  height: 1,
                  backgroundColor: colors.semantic.border,
                  margin: `${spacing[0.5]} 0`,
                }}
              />
            )
          }
          return (
            <div
              key={`menuitem-${i}-${item.label}`}
              role="menuitem"
              aria-disabled={item.disabled}
              tabIndex={item.disabled ? -1 : 0}
              onClick={item.disabled ? undefined : item.onClick}
              onKeyDown={(e) => {
                if (!item.disabled && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault()
                  item.onClick?.()
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: `${spacing[0.5]} ${spacing[2]}`,
                fontSize: typography.fontSize.sm,
                color: item.disabled ? colors.neutral[400] : colors.semantic.foreground,
                cursor: item.disabled ? "default" : "pointer",
                borderRadius: radii.sm,
                margin: `0 ${spacing[0.5]}`,
                userSelect: "none",
                transition: "background-color 0.1s",
              }}
            >
              <span>{item.label}</span>
              {item.shortcut && (
                <span
                  style={{
                    color: colors.neutral[500],
                    fontSize: typography.fontSize.xs,
                    marginLeft: spacing[6],
                  }}
                >
                  {item.shortcut}
                </span>
              )}
            </div>
          )
        })}
      </div>
    )
  },
)
ContextMenu.displayName = "ContextMenu"
