import { colors, radii, shadows, spacing, typography } from "@world-office/design-system"
import { useCallback, useEffect, useRef, useState } from "react"
import type { CSSProperties, ReactNode } from "react"

// ── Types ──────────────────────────────────────────────────────────────

export interface TooltipProps {
  children: ReactNode
  content: string
  placement?: "top" | "bottom" | "left" | "right"
  delay?: number
  className?: string
  style?: CSSProperties
}

// ── Component ──────────────────────────────────────────────────────────

export function Tooltip({
  children,
  content,
  placement = "top",
  delay = 300,
  className,
  style,
}: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState<CSSProperties>({})
  const triggerRef = useRef<HTMLSpanElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tipRef.current) return

    const trigger = triggerRef.current.getBoundingClientRect()
    const tip = tipRef.current.getBoundingClientRect()
    const gap = 4
    const styles: CSSProperties = { position: "fixed", zIndex: 9999 }

    switch (placement) {
      case "top":
        styles.left = trigger.left + trigger.width / 2 - tip.width / 2
        styles.top = trigger.top - tip.height - gap
        break
      case "bottom":
        styles.left = trigger.left + trigger.width / 2 - tip.width / 2
        styles.top = trigger.top + trigger.height + gap
        break
      case "left":
        styles.left = trigger.left - tip.width - gap
        styles.top = trigger.top + trigger.height / 2 - tip.height / 2
        break
      case "right":
        styles.left = trigger.left + trigger.width + gap
        styles.top = trigger.top + trigger.height / 2 - tip.height / 2
        break
    }

    setPosition(styles)
  }, [placement])

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => {
      setVisible(true)
      requestAnimationFrame(updatePosition)
    }, delay)
  }, [delay, updatePosition])

  const hide = useCallback(() => {
    clearTimeout(timerRef.current)
    setVisible(false)
  }, [])

  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  const tipStyle: CSSProperties = {
    ...position,
    backgroundColor: colors.neutral[900],
    color: colors.neutral[50],
    padding: `${spacing[0.5]} ${spacing[1]}`,
    borderRadius: radii.sm,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.sans,
    boxShadow: shadows.md,
    whiteSpace: "nowrap" as const,
    pointerEvents: "none",
    display: visible ? "block" : "none",
    ...style,
  }

  return (
    <>
      <span
        ref={triggerRef}
        className={className}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        style={{ display: "inline-flex" }}
      >
        {children}
      </span>
      {visible && (
        <div ref={tipRef} style={tipStyle} role="tooltip">
          {content}
        </div>
      )}
    </>
  )
}
