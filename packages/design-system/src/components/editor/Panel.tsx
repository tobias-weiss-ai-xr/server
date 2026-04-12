import { forwardRef, type HTMLAttributes, type ReactNode } from "react"
import { colors, spacing, typography } from "../../tokens"

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  children: ReactNode
  collapsible?: boolean
  collapsed?: boolean
  onToggle?: () => void
}

export const Panel = forwardRef<HTMLDivElement, PanelProps>(
  ({ title, children, collapsible, collapsed, onToggle, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          backgroundColor: colors.semantic.surface,
          borderRight: `1px solid ${colors.semantic.border}`,
          overflow: "hidden",
          ...style,
        }}
        {...props}
      >
        {title && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: `${spacing[1]} ${spacing[1.5]}`,
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.semibold,
              color: colors.neutral[600],
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              borderBottom: `1px solid ${colors.semantic.border}`,
              flexShrink: 0,
            }}
          >
            <span>{title}</span>
            {collapsible && (
              <button
                type="button"
                onClick={onToggle}
                aria-label={collapsed ? "Expand panel" : "Collapse panel"}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  color: colors.neutral[500],
                  fontSize: typography.fontSize.sm,
                  lineHeight: 1,
                }}
              >
                {collapsed ? "\u25B6" : "\u25BC"}
              </button>
            )}
          </div>
        )}
        {!collapsed && (
          <div
            style={{
              flex: 1,
              overflow: "auto",
              padding: spacing[1.5],
            }}
          >
            {children}
          </div>
        )}
      </div>
    )
  },
)
Panel.displayName = "Panel"
