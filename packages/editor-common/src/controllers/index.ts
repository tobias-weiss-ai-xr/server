/**
 * Controllers barrel export.
 *
 * Re-exports all public APIs from each controller module.
 */

// Scaling — pixel ratio management
export {
  getCurrentRatio,
  getCurrentRatioSelector,
  type ScalingEvent,
} from "./scaling"

// TabStyler — tab appearance customization
export {
  initTabStyler,
  setTabStyle,
  setTabBackground,
  refreshTabStyle,
  refreshTabBackground,
  type TabStyle,
  type TabBackground,
} from "./tab-styler"

// Desktop — native desktop environment integration
export {
  init as initDesktop,
  isActive as isDesktopApp,
  isOffline,
  getRecentFiles,
  openRecent,
  removeRecent,
  requestClose,
  process as processDesktopMessage,
  matchFileFormat,
  parseFileFormat,
  getHelpUrl,
  systemThemeType,
  isFeatureAvailable,
  FileFormat,
  type DesktopConfig,
  type RecentFile,
  type NativeDesktop,
} from "./desktop"

// FocusManager — keyboard navigation and focus traps
export {
  init as initFocusManager,
  registerFocusable,
  insertFocusable,
  removeFocusable,
  type FocusableField,
  type WindowData,
} from "./focus-manager"

// Fonts — font collection management
export {
  initialize as initFonts,
  setApi as setFontsApi,
  store as getFontsStore,
  type FontData,
} from "./fonts"

// Themes — UI theme switching and skeleton CSS
export {
  init as initThemes,
  get,
  setTheme,
  map as getThemesMap,
  addTheme,
  available,
  currentThemeId,
  currentThemeColor,
  defaultTheme,
  defaultThemeId,
  isContentThemeDark,
  isDarkTheme,
  setContentTheme,
  toggleContentTheme,
  getThemeColors,
  getThemeProps,
  refreshCurrentTheme,
  onDocumentReady,
  type ThemeType,
  type ThemeSkeleton,
  type ThemeIcons,
  type ThemeSource,
  type ThemeRecord,
  type StoredTheme,
  type FontThemeProps,
  type ThemeChangedEvent,
  type ContentThemeDarkEvent,
  type ThemeCountChangedEvent,
} from "./themes"

// History — document version history
export {
  init as initHistory,
  reset as resetHistory,
  setMode,
  updateHistory,
  requestHistoryData,
  selectRevision,
  onDownloadUrl,
  closeHistory,
  toggleExpandAll,
  toggleHighlightDeleted,
  onHashError,
  historyBus,
  getRevisions,
  getCurrentRev,
  getCurrentDocId,
  getCanUseHistory,
  getCanHistoryClose,
  getHasChanges,
  getHasCollapsed,
  type HistoryRevision,
  type HistoryEvents,
  type RevisionSelectEvent,
  type RestoreEvent,
  type HistoryErrorEvent,
} from "./history"
