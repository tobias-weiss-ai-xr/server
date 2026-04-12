import { forwardRef, type HTMLAttributes, type ReactNode } from "react"
import { colors, radii, spacing, typography } from "../../tokens"

interface MenuItemProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  disabled?: boolean
  active?: boolean
  shortcut?: string
  icon?: ReactNode
}

export const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(
  ({ children, disabled, active, shortcut, icon, style, onClick, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="menuitem"
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={disabled ? undefined : onClick}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault()
            onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>)
          }
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: spacing[1.5],
          padding: `${spacing[0.5]} ${spacing[2]}`,
          fontSize: typography.fontSize.sm,
          color: disabled
            ? colors.neutral[400]
            : colors.semantic.foreground,
          backgroundColor: active ? colors.neutral[100] : "transparent",
          cursor: disabled ? "default" : "pointer",
          borderRadius: radii.sm,
          margin: `0 ${spacing[0.5]}`,
          transition: "background-color 0.1s",
          userSelect: "none",
          ...style,
        }}
        {...props}
      >
        {icon && (
          <span style={{ display: "flex", alignItems: "center", width: 16, flexShrink: 0 }}>
            {icon}
          </span>
        )}
        <span style={{ flex: 1 }}>{children}</span>
        {shortcut && (
          <span
            style={{
              color: colors.neutral[500],
              fontSize: typography.fontSize.xs,
              marginLeft: spacing[4],
            }}
          >
            {shortcut}
          </span>
        )}
      </div>
    )
  },
)
MenuItem.displayName = "MenuItem"
