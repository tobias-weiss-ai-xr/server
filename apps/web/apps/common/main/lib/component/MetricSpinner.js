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
 *  MetricSpinner.js
 *
 *  Created on 1/21/14
 *
 */

/**
 *
 * A text field with a pair of up/down spinner buttons and up/down arrow key event listeners attached for
 * incrementing/decrementing the value by the {@link #step} value. Provides automatic numeric validation to limit
 * the value to a range of valid numbers. The range of acceptable number values can be controlled by setting
 * the {@link #minValue} and {@link #maxValue} configs.
 *
 *  Example usage:
 *      new Common.UI.MetricSpinner({
 *          el: $('#id'),
 *          minValue    : 0,
 *          maxValue    : 100,
 *          step        : 1,
 *          defaultUnit : 'px',
 *          allowAuto   : false,
 *          autoText    : 'Auto'
 *      });
 *
 *
 *  @property {String} defaultUnit
 *  Name of the unit of measurement. Can be px|em|%|en|ex|pt|"|cm|mm|pc|s|ms|см|мм|пт|сек|мс.
 *
 *  defaultUnit: 'px',
 *
 *  @property {Boolean} allowAuto
 *  True to enable additional field value {@link #autoText}. {@link #autoText} appears when number value of the field
 *  is {@link #minValue} and the user pressed down spinner button or down arrow key.
 *
 *  allowAuto: false,
 *
 *  @property {String} autoText
 *  Used when {@link #allowAuto} is true.
 *
 *  autoText: 'Auto',
 *
 *  @property {Boolean} disabled
 *  True if this spinner is disabled.
 *
 *  disabled: false,
 *
 *  @property {Boolean} hold
 *  If true this spinner fires a mouse down/arrow key down event while the mouse/key is pressed.
 *  The interval between firings depends on {@link #speed} .
 *
 *  hold: true,
 *
 *  @property {String} speed
 *  Used when {@link #hold} is true. Can be 'slow', 'medium', 'fast'.
 *
 *  speed: 'medium',
 *
 */

if (Common === undefined)
    const Common = {};

