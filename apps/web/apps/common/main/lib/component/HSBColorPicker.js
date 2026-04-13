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
if (Common === undefined)
    const Common = {};

define([], () => {

    Common.UI.HSBColorPicker = Common.UI.BaseView.extend({

        template    :
            _.template(
                '<div class="hsb-colorpicker">'+
                    '<% if (this.showCurrentColor) { %>'+
                        '<div class="top-panel">'+
                            '<span class="color-value">'+
                                '<span class="transparent-color"></span>'+
                            '</span>'+
                            '<div class="color-text"></div>'+
                        '</div>'+
                    '<% } %>'+
                    '<div>'+
                        '<div class="cnt-hb">'+
                            '<div class="cnt-hb-arrow"></div>'+
                        '</div>'+
                        '<% if (this.changeSaturation) { %>'+
                            '<div class="cnt-root">'+
                                '<div class="cnt-sat">'+
                                    '<div class="cnt-sat-arrow"></div>'+
                                '</div>'+
                            '</div>'+
                        '<% } %>'+
                    '</div>'+
                    '<% if (this.allowEmptyColor) { %>'+
                        '<div class="empty-color"><%= this.textNoColor %></div>'+
                    '<% } %>'+
                '</div>'),

        color: '#ff0000',

        options: {
            allowEmptyColor: false,
            changeSaturation: true,
            showCurrentColor: true
        },

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);
            const el = this.$el || $(this.el);
            let arrowSatBrightness;
            let arrowHue;
            let areaSatBrightness;
            let areaHue;
            let previewColor;
            let previewTransparentColor;
            let previewColorText;
            let btnNoColor;
            let hueVal          = 0;
            let saturationVal   = 100;
            let brightnessVal   = 100;


            this.allowEmptyColor = this.options.allowEmptyColor;
            this.changeSaturation = this.options.changeSaturation;
            this.showCurrentColor = this.options.showCurrentColor;


            const onUpdateColor = (hsb, transparent)=> {
                const rgbColor = new Common.Utils.RGBColor(`hsb(${hsb.h},${hsb.s},${hsb.b})`);
                const hexColor = rgbColor.toHex();

                this.color = transparent ? 'transparent' : hexColor;

                refreshUI();

                this.trigger('changecolor', this, this.color);

            };

            const refreshUI = ()=> {
                if (previewColor.length>0  && previewTransparentColor.length>0){
                    if (this.color === 'transparent'){
                        previewTransparentColor.show();
                    } else {
                        previewColor.css("background-color", this.color);
                        previewTransparentColor.hide();
                    }
                }

                if (areaSatBrightness.length>0) {
                    const fillColor = new Common.Utils.RGBColor(`hsb(${hueVal}, 100, 100)`);
                    const background = `linear-gradient(rgba(255,255,255,0), #000), linear-gradient(-90deg,${fillColor.toRGB()},${fillColor.toRGBA(0)}), #fff`;
                    areaSatBrightness.css('background', background);
                }

                if (previewColorText.length>0)
                    previewColorText[0].innerHTML = (this.color === 'transparent') ? this.textNoColor : this.color.toUpperCase();

                if (arrowSatBrightness.length>0 && arrowHue.length>0) {
                    arrowSatBrightness.css({'left': `${saturationVal}%`, 'top': `${100 - brightnessVal}%`, 'background-color' : this.color});
                    arrowHue.css('top', `${Number.parseInt(hueVal * 100 / 360.0)}%`);
                }
            };

            const onSBAreaMouseMove = (event, element, eOpts)=> {
                if (arrowSatBrightness.length>0 && areaSatBrightness.length>0) {
                    const pos = [
                        Math.max(0, Math.min(100, (Number.parseInt((event.pageX*Common.Utils.zoom() - Common.Utils.getOffset(areaSatBrightness).left) / areaSatBrightness.width() * 100)))),
                        Math.max(0, Math.min(100, (Number.parseInt((event.pageY*Common.Utils.zoom() - Common.Utils.getOffset(areaSatBrightness).top) / areaSatBrightness.height() * 100))))
                    ];

                    arrowSatBrightness.css('left', `${pos[0]}%`);
                    arrowSatBrightness.css('top', `${pos[1]}%`);

                    saturationVal = pos[0];
                    brightnessVal = 100 - pos[1];

                    onUpdateColor({
                        h: hueVal,
                        s: saturationVal,
                        b: brightnessVal
                    });
                }
            };

            const onHueAreaMouseMove = (event, element, eOpts)=> {
                if (arrowHue&& areaHue) {
                    const pos = Math.max(0, Math.min(100, (Number.parseInt((event.pageY*Common.Utils.zoom() - Common.Utils.getOffset(areaHue).top) / areaHue.height() * 100))));
                    arrowHue.css('top', `${pos}%`);

                    hueVal = Number.parseInt(360 * pos / 100.0);

                    onUpdateColor({
                        h: hueVal,
                        s: saturationVal,
                        b: brightnessVal
                    });
                }
            };

            const onSBAreaMouseDown = (event, element, eOpts)=> {
                $(document).on('mouseup', onSBAreaMouseUp);
                $(document).on('mousemove', onSBAreaMouseMove);
            };

            const onSBAreaMouseUp = (event, element, eOpts)=> {
                $(document).off('mouseup', onSBAreaMouseUp);
                $(document).off('mousemove', onSBAreaMouseMove);
                onSBAreaMouseMove(event, element, eOpts);
            };

            const onHueAreaMouseDown = (event, element, eOpts)=> {
                $(document).on('mouseup', onHueAreaMouseUp);
                $(document).on('mousemove', onHueAreaMouseMove);
                onHueAreaMouseMove(event, element, eOpts);
            };

            const onHueAreaMouseUp = (event, element, eOpts)=> {
                $(document).off('mouseup', onHueAreaMouseUp);
                $(document).off('mousemove', onHueAreaMouseMove);
            };

            const onNoColorClick = (cnt)=> {
                const hsbColor = new Common.util.RGBColor(this.color).toHSB();

                onUpdateColor(hsbColor, true);
            };

            const onAfterRender = (ct)=> {
                const rootEl = $(this.el);
                let hsbColor;

                if (rootEl){
                    arrowSatBrightness  = rootEl.find('.cnt-hb-arrow');
                    arrowHue            = rootEl.find('.cnt-sat-arrow');
                    areaSatBrightness   = rootEl.find('.cnt-hb');
                    areaHue             = rootEl.find('.cnt-sat');
                    previewColor        = rootEl.find('.color-value');
                    previewColorText    = rootEl.find('.color-text');
                    btnNoColor          = rootEl.find('.empty-color');

                    if (previewColor.length>0){
                        previewTransparentColor = previewColor.find('.transparent-color');
                    }

                    if (areaSatBrightness.length>0) {
                        areaSatBrightness.off('mousedown');
                        areaSatBrightness.on('mousedown', onSBAreaMouseDown);
                    }

                    if (areaHue.length>0) {
                        areaHue.off('mousedown');
                        areaHue.on('mousedown', onHueAreaMouseDown);
                    }

                    if (btnNoColor.length>0) {
                        btnNoColor.off('click');
                        btnNoColor.on('click', onNoColorClick);
                    }

                    if (this.color === 'transparent')
                        hsbColor = {h: 0, s: 100, b: 100};
                    else
                        hsbColor = new Common.Utils.RGBColor(this.color).toHSB();

                    hueVal          = hsbColor.h;
                    saturationVal   = hsbColor.s;
                    brightnessVal   = hsbColor.b;

                    if (hueVal === saturationVal &&
                        hueVal === brightnessVal &&
                        hueVal === 0)
                        saturationVal = 100;

                    refreshUI();
                }
            };

            this.setColor = (value)=> {
                if (this.color === value)
                    return;

                let hsbColor;
                if (value === 'transparent')
                    hsbColor = {h: 0, s: 100, b: 100};
                else
                    hsbColor = new Common.Utils.RGBColor(value).toHSB();

                hueVal          = hsbColor.h;
                saturationVal   = hsbColor.s;
                brightnessVal   = hsbColor.b;

                if (hueVal === saturationVal &&
                    hueVal === brightnessVal &&
                    hueVal === 0)
                    saturationVal = 100;

                this.color = value;

                refreshUI();
            };

            this.getColor = ()=> this.color;

            this.on('render:after', onAfterRender);
            this.render();
        },

        render: function () {
            (this.$el || $(this.el)).html(this.template());

            this.trigger('render:after', this);
            return this;
        },

        textNoColor: 'No Color'

    });
});