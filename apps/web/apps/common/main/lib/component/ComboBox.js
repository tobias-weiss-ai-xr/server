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
 *  ComboBox.js
 *
 *  Created on 1/22/14
 *
 */

/**
 *  Using template
 *
 *  <div class="input-group input-group-nr combobox" id="id-combobox">
 *      <input type="text" class="form-control">
 *      <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></button>
 *      <ul class="dropdown-menu"></ul>
 * </div>
 *
 */

if (Common === undefined)
    const Common = {};

define([
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Scroller'
], () => {

    Common.UI.ComboBoxModel = Backbone.Model.extend({
        defaults: () => ({
                id: Common.UI.getId(),
                value: null,
                displayValue: null
            })
    });

    Common.UI.ComboBoxStore = Backbone.Collection.extend({
        model: Common.UI.ComboBoxModel
    });

    Common.UI.ComboBox = Common.UI.BaseView.extend((() => ({
            options : {
                id          : null,
                cls         : '',
                style       : '',
                hint        : false,
                editable    : true,
                disabled    : false,
                menuCls     : '',
                menuStyle   : '',
                menuAlignEl : null,
                restoreMenuHeight: true,
                displayField: 'displayValue',
                valueField  : 'value',
                search      : false,
                searchFields: ['displayValue'], // Property name from the item to be searched by
                placeHolder : '',
                scrollAlwaysVisible: false,
                takeFocusOnClose: false,
                dataHint: '',
                dataHintDirection: '',
                dataHintOffset: ''
            },

            template: _.template([
                '<span class="input-group combobox <%= cls %>" id="<%= id %>" style="<%= style %>">',
                    '<input type="text" class="form-control" spellcheck="false" placeholder="<%= placeHolder %>" role="combobox" aria-controls="<%= id %>-menu" aria-expanded="false" data-hint="<%= dataHint %>" data-hint-direction="<%= dataHintDirection %>" data-hint-offset="<%= dataHintOffset %>" data-move-focus-only-tab="true">',
                    '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">',
                        '<span class="caret"></span>',
                    '</button>',
                    '<ul id="<%= id %>-menu" class="dropdown-menu <%= menuCls %>" style="<%= menuStyle %>" role="menu">',
                        '<% _.each(items, function(item) { %>',
                            '<li id="<%= item.id %>" data-value="<%- item.value %>"><a tabindex="-1" type="menuitem" role="menuitemcheckbox" aria-checked="false"><%= scope.getDisplayValue(item) %></a></li>',
                        '<% }); %>',
                    '</ul>',
                '</span>'
            ].join('')),

            initialize : function(options) {
                Common.UI.BaseView.prototype.initialize.call(this, options);

                this.id             = this.options.id || Common.UI.getId();
                this.cls            = this.options.cls;
                this.style          = this.options.style;
                this.menuCls        = this.options.menuCls;
                this.menuStyle      = this.options.menuStyle;
                this.template       = this.options.template || this.template;
                this.itemsTemplate  = this.options.itemsTemplate;
                this.itemTemplate   = this.options.itemTemplate;
                this.hint           = this.options.hint;
                this.editable       = this.options.editable;
                this.disabled       = this.options.disabled;
                this.store          = this.options.store || new Common.UI.ComboBoxStore();
                this.displayField   = this.options.displayField;
                this.valueField     = this.options.valueField;
                this.placeHolder    = this.options.placeHolder;
                this.search         = this.options.search;
                this.searchFields   = this.options.searchFields;
                this.scrollAlwaysVisible = this.options.scrollAlwaysVisible;
                this.focusWhenNoSelection = (this.options.focusWhenNoSelection!==false);
                this.restoreMenuHeight = this.options.restoreMenuHeight;

                this.rendered         = this.options.rendered || false;

                this.lastValue = null;

                this.store.add(this.options.data);

                if (this.options.el) {
                    this.render();
                }
            },

            render : function(parentEl) {

                if (!this.rendered) {
                    const items = this.store.toJSON();
                    this.cmpEl = $(this.template({
                        id          : this.id,
                        cls         : this.cls,
                        style       : this.style,
                        menuCls     : this.menuCls,
                        menuStyle   : this.menuStyle,
                        items       : items,
                        scope       : this,
                        placeHolder : this.placeHolder,
                        dataHint    : this.options.dataHint,
                        dataHintDirection: this.options.dataHintDirection,
                        dataHintOffset: this.options.dataHintOffset,
                        isRTL       : Common.UI.isRTL()
                    }));
                    if (this.itemsTemplate)
                        this.cmpEl.find('ul').html(
                            $(this.itemsTemplate({
                                items       : items,
                                scope       : this
                            })));
                    else if (this.itemTemplate) {
                        this.cmpEl.find('ul').html($(_.template([
                            '<% _.each(items, function(item) { %>',
                            '<%= itemTemplate(item) %>',
                            '<% }); %>'
                        ].join(''))({
                            items: items,
                            itemTemplate: this.itemTemplate,
                            scope: this
                        })));
                    }

                    if (parentEl) {
                        this.setElement(parentEl, false);
                        parentEl.html(this.cmpEl);
                    } else {
                        this.$el.html(this.cmpEl);
                    }
                } else {
                    this.cmpEl = this.$el || $(this.el);
                }

                if (!this.rendered) {
                    const el = this.cmpEl;

                    this._input  = el.find('input');
                    this._button = el.find('.btn');

                    el.on('click',      'a', _.bind(this.itemClicked, this));
                    el.on('mousedown',  'a', _.bind(this.itemMouseDown, this));

                    if (this.editable) {
                        el.on('change', 'input', _.bind(this.onInputChanged, this));
                        el.on('input', 'input', _.bind(this.onInputChanging, this));
                        el.on('keydown', 'input', _.bind(this.onInputKeyDown, this));
                        el.on('focusin', 'input', _.bind(this.onInputFocusIn, this));
                        el.on('click', '.form-control', _.bind(this.onEditableInputClick, this));
                    } else {
                        el.on('click', '.form-control', _.bind(this.onInputClick, this));
                        this._input.attr('readonly', 'readonly');
                        this._input.attr('data-can-copy', false);
                        this._input.on('mousedown',(e)=> {e.preventDefault();})
                    }

                    if (this.options.hint) {
                        el.attr('data-toggle', 'tooltip');
                        el.tooltip({
                            title       : this.options.hint,
                            placement   : this.options.hintAnchor||'cursor'
                        });

                        const modalParents = el.closest('.asc-window');
                        if (modalParents.length > 0) {
                            el.data('bs.tooltip').tip().css('z-index', Number.parseInt(modalParents.css('z-index')) + 10);
                            const onModalClose = (dlg) => {
                                if (modalParents[0] !== dlg.$window[0]) return;
                                const tip = el.data('bs.tooltip');
                                if (tip) {
                                    if (tip.dontShow===undefined)
                                        tip.dontShow = true;

                                    tip.hide();
                                }
                                Common.NotificationCenter.off({'modal:close': onModalClose});
                            };
                            Common.NotificationCenter.on({'modal:close': onModalClose});
                        }

                        el.find('.dropdown-menu').on('mouseenter', ()=> { // hide tooltip when mouse is over menu
                            const tip = el.data('bs.tooltip');
                            if (tip) {
                                if (tip.dontShow===undefined)
                                    tip.dontShow = true;
                                tip.hide();
                            }
                        });
                    }

                    const $list = el.find('.dropdown-menu');
                    if ($list.hasClass('menu-absolute')) {
                        $list.css('min-width', el.outerWidth());
                    }

                    el.on('show.bs.dropdown',             _.bind(this.onBeforeShowMenu, this));
                    el.on('shown.bs.dropdown',            _.bind(this.onAfterShowMenu, this));
                    el.on('hide.bs.dropdown',             _.bind(this.onBeforeHideMenu, this));
                    el.on('hidden.bs.dropdown',           _.bind(this.onAfterHideMenu, this));
                    el.on('keydown.after.bs.dropdown',    _.bind(this.onAfterKeydownMenu, this));

                    Common.NotificationCenter.on('menumanager:hideall', _.bind(this.closeMenu, this));

                    // set default selection
                    this.setDefaultSelection();

                    this.listenTo(this.store, 'reset',  this.onResetItems);

                    const ariaLabel = this.options.ariaLabel ? this.options.ariaLabel : this.options.hint;
                    if (ariaLabel)
                        this.cmpEl.find('.form-control').attr('aria-label', ariaLabel);
                }

                this.rendered = true;
                if (this.disabled) this.setDisabled(this.disabled);

                return this;
            },

            setData: function(data) {
                this.store.reset([]);
                this.store.add(data);

                this.setRawValue('');
                this.onResetItems();
            },

            openMenu: function(delay, callback) {
                if (this.store.length<1) return;

                if ( !this.scroller ) {
                    this.scroller = new Common.UI.Scroller(_.extend({
                        el: $('.dropdown-menu', this.cmpEl),
                        minScrollbarLength: 40,
                        includePadding: true,
                        wheelSpeed: 10,
                        alwaysVisibleY: this.scrollAlwaysVisible
                    }, this.options.scroller));
                }

                _.delay(()=> {
                    this.cmpEl.addClass('open');
                    callback?.();
                }, delay || 0);
            },

            closeMenu: function() {
                this.cmpEl.removeClass('open');
                this.cmpEl.find('.form-control').attr('aria-expanded', 'false');
            },

            isMenuOpen: function() {
                return this.cmpEl.hasClass('open');
            },

            onBeforeShowMenu: function(e) {
                if ( !this.scroller ) {
                    this.scroller = new Common.UI.Scroller(_.extend({
                        el: $('.dropdown-menu', this.cmpEl),
                        minScrollbarLength: 40,
                        includePadding: true,
                        wheelSpeed: 10,
                        alwaysVisibleY: this.scrollAlwaysVisible
                    }, this.options.scroller));
                }

                Common.NotificationCenter.trigger('menu:show');
                this.trigger('show:before', this, e);
                if (this.options.hint) {
                    const tip = this.cmpEl.data('bs.tooltip');
                    if (tip) {
                        if (tip.dontShow===undefined)
                            tip.dontShow = true;
                        tip.hide();
                    }
                }

                const $list = this.cmpEl.find('ul');
                const isMenuAbsolute = $list.hasClass('menu-absolute');
                if (this.options.restoreMenuHeightAndTop || isMenuAbsolute) {
                    const offset = Common.Utils.getOffset(this.cmpEl);
                    const parentTop = this.options.menuAlignEl ? Common.Utils.getOffset(this.options.menuAlignEl).top : 0;
                    const marginTop = Number.parseInt($list.css('margin-top'));
                    let menuTop = offset.top - parentTop + this.cmpEl.outerHeight() + marginTop;
                    let menuLeft = offset.left;

                    if (this.options.restoreMenuHeightAndTop) { // show menu at top
                        const parentHeight = this.options.menuAlignEl ? this.options.menuAlignEl.outerHeight() : Common.Utils.innerHeight() - 10;
                        const diff = typeof this.options.restoreMenuHeightAndTop === "number" ? this.options.restoreMenuHeightAndTop : 100000;

                        const showAtTop = (menuTop + $list.outerHeight() > parentHeight) && (menuTop + diff > parentHeight) && ((offset.top - parentTop)*0.9 > parentHeight - menuTop);
                        // if menu height less than restoreMenuHeightAndTop - show menu at top, if greater - try to change menu height + compare available space at top and bottom of combobox
                        if (!isMenuAbsolute)
                            $list.toggleClass('show-top', showAtTop);
                        else if (showAtTop)
                            menuTop = offset.top - parentTop - $list.outerHeight();
                    }
                    if (isMenuAbsolute) {
                        if (menuLeft + $list.outerWidth()>Common.Utils.innerWidth())
                            menuLeft += (this.cmpEl.outerWidth() - $list.outerWidth());
                        $list.css({left: menuLeft, top: menuTop + parentTop});
                    }
                }
            },

            onAfterShowMenu: function(e) {
                this.alignMenuPosition();
                const $list = $(this.el).find('ul');
                const $selected = $list.find('> li.selected');

                if ($selected.length) {
                    const itemTop = Common.Utils.getPosition($selected).top;
                    const itemHeight = $selected.outerHeight();
                    const listHeight = $list.outerHeight();

                    if (itemTop < 0 || itemTop + itemHeight > listHeight) {
                        let height = $list.scrollTop() + itemTop + (itemHeight - listHeight)/2;
                        height = (Math.floor(height/itemHeight) * itemHeight);
                        $list.scrollTop(height);
                    }
                    setTimeout(()=> {$selected.find('a').focus();}, 1);
                } else if (this.focusWhenNoSelection) {
                    setTimeout(()=> {this.cmpEl.find('ul li:first a').focus();}, 1);
                }

                if (this.scroller)
                    this.scroller.update({alwaysVisibleY: this.scrollAlwaysVisible});

                this.cmpEl.find('.form-control').attr('aria-expanded', 'true');

                this.trigger('show:after', this, e, {fromKeyDown: e===undefined});
                this._search = {};
            },

            alignMenuPosition: function () {
                if (this.restoreMenuHeight) {
                    const $list = $(this.el).find('ul');
                    if (typeof this.restoreMenuHeight !== "number") {
                        const maxHeight = Number.parseFloat($list.css('max-height'));
                        if ($list.hasClass('scrollable-menu') || maxHeight) {
                            this.restoreMenuHeight = maxHeight ? maxHeight : 100000;
                        } else {
                            this.restoreMenuHeight = 100000;
                        }
                    }
                    const cg = Common.Utils.croppedGeometry();
                    const parentTop = this.options.menuAlignEl ? Common.Utils.getOffset(this.options.menuAlignEl).top : cg.top;
                    const parentHeight = this.options.menuAlignEl ? this.options.menuAlignEl.outerHeight() : cg.height - 10;
                    const menuH = $list.outerHeight();
                    const menuTop = Common.Utils.getBoundingClientRect($list.get(0)).top;
                    let newH = menuH;

                    if (menuH < this.restoreMenuHeight)
                        newH = this.restoreMenuHeight;

                    const offset = Common.Utils.getOffset(this.cmpEl);
                    if (menuTop<offset.top) { // menu is shown at top
                        if (offset.top - parentTop < newH)
                            newH = offset.top - parentTop;
                    } else {
                        if (menuTop + newH > parentHeight + parentTop)
                            newH = parentHeight + parentTop - menuTop;
                    }

                    if (newH !== menuH) {
                        $list.css('max-height', `${newH}px`);
                        $list.hasClass('menu-absolute') && (menuTop<offset.top) && $list.css({top: offset.top - $list.outerHeight()});
                    }
                }
            },

            onBeforeHideMenu: function(e) {
                this.trigger('hide:before', this, e);

                if (Common.UI.Scroller.isMouseCapture())
                    e.preventDefault();
            },

            onAfterHideMenu: function(e, isFromInputControl) {
                this.cmpEl.find('.dropdown-toggle').blur();
                this.cmpEl.find('.form-control').attr('aria-expanded', 'false');
                this.trigger('hide:after', this, e, isFromInputControl);
                Common.NotificationCenter.trigger('menu:hide', this, isFromInputControl);
                if (this.options.takeFocusOnClose) {
                    (this._input && this._input.length>0 && !this.editable) && (this._input[0].selectionStart===this._input[0].selectionEnd) && setTimeout(() => {
                        this._input[0].selectionStart = this._input[0].selectionEnd = 0;
                    },1);
                    setTimeout(()=> {this.focus();}, 1);
                }
            },

            onAfterKeydownMenu: function(e) {
                if (e.keyCode === Common.UI.Keys.DOWN && !this.editable && !this.isMenuOpen()) {
                    this.onBeforeShowMenu();
                    this.openMenu(0, () => {
                        this.onAfterShowMenu();
                    });
                    return false;
                }if (!this.focusWhenNoSelection && (e.keyCode === Common.UI.Keys.DOWN || e.keyCode === Common.UI.Keys.UP)) {
                    const $items = this.cmpEl.find('ul > li a');
                    if ($items.filter(':focus').length===0 && $items.length>0) {
                        setTimeout(()=> {$items[e.keyCode === Common.UI.Keys.DOWN ? 0 : $items.length-1].focus();}, 1);
                    }
                } else if (e.keyCode === Common.UI.Keys.RETURN && (this.editable || this.isMenuOpen())) {
                    const isopen = this.isMenuOpen();
                    $(e.target).click();
                    if (this.rendered) {
                        if (Common.Utils.isIE)
                            this._input.trigger('change', { onkeydown: true });
                        else
                            this._input.blur();
                    }
                    return !isopen;
                }
                else if (e.keyCode === Common.UI.Keys.ESC && this.isMenuOpen()) {
                    this._input.val(this.lastValue);
                    this.closeMenu();
                    this.onAfterHideMenu(e);
                    return false;
                }  else if (this.search && e.keyCode > 64 && e.keyCode < 91 && e.key){
                    if (typeof this._search !== 'object') return;

                    clearTimeout(this._search.timer);
                    this._search.timer = setTimeout(() => { this._search = {}; }, 1000);

                    (!this._search.text) && (this._search.text = '');
                    (!this._search.char) && (this._search.char = e.key);
                    (this._search.char !== e.key) && (this._search.full = true);
                    this._search.text += e.key;
                    if (this._search.index===undefined) {
                        const $items = this.cmpEl.find('ul > li').find('> a');
                        this._search.index = $items.index($items.filter(':focus'));
                    }
                    this.selectCandidate();
                }
            },

            selectCandidate: function() {
                const index = (this._search.index && this._search.index !== -1) ? this._search.index : 0;
                const re = new RegExp(`^${(this._search.full) ? this._search.text : this._search.char}`, 'i');
                const isFirstCharsEqual = this.searchFields.some((field) => re.test(this.store.at(index).get(field)));
                let itemCandidate;
                let idxCandidate;

                for (let i=0; i<this.store.length; i++) {
                    const item = this.store.at(i);
                    let isBreak = false;
                    this.searchFields.forEach((fieldName) => {
                        if (item.get(fieldName) && re.test(item.get(fieldName))) {
                            if (!itemCandidate) {
                                itemCandidate = item;
                                idxCandidate = i;
                                if(!isFirstCharsEqual) {
                                    isBreak = true;
                                    return;
                                }
                            }
                            if (this._search.full && i===index || i>index) {
                                itemCandidate = item;
                                idxCandidate = i;
                                isBreak = true;
                                return;
                            }
                        }
                    });
                    if(isBreak) break;
                }

                if (itemCandidate) {
                    this._search.index = idxCandidate;
                    const item = $(`#${itemCandidate.get('id')} a`, $(this.el));
                    if (this.scroller) {
                        this.scroller.update({alwaysVisibleY: this.scrollAlwaysVisible});
                        const $list = $(this.el).find('ul');
                        const itemTop = Common.Utils.getPosition(item).top;
                        const itemHeight = item.outerHeight();
                        const listHeight = $list.outerHeight();
                        if (itemTop < 0 || itemTop + itemHeight > listHeight) {
                            let height = $list.scrollTop() + itemTop;
                            height = (Math.floor(height/itemHeight) * itemHeight);
                            $list.scrollTop(height);
                        }
                    }
                    item.focus();
                }
            },

            onInputKeyDown: function(e) {

                if (e.keyCode === Common.UI.Keys.ESC){
                    this._input.val(this.lastValue);
                    this.closeMenu();
                    this.onAfterHideMenu(e);
                } else if (e.keyCode === Common.UI.Keys.UP || e.keyCode === Common.UI.Keys.DOWN) {
                    if (!this.isMenuOpen()) {
                        this.openMenu(0, () => {
                            this.onAfterShowMenu();
                        });
                    }

                    _.delay(() => {
                        this._skipInputChange = true;
                        this.cmpEl.find('ul li:first a').focus();
                    }, 10);
                } else if (e.keyCode === Common.UI.Keys.RETURN && $(e.target).val() === this.lastValue){
                    this._input.trigger('change', { reapply: true });
                } else
                    this._skipInputChange = false;
            },

            onInputFocusIn: function(e) {
                this.trigger('combo:focusin', this, e);
            },

            onInputChanged: function(e, extra) {
                // skip processing for internally-generated synthetic event
                // to avoid double processing
                if (extra?.synthetic)
                    return;

                if (this._skipInputChange) {
                    this._skipInputChange = false; return;
                }

                const val = $(e.target).val();
                let record = {};

                if (this.lastValue === val && !(extra?.reapply)) {
                    if (extra?.onkeydown)
                        this.trigger('combo:blur', this, e);
                    return;
                }

                record[this.valueField] = val;

                this.trigger('changed:before', this, record, e);

                if (e.isDefaultPrevented())
                    return;

                let obj;
                this._selectedItem = this.store.findWhere((obj={}, obj[this.displayField]=val, obj));

                if (this._selectedItem) {
                    record = this._selectedItem.toJSON();
                    const $selectedItems = $('.selected', $(this.el));
                    $selectedItems.removeClass('selected');
                    $selectedItems.find('a').attr('aria-checked', false);
                    const $newSelectedItem = $(`#${this._selectedItem.get('id')}`, $(this.el));
                    $newSelectedItem.addClass('selected');
                    $newSelectedItem.find('a').attr('aria-checked', true);
                }

                // trigger changed event
                this.trigger('changed:after', this, record, e);
            },

            onInputChanging: function(e, extra) {
                const newValue = $(e.target).val();

                if (e.isDefaultPrevented())
                    return;

                // trigger changing event
                this.trigger('changing', this, newValue, e);
            },

            onInputClick: function(e) {
                if (this._button)
                    this._button.dropdown('toggle');

                e.preventDefault();
                e.stopPropagation();
            },

            onEditableInputClick: function(e) {
                if (this.options.hint) {
                    const tip = this.cmpEl.data('bs.tooltip');
                    if (tip) {
                        if (tip.dontShow===undefined)
                            tip.dontShow = true;
                        tip.hide();
                    }
                }
                if (this.isMenuOpen() && e.which === 1)
                    e.stopPropagation();
            },

            setDefaultSelection: function () {
                if (!this.rendered)
                    return;

                const val = this._input.val();
                let obj;

                if (val) {
                    this._selectedItem = this.store.findWhere((obj={}, obj[this.displayField]=val, obj));

                    if (this._selectedItem) {
                        const $selectedItems = $('.selected', $(this.el));
                        const $newSelectedItem = $(`#${this._selectedItem.get('id')}`, $(this.el));
                        $selectedItems.removeClass('selected');
                        $selectedItems.find('a').attr('aria-checked', false);
                        $newSelectedItem.addClass('selected');
                        $newSelectedItem.find('a').attr('aria-checked', true);
                    }
                }
            },

            setDisabled: function(disabled) {
                disabled = !!disabled;
                this.disabled = disabled;

                if (!this.rendered)
                    return;

                disabled
                    ? this._input.attr('disabled', true)
                    : this._input.removeAttr('disabled');

                this.cmpEl.toggleClass('disabled', disabled);
                this._button.toggleClass('disabled', disabled);
            },

            isDisabled: function() {
                return this.disabled;
            },

            setRawValue: function(value) {
                if (this.rendered)  {
                    this._input.val(value).trigger('change', { synthetic: true });
                    this.lastValue = (value!==null && value !== undefined) ?  value.toString() : value;
                }
            },

            getRawValue: function() {
                return this.rendered ? this._input.val() : null;
            },

            setValue: function(value, defValue) {
                if (!this.rendered)
                    return;

                let obj;
                this._selectedItem = this.store.findWhere((obj={}, obj[this.valueField]=value, obj));

                const $selectedItems = $('.selected', $(this.el));
                $selectedItems.removeClass('selected');
                $selectedItems.find('a').attr('aria-checked', false);

                if (this._selectedItem) {
                    this.setRawValue(this._selectedItem.get(this.displayField));
                    const $newSelectedItem = $(`#${this._selectedItem.get('id')}`, $(this.el));
                    $newSelectedItem.addClass('selected');
                    $newSelectedItem.find('a').attr('aria-checked', true);
                } else {
                    this.setRawValue((defValue!==undefined) ? defValue : value);
                }
            },

            getValue: function() {
                if (!this.rendered)
                    return null;

                if (this._selectedItem && !_.isUndefined(this._selectedItem.get(this.valueField))) {
                    return this._selectedItem.get(this.valueField);
                }

                return this._input.val();
            },

            getDisplayValue: function(record) {
                return Common.Utils.String.htmlEncode(record[this.displayField]);
            },

            getSelectedRecord: function() {
                if (!this.rendered)
                    return null;

                if (this._selectedItem && !_.isUndefined(this._selectedItem.get(this.valueField))) {
                    return _.extend({}, this._selectedItem.toJSON());
                }

                return null;
            },

            selectRecord: function(record) {
                if (!this.rendered || !record)
                    return;

                this._selectedItem = record;

                const $selectedItems = $('.selected', $(this.el));
                $selectedItems.removeClass('selected');
                $selectedItems.find('a').attr('aria-checked', false);
                this.setRawValue(this._selectedItem.get(this.displayField));
                const $newSelectedItem = $(`#${this._selectedItem.get('id')}`, $(this.el));
                $newSelectedItem.addClass('selected');
                $newSelectedItem.find('a').attr('aria-checked', true);
            },

            clearSelection: function (){
                const $selectedItems = $('.selected', $(this.el));
                $selectedItems.removeClass('selected');
                $selectedItems.find('a').attr('aria-checked', false);
                this._selectedItem = null;
            },

            itemClicked: function (e) {
                const el = $(e.target).closest('li');

                this._selectedItem = this.store.findWhere({
                    id: el.attr('id')
                });

                if (this._selectedItem) {
                    // set input text and trigger input change event marked as synthetic
                    this.lastValue = this._selectedItem.get(this.displayField);
                    this._input.val(this.lastValue).trigger('change', { synthetic: true });

                    const $selectedItems = $('.selected', $(this.el));
                    $selectedItems.removeClass('selected');
                    $selectedItems.find('a').attr('aria-checked', false);
                    el.addClass('selected');
                    el.find('a').attr('aria-checked', true);

                    // trigger changed event
                    this.trigger('selected', this, _.extend({}, this._selectedItem.toJSON()), e);

                    e.preventDefault();
                }
                this._isMouseDownMenu = false;
            },

            itemMouseDown: function(e) {
                if (e.which !== 1) {
                    e.preventDefault();
                    e.stopPropagation();

                    return false;
                }
                this._isMouseDownMenu = true;
            },

            onResetItems: function() {
                if (this.itemsTemplate) {
                    $(this.el).find('ul').html( $(this.itemsTemplate({
                        items: this.store.toJSON(),
                        scope: this
                    })));
                } else if (this.itemTemplate) {
                    $(this.el).find('ul').html($(_.template([
                        '<% _.each(items, function(item) { %>',
                        '<%= itemTemplate(item) %>',
                        '<% }); %>'
                    ].join(''))({
                        items: this.store.toJSON(),
                        itemTemplate: this.itemTemplate,
                        scope: this
                    })));
                } else {
                    $(this.el).find('ul').html(_.template([
                        '<% _.each(items, function(item) { %>',
                           '<li id="<%= item.id %>" data-value="<%- item.value %>"><a tabindex="-1" type="menuitem" role="menuitemcheckbox" aria-checked="false"><%= scope.getDisplayValue(item) %></a></li>',
                        '<% }); %>'
                    ].join(''))({
                        items: this.store.toJSON(),
                        scope: this
                    }));
                }

                if (!_.isUndefined(this.scroller)) {
                    this.scroller.destroy();
                    this.scroller = undefined;
                }
                this.scroller = new Common.UI.Scroller(_.extend({
                    el: $('.dropdown-menu', this.cmpEl),
                    minScrollbarLength : 40,
                    includePadding     : true,
                    wheelSpeed: 10,
                    alwaysVisibleY: this.scrollAlwaysVisible
                }, this.options.scroller));
            },

            focus: function() {
                this._input?.focus();
            }
        }))());

    Common.UI.ComboBoxCustom = Common.UI.ComboBox.extend(_.extend({
        itemClicked: function (e) {
            Common.UI.ComboBox.prototype.itemClicked.call(this, e);
            if (this.options.updateFormControl)
                this.options.updateFormControl.call(this, this._selectedItem);
        },

        setValue: function(value, defValue) {
            Common.UI.ComboBox.prototype.setValue.call(this, value, defValue);
            if (this.options.updateFormControl)
                this.options.updateFormControl.call(this, this._selectedItem, defValue);
        },

        selectRecord: function(record) {
            Common.UI.ComboBox.prototype.selectRecord.call(this, record);
            if (this.options.updateFormControl)
                this.options.updateFormControl.call(this, this._selectedItem);
        },

        setWidth: function(width) {
            this.cmpEl?.width(width);
        },

        focus: function() {
            this.cmpEl?.find('.form-control').focus();
        }
    }, Common.UI.ComboBoxCustom || {}));

    Common.UI.ComboBoxRecent = Common.UI.ComboBox.extend(_.extend({
        initialize: function (options) {
            this.setRecent(options.recent);
            Common.UI.ComboBox.prototype.initialize.call(this, options);
        },

        render : function(parentEl) {
            Common.UI.ComboBox.prototype.render.call(this, parentEl);

            $(this.el).find('ul').prepend( $('<li class="divider">'));
            this.loadRecent();
            return this;
        },

        setData: function(data) {
            Common.UI.ComboBox.prototype.setData.call(this, data);
            $(this.el).find('ul').prepend( $('<li class="divider">'));
            this.loadRecent();
        },

        itemClicked: function (e) {
            Common.UI.ComboBox.prototype.itemClicked.call(this, e);
            this._selectedItem && this.addItemToRecent(this._selectedItem);
        },

        onAfterShowMenu: function(e) {
            if (this.recent && this.recentArr && this.recentArr.length) {
                this.alignMenuPosition();

                $(this.el).find('ul').scrollTop(0);
                if (this.scroller)
                    this.scroller.update({alwaysVisibleY: this.scrollAlwaysVisible});

                this.cmpEl.find('.form-control').attr('aria-expanded', 'true');

                this.trigger('show:after', this, e, {fromKeyDown: e===undefined});
                this._search = {};
            } else {
                Common.UI.ComboBox.prototype.onAfterShowMenu.apply(this, arguments);
            }
        },

        onBeforeShowMenu: function(e) {
            this.loadRecent();
            Common.UI.ComboBox.prototype.onBeforeShowMenu.apply(this, arguments);

            if (this._selectedItem) {// reselect item as the recent can be changed
                let obj;
                const record = this.store.findWhere((obj={}, obj[this.valueField]=this._selectedItem.get(this.valueField), obj));
                record && this.selectRecord(record);
            }
        },

        setRecent: function(recent) {
            const filter = Common.localStorage.getKeysFilter();
            this.recent = !recent ? false : {
                count: recent.count || 5,
                key: recent.key || (filter?.length ? filter.split(',')[0] : '') + this.id,
                offset: recent.offset || 0,
                valueField: recent.valueField || 'value'
            };
        },

        loadRecent: function() {
            if (this.recent) {
                if (!this.recentArr) {
                    this.recentArr = [];
                    this.store.on('add', this.onInsertRecentItem, this);
                    this.store.on('remove', this.onRemoveRecentItem, this);
                }

                this.store.remove(this.store.where({isRecent: true}));
                let arr = Common.localStorage.getItem(this.recent.key);
                arr = arr ? arr.split(';') : [];
                arr.reverse().forEach((item) => {
                    let obj;
                    item && this.addItemToRecent(this.store.findWhere((obj={}, obj[this.recent.valueField]=item, obj)), true, 0);
                });
                this.recentArr = arr;
            }
        },

        addItemToRecent: function(record, silent, index) {
            if (!record || !this.recent) return;

            let obj;
            const item = this.store.findWhere((obj={isRecent: true}, obj[this.recent.valueField]=record.get(this.recent.valueField), obj));
            if (item && this.store.indexOf(item)<this.recent.offset) return;

            item && this.store.remove(item);

            const recents = this.store.where({isRecent: true});
            if (!(recents.length < this.recent.count)) {
                this.store.remove(recents[this.recent.count - 1]);
            }

            const new_record = record.clone();
            new_record.set({'isRecent': true, 'id': Common.UI.getId(), cloneid: record.id});
            this.store.add(new_record, {at: index!==undefined ? index : this.recent.offset});

            if (!silent) {
                const arr = [];
                this.store.where({isRecent: true}).forEach((item)=> {
                    arr.push(item.get(this.recent.valueField));
                });
                this.recentArr = arr;
                Common.localStorage.setItem(this.recent.key, arr.join(';'));
            }
        },

        onInsertRecentItem: function(item, store, options) {
            const el = $(this.el).find('ul > li').eq(options ? options.at || 0 : 0);
            if (this.itemTemplate) {
                el.before( $(this.itemTemplate(item.attributes)));
            } else {
                el.before(_.template([
                    '<li id="<%= item.id %>" data-value="<%- item.value %>"><a tabindex="-1" type="menuitem" role="menuitemcheckbox" aria-checked="false"><%= scope.getDisplayValue(item) %></a></li>',
                ].join(''))({
                    item: item.attributes,
                    scope: this
                }));
            }
        },

        onRemoveRecentItem: function(item, store, opts) {
            $(this.el).find(`ul > li#${item.id}`).remove();
        }

    }, Common.UI.ComboBoxRecent || {}));
});
