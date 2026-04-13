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
 *  ViewTab.js
 *
 *  Created on 22.02.2022
 *
 */

define(["core", "common/main/lib/view/SearchPanel"], () => {
  SSE.Controllers.Search = Backbone.Controller.extend(
    _.extend(
      {
        sdkViewName: "#id_main",

        views: ["Common.Views.SearchPanel"],

        initialize: function () {
          this.addListeners({
            SearchBar: {
              "search:back": _.bind(this.onSearchNext, this, "back"),
              "search:next": _.bind(this.onSearchNext, this, "next"),
              "search:input": _.bind(function (text, afterShow) {
                if (afterShow && !text) {
                  if (this._state.isResults) {
                    this._state.noSearchEmptyCells = true
                    this.onQuerySearch()
                  }
                  return
                }
                if (this._state.searchText === text) {
                  Common.NotificationCenter.trigger(
                    "search:updateresults",
                    this._state.currentResult,
                    this._state.resultsNumber,
                  )
                  return
                }
                this.onInputSearchChange(text)
              }, this),
              "search:keydown": _.bind(this.onSearchNext, this, "keydown"),
              show: _.bind(this.onSelectSearchingResults, this, true),
              hide: _.bind(this.onSelectSearchingResults, this, false),
            },
            "Common.Views.SearchPanel": {
              "search:back": _.bind(this.onSearchNext, this, "back"),
              "search:next": _.bind(this.onSearchNext, this, "next"),
              "search:replace": _.bind(this.onQueryReplace, this),
              "search:replaceall": _.bind(this.onQueryReplaceAll, this),
              "search:input": _.bind(this.onInputSearchChange, this),
              "search:options": _.bind(this.onChangeSearchOption, this),
              "search:keydown": _.bind(this.onSearchNext, this, "keydown"),
              show: _.bind(this.onShowPanel, this),
              hide: _.bind(this.onHidePanel, this),
            },
            LeftMenu: {
              "search:aftershow": _.bind(this.onShowAfterSearch, this),
            },
          })
        },
        onLaunch: function () {
          this._state = {
            searchText: undefined,
            matchCase: false,
            matchWord: false,
            useRegExp: false,
            withinSheet: Asc.c_oAscSearchBy.Sheet,
            searchByRows: true,
            lookInFormulas: true,
            isValidSelectedRange: true,
            lastSelectedItem: undefined,
            isContentChanged: false,
            isResults: false,
            noSearchEmptyCells: false,
            isReturnPressed: false,
          }
        },

        setMode: function (mode) {
          this.view = this.createView("Common.Views.SearchPanel", { mode: mode })
          this.view.on("render:after", _.bind(this.onAfterRender, this))
        },

        setApi: function (api) {
          if (api) {
            this.api = api
            this.api.asc_registerCallback(
              "asc_onRenameCellTextEnd",
              _.bind(this.onRenameText, this),
            )
            this.api.asc_registerCallback(
              "asc_onSetSearchCurrent",
              _.bind(this.onUpdateSearchCurrent, this),
            )
            this.api.asc_registerCallback(
              "asc_onStartTextAroundSearch",
              _.bind(this.onStartTextAroundSearch, this),
            )
            this.api.asc_registerCallback(
              "asc_onEndTextAroundSearch",
              _.bind(this.onEndTextAroundSearch, this),
            )
            this.api.asc_registerCallback(
              "asc_onGetTextAroundSearchPack",
              _.bind(this.onApiGetTextAroundSearch, this),
            )
            this.api.asc_registerCallback(
              "asc_onRemoveTextAroundSearch",
              _.bind(this.onApiRemoveTextAroundSearch, this),
            )
            this.api.asc_registerCallback(
              "asc_onActiveSheetChanged",
              _.bind(this.onActiveSheetChanged, this),
            )
            this.api.asc_registerCallback(
              "asc_onModifiedDocument",
              _.bind(this.onApiModifiedDocument, this),
            )
            this.api.asc_registerCallback(
              "asc_onUpdateSearchElem",
              _.bind(this.onApiUpdateSearchElem, this),
            )
          }
          return this
        },

        getView: function (name) {
          return !name && this.view
            ? this.view
            : Backbone.Controller.prototype.getView.call(this, name)
        },

        onAfterRender: function () {
          this.view.inputSelectRange.validation = (value) => {
            if (_.isEmpty(value)) {
              return true
            }
            const isvalid = this.api.asc_checkDataRange(undefined, value)
            this._state.isValidSelectedRange = isvalid !== Asc.c_oAscError.ID.DataRangeError
            return isvalid === Asc.c_oAscError.ID.DataRangeError ? this.textInvalidRange : true
          }
          this.view.inputSelectRange.on("button:click", _.bind(this.onRangeSelect, this))
        },

        changeWithinSheet: function (value) {
          this._state.withinSheet = value
          this.view.inputSelectRange.setDisabled(value !== Asc.c_oAscSearchBy.Range)
          this.view.inputSelectRange.$el[value === Asc.c_oAscSearchBy.Range ? "show" : "hide"]()
          this.view.updateResultsContainerHeight()
        },

        onChangeSearchOption: function (option, value, noSearch) {
          let runSearch = true
          switch (option) {
            case "case-sensitive":
              this._state.matchCase = value
              break
            case "match-word":
              this._state.matchWord = value
              break
            case "regexp":
              this._state.useRegExp = value
              break
            case "within":
              this.changeWithinSheet(value)
              if (value === Asc.c_oAscSearchBy.Range) {
                runSearch = this._state.isValidSelectedRange && !!this._state.selectedRange
              }
              break
            case "range":
              this._state.selectedRange = value
              runSearch = !noSearch
              break
            case "search":
              this._state.searchByRows = value
              break
            case "lookIn":
              this._state.lookInFormulas = value
              break
          }
          if (runSearch) {
            this.onQuerySearch()
          }
        },

        onRangeSelect: function () {
          if (this.rangeSelectDlg) return
          const handlerDlg = (dlg, result) => {
            if (result === "ok") {
              const valid = dlg.getSettings()
              this.view.inputSelectRange.setValue(valid)
              this.view.inputSelectRange.checkValidate()
              this.onChangeSearchOption("range", valid)
            }
          }

          this.rangeSelectDlg = new SSE.Views.CellRangeDialog({
            handler: handlerDlg,
          }).on("close", () => {
            this.rangeSelectDlg = undefined
            _.delay(() => {
              this.view.inputSelectRange.focus()
            }, 1)
          })
          this.rangeSelectDlg.show()
          this.rangeSelectDlg.setSettings({
            api: this.api,
            range:
              !_.isEmpty(this.view.inputSelectRange.getValue()) &&
              this.view.inputSelectRange.checkValidate() === true
                ? this.view.inputSelectRange.getValue()
                : this._state.selectedRange,
            type: Asc.c_oAscSelectionDialogType.PrintTitles,
          })
        },

        onSearchNext: function (type, text, e) {
          const isReturnKey = type === "keydown" && e.keyCode === Common.UI.Keys.RETURN
          if (isReturnKey || type !== "keydown") {
            this._state.searchText = text
            this.onQuerySearch(type)
          }
          this._state.isReturnPressed = isReturnKey
        },

        onInputSearchChange: function (text) {
          if (!text && !this._state.isReturnPressed) {
            this._state.noSearchEmptyCells = true
          }
          this._state.isReturnPressed = false
          if (this._state.searchText !== text) {
            this._state.newSearchText = text
            this._lastInputChange = new Date()
            if (this.searchTimer === undefined) {
              this.searchTimer = setInterval(() => {
                if (new Date() - this._lastInputChange < 400) return

                this._state.searchText = this._state.newSearchText
                if (!this.onQuerySearch() && this._state.newSearchText === "") {
                  this.view.updateResultsNumber("no-results")
                  this.view.disableNavButtons()
                  Common.NotificationCenter.trigger("search:updateresults", undefined, 0)
                }
              }, 10)
            }
          }
        },

        onQuerySearch: function (d, isNeedRecalc) {
          this.searchTimer && clearInterval(this.searchTimer)
          this.searchTimer = undefined
          if (
            this._state.withinSheet === Asc.c_oAscSearchBy.Range &&
            !this._state.isValidSelectedRange
          ) {
            Common.UI.warning({
              title: this.notcriticalErrorTitle,
              msg: this.textInvalidRange,
              buttons: ["ok"],
              callback: () => {
                this.view.focus("range")
              },
            })
            return
          }

          this.hideResults()
          this.api.asc_closeCellEditor()

          const options = new Asc.asc_CFindOptions()
          options.asc_setFindWhat(this._state.searchText)
          options.asc_setScanForward(d !== "back")
          options.asc_setIsMatchCase(this._state.matchCase)
          options.asc_setIsWholeCell(this._state.matchWord)
          options.asc_setScanOnOnlySheet(this._state.withinSheet)
          if (this._state.withinSheet === Asc.c_oAscSearchBy.Range) {
            options.asc_setSpecificRange(this._state.selectedRange)
          }
          options.asc_setScanByRows(this._state.searchByRows)
          options.asc_setLookIn(
            this._state.lookInFormulas ? Asc.c_oAscFindLookIn.Formulas : Asc.c_oAscFindLookIn.Value,
          )
          options.asc_setNeedRecalc(isNeedRecalc)
          if (this._state.isContentChanged) {
            options.asc_setLastSearchElem(
              this._state.lastSelectedItem
                ? this._state.lastSelectedItem
                : options.asc_getLastSearchElem(true),
            )
            this.view.disableReplaceButtons(false)
            this._state.isContentChanged = false
            if (!this.view.$el.is(":visible")) {
              this.resultItems = []
            }
          }
          options.asc_setNotSearchEmptyCells(this._state.noSearchEmptyCells)
          if (!this.api.asc_findText(options)) {
            this._state.isResults = false
            if (this._state.noSearchEmptyCells) {
              this.removeResultItems("no-results")
              this._state.noSearchEmptyCells = false
            } else {
              this.removeResultItems()
            }
            Common.NotificationCenter.trigger("search:updateresults")
            return false
          }
          this._state.isResults = true
          if (this.view.$el.is(":visible")) {
            this.api.asc_StartTextAroundSearch()
          }
          return true
        },

        onQueryReplace: function (textSearch, textReplace) {
          this.api.isReplaceAll = false
          const options = new Asc.asc_CFindOptions()
          options.asc_setFindWhat(textSearch)
          options.asc_setReplaceWith(textReplace)
          options.asc_setIsMatchCase(this._state.matchCase)
          options.asc_setIsWholeCell(this._state.matchWord)
          options.asc_setScanOnOnlySheet(this._state.withinSheet)
          if (this._state.withinSheet === Asc.c_oAscSearchBy.Range) {
            options.asc_setSpecificRange(this._state.selectedRange)
          }
          options.asc_setScanByRows(this._state.searchByRows)
          options.asc_setLookIn(
            this._state.lookIn ? Asc.c_oAscFindLookIn.Formulas : Asc.c_oAscFindLookIn.Value,
          )
          options.asc_setIsReplaceAll(false)

          this.api.asc_replaceText(options)
        },

        onQueryReplaceAll: function (textSearch, textReplace) {
          this.api.isReplaceAll = true
          const options = new Asc.asc_CFindOptions()
          options.asc_setFindWhat(textSearch)
          options.asc_setReplaceWith(textReplace)
          options.asc_setIsMatchCase(this._state.matchCase)
          options.asc_setIsWholeCell(this._state.matchWord)
          options.asc_setScanOnOnlySheet(this._state.withinSheet)
          if (this._state.withinSheet === Asc.c_oAscSearchBy.Range) {
            options.asc_setSpecificRange(this._state.selectedRange)
          }
          options.asc_setScanByRows(this._state.searchByRows)
          options.asc_setLookIn(
            this._state.lookIn ? Asc.c_oAscFindLookIn.Formulas : Asc.c_oAscFindLookIn.Value,
          )
          options.asc_setIsReplaceAll(true)

          this.api.asc_replaceText(options)
        },

        onRenameText: function (found, replaced) {
          if (this.api.isReplaceAll) {
            if (!found) {
              this.removeResultItems("replace-all", true)
            } else {
              !(found - replaced) && this.removeResultItems("replace-all")
              /*Common.UI.info({
                        msg: (!(found-replaced) || replaced > found) ? Common.Utils.String.format(this.textReplaceSuccess,replaced) : Common.Utils.String.format(this.textReplaceSkipped,found-replaced),
                        callback: function() {
                            me.view.focus();
                        }
                    });*/
              !(found - replaced) || replaced > found
                ? this.view.updateResultsNumber("replace-all", replaced)
                : this.view.updateResultsNumber("replace", [replaced, found, found - replaced])
            }
          } else {
            this.onQuerySearch()
          }
        },

        removeResultItems: function (type, noHide) {
          this.resultItems = []
          type !== "replace-all" && this.view.updateResultsNumber(type, 0) // type === undefined, count === 0 -> no matches
          if (!noHide) {
            this.hideResults()
            this._state.currentResult = 0
            this._state.resultsNumber = 0
            this.view.disableNavButtons()
            Common.NotificationCenter.trigger("search:updateresults", undefined, 0)
          }
        },

        onApiRemoveTextAroundSearch: function (arr) {
          if (!this.resultItems || (this.resultItems && this.resultItems.length === 0)) return
          arr.forEach((id) => {
            const ind = _.findIndex(this.resultItems, { id: id })
            if (ind !== -1) {
              this.resultItems[ind].$el.remove()
              this.resultItems.splice(ind, 1)
            }
          })
          if (this.resultItems.length === 0) {
            this.removeResultItems()
          }
        },

        onUpdateSearchCurrent: function (current, all) {
          if (current === -1) return
          this._state.currentResult = current
          this._state.resultsNumber = all
          if (this.view) {
            this.view.updateResultsNumber(current, all)
            this.view.disableNavButtons(current, all)
            if (this.resultItems && this.resultItems.length > 0) {
              this.resultItems.forEach((item) => {
                item.selected = false
              })
              if (this.resultItems[current]) {
                this._state.lastSelectedItem = this.resultItems[current].data
                this.resultItems[current].selected = true
                $("#search-results").find(".item").removeClass("selected")
                this.resultItems[current].$el.addClass("selected")
              }
            }
          }
          Common.NotificationCenter.trigger("search:updateresults", current, all)
        },

        scrollToSelectedResult: function (ind) {
          const index = ind !== undefined ? ind : _.findIndex(this.resultItems, { selected: true })
          if (index !== -1) {
            const item = this.resultItems[index].$el
            const itemHeight = item.outerHeight()
            const itemTop = Common.Utils.getPosition(item).top
            const container = this.view.$resultsContainer.find(".search-items")
            const containerHeight = container.outerHeight()
            const containerTop = container.scrollTop()
            if (itemTop < 0 || (containerTop === 0 && itemTop > containerHeight)) {
              this.view.$resultsContainer.scroller.scrollTop(containerTop + itemTop - 12)
            } else if (itemTop + itemHeight > containerHeight) {
              this.view.$resultsContainer.scroller.scrollTop(containerTop + itemHeight)
            }
          }
        },

        onStartTextAroundSearch: function () {
          if (this.view) {
            this._state.isStartedAddingResults = true
          }
        },

        onEndTextAroundSearch: function () {
          if (this.view) {
            this._state.isStartedAddingResults = false
            this.view.updateScrollers()
          }
        },

        onApiGetTextAroundSearch: function (data) {
          // [id, sheet, name, cell, value, formula]
          if (this.view && this._state.isStartedAddingResults) {
            if (data.length > 300 || !data.length) return
            const $innerResults = this.view.$resultsContainer.find(".search-items")
            let selectedInd
            this.resultItems = []
            data.forEach((item, ind) => {
              const isSelected = ind === this._state.currentResult
              const tr = `<div role="row" class="item" style="width: 100%;"><div role="cell" class="sheet">${item[1] ? Common.Utils.String.htmlEncode(item[1]) : ""}</div><div role="cell" class="name">${item[2] ? Common.Utils.String.htmlEncode(item[2]) : ""}</div><div role="cell" class="cell">${item[3] ? Common.Utils.String.htmlEncode(item[3]) : ""}</div><div role="cell" class="value">${item[4] ? Common.Utils.String.htmlEncode(item[4]) : ""}</div><div role="cell" class="formula">${item[5] ? Common.Utils.String.htmlEncode(item[5]) : ""}</div></div>`
              const $item = $(tr).appendTo($innerResults)
              if (isSelected) {
                $item.addClass("selected")
                this._state.lastSelectedItem = item
                selectedInd = ind
              }
              const resultItem = {
                id: item[0],
                $el: $item,
                el: tr,
                selected: isSelected,
                data: item,
              }
              this.resultItems.push(resultItem)
              $item.on(
                "click",
                _.bind((el) => {
                  if (this._state.isContentChanged) {
                    this._state.lastSelectedItem = item
                    this.onQuerySearch()
                    return
                  }
                  const id = item[0]
                  this.api.asc_SelectSearchElement(id)
                }, this),
              )
              this.addTooltips($item, item)
            })
            this.view.$resultsContainer.show()
            this.scrollToSelectedResult(selectedInd)
          }
        },

        addTooltips: (item, data) => {
          const cells = [
            item.find(".sheet"),
            item.find(".name"),
            item.find(".cell"),
            item.find(".value"),
            item.find(".formula"),
          ]
          const tips = [data[1], data[2], data[3], data[4], data[5]]
          cells.forEach((el, ind) => {
            if (el.data("bs.tooltip")) {
              el.removeData("bs.tooltip")
            }
            const tip = tips[ind]
            if (tip) {
              el.off("mouseenter")
              el.one("mouseenter", () => {
                el.attr("data-toggle", "tooltip")
                el.tooltip({
                  title: tip,
                  placement: "cursor",
                  zIndex: 1000,
                })
                el.mouseenter()
              })
            }
          })
        },

        hideResults: function () {
          if (this.view) {
            if (this.view.$resultsContainer.find(".many-results").length === 0) {
              this.view.$resultsContainer.hide()
            }
            this.view.$resultsContainer.find(".search-items").empty()
          }
        },

        onShowAfterSearch: function (findText) {
          const fromEmptySearchBar = findText === ""
          const viewport = this.getApplication().getController("Viewport")
          if (viewport.isSearchBarVisible()) {
            viewport.searchBar.hide()
          }

          const activeRange = this.api.asc_getActiveRangeStr(Asc.referenceType.A, null, null, true)
          let isRangeChanged = false
          if (activeRange !== null) {
            this.changeWithinSheet(Asc.c_oAscSearchBy.Range)
            this._state.selectedRange = activeRange

            this.view.cmbWithin.setValue(Asc.c_oAscSearchBy.Range)
            this.view.inputSelectRange.setValue(activeRange)

            isRangeChanged = true
          }

          const selectedText = this.api.asc_GetSelectedText()
          const text =
            typeof findText === "string" ? findText : selectedText?.trim() || this._state.searchText
          if (
            (this.resultItems && this.resultItems.length > 0) ||
            (!text && this._state.isResults)
          ) {
            if (!text && !this.view.inputText.getValue()) {
              // remove empty cells highlighting when we open panel again
              this._state.noSearchEmptyCells = true
              this.onQuerySearch()
              return
            }
            if (
              !isRangeChanged &&
              ((!this._state.matchCase &&
                text &&
                text.toLowerCase() === this.view.inputText.getValue().toLowerCase()) ||
                (this._state.matchCase && text === this.view.inputText.getValue()))
            ) {
              // show old results
              return
            }
          }
          if (text) {
            this.view.setFindText(text)
          } else if (fromEmptySearchBar) {
            // panel was opened from empty searchbar
            this.view.setFindText("")
            if (!this._state.isResults) {
              this._state.searchText = undefined
            }
          }

          this.hideResults()
          if (
            !isRangeChanged &&
            this._state.searchText !== undefined &&
            text &&
            text === this._state.searchText &&
            this._state.isResults
          ) {
            // search was made
            this.api.asc_StartTextAroundSearch()
          } else if (this._state.searchText) {
            // search wasn't made
            this._state.searchText = text
            this.onQuerySearch()
          } else {
            this.resultItems = []
            this.view.clearResultsNumber()
          }
          this.view.disableNavButtons(this._state.currentResult, this._state.resultsNumber)
        },

        onShowPanel: function () {
          this.onSelectSearchingResults(true)
          if (
            this.resultItems &&
            this.resultItems.length > 0 &&
            !this._state.isStartedAddingResults
          ) {
            const $tableBody = this.view.$resultsContainer.find(".search-items")
            this.view.$resultsContainer.show()
            this.resultItems.forEach((item) => {
              const $item = $(item.el).appendTo($tableBody)
              item.$el = $item
              if (item.selected) {
                $item.addClass("selected")
              }
              $item.on("click", (el) => {
                this.api.asc_SelectSearchElement(item.id)
                $("#search-results").find(".item").removeClass("selected")
                $(el.currentTarget).addClass("selected")
              })
              this.addTooltips($item, item.data)
            })
            this.scrollToSelectedResult()
          }
        },

        onHidePanel: function () {
          this.hideResults()
          this.onSelectSearchingResults(false)
        },

        onSelectSearchingResults: function (val) {
          if (
            !val &&
            (this.getApplication().getController("LeftMenu").isSearchPanelVisible() ||
              this.getApplication().getController("Viewport").isSearchBarVisible())
          )
            return

          if (this._state.isHighlightedResults !== val) {
            this.api.asc_selectSearchingResults(val)
            this._state.isHighlightedResults = val
          }
        },

        onApiModifiedDocument: function () {
          this._state.isContentChanged = true
          this.view.updateResultsNumber("content-changed")
          this.view.disableReplaceButtons(true)
        },

        onActiveSheetChanged: function (index) {
          if (
            this._state.isHighlightedResults &&
            this._state.withinSheet === Asc.c_oAscSearchBy.Sheet
          ) {
            this.onQuerySearch(undefined, true)
          }
        },

        getSearchText: function () {
          return this._state.searchText
        },

        getResultsNumber: function () {
          return [this._state.currentResult, this._state.resultsNumber]
        },

        onApiUpdateSearchElem: function (data) {
          // [id, sheet, name, cell, value, formula]
          if (this.resultItems && this.resultItems.length > 0) {
            data.forEach((item) => {
              const resultItem = _.findWhere(this.resultItems, { id: item[0] })
              if (resultItem) {
                resultItem.data = item
                resultItem.el = `<div class="item" style="width: 100%;"><div class="sheet">${item[1] ? item[1] : ""}</div><div class="name">${item[2] ? item[2] : ""}</div><div class="cell">${item[3] ? item[3] : ""}</div><div class="value">${item[4] ? item[4] : ""}</div><div class="formula">${item[5] ? item[5] : ""}</div></div>`
                if (this.view.$el.is(":visible")) {
                  resultItem.$el.find(".sheet").text(item[1] ? item[1] : "")
                  resultItem.$el.find(".name").text(item[2] ? item[2] : "")
                  resultItem.$el.find(".cell").text(item[3] ? item[3] : "")
                  resultItem.$el.find(".value").text(item[4] ? item[4] : "")
                  resultItem.$el.find(".formula").text(item[5] ? item[5] : "")
                  this.addTooltips(resultItem.$el, item)
                }
              }
            })
          }
        },

        textNoTextFound:
          "The data you have been searching for could not be found. Please adjust your search options.",
        textReplaceSuccess: "Search has been done. {0} occurrences have been replaced",
        textReplaceSkipped: "The replacement has been made. {0} occurrences were skipped.",
        textInvalidRange: "ERROR! Invalid cells range",
      },
      SSE.Controllers.Search || {},
    ),
  )
})
