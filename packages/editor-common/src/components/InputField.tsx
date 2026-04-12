import { colors, radii, spacing, typography } from "@world-office/design-system"
import { forwardRef, useId } from "react"
import type { CSSProperties, InputHTMLAttributes, ReactNode } from "react"

// ── Types ──────────────────────────────────────────────────────────────

export interface InputFieldProps {
  label?: string
  size?: "small" | "normal" | "large"
  error?: string
  hint?: string
  prefix?: ReactNode
  suffix?: ReactNode
  className?: string
  style?: CSSProperties
  disabled?: boolean
  id?: string
  value?: string | number
  placeholder?: string
  onChange?: InputHTMLAttributes<HTMLInputElement>["onChange"]
  ref?: React.Ref<HTMLInputElement>
}

// ── Size Styles ────────────────────────────────────────────────────────

const sizeStyles: Record<string, CSSProperties> = {
  small: { padding: `${spacing[0.5]} ${spacing[1]}`, fontSize: typography.fontSize.xs },
  normal: { padding: `${spacing[1]} ${spacing[1.5]}`, fontSize: typography.fontSize.sm },
  large: { padding: `${spacing[1.5]} ${spacing[2]}`, fontSize: typography.fontSize.base },
}

// ── Component ──────────────────────────────────────────────────────────

export function InputField({
  label,
  size = "normal",
  error,
  hint,
  prefix,
  suffix,
  className,
  style,
  disabled,
  ...props
}: InputFieldProps) {
  const inputId = useId()
  const id = props.id || inputId

  const wrapperStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: spacing[0.5],
    fontFamily: typography.fontFamily.sans,
  }

  const inputContainerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: spacing[1],
    border: `1px solid ${error ? colors.error.DEFAULT : colors.semantic.border}`,
    borderRadius: radii.sm,
    backgroundColor: disabled ? colors.neutral[100] : colors.semantic.background,
    transition: "border-color 0.15s",
    ...style,
  }

  const inputStyle: CSSProperties = {
    ...sizeStyles[size],
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    color: colors.semantic.foreground,
    fontFamily: typography.fontFamily.sans,
    width: "100%",
    lineHeight: typography.lineHeight.normal,
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
      <div style={inputContainerStyle}>
        {prefix}
        <input id={id} disabled={disabled} style={inputStyle} {...props} />
        {suffix}
      </div>
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

export const _InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  function _InputField(props, ref) {
    return <InputField {...props} ref={ref} />
  },
)
