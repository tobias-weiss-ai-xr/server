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

/**
 *  EditListItemDialog.js
 *
 *  Created on 05.11.2019
 *
 */

define([], () => {
  DE.Views.EditListItemDialog = Common.UI.Window.extend(
    _.extend(
      {
        options: {
          width: 330,
          header: false,
          cls: "modal-dlg",
          buttons: ["ok", "cancel"],
        },

        initialize: function (options) {
          _.extend(this.options, options || {})

          this.template = [
            '<div class="box">',
            '<div class="input-row">',
            `<label>${this.textDisplayName}</label>`,
            "</div>",
            '<div id="id-dlg-label-name" class="input-row" style="margin-bottom: 8px;"></div>',
            '<div class="input-row">',
            `<label>${this.textValue}</label>`,
            "</div>",
            '<div id="id-dlg-label-value" class="input-row"></div>',
            "</div>",
          ].join("")

          this.options.tpl = _.template(this.template)(this.options)
          Common.UI.Window.prototype.initialize.call(this, this.options)
        },

        render: function () {
          Common.UI.Window.prototype.render.call(this)
          this.inputName = new Common.UI.InputField({
            el: $("#id-dlg-label-name"),
            allowBlank: false,
            blankError: this.textNameError,
            style: "width: 100%;",
            maxLength: 256,
            validateOnBlur: false,
            validation: (value) => (value ? true : ""),
          })
          this.inputName._input.on("input", (e) => {
            if (
              this.copyvalue === undefined &&
              this.inputValue.getValue() === this.inputName.getValue()
            ) {
              this.copyvalue = 1
            }
            if (this.copyvalue === 1) this.inputValue.setValue($(e.target).val())
            else if (this.copyvalue === 2) this.copyvalue = 0
          })

          this.inputValue = new Common.UI.InputField({
            el: $("#id-dlg-label-value"),
            style: "width: 100%;",
            maxLength: 256,
            validateOnBlur: false,
            validation: (value) => {
              if (value !== "" && this.options.store) {
                const rec = this.options.store.findWhere({ value: value })
                if (rec) return this.textValueError
              }
              return true
            },
          })
          this.inputValue._input.on("input", (e) => {
            if (
              this.copyvalue === undefined &&
              this.inputValue.getValue() === this.inputName.getValue()
            ) {
              this.copyvalue = 2
            }
            if (this.copyvalue === 2) this.inputName.setValue($(e.target).val())
            else if (this.copyvalue === 1) this.copyvalue = 0
          })

          const $window = this.getChild()
          $window.find(".dlg-btn").on("click", _.bind(this.onBtnClick, this))
        },

        getFocusedComponents: function () {
          return [this.inputName, this.inputValue].concat(this.getFooterButtons())
        },

        getDefaultFocusableComponent: function () {
          return this.inputName
        },

        onPrimary: function (event) {
          this._handleInput("ok")
          return false
        },

        onBtnClick: function (event) {
          this._handleInput(event.currentTarget.attributes.result.value)
        },

        _handleInput: function (state) {
          if (this.options.handler) {
            if (state === "ok") {
              if (this.inputName.checkValidate() !== true) {
                this.inputName.focus()
                return
              }
              if (this.inputValue.checkValidate() !== true) {
                this.inputValue.focus()
                return
              }
            }

            this.options.handler.call(
              this,
              state,
              this.inputName.getValue(),
              this.inputValue.getValue(),
            )
          }

          this.close()
        },

        setSettings: function (props) {
          if (props) {
            this.inputName.setValue(props.name || "")
            this.inputValue.setValue(props.value || "")
          }
        },

        textDisplayName: "Display name",
        textValue: "Value",
        textNameError: "Display name must not be empty.",
        textValueError: "An item with the same value already exists.",
      },
      DE.Views.EditListItemDialog || {},
    ),
  )
})
