import { forwardRef, type HTMLAttributes, type ReactNode } from "react"
import { colors, radii, shadows, spacing } from "../../tokens"

interface MenuProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export const Menu = forwardRef<HTMLDivElement, MenuProps>(
  ({ style, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="menu"
        style={{
          backgroundColor: colors.semantic.background,
          border: `1px solid ${colors.semantic.border}`,
          borderRadius: radii.md,
          boxShadow: shadows.lg,
          padding: `${spacing[0.5]} 0`,
          minWidth: 160,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    )
  },
)
Menu.displayName = "Menu"
