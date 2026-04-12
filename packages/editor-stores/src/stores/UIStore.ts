// UIStore — panel visibility, active tabs, toolbar state, modals

import { observable, action } from "mobx"

export type PanelId = "left" | "right" | "search"
export type LeftPanelTab = "navigation" | "pageThumbnails" | "comments"
export type RightPanelTab = "styles" | "shapes" | "properties"

export class UIStore {
  @observable leftPanelVisible = false
  @observable rightPanelVisible = false
  @observable searchVisible = false
  @observable leftPanelTab: LeftPanelTab = "navigation"
  @observable rightPanelTab: RightPanelTab = "styles"
  @observable fileMenuOpen = false
  @observable activeModal: string | null = null
  @observable contextMenu: { x: number; y: number } | null = null

  // Panel toggle actions
  @action
  toggleLeftPanel(tab?: LeftPanelTab): void {
    this.leftPanelVisible = !this.leftPanelVisible
    if (tab && this.leftPanelVisible) {
      this.leftPanelTab = tab
    }
  }

  @action
  toggleRightPanel(tab?: RightPanelTab): void {
    this.rightPanelVisible = !this.rightPanelVisible
    if (tab && this.rightPanelVisible) {
      this.rightPanelTab = tab
    }
  }

  @action
  toggleSearch(): void {
    this.searchVisible = !this.searchVisible
  }

  // Panel tab actions
  @action
  setLeftPanelTab(tab: LeftPanelTab): void {
    this.leftPanelTab = tab
    if (!this.leftPanelVisible) this.leftPanelVisible = true
  }

  @action
  setRightPanelTab(tab: RightPanelTab): void {
    this.rightPanelTab = tab
    if (!this.rightPanelVisible) this.rightPanelVisible = true
  }

  // Panel visibility
  @action
  showPanel(panelId: PanelId): void {
    switch (panelId) {
      case "left":
        this.leftPanelVisible = true
        break
      case "right":
        this.rightPanelVisible = true
        break
      case "search":
        this.searchVisible = true
        break
    }
  }

  @action
  hidePanel(panelId: PanelId): void {
    switch (panelId) {
      case "left":
        this.leftPanelVisible = false
        break
      case "right":
        this.rightPanelVisible = false
        break
      case "search":
        this.searchVisible = false
        break
    }
  }

  @action
  hideAllPanels(): void {
    this.leftPanelVisible = false
    this.rightPanelVisible = false
    this.searchVisible = false
  }

  // Menu actions
  @action
  setFileMenuOpen(open: boolean): void {
    this.fileMenuOpen = open
  }

  // Modal actions
  @action
  openModal(modalId: string): void {
    this.activeModal = modalId
  }

  @action
  closeModal(): void {
    this.activeModal = null
  }

  // Context menu actions
  @action
  showContextMenu(x: number, y: number): void {
    this.contextMenu = { x, y }
  }

  @action
  hideContextMenu(): void {
    this.contextMenu = null
  }

  @action
  reset(): void {
    this.leftPanelVisible = false
    this.rightPanelVisible = false
    this.searchVisible = false
    this.leftPanelTab = "navigation"
    this.rightPanelTab = "styles"
    this.fileMenuOpen = false
    this.activeModal = null
    this.contextMenu = null
  }
}
