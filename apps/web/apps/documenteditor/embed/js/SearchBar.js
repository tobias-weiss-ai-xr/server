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
 *  SearchBar.js
 *
 *  Created on 27.04.2022
 *
 */

;+(() => {
  !window.common && (window.common = {})
  !common.controller && (common.controller = {})

  common.controller.SearchBar = new (function () {
    let $searchBar
    let $searchInput
    let appConfig
    let api
    const _state = {
      searchText: "",
    }
    let _lastInputChange
    let _searchTimer
    const _mods = {
      ctrl: false,
      f: false,
      other: false,
    }

    const init = (config) => {
      appConfig = config

      $(document.body)
        .on("keydown", (event) => {
          if (event.keyCode === 27 && $searchBar && $searchBar.is(":visible")) {
            highlightResults(false)
            $searchBar.hide()
            return
          }
          if (event.keyCode === 70) {
            _mods.f = true
          }
          if (event.ctrlKey || event.metaKey) {
            _mods.ctrl = true
          }
          if (event.altKey || event.shiftKey) {
            _mods.other = true
          }
          if (_mods.f && _mods.ctrl && !_mods.other) {
            event.preventDefault()
            onShow()
          }
        })
        .on("keyup", () => {
          for (const key in _mods) {
            _mods[key] = false
          }
        })
    }

    const setApi = (appApi) => {
      api = appApi
      if (api) {
        api.asc_registerCallback("asc_onSetSearchCurrent", onApiUpdateSearchCurrent)
      }
    }

    const create = () => {
      $searchBar = common.view.SearchBar.create()
      if (appConfig.toolbarDocked === "bottom") {
        if (window.isrtl) {
          $searchBar.css({ left: "45px", bottom: "31px" })
        } else {
          $searchBar.css({ right: "45px", bottom: "31px" })
        }
      } else {
        if (window.isrtl) {
          $searchBar.css({ left: "45px", top: "31px" })
        } else {
          $searchBar.css({ right: "45px", top: "31px" })
        }
      }

      $searchInput = $searchBar.find("#search-bar-text")
      $searchInput
        .on("input", (e) => {
          common.view.SearchBar.disableNavButtons()
          onInputSearchChange($searchInput.val())
        })
        .on("keydown", (e) => {
          onSearchNext("keydown", $searchInput.val(), e)
        })
      $searchBar.find("#search-bar-back").on("click", (e) => {
        onSearchNext("back", $searchInput.val())
      })
      $searchBar.find("#search-bar-next").on("click", (e) => {
        onSearchNext("next", $searchInput.val())
      })
      $searchBar.find("#search-bar-close").on("click", (e) => {
        highlightResults(false)
        $searchBar.hide()
      })

      common.view.SearchBar.disableNavButtons()
    }

    const onShow = () => {
      if (!$searchBar) {
        create()
      }
      if (!$searchBar.is(":visible")) {
        highlightResults(true)
        const text = api?.asc_GetSelectedText() || _state.searchText
        $searchInput.val(text)
        text.length > 0 && onInputSearchChange(text)

        $searchBar.show()
        setTimeout(() => {
          $searchInput.focus()
          $searchInput.select()
        }, 10)
      }
    }

    const onInputSearchChange = (text) => {
      if ((text && _state.searchText !== text) || (!text && _state.newSearchText)) {
        _state.newSearchText = text
        _lastInputChange = new Date()
        if (_searchTimer === undefined) {
          _searchTimer = setInterval(() => {
            if (new Date() - _lastInputChange < 400) return

            _state.searchText = _state.newSearchText
            if (_state.newSearchText !== "") {
              onQuerySearch()
            } else {
              api.asc_endFindText()
              common.view.SearchBar.updateResultsNumber()
            }
            clearInterval(_searchTimer)
            _searchTimer = undefined
          }, 10)
        }
      }
    }

    const onQuerySearch = (d, w) => {
      const searchSettings = new AscCommon.CSearchSettings()
      searchSettings.put_Text(_state.searchText)
      searchSettings.put_MatchCase(false)
      searchSettings.put_WholeWords(false)
      if (!api.asc_findText(searchSettings, d !== "back")) {
        common.view.SearchBar.disableNavButtons()
        common.view.SearchBar.updateResultsNumber()
        return false
      }
      return true
    }

    const onSearchNext = (type, text, e) => {
      if (
        text &&
        text.length > 0 &&
        ((type === "keydown" && e.keyCode === 13) || type !== "keydown")
      ) {
        _state.searchText = text
        if (onQuerySearch(type) && _searchTimer) {
          clearInterval(_searchTimer)
          _searchTimer = undefined
        }
      }
    }

    const onApiUpdateSearchCurrent = (current, all) => {
      common.view.SearchBar.disableNavButtons(current, all)
      common.view.SearchBar.updateResultsNumber(current, all)
    }

    const highlightResults = (val) => {
      if (_state.isHighlightedResults !== val) {
        api.asc_selectSearchingResults(val)
        _state.isHighlightedResults = val
      }
    }

    return {
      init: init,
      setApi: setApi,
      show: onShow,
    }
  })()
})()
