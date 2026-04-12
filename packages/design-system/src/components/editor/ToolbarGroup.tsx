import { forwardRef, type HTMLAttributes, type ReactNode } from "react"
import { spacing } from "../../tokens"

interface ToolbarGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export const ToolbarGroup = forwardRef<HTMLDivElement, ToolbarGroupProps>(
  ({ style, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="group"
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
      </div>
    )
  },
)
ToolbarGroup.displayName = "ToolbarGroup"
