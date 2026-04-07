import React, { createContext, useContext, type ReactNode } from "react";
import { colors, typography, radii, shadows } from "../tokens";

const themeVars = {
  "--wo-color-background": colors.semantic.background,
  "--wo-color-foreground": colors.semantic.foreground,
  "--wo-color-muted": colors.semantic.muted,
  "--wo-color-muted-foreground": colors.semantic["muted-foreground"],
  "--wo-color-border": colors.semantic.border,
  "--wo-color-ring": colors.semantic.ring,
  "--wo-color-accent": colors.accent.DEFAULT,
  "--wo-color-accent-foreground": colors.accent.foreground,
  "--wo-color-success": colors.success.DEFAULT,
  "--wo-color-warning": colors.warning.DEFAULT,
  "--wo-color-error": colors.error.DEFAULT,
  "--wo-font-sans": typography.fontFamily.sans,
  "--wo-font-mono": typography.fontFamily.mono,
  "--wo-radius-sm": radii.sm,
  "--wo-radius-md": radii.md,
  "--wo-radius-lg": radii.lg,
  "--wo-radius-xl": radii.xl,
  "--wo-shadow-sm": shadows.sm,
  "--wo-shadow-md": shadows.md,
  "--wo-shadow-lg": shadows.lg,
} as const;

interface ThemeContextValue {
  vars: typeof themeVars;
}

const ThemeContext = createContext<ThemeContextValue>({ vars: themeVars });

export function useTheme() {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <ThemeContext.Provider value={{ vars: themeVars }}>
      <div style={themeVars as React.CSSProperties}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
