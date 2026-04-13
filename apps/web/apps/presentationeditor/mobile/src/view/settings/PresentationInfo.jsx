import { BlockTitle, List, ListItem, Navbar, Page } from "framework7-react"
import { inject, observer } from "mobx-react"
import React, { Fragment, useContext } from "react"
import { useTranslation } from "react-i18next"
import { SettingsContext } from "../../controller/settings/Settings"

const PagePresentationInfo = (props) => {
  const { t } = useTranslation()
  const _t = t("View.Settings", { returnObjects: true })
  const storeInfo = props.storePresentationInfo
  const dataApp = props.getAppProps()
  const dataDoc = JSON.parse(JSON.stringify(storeInfo.dataDoc))
  const settingsContext = useContext(SettingsContext)

  return (
    <Page>
      <Navbar title={_t.textPresentationInfo} backLink={_t.textBack} />
      {dataDoc?.title ? (
        <Fragment>
          <BlockTitle>{_t.textPresentationTitle}</BlockTitle>
          <List>
            <ListItem href="#" title={dataDoc.title} onClick={settingsContext.changeTitleHandler} />
          </List>
        </Fragment>
      ) : null}
      {dataDoc?.info?.author || dataDoc?.info?.owner ? (
        <Fragment>
          <BlockTitle>{_t.textOwner}</BlockTitle>
          <List>
            <ListItem title={dataDoc.info.author || dataDoc.info.owner} />
          </List>
        </Fragment>
      ) : null}
      {dataDoc?.info?.folder ? (
        <Fragment>
          <BlockTitle>{_t.textLocation}</BlockTitle>
          <List>
            <ListItem title={dataDoc.info.folder} />
          </List>
        </Fragment>
      ) : null}
      {dataDoc?.info?.uploaded || dataDoc?.info?.created ? (
        <Fragment>
          <BlockTitle>{_t.textUploaded}</BlockTitle>
          <List>
            <ListItem title={dataDoc.info.uploaded || dataDoc.info.created} />
          </List>
        </Fragment>
      ) : null}
      {props.title ? (
        <Fragment>
          <BlockTitle>{_t.textTitle}</BlockTitle>
          <List>
            <ListItem title={props.title} />
          </List>
        </Fragment>
      ) : null}
      {props.subject ? (
        <Fragment>
          <BlockTitle>{_t.textSubject}</BlockTitle>
          <List>
            <ListItem title={props.subject} />
          </List>
        </Fragment>
      ) : null}
      {props.description ? (
        <Fragment>
          <BlockTitle>{_t.textComment}</BlockTitle>
          <List>
            <ListItem title={props.description} />
          </List>
        </Fragment>
      ) : null}
      {props.modified ? (
        <Fragment>
          <BlockTitle>{_t.textLastModified}</BlockTitle>
          <List>
            <ListItem title={props.modified} />
          </List>
        </Fragment>
      ) : null}
      {props.modifiedBy ? (
        <Fragment>
          <BlockTitle>{_t.textLastModifiedBy}</BlockTitle>
          <List>
            <ListItem title={props.modifiedBy} />
          </List>
        </Fragment>
      ) : null}
      {props.created ? (
        <Fragment>
          <BlockTitle>{_t.textCreated}</BlockTitle>
          <List>
            <ListItem title={props.created} />
          </List>
        </Fragment>
      ) : null}
      {dataApp ? (
        <Fragment>
          <BlockTitle>{_t.textApplication}</BlockTitle>
          <List>
            <ListItem title={dataApp} />
          </List>
        </Fragment>
      ) : null}
      {props.creators ? (
        <Fragment>
          <BlockTitle>{_t.textAuthor}</BlockTitle>
          <List>
            {props.creators.split(/\s*[,;]\s*/).map((item) => {
              return <ListItem title={item} />
            })}
          </List>
        </Fragment>
      ) : null}
    </Page>
  )
}

const PresentationInfo = inject("storePresentationInfo")(observer(PagePresentationInfo))

export default PresentationInfo
