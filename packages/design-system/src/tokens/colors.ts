// Design tokens — World Office color palette

export const colors = {
  // Neutrals
  neutral: {
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
    950: "#0a0a0a",
  },

  // Accent — cyan from World Office banner
  accent: {
    DEFAULT: "#00d4ff",
    foreground: "#0a0a0a",
  },

  // Semantic
  semantic: {
    background: "#ffffff",
    foreground: "#0a0a0a",
    muted: "#f5f5f5",
    "muted-foreground": "#737373",
    border: "#e5e5e5",
    ring: "#00d4ff",
    surface: "#fafafa",
  },

  // Status
  success: {
    DEFAULT: "#22c55e",
    foreground: "#ffffff",
  },
  warning: {
    DEFAULT: "#f59e0b",
    foreground: "#0a0a0a",
  },
  error: {
    DEFAULT: "#ef4444",
    foreground: "#ffffff",
  },
  info: {
    DEFAULT: "#00d4ff",
    foreground: "#0a0a0a",
  },
} as const;
