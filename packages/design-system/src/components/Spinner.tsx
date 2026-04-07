import React from "react";

interface SpinnerProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Spinner({ size = 24, className, style }: SpinnerProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: "wo-spin 1s linear infinite", ...style }}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <style>{`@keyframes wo-spin { to { transform: rotate(360deg) } }`}</style>
    </svg>
  );
}
