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
 *  TableStyler.js
 *
 *  Created on 2/28/14
 *
 */

if (Common === undefined)
    const Common = {};

define([
], () => {
    Common.UI.CellBorder = function (options){

        let virtualBorderSize;
        let virtualBorderColor;
        let borderSize;
        let borderColor;
        let borderAlfa;

        this.overwriteStyle       = options.overwriteStyle !== undefined ? options.overwriteStyle : true;
        this.maxBorderSize        = options.maxBorderSize ? options.maxBorderSize : 8;
        this.defaultBorderSize    = options.defaultBorderSize !== undefined ? options.defaultBorderSize : 1;
        this.defaultBorderColor   = options.defaultBorderColor ? options.defaultBorderColor : '#ccc';
        this.col                  = options.col !== undefined ? options.col : -1;
        this.row                  = options.row !== undefined ? options.row : -1;
        this.cellPadding          = options.cellPadding !== undefined ? options.cellPadding : 10;
        this.tablePadding         = options.tablePadding !== undefined ? options.tablePadding : 10;
        this.X1                   = options.x1 !== undefined ? options.x1 : 0;
        this.Y1                   = options.y1 !== undefined ? options.y1 : 0;
        this.X2                   = options.x2 !== undefined ? options.x2 : 0;
        this.Y2                   = options.y2 !== undefined ? options.y2 : 0;
        this.numInCell            = options.numInCell !== undefined ? options.numInCell : -1;
        this.scale                = options.scale !== undefined ? options.scale : 2;
        this.rows                 = options.rows !== undefined ? options.rows : 2;
        this.columns              = options.columns !== undefined ? options.columns : 2;
        this.context              = options.context;

        virtualBorderSize       = this.defaultBorderSize;
        virtualBorderColor      = new Common.Utils.RGBColor(this.defaultBorderColor);
        borderSize = virtualBorderSize;
        borderColor = virtualBorderColor;
        borderAlfa = 1;

        this.setBordersSize = function (size) {
            borderSize = (size > this.maxBorderSize) ? this.maxBorderSize : size;
            borderAlfa = (size < 1) ? 0.3 : 1;
        };

        this.setBordersColor = ( color) => {
            let newColor = color;
            if(typeof(color) === "string")
                newColor = new Common.Utils.RGBColor(color);
            borderColor = newColor;
        };

        this.getBorderSize = () => borderSize;

        this.getBorderColor = () => borderColor.toHex();

        this.setVirtualBorderSize = function(size) {
            virtualBorderSize = (size > this.maxBorderSize) ? this.maxBorderSize : size;
        };

        this.setVirtualBorderColor = (color)=> {
            virtualBorderColor = color;
        };

        this.getVirtualBorderSize = () => virtualBorderSize;

        this.getVirtualBorderColor = () => virtualBorderColor.toHex();

        this.scaleBorderSize = (size)=> (size*this.scale + 0.5)>>0;

        this.getLine = ()=> {
            let size = this.scaleBorderSize(borderSize);
            if(this.numInCell < 0) {
                if (this.Y1 === this.Y2)
                    return {
                        X1: this.X1 >> 0,
                        Y1: ((this.Y1 + size / 2) >> 0) - size / 2,
                        X2: (this.X2) >> 0,
                        Y2: ((this.Y2 + size / 2) >> 0) - size / 2
                    };
                
                    return {
                        X1: ((this.X1 + size / 2) >> 0) - size / 2,
                        Y1: this.Y1 >> 0,
                        X2: ((this.X2 + size / 2) >> 0) - size / 2,
                        Y2: this.Y2 >> 0
                    };
            }
            
                const lines = [];
                let step;
                const cellPadding = this.cellPadding * this.scale;
                size *= (this.numInCell === 0)? 1 : -1;

                if (this.Y1 === this.Y2){
                    step = (this.X2 - this.X1)/this.columns;
                    for(let col = 0; col < this.columns; col++ ){
                        lines.push({
                            X1: (this.X1 + col * step + ((col > 0) | 0) * cellPadding/2) >> 0,
                            Y1: (this.Y1 >> 0) + size / 2,
                            X2: (this.X1 + (col + 1) * step - ((col < this.columns - 1) | 0) * cellPadding/2) >> 0,
                            Y2: (this.Y1 >> 0) + size / 2
                        });
                    }
                }
                else {
                    step = (this.Y2 - this.Y1)/this.rows;
                    for(let row = 0; row < this.rows; row++ ) {
                        lines.push({
                            X1: (this.X1 >> 0) + size / 2,
                            Y1: (this.Y1 + row * step + ((row >0) | 0) * cellPadding/2) >> 0,
                            X2: (this.X1 >> 0) + size / 2,
                            Y2: (this.Y1 + (row + 1) * step - ((row < this.rows - 1) | 0) * cellPadding/2) >> 0
                        });
                    }
                }
                return lines;
        };

        this.inRect = (MX, MY)=> {
            const h = this.scale * this.tablePadding/2;
            const line =  this.getLine();
            const mxScale = MX*this.scale;
            const myScale = MY*this.scale;
            if(this.numInCell < 0) {

                if (line.Y1 === line.Y2)
                    return ((mxScale > line.X1 && mxScale < line.X2) && (myScale > line.Y1 - h && myScale < line.Y1 + h));
                
                    return ((myScale > line.Y1 && myScale < line.Y2) && (mxScale > line.X1 - h && mxScale < line.X1 + h));
            }
            
                if (this.Y1 === this.Y2) {
                    for(let i = 0; i < line.length; i++) {
                        if ((mxScale > line[i].X1 && mxScale < line[i].X2) && (myScale > line[i].Y1 - h && myScale < line[i].Y1 + h))
                            return true;
                    }
                }
                else {
                    for(let i = 0; i < line.length; i++) {
                        if((myScale > line[i].Y1 && myScale < line[i].Y2) && (mxScale > line[i].X1 - h && mxScale < line[i].X1 + h))
                            return  true;
                    }
                }
                return  false;
        };

        this.drawBorder = ()=> {
            if(borderSize === 0) return;
            const line =  this.getLine();
            this.context.beginPath();
            this.context.globalAlpha = borderAlfa;
            this.context.lineWidth = this.scaleBorderSize(borderSize);
            this.context.strokeStyle = this.getBorderColor();
            if(this.numInCell < 0) {
                this.context.moveTo(line.X1, line.Y1);
                this.context.lineTo(line.X2, line.Y2);
            } else {
                _.each(line, (ln)=> {
                    this.context.moveTo(ln.X1, ln.Y1);
                    this.context.lineTo(ln.X2, ln.Y2);
                });
            }
            this.context.stroke();
            this.context.globalAlpha = 1;
        };

        this.setBorderParams = ()=> {
            if(borderSize === virtualBorderSize &&  virtualBorderColor.isEqual(borderColor) && this.overwriteStyle){
                this.setBordersSize(0);
                return;
            }
            this.setBordersSize(virtualBorderSize);
            this.setBordersColor(virtualBorderColor);
        };

    }

    Common.UI.TableStyler = Common.UI.BaseView.extend({
        options : {
            width               : 200,
            height              : 200,
            sizeCorner          : 10,
            scale               : 2,
            row                 :-1,
            col                 :-1,
            rows                : 2,
            columns             : 2,
            cellPadding         : 10,
            tablePadding        : 10,
            overwriteStyle      : true,
            maxBorderSize       : 8,
            spacingMode         : false,
            defaultBorderSize   : 1,
            defaultBorderColor  : '#ccc'
        },

        template: _.template([
            '<div id="<%=scope.id%>" class="table-styler" style="position: relative; width: <%=scope.width%>px; height:<%=scope.height%>px;">',
            '<canvas id="<%=scope.id%>-table-canvas"  width ="<%=scope.width * scope.scale%>" height="<%=scope.height * scope.scale%>" style="left: 0; top: 0; width: 100%; height: 100%;">',
            '</canvas>',
            '</div>'
        ].join('')),

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);
            let virtualBorderSize;
            let virtualBorderColor;
            this.id                   = this.options.id || Common.UI.getId();
            this.scale                = Common.Utils.applicationPixelRatio();
            this.scale                = this.scale >= 1 ? this.scale : 1;
            this.width                = ((this.options.width * this.scale) >> 0) / this.scale;
            this.height               = ((this.options.height * this.scale) >> 0) / this.scale;
            this.rows                 = this.options.rows;
            this.columns              = this.options.columns;
            this.cellPadding          = this.options.cellPadding;
            this.tablePadding         = this.options.tablePadding;
            this.overwriteStyle       = this.options.overwriteStyle;
            this.maxBorderSize        = this.options.maxBorderSize;
            this.spacingMode          = this.options.spacingMode;
            this.twoModes             = this.options.twoModes;
            this.defaultBorderSize    = this.options.defaultBorderSize;
            this.defaultBorderColor   = this.options.defaultBorderColor;
            this.sizeCorner           = this.options.sizeCorner;
            this.backgroundColor      = 'transparent';
            this.backgroundCellColor  = 'transparent';

            virtualBorderSize       = (this.defaultBorderSize > this.maxBorderSize) ? this.maxBorderSize : this.defaultBorderSize;
            virtualBorderColor      = new Common.Utils.RGBColor(this.defaultBorderColor);

            const borderSize = {
                top     : virtualBorderSize,
                right   : virtualBorderSize,
                bottom  : virtualBorderSize,
                left    : virtualBorderSize
            };

            const borderColor = {
                top     : virtualBorderColor,
                right   : virtualBorderColor,
                bottom  : virtualBorderColor,
                left    : virtualBorderColor
            };

            this.rendered             = false;

            this.on('render:after', (cmp) => {

                this.canv.addEventListener('click', (e) => {
                    let mouseX;
                    let mouseY;

                    if (e.offsetX !== undefined) {
                        mouseX = Number.parseInt(e.offsetX * Common.Utils.zoom());
                        mouseY = Number.parseInt(e.offsetY * Common.Utils.zoom());
                    } else if (e.layerX) {
                        mouseX = e.layerX;
                        mouseY = e.layerY;
                    }
                    let redraw = false;

                    if (this.inRect('t', mouseX, mouseY)) {
                        this.setBorderParams('t');
                        redraw = true;
                        this.fireEvent('borderclick', this, 't',  borderSize.top, borderColor.top.toHex());
                    }
                    else if (this.inRect('b', mouseX, mouseY)) {
                        this.setBorderParams('b');
                        redraw = true;
                        this.fireEvent('borderclick', this, 'b',  borderSize.bottom, borderColor.bottom.toHex());
                    }
                    else if (this.inRect('l', mouseX, mouseY)) {
                        this.setBorderParams('l');
                        redraw = true;
                        this.fireEvent('borderclick', this, 'l',  borderSize.left, borderColor.left.toHex());
                    }
                    else if (this.inRect('r', mouseX, mouseY)) {
                        this.setBorderParams('r');
                        redraw = true;
                        this.fireEvent('borderclick', this, 'r',  borderSize.right, borderColor.right.toHex());
                    }
                    else {
                        for (let i = 0; i < this._cellBorders.length; i++) {
                            if (this._cellBorders[i].inRect(mouseX, mouseY)) {
                                redraw = true;
                                this._cellBorders[i].setBorderParams();
                                this.fireEvent('borderclick:cellborder', this, this._cellBorders[i],  this._cellBorders[i].getBorderSize(), this._cellBorders[i].getBorderColor());

                                if(this.spacingMode) {
                                    let secondBorder = undefined;
                                    if(this._cellBorders[i].col > 0 && this._cellBorders[i].numInCell === 0)
                                        secondBorder = this.getCellBorder(-1, this._cellBorders[i].col - 1, 1);
                                    else if(this._cellBorders[i].row > 0 && this._cellBorders[i].numInCell === 0)
                                        secondBorder = this.getCellBorder(this._cellBorders[i].row - 1, -1,  1);
                                    else if(this._cellBorders[i].col > -1 && this._cellBorders[i].col < this.columns - 1 && this._cellBorders[i].numInCell === 1)
                                        secondBorder = this.getCellBorder(-1, this._cellBorders[i].col + 1,  0);
                                    else if(this._cellBorders[i].row > -1 && this._cellBorders[i].row < this.rows - 1 && this._cellBorders[i].numInCell === 1)
                                        secondBorder = this.getCellBorder(this._cellBorders[i].row + 1, -1,  0);

                                    (secondBorder) && secondBorder.setBorderParams();
                                }

                                break;
                            }
                        }
                    }
                    (redraw) && this.redrawTable();
                });

                $(window).resize(this.resizeTable);
            });

            this.resizeTable = ()=> {
                this.context.clearRect(0,0, this.width*this.scale, this.height*this.scale);
                this.scale = Common.Utils.applicationPixelRatio();
                this.scale = this.scale>=1 ? this.scale : 1;
                this.width = ((this.options.width * this.scale)>>0) / this.scale;
                this.height = ((this.options.height * this.scale) >> 0) / this.scale;
                this.cmpEl.css({'width': this.width, 'height': this.height});
                this.cmpEl.parent().css({'width': this.width, 'height': this.height});

                this._cellBorders.forEach((b)=> {
                    b.scale = this.scale;
                });

                let i;
                let sizeCorner = this.sizeCorner * this.scale;
                const ctxWidth = this.width*this.scale;
                const ctxHeight = this.height*this.scale;
                let stepX = (ctxWidth - 2 * sizeCorner)/this.columns;
                let stepY = (ctxHeight - 2 * sizeCorner)/this.rows;

                if(!this.spacingMode) {
                    i = 0;
                    for (let row = 0; row < this.rows - 1; row++) {
                        this._cellBorders[i].Y1 = (row + 1) * stepY + sizeCorner;
                        this._cellBorders[i].Y2 = this._cellBorders[i].Y1;
                        this._cellBorders[i].X1 = sizeCorner;
                        this._cellBorders[i].X2 = ctxWidth - sizeCorner;
                        i++
                    }

                    for (let col = 0; col < this.columns - 1; col++) {
                        this._cellBorders[i].Y1 = sizeCorner;
                        this._cellBorders[i].Y2 = ctxHeight - sizeCorner;
                        this._cellBorders[i].X1 = (col + 1) * stepX + sizeCorner;
                        this._cellBorders[i].X2 = this._cellBorders[i].X1;
                        i++
                    }
                }
                else {
                    const cellPadding = this.cellPadding * this.scale;
                    sizeCorner += cellPadding;
                    stepX = (ctxWidth - 2 * sizeCorner) / this.columns;
                    stepY = (ctxHeight - 2 * sizeCorner) / this.rows;
                    i = 0;

                    for (let col = 0; col < this.columns; col++) {
                        for(let n = 0; n< 2; n++) {
                            this._cellBorders[i].Y1 = sizeCorner;
                            this._cellBorders[i].Y2 = ctxHeight - sizeCorner;
                            this._cellBorders[i].X1 = (n === 0) ?
                                (col) * (stepX + cellPadding / 2) + sizeCorner:
                                this.width * this.scale - sizeCorner - (this.columns - col - 1) * (stepX + cellPadding / 2);
                            this._cellBorders[i].X2 = this._cellBorders[i].X1;
                            i++
                        }
                    }

                    for (let row = 0; row < this.rows; row++) {
                        for(let n = 0; n< 2; n++) {
                            this._cellBorders[i].Y1 = (n === 0) ?
                                (row) * (stepY + cellPadding / 2) + sizeCorner:
                                this.height * this.scale - sizeCorner - (this.rows - row - 1) * (stepY + cellPadding / 2);
                            this._cellBorders[i].Y2 = this._cellBorders[i].Y1;
                            this._cellBorders[i].X1 = sizeCorner;
                            this._cellBorders[i].X2 = ctxWidth - sizeCorner;
                            i++;
                        }
                    }
                }

                this.canv.width = this.width * this.scale;
                this.canv.height = this.height * this.scale;
                this.drawTable();
            };

            this.getVirtualBorderSize = ()=> virtualBorderSize;

            this.getVirtualBorderColor = ()=> virtualBorderColor.toHex();

            this.setVirtualBorderSize = (size)=> {
                virtualBorderSize = (size > this.maxBorderSize) ? this.maxBorderSize : size;

                for(let i =0; i < this._cellBorders.length; i++){
                    this._cellBorders[i].setVirtualBorderSize(size);
                }
            };

            this.setVirtualBorderColor = (color)=> {
                const newColor = new Common.Utils.RGBColor(color);

                if (virtualBorderColor.isEqual(newColor))
                    return;

                virtualBorderColor = newColor;

                for(let i =0; i < this._cellBorders.length; i++){
                    this._cellBorders[i].setVirtualBorderColor(newColor);
                }
            };

            this.setBordersSize = (borders, size)=> {
                size = (size > this.maxBorderSize) ? this.maxBorderSize : size;
                if (borders.indexOf('t') > -1) {
                    borderSize.top = size;
                }
                if (borders.indexOf('r') > -1) {
                    borderSize.right = size;
                }
                if (borders.indexOf('b') > -1) {
                    borderSize.bottom = size;
                }
                if (borders.indexOf('l') > -1) {
                    borderSize.left = size;
                }
            };

            this.scaleBorderSize = (size)=> (size*this.scale +0.5)>>0;

            this.setBordersColor = (borders, color)=> {
                const newColor = new Common.Utils.RGBColor(color);

                if (borders.indexOf('t') > -1)
                    borderColor.top = newColor;
                if (borders.indexOf('r') > -1)
                    borderColor.right = newColor;
                if (borders.indexOf('b') > -1)
                    borderColor.bottom = newColor;
                if (borders.indexOf('l') > -1)
                    borderColor.left = newColor;

            };

            this.getBorderSize = (border)=> {
                switch(border){
                    case 't':
                        return borderSize.top;
                    case 'r':
                        return borderSize.right;
                    case 'b':
                        return borderSize.bottom;
                    case 'l':
                        return borderSize.left;
                }
                return null;
            };

            this.getBorderColor = (border)=> {
                switch(border){
                    case 't':
                        return borderColor.top.toHex();
                    case 'r':
                        return borderColor.right.toHex();
                    case 'b':
                        return borderColor.bottom.toHex();
                    case 'l':
                        return borderColor.left.toHex();
                }
                return null;
            };

            this.getBorderAlpha = (border) => this.getBorderSize(border)<1 ? 0.2 : 1;

            this.setBorderParams = (border) => {
                const color = new Common.Utils.RGBColor(this.getBorderColor(border));
                const size = this.getBorderSize(border);
                if(size === virtualBorderSize && virtualBorderColor.isEqual(color) && this.overwriteStyle) {
                    this.setBordersSize(border,0);
                    return;
                }
                this.setBordersSize(border, this.getVirtualBorderSize());
                this.setBordersColor(border,this.getVirtualBorderColor());
            };

            this.getLine =(size, border )=> {
                const sizeCornerScale = this.sizeCorner * this.scale ;
                const borderWidth = this.scaleBorderSize(size);
                const linePoints={};
                const canvWidth = this.width * this.scale;
                const canvHeight =this.height * this.scale;
                switch (border){
                    case 't':
                        linePoints.X1 = sizeCornerScale >>0;
                        linePoints.Y1 = (sizeCornerScale>>0) + borderWidth / 2;
                        linePoints.X2 = (canvWidth - sizeCornerScale)>>0;
                        linePoints.Y2 = linePoints.Y1;
                        break;
                    case 'b':
                        linePoints.X1 = sizeCornerScale>>0;
                        linePoints.Y1 = ((canvHeight - sizeCornerScale)>>0) - borderWidth / 2;
                        linePoints.X2 = (canvWidth - sizeCornerScale)>>0;
                        linePoints.Y2 = linePoints.Y1;
                        break;
                    case 'l':
                        linePoints.X1 = (sizeCornerScale>>0) + borderWidth / 2;
                        linePoints.Y1 = sizeCornerScale>>0;
                        linePoints.X2 = linePoints.X1;
                        linePoints.Y2 = (canvHeight - sizeCornerScale)>>0;
                        break;
                    case 'r':
                        linePoints.X1 = ((canvWidth - sizeCornerScale)>>0) - borderWidth / 2;
                        linePoints.Y1 = sizeCornerScale>>0;
                        linePoints.X2 = linePoints.X1;
                        linePoints.Y2 = (canvHeight - sizeCornerScale)>>0;
                        break;
                }
                return linePoints;
            };

            this.inRect= (border, MX, MY) => {
                const h = this.tablePadding/2;
                const sizeBorder = this.getBorderSize(border);
                let line = this.getLine(sizeBorder, border);

                line = {X1: line.X1/this.scale, Y1: line.Y1/this.scale, X2: line.X2/this.scale, Y2: line.Y2/this.scale};

                if (line.Y1 === line.Y2)
                    return ((MX > line.X1 && MX < line.X2) && (MY > line.Y1 - h && MY < line.Y1 + h));
                
                    return((MY > line.Y1 && MY < line.Y2) && (MX > line.X1 - h && MX < line.X1 + h));
            };

            this.setTableColor = (color) => {
                this.backgroundColor = (color === 'transparent' ) ? color : (`#${color}`);
            };

            this.setCellsColor = (color) => {
                this.backgroundCellColor = (color === 'transparent' ) ? color : (`#${color}`);
            };

            if (this.options.el) {
                this.render(null, {
                    borderSize: borderSize,
                    borderColor: borderColor,
                    virtualBorderSize: virtualBorderSize,
                    virtualBorderColor: virtualBorderColor
                });
            }
        },

        render : function(parentEl) {
            const cfg = arguments[1];

            this.trigger('render:before', this);

            if (!this.rendered) {
                this.cmpEl = $(this.template(_.extend({
                    scope: this
                }, cfg)));

                if (parentEl) {
                    this.setElement(parentEl, false);
                    this.setElement(parentEl, false);
                    parentEl.html(this.cmpEl);
                }
                else
                    $(this.el).html(this.cmpEl);

                this.cmpEl.parent().css({'width': this.width, 'height': this.height});
            }
            else
                this.cmpEl = $(this.el);

            this.canv = $(`#${this.id}-table-canvas`)[0];
            this.context = this.canv.getContext('2d');

            let sizeCorner = this.sizeCorner * this.scale
            sizeCorner += (this.spacingMode) ? this.cellPadding * this.scale : 0;
            if (!this.rendered) {
                this._cellBorders = [];
                const generalOpt = {
                    scale           : this.scale,
                    context         : this.context,
                    cellPadding     : this.cellPadding,
                    tablePadding    : this.tablePadding,
                    rows            : this.rows,
                    columns         : this.columns
                };

                (!this.spacingMode) && this.createHorizontalBorders(generalOpt, sizeCorner);
                this.createVerticaLBorders(generalOpt, sizeCorner);
                (this.spacingMode) && this.createHorizontalBorders(generalOpt, sizeCorner);

                this.drawTable();
            }

            this.rendered = true;

            this.trigger('render:after', this);
            return this;
        },

        createHorizontalBorders: function (generalOpt, sizeCorner){
            const opt = generalOpt;
            const ctxWidth = this.width * this.scale;
            const stepY = (this.height * this.scale - 2 * sizeCorner) / this.rows;
            const cellPadding = this.cellPadding*this.scale;
            if(!this.spacingMode) {
                for (let row = 0; row < this.rows - 1; row++) {
                    opt.y1 = (row + 1) * stepY + sizeCorner;
                    opt.y2 = opt.y1;
                    opt.x1 = sizeCorner;
                    opt.x2 = ctxWidth - sizeCorner;
                    opt.row = row;
                    opt.col = -1;
                    this._cellBorders.push(new Common.UI.CellBorder(opt));
                }
            } else {
                for (let row = 0; row < this.rows; row++) {
                    for (let n = 0; n < 2; n++) {
                        opt.numInCell = n;
                        opt.y1 = (n === 0) ?
                            (row) * (stepY + cellPadding / 2) + sizeCorner :
                            this.height*this.scale - sizeCorner - (this.rows - row - 1) * (stepY + cellPadding / 2);
                        opt.y2 = opt.y1;
                        opt.x1 = sizeCorner;
                        opt.x2 = ctxWidth - sizeCorner;
                        opt.row = row;
                        opt.col = -1;
                        this._cellBorders.push(new Common.UI.CellBorder(opt));
                    }
                }
            }
        },

        createVerticaLBorders: function (generalOpt, sizeCorner){
            const opt = generalOpt;
            const ctxHeight = this.height * this.scale;
            const stepX = (this.width * this.scale - 2 * sizeCorner) / this.columns;
            const cellPadding = this.cellPadding*this.scale;
            if(!this.spacingMode) {
                for (let col = 0; col < this.columns - 1; col++) {
                    opt.y1 = sizeCorner;
                    opt.y2 = ctxHeight - sizeCorner;
                    opt.x1 = (col + 1) * stepX + sizeCorner;
                    opt.x2 = opt.x1;
                    opt.row = -1;
                    opt.col = col;
                    this._cellBorders.push(new Common.UI.CellBorder(opt));
                }
            }
            else {
                for (let col = 0; col < this.columns; col++) {
                    for (let n = 0; n < 2; n++) {
                        opt.numInCell = n;
                        opt.y1 = sizeCorner;
                        opt.y2 = ctxHeight - sizeCorner;
                        opt.x1 = (n === 0) ?
                            (col) * (stepX + cellPadding / 2) + sizeCorner :
                            this.width * this.scale - sizeCorner - (this.columns - col - 1) * (stepX + cellPadding / 2);
                        opt.x2 = opt.x1;
                        opt.col = col;
                        opt.row = -1;
                        this._cellBorders.push(new Common.UI.CellBorder(opt));
                    }
                }
            }
        },

        drawCorners: function ( ) {
            const connerLineSize = (0.5*this.scale+0.5) >> 0;
            const sizeCornerScale =this.sizeCorner * this.scale;
            const canvWidth = this.width * this.scale;
            const canvHeight = this.height * this.scale;
            const diff = connerLineSize/2;

            this.context.setLineDash([connerLineSize,connerLineSize]);
            this.context.lineWidth = connerLineSize;
            this.context.strokeStyle = "grey";

            this.context.beginPath();

            //lines for corners:
            //top-left
            this.context.moveTo (
                (sizeCornerScale >> 0) - diff,
                0
            );
            this.context.lineTo (
                (sizeCornerScale >> 0) - diff,
                (sizeCornerScale >> 0) - diff
            );
            this.context.moveTo (
                sizeCornerScale >> 0,
                (sizeCornerScale >> 0) - diff
            );
            this.context.lineTo (
                0,
                (sizeCornerScale >> 0) - diff
            );
            //-------------------------------------------------------

            //top-right
            this.context.moveTo (
                ((canvWidth - sizeCornerScale)>>0) + diff,
                0
            );
            this.context.lineTo (
                ((canvWidth - sizeCornerScale)>>0) + diff,
                sizeCornerScale >> 0
            );
            this.context.moveTo (
                (canvWidth - sizeCornerScale) >> 0,
                (sizeCornerScale >> 0) - diff
            );
            this.context.lineTo (
                canvWidth >> 0,
                (sizeCornerScale >> 0) - diff
            );
            //-------------------------------------------------------

            // bottom-right
            this.context.moveTo (
                ((canvWidth - sizeCornerScale) >> 0) + diff,
                canvHeight >> 0
            );
            this.context.lineTo (

                ((canvWidth - sizeCornerScale) >>0 ) + diff,
                (canvHeight - sizeCornerScale) >> 0
            );

            this.context.moveTo (
                (canvWidth - sizeCornerScale) >> 0,
                ((canvHeight - sizeCornerScale) >> 0) + diff);

            this.context.lineTo (
                canvWidth >> 0,
                ((canvHeight - sizeCornerScale) >> 0) + diff
            );
            //-------------------------------------------------------

            //bottom-left
            this.context.moveTo(
                (sizeCornerScale >> 0) - diff,
                canvHeight >> 0
            );
            this.context.lineTo(
                (sizeCornerScale >> 0) - diff,
                (canvHeight - sizeCornerScale)>>0
            );

            this.context.moveTo(
                sizeCornerScale >> 0,
                ((canvHeight - sizeCornerScale) >> 0) + diff
            );

            this.context.lineTo(
                0,
                ((canvHeight - sizeCornerScale) >> 0) + diff
            );
            //-------------------------------------------------------

            this.context.stroke();
            this.context.setLineDash([]);
        },

        fillCells: function(){
            if(!this.spacingMode || this.backgroundCellColor === 'transparent') return;
            const sizeCorner = (this.sizeCorner + this.cellPadding) * this.scale;
            const cellPadding = this.cellPadding * this.scale;
            const stepX = (this.width * this.scale - 2 * sizeCorner)/this.columns;
            const stepY = (this.height * this.scale - 2 * sizeCorner)/this.rows;

            this.context.beginPath();
            this.context.fillStyle = this.backgroundCellColor;
            for(let row = 0; row < this.rows; row++ ){
                for (let col = 0; col < this.columns; col++){

                    this.context.fillRect(
                        (sizeCorner + col * stepX + (col > 0 | 0) * cellPadding/2 )>>0,
                        (sizeCorner + row * stepY + (row > 0 | 0) * cellPadding/2) >>0,
                        (stepX - (((col > 0) | 0) + ((col < this.columns-1) |0)) * cellPadding/2)>>0,
                        (stepY - (((row > 0) | 0) + ((row < this.rows-1) |0)) * cellPadding/2)>>0
                    );
                }
            }
            this.context.stroke();
        },

        drawBorder: function (border){
            const size = this.getBorderSize(border);
            if(!size) return;
            const points = this.getLine(size, border);
            this.context.imageSmoothingEnabled = false;
            this.context.mozImageSmoothingEnabled = false;
            this.context.msImageSmoothingEnabled = false;
            this.context.webkitImageSmoothingEnabled = false;
            this.context.lineWidth = this.scaleBorderSize(size);
            this.context.globalAlpha = this.getBorderAlpha(border);
            this.context.beginPath();
            this.context.strokeStyle = this.getBorderColor(border);
            this.context.moveTo(points.X1, points.Y1);
            this.context.lineTo(points.X2, points.Y2);
            this.context.stroke();
            this.context.globalAlpha = 1;
        },

        fillWithLines: function (){
            let tdPadding = this.maxBorderSize + 4;
            const hFillLine = (2 * this.scale + 0.5) >> 0;
            let tdWidth;
            let tdHeight;
            let tdX;
            let tdY;
            let xLeft;
            let x1;
            let w;
            let y1;
            let h;
            this.context.setLineDash([hFillLine, hFillLine]);
            this.context.strokeStyle = "#c0c0c0";

            if(!this.spacingMode) {
                tdWidth = (this.width - 2 * this.sizeCorner) / this.columns;
                tdHeight = (this.height - 2 * this.sizeCorner) / this.rows;
                tdY = this.sizeCorner;
                xLeft = this.sizeCorner;

                for (let row = 0; row < this.rows; row++) {
                    tdX = xLeft;
                    for (let col = 0; col < this.columns; col++) {
                        x1 = ((tdX + tdPadding) * this.scale) >> 0;
                        y1 = (tdY + tdPadding) * this.scale;
                        w = ((tdWidth - 2 * tdPadding) * this.scale + 0.5) >> 0;
                        h = (tdHeight - 2 * tdPadding) * this.scale;
                        h = ((h/ (2 * hFillLine))>>0)*2* hFillLine + hFillLine;
                        this.context.lineWidth = w;
                        this.context.beginPath();
                        this.context.moveTo(x1 + w / 2, y1 >> 0);
                        this.context.lineTo(x1 + w / 2, (y1 + h) >> 0);
                        this.context.stroke();
                        tdX += tdWidth;

                    }
                    tdY += tdHeight;
                }
            }
            else {
                const sizeCorner = (this.sizeCorner + this.cellPadding) * this.scale;
                const cellPadding = this.cellPadding * this.scale;
                tdWidth = (this.width * this.scale - 2 * sizeCorner)/this.columns;
                tdHeight = (this.height * this.scale - 2 * sizeCorner)/this.rows;
                tdPadding *= this.scale;

                this.context.beginPath();
                this.context.fillStyle = this.backgroundCellColor;
                for(let row = 0; row < this.rows; row++ ){
                    for (let col = 0; col < this.columns; col++){

                        w = (tdWidth - (((col > 0) | 0) + ((col < this.columns-1) |0)) * cellPadding/2 -2*tdPadding + 0.5)>>0
                        h = tdHeight - (((row > 0) | 0) + ((row < this.rows-1) |0)) * cellPadding/2 -2*tdPadding;
                        h = ((h/ (2 * hFillLine))>>0)*2* hFillLine + hFillLine;
                        x1 = ((sizeCorner + col * tdWidth + (col > 0 | 0) * cellPadding/2 + tdPadding) >> 0);
                        y1 = sizeCorner + row * tdHeight + (row > 0 | 0) * cellPadding/2 + tdPadding;
                        this.context.beginPath();
                        this.context.lineWidth = w;
                        this.context.moveTo(x1 + w / 2, y1 >> 0);
                        this.context.lineTo(x1 + w / 2, (y1 + h) >> 0);
                        this.context.stroke();
                    }
                }
            }

            this.context.setLineDash([]);
        },

        drawTable: function (){
            this.drawCorners();
            const sizeCornerScale = this.sizeCorner * this.scale;
            const tableWidth = (this.width * this.scale  - 2 * sizeCornerScale) >> 0;
            const tableHeight = (this.height * this.scale  - 2 * sizeCornerScale) >> 0;
            this.context.fillStyle = this.backgroundColor;
            if(this.backgroundColor !== 'transparent' ){
                this.context.beginPath();
                this.context.fillRect(sizeCornerScale >> 0, sizeCornerScale >> 0, tableWidth , tableHeight);
                this.context.stroke();
            }
            this.fillCells();
            this._cellBorders.forEach((item)=> {item.drawBorder();});

            this.drawBorder('l');
            this.drawBorder('r');
            this.drawBorder('t');
            this.drawBorder('b');

            this.fillWithLines();
            this.context.lineWidth = 0;
        },

        redrawTable: function() {
            this.context.clearRect(0,0, this.canv.width, this.canv.height);
            this.drawTable();
        },

        getCellBorder: function(row, col, numInCell){
            row = (row === undefined) ? -1 : row;
            col = (col === undefined) ? -1 : col;
            numInCell = (numInCell === undefined) ? -1 : numInCell;
            return _.findWhere(this._cellBorders, {row: row, col: col, numInCell: numInCell});
        }
    });
});