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
 *  DataView.js
 *
 *  A mechanism for displaying data using custom layout templates and formatting.
 *
 *  Created on 1/24/14
 *
 */

/**
 * The View uses an template as its internal templating mechanism, and is bound to an
 * {@link Common.UI.DataViewStore} so that as the data in the store changes the view is automatically updated
 * to reflect the changes.
 *
 *  The example below binds a View to a {@link Common.UI.DataViewStore} and renders it into an el.
 *
 *      new Common.UI.DataView({
 *          el: $('#id'),
 *          store: new Common.UI.DataViewStore([{value: 1, value: 2}]),
 *          itemTemplate: _.template(['<li id="<%= id %>"><a href="#"><%= value %></a></li>'].join(''))
 *      });
 *
 *
 *  @property {Object} el
 *  Backbone el
 *
 *
 *  @property {Object} store
 *  The Store class encapsulates a client side cache of Model objects.
 *
 *
 *  @property {String} emptyText
 *  The text to display in the view when there is no data to display.
 *
 *
 *  @cfg {Object} itemTemplate
 *  The inner portion of the item template to be rendered.
 *
 */

if (Common === undefined)
    const Common = {};

define([
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Scroller'
], () => {

    Common.UI.DataViewGroupModel = Backbone.Model.extend({
        defaults: () => ({
                id: Common.UI.getId(),
                caption: '',
                inline: false,
                headername: undefined
            })
    });

    Common.UI.DataViewGroupStore = Backbone.Collection.extend({
        model: Common.UI.DataViewGroupModel
    });

    Common.UI.DataViewModel = Backbone.Model.extend({
        defaults: () => ({
                id: Common.UI.getId(),
                selected: false,
                allowSelected: true,
                value: null,
                disabled: false
            })
    });

    Common.UI.DataViewStore = Backbone.Collection.extend({
        model: Common.UI.DataViewModel
    });

    Common.UI.DataViewItem = Common.UI.BaseView.extend({
        options : {
        },

        template: _.template([
            '<div id="<%= id %>"><%= value %></div>'
        ].join('')),

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            this.template = this.options.template || this.template;
            this.dataHint = this.options.dataHint || '';
            this.dataHintDirection = this.options.dataHintDirection || '';
            this.dataHintOffset = this.options.dataHintOffset || '';
            this.scaling = this.options.scaling;

            this.listenTo(this.model, 'change', this.model.get('skipRenderOnChange') ? this.onChange : this.render);
            this.listenTo(this.model, 'change:selected',    this.onSelectChange);
            this.listenTo(this.model, 'change:tip',         this.onTipChange);
            this.listenTo(this.model, 'remove',             this.remove);
        },

        render: function () {
            if (_.isUndefined(this.model.id))
                return this;

            const el = this.$el || $(this.el);

            el.html(this.template(this.model.toJSON()));
            el.addClass('item canfocused');
            el.toggleClass('selected', !!this.model.get('selected') && this.model.get('allowSelected'));
            el.attr('tabindex', this.options.tabindex || 0);
            el.attr('role', this.options.role ? this.options.role : 'listitem');
            
            if (this.dataHint !== '') {
                el.attr('data-hint', this.dataHint);
                el.attr('data-hint-direction', this.dataHintDirection);
                el.attr('data-hint-offset', this.dataHintOffset);
            }
            if (!_.isUndefined(this.model.get('contentTarget')))
                el.attr('content-target', this.model.get('contentTarget'));

            el.off('click dblclick contextmenu');
            el.on({ 'click': _.bind(this.onClick, this),
                'dblclick': _.bind(this.onDblClick, this),
                'contextmenu': _.bind(this.onContextMenu, this) });
            el.toggleClass('disabled', !!this.model.get('disabled'));

            if (!_.isUndefined(this.model.get('cls')))
                el.addClass(this.model.get('cls'));

            const tip = el.data('bs.tooltip');
            if (tip) {
                if (tip.dontShow===undefined && el.is(':hover'))
                    tip.dontShow = true;
            }

            if (this.scaling !== false && el.find('.options__icon').length) {
                el.attr('ratio', 'ratio');
                this.applyScaling(Common.UI.Scaling.currentRatio());

                el.on('app:scaling', _.bind(function (e, info) {
                    if ( this.scaling !== info.ratio ) {
                        this.applyScaling(info.ratio);
                    }
                }, this));
            }

            this.trigger('change', this, this.model);

            return this;
        },

        remove: function() {
            this.stopListening(this.model);
            this.trigger('remove', this, this.model);

            Common.UI.BaseView.prototype.remove.call(this);
        },

        onClick: function(e) {
            if (this.model.get('disabled')) return false;

            this.trigger('click', this, this.model, e);
        },

        onDblClick: function(e) {
            if (this.model.get('disabled')) return false;

            this.trigger('dblclick', this, this.model, e);
        },

        onContextMenu: function(e) {
            this.trigger('contextmenu', this, this.model, e);
        },

        onSelectChange: function(model, selected) {
            this.trigger('select', this, model, selected);
        },

        onTipChange: function (model, tip) {
            this.trigger('tipchange', this, model);
        },

        onChange: function () {
            if (_.isUndefined(this.model.id))
                return this;
            const el = this.$el || $(this.el);
            el.toggleClass('selected', !!this.model.get('selected') && this.model.get('allowSelected'));
            el.toggleClass('disabled', !!this.model.get('disabled'));

            this.trigger('change', this, this.model);

            return this;
        },

        applyScaling: function (ratio) {
            this.scaling = ratio;

            if (ratio > 2) {
                const el = this.$el || $(this.el);
                const icon = el.find('.options__icon');
                if (icon.length > 0) {
                    if (!el.find('svg.icon').length) {
                        const iconCls = icon.attr('class');
                        const re_icon_name = /btn-[^\s]+/.exec(iconCls);
                        const icon_name = re_icon_name ? re_icon_name[0] : "null";
                        const svg_icon = '<svg class="icon uni-scale"><use href="#%iconname"></use></svg>'.replace('%iconname', icon_name);
                        icon.after(svg_icon);
                    }
                }
            }
        }
    });

    Common.UI.DataView = Common.UI.BaseView.extend({
        options : {
            multiSelect: false,
            handleSelect: true,
            enableKeyEvents: true,
            keyMoveDirection: 'both', // 'vertical', 'horizontal'
            restoreHeight: 0,
            emptyText: '',
            listenStoreEvents: true,
            allowScrollbar: true,
            scrollAlwaysVisible: false,
            minScrollbarLength: 40,
            scrollYStyle: null,
            showLast: true,
            useBSKeydown: false,
            cls: '',
            role: 'list'
        },

        template: _.template([
            '<div class="dataview inner <%= cls %>" style="<%= style %>" role="<%= options.role %>">',
                '<% _.each(groups, function(group) { %>',
                    '<% if (group.headername !== undefined) { %>',
                        '<div class="header-name"><%= group.headername %></div>',
                    '<% } %>',
                    '<div class="grouped-data <% if (group.inline) { %> inline <% } %> <% if (!_.isEmpty(group.caption)) { %> margin <% } %>" id="<%= group.id %>">',
                        '<% if (!_.isEmpty(group.caption)) { %>',
                            '<div class="group-description">',
                                '<span><%= group.caption %></span>',
                            '</div>',
                        '<% } %>',
                        '<div class="group-items-container">',
                        '</div>',
                    '</div>',
                '<% }); %>',
            '</div>'
        ].join('')),

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            this.template       = this.options.template       || this.template;
            this.store          = this.options.store          || new Common.UI.DataViewStore();
            this.groups         = this.options.groups         || null;
            this.itemTemplate   = this.options.itemTemplate   || null;
            this.itemDataHint   = this.options.itemDataHint   || '';
            this.itemDataHintDirection = this.options.itemDataHintDirection || '';
            this.itemDataHintOffset = this.options.itemDataHintOffset || '';
            this.multiSelect    = this.options.multiSelect;
            this.handleSelect   = this.options.handleSelect;
            this.parentMenu     = this.options.parentMenu;
            this.outerMenu      = this.options.outerMenu;
            this.enableKeyEvents= this.options.enableKeyEvents;
            this.useBSKeydown   = this.options.useBSKeydown; // only with enableKeyEvents && parentMenu
            this.showLast       = this.options.showLast;
            this.style          = this.options.style        || '';
            this.cls            = this.options.cls          || '';
            this.emptyText      = this.options.emptyText    || '';
            this.listenStoreEvents= (this.options.listenStoreEvents!==undefined) ? this.options.listenStoreEvents : true;
            this.allowScrollbar = (this.options.allowScrollbar!==undefined) ? this.options.allowScrollbar : true;
            this.scrollAlwaysVisible = this.options.scrollAlwaysVisible || false;
            this.minScrollbarLength = this.options.minScrollbarLength || 40;
            this.scrollYStyle    = this.options.scrollYStyle;
            this.tabindex = this.options.tabindex || 0;
            this.itemTabindex = this.options.itemTabindex!==undefined ? this.options.itemTabindex : this.tabindex>0 ? -1 : 0; //do not set focus to items when dataview get focus
            this.delayRenderTips = this.options.delayRenderTips || false;
            if (this.parentMenu)
                this.parentMenu.options.restoreHeight = (this.options.restoreHeight>0);
            this.delaySelect = this.options.delaySelect || false;
            this.rendered       = false;
            this.dataViewItems = [];
            if (this.options.keyMoveDirection==='vertical')
                this.moveKeys = [Common.UI.Keys.UP, Common.UI.Keys.DOWN];
            else if (this.options.keyMoveDirection==='horizontal')
                this.moveKeys = [Common.UI.Keys.LEFT, Common.UI.Keys.RIGHT];
            else
                this.moveKeys = [Common.UI.Keys.UP, Common.UI.Keys.DOWN, Common.UI.Keys.LEFT, Common.UI.Keys.RIGHT];

            if ( this.options.scaling === false) {
                this.cls = `${this.options.cls} scaling-off`;
            }

            if (this.options.el)
                this.render();
        },

        render: function (parentEl) {

            this.trigger('render:before', this);

            if (parentEl) {
                this.setElement(parentEl, false);
                this.cmpEl = $(this.template({
                    groups: this.groups ? this.groups.toJSON() : null,
                    style: this.style,
                    cls: this.cls,
                    options: this.options
                }));

                parentEl.html(this.cmpEl);
            } else {
                this.cmpEl = this.$el || $(this.el);
                this.cmpEl.html(this.template({
                    groups: this.groups ? this.groups.toJSON() : null,
                    style: this.style,
                    cls: this.cls,
                    options: this.options
                }));
            }

            let modalParents = this.cmpEl.closest('.asc-window');
            if (modalParents.length < 1)
                modalParents = this.cmpEl.closest('[id^="menu-container-"]'); // context menu
            if (modalParents.length > 0) {
                this.tipZIndex = Number.parseInt(modalParents.css('z-index')) + 10;
            }

            if (!this.rendered) {
                if (this.listenStoreEvents) {
                    this.listenTo(this.store, 'add',    this.onAddItem);
                    this.listenTo(this.store, 'reset',  this.onResetItems);
                    if (this.groups) {
                        this.listenTo(this.groups, 'add',  this.onAddGroup);
                        this.listenTo(this.groups, 'remove',  this.onRemoveGroup);
                    }
                }
                this.onResetItems();

                if (this.parentMenu) {
                    this.cmpEl.closest('li').css('height', '100%');
                    this.cmpEl.css('height', '100%');
                    this.parentMenu.on('show:after', _.bind(this.alignPosition, this));
                }

                if (this.enableKeyEvents && this.parentMenu && this.handleSelect) {
                    if (!this.showLast)
                        this.parentMenu.on('show:before', (menu) => { this.deselectAll(); });
                    this.parentMenu.on('show:after', (menu, e) => {
                        if (e && (menu.el !== e.target)) return;
                        if (this.showLast) this.showLastSelected();
                        if (this.outerMenu && (this.outerMenu.focusOnShow===false)) return;
                        Common.NotificationCenter.trigger('dataview:focus');
                        _.delay(() => {
                            menu.cmpEl.find('.dataview').focus();
                        }, 10);
                    }).on('hide:after', () => {
                        Common.NotificationCenter.trigger('dataview:blur');
                    });
                }
            }

            if (_.isUndefined(this.scroller) && this.allowScrollbar) {
                this.scroller = new Common.UI.Scroller({
                    el: $(this.el).find('.inner').addBack().filter('.inner'),
                    useKeyboard: this.enableKeyEvents && !this.handleSelect,
                    minScrollbarLength  : this.minScrollbarLength,
                    scrollYStyle: this.scrollYStyle,
                    wheelSpeed: 10,
                    alwaysVisibleY: this.scrollAlwaysVisible
                });
            }

            this.rendered = true;

            (this.$el || $(this.el)).on('click', (e)=> {
                if (/dataview|grouped-data|group-items-container/.test(e.target.className) || $(e.target).closest('.group-description').length>0) return false;
            });

            this.trigger('render:after', this);
            return this;
        },

        setStore: function(store) {
            if (store) {
                this.stopListening(this.store);

                this.store = store;

                if (this.listenStoreEvents) {
                    this.listenTo(this.store, 'add',    this.onAddItem);
                    this.listenTo(this.store, 'reset',  this.onResetItems);
                }
            }
        },

        selectRecord: function(record, suspendEvents) {
            if (!this.handleSelect)
                return;

            if (suspendEvents)
                this.suspendEvents();
            this.extremeSeletedRec = record;
            if (!this.multiSelect || ( !this.pressedShift && !this.pressedCtrl) || !this.currentSelectedRec || (this.pressedShift && this.currentSelectedRec === record)) {
                _.each(this.store.where({selected: true}), (rec)=> {
                    rec.set({selected: false});
                });

                if (record) {
                    record.set({selected: true});
                    this.currentSelectedRec = record;
                }
            } else {
                if (record) {
                    if(this.pressedCtrl) {
                        record.set({selected: !record.get('selected')});
                        this.currentSelectedRec = record;
                    }
                    else if(this.pressedShift){
                        let inRange=false;
                        _.each(this.store.models, (rec)=> {
                            if(this.currentSelectedRec === rec || record === rec){
                                inRange = !inRange;
                                rec.set({selected: true});
                            }
                            else {
                                rec.set({selected: (inRange)});
                            }
                        });
                    }
                }
            }

            if (suspendEvents)
                this.resumeEvents();
            return record;
        },

        selectByIndex: function(index, suspendEvents) {
            if (this.store.length > 0 && index > -1 && index < this.store.length) {
                return this.selectRecord(this.store.at(index), suspendEvents);
            }
        },

        deselectAll: function(suspendEvents) {
            if (suspendEvents)
                this.suspendEvents();

            _.each(this.store.where({selected: true}), (record)=> {
                record.set({selected: false});
            });
            this.lastSelectedRec = null;

            if (suspendEvents)
                this.resumeEvents();
        },

        getSelectedRec: function() {
            return (this.multiSelect) ? this.store.where({selected: true}) : this.store.findWhere({selected: true});
        },

        onAddItem: function(record, store, opts) {
            const view = new Common.UI.DataViewItem({
                template: this.itemTemplate,
                model: record,
                scaling: this.options.scaling,
                dataHint: this.itemDataHint,
                dataHintDirection: this.itemDataHintDirection,
                dataHintOffset: this.itemDataHintOffset,
                tabindex: this.itemTabindex
            });

            if (view) {
                let innerEl = $(this.el).find('.inner').addBack().filter('.inner');

                if (this.groups && this.groups.length > 0) {
                    const group = this.groups.findWhere({id: record.get('group')});

                    if (group) {
                        innerEl = innerEl.find(`#${group.id} .group-items-container`);
                    }
                }

                const idx = _.indexOf(this.store.models, record);
                if (innerEl) {
                    if (opts && (typeof opts.at==='number') && opts.at >= 0) {
                        if (opts.at === 0) {
                            innerEl.prepend(view.render().el);
                        } else if (!(this.groups && this.groups.length > 0)) { // for dataview without groups
                            const innerDivs = innerEl.find('> div');
                            if (idx > 0)
                                $(innerDivs.get(idx - 1)).after(view.render().el);
                            else {
                                (innerDivs.length > 0) ? $(innerDivs[idx]).before(view.render().el) : innerEl.append(view.render().el);
                            }
                        } else
                            innerEl.append(view.render().el);
                    } else
                        innerEl.append(view.render().el);

                    (this.dataViewItems.length<1) && innerEl.find('.empty-text').remove();
                    this.dataViewItems = this.dataViewItems.slice(0, idx).concat(view).concat(this.dataViewItems.slice(idx));
                    const view_el = $(view.el);
                    const tip = record.get('tip');
                    if (tip!==undefined && tip!==null) {
                        if (this.delayRenderTips) {
                            view_el.one('mouseenter', () => { // hide tooltip when mouse is over menu
                                view_el.attr('data-toggle', 'tooltip');
                                view_el.tooltip({
                                    title       : record.get('tip'), // use actual tip, because it can be changed
                                    placement   : 'cursor',
                                    zIndex : this.tipZIndex
                                });
                                view_el.mouseenter();
                            });
                            view_el.attr('aria-label', record.get('tip'));
                        } else {
                            view_el.attr('data-toggle', 'tooltip');
                            view_el.tooltip({
                                title       : record.get('tip'), // use actual tip, because it can be changed
                                placement   : 'cursor',
                                zIndex : this.tipZIndex
                            });
                            view_el.attr('aria-label', record.get('tip'));
                        }
                    }

                    this.listenTo(view, 'change',      this.onChangeItem);
                    this.listenTo(view, 'remove',      this.onRemoveItem);
                    this.listenTo(view, 'click',       this.onClickItem);
                    this.listenTo(view, 'dblclick',    this.onDblClickItem);
                    this.listenTo(view, 'select',      this.onSelectItem);
                    this.listenTo(view, 'contextmenu', this.onContextMenuItem);
                    if (tip === null || tip === undefined)
                        this.listenTo(view, 'tipchange', this.onInitItemTip);

                    if (!this.isSuspendEvents)
                        this.trigger('item:add', this, view, record);
                }
            }
            this._layoutParams = undefined;
        },

        onAddGroup: function(group) {
            const el = $(_.template([
                '<% if (group.headername !== undefined) { %>',
                '<div class="header-name"><%= group.headername %></div>',
                '<% } %>',
                '<div class="grouped-data <% if (group.inline) { %> group.inline <% } %> <% if (!_.isEmpty(group.caption)) { %> margin <% } %>" id="<%= group.id %>">',
                '<% if (!_.isEmpty(group.caption)) { %>',
                    '<div class="group-description">',
                        '<span><%= group.caption %></span>',
                    '</div>',
                '<% } %>',
                    '<div class="group-items-container">',
                    '</div>',
                '</div>'
            ].join(''))({
                group: group.toJSON()
            }));
            const innerEl = $(this.el).find('.inner').addBack().filter('.inner');
            if (innerEl) {
                const idx = _.indexOf(this.groups.models, group);
                const innerDivs = innerEl.find('.grouped-data');
                if (idx > 0)
                    $(innerDivs.get(idx - 1)).after(el);
                else {
                    (innerDivs.length > 0) ? $(innerDivs[idx]).before(el) : innerEl.append(el);
                }
            }
        },

        onRemoveGroup: function(group) {
            const innerEl = $(this.el).find('.inner').addBack().filter('.inner');
            if (innerEl) {
                const div = innerEl.find(`#${group.get('id')}.grouped-data`);
                div?.remove();
            }
            this._layoutParams = undefined;
        },

        onResetItems: function() {
            this.trigger('reset:before', this);

            _.each(this.dataViewItems, (item) => {
                const tip = item.$el.data('bs.tooltip');
                if (tip) {
                    if (tip.dontShow===undefined)
                        tip.dontShow = true;
                    (tip.tip()).remove();
                }
            }, this);

            $(this.el).html(this.template({
                groups: this.groups ? this.groups.toJSON() : null,
                style: this.style,
                cls: this.cls,
                options: this.options
            }));

            if (!_.isUndefined(this.scroller)) {
                this.scroller.destroy();
                this.scroller = undefined;
            }

            if (this.store.length < 1 && this.emptyText.length > 0)
                $(this.el).find('.inner').addBack().filter('.inner').append(`<table cellpadding="10" class="empty-text"><tr><td>${this.emptyText}</td></tr></table>`);

            _.each(this.dataViewItems, function(item) {
                this.stopListening(item);
                item.stopListening(item.model);
            }, this);
            this.dataViewItems = [];
            this.store.each((item)=> {
                this.onAddItem(item, this.store);
            }, this);

            if (this.allowScrollbar) {
                this.scroller = new Common.UI.Scroller({
                    el: $(this.el).find('.inner').addBack().filter('.inner'),
                    useKeyboard: this.enableKeyEvents && !this.handleSelect,
                    minScrollbarLength  : this.minScrollbarLength,
                    scrollYStyle: this.scrollYStyle,
                    wheelSpeed: 10,
                    alwaysVisibleY: this.scrollAlwaysVisible
                });
            }

            this.attachKeyEvents();

            if (this.disabled)
                this.setDisabled(this.disabled);

            this.lastSelectedRec = null;
            this._layoutParams = undefined;
        },

        onChangeItem: function(view, record) {
            if (!this.isSuspendEvents) {
                this.trigger('item:change', this, view, record);
            }
        },

        onInitItemTip: function (view, record) {
            const view_el = $(view.el);
            const tip = view_el.data('bs.tooltip');
            if (!(tip === null || tip === undefined))
                view_el.removeData('bs.tooltip');
            if (this.delayRenderTips) {
                view_el.one('mouseenter', () => {
                    view_el.attr('data-toggle', 'tooltip');
                    view_el.tooltip({
                        title: record.get('tip'),
                        placement: 'cursor',
                        zIndex: this.tipZIndex
                    });
                    view_el.mouseenter();
                });
                view_el.attr('aria-label', record.get('tip'));
            } else {
                view_el.attr('data-toggle', 'tooltip');
                view_el.tooltip({
                    title: record.get('tip'),
                    placement: 'cursor',
                    zIndex: this.tipZIndex
                });
                view_el.attr('aria-label', record.get('tip'));
            }
        },

        onRemoveItem: function(view, record) {
            const tip = view.$el.data('bs.tooltip');
            if (tip) {
                if (tip.dontShow===undefined)
                    tip.dontShow = true;
                (tip.tip()).remove();
            }
            this.stopListening(view);
            view.stopListening();

            if (this.store.length < 1 && this.emptyText.length > 0) {
                const el = $(this.el).find('.inner').addBack().filter('.inner');
                if ( el.find('.empty-text').length<=0 )
                    el.append(`<table cellpadding="10" class="empty-text"><tr><td>${this.emptyText}</td></tr></table>`);
            }

            for (let i=0; i < this.dataViewItems.length; i++) {
                if (_.isEqual(view, this.dataViewItems[i]) ) {
                    this.dataViewItems.splice(i, 1);
                    break;
                }
            }

            if (!this.isSuspendEvents) {
                this.trigger('item:remove', this, view, record);
            }
            this._layoutParams = undefined;
        },

        onClickItem: function(view, record, e) {
            if ( this.disabled ) return;

            window._event = e;  //  for FireFox only

            if(this.multiSelect) {
                if (e?.ctrlKey) {
                    this.pressedCtrl = true;
                } else if (e?.shiftKey) {
                    this.pressedShift = true;
                }
            }

            if (this.showLast) {
                if (!this.delaySelect) {
                    this.selectRecord(record);
                } else {
                    _.each(this.store.where({selected: true}), (rec)=> {
                        rec.set({selected: false});
                    });
                    if (record) {
                        setTimeout(_.bind(function () {
                            record.set({selected: true});
                            this.trigger('item:click', this, view, record, e);
                        }, this), 300);
                    }
                }
            }
            this.lastSelectedRec = null;

            const tip = view.$el.data('bs.tooltip');
            if (tip) (tip.tip()).remove();

            if (!this.isSuspendEvents) {
                if (!this.delaySelect) {
                    this.trigger('item:click', this, view, record, e);
                }
            }
        },

        onDblClickItem: function(view, record, e) { // item inner element must have css props: pointer-events: none;
            if ( this.disabled ) return;

            window._event = e;  //  for FireFox only

            if (this.showLast) this.selectRecord(record);
            this.lastSelectedRec = null;

            if (!this.isSuspendEvents) {
                this.trigger('item:dblclick', this, view, record, e);
            }
        },

        onSelectItem: function(view, record, selected) {
            if (!this.isSuspendEvents) {
                this.trigger(selected ? 'item:select' : 'item:deselect', this, view, record, this._fromKeyDown);
            }
        },

        onContextMenuItem: function(view, record, e) {
            if (!this.isSuspendEvents) {
                this.trigger('item:contextmenu', this, view, record, e);
            }
        },

        scrollToRecord: function (record, force, offsetTop) {
            if (!record) return;
            const innerEl = $(this.el).find('.inner');
            const inner_top = Common.Utils.getOffset(innerEl).top + (offsetTop ? offsetTop : 0);
            const idx = _.indexOf(this.store.models, record);
            const div = (idx>=0 && this.dataViewItems.length>idx) ? $(this.dataViewItems[idx].el) : innerEl.find(`#${record.get('id')}`);
            if (div.length<=0) return;
            
            const div_top = Common.Utils.getOffset(div).top;
            const div_first = $(this.dataViewItems[0].el);
            const div_first_top = (div_first.length>0) ? div_first[0].clientTop : 0;
            if (force || div_top < inner_top + div_first_top || div_top+div.outerHeight()*0.9 > inner_top + div_first_top + innerEl.height()) {
                if (this.scroller && this.allowScrollbar) {
                    this.scroller.scrollTop(innerEl.scrollTop() + div_top - inner_top - div_first_top, 0);
                } else {
                    innerEl.scrollTop(innerEl.scrollTop() + div_top - inner_top - div_first_top);
                }
            }
        },

        onKeyDown: function (e, data) {
            if ( this.disabled ) return;
            if (data===undefined) data = e;
            if (data.isDefaultPrevented())
                return;

            if (!this.enableKeyEvents) return;

            if(this.multiSelect) {
                if (data.keyCode === Common.UI.Keys.CTRL) {
                    this.pressedCtrl = true;
                } else if (data.keyCode === Common.UI.Keys.SHIFT) {
                    this.pressedShift = true;
                }
            }

            if (_.indexOf(this.moveKeys, data.keyCode)>-1 || data.keyCode===Common.UI.Keys.RETURN) {
                data.preventDefault();
                data.stopPropagation();
                let rec =(this.multiSelect) ? this.extremeSeletedRec : this.getSelectedRec();
                if (this.lastSelectedRec === null)
                    this.lastSelectedRec = rec;
                if (data.keyCode === Common.UI.Keys.RETURN) {
                    this.lastSelectedRec = null;
                    if (this.selectedBeforeHideRec) // only for ComboDataView menuPicker
                        rec = this.selectedBeforeHideRec;
                    this.trigger('item:click', this, this, rec, e);
                    this.trigger('item:select', this, this, rec, e);
                    this.trigger('entervalue', this, rec, e);
                    if (this.parentMenu)
                        this.parentMenu.hide();
                } else {
                    this.pressedCtrl=false;
                    function getFirstItemIndex() {
                        if (this.dataViewItems.length===0) return 0;
                        let first = 0;
                        while(!this.dataViewItems[first] || !this.dataViewItems[first].$el || this.dataViewItems[first].$el.hasClass('disabled')) {
                            first++;
                        }
                        return first;
                    }
                    function getLastItemIndex() {
                        if (this.dataViewItems.length===0) return 0;
                        let last = this.dataViewItems.length-1;
                        while(!this.dataViewItems[last] || !this.dataViewItems[last].$el || this.dataViewItems[last].$el.hasClass('disabled')) {
                            last--;
                        }
                        return last;
                    }
                    let idx = _.indexOf(this.store.models, rec);
                    if (idx<0) {
                        if (data.keyCode===Common.UI.Keys.LEFT) {
                            const target = $(e.target).closest('.dropdown-submenu.over');
                            if (target.length>0) {
                                target.removeClass('over');
                                target.find('> a').focus();
                            } else
                                idx = getFirstItemIndex.call(this);
                        } else
                            idx = getFirstItemIndex.call(this);
                    } else if (this.options.keyMoveDirection === 'both') {
                        if (this._layoutParams === undefined)
                            this.fillIndexesArray();
                        let topIdx = this.dataViewItems[idx].topIdx;
                        let leftIdx = this.dataViewItems[idx].leftIdx;
                        function checkEl() {
                            const item = this.dataViewItems[this._layoutParams.itemsIndexes[topIdx][leftIdx]];
                            if (item?.$el && !item.$el.hasClass('disabled'))
                                return this._layoutParams.itemsIndexes[topIdx][leftIdx];
                        }

                        idx = undefined;
                        if (data.keyCode===Common.UI.Keys.LEFT) {
                            while (idx===undefined) {
                                leftIdx--;
                                if (leftIdx<0) {
                                    const target = $(e.target).closest('.dropdown-submenu.over');
                                    if (target.length>0) {
                                        target.removeClass('over');
                                        target.find('> a').focus();
                                        break;
                                    }
                                        leftIdx = this._layoutParams.columns-1;
                                }
                                idx = checkEl.call(this);
                            }
                        } else if (data.keyCode===Common.UI.Keys.RIGHT) {
                            while (idx===undefined) {
                                leftIdx++;
                                if (leftIdx>this._layoutParams.columns-1) leftIdx = 0;
                                idx = checkEl.call(this);
                            }
                        } else if (data.keyCode===Common.UI.Keys.UP) {
                            if (topIdx===0 && this.outerMenu && this.outerMenu.menu) {
                                this.deselectAll(true);
                                this.outerMenu.menu.focusOuter?.(data, this.outerMenu.index);
                                return;
                            }
                                while (idx===undefined) {
                                    topIdx--;
                                    if (topIdx<0) topIdx = this._layoutParams.rows-1;
                                    idx = checkEl.call(this);
                                }
                        } else {
                            if (topIdx===this._layoutParams.rows-1 && this.outerMenu && this.outerMenu.menu) {
                                this.deselectAll(true);
                                this.outerMenu.menu.focusOuter?.(data, this.outerMenu.index);
                                return;
                            }
                                while (idx===undefined) {
                                    topIdx++;
                                    if (topIdx>this._layoutParams.rows-1) topIdx = 0;
                                    idx = checkEl.call(this);
                                }
                        }
                    } else {
                        let topIdx = idx;
                        const firstIdx = getFirstItemIndex.call(this);
                        const lastIdx = getLastItemIndex.call(this);
                        idx = undefined;
                        function checkEl() {
                            const item = this.dataViewItems[topIdx];
                            if (item?.$el && !item.$el.hasClass('disabled'))
                                return topIdx;
                        }
                        while (idx===undefined) {
                            topIdx = (data.keyCode===Common.UI.Keys.UP || data.keyCode===Common.UI.Keys.LEFT)
                                    ? Math.max(firstIdx, topIdx-1)
                                    : Math.min(lastIdx, topIdx + 1);
                            idx = checkEl.call(this);
                        }
                    }

                    if (idx !== undefined && idx>=0) rec = this.store.at(idx);
                    if (rec) {
                        this._fromKeyDown = true;
                        this.selectRecord(rec);
                        this.scrollToRecord(rec);
                        (this.itemTabindex!==-1) && this.dataViewItems[idx] && this.dataViewItems[idx].$el.focus();
                        this._fromKeyDown = false;
                    }
                }
            } else {
                this.trigger('item:keydown', this, rec, e);
            }
        },

        onKeyUp: function(e){
            if (!this.enableKeyEvents) return;

            if(e.keyCode === Common.UI.Keys.SHIFT)
                this.pressedShift = false;
            if(e.keyCode === Common.UI.Keys.CTRL)
                this.pressedCtrl = false;
            this.trigger('item:keyup', this, e);
        },

        attachKeyEvents: function() {
            if (this.enableKeyEvents && this.handleSelect) {
                const el = $(this.el).find('.inner').addBack().filter('.inner');
                el.addClass('canfocused');
                el.attr('tabindex', (this.tabindex || 0).toString());
                el.on((this.parentMenu && this.useBSKeydown) ? 'dataview:keydown' : 'keydown', _.bind(this.onKeyDown, this));
                el.on((this.parentMenu && this.useBSKeydown) ? 'dataview:keyup' : 'keyup', _.bind(this.onKeyUp, this));
            }
        },

        showLastSelected: function() {
            if ( this.lastSelectedRec) {
                this.selectRecord(this.lastSelectedRec, true);
                this.scrollToRecord(this.lastSelectedRec);
                this.lastSelectedRec = null;
            } else {
                const selectedRec = this.getSelectedRec();
                if (!this.multiSelect)
                    this.scrollToRecord(selectedRec);
                else if(selectedRec && selectedRec.length > 0)
                    this.scrollToRecord(selectedRec[selectedRec.length - 1]);
            }
        },

        setDisabled: function(disabled) {
            disabled = !!disabled;
            this.disabled = disabled;
            $(this.el).find('.inner').addBack().filter('.inner').toggleClass('disabled', disabled);

            if (this.tabindex!==undefined) {
                const el = $(this.el).find('.inner').addBack().filter('.inner');
                disabled && (this.tabindex = el.attr('tabindex'));
                el.attr('tabindex', disabled ? "-1" : this.tabindex);
            }
        },

        isDisabled: function() {
            return this.disabled;
        },

        setEmptyText: function(emptyText) {
            this.emptyText = emptyText;

            if (this.store.length < 1) {
                const el = $(this.el).find('.inner').addBack().filter('.inner').find('.empty-text td');
                if ( el.length>0 )
                    el.text(this.emptyText);
            }
        },

        alignPosition: function() {
            const menuRoot = (this.parentMenu.cmpEl.attr('role') === 'menu')
                            ? this.parentMenu.cmpEl
                            : this.parentMenu.cmpEl.find('[role=menu]');
            const docH = Common.Utils.innerHeight()-10;
            const innerEl = $(this.el).find('.inner').addBack().filter('.inner');
            // parent = innerEl.parent(),
            // margins =  parseInt(parent.css('margin-top')) + parseInt(parent.css('margin-bottom')) + parseInt(menuRoot.css('margin-top')),
            // paddings = parseInt(menuRoot.css('padding-top')) + parseInt(menuRoot.css('padding-bottom')),
            const menuH = menuRoot.outerHeight();
            const innerH = innerEl.height();
            const diff = Math.max(menuH - innerH, 0);
            const top = Number.parseInt(menuRoot.css('top'));
            const props = {minScrollbarLength  : this.minScrollbarLength};
            this.scrollAlwaysVisible && (props.alwaysVisibleY = this.scrollAlwaysVisible);

            if (top + menuH > docH ) {
                innerEl.css('max-height', `${docH - top - diff}px`);
                if (this.allowScrollbar) this.scroller.update(props);
            } else if ( top + menuH < docH && innerH < this.options.restoreHeight ) {
                innerEl.css('max-height', `${Math.min(docH - top - diff, this.options.restoreHeight)}px`);
                if (this.allowScrollbar) this.scroller.update(props);
            }
        },

        fillIndexesArray: function() {
            if (this.dataViewItems.length<=0) return;

            this._layoutParams = {
                itemsIndexes:   [],
                columns:        0,
                rows:           0
            };

            const el = $(this.dataViewItems[0].el);
            const itemW = el.outerWidth() + Number.parseFloat(el.css('margin-left')) + Number.parseFloat(el.css('margin-right'));
            const offsetLeft = Common.Utils.getOffset(this.$el).left;
            const offsetTop = Common.Utils.getOffset(el).top;
            let prevtop = -1;
            let topIdx = 0;
            let leftIdx = 0;

            for (let i=0; i<this.dataViewItems.length; i++) {
                const top = Common.Utils.getOffset($(this.dataViewItems[i].el)).top - offsetTop;
                leftIdx = Math.floor((Common.Utils.getOffset($(this.dataViewItems[i].el)).left - offsetLeft)/itemW + 0.01);
                if (top>prevtop) {
                    prevtop = top;
                    this._layoutParams.itemsIndexes.push([]);
                    topIdx = this._layoutParams.itemsIndexes.length-1;
                }
                this._layoutParams.itemsIndexes[topIdx][leftIdx] = i;
                this.dataViewItems[i].topIdx = topIdx;
                this.dataViewItems[i].leftIdx = leftIdx;
                if (this._layoutParams.columns<leftIdx) this._layoutParams.columns = leftIdx;
            }
            this._layoutParams.rows = this._layoutParams.itemsIndexes.length;
            this._layoutParams.columns++;
        },

        setMultiselectMode: function (multiselect) {
            this.pressedCtrl = !!multiselect;
        },

        onResize: function() {
            this._layoutParams = undefined;
        },

        focus: function(index) {
            $(this.el).find('.inner').addBack().filter('.inner').focus();
            let rec;
            if (typeof index === 'string') {
                if (index === 'first') {
                    rec = this.selectByIndex(0, true);
                } else if (index === 'last') {
                    if (this._layoutParams === undefined)
                        this.fillIndexesArray();
                    rec = this.selectByIndex(this._layoutParams.itemsIndexes[this._layoutParams.rows-1][0], true);
                }
            } else if (index !== undefined)
                rec = this.selectByIndex(index, true);
            this.scrollToRecord(rec);
        },

        focusInner: function(e) {
            this.focus(e.keyCode === Common.UI.Keys.DOWN ? 'first' : 'last');
        }
    });

    Common.UI.DataViewSimple = Common.UI.BaseView.extend({
        options : {
            handleSelect: true,
            enableKeyEvents: true,
            keyMoveDirection: 'both', // 'vertical', 'horizontal'
            restoreHeight: 0,
            scrollAlwaysVisible: false,
            useBSKeydown: false
        },

        template: _.template([
            '<div class="dataview inner" style="<%= style %>" role="list">',
            '<% _.each(items, function(item) { %>',
                '<% if (!item.id) item.id = Common.UI.getId(); %>',
                '<div class="item" role="listitem" <% if(typeof itemTabindex !== undefined) { %> tabindex="<%= itemTabindex %>" <% } %> <% if(!!item.tip) { %> data-toggle="tooltip" <% } %> data-hint="<%= item.dataHint %>" data-hint-direction="<%= item.dataHintDirection %>" data-hint-offset="<%= item.dataHintOffset %>"><%= itemTemplate(item) %></div>',
            '<% }) %>',
            '</div>'
        ].join('')),

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            this.template       = this.options.template       || this.template;
            this.store          = this.options.store          || new Common.UI.DataViewStore();
            this.itemTemplate   = this.options.itemTemplate   || null;
            this.handleSelect   = this.options.handleSelect;
            this.parentMenu     = this.options.parentMenu;
            this.outerMenu      = this.options.outerMenu;
            this.enableKeyEvents= this.options.enableKeyEvents;
            this.useBSKeydown   = this.options.useBSKeydown; // only with enableKeyEvents && parentMenu
            this.style          = this.options.style        || '';
            this.scrollAlwaysVisible = this.options.scrollAlwaysVisible || false;
            this.tabindex = this.options.tabindex || 0;
            this.itemTabindex = this.options.itemTabindex!==undefined ? this.options.itemTabindex : this.tabindex>0 ? -1 : 0; //do not set focus to items when dataview get focus

            if (this.parentMenu)
                this.parentMenu.options.restoreHeight = (this.options.restoreHeight>0);
            this.rendered       = false;
            if (this.options.keyMoveDirection==='vertical')
                this.moveKeys = [Common.UI.Keys.UP, Common.UI.Keys.DOWN];
            else if (this.options.keyMoveDirection==='horizontal')
                this.moveKeys = [Common.UI.Keys.LEFT, Common.UI.Keys.RIGHT];
            else
                this.moveKeys = [Common.UI.Keys.UP, Common.UI.Keys.DOWN, Common.UI.Keys.LEFT, Common.UI.Keys.RIGHT];
            if (this.options.el)
                this.render();
        },

        render: function (parentEl) {
            this.trigger('render:before', this);
            if (parentEl) {
                this.setElement(parentEl, false);
                this.cmpEl = $(this.template({
                    items: this.store.toJSON(),
                    itemTemplate: this.itemTemplate,
                    style: this.style,
                    itemTabindex: this.itemTabindex || 0
                }));

                parentEl.html(this.cmpEl);
            } else {
                this.cmpEl = this.$el || $(this.el);
                this.cmpEl.html(this.template({
                    items: this.store.toJSON(),
                    itemTemplate: this.itemTemplate,
                    style: this.style,
                    options: this.options,
                    itemTabindex: this.itemTabindex || 0
                }));
            }
            let modalParents = this.cmpEl.closest('.asc-window');
            if (modalParents.length < 1)
                modalParents = this.cmpEl.closest('[id^="menu-container-"]'); // context menu
            if (modalParents.length > 0) {
                this.tipZIndex = Number.parseInt(modalParents.css('z-index')) + 10;
            }

            if (!this.rendered) {
                if (this.parentMenu) {
                    this.cmpEl.closest('li').css('height', '100%');
                    this.cmpEl.css('height', '100%');
                    this.parentMenu.on('show:after', _.bind(this.alignPosition, this));
                    this.parentMenu.on('show:after', _.bind(this.onAfterShowMenu, this));
                } else if (this.store.length>0)
                    this.onAfterShowMenu();

                if (this.enableKeyEvents && this.parentMenu && this.handleSelect) {
                    this.parentMenu.on('show:before', (menu) => { this.deselectAll(); });
                    this.parentMenu.on('show:after', (menu) => {
                        Common.NotificationCenter.trigger('dataview:focus');
                        _.delay(() => {
                            menu.cmpEl.find('.dataview').focus();
                        }, 10);
                    }).on('hide:after', () => {
                        Common.NotificationCenter.trigger('dataview:blur');
                    });
                }
                this.attachKeyEvents();
                this.cmpEl.on( "click", "div.item", _.bind(this.onClickItem, this));
            }
            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: $(this.el).find('.inner').addBack().filter('.inner'),
                    useKeyboard: this.enableKeyEvents && !this.handleSelect,
                    minScrollbarLength  : this.minScrollbarLength,
                    scrollYStyle: this.scrollYStyle,
                    wheelSpeed: 10,
                    alwaysVisibleY: this.scrollAlwaysVisible
                });
            }

            this.rendered = true;

            (this.$el || $(this.el)).on('click', (e)=> {
                if (/dataview|grouped-data|group-items-container/.test(e.target.className) || $(e.target).closest('.group-description').length>0) return false;
            });

            this.trigger('render:after', this);
            return this;
        },

        selectRecord: function(record, suspendEvents) {
            if (!this.handleSelect)
                return;

            if (suspendEvents)
                this.suspendEvents();

            this.deselectAll(suspendEvents);

            if (record) {
                record.set({selected: true});
                const idx = _.indexOf(this.store.models, record);
                if (idx>=0 && this.dataViewItems && this.dataViewItems.length>idx) {
                    this.dataViewItems[idx].el.addClass('selected');
                }
            }

            if (suspendEvents)
                this.resumeEvents();
            return record;
        },

        selectByIndex: function(index, suspendEvents) {
            if (this.store.length > 0 && index > -1 && index < this.store.length) {
                return this.selectRecord(this.store.at(index), suspendEvents);
            }
        },

        deselectAll: function(suspendEvents) {
            if (suspendEvents)
                this.suspendEvents();

            _.each(this.store.where({selected: true}), (record)=> {
                record.set({selected: false});
            });
            this.cmpEl.find('.item.selected').removeClass('selected');
            this.lastSelectedRec = null;

            if (suspendEvents)
                this.resumeEvents();
        },

        getSelectedRec: function() {
            return this.store.findWhere({selected: true});
        },

        onResetItems: function() {
            this.dataViewItems && _.each(this.dataViewItems, (item) => {
                const tip = item.el.data('bs.tooltip');
                if (tip) {
                    if (tip.dontShow===undefined)
                        tip.dontShow = true;
                    (tip.tip()).remove();
                }
            }, this);
            this.dataViewItems = null;

            const template = _.template([
                '<% _.each(items, function(item) { %>',
                    '<% if (!item.id) item.id = Common.UI.getId(); %>',
                    '<div class="item" role="listitem" <% if(typeof itemTabindex !== undefined) { %> tabindex="<%= itemTabindex %>" <% } %> <% if(!!item.tip) { %> data-toggle="tooltip" <% } %> data-hint="<%= item.dataHint %>" data-hint-direction="<%= item.dataHintDirection %>" data-hint-offset="<%= item.dataHintOffset %>"><%= itemTemplate(item) %></div>',
                '<% }) %>'
            ].join(''));
            this.cmpEl?.find('.inner').html(template({
                items: this.store.toJSON(),
                itemTemplate: this.itemTemplate,
                style : this.style,
                itemTabindex: this.itemTabindex || 0
            }));

            if (!_.isUndefined(this.scroller)) {
                this.scroller.destroy();
                this.scroller = undefined;
            }

            this.scroller = new Common.UI.Scroller({
                el: $(this.el).find('.inner').addBack().filter('.inner'),
                useKeyboard: this.enableKeyEvents && !this.handleSelect,
                minScrollbarLength  : this.minScrollbarLength,
                scrollYStyle: this.scrollYStyle,
                wheelSpeed: 10,
                alwaysVisibleY: this.scrollAlwaysVisible
            });

            if (!this.parentMenu && this.store.length>0)
                this.onAfterShowMenu();
            this._layoutParams = undefined;
        },

        setStore: function(store) {
            if (store) {
                this.store = store;
                this.onResetItems();
            }
        },

        onClickItem: function(e) {
            if ( this.disabled ) return;

            window._event = e;  //  for FireFox only

            const index = $(e.currentTarget).closest('div.item').index();
            const record = (index>=0) ? this.store.at(index) : null;
            const view = (index>=0) ? this.dataViewItems[index] : null;
            if (!record || !view) return;

            record.set({selected: true});
            const tip = view.el.data('bs.tooltip');
            if (tip) (tip.tip()).remove();

            if (!this.isSuspendEvents) {
                this.trigger('item:click', this, view.el, record, e);
            }
        },

        onAfterShowMenu: function(e) {
            if (!this.dataViewItems) {
                this.dataViewItems = [];
                _.each(this.cmpEl.find('div.item'), (item, index) => {
                    const $item = $(item);
                    const rec = this.store.at(index);
                    this.dataViewItems.push({el: $item});
                    const tip = rec.get('tip');
                    if (tip) {
                        $item.tooltip({
                            title       : tip,
                            placement   : 'cursor',
                            zIndex : this.tipZIndex
                        });
                        $item.attr('aria-label', tip);
                    }
                });
            }
        },

        scrollToRecord: function (record) {
            if (!record) return;
            const innerEl = $(this.el).find('.inner');
            const inner_top = Common.Utils.getOffset(innerEl).top;
            const idx = _.indexOf(this.store.models, record);
            const div = (idx>=0 && this.dataViewItems.length>idx) ? this.dataViewItems[idx].el : innerEl.find(`#${record.get('id')}`);
            if (div.length<=0) return;

            const div_top = Common.Utils.getOffset(div).top;
            const div_first = this.dataViewItems[0].el;
            const div_first_top = (div_first.length>0) ? div_first[0].offsetTop : 0;
            if (div_top < inner_top + div_first_top || div_top+div.outerHeight() > inner_top + innerEl.height()) {
                if (this.scroller) {
                    this.scroller.scrollTop(innerEl.scrollTop() + div_top - inner_top - div_first_top, 0);
                } else {
                    innerEl.scrollTop(innerEl.scrollTop() + div_top - inner_top - div_first_top);
                }
            }
        },

        onKeyDown: function (e, data) {
            if ( this.disabled ) return;
            if (data===undefined) data = e;
            if (_.indexOf(this.moveKeys, data.keyCode)>-1 || data.keyCode===Common.UI.Keys.RETURN) {
                data.preventDefault();
                data.stopPropagation();
                let rec = this.getSelectedRec();
                if (data.keyCode===Common.UI.Keys.RETURN) {
                    if (this.selectedBeforeHideRec) // only for ComboDataView menuPicker
                        rec = this.selectedBeforeHideRec;
                    if (this.canAddRecents) // only for DataViewShape
                        this.addRecentItem(rec);
                    rec && this.trigger('item:click', this, this, rec, e);
                    if (this.parentMenu)
                        this.parentMenu.hide();
                } else {
                    let idx = _.indexOf(this.store.models, rec);
                    if (idx<0) {
                        function getFirstItemIndex() {
                            if (this.dataViewItems.length===0) return 0;
                            let first = 0;
                            while(!this.dataViewItems[first].el.is(':visible')) {
                                first++;
                            }
                            return first;
                        }
                        if (data.keyCode===Common.UI.Keys.LEFT) {
                            const target = $(e.target).closest('.dropdown-submenu.over');
                            if (target.length>0) {
                                target.removeClass('over');
                                target.find('> a').focus();
                            } else
                                idx = getFirstItemIndex.call(this);
                        } else
                            idx = getFirstItemIndex.call(this);
                    } else if (this.options.keyMoveDirection === 'both') {
                        if (this._layoutParams === undefined)
                            this.fillIndexesArray();
                        let topIdx = this.dataViewItems[idx].topIdx;
                        let leftIdx = this.dataViewItems[idx].leftIdx;

                        idx = undefined;
                        if (data.keyCode===Common.UI.Keys.LEFT) {
                            while (idx===undefined) {
                                leftIdx--;
                                if (leftIdx<0) {
                                    const target = $(e.target).closest('.dropdown-submenu.over');
                                    if (target.length>0) {
                                        target.removeClass('over');
                                        target.find('> a').focus();
                                        break;
                                    }
                                        leftIdx = this._layoutParams.columns-1;
                                }
                                idx = this._layoutParams.itemsIndexes[topIdx][leftIdx];
                            }
                        } else if (data.keyCode===Common.UI.Keys.RIGHT) {
                            while (idx===undefined) {
                                leftIdx++;
                                if (leftIdx>this._layoutParams.columns-1) leftIdx = 0;
                                idx = this._layoutParams.itemsIndexes[topIdx][leftIdx];
                            }
                        } else if (data.keyCode===Common.UI.Keys.UP) {
                            if (topIdx===0 && this.outerMenu && this.outerMenu.menu) {
                                this.deselectAll(true);
                                this.outerMenu.menu.focusOuter?.(data, this.outerMenu.index);
                                return;
                            }
                                while (idx===undefined) {
                                    topIdx--;
                                    if (topIdx<0) topIdx = this._layoutParams.rows-1;
                                    idx = this._layoutParams.itemsIndexes[topIdx][leftIdx];
                                }
                        } else {
                            if (topIdx===this._layoutParams.rows-1 && this.outerMenu && this.outerMenu.menu) {
                                this.deselectAll(true);
                                this.outerMenu.menu.focusOuter?.(data, this.outerMenu.index);
                                return;
                            }
                                while (idx===undefined) {
                                    topIdx++;
                                    if (topIdx>this._layoutParams.rows-1) topIdx = 0;
                                    idx = this._layoutParams.itemsIndexes[topIdx][leftIdx];
                                }
                        }
                    } else {
                        idx = (data.keyCode===Common.UI.Keys.UP || data.keyCode===Common.UI.Keys.LEFT)
                            ? Math.max(0, idx-1)
                            : Math.min(this.store.length - 1, idx + 1) ;
                    }

                    if (idx !== undefined && idx>=0) rec = this.store.at(idx);
                    if (rec) {
                        this._fromKeyDown = true;
                        this.selectRecord(rec);
                        this.scrollToRecord(rec);
                        (this.itemTabindex!==-1) && this.dataViewItems[idx] && $(this.dataViewItems[idx].el).focus();
                        this._fromKeyDown = false;
                    }
                }
            } else {
                this.trigger('item:keydown', this, rec, e);
            }
        },

        attachKeyEvents: function() {
            if (this.enableKeyEvents && this.handleSelect) {
                const el = $(this.el).find('.inner').addBack().filter('.inner');
                el.addClass('canfocused');
                el.attr('tabindex', this.tabindex.toString());
                el.on((this.parentMenu && this.useBSKeydown) ? 'dataview:keydown' : 'keydown', _.bind(this.onKeyDown, this));
            }
        },

        setDisabled: function(disabled) {
            disabled = !!disabled;
            this.disabled = disabled;
            $(this.el).find('.inner').addBack().filter('.inner').toggleClass('disabled', disabled);
        },

        isDisabled: function() {
            return this.disabled;
        },

        alignPosition: function() {
            const menuRoot = (this.parentMenu.cmpEl.attr('role') === 'menu')
                    ? this.parentMenu.cmpEl
                    : this.parentMenu.cmpEl.find('[role=menu]');
            const docH = Common.Utils.innerHeight()-10;
            const innerEl = $(this.el).find('.inner').addBack().filter('.inner');
            const parent = innerEl.parent();
            const margins =  Number.parseInt(parent.css('margin-top')) + Number.parseInt(parent.css('margin-bottom')) + Number.parseInt(menuRoot.css('margin-top'));
            const paddings = Number.parseInt(menuRoot.css('padding-top')) + Number.parseInt(menuRoot.css('padding-bottom'));
            const menuH = menuRoot.outerHeight();
            const top = Number.parseInt(menuRoot.css('top'));
            const props = {minScrollbarLength  : this.minScrollbarLength};
            this.scrollAlwaysVisible && (props.alwaysVisibleY = this.scrollAlwaysVisible);

            let menuUp = false;
            if (this.parentMenu.menuAlign) {
                const m = this.parentMenu.menuAlign.match(/^([a-z]+)-([a-z]+)/);
                menuUp = (m[1]==='bl' || m[1]==='br');
            }
            if (menuUp) {
                const bottom = top + menuH;
                if (top<0) {
                    innerEl.css('max-height', `${bottom - paddings - margins}px`);
                    menuRoot.css('top', 0);
                    this.scroller.update(props);
                } else if (top>0 && innerEl.height() < this.options.restoreHeight) {
                    innerEl.css('max-height', `${Math.min(bottom - paddings - margins, this.options.restoreHeight)}px`);
                    menuRoot.css('top', bottom - menuRoot.outerHeight());
                    this.scroller.update(props);
                }
            } else {
                if (top + menuH > docH ) {
                    innerEl.css('max-height', `${docH - top - paddings - margins}px`);
                    this.scroller.update(props);
                } else if ( top + menuH < docH && innerEl.height() < this.options.restoreHeight ) {
                    innerEl.css('max-height', `${Math.min(docH - top - paddings - margins, this.options.restoreHeight)}px`);
                    this.scroller.update(props);
                }
            }
        },

        fillIndexesArray: function() {
            if (this.dataViewItems.length<=0) return;

            this._layoutParams = {
                itemsIndexes:   [],
                columns:        0,
                rows:           0
            };

            const el = this.dataViewItems[0].el;
            const itemW = el.outerWidth() + Number.parseFloat(el.css('margin-left')) + Number.parseFloat(el.css('margin-right'));
            const offsetLeft = Common.Utils.getOffset(this.$el).left;
            const offsetTop = Common.Utils.getOffset(el).top;
            let prevtop = -1;
            let topIdx = 0;
            let leftIdx = 0;

            for (let i=0; i<this.dataViewItems.length; i++) {
                const item = this.dataViewItems[i];
                const top = Common.Utils.getOffset(item.el).top - offsetTop;
                leftIdx = Math.floor((Common.Utils.getOffset(item.el).left - offsetLeft)/itemW);
                if (top>prevtop) {
                    prevtop = top;
                    this._layoutParams.itemsIndexes.push([]);
                    topIdx = this._layoutParams.itemsIndexes.length-1;
                }
                this._layoutParams.itemsIndexes[topIdx][leftIdx] = i;
                item.topIdx = topIdx;
                item.leftIdx = leftIdx;
                if (this._layoutParams.columns<leftIdx) this._layoutParams.columns = leftIdx;
            }
            this._layoutParams.rows = this._layoutParams.itemsIndexes.length;
            this._layoutParams.columns++;
        },

        onResize: function() {
            this._layoutParams = undefined;
        },

        focus: function(index) {
            this.cmpEl?.find('.dataview').focus();
            let rec;
            if (typeof index === 'string') {
                if (index === 'first') {
                    rec = this.selectByIndex(0, true);
                } else if (index === 'last') {
                    if (this._layoutParams === undefined)
                        this.fillIndexesArray();
                    rec = this.selectByIndex(this._layoutParams.itemsIndexes[this._layoutParams.rows-1][0], true);
                }
            } else if (index !== undefined)
                rec = this.selectByIndex(index, true);
            this.scrollToRecord(rec);
        },

        focusInner: function(e) {
            this.focus(e.keyCode === Common.UI.Keys.DOWN ? 'first' : 'last');
        }
    });

    $(document).on('keydown.dataview', '[data-toggle=dropdown], [role=menu]',  (e) => {
        if (e.keyCode !== Common.UI.Keys.UP && e.keyCode !== Common.UI.Keys.DOWN && e.keyCode !== Common.UI.Keys.LEFT && e.keyCode !== Common.UI.Keys.RIGHT && e.keyCode !== Common.UI.Keys.RETURN) return;

        _.defer(()=> {
            const target = $(e.target).closest('.dropdown-toggle');
            if (target.length)
                target.parent().find('.inner.canfocused').trigger('dataview:keydown', e);
            else {
                $(e.target).closest('.dropdown-submenu').find('.inner.canfocused').trigger('dataview:keydown', e);
            }
        }, 100);
    });

    Common.UI.DataViewShape = Common.UI.DataViewSimple.extend(_.extend({
        template: _.template([
            '<div class="dataview inner" style="<%= style %>" role="list">',
                '<% _.each(options.groupsWithRecent, function(group, index) { %>',
                    '<div class="grouped-data <% if (index === 0) { %> recent-group <% } %> " id="<%= group.id %>" >',
                        '<% if (!_.isEmpty(group.groupName)) { %>',
                            '<div class="group-description">',
                                '<span><%= group.groupName %></span>',
                            '</div>',
                        '<% } %>',
                        '<div class="group-items-container <% if (index === 0) { %> recent-items <% } %>">',
                            '<% _.each(group.groupStore.toJSON(), function(item, index) { %>',
                                '<% if (!item.id) item.id = Common.UI.getId(); %>',
                                    '<div class="item canfocused" role="listitem" <% if (typeof itemTabindex !== undefined) { %> tabindex="<%= itemTabindex %>" <% } %> data-index="<%= index %>"<% if(!!item.tip) { %> data-toggle="tooltip" <% } %> ><%= itemTemplate(item) %></div>',
                                '<% }); %>',
                        '</div>',
                    '</div>',
                '<% }); %>',
            '</div>'
        ].join('')),
        initialize : function(options) {
            this.canAddRecents = true;

            this._state = {
                hideTextRect: options.hideTextRect,
                hideLines: options.hideLines
            }

            const filter = Common.localStorage.getKeysFilter();
            this.appPrefix = (filter?.length) ? filter.split(',')[0] : '';

            this.groups = options.groups.toJSON();

            // add recent shapes to store
            const recentStore = new Common.UI.DataViewGroupStore;
            const recentArr = options.recentShapes || [];
            const cols = (recentArr.length) > 18 ? 7 : 6;
            const height = Math.ceil(recentArr.length/cols) * 35 + 3;
            const width = 30 * cols;

            this.recentShapes = recentArr;

            // check lang
            if (this.recentShapes.length > 0) {
                const isTranslated = _.findWhere(this.groups, {groupName: this.recentShapes[0].groupName});
                if (!isTranslated) {
                    for (let r = 0; r < this.recentShapes.length; r++) {
                        const type = this.recentShapes[r].data.shapeType;
                        let record;
                        for (let g = 0; g < this.groups.length; g++) {
                            const store = this.groups[g].groupStore;
                            const groupName = this.groups[g].groupName;
                            for (let i = 0; i < store.length; i++) {
                                if (store.at(i).get('data').shapeType === type) {
                                    record = store.at(i).toJSON();
                                    this.recentShapes[r] = {
                                        data: record.data,
                                        tip: record.tip,
                                        allowSelected: record.allowSelected,
                                        selected: false,
                                        groupName: groupName
                                    };
                                    break;
                                }
                            }
                            if (record) {
                                record = undefined;
                                break;
                            }
                        }
                    }
                    Common.localStorage.setItem(`${this.appPrefix}recent-shapes`, JSON.stringify(this.recentShapes));
                }
            }

            // Add default recent

            if (this.recentShapes.length < 12) {
                let count = 12 - this.recentShapes.length;
                const defaultArr = [];

                const addItem = (rec, groupName) => {
                    const item = rec.toJSON();
                    const model = {
                            data: item.data,
                            tip: item.tip,
                            allowSelected: item.allowSelected,
                            selected: false,
                            groupName: groupName
                        };
                    defaultArr.push(model);
                };

                for (let i = 0; i < this.groups.length && count > 0; i++) {
                    const groupStore = this.groups[i].groupStore;
                    const groupName = this.groups[i].groupName;
                    if (i === 0) {
                        addItem(groupStore.at(1), groupName);
                        count--;
                        if (count > 0) {
                            addItem(groupStore.at(2), groupName);
                            count--;
                        }
                    } else if (i !== 3 && i !== 6 && i !== 7) {
                        addItem(groupStore.at(0), groupName);
                        count--;
                        if (count > 0) {
                            addItem(groupStore.at(1), groupName);
                            count--;
                        }
                    }
                }
                this.recentShapes = this.recentShapes.concat(defaultArr);
            }

            recentStore.add(this.recentShapes);
            this.groups.unshift({
                groupName   : options.textRecentlyUsed,
                groupStore  : recentStore,
                groupWidth  : width,
                groupHeight : height
            });

            this.options.groupsWithRecent = this.groups;

            const store = new Common.UI.DataViewStore();

            _.each(this.groups, (group, index) => {
                const models = group.groupStore.models;
                if (index > 0) {
                    for (let i = 0; i < models.length; i++) {
                        models[i].set({groupName: group.groupName});
                    }
                }
                store.add(models);
            });

            options.store = store;

            Common.UI.DataViewSimple.prototype.initialize.call(this, options);

            this.parentMenu.on('show:before', () => { this.updateRecents(); });

            if (this._state.hideLines) {
                this.hideLinesGroup();
            }
        },
        onAfterShowMenu: function(e) {
            let updateHideRect = false;
            if (!this.dataViewItems) {
                this.dataViewItems = [];
                _.each(this.cmpEl.find('div.grouped-data'), (group, indexGroup) => {
                    _.each($(group).find('div.item'), (item, index) => {
                        const $item = $(item);
                        const rec = this.groups[indexGroup].groupStore.at(index);
                        this.dataViewItems.push({el: $item, groupIndex: indexGroup, index: index});
                        const tip = rec.get('tip');
                        if (tip) {
                            $item.one('mouseenter', ()=> { // hide tooltip when mouse is over menu
                                $item.attr('data-toggle', 'tooltip');
                                $item.tooltip({
                                    title       : tip,
                                    placement   : 'cursor',
                                    zIndex : this.tipZIndex
                                });
                                $item.mouseenter();
                            });
                            $item.attr('aria-label', tip);
                        }
                    });
                });
                updateHideRect = true;
            }
            if (this.updateDataViewItems && this.cmpEl.is(':visible')) {
                // add recent item in dataViewItems
                const recent = _.where(this.dataViewItems, {groupIndex: 0});
                const len = recent ? recent.length : 0;
                for (let i = 0; i < len; i++) {
                    const tip = this.dataViewItems[i].el.data('bs.tooltip');
                    if (tip) {
                        if (tip.dontShow===undefined)
                            tip.dontShow = true;
                        (tip.tip()).remove();
                    }
                }
                this.dataViewItems = this.dataViewItems.slice(len);
                const recentViewItems = [];
                _.each(this.cmpEl.find('.recent-group div.item'), (item, index) => {
                    const $item = $(item);
                    const rec = this.recentShapes[index];
                    recentViewItems.push({el: $item, groupIndex: 0, index: index});
                    const tip = rec.tip;
                    if (tip) {
                        $item.one('mouseenter', ()=> { // hide tooltip when mouse is over menu
                            $item.attr('data-toggle', 'tooltip');
                            $item.tooltip({
                                title: tip,
                                placement: 'cursor',
                                zIndex : this.tipZIndex
                            });
                            $item.mouseenter();
                        });
                        $item.attr('aria-label', tip);
                    }
                });
                this.dataViewItems = recentViewItems.concat(this.dataViewItems);

                if (this.recentShapes.length === 1) {
                    $('.recent-group').show();
                }
                this.updateDataViewItems = false;

                updateHideRect = true;
            }
            if (this._state.hideLines) {
                this.hideLines();
            }
            if (updateHideRect) {
                this.hideTextRect(this._state.hideTextRect);
            }
            this.fillIndexesArray();
        },

        onClickItem: function(e) {
            if ( this.disabled ) return;

            window._event = e;  //  for FireFox only

            const groupIndex = $(e.currentTarget).closest('div.grouped-data').index();
            const itemIndex = $(e.currentTarget).closest('div.item').data('index');
            const index = _.findIndex(this.dataViewItems, (item) => (item.groupIndex === groupIndex && item.index === itemIndex));
            const record = (index>=0) ? this.store.at(index) : null;
            const view = (index>=0) ? this.dataViewItems[index] : null;
            if (!record || !view) return;

            record.set({selected: true});
            const tip = view.el.data('bs.tooltip');
            if (tip) (tip.tip()).remove();

            if (!this.isSuspendEvents) {
                this.trigger('item:click', this, view.el, record, e);
            }

            this.addRecentItem(record);
        },
        addRecentItem: function (rec) {
            if (!rec) return;
            let exist = false;
            const type = rec.get('data').shapeType;
            const groupName = rec.get('groupName');
            for (let i = 0; i < this.recentShapes.length; i++) {
                if (this.recentShapes[i].data.shapeType === type) {
                    exist = true;
                    break;
                }
            }
            if (exist) return;

            const item = rec.toJSON();
            const model = {
                    data: item.data,
                    tip: item.tip,
                    allowSelected: item.allowSelected,
                    selected: false,
                    groupName: groupName
                };
            const arr = [model].concat(this.recentShapes.slice(0, 11));
            Common.localStorage.setItem(`${this.appPrefix}recent-shapes`, JSON.stringify(arr));
            this.recentShapes = undefined;
        },
        updateRecents: function () {
            let recents = Common.localStorage.getItem(`${this.appPrefix}recent-shapes`);
            recents = recents ? JSON.parse(recents) : [];

            let diff = false;
            if (this.recentShapes) {
                for (let i = 0; i < recents.length; i++) {
                    if (!this.recentShapes[i] || (this.recentShapes[i] && recents[i].tip !== this.recentShapes[i].tip)) {
                        diff = true;
                    }
                }
            } else {
                diff = true;
            }

            if (recents.length > 0 && diff) {
                this.recentShapes = recents;
                const resentsStore = new Common.UI.DataViewStore();
                _.each(this.recentShapes, (recent) => {
                    const model = {
                        data: {shapeType: recent.data.shapeType},
                        tip: recent.tip,
                        allowSelected: recent.allowSelected,
                        selected: recent.selected,
                        groupName: recent.groupName
                    };
                    resentsStore.push(model);
                });
                this.groups[0].groupStore = resentsStore;

                const store = new Common.UI.DataViewStore();
                _.each(this.groups, (group) => {
                    store.add(group.groupStore.models);
                });
                this.store = store;

                const template = _.template([
                    '<% _.each(items, function(item, index) { %>',
                    '<% if (!item.id) item.id = Common.UI.getId(); %>',
                    '<div class="item canfocused" role="listitem" <% if (typeof itemTabindex !== undefined) { %> tabindex="<%= itemTabindex %>" <% } %> data-index="<%= index %>"<% if(!!item.tip) { %> data-toggle="tooltip" <% } %> ><%= itemTemplate(item) %></div>',
                    '<% }) %>'
                ].join(''));
                this.cmpEl?.find('.recent-items').html(template({
                    items: this.recentShapes,
                    itemTemplate: this.itemTemplate,
                    style : this.style,
                    itemTabindex: this.itemTabindex || 0
                }));

                this.updateDataViewItems = true;
            }
        },
        fillIndexesArray: function() {
            if (this.dataViewItems.length<=0) return;

            this._layoutParams = {
                itemsIndexes:   [],
                columns:        0,
                rows:           0
            };

            let el = this.dataViewItems[0].el;
            let first = 0;
            while (!this.dataViewItems[first].el.is(":visible")) { // if first elem is hidden
                first++;
                if (!this.dataViewItems[first]) return;
                el = this.dataViewItems[first].el;
            }

            const itemW = el.outerWidth() + Number.parseInt(el.css('margin-left')) + Number.parseInt(el.css('margin-right'));
            const offsetLeft = Common.Utils.getOffset(this.$el).left;
            const offsetTop = Common.Utils.getOffset(el).top;
            let prevtop = -1;
            let topIdx = 0;
            let leftIdx = first;

            for (let i=0; i<this.dataViewItems.length; i++) {
                const item = this.dataViewItems[i];
                if (item.el.is(":visible")) {
                    const top = Common.Utils.getOffset(item.el).top - offsetTop;
                    leftIdx = Math.floor((Common.Utils.getOffset(item.el).left - offsetLeft) / itemW);
                    if (top > prevtop) {
                        prevtop = top;
                        this._layoutParams.itemsIndexes.push([]);
                        topIdx = this._layoutParams.itemsIndexes.length - 1;
                    }
                    this._layoutParams.itemsIndexes[topIdx][leftIdx] = i;
                    item.topIdx = topIdx;
                    item.leftIdx = leftIdx;
                    if (this._layoutParams.columns < leftIdx) this._layoutParams.columns = leftIdx;
                } else {
                    item.topIdx = -1;
                    item.leftIdx = -1;
                }
            }
            this._layoutParams.rows = this._layoutParams.itemsIndexes.length;
            this._layoutParams.columns++;
        },
        hideTextRect: function (hide) {
            this.dataViewItems && this.store.each((item, index)=> {
                if (item.get('data').shapeType === 'textRect' && this.dataViewItems[index] && this.dataViewItems[index].el) {
                    this.dataViewItems[index].el[hide ? 'addClass' : 'removeClass']('hidden');
                }
            }, this);
            this._state.hideTextRect = hide;
        },
        hideLinesGroup: function () {
            $(this.cmpEl.find('div.grouped-data')[9]).hide();
        },
        hideLines: function () {
            this.store.each((item, index)=> {
                if (item.get('groupName') === 'Lines') {
                    const el = this.dataViewItems[index].el;
                    if (el?.is(':visible')) {
                        el.addClass('hidden');
                    }
                }
            }, this);
        }
    }));

});