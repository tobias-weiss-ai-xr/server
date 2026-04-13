import { BlockTitle, List, ListItem, Navbar, Page } from "framework7-react"
import { inject, observer } from "mobx-react"
import React, { Fragment, useContext } from "react"
import { useTranslation } from "react-i18next"
import { SettingsContext } from "../../controller/settings/Settings"

const PageDocumentInfo = (props) => {
  const { t } = useTranslation()
  const _t = t("Settings", { returnObjects: true })
  const storeInfo = props.storeDocumentInfo
  const fileType = storeInfo.dataDoc.fileType
  const dataApp = props.getAppProps()
  const settingsContext = useContext(SettingsContext)

  const { pageCount, paragraphCount, symbolsCount, symbolsWSCount, wordsCount } = storeInfo.infoObj

  const {
    pageSize,
    title,
    subject,
    description,
    dateCreated,
    modifyBy,
    modifyDate,
    author,
    producer,
    version,
    tagged,
    fastWebView,
    creators,
  } = props.docInfoObject

  const dataDoc = JSON.parse(JSON.stringify(storeInfo.dataDoc))
  const isLoaded = storeInfo.isLoaded

  return (
    <Page>
      <Navbar title={_t.textDocumentInfo} backLink={_t.textBack} />
      {dataDoc?.title ? (
        <Fragment>
          <BlockTitle>{_t.textDocumentTitle}</BlockTitle>
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
      <BlockTitle>{_t.textStatistic}</BlockTitle>
      <List>
        <ListItem
          title={t("Settings.textPages")}
          after={isLoaded ? String(pageCount) : _t.textLoading}
        />
        <ListItem
          title={t("Settings.textParagraphs")}
          after={isLoaded ? String(paragraphCount) : _t.textLoading}
        />
        <ListItem
          title={t("Settings.textWords")}
          after={isLoaded ? String(wordsCount) : _t.textLoading}
        />
        <ListItem
          title={t("Settings.textSymbols")}
          after={isLoaded ? String(symbolsCount) : _t.textLoading}
        />
        <ListItem
          title={t("Settings.textSpaces")}
          after={isLoaded ? String(symbolsWSCount) : _t.textLoading}
        />
        {pageSize && <ListItem title={t("Settings.textPageSize")} after={pageSize} />}
      </List>
      {title ? (
        <Fragment>
          <BlockTitle>{t("Settings.textTitle")}</BlockTitle>
          <List>
            <ListItem title={title} />
          </List>
        </Fragment>
      ) : null}
      {subject ? (
        <Fragment>
          <BlockTitle>{t("Settings.textSubject")}</BlockTitle>
          <List>
            <ListItem title={subject} />
          </List>
        </Fragment>
      ) : null}
      {description ? (
        <Fragment>
          <BlockTitle>{t("Settings.textComment")}</BlockTitle>
          <List>
            <ListItem title={description} />
          </List>
        </Fragment>
      ) : null}
      {modifyDate ? (
        <Fragment>
          <BlockTitle>{t("Settings.textLastModified")}</BlockTitle>
          <List>
            <ListItem title={modifyDate} />
          </List>
        </Fragment>
      ) : null}
      {modifyBy ? (
        <Fragment>
          <BlockTitle>{t("Settings.textLastModifiedBy")}</BlockTitle>
          <List>
            <ListItem title={modifyBy} />
          </List>
        </Fragment>
      ) : null}
      {dateCreated ? (
        <Fragment>
          <BlockTitle>{t("Settings.textCreated")}</BlockTitle>
          <List>
            <ListItem title={dateCreated} />
          </List>
        </Fragment>
      ) : null}
      {dataApp ? (
        <Fragment>
          <BlockTitle>{t("Settings.textApplication")}</BlockTitle>
          <List>
            <ListItem title={dataApp} />
          </List>
        </Fragment>
      ) : null}
      {fileType === "xps" && author ? (
        <Fragment>
          <BlockTitle>{t("Settings.textAuthor")}</BlockTitle>
          <List>
            <ListItem title={author} />
          </List>
        </Fragment>
      ) : null}
      {fileType === "pdf" && author ? (
        <Fragment>
          <BlockTitle>{t("Settings.textAuthor")}</BlockTitle>
          <List>
            <ListItem title={author} />
          </List>
        </Fragment>
      ) : null}
      {fileType === "pdf" && producer ? (
        <Fragment>
          <BlockTitle>{t("Settings.textPdfProducer")}</BlockTitle>
          <List>
            <ListItem title={producer} />
          </List>
        </Fragment>
      ) : null}
      {fileType === "pdf" ? (
        <List>
          <ListItem title={t("Settings.textPdfVer")} after={version} />
          <ListItem title={t("Settings.textPdfTagged")} after={tagged} />
          <ListItem title={t("Settings.textFastWV")} after={fastWebView} />
        </List>
      ) : null}
      {creators ? (
        <Fragment>
          <BlockTitle>{t("Settings.textAuthor")}</BlockTitle>
          <List>
            {creators.split(/\s*[,;]\s*/).map((item) => {
              return <ListItem key="item" title={item} />
            })}
          </List>
        </Fragment>
      ) : null}
    </Page>
  )
}

const DocumentInfo = inject("storeDocumentInfo")(observer(PageDocumentInfo))

export default DocumentInfo
