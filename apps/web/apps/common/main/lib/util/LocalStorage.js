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
 *    LocalStorage.js
 *
 *    Created on 31 July 2015
 *
 */

define(["gateway"], () => {
  Common.localStorage = new (function () {
    let _storeName
    let _filter
    let _store = {}

    const ongetstore = (data) => {
      if (data.type === "localstorage") {
        _store = data.keys
      }
    }

    Common.Gateway.on("internalcommand", ongetstore)

    const _refresh = () => {
      // if (!_lsAllowed)
      //     Common.Gateway.internalMessage('localstorage', {cmd:'get', keys:_filter});
    }

    const _save = () => {
      // if (!_lsAllowed)
      //     Common.Gateway.internalMessage('localstorage', {cmd:'set', keys:_store});
    }

    const _setItem = (name, value, just) => {
      if (_lsAllowed) {
        try {
          localStorage.setItem(name, value)
        } catch (error) {}
      } else {
        _store[name] = value

        // if (just===true) {
        // TDDO: remove after ver 7.2. using external local storage is depricated
        // Common.Gateway.internalMessage('localstorage', {
        //     cmd:'set',
        //     keys: {
        //         name: value
        //     }
        // });
        // }
      }
    }

    const _setItemAsBool = (name, value, just) => {
      _setItem(name, value ? 1 : 0, just)
    }

    const _getItem = (name) => {
      if (_lsAllowed) return localStorage.getItem(name)

      return _store[name] === undefined ? null : _store[name]
    }

    const _getItemAsBool = (name, defValue) => {
      const value = _getItem(name)
      defValue = defValue || false
      return value !== null ? Number.parseInt(value) !== 0 : defValue
    }

    const _getItemAsInt = (name, defValue) => {
      const value = _getItem(name)
      return value !== null ? Number.parseInt(value) : defValue || 0
    }

    const _getItemExists = (name) => {
      const value = _getItem(name)
      return value !== null
    }

    const _removeItem = (name) => {
      if (_lsAllowed) localStorage.removeItem(name)
      else delete _store[name]
    }

    try {
      localStorage.setItem("test", 1) // for WebView checking !!window.localStorage not enough
      localStorage.removeItem("test")
      const _lsAllowed = true
    } catch (e) {
      _lsAllowed = false
    }

    return {
      getId: () => _storeName,
      setId: (name) => {
        _storeName = name
      },
      getItem: _getItem,
      getItemAsInt: _getItemAsInt,
      getBool: _getItemAsBool,
      setBool: _setItemAsBool,
      setItem: _setItem,
      removeItem: _removeItem,
      setKeysFilter: (value) => {
        _filter = value
      },
      getKeysFilter: () => _filter,
      itemExists: _getItemExists,
      sync: _refresh,
      save: _save,
    }
  })()
})
