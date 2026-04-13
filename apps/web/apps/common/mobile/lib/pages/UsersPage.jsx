import IconExpandDownAndroid from "@common-android-icons/icon-expand-down.svg"
import IconExpandDownIos from "@common-ios-icons/icon-expand-down.svg?ios"
import SvgIcon from "@common/lib/component/SvgIcon"
import { Icon, Link, List, ListItem, NavRight, Navbar, Page } from "framework7-react"
import { inject, observer } from "mobx-react"
import React from "react"
import { useTranslation } from "react-i18next"
import { Device } from "../../utils/device"

const UsersPage = inject("users")(
  observer((props) => {
    const { t } = useTranslation()
    const _t = t("Common.Collaboration", { returnObjects: true })
    const storeUsers = props.users

    return (
      <Page name="collab__users" className="page-users">
        <Navbar title={_t.textUsers} backLink={_t.textBack}>
          {Device.phone && (
            <NavRight>
              <Link sheetClose=".coauth__sheet">
                {Device.ios ? (
                  <SvgIcon symbolId={IconExpandDownIos.id} className={"icon icon-svg"} />
                ) : (
                  <SvgIcon symbolId={IconExpandDownAndroid.id} className={"icon icon-svg down"} />
                )}
              </Link>
            </NavRight>
          )}
        </Navbar>
        <List className="coauth__list">
          {storeUsers.editUsers.map((user, i) => (
            <ListItem title={user.name + (user.count > 1 ? ` (${user.count})` : "")} key={i}>
              <div slot="media" className="color" style={{ backgroundColor: user.color }}>
                {user.initials}
              </div>
            </ListItem>
          ))}
        </List>
      </Page>
    )
  }),
)

export default UsersPage
