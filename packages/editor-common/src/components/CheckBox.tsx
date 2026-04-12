import { colors, spacing, typography } from "@world-office/design-system"
import { useId } from "react"
import type { CSSProperties } from "react"

// ── Types ──────────────────────────────────────────────────────────────

export interface CheckBoxProps {
  id?: string
  label?: string
  checked?: boolean
  disabled?: boolean
  className?: string
  style?: CSSProperties
  onChange?: (checked: boolean) => void
}

// ── Component ──────────────────────────────────────────────────────────

export function CheckBox({
  id: externalId,
  label,
  checked = false,
  disabled = false,
  className,
  style,
  onChange,
}: CheckBoxProps) {
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

  const boxStyle: CSSProperties = {
    width: 16,
    height: 16,
    border: `2px solid ${checked ? colors.accent.DEFAULT : colors.neutral[400]}`,
    borderRadius: 3,
    backgroundColor: checked ? colors.accent.DEFAULT : colors.semantic.background,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.15s, border-color 0.15s",
    flexShrink: 0,
  }

  const checkStyle: CSSProperties = {
    width: 10,
    height: 10,
    color: colors.accent.foreground,
    display: checked ? "block" : "none",
  }

  return (
    <label htmlFor={id} className={className} style={wrapperStyle}>
      <span style={boxStyle}>
        <svg
          style={checkStyle}
          viewBox="0 0 10 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M2 5L4 7L8 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        style={{ display: "none" }}
      />
      {label && <span>{label}</span>}
    </label>
  )
}
