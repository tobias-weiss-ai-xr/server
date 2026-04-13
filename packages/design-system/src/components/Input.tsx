import { type InputHTMLAttributes, forwardRef } from "react"
import { colors, radii, spacing } from "../tokens"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  id?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, style, ...props }, ref) => (
    <div
      className={className}
      style={{ display: "flex", flexDirection: "column", gap: spacing[0.5] }}
    >
      {label && (
        <label
          style={{ fontSize: "0.875rem", fontWeight: 500, color: colors.semantic.foreground }}
          htmlFor={props.id}
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={props.id}
        style={{
          padding: `${spacing[1.5]} ${spacing[2]}`,
          border: `1px solid ${error ? colors.error.DEFAULT : colors.semantic.border}`,
          borderRadius: radii.md,
          fontSize: "1rem",
          backgroundColor: colors.semantic.background,
          color: colors.semantic.foreground,
          outline: "none",
          ...style,
        }}
        {...props}
      />
      {error && <span style={{ fontSize: "0.75rem", color: colors.error.DEFAULT }}>{error}</span>}
    </div>
  ),
)
Input.displayName = "Input"
