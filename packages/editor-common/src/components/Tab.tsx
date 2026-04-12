import { colors, spacing, typography } from "@world-office/design-system"
import { useCallback } from "react"
import type { CSSProperties, ReactNode } from "react"

// ── Types ──────────────────────────────────────────────────────────────

export interface TabData {
  id: string
  caption: string
  iconCls?: string
  disabled?: boolean
  closable?: boolean
}

export interface TabBarProps {
  tabs: TabData[]
  activeTab?: string
  className?: string
  style?: CSSProperties
  onTabChange?: (tabId: string) => void
  onTabClose?: (tabId: string) => void
}

export interface TabProps {
  id: string
  active?: boolean
  children: ReactNode
  className?: string
  style?: CSSProperties
}

// ── Tab Component ──────────────────────────────────────────────────────

export function Tab({ id, active, children, className, style }: TabProps) {
  if (!active) return null
  return (
    <div
      id={id}
      className={className}
      style={{
        flex: 1,
        overflow: "auto",
        ...style,
      }}
      role="tabpanel"
    >
      {children}
    </div>
  )
}

// ── Tab Bar Component ─────────────────────────────────────────────────

export function TabBar({
  tabs,
  activeTab,
  className,
  style,
  onTabChange,
  onTabClose,
}: TabBarProps) {
  const handleTabClick = useCallback(
    (tabId: string) => {
      onTabChange?.(tabId)
    },
    [onTabChange],
  )

  const handleCloseClick = useCallback(
    (e: React.MouseEvent, tabId: string) => {
      e.stopPropagation()
      onTabClose?.(tabId)
    },
    [onTabClose],
  )

  const barStyle: CSSProperties = {
    display: "flex",
    alignItems: "stretch",
    borderBottom: `1px solid ${colors.semantic.border}`,
    backgroundColor: colors.neutral[50],
    fontFamily: typography.fontFamily.sans,
    overflowX: "auto" as const,
    flexShrink: 0,
    ...style,
  }

  return (
    <div className={className} style={barStyle} role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        const tabStyle: CSSProperties = {
          display: "flex",
          alignItems: "center",
          gap: spacing[1],
          padding: `${spacing[1]} ${spacing[2]}`,
          fontSize: typography.fontSize.sm,
          fontWeight: isActive ? typography.fontWeight.medium : typography.fontWeight.regular,
          color: isActive ? colors.accent.DEFAULT : colors.neutral[600],
          backgroundColor: isActive ? colors.semantic.background : "transparent",
          border: "none",
          borderBottom: isActive ? `2px solid ${colors.accent.DEFAULT}` : "2px solid transparent",
          cursor: tab.disabled ? "not-allowed" : "pointer",
          opacity: tab.disabled ? 0.5 : 1,
          transition: "color 0.15s, border-color 0.15s",
          whiteSpace: "nowrap" as const,
          userSelect: "none",
          position: "relative",
        }

        const closeStyle: CSSProperties = {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 16,
          height: 16,
          border: "none",
          backgroundColor: "transparent",
          color: colors.neutral[400],
          cursor: "pointer",
          borderRadius: 2,
          padding: 0,
          marginLeft: spacing[0.5],
          fontSize: 14,
          lineHeight: 1,
        }

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-disabled={tab.disabled}
            style={tabStyle}
            onClick={() => handleTabClick(tab.id)}
            disabled={tab.disabled}
          >
            {tab.iconCls && (
              <span className={tab.iconCls} style={{ fontStyle: "normal" }}>
                &nbsp;
              </span>
            )}
            <span>{tab.caption}</span>
            {tab.closable && (
              <button
                type="button"
                style={closeStyle}
                onClick={(e) => handleCloseClick(e, tab.id)}
                aria-label={`Close ${tab.caption}`}
              >
                ×
              </button>
            )}
          </button>
        )
      })}
    </div>
  )
}
