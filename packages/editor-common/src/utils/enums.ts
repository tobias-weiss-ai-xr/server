/**
 * Enum-like constants for document and text types.
 */

/**
 * Document settings types.
 * Used to identify which element type is being configured.
 */
export const DocumentSettingsType = {
  Paragraph: 0,
  Table: 1,
  Header: 2,
  TextArt: 3,
  Shape: 4,
  Image: 5,
  Slide: 6,
  Chart: 7,
  MailMerge: 8,
  Signature: 9,
  Pivot: 10,
  Cell: 11,
  Slicer: 12,
  Form: 13,
} as const

/**
 * Type of document settings element.
 */
export type DocumentSettingsType = (typeof DocumentSettingsType)[keyof typeof DocumentSettingsType]

/**
 * Import text types.
 * Used to identify the source of imported text.
 */
export const ImportTextType = {
  DRM: 0,
  CSV: 1,
  TXT: 2,
  Paste: 3,
  Columns: 4,
  Data: 5,
} as const

/**
 * Type of text import source.
 */
export type ImportTextType = (typeof ImportTextType)[keyof typeof ImportTextType]

/**
 * Color theme values.
 * Used for theme color palette effects.
 */
export const ColorThemeValues = [6, 15, 7, 16, 0, 1, 2, 3, 4, 5] as const

/**
 * Color theme value type.
 */
export type ColorThemeValue = (typeof ColorThemeValues)[number]

/**
 * Common UI block operation types.
 */
export const BlockOperation = {
  ApplyEditRights: -255,
  LoadingDocument: -256,
  UpdateChart: -257,
} as const

/**
 * Block operation type.
 */
export type BlockOperation = (typeof BlockOperation)[keyof typeof BlockOperation]

/**
 * Button lock causes.
 * Used to identify why a button is locked.
 */
export const ButtonLockCause = {
  DocumentReadOnly: "document_readonly",
  DocumentIsLocked: "document_is_locked",
  NotEditingMode: "not_editing_mode",
  IsReviewMode: "is_review_mode",
  IsMobileView: "is_mobile_view",
  SelectionLocked: "selection_locked",
  TooManySlicers: "to_many_slicers",
} as const

/**
 * Button lock cause type.
 */
export type ButtonLockCause = (typeof ButtonLockCause)[keyof typeof ButtonLockCause]

/**
 * Modal window state.
 */
export enum ModalWindowState {
  Visible = 1,
  Hidden = 0,
}

/**
 * User info types.
 */
export const UserType = {
  Anonymous: "anonymous",
  Guest: "guest",
  User: "user",
} as const

/**
 * User type.
 */
export type UserType = (typeof UserType)[keyof typeof UserType]
