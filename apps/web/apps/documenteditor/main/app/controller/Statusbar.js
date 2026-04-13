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
 *  Statusbar.js
 *
 *  Statusbar controller
 *
 *  Created on 1/15/14
 *
 */

define([
  "core",
  "documenteditor/main/app/view/Statusbar",
  "common/main/lib/util/LanguageInfo",
], () => {
  DE.Controllers.Statusbar = Backbone.Controller.extend(
    _.extend(
      {
        models: [],
        collections: [],
        views: ["Statusbar"],

        initialize: function () {
          this.addListeners({
            Statusbar: {
              langchanged: this.onLangMenu,
              "zoom:value": function (value) {
                this.api.zoom(value)
                Common.NotificationCenter.trigger("edit:complete", this.statusbar)
              }.bind(this),
              "pages:multiple": _.bind(this.onMultiplePages, this),
            },
            ViewTab: {
              "statusbar:hide": _.bind(this.onChangeCompactView, this),
              "pages:multiplechanged": _.bind(function (isMultiple) {
                this.statusbar.btnMultiplePages.toggle(isMultiple)
              }, this),
            },
          })
        },

        events: function () {
          return {
            "click #btn-zoom-down": _.bind(this.zoomDocument, this, "down"),
            "click #btn-zoom-up": _.bind(this.zoomDocument, this, "up"),
            "click #btn-zoom-topage": _.bind(this.onBtnZoomTo, this, "topage"),
            "click #btn-zoom-towidth": _.bind(this.onBtnZoomTo, this, "towidth"),
          }
        },

        onLaunch: function () {
          this.statusbar = this.createView("Statusbar", {
            // storeUsers: this.getApplication().getCollection('Common.Collections.Users')
          })
          Common.NotificationCenter.on("app:face", (cfg) => {
            this.statusbar.render(cfg)
            this.statusbar.$el.css("z-index", 1)

            const lblzoom = $(".statusbar #label-zoom")
            lblzoom.css("min-width", 80)
            lblzoom.text(Common.Utils.String.format(this.zoomText, 100))

            if (cfg.isEdit) {
              const review = this.getApplication()
                .getController("Common.Controllers.ReviewChanges")
                .getView()
              if (cfg.canReview) {
                this.btnTurnReview = review.getButton("turn", "statusbar")
                this.btnTurnReview.render(this.statusbar.$layout.find("#btn-doc-review"))
                this.statusbar.btnTurnReview = this.btnTurnReview
              } else {
                this.statusbar.$el.find(".el-review").hide()
              }

              this.btnSpelling = review.getButton("spelling", "statusbar")
              this.btnSpelling.render(this.statusbar.$layout.find("#btn-doc-spell"))
              this.btnDocLang = review.getButton("doclang", "statusbar")
              this.btnDocLang.render(this.statusbar.$layout.find("#btn-doc-lang"))

              let isVisible =
                (Common.UI.LayoutManager.isElementVisible("statusBar-textLang") ||
                  Common.UI.LayoutManager.isElementVisible("statusBar-docLang")) &&
                Common.UI.FeaturesManager.canChange("spellcheck")
              this.btnDocLang.$el.find("+.separator.space")[isVisible ? "show" : "hide"]()
              isVisible =
                Common.UI.LayoutManager.isElementVisible("statusBar-textLang") ||
                Common.UI.LayoutManager.isElementVisible("statusBar-docLang") ||
                Common.UI.FeaturesManager.canChange("spellcheck")
              this.statusbar.$el.find(".el-lang")[isVisible ? "show" : "hide"]()
            } else {
              this.statusbar.$el.find(".el-edit, .el-review").hide()
            }
            if (cfg.canUseSelectHandTools) {
              this.statusbar.$el.find(".hide-select-tools").removeClass("hide-select-tools")
            }
          })
          Common.NotificationCenter.on("app:ready", this.onAppReady.bind(this))
        },

        onAppReady: function (config) {
          this._isDocReady = true
          new Promise((resolve) => {
            resolve()
          }).then(() => {
            this.bindViewEvents(this.statusbar, this.events)
            if (config.canUseSelectHandTools) {
              this.statusbar.btnSelectTool.on("click", _.bind(this.onSelectTool, this, "select"))
              this.statusbar.btnHandTool.on("click", _.bind(this.onSelectTool, this, "hand"))
              this.api.asc_registerCallback(
                "asc_onChangeViewerTargetType",
                _.bind(this.onChangeViewerTargetType, this),
              )
              this.api.asc_setViewerTargetType("hand")
            }

            const statusbarIsHidden = Common.localStorage.getBool("de-hidden-status")
            if (config.canReview && !statusbarIsHidden) {
              const _process_changestip = () => {
                const showTrackChangesTip = !Common.localStorage.getBool("de-track-changes-tip")
                if (showTrackChangesTip) {
                  this.btnTurnReview.updateHint("")
                  if (this.changesTooltip === undefined)
                    this.changesTooltip = this.createChangesTip(
                      this.textTrackChanges,
                      "de-track-changes-tip",
                    )

                  this.hideTips()
                  this.changesTooltip.show()
                } else {
                  this.btnTurnReview.updateHint(this.tipReview)
                }
              }

              const trackRevisions = this.api.asc_IsTrackRevisions()
              let trackChanges = config.customization?.review
                ? config.customization.review.trackChanges
                : undefined
              trackChanges === undefined &&
                (trackChanges = config.customization
                  ? config.customization.trackChanges
                  : undefined)

              if (
                config.isReviewOnly ||
                trackChanges === true ||
                (trackChanges !== false && trackRevisions)
              ) {
                _process_changestip()
              } else if (trackRevisions) {
                const showNewChangesTip = !Common.localStorage.getBool("de-new-changes")
                if (this.api.asc_HaveRevisionsChanges() && showNewChangesTip) {
                  this.btnTurnReview.updateHint("")

                  if (this.newChangesTooltip === undefined)
                    this.newChangesTooltip = this.createChangesTip(
                      this.textHasChanges,
                      "de-new-changes",
                    )

                  this.hideTips()
                  this.newChangesTooltip.show()
                } else this.btnTurnReview.updateHint(this.tipReview)
              }
            }
          })
        },

        onChangeCompactView: function (view, status) {
          this.statusbar.setVisible(!status)
          Common.localStorage.setBool("de-hidden-status", status)

          if (view.$el.closest(".btn-slot").prop("id") === "slot-btn-options") {
            this.statusbar.fireEvent("view:hide", [this, status])
          }

          Common.NotificationCenter.trigger("layout:changed", "status")
          Common.NotificationCenter.trigger("edit:complete", this.statusbar)
        },

        onApiTrackRevisionsChange: function (localFlag, globalFlag, userId) {
          const global = localFlag === null
          const state = global ? globalFlag : localFlag
          if (this.btnTurnReview) {
            if (!state) {
              this.hideTips()
              this.btnTurnReview.updateHint(this.tipReview)
            } else if (userId && state && global) {
              if (this.globalChangesTooltip === undefined)
                this.globalChangesTooltip = this.createChangesTip(this.textSetTrackChanges)
              if (!this.globalChangesTooltip.isVisible()) {
                this.hideTips()
                this.globalChangesTooltip.show()
              }
            }
          }
        },

        setApi: function (api) {
          this.api = api
          this.api.asc_registerCallback("asc_onZoomChange", _.bind(this._onZoomChange, this))
          this.api.asc_registerCallback("asc_onTextLanguage", _.bind(this._onTextLanguage, this))
          this.api.asc_registerCallback(
            "asc_onOnTrackRevisionsChange",
            _.bind(this.onApiTrackRevisionsChange, this),
          )

          this.statusbar.setApi(api)
        },

        onBtnZoomTo: function (d, e) {
          let _btn
          let _func
          if (d === "topage") {
            _btn = "btnZoomToPage"
            _func = "zoomFitToPage"
          } else {
            _btn = "btnZoomToWidth"
            _func = "zoomFitToWidth"
          }

          if (!this.statusbar[_btn].pressed) this.api.zoomCustomMode()
          else this.api[_func]()

          Common.NotificationCenter.trigger("edit:complete", this.statusbar)
        },

        zoomDocument: function (d, e) {
          switch (d) {
            case "up":
              this.api.zoomIn()
              break
            case "down":
              this.api.zoomOut()
              break
          }
          Common.NotificationCenter.trigger("edit:complete", this.statusbar)
        },

        onMultiplePages: function (pressed) {
          if (this.api) {
            this.statusbar.fireEvent("pages:multiplechanged", [pressed])
          }
        },

        /*
         *   api events
         * */

        _onZoomChange: function (percent, type) {
          this.statusbar.btnZoomToPage.toggle(type === 2, true)
          this.statusbar.btnZoomToWidth.toggle(type === 1, true)
          if (type === 1 || (type === 2 && this.statusbar.btnMultiplePages.pressed)) {
            this.api.SetMultipageViewMode(false)
            this.statusbar.btnMultiplePages.toggle(false)
          }
          $(".statusbar #label-zoom").text(Common.Utils.String.format(this.zoomText, percent))
          if (!this._isDocReady) return
          const value = type === 2 ? -1 : type === 1 ? -2 : percent
          Common.localStorage.setItem("de-last-zoom", value)
          Common.Utils.InternalSettings.set("de-last-zoom", value)
        },

        _onTextLanguage: function (langId) {
          const info = Common.util.LanguageInfo.getLocalLanguageName(langId)
          const displayName = Common.util.LanguageInfo.getLocalLanguageDisplayName(langId)
          this.statusbar.setLanguage({
            value: info[0],
            displayValue: displayName ? displayName.native : "",
            code: langId,
          })
        },

        setLanguages: function (langs) {
          this.langs = langs
          this.statusbar.reloadLanguages(langs)
        },

        setStatusCaption: function (text, force, delay, callback) {
          if (this.timerCaption && (new Date() < this.timerCaption || text.length === 0) && !force)
            return

          this.timerCaption = undefined
          if (text.length) {
            this.statusbar.showStatusMessage(text)
            callback?.()
            if (delay > 0) this.timerCaption = new Date().getTime() + delay
          } else this.statusbar.clearStatusMessage()
        },

        createDelayedElements: function () {
          this.statusbar.$el.css("z-index", "")
        },

        onLangMenu: function (obj, langid, title) {
          this.api.put_TextPrLang(langid)
        },

        synchronizeChanges: function () {
          this.setStatusCaption("")
        },

        hideTips: function () {
          this.changesTooltip?.isVisible() && this.changesTooltip.hide()
          this.newChangesTooltip?.isVisible() && this.newChangesTooltip.hide()
          this.globalChangesTooltip?.isVisible() && this.globalChangesTooltip.hide()
        },

        createChangesTip: function (text, storage) {
          const tip = new Common.UI.SynchronizeTip({
            target: this.btnTurnReview.$el,
            text: text,
            placement: Common.UI.isRTL() ? "top-right" : "top-left",
            showLink: !!storage,
          })
          tip.on({
            dontshowclick: () => {
              Common.localStorage.setItem(storage, 1)

              tip.hide()
              this.btnTurnReview.updateHint(this.tipReview)
            },
            closeclick: () => {
              tip.hide()
              this.btnTurnReview.updateHint(this.tipReview)
            },
          })

          return tip
        },

        showDisconnectTip: function (text) {
          text = text || this.textDisconnect
          if (!this.disconnectTip) {
            let target = this.statusbar.getStatusLabel()
            target = target.is(":visible")
              ? target.parent()
              : this.statusbar.isVisible()
                ? this.statusbar.$el
                : $(document.body)
            this.disconnectTip = new Common.UI.SynchronizeTip({
              target: target,
              text: text,
              placement: "top",
              position: this.statusbar.isVisible() ? undefined : { bottom: 0 },
              showLink: false,
              style: "max-width: 310px;",
            })
            this.disconnectTip.on({
              closeclick: () => {
                this.disconnectTip.hide()
                this.disconnectTip = null
              },
            })
          } else {
            this.disconnectTip.setText(text)
          }
          this.disconnectTip.show()
        },

        hideDisconnectTip: function () {
          this.disconnectTip?.hide()
          this.disconnectTip = null
        },

        onSelectTool: function (type, btn, e) {
          if (this.api) {
            this.api.asc_setViewerTargetType(type)
          }
        },

        onChangeViewerTargetType: function (isHandMode) {
          if (this.statusbar?.btnHandTool) {
            this.statusbar.btnHandTool.toggle(isHandMode, true)
            this.statusbar.btnSelectTool.toggle(!isHandMode, true)
          }
        },

        zoomText: "Zoom {0}%",
        textHasChanges: "New changes have been tracked",
        textTrackChanges: "The document is opened with the Track Changes mode enabled",
        tipReview: "Review",
        textSetTrackChanges: "You are in Track Changes mode",
        textDisconnect:
          "<b>Connection is lost</b><br>Trying to connect. Please check connection settings.",
      },
      DE.Controllers.Statusbar || {},
    ),
  )
})
