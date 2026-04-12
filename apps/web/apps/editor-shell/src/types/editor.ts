export interface EditorConfig {
  type: "document" | "spreadsheet" | "presentation" | "pdf" | "visio"
  documentKey?: string
  permissions?: EditorPermissions
  lang?: string
}

export interface EditorPermissions {
  edit: boolean
  download: boolean
  print: boolean
  review: boolean
  comment: boolean
}

export interface EditorState {
  isReady: boolean
  isLoading: boolean
  error: string | null
  config: EditorConfig
}

export interface ToolbarItem {
  id: string
  type: "button" | "separator" | "dropdown" | "toggle"
  icon?: string
  label?: string
  disabled?: boolean
  active?: boolean
  action?: string
}

export interface PanelConfig {
  id: string
  title: string
  visible: boolean
  width?: number
  minWidth?: number
  maxWidth?: number
  resizable?: boolean
}
