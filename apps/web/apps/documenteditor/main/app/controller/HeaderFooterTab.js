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
 *  HeaderFooterTab.js
 *
 *  Created on 10.21.2025
 *
 */

define(["core", "documenteditor/main/app/view/HeaderFooterTab"], () => {
  DE.Controllers.HeaderFooterTab = Backbone.Controller.extend(
    _.extend(
      {
        models: [],
        collections: [],
        views: ["HeaderFooterTab"],
        sdkViewName: "#id_main",

        initialize: function () {
          this.spinners = []

          this._state = {
            HeaderPosition: 12.5,
            FooterPosition: 12.5,
            DiffFirst: false,
            DiffOdd: false,
            SameAs: false,
            Numbering: undefined,
          }

          this.addListeners({
            HeaderFooterTab: {
              "headerfooter:pospick": _.bind(this.onInsertPageNumberClick, this),
              "headerfooter:inspagenumber": _.bind(this.onInsertPageNumberMenuClick, this),
              "headerfooter:headerfooterpos": _.bind(this.onNumPositionChange, this),
              "headerfooter:difffirst": _.bind(this.onDiffFirstChange, this),
              "headerfooter:diffoddeven": _.bind(this.onDiffOddEvenChange, this),
              "headerfooter:sameas": _.bind(this.onSameAsChange, this),
              "headerfooter:close": _.bind(this.onTabClose, this),
              "headerfooter:editremove": _.bind(this.onHeaderFooterEditRemove, this),
              "headerfooter:insdatetime": _.bind(this.onInsDateTimeClick, this),
              "headerfooter:insfield": _.bind(this.onInsFieldClick, this, "add"),
              "headerfooter:insimage": _.bind(this.onInsertImageClick, this),
            },
            DocumentHolder: {
              "field:edit": this.onInsFieldClick.bind(this, "edit"),
            },
          })
        },

        onInsertImageClick: function (menu, item, e) {
          if (item.value === "file") {
            this.view.fireEvent("insertimage")

            if (this.api)
              setTimeout(() => {
                this.api.asc_addImage()
              }, 1)

            Common.NotificationCenter.trigger("edit:complete", this.view)
            // Common.component.Analytics.trackEvent('ToolBar', 'Image');
          } else if (item.value === "url") {
            new Common.Views.ImageFromUrlDialog({
              handler: (result, value) => {
                if (result === "ok") {
                  if (this.api) {
                    const checkUrl = value.replace(/ /g, "")
                    if (!_.isEmpty(checkUrl)) {
                      this.view.fireEvent("insertimage")
                      this.api.AddImageUrl([checkUrl])

                      // Common.component.Analytics.trackEvent('ToolBar', 'Image');
                    }
                  }

                  Common.NotificationCenter.trigger("edit:complete", this.toolbar)
                }
              },
            }).show()
          } else if (item.value === "storage") {
            Common.NotificationCenter.trigger("storage:image-load", "add")
          }
        },

        onInsFieldClick: function (type) {
          new Common.Views.TextInputDialog({
            width: 450,
            title: this.textFieldTitle,
            label: this.textFieldLabel,
            description: this.textFieldExample,
            value: type === "edit" ? this.api.asc_GetComplexFieldInstruction() : "",
            handler: (result, value) => {
              if (result === "ok") {
                if (this.api) {
                  type === "edit"
                    ? this.api.asc_EditComplexFieldInstruction(value)
                    : this.api.asc_AddComplexFieldWithInstruction(value)
                }
              }
              Common.NotificationCenter.trigger("edit:complete", this.toolbar)
            },
          }).show()
        },

        onInsDateTimeClick: function () {
          new DE.Views.DateTimeDialog({
            api: this.api,
            lang: this._state.lang,
            handler: (result, value) => {
              if (result === "ok") {
                if (this.api) {
                  this.api.asc_addDateTime(value)
                }
              }
              Common.NotificationCenter.trigger("edit:complete", this.toolbar)
            },
          }).show()
        },

        onHeaderFooterEditRemove: function (item) {
          if (this.api) {
            switch (item.value) {
              case "edit-header":
                this.api.GoToHeader(this.api.getCurrentPage())
                break
              case "edit-footer":
                this.api.GoToFooter(this.api.getCurrentPage())
                break
              case "remove-header":
                this.api.asc_RemoveHeader(this.api.getCurrentPage())
                break
              case "remove-footer":
                this.api.asc_RemoveFooter(this.api.getCurrentPage())
                break
            }
            Common.NotificationCenter.trigger("edit:complete", this.toolbar)
          }
        },

        onTabClose: function () {
          if (this.api) {
            this.api.asc_CancelHdrFtrEditing()
          }
        },

        onDiffFirstChange: function (field) {
          if (this.api)
            this.api.HeadersAndFooters_DifferentFirstPage(field.getValue() === "checked")
          this.fireEvent("editcomplete", this)
        },

        onDiffOddEvenChange: function (field) {
          if (this.api)
            this.api.HeadersAndFooters_DifferentOddandEvenPage(field.getValue() === "checked")
          this.fireEvent("editcomplete", this)
        },

        onSameAsChange: function (field, newValue, oldValue, eOpts) {
          if (this.api) this.api.HeadersAndFooters_LinkToPrevious(field.getValue() === "checked")
          this.fireEvent("editcomplete", this)
        },

        ChangeSettings: function (prop) {
          this.createDelayedElements()

          if (prop) {
            let value = prop.get_HeaderMargin()
            if (Math.abs(this._state.HeaderPosition - value) > 0.001) {
              this.view.numHeaderPosition.setValue(Common.Utils.Metric.fnRecalcFromMM(value), true)
              this._state.HeaderPosition = value
            }

            value = prop.get_FooterMargin()
            if (Math.abs(this._state.FooterPosition - value) > 0.001) {
              this.view.numFooterPosition.setValue(Common.Utils.Metric.fnRecalcFromMM(value), true)
              this._state.FooterPosition = value
            }

            value = prop.get_DifferentFirst()
            if (this._state.DiffFirst !== value) {
              this.view.chDiffFirst.setValue(value, true)
              this._state.DiffFirst = value
            }

            value = prop.get_DifferentEvenOdd()
            if (this._state.DiffOdd !== value) {
              this.view.chDiffOddEven.setValue(value, true)
              this._state.DiffOdd = value
            }

            value = prop.get_LinkToPrevious()
            if (this._state.SameAs !== value) {
              this.view.chSameAs.setValue(value === true, true)
              this._state.SameAs = value
            }

            value = prop.get_StartPageNumber()
            if (this._state.Numbering !== value && value !== null) {
              this._state.Numbering = value
            }

            value = prop.get_NumFormat()
            if (this._state.NumFormat !== value) {
              this._state.NumFormat = value
            }

            Common.Utils.lockControls(Common.enumLock.linkToPrevious, this._state.SameAs === null, {
              array: [this.view.chSameAs],
            })
          }
        },

        createDelayedElements: function () {
          if (this.spinners.length === 0) {
            this.spinners.push(this.view.numHeaderPosition)
            this.spinners.push(this.view.numFooterPosition)
          }
          this.updateMetricUnit()
        },

        updateMetricUnit: function () {
          if (this.spinners) {
            for (let i = 0; i < this.spinners.length; i++) {
              const spinner = this.spinners[i]
              spinner.setDefaultUnit(Common.Utils.Metric.getCurrentMetricName())
              spinner.setStep(
                Common.Utils.Metric.getCurrentMetric() === Common.Utils.Metric.c_MetricUnits.pt
                  ? 1
                  : 0.01,
              )
            }
            this.view.numHeaderPosition?.setValue(
              Common.Utils.Metric.fnRecalcFromMM(this._state.HeaderPosition),
              true,
            )
            this.view.numFooterPosition?.setValue(
              Common.Utils.Metric.fnRecalcFromMM(this._state.FooterPosition),
              true,
            )
          }
        },

        onNumPositionChange: function (field, isHeader, newValue, oldValue, eOpts) {
          if (this.api)
            this.api.put_HeadersAndFootersDistance(
              Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()),
              isHeader,
            )
        },

        onInsertPageNumberClick: function (picker, item, record, e) {
          if (this.api) this.api.put_PageNum(record.get("data").type, record.get("data").subtype)

          Common.NotificationCenter.trigger("edit:complete", this.toolbar)
        },

        onInsertPageNumberMenuClick: function (item) {
          if (this.api) {
            if (item.value === "current") {
              this.api.put_PageNum(-1)
            } else if (item.value === "format") {
              this._docPageNumberingDlg = new DE.Views.PageNumberingDlg({
                props: this.appConfig,
                numbering: this._state.Numbering,
                numFormat: this._state.NumFormat,
                mode: this.mode,
                title: this.txtNumberingDlgTitle,
                handler: (result, from, format) => {
                  if (result === "ok") {
                    const pageProps = new Asc.SectionPageNumProps()
                    pageProps.put_Start(from)
                    pageProps.put_Format(format)
                    this.api.asc_SetSectionPageNumProps(pageProps)
                  }
                  Common.NotificationCenter.trigger("edit:complete")
                },
              }).on("close", () => {
                this._docPageNumberingDlg = undefined
              })

              this._docPageNumberingDlg.show()
            } else if (item.value === "quantity") {
              this.api.asc_AddPageCount()
            }
            this.fireEvent("editcomplete", this)
          }
        },

        onLaunch: function () {
          Common.NotificationCenter.on("app:ready", this.onAppReady.bind(this))
          Common.NotificationCenter.on("document:ready", _.bind(this.onDocumentReady, this))
        },

        setApi: function (api) {
          if (api) {
            this.api = api
            this.api.asc_registerCallback(
              "asc_onCoAuthoringDisconnect",
              _.bind(this.onCoAuthoringDisconnect, this),
            )
            this.api.asc_registerCallback("asc_onFocusObject", _.bind(this.onApiFocusObject, this))
            this.api.asc_registerCallback(
              "asc_onLockHeaderFooters",
              _.bind(this.onApiLockHeaderFooters, this),
            )
            this.api.asc_registerCallback(
              "asc_onUnLockHeaderFooters",
              _.bind(this.onApiUnLockHeaderFooters, this),
            )
            this.api.asc_registerCallback("asc_onTextLanguage", _.bind(this.onTextLanguage, this))
            Common.NotificationCenter.on(
              "api:disconnect",
              _.bind(this.onCoAuthoringDisconnect, this),
            )
          }
          return this
        },

        onTextLanguage: function (langId) {
          this._state.lang = langId
        },

        onApiLockHeaderFooters: function () {
          Common.Utils.lockControls(Common.enumLock.headerFooterLock, true, {
            array: [this.view.mnuPageNumberPosPicker],
          })
          Common.Utils.lockControls(Common.enumLock.headerFooterLock, true, {
            array: this.view.mnuPageNumberPosPickers,
          })
        },

        onApiUnLockHeaderFooters: function () {
          Common.Utils.lockControls(Common.enumLock.headerFooterLock, false, {
            array: this.view.mnuPageNumberPosPickers,
          })
          Common.Utils.lockControls(Common.enumLock.headerFooterLock, false, {
            array: this.view.mnuPageNumberPosPickers,
          })
        },

        onApiFocusObject: function (selected) {
          let header_locked = undefined
          let frame_pr = undefined
          let paragraph_locked = undefined
          let in_header = false
          let in_equation = false
          let in_para = false
          let can_add_image = false
          let in_control = false

          for (let i = 0; i < selected.length; i++) {
            const pr = selected[i].get_ObjectValue()
            if (selected[i].asc_getObjectType() === Asc.c_oAscTypeSelectElement.Header) {
              header_locked = pr.get_Locked()
              in_header = true
              this.ChangeSettings(selected[i].asc_getObjectValue())
            } else if (selected[i].asc_getObjectType() === Asc.c_oAscTypeSelectElement.Paragraph) {
              frame_pr = selected[i].get_ObjectValue()
              paragraph_locked = frame_pr.get_Locked()
              can_add_image = pr.get_CanAddImage()
              in_para = true
            } else if (selected[i].asc_getObjectType() === Asc.c_oAscTypeSelectElement.Math) {
              in_equation = true
            }
          }

          const rich_edit_lock = frame_pr ? !frame_pr.can_EditBlockContentControl() : false
          const plain_edit_lock = frame_pr ? !frame_pr.can_EditInlineContentControl() : false
          const rich_del_lock = frame_pr ? !frame_pr.can_DeleteBlockContentControl() : false
          const plain_del_lock = frame_pr ? !frame_pr.can_DeleteInlineContentControl() : false

          in_control = this.api.asc_IsContentControl()
          const control_props = in_control ? this.api.asc_GetContentControlProperties() : null
          let lock_type =
            in_control && control_props ? control_props.get_Lock() : Asc.c_oAscSdtLockType.Unlocked
          const control_plain =
            in_control && control_props
              ? control_props.get_ContentControlType() === Asc.c_oAscSdtLevelType.Inline
              : false

          lock_type === undefined && (lock_type = Asc.c_oAscSdtLockType.Unlocked)
          const content_locked =
            lock_type === Asc.c_oAscSdtLockType.SdtContentLocked ||
            lock_type === Asc.c_oAscSdtLockType.ContentLocked

          Common.Utils.lockControls(Common.enumLock.richEditLock, rich_edit_lock, {
            array: this.view.paragraphControls,
          })
          Common.Utils.lockControls(Common.enumLock.plainEditLock, plain_edit_lock, {
            array: this.view.paragraphControls,
          })
          Common.Utils.lockControls(Common.enumLock.richDelLock, rich_del_lock, {
            array: this.view.paragraphControls,
          })
          Common.Utils.lockControls(Common.enumLock.plainDelLock, plain_del_lock, {
            array: this.view.paragraphControls,
          })
          Common.Utils.lockControls(Common.enumLock.paragraphLock, paragraph_locked, {
            array: this.view.paragraphControls,
          })
          Common.Utils.lockControls(Common.enumLock.headerLock, header_locked, {
            array: this.view.paragraphControls,
          })
          Common.Utils.lockControls(Common.enumLock.noParagraphSelected, !in_para, {
            array: this.view.paragraphControls,
          })
          Common.Utils.lockControls(Common.enumLock.inHeader, !in_header, {
            array: this.view.lockedControls,
          })
          Common.Utils.lockControls(Common.enumLock.inEquation, in_equation, {
            array: this.view.btnsInsImage.concat(this.view.getButtons("insertbtns")),
          })
          Common.Utils.lockControls(Common.enumLock.cantAddImagePara, in_para && !can_add_image, {
            array: this.view.btnsInsImage,
          })
          Common.Utils.lockControls(Common.enumLock.controlPlain, control_plain, {
            array: this.view.btnsInsImage,
          })
          Common.Utils.lockControls(Common.enumLock.contentLock, content_locked, {
            array: this.view.btnsInsImage,
          })
        },

        setConfig: function (config) {
          const mode = config.mode
          this.mode = mode
          this.toolbar = config.toolbar
          this.view = this.createView("HeaderFooterTab", {
            toolbar: this.toolbar.toolbar,
            mode: mode,
            compactToolbar: this.toolbar.toolbar.isCompactView,
          })
        },

        SetDisabled: function (state) {
          this.view?.SetDisabled(state)
        },

        createToolbarPanel: function () {
          return this.view.getPanel()
        },

        getView: function (name) {
          return !name && this.view
            ? this.view
            : Backbone.Controller.prototype.getView.call(this, name)
        },

        onCoAuthoringDisconnect: function () {
          Common.Utils.lockControls(Common.enumLock.lostConnect, true, {
            array: this.view.lockedControls,
          })
        },

        onAppReady: function (config) {
          if (this.view) {
            new Promise((accept, reject) => {
              accept()
            }).then(() => {
              this.view.setEvents()
            })
          }
        },

        onDocumentReady: function () {
          Common.Utils.lockControls(Common.enumLock.disableOnStart, false, {
            array: this.view?.lockedControls,
          })
        },
      },
      DE.Controllers.HeaderFooterTab || {},
    ),
  )
})
