import { f7 } from "framework7-react"
import React, { Component } from "react"
import { Device } from "../../../../../common/mobile/utils/device"
import Download from "../../view/settings/Download"

class DownloadController extends Component {
  constructor(props) {
    super(props)
    this.onSaveFormat = this.onSaveFormat.bind(this)
  }

  closeModal() {
    if (Device.phone) {
      f7.sheet.close(".settings-popup", true)
    } else {
      f7.popover.close("#settings-popover")
    }
  }

  onSaveFormat(format) {
    const api = Common.EditorApi.get()
    if (format) {
      api.asc_DownloadAs(new Asc.asc_CDownloadOptions(format))
    }
    this.closeModal()
  }

  render() {
    return <Download onSaveFormat={this.onSaveFormat} />
  }
}

export default DownloadController
