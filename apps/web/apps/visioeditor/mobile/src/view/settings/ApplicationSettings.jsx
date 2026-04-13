import { Block, BlockTitle, List, ListItem, Navbar, Page, Toggle } from "framework7-react"
import { inject, observer } from "mobx-react"
import React, { Fragment } from "react"
import { useTranslation } from "react-i18next"

const PageApplicationSettings = (props) => {
  const { t } = useTranslation()
  const _t = t("View.Settings", { returnObjects: true })

  // set mode
  const storeThemes = props.storeThemes
  const colorTheme = storeThemes.colorTheme
  const themes = storeThemes.themes
  const typeTheme = colorTheme.type
  const isConfigSelectTheme = storeThemes.isConfigSelectTheme

  return (
    <Page>
      <Navbar title={_t.textApplicationSettings} backLink={_t.textBack} />
      {!!isConfigSelectTheme && (
        <List mediaList>
          <ListItem
            title={t("Common.Themes.textTheme")}
            after={themes[typeTheme].text}
            link="/theme-settings/"
            routeProps={{
              changeTheme: props.changeTheme,
            }}
          />
        </List>
      )}
    </Page>
  )
}

const PageThemeSettings = (props) => {
  const { t } = useTranslation()
  const _t = t("View.Settings", { returnObjects: true })
  const storeThemes = props.storeThemes
  const colorTheme = storeThemes.colorTheme
  const typeTheme = colorTheme.type
  const themes = storeThemes.themes

  return (
    <Page>
      <Navbar title={t("Common.Themes.textTheme")} backLink={_t.textBack} />
      <List>
        {Object.keys(themes).map((key, index) => {
          return (
            <ListItem
              key={index}
              radio
              checked={typeTheme === themes[key].type}
              onChange={() => props.changeTheme(key)}
              name={themes[key].id}
              title={themes[key].text}
            />
          )
        })}
      </List>
    </Page>
  )
}

const ApplicationSettings = inject(
  "storeApplicationSettings",
  "storeAppOptions",
  "storeThemes",
)(observer(PageApplicationSettings))
const ThemeSettings = inject("storeThemes")(observer(PageThemeSettings))

export { ApplicationSettings, ThemeSettings }
