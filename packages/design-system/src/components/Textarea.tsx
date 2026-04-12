import { forwardRef, type TextareaHTMLAttributes } from "react";
import { colors, radii, spacing } from "../tokens";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, className, style, ...props }, ref) => (
  <div className={className} style={{ display: "flex", flexDirection: "column", gap: spacing[0.5] }}>
    {label && (
      <label style={{ fontSize: "0.875rem", fontWeight: 500, color: colors.semantic.foreground }}>{label}</label>
    )}
    <textarea
      ref={ref}
      style={{
        padding: `${spacing[1.5]} ${spacing[2]}`,
        border: `1px solid ${colors.semantic.border}`,
        borderRadius: radii.md,
        fontSize: "1rem",
        backgroundColor: colors.semantic.background,
        color: colors.semantic.foreground,
        outline: "none",
        minHeight: "80px",
        resize: "vertical",
        fontFamily: "inherit",
        ...style,
      }}
      {...props}
    />
  </div>
)
);
Textarea.displayName = "Textarea";
