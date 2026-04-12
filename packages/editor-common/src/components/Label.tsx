import { colors, spacing, typography } from "@world-office/design-system"
import { useId } from "react"
import type { CSSProperties } from "react"

// ── Types ──────────────────────────────────────────────────────────────

export interface LabelProps {
  htmlFor?: string
  children: string
  className?: string
  style?: CSSProperties
  required?: boolean
}

// ── Component ──────────────────────────────────────────────────────────

export function Label({ htmlFor, children, className, style, required = false }: LabelProps) {
  const autoId = useId()
  const id = htmlFor || autoId

  const labelStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.semantic.foreground,
    fontFamily: typography.fontFamily.sans,
    lineHeight: typography.lineHeight.normal,
    userSelect: "none",
    ...style,
  }

  return (
    <label htmlFor={id} className={className} style={labelStyle}>
      {children}
      {required && <span style={{ color: colors.error.DEFAULT, marginLeft: spacing[0.5] }}>*</span>}
    </label>
  )
}
