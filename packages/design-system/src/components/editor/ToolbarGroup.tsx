import { type HTMLAttributes, type ReactNode, forwardRef } from "react"
import { spacing } from "../../tokens"

interface ToolbarGroupProps extends HTMLAttributes<HTMLFieldSetElement> {
  children: ReactNode
}

export const ToolbarGroup = forwardRef<HTMLFieldSetElement, ToolbarGroupProps>(
  ({ style, children, ...props }, ref) => (
    <fieldset
      ref={ref}
      style={{
        display: "flex",
        alignItems: "center",
        gap: spacing[0.5],
        padding: `0 ${spacing[0.5]}`,
        ...style,
      }}
      {...props}
    >
      {children}
    </fieldset>
  ),
)

ToolbarGroup.displayName = "ToolbarGroup"
