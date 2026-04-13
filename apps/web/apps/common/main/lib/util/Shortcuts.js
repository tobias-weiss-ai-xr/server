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
 *    Shortcuts.js
 *
 *    Created on 05 March 2014
 *
 */
/*
 *       Methods
 *       -------
 *
 *       @method delegateShortcuts
 *       Accepts named array of shortcuts and callbacks
 *
 *       @method suspendEvents
 *
 *       @method resetEvents
 *
 *
 *       Examples of usage
 *       ----------------
 *
 *       Common.util.Shortcuts.delegateShortcuts({
 *           shortcuts: {
 *               "ctrl+f": this.onShortcutSearch
 *           }
 *       });
 *
 *       Common.util.Shortcuts.delegateShortcuts({
 *           shortcuts: {
 *               "ctrl+f": "shortcutSearch"
 *           },
 *           shortcutSearch: function(event) {
 *           }
 *       });
 *
 *       Common.util.Shortcuts.suspendEvents('ctrl+f')
 *       Common.util.Shortcuts.resumeEvents('ctrl+f')
 * */

if (Common === undefined) {
  const Common = {}
}

Common.util = Common.util || {}

define(["backbone", "keymaster", "notification"], (Backbone) => {
  const Shortcuts = function (options) {
    this.cid = _.uniqueId("shortcuts")
    this.initialize.apply(this, arguments)
    //        return this.delegateShortcuts(options);
    return this
  }

  _.extend(Shortcuts.prototype, Backbone.Events, {
    initialize: () => {
      window.key.filter = (event) => true

      Common.NotificationCenter.on({
        "modal:show": (e) => {
          window.key.suspend()
        },
        "modal:close": (e, last) => {
          last && window.key.resume()
        },
        "modal:hide": (e, last) => {
          last && window.key.resume()
        },
      })
    },

    delegateShortcuts: function (options) {
      if (!options || !options.shortcuts) return

      this.removeShortcuts(options)

      let callback
      let match
      let method
      let scope
      let shortcut
      let shortcutKey
      const _results = []
      for (shortcut in options.shortcuts) {
        callback = options.shortcuts[shortcut]

        if (!_.isFunction(callback)) {
          method = options[callback]
          if (!method) throw new Error(`Method ${callback} does not exist`)
        } else {
          method = callback
        }

        match = shortcut.match(/^(\S+)\s*(.*)$/)
        shortcutKey = match[1]
        scope = match[2].length ? match[2] : "all"
        method = _.bind(method, this)
        _results.push(window.key(shortcutKey, scope, method))
      }
      //            return _results;
    },

    removeShortcuts: (options) => {
      if (!options || !options.shortcuts) return

      let match
      let scope
      let shortcut
      let shortcutKey
      const _results = []
      for (shortcut in options.shortcuts) {
        match = shortcut.match(/^(\S+)\s*(.*)$/)
        shortcutKey = match[1]
        scope = match[2].length ? match[2] : "all"

        window.key.unbind(shortcutKey, scope)
      }
    },

    suspendEvents: (key, scope, propagate) => {
      window.key.suspend(key, scope, propagate)
    },

    resumeEvents: (key, scope) => {
      window.key.resume(key, scope)
    },
  })

  Shortcuts.extend = Backbone.View.extend

  Common.util.Shortcuts = new Shortcuts()
})
