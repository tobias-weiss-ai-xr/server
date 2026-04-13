import type { CSSProperties } from "react"
import { colors, radii } from "../tokens"

interface AvatarProps {
  src?: string
  alt?: string
  fallback?: string
  size?: number
  className?: string
  style?: CSSProperties
}

export function Avatar({ src, alt = "", fallback, size = 40, className, style }: AvatarProps) {
  const initials = fallback
    ? fallback
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?"

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: radii.full,
        overflow: "hidden",
        backgroundColor: colors.accent.DEFAULT,
        color: colors.accent.foreground,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.4,
        fontWeight: 600,
        ...style,
      }}
    >
      {src ? (
        <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        initials
      )}
    </div>
  )
}
