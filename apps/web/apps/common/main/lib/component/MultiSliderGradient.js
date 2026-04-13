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
 *  MultiSliderGradient.js
 *
 *  Created on 2/19/14
 *
 */

if (Common === undefined)
    const Common = {};
define([
    'common/main/lib/component/Slider',
    'underscore'
], (base, _) => {

    Common.UI.MultiSliderGradient = Common.UI.MultiSlider.extend({

        options : {
            width: 100,
            minValue: 0,
            maxValue: 100,
            values: [0, 100],
            colorValues: ['#000000', '#ffffff'],
            currentThumb: 0,
            includeSnap: true,
            intervalSnap: 5,
            thumbTemplate: '<div class="thumb" style="">' +
                                '<canvas style="width: 100%; height: 100%"></canvas>' +
                            '</div>'
        },

        disabled: false,

        template    : _.template([
            '<div class="slider multi-slider-gradient">',
            '<div class="track"></div>',
            '<% _.each(items, function(item) { %>',
            '<%= thumbTemplate %>',
            '<% }); %>',
            '</div>'
        ].join('')),

        initialize : function(options) {
            this.styleStr = {};
            this.tmbOptions={
                width: 12,
                height: 16,
                border:0.5,
                activeThumbIndex: 0,
                borderColor: Common.Utils.isIE ?'#cfcfcf' :Common.UI.Themes.currentThemeColor('--border-regular-control'),
                borderColorActive: Common.Utils.isIE? '#848484' :Common.UI.Themes.currentThemeColor('--border-control-focus')
            };
            this.scale = Common.Utils.applicationPixelRatio() >= 1 ? Common.Utils.applicationPixelRatio() : 1,
            Common.UI.MultiSlider.prototype.initialize.call(this, options);

        },

        render : function(parentEl) {
            Common.UI.MultiSlider.prototype.render.call(this, parentEl);
            this.trackEl = this.cmpEl.find('.track');
            for (let i=0; i<this.thumbs.length; i++) {
                this.thumbs[i].thumb.on('dblclick', null, () => {
                    this.trigger('thumbdblclick', this);
                });
                this.thumbs[i].thumbcolor = this.thumbs[i].thumb.find('> canvas')[0];
                this.setSizeThumb(this.thumbs[i].thumb, this.thumbs[i].thumbcolor);
                this.thumbs[i].context = this.thumbs[i].thumbcolor.getContext('2d');
                this.drawThumb(this.thumbs[i]);
                this.setColorValue(this.options.colorValues[i], i);
            }

            this.changeSliderStyle();
            this.changeGradientStyle();
            this.on('change', _.bind(this.changeGradientStyle, this));
            Common.NotificationCenter.on( {
                'window:resize':_.bind(this.onResize, this),
                'uitheme:changed': _.bind(this.changeColors,this)});
            this.on('thumbclick',_.bind(this.onActiveThumb,this));
        },

        setColorValue: function(color, index) {
            const ind = (index!==undefined) ? index : this.currentThumb;
            this.thumbs[ind].colorValue = color;
            this.thumbFill(this.thumbs[ind].context,color);
            this.changeGradientStyle();
        },

        getColorValue: function(index) {
            const ind = (index!==undefined) ? index : this.currentThumb;
            return this.thumbs[ind].colorValue;
        },

        setValue: function(index, value) {
            Common.UI.MultiSlider.prototype.setValue.call(this, index, value);
            this.changeGradientStyle();
        },

        getColorValues: function() {
            const values = [];
            _.each (this.thumbs, (thumb) => {
                values.push(thumb.colorValue);
            });

            return values;
        },

        changeGradientStyle: function() {
            if (!this.rendered) return;
            let style;
            if (this.styleStr.specific) {
                style = Common.Utils.String.format(this.styleStr.specific, this.getColorValues().concat(this.getValues()));
                this.trackEl.css('background', style);
            }
            if (Common.Utils.isIE) {
                style = Common.Utils.String.format('progid:DXImageTransform.Microsoft.gradient( startColorstr={0}, endColorstr={1},GradientType=1 )',
                    this.getColorValue(0), this.getColorValue(this.thumbs.length-1));
                this.trackEl.css('filter', style);
            }
            if (this.styleStr.common) {
                style = Common.Utils.String.format(this.styleStr.common, this.getColorValues().concat(this.getValues()));
                this.trackEl.css('background', style);
            }
        },

        sortThumbs: function() {
            const recalc_indexes = Common.UI.MultiSlider.prototype.sortThumbs.call(this);
            this.trigger('sortthumbs', this, recalc_indexes);
            return recalc_indexes;
        },

        findLeftThumb: function(pos) {
            let leftThumb = 100;
            let index = 0;
            const len = this.thumbs.length;
            let dist;

            for (let i=0; i<len; i++) {
                dist = pos - this.thumbs[i].position;
                if (dist > 0 && dist <= leftThumb) {
                    const above = this.thumbs[i + 1];
                    const below = this.thumbs[i - 1];

                    if (below !== undefined && pos < below.position) {
                        continue;
                    }
                    if (above !== undefined && pos > above.position) {
                        continue;
                    }
                    index = i;
                    leftThumb = dist;
                }
            }
            return index;
        },

        calculationNewColor: (color1, color2, ratio) => {
            const w1 = ratio ? ratio/100 : 0.5;
            const w2 = 1 - w1;
            const rgbColor1 = Common.Utils.ThemeColor.getRgbColor(color1);
            const rgbColor2 = Common.Utils.ThemeColor.getRgbColor(color2);
            const rgb = [Math.round(rgbColor1.get_r() * w2 + rgbColor2.get_r() * w1),
                Math.round(rgbColor1.get_g() * w2 + rgbColor2.get_g() * w1),
                Math.round(rgbColor1.get_b() * w2 + rgbColor2.get_b() * w1)];
            return Common.Utils.ThemeColor.getHexColor(rgb[0], rgb[1], rgb[2]);
        },

        addThumb: function() {
            Common.UI.MultiSlider.prototype.addThumb.call(this);
            const index = this.thumbs.length-1;
            this.thumbs[index].thumb.on('dblclick', null, () => {
                this.trigger('thumbdblclick', this);
            });
            this.thumbs[index].thumbcolor = this.thumbs[index].thumb.find('> canvas')[0];
            if(index>0) {
                this.setSizeThumb(this.thumbs[index].thumb, this.thumbs[index].thumbcolor);
                this.thumbs[index].context = this.thumbs[index].thumbcolor.getContext('2d');
                this.drawThumb(this.thumbs[index]);
                this.setColorValue(this.getColorValue(index - 1), index);
            }
            this.changeSliderStyle();
        },

        drawThumb: function (tmb)  {
            if(!tmb) return;
            const ctx = tmb.context;
            const borderWidth = (this.tmbOptions.border*this.scale + 0.5)>>0;
            const x1 = borderWidth / 2;
            let x2 = (((this.tmbOptions.width - this.tmbOptions.border/2)*this.scale + 0.5)>>0) - borderWidth / 2;
            const x3 = (((this.tmbOptions.width - this.tmbOptions.border)/2*this.scale + 0.5)>>0) + 0.5*borderWidth;
            const x4 = (((this.tmbOptions.width - this.tmbOptions.border/2)*this.scale - 0.5)>>0) + 0.5*borderWidth - x3;
            const y1 = ((this.tmbOptions.width/2*this.scale + 0.5)>>0) + borderWidth / 2;
            let y2 = ((this.tmbOptions.height*this.scale + 0.5)>>0) - borderWidth / 2;
            const y3 = ((this.scale + 0.5)>>0) + borderWidth / 2;
            x2 = (this.tmbOptions.width*this.scale >>0) - x2<=0 ? x2 - borderWidth : x2;
            y2 = (this.tmbOptions.height*this.scale >>0) - y2<=0 ? y2 - borderWidth : y2;
            this.tmbOptions.x2 = x2;
            this.tmbOptions.y2 = y2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1, y2);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x2, y1);
            ctx.lineTo(x3, y3);
            (x3 !== x4) && ctx.lineTo(x4, y3);
            ctx.lineTo(x1, y1);
            ctx.closePath();
            ctx.lineWidth = borderWidth;
            ctx.strokeStyle = (tmb.thumb.hasClass('active')) ? this.tmbOptions.borderColorActive : this.tmbOptions.borderColor;
            ctx.stroke();
        },

        thumbFill: function (ctx, color) {
            const borderWidth = (this.tmbOptions.border*this.scale + 0.5)>>0;
            const x1 = 2*borderWidth;
            const x2 = this.tmbOptions.x2 - 1.5*borderWidth;
            const x3 = (((this.tmbOptions.width - this.tmbOptions.border)/2*this.scale + 0.5)>>0) + 0.5*borderWidth;
            const x4 = (((this.tmbOptions.width - this.tmbOptions.border/2)*this.scale - 0.5)>>0) + 0.5*borderWidth - x3;
            const y1 = (((this.tmbOptions.width/2)*this.scale + 2 * borderWidth  + 0.5)>>0) ;
            const y2 = (this.tmbOptions.y2 - 1.5*borderWidth)>>0;
            const y3 = ((this.scale + 0.5 + 3*borderWidth)>>0) ;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1, y2);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x2, y1);
            ctx.lineTo(x3, y3>>0);
            (x3 !== x4) && ctx.lineTo(x4, y3>>0);
            ctx.lineTo(x1, y1);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
        },

        redrawThumb: function (tmb){
            if(!tmb)return;
            const ctx = tmb.context;
            ctx.clearRect(0,0,tmb.thumbcolor.width, tmb.thumbcolor.height);
            this.drawThumb(tmb);
            this.thumbFill(tmb.context, tmb.colorValue);
        },

        onActiveThumb: function (){
            this.redrawThumb(this.thumbs[this.tmbOptions.activeThumbIndex]);
            this.tmbOptions.activeThumbIndex = this.thumbs.filter((tmb)=> tmb.thumb.hasClass('active'))[0].index;
            this.redrawThumb(this.thumbs[this.tmbOptions.activeThumbIndex]);
        },

        setSizeThumb: function (tmb, canv){
            if(!tmb || !canv) return;
            tmb.css({ width: ((this.tmbOptions.width * this.scale)>>0) / this.scale, height: ((this.tmbOptions.height * this.scale) >> 0) / this.scale});
            canv.width = this.tmbOptions.width * this.scale;
            canv.height = this.tmbOptions.height * this.scale;
        },

        onResize: function(){
            if(!this.thumbs || this.thumbs.length===0) return;
            this.scale = Common.Utils.applicationPixelRatio() >= 1 ? Common.Utils.applicationPixelRatio() : 1;
            for (let i=0; i<this.thumbs.length; i++) {
                this.setSizeThumb(this.thumbs[i].thumb, this.thumbs[i].thumbcolor);
                !!this.thumbs[i].context && this.redrawThumb(this.thumbs[i]);
            }
        },

        changeColors: function () {
            if(Common.Utils.isIE) return;
            this.tmbOptions.borderColor = Common.UI.Themes.currentThemeColor('--border-regular-control');
            this.tmbOptions.borderColorActive = Common.UI.Themes.currentThemeColor('--border-control-focus');
            for(let i=0; i< this.thumbs.length; i++){
                !!this.thumbs[i].context && this.redrawThumb(this.thumbs[i]);
                this.tmbOptions.activeThumb = this.thumbs[i];
            }
        },

        addNewThumb: function(index, pos, curIndex) {
            const indexLeftThumb = this.findLeftThumb(pos);
            let index = index;
            let color;
            if (!_.isUndefined(curIndex)) {
                this.addThumb();
                index = this.thumbs.length - 1;
                color = this.calculationNewColor(this.thumbs[indexLeftThumb].colorValue, this.thumbs[indexLeftThumb === index - 1 ? indexLeftThumb : indexLeftThumb + 1].colorValue);
                this.setThumbPosition(index, pos);
                const value = pos/this.delta + this.minValue;
                this.thumbs[index].value = value;
            } else {
                const ratio = (pos - this.thumbs[indexLeftThumb].value) * 100 / (this.thumbs[indexLeftThumb + 1].value - this.thumbs[indexLeftThumb].value);
                color = ratio < 0 ? this.thumbs[indexLeftThumb].colorValue : this.calculationNewColor(this.thumbs[indexLeftThumb].colorValue, this.thumbs[indexLeftThumb === index - 1 ? indexLeftThumb : indexLeftThumb + 1].colorValue, ratio);
            }
            this.thumbs[index].thumbcolor = this.thumbs[index].thumb.find('> canvas')[0];
            if(index>0) {
                this.setSizeThumb(this.thumbs[index].thumb, this.thumbs[index].thumbcolor);
                this.thumbs[index].context = this.thumbs[index].thumbcolor.getContext('2d');
                this.drawThumb(this.thumbs[index]);
                this.setColorValue(`#${color}`, index);
            }
            this.sortThumbs();
            this.changeSliderStyle();
            this.changeGradientStyle();

            return color;
        },

        removeThumb: function(index) {
            if (index===undefined) index = this.thumbs.length-1;
            if (this.thumbs.length > 2) {
                this.thumbs[index].thumb.remove();
                this.thumbs.splice(index, 1);
                this.sortThumbs();
                this.changeSliderStyle();
            }
        },

        changeSliderStyle: function() {
            this.styleStr = {
                specific: '',
                common: 'linear-gradient(to right'
            };

            if (Common.Utils.isChrome && Common.Utils.chromeVersion<10 || Common.Utils.isSafari && Common.Utils.safariVersion<5.1)
                this.styleStr.specific = '-webkit-gradient(linear, left top, right top';  /* Chrome,Safari4+ */
            else if (Common.Utils.isChrome || Common.Utils.isSafari)
                this.styleStr.specific = '-webkit-linear-gradient(left';
            else if (Common.Utils.isGecko)
                this.styleStr.specific = '-moz-linear-gradient(left';
            else if (Common.Utils.isOpera && Common.Utils.operaVersion>11.0)
                this.styleStr.specific = '-o-linear-gradient(left';
            else if (Common.Utils.isIE)
                this.styleStr.specific = '-ms-linear-gradient(left';

            for (let i=0; i<this.thumbs.length; i++) {
                this.styleStr.common += `, {${i}} {${this.thumbs.length + i}}%`;
                if (Common.Utils.isChrome && Common.Utils.chromeVersion<10 || Common.Utils.isSafari && Common.Utils.safariVersion<5.1)
                    this.styleStr.specific += `, color-stop({${this.thumbs.length + i}}%,{${i}})`;
                else
                    this.styleStr.specific += `, {${i}} {${this.thumbs.length + i}}%`;

            }
            this.styleStr.specific += ')';
            this.styleStr.common += ')';
        }
    });
});
