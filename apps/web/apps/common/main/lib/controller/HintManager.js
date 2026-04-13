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
 *  HintManager.js
 *
 *  Created on 21.04.2021
 *
 */

/**
 *  Example usage with simple items:
 *
 *      <button ... data-hint="1" data-hint-direction="right" data-hint-offset="big" data-hint-title="B">...</button>
 *      <label ... data-hint="1" data-hint-direction="bottom" data-hint-offset="medium" data-hint-title="L">...</label>
 *
 *
 *  Example usage with components:
 *
 *      new Common.UI.Button({
 *          ...
 *          dataHint: '1',                  // '0' - tabs in toolbar, left and right menu, statusbar;
 *                                          // '1' - file menu, contents of toolbar tabs, contents of right and left panels
 *          dataHintDirection: 'bottom',    // top, bottom, right, left, left-top
 *          dataHintOffset: 'small',        // big - 6px, medium - 4px, small - 2px
 *          dataHintTitle : 'S'
 *      });
 *
 *      new Common.UI.CheckBox({
 *          ...
 *          dataHint: '1',
 *          dataHintDirection: 'left',
 *          dataHintOffset: 'small'
 *      });
 *
 *      new Common.UI.ComboBox({
 *          ...
 *          dataHint: '1',
 *          dataHintDirection: 'bottom',
 *          dataHintOffset: 'big'
 *      });
 *
 *      new Common.UI.InputField({
 *          ...
 *          dataHint: '1',
 *          dataHintDirection: 'left',
 *          dataHintOffset: 'small'
 *      });
 *
 *      new Common.UI.MetricSpinner({
 *          ...
 *          dataHint: '1',
 *          dataHintDirection: 'bottom',
 *          dataHintOffset: 'big'
 *      });
 *
 *      new Common.UI.RadioBox({
 *          ...
 *          dataHint: '1',
 *          dataHintDirection: 'left',
 *          dataHintOffset: 'small'
 *      });
 */


if (Common === undefined)
    const Common = {};

if (Common.UI === undefined) {
    Common.UI = {};
}

