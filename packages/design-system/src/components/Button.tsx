import type React from "react"
import { type ButtonHTMLAttributes, forwardRef } from "react"
import { colors, radii, spacing } from "../tokens"

const variantStyles: Record<string, React.CSSProperties> = {
  primary: {
    backgroundColor: colors.accent.DEFAULT,
    color: colors.accent.foreground,
    border: "none",
  },
  secondary: {
    backgroundColor: "transparent",
    color: colors.semantic.foreground,
    border: `1px solid ${colors.semantic.border}`,
  },
  ghost: {
    backgroundColor: "transparent",
    color: colors.semantic.foreground,
    border: "none",
  },
  destructive: {
    backgroundColor: colors.error.DEFAULT,
    color: colors.error.foreground,
    border: "none",
  },
}

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { padding: `${spacing[0.5]} ${spacing[2]}`, fontSize: "0.875rem" },
  md: { padding: `${spacing[1]} ${spacing[3]}`, fontSize: "1rem" },
  lg: { padding: `${spacing[2]} ${spacing[4]}`, fontSize: "1.125rem" },
}

type ButtonVariant = keyof typeof variantStyles
type ButtonSize = keyof typeof sizeStyles

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, style, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={className}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: radii.md,
          fontWeight: 500,
          cursor: "pointer",
          transition: "opacity 0.15s",
          ...variantStyles[variant],
          ...sizeStyles[size],
          ...style,
        }}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"
