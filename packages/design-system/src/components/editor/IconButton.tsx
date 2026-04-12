import { forwardRef, type ButtonHTMLAttributes, type CSSProperties } from "react"
import { colors, radii, typography } from "../../tokens"

const sizeStyles: Record<string, CSSProperties> = {
  sm: { width: 28, height: 28, fontSize: typography.fontSize.xs },
  md: { width: 32, height: 32, fontSize: typography.fontSize.sm },
  lg: { width: 40, height: 40, fontSize: typography.fontSize.base },
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg"
  active?: boolean
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ size = "md", active, style, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={active}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          borderRadius: radii.sm,
          cursor: "pointer",
          transition: "background-color 0.15s, opacity 0.15s",
          backgroundColor: active ? colors.neutral[200] : "transparent",
          color: colors.semantic.foreground,
          padding: 0,
          ...sizeStyles[size],
          ...style,
        }}
        {...props}
      />
    )
  },
)
IconButton.displayName = "IconButton"
