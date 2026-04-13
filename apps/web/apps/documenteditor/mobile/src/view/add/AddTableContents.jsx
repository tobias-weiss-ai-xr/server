import {
  BlockTitle,
  Icon,
  List,
  ListButton,
  ListInput,
  ListItem,
  Navbar,
  Page,
} from "framework7-react"
import { inject, observer } from "mobx-react"
import React, { PureComponent } from "react"
import { useTranslation } from "react-i18next"

const AddTableContents = (props) => {
  const { t } = useTranslation()
  const _t = t("Add", { returnObjects: true })

  return (
    <Page>
      <Navbar title={_t.textTableContents} backLink={_t.textBack} />
      <BlockTitle>{_t.textWithPageNumbers}</BlockTitle>
      <div className="item-contents" id="toc1" onClick={() => props.onTableContents(0)} />
      <BlockTitle>{_t.textWithBlueLinks}</BlockTitle>
      <div className="item-contents" id="toc2" onClick={() => props.onTableContents(1)} />
    </Page>
  )
}

export { AddTableContents }
