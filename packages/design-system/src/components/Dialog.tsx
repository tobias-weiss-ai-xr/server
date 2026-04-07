import React from "react";
import { colors, radii, shadows, spacing } from "../tokens";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Dialog({ open, onClose, title, children, className, style }: DialogProps) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose} />
      <div
        className={className}
        style={{
          position: "relative",
          backgroundColor: colors.semantic.background,
          borderRadius: radii.xl,
          boxShadow: shadows.xl,
          maxWidth: "480px",
          width: "100%",
          margin: spacing[4],
          ...style,
        }}
      >
        {title && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `${spacing[3]} ${spacing[4]}`, borderBottom: `1px solid ${colors.semantic.border}` }}>
            <h2 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 600 }}>{title}</h2>
            <button onClick={onClose} style={{ border: "none", background: "none", fontSize: "1.25rem", cursor: "pointer", color: colors.neutral[500] }}>x</button>
          </div>
        )}
        <div style={{ padding: `${spacing[4]}` }}>{children}</div>
      </div>
    </div>
  );
}
