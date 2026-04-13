import { f7 } from "framework7-react"
import { inject, observer } from "mobx-react"
import React from "react"
import { withTranslation } from "react-i18next"
import { Device } from "../../../../../common/mobile/utils/device"
import EncryptionView from "../../view/settings/FileEncryption"

class FileEncryptionController extends React.Component {
  constructor(props) {
    super(props)

    this.deletePassword = this.deletePassword.bind(this)
    this.setPassword = this.setPassword.bind(this)
  }

  closeModal() {
    if (Device.phone) {
      f7.sheet.close(".settings-popup", false)
    } else {
      f7.popover.close("#settings-popover", false)
    }
  }

  setPassword(passwordValue) {
    const api = Common.EditorApi.get()

    api.asc_setCurrentPassword(passwordValue)
    this.closeModal()
  }

  deletePassword() {
    const api = Common.EditorApi.get()
    const appOptions = this.props.storeAppOptions

    appOptions.setEncryptionFile(false)
    api.asc_resetPassword()
    this.closeModal()
  }

  render() {
    return <EncryptionView deletePassword={this.deletePassword} setPassword={this.setPassword} />
  }
}

export default inject("storeAppOptions")(observer(withTranslation()(FileEncryptionController)))
