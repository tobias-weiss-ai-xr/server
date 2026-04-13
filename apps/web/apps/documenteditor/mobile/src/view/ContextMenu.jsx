import SvgIcon from "@common/lib/component/SvgIcon"
import { Icon, Link, List, ListButton, ListItem, Popover } from "framework7-react"
import { f7 } from "framework7-react"
import React, { Component } from "react"

class ContextMenuView extends Component {
  componentDidMount() {
    // f7.popover.open('#idx-context-menu-popover', '#idx-context-menu-target');
  }

  render() {
    const buttons = this.props.items || {}

    return (
      <Popover
        id="idx-context-menu-popover"
        className="document-menu"
        backdrop={false}
        closeByBackdropClick={false}
        closeByOutsideClick={false}
        onPopoverClosed={(e) => this.props.onMenuClosed()}
      >
        <List className="list-block">
          {buttons.map((b, index) =>
            b.text ? (
              <ListButton
                className="asd"
                title={b.text}
                key={index}
                onClick={(e) => this.props.onMenuItemClick(b.action)}
              />
            ) : (
              <ListButton className="asd" title={b.text} key={index}>
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

export default ContextMenuView
