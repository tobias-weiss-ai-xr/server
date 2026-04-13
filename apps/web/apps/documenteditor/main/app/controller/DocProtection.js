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
 *  DocProtection.js
 *
 *  Created on 21.09.2022
 *
 */
define([
  "core",
  "common/main/lib/view/Protection",
  "documenteditor/main/app/view/DocProtection",
], () => {
  if (!Common.enumLock) Common.enumLock = {}

  const enumLock = {
    docLockView: "lock-mode-view", // protected (readonly) document
    docLockForms: "lock-mode-forms", // protected (fill forms) document
    docLockReview: "lock-mode-review", // protected (review) document
    docLockComments: "lock-mode-comments", // protected (commenting) document
    protectLock: "protect-lock",
    docLockViewText: "lock-mode-view-text", // lock text props in protected (readonly) document
    docLockViewPara: "lock-mode-view-para", // lock para props in protected (readonly) document
    docLockViewIns: "lock-mode-view-ins", // lock insert objects in protected (readonly) document
    docLockCommentsText: "lock-mode-comments-text", // lock text props in protected (commenting) document
    docLockCommentsPara: "lock-mode-comments-para", // lock para props in protected (commenting) document
    docLockCommentsIns: "lock-mode-comments-ins", // lock insert objects in protected (commenting) document
  }
  for (const key in enumLock) {
    if (enumLock.hasOwnProperty(key)) {
      Common.enumLock[key] = enumLock[key]
    }
  }

  DE.Controllers.DocProtection = Backbone.Controller.extend(
    _.extend(
      {
        models: [],
        collections: [],
        views: ["DocProtection"],

        initialize: function () {
          this.addListeners({
            DocProtection: {
              "protect:document": _.bind(this.onProtectDocClick, this),
            },
          })
        },
        onLaunch: function () {
          this._state = {}
          Common.NotificationCenter.on("app:ready", this.onAppReady.bind(this))
        },
        setConfig: function (data, api) {
          this.setApi(api)
        },
        setApi: function (api) {
          this.userCollection = this.getApplication().getCollection("Common.Collections.Users")
          if (api) {
            this.api = api
            this.api.asc_registerCallback(
              "asc_onChangeDocumentProtection",
              _.bind(this.onChangeProtectDocument, this),
            )
            this.api.asc_registerCallback(
              "asc_onLockDocumentProtection",
              _.bind(this.onLockDocumentProtection, this),
            )
          }
        },

        setMode: function (mode) {
          this.appConfig = mode
          this.currentUserId = mode.user.id

          this.appConfig.isEdit &&
            this.appConfig.canProtect &&
            (this.view = this.createView("DocProtection", {
              mode: mode,
            }))

          return this
        },

        createToolbarPanel: function () {
          if (this.view) return this.view.getPanel()
        },

        getView: function (name) {
          return !name && this.view
            ? this.view
            : Backbone.Controller.prototype.getView.call(this, name)
        },

        onProtectDocClick: function (state) {
          this.view?.btnProtectDoc?.toggle(!state, true)
          if (state) {
            this._docProtectDlg = new DE.Views.ProtectDialog({
              props: this.appConfig,
              handler: (result, value, props) => {
                if (result === "ok") {
                  const protection =
                    this.api.asc_getDocumentProtection() || new AscCommonWord.CDocProtect()
                  protection.asc_setEditType(props)
                  protection.asc_setPassword(value)
                  this.api.asc_setDocumentProtection(protection)
                }
                Common.NotificationCenter.trigger("edit:complete")
              },
            }).on("close", () => {
              this._docProtectDlg = undefined
            })

            this._docProtectDlg.show()
          } else {
            let props = this.api.asc_getDocumentProtection()
            if (props?.asc_getIsPassword()) {
              const win = new Common.Views.OpenDialog({
                title: this.view.txtUnlockTitle,
                closable: true,
                type: Common.Utils.importTextType.DRM,
                txtOpenFile: this.view.txtDocUnlockDescription,
                validatePwd: false,
                maxPasswordLength: 15,
                handler: (result, value) => {
                  if (result === "ok") {
                    if (this.api) {
                      props.asc_setEditType(Asc.c_oAscEDocProtect.None)
                      value?.drmOptions && props.asc_setPassword(value.drmOptions.asc_getPassword())
                      this.api.asc_setDocumentProtection(props)
                    }
                    Common.NotificationCenter.trigger("edit:complete")
                  }
                },
              }).on("close", () => {})

              win.show()
            } else {
              if (!props) props = new AscCommonWord.CDocProtect()
              props.asc_setEditType(Asc.c_oAscEDocProtect.None)
              this.api.asc_setDocumentProtection(props)
            }
          }
        },

        onAppReady: function (config) {
          if (!this.api) return
          new Promise((resolve) => {
            resolve()
          }).then(() => {
            const props = this.api.asc_getDocumentProtection()
            const type = props ? props.asc_getEditType() : Asc.c_oAscEDocProtect.None
            const isProtected =
              type === Asc.c_oAscEDocProtect.ReadOnly ||
              type === Asc.c_oAscEDocProtect.Comments ||
              type === Asc.c_oAscEDocProtect.TrackedChanges ||
              type === Asc.c_oAscEDocProtect.Forms
            this.view?.btnProtectDoc?.toggle(!!isProtected, true)

            if (isProtected) {
              let str
              switch (type) {
                case Asc.c_oAscEDocProtect.ReadOnly:
                  str = this.txtIsProtectedView
                  break
                case Asc.c_oAscEDocProtect.Comments:
                  str = this.txtIsProtectedComment
                  break
                case Asc.c_oAscEDocProtect.Forms:
                  str = this.txtIsProtectedForms
                  break
                case Asc.c_oAscEDocProtect.TrackedChanges:
                  str = this.txtIsProtectedTrack
                  break
              }
              this._protectionTip = new Common.UI.SynchronizeTip({
                extCls: "no-arrow",
                placement: "bottom",
                target: $(".toolbar"),
                text: str,
                showLink: false,
                style: "max-width: 400px;",
              })
              this._protectionTip
                .on("closeclick", function () {
                  this.close()
                })
                .show()
            }

            props && this.applyRestrictions(type)
          })
        },

        onChangeProtectDocument: function (userId) {
          if (this._protectionTip?.isVisible()) {
            this._protectionTip.close()
            this._protectionTip = undefined
          }

          const props = this.getDocProps(true)
          const isProtected =
            props &&
            (props.isReadOnly || props.isCommentsOnly || props.isFormsOnly || props.isReviewOnly)
          this.view?.btnProtectDoc?.toggle(isProtected, true)

          // off preview forms
          const forms = this.getApplication().getController("FormsTab")
          forms?.changeViewFormMode(false)

          // off preview review changes
          const review = this.getApplication().getController("Common.Controllers.ReviewChanges")
          if (review?.isPreviewChangesMode()) {
            const value = Common.Utils.InternalSettings.get("de-review-mode-editor") || "markup"
            review.turnDisplayMode(value)
            review.view?.turnDisplayMode(value)
          }

          props && this.applyRestrictions(props.type)
          if (this._docProtectDlg?.isVisible())
            this._docProtectDlg.SetDisabled(!!this._state.lockDocProtect || isProtected)
          Common.NotificationCenter.trigger("protect:doclock", props)
          if (userId && this.userCollection) {
            const recUser = this.userCollection.findOriginalUser(userId)
            if (recUser && recUser.get("idOriginal") !== this.currentUserId) {
              let str = this.txtWasUnprotected
              switch (this._state.docProtection.type) {
                case Asc.c_oAscEDocProtect.ReadOnly:
                  str = this.txtWasProtectedView
                  break
                case Asc.c_oAscEDocProtect.Comments:
                  str = this.txtWasProtectedComment
                  break
                case Asc.c_oAscEDocProtect.Forms:
                  str = this.txtWasProtectedForms
                  break
                case Asc.c_oAscEDocProtect.TrackedChanges:
                  str = this.txtWasProtectedTrack
                  break
              }
              str &&
                Common.NotificationCenter.trigger(
                  "showmessage",
                  { msg: str },
                  { timeout: 5000, hideCloseTip: true },
                )
            }
          }
        },

        getDocProps: function (update) {
          if (!this.appConfig || (!this.appConfig.isEdit && !this.appConfig.isRestrictedEdit))
            return

          if (update || !this._state.docProtection) {
            const props = this.api.asc_getDocumentProtection()
            const type = props ? props.asc_getEditType() : Asc.c_oAscEDocProtect.None
            this._state.docProtection = {
              type: type,
              isReadOnly: type === Asc.c_oAscEDocProtect.ReadOnly,
              isCommentsOnly: type === Asc.c_oAscEDocProtect.Comments,
              isReviewOnly: type === Asc.c_oAscEDocProtect.TrackedChanges,
              isFormsOnly: type === Asc.c_oAscEDocProtect.Forms,
            }
          }
          return this._state.docProtection
        },

        applyRestrictions: function (type) {
          if (this.appConfig.isPDFForm && this.api.asc_isFinal()) return

          if (type === Asc.c_oAscEDocProtect.ReadOnly) {
            this.api.asc_setRestriction(Asc.c_oAscRestrictionType.View)
          } else if (type === Asc.c_oAscEDocProtect.Comments) {
            this.api.asc_setRestriction(
              this.appConfig.canComments
                ? Asc.c_oAscRestrictionType.OnlyComments
                : Asc.c_oAscRestrictionType.View,
            )
          } else if (type === Asc.c_oAscEDocProtect.Forms) {
            this.api.asc_setRestriction(
              this.appConfig.canFillForms
                ? Asc.c_oAscRestrictionType.OnlyForms
                : Asc.c_oAscRestrictionType.View,
            )
          } else {
            // none or tracked changes
            if (this.appConfig.isRestrictedEdit) {
              this.appConfig.canComments &&
                this.api.asc_setRestriction(Asc.c_oAscRestrictionType.OnlyComments)
              this.appConfig.canFillForms &&
                this.api.asc_setRestriction(Asc.c_oAscRestrictionType.OnlyForms)
            } else this.api.asc_setRestriction(Asc.c_oAscRestrictionType.None)
          }
          this.view?.updateProtectionTips(type)
        },

        onLockDocumentProtection: function (state) {
          this._state.lockDocProtect = state
          if (this.view?.btnProtectDoc) {
            Common.Utils.lockControls(Common.enumLock.protectLock, state, {
              array: [this.view.btnProtectDoc],
            })
          }
          if (this._docProtectDlg?.isVisible())
            this._docProtectDlg.SetDisabled(
              state ||
                (this._state.docProtection &&
                  (this._state.docProtection.isReadOnly ||
                    this._state.docProtection.isFormsOnly ||
                    this._state.docProtection.isCommentsOnly ||
                    this._state.docProtection.isReviewOnly)),
            )
        },

        txtWasProtectedView:
          "Document has been protected by another user.\nYou may only view this document.",
        txtWasProtectedTrack:
          "Document has been protected by another user.\nYou may edit this document, but all changes will be tracked.",
        txtWasProtectedComment:
          "Document has been protected by another user.\nYou may only insert comments to this document.",
        txtWasProtectedForms:
          "Document has been protected by another user.\nYou may only fill in forms in this document.",
        txtWasUnprotected: "Document has been unprotected.",
        txtIsProtectedView: "Document is protected. You may only view this document.",
        txtIsProtectedTrack:
          "Document is protected. You may edit this document, but all changes will be tracked.",
        txtIsProtectedComment:
          "Document is protected. You may only insert comments to this document.",
        txtIsProtectedForms: "Document is protected. You may only fill in forms in this document.",
      },
      DE.Controllers.DocProtection || {},
    ),
  )
})
