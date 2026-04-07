import React, { forwardRef, type InputHTMLAttributes } from "react";
import { colors, radii, spacing } from "../tokens";

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, className, style, ...props }, ref) => (
  <label className={className} style={{ display: "inline-flex", alignItems: "center", gap: spacing[1.5], cursor: "pointer" }}>
    <input
      ref={ref}
      type="checkbox"
      role="switch"
      style={{
        width: "36px",
        height: "20px",
        borderRadius: radii.full,
        backgroundColor: props.checked ? colors.accent.DEFAULT : colors.neutral[300],
        appearance: "none",
        position: "relative",
        cursor: "pointer",
        transition: "background-color 0.2s",
        ...style,
      }}
      {...props}
    />
    {label && <span style={{ fontSize: "1rem" }}>{label}</span>}
  </label>
)
);
Switch.displayName = "Switch";
