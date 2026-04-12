import { colors, radii, spacing, typography } from "@world-office/design-system"
import { forwardRef, useId } from "react"
import type { CSSProperties, TextareaHTMLAttributes } from "react"

// ── Types ──────────────────────────────────────────────────────────────

export interface TextareaFieldProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "style"> {
  label?: string
  error?: string
  hint?: string
  className?: string
  style?: CSSProperties
  ref?: React.Ref<HTMLTextAreaElement>
}

// ── Component ──────────────────────────────────────────────────────────

export function TextareaField({
  label,
  error,
  hint,
  className,
  style,
  disabled,
  ...props
}: TextareaFieldProps) {
  const inputId = useId()
  const id = props.id || inputId

  const wrapperStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: spacing[0.5],
    fontFamily: typography.fontFamily.sans,
  }

  const textareaStyle: CSSProperties = {
    padding: `${spacing[1]} ${spacing[1.5]}`,
    border: `1px solid ${error ? colors.error.DEFAULT : colors.semantic.border}`,
    borderRadius: radii.sm,
    backgroundColor: disabled ? colors.neutral[100] : colors.semantic.background,
    color: colors.semantic.foreground,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.sans,
    lineHeight: typography.lineHeight.normal,
    outline: "none",
    resize: "vertical" as const,
    minHeight: spacing[10],
    transition: "border-color 0.15s",
    ...style,
  }

  return (
    <div style={wrapperStyle} className={className}>
      {label && (
        <label
          htmlFor={id}
          style={{
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.semantic.foreground,
          }}
        >
          {label}
        </label>
      )}
      <textarea id={id} disabled={disabled} style={textareaStyle} {...props} />
      {error && (
        <span style={{ fontSize: typography.fontSize.xs, color: colors.error.DEFAULT }}>
          {error}
        </span>
      )}
      {!error && hint && (
        <span style={{ fontSize: typography.fontSize.xs, color: colors.neutral[500] }}>{hint}</span>
      )}
    </div>
  )
}

export const _TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  function _TextareaField(props, ref) {
    return <TextareaField {...props} ref={ref} />
  },
)
