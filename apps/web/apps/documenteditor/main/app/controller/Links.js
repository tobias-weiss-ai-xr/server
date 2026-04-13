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
 *  Links.js
 *
 *  Created on 22.12.2017
 *
 */

define(["core", "documenteditor/main/app/view/Links"], () => {
  DE.Controllers.Links = Backbone.Controller.extend(
    _.extend(
      {
        models: [],
        collections: [],
        views: ["Links"],
        sdkViewName: "#id_main",

        initialize: function () {
          this.addListeners({
            Links: {
              "links:contents": this.onTableContents,
              "links:contents-open": this.onTableContentsOpen,
              "links:update": this.onTableContentsUpdate,
              "links:notes": this.onNotesClick,
              "links:hyperlink": this.onHyperlinkClick,
              "links:bookmarks": this.onBookmarksClick,
              "links:caption": this.onCaptionClick,
              "links:crossref": this.onCrossRefClick,
              "links:tof": this.onTableFigures,
              "links:tof-update": this.onTableFiguresUpdate,
              "links:addtext": this.onAddText,
              "links:addtext-open": this.onAddTextOpen,
            },
            DocumentHolder: {
              "links:contents": this.onTableContents,
              "links:update": this.onTableContentsUpdate,
              "links:contents-open": this.onTableContentsOpen,
              "links:caption": this.onCaptionClick,
            },
          })
        },
        onLaunch: function () {
          this._state = {
            in_object: undefined,
          }
          Common.Gateway.on(
            "setactionlink",
            ((url) => {
              console.log(`url with actions: ${url}`)
            }).bind(this),
          )
          Common.NotificationCenter.on("app:ready", this.onAppReady.bind(this))
        },

        setApi: function (api) {
          if (api) {
            this.api = api
            this.api.asc_registerCallback("asc_onFocusObject", this.onApiFocusObject.bind(this))
            this.api.asc_registerCallback(
              "asc_onCanAddHyperlink",
              _.bind(this.onApiCanAddHyperlink, this),
            )
            this.api.asc_registerCallback(
              "asc_onCoAuthoringDisconnect",
              _.bind(this.onCoAuthoringDisconnect, this),
            )
            Common.NotificationCenter.on(
              "api:disconnect",
              _.bind(this.onCoAuthoringDisconnect, this),
            )
            this.api.asc_registerCallback(
              "asc_onShowContentControlsActions",
              _.bind(this.onShowContentControlsActions, this),
            )
            this.api.asc_registerCallback(
              "asc_onHideContentControlsActions",
              _.bind(this.onHideContentControlsActions, this),
            )
            this.api.asc_registerCallback(
              "asc_onAscReplaceCurrentTOF",
              _.bind(this.onAscReplaceCurrentTOF, this),
            )
            this.api.asc_registerCallback("asc_onAscTOFUpdate", _.bind(this.onAscTOFUpdate, this))
          }
          Common.NotificationCenter.on(
            "protect:doclock",
            _.bind(this.onChangeProtectDocument, this),
          )
          return this
        },

        setConfig: function (config) {
          this.toolbar = config.toolbar
          this.view = this.createView("Links", {
            toolbar: this.toolbar.toolbar,
          })
        },

        SetDisabled: function (state) {
          this.view?.SetDisabled(state)
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
          let header_locked = false
          let image_locked = false
          let in_header = false
          let in_equation = false
          let in_image = false
          let in_image_inline = false
          let in_table = false
          let in_para = false
          let frame_pr = null
          let object_type

          while (++i < selectedObjects.length) {
            type = selectedObjects[i].get_ObjectType()
            pr = selectedObjects[i].get_ObjectValue()

            if (type === Asc.c_oAscTypeSelectElement.Paragraph) {
              paragraph_locked = pr.get_Locked()
              frame_pr = pr
              in_para = true
            } else if (type === Asc.c_oAscTypeSelectElement.Header) {
              header_locked = pr.get_Locked()
              in_header = true
            } else if (type === Asc.c_oAscTypeSelectElement.Image) {
              in_image = true
              in_image_inline = pr.get_WrappingStyle() === Asc.c_oAscWrapStyle2.Inline
              object_type = type
              image_locked = pr.get_Locked()
            } else if (type === Asc.c_oAscTypeSelectElement.Math) {
              in_equation = true
              object_type = type
            } else if (type === Asc.c_oAscTypeSelectElement.Table) {
              in_table = true
              object_type = type
            }
          }
          this._state.in_object = object_type

          const control_props = this.api.asc_IsContentControl()
            ? this.api.asc_GetContentControlProperties()
            : null
          const control_plain = control_props
            ? control_props.get_ContentControlType() === Asc.c_oAscSdtLevelType.Inline
            : false
          const lock_type = control_props
            ? control_props.get_Lock()
            : Asc.c_oAscSdtLockType.Unlocked
          const content_locked =
            lock_type === Asc.c_oAscSdtLockType.SdtContentLocked ||
            lock_type === Asc.c_oAscSdtLockType.ContentLocked
          const rich_del_lock = frame_pr ? !frame_pr.can_DeleteBlockContentControl() : false
          const rich_edit_lock = frame_pr ? !frame_pr.can_EditBlockContentControl() : false
          const plain_del_lock = frame_pr ? !frame_pr.can_DeleteInlineContentControl() : false
          const plain_edit_lock = frame_pr ? !frame_pr.can_EditInlineContentControl() : false

          this.lockToolbar(Common.enumLock.paragraphLock, paragraph_locked, {
            array: this.view.btnsNotes
              .concat(this.view.btnsHyperlink)
              .concat([
                this.view.btnBookmarks,
                this.view.btnTableFiguresUpdate,
                this.view.btnCrossRef,
              ]),
          })
          this.lockToolbar(Common.enumLock.inHeader, in_header, {
            array: this.view.btnsNotes
              .concat(this.view.btnsContents)
              .concat([
                this.view.btnBookmarks,
                this.view.btnTableFigures,
                this.view.btnTableFiguresUpdate,
                this.view.btnCaption,
              ]),
          })
          this.lockToolbar(Common.enumLock.controlPlain, control_plain, {
            array: this.view.btnsNotes.concat([this.view.btnBookmarks, this.view.btnCrossRef]),
          })
          this.lockToolbar(Common.enumLock.richEditLock, rich_edit_lock, {
            array: this.view.btnsNotes
              .concat(this.view.btnsContents)
              .concat([
                this.view.btnTableFigures,
                this.view.btnTableFiguresUpdate,
                this.view.btnCrossRef,
              ]),
          })
          this.lockToolbar(Common.enumLock.plainEditLock, plain_edit_lock, {
            array: this.view.btnsNotes
              .concat(this.view.btnsContents)
              .concat([
                this.view.btnTableFigures,
                this.view.btnTableFiguresUpdate,
                this.view.btnCrossRef,
              ]),
          })
          this.lockToolbar(Common.enumLock.headerLock, header_locked, {
            array: this.view.btnsHyperlink.concat([this.view.btnBookmarks, this.view.btnCrossRef]),
          })
          this.lockToolbar(Common.enumLock.inEquation, in_equation, { array: this.view.btnsNotes })
          this.lockToolbar(Common.enumLock.inImage, in_image, { array: this.view.btnsNotes })
          this.lockToolbar(Common.enumLock.richDelLock, rich_del_lock, {
            array: this.view.btnsContents.concat([
              this.view.btnTableFigures,
              this.view.btnTableFiguresUpdate,
            ]),
          })
          this.lockToolbar(Common.enumLock.plainDelLock, plain_del_lock, {
            array: this.view.btnsContents.concat([
              this.view.btnTableFigures,
              this.view.btnTableFiguresUpdate,
            ]),
          })
          this.lockToolbar(Common.enumLock.contentLock, content_locked, {
            array: [this.view.btnCrossRef],
          })
          this.lockToolbar(
            Common.enumLock.cantUpdateTOF,
            !this.api.asc_CanUpdateTablesOfFigures(),
            { array: [this.view.btnTableFiguresUpdate] },
          )
          this.lockToolbar(
            Common.enumLock.inFootnote,
            this.api.asc_IsCursorInFootnote() || this.api.asc_IsCursorInEndnote(),
            { array: [this.view.btnAddText] },
          )
          this.lockToolbar(Common.enumLock.inHeader, in_header, { array: [this.view.btnAddText] })
          this.lockToolbar(
            Common.enumLock.cantAddTextTOF,
            in_image && !in_image_inline && !in_para,
            { array: [this.view.btnAddText] },
          )
          this.lockToolbar(Common.enumLock.imageLock, image_locked, {
            array: this.view.btnsHyperlink,
          })

          this.dlgCrossRefDialog?.isVisible() &&
            this.dlgCrossRefDialog.setLocked(this.view.btnCrossRef.isDisabled())
        },

        lockToolbar: function (causes, lock, opts) {
          this.view && Common.Utils.lockControls(causes, lock, opts, this.view.getButtons())
        },

        onApiCanAddHyperlink: function (value) {
          this.toolbar.editMode &&
            this.lockToolbar(Common.enumLock.hyperlinkLock, !value, {
              array: this.view.btnsHyperlink,
            })
        },

        onHyperlinkClick: function (btn) {
          let win
          let props
          let text

          if (this.api) {
            const handlerDlg = (dlg, result) => {
              if (result === "ok") {
                props = dlg.getSettings()
                text !== false ? this.api.add_Hyperlink(props) : this.api.change_Hyperlink(props)
              }

              Common.NotificationCenter.trigger("edit:complete", this.toolbar)
            }

            text = this.api.can_AddHyperlink()

            if (text !== false) {
              win = new DE.Views.HyperlinkSettingsDialog({
                api: this.api,
                appOptions: this.toolbar.appOptions,
                handler: handlerDlg,
              })

              props = new Asc.CHyperlinkProperty()
              props.put_Text(text)

              win.show()
              win.setSettings(props)
            } else {
              const selectedElements = this.api.getSelectedElements()
              if (selectedElements && _.isArray(selectedElements)) {
                _.each(selectedElements, (el, i) => {
                  if (
                    selectedElements[i].get_ObjectType() === Asc.c_oAscTypeSelectElement.Hyperlink
                  )
                    props = selectedElements[i].get_ObjectValue()
                })
              }
              if (props) {
                win = new DE.Views.HyperlinkSettingsDialog({
                  api: this.api,
                  appOptions: this.toolbar.appOptions,
                  handler: handlerDlg,
                })
                win.show()
                win.setSettings(props)
              }
            }
          }

          Common.component.Analytics.trackEvent("ToolBar", "Add Hyperlink")
        },

        onTableContents: function (type, currentTOC) {
          currentTOC = !!currentTOC
          let props = this.api.asc_GetTableOfContentsPr(currentTOC)
          switch (type) {
            case 0:
              if (!props) {
                props = new Asc.CTableOfContentsPr()
                props.put_OutlineRange(1, 9)
              }
              props.put_Hyperlink(true)
              props.put_ShowPageNumbers(true)
              props.put_RightAlignTab(true)
              props.put_TabLeader(Asc.c_oAscTabLeader.Dot)
              currentTOC
                ? this.api.asc_SetTableOfContentsPr(props)
                : this.api.asc_AddTableOfContents(null, props)
              break
            case 1:
              if (!props) {
                props = new Asc.CTableOfContentsPr()
                props.put_OutlineRange(1, 9)
              }
              props.put_Hyperlink(true)
              props.put_ShowPageNumbers(false)
              props.put_TabLeader(Asc.c_oAscTabLeader.None)
              props.put_StylesType(Asc.c_oAscTOCStylesType.Web)
              currentTOC
                ? this.api.asc_SetTableOfContentsPr(props)
                : this.api.asc_AddTableOfContents(null, props)
              break
            case "settings": {
              const win = new DE.Views.TableOfContentsSettings({
                api: this.api,
                props: props,
                type: 0,
                handler: (result, value) => {
                  if (result === "ok") {
                    props
                      ? this.api.asc_SetTableOfContentsPr(value)
                      : this.api.asc_AddTableOfContents(null, value)
                  }
                  Common.NotificationCenter.trigger("edit:complete", this.toolbar)
                },
              })
              win.show()
              break
            }
            case "remove":
              currentTOC = currentTOC && props ? props.get_InternalClass() : undefined
              this.api.asc_RemoveTableOfContents(currentTOC)
              break
          }
          Common.NotificationCenter.trigger("edit:complete", this.toolbar)
        },

        onTableContentsUpdate: function (type, currentTOC) {
          const props = this.api.asc_GetTableOfContentsPr(currentTOC)
          if (currentTOC && props) currentTOC = props.get_InternalClass()
          this.api.asc_UpdateTableOfContents(type === "pages", currentTOC)
          Common.NotificationCenter.trigger("edit:complete", this.toolbar)
        },

        onTableContentsOpen: function (menu) {
          this.api.asc_getButtonsTOC(
            menu.items[0].options.previewId,
            menu.items[1].options.previewId,
          )
        },

        onAddTextOpen: function (menu) {
          const props = this.api.asc_GetTableOfContentsPr()
          let end = props ? props.get_OutlineEnd() : 3
          end < 0 && (end = 9)
          this.view.fillAddTextMenu(menu, end, this.api.asc_GetCurrentLevelTOC())
        },

        onAddText: function (value) {
          this.api.asc_AddParagraphToTOC(value)
        },

        onNotesClick: function (type) {
          switch (type) {
            case "ins_footnote":
              this.api.asc_AddFootnote()
              break
            case "ins_endnote":
              this.api.asc_AddEndnote()
              break
            case "delele":
              new DE.Views.NotesRemoveDialog({
                handler: (dlg, result) => {
                  if (result === "ok") {
                    const settings = dlg.getSettings()
                    ;(settings.footnote || settings.endnote) &&
                      this.api.asc_RemoveAllFootnotes(settings.footnote, settings.endnote)
                  }
                  Common.NotificationCenter.trigger("edit:complete", this.toolbar)
                },
              }).show()
              break
            case "settings": {
              let isEndNote = this.api.asc_IsCursorInEndnote()
              const isFootNote = this.api.asc_IsCursorInFootnote()
              isEndNote =
                isEndNote || isFootNote
                  ? isEndNote
                  : Common.Utils.InternalSettings.get("de-settings-note-last") || false
              new DE.Views.NoteSettingsDialog({
                api: this.api,
                handler: (result, settings) => {
                  if (settings) {
                    settings.isEndNote
                      ? this.api.asc_SetEndnoteProps(settings.props, settings.applyToAll)
                      : this.api.asc_SetFootnoteProps(settings.props, settings.applyToAll)
                    if (result === "insert")
                      setTimeout(() => {
                        settings.isEndNote
                          ? this.api.asc_AddEndnote(settings.custom)
                          : this.api.asc_AddFootnote(settings.custom)
                      }, 1)
                    if (result === "insert" || result === "apply") {
                      Common.Utils.InternalSettings.set("de-settings-note-last", settings.isEndNote)
                    }
                  }
                  Common.NotificationCenter.trigger("edit:complete", this.toolbar)
                },
                isEndNote: isEndNote,
                hasSections: this.api.asc_GetSectionsCount() > 1,
                props: isEndNote ? this.api.asc_GetEndnoteProps() : this.api.asc_GetFootnoteProps(),
              }).show()
              break
            }
            case "prev":
              this.api.asc_GotoFootnote(false)
              setTimeout(() => {
                Common.NotificationCenter.trigger("edit:complete", this.toolbar)
              }, 50)
              break
            case "next":
              this.api.asc_GotoFootnote(true)
              setTimeout(() => {
                Common.NotificationCenter.trigger("edit:complete", this.toolbar)
              }, 50)
              break
            case "prev-end":
              this.api.asc_GotoEndnote(false)
              setTimeout(() => {
                Common.NotificationCenter.trigger("edit:complete", this.toolbar)
              }, 50)
              break
            case "next-end":
              this.api.asc_GotoEndnote(true)
              setTimeout(() => {
                Common.NotificationCenter.trigger("edit:complete", this.toolbar)
              }, 50)
              break
            case "to-endnotes":
              this.api.asc_ConvertFootnoteType(false, true, false)
              setTimeout(() => {
                Common.NotificationCenter.trigger("edit:complete", this.toolbar)
              }, 50)
              break
            case "to-footnotes":
              this.api.asc_ConvertFootnoteType(false, false, true)
              setTimeout(() => {
                Common.NotificationCenter.trigger("edit:complete", this.toolbar)
              }, 50)
              break
            case "swap":
              this.api.asc_ConvertFootnoteType(false, true, true)
              setTimeout(() => {
                Common.NotificationCenter.trigger("edit:complete", this.toolbar)
              }, 50)
              break
          }
        },

        onBookmarksClick: function (btn) {
          new DE.Views.BookmarksDialog({
            api: this.api,
            appOptions: this.toolbar.appOptions,
            props: this.api.asc_GetBookmarksManager(),
            handler: (result, settings) => {
              if (settings) {
              }
              Common.NotificationCenter.trigger("edit:complete", this.toolbar)
            },
          }).show()
        },

        onCaptionClick: function (btn) {
          new DE.Views.CaptionDialog({
            objectType: this._state.in_object,
            handler: (result, settings) => {
              if (result === "ok") {
                this.api.asc_AddObjectCaption(settings)
              }
              Common.NotificationCenter.trigger("edit:complete", this.toolbar)
            },
          }).show()
        },

        onShowTOCActions: function (obj, x, y) {
          const action = obj.button
          const menu =
            action === AscCommon.CCButtonType.Toc
              ? this.view.contentsUpdateMenu
              : this.view.contentsMenu
          const documentHolder = this.getApplication().getController("DocumentHolder")
          const documentHolderView = documentHolder.getView()
          let menuContainer = documentHolderView.cmpEl.find(
            Common.Utils.String.format("#menu-container-{0}", menu.id),
          )

          if (!menu) return
          this._fromShowContentControls = true
          Common.UI.Menu.Manager.hideAll()

          if (!menu.rendered) {
            // Prepare menu container
            if (menuContainer.length < 1) {
              menuContainer = $(
                Common.Utils.String.format(
                  '<div id="menu-container-{0}" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>',
                  menu.id,
                ),
              )
              documentHolderView.cmpEl.append(menuContainer)
            }

            menu.render(menuContainer)
            menu.cmpEl.attr({ tabindex: "-1" })
            menu.on("hide:after", () => {
              if (!this._fromShowContentControls) this.api.asc_UncheckContentControlButtons()
            })
          }

          menuContainer.css({ left: x, top: y })
          menuContainer.attr("data-value", "prevent-canvas-click")
          documentHolder._preventClick = true
          menu.show()

          menu.alignPosition()
          _.delay(() => {
            menu.cmpEl.focus()
          }, 10)
          this._fromShowContentControls = false
        },

        onHideContentControlsActions: function () {
          this.view.contentsMenu?.hide()
          this.view.contentsUpdateMenu?.hide()
        },

        onShowContentControlsActions: function (obj, x, y) {
          obj.type === Asc.c_oAscContentControlSpecificType.TOC && this.onShowTOCActions(obj, x, y)
        },

        onCrossRefClick: function (btn) {
          if (this.dlgCrossRefDialog?.isVisible()) return
          this.dlgCrossRefDialog = new DE.Views.CrossReferenceDialog({
            api: this.api,
            crossRefProps: this.crossRefProps,
            handler: (result, settings) => {
              if (result !== "ok") Common.NotificationCenter.trigger("edit:complete", this.toolbar)
            },
          })
          this.dlgCrossRefDialog.on("close", (obj) => {
            this.crossRefProps = this.dlgCrossRefDialog.getSettings()
            Common.NotificationCenter.trigger("edit:complete", this.toolbar)
          })
          this.dlgCrossRefDialog.show()
        },

        onTableFigures: function () {
          const props = this.api.asc_GetTableOfFiguresPr()
          const win = new DE.Views.TableOfContentsSettings({
            api: this.api,
            props: props,
            type: 1,
            handler: (result, value) => {
              if (result === "ok") {
                this.api.asc_AddTableOfFigures(value)
              }
              Common.NotificationCenter.trigger("edit:complete", this.toolbar)
            },
          })
          win.show()
          Common.NotificationCenter.trigger("edit:complete", this.toolbar)
        },

        onTableFiguresUpdate: function () {
          this.api.asc_UpdateTablesOfFigures()
          Common.NotificationCenter.trigger("edit:complete", this.toolbar)
        },

        onAscReplaceCurrentTOF: function (apiCallback) {
          Common.UI.warning({
            msg: this.view.confirmReplaceTOF,
            buttons: ["yes", "no", "cancel"],
            primary: "yes",
            minwidth: 320,
            callback: _.bind(function (btn) {
              if (btn === "yes" || btn === "no") {
                apiCallback?.(btn === "yes")
              }
              Common.NotificationCenter.trigger("edit:complete", this.toolbar)
            }, this),
          })
        },

        onAscTOFUpdate: function (apiCallback) {
          new Common.Views.OptionsDialog({
            width: 300,
            title: this.view.titleUpdateTOF,
            items: [
              { caption: this.view.textUpdatePages, value: true, checked: true },
              { caption: this.view.textUpdateAll, value: false, checked: false },
            ],
            handler: (dlg, result) => {
              if (result === "ok") {
                apiCallback?.(dlg.getSettings())
              }
              Common.NotificationCenter.trigger("edit:complete", this.toolbar)
            },
          }).show()
        },

        onChangeProtectDocument: function (props) {
          if (!props) {
            const docprotect = this.getApplication().getController("DocProtection")
            props = docprotect ? docprotect.getDocProps() : null
          }
          if (props) {
            this._state.docProtection = props
            this.lockToolbar(Common.enumLock.docLockView, props.isReadOnly)
            this.lockToolbar(Common.enumLock.docLockForms, props.isFormsOnly)
            this.lockToolbar(Common.enumLock.docLockReview, props.isReviewOnly)
            this.lockToolbar(Common.enumLock.docLockComments, props.isCommentsOnly)
          }
        },

        onAppReady: function (config) {
          new Promise((accept, reject) => {
            accept()
          }).then(() => {
            if (this.view) {
              this.view.onAppReady(config)
              this.onChangeProtectDocument()
            }
          })
        },
      },
      DE.Controllers.Links || {},
    ),
  )
})
