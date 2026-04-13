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
 *  Button.js
 *
 *  Created on 1/20/14
 *
 */

/**
 *  Using template
 *
 *  A simple button with text:
 *  <button type="button" class="btn" id="id-button">Caption</button>
 *
 *  A simple button with icon:
 *  <button type="button" class="btn" id="id-button"><span class="icon">&nbsp;</span></button>
 *
 *  A button with menu:
 *  <div class="btn-group" id="id-button">
 *      <button type="button" class="btn dropdown-toggle" data-toggle="dropdown">
 *          <span class="icon">&nbsp;</span>
 *          <span class="caret"></span>
 *      </button>
 *      <ul class="dropdown-menu" role="menu">
 *      </ul>
 *  </div>
 *
 *  A split button:
 *  <div class="btn-group split" id="id-button">
 *      <button type="button" class="btn"><span class="icon">&nbsp;</span></button>
 *      <button type="button" class="btn dropdown-toggle" data-toggle="dropdown">
 *          <span class="caret"></span>
 *          <span class="sr-only"></span>
 *      </button>
 *      <ul class="dropdown-menu" role="menu">
 *      </ul>
 *  </div>
 *
 *   A useful classes of button size
 *
 *  - `'small'`
 *  - `'normal'`
 *  - `'large'`
 *  - `'huge'`
 *
 *  A useful classes of button type
 *
 *  - `'default'`
 *  - `'active'`
 *
 *
 *  Buttons can also be toggled. To enable this, you simple set the {@link #enableToggle} property to `true`.
 *
 *  Example usage:
 *      new Common.UI.Button({
 *          el: $('#id'),
 *          enableToggle: true
 *      });
 *
 *
 *  @property {Boolean} disabled
 *  True if this button is disabled. Read-only.
 *
 *  disabled: false,
 *
 *
 *  @property {Boolean} pressed
 *  True if this button is pressed (only if enableToggle = true). Read-only.
 *
 *  pressed: false,
 *
 *
 *  @cfg {Boolean} [allowDepress=true]
 *  False to not allow a pressed Button to be depressed. Only valid when {@link #enableToggle} is true.
 *
 *  @cfg {String/Object} hint
 *  The tooltip for the button - can be a string to be used as bootstrap tooltip
 *
 */

if (Common === undefined)
    const Common = {};

define([
    'common/main/lib/component/BaseView',
    'common/main/lib/component/ToggleManager'
], () => {

    window.createButtonSet = () => {
        function ButtonsArray(args) {};
        ButtonsArray.prototype = new Array;
        ButtonsArray.prototype.constructor = ButtonsArray;

        let _disabled = false;

        ButtonsArray.prototype.add = function(button) {
            button.setDisabled(_disabled);
            this.push(button);
        };

        ButtonsArray.prototype.setDisabled = function(disable) {
                _disabled = disable;

                this.forEach( (button) => {
                    button.setDisabled(disable);
                });
        };

        ButtonsArray.prototype.toggle = function(state, suppress) {
            this.forEach((button) => {
                button.toggle(state, suppress);
            });
        };

        ButtonsArray.prototype.pressed = function() {
            return this.some((button) => button.pressed);
        };

        ButtonsArray.prototype.contains = function(id) {
            return this.some((button) => button.id === id);
        };

        ButtonsArray.prototype.concat = function () {
            const args = Array.prototype.slice.call(arguments);
            const result = Array.prototype.slice.call(this);

            args.forEach((sub)=> {
                if (Array.isArray(sub) )
                    Array.prototype.push.apply(result, sub);
                else if (sub)
                    result.push(sub);
            });

            return result;
        };

        const _out_array = Object.create(ButtonsArray.prototype);
        for ( const i in arguments ) {
            _out_array.add(arguments[i]);
        }

        return _out_array;
    };

    // SVG sprite approach - uses <svg><use href="#id"> for dark mode support
    // Sprite is injected into DOM via svg-injector, so we use fragment-only references
    const templateBtnIcon =
            '<% if ( iconImg ) { %>' +
                '<img src="<%= iconImg %>">' +
            '<% } else { %>' +
                '<% var iconMatch = /btn-[^\\s]+/.exec(iconCls); ' +
                'if (iconMatch) {' +
                    'print(\'<svg class=\"icon uni-scale\"><use href=\"#\' + iconMatch[0] + \'\"></use></svg>\');' +
                '} else ' +
                    'print(\'<i class=\"icon \' + iconCls + \'\">&nbsp;</i>\'); %>' +
            '<% } %>';

    const templateBtnCaption =
        '<%= caption %>' +
        '<i class="caret"></i>';

    const templateHugeCaption =
            `<button type="button" class="btn <%= cls %>" id="<%= id %>" style="<%= style %>" data-hint="<%= dataHint %>" data-hint-direction="<%= dataHintDirection %>" data-hint-offset="<%= dataHintOffset %>" <% if (dataHintTitle) { %> data-hint-title="<%= dataHintTitle %>" <% } %>> <div class="inner-box-icon">${templateBtnIcon}</div><div class="inner-box-caption"><span class="caption"><%= caption %></span></div></button>`;

    const templateHugeMenuCaption =
        `<div class="btn-group icon-top" id="<%= id %>" style="<%= style %>"><button type="button" class="btn dropdown-toggle <%= cls %>" data-toggle="dropdown" data-hint="<%= dataHint %>" data-hint-direction="<%= dataHintDirection %>" data-hint-offset="<%= dataHintOffset %>" <% if (dataHintTitle) { %> data-hint-title="<%= dataHintTitle %>" <% } %>><div class="inner-box-icon">${templateBtnIcon}</div><div class="inner-box-caption"><span class="caption">${templateBtnCaption}</span><i class="caret compact-caret"></i></div></button></div>`;

    const templateHugeSplitCaption =
        `<div class="btn-group x-huge split icon-top" id="<%= id %>" style="<%= style %>"><button type="button" class="btn <%= cls %> inner-box-icon"><span class="btn-fixflex-hcenter">${templateBtnIcon}</span></button><button type="button" class="btn <%= cls %> inner-box-caption dropdown-toggle" data-toggle="dropdown" data-hint="<%= dataHint %>" data-hint-direction="<%= dataHintDirection %>" data-hint-offset="<%= dataHintOffset %>" <% if (dataHintTitle) { %> data-hint-title="<%= dataHintTitle %>" <% } %>><span class="btn-fixflex-vcenter"><span class="caption">${templateBtnCaption}</span><i class="caret compact-caret"></i></span></button></div>`;

    const getWidthOfCaption = (txt) => {
        const props = Common.UI.Themes.getThemeProps('font');
        const el = document.createElement('span');
        el.style.fontSize = props?.size ? props.size : '11px';
        el.style.fontFamily = props?.name ? props.name : 'Arial, Helvetica, "Helvetica Neue", sans-serif';
        el.style.position = "absolute";
        el.style.top = '-1000px';
        el.style.left = '-1000px';
        el.innerHTML = txt;
        document.body.appendChild(el);
        const result = el.offsetWidth;
        document.body.removeChild(el);
        return result;
    };

    const getShortText = (txt, max) => {
        let lastIndex = txt.length - 1;
        let word = txt;
        while (getWidthOfCaption(word) > max) {
            word = `${txt.slice(0, lastIndex).trim()}...`;
            lastIndex--;
        }
        return word;
    };

    Common.UI.Button = Common.UI.BaseView.extend({
        options : {
            id              : null,
            hint            : false,
            delayRenderHint : true,
            enableToggle    : false,
            allowDepress    : true,
            toggleGroup     : null,
            cls             : '',
            iconCls         : '',
            caption         : '',
            menu            : null,
            disabled        : false,
            pressed         : false,
            split           : false,
            visible         : true,
            dataHint        : '',
            dataHintDirection: '',
            dataHintOffset: '0, 0',
            scaling         : true,
            canFocused      : false, // used for button with menu
            takeFocusOnClose: false, // used for button with menu, for future use in toolbar when canFocused=true, but takeFocusOnClose=false
            action: '' // action for button
        },

        template: _.template([
            '<% var applyicon = function() { %>',
                '<% if (iconImg) { print(\'<img src=\"\' + iconImg + \'\">\'); } else { %>',
                // SVG sprite approach - uses <svg><use href="#id"> for dark mode support
                '<% if (iconCls != "") { ' +
                    'var iconMatch = /btn-[^\\s]+/.exec(iconCls); ' +
                    'if (iconMatch) {' +
                        'print(\'<svg class=\"icon uni-scale\"><use href=\"#\' + iconMatch[0] + \'\"></use></svg>\');' +
                    '} else ' +
                        'print(\'<i class=\"icon \' + iconCls + \'\">&nbsp;</i>\'); ' +
                '}} %>',
            '<% } %>',
            '<% if ( !menu && onlyIcon ) { %>',
                '<button type="button" class="btn <%= cls %>" id="<%= id %>" style="<%= style %>" data-hint="<%= dataHint %>" data-hint-direction="<%= dataHintDirection %>" data-hint-offset="<%= dataHintOffset %>" <% if (dataHintTitle) { %> data-hint-title="<%= dataHintTitle %>" <% } %>>',
                    '<% applyicon() %>',
                '</button>',
            '<% } else if ( !menu ) { %>',
                '<button type="button" class="btn <%= cls %>" id="<%= id %>" style="<%= style %>" data-hint="<%= dataHint %>" data-hint-direction="<%= dataHintDirection %>" data-hint-offset="<%= dataHintOffset %>" <% if (dataHintTitle) { %> data-hint-title="<%= dataHintTitle %>" <% } %>>',
                    '<% applyicon() %>',
                    '<span class="caption"><%= caption %></span>',
                '</button>',
            '<% } else if (onlyIcon) {%>',
                '<div class="btn-group" id="<%= id %>" style="<%= style %>">',
                    '<button type="button" class="btn dropdown-toggle <%= cls %>" data-toggle="dropdown" data-hint="<%= dataHint %>" data-hint-direction="<%= dataHintDirection %>" data-hint-offset="<%= dataHintOffset %>" <% if (dataHintTitle) { %> data-hint-title="<%= dataHintTitle %>" <% } %>>',
                        '<% applyicon() %>',
                    '</button>',
                '</div>',
            '<% } else if (split == false) {%>',
                '<div class="btn-group" id="<%= id %>" style="<%= style %>">',
                    '<button type="button" class="btn dropdown-toggle <%= cls %>" data-toggle="dropdown" data-hint="<%= dataHint %>" data-hint-direction="<%= dataHintDirection %>" data-hint-offset="<%= dataHintOffset %>" <% if (dataHintTitle) { %> data-hint-title="<%= dataHintTitle %>" <% } %>>',
                        '<% applyicon() %>',
                        '<span class="caption"><%= caption %></span>',
                        '<span class="inner-box-caret">' +
                            '<i class="caret"></i>' +
                        '</span>',
                    '</button>',
                '</div>',
            '<% } else { %>',
                '<div class="btn-group split <%= groupCls %>" id="<%= id %>" style="<%= style %>">',
                    '<button type="button" class="btn <%= cls %>">',
                        '<% applyicon() %>',
                        '<span class="caption"><%= caption %></span>',
                    '</button>',
                    '<button type="button" class="btn <%= cls %> dropdown-toggle" data-toggle="dropdown" data-hint="<%= dataHint %>" data-hint-direction="<%= dataHintDirection %>" data-hint-offset="<%= dataHintOffset %>" <% if (dataHintTitle) { %> data-hint-title="<%= dataHintTitle %>" <% } %>>',
                        '<i class="caret"></i>',
                        '<span class="sr-only"></span>',
                    '</button>',
                '</div>',
            '<% } %>'
        ].join('')),

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            this.id           = this.options.id || Common.UI.getId();
            this.hint         = this.options.hint;
            this.enableToggle = this.options.enableToggle;
            this.allowDepress = this.options.allowDepress;
            this.cls          = this.options.cls;
            this.iconCls      = this.options.iconCls;
            this.menu         = this.options.menu;
            this.split        = this.options.split;
            this.toggleGroup  = this.options.toggleGroup;
            this.disabled     = this.options.disabled;
            this.visible      = this.options.visible;
            this.pressed      = this.options.pressed;
            this.caption      = this.options.caption;
            this.template     = this.options.template || this.template;
            this.style        = this.options.style;
            this.rendered     = false;
            this.stopPropagation = this.options.stopPropagation;
            this.delayRenderHint = this.options.delayRenderHint;
            this.action = this.options.action || '';

            // if ( /(?<!-)svg-icon(?!-)/.test(me.options.iconCls) )
            //     me.options.scaling = false;

            if ( this.options.scaling === false && this.options.iconCls) {
                this.iconCls = `${this.options.iconCls} scaling-off`;
            }

            this.options.takeFocusOnClose && (this.options.canFocused = true);

            if (this.options.el) {
                this.render();
            } else if (this.options.parentEl)
                this.render(this.options.parentEl);
        },

        getCaptionWithBreaks: function (caption) {
            const words = caption.split(' ');
            let newCaption = null;
            let maxWidth = 160 - 4; //85 - 4
            const containAnd = words.indexOf('&');
            if (containAnd > -1) { // add & to previous word
                words[containAnd - 1] += ' &';
                words.splice(containAnd, 1);
            }
            if (words.length > 1) {
                maxWidth = !!this.menu || this.split === true ? maxWidth - 10 : maxWidth;
                if (words.length < 3) {
                    words[0] = getShortText(words[0], this.menu ? maxWidth + 10 : maxWidth);
                    words[1] = getShortText(words[1], maxWidth);
                    newCaption = `${words[0]}<br>${words[1]}`;
                } else {
                    let otherWords = '';
                    if (getWidthOfCaption(`${words[0]} ${words[1]}`) < maxWidth) { // first and second words in first line
                        for (let i = 2; i < words.length; i++) {
                            otherWords += `${words[i]} `;
                        }
                        if (getWidthOfCaption(otherWords + (this.menu ? 10 : 0))*2 < getWidthOfCaption(`${words[0]} ${words[1]}`)) {
                            otherWords = getShortText((`${words[1]} ${otherWords}`).trim(), maxWidth);
                            newCaption = `${words[0]}<br>${otherWords}`;
                        } else {
                            otherWords = getShortText(otherWords.trim(), maxWidth);
                            newCaption = `${words[0]} ${words[1]}<br>${otherWords}`;
                        }
                    } else { // only first word is in first line
                        for (let j = 1; j < words.length; j++) {
                            otherWords += `${words[j]} `;
                        }
                        otherWords = getShortText(otherWords.trim(), maxWidth);
                        newCaption = `${words[0]}<br>${otherWords}`;
                    }
                }
            } else {
                const width = getWidthOfCaption(caption);
                newCaption = width < maxWidth ? caption : getShortText(caption, maxWidth);
                if (!!this.menu || this.split === true) {
                    newCaption += '<br>';
                }
            }
            return newCaption;
        },

        render: function(parentEl) {

            this.trigger('render:before', this);

            this.cmpEl = this.$el || $(this.el);

            if (parentEl) {
                this.setElement(parentEl, false);

                if (!this.rendered) {
                    if ( /icon-top/.test(this.cls) && !!this.caption && /huge/.test(this.cls) ) {
                        if ( this.split === true ) {
                            !!this.cls && (this.cls = this.cls.replace(/\s?(?:x-huge|icon-top)/g, ''));
                            this.template = _.template(templateHugeSplitCaption);
                        } else
                        if ( this.menu ) {
                            this.template = _.template(templateHugeMenuCaption);
                        } else {
                            this.template = _.template(templateHugeCaption);
                        }
                        const newCaption = this.getCaptionWithBreaks(this.caption);
                        if (newCaption) {
                            this.caption = newCaption;
                        }
                    }

                    this.cmpEl = $(this.template({
                        id           : this.id,
                        cls          : this.cls,
                        groupCls     : this.split && /btn-toolbar/.test(this.cls) ? 'no-borders' : '',
                        iconCls      : this.iconCls,
                        iconImg      : this.options.iconImg,
                        menu         : this.menu,
                        split        : this.split,
                        onlyIcon     : this.options.onlyIcon,
                        disabled     : this.disabled,
                        pressed      : this.pressed,
                        caption      : this.caption,
                        style        : this.style,
                        dataHint     : this.options.dataHint,
                        dataHintDirection: this.options.dataHintDirection,
                        dataHintOffset: this.options.dataHintOffset,
                        dataHintTitle: this.options.dataHintTitle
                    }));

                    if (this.menu && _.isObject(this.menu) && _.isFunction(this.menu.render)) {
                        this.menu.render(this.cmpEl);
                        this.options.canFocused && this.attachKeyEvents();
                    }

                    parentEl.html(this.cmpEl);
                    this.$icon = this.$el.find('.icon');
                }
            }

            if (!this.rendered) {
                const el = this.cmpEl;
                const isGroup = el.hasClass('btn-group');
                const isSplit = el.hasClass('split');

                if (_.isString(this.toggleGroup)) {
                    this.enableToggle = true;
                }

                const buttonHandler = (e) => {
                    if (!this.disabled && (e.which === 1 || e.which===undefined)) {
                        this.doToggle();
                        if (this.options.hint) {
                            const tip = this.btnEl.data('bs.tooltip');
                            if (tip) {
                                if (tip.dontShow===undefined)
                                    tip.dontShow = true;

                                tip.hide();
                            }
                        }
                        this.split && this.options.takeFocusOnClose && this.focus();
                        this.trigger('click', this, e);
                    }
                };

                const doSplitSelect = (select, element, e) => {
                    if (!select) {
                        // Is mouse under button
                        let isUnderMouse = false;

                        $('button', el).each((index, button)=> {
                            if ($(button).is(':hover')) {
                                isUnderMouse = true;
                                return false;
                            }
                        });

                        if (!isUnderMouse) {
                            el.removeClass('over');
                            $('button', el).removeClass('over');
                        }
                    }

                    if ( element === 'button') {
                        if (!select && (this.enableToggle && this.allowDepress && this.pressed))
                            return;
                        if (select && !isSplit && (this.enableToggle && this.allowDepress && !this.pressed)) { // to depress button with menu
                            e.preventDefault();
                            return;
                        }

                        $('button:first', el).toggleClass('active', select);
                    } else
                        $('[data-toggle^=dropdown]:first', el).toggleClass('active', select);

                    el.toggleClass('active', select);
                    this.stopPropagation && e.stopPropagation();
                };

                const menuHandler = (e) => {
                    if (!this.disabled && e.which === 1) {
                        if (isSplit) {
                            if (this.options.hint) {
                                const tip = (this.btnMenuEl ? this.btnMenuEl : this.btnEl).data('bs.tooltip');
                                if (tip) {
                                    if (tip.dontShow===undefined)
                                        tip.dontShow = true;

                                    tip.hide();
                                }
                            }
                            doSplitSelect(!this.isMenuOpen(), 'arrow', e);
                        }
                    }
                };

                const doSetActiveState = (e, state) => {
                    if (isSplit) {
                        doSplitSelect(state, 'button', e);
                    } else {
                        el.toggleClass('active', state);
                        $('button', el).toggleClass('active', state);
                    }
                    this.stopPropagation && e.stopPropagation();
                };

                let splitElement;
                const onMouseDown = (e) => {
                    splitElement = e.currentTarget.className.match(/dropdown/) ? 'arrow' : 'button';
                    doSplitSelect(true, splitElement, e);
                    $(document).on('mouseup',   onMouseUp);
                };

                const onMouseUp = (e) => {
                    doSplitSelect(false, splitElement, e);
                    $(document).off('mouseup',   onMouseUp);
                };

                const onAfterHideMenu = (e, isFromInputControl) => {
                    this.cmpEl.find('.dropdown-toggle').blur();
                    if (this.cmpEl.hasClass('active') !== this.pressed) 
                        this.cmpEl.trigger('button.internal.active', [this.pressed]);
                };

                if (isGroup) {
                    if (isSplit) {
                        $('[data-toggle^=dropdown]', el).on('mousedown', _.bind(menuHandler, this));
                        $('button', el).on('mousedown', _.bind(onMouseDown, this));
                        (this.options.width>0) && $('button:first', el).css('width', this.options.width - $('[data-toggle^=dropdown]', el).outerWidth());
                    }

                    el.on('hide.bs.dropdown', _.bind(doSplitSelect, this, false, 'arrow'));
                    el.on('show.bs.dropdown', _.bind(doSplitSelect, this, true, 'arrow'));
                    el.on('hidden.bs.dropdown', _.bind(onAfterHideMenu, this));

                    $('button:first', el).on('click', buttonHandler);
                } else {
                    el.on('click', buttonHandler);
                }

                el.on('button.internal.active', _.bind(doSetActiveState, this));

                el.on('mouseover', (e) => {
                    if (!this.disabled) {
                        this.cmpEl.addClass('over');
                        this.trigger('mouseover', this, e);
                    }
                });

                el.on('mouseout', (e) => {
                    this.cmpEl.removeClass('over');
                    if (!this.disabled) {
                        this.trigger('mouseout', this, e);
                    }
                });

                // Register the button in the toggle manager
                Common.UI.ToggleManager.register(this);

                if ( this.options.scaling !== false ) {
                    el.attr('ratio', 'ratio');
                    this.applyScaling(Common.UI.Scaling.currentRatio());

                    el.on('app:scaling', (e, info) => {
                        if ( this.options.scaling !== info.ratio ) {
                            this.applyScaling(info.ratio);
                        }
                    });
                }

                const $btn = $('button', el).length>0 ? $('button', el) : this.cmpEl;

                if (!this.menu)
                    $btn.addClass('canfocused');

                if (this.enableToggle && !this.menu) {
                    $btn.attr('aria-pressed', !!this.pressed)
                }

                if (this.menu) {
                    $('[data-toggle^=dropdown]', el).attr('aria-haspopup', 'menu');
                    $('[data-toggle^=dropdown]', el).attr('aria-expanded', false);
                }

                if ((!this.caption && this.options.hint) || this.options.ariaLabel) {
                    const ariaLabel = this.options.ariaLabel ? this.options.ariaLabel : ((typeof this.options.hint === 'string') ? this.options.hint : this.options.hint[0]);
                    $btn.attr('aria-label', ariaLabel);
                }

                Common.NotificationCenter.on('uitheme:changed', this.onThemeChanged.bind(this));
            }

            this.rendered = true;

            this.options.hint && this.createHint(this.options.hint);

            if (this.pressed) {
                this.toggle(this.pressed, true);
            }

            if (this.disabled) {
                this.setDisabled(!(this.disabled=false));
            }

            if (!this.visible) {
                this.setVisible(this.visible);
            }

            this.trigger('render:after', this);

            return this;
        },

        doToggle: function(){
            if (this.enableToggle && (this.allowDepress !== false || !this.pressed)) {
                this.toggle();
            }
        },

        toggle: function(toggle, suppressEvent) {
            const state = toggle === undefined ? !this.pressed : !!toggle;

            this.pressed = state;

            if (this.cmpEl) {
                this.cmpEl.attr('aria-pressed', state);
                this.cmpEl.trigger('button.internal.active', [state]);
            }

            if (!suppressEvent)
                this.trigger('toggle', this, state);
        },

        click: function(opts) {
            if ( !this.disabled ) {
                this.doToggle();
                this.trigger('click', this, opts);
            }
        },

        isActive: function() {
            if (this.enableToggle)
                return this.pressed;

            return this.cmpEl.hasClass('active');
        },

        setDisabled: function(disabled) {
            if (this.rendered && this.disabled !== disabled) {
                const el = this.cmpEl;
                const isGroup = el.hasClass('btn-group');

                disabled = (disabled===true);

                if (disabled !== el.hasClass('disabled')) {
                    const decorateBtn = (button) => {
                        button.toggleClass('disabled', disabled);
                        if (!this.options.allowMouseEventsOnDisabled)
                            (disabled) ? button.attr({disabled: disabled}) : button.removeAttr('disabled');
                    };

                    decorateBtn(el);
                    isGroup && decorateBtn(el.children('button'));
                }

                if ((disabled || !Common.Utils.isGecko) && this.options.hint) {
                    let tip = this.btnEl.data('bs.tooltip');
                    if (tip) {
                        disabled && tip.hide();
                        !Common.Utils.isGecko && (tip.enabled = !disabled);
                    }
                    if (this.btnMenuEl) {
                        tip = this.btnMenuEl.data('bs.tooltip');
                        if (tip) {
                            disabled && tip.hide();
                            !Common.Utils.isGecko && (tip.enabled = !disabled);
                        }
                    }
                }

                if (disabled && this.menu && _.isObject(this.menu) && this.menu.rendered && this.menu.isVisible())
                    setTimeout(()=> { this.menu.hide()}, 1);

                if ( this.options.signals ) {
                    const opts = this.options.signals;
                    if ( !(opts.indexOf('disabled') < 0) ) {
                        this.trigger('disabled', this, disabled);
                    }
                }

                if (this.tabindex!==undefined) {
                    const el = this.split ? this.cmpEl : this.$el?.find('button').addBack().filter('button');
                    disabled && (this.tabindex = el.attr('tabindex'));
                    el.attr('tabindex', disabled ? "-1" : this.tabindex);
                }
            }

            this.disabled = disabled;
        },

        isDisabled: function() {
            return this.disabled;
        },

        setIconCls: function(cls) {
            const btnIconEl = $(this.el).find('i.icon');
            const oldCls = this.iconCls;
            const svgIcon = $(this.el).find('.icon use.zoom-int');

            this.iconCls = cls;
            if (/svgicon/.test(this.iconCls)) {
                const icon = /svgicon\s(\S+)/.exec(this.iconCls);
                svgIcon.attr('href', icon && icon.length > 1 ? `#${icon[1]}` : '');
            } else {
                if (svgIcon.length) {
                    const icon = /btn-[^\s]+/.exec(this.iconCls);
                    svgIcon.attr('href', icon ? `#${icon[0]}`: '');
                }
                btnIconEl.removeClass(oldCls);
                btnIconEl.addClass(cls || '');
                if (this.options.scaling === false) {
                    btnIconEl.addClass('scaling-off');
                }
            }
        },

        changeIcon: function(opts) {
            let btnIconEl = $(this.el).find('i.icon');
            if (btnIconEl.length > 1) btnIconEl = $(btnIconEl[0]);
            if (opts && (opts.curr || opts.next) && btnIconEl) {
                const svgIcon = $(this.el).find('.icon use.zoom-int');
                if (opts.curr) {
                    btnIconEl.removeClass(opts.curr);
                    this.iconCls = this.iconCls.replace(opts.curr, '').trim();
                }
                if (opts.next) {
                    !btnIconEl.hasClass(opts.next) && (btnIconEl.addClass(opts.next));
                    (this.iconCls.indexOf(opts.next)<0) && (this.iconCls += ` ${opts.next}`);
                }
                svgIcon.length && !!opts.next && svgIcon.attr('href', `#${opts.next}`);

                if ( this.options.signals ) {
                    if ( !(this.options.signals.indexOf('icon:changed') < 0) ) {
                        this.trigger('icon:changed', this, opts);
                    }
                }
            }
        },

        hasIcon: function(iconcls) {
            return this.$icon.hasClass(iconcls);
        },

        setVisible: function(visible) {
            if (this.cmpEl) this.cmpEl.toggleClass('hidden', !visible);
            this.visible = visible;

            if ( this.options.signals ) {
                if ( !(this.options.signals.indexOf('visible') < 0) ) {
                    this.trigger('visible', this, visible);
                }
            }
        },

        isVisible: function() {
            return (this.cmpEl) ? this.cmpEl.is(":visible") : $(this.el).is(":visible");
        },

        createHint: function(hint, isHtml) {
            this.options.hint = hint;
            if (!this.rendered) return;
            const cmpEl = this.cmpEl;
            const modalParents = cmpEl.closest('.asc-window');
            const tipZIndex = modalParents.length > 0 ? Number.parseInt(modalParents.css('z-index')) + 10 : undefined;

            if (!this.btnEl) {
                if (typeof this.options.hint === 'object' && this.options.hint.length>1 && $('button', cmpEl).length>0) {
                    const btnEl = $('button', cmpEl);
                    this.btnEl = $(btnEl[0]);
                    this.btnMenuEl = $(btnEl[1]);
                } else {
                    this.btnEl = cmpEl;
                }
            }

            let tip = this.btnEl.data('bs.tooltip');
            tip?.updateTitle(typeof hint === 'string' ? hint : hint[0]);
            if (this.btnMenuEl) {
                tip = this.btnMenuEl.data('bs.tooltip');
                tip?.updateTitle(hint[1]);
            }
            if (!this._isTooltipInited) {
                if (this.delayRenderHint) {
                    this.btnEl.one('mouseenter', ()=> { // hide tooltip when mouse is over menu
                        this.btnEl.tooltip({
                            html: !!isHtml,
                            title       : (typeof this.options.hint === 'string') ? this.options.hint : this.options.hint[0],
                            placement   : this.options.hintAnchor||'cursor',
                            zIndex : tipZIndex,
                            container   : this.options.hintContainer
                        });
                        !Common.Utils.isGecko && (this.btnEl.data('bs.tooltip').enabled = !this.disabled);
                        this.btnEl.mouseenter();
                    });
                    this.btnMenuEl?.one('mouseenter', ()=> { // hide tooltip when mouse is over menu
                        this.btnMenuEl.tooltip({
                            html: !!isHtml,
                            title       : this.options.hint[1],
                            placement   : this.options.hintAnchor||'cursor',
                            zIndex : tipZIndex,
                            container   : this.options.hintContainer
                        });
                        !Common.Utils.isGecko && (this.btnMenuEl.data('bs.tooltip').enabled = !this.disabled);
                        this.btnMenuEl.mouseenter();
                    });
                } else {
                    this.btnEl.tooltip({
                        html: !!isHtml,
                        title       : (typeof this.options.hint === 'string') ? this.options.hint : this.options.hint[0],
                        placement   : this.options.hintAnchor||'cursor',
                        zIndex      : tipZIndex,
                        container   : this.options.hintContainer
                    });
                    this.btnMenuEl?.tooltip({
                        html: !!isHtml,
                        title       : this.options.hint[1],
                        placement   : this.options.hintAnchor||'cursor',
                        zIndex      : tipZIndex,
                        container   : this.options.hintContainer
                    });
                }
                if (modalParents.length > 0) {
                    const onModalClose = (dlg) => {
                        if (modalParents[0] !== dlg.$window[0]) return;
                        let tip = this.btnEl.data('bs.tooltip');
                        if (tip) {
                            if (tip.dontShow===undefined)
                                tip.dontShow = true;
                            tip.hide();
                        }
                        if (this.btnMenuEl) {
                            tip = this.btnMenuEl.data('bs.tooltip');
                            if (tip) {
                                if (tip.dontShow===undefined)
                                    tip.dontShow = true;
                                tip.hide();
                            }
                        }
                        Common.NotificationCenter.off({'modal:close': onModalClose});
                    };
                    Common.NotificationCenter.on({'modal:close': onModalClose});
                }
                this._isTooltipInited = true;
            }
        },

        updateHint: function(hint, isHtml) {
            this.options.hint = hint;
            this.hint = hint;
            if (!this.rendered) return;

            this.createHint(hint, isHtml);

            if (this.disabled || !Common.Utils.isGecko) {
                let tip = this.btnEl.data('bs.tooltip');
                if (tip) {
                    this.disabled && tip.hide();
                    !Common.Utils.isGecko && (tip.enabled = !this.disabled);
                }
                if (this.btnMenuEl) {
                    tip = this.btnMenuEl.data('bs.tooltip');
                    if (tip) {
                        this.disabled && tip.hide();
                        !Common.Utils.isGecko && (tip.enabled = !this.disabled);
                    }
                }
            }

            if (!this.caption) {
                const cmpEl = this.cmpEl;
                const $btn = $('button', cmpEl).length>0 ? $('button', cmpEl) : cmpEl;
                $btn.attr('aria-label', (typeof hint === 'string') ? hint : hint[0]);
            }
        },

        setCaption: function(caption) {
            if (this.caption !== caption) {
                let isHuge = false;
                if ( /icon-top/.test(this.options.cls) && !!this.caption && /huge/.test(this.options.cls) ) {
                    const newCaption = this.getCaptionWithBreaks(caption);
                    this.caption = newCaption || caption;
                    isHuge = true;
                } else
                    this.caption = caption;

                if (this.rendered) {
                    const captionNode = this.cmpEl.find('.caption');

                    if (captionNode.length > 0) {
                        captionNode.html(isHuge && (this.split || this.menu) ? _.template(templateBtnCaption)({caption: this.caption}) : this.caption);
                    } else {
                        this.cmpEl.find('button:first').addBack().filter('button').html(this.caption);
                    }
                }
            }
        },

        setMenu: function (m) {
            if (m && _.isObject(m) && _.isFunction(m.render)){
                this.menu = m;
                if (this.rendered) {
                    this.menu.render(this.cmpEl);
                    this.options.canFocused && this.attachKeyEvents();
                }
                this.trigger('menu:created', this);
            }
        },

        attachKeyEvents: function() {
            if (this.menu?.rendered && this.cmpEl) {
                const btnEl = $('button', this.cmpEl);
                !this.split && btnEl.addClass('move-focus');
                this.menu.on('keydown:before', (menu, e) => {
                    if ((e.keyCode === Common.UI.Keys.DOWN || e.keyCode === Common.UI.Keys.SPACE) && !this.isMenuOpen()) {
                        $(btnEl[this.split ? 1 : 0]).click();
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                });
                this.options.takeFocusOnClose && this.menu.on('hide:after', () => {
                    setTimeout(()=> {this.focus();}, 1);
                });
            }
        },

        applyScaling: function (ratio) {
            if ( this.options.scaling !== ratio ) {
                // me.cmpEl.attr('ratio', ratio);
                this.options.scaling = ratio;

                if (ratio > 2) {
                    const $el = this.$el.is('button') ? this.$el : this.$el.find('button:first');
                    if (!$el.find('svg.icon').length) {
                        const iconCls = this.iconCls || $el.find('i.icon').attr('class');
                        const re_icon_name = /btn-[^\s]+/.exec(iconCls);
                        const icon_name = re_icon_name ? re_icon_name[0] : "null";
                        const rtlCls = (iconCls ? iconCls.indexOf('icon-rtl') : -1) > -1 ? 'icon-rtl' : '';
                        const svg_icon = '<svg class="icon uni-scale %rtlCls"><use href="#%iconname"></use></svg>'.replace('%iconname', icon_name).replace('%rtlCls', rtlCls);
                        $el.find('i.icon').after(svg_icon);
                    }
                } else {
                    if (!this.$el.find('i.icon')) {
                        const png_icon = '<i class="icon %cls" dummy-attr>&nbsp;</i>'.replace('%cls', this.iconCls);
                        this.$el.find('svg.icon').after(png_icon);
                    }
                }
            }
        },

        isMenuOpen: function() {
            return this.cmpEl?.hasClass('open');
        },

        focus: function() {
            this.split ? this.cmpEl.focus() : this.$el?.find('button').addBack().filter('button').focus();
        },

        setTabIndex: function(tabindex) {
            if (!this.rendered)
                return;

            this.tabindex = tabindex.toString();
            if (!this.disabled) {
                this.split ? this.cmpEl.attr('tabindex', this.tabindex) : this.$el?.find('button').addBack().filter('button').attr('tabindex', this.tabindex);
            }
        },

        onThemeChanged: function() {
            if (!this.rendered) return;

            const el = this.cmpEl;
            if (this.options.width>0) {
                el?.hasClass('btn-group') && el.hasClass('split') && $('button:first', el).css('width', this.options.width - $('[data-toggle^=dropdown]', el).outerWidth());
            } else if (el && this.caption && /icon-top/.test(this.options.cls) && /huge/.test(this.options.cls)) { // recalc captions of huge button
                const captionNode = el.find('.caption');
                if (captionNode.length > 0) {
                    captionNode.html((this.split || this.menu) ? _.template(templateBtnCaption)({caption: this.caption}) : this.caption);
                }
            }
        }
    });

    Common.UI.ButtonCustom = Common.UI.Button.extend(_.extend({
        initialize : function(options) {
            options.iconCls = `icon-custom ${options.iconCls || ''}`;
            Common.UI.Button.prototype.initialize.call(this, options);

            this.baseUrl = options.baseUrl || '';
            this.iconsSet = Common.UI.iconsStr2IconsObj(options.iconsSet || ['']);
            const icons = Common.UI.getSuitableIcons(this.iconsSet);
            this.iconNormalImg = this.baseUrl + icons.normal;
            this.iconActiveImg = this.baseUrl + icons.active;
        },

        render: function (parentEl) {
            Common.UI.Button.prototype.render.call(this, parentEl);

            let _current_active = false;
            this.cmpButtonFirst = $('button:first', this.$el || $(this.el));
            const _callback = (records, observer) => {
                const _hasactive = this.cmpButtonFirst.hasClass('active') || this.cmpButtonFirst.is(':active');
                if ( _hasactive !== _current_active ) {
                    this.updateIcon();
                    _current_active = _hasactive;
                }
            };
            this.cmpButtonFirst[0] && (new MutationObserver(_callback))
                .observe(this.cmpButtonFirst[0], {
                    attributes : true,
                    attributeFilter : ['class'],
                });

                const onMouseDown = (e) => {
                    _callback();
                    $(document).on('mouseup',   onMouseUp);
                };
                const onMouseUp = (e) => {
                    _callback();
                    $(document).off('mouseup',   onMouseUp);
                };
                this.cmpButtonFirst.on('mousedown', _.bind(onMouseDown, this));

            this.updateIcon();
            Common.NotificationCenter.on('uitheme:changed', this.updateIcons.bind(this));

            if (this.cmpEl && this.options.customAttributes) {
                for (const key in this.options.customAttributes) {
                    if (Object.prototype.hasOwnProperty.call(this.options.customAttributes, key)) {
                        this.cmpEl.attr(Common.Utils.String.htmlEncode(key), Common.Utils.String.htmlEncode(this.options.customAttributes[key]));
                    }
                }
            }
        },

        updateIcons: function() {
            const icons = Common.UI.getSuitableIcons(this.iconsSet);
            this.iconNormalImg = this.baseUrl + icons.normal;
            this.iconActiveImg = this.baseUrl + icons.active;
            this.updateIcon();
        },

        updateIcon: function() {
            this.$icon?.css({'background-image': `url(${this.cmpButtonFirst && (this.cmpButtonFirst.hasClass('active') || this.cmpButtonFirst.is(':active')) ? this.iconActiveImg : this.iconNormalImg})`});
        },

        applyScaling: function (ratio) {
            if ( this.options.scaling !== ratio ) {
                this.options.scaling = ratio;
                this.updateIcons();
            }
        }
    }, Common.UI.ButtonCustom || {}));

    Common.UI.GroupedButtons = (buttons, opts) => {
        const _buttons = buttons;
        const _parent = buttons && buttons.length>0 && buttons[0].cmpEl ? buttons[0].cmpEl.parent() : null;

        _parent.addClass('grouped-buttons');

        if (opts) {
            opts.underline && _parent.addClass('underline');
            opts.flat && _parent.addClass('flat');
        }

        const _update = () => {
            let first;
            let last;
            _buttons?.forEach((item) => {
                if (!first && item.isVisible()) {
                    first = true;
                    item.cmpEl.addClass('first');
                } else
                    item.cmpEl.removeClass('first');
                item.cmpEl.removeClass('last');
                item.isVisible() && (last = item);
            });
            last?.cmpEl.addClass('last');
        };

        const _init = () => {
            _buttons?.forEach((item) => {
                item.options.signals = item.options.signals || [];
                item.options.signals.push('visible');
                item.on('visible', _update);
            });
        };

        _init();
        _update();

        return {
            update: _update
        }
    };
});

