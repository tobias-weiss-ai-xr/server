import type { JSX } from "react"
import { observer } from "mobx-react-lite"
import { visioStore } from "../../stores/VisioStore"
import { ZoomControls } from "./ZoomControls"
import { PageTabs } from "./PageTabs"
import { SheetList } from "./SheetList"

const ObservedStatusBar = observer(function ObservedStatusBar(): JSX.Element {
  const isCompact = visioStore.isCompactStatusbar

  return (
    <div className={`visio-statusbar${isCompact ? "" : " visio-statusbar-no-compact"}`}>
      <div className="visio-statusbar-tabs-scroll">
        <button
          type="button"
          className="visio-statusbar-btn"
          title="Previous page"
          onClick={() => visioStore.setCurrentPageIndex(
            Math.max(0, visioStore.currentPageIndex - 1),
          )}
        >
          ‹
        </button>
        <button
          type="button"
          className="visio-statusbar-btn"
          title="Next page"
          onClick={() => visioStore.setCurrentPageIndex(
            Math.min(visioStore.pageCount - 1, visioStore.currentPageIndex + 1),
          )}
        >
          ›
        </button>
      </div>

      <div className="visio-statusbar-addtabs-box">
        <SheetList />
      </div>

      <div className="visio-statusbar-zoom-box">
        <div className="visio-statusbar-separator" />
        <ZoomControls />
      </div>

      <div className="visio-statusbar-sheets-bar-box">
        <PageTabs />
      </div>

      {!isCompact && (
        <div className="visio-statusbar-number-of-sheet">
          <label className="visio-statusbar-label">
            {visioStore.pageCount > 0
              ? `Page ${visioStore.currentPageIndex + 1} of ${visioStore.pageCount}`
              : ""}
          </label>
        </div>
      )}
    </div>
  )
})

export { ObservedStatusBar as StatusBar }
