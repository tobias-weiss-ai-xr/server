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
 *  ComboBoxFonts.js
 *
 *  Created on 2/11/14
 *
 */

if (Common === undefined)
    const Common = {};

const FONT_TYPE_RECENT = 4;

define([
    'common/main/lib/component/ComboBox'
], () => {

    Common.UI.ComboBoxFonts = Common.UI.ComboBox.extend((() => {
        const iconWidth       = 300;
        const iconHeight      = Asc.FONT_THUMBNAIL_HEIGHT || 28;
        const thumbCanvas     = document.createElement('canvas');
        const thumbContext    = thumbCanvas.getContext('2d');
        const postfix = (/^(zh|ja|ko)$/i.test(Common.Locale.getCurrentLanguage())) ? '_ea' : '';
        const thumbs       = [
                {ratio: 1,      path: `../../../../sdkjs/common/Images/fonts_thumbnail${postfix}.png`, width: iconWidth, height: iconHeight},
                {ratio: 1.25,   path: `../../../../sdkjs/common/Images/fonts_thumbnail${postfix}@1.25x.png`, width: iconWidth * 1.25, height: iconHeight * 1.25},
                {ratio: 1.5,    path: `../../../../sdkjs/common/Images/fonts_thumbnail${postfix}@1.5x.png`, width: iconWidth * 1.5, height: iconHeight * 1.5},
                {ratio: 1.75,   path: `../../../../sdkjs/common/Images/fonts_thumbnail${postfix}@1.75x.png`, width: iconWidth * 1.75, height: iconHeight * 1.75},
                {ratio: 2,      path: `../../../../sdkjs/common/Images/fonts_thumbnail${postfix}@2x.png`, width: iconWidth * 2, height: iconHeight * 2},
                /*{ratio: 2.5,    path: '../../../../sdkjs/common/Images/fonts_thumbnail' + postfix + '@2.5x.png', width: iconWidth * 2.5, height: iconHeight * 2.5},
                {ratio: 3,      path: '../../../../sdkjs/common/Images/fonts_thumbnail' + postfix + '@3x.png', width: iconWidth * 3, height: iconHeight * 3},
                {ratio: 3.5,    path: '../../../../sdkjs/common/Images/fonts_thumbnail' + postfix + '@3.5x.png', width: iconWidth * 3.5, height: iconHeight * 3.5},
                {ratio: 4,      path: '../../../../sdkjs/common/Images/fonts_thumbnail' + postfix + '@4x.png', width: iconWidth * 4, height: iconHeight * 4},
                {ratio: 4.5,    path: '../../../../sdkjs/common/Images/fonts_thumbnail' + postfix + '@4.5x.png', width: iconWidth * 4.5, height: iconHeight * 4.5},
                {ratio: 5,      path: '../../../../sdkjs/common/Images/fonts_thumbnail' + postfix + '@5x.png', width: iconWidth * 5, height: iconHeight * 5},*/
            ];
        let thumbIdx = 0;
        const listItemHeight  = 28;
        let spriteCols     = 1;
        const applicationPixelRatio = Common.Utils.applicationPixelRatio();

        if ( Common.Controllers.Desktop.isActive() ) {
            thumbs[0].path     = Common.Controllers.Desktop.call('getFontsSprite');
            thumbs[1].path     = Common.Controllers.Desktop.call('getFontsSprite', '@1.25x');
            thumbs[2].path     = Common.Controllers.Desktop.call('getFontsSprite', '@1.5x');
            thumbs[3].path     = Common.Controllers.Desktop.call('getFontsSprite', '@1.75x');
            thumbs[4].path     = Common.Controllers.Desktop.call('getFontsSprite', '@2x');
            /*thumbs[5].path     = Common.Controllers.Desktop.call('getFontsSprite', '@2.5x');
            thumbs[6].path     = Common.Controllers.Desktop.call('getFontsSprite', '@3x');
            thumbs[7].path     = Common.Controllers.Desktop.call('getFontsSprite', '@3.5x');
            thumbs[8].path     = Common.Controllers.Desktop.call('getFontsSprite', '@4x');
            thumbs[9].path     = Common.Controllers.Desktop.call('getFontsSprite', '@4.5x');
            thumbs[10].path    = Common.Controllers.Desktop.call('getFontsSprite', '@5x');*/
        }

        let bestDistance = Math.abs(applicationPixelRatio-thumbs[0].ratio);
        let currentDistance = 0;
        for (let i=1; i<thumbs.length; i++) {
            currentDistance = Math.abs(applicationPixelRatio-thumbs[i].ratio);
            if (currentDistance < (bestDistance - 0.0001))
            {
                bestDistance = currentDistance;
                thumbIdx = i;
            }
        }

        thumbCanvas.height  = thumbs[thumbIdx].height;
        thumbCanvas.width   = thumbs[thumbIdx].width;

        function CThumbnailLoader() {
            this.supportBinaryFormat = !(Common.Controllers.Desktop.isActive() && !Common.Controllers.Desktop.isFeatureAvailable('isSupportBinaryFontsSprite'));
            // Our format is an alpha mask with rle compression for fully transparent pixels

            this.image = null;
            this.binaryFormat = null;
            this.data = null;
            this.width = 0;
            this.height = 0;
            this.heightOne = 0;
            this.count = 0;
            this.offsets = null;

            this.load = function(url, callback) {
                if (!callback)
                    return;

                if (!this.supportBinaryFormat) {
                    this.width = thumbs[thumbIdx].width;
                    this.heightOne = thumbs[thumbIdx].height;

                    this.image = new Image();
                    this.image.onload = callback;
                    this.image.src = thumbs[thumbIdx].path;
                } else {
                    const me = this;
                    const xhr = new XMLHttpRequest();
                    xhr.open('GET', `${url}.bin`, true);
                    xhr.responseType = 'arraybuffer';

                    if (xhr.overrideMimeType)
                        xhr.overrideMimeType('text/plain; charset=x-user-defined');
                    else
                        xhr.setRequestHeader('Accept-Charset', 'x-user-defined');

                    xhr.onload = function() {
                        // TODO: check errors
                        me.binaryFormat = new Uint8Array(this.response);
                        callback();
                    };

                    xhr.send(null);
                }
            };

            this.openBinary = function(arrayBuffer) {
                //var t1 = performance.now();

                const binaryAlpha = this.binaryFormat;
                this.width      = (binaryAlpha[0] << 24) | (binaryAlpha[1] << 16) | (binaryAlpha[2] << 8) | (binaryAlpha[3] << 0);
                this.heightOne  = (binaryAlpha[4] << 24) | (binaryAlpha[5] << 16) | (binaryAlpha[6] << 8) | (binaryAlpha[7] << 0);
                this.count      = (binaryAlpha[8] << 24) | (binaryAlpha[9] << 16) | (binaryAlpha[10] << 8) | (binaryAlpha[11] << 0);
                this.height     = this.count * this.heightOne;

                const MAX_MEMORY_SIZE = 50000000;
                const memorySize = 4 * this.width * this.height;
                const isOffsets = !!(memorySize > MAX_MEMORY_SIZE);
                    
                if (!isOffsets)
                    this.data = new Uint8ClampedArray(memorySize);
                else
                    this.offsets = new Array(this.count);

                let binaryIndex = 12;
                const binaryLen = binaryAlpha.length;
                let index = 0;

                let len0 = 0;
                let tmpValue = 0;

                if (!isOffsets) {
                    const imagePixels = this.data;
                    while (binaryIndex < binaryLen) {
                        tmpValue = binaryAlpha[binaryIndex++];
                        if (0 === tmpValue) {
                            len0 = binaryAlpha[binaryIndex++];
                            while (len0 > 0) {
                                len0--;
                                imagePixels[index] = imagePixels[index + 1] = imagePixels[index + 2] = 255;
                                imagePixels[index + 3] = 0; // this value is already 0.
                                index += 4;
                            }
                        } else {
                            imagePixels[index] = imagePixels[index + 1] = imagePixels[index + 2] = 255 - tmpValue;
                            imagePixels[index + 3] = tmpValue;
                            index += 4;
                        }
                    }
                } else {
                    const module = this.width * this.heightOne;
                    let moduleCur = module - 1;
                    while (binaryIndex < binaryLen) {
                        tmpValue = binaryAlpha[binaryIndex++];
                        if (0 === tmpValue) {
                            len0 = binaryAlpha[binaryIndex++];
                            while (len0 > 0) {
                                len0--;
                                moduleCur++;
                                if (moduleCur === module) {
                                    this.offsets[index++] = { pos : binaryIndex, len : len0 + 1 };
                                    moduleCur = 0;
                                }
                            }
                        } else {
                            moduleCur++;
                            if (moduleCur === module) {
                                this.offsets[index++] = { pos : binaryIndex - 1, len : -1 };
                                moduleCur = 0;
                            }
                        }
                    }
                }

                if (!this.offsets)
                    this.binaryFormat = undefined;

                //var t2 = performance.now();
                //console.log(t2 - t1);
            };

            this.getImage = function(index, canvas, ctx) {

                //var t1 = performance.now();
                if (this.supportBinaryFormat) {
                    if (!this.data && !this.offsets) {
                        this.openBinary(this.binaryFormat);
                    }

                    if (!canvas)
                    {
                        canvas = document.createElement("canvas");
                        canvas.width = this.width;
                        canvas.height = this.heightOne;
                        canvas.style.width = `${iconWidth}px`;
                        canvas.style.height = `${iconHeight}px`;

                        ctx = canvas.getContext("2d");
                    }

                    const dataTmp = ctx.createImageData(this.width, this.heightOne);
                    const sizeImage = 4 * this.width * this.heightOne;

                    if (!this.offsets) {
                        dataTmp.data.set(new Uint8ClampedArray(this.data.buffer, index * sizeImage, sizeImage));                        
                    } else {
                        const binaryAlpha = this.binaryFormat;
                        let binaryIndex = this.offsets[index].pos;
                        let alphaChannel = 0;
                        let pixelsCount = this.width * this.heightOne;
                        let tmpValue = 0;
                        let len0 = 0;
                        const imagePixels = dataTmp.data;
                        if (-1 !== this.offsets[index].len) {
                            /*
                            // this values is already 0.
                            for (var i = 0; i < this.offsets[index].len; i++) {
                                pixels[alphaChannel] = 0;
                                alphaChannel += 4;
                            }
                            */
                            alphaChannel += 4 * this.offsets[index].len;
                        }
                        while (pixelsCount > 0) {
                            tmpValue = binaryAlpha[binaryIndex++];
                            if (0 === tmpValue) {
                                len0 = binaryAlpha[binaryIndex++];
                                if (len0 > pixelsCount)
                                    len0 = pixelsCount;
                                while (len0 > 0) {
                                    len0--;
                                    imagePixels[alphaChannel] = imagePixels[alphaChannel + 1] = imagePixels[alphaChannel + 2] = 255;
                                    imagePixels[alphaChannel + 3] = 0; // this value is already 0.
                                    alphaChannel += 4;
                                    pixelsCount--;
                                }
                            } else {
                                imagePixels[alphaChannel] = imagePixels[alphaChannel + 1] = imagePixels[alphaChannel + 2] = 255 - tmpValue;
                                imagePixels[alphaChannel + 3] = tmpValue;
                                alphaChannel += 4;
                                pixelsCount--;
                            }
                        }
                    }
                    ctx.putImageData(dataTmp, 0, 0);
                } else {
                    if (!canvas)
                    {
                        canvas = document.createElement("canvas");
                        canvas.width = this.width;
                        canvas.height = this.heightOne;
                        canvas.style.width = `${iconWidth}px`;
                        canvas.style.height = `${iconHeight}px`;

                        ctx = canvas.getContext("2d");
                    }

                    ctx.clearRect(0, 0, this.width, this.heightOne);
                    ctx.drawImage(this.image, 0, -this.heightOne * index);
                }

                //var t2 = performance.now();
                //console.log(t2 - t1);

                return canvas;
            };
        }

        return {
            template: _.template([
                '<div class="input-group combobox fonts <%= cls %>" id="<%= id %>" style="<%= style %>">',
                    '<input dir="ltr" type="text" class="form-control" spellcheck="false" role="combobox" aria-controls="<%= id %>-menu" aria-expanded="false" data-hint="<%= dataHint %>" data-hint-direction="<%= dataHintDirection %>" data-move-focus-only-tab="true"> ',
                    '<div style="display: table-cell;"></div>',
                    '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></button>',
                    '<ul id="<%= id %>-menu" class="dropdown-menu <%= menuCls %>" style="<%= menuStyle %>" role="menu">',
                        '<li class="divider">',
                    '<% _.each(items, function(item) { %>',
                        '<li id="<%= item.id %>">',
                            '<a class="font-item" tabindex="-1" type="menuitem" role="menuitemcheckbox" aria-checked="false" style="height:<%=scope.getListItemHeight()%>px;"></a>',
                        '</li>',
                    '<% }); %>',
                    '</ul>',
                '</div>'
            ].join('')),

            initialize : function(options) {
                Common.UI.ComboBox.prototype.initialize.call(this, _.extend(options, {
                    displayField: 'name',
                    scroller: {
                        wheelSpeed: 20,
                        alwaysVisibleY: true,
                        onChange: this.updateVisibleFontsTiles.bind(this)
                    }
                }));

                this.recent = _.isNumber(options.recent) ? options.recent : 5;

                const filter = Common.localStorage.getKeysFilter();
                this.appPrefix = (filter?.length) ? filter.split(',')[0] : '';

                // Common.NotificationCenter.on('fonts:change',    _.bind(this.onApiChangeFont, this));
                Common.NotificationCenter.on('fonts:load',      _.bind(this.fillFonts, this));
            },

            render : function(parentEl) {
                let oldRawValue = null;
                let oldTabindex = '';

                if (!_.isUndefined(this._input)) {
                    oldRawValue = this._input.val();
                    oldTabindex = this._input.attr('tabindex');
                }

                Common.UI.ComboBox.prototype.render.call(this, parentEl);

                this.setRawValue(oldRawValue);
                this._input.attr('tabindex', oldTabindex);

                this._input.on('keyup',     _.bind(this.onInputKeyUp, this));
                this._input.on('keydown',   _.bind(this.onInputKeyDown, this));
                this._input.on('focus',     _.bind(function() {this.inFormControl = true;}, this));
                this._input.on('blur',      _.bind(function() {this.inFormControl = false;}, this));
                this._input.on('compositionstart', _.bind(function() {this._isComposition = true;}, this));
                this._input.on('compositionend',   _.bind(function() {this._isComposition = false;}, this));

                return this;
            },

            onAfterKeydownMenu: function(e) {
                if (e.keyCode === Common.UI.Keys.RETURN) {
                     if ($(e.target).closest('input').length) { // enter in input field
                        if (this.lastValue !== this._input.val())
                            this._input.trigger('change');
                        else
                            return true;
                    } else { // enter in dropdown list
                        $(e.target).click();
                        if (this.rendered) {
                            if (Common.Utils.isIE)
                                this._input.trigger('change', { onkeydown: true });
                            else
                                this._input.blur();
                        }
                    }
                    return false;
                }if (e.keyCode === Common.UI.Keys.ESC && this.isMenuOpen()) {
                    this._input.val(this.lastValue);
                     setTimeout(() => {
                        this.closeMenu();
                        this.onAfterHideMenu(e);
                    }, 10);
                    return false;
                }if ((e.keyCode === Common.UI.Keys.HOME && !e.shiftKey || e.keyCode === Common.UI.Keys.END && !e.shiftKey || e.keyCode === Common.UI.Keys.BACKSPACE && !this._input.is(':focus')) && this.isMenuOpen()) {
                    this._input.focus();
                    setTimeout(() => {
                        this._input[0].selectionStart = this._input[0].selectionEnd = (e.keyCode === Common.UI.Keys.HOME) ? 0 : this._input[0].value.length;
                    }, 10);
                }

                this.updateVisibleFontsTiles();
            },

            onInputKeyUp: function(e) {
                if (!this._isKeyDown) return;
                if (e.keyCode !== Common.UI.Keys.RETURN && e.keyCode !== Common.UI.Keys.SHIFT &&
                    e.keyCode !== Common.UI.Keys.CTRL && e.keyCode !== Common.UI.Keys.ALT &&
                    e.keyCode !== Common.UI.Keys.LEFT && e.keyCode !== Common.UI.Keys.RIGHT &&
                    e.keyCode !== Common.UI.Keys.HOME && e.keyCode !== Common.UI.Keys.END &&
                    e.keyCode !== Common.UI.Keys.ESC &&
                    e.keyCode !== Common.UI.Keys.INSERT && e.keyCode !== Common.UI.Keys.TAB){
                    e.stopPropagation();
                    this.selectCandidate(e.keyCode === Common.UI.Keys.DELETE || e.keyCode === Common.UI.Keys.BACKSPACE);
                    if (this._selectedItem && !this._isComposition) {
                        if (this._timerSelection===undefined)
                            this._timerSelection = setInterval(()=> {
                                if ((new Date()) - this._inInputKeyDown<100 || !this._selectedItem) return;

                                clearInterval(this._timerSelection);
                                this._timerSelection = undefined;
                                const input = this._input[0];
                                const text = this._selectedItem.get(this.displayField);
                                const inputVal = input.value;
                                if (this.rendered)  {
                                    if (document.selection) { // IE
                                        document.selection.createRange().text = text;
                                    } else if (input.selectionStart || input.selectionStart === '0') { //FF and Webkit
                                        input.value = text;
                                        input.selectionStart = inputVal.length;
                                        input.selectionEnd = text.length;
                                    }
                                }
                            }, 10);
                    }
                }
                this._isKeyDown = false;
            },

            onInputKeyDown: function(e) {
                this._isKeyDown = true;
                this._inInputKeyDown = (new Date());

                if (e.keyCode === Common.UI.Keys.ESC){
                    this._input.val(this.lastValue);
                    setTimeout(() => {
                        this.closeMenu();
                        this.onAfterHideMenu(e);
                    }, 10);
                } else if (e.keyCode !== Common.UI.Keys.RETURN && e.keyCode !== Common.UI.Keys.CTRL && e.keyCode !== Common.UI.Keys.SHIFT && e.keyCode !== Common.UI.Keys.ALT && e.keyCode !== Common.UI.Keys.TAB){
                    if (!this.isMenuOpen() && !e.ctrlKey) {
                        this.openMenu();
                        (this.recent > 0) && this.flushVisibleFontsTiles();
                    }

                    if (e.keyCode === Common.UI.Keys.UP || e.keyCode === Common.UI.Keys.DOWN) {
                        _.delay(() => {
                            let selected = (e.keyCode === Common.UI.Keys.DOWN) ? this.cmpEl.find('ul li.selected').nextAll('li:not(.divider)') : this.cmpEl.find('ul li.selected').prevAll('li:not(.divider)');
                            selected = (selected.length>0) ? selected.eq(0) : ((e.keyCode === Common.UI.Keys.DOWN) ? this.cmpEl.find('ul li:not(.divider):first') : this.cmpEl.find('ul li:not(.divider):last'));
                            selected = selected.find('a');

                            this._skipInputChange = true;
                            selected.focus();
                            this.updateVisibleFontsTiles();
                        }, 10);
                    } else
                        this._skipInputChange = false;
                } else if (e.keyCode === Common.UI.Keys.RETURN && this._input.val() === this.lastValue){
                    this._input.trigger('change', { reapply: true });
                }
            },

            onInputChanged: function(e, extra) {
                // skip processing for internally-generated synthetic event
                // to avoid double processing
                if (extra?.synthetic)
                    return;

                if (this._skipInputChange) {
                    this._skipInputChange = false; return;
                }

                if (this._isMouseDownMenu) {
                    this._isMouseDownMenu = false; return;
                }

                const val = $(e.target).val();
                const record = {};

                if (this.lastValue === val && !(extra?.reapply)) {
                    if (extra?.onkeydown)
                        this.trigger('combo:blur', this, e);
                    return;
                }

                record[this.valueField] = val;
                record[this.displayField] = val;

                this.trigger('changed:before', this, record, e);

                if (e.isDefaultPrevented())
                    return;

                if (this._selectedItem) {
                    record[this.valueField] = this._selectedItem.get(this.displayField);
                    this.setRawValue(record[this.valueField]);
                    this.trigger('selected', this, _.extend({}, this._selectedItem.toJSON()), e);
                    this.addItemToRecent(this._selectedItem);
                    this.closeMenu();
                } else {
                    this.setRawValue(record[this.valueField]);
                    record.isNewFont = true;
                    this.trigger('selected', this, record, e);
                    this.closeMenu();
                }

                // trigger changed event
                this.trigger('changed:after', this, record, e);
            },

            getImageUri: function(opts) {
                if (opts.cloneid) {
                    const img = $(this.el).find(`ul > li#${opts.cloneid} img`);
                    return img != null ? img[0].src : undefined;
                }

                const index = Math.floor(opts.imgidx/spriteCols);
                return this.spriteThumbs.getImage(index, thumbCanvas, thumbContext).toDataURL();
            },

            getImageWidth: () => iconWidth,

            getImageHeight: () => iconHeight,

            getListItemHeight: () => listItemHeight,

            loadSprite: function(callback) {
                this.spriteThumbs = new CThumbnailLoader();
                this.spriteThumbs.load(thumbs[thumbIdx].path, callback);
            },

            fillFonts: function(store, select) {

                this.loadSprite(() => {
                    spriteCols = Math.floor(this.spriteThumbs.width / (thumbs[thumbIdx].width)) || 1;
                    this.store.set(store.toJSON());

                    this.rendered = false;
                    if (!_.isUndefined(this.scroller)) {
                        this.scroller.destroy();
                        this.scroller = undefined;
                    }
                    this._scrollerIsInited = false;
                    this.render($(this.el));

                    this._fontsArray = this.store.toJSON();

                    if (this.recent > 0) {
                        this.store.on('add', this.onInsertItem, this);
                        this.store.on('remove', this.onRemoveItem, this);

                        Common.Utils.InternalSettings.set(`${this.appPrefix}-settings-recent-fonts`, Common.localStorage.getItem(`${this.appPrefix}-settings-recent-fonts`));
                        let arr = Common.Utils.InternalSettings.get(`${this.appPrefix}-settings-recent-fonts`);
                        arr = arr ? arr.split(';') : [];
                        arr.reverse().forEach((item) => {
                            item && this.addItemToRecent(this.store.findWhere({name: item}), true);
                        });
                    }
                });
            },

            onApiChangeFont: function(font) {
                const name = (_.isFunction(font.get_Name) ?  font.get_Name() : font.asc_getFontName());
                if (this.__name !== name) {
                    this.__name = name;
                    if (!this.__nameId) {
                        this.__nameId = setTimeout(() => {
                            this.onApiChangeFontInternal(this.__name);
                            this.__nameId = null;
                        }, 100);
                    }

                }
            },

            onApiChangeFontInternal: function(name) {
                if (this.inFormControl) return;

                if (this.getRawValue() !== name) {
                    const record = this.store.findWhere({
                        name: name
                    });

                    const $selectedItems = $('.selected', $(this.el));
                    $selectedItems.removeClass('selected');
                    $selectedItems.find('a').attr('aria-checked', false);

                    if (record) {
                        this.setRawValue(record.get(this.displayField));
                        const itemNode = $(`#${record.get('id')}`, $(this.el));
                        const menuNode = $('ul.dropdown-menu', this.cmpEl);

                        if (itemNode && menuNode) {
                            itemNode.addClass('selected');
                            itemNode.find('a').attr('aria-checked', true);
                            if (this.recent<=0)
                                menuNode.scrollTop(itemNode.offset().top - menuNode.offset().top);
                        }
                    } else {
                        this.setRawValue(name);
                    }
                }
            },

            itemClicked: function (e) {
                this.__name = undefined;
                if (this.__nameId) {
                    clearTimeout(this.__nameId);
                    this.__nameId = undefined;
                }

                Common.UI.ComboBox.prototype.itemClicked.apply(this, arguments);

                const el = $(e.target).closest('li');
                const record = this.store.findWhere({id: el.attr('id')});
                this.addItemToRecent(record);
            },

            onInsertItem: function(item) {
                $(this.el).find('ul').prepend(_.template([
                    '<li id="<%= item.id %>">',
                        '<a class="font-item" tabindex="-1" type="menuitem" role="menuitemcheckbox" aria-checked="false" style="height:<%=scope.getListItemHeight()%>px;"></a>',
                    '</li>'
                ].join(''))({
                    item: item.attributes,
                    scope: this
                }));
            },

            onRemoveItem: function(item, store, opts) {
                $(this.el).find(`ul > li#${item.id}`).remove();
            },

            onBeforeShowMenu: function(e) {
                if (this.store.length<1) {
                    e.preventDefault();
                    return;
                }
                Common.UI.ComboBox.prototype.onBeforeShowMenu.apply(this, arguments);

                if (!this.getSelectedRecord() && !!this.getRawValue()) {
                    const record = this.store.where({name: this.getRawValue()});
                    if (record?.length) {
                        this.selectRecord(record[record.length - 1]);
                    }
                }
            },

            onAfterShowMenu: function(e) {
                this.alignMenuPosition();
                if (this.recent > 0) {
                    if (this.scroller && !this._scrollerIsInited) {
                        this.scroller.update();
                        this._scrollerIsInited = true;
                    }
                    $(this.el).find('ul').scrollTop(0);
                    this.trigger('show:after', this, e);
                    this.flushVisibleFontsTiles();
                    this.updateVisibleFontsTiles(null, 0);
                    Common.Utils.isGecko && this.scroller && this.scroller.update();

                    this._input.attr('aria-expanded', 'true');
                } else {
                    Common.UI.ComboBox.prototype.onAfterShowMenu.apply(this, arguments);
                }
            },

            onAfterHideMenu: function(e) {
                if (this.lastValue !== this._input.val())
                    this._input.val(this.lastValue);

                Common.UI.ComboBox.prototype.onAfterHideMenu.apply(this, arguments);
            },

            addItemToRecent: function(record, silent) {
                if (!record || this.recent<1) return;

                const font = this.store.findWhere({name: record.get('name'),type:FONT_TYPE_RECENT});
                font && this.store.remove(font);

                const fonts = this.store.where({type:FONT_TYPE_RECENT});
                if (!(fonts.length < this.recent)) {
                    this.store.remove(fonts[this.recent - 1]);
                }

                const new_record = record.clone();
                new_record.set({'type': FONT_TYPE_RECENT, 'id': Common.UI.getId(), cloneid: record.id});
                this.store.add(new_record, {at:0});

                if (!silent) {
                    let arr = [];
                    this.store.where({type:FONT_TYPE_RECENT}).forEach((item)=> {
                        arr.push(item.get('name'));
                    });
                    arr = arr.join(';');
                    Common.localStorage.setItem(`${this.appPrefix}-settings-recent-fonts`, arr);
                    Common.Utils.InternalSettings.set(`${this.appPrefix}-settings-recent-fonts`, arr);
                }
            },

            selectCandidate: function(full) {
                const inputVal = this._input.val().toLowerCase();

                if (!this._fontsArray)
                    this._fontsArray = this.store.toJSON();

                const font = _.find(this._fontsArray, (font) => (full) ? (font[this.displayField].toLowerCase() === inputVal) : (font[this.displayField].toLowerCase().indexOf(inputVal) === 0));

                if (font) {
                    this._selectedItem = this.store.findWhere({
                        id: font.id
                    });
                } else
                    this._selectedItem = null;

                const $selectedItems = $('.selected', $(this.el));
                $selectedItems.removeClass('selected');
                $selectedItems.find('a').attr('aria-checked', false);

                if (this._selectedItem) {
                    const itemNode = $(`#${this._selectedItem.get('id')}`, $(this.el));
                    const menuEl   = $('ul[role=menu]', $(this.el));

                    if (itemNode.length > 0 && menuEl.length > 0) {
                        itemNode.addClass('selected');
                        itemNode.find('a').attr('aria-checked', true);

                        const itemTop = Common.Utils.getPosition(itemNode).top;
                        const menuTop = menuEl.scrollTop();

                        if (itemTop !== 0)
                            menuEl.scrollTop(menuTop + itemTop);
                    }
                }
            },

            updateVisibleFontsTiles: function(e, scrollY) {
                let j = 0;
                const storeCount = this.store.length;
                let index = 0;

                if (!this.tiles) this.tiles = [];
                if (storeCount !== this.tiles.length) {
                    for (j =  this.tiles.length; j < storeCount; ++j) {
                        this.tiles.unshift(null);
                    }
                }

                if (_.isUndefined(scrollY)) scrollY = Number.parseInt($(this.el).find('.ps-scrollbar-x-rail').css('bottom'));

                const scrollH = $(this.el).find('.dropdown-menu').height();
                const count = Math.max(Math.floor(scrollH / listItemHeight) + 3, 0);
                const from = Math.max(Math.floor(-(scrollY / listItemHeight)) - 1, 0);
                const to = from + count;

                const listItems = $(this.el).find('a');

                for (j = 0; j < storeCount; ++j) {
                    if (from <= j && j < to) {
                        if (null === this.tiles[j]) {
                            index = Math.floor(this.store.at(j).get('imgidx')/spriteCols);
                            const fontImage = this.spriteThumbs.getImage(index);

                            this.tiles[j] = fontImage;
                            $(listItems[j]).get(0).appendChild(fontImage);
                        }
                    } else {
                        if (this.tiles[j]) {
                            this.tiles[j].parentNode.removeChild(this.tiles[j]);
                            this.tiles[j] = null;
                        }
                    }
                }
            },

            flushVisibleFontsTiles: function() {
                for (let j = this.tiles.length - 1; j >= 0; --j) {
                    if (this.tiles[j]) {
                        this.tiles[j].parentNode.removeChild(this.tiles[j]);
                        this.tiles[j] = null;
                    }
                }
            }
        }
    })());
});