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
 *  FocusManager.js
 *
 *  Created on 24.09.2020
 *
 */


if (Common === undefined)
    const Common = {};

if (Common.UI === undefined) {
    Common.UI = {};
}

Common.UI.FocusManager = new(function() {
    const _tabindex = 1;
    const _windows = [];
    let _count = 0;

    const register = (fields) => {
        const arr = [];
        if (!fields.forEach) {
            fields = [fields];
        }
        fields.forEach((field) => {
            if (field) {
                let item = {};
                if (field.cmp && typeof field.selector === 'string')
                    item = field;
                else {
                    item.cmp = field;
                    if (Common.UI.ListView && field instanceof Common.UI.ListView)
                        item.selector = '.listview';
                    else if (field instanceof Common.UI.CheckBox)
                        item.selector = '.checkbox-indeterminate';
                    else if (Common.UI.RadioBox && field instanceof Common.UI.RadioBox)
                        item.selector = '.radiobox';
                    else if (Common.UI.TreeView && field instanceof Common.UI.TreeView)
                        item.selector = '.treeview';
                    else if (field instanceof Common.UI.Button)
                        item.selector = field.split ? '.btn-group' : 'button';
                    else
                        item.selector = '.form-control';
                }
                item.el = (item.cmp.$el || $(item.cmp.el || item.cmp)).find(item.selector).addBack().filter(item.selector);
                item.el?.attr && (item.cmp.setTabIndex ? item.cmp.setTabIndex(_tabindex) : item.el.attr('tabindex', _tabindex.toString()));
                arr.push(item);
            }
        });
        return arr;
    };

    const addTraps = (current) => {
        if (!current || current.traps || !current.fields || current.fields.length<1) return;

        const trapFirst = $(`<span aria-hidden="true" tabindex="${_tabindex}"></span>`);
        trapFirst.on('focus', () => {
            if (current.hidden) return;
            const fields = current.fields;
            for (let i=fields.length-1; i>=0; i--) {
                const field = fields[i];
                if ((field.cmp.isVisible ? field.cmp.isVisible() : field.cmp.is(':visible')) && !(field.cmp.isDisabled?.())) {
                    const el = (field.selector) ? (field.cmp.$el || $(field.cmp.el || field.cmp)).find(field.selector).addBack().filter(field.selector) : field.el;
                    el && setTimeout(()=> { el.focus(); }, 10);
                    break;
                }
            }
        });
        current.parent.$window.prepend(trapFirst);

        const trapLast = $(`<span aria-hidden="true" tabindex="${_tabindex+1}"></span>`);
        trapLast.on('focus', () => {
            if (current.hidden) return;
            const fields = current.fields;
            for (let i=0; i<fields.length; i++) {
                const field = fields[i];
                if ((field.cmp.isVisible ? field.cmp.isVisible() : field.cmp.is(':visible')) && !(field.cmp.isDisabled?.())) {
                    const el = (field.selector) ? (field.cmp.$el || $(field.cmp.el || field.cmp)).find(field.selector).addBack().filter(field.selector) : field.el;
                    el && setTimeout(()=> { el.focus(); }, 10);
                    break;
                }
            }
        });
        current.parent.$window.append(trapLast);
        current.traps = [trapFirst, trapLast];
    };

    const updateTabIndexes = (increment, winindex) => {
        const step = increment ? 1 : -1;
        for (const cid in _windows) {
            if (_windows.hasOwnProperty(cid)) {
                const item = _windows[cid];
                if (item && item.index < winindex && item.traps)
                    item.traps[1].attr('tabindex', (Number.parseInt(item.traps[1].attr('tabindex')) + step).toString());
                if (!increment && item && item.index > winindex) //change windows indexes when close one
                    item.index--;
            }
        }
    };

    const _insert = (e, fields, index) => { // index<0 - index from the end of array
        if (e?.cid) {
            if (_windows[e.cid]) {
                const currfields = _windows[e.cid].fields || [];
                (index<0) && (index += currfields.length);
                _windows[e.cid].fields = (index===undefined) ? currfields.concat(register(fields))
                                                             : currfields.slice(0, index).concat(register(fields)).concat(currfields.slice(index));
            } else {
                _windows[e.cid] = {
                    parent: e,
                    fields: register(fields),
                    hidden: false,
                    index: _count++
                };
            }
            addTraps(_windows[e.cid]);
            return index || 0;
        }
    };

    const _add = (e, fields) => {
        _insert(e, fields);
    };

    const _remove = (e, start, len) => {
        if (e?.cid && _windows[e.cid] && _windows[e.cid].fields && start!==undefined) {
            const removed = _windows[e.cid].fields.splice(start, len);
            removed?.forEach((item) => {
                item.el?.attr && (item.cmp.setTabIndex ? item.cmp.setTabIndex(-1) : item.el.attr('tabindex', "-1"));
            });
        }
    };

    const _init = () => {
        Common.NotificationCenter.on({
            'modal:show': (e)=> {
                if (e?.cid) {
                    if (_windows[e.cid]) {
                        _windows[e.cid].hidden = false;
                    } else {
                        _windows[e.cid] = {
                            parent: e,
                            hidden: false,
                            index: _count++
                        };
                        updateTabIndexes(true, _windows[e.cid].index);
                    }
                }
            },
            'window:show': (e)=> {
                if (e?.cid && _windows[e.cid] && !_windows[e.cid].fields) {
                    _windows[e.cid].fields = register(e.getFocusedComponents());
                    addTraps(_windows[e.cid]);
                }

                const el = e ? e.getDefaultFocusableComponent() : null;
                el && setTimeout(()=> { el.focus(); }, 100);
            },
            'modal:close': (e, last) => {
                if (e?.cid && _windows[e.cid]) {
                    updateTabIndexes(false, _windows[e.cid].index);
                    delete _windows[e.cid];
                    _count--;
                }
            },
            'modal:hide': (e, last) => {
                if (e?.cid && _windows[e.cid]) {
                    _windows[e.cid].hidden = true;
                }
            }
        });
    };

    return {
        init: _init,
        add: _add,
        insert: _insert,
        remove: _remove
    }
})();