import SvgIcon from "@common/lib/component/SvgIcon"
import {
  Actions,
  ActionsButton,
  ActionsGroup,
  Icon,
  Link,
  List,
  ListButton,
  ListItem,
  Popover,
} from "framework7-react"
import { f7 } from "framework7-react"
import React, { Component } from "react"
import { useTranslation } from "react-i18next"

const idContextMenuElement = "idx-context-menu-popover"

class ContextMenuView extends Component {
  componentDidMount() {
    // f7.popover.open('#idx-context-menu-popover', '#idx-context-menu-target');
  }

  render() {
    const buttons = this.props.items || {}

    return (
      <Popover
        id={idContextMenuElement}
        className="document-menu"
        backdrop={false}
        closeByBackdropClick={false}
        closeByOutsideClick={false}
        onPopoverClosed={(e) => this.props.onMenuClosed()}
      >
        <List className="list-block">
          {buttons.length &&
            buttons.map((b, index) =>
              !b.icon ? (
                <ListButton
                  title={b.caption}
                  key={index}
                  onClick={(e) => this.props.onMenuItemClick(b.event)}
                />
              ) : (
                <ListButton key={index} onClick={(e) => this.props.onMenuItemClick(b.event)}>
                  <SvgIcon
                    slot="media"
                    symbolId={b.icon}
                    className={"icon icon-svg icon-svg__mask"}
                  />
                </ListButton>
              ),
            )}
        </List>
      </Popover>
    )
  }
}

const ActionsWithExtraItems = ({ items, onMenuItemClick, opened, onActionClosed }) => {
  const { t } = useTranslation()
  const _t = t("ContextMenu", { returnObjects: true })
  return (
    <Actions opened={opened} onActionsClosed={() => onActionClosed()}>
      <ActionsGroup>
        {items.length > 0 &&
          items.map((item, index) => {
            return (
              <ActionsButton
                key={`act-${index}`}
                onClick={() => {
                  onMenuItemClick(item.event)
                }}
              >
                {item.caption}
              </ActionsButton>
            )
          })}
      </ActionsGroup>
      <ActionsGroup>
        <ActionsButton>{_t.menuCancel}</ActionsButton>
      </ActionsGroup>
    </Actions>
  )
}

const exportedIdMenuElemen = `#${idContextMenuElement}`
export {
  ContextMenuView as default,
  exportedIdMenuElemen as idContextMenuElement,
  ActionsWithExtraItems,
}
