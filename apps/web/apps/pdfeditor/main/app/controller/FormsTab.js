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

define(["core"], () => {
  PDFE.Controllers.FormsTab = Backbone.Controller.extend(
    _.extend(
      {
        models: [],
        collections: [],
        // views : [
        //     'FormsTab'
        // ],
        sdkViewName: "#id_main",

        initialize: () => {},
        onLaunch: function () {
          this._state = {}
        },

        setApi: function (api) {
          if (api) {
            this.api = api
            this.api.asc_registerCallback("asc_onFocusObject", this.onApiFocusObject.bind(this))
            this.api.asc_registerCallback(
              "asc_onCoAuthoringDisconnect",
              _.bind(this.onCoAuthoringDisconnect, this),
            )
            Common.NotificationCenter.on(
              "api:disconnect",
              _.bind(this.onCoAuthoringDisconnect, this),
            )
            Common.NotificationCenter.on("app:ready", this.onAppReady.bind(this))
            this.api.asc_registerCallback("asc_onDownloadUrl", _.bind(this.onDownloadUrl, this))
          }
          return this
        },

        setConfig: function (config) {
          this.toolbar = config.toolbar
          this.appConfig = config.config
          this.views = this.getApplication().getClasseRefs("view", ["FormsTab"])
          this.view = this.createView("FormsTab", {
            toolbar: this.toolbar.toolbar,
            config: config.config,
            api: this.api,
          })
          this.addListeners({
            FormsTab: {
              "forms:insert": this.onControlsSelect,
              "forms:clear": this.onClearClick,
            },
            Toolbar: {
              "tab:active": this.onActiveTab,
              "tab:collapse": this.onTabCollapse,
              "view:compact": (toolbar, state) => {
                state && this.onTabCollapse()
              },
            },
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
          this.SetDisabled(true)
        },

        onApiFocusObject: function (selectedObjects) {
          if (!this.toolbar.editMode) return

          let pr
          let i = -1
          let type
          let paragraph_locked = false
          let shape_pr = undefined

          while (++i < selectedObjects.length) {
            type = selectedObjects[i].get_ObjectType()
            pr = selectedObjects[i].get_ObjectValue()

            if (type === Asc.c_oAscTypeSelectElement.Paragraph) {
              paragraph_locked = pr.get_Locked()
            } else if (type === Asc.c_oAscTypeSelectElement.Image) {
              if (pr?.get_ShapeProperties()) shape_pr = pr.get_ShapeProperties()
            }
          }
          const arr = [
            this.view.btnTextField,
            this.view.btnComboBox,
            this.view.btnDropDown,
            this.view.btnCheckBox,
            this.view.btnRadioBox,
            this.view.btnImageField,
            this.view.btnEmailField,
            this.view.btnPhoneField,
            this.view.btnCreditCard,
            this.view.btnZipCode,
            this.view.btnDateTime,
          ]
          Common.Utils.lockControls(Common.enumLock.paragraphLock, paragraph_locked, { array: arr })

          const in_smart_art = shape_pr?.asc_getFromSmartArt()
          const in_smart_art_internal = shape_pr?.asc_getFromSmartArtInternal()
          Common.Utils.lockControls(Common.enumLock.inSmartart, in_smart_art, { array: arr })
          Common.Utils.lockControls(Common.enumLock.inSmartartInternal, in_smart_art_internal, {
            array: arr,
          })
        },

        onControlsSelect: function (type, options) {
          if (!this.toolbar.mode?.canFeatureForms) return

          let oPr
          const oFormPr = new AscCommon.CSdtFormPr()
          this.toolbar.toolbar.fireEvent("insertcontrol", this.toolbar.toolbar)
          if (type === "picture") this.api.AddImageField()
          else if (type === "checkbox") this.api.AddCheckboxField()
          else if (type === "radiobox") this.api.AddRadiobuttonField()
          else if (type === "combobox") this.api.AddComboboxField()
          else if (type === "dropdown") this.api.AddListboxField()
          else if (type === "datetime") {
            this.api.AddDateField()
          } else if (type === "text") {
            this.api.AddTextField(options)
          }

          Common.NotificationCenter.trigger("edit:complete", this.toolbar)
        },

        onClearClick: function () {
          if (this.api) {
            this.api.asc_ClearAllSpecialForms()
          }
          Common.NotificationCenter.trigger("edit:complete", this.toolbar)
        },

        onDownloadUrl: function (url, fileType) {
          if (this.isFromFormSaveAs) {
            let defFileName = this.getApplication()
              .getController("Viewport")
              .getView("Common.Views.Header")
              .getDocumentCaption()
            !defFileName && (defFileName = this.view.txtUntitled)

            const idx = defFileName.lastIndexOf(".")
            if (idx > 0) defFileName = `${defFileName.substring(0, idx)}.pdf`

            if (this.appConfig.canRequestSaveAs) {
              Common.Gateway.requestSaveAs(url, defFileName, fileType)
            } else {
              this._saveCopyDlg = new Common.Views.SaveAsDlg({
                saveFolderUrl: this.appConfig.saveAsUrl,
                saveFileUrl: url,
                defFileName: defFileName,
              })
              this._saveCopyDlg
                .on("saveaserror", (obj, err) => {
                  Common.UI.warning({
                    closable: false,
                    msg: err,
                    callback: (btn) => {
                      Common.NotificationCenter.trigger("edit:complete", this)
                    },
                  })
                })
                .on("close", (obj) => {
                  this._saveCopyDlg = undefined
                })
              this._saveCopyDlg.show()
            }
          }
          this.isFromFormSaveAs = false
        },

        onAppReady: (config) => {
          new Promise((accept, reject) => {
            accept()
          }).then(() => {})
        },

        onActiveTab: function (tab) {
          tab !== "forms" && this.onTabCollapse()
        },

        onTabCollapse: (tab) => {},

        onRightMenuClick: (menu, type, minimized, event) => {},
      },
      PDFE.Controllers.FormsTab || {},
    ),
  )
})
