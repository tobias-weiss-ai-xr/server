import { colors, radii, shadows, spacing, typography } from "@world-office/design-system"
import { useCallback, useEffect, useRef } from "react"
import type { CSSProperties, MouseEvent } from "react"

// ── Types ──────────────────────────────────────────────────────────────

export interface MenuItemData {
  id?: string
  caption: string
  value?: string
  iconCls?: string
  disabled?: boolean
  checkable?: boolean
  checked?: boolean
  separator?: boolean
  header?: string
}

export interface MenuProps {
  id?: string
  items: MenuItemData[]
  visible?: boolean
  maxHeight?: number
  className?: string
  style?: CSSProperties
  onItemClick?: (item: MenuItemData, e: MouseEvent) => void
  onItemToggle?: (item: MenuItemData, checked: boolean) => void
  onClose?: () => void
}

// ── Menu Item Component ────────────────────────────────────────────────

function MenuItem({
  item,
  onItemClick,
  onItemToggle,
}: {
  item: MenuItemData
  onItemClick?: (item: MenuItemData, e: MouseEvent) => void
  onItemToggle?: (item: MenuItemData, checked: boolean) => void
}) {
  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (item.disabled) return
      if (item.checkable) {
        onItemToggle?.(item, !item.checked)
      }
      onItemClick?.(item, e)
    },
    [item, onItemClick, onItemToggle],
  )

  if (item.separator) {
    return (
      <li
        style={{
          height: 1,
          backgroundColor: colors.semantic.border,
          margin: `${spacing[0.5]} 0`,
        }}
      />
    )
  }

  if (item.header) {
    return (
      <li
        role="presentation"
        style={{
          padding: `${spacing[1]} ${spacing[2]}`,
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.semibold,
          color: colors.neutral[500],
          textTransform: "uppercase" as const,
          letterSpacing: "0.05em",
        }}
      >
        {item.header}
      </li>
    )
  }

  const itemStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: spacing[1.5],
    padding: `${spacing[0.5]} ${spacing[2]}`,
    cursor: item.disabled ? "not-allowed" : "pointer",
    opacity: item.disabled ? 0.5 : 1,
    color: colors.semantic.foreground,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.sans,
    backgroundColor: "transparent",
    border: "none",
    width: "100%",
    textAlign: "left" as const,
    lineHeight: typography.lineHeight.normal,
    outline: "none",
    userSelect: "none",
    transition: "background-color 0.1s",
  }

  return (
    <li>
      <button
        type="button"
        role="menuitem"
        aria-checked={item.checkable ? item.checked : undefined}
        aria-disabled={item.disabled}
        style={itemStyle}
        onClick={handleClick}
        onMouseEnter={(e) => {
          ;(e.target as HTMLElement).style.backgroundColor = colors.neutral[100]
        }}
        onMouseLeave={(e) => {
          ;(e.target as HTMLElement).style.backgroundColor = "transparent"
        }}
      >
        {item.checkable && (
          <span
            style={{
              width: 16,
              height: 16,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {item.checked && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path
                  d="M2 5L4 7L8 3"
                  stroke={colors.accent.DEFAULT}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
        )}
        {item.iconCls && (
          <span className={item.iconCls} style={{ fontStyle: "normal", flexShrink: 0 }}>
            &nbsp;
          </span>
        )}
        <span style={{ flex: 1 }}>{item.caption}</span>
      </button>
    </li>
  )
}

// ── Menu Component ─────────────────────────────────────────────────────

export function Menu({
  id: _id,
  items,
  visible = false,
  maxHeight = 300,
  className,
  style,
  onItemClick,
  onItemToggle,
  onClose,
}: MenuProps) {
  const menuRef = useRef<HTMLUListElement>(null)

  // Close on click outside
  useEffect(() => {
    if (!visible) return

    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose?.()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose?.()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [visible, onClose])

  const menuStyle: CSSProperties = {
    display: visible ? "block" : "none",
    position: "fixed",
    zIndex: 1000,
    backgroundColor: colors.semantic.background,
    border: `1px solid ${colors.semantic.border}`,
    borderRadius: radii.md,
    boxShadow: shadows.lg,
    padding: `${spacing[0.5]} 0`,
    minWidth: 160,
    maxHeight,
    overflowY: "auto",
    listStyle: "none",
    margin: 0,
    ...style,
  }

  return (
    <ul ref={menuRef} className={className} style={menuStyle} role="menu">
      {items.map((item, index) => (
        <MenuItem
          key={item.id || `menu-item-${index}`}
          item={item}
          onItemClick={onItemClick}
          onItemToggle={onItemToggle}
        />
      ))}
    </ul>
  )
}

// ── Menu Manager (singleton for hide-all) ─────────────────────────────

export const MenuManager = {
  hideAll: () => {
    document.dispatchEvent(new CustomEvent("wo:menu:hideall"))
  },
}
