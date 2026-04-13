import type React from "react"
import { colors, radii, spacing } from "../tokens"

const variantStyles: Record<string, React.CSSProperties> = {
  default: { backgroundColor: colors.semantic.muted, color: colors.semantic.foreground },
  success: { backgroundColor: colors.success.DEFAULT, color: colors.success.foreground },
  warning: { backgroundColor: colors.warning.DEFAULT, color: colors.warning.foreground },
  error: { backgroundColor: colors.error.DEFAULT, color: colors.error.foreground },
  info: { backgroundColor: colors.accent.DEFAULT, color: colors.accent.foreground },
}

interface BadgeProps {
  variant?: keyof typeof variantStyles
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function Badge({ variant = "default", children, className, style }: BadgeProps) {
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: `${spacing[0.5]} ${spacing[2]}`,
        borderRadius: radii.full,
        fontSize: "0.75rem",
        fontWeight: 500,
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </span>
  )
}
