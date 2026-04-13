import SvgIcon from "@common/lib/component/SvgIcon"
import IconEncryptFile from "@icons/icon-encrypt-file.svg"
import IconProtectDocument from "@icons/icon-protect-doc.svg"
import {
  Block,
  BlockTitle,
  Icon,
  Link,
  List,
  ListInput,
  ListItem,
  NavRight,
  Navbar,
  Page,
  Toggle,
  f7,
} from "framework7-react"
import { inject, observer } from "mobx-react"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"

const ProtectionView = inject("storeAppOptions")(
  observer((props) => {
    const { t } = useTranslation()
    const _t = t("Settings", { returnObjects: true })
    const appOptions = props.storeAppOptions
    const isProtected = appOptions.isProtected

    return (
      <Page>
        <Navbar title={t("Settings.textProtection")} backLink={_t.textBack} />
        <List>
          <ListItem title={t("Settings.textEncryptFile")} link="/encrypt">
            <Icon slot="media" icon="icon-encrypt-file" />
            <SvgIcon slot="media" symbolId={IconEncryptFile.id} className="icon icon-svg" />
          </ListItem>
          <ListItem
            title={isProtected ? t("Settings.textUnprotect") : t("Settings.textProtectDocument")}
            onClick={() => props.onProtectClick()}
            link="#"
          >
            <SvgIcon slot="media" symbolId={IconProtectDocument.id} className="icon icon-svg" />
          </ListItem>
        </List>
      </Page>
    )
  }),
)

export default ProtectionView
