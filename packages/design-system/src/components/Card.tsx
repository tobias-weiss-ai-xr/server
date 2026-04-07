import React from "react";
import { colors, radii, shadows, spacing } from "../tokens";

interface CardProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Card({ header, children, footer, className, style }: CardProps) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: colors.semantic.background,
        border: `1px solid ${colors.semantic.border}`,
        borderRadius: radii.lg,
        boxShadow: shadows.sm,
        overflow: "hidden",
        ...style,
      }}
    >
      {header && (
        <div style={{ padding: `${spacing[3]} ${spacing[4]}`, borderBottom: `1px solid ${colors.semantic.border}` }}>
          {header}
        </div>
      )}
      <div style={{ padding: `${spacing[4]}` }}>{children}</div>
      {footer && (
        <div style={{ padding: `${spacing[3]} ${spacing[4]}`, borderTop: `1px solid ${colors.semantic.border}` }}>
          {footer}
        </div>
      )}
    </div>
  );
}
