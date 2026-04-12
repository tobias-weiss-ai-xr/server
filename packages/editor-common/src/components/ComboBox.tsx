import { colors, radii, spacing, typography } from "@world-office/design-system"
import { useCallback, useEffect, useId, useRef, useState } from "react"
import type { CSSProperties } from "react"
import { Menu, type MenuItemData } from "./Menu"

// ── Types ──────────────────────────────────────────────────────────────

export interface ComboBoxItem {
  id?: string
  value: string
  displayValue: string
  disabled?: boolean
}

export interface ComboBoxProps {
  items: ComboBoxItem[]
  value?: string
  editable?: boolean
  size?: "small" | "normal" | "large"
  maxHeight?: number
  placeholder?: string
  disabled?: boolean
  className?: string
  style?: CSSProperties
  onChange?: (value: string, item: ComboBoxItem | null) => void
  onSelectionChange?: (item: ComboBoxItem) => void
  id?: string
  name?: string
}

// ── Size Styles ────────────────────────────────────────────────────────

const sizeStyles: Record<string, CSSProperties> = {
  small: { padding: `${spacing[0.5]} ${spacing[1]}`, fontSize: typography.fontSize.xs },
  normal: { padding: `${spacing[1]} ${spacing[1.5]}`, fontSize: typography.fontSize.sm },
  large: { padding: `${spacing[1.5]} ${spacing[2]}`, fontSize: typography.fontSize.base },
}

// ── Component ──────────────────────────────────────────────────────────

export function ComboBox({
  items,
  value: controlledValue,
  editable = true,
  size = "normal",
  maxHeight = 200,
  placeholder,
  disabled = false,
  className,
  style,
  onChange,
  onSelectionChange,
  id: externalId,
}: ComboBoxProps) {
  const autoId = useId()
  const id = externalId || autoId
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(controlledValue ?? "")
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInputValue(controlledValue)
    }
  }, [controlledValue])

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  const filteredItems = items.filter((item) =>
    item.displayValue.toLowerCase().includes(inputValue.toLowerCase()),
  )

  const menuItems: MenuItemData[] = filteredItems.map((item) => ({
    id: item.id,
    caption: item.displayValue,
    value: item.value,
    disabled: item.disabled,
  }))

  const handleItemClick = useCallback(
    (menuItem: MenuItemData) => {
      const item = items.find((i) => i.value === menuItem.value)
      if (!item) return
      setInputValue(item.displayValue)
      setOpen(false)
      setHighlightIndex(-1)
      onChange?.(item.value, item)
      onSelectionChange?.(item)
    },
    [items, onChange, onSelectionChange],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value)
      setOpen(true)
      setHighlightIndex(-1)
      onChange?.(e.target.value, null)
    },
    [onChange],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === "ArrowDown" || e.key === "Enter") {
          setOpen(true)
          e.preventDefault()
        }
        return
      }

      switch (e.key) {
        case "ArrowDown":
          setHighlightIndex((i) => Math.min(i + 1, filteredItems.length - 1))
          e.preventDefault()
          break
        case "ArrowUp":
          setHighlightIndex((i) => Math.max(i - 1, 0))
          e.preventDefault()
          break
        case "Enter": {
          if (highlightIndex >= 0 && filteredItems[highlightIndex]) {
            const item = filteredItems[highlightIndex]
            setInputValue(item.displayValue)
            setOpen(false)
            onChange?.(item.value, item)
            onSelectionChange?.(item)
          }
          e.preventDefault()
          break
        }
        case "Escape":
          setOpen(false)
          e.preventDefault()
          break
      }
    },
    [open, highlightIndex, filteredItems, onChange, onSelectionChange],
  )

  const containerStyle: CSSProperties = {
    position: "relative",
    display: "inline-flex",
    fontFamily: typography.fontFamily.sans,
    ...style,
  }

  const inputStyle: CSSProperties = {
    ...sizeStyles[size],
    border: `1px solid ${open ? colors.accent.DEFAULT : colors.semantic.border}`,
    borderRadius: radii.sm,
    backgroundColor: disabled ? colors.neutral[100] : colors.semantic.background,
    color: colors.semantic.foreground,
    outline: "none",
    fontFamily: typography.fontFamily.sans,
    width: "100%",
    paddingRight: spacing[6],
    lineHeight: typography.lineHeight.normal,
    transition: "border-color 0.15s",
  }

  const buttonStyle: CSSProperties = {
    position: "absolute",
    right: spacing[1],
    top: "50%",
    transform: "translateY(-50%)",
    border: "none",
    backgroundColor: "transparent",
    cursor: disabled ? "not-allowed" : "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
    color: colors.neutral[500],
  }

  // Menu position below the input
  const menuStyle: CSSProperties = {
    top: "100%",
    left: 0,
    right: 0,
    marginTop: spacing[0.5],
  }

  const listboxId = `${id}-listbox`

  return (
    <div ref={containerRef} className={className} style={containerStyle}>
      <input
        id={id}
        ref={inputRef}
        type="text"
        value={inputValue}
        readOnly={!editable}
        disabled={disabled}
        placeholder={placeholder}
        style={inputStyle}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => !disabled && setOpen(true)}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
      />
      <button
        type="button"
        style={buttonStyle}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setOpen(!open)
            inputRef.current?.focus()
          }
        }}
        tabIndex={-1}
        aria-label="Toggle dropdown"
      >
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
          <path
            d="M1 1L5 5L9 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <Menu
        id={listboxId}
        items={menuItems}
        visible={open}
        maxHeight={maxHeight}
        style={menuStyle}
        onItemClick={handleItemClick}
        onClose={() => setOpen(false)}
      />
    </div>
  )
}
