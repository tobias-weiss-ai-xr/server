import { makeAutoObservable } from "mobx"
import type {
  AnimationEffect,
  LeftMenuAction,
  PresentationDocument,
  PresentationMode,
  PresentationTab,
  RightMenuPanel,
  SlideInfo,
  SlideSize,
  StartAnimation,
  ThemeType,
  TransitionEffect,
  ZoomLevel,
} from "../types/presentation"
import { ZOOM_LEVELS } from "../types/presentation"

const STORAGE_PREFIX = "prese-"

export class PresentationStore {
  mode: PresentationMode | null = null
  document: PresentationDocument | null = null
  isDocReady = false

  /* Toolbar */
  activeTab: PresentationTab | null = null
  isFileMenuOpen = false
  isEditMode = false

  /* ViewTab / Zoom */
  zoomLevel: ZoomLevel = 100
  fitToPage = false
  fitToWidth = false

  /* UI toggles */
  toolbarVisible = true
  statusbarVisible = true
  leftMenuVisible = true
  rightMenuVisible = false
  isCompactToolbar = false
  isCompactStatusbar = true

  /* Left menu */
  activeLeftPanel: LeftMenuAction | null = null
  leftMenuMinWidth = 40
  leftMenuExpandedWidth = 300

  /* Right menu */
  activeRightPanel: RightMenuPanel | null = null
  rightMenuMinWidth = 40
  rightMenuExpandedWidth = 300

  /* Slide navigation */
  currentSlide = 0
  totalSlides = 0
  slides: SlideInfo[] = []

  /* File menu */
  activeFileMenuPanel: string | null = null

  /* Animation/Transition settings */
  transitionEffect: TransitionEffect = "none"
  transitionDuration = 0.5
  transitionSoundEnabled = false
  animationEffect: AnimationEffect = "none"
  animationStart: StartAnimation = "onClick"

  /* Slide settings */
  slideSize: SlideSize = "standard"
  themeType: ThemeType = "builtin"

  /* Language */
  languageCode = "en-US"

  constructor() {
    makeAutoObservable(this)
  }

  /* ── Actions ── */

  setMode(mode: PresentationMode): void {
    this.mode = mode
    this.isEditMode = mode.isEdit
  }

  setDocument(doc: PresentationDocument): void {
    this.document = doc
  }

  setDocReady(ready: boolean): void {
    this.isDocReady = ready
  }

  setActiveTab(tab: PresentationTab | null): void {
    this.activeTab = tab
    if (tab === "file") {
      this.isFileMenuOpen = true
    }
  }

  setFileMenuOpen(open: boolean): void {
    this.isFileMenuOpen = open
    if (!open) {
      this.activeTab = null
    }
  }

  setEditMode(editMode: boolean): void {
    this.isEditMode = editMode
  }

  setZoomLevel(level: number): void {
    const clamped = Math.max(
      ZOOM_LEVELS[0] as number,
      Math.min(ZOOM_LEVELS[ZOOM_LEVELS.length - 1] as number, level),
    ) as ZoomLevel
    this.zoomLevel = clamped
    this.fitToPage = false
    this.fitToWidth = false
  }

  zoomIn(): void {
    this.setZoomLevel(this.zoomLevel + (this.zoomLevel < 100 ? 25 : 50))
  }

  zoomOut(): void {
    this.setZoomLevel(this.zoomLevel - (this.zoomLevel <= 100 ? 25 : 50))
  }

  setFitToPage(value: boolean): void {
    this.fitToPage = value
    if (value) this.fitToWidth = false
  }

  setFitToWidth(value: boolean): void {
    this.fitToWidth = value
    if (value) this.fitToPage = false
  }

  setToolbarVisible(visible: boolean): void {
    this.toolbarVisible = visible
  }

  setStatusbarVisible(visible: boolean): void {
    this.statusbarVisible = visible
    setStorageItem("hidden-status", visible ? "" : "true")
  }

  setLeftMenuVisible(visible: boolean): void {
    this.leftMenuVisible = visible
    setStorageItem("hidden-leftmenu", visible ? "" : "true")
  }

  setRightMenuVisible(visible: boolean): void {
    this.rightMenuVisible = visible
    setStorageItem("hidden-rightmenu", visible ? "" : "true")
  }

  setActiveLeftPanel(action: LeftMenuAction | null): void {
    this.activeLeftPanel = action
    if (action) {
      this.isFileMenuOpen = false
      this.activeTab = null
    }
  }

  toggleLeftPanel(action: LeftMenuAction): void {
    this.setActiveLeftPanel(this.activeLeftPanel === action ? null : action)
  }

  setActiveRightPanel(panel: RightMenuPanel | null): void {
    this.activeRightPanel = panel
  }

  toggleRightPanel(panel: RightMenuPanel): void {
    this.setActiveRightPanel(this.activeRightPanel === panel ? null : panel)
  }

  setCurrentSlide(index: number): void {
    this.currentSlide = index
  }

  setTotalSlides(count: number): void {
    this.totalSlides = count
  }

  setSlides(slides: SlideInfo[]): void {
    this.slides = slides
    this.totalSlides = slides.length
  }

  setActiveFileMenuPanel(panel: string | null): void {
    this.activeFileMenuPanel = panel
  }

  setTransitionEffect(effect: TransitionEffect): void {
    this.transitionEffect = effect
  }

  setTransitionDuration(duration: number): void {
    this.transitionDuration = duration
  }

  setTransitionSoundEnabled(enabled: boolean): void {
    this.transitionSoundEnabled = enabled
  }

  setAnimationEffect(effect: AnimationEffect): void {
    this.animationEffect = effect
  }

  setAnimationStart(start: StartAnimation): void {
    this.animationStart = start
  }

  setSlideSize(size: SlideSize): void {
    this.slideSize = size
  }

  setThemeType(type: ThemeType): void {
    this.themeType = type
  }

  setLanguageCode(code: string): void {
    this.languageCode = code
  }

  setCompactToolbar(compact: boolean): void {
    this.isCompactToolbar = compact
    setStorageItem("compact-toolbar", compact ? "true" : "false")
  }

  setCompactStatusbar(compact: boolean): void {
    this.isCompactStatusbar = compact
    setStorageItem("compact-statusbar", compact ? "true" : "")
  }
}

function setStorageItem(key: string, value: string): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, value)
  } catch {
    // Ignore storage errors
  }
}

export const presentationStore = new PresentationStore()
