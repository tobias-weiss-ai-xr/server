import { observer } from "mobx-react-lite"
import { FileTab } from "./FileTab"
import { HomeTab } from "./HomeTab"
import { InsertTab } from "./InsertTab"
import { LayoutTab } from "./LayoutTab"
import { FormulaTab } from "./FormulaTab"
import { DataTableTab } from "./DataTableTab"
import { spreadsheetStore } from "../../stores/SpreadsheetStore"

const ObservedToolbar = observer(function ObservedToolbar() {
  const isEditMode = spreadsheetStore.isEditMode
  const isTableSelected = false // Placeholder for conditional DataTableTab

  return (
    <div className="se-toolbar">
      <div className="se-toolbar-tabs">
        <div className="se-toolbar-extra-left" />
        <FileTab />
        <HomeTab />
        {isEditMode && <InsertTab />}
        {isEditMode && <LayoutTab />}
        <FormulaTab />
        {isEditMode && isTableSelected && <DataTableTab />}
        <div className="se-toolbar-extra-right" />
      </div>
      <section className="se-toolbar-controls" role="tabpanel">
        <section className="se-toolbar-static" />
        <section className="se-toolbar-panels" />
      </section>
    </div>
  )
})

export { ObservedToolbar as Toolbar }
