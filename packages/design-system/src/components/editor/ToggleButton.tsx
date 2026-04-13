import { type ButtonHTMLAttributes, type CSSProperties, forwardRef } from "react"
import { colors, radii, spacing, typography } from "../../tokens"

const sizeStyles: Record<string, CSSProperties> = {
  sm: {
    padding: `${spacing[0.5]} ${spacing[1]}`,
    fontSize: typography.fontSize.xs,
    gap: spacing[0.5],
  },
  md: {
    padding: `${spacing[0.5]} ${spacing[2]}`,
    fontSize: typography.fontSize.sm,
    gap: spacing[1],
  },
  lg: {
    padding: `${spacing[1]} ${spacing[3]}`,
    fontSize: typography.fontSize.base,
    gap: spacing[1.5],
  },
}

interface ToggleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg"
  pressed?: boolean
}

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  ({ size = "md", pressed, style, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={pressed}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          border: `1px solid ${pressed ? colors.accent.DEFAULT : colors.semantic.border}`,
          borderRadius: radii.sm,
          cursor: "pointer",
          transition: "background-color 0.15s, border-color 0.15s",
          backgroundColor: pressed ? `${colors.accent.DEFAULT}15` : "transparent",
          color: pressed ? colors.accent.DEFAULT : colors.semantic.foreground,
          fontWeight: typography.fontWeight.medium,
          ...sizeStyles[size],
          ...style,
        }}
        {...props}
      />
    )
  },
)
ToggleButton.displayName = "ToggleButton"
