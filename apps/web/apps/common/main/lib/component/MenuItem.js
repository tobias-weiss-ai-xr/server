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
 *  MenuItem.js
 *
 *  A base class for all menu items that require menu-related functionality such as click handling,
 *  sub-menus, icons, etc.
 *
 *  Created on 1/27/14
 *
 */

/**
 *  Default template
 *
 *  Simple menu item:
 *  <li><a href="#">Caption</a></li>
 *
 *  Separator:
 *  <li class="divider"></li>
 *
 *  Menu item with sub-menu:
 *  <li class="dropdown-submenu">
 *      <a href="#">Sub-menu item</a>
 *      <ul class="dropdown-menu"></ul>
 *  </li>
 *
 *
 *  Example usage:
 *
 *      new Common.UI.MenuItem({
 *          caption: 'View Compact Toolbar',
 *          checkable: true,
 *          menu: {
 *              items: [
 *                  { caption: 'Menu item 1', value: 'value-1' },
 *                  { caption: 'Menu item 2', value: 'value-2' },
 *                  new Common.UI.MenuItem({ caption: 'Menu item 3', value: 'value-3' })
 *              ]
 *          }
 *      });
 *
 *  @property {Object} value
 *
 *  @property {Common.UI.Menu} menu
 *
 *
 */


if (Common === undefined)
    const Common = {};

define([
    'common/main/lib/component/BaseView',
    'common/main/lib/component/ToggleManager'
], () => {

    Common.UI.MenuItem = Common.UI.BaseView.extend({
        options : {
            id          : null,
            cls         : '',
            style       : '',
            hint        : false,
            checkable   : false,
            checked     : false,
            allowDepress: false,
            disabled    : false,
            visible     : true,
            value       : null,
            toggleGroup : null,
            iconCls     : '',
            menu        : null,
            canFocused  : true,
            dataHint    : '',
            dataHintDirection: '',
            dataHintOffset: '',
            dataHintTitle: '',
            scaling: true,
            header      : ''
        },

        tagName : 'li',

        template: _.template([
            '<% if (header) { %><span class="menu-item-header"><%- header %></span><% } %><% if (caption) { %><a id="<%= id %>" class="menu-item" <% if (_.isEmpty(iconCls)) { %> data-no-icon <% } %> style="<%= style %>" <% if(options.canFocused) { %> tabindex="-1" type="menuitem" <% }; if(!_.isUndefined(options.stopPropagation)) { %> data-stopPropagation="true" <% }; if(!_.isUndefined(options.dataHint)) { %> data-hint="<%= options.dataHint %>" <% }; if(!_.isUndefined(options.dataHintDirection)) { %> data-hint-direction="<%= options.dataHintDirection %>" <% }; if(!_.isUndefined(options.dataHintOffset)) { %> data-hint-offset="<%= options.dataHintOffset %>" <% }; if(options.dataHintTitle) { %> data-hint-title="<%= options.dataHintTitle %>" <% }; %> >',
                '<% if (!_.isEmpty(iconCls)) { %>',
                    '<span class="menu-item-icon <%= iconCls %>"></span>',
                '<% } else if (!_.isEmpty(iconImg)) { %>',
                    '<img src="<%= iconImg %>" class="menu-item-icon">',
                '<% } %>',
                '<%- caption %>',
            '</a>',
            '<% } %>'
        ].join('')),

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            this.id             = this.options.id || Common.UI.getId();
            this.cls            = this.options.cls;
            this.style          = this.options.style;
            this.caption        = this.options.caption;
            this.menu           = this.options.menu || null;
            this.checkable      = this.options.checkable;
            this.checked        = this.options.checked;
            this.allowDepress     = this.options.allowDepress;
            this.disabled       = this.options.disabled;
            this.visible        = this.options.visible;
            this.value          = this.options.value;
            this.toggleGroup    = this.options.toggleGroup;
            this.template       = this.options.template || this.template;
            this.iconCls        = this.options.iconCls;
            this.iconImg        = this.options.iconImg;
            this.hint           = this.options.hint;
            this.rendered       = false;
            this.header         = this.options.header;

            if (this.menu !== null && !(this.menu instanceof Common.UI.Menu) && !(this.menu instanceof Common.UI.MenuSimple)) {
                this.menu = new Common.UI.Menu(_.extend({}, this.options.menu));
            }

            if (this.options.el)
                this.render();
        },

        render: function() {
            const el = this.$el || $(this.el);

            this.cmpEl = el;
            this.trigger('render:before', this);

            if (this.caption === '--') {
                el.addClass('divider');
            } else {
                if (!this.rendered) {
                    el.off('click');
                    Common.UI.ToggleManager.unregister(this);

                    el.html(this.template({
                        id      : this.id,
                        caption : this.caption,
                        iconCls : this.iconCls,
                        iconImg : this.iconImg,
                        style   : this.style,
                        options : this.options,
                        header  : this.header 
                    }));

                    if (this.menu) {
                        el.addClass('dropdown-submenu');

                        this.menu.render(el);
                        el.mouseenter(_.bind(this.menu.alignPosition, this.menu));
//                        el.focusin(_.bind(me.onFocusItem, me));
                        el.focusout(_.bind(this.onBlurItem, this));
                        el.hover(
                            _.bind(this.onHoverItem, this),
                            _.bind(this.onUnHoverItem, this)
                        );
                    }

                    const firstChild = el.children(':first');

                    if (this.checkable && firstChild) {
                        firstChild.toggleClass('checkable', this.checkable);
                        firstChild.toggleClass('no-checkmark', this.options.checkmark===false);
                        firstChild.toggleClass('checked', this.checked);
                        if (!_.isEmpty(this.iconCls)) {
                            firstChild.css('background-image', 'none');
                        }
                    }

                    if (this.options.hint) {
                        this.createHint();
                    }

                    if (this.cls)
                        el.addClass(this.cls);

                    if (this.disabled)
                        el.toggleClass('disabled', this.disabled);

                    el.on('click',      _.bind(this.onItemClick, this));
                    el.on('mousedown',  _.bind(this.onItemMouseDown, this));

                    Common.UI.ToggleManager.register(this);

                    if (this.options.scaling !== false && this.iconCls) {
                        el.attr('ratio', 'ratio');
                        this.applyScaling(Common.UI.Scaling.currentRatio());

                        el.on('app:scaling', (e, info) => {
                            if ( this.options.scaling !== info.ratio ) {
                                this.applyScaling(info.ratio);
                            }
                        });
                    }
                }
            }
            if (!this.visible)
                this.setVisible(this.visible);

            this.rendered = true;

            this.trigger('render:after', this);

            return this;
        },

        createHint: function() {
            if(!this.cmpEl) return;

            this.cmpEl.attr('data-toggle', 'tooltip');
            this.cmpEl.tooltip({
                title       : this.options.hint,
                placement   : this.options.hintAnchor||((tip, element) => {
                    const pos = Common.Utils.getBoundingClientRect(element);
                    const actualWidth = tip.offsetWidth;
                    const actualHeight = tip.offsetHeight;
                    const innerWidth = Common.Utils.innerWidth();
                    const innerHeight = Common.Utils.innerHeight();
                    let top = pos.top;
                    let left = pos.left + pos.width + 2;
                    if (top + actualHeight > innerHeight) {
                        top = innerHeight - actualHeight - 2;
                    }
                    if (left + actualWidth > innerWidth) {
                        left = pos.left - actualWidth - 2;
                    }
                    Common.Utils.setOffset($(tip),{top: top,left: left}).addClass('in');
                })
            });
        },

        updateHint: function(hint) {
            this.options.hint = hint;
            if (!this.rendered) return;

            this.cmpEl.tooltip('destroy');
            this.createHint();
        },

        setCaption: function(caption) {
            this.caption = caption;

            if (this.rendered)
                this.cmpEl.find('> a').contents().last()[0].textContent = caption;
        },

        setIconCls: function(iconCls) {
            if (this.rendered && !_.isEmpty(this.iconCls)) {
                const firstChild = this.cmpEl.children(':first');
                if (firstChild) {
                    firstChild.find('.menu-item-icon').removeClass(this.iconCls).addClass(iconCls);
                    const svgIcon = firstChild.find('use.zoom-int');
                    if (svgIcon.length) {
                        const re_icon_name = /btn-[^\s]+/.exec(iconCls);
                        const icon_name = re_icon_name ? re_icon_name[0] : "null";
                        svgIcon.attr('href', `#${icon_name}`);
                    }
                }
            }
            this.iconCls = iconCls;
        },

        setChecked: function(check, suppressEvent) {
            this.toggle(check, suppressEvent);
        },

        isChecked: function() {
            return this.checked;
        },

        setDisabled: function(disabled) {
            this.disabled = !!disabled;

            if (this.rendered)
                this.cmpEl.toggleClass('disabled', this.disabled);
        },

        isDisabled: function() {
            return this.disabled;
        },

        toggle: function(toggle, suppressEvent) {
            const state = toggle === undefined ? !this.checked : !!toggle;

            if (this.checkable) {
                this.checked = state;

                if (this.rendered) {
                    const firstChild = this.cmpEl.children(':first');

                    if (firstChild) {
                        firstChild.toggleClass('checked', this.checked);
                        if (!_.isEmpty(this.iconCls)) {
                            firstChild.css('background-image', 'none');
                        }
                    }
                }

                if (!suppressEvent)
                    this.trigger('toggle', this, state);
            }
        },

        onItemMouseDown: (e) => {
            Common.UI.HintManager?.isHintVisible() && Common.UI.HintManager.clearHints(false, true);
            if (e.which !== 1) {
                e.preventDefault();
                e.stopPropagation();

                return false;
            }
            e.stopPropagation();
        },

        onItemClick: function(e) {
            if (e.which !== 1 && (e.which !== undefined || this.menu))
                return false;

            if (!this.disabled && (this.allowDepress || !(this.checked && this.toggleGroup)) && !this.menu)
                this.setChecked(!this.checked);

            if (this.menu) {
                if (e.target.id === this.id) {
                    this._doHover(e);
                    return false;
                }

                if (!this.menu.isOver)
                    this.cmpEl.removeClass('over');

                return;
            }

            if (!this.disabled) {
                this.trigger('click', this, e);
            } else {
                return false;
            }
        },

        onHoverItem: function(e) {
            this._doHover(e);
//            $('a', this.cmpEl).focus();
        },

        onUnHoverItem: function(e) {
            this._doUnHover(e);
//            $('a', this.cmpEl).blur();
        },

//        onFocusItem: function(e) {
//            this._doHover(e);
//        },

        onBlurItem: function(e) {
            this._doUnHover(e);
        },

        _doHover: function(e) {

            if (this.menu && !this.disabled) {
                clearTimeout(this.hideMenuTimer);

                this.cmpEl.trigger('show.bs.dropdown');
                this.expandMenuTimer = _.delay(()=> {
                    this.cmpEl.addClass('over');
                    this.cmpEl.trigger('shown.bs.dropdown');
                }, 200);
            }
        },

        _doUnHover: function(e) {
            if (this.cmpEl.hasClass('dropdown-submenu') && this.cmpEl.hasClass('over') &&
               (e?.relatedTarget && this.cmpEl.find(e.relatedTarget).length>0 || this.cmpEl.hasClass('focused-submenu'))) {
                // When focus go from menuItem to it's submenu don't hide this submenu
                this.cmpEl.removeClass('focused-submenu');
                return;
            }
            if (this.menu && !this.disabled) {
                clearTimeout(this.expandMenuTimer);

                this.hideMenuTimer = _.delay(()=> {
                    if (!this.menu.isOver)
                        this.cmpEl.removeClass('over');
                }, 200);

                if (e && e.type !== 'focusout') { // when mouseleave from clicked menu item with submenu
                    const focused = this.cmpEl.children(':focus');
                    if (focused.length>0) {
                        focused.blur();
                        this.cmpEl.closest('ul').focus();
                    }
                }
            }
        },

        setMenu: function (m) {
            if (m && _.isObject(m) && _.isFunction(m.render)){
                if (this.rendered) {
                    if (this.menu && (this.menu instanceof Common.UI.Menu || this.menu instanceof Common.UI.MenuSimple)) {
                        Common.UI.Menu.Manager.unregister(this.menu);
                        this.menu.cmpEl?.remove();
                    }
                    this.menu = m;
                    const el = this.cmpEl;
                    el.addClass('dropdown-submenu');
                    this.menu.render(el);
                    el.mouseenter(_.bind(this.menu.alignPosition, this.menu));
                    el.focusout(_.bind(this.onBlurItem, this));
                    el.hover(
                        _.bind(this.onHoverItem, this),
                        _.bind(this.onUnHoverItem, this)
                    );
                } else
                    this.menu = m;
            }
        },

        applyScaling: function (ratio) {
            if (this.options.scaling !== ratio) {
                this.options.scaling = ratio;
                const firstChild = this.cmpEl.children(':first');

                if (ratio > 2) {
                    if (!firstChild.find('svg.menu-item-icon').length) {
                        const iconCls = this.iconCls;
                        const re_icon_name = /btn-[^\s]+/.exec(iconCls);
                        const icon_name = re_icon_name ? re_icon_name[0] : "null";
                        const rtlCls = (iconCls ? iconCls.indexOf('icon-rtl') : -1) > -1 ? 'icon-rtl' : '';
                        const svg_icon = '<svg class="menu-item-icon uni-scale %rtlCls"><use href="#%iconname"></use></svg>'.replace('%iconname', icon_name).replace('%rtlCls', rtlCls);

                        firstChild.find('span.menu-item-icon').after(svg_icon);
                    }
                }
            }
        }
    });

    Common.UI.MenuItemSeparator = (options) => {
        options = options || {};
        options.caption = '--';
        return new Common.UI.MenuItem(options);
    };

    Common.UI.MenuItemCustom = Common.UI.MenuItem.extend(_.extend({
        initialize : function(options) {
            Common.UI.MenuItem.prototype.initialize.call(this, options);

            this.isCustomItem = true;
            this.baseUrl = options.baseUrl || '';
            this.iconsSet = Common.UI.iconsStr2IconsObj(options.iconsSet || ['']);
            const icons = Common.UI.getSuitableIcons(this.iconsSet);
            this.iconImg = this.baseUrl + icons.normal;
        },

        render: function () {
            Common.UI.MenuItem.prototype.render.call(this);

            if (this.options.scaling !== false) {
                this.cmpEl.attr('ratio', 'ratio');
                this.cmpEl.on('app:scaling', (e, info) => {
                    this.applyScaling(info.ratio);
                });
            }

            this.updateIcon();
            Common.NotificationCenter.on('uitheme:changed', this.updateIcons.bind(this));
            return this;
        },

        updateIcons: function() {
            const icons = Common.UI.getSuitableIcons(this.iconsSet);
            this.iconImg = this.baseUrl + icons.normal;
            this.updateIcon();
        },

        updateIcon: function() {
            this.cmpEl?.find('img.menu-item-icon').attr('src', this.iconImg).addClass('custom-icon');
        },

        applyScaling: function (ratio) {
            if ( this.options.scaling !== ratio ) {
                this.options.scaling = ratio;
                this.updateIcons();
            }
        }
    }, Common.UI.MenuItemCustom || {}));
});