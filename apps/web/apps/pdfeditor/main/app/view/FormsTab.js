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
 *  FormsTab.js
 *
 *  Created on 04.03.2025
 *
 */

define([], () => {
  if (!Common.enumLock) Common.enumLock = {}

  const enumLock = {
    requiredNotFilled: "required-not-filled",
    submit: "submit",
  }
  for (const key in enumLock) {
    if (enumLock.hasOwnProperty(key)) {
      Common.enumLock[key] = enumLock[key]
    }
  }

  PDFE.Views.FormsTab = Common.UI.BaseView.extend(
    _.extend(
      (() => {
        const template =
          '<section class="panel" data-tab="forms" role="tabpanel" aria-labelledby="forms">' +
          '<div class="group forms-buttons" style="display: none;">' +
          '<span class="btn-slot text x-huge" id="slot-btn-form-field"></span>' +
          '<span class="btn-slot text x-huge" id="slot-btn-form-combobox"></span>' +
          '<span class="btn-slot text x-huge" id="slot-btn-form-dropdown"></span>' +
          '<span class="btn-slot text x-huge" id="slot-btn-form-checkbox"></span>' +
          '<span class="btn-slot text x-huge" id="slot-btn-form-radiobox"></span>' +
          '<span class="btn-slot text x-huge" id="slot-btn-form-image"></span>' +
          "</div>" +
          '<div class="separator long forms-buttons" style="display: none;"></div>' +
          '<div class="group forms-buttons" style="display: none;">' +
          '<span class="btn-slot text x-huge" id="slot-btn-form-email"></span>' +
          '<span class="btn-slot text x-huge" id="slot-btn-form-phone"></span>' +
          '<span class="btn-slot text x-huge" id="slot-btn-form-datetime"></span>' +
          '<span class="btn-slot text x-huge" id="slot-btn-form-zipcode"></span>' +
          '<span class="btn-slot text x-huge" id="slot-btn-form-credit"></span>' +
          "</div>" +
          '<div class="separator long fill-buttons" style="display: none;"></div>' +
          '<div class="group no-group-mask" style="display: none;">' +
          '<span class="btn-slot text x-huge" id="slot-btn-form-prev"></span>' +
          '<span class="btn-slot text x-huge" id="slot-btn-form-next"></span>' +
          '<span class="btn-slot text x-huge" id="slot-btn-form-clear"></span>' +
          "</div>" +
          "</section>"

        function setEvents() {
          this.btnTextField?.on("click", (b, e) => {
            this.fireEvent("forms:insert", ["text"])
          })
          this.btnComboBox?.on("click", (b, e) => {
            this.fireEvent("forms:insert", ["combobox"])
          })
          this.btnDropDown?.on("click", (b, e) => {
            this.fireEvent("forms:insert", ["dropdown"])
          })
          this.btnCheckBox?.on("click", (b, e) => {
            this.fireEvent("forms:insert", ["checkbox"])
          })
          this.btnRadioBox?.on("click", (b, e) => {
            this.fireEvent("forms:insert", ["radiobox"])
          })
          this.btnImageField?.on("click", (b, e) => {
            this.fireEvent("forms:insert", ["picture"])
          })
          this.btnEmailField?.on("click", (b, e) => {
            this.fireEvent("forms:insert", [
              "text",
              { reg: "\\S+@\\S+\\.\\S+", placeholder: "user_name@email.com" },
            ])
          })
          this.btnPhoneField?.on("click", (b, e) => {
            this.fireEvent("forms:insert", [
              "text",
              { mask: "(999)999-9999", placeholder: "(999)999-9999" },
            ])
          })
          this.btnCreditCard?.on("click", (b, e) => {
            this.fireEvent("forms:insert", [
              "text",
              { mask: "9999-9999-9999-9999", placeholder: "9999-9999-9999-9999" },
            ])
          })
          this.btnZipCode?.on("click", (b, e) => {
            this.fireEvent("forms:insert", [
              "text",
              { mask: "99999-9999", placeholder: "99999-9999" },
            ])
          })
          this.btnDateTime?.on("click", (b, e) => {
            this.fireEvent("forms:insert", ["datetime"])
          })
          this.btnClear?.on("click", (b, e) => {
            this.fireEvent("forms:clear")
          })
          this.btnPrevForm?.on("click", (b, e) => {
            this.fireEvent("forms:goto", ["prev"])
          })
          this.btnNextForm?.on("click", (b, e) => {
            this.fireEvent("forms:goto", ["next"])
          })
          this.btnSubmit?.on("click", (b, e) => {
            this.fireEvent("forms:submit")
          })
          this.btnSaveForm?.on("click", (b, e) => {
            this.fireEvent("forms:save")
          })
        }

        return {
          options: {},

          initialize: function (options) {
            Common.UI.BaseView.prototype.initialize.call(this)
            this.toolbar = options.toolbar
            this.appConfig = options.config
            this.api = options.api

            this.paragraphControls = []
            this._state = {}
            const _set = Common.enumLock

            this.btnTextField = new Common.UI.Button({
              cls: "btn-toolbar x-huge icon-top",
              iconCls: "toolbar__icon btn-text-field",
              lock: [
                _set.pageDeleted,
                _set.paragraphLock,
                _set.lostConnect,
                _set.disableOnStart,
                _set.inSmartart,
                _set.inSmartartInternal,
                _set.viewMode,
              ],
              caption: this.capBtnText,
              dataHint: "1",
              dataHintDirection: "bottom",
              dataHintOffset: "small",
            })
            this.paragraphControls.push(this.btnTextField)

            this.btnComboBox = new Common.UI.Button({
              cls: "btn-toolbar x-huge icon-top",
              iconCls: "toolbar__icon btn-combo-box",
              lock: [
                _set.pageDeleted,
                _set.paragraphLock,
                _set.lostConnect,
                _set.disableOnStart,
                _set.inSmartart,
                _set.inSmartartInternal,
                _set.viewMode,
              ],
              caption: this.capBtnComboBox,
              dataHint: "1",
              dataHintDirection: "bottom",
              dataHintOffset: "small",
            })
            this.paragraphControls.push(this.btnComboBox)

            this.btnDropDown = new Common.UI.Button({
              cls: "btn-toolbar x-huge icon-top",
              iconCls: "toolbar__icon btn-listbox",
              lock: [
                _set.pageDeleted,
                _set.paragraphLock,
                _set.lostConnect,
                _set.disableOnStart,
                _set.inSmartart,
                _set.inSmartartInternal,
                _set.viewMode,
              ],
              caption: this.capBtnDropDown,
              dataHint: "1",
              dataHintDirection: "bottom",
              dataHintOffset: "small",
            })
            this.paragraphControls.push(this.btnDropDown)

            this.btnCheckBox = new Common.UI.Button({
              cls: "btn-toolbar x-huge icon-top",
              iconCls: "toolbar__icon btn-checkbox",
              lock: [
                _set.pageDeleted,
                _set.paragraphLock,
                _set.lostConnect,
                _set.disableOnStart,
                _set.inSmartart,
                _set.inSmartartInternal,
                _set.viewMode,
              ],
              caption: this.capBtnCheckBox,
              dataHint: "1",
              dataHintDirection: "bottom",
              dataHintOffset: "small",
            })
            this.paragraphControls.push(this.btnCheckBox)

            this.btnRadioBox = new Common.UI.Button({
              cls: "btn-toolbar x-huge icon-top",
              iconCls: "toolbar__icon btn-radio-button",
              lock: [
                _set.pageDeleted,
                _set.paragraphLock,
                _set.lostConnect,
                _set.disableOnStart,
                _set.inSmartart,
                _set.inSmartartInternal,
                _set.viewMode,
              ],
              caption: this.capBtnRadioBox,
              dataHint: "1",
              dataHintDirection: "bottom",
              dataHintOffset: "small",
            })
            this.paragraphControls.push(this.btnRadioBox)

            this.btnImageField = new Common.UI.Button({
              cls: "btn-toolbar x-huge icon-top",
              iconCls: "toolbar__icon btn-insertimage",
              lock: [
                _set.pageDeleted,
                _set.paragraphLock,
                _set.lostConnect,
                _set.disableOnStart,
                _set.inSmartart,
                _set.inSmartartInternal,
                _set.viewMode,
              ],
              caption: this.capBtnImage,
              dataHint: "1",
              dataHintDirection: "bottom",
              dataHintOffset: "small",
            })
            this.paragraphControls.push(this.btnImageField)

            this.btnEmailField = new Common.UI.Button({
              cls: "btn-toolbar x-huge icon-top",
              iconCls: "toolbar__icon btn-email",
              lock: [
                _set.pageDeleted,
                _set.paragraphLock,
                _set.lostConnect,
                _set.disableOnStart,
                _set.inSmartart,
                _set.inSmartartInternal,
                _set.viewMode,
              ],
              caption: this.capBtnEmail,
              dataHint: "1",
              dataHintDirection: "bottom",
              dataHintOffset: "small",
            })
            this.paragraphControls.push(this.btnEmailField)

            this.btnPhoneField = new Common.UI.Button({
              cls: "btn-toolbar x-huge icon-top",
              iconCls: "toolbar__icon btn-phone",
              lock: [
                _set.pageDeleted,
                _set.paragraphLock,
                _set.lostConnect,
                _set.disableOnStart,
                _set.inSmartart,
                _set.inSmartartInternal,
                _set.viewMode,
              ],
              caption: this.capBtnPhone,
              dataHint: "1",
              dataHintDirection: "bottom",
              dataHintOffset: "small",
            })
            this.paragraphControls.push(this.btnPhoneField)

            this.btnZipCode = new Common.UI.Button({
              cls: "btn-toolbar x-huge icon-top",
              iconCls: "toolbar__icon btn-zip-code",
              lock: [
                _set.pageDeleted,
                _set.paragraphLock,
                _set.lostConnect,
                _set.disableOnStart,
                _set.inSmartart,
                _set.inSmartartInternal,
                _set.viewMode,
              ],
              caption: this.capZipCode,
              dataHint: "1",
              dataHintDirection: "bottom",
              dataHintOffset: "small",
            })
            this.paragraphControls.push(this.btnZipCode)

            this.btnCreditCard = new Common.UI.Button({
              cls: "btn-toolbar x-huge icon-top",
              iconCls: "toolbar__icon btn-credit-card",
              lock: [
                _set.pageDeleted,
                _set.paragraphLock,
                _set.lostConnect,
                _set.disableOnStart,
                _set.inSmartart,
                _set.inSmartartInternal,
                _set.viewMode,
              ],
              caption: this.capCreditCard,
              dataHint: "1",
              dataHintDirection: "bottom",
              dataHintOffset: "small",
            })
            this.paragraphControls.push(this.btnCreditCard)

            this.btnDateTime = new Common.UI.Button({
              cls: "btn-toolbar x-huge icon-top",
              iconCls: "toolbar__icon btn-datetime",
              lock: [
                _set.pageDeleted,
                _set.paragraphLock,
                _set.lostConnect,
                _set.disableOnStart,
                _set.inSmartart,
                _set.inSmartartInternal,
                _set.viewMode,
              ],
              caption: this.capDateTime,
              dataHint: "1",
              dataHintDirection: "bottom",
              dataHintOffset: "small",
            })
            this.paragraphControls.push(this.btnDateTime)

            this.btnClear = new Common.UI.Button({
              cls: "btn-toolbar x-huge icon-top",
              iconCls: "toolbar__icon btn-clear-style",
              caption: this.textClear,
              lock: [_set.pageDeleted, _set.lostConnect, _set.viewMode, _set.disableOnStart],
              visible: false,
              dataHint: "1",
              dataHintDirection: "bottom",
              dataHintOffset: "small",
            })
            this.paragraphControls.push(this.btnClear)

            this.btnPrevForm = new Common.UI.Button({
              cls: "btn-toolbar x-huge icon-top",
              iconCls: "toolbar__icon btn-previous-field icon-rtl",
              lock: [_set.pageDeleted, _set.lostConnect, _set.disableOnStart, _set.viewMode],
              caption: this.capBtnPrev,
              visible: false,
              dataHint: "1",
              dataHintDirection: "bottom",
              dataHintOffset: "small",
            })
            this.paragraphControls.push(this.btnPrevForm)

            this.btnNextForm = new Common.UI.Button({
              cls: "btn-toolbar x-huge icon-top",
              iconCls: "toolbar__icon btn-next-field icon-rtl",
              lock: [_set.pageDeleted, _set.lostConnect, _set.disableOnStart, _set.viewMode],
              caption: this.capBtnNext,
              visible: false,
              dataHint: "1",
              dataHintDirection: "bottom",
              dataHintOffset: "small",
            })
            this.paragraphControls.push(this.btnNextForm)

            Common.UI.LayoutManager.addControls(this.paragraphControls)
            Common.Utils.lockControls(Common.enumLock.disableOnStart, true, {
              array: this.paragraphControls,
            })
            this._state = { disabled: false }
            Common.NotificationCenter.on("app:ready", this.onAppReady.bind(this))
          },

          render: function (el) {
            if (el) el.html(this.getPanel())

            return this
          },

          onAppReady: function (config) {
            new Promise((accept, reject) => {
              accept()
            }).then(() => {
              if (config.isEdit && config.isPDFEdit && config.canFeatureForms) {
                this.btnTextField.updateHint(this.tipTextField)
                this.btnComboBox.updateHint(this.tipComboBox)
                this.btnDropDown.updateHint(this.tipDropDown)
                this.btnCheckBox.updateHint(this.tipCheckBox)
                this.btnRadioBox.updateHint(this.tipRadioBox)
                this.btnImageField.updateHint(this.tipImageField)
                this.btnEmailField.updateHint(this.tipEmailField)
                this.btnPhoneField.updateHint(this.tipPhoneField)
                this.btnZipCode.updateHint(this.tipZipCode)
                this.btnCreditCard.updateHint(this.tipCreditCard)
                this.btnDateTime.updateHint(this.tipDateTime)
              }
              this.btnClear.updateHint(this.textClearFields)
              this.btnPrevForm.updateHint(this.tipPrevForm)
              this.btnNextForm.updateHint(this.tipNextForm)

              setEvents.call(this)
            })
          },

          getPanel: function () {
            this.$el = $(_.template(template)({}))
            const $host = this.$el

            this.btnTextField.render($host.find("#slot-btn-form-field"))
            this.btnComboBox.render($host.find("#slot-btn-form-combobox"))
            this.btnDropDown.render($host.find("#slot-btn-form-dropdown"))
            this.btnCheckBox.render($host.find("#slot-btn-form-checkbox"))
            this.btnRadioBox.render($host.find("#slot-btn-form-radiobox"))
            this.btnImageField.render($host.find("#slot-btn-form-image"))
            this.btnEmailField.render($host.find("#slot-btn-form-email"))
            this.btnPhoneField.render($host.find("#slot-btn-form-phone"))
            this.btnZipCode.render($host.find("#slot-btn-form-zipcode"))
            this.btnCreditCard.render($host.find("#slot-btn-form-credit"))
            this.btnDateTime.render($host.find("#slot-btn-form-datetime"))
            $host.find(".forms-buttons").show()
            this.btnClear.render($host.find("#slot-btn-form-clear"))
            this.btnPrevForm.render($host.find("#slot-btn-form-prev"))
            this.btnNextForm.render($host.find("#slot-btn-form-next"))

            return this.$el
          },

          show: function () {
            Common.UI.BaseView.prototype.show.call(this)
            this.fireEvent("show", this)
          },

          getButtons: function () {
            return this.paragraphControls
          },

          setPreviewMode: function (state) {
            this.btnClear.setVisible(state)
            this.btnPrevForm.setVisible(state)
            this.btnNextForm.setVisible(state)
          },

          SetDisabled: function (state) {
            this._state.disabled = state
            this.paragraphControls.forEach((button) => {
              if (button) {
                button.setDisabled(state)
              }
            }, this)
          },

          capBtnText: "Text Field",
          capBtnComboBox: "Combo Box",
          capBtnDropDown: "List Box",
          capBtnCheckBox: "Checkbox",
          capBtnRadioBox: "Radio Button",
          capBtnImage: "Image",
          textClearFields: "Clear All Fields",
          tipTextField: "Insert text field",
          tipComboBox: "Insert combo box",
          tipDropDown: "Insert list box",
          tipCheckBox: "Insert checkbox",
          tipRadioBox: "Insert radio button",
          tipImageField: "Insert image",
          textClear: "Clear Fields",
          capBtnPrev: "Previous Field",
          capBtnNext: "Next Field",
          capBtnEmail: "Email Address",
          capBtnPhone: "Phone Number",
          tipEmailField: "Insert email address",
          tipPhoneField: "Insert phone number",
          capZipCode: "Zip Code",
          capCreditCard: "Credit Card",
          tipZipCode: "Insert zip code",
          tipCreditCard: "Insert credit card number",
          capDateTime: "Date & Time",
          tipDateTime: "Insert date and time",
        }
      })(),
      PDFE.Views.FormsTab || {},
    ),
  )
})
