// Type definitions for the legacy SDK canvas API
// These interfaces describe the shape of the global Asc/Common.EditorApi objects

import type { SelectElementType } from "./enums"

/** Minimal shape of a selection object returned by getSelectedElements() */
export interface SdkSelectionObject {
  get_ObjectType(): SelectElementType
  get_ObjectValue(): SdkObjectValue | null
}

/** Value returned by get_ObjectValue() — varies by element type */
export interface SdkObjectValue {
  get_Locked(): boolean
  get_ShapeProperties(): unknown | null
  get_ChartProperties(): SdkChartProperties | null
  getType?(): number
}

export interface SdkChartProperties {
  getType(): number
}

/** Paragraph style item from asc_onInitEditorStyles callback */
export interface SdkParagraphStyle {
  Name: string
  DisplayName: string
}

/** Table template style from asc_onInitTableTemplates callback */
export interface SdkTableTemplate {
  Name: string
  DisplayName: string
  Image?: string
}

/** Font info from asc_onInitEditorFonts callback */
export interface SdkFontInfo {
  Name: string
  DisplayName: string
}

/** Callback event names from the SDK */
export type SdkCallbackEvent =
  | "asc_onFocusObject"
  | "asc_onInitEditorFonts"
  | "asc_onInitEditorStyles"
  | "asc_onParaStyleName"
  | "asc_onInitTableTemplates"
  | "asc_onUpdateChartStyles"
  | "asc_onDocumentContentReady"
  | "asc_onCollaborativeChanges"

/** Map of callback event names to handler types */
export interface SdkCallbackMap {
  asc_onFocusObject: (objects: SdkSelectionObject[]) => void
  asc_onInitEditorFonts: (fonts: SdkFontInfo[], selected: SdkFontInfo) => void
  asc_onInitEditorStyles: (styles: SdkParagraphStyle[]) => void
  asc_onParaStyleName: (name: string) => void
  asc_onInitTableTemplates: (styles: SdkTableTemplate[]) => void
  asc_onUpdateChartStyles: () => void
  asc_onDocumentContentReady: () => void
  asc_onCollaborativeChanges: () => void
}

/** Core methods exposed by the SDK editor API */
export interface SdkEditorApi {
  asc_registerCallback<T extends SdkCallbackEvent>(event: T, handler: SdkCallbackMap[T]): void
  asc_unregisterCallback(event: SdkCallbackEvent): void
  asc_setParagraphStylesSizes(width: number, height: number): void
  getSelectedElements(): SdkSelectionObject[]
  can_CopyCut(): boolean
  can_AddQuotedComment(): boolean
  asc_getChartPreviews(chartType: number): unknown[]
}

/** Shape of the global Common.EditorApi singleton */
export interface CommonEditorApiStatic {
  get(): SdkEditorApi
  set(api: SdkEditorApi): void
}

/** Shape of the global Asc namespace */
export interface AscGlobalNamespace {
  c_oAscTypeSelectElement: Record<string, number>
  c_oAscEDocProtect: Record<string, number>
}
