import IconCancellation from "@common-icons/icon-cancellation.svg"
import SvgIcon from "@common/lib/component/SvgIcon"
import { Icon, List, ListItem, Page, f7 } from "framework7-react"
import React from "react"
import { useTranslation } from "react-i18next"
import { Device } from "../../utils/device"

const HighlightColorPalette = ({ changeColor, curColor }) => {
  const isAndroid = Device.android
  const { t } = useTranslation()
  const highlightColors = [
    ["ffff00", "00ff00", "00ffff", "ff00ff", "0000ff", "ff0000", "00008b", "008b8b"],
    ["006400", "800080", "8b0000", "808000", "ffffff", "d3d3d3", "a9a9a9", "000000"],
  ]

  return (
    <List>
      <ListItem>
        <div className="highlight-palette">
          {highlightColors.map((row, index) => (
            <div key={index} className="row">
              {row.map((effect, index) => {
                return (
                  <a
                    key={index}
                    className={
                      curColor && (curColor.color === effect || curColor === effect)
                        ? "highlight-color highlight-color_active"
                        : "highlight-color"
                    }
                    style={{ background: `#${effect}` }}
                    onClick={() => {
                      changeColor(effect)
                    }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </ListItem>
      <ListItem
        radio
        checked={curColor && curColor === "transparent"}
        onClick={() => changeColor("transparent")}
        title={t("Common.HighlightColorPalette.textNoFill")}
      >
        {!isAndroid && (
          <SvgIcon slot="media" symbolId={IconCancellation.id} className={"icon icon-svg"} />
        )}
      </ListItem>
    </List>
  )
}

export default HighlightColorPalette