Common.UI.HintManager = new(function() {
    let _lang = 'en';
    let _arrAlphabet = [];
    let _arrEnAlphabet = [];
    let _arrQwerty = [];
    let _arrEnQwerty = [];
    let _needShow = false;
    let _hintVisible = false;
    let _currentLevel = 0;
    let _currentSection = document;
    let _currentControls = [];
    const _currentHints = [];
    let _inputLetters = '';
    let _isComplete = false;
    let _isLockedKeyEvents = false;
    let _inputTimer;
    let _isDocReady = false;
    let _isEditDiagram = false;
    let _isInternalEditorLoading = true;
    let _usedTitles = [];
    let _appPrefix;
    const _staticHints = { // for 0 level
            // "btnhome": 'K'
            // "quick-print": 'Q'
            "scroll-right": 'R',
            "scroll-left": 'V'
        };

    let _api;

    const _setCurrentSection = (btn, section) => {
        if (section) {
            _currentSection = section;
            return;
        }
        if (btn === 'esc') {
            if (_currentLevel === 0) {
                _currentSection = document;
            }
            return;
        }
        if (_isEditDiagram) {
            _currentSection = [$(window.parent.document).find('.advanced-settings-dlg:visible')[0], window.document];
        } else if ($('#file-menu-panel').is(':visible')) {
            _currentSection = $('#file-menu-panel');
        } else {
            _currentSection = (btn?.closest('.hint-section')) || document;
        }
    };

    const _lockedKeyEvents = (isLocked) => {
        if (_api && (isLocked || !Common.Utils.ModalWindow.isVisible())) {
            _isLockedKeyEvents = isLocked;
            _api.asc_enableKeyEvents(!isLocked);
        }
    };

    const _showHints = () => {
        _inputLetters = '';
        if (_currentLevel === 0) {
            Common.NotificationCenter.trigger('toolbar:collapse');
        }
        if (_currentHints.length === 0 || ($('#file-menu-panel').is(':visible' || _isEditDiagram) && _currentLevel === 1)) {
            _getHints();
        }
        if (_currentHints.length > 0) {
            !_isLockedKeyEvents && _lockedKeyEvents(true);
            _hintVisible = true;
            _currentHints.forEach((item) => {
                item.show();
            });
            _inputTimer = setInterval(() => {
                if (_inputLetters.length > 0) {
                    _inputLetters = '';
                }
            }, 5000);
        } else {
            _hintVisible = false;
        }

        Common.NotificationCenter.trigger('hints:show', _hintVisible, _currentLevel);
    };

    const _hideHints = () => {
        _hintVisible = false;
        _currentHints?.forEach((item) => {
            item.remove()
        });
        clearInterval(_inputTimer);

        Common.NotificationCenter.trigger('hints:show', false);
    };

    const _nextLevel = (level) => {
        _removeHints();
        _currentHints.length = 0;
        _currentControls.length = 0;
        if (level !== undefined) {
            _currentLevel = level;
        } else {
            _currentLevel++;
        }
    };

    const _prevLevel = () => {
        _removeHints();
        _currentHints.length = 0;
        _currentControls.length = 0;
        _currentLevel--;
    };

    const _getLetters = (countButtons) => {
        const arr = _arrAlphabet.slice();
        let firstFreeLetter;
        let ind;
        for (let i = 0; i < _arrAlphabet.length; i++) {
            if (_usedTitles.indexOf(_arrAlphabet[i]) === -1) {
                firstFreeLetter = _arrAlphabet[i];
                ind = i;
            }
            if (firstFreeLetter)
                break;
        }
        if (firstFreeLetter) {
            arr[ind] = firstFreeLetter + _arrAlphabet[0];
            for (let i = 0; arr.length < countButtons; i++) {
                const addTip = firstFreeLetter + _arrAlphabet[i];
                if (addTip !== arr[ind]) {
                    arr.push(firstFreeLetter + _arrAlphabet[i]);
                }
            }
            return arr;
        }
        return false;
    };

    const _getLetterInUILanguage = (letter) => {
        let l = letter;
        if (_arrAlphabet.indexOf(l) === -1) {
            const ind = _arrEnAlphabet.indexOf(l);
            l = _arrAlphabet[ind];
        }
        return l;
    };

    const _isItemDisabled = (item) => (item.hasClass('disabled') || item.parent().hasClass('disabled') || item.attr('disabled'));

    const _getControls = () => {
        _currentControls = [];
        _usedTitles = [];
        let arr = [];
        let itemsWithTitle = [];
        let itemsWithStaticTitle = [];
        if (_.isArray(_currentSection)) {
            _currentSection.forEach((section) => {
                arr = arr.concat($(section).find(`[data-hint=${_currentLevel}]`).toArray());
                itemsWithStaticTitle = itemsWithStaticTitle.concat($(section).find(`[data-hint-title][data-hint=${_currentLevel}]`).toArray());
                itemsWithTitle = itemsWithTitle.concat($(section).find(`[data-hint-title-lang][data-hint=${_currentLevel}]`).toArray());
            });
        } else {
            arr = $(_currentSection).find(`[data-hint=${_currentLevel}]`).toArray();
            itemsWithStaticTitle = $(_currentSection).find(`[data-hint-title][data-hint=${_currentLevel}]`).toArray();
            itemsWithTitle = $(_currentSection).find(`[data-hint-title-lang][data-hint=${_currentLevel}]`).toArray();
        }
        const visibleItems = arr.filter((item) => $(item).is(':visible'));
        const visibleItemsWithTitle = itemsWithTitle.filter((item) => $(item).is(':visible'));
        const visibleItemsWithStaticTitle = itemsWithStaticTitle.filter((item) => $(item).is(':visible'));
        if (visibleItems.length === visibleItemsWithTitle.length) { // all buttons have data-hint-title-lang
            visibleItems.forEach((item) => {
                _currentControls.push($(item));
            });
            return;
        }
        // create letter combinations
        let _arrLetters = [];
        const _usedLetters = [];
        if (_currentLevel === 0) {
            for (const key in _staticHints) {
                const t = _staticHints[key].charAt(0).toLowerCase();
                _usedTitles.push(t);
                const i = _arrAlphabet.indexOf(t);
                if (_usedLetters.indexOf(i) < 0) {
                    _usedLetters.push(i);
                }
            }
        }
        if (visibleItems.length + (_currentLevel === 0 ? _.size(_staticHints) : 0) > _arrAlphabet.length) {
            visibleItemsWithStaticTitle.forEach((item) => {
                let t = $(item).data('hint-title').charAt(0).toLowerCase();
                t = _getLetterInUILanguage(t);
                if (_usedTitles.indexOf(t) < 0) {
                    _usedTitles.push(t);
                }
            });
            _arrLetters = _getLetters(visibleItems.length + (_currentLevel === 0 ? _.size(_staticHints) : 0)); // TO DO count
        } else {
            _arrLetters = _arrAlphabet.slice();
        }
        if (!_arrLetters.length) return;
        // add attrs
        visibleItemsWithStaticTitle.forEach((item) => {
            const el = $(item);
            let title = el.attr('data-hint-title');
            if (title) {
                title = title.toLowerCase();
                const firstLetter = title.charAt(0);
                const ind = _arrEnAlphabet.indexOf(firstLetter);
                let i;
                if (_usedLetters.indexOf(ind) < 0)
                    _usedLetters.push(ind);
                if (_lang === 'en') {
                    el.attr('data-hint-title-lang', title.toUpperCase());
                } else {
                    let newTitle = '';
                    for (i = 0; i < title.length; i++) {
                        newTitle += _getLetterInUILanguage(title.charAt(i));
                    }
                    el.attr('data-hint-title-lang', newTitle.toUpperCase());
                }
            }
        });
        let index = 0;
        visibleItems.forEach((item) => {
            const el = $(item);
            while (_usedLetters.indexOf(index) !== -1) {
                index++;
            }
            const title = el.attr('data-hint-title');
            if (!title && !(index > _arrLetters.length)) {
                el.attr('data-hint-title-lang', _arrLetters[index].toUpperCase());
                index++;
            }
            _currentControls.push(el);
        });
    };

    const _getHints = () => {
        const docH = _isEditDiagram ? (window.parent.innerHeight * Common.Utils.zoom()) : (Common.Utils.innerHeight() - 20);
        const docW = _isEditDiagram ? (window.parent.innerWidth * Common.Utils.zoom()) : (Common.Utils.innerWidth());
        const section = _isEditDiagram ? _currentSection[0] : _currentSection;
        const topSection = _currentLevel !== 0 && $(section).length > 0 && !_isEditDiagram ? Common.Utils.getOffset($(section)).top : 0;
        let bottomSection = _currentLevel !== 0 && $(section).length > 0 && !_isEditDiagram ? topSection + $(section).height() : docH;
        if ($(section).prop('id') === 'toolbar' && $(section).outerHeight() < $(section).find('.box-controls').outerHeight()) {
            bottomSection += $(section).find('.box-controls').outerHeight();
        }

        if (_currentControls.length === 0)
            _getControls();
        _currentControls.forEach((item, index) => {
            if (!_isItemDisabled(item)) {
                let leftBorder = 0;
                let rightBorder = docW;
                if (!_isEditDiagram && $(_currentSection).prop('id') === 'toolbar' && ($(_currentSection).find('.toolbar-mask').length > 0)
                    || ($('#about-menu-panel').is(':visible') && item.closest('.hint-section').prop('id') === 'right-menu')) { // don't show right menu hints when about is visible
                    return;
                }
                if (window.SSE && item.parent().prop('id') === 'statusbar_bottom') {
                    const $statusbar = item.parent();
                    if (Common.Utils.getOffset(item).left > Common.Utils.getOffset($statusbar).left + $statusbar.width()) {
                        return;
                    }
                }
                if (_currentLevel === 0 && item.closest('.tabs.short').length > 0) {
                    const blockTabs = item.closest('.tabs.short');
                    leftBorder = Common.Utils.getOffset(blockTabs).left;
                    rightBorder = leftBorder + blockTabs.width();
                    if (!item.hasClass('scroll')) {
                        leftBorder += 20;
                        rightBorder -= 20;
                    }
                }
                const hint = $(`<div style="" class="hint-div">${item.attr('data-hint-title-lang')}</div>`);
                let direction = item.attr('data-hint-direction');
                if (Common.UI.isRTL() && direction) {
                    if (direction.indexOf('left')>-1)
                        direction = direction.replace('left', 'right');
                    else if (direction.indexOf('right')>-1)
                        direction = direction.replace('right', 'left');
                }

                // exceptions
                if (window.SSE && !_isEditDiagram && _currentSection.nodeType !== 9 &&
                    _currentSection.prop('id') === 'toolbar' && item.closest('.panel').attr('data-tab') === 'data') {
                    if (item.parent().hasClass('slot-sortdesc') || item.parent().hasClass('slot-btn-setfilter')) {
                        direction = 'top';
                        item.attr('data-hint-direction', 'top');
                    } else if (item.parent().hasClass('slot-btn-clear-filter') || item.parent().hasClass('slot-sortasc')) {
                        direction = 'bottom';
                        item.attr('data-hint-direction', 'bottom');
                    }
                }
                let maxHeight = docH;
                if ($('#file-menu-panel').is(':visible') && _currentLevel > 1 &&
                    ($('.fms-flex-apply').is(':visible') || $('#fms-flex-apply').is(':visible')) &&
                    item.closest('.fms-flex-apply').length < 1 && item.closest('#fms-flex-apply').length < 1) {
                    maxHeight = docH - $('.fms-flex-apply').height();
                }
                let offsets = item.attr('data-hint-offset');
                const applyOffset = offsets === 'big' ? 6 : (offsets === 'medium' ? 4 : (offsets === 'small' ? 2 : 0));
                if (applyOffset) {
                    switch (direction) {
                        case 'bottom':
                            offsets = [-applyOffset, 0];
                            break;
                        case 'top':
                            offsets = [applyOffset, 0];
                            break;
                        case 'right':
                            offsets = [0, -applyOffset];
                            break;
                        case 'left':
                            offsets = [0, applyOffset];
                            break;
                    }
                } else {
                    offsets = offsets ? item.attr('data-hint-offset').split(',').map((item) => Number.parseInt(item)) : [0, 0];
                    Common.UI.isRTL() && (offsets[1] = -offsets[1]);
                }
                const offset = Common.Utils.getOffset(item);
                let top;
                let left;
                if (direction === 'left-top') {
                    top = offset.top - 10 + offsets[0];
                    left = offset.left - 10 + offsets[1];
                } else if (direction === 'right-top') {
                    top = offset.top - 10 + offsets[0];
                    left = offset.left + (item.outerWidth() - 18) + 10 + offsets[1];
                } else if (direction === 'top') {
                    top = offset.top - 18 + offsets[0];
                    left = offset.left + (item.outerWidth() - 18) / 2 + offsets[1];
                } else if (direction === 'right') {
                    top = offset.top + (item.outerHeight() - 18) / 2 + offsets[0];
                    left = offset.left + item.outerWidth() + offsets[1];
                } else if (direction === 'left') {
                    top = offset.top + (item.outerHeight() - 18) / 2 + offsets[0];
                    left = offset.left - 18 + offsets[1];
                } else { // bottom
                    top = offset.top + item.outerHeight() + offsets[0];
                    left = offset.left + (item.outerWidth() - 18) / 2 + offsets[1];
                }

                if (top < maxHeight && left < docW && top > topSection && top < bottomSection && left > leftBorder && left + 18 < rightBorder) {
                    hint.css({
                        top: top,
                        left: left
                    });
                    if (_isEditDiagram && index < 2) {
                        hint.css('z-index', '1060');
                        $(window.parent.document.body).append(hint);
                    } else {
                        $(document.body).append(hint);
                    }
                }

                _currentHints.push(hint);
            }
        });
    };

    const _removeHints = () => {
        _currentHints?.forEach((item) => {
            item.remove()
        });
    };

    const _resetToDefault = () => {
        _currentLevel = ($('#file-menu-panel').is(':visible') || _isEditDiagram) ? 1 : 0;
        _setCurrentSection();
        _currentHints.length = 0;
        _currentControls.length = 0;
    };

    const _init = (api) => {
        if (Common.Utils.isIE || Common.UI.isMac && Common.Utils.isGecko) // turn off hints on IE and FireFox (shortcut F6 selects link in address bar)
            return;
        _api = api;

        const filter = Common.localStorage.getKeysFilter();
        _appPrefix = (filter?.length) ? filter.split(',')[0] : '';

        Common.NotificationCenter.on({
            'app:ready': (mode) => {
                const lang = mode.lang ? mode.lang.toLowerCase() : 'en';
                _getAlphabetLetters(lang);
                _isDocReady = true;
            },
            'hints:clear': _clearHints,
            'window:resize': _clearHints
        });
        $('#editor_sdk').on('click', () => {
            _clearHints();
        });
        $(document).on('mousedown', () => {
            _clearHints();
        });
        $(document).on('keyup', (e) => {
            if ((e.keyCode === Common.UI.Keys.ALT || e.keyCode === 91) && _needShow && !(window.SSE?.getController('Statusbar').getIsDragDrop())) {
                e.preventDefault();
                if (!_hintVisible) {
                    $('input:focus').blur(); // to change value in inputField
                    _currentLevel = ($('#file-menu-panel').is(':visible') || _isEditDiagram) ? 1 : 0;
                    _setCurrentSection();
                    _showHints();
                } else {
                    _hideHints();
                    _resetToDefault();
                    if (_isLockedKeyEvents) {
                        _isLockedKeyEvents = false;
                        _api.asc_enableKeyEvents(true);
                    }
                }
            } else if (_hintVisible) {
                e.preventDefault();
            }
            _needShow = false;
        });
        $(document).on('keydown', (e) => {
            if (_hintVisible) {
                e.preventDefault();
                if (e.keyCode === Common.UI.Keys.ESC ) {
                    setTimeout(() => {
                        if (_currentLevel === 0) {
                            _hideHints();
                            _resetToDefault();
                            _lockedKeyEvents(false);
                        } else {
                            _prevLevel();
                            _setCurrentSection('esc');
                            _showHints();
                        }
                    }, 10);
                } else {
                    let curLetter = null;
                    let match = false;
                    const keyCode = e.keyCode;
                    if (keyCode !== 16 && keyCode !== 17 && keyCode !== 18 && keyCode !== 91) {
                        curLetter = _lang === 'en' ?
                            ((keyCode > 47 && keyCode < 58 || keyCode > 64 && keyCode < 91) ? String.fromCharCode(e.keyCode) : null) :
                            (/[.*+?^${}()|[\]\\]/g.test(e.key) ? null : e.key);
                    }
                    if (curLetter) {
                        let curr;
                        if (_lang !== 'en' && _arrAlphabet.indexOf(curLetter.toLowerCase()) === -1) {
                            const ind = _arrEnQwerty.indexOf(curLetter.toLowerCase());
                            if (ind !== -1) {
                                curLetter = _arrQwerty[ind];
                            }
                        }
                        _inputLetters = _inputLetters + curLetter.toUpperCase();
                        for (let i = 0; i < _currentControls.length; i++) {
                            const item = _currentControls[i];
                            if (!_isItemDisabled(item)) {
                                const title = item.attr('data-hint-title-lang');
                                const regExp = new RegExp(`^${_inputLetters}`);
                                if (regExp.test(title)) {
                                    match = true;
                                }
                                if (title === _inputLetters) {
                                    curr = item;
                                    break;
                                }
                            }
                        }
                        if (curr) {
                            Common.UI.ScreenReaderFocusManager?.exitFocusMode();
                            const tag = curr.prop("tagName").toLowerCase();
                            if (window.SSE && curr.parent().prop('id') === 'statusbar_bottom') {
                                _hideHints();
                                curr.contextmenu();
                                _resetToDefault();
                            } else if (tag === 'input' || tag === 'textarea') {
                                _hideHints();
                                curr.trigger(jQuery.Event('click', {which: 1}));
                                curr.focus();
                                _resetToDefault();
                            } else if (curr.hasClass('listview')) {
                                _hideHints();
                                curr.focus();
                                _resetToDefault();
                            } else {
                                _isComplete = false;
                                _hideHints();
                                if (!_isEditDiagram && $(_currentSection).prop('id') === 'toolbar' && ($(_currentSection).find('.toolbar-mask').length > 0)) {
                                    _resetToDefault();
                                    return;
                                }
                                const needOpenPanel = (curr.attr('content-target') && !$(`#${curr.attr('content-target')}`).is(':visible') ||
                                    (curr.parent().prop('id') === 'slot-btn-chat' && !$('#left-panel-chat').is(':visible')) ||
                                    (curr.parent().hasClass('ribtab') && !$('#toolbar').children('.toolbar').hasClass('expanded')));
                                if ((!curr.attr('content-target') && curr.parent().prop('id') !== 'slot-btn-chat') || needOpenPanel) { // need to open panel
                                    if (!($('#file-menu-panel').is(':visible') && (curr.parent().prop('id') === 'fm-btn-info' && $('#panel-info').is(':visible') ||
                                        curr.parent().prop('id') === 'fm-btn-settings' && $('#panel-settings').is(':visible')))) {
                                        if (curr.attr('for')) { // to trigger event in checkbox
                                            $(`#${curr.attr('for')}`).trigger(jQuery.Event('click', {which: 1}));
                                        } else {
                                            curr.trigger(jQuery.Event('click', {which: 1}));
                                            if (needOpenPanel)
                                                _isComplete = false; // to show next level of hints
                                        }
                                    }
                                }
                                if (curr.prop('id') === 'btn-go-back' || curr.closest('.btn-slot').prop('id') === 'slot-btn-options' ||
                                    curr.closest('.btn-slot').prop('id') === 'slot-btn-mode' || curr.prop('id') === 'id-btn-favorite' || curr.parent().prop('id') === 'tlb-box-users' ||
                                    curr.prop('id') === 'left-btn-thumbs' || curr.hasClass('scroll') || curr.prop('id') === 'left-btn-about' ||
                                    curr.prop('id') === 'left-btn-support' || curr.closest('.btn-slot').prop('id') === 'slot-btn-search' ||
                                    curr.closest('.btn-slot').prop('id') === 'slot-btn-edit-mode') {
                                    _resetToDefault();
                                    return;
                                }
                                if (curr.prop('id') === 'add-comment-doc') {
                                    _removeHints();
                                    _currentHints.length = 0;
                                    _currentControls.length = 0;
                                    _showHints();
                                    return;
                                }
                                if (!_isComplete) {
                                    if (curr.parent().prop('id') === 'slot-btn-chat') {
                                        _nextLevel(1);
                                        _setCurrentSection(undefined, $('#left-menu.hint-section'));
                                    } else if (curr.prop('id') === 'id-right-menu-signature') {
                                        _nextLevel(2);
                                        _setCurrentSection(curr);
                                    } else {
                                        _nextLevel();
                                        _setCurrentSection(curr);
                                    }
                                    _showHints();
                                    if (_currentHints.length < 1) {
                                        _resetToDefault();
                                    }
                                }
                            }
                        } else if (!match) {
                            _inputLetters = '';
                        }
                    }
                }
            }

            _needShow = (Common.Utils.InternalSettings.get(`${_appPrefix}settings-show-alt-hints`) && !e.shiftKey &&
                e.keyCode === Common.UI.Keys.ALT && !Common.Utils.ModalWindow.isVisible() && _isDocReady && _arrAlphabet.length > 0 &&
                !(window.PE && $('#pe-preview').is(':visible')) && !(Common.UI.ScreenReaderFocusManager?.isFocusMode()));
            if (Common.Utils.InternalSettings.get(`${_appPrefix}settings-show-alt-hints`) && e.altKey && e.keyCode !== 115 && _isInternalEditorLoading) {
                e.preventDefault();
            }
        });
    };

    const _getAlphabetLetters = (lng) => {
        Common.Utils.loadConfig('../../common/main/resources/alphabetletters/alphabetletters.json', (langsJson) => {
            _arrEnAlphabet = langsJson.en;
            const _setAlphabet = (lang) => {
                _lang = lang;
                _arrAlphabet = langsJson[lang];
                return _arrAlphabet;
            };
            const loaded = !_setAlphabet(lng) ? (!_setAlphabet(lng.split(/[\-_]/)[0]) ? _setAlphabet('en') : true) : true;
            if (loaded && _lang !== 'en') {
                for (const key in _staticHints) {
                    const hint = _getLetterInUILanguage(_staticHints[key].toLowerCase());
                    if (hint) {
                        _staticHints[key] = hint.toUpperCase();
                    }
                }
            }
            return loaded;
        });
        Common.Utils.loadConfig('../../common/main/resources/alphabetletters/qwertyletters.json', (langsJson) => {
            _arrQwerty = langsJson[_lang];
            if (_lang !== 'en') {
                _arrEnQwerty = langsJson.en;
            }
        });
    };

    const _needCloseFileMenu = () => !(_hintVisible && _currentLevel > 1);

    const _clearHints = (isComplete, leaveLockedKeyEvents) => {
        if (Common.Utils.isIE || Common.UI.isMac && Common.Utils.isGecko)
            return;
        _hintVisible && _hideHints();
        if (_currentHints.length > 0) {
            _resetToDefault();
        }
        !leaveLockedKeyEvents && _isLockedKeyEvents && _lockedKeyEvents(false);

        if (isComplete) {
            _isComplete = true;
        }

        if ($('.hint-div').length > 0) {
            $('.hint-div').remove();
        }
        if ($('iframe').length > 0) {
            try {
                $('iframe').contents().find('.hint-div').remove();
            } catch (e) {}
        }
    };

    const _isHintVisible = () => _hintVisible;

    const _setMode = (mode) => {
        _isEditDiagram = mode.isEditDiagram || mode.isEditMailMerge || mode.isEditOle;
        _setInternalEditorLoading(!!_isEditDiagram);
    };

    const _getStaticHint = (key) => _staticHints[key];

    const _setInternalEditorLoading = (load) => {
        if (_isInternalEditorLoading !== load) {
            _isInternalEditorLoading = load;
        }
    };

    return {
        init: _init,
        setMode: _setMode,
        clearHints: _clearHints,
        needCloseFileMenu: _needCloseFileMenu,
        isHintVisible: _isHintVisible,
        getStaticHint: _getStaticHint,
        setInternalEditorLoading: _setInternalEditorLoading
    }
})();