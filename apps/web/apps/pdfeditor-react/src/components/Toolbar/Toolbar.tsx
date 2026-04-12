import { FileTab } from "./FileTab"
import { HomeTab } from "./HomeTab"
import { CommentTab } from "./CommentTab"
import { InsertTab } from "./InsertTab"
import { RedactTab } from "./RedactTab"
import { FormsTab } from "./FormsTab"
import { ViewTab } from "./ViewTab"
import { observer } from "mobx-react-lite"
import { pdfStore } from "../../stores/PdfStore"

const ObservedToolbar = observer(function ObservedToolbar() {
  const isEditMode = pdfStore.isEditMode

  return (
    <div className="pdf-toolbar">
      <div className="pdf-toolbar-tabs">
        <div className="pdf-toolbar-extra-left" />
        <FileTab />
        <HomeTab />
        <CommentTab />
        {isEditMode && <InsertTab />}
        {isEditMode && <RedactTab />}
        <FormsTab />
        <ViewTab />
        <div className="pdf-toolbar-extra-right" />
      </div>
      <section className="pdf-toolbar-controls" role="tabpanel">
        <section className="pdf-toolbar-static" />
        <section className="pdf-toolbar-panels" />
      </section>
    </div>
  )
})

export { ObservedToolbar as Toolbar }
