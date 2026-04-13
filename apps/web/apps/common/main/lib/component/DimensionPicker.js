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
 *  DimensionPicker.js
 *
 *  Created on 1/29/14
 *
 */

if (Common === undefined)
    const Common = {};

define([
    'common/main/lib/component/BaseView'
], () => {

    Common.UI.DimensionPicker = Common.UI.BaseView.extend((()=> ({
            options: {
                itemSize    : 20,
                minRows     : 5,
                minColumns  : 5,
                maxRows     : 20,
                maxColumns  : 20,
                width       : 100,
                height       : 400,
                scale       : Common.Utils.applicationPixelRatio(),
                direction   : undefined // 'left', 'right'
            },

            template:_.template([
                '<div style="width: 100%; height: 100%;">',
                    '<div dir="ltr" class="dimension-picker-status">0x0</div>',
                    '<div class="dimension-picker-observecontainer">',
                        '<div class="dimension-picker-mousecatcher"></div>',
                        '<div class="dimension-picker-unhighlighted">' +
                            '<canvas id="dimension-picker--canvas" data-maxlength="<%=scope.maxColumns%>"  width ="<%=scope.maxColumns * scope.itemSize * scope.scale%>" height="<%=scope.maxRows * scope.itemSize * scope.scale%>" style="left: 0; top: 0; width: 100%; height: 100%;">' +
                        '</div>',
                    '</div>',
                '</div>'
            ].join('')),

            initialize : function(options) {
                Common.UI.BaseView.prototype.initialize.call(this, options);

                this.render();

                this.cmpEl = this.$el || $(this.el);
                this.options.width = this.options.itemSize* this.options.minColumns;
                this.options.height = this.options.itemSize* this.options.minRows;
                const rootEl = this.cmpEl;

                this.borderColor = Common.Utils.isIE ?'#000000' :Common.UI.Themes.currentThemeColor('--canvas-high-contrast');
                this.fillColor = Common.Utils.isIE ?'#fff' :Common.UI.Themes.currentThemeColor('--background-normal');
                this.borderColorHighlighted = Common.Utils.isIE ?'#bababa' :Common.UI.Themes.currentThemeColor('--border-preview-hover');
                this.fillColorHighlighted = Common.Utils.isIE ?'#446995' :Common.UI.Themes.currentThemeColor('--background-accent-button');

                this.itemSize    = this.options.itemSize;
                this.minRows     = this.options.minRows;
                this.minColumns  = this.options.minColumns;
                this.maxRows     = this.options.maxRows;
                this.maxColumns  = this.options.maxColumns;
                this.scale       = this.options.scale >= 1 ? this.options.scale : 1;
                this.width       = ((this.options.width * this.scale) >> 0) / this.scale;
                this.height      = ((this.options.height * this.scale) >> 0) / this.scale;
                this.borderSize  = 1;
                this.direction   = this.options.direction;
                if (Common.UI.isRTL() && !this.direction) {
                    this.direction = 'right';
                }

                this.curColumns = 0;
                this.curRows = 0;

                const onMouseMove = (event)=> {
                    let offsetX;
                    if (this.direction === 'right' && this.areaMouseCatcher) {
                        const width = this.areaMouseCatcher.width();
                        offsetX = event.offsetX === undefined ? (width - event.originalEvent.layerX) : (width - event.offsetX)*Common.Utils.zoom();
                    } else {
                        offsetX = event.offsetX === undefined ? event.originalEvent.layerX : event.offsetX*Common.Utils.zoom();
                    }
                    this.setTableSize(
                        Math.ceil(offsetX / this.itemSize),
                        Math.ceil((event.offsetY === undefined ? event.originalEvent.layerY : event.offsetY*Common.Utils.zoom()) / this.itemSize),
                        event
                    );
                };

                const onMouseLeave = (event)=> {
                    if (!options.customClear && event.relatedTarget !== null) {
                        this.setTableSize(0, 0, event);
                    }
                };

                const onHighLightedMouseClick = (e)=> {
                    this.trigger('select', this, this.curColumns, this.curRows, e);
                };

                if (rootEl){
                    this.areaMouseCatcher    = rootEl.find('.dimension-picker-mousecatcher');
                    this.areaUnHighLighted   = rootEl.find('.dimension-picker-unhighlighted');
                    this.areaStatus          = rootEl.find('.dimension-picker-status');
                    this.canv = rootEl.find('#dimension-picker--canvas')[0];
                    this.context = this.canv.getContext('2d');

                    rootEl.css({width: `${this.minColumns}em`});
                    this.areaMouseCatcher.css('z-index', 1);
                    this.areaMouseCatcher.width(`${this.maxColumns}em`).height(`${this.maxRows}em`);
                    this.areaMouseCatcher.on('mousemove', onMouseMove);
                    this.areaMouseCatcher.on('click', onHighLightedMouseClick);
                    this.areaMouseCatcher.on('mouseleave', onMouseLeave);
                    this.areaStatus.html(!Common.UI.isRTL() ? `${this.curColumns} x ${this.curRows}` : `${this.curRows} x ${this.curColumns}`);
                    this.resizeCanvas();
                    $(window).resize(_.bind(this.resizeCanvas,this));
                    (!Common.Utils.isIE) && Common.NotificationCenter.on('uitheme:changed', this.changeColors.bind(this));


                    if (this.direction === 'right') {
                        this.areaUnHighLighted.css({left: 'auto', right: '0'});
                    }
                }
            },

            render: function() {
                (this.$el || $(this.el)).html(this.template({
                    scope: this.options
                }));
                return this;
            },


            changeColors: function (){
                this.borderColor = Common.UI.Themes.currentThemeColor('--canvas-high-contrast');
                this.fillColor = Common.UI.Themes.currentThemeColor('--background-normal');
                this.borderColorHighlighted = Common.UI.Themes.currentThemeColor('--border-preview-hover');
                this.fillColorHighlighted = Common.UI.Themes.currentThemeColor('--background-accent-button');

                this.context.clearRect(0,0, this.width*this.scale, this.height*this.scale);
                this.drawTable(this.minColumns,this.minRows,this.fillColor,this.borderColor);
            },

            resizeCanvas: function (){
                (this.context) && this.context.clearRect(0,0, this.width*this.scale, this.height*this.scale);
                this.scale = Common.Utils.applicationPixelRatio();
                this.scale = this.scale>=1 ? this.scale : 1;
                this.width = ((this.options.width * this.scale)>>0) / this.scale;
                this.height = ((this.options.height * this.scale) >> 0) / this.scale;
                this.areaUnHighLighted.css({'width': this.width, 'height': this.height});
                this.canv.width = this.width * this.scale;
                this.canv.height = this.height * this.scale;
                this.drawTable(this.minColumns,this.minRows,this.fillColor, this.borderColor);
                 this.cmpEl.width(this.areaUnHighLighted.width());
                this.areaStatus.width(this.areaUnHighLighted.width());
            },

            drawTable: function (maxCol, maxRow,fillColor, borderColor) {
                const startCol =!Common.UI.isRTL() ? 0 :  this.areaUnHighLighted.width()/this.itemSize-1;
                const delCol=!Common.UI.isRTL() ? 1 : -1;

                for (let row = 0; row < maxRow; row++){
                    for (let col = startCol; !Common.UI.isRTL()?col < maxCol:col>startCol-maxCol; col += delCol){
                        this.drawCell(col,row, fillColor, borderColor);
                    }
                }
            },

            drawCell: function (column, row, fillColor,borderColor){
                const x1 = (((this.itemSize*column+1)*this.scale+0.5)>>0) + this.borderSize/2;
                const x2 = (((this.itemSize*(column+1)-1)*this.scale+0.5)>>0) - this.borderSize/2;
                const y1 = (((this.itemSize*row+1)*this.scale+0.5)>>0) + this.borderSize/2;
                const y2 = (((this.itemSize*(row+1)-1)*this.scale+0.5)>>0) - this.borderSize/2;

                this.context.beginPath();
                this.context.moveTo(x1,y1);
                this.context.lineTo(x2,y1);
                this.context.lineTo(x2,y2);
                this.context.lineTo(x1,y2);
                this.context.closePath();
                this.context.strokeStyle = borderColor;
                this.context.stroke();
                this.context.fillStyle= fillColor;
                this.context.fill();

            },

            setTableSize: function(columns, rows, event){
                if (columns > this.maxColumns)  columns = this.maxColumns;
                if (rows > this.maxRows)        rows = this.maxRows;

                if (this.curColumns !== columns || this.curRows !== rows){
                    const delCol = columns - this.curColumns;
                    const delRow = rows - this.curRows;
                    this.curColumns  = columns;
                    this.curRows     = rows;

                    const _cols =(this.curColumns < this.minColumns)
                        ? this.minColumns
                        : ((this.curColumns + 1 > this.maxColumns)
                            ? this.maxColumns
                            : this.curColumns + 1);
                    const _rows =(this.curRows < this.minRows)
                            ? this.minRows
                            : ((this.curRows + 1 > this.maxRows)
                                ? this.maxRows
                                : this.curRows + 1);
                    const width = ((_cols*this.itemSize* this.scale )>>0) /this.scale ;
                    const height = ((_rows*this.itemSize * this.scale) >> 0)/ this.scale;

                    if(this.areaUnHighLighted.width() !== width || this.areaUnHighLighted.height() !== height) {
                        this.drawTable(this.curColumns, this.curRows, this.fillColorHighlighted, this.fillColorHighlighted);
                        if(width < this.areaUnHighLighted.width()){
                            this.context.clearRect(!Common.UI.isRTL() ? width : 0, 0, this.areaUnHighLighted.width() - width, this.areaUnHighLighted.height());
                        }
                        if(height < this.areaUnHighLighted.height()) {
                            this.context.clearRect(0, height, this.areaUnHighLighted.width(), this.areaUnHighLighted.height()-height);
                        }
                        this.areaUnHighLighted.css({'width': width, 'height': height});
                        this.canv.width = width * this.scale;
                        this.canv.height = height * this.scale;
                    }

                    this.drawTable(_cols,_rows,this.fillColor, this.borderColor);
                    const startCol= !Common.UI.isRTL() ? this.curColumns+1 : _cols - this.curColumns;
                    const decC=!Common.UI.isRTL()?1:-1;
                    if(delCol < 0 ){
                        for(let col = startCol; !Common.UI.isRTL() ? col < this.curColumns+delCol: col > this.curColumns-delCol; col += decC) {
                            for(let row = 0;  row < _rows; row++) {
                                this.drawCell(col, row, this.fillColor, this.borderColor);
                            }
                        }
                    }
                    if(delRow < 0) {
                        for(let  col = startCol; !Common.UI.isRTL() ? col < _cols : col>0 ; col += decC) {
                            for(let row = 0;  row < this.curRows+delRow; row++) {
                                this.drawCell(col, row, this.fillColor, this.borderColor);
                            }
                        }
                    }



                    this.drawTable(this.curColumns, this.curRows, this.fillColorHighlighted, this.borderColorHighlighted);

                    this.cmpEl.width(this.areaUnHighLighted.width());
                    this.areaStatus.html(!Common.UI.isRTL() ? `${this.curColumns} x ${this.curRows}` : `${this.curRows} x ${this.curColumns}`);
                    this.areaStatus.width(this.areaUnHighLighted.width());

                    this.trigger('change', this, this.curColumns, this.curRows, event);
                }
            },

            getColumnsCount: function() {
                return this.curColumns;
            },

            getRowsCount: function() {
                return this.curRows;
            }
        }))())
});
