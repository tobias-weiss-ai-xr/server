import { forwardRef, type HTMLAttributes } from "react"
import { colors, spacing } from "../../tokens"

type SeparatorOrientation = "vertical" | "horizontal"

interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: SeparatorOrientation
}

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  ({ orientation = "vertical", style, ...props }, ref) => {
    const isVertical = orientation === "vertical"
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation={orientation}
        style={{
          backgroundColor: colors.semantic.border,
          flexShrink: 0,
          ...(isVertical
            ? { width: 1, height: spacing[4], margin: `0 ${spacing[0.5]}` }
            : { height: 1, width: "100%", margin: `${spacing[0.5]} 0` }),
          ...style,
        }}
        {...props}
      />
    )
  },
)
Separator.displayName = "Separator"
