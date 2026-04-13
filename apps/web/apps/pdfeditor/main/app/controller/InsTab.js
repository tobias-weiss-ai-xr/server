/*
 * (c) Copyright Ascensio System SIA 2010-2023
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
 *  InsTab.js
 *
 *  Created on 12.03.2024
 *
 */

define([
  "core",
  "pdfeditor/main/app/view/InsTab",
  "pdfeditor/main/app/collection/ShapeGroups",
  "pdfeditor/main/app/collection/EquationGroups",
], () => {
  PDFE.Controllers.InsTab = Backbone.Controller.extend(
    _.extend(
      {
        models: [],
        collections: ["ShapeGroups", "EquationGroups"],
        views: ["InsTab"],
        sdkViewName: "#id_main",

        initialize: () => {},

        onLaunch: function () {
          this._state = {}

          Common.NotificationCenter.on("app:ready", this.onAppReady.bind(this))
          Common.NotificationCenter.on("document:ready", _.bind(this.onDocumentReady, this))

          this.binding = {
            checkInsertAutoshape: _.bind(this.checkInsertAutoshape, this),
            checkInsertHyperlinkAnnot: _.bind(this.checkInsertHyperlinkAnnot, this),
          }
          PDFE.getCollection("ShapeGroups").bind({
            reset: this.onResetAutoshapes.bind(this),
          })
        },

        setApi: function (api) {
          if (api) {
            this.api = api
            this.api.asc_registerCallback(
              "asc_onCoAuthoringDisconnect",
              _.bind(this.onCoAuthoringDisconnect, this),
            )
            Common.NotificationCenter.on(
              "api:disconnect",
              _.bind(this.onCoAuthoringDisconnect, this),
            )
            this.api.asc_registerCallback("asc_onEndAddShape", _.bind(this.onApiEndAddShape, this)) //for shapes
            this.api.asc_registerCallback("asc_onTextLanguage", _.bind(this.onTextLanguage, this))
            this.api.asc_registerCallback(
              "asc_onBeginSmartArtPreview",
              _.bind(this.onApiBeginSmartArtPreview, this),
            )
            this.api.asc_registerCallback(
              "asc_onAddSmartArtPreview",
              _.bind(this.onApiAddSmartArtPreview, this),
            )
            this.api.asc_registerCallback(
              "asc_onEndSmartArtPreview",
              _.bind(this.onApiEndSmartArtPreview, this),
            )
            this.api.asc_registerCallback("asc_onFocusObject", _.bind(this.onApiFocusObject, this))
            this.api.asc_registerCallback(
              "asc_onCanAddHyperlink",
              _.bind(this.onApiCanAddHyperlink, this),
            )
            this.api.asc_registerCallback("asc_onLinkToolState", _.bind(this.onLinkToolState, this))
            this.api.asc_registerCallback(
              "asc_onDialogAddAnnotLink",
              _.bind(this.onDialogAddAnnotLink, this),
            )
            Common.NotificationCenter.on(
              "storage:image-load",
              _.bind(this.openImageFromStorage, this),
            )
            Common.NotificationCenter.on(
              "storage:image-insert",
              _.bind(this.insertImageFromStorage, this),
            )
            Common.Gateway.on("insertimage", _.bind(this.insertImage, this))
          }
          return this
        },

        setConfig: function (config) {
          this.mode = config.mode
          this.toolbar = config.toolbar
          this.view = this.createView("InsTab", {
            toolbar: this.toolbar.toolbar,
            mode: this.mode,
            compactToolbar: this.toolbar.toolbar.isCompactView,
          })
          this.addListeners({
            InsTab: {
              "insert:image": this.onInsertImageClick.bind(this),
              "insert:text-btn": this.onBtnInsertTextClick.bind(this),
              "insert:text-menu": this.onMenuInsertTextClick.bind(this),
              "insert:textart": this.onInsertTextart.bind(this),
              "insert:shape": this.onInsertShape.bind(this),
              "insert:page": this.onAddPage.bind(this),
              "insert:chart": this.onSelectChart,
              // 'insert:header'     : this.onEditHeaderClick,
              "insert:hyperlink": this.onHyperlinkClick,
              "insert:table": this.onInsertTableClick,
              "insert:equation": this.onInsertEquationClick,
              "insert:symbol": this.onInsertSymbolClick,
              "insert:smartart": this.onInsertSmartArt,
              "smartart:mouseenter": this.mouseenterSmartArt,
              "smartart:mouseleave": this.mouseleaveSmartArt,
            },
            Toolbar: {
              "tab:active": _.bind(this.onActiveTab, this),
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
          Common.Utils.lockControls(Common.enumLock.lostConnect, true, {
            array: this.view.lockedControls,
          })
        },

        onAppReady: function (config) {
          if (this.view && config.isPDFEdit) {
            new Promise((accept, reject) => {
              accept()
            }).then(() => {
              this.view.onAppReady(config)
              this.view.setEvents()
              this.onApiMathTypes()
            })
          }
        },

        onDocumentReady: function () {
          if (this.mode?.isPDFEdit) {
            const shapes = this.api.asc_getPropertyEditorShapes()
            shapes && this.fillAutoShapes(shapes[0], shapes[1])
            Common.Utils.lockControls(Common.enumLock.disableOnStart, false, {
              array: this.view.lockedControls,
            })
          }
        },

        initNames: function () {
          this.shapeGroupNames = [
            this.txtBasicShapes,
            this.txtFiguredArrows,
            this.txtMath,
            this.txtCharts,
            this.txtStarsRibbons,
            this.txtCallouts,
            this.txtButtons,
            this.txtRectangles,
            this.txtLines,
          ]
        },

        fillAutoShapes: function (groupNames, shapes) {
          if (_.isEmpty(shapes) || _.isEmpty(groupNames) || shapes.length !== groupNames.length)
            return

          this.initNames()
          const shapegrouparray = []
          const name_arr = {}

          _.each(groupNames, (groupName, index) => {
            const store = new Backbone.Collection([], {
              model: PDFE.Models.ShapeModel,
            })
            const arr = []

            const cols = shapes[index].length > 18 ? 7 : 6
            const height = Math.ceil(shapes[index].length / cols) * 35 + 3
            const width = 30 * cols

            _.each(shapes[index], (shape, idx) => {
              const name = this[`txtShape_${shape.Type}`]
              arr.push({
                data: { shapeType: shape.Type },
                tip: name || `${this.textShape} ${idx + 1}`,
                allowSelected: true,
                selected: false,
              })
              if (name) name_arr[shape.Type] = name
            })
            store.add(arr)
            shapegrouparray.push({
              groupName: this.shapeGroupNames[index],
              groupStore: store,
              groupWidth: width,
              groupHeight: height,
            })
          })

          this.getCollection("ShapeGroups").reset(shapegrouparray)
          this.api.asc_setShapeNames(name_arr)
        },

        checkInsertAutoshape: function (e) {
          const cmp = $(e.target)
          const cmp_sdk = cmp.closest("#editor_sdk")
          let btn_id = cmp.closest("button").attr("id")
          if (btn_id === undefined) btn_id = cmp.closest(".btn-group").attr("id")
          if (btn_id === undefined) btn_id = cmp.closest(".combo-dataview").attr("id")

          if (cmp.attr("id") !== "editor_sdk" && cmp_sdk.length <= 0) {
            if (
              (this.view.btnsInsertText.pressed() && !this.view.btnsInsertText.contains(btn_id)) ||
              (this.view.btnsInsertShape.pressed() &&
                !this.view.btnsInsertShape.contains(btn_id)) ||
              (this.view.cmbInsertShape.isComboViewRecActive() &&
                this.view.cmbInsertShape.id !== btn_id)
            ) {
              this._isAddingShape = false

              this._addAutoshape(false)
              this.view.btnsInsertShape.toggle(false, true)
              this.view.btnsInsertText.toggle(false, true)
              this.view.cmbInsertShape.deactivateRecords()
              Common.NotificationCenter.trigger("edit:complete", this.toolbar)
            } else if (
              this.view.btnsInsertShape.pressed() &&
              this.view.btnsInsertShape.contains(btn_id)
            ) {
              _.defer(() => {
                this.api.StartAddShape("", false)
                Common.NotificationCenter.trigger("edit:complete", this.toolbar)
              }, 100)
            }
          }
        },

        onApiEndAddShape: function () {
          this.view.fireEvent("insertshape", this.view)

          if (this.view.btnsInsertShape.pressed()) this.view.btnsInsertShape.toggle(false, true)

          if (this.view.btnsInsertText.pressed()) {
            this.view.btnsInsertText.toggle(false, true)
            this.view.btnsInsertText.forEach((button) => {
              button.menu.clearAll(true)
            })
          }

          if (this.view.cmbInsertShape.isComboViewRecActive())
            this.view.cmbInsertShape.deactivateRecords()

          $(document.body).off("mouseup", this.binding.checkInsertAutoshape)
        },

        _addAutoshape: function (isstart, type) {
          if (this.api) {
            if (isstart) {
              this.api.StartAddShape(type, true)
              $(document.body).on("mouseup", this.binding.checkInsertAutoshape)
            } else {
              this.api.StartAddShape("", false)
              $(document.body).off("mouseup", this.binding.checkInsertAutoshape)
            }
          }
        },

        onResetAutoshapes: function () {
          const collection = PDFE.getCollection("ShapeGroups")
          const onShowBefore = (menu) => {
            this.view.updateAutoshapeMenu(menu, collection)
            menu.off("show:before", onShowBefore)
          }
          this.view.btnsInsertShape.forEach((btn, index) => {
            btn.menu.on("show:before", onShowBefore)
          })
          const onComboShowBefore = (menu) => {
            this.view.updateComboAutoshapeMenu(collection)
            menu.off("show:before", onComboShowBefore)
          }
          this.view.cmbInsertShape.openButton.menu.on("show:before", onComboShowBefore)
          this.view.cmbInsertShape.fillComboView(collection)
          this.view.cmbInsertShape.on("click", (btn, record, cancel) => {
            if (cancel) {
              this._addAutoshape(false)
              return
            }
            if (record) {
              this.view.cmbInsertShape.updateComboView(record)
              this.onInsertShape(record.get("data").shapeType)
            }
          })
        },

        onLinkToolState: function (state) {
          this.view?.btnInsertHyperlink.toggle(state, true)
        },

        onHyperlinkClick: function () {
          let win
          let props
          let text

          if (this._state.no_paragraph) {
            //add hyperlink annotation
            if (this.view.btnInsertHyperlink.pressed) {
              this.api.SetLinkTool(true)
              $(document.body).on("mouseup", this.binding.checkInsertHyperlinkAnnot)
            } else {
              this.api.SetLinkTool(false)
              $(document.body).off("mouseup", this.binding.checkInsertHyperlinkAnnot)
            }
            return
          }

          if (this.api) {
            // add hyperlink to text in shape
            this.view.btnInsertHyperlink.toggle(false, true)
            const handlerDlg = (dlg, result) => {
              if (result === "ok") {
                props = dlg.getSettings()
                text !== false ? this.api.add_Hyperlink(props) : this.api.change_Hyperlink(props)
              }

              Common.NotificationCenter.trigger("edit:complete", this.view)
            }

            text = this.api.can_AddHyperlink()

            const _arr = []
            for (let i = 0; i < this.api.getCountPages(); i++) {
              _arr.push({
                displayValue: i + 1,
                value: i,
              })
            }
            if (text !== false) {
              props = new Asc.CHyperlinkProperty()
              props.put_Text(text)
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
            }
            if (props) {
              win = new PDFE.Views.HyperlinkSettingsDialog({
                api: this.api,
                appOptions: this.mode,
                handler: handlerDlg,
                slides: _arr,
              })
              win.show()
              win.setSettings(props)
            }
          }

          Common.component.Analytics.trackEvent("ToolBar", "Add Hyperlink")
        },

        onDialogAddAnnotLink: function (arrIds) {
          $(document.body).off("mouseup", this.binding.checkInsertHyperlinkAnnot)

          if (!this.api) return

          const statusbarController = this.getApplication().getController("Statusbar")
          const stateBeforeOpenDlg = {
            zoom: statusbarController.getZoom(),
            scroll: this.api.getCurScroll(),
          }
          let res
          const handlerDlg = (dlg, result) => {
            res = result
            if (result === "ok") {
              this.api.add_Hyperlink(dlg.getSettings(), arrIds)
            } else if (result === "view") {
              this.api.SetLinkAnnotGoToAction(arrIds)
            }
            Common.NotificationCenter.trigger("edit:complete", this.view)
          }
          const _arr = []
          for (let i = 0; i < this.api.getCountPages(); i++) {
            _arr.push({
              displayValue: i + 1,
              value: i,
            })
          }
          const win = new PDFE.Views.HyperlinkSettingsDialog({
            api: this.api,
            appOptions: this.mode,
            isAnnotation: true,
            handler: handlerDlg,
            slides: _arr,
          }).on("close", () => {
            //Restore zoom and scroll state
            const currentScroll = this.api.getCurScroll()
            if (statusbarController.getZoom() !== stateBeforeOpenDlg.zoom) {
              this.api.zoom(stateBeforeOpenDlg.zoom)
            }
            if (
              Math.abs(currentScroll.x - stateBeforeOpenDlg.scroll.x) > 1 ||
              Math.abs(currentScroll.y - stateBeforeOpenDlg.scroll.y) > 1
            ) {
              this.api.scrollToXY(stateBeforeOpenDlg.scroll.x, stateBeforeOpenDlg.scroll.y)
            }

            const closedWithCreation = res === "ok" || res === "view"
            if (closedWithCreation) {
              this.api.asc_selectComment(arrIds)
            }
            this.api.EndLinkAnnotCreation(closedWithCreation)
          })
          win.show()
          win.setSettings()
        },

        checkInsertHyperlinkAnnot: function (e) {
          const cmp = $(e.target)
          const cmp_sdk = cmp.closest("#editor_sdk")
          let btn_id = cmp.closest("button").attr("id")
          if (btn_id === undefined) btn_id = cmp.closest(".btn-group").attr("id")
          if (cmp.attr("id") !== "editor_sdk" && cmp_sdk.length <= 0) {
            if (
              this.view.btnInsertHyperlink.pressed &&
              this.view.btnInsertHyperlink.id !== btn_id
            ) {
              this.api.SetLinkTool(false)
              $(document.body).off("mouseup", this.binding.checkInsertHyperlinkAnnot)
              this.view.btnInsertHyperlink.toggle(false, true)
              Common.NotificationCenter.trigger("edit:complete", this.view)
            }
          }
        },

        onInsertTableClick: function (type, columns, rows) {
          if (type === "picker") {
            this.view.fireEvent("inserttable", this.view)
            this.api.put_Table(columns, rows)
          } else if (type === "custom") {
            new Common.Views.InsertTableDialog({
              handler: (result, value) => {
                if (result === "ok") {
                  if (this.api) {
                    this.view.fireEvent("inserttable", this.view)

                    this.api.put_Table(value.columns, value.rows)
                  }

                  Common.component.Analytics.trackEvent("ToolBar", "Table")
                }
                Common.NotificationCenter.trigger("edit:complete", this.view)
              },
            }).show()
          } else if (type === "sse") {
            const oleEditor = this.getApplication()
              .getController("Common.Controllers.ExternalOleEditor")
              .getView("Common.Views.ExternalOleEditor")
            if (oleEditor) {
              oleEditor.setEditMode(false)
              oleEditor.show()
              oleEditor.setOleData("empty")
            }
          }
        },

        onInsertImageClick: function (opts, e) {
          const me = this
          if (opts === "file") {
            me.view.fireEvent("insertimage", this.view)

            setTimeout(() => {
              me.api.asc_addImage()
            }, 1)

            Common.NotificationCenter.trigger("edit:complete", this.view)
            Common.component.Analytics.trackEvent("ToolBar", "Image")
          } else if (opts === "url") {
            new Common.Views.ImageFromUrlDialog({
              handler: function (result, value) {
                if (result === "ok") {
                  if (me.api) {
                    const checkUrl = value.replace(/ /g, "")
                    if (!_.isEmpty(checkUrl)) {
                      me.view.fireEvent("insertimage", me.view)
                      me.api.AddImageUrl([checkUrl])

                      Common.component.Analytics.trackEvent("ToolBar", "Image")
                    } else {
                      Common.UI.warning({
                        msg: this.textEmptyImgUrl,
                      })
                    }
                  }

                  Common.NotificationCenter.trigger("edit:complete", me.view)
                }
              },
            }).show()
          } else if (opts === "storage") {
            Common.NotificationCenter.trigger("storage:image-load", "add")
          }
        },

        openImageFromStorage: function (type) {
          if (this.mode.canRequestInsertImage) {
            Common.Gateway.requestInsertImage(type)
          } else {
            new Common.Views.SelectFileDlg({
              fileChoiceUrl: this.mode.fileChoiceUrl
                .replace("{fileExt}", "")
                .replace("{documentType}", "ImagesOnly"),
            })
              .on("selectfile", (obj, file) => {
                file && (file.c = type)
                !file.images && (file.images = [{ fileType: file.fileType, url: file.url }]) // SelectFileDlg uses old format for inserting image
                file.url = null
                this.insertImage(file)
              })
              .show()
          }
        },

        insertImageFromStorage: function (data) {
          if (data?._urls && (!data.c || data.c === "add")) {
            this.view.fireEvent("insertimage", this.view)
            data._urls.length > 0 && this.api.AddImageUrl(data._urls, undefined, data.token) // for loading from storage
            Common.component.Analytics.trackEvent("ToolBar", "Image")
          }
        },

        insertImage: (data) => {
          // gateway
          if (data && (data.url || data.images)) {
            data.url &&
              console.log(
                "Obsolete: The 'url' parameter of the 'insertImage' method is deprecated. Please use 'images' parameter instead.",
              )

            const arr = []
            if (data.images && data.images.length > 0) {
              for (let i = 0; i < data.images.length; i++) {
                data.images[i]?.url && arr.push(data.images[i].url)
              }
            } else data.url && arr.push(data.url)
            data._urls = arr
          }
          Common.NotificationCenter.trigger("storage:image-insert", data)
        },

        onBtnInsertTextClick: function (btn, e) {
          btn.menu.getItems(true).forEach((item) => {
            if (item.value === btn.options.textboxType) item.setChecked(true)
          })
          if (!btn.pressed) {
            btn.menu.clearAll(true)
          }
          this.onInsertText(btn.options.textboxType, btn, e)
        },

        onMenuInsertTextClick: function (btn, e) {
          const oldType = btn.options.textboxType
          const newType = e.value

          btn.toggle(true)
          if (newType !== oldType) {
            this.view.btnsInsertText.forEach((button) => {
              button.updateHint([e.caption, this.views.tipInsertText])
              button.changeIcon({
                next: e.options.iconClsForMainBtn,
                curr: button.menu.getItems(true).filter((item) => item.value === oldType)[0].options
                  .iconClsForMainBtn,
              })
              button.options.textboxType = newType
            })
          }
          this.onInsertText(newType, btn, e)
        },

        onInsertText: function (type, btn, e) {
          if (this.api) this._addAutoshape(btn.pressed, type)

          if (this.view.btnsInsertShape.pressed()) this.view.btnsInsertShape.toggle(false, true)

          Common.NotificationCenter.trigger("edit:complete", this.view)
          Common.component.Analytics.trackEvent("ToolBar", "Add Text")
        },

        onInsertShape: function (type) {
          if (type === "menu:hide") {
            if (this.view.btnsInsertShape.pressed() && !this._isAddingShape) {
              this.view.btnsInsertShape.toggle(false, true)
            }
            this._isAddingShape = false

            Common.NotificationCenter.trigger("edit:complete", this.view)
          } else {
            this._addAutoshape(true, type)
            this._isAddingShape = true

            if (this.view.btnsInsertText.pressed()) this.view.btnsInsertText.toggle(false, true)

            Common.NotificationCenter.trigger("edit:complete", this.view)
            Common.component.Analytics.trackEvent("ToolBar", "Add Shape")
          }
        },

        onInsertTextart: function (data) {
          this.view.fireEvent("inserttextart", this.view)
          this.api.AddTextArt(data)

          if (this.view.btnsInsertShape.pressed()) this.view.btnsInsertShape.toggle(false, true)

          Common.NotificationCenter.trigger("edit:complete", this.view)
          Common.component.Analytics.trackEvent("ToolBar", "Add Text Art")
        },

        onEditHeaderClick: function (type, e) {
          const selectedElements = this.api.getSelectedElements()
          let in_text = false

          for (let i = 0; i < selectedElements.length; i++) {
            if (selectedElements[i].get_ObjectType() === Asc.c_oAscTypeSelectElement.Paragraph) {
              in_text = true
              break
            }
          }
          if (in_text && type === "slidenum") {
            this.api.asc_addPageNumber()
          } else if (in_text && type === "datetime") {
            new PDFE.Views.DateTimeDialog({
              api: this.api,
              lang: this._state.lang,
              handler: (result, value) => {
                if (result === "ok") {
                  if (this.api) {
                    this.api.asc_addDateTime(value)
                  }
                }
                Common.NotificationCenter.trigger("edit:complete", this.view)
              },
            }).show()
          } else {
            new PDFE.Views.HeaderFooterDialog({
              api: this.api,
              lang: this.api.asc_getDefaultLanguage(),
              props: this.api.asc_getHeaderFooterProperties(),
              isLockedApplyToAll: this._state.isLockedSlideHeaderAppyToAll,
              handler: (result, value) => {
                if (result === "ok" || result === "all") {
                  if (this.api) {
                    this.api.asc_setHeaderFooterProperties(value, result === "all")
                  }
                }
                Common.NotificationCenter.trigger("edit:complete", this.view)
              },
            }).show()
          }
        },

        onAddPage: function (before) {
          this.api?.asc_AddPage(this.api.getCurrentPage() + (before ? 0 : 1))
        },

        mouseenterSmartArt: function (groupName, menu) {
          if (this.smartArtGenerating === undefined) {
            this.generateSmartArt(groupName, menu)
          } else {
            this.delayedSmartArt = groupName
            this.delayedSmartArtMenu = menu
          }
        },

        mouseleaveSmartArt: function (groupName) {
          if (this.delayedSmartArt === groupName) {
            this.delayedSmartArt = undefined
          }
        },

        generateSmartArt: function (groupName, menu) {
          this.docHolderMenu = menu
          this.api.asc_generateSmartArtPreviews(groupName)
        },

        onApiBeginSmartArtPreview: function (type) {
          this.smartArtGenerating = type
          this.smartArtGroups = this.docHolderMenu
            ? this.docHolderMenu.items
            : this.view.btnInsertSmartArt.menu.items
          const menuPicker = _.findWhere(this.smartArtGroups, { value: type }).menuPicker
          menuPicker.loaded = true
          this.smartArtData = Common.define.smartArt.getSmartArtData()
        },

        onApiAddSmartArtPreview: function (previews) {
          previews.forEach(
            _.bind(function (preview) {
              const image = preview.asc_getImage()
              const sectionId = preview.asc_getSectionId()
              const section = _.findWhere(this.smartArtData, { sectionId: sectionId })
              const item = _.findWhere(section.items, { type: image.asc_getName() })
              const menu = _.findWhere(this.smartArtGroups, { value: sectionId })
              const menuPicker = menu.menuPicker
              const pickerItem = menuPicker.store.findWhere({ isLoading: true })
              if (pickerItem) {
                pickerItem.set("isLoading", false, { silent: true })
                pickerItem.set("value", item.type, { silent: true })
                pickerItem.set("imageUrl", image.asc_getImage(), { silent: true })
                pickerItem.set("tip", item.tip)
              }
              this.currentSmartArtCategoryMenu = menu
            }, this),
          )
        },

        onApiEndSmartArtPreview: function () {
          this.smartArtGenerating = undefined
          if (this.currentSmartArtCategoryMenu) {
            this.currentSmartArtCategoryMenu.menu.alignPosition()
            this.currentSmartArtCategoryMenu.cmpEl?.attr("data-preview-loaded", true)
          }
          if (this.delayedSmartArt !== undefined) {
            const delayedSmartArt = this.delayedSmartArt
            this.delayedSmartArt = undefined
            this.generateSmartArt(delayedSmartArt, this.delayedSmartArtMenu)
          }
        },

        onInsertSmartArt: function (value) {
          if (this.api) {
            this.api.asc_createSmartArt(value)
          }
        },

        onSelectChart: function (type) {
          let chart = false

          const selectedElements = this.api.getSelectedElements()
          if (selectedElements && _.isArray(selectedElements)) {
            for (let i = 0; i < selectedElements.length; i++) {
              if (Asc.c_oAscTypeSelectElement.Chart === selectedElements[i].get_ObjectType()) {
                chart = selectedElements[i].get_ObjectValue()
                break
              }
            }
          }

          if (chart) {
            const isCombo =
              type === Asc.c_oAscChartTypeSettings.comboBarLine ||
              type === Asc.c_oAscChartTypeSettings.comboBarLineSecondary ||
              type === Asc.c_oAscChartTypeSettings.comboAreaBar ||
              type === Asc.c_oAscChartTypeSettings.comboCustom
            if (
              isCombo &&
              chart.get_ChartProperties() &&
              chart.get_ChartProperties().getSeries().length < 2
            ) {
              Common.NotificationCenter.trigger(
                "showerror",
                Asc.c_oAscError.ID.ComboSeriesError,
                Asc.c_oAscError.Level.NoCritical,
              )
            } else chart.changeType(type)
            Common.NotificationCenter.trigger("edit:complete", this.toolbar)
          } else {
            this.api.asc_addChartDrawingObject(type, undefined, true)
            this.toolbar.fireEvent("insertchart", this.toolbar)
          }
        },

        onTextLanguage: function (langId) {
          this._state.lang = langId
        },

        fillEquations: function () {
          if (
            !this.view.btnInsertEquation.rendered ||
            this.view.btnInsertEquation.menu.getItemsLength(true) > 0
          )
            return
          const equationsStore = this.getApplication().getCollection("EquationGroups")
          const onShowAfter = (menu) => {
            for (let i = 0; i < equationsStore.length; ++i) {
              const equationPicker = new Common.UI.DataViewSimple({
                el: $(`#id-toolbar-menu-equationgroup${i}`),
                parentMenu: menu.items[i].menu,
                store: equationsStore.at(i).get("groupStore"),
                scrollAlwaysVisible: true,
                itemTemplate: _.template(
                  '<div class="item-equation">' +
                    '<div class="equation-icon" style="background-position:<%= posX %>px <%= posY %>px;width:<%= width %>px;height:<%= height %>px;" id="<%= id %>"></div>' +
                    "</div>",
                ),
              })
              equationPicker.on("item:click", (picker, item, record, e) => {
                if (this.api) {
                  if (record) this.api.asc_AddMath(record.get("data").equationType)

                  if (this.view.btnsInsertText.pressed()) {
                    this.view.btnsInsertText.toggle(false, true)
                  }
                  if (this.view.btnsInsertShape.pressed()) {
                    this.view.btnsInsertShape.toggle(false, true)
                  }

                  if (e.type !== "click") this.view.btnInsertEquation.menu.hide()
                  Common.NotificationCenter.trigger(
                    "edit:complete",
                    this.view,
                    this.view.btnInsertEquation,
                  )
                  Common.component.Analytics.trackEvent("ToolBar", "Add Equation")
                }
              })
            }
            menu.off("show:after", onShowAfter)
          }
          this.view.btnInsertEquation.menu.on("show:after", onShowAfter)

          for (let i = 0; i < equationsStore.length; ++i) {
            const equationGroup = equationsStore.at(i)
            const menuItem = new Common.UI.MenuItem({
              caption: equationGroup.get("groupName"),
              menu: new Common.UI.Menu({
                menuAlign: "tl-tr",
                items: [
                  {
                    template: _.template(
                      `<div id="id-toolbar-menu-equationgroup${i}" class="menu-shape margin-left-5" style="width:${equationGroup.get("groupWidth") + 8}px; ${equationGroup.get("groupHeightStr")}"></div>`,
                    ),
                  },
                ],
              }),
            })
            this.view.btnInsertEquation.menu.addItem(menuItem, true)
          }
        },

        onInsertEquationClick: function () {
          if (this.api) {
            this.api.asc_AddMath()
            Common.component.Analytics.trackEvent("ToolBar", "Add Equation")
          }
          Common.NotificationCenter.trigger("edit:complete", this.view, this.view.btnInsertEquation)
        },

        onInsertSymbolClick: function (record) {
          if (!this.api) return
          if (record)
            this.insertSymbol(record.get("font"), record.get("symbol"), record.get("special"))
          else {
            const selected = this.api.asc_GetSelectedText()
            const win = new Common.Views.SymbolTableDialog({
              api: this.api,
              lang: this.mode.lang,
              type: 1,
              special: true,
              buttons: [{ value: "ok", caption: this.textInsert }, "close"],
              font:
                selected && selected.length > 0
                  ? this.api.get_TextProps().get_TextPr().get_FontFamily().get_Name()
                  : undefined,
              symbol: selected && selected.length > 0 ? selected.charAt(0) : undefined,
              handler: (dlg, result, settings) => {
                if (result === "ok") {
                  this.insertSymbol(
                    settings.font,
                    settings.code,
                    settings.special,
                    settings.speccharacter,
                  )
                } else Common.NotificationCenter.trigger("edit:complete", this.view)
              },
            })
            win.show()
            win.on("symbol:dblclick", (cmp, result, settings) => {
              this.insertSymbol(
                settings.font,
                settings.code,
                settings.special,
                settings.speccharacter,
              )
            })
          }
        },

        insertSymbol: function (fontRecord, symbol, special, specCharacter) {
          const font = fontRecord
            ? fontRecord
            : this.api.get_TextProps().get_TextPr().get_FontFamily().get_Name()
          this.api.asc_insertSymbol(font, symbol, special)
          !specCharacter && this.view.saveSymbol(symbol, font)
        },

        onApiMathTypes: function (equation) {
          const onShowBefore = (menu) => {
            const equationTemp = this.getApplication().getController("Toolbar")._equationTemp
            this.onMathTypes(equationTemp)
            if (equationTemp && equationTemp.get_Data().length > 0) this.fillEquations()
            this.view.btnInsertEquation.menu.off("show:before", onShowBefore)
          }
          this.view.btnInsertEquation.menu.on("show:before", onShowBefore)
        },

        onMathTypes: function (equation) {
          const equationgrouparray = []
          const equationsStore = this.getCollection("EquationGroups")

          if (equationsStore.length > 0) return

          // equations groups

          const c_oAscMathMainTypeStrings = {}

          // [translate, count cells, scroll]

          c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Symbol] = [
            this.textSymbols,
            11,
            false,
            "svg-icon-symbols",
          ]
          c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Fraction] = [
            this.textFraction,
            4,
            false,
            "svg-icon-fraction",
          ]
          c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Script] = [
            this.textScript,
            4,
            false,
            "svg-icon-script",
          ]
          c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Radical] = [
            this.textRadical,
            4,
            false,
            "svg-icon-radical",
          ]
          c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Integral] = [
            this.textIntegral,
            3,
            true,
            "svg-icon-integral",
          ]
          c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.LargeOperator] = [
            this.textLargeOperator,
            5,
            true,
            "svg-icon-largeOperator",
          ]
          c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Bracket] = [
            this.textBracket,
            4,
            true,
            "svg-icon-bracket",
          ]
          c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Function] = [
            this.textFunction,
            3,
            true,
            "svg-icon-function",
          ]
          c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Accent] = [
            this.textAccent,
            4,
            false,
            "svg-icon-accent",
          ]
          c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.LimitLog] = [
            this.textLimitAndLog,
            3,
            false,
            "svg-icon-limAndLog",
          ]
          c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Operator] = [
            this.textOperator,
            4,
            false,
            "svg-icon-operator",
          ]
          c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Matrix] = [
            this.textMatrix,
            4,
            true,
            "svg-icon-matrix",
          ]

          // equations sub groups

          // equations types

          const translationTable = {}
          let name = ""
          let translate = ""
          for (name in Common.define.c_oAscMathType) {
            if (Common.define.c_oAscMathType.hasOwnProperty(name)) {
              const arr = name.split("_")
              if (arr.length === 2 && arr[0] === "Symbol") {
                translate = `txt${arr[0]}_${arr[1].toLocaleLowerCase()}`
              } else translate = `txt${name}`
              translationTable[Common.define.c_oAscMathType[name]] = this[translate]
            }
          }
          let i
          let id = 0
          let count = 0
          let length = 0
          let width = 0
          let height = 0
          let store = null
          const list = null
          let eqStore = null
          let eq = null
          let data

          if (equation) {
            data = equation.get_Data()
            count = data.length
            if (count) {
              for (let j = 0; j < count; ++j) {
                const group = data[j]
                id = group.get_Id()
                width = group.get_W()
                height = group.get_H()

                store = new Backbone.Collection([], {
                  model: PDFE.Models.EquationModel,
                })

                if (store) {
                  let allItemsCount = 0
                  let itemsCount = 0
                  let ids = 0
                  const arr = []
                  length = group.get_Data().length
                  for (i = 0; i < length; ++i) {
                    eqStore = group.get_Data()[i]
                    itemsCount = eqStore.get_Data().length
                    for (let p = 0; p < itemsCount; ++p) {
                      eq = eqStore.get_Data()[p]
                      ids = eq.get_Id()

                      translate = ""

                      if (translationTable.hasOwnProperty(ids)) {
                        translate = translationTable[ids]
                      }
                      arr.push({
                        data: { equationType: ids },
                        tip: translate,
                        allowSelected: true,
                        selected: false,
                        width: eqStore.get_W(),
                        height: eqStore.get_H(),
                        posX: -eq.get_X(),
                        posY: -eq.get_Y(),
                      })
                    }

                    allItemsCount += itemsCount
                  }
                  store.add(arr)
                  width = c_oAscMathMainTypeStrings[id][1] * (width + 10) // 4px margin + 4px margin + 1px border + 1px border

                  const normHeight = Number.parseInt(370 / (height + 10)) * (height + 10)
                  equationgrouparray.push({
                    groupName: c_oAscMathMainTypeStrings[id][0],
                    groupStore: store,
                    groupWidth: width,
                    groupHeight: normHeight,
                    groupHeightStr: c_oAscMathMainTypeStrings[id][2]
                      ? ` height:${normHeight}px!important; `
                      : "",
                    groupIcon: c_oAscMathMainTypeStrings[id][3],
                  })
                }
              }
              equationsStore.add(equationgrouparray)
              // this.fillEquations();
            }
          }
        },

        onApiFocusObject: function (selectedObjects) {
          let pr
          let i = -1
          let type
          let paragraph_locked = false
          let no_paragraph = true
          let in_chart = false
          let page_deleted = false
          let has_object = false

          while (++i < selectedObjects.length) {
            type = selectedObjects[i].get_ObjectType()
            pr = selectedObjects[i].get_ObjectValue()

            if (type === Asc.c_oAscTypeSelectElement.Paragraph) {
              paragraph_locked = pr.get_Locked()
              no_paragraph = false
            } else if (
              type === Asc.c_oAscTypeSelectElement.Image ||
              type === Asc.c_oAscTypeSelectElement.Shape ||
              type === Asc.c_oAscTypeSelectElement.Chart ||
              type === Asc.c_oAscTypeSelectElement.Table
            ) {
              if (
                type === Asc.c_oAscTypeSelectElement.Table ||
                (type === Asc.c_oAscTypeSelectElement.Shape &&
                  !pr.get_FromImage() &&
                  !pr.get_FromChart())
              ) {
                no_paragraph = false
              }
              if (type === Asc.c_oAscTypeSelectElement.Chart) {
                in_chart = true
              }
            } else if (type === Asc.c_oAscTypeSelectElement.PdfPage) {
              page_deleted = pr.asc_getDeleteLock()
            }
            has_object = has_object || type !== Asc.c_oAscTypeSelectElement.PdfPage // not only page
          }

          if (in_chart !== this._state.in_chart) {
            this.view.btnInsertChart.updateHint(
              in_chart ? this.view.tipChangeChart : this.view.tipInsertChart,
            )
            this._state.in_chart = in_chart
          }

          if (this._state.prcontrolsdisable !== paragraph_locked) {
            this._state.prcontrolsdisable = paragraph_locked
            Common.Utils.lockControls(Common.enumLock.paragraphLock, paragraph_locked === true, {
              array: this.view.lockedControls,
            })
          }

          if (this._state.no_paragraph !== no_paragraph) {
            this._state.no_paragraph = no_paragraph
            Common.Utils.lockControls(Common.enumLock.noParagraphSelected, no_paragraph, {
              array: this.view.lockedControls,
            })
          }

          if (this._state.object_without_paragraph !== no_paragraph && has_object) {
            this._state.object_without_paragraph = no_paragraph && has_object
            Common.Utils.lockControls(
              Common.enumLock.noParagraphSelected,
              no_paragraph && has_object,
              { array: this.view.lockedControls },
            )
          }

          if (page_deleted !== undefined && this._state.pagecontrolsdisable !== page_deleted) {
            this._state.pagecontrolsdisable = page_deleted
            Common.Utils.lockControls(Common.enumLock.pageDeleted, page_deleted, {
              array: this.view.lockedControls,
            })
          }

          if (!this.view.btnInsertChart.isDisabled() && this._state.onactivetab) {
            Common.UI.TooltipManager.getNeedShow("pdfCharts") &&
              Common.UI.TooltipManager.closeTip("redactTab")
            Common.UI.TooltipManager.showTip("pdfCharts")
          }
        },

        onApiCanAddHyperlink: function (value) {
          if (this._state.can_hyper !== value) {
            Common.Utils.lockControls(Common.enumLock.hyperlinkLock, !value, {
              array: [this.view.btnInsertHyperlink],
            })
            this._state.can_hyper = value
          }
        },

        onActiveTab: function (tab) {
          if (tab === "ins") {
            this._state.onactivetab = true
            if (this.view && !this.view.btnInsertChart.isDisabled())
              setTimeout(() => {
                Common.UI.TooltipManager.getNeedShow("pdfCharts") &&
                  Common.UI.TooltipManager.closeTip("redactTab")
                Common.UI.TooltipManager.showTip("pdfCharts")
              }, 10)
          } else {
            this._state.onactivetab = false
            Common.UI.TooltipManager.closeTip("pdfCharts")
          }
        },
      },
      PDFE.Controllers.InsTab || {},
    ),
  )
})
