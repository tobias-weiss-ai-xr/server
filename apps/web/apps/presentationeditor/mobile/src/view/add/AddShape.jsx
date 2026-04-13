import {
  BlockTitle,
  Icon,
  List,
  ListButton,
  ListItem,
  Navbar,
  Page,
  Range,
  Row,
  Toggle,
} from "framework7-react"
import { inject, observer } from "mobx-react"
import React, { Fragment, useState } from "react"
import { useTranslation } from "react-i18next"
import { Device } from "../../../../../common/mobile/utils/device"

const AddShape = (props) => {
  const shapes = props.storeShapeSettings.getStyleGroups()
  return (
    <div className={"dataview shapes"}>
      {shapes.map((row, indexRow) => {
        return (
          <ul className="row" key={`shape-row-${indexRow}`}>
            {row.map((shape, index) => {
              return (
                <li
                  key={`shape-${indexRow}-${index}`}
                  onClick={() => {
                    props.onShapeClick(shape.type)
                  }}
                >
                  <div
                    className="thumb"
                    style={{ WebkitMaskImage: `url('resources/img/shapes/${shape.thumb}')` }}
                  ></div>
                </li>
              )
            })}
          </ul>
        )
      })}
    </div>
  )
}

export default inject("storeShapeSettings")(observer(AddShape))
