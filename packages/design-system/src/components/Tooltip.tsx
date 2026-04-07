import React, { useState } from "react";
import { colors, spacing } from "../tokens";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Tooltip({ content, children, className, style }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  return (
    <span
      className={className}
      style={{ position: "relative", display: "inline-flex", ...style }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span style={{
          position: "absolute",
          bottom: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          marginBottom: spacing[1],
          padding: `${spacing[0.5]} ${spacing[1]}`,
          backgroundColor: colors.neutral[900],
          color: colors.neutral[50],
          fontSize: "0.75rem",
          borderRadius: "4px",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}>
          {content}
        </span>
      )}
    </span>
  );
}
