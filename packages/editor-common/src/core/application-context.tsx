import { type ReactNode, createContext, useContext } from "react"

export type EditorType = "document" | "spreadsheet" | "presentation" | "pdf" | "visio"

export interface EditorPermissions {
  canEdit: boolean
  canDownload: boolean
  canPrint: boolean
  canComment: boolean
  canReview: boolean
  canCopy: boolean
  canProtect: boolean
}

export interface EditorAppConfig {
  editorType: EditorType
  documentId: string
  permissions: EditorPermissions
  locale: string
  theme: "light" | "dark" | "system"
  customizationOptions: Record<string, unknown>
}

interface AppContextValue extends EditorAppConfig {
  setLocale: (locale: string) => void
  setTheme: (theme: "light" | "dark" | "system") => void
}

const ApplicationContext = createContext<AppContextValue | null>(null)

interface AppProviderProps {
  config: EditorAppConfig
  children: ReactNode
  onLocaleChange?: (locale: string) => void
  onThemeChange?: (theme: "light" | "dark" | "system") => void
}

export function AppProvider({ config, children, onLocaleChange, onThemeChange }: AppProviderProps) {
  const value: AppContextValue = {
    ...config,
    setLocale: (locale) => onLocaleChange?.(locale),
    setTheme: (theme) => onThemeChange?.(theme),
  }

  return <ApplicationContext.Provider value={value}>{children}</ApplicationContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(ApplicationContext)
  if (!ctx) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return ctx
}

export function useAppSelector<T>(selector: (config: AppContextValue) => T): T {
  const ctx = useContext(ApplicationContext)
  if (!ctx) {
    throw new Error("useAppSelector must be used within an AppProvider")
  }
  return selector(ctx)
}
