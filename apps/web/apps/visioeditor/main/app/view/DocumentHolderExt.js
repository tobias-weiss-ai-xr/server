/*
 * (c) Copyright Ascensio System SIA 2010-2024
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */

define([], () => {
  if (window.VE?.Views?.DocumentHolder) {
    const dh = window.VE.Views.DocumentHolder.prototype

    dh.createDelayedElementsViewer = function () {
      if (this.menuViewCopy) return // menu is already inited

      this.menuViewCopy = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-copy",
        caption: this.textCopy,
        value: "copy",
      })

      this.viewModeMenu = new Common.UI.Menu({
        cls: "shifted-right",
        initMenu: (value) => {
          this.menuViewCopy.setDisabled(!this.api?.can_CopyCut())
        },
        items: [this.menuViewCopy],
      }).on("hide:after", (menu, e, isFromInputControl) => {
        this.clearCustomItems(menu)
        this.currentMenu = null
        if (this.suppressEditComplete) {
          this.suppressEditComplete = false
          return
        }

        if (!isFromInputControl) this.fireEvent("editcomplete", this)
      })

      this.fireEvent("createdelayedelements", [this, "view"])
    }

    dh.createDelayedElementsEditor = function () {
      if (this.menuEditCopy) return // menu is already inited

      this.menuEditCopy = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-copy",
        caption: this.textCopy,
        value: "copy",
      })

      this.editModeMenu = new Common.UI.Menu({
        cls: "shifted-right",
        initMenu: (value) => {
          this.menuEditCopy.setDisabled(!this.api?.can_CopyCut())
        },
        items: [this.menuEditCopy],
      }).on("hide:after", (menu, e, isFromInputControl) => {
        this.clearCustomItems(menu)
        this.currentMenu = null
        if (this.suppressEditComplete) {
          this.suppressEditComplete = false
          return
        }

        if (!isFromInputControl) this.fireEvent("editcomplete", this)
      })

      this.fireEvent("createdelayedelements", [this, "edit"])
    }
  }
})
