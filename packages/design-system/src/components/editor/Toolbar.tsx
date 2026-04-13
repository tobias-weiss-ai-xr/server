import { type HTMLAttributes, type ReactNode, forwardRef } from "react"
import { colors, shadows, spacing, typography } from "../../tokens"

const sizeStyles = {
  sm: { padding: `${spacing[0.5]} ${spacing[1]}`, gap: spacing[0.5] },
  md: { padding: `${spacing[0.5]} ${spacing[1.5]}`, gap: spacing[1] },
  lg: { padding: `${spacing[1]} ${spacing[2]}`, gap: spacing[1.5] },
} as const

type ToolbarSize = keyof typeof sizeStyles

interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  size?: ToolbarSize
  children: ReactNode
}

export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(
  ({ size = "md", style, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="toolbar"
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: colors.semantic.background,
          borderBottom: `1px solid ${colors.semantic.border}`,
          boxShadow: shadows.sm,
          fontSize: typography.fontSize.sm,
          lineHeight: typography.lineHeight.normal,
          minHeight: 40,
          overflow: "hidden",
          ...sizeStyles[size],
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    )
  },
)
Toolbar.displayName = "Toolbar"
