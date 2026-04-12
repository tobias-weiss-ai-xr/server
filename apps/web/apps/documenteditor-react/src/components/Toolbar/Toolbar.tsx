import { observer } from "mobx-react-lite"
import { documentStore } from "../../stores/DocumentStore"
import { FileTab } from "./FileTab"
import { FormsTab } from "./FormsTab"
import { HeaderFooterTab } from "./HeaderFooterTab"
import { HomeTab } from "./HomeTab"
import { InsertTab } from "./InsertTab"
import { LayoutTab } from "./LayoutTab"
import { ReferencesTab } from "./ReferencesTab"
import { ViewTab } from "./ViewTab"

const ObservedToolbar = observer(function ObservedToolbar() {
  const isEditMode = documentStore.isEditMode

  return (
    <div className="de-toolbar">
      <div className="de-toolbar-tabs">
        <div className="de-toolbar-extra-left" />
        <FileTab />
        <HomeTab />
        {isEditMode && <InsertTab />}
        {isEditMode && <LayoutTab />}
        <ReferencesTab />
        <ViewTab />
        {isEditMode && <FormsTab />}
        {isEditMode && <HeaderFooterTab />}
        <div className="de-toolbar-extra-right" />
      </div>
      <section className="de-toolbar-controls" role="tabpanel">
        <section className="de-toolbar-static" />
        <section className="de-toolbar-panels" />
      </section>
    </div>
  )
})

export { ObservedToolbar as Toolbar }
