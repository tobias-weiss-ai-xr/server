// DocumentStore — document state (page, zoom, title, modifications)

import { action, observable } from "mobx"

export class DocumentStore {
  @observable title = "Untitled"
  @observable currentPage = 1
  @observable pageCount = 1
  @observable zoom = 100
  @observable isModified = false
  @observable isSaving = false

  @action
  setTitle(title: string): void {
    this.title = title
  }

  @action
  setPage(page: number): void {
    this.currentPage = Math.max(1, Math.min(page, this.pageCount))
  }

  @action
  setPageCount(count: number): void {
    this.pageCount = Math.max(1, count)
    if (this.currentPage > this.pageCount) {
      this.currentPage = this.pageCount
    }
  }

  @action
  setZoom(zoom: number): void {
    this.zoom = Math.max(25, Math.min(500, zoom))
  }

  @action
  zoomIn(step = 10): void {
    this.setZoom(this.zoom + step)
  }

  @action
  zoomOut(step = 10): void {
    this.setZoom(this.zoom - step)
  }

  @action
  zoomFit(): void {
    this.zoom = 100
  }

  @action
  setModified(modified: boolean): void {
    this.isModified = modified
  }

  @action
  setSaving(saving: boolean): void {
    this.isSaving = saving
  }

  @action
  reset(): void {
    this.title = "Untitled"
    this.currentPage = 1
    this.pageCount = 1
    this.zoom = 100
    this.isModified = false
    this.isSaving = false
  }
}
