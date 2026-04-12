import { forwardRef, type HTMLAttributes, type ReactNode } from "react"
import { colors, spacing, typography } from "../../tokens"

interface StatusBarProps extends HTMLAttributes<HTMLDivElement> {
  left?: ReactNode
  center?: ReactNode
  right?: ReactNode
}

export const StatusBar = forwardRef<HTMLDivElement, StatusBarProps>(
  ({ left, center, right, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: colors.semantic.background,
          borderTop: `1px solid ${colors.semantic.border}`,
          padding: `${spacing[0.5]} ${spacing[2]}`,
          fontSize: typography.fontSize.xs,
          color: colors.neutral[600],
          minHeight: 24,
          userSelect: "none",
          ...style,
        }}
        {...props}
      >
        <div style={{ display: "flex", alignItems: "center", gap: spacing[2], flex: 1, minWidth: 0 }}>
          {left}
        </div>
        {center && (
          <div style={{ display: "flex", alignItems: "center", gap: spacing[2], flexShrink: 0 }}>
            {center}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: spacing[2], flex: 1, minWidth: 0, justifyContent: "flex-end" }}>
          {right}
        </div>
      </div>
    )
  },
)
StatusBar.displayName = "StatusBar"