define([
    'common/main/lib/component/BaseView'
], () => {

    Common.UI.MetricSpinner = Common.UI.BaseView.extend({
        options : {
            minValue    : 0,
            maxValue    : 100,
            step        : 1,
            defaultUnit : "px",
            allowAuto   : false,
            autoText    : 'Auto',
            hold        : true,
            speed       : 'medium',
            width       : 90,
            allowDecimal: true,
            allowBlank  : false,
            dataHint    : '',
            dataHintDirection: '',
            dataHintOffset: ''
        },

        disabled    : false,
        value       : '0 px',
        rendered    : false,

        template    :
                    '<input type="text" class="form-control" spellcheck="false" role="spinbutton" data-hint="<%= dataHint %>" data-hint-direction="<%= dataHintDirection %>" data-hint-offset="<%= dataHintOffset %>">' +
                    '<div class="spinner-buttons">' +
                        '<button type="button" class="spinner-up"><i class="arrow"></i></button>' +
                        '<button type="button" class="spinner-down"><i class="arrow"></i></button>' +
                    '</div>',

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);
            const el = this.$el || $(this.el);

            el.addClass('spinner');

            el.on('mousedown',  '.spinner-up',   _.bind(this.onMouseDown, this, true));
            el.on('mousedown',  '.spinner-down', _.bind(this.onMouseDown, this, false));
            el.on('mouseup',    '.spinner-up',   _.bind(this.onMouseUp, this, true));
            el.on('mouseup',    '.spinner-down', _.bind(this.onMouseUp, this, false));
            el.on('mouseover',  '.spinner-up, .spinner-down', _.bind(this.onMouseOver, this));
            el.on('mouseout',   '.spinner-up, .spinner-down', _.bind(this.onMouseOut, this));
            el.on('keydown', '.form-control', _.bind(this.onKeyDown, this));
            el.on('keyup',   '.form-control', _.bind(this.onKeyUp, this));
            el.on('blur', '.form-control', _.bind(this.onBlur, this));
            el.on('input', '.form-control', _.bind(this.onInput, this));
            if (!this.options.allowDecimal)
                el.on('keypress',   '.form-control', _.bind(this.onKeyPress, this));
            el.on('focus', 'input.form-control', (e) => {
                setTimeout(()=> {
                    if (this.$input) {
                        this.$input[0].selectionStart = 0;
                        this.$input[0].selectionEnd = this.$input.val().length;
                    }
                }, 1);
            });
            Common.Utils.isGecko && el.on('blur', 'input.form-control', () => {
                setTimeout(()=> {
                    this.$input && (this.$input[0].selectionStart = this.$input[0].selectionEnd = 0);
                }, 1);
            });

            this.switches = {
                count: 1,
                enabled: true,
                fromKeyDown: false
            };

            if (this.options.speed === 'medium') { this.switches.speed = 300; }
            else if (this.options.speed === 'fast') { this.switches.speed = 100; }
            else { this.switches.speed = 500; }

            this.render();

            if (this.options.disabled)
                this.setDisabled(this.options.disabled);

            if (this.options.allowBlank)
                this.allowBlank = this.options.allowBlank;

            if (this.options.value!==undefined)
                this.value = this.options.value;
            this.setRawValue(this.value);

            if (this.options.width) {
                el.width(this.options.width);
            }

            if (this.options.defaultValue===undefined)
                this.options.defaultValue = this.options.minValue;

            this.oldValue = this.options.minValue;
            this.lastValue = null;
        },

        render: function () {
            const el = this.$el || $(this.el);

            const template = _.template(this.template);
            el.html($(template({
                dataHint         : this.options.dataHint,
                dataHintDirection: this.options.dataHintDirection,
                dataHintOffset   : this.options.dataHintOffset
            })));

            this.$input = el.find('.form-control');
            this.rendered = true;

            if (this.options.tabindex !== undefined)
                this.$input.attr('tabindex', this.options.tabindex);

            this.$input.attr('aria-valuemin', this.options.minValue);
            this.$input.attr('aria-valuemax', this.options.maxValue);

            if (this.options.ariaLabel)
                this.$input.attr('aria-label', this.options.ariaLabel);

            return this;
        },

        setDisabled: function(disabled) {
            disabled = !!disabled;
            const el = this.$el || $(this.el);
            if (disabled !== this.disabled) {
                el.find('button').toggleClass('disabled', disabled);
                el.toggleClass('disabled', disabled);
                (disabled) ? this.$input.attr({disabled: disabled}) : this.$input.removeAttr('disabled');
            }

            this.disabled = disabled;
        },

        isDisabled: function() {
            return this.disabled;
        },

        setDefaultUnit: function(unit){
            if (this.options.defaultUnit !== unit){
                const oldUnit = this.options.defaultUnit;
                this.options.defaultUnit = unit;
                this.setMinValue(this._recalcUnits(this.options.minValue, oldUnit));
                this.setMaxValue(this._recalcUnits(this.options.maxValue, oldUnit));
                this.setValue(this._recalcUnits(this.getNumberValue(), oldUnit), true);
            }
        },

        setMinValue: function(unit){
            this.options.minValue = unit;
            if (this.$input) this.$input.attr('aria-valuemin', unit);
        },

        setMaxValue: function(unit){
            this.options.maxValue = unit;
            if (this.$input) this.$input.attr('aria-valuemax', unit);
        },

        setStep: function(step){
            this.options.step = step;
        },

        getMinValue: function(){
            return this.options.minValue;
        },

        getMaxValue: function(){
            return this.options.maxValue;
        },

        getNumberValue: function(){
            return this.checkAutoText(this.value) ? -1 : Number.parseFloat(this.value);
        },

        getUnitValue: function(){
            return this.options.defaultUnit;
        },

        getValue: function(){
            return this.value;
        },

        setRawValue: function (value) {
            if (this.$input) {
                this.$input.val(value);
                this.$input.attr('aria-valuetext', value);
            }
        },

        getRawValue: function () {
            return this.$input.val();
        },

        setValue: function(value, suspendchange) {
            let showError = false;
            this._fromKeyDown = false;
            this.lastValue = this.value;
            if ( typeof value === 'undefined' || value === ''){
                this.value = '';
            } else if (this.options.allowAuto && (Math.abs(Common.Utils.String.parseFloat(value)+1.)<0.0001 || this.checkAutoText(value))) {
                this.value = this.options.autoText;
            } else {
                let number = this._add(Common.Utils.String.parseFloat(value), 0, (this.options.allowDecimal) ? 3 : 0);
                if ( typeof value === 'undefined' || Number.isNaN(number)) {
                    number = this.oldValue;
                    showError = true;
                }

                let units = this.options.defaultUnit;

                if ( typeof value.match !== 'undefined'){
                    const searchUnits = value.match(/(px|em|%|en|ex|pt|"|cm|mm|pc|s|ms|см|мм|пт|сек|мс)$/i);
                    if (null !== searchUnits && searchUnits[0]!=='undefined') {
                        units = searchUnits[0].toLowerCase();
                    }
                }

                if (this.options.defaultUnit !== units && !showError) {
                    number = this._recalcUnits(number, units);
                }
                if (number > this.options.maxValue) { number = this.options.maxValue; showError = true; }
                if (number < this.options.minValue) { number = this.options.minValue; showError = true; }

                this.value = (`${number} ${this.options.defaultUnit}`).trim();
                this.oldValue = number;
            }
            if (suspendchange !== true && this.lastValue !== this.value)
                this.trigger('change', this, this.value, this.lastValue);

            if (suspendchange !== true && showError)
                this.trigger('inputerror', this, this.value);

            if (this.rendered) {
                this.setRawValue(this.value);
            } else {
                this.options.value = this.value;
            }
        },

        setMask: function(value) {
            this.options.maskExp = value;
        },

        onMouseDown: function (type, e) {
            if ( this.disabled ) return;

            if (e) $(e.currentTarget).addClass('active');
            if (this.options.hold) {
                this.switches.fromKeyDown = false;
                this._startSpin(type, e);
            }
        },

        onMouseUp: function (type, e) {
            if ( this.disabled ) return;

            $(e.currentTarget).removeClass('active');
            if (this.options.hold)
                this._stopSpin();
            else
                this._step(type);
        },

        onMouseOver: function (e) {
            if ( this.disabled ) return;

            $(e.currentTarget).addClass('over');
        },

        onMouseOut: function (e) {
            if ( this.disabled ) return;

            $(e.currentTarget).removeClass('active over');
            if (this.options.hold)
                this._stopSpin();
        },

        onKeyDown: function (e) {
            if ( this.disabled ) return;

            if (this.options.hold && ( e.keyCode===Common.UI.Keys.UP || e.keyCode===Common.UI.Keys.DOWN)) {
                e.preventDefault();
                e.stopPropagation();
                if (e.metaKey) {
                    this._step(e.keyCode === Common.UI.Keys.UP);
                } else if (this.switches.timeout===undefined) {
                    this.switches.fromKeyDown = true;
                    this._startSpin(e.keyCode===Common.UI.Keys.UP, e);
                }
            } else if (e.keyCode===Common.UI.Keys.RETURN) {
                if (this.options.defaultUnit?.length) {
                    const value = this.getRawValue();
                    if (this.value !== value) {
                        this.onEnterValue();
                        this.trigger('inputleave', this);
                        return (this.value === value);
                    }
                } else {
                    this.onEnterValue();
                }
            } else {
                this._fromKeyDown = true;
            }

            if (e.keyCode === Common.UI.Keys.ESC)
                this.setRawValue(this.value);
            if (e.keyCode===Common.UI.Keys.RETURN || e.keyCode===Common.UI.Keys.ESC)
                this.trigger('inputleave', this);
        },

        onKeyUp: function (e) {
            if ( this.disabled ) return;

            if (e.keyCode===Common.UI.Keys.UP || e.keyCode===Common.UI.Keys.DOWN) {
                e.stopPropagation();
                e.preventDefault();
                (this.options.hold) ? this._stopSpin() : this._step(e.keyCode===Common.UI.Keys.UP);
            }
        },

        onKeyPress: function (e) {
            if ( this.disabled ) return;

            const charCode = String.fromCharCode(e.charCode);
            if (charCode==='.' || charCode===',') {
                e.preventDefault();
                e.stopPropagation();
            } else if(this.options.maskExp && !this.options.maskExp.test(charCode) && !e.ctrlKey && e.keyCode !== Common.UI.Keys.RETURN ){
                e.preventDefault();
                e.stopPropagation();
            }
        },

        onInput: function(e, extra) {
            if ( this.disabled || e.isDefaultPrevented() ) return;
            this.trigger('changing', this, $(e.target).val(), e);
        },

        onEnterValue: function() {
            if (this.$input) {
                const val = this.getRawValue();
                this.setValue((val==='' && !this.allowBlank) ? this.value : val );
                this.trigger('entervalue', this);
            }
        },

        onBlur: function(e){
            if (this.$input) {
                const val = this.getRawValue();
                this.setValue((val==='' && !this.allowBlank) ? this.value : val );
                if (this.options.hold && this.switches.fromKeyDown)
                    this._stopSpin();
            }
        },

        _startSpin: function (type, e) {
            if (!this.disabled) {
                let divisor = this.switches.count;

                if (divisor === 1) { this._step(type, true); divisor = 1; }
                else if (divisor < 3) { divisor = 1.5; }
                else if (divisor < 8) { divisor = 2.5; }
                else { divisor = 6; }

                this.switches.timeout = setTimeout($.proxy(function() {
                    this._step(type, true);
                    this._startSpin(type);
                } ,this), this.switches.speed/divisor);
                this.switches.count++;
            }
        },

        _stopSpin: function (e) {
            if(this.switches.timeout!==undefined){
                clearTimeout(this.switches.timeout);
                this.switches.timeout = undefined;
                this.switches.count = 1;
                this.trigger('change', this, this.value, this.lastValue);
            }
        },

        _increase: function(suspend) {
            if (!this.readOnly) {
                let val = this.options.step;
                if (this._fromKeyDown) {
                    val = this.getRawValue();
                    val = _.isEmpty(val) ? this.oldValue : Common.Utils.String.parseFloat(val);
                } else if(this.getValue() !== '') {
                    if (this.checkAutoText(this.getValue())) {
                        val = this.options.defaultValue-this.options.step;
                    } else
                        val = Common.Utils.String.parseFloat(this.getValue());
                    if (Number.isNaN(val))
                        val = this.oldValue;
                } else {
                    val = this.options.defaultValue - this.options.step;
                }
                this.setValue((`${this._add(val, this.options.step, (this.options.allowDecimal) ? 3 : 0)} ${this.options.defaultUnit}`).trim(), suspend);
            }
        },

        _decrease: function(suspend) {
            if (!this.readOnly) {
                let val = this.options.step;
                if (this._fromKeyDown) {
                    val = this.getRawValue();
                    val = _.isEmpty(val) ? this.oldValue : Common.Utils.String.parseFloat(val);
                } else if(this.getValue() !== '') {
                    if (this.checkAutoText(this.getValue())) {
                        val = this.options.minValue;
                    } else
                        val = Common.Utils.String.parseFloat(this.getValue());

                    if (Number.isNaN(val))
                        val = this.oldValue;
                    if (this.options.allowAuto && this._add(val, -this.options.step, (this.options.allowDecimal) ? 3 : 0)<this.options.minValue) {
                        this.setValue(this.options.autoText, true);
                        return;
                    }
                } else {
                    val = this.options.defaultValue;
                }
                this.setValue((`${this._add(val, -this.options.step, (this.options.allowDecimal) ? 3 : 0)} ${this.options.defaultUnit}`).trim(), suspend);
            }
        },

        _step: function (type, suspend) {
            (type) ? this._increase(suspend) : this._decrease(suspend);
            if (this.options.hold && this.switches.fromKeyDown)
                this.$input?.select();
        },

        _add: function (a, b, precision) {
            const x = 10 ** (precision || (this.options.allowDecimal) ? 2 : 0);
            return (Math.round(a * x) + Math.round(b * x)) / x;
        },

        _recalcUnits: function(value, fromUnit){
            if ( fromUnit.match(/(s|ms|сек|мс)$/i) && this.options.defaultUnit.match(/(s|ms|сек|мс)$/i) ) {
                let v_out = value;
                // to sec
                if (fromUnit==='ms' || fromUnit==='мс')
                    v_out = Number.parseFloat((v_out/1000.).toFixed(6));
                // from sec
                if (this.options.defaultUnit==='ms' || this.options.defaultUnit==='мс')
                    v_out = Number.parseFloat((v_out*1000).toFixed(6));
                return v_out;
            }

            const re = new RegExp(`(pt|"|cm|mm|pc|см|мм|пт|${Common.Utils.Metric.txtPt}|${Common.Utils.Metric.txtCm})$`, 'i');
            if ( fromUnit.match(re)===null || this.options.defaultUnit.match(re)===null)
                return value;

            let v_out = value;
            // to mm
            if (fromUnit==='cm' || fromUnit==='см' || fromUnit===Common.Utils.Metric.txtCm)
                v_out = v_out*10;
            else if (fromUnit==='pt' || fromUnit==='пт'|| fromUnit===Common.Utils.Metric.txtPt)
                v_out = v_out * 25.4 / 72.0;
            else if (fromUnit==='\"')
                v_out = v_out * 25.4;
            else if (fromUnit==='pc')
                v_out = v_out * 25.4 / 6.0;

            // from mm
            if (this.options.defaultUnit==='cm' || this.options.defaultUnit==='см' || this.options.defaultUnit===Common.Utils.Metric.txtCm)
                v_out = Number.parseFloat((v_out/10.).toFixed(6));
            else if (this.options.defaultUnit==='pt' || this.options.defaultUnit==='пт' || this.options.defaultUnit===Common.Utils.Metric.txtPt)
                v_out = Number.parseFloat((v_out * 72.0 / 25.4).toFixed(3));
            else if (this.options.defaultUnit==='\"')
                v_out = Number.parseFloat((v_out / 25.4).toFixed(3));
            else if (this.options.defaultUnit==='pc')
                v_out = Number.parseFloat((v_out * 6.0 / 25.4).toFixed(6));

            return v_out;
        },

        focus: function() {
            if (this.$input) this.$input.focus();
        },

        setDefaultValue: function(value) {
            this.options.defaultValue = value;
        },

        checkAutoText: function(value) {
            if (this.options.allowAuto && typeof value === 'string') {
                const val = value.toLowerCase();
                return (val===this.options.autoText.toLowerCase() || val==='auto');
            }
            return false;
        }
    });

    Common.UI.CustomSpinner = Common.UI.MetricSpinner.extend(_.extend({
        initialize : function(options) {
            this.options.toCustomFormat = (options.toCustomFormat) ? options.toCustomFormat : ((value) => value);
            this.options.fromCustomFormat = (options.fromCustomFormat) ? options.fromCustomFormat : ((value) => value);

            Common.UI.MetricSpinner.prototype.initialize.call(this, options);
        },

        setRawValue: function (value) {
            if (this.$input) this.$input.val(this.options.toCustomFormat(value));
        },

        getRawValue: function () {
            return this.options.fromCustomFormat(this.$input.val());
        }

    }, Common.UI.CustomSpinner || {}));
});
