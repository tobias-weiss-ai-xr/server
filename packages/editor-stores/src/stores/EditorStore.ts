// EditorStore — root editor state (type, permissions, loading, error)

import { action, observable } from "mobx"

export type EditorType = "document" | "spreadsheet" | "presentation" | "pdf" | "visio"

export interface EditorPermissions {
  edit: boolean
  download: boolean
  print: boolean
  review: boolean
  comment: boolean
}

export class EditorStore {
  @observable editorType: EditorType = "document"
  @observable documentKey = ""
  @observable permissions: EditorPermissions = {
    edit: true,
    download: true,
    print: true,
    review: true,
    comment: true,
  }
  @observable isLoading = true
  @observable isReady = false
  @observable error: string | null = null
  @observable lang = "en"

  @action
  setEditorType(type: EditorType): void {
    this.editorType = type
  }

  @action
  setDocumentKey(key: string): void {
    this.documentKey = key
  }

  @action
  setPermissions(perms: Partial<EditorPermissions>): void {
    Object.assign(this.permissions, perms)
  }

  @action
  setLoading(loading: boolean): void {
    this.isLoading = loading
  }

  @action
  setReady(ready: boolean): void {
    this.isReady = ready
    if (ready) this.isLoading = false
  }

  @action
  setError(error: string | null): void {
    this.error = error
    if (error) this.isLoading = false
  }

  @action
  setLang(lang: string): void {
    this.lang = lang
  }

  @action
  reset(): void {
    this.documentKey = ""
    this.isLoading = true
    this.isReady = false
    this.error = null
    this.permissions = {
      edit: true,
      download: true,
      print: true,
      review: true,
      comment: true,
    }
  }
}
