import type { JSX } from "react"
import { observer } from "mobx-react-lite"
import { visioStore } from "../../stores/VisioStore"

function SheetListInner(): JSX.Element {
  const tabs = visioStore.pageTabs

  function handleSelect(index: number): void {
    visioStore.setCurrentPageIndex(index)
  }

  return (
    <div className="visio-statusbar-sheet-list">
      <button
        type="button"
        className="visio-statusbar-btn"
        title="List of pages"
      >
        ☰
      </button>
      {tabs.length > 0 && (
        <ul className="visio-statusbar-sheet-dropdown" role="menu">
          {tabs.map((tab) => (
            <li
              key={tab.sheetIndex}
              className={`visio-statusbar-sheet-item${tab.active ? " active" : ""}`}
              role="menuitem"
              onClick={() => handleSelect(tab.sheetIndex)}
            >
              {tab.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export const SheetList = observer(SheetListInner)
