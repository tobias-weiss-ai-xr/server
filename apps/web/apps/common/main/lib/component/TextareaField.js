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
 *  TextareaField.js
 *
 *  Created on 29/09/20
 *
 */

if (Common === undefined)
    const Common = {};

define([], () => { 
    Common.UI.TextareaField = Common.UI.BaseView.extend((() => ({
            options : {
                id          : null,
                cls         : '',
                style       : '',
                value       : '',
                maxlength   : undefined,
                placeHolder : '',
                spellcheck  : false,
                disabled: false,
                resize: false
            },

            template: _.template([
                '<div class="textarea-field" style="<%= style %>">',
                    '<textarea ',
                    'spellcheck="<%= spellcheck %>" ',
                    'class="form-control <%= cls %>" ',
                    'placeholder="<%= placeHolder %>" ',
                    '<% if (dataHint) {%>',
                    'data-hint="<%= dataHint %>" ',
                    '<% } %>',
                    '<% if (dataHintDirection) {%>',
                    'data-hint-direction="<%= dataHintDirection %>" ',
                    '<% } %>',
                    '<% if (dataHintOffset) {%>',
                    'data-hint-offset="<%= dataHintOffset %>" ',
                    '<% } %>',
                    '></textarea>',
                '</div>'
            ].join('')),

            initialize : function(options) {
                Common.UI.BaseView.prototype.initialize.call(this, options);

                this.id             = this.options.id || Common.UI.getId();
                this.cls            = this.options.cls;
                this.style          = this.options.style;
                this.value          = this.options.value;
                this.placeHolder    = this.options.placeHolder;
                this.template       = this.options.template || this.template;
                this.disabled       = this.options.disabled;
                this.spellcheck     = this.options.spellcheck;
                this.maxLength      = this.options.maxLength;

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

                    this._input = this.cmpEl.find('textarea').addBack().filter('textarea');
                    this._input.on('blur',   _.bind(this.onInputChanged, this));
                    this._input.on('keydown',    _.bind(this.onKeyDown, this));
                    if (this.maxLength) this._input.attr('maxlength', this.maxLength);
                    if (!this.resize) this._input.css('resize', 'none');

                    if (this.disabled)
                        this.setDisabled(this.disabled);
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

                // trigger changed event
                this.trigger('changed:after', this, newValue, oldValue, e);
            },

            onInputChanged: function(e, extra) {
                this._doChange(e, extra);
            },

            onKeyDown: function(e) {
                this.trigger('keydown:before', this, e);

                if (e.isDefaultPrevented())
                    return;

                if (e.keyCode === Common.UI.Keys.RETURN) {
                    e.stopPropagation();
                }
                if (e.keyCode === Common.UI.Keys.ESC)
                    this.setValue(this.value);
                if (e.keyCode===Common.UI.Keys.ESC)
                    this.trigger('inputleave', this);
            },

            setDisabled: function(disabled) {
                disabled = !!disabled;
                this.disabled = disabled;
                $(this.el).toggleClass('disabled', disabled);
                disabled
                    ? this._input.attr('disabled', true)
                    : this._input.removeAttr('disabled');
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
                this._input.focus();
            }
        }))());
});
