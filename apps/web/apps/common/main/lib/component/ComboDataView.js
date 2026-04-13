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
 *  ComboDataView.js
 *
 *  Created on 2/13/14
 *
 */

if (Common === undefined)
    const Common = {};

define([
    'common/main/lib/component/BaseView',
    'common/main/lib/component/DataView'
], () => {

    Common.UI.ComboDataView = Common.UI.BaseView.extend({
        options : {
            id                  : null,
            cls                 : '',
            style               : '',
            hint                : false,
            itemWidth           : 80,
            itemHeight          : 40,
            menuMaxHeight       : 300,
            autoWidth           : false,
            enableKeyEvents     : false,
            beforeOpenHandler   : null,
            additionalMenuItems  : null,
            fillOnChangeVisibility: false,
            showLast: true,
            minWidth: -1,
            dataHint: '',
            dataHintDirection: '',
            dataHintOffset: ''
        },

        template: _.template([
            '<div id="<%= id %>" class="combo-dataview <%= cls %>" style="<%= style %>">',
                '<div class="view"></div> ',
                '<div class="button"></div> ',
            '</div>'
        ].join('')),

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            this.id          = this.options.id || Common.UI.getId();
            this.cls         = this.options.cls;
            this.style       = this.options.style;
            this.hint        = this.options.hint;
            this.store       = this.options.store || new Common.UI.DataViewStore();
            this.groups      = this.options.groups;
            this.itemWidth   = this.options.itemWidth;
            this.itemHeight  = this.options.itemHeight;
            this.menuMaxHeight = this.options.menuMaxHeight;
            this.beforeOpenHandler = this.options.beforeOpenHandler;
            this.showLast    = this.options.showLast;
            this.wrapWidth   = 0;
            this.rootWidth   = 0;
            this.rootHeight  = 0;
            this.rendered    = false;
            this.needFillComboView = false;
            this.minWidth    = this.options.minWidth;
            this.autoWidth   = this.initAutoWidth = (Common.Utils.isIE10 || Common.Utils.isIE11) ? false : this.options.autoWidth;
            this.delayRenderTips = this.options.delayRenderTips || false;
            this.fillOnChangeVisibility = this.options.fillOnChangeVisibility || false;
            this.itemTemplate   = this.options.itemTemplate || _.template([
                '<div class="style" id="<%= id %>">',
                    `<img src="<%= imageUrl %>" width="${this.itemWidth}" height="${this.itemHeight}" + <% if(typeof imageUrl === "undefined" || imageUrl===null || imageUrl==="") { %> style="visibility: hidden;" <% } %>/>`,
                    '<% if (typeof title !== "undefined") {%>',
                        '<span class="title"><%= title %></span>',
                    '<% } %>',
                '</div>'
            ].join(''));

            this.fieldPicker = new Common.UI.DataView({
                cls: 'field-picker',
                allowScrollbar: false,
                itemTemplate : this.itemTemplate,
                delayRenderTips: this.delayRenderTips
            });

            this.openButton = new Common.UI.Button({
                cls: 'open-menu',
                menu: new Common.UI.Menu({
                    menuAlign: Common.UI.isRTL() ? 'tr-tr' : 'tl-tl',
                    offset: [0, 3],
                    items: [
                        {template: _.template('<div class="menu-picker-container"></div>')}
                    ].concat(this.options.additionalMenuItems != null ? this.options.additionalMenuItems : [])
                }),
                dataHint: this.options.dataHint,
                dataHintDirection: this.options.dataHintDirection,
                dataHintOffset: this.options.dataHintOffset,
                ariaLabel: this.options.ariaLabel
            });

            this.menuPicker  = new Common.UI.DataView({
                cls: 'menu-picker',
                parentMenu: this.openButton.menu,
                outerMenu:  this.options.additionalMenuItems ? {menu: this.openButton.menu, index: 0} : undefined,
                restoreHeight: this.menuMaxHeight,
                style: `max-height: ${this.menuMaxHeight}px;`,
                enableKeyEvents: this.options.enableKeyEvents,
                groups: this.groups,
                store: this.store,
                itemTemplate : this.itemTemplate,
                delayRenderTips: this.delayRenderTips
            });

            if  (this.options.additionalMenuItems != null) {
                this.openButton.menu.setInnerMenu([{menu: this.menuPicker, index: 0}]);
            }

            if (this.options.el) {
                this.render();
            }
        },

        render: function(parentEl) {
            if (!this.rendered) {

                this.trigger('render:before', this);

                this.cmpEl = this.$el || $(this.el);

                const templateEl = this.template({
                    id      : this.id,
                    cls     : this.cls,
                    style   : this.style
                });

                if (parentEl) {
                    this.setElement(parentEl, false);

                    this.cmpEl = $(templateEl);

                    parentEl.html(this.cmpEl);
                  } else {
                    this.cmpEl.html(templateEl);
                }

                this.rootWidth  = this.cmpEl.width();
                this.rootHeight = this.cmpEl.height();

                this.fieldPicker.render($('.view', this.cmpEl));
                this.openButton.render($('.button', this.cmpEl));
                this.menuPicker.render($('.menu-picker-container', this.cmpEl));

                if (this.openButton.menu.cmpEl) {
                    if (this.openButton.menu.cmpEl) {
                        this.openButton.menu.menuAlignEl = this.cmpEl;
                        this.openButton.menu.cmpEl.css('min-width', this.itemWidth);
                        this.openButton.menu.on('show:before',          _.bind(this.onBeforeShowMenu, this));
                        this.openButton.menu.on('show:after',           _.bind(this.onAfterShowMenu, this));
                        this.openButton.cmpEl.on('hide.bs.dropdown',    _.bind(this.onBeforeHideMenu, this));
                        this.openButton.cmpEl.on('hidden.bs.dropdown',  _.bind(this.onAfterHideMenu, this));
                    }
                }

                if (this.options.hint) {
                    this.cmpEl.attr('data-toggle', 'tooltip');
                    this.cmpEl.tooltip({
                        title       : this.options.hint,
                        placement   : this.options.hintAnchor || 'cursor'
                    });
                }

                this.autoWidth && this.cmpEl.addClass('auto-width');

                this.fieldPicker.on('item:select', _.bind(this.onFieldPickerSelect, this));
                this.menuPicker.on('item:select',  _.bind(this.onMenuPickerSelect, this));
                this.fieldPicker.on('item:click',  _.bind(this.onFieldPickerClick, this));
                this.menuPicker.on('item:click',   _.bind(this.onMenuPickerClick, this));
                this.fieldPicker.on('item:contextmenu', _.bind(this.onPickerItemContextMenu, this));
                this.menuPicker.on('item:contextmenu',  _.bind(this.onPickerItemContextMenu, this));

                this.fieldPicker.el.addEventListener('contextmenu', _.bind(this.onPickerComboContextMenu, this), false);
                this.menuPicker.el.addEventListener('contextmenu', _.bind(this.onPickerComboContextMenu, this), false);

                Common.NotificationCenter.on('more:toggle', _.bind(this.onMoreToggle, this));
                Common.NotificationCenter.on('tab:active', _.bind(this.onTabActive, this));
                Common.NotificationCenter.on('window:resize', _.bind(this.startCheckSize, this));
                this.checkSize();
                this.onResize();
                this.rendered = true;
                
                this.trigger('render:after', this);
            }
            if (this.disabled) {
                this.setDisabled(!!this.disabled);
            }

            return this;
        },

        onMoreToggle: function(btn, state) {
            if(state) {
                this.startCheckSize();
            }
        },

        onTabActive: function() {
            this.startCheckSize();
        },

        checkVisibility: function() {
            if (!this._timer_visibility) {
                this._timer_visibility =  setInterval(() => {
                    if (this.isVisible()) {
                        clearInterval(this._timer_visibility);
                        this._timer_visibility = undefined;
                        const record = this.menuPicker.getSelectedRec();
                        record && this.fillComboView(record, !!record, true);
                    }
                }, 500);
            }
        },

        startCheckSize: function() {
            this.checkSize();
            if (!this._timer_id) {
                this._needCheckSize = 0;
                this._timer_id =  setInterval(() => {
                    if (this._needCheckSize++ < 10)
                        this.checkSize();
                    else {
                        clearInterval(this._timer_id);
                        this._timer_id = undefined;
                    }
                }, 500);
            } else
                this._needCheckSize = 0;
        },

        checkSize: function() {
            if (this.cmpEl?.is(':visible')) {
                if(this.autoWidth && this.menuPicker.store.length > 0) {
                    let wrapWidth = this.$el.width();
                    if(wrapWidth !== this.wrapWidth || this.needFillComboView){
                        wrapWidth = this.autoChangeWidth();
                        wrapWidth && (this.wrapWidth = wrapWidth);

                        const picker = this.menuPicker;
                        const record = picker.getSelectedRec();
                        this.fillComboView(record || picker.store.at(0), !!record, true);                   
                    }
                }
                const width  = this.cmpEl.width();
                const height = this.cmpEl.height();
                if (width < this.minWidth) return;

                if (this.rootWidth !== width || this.rootHeight !== height) {
                    this.rootWidth  = width;
                    this.rootHeight = height;
                    setTimeout(() => {
                        this.openButton.menu.cmpEl.outerWidth();
                        this.rootWidth = this.cmpEl.width();
                    }, 10);
                    this.onResize();
                }
            }
        },

        onResize: function() {
            if (this.openButton) {
                const button = $('button', this.openButton.cmpEl);
                const cntButton = $('.button', this.cmpEl);
                button && cntButton.width() > 0 && button.css({
                    height: cntButton.height()
                });

                this.openButton.menu.hide();

                const picker = this.menuPicker;
                if (picker) {
                    const record = picker.getSelectedRec();
                    this.itemMarginLeft = undefined;
                    this.fillComboView(record || picker.store.at(0), !!record, true);

                    picker.onResize();
                }
            }

            if (!this.isSuspendEvents)
                this.trigger('resize', this);
        },
    
        autoChangeWidth: function() {
            if(this.menuPicker.dataViewItems[0]){
                const wrapEl = this.$el;
                const widthCalc = this.checkAutoWidth(wrapEl, wrapEl.width());
                const cmbDataViewEl = this.cmpEl;
                if (widthCalc) {
                    cmbDataViewEl.css('width', widthCalc);
                    wrapEl.css('width', `${widthCalc + Number.parseFloat(wrapEl.css('padding-left')) + Number.parseFloat(wrapEl.css('padding-right'))}px`);
                }

                if(this.initAutoWidth) {
                    this.initAutoWidth = false;
                    cmbDataViewEl.css('position', 'absolute');
                    cmbDataViewEl.css('top', '50%');
                    cmbDataViewEl.css('bottom', '50%');
                    cmbDataViewEl.css('margin', 'auto 0');
                    cmbDataViewEl.css('width', `${wrapEl.width()}px`);
                }

                return widthCalc;
            }
        },

        checkAutoWidth: (el, width) => {
            const $menuPicker = el.find('.menu-picker');
            const $fieldPicker = el.find('.field-picker').closest('.view');
            const cmbDataViewEl = el.find('.combo-dataview');
            if ($menuPicker && $menuPicker.length>0) {
                let itemEl = $menuPicker.find('.item');
                const storeLength = itemEl.length;
                const fieldItemEl = $fieldPicker.find('.item');
                if (itemEl.length>0) {
                    itemEl = $(itemEl[0]);
                    let itemWidth = itemEl.width();
                    if (itemWidth<1) {
                        itemWidth = fieldItemEl.length>0 ? $(fieldItemEl[0]).width() : 0;
                    }
                    if (itemWidth<1) return;

                    itemWidth += Number.parseFloat(itemEl.css('padding-left')) + Number.parseFloat(itemEl.css('padding-right')) + 2 * Number.parseFloat(itemEl.css('border-width'));
                    const itemMargins = Number.parseFloat(itemEl.css('margin-left')) + Number.parseFloat(itemEl.css('margin-right'));

                    const fieldPickerPadding = Number.parseFloat($fieldPicker.css(Common.UI.isRTL() ? 'padding-left' : 'padding-right'));
                    const fieldPickerBorder = Number.parseFloat($fieldPicker.css('border-width'));
                    const dataView = $fieldPicker.find('.dataview');
                    const dataviewPaddings = Number.parseFloat(dataView.css('padding-left')) + Number.parseFloat(dataView.css('padding-right'));

                    const cmbDataViewPaddings = Number.parseFloat(cmbDataViewEl.css('padding-left')) + Number.parseFloat(cmbDataViewEl.css('padding-right'));
                    let itemsCount =  Math.floor((width - fieldPickerPadding - dataviewPaddings - 2 * fieldPickerBorder - cmbDataViewPaddings) / (itemWidth + itemMargins));
                    if(itemsCount > storeLength)
                        itemsCount = storeLength;

                    let widthCalc = Math.ceil((itemsCount * (itemWidth + itemMargins) + fieldPickerPadding + dataviewPaddings + 2 * fieldPickerBorder + cmbDataViewPaddings) * 10) / 10;
                    const maxWidth = Number.parseFloat(cmbDataViewEl.css('max-width'));
                    if(widthCalc > maxWidth)
                        widthCalc = maxWidth;

                    return widthCalc;
                }
            }
        },

        onBeforeShowMenu: function(e) {

            if (_.isFunction(this.beforeOpenHandler)){
                this.beforeOpenHandler(this, e);
            } else if (this.openButton.menu.cmpEl) {
                this.openButton.menu.cmpEl.css({
                    'width' : this.cmpEl.width() - this.openButton.cmpEl.width(),
                    'min-height': this.cmpEl.height()
                });
            }

            if (this.options.hint) {
                const tip = this.cmpEl.data('bs.tooltip');
                if (tip) {
                    if (tip.dontShow===undefined)
                        tip.dontShow = true;
                    tip.hide();
                }
            }
            this.menuPicker.selectedBeforeHideRec = null; // for DataView - onKeyDown - Return key
        },

        onBeforeHideMenu: function(e) {
            this.trigger('hide:before', this, e);

            if (Common.UI.Scroller.isMouseCapture())
                e.preventDefault();

            if (this.isStylesNotClosable)
                return false;
        },

        onAfterShowMenu: function(e) {
            if (this.menuPicker.scroller) {
                this.menuPicker.scroller.update({
                    includePadding: true,
                    suppressScrollX: true,
                    alwaysVisibleY: true
                });
            }
        },

        onAfterHideMenu: function(e, isFromInputControl) {
            this.menuPicker.selectedBeforeHideRec = this.menuPicker.getSelectedRec(); // for DataView - onKeyDown - Return key
            (this.showLast) ? this.menuPicker.showLastSelected() : this.menuPicker.deselectAll();
            this.trigger('hide:after', this, e, isFromInputControl);
        },

        onFieldPickerSelect: (picker, item, record) => {
            //
        },

        onMenuPickerSelect: function(picker, item, record, fromKeyDown) {
            this.needFillComboView = this.disabled;
            if (this.disabled || fromKeyDown===true) return;

            this.fillComboView(record, false);
            if (record && !this.isSuspendEvents)
                this.trigger('select', this, record);
        },

        onFieldPickerClick: function(dataView, itemView, record) {
            if (this.disabled) return;

            if (!this.isSuspendEvents)
                this.trigger('click', this, record);

            if (this.options.hint) {
                const tip = this.cmpEl.data('bs.tooltip');
                if (tip) {
                    if (tip.dontShow===undefined)
                        tip.dontShow = true;
                    tip.hide();
                }
            }

            if (!this.showLast) this.fieldPicker.deselectAll();
        },

        onMenuPickerClick: function(dataView, itemView, record) {
            if (this.disabled) return;

            if (!this.isSuspendEvents)
                this.trigger('click', this, record);
        },

        onPickerItemContextMenu: function(dataView, itemView, record, e) {
            if (this.disabled) return;

            if (!this.isSuspendEvents) {
                this.trigger('contextmenu', this, record, e);
            }
            e.preventDefault();
            e.stopPropagation();
            return false;
        },

        onPickerComboContextMenu: function(mouseEvent) {
            if (this.disabled) return;

            if (!this.isSuspendEvents) {
                this.trigger('contextmenu', this, undefined, mouseEvent);
            }
        },

        setDisabled: function(disabled) {
            disabled = !!disabled;
            this.disabled = disabled;

            if (!this.rendered)
                return;

            this.cmpEl.toggleClass('disabled', disabled);
            $('button', this.openButton.cmpEl).toggleClass('disabled', disabled);
            this.fieldPicker.setDisabled(disabled);

            if (this.needFillComboView && !disabled) {
                const picker = this.menuPicker;
                if (picker) {
                    const record = picker.getSelectedRec();
                    this.fillComboView(record || picker.store.at(0), false);
                }
            }
        },

        isDisabled: function() {
            return this.disabled;
        },

        fillComboView: function(record, forceSelect, forceFill) {
            if (!_.isUndefined(record) && record instanceof Backbone.Model){
                this.needFillComboView = !this.isVisible();
                const store           = this.menuPicker.store;
                const fieldPickerEl   = $(this.fieldPicker.el);

                if (store) {
                    if (forceFill || !this.fieldPicker.store.findWhere({'id': record.get('id')})){
                        if (this.itemMarginLeft===undefined) {
                            let div = $($(this.menuPicker.el).find('.inner > div:not(.grouped-data):not(.ps-scrollbar-x-rail):not(.ps-scrollbar-y-rail)')[0]);
                            if (!div || div.length<1) { // try to find items in groups
                                div = $($(this.menuPicker.el).find('.inner .group-items-container > div:not(.grouped-data):not(.ps-scrollbar-x-rail):not(.ps-scrollbar-y-rail)')[0]);
                            }
                            if (div.length > 0) {
                                this.itemMarginLeft  = Number.parseInt(div.css('margin-left'));
                                this.itemMarginRight = Number.parseInt(div.css('margin-right'));
                                this.itemPaddingLeft  = Number.parseInt(div.css('padding-left'));
                                this.itemPaddingRight = Number.parseInt(div.css('padding-right'));
                                this.itemBorderLeft  = Number.parseInt(div.css('border-left-width'));
                                this.itemBorderRight = Number.parseInt(div.css('border-right-width'));
                            }
                        }

                        let indexRec = store.indexOf(record);
                        if (indexRec < 0)
                            return;

                        const countRec = store.length;
                        let maxViewCount = Math.floor(Math.max(fieldPickerEl.width(), this.minWidth) / (this.itemWidth + (this.itemMarginLeft || 0) + (this.itemMarginRight || 0) + (this.itemPaddingLeft || 0) + (this.itemPaddingRight || 0) +
                                                                                                (this.itemBorderLeft || 0) + (this.itemBorderRight || 0)));
                        const newStyles = [];

                        if (fieldPickerEl.height() / this.itemHeight > 2)
                            maxViewCount *= Math.floor(fieldPickerEl.height() / this.itemHeight);

                        indexRec = Math.floor(indexRec / maxViewCount) * maxViewCount;
                        if (countRec - indexRec < maxViewCount)
                            indexRec = Math.max(countRec - maxViewCount, 0);
                        for (let index = indexRec, viewCount = 0; index < countRec && viewCount < maxViewCount; index++, viewCount++) {
                            newStyles.push(store.at(index));
                        }

                        this.fieldPicker.store.reset(newStyles);
                    }

                    if (forceSelect) {
                        const selectRecord = this.fieldPicker.store.findWhere({'id': record.get('id')});
                        if (selectRecord){
                            this.suspendEvents();
                            this.fieldPicker.selectRecord(selectRecord, true);
                            this.resumeEvents();
                        }
                    }
                    this.fillOnChangeVisibility && !this.isVisible() && this.checkVisibility();
                    return this.fieldPicker.store.models; // return list of visible items
                }
            }
        },

        clearComboView: function() {
            this.fieldPicker.store.reset([]);
        },

        selectByIndex: function(index) {
            if (index < 0)
                this.fieldPicker.deselectAll();

            this.menuPicker.selectByIndex(index);
        },

        selectRecord: function(record) {
            if (!record)
                this.fieldPicker.deselectAll();

            this.menuPicker.selectRecord(record);
        },

        setItemWidth: function(width) {
            if (this.itemWidth !== width)
                this.itemWidth = Common.Utils.applicationPixelRatio() > 1 ? width / 2 : width;
        },

        setItemHeight: function(height) {
            if (this.itemHeight !== height)
                this.itemHeight = Common.Utils.applicationPixelRatio() > 1 ? height / 2 : height;
        },

        removeTips: function() {
            const picker = this.menuPicker;
            _.each(picker.dataViewItems, (item) => {
                const tip = item.$el.data('bs.tooltip');
                if (tip) (tip.tip()).remove();
            }, picker);
        }
    })
});