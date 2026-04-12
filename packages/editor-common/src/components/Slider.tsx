import { colors, spacing, typography } from "@world-office/design-system"
import { useCallback, useState } from "react"
import type { CSSProperties, InputHTMLAttributes } from "react"

// ── Types ──────────────────────────────────────────────────────────────

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "style"> {
  label?: string
  showValue?: boolean
  className?: string
  style?: CSSProperties
}

// ── Component ──────────────────────────────────────────────────────────

export function Slider({
  label,
  showValue = true,
  className,
  style,
  min = 0,
  max = 100,
  step = 1,
  value: controlledValue,
  onChange,
  ...props
}: SliderProps) {
  const [internalValue, setInternalValue] = useState(Number(min))
  const value = controlledValue !== undefined ? Number(controlledValue) : internalValue

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value)
      setInternalValue(newValue)
      onChange?.(e)
    },
    [onChange],
  )

  const wrapperStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: spacing[0.5],
    fontFamily: typography.fontFamily.sans,
    ...style,
  }

  const headerStyle: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }

  const labelStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: colors.semantic.foreground,
  }

  const valueStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.accent.DEFAULT,
  }

  const trackStyle: CSSProperties = {
    WebkitAppearance: "none" as never,
    appearance: "none" as never,
    width: "100%",
    height: 4,
    borderRadius: 2,
    background: `linear-gradient(to right, ${colors.accent.DEFAULT} 0%, ${colors.accent.DEFAULT} ${((value - Number(min)) / (Number(max) - Number(min))) * 100}%, ${colors.neutral[200]} ${((value - Number(min)) / (Number(max) - Number(min))) * 100}%, ${colors.neutral[200]} 100%)`,
    outline: "none",
    cursor: "pointer",
  }

  return (
    <div className={className} style={wrapperStyle}>
      {(label || showValue) && (
        <div style={headerStyle}>
          {label && <span style={labelStyle}>{label}</span>}
          {showValue && <span style={valueStyle}>{value}</span>}
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        style={trackStyle}
        {...props}
      />
    </div>
  )
}
