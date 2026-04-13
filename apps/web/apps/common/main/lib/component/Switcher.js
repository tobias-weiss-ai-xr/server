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
 * Date: 26.02.15
 */

if (Common === undefined)
    const Common = {};

define([
    'common/main/lib/component/BaseView',
    'underscore'
], (base, _) => {

    Common.UI.Switcher = Common.UI.BaseView.extend({

        options : {
            hint: false,
            width: 30,
            thumbWidth: 12,
            value: false
        },

        disabled: false,

        template    : _.template([
            '<div class="switcher">',
                '<div class="thumb"></div>',
            '</div>'
        ].join('')),

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            this.hint = this.options.hint;
            this.width = this.options.width;
            this.thumbWidth = this.options.thumbWidth;
            this.delta = (this.width - this.thumbWidth - 2)/2;
            this.disabled = this.options.disabled;
            
            if (this.options.el)
                this.render();

            this.setValue(this.options.value);
        },

        render : function(parentEl) {

            if (!this.rendered) {
                this.cmpEl = $(this.template({
                }));

                if (parentEl) {
                    this.setElement(parentEl, false);
                    parentEl.html(this.cmpEl);
                } else {
                    this.$el.html(this.cmpEl);
                }

                if (this.options.hint) {
                    this.cmpEl.attr('data-toggle', 'tooltip');
                    this.cmpEl.tooltip({
                        title: (typeof this.options.hint === 'string') ? this.options.hint : this.options.hint[0],
                        placement: this.options.hintAnchor||'cursor'
                    });
                }
            } else {
                this.cmpEl = this.$el;
            }

            this.thumb = this.cmpEl.find('.thumb');

            this.cmpEl.width(this.width);
            this.thumb.width(this.thumbWidth);

            const onMouseUp = (e) => {
                if ( this.disabled ) return;

                e.preventDefault();
                e.stopPropagation();

                $(document).off('mouseup.switcher',   onMouseUp);
                $(document).off('mousemove.switcher', onMouseMove);

                const pos = Math.round((e.pageX*Common.Utils.zoom() - this._dragstart));
                this.value = (this.value) ? (pos > -this.delta) : (pos > this.delta);
                this.cmpEl.toggleClass('on', this.value);
                this.thumb.css({left: '', right: ''});
                if (this.lastValue !== this.value) {
                    this.trigger('change', this, this.value);
                }

                this._dragstart = undefined;
            };

            const onMouseMove = (e) => {
                if ( this.disabled ) return;
                if ( this._dragstart===undefined ) return;

                e.preventDefault();
                e.stopPropagation();

                const pos = Math.round((e.pageX*Common.Utils.zoom() - this._dragstart));
                if (this.value) {
                    this.thumb.css({right: (pos<1) ? Math.min(this.width-this.thumbWidth - 4, -pos) : 0, left: 'auto'});
                } else {
                    this.thumb.css({left: (pos>-1) ? Math.min(this.width-this.thumbWidth - 4, pos) : 0, right: 'auto'});
                }
                if (!this._isMouseMove) this._isMouseMove = Math.abs(pos)>0;
            };

            const onMouseDown = (e) => {
                if ( this.disabled ) return;
                this._dragstart = e.pageX*Common.Utils.zoom();
                this._isMouseMove = false;
                this.lastValue = this.value;
                
                $(document).on('mouseup.switcher',   onMouseUp);
                $(document).on('mousemove.switcher', onMouseMove);
            };

            const onSwitcherClick = (e) => {
                if ( this.disabled || this._isMouseMove) { this._isMouseMove = false; return;}

                if (this.options.hint) {
                    const tip = this.cmpEl.data('bs.tooltip');
                    if (tip) {
                        if (tip.dontShow===undefined)
                            tip.dontShow = true;

                        tip.hide();
                    }
                }

                this.value = !this.value;
                this.cmpEl.toggleClass('on', this.value);
                this.trigger('change', this, this.value);
            };

            if (!this.rendered) {
                const el = this.cmpEl;
                el.on('mousedown', '.thumb', onMouseDown);
                el.on('click', onSwitcherClick);
            }

            if (this.disabled) {
                this.setDisabled(!(this.disabled=false));
            }

            this.rendered = true;

            return this;
        },

        setThumbPosition: function(x) {
            const isOn = (this.value) ? (x < -this.delta) : (x > this.delta);
            this.thumb.css((isOn) ? {right: 0, left: 'auto'} : {left: 0, right: 'auto'});
        },

        setValue: function(value) {
            this.value = (value===true);
            this.cmpEl.toggleClass('on', this.value);
        },

        getValue: function() {
            return this.value;
        },

        setDisabled: function(disabled) {
            if (disabled !== this.disabled) {
                if ((disabled || !Common.Utils.isGecko) && this.options.hint) {
                    const tip = this.cmpEl.data('bs.tooltip');
                    if (tip) {
                        disabled && tip.hide();
                        !Common.Utils.isGecko && (tip.enabled = !disabled);
                    }
                }
                this.cmpEl.toggleClass('disabled', disabled);
            }
            this.disabled = disabled;
        },

        isDisabled: function() {
            return this.disabled;
        },

        updateHint: function(hint, isHtml) {
            this.options.hint = hint;
            this.hint = hint;

            if (!this.rendered) return;

            if (this.cmpEl.data('bs.tooltip'))
                this.cmpEl.removeData('bs.tooltip');

            this.cmpEl.tooltip({
                html: !!isHtml,
                title: (typeof hint === 'string') ? hint : hint[0],
                placement: this.options.hintAnchor||'cursor'
            });

            if (this.disabled || !Common.Utils.isGecko) {
                const tip = this.cmpEl.data('bs.tooltip');
                if (tip) {
                    this.disabled && tip.hide();
                    !Common.Utils.isGecko && (tip.enabled = !this.disabled);
                }
            }
        }
    });
});
