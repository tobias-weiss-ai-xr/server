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
 *  InputField.js
 *
 *  Created on 4/10/14
 *
 */

/**
 *  Using template
 *
 *  <div class="input-field">
 *    <input type="text" name="range" class="form-control"><span class="input-error"/>
 *  </div>
 *
 */


if (Common === undefined)
    const Common = {};

define([
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Tooltip',
    'common/main/lib/component/Button'
], () => { 

    Common.UI.InputField = Common.UI.BaseView.extend((() => ({
            options : {
                id          : null,
                cls         : '',
                style       : '',
                value       : '',
                type        : 'text',
                name        : '',
                validation  : null,
                allowBlank  : true,
                placeHolder : '',
                blankError  : null,
                spellcheck  : false,
                maskExp     : '',
                validateOnChange: false,
                validateOnBlur: true,
                disabled: false,
                editable: true,
                hideErrorOnInput: false
            },

            template: _.template([
                '<div class="input-field" style="<%= style %>">',
                    '<input ',
                        'type="<%= type %>" ',
                        'name="<%= name %>" ',
                        'spellcheck="<%= spellcheck %>" ',
                        'class="form-control <%= cls %>" ',
                        'placeholder="<%= placeHolder %>" ',
                        'data-hint="<%= dataHint %>"',
                        'data-hint-direction="<%= dataHintDirection %>"',
                        'data-hint-offset="<%= dataHintOffset %>"',
                    '>',
                    '<span class="input-error"></span>',
                '</div>'
            ].join('')),

            initialize : function(options) {
                Common.UI.BaseView.prototype.initialize.call(this, options);

                this.id             = this.options.id || Common.UI.getId();
                this.cls            = this.options.cls;
                this.style          = this.options.style;
                this.value          = this.options.value;
                this.type           = this.options.type;
                this.name           = this.options.name;
                this.validation     = this.options.validation;
                this.allowBlank     = this.options.allowBlank;
                this.placeHolder    = this.options.placeHolder;
                this.template       = this.options.template || this.template;
                this.editable       = this.options.editable;
                this.disabled       = this.options.disabled;
                this.spellcheck     = this.options.spellcheck;
                this.blankError     = this.options.blankError || this.txtEmpty;
                this.validateOnChange = this.options.validateOnChange;
                this.validateOnBlur = this.options.validateOnBlur;
                this.maxLength      = this.options.maxLength;
                this.hideErrorOnInput = this.options.hideErrorOnInput;

                this.rendered         = this.options.rendered || false;

                if (this.options.el) {
                    this.render();
                }
            },

            render : function(parentEl) {

                if (!this.rendered) {
                    this.cmpEl = $(this.template({
                        id          : this.id,
                        cls         : this.cls,
                        style       : this.style,
                        value       : this.value,
                        type        : this.type,
                        name        : this.name,
                        placeHolder : this.placeHolder,
                        spellcheck  : this.spellcheck,
                        dataHint    : this.options.dataHint,
                        dataHintDirection: this.options.dataHintDirection,
                        dataHintOffset: this.options.dataHintOffset,
                        scope       : this
                    }));

                    if (parentEl) {
                        this.setElement(parentEl, false);
                        parentEl.html(this.cmpEl);
                    } else {
                        this.$el.html(this.cmpEl);
                    }
                } else {
                    this.cmpEl = this.$el;
                }

                if (!this.rendered) {
                    const el = this.cmpEl;

                    this._input = this.cmpEl.find('input').addBack().filter('input').first();

                    if (this.editable) {
                        this._input.on('blur',   _.bind(this.onInputChanged, this));
                        this._input.on('keypress', _.bind(this.onKeyPress, this));
                        this._input.on('keydown',    _.bind(this.onKeyDown, this));
                        this._input.on('keyup',    _.bind(this.onKeyUp, this));
                        if (this.validateOnChange) this._input.on('input', _.bind(this.onInputChanging, this));
                        if (this.maxLength) this._input.attr('maxlength', this.maxLength);
                    }

                    this.setEditable(this.editable);
                    if (this.disabled)
                        this.setDisabled(this.disabled);

                    if (this._input.closest('.asc-window').length>0)
                        const onModalClose = () => {
                            const errorTip = el.find('.input-error').data('bs.tooltip');
                            if (errorTip) errorTip.tip().remove();
                            Common.NotificationCenter.off({'modal:close': onModalClose});
                        };
                        Common.NotificationCenter.on({'modal:close': onModalClose});

                    const ariaLabel = this.options.ariaLabel ? this.options.ariaLabel : this.placeHolder;
                    if (ariaLabel)
                        this._input.attr('aria-label', ariaLabel);
                }

                this.rendered = true;

                if (this.value)
                    this.setValue(this.value);

                return this;
            },

            _doChange: function(e, extra) {
                // skip processing for internally-generated synthetic event
                // to avoid double processing
                if (extra?.synthetic)
                    return;

                const newValue = $(e.target).val();
                const oldValue = this.value;

                this.trigger('changed:before', this, newValue, oldValue, e);

                if (e.isDefaultPrevented())
                    return;

                this.value = newValue;
                if (this.validateOnBlur)
                    this.checkValidate();

                // trigger changed event
                this.trigger('changed:after', this, newValue, oldValue, e);
            },

            onInputChanged: function(e, extra) {
                this._doChange(e, extra);
            },

            onInputChanging: function(e, extra) {
                const newValue = $(e.target).val();
                const oldValue = this.value;

                if (e.isDefaultPrevented())
                    return;

                this.value = newValue;
                if (this.validateOnBlur)
                    this.checkValidate();

                // trigger changing event
                this.trigger('changing', this, newValue, oldValue, e);
            },

            onKeyPress: function(e) {
                this.trigger('keypress:before', this, e);

                if (e.isDefaultPrevented())
                    return;

                if (this.options.maskExp && !_.isEmpty(this.options.maskExp.source)){
                    const charCode = String.fromCharCode(e.which);
                    if(!this.options.maskExp.test(charCode) && !e.ctrlKey && e.keyCode !== Common.UI.Keys.RETURN){
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }

                this.trigger('keypress:after', this, e);
            },

            onKeyDown: function(e) {
                this.trigger('keydown:before', this, e);

                if (e.isDefaultPrevented())
                    return;

                if (e.keyCode === Common.UI.Keys.RETURN)
                    this._doChange(e);
                if (e.keyCode === Common.UI.Keys.ESC)
                    this.setValue(this.value);
                if (e.keyCode===Common.UI.Keys.RETURN || e.keyCode===Common.UI.Keys.ESC)
                    this.trigger('inputleave', this);
            },

            onKeyUp: function(e) {
                this.trigger('keyup:before', this, e);

                if (e.isDefaultPrevented())
                    return;

                this.trigger('keyup:after', this, e);
            },

            setEditable: function(editable) {
                const input = this._input;

                this.editable = editable;

                if (editable && input) {
                    input.removeAttr('readonly');
                    input.removeAttr('data-can-copy');
                } else {
                    input.attr('readonly', 'readonly');
                    input.attr('data-can-copy', false);
                }
            },

            isEditable: function() {
                return this.editable;
            },

            setDisabled: function(disabled) {
                disabled = !!disabled;
                this.disabled = disabled;
                $(this.el).toggleClass('disabled', disabled);
                if (this._input) {
                    disabled
                        ? this._input.attr('disabled', true)
                        : this._input.removeAttr('disabled');
                }
            },

            isDisabled: function() {
                return this.disabled;
            },

            setValue: function(value) {
                this.value = value;

                if (this.rendered){
                    this._input.val(value);
                }
            },

            getValue: function() {
                return this.value;
            },

            focus: function() {
                this._input?.focus();
            },

            checkValidate: function() {
                let errors = [];

                if (!this.allowBlank && _.isEmpty(this.value)) {
                    errors.push(this.blankError);
                }

                if (_.isFunction(this.validation)) {
                    const res = this.validation.call(this, this.value);

                    if (res !== true) {
                        errors = _.flatten(errors.concat(res));
                    }
                }

                if (!_.isEmpty(errors)) {
                    if (this.cmpEl.hasClass('error')) {
                        const errorTip = this.cmpEl.find('.input-error').data('bs.tooltip');
                        if (errorTip) {
                            errorTip.options.title = errors.join('\n');
                            errorTip.setContent();
                        }
                        return errors;
                    }
                        this.cmpEl.addClass('error');

                        const errorBadge = this.cmpEl.find('.input-error');
                        const modalParents = errorBadge.closest('.asc-window');
                        const errorTip = errorBadge.data('bs.tooltip');

                        if (errorTip) errorTip.tip().remove();
                        errorBadge.attr('data-toggle', 'tooltip');
                        errorBadge.removeData('bs.tooltip');
                        errorBadge.tooltip({
                            title       : errors.join('\n'),
                            placement   : 'cursor'
                        });
                        if (modalParents.length > 0) {
                            errorBadge.data('bs.tooltip').tip().css('z-index', Number.parseInt(modalParents.css('z-index')) + 10);
                        }
                        if (this.hideErrorOnInput) {
                            const onInputChanging = () => {
                                this.showError();
                            };
                            this._input.one('input', onInputChanging);
                        }
                        return errors;
                }
                    this.cmpEl.removeClass('error');

                return true;
            },

            showError: function(errors, isWarning) {
                if (!_.isEmpty(errors)) {
                    this.cmpEl.addClass(isWarning ? 'warning' : 'error');

                    const errorBadge = this.cmpEl.find('.input-error');
                    const modalParents = errorBadge.closest('.asc-window');
                    const errorTip = errorBadge.data('bs.tooltip');

                    if (errorTip) errorTip.tip().remove();
                    errorBadge.attr('data-toggle', 'tooltip');
                    errorBadge.removeData('bs.tooltip');
                    errorBadge.tooltip({
                        title       : errors.join('\n'),
                        placement   : 'cursor'
                    });

                    if (modalParents.length > 0) {
                        errorBadge.data('bs.tooltip').tip().css('z-index', Number.parseInt(modalParents.css('z-index')) + 10);
                    }
                    if (this.hideErrorOnInput) {
                        const onInputChanging = () => {
                            this.showError();
                        };
                        this._input.one('input', onInputChanging);
                    }
                } else {
                    this.cmpEl.removeClass('error');
                    this.cmpEl.removeClass('warning');
                }
            },

            showWarning: function(errors) {
                this.showError(errors, true);
            },

            txtEmpty: 'This field is required'
        }))());

    Common.UI.InputFieldBtn = Common.UI.InputField.extend((() => ({
            options : {
                id          : null,
                cls         : '',
                style       : '',
                value       : '',
                type        : 'text',
                name        : '',
                validation  : null,
                allowBlank  : true,
                placeHolder : '',
                blankError  : null,
                spellcheck  : false,
                maskExp     : '',
                validateOnChange: false,
                validateOnBlur: true,
                disabled: false,
                editable: true,
                iconCls: 'toolbar__icon btn-select-range',
                btnHint: ''
            },

            template: _.template([
                '<div class="input-field input-field-btn" style="<%= style %>">',
                    '<input ',
                        'type=<%= type %> ',
                        'name="<%= name %>" ',
                        'spellcheck="<%= spellcheck %>" ',
                        'class="form-control <%= cls %>" ',
                        'placeholder="<%= placeHolder %>" ',
                        'value="<%= value %>"',
                        'data-hint="<%= dataHint %>"',
                        'data-hint-offset="<%= dataHintOffset %>"',
                        'data-hint-direction="<%= dataHintDirection %>"',
                    '>',
                    '<span class="input-error"></span>',
                    '<div class="select-button">' +
                    '</div>',
                '</div>'
            ].join('')),

            render : function(parentEl) {

                if (!this.rendered) {
                    this.cmpEl = $(this.template({
                        id          : this.id,
                        cls         : this.cls,
                        style       : this.style,
                        value       : this.value,
                        type        : this.type,
                        name        : this.name,
                        placeHolder : this.placeHolder,
                        spellcheck  : this.spellcheck,
                        scope       : this,
                        dataHint    : this.options.dataHint,
                        dataHintOffset: this.options.dataHintOffset,
                        dataHintDirection: this.options.dataHintDirection
                    }));

                    if (parentEl) {
                        this.setElement(parentEl, false);
                        parentEl.html(this.cmpEl);
                    } else {
                        this.$el.html(this.cmpEl);
                    }
                } else {
                    this.cmpEl = this.$el;
                }

                if (!this.rendered) {
                    const el = this.cmpEl;

                    this._button = new Common.UI.Button({
                        cls: 'btn-toolbar',
                        iconCls: this.options.iconCls,
                        hint: this.options.btnHint || '',
                        menu: this.options.menu
                    });
                    this._button.render(this.cmpEl.find('.select-button'));
                    this._button.on('click', _.bind(this.onButtonClick, this));

                    this._input = this.cmpEl.find('input').addBack().filter('input');

                    if (this.editable) {
                        this._input.on('blur',   _.bind(this.onInputChanged, this));
                        this._input.on('keypress', _.bind(this.onKeyPress, this));
                        this._input.on('keydown',    _.bind(this.onKeyDown, this));
                        this._input.on('keyup',    _.bind(this.onKeyUp, this));
                        if (this.validateOnChange) this._input.on('input', _.bind(this.onInputChanging, this));
                        if (this.maxLength) this._input.attr('maxlength', this.maxLength);
                    }

                    this.setEditable(this.editable);

                    if (this.disabled)
                        this.setDisabled(this.disabled);

                    if (this._input.closest('.asc-window').length>0)
                        const onModalClose = () => {
                            const errorTip = el.find('.input-error').data('bs.tooltip');
                            if (errorTip) errorTip.tip().remove();
                            Common.NotificationCenter.off({'modal:close': onModalClose});
                        };
                    Common.NotificationCenter.on({'modal:close': onModalClose});

                    const ariaLabel = this.options.ariaLabel ? this.options.ariaLabel : this.placeHolder;
                    if (ariaLabel)
                        this._input.attr('aria-label', ariaLabel);
                }

                this.rendered = true;
                if (this.value)
                    this.setValue(this.value);

                return this;
            },

            onButtonClick: function(btn, e) {
                this.trigger('button:click', this, e);
            },

            setDisabled: function(disabled) {
                disabled = !!disabled;
                this.disabled = disabled;
                $(this.el).toggleClass('disabled', disabled);
                disabled
                    ? this._input.attr('disabled', true)
                    : this._input.removeAttr('disabled');
                this._button.setDisabled(disabled);
            },

            setBtnDisabled: function(disabled) {
                this._button.setDisabled(disabled);
            },

            updateBtnHint: function(hint) {
                this.options.hint = hint;

                if (!this.rendered) return;
                this._button.updateHint(this.options.hint);
            }
        }))());

    Common.UI.InputFieldBtnPassword = Common.UI.InputFieldBtn.extend(_.extend((() => ({
            options: {
                id: null,
                cls: '',
                style: '',
                value: '',
                name: '',
                type: 'password',
                validation: null,
                allowBlank: true,
                placeHolder: '',
                blankError: null,
                spellcheck: false,
                maskExp: '',
                validateOnChange: false,
                validateOnBlur: true,
                disabled: false,
                editable: true,
                showCls: 'toolbar__icon btn-sheet-view',
                hideCls: 'toolbar__icon btn-hide-password',
                btnHint: '',
                repeatInput: null,
                showPwdOnClick: true
            },

            initialize : function(options) {
                options = options || {};
                options.btnHint = options.btnHint || (options.showPwdOnClick ? this.textHintShowPwd : this.textHintHold);
                options.iconCls = options.showCls || this.options.showCls;

                Common.UI.InputFieldBtn.prototype.initialize.call(this, options);

                this.hidePwd = true;
                this.repeatInput= this.options.repeatInput;
            },

            render: function (parentEl) {
                Common.UI.InputFieldBtn.prototype.render.call(this, parentEl);

                this._btnElm = this._button.$el;
                if(this.options.showPwdOnClick)
                    this._button.on('click', _.bind(this.passwordClick, this));
                else
                    this._btnElm.on('mousedown', _.bind(this.passwordShow, this));

                return this;
            },

            passwordClick: function (e)
            {
                if(this.hidePwd) {
                    this.passwordShow(e);
                    this.hidePwd = false;
                }
                else {
                    this.passwordHide(e);
                    this.hidePwd = true;
                }
                const prevstart = this._input[0].selectionStart;
                const prevend = this._input[0].selectionEnd;
                setTimeout(() => {
                    this.focus();
                    this._input[0].selectionStart = prevstart;
                    this._input[0].selectionEnd = prevend;
                }, 1);
            },

            passwordShow: function (e) {
                if (this.disabled) return;
                this._button.setIconCls(this.options.hideCls);
                this.type = 'text';

                this._input.attr('type', this.type);
                if(this.repeatInput) {
                    this.repeatInput.type = this.type;
                    this.repeatInput._input.attr('type', this.type);
                }

                if(this.options.showPwdOnClick) {
                    this._button.updateHint(this.textHintHidePwd);
                }
                else {
                    this._btnElm.on('mouseup', _.bind(this.passwordHide, this));
                    this._btnElm.on('mouseout', _.bind(this.passwordHide, this));
                }
            },

            passwordHide: function (e) {
                this._button.setIconCls(this.options.showCls);
                this.type = 'password';

                this._input.attr('type', this.type);
                if(this.repeatInput) {
                    this.repeatInput.type = this.type;
                    this.repeatInput._input.attr('type', this.type);
                }

                if(this.options.showPwdOnClick) {
                    this._button.updateHint(this.textHintShowPwd);
                }
                else {
                    this._btnElm.off('mouseup', this.passwordHide);
                    this._btnElm.off('mouseout', this.passwordHide);
                    const prevstart = this._input[0].selectionStart;
                    const prevend = this._input[0].selectionEnd;
                    setTimeout(() => {
                        this.focus();
                        this._input[0].selectionStart = prevstart;
                        this._input[0].selectionEnd = prevend;
                    }, 1);
                }
            },
            textHintShowPwd: 'Show password',
            textHintHidePwd: 'Hide password',
            textHintHold: 'Press and hold to show password'
        }))(), Common.UI.InputFieldBtnPassword || {}));

    Common.UI.InputFieldBtnCalendar = Common.UI.InputFieldBtn.extend(_.extend((() => ({
            options: {
                id: null,
                cls: '',
                style: '',
                value: '',
                type: 'text',
                name: '',
                validation: null,
                allowBlank: true,
                placeHolder: '',
                blankError: null,
                spellcheck: false,
                maskExp: '',
                validateOnChange: false,
                validateOnBlur: true,
                disabled: false,
                editable: true,
                iconCls: 'toolbar__icon btn-date',
                btnHint: '',
                menu: true
            },

            initialize : function(options) {
                options = options || {};
                options.btnHint = options.btnHint || this.textDate;

                Common.UI.InputFieldBtn.prototype.initialize.call(this, options);

                this.dateValue = undefined;
            },

            render: function (parentEl) {
                Common.UI.InputFieldBtn.prototype.render.call(this, parentEl);

                const id = `id-${Common.UI.getId()}input-field-datetime`;
                const menu = new Common.UI.Menu({
                        menuAlign: 'tr-br',
                        style: 'border: none; padding: 0;',
                        items: [
                            {template: _.template(`<div id="${id}" style=""></div>`), stopPropagation: true}
                        ]
                    });
                $('button', this._button.cmpEl).addClass('no-caret');
                this._button.setMenu(menu);
                this._button.menu.on('show:after', (menu) => {
                    if (!this.cmpCalendar) {
                        this.cmpCalendar = new Common.UI.Calendar({
                            el: this.cmpEl.find(`#${id}`),
                            enableKeyEvents: true,
                            firstday: 1
                        });
                        this.cmpCalendar.on('date:click', (cmp, date) => {
                            this.dateValue = date;
                            this.trigger('date:click', this, date);
                            menu.hide();
                        });
                        this.dateValue && this.cmpCalendar.setDate(this.dateValue);
                        menu.alignPosition();
                    }
                    this.cmpCalendar.focus();
                });
                this._input.on('input', () => {
                    this.dateValue = undefined;
                });
            },

            setDate: function(date) {
                if (date && date instanceof Date && !Number.isNaN(date)) {
                    this.cmpCalendar?.setDate(date);
                    this.dateValue = date;
                }
            },

            getDate: function() {
                return this.dateValue;
            },

            textDate: 'Select date'
        }))(), Common.UI.InputFieldBtnCalendar || {}));

    Common.UI.InputFieldFixed = Common.UI.InputField.extend((() => ({
            options : {
                id          : null,
                cls         : '',
                style       : '',
                value       : '',
                fixedValue  : '',
                fixedWidth  : '',
                fixedCls    : '',
                type        : 'text',
                name        : '',
                validation  : null,
                allowBlank  : true,
                placeHolder : '',
                blankError  : null,
                spellcheck  : false,
                maskExp     : '',
                validateOnChange: false,
                validateOnBlur: true,
                disabled: false,
                editable: true,
                btnHint: ''
            },

            template: _.template([
                '<div class="input-field input-field-fixed" style="<%= style %>">',
                    '<input ',
                    'type=<%= type %> ',
                    'name="<%= name %>" ',
                    'spellcheck="<%= spellcheck %>" ',
                    'class="form-control <%= cls %>" ',
                    'placeholder="<%= placeHolder %>" ',
                    'value="<%= value %>"',
                    'data-hint="<%= dataHint %>"',
                    'data-hint-offset="<%= dataHintOffset %>"',
                    'data-hint-direction="<%= dataHintDirection %>"',
                    '>',
                '<span class="input-error"></span>',
                '<input class="fixed-text form-control" type="text" readonly="readonly">' +
                '</div>'
            ].join('')),

            initialize : function(options) {
                this.fixedValue = options.fixedValue;
                this.fixedWidth = options.fixedWidth || 'calc(50% + 4px)';
                this.fixedCls = options.fixedCls || '';

                Common.UI.InputField.prototype.initialize.call(this, options);
            },

            render : function(parentEl) {
                Common.UI.InputField.prototype.render.call(this, parentEl);

                this._input.css({
                    'padding-left': Common.UI.isRTL() ? this.fixedWidth : 0,
                    'padding-right': Common.UI.isRTL() ? 0: this.fixedWidth,
                });
                this.cmpEl.find('input.fixed-text').css({'width': this.fixedWidth}).addClass(this.fixedCls);

                if (this.fixedValue)
                    this.setFixedValue(this.fixedValue);

                return this;
            },

            setFixedValue: function(value) {
                this.fixedValue = value;

                if (this.rendered){
                    this.cmpEl.find('input.fixed-text').addBack().filter('input.fixed-text').val(value);
                }
            },

            setDisabled: function(disabled) {
                disabled = !!disabled;
                this.disabled = disabled;
                $(this.el).toggleClass('disabled', disabled);
                if (this.cmpEl) {
                    const inputs = this.cmpEl.find('input').addBack().filter('input')
                    disabled
                        ? inputs.attr('disabled', true)
                        : inputs.removeAttr('disabled');
                }
            },
        }))());
});