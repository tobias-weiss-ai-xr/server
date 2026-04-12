import { colors, spacing, typography } from "@world-office/design-system"
import { useCallback, useEffect, useState } from "react"
import type { CSSProperties } from "react"

// ── Types ──────────────────────────────────────────────────────────────

export interface LoadMaskProps {
  visible?: boolean
  text?: string
  className?: string
  style?: CSSProperties
}

// ── Spinner ────────────────────────────────────────────────────────────

function Spinner() {
  const spinnerStyle: CSSProperties = {
    width: 32,
    height: 32,
    border: `3px solid ${colors.neutral[200]}`,
    borderTopColor: colors.accent.DEFAULT,
    borderRadius: "50%",
    animation: "wo-spin 0.8s linear infinite",
  }

  return <div style={spinnerStyle} />
}

// ── Component ──────────────────────────────────────────────────────────

export function LoadMask({ visible = false, text, className, style }: LoadMaskProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (visible) {
      setMounted(true)
    }
  }, [visible])

  const handleTransitionEnd = useCallback(() => {
    if (!visible) setMounted(false)
  }, [visible])

  if (!mounted && !visible) return null

  const overlayStyle: CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    zIndex: 10000,
    opacity: visible ? 1 : 0,
    transition: "opacity 0.2s",
    pointerEvents: visible ? "auto" : "none",
    ...style,
  }

  const textStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.sans,
    color: colors.neutral[600],
  }

  return (
    <div className={className} style={overlayStyle} onTransitionEnd={handleTransitionEnd}>
      <Spinner />
      {text && <span style={textStyle}>{text}</span>}
      <style>{"@keyframes wo-spin { to { transform: rotate(360deg) } }"}</style>
    </div>
  )
}
