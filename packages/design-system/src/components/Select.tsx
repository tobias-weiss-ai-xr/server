import React, { forwardRef, type SelectHTMLAttributes } from "react";
import { colors, radii, spacing } from "../tokens";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, className, style, children, ...props }, ref) => (
  <div className={className} style={{ display: "flex", flexDirection: "column", gap: spacing[0.5] }}>
    {label && (
      <label style={{ fontSize: "0.875rem", fontWeight: 500, color: colors.semantic.foreground }}>{label}</label>
    )}
    <select
      ref={ref}
      style={{
        padding: `${spacing[1.5]} ${spacing[2]}`,
        border: `1px solid ${colors.semantic.border}`,
        borderRadius: radii.md,
        fontSize: "1rem",
        backgroundColor: colors.semantic.background,
        color: colors.semantic.foreground,
        outline: "none",
        ...style,
      }}
      {...props}
    >
      {children}
    </select>
  </div>
)
);
Select.displayName = "Select";
