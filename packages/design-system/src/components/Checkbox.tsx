import React, { forwardRef, type InputHTMLAttributes } from "react";
import { colors, spacing } from "../tokens";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, style, ...props }, ref) => (
  <label className={className} style={{ display: "inline-flex", alignItems: "center", gap: spacing[1.5], cursor: "pointer", fontSize: "1rem" }}>
    <input ref={ref} type="checkbox" style={{ width: "16px", height: "16px", accentColor: colors.accent.DEFAULT, ...style }} {...props} />
    {label && <span>{label}</span>}
  </label>
)
);
Checkbox.displayName = "Checkbox";
