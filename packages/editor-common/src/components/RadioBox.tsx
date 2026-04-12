import { colors, radii, spacing, typography } from "@world-office/design-system"
import { useId } from "react"
import type { CSSProperties } from "react"

// ── Types ──────────────────────────────────────────────────────────────

export interface RadioBoxProps {
  name: string
  id?: string
  label?: string
  value: string
  checked?: boolean
  disabled?: boolean
  className?: string
  style?: CSSProperties
  onChange?: (value: string) => void
}

// ── Component ──────────────────────────────────────────────────────────

export function RadioBox({
  name,
  id: externalId,
  label,
  value,
  checked = false,
  disabled = false,
  className,
  style,
  onChange,
}: RadioBoxProps) {
  const autoId = useId()
  const id = externalId || autoId

  const wrapperStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing[1],
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    userSelect: "none",
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sm,
    ...style,
  }

  const circleStyle: CSSProperties = {
    width: 16,
    height: 16,
    border: `2px solid ${checked ? colors.accent.DEFAULT : colors.neutral[400]}`,
    borderRadius: radii.full,
    backgroundColor: colors.semantic.background,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "border-color 0.15s",
    flexShrink: 0,
  }

  const dotStyle: CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors.accent.DEFAULT,
    display: checked ? "block" : "none",
  }

  return (
    <label htmlFor={id} className={className} style={wrapperStyle}>
      <span style={circleStyle}>
        <span style={dotStyle} />
      </span>
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange?.(value)}
        style={{ display: "none" }}
      />
      {label && <span>{label}</span>}
    </label>
  )
}

// ── Radio Group ────────────────────────────────────────────────────────

export interface RadioGroupProps {
  name: string
  value?: string
  disabled?: boolean
  options: Array<{ value: string; label: string; disabled?: boolean }>
  className?: string
  style?: CSSProperties
  onChange?: (value: string) => void
}

export function RadioGroup({
  name,
  value,
  disabled = false,
  options,
  className,
  style,
  onChange,
}: RadioGroupProps) {
  const groupStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: spacing[1],
    ...style,
  }

  return (
    <div className={className} style={groupStyle} role="radiogroup">
      {options.map((opt) => (
        <RadioBox
          key={opt.value}
          name={name}
          value={opt.value}
          label={opt.label}
          checked={value === opt.value}
          disabled={disabled || opt.disabled}
          onChange={onChange}
        />
      ))}
    </div>
  )
}
