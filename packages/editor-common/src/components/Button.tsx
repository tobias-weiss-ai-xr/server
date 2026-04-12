import { colors, radii, spacing, typography } from "@world-office/design-system"
import { forwardRef, useCallback, useId, useState } from "react"
import type { CSSProperties, MouseEvent, ReactNode } from "react"

// ── Types ──────────────────────────────────────────────────────────────

export interface ButtonProps {
  /** Button content — text or icon node */
  children?: ReactNode
  /** Visual variant */
  variant?: "default" | "primary" | "danger" | "ghost"
  /** Size preset */
  size?: "small" | "normal" | "large"
  /** Icon class name (CSS class for SVG sprite) */
  iconCls?: string
  /** Icon image URL (overrides iconCls) */
  iconImg?: string
  /** Tooltip text */
  hint?: string
  /** HTML id */
  id?: string
  /** Whether the button is disabled */
  disabled?: boolean
  /** Whether the button shows as pressed (toggle mode) */
  pressed?: boolean
  /** Enable toggle behavior */
  enableToggle?: boolean
  /** Allow de-pressing a toggled button */
  allowDepress?: boolean
  /** Toggle group name */
  toggleGroup?: string
  /** Extra CSS class */
  className?: string
  /** Inline style override */
  style?: CSSProperties
  /** Show icon only (no text) */
  onlyIcon?: boolean
  /** Click handler */
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  /** Toggle change handler */
  onToggle?: (pressed: boolean) => void
  /** Ref to the underlying button element */
  ref?: React.Ref<HTMLButtonElement>
}

// ── Variant Styles ─────────────────────────────────────────────────────

const variantStyles: Record<string, CSSProperties> = {
  default: {
    backgroundColor: colors.semantic.background,
    border: `1px solid ${colors.semantic.border}`,
    color: colors.semantic.foreground,
  },
  primary: {
    backgroundColor: colors.accent.DEFAULT,
    border: `1px solid ${colors.accent.DEFAULT}`,
    color: colors.accent.foreground,
  },
  danger: {
    backgroundColor: colors.error.DEFAULT,
    border: `1px solid ${colors.error.DEFAULT}`,
    color: colors.error.foreground,
  },
  ghost: {
    backgroundColor: "transparent",
    border: "1px solid transparent",
    color: colors.semantic.foreground,
  },
}

// ── Size Styles ────────────────────────────────────────────────────────

const sizeStyles: Record<string, CSSProperties> = {
  small: { padding: `${spacing[0.5]} ${spacing[1]}`, fontSize: typography.fontSize.xs },
  normal: { padding: `${spacing[0.5]} ${spacing[2]}`, fontSize: typography.fontSize.sm },
  large: { padding: `${spacing[1]} ${spacing[3]}`, fontSize: typography.fontSize.base },
}

// ── Component ──────────────────────────────────────────────────────────

export function Button({
  children,
  variant = "default",
  size = "normal",
  iconCls,
  iconImg,
  hint,
  id: externalId,
  disabled = false,
  pressed: pressedProp,
  enableToggle = false,
  allowDepress = true,
  className,
  style,
  onlyIcon = false,
  onClick,
  onToggle,
}: ButtonProps) {
  const generatedId = useId()
  const id = externalId || generatedId
  const [internalPressed, setInternalPressed] = useState(false)
  const pressed = pressedProp ?? internalPressed

  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      if (disabled) return

      if (enableToggle) {
        const next = allowDepress ? !pressed : !pressed || false
        setInternalPressed(next)
        onToggle?.(next)
      }

      onClick?.(e)
    },
    [disabled, enableToggle, allowDepress, pressed, onToggle, onClick],
  )

  const isPressed = enableToggle && pressed
  const btnStyle: CSSProperties = {
    ...variantStyles[variant],
    ...sizeStyles[size],
    borderRadius: radii.sm,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    display: "inline-flex",
    alignItems: "center",
    gap: spacing[1],
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.sans,
    lineHeight: typography.lineHeight.normal,
    outline: "none",
    transition: "background-color 0.15s, border-color 0.15s, opacity 0.15s",
    userSelect: "none",
    whiteSpace: "nowrap" as const,
    ...(isPressed && {
      boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.15)",
    }),
    ...style,
  }

  return (
    <button
      type="button"
      id={id}
      className={className}
      style={btnStyle}
      disabled={disabled}
      aria-pressed={enableToggle ? pressed : undefined}
      title={hint}
      onClick={handleClick}
    >
      {iconImg ? (
        <img src={iconImg} alt="" style={{ width: 16, height: 16 }} />
      ) : iconCls ? (
        <i className={iconCls} style={{ fontStyle: "normal" }}>
          &nbsp;
        </i>
      ) : null}
      {!onlyIcon && children ? <span>{children}</span> : null}
    </button>
  )
}

export const _Button = forwardRef<HTMLButtonElement, ButtonProps>(function _Button(props, ref) {
  return <Button {...props} ref={ref} />
})
