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
 *  HyperlinkSettingsDialog.js
 *
 *  Created on 4/9/14
 *
 */


if (Common === undefined)
    const Common = {};

define([], () => { 

    SSE.Views.HyperlinkSettingsDialog = Common.UI.Window.extend(_.extend({
        options: {
            width   : 350,
            style   : 'min-width: 230px;',
            cls     : 'modal-dlg',
            id      : 'window-hyperlink',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box" style="height: 330px;">',
                    '<div class="margin-bottom-big">',
                        '<button type="button" class="btn btn-text-default auto" id="id-dlg-hyperlink-external">', this.textExternalLink,'</button>',
                        '<button type="button" class="btn btn-text-default auto" id="id-dlg-hyperlink-internal">', this.textInternalLink,'</button>',
                    '</div>',
                    '<div id="id-external-link">',
                        '<div class="input-row">',
                            `<label>${this.strLinkTo}</label>`,
                        '</div>',
                        '<div id="id-dlg-hyperlink-url" class="input-row margin-bottom"></div>',
                    '</div>',
                    '<div id="id-internal-link" class="hidden">',
                        '<div class="input-row">',
                            `<label>${this.strLinkTo}</label>`,
                            '<div class="get-link float-right">',
                                `<label class="link dropdown-toggle float-right" data-toggle="dropdown" id="id-dlg-hyperlink-get-link">${this.textGetLink}</label>`,
                                '<div id="id-clip-copy-box" class="dropdown-menu">',
                                    '<div id="id-dlg-clip-copy" class="display-inline-block-middle"></div>',
                                    `<button id="id-dlg-copy-btn" class="btn btn-text-default margin-left-5 display-inline-block-middle">${this.textCopy}</button>`,
                                '</div>',
                            '</div>',
                        '</div>',
                        '<div id="id-dlg-hyperlink-list"></div>',
                        '<div class="input-row">',
                            `<label>${this.strRange}</label>`,
                        '</div>',
                        '<div id="id-dlg-hyperlink-range" class="input-row margin-bottom"></div>',
                    '</div>',
                    '<div class="input-row">',
                        `<label>${this.strDisplay}</label>`,
                    '</div>',
                    '<div id="id-dlg-hyperlink-display" class="input-row margin-bottom"></div>',
                    '<div class="input-row">',
                        `<label>${this.textTipText}</label>`,
                    '</div>',
                    '<div id="id-dlg-hyperlink-tip" class="input-row margin-bottom"></div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            this.api = this.options.api;
            this.appOptions = options.appOptions;
            this.dataRangeValid = '';
            this.urlType = AscCommon.c_oAscUrlType.Invalid;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            const $window = this.getChild();

            this.btnExternal = new Common.UI.Button({
                el: $('#id-dlg-hyperlink-external'),
                enableToggle: true,
                toggleGroup: 'hyperlink-type',
                allowDepress: false,
                pressed: true
            });
            this.btnExternal.on('click', _.bind(this.onLinkTypeClick, this, Asc.c_oAscHyperlinkType.WebLink));

            this.btnInternal = new Common.UI.Button({
                el: $('#id-dlg-hyperlink-internal'),
                enableToggle: true,
                toggleGroup: 'hyperlink-type',
                allowDepress: false
            });
            this.btnInternal.on('click', _.bind(this.onLinkTypeClick, this, Asc.c_oAscHyperlinkType.RangeLink));

            Common.UI.GroupedButtons([this.btnExternal, this.btnInternal]);

            const config = {
                el          : $('#id-dlg-hyperlink-url'),
                allowBlank  : false,
                blankError  : this.txtEmpty,
                validateOnBlur: false,
                style       : 'width: 100%;',
                iconCls: 'toolbar__icon btn-browse',
                placeHolder: this.appOptions.isDesktopApp ? this.txtUrlPlaceholder : '',
                btnHint: this.textSelectFile,
                validation  : (value) => {
                    const trimmed = $.trim(value);
                    if (this.api.asc_getFullHyperlinkLength(trimmed)>2083) return this.txtSizeLimit;

                    this.urlType = this.api.asc_getUrlType(trimmed);
                    return (this.urlType!==AscCommon.c_oAscUrlType.Invalid) ? true : this.txtNotUrl;
                }
            };
            this.inputUrl = this.appOptions.isDesktopApp ? new Common.UI.InputFieldBtn(config) : new Common.UI.InputField(config);
            this.inputUrl._input.on('input', (e) => {
                this.isInputFirstChange_url && this.inputUrl.showError();
                this.isInputFirstChange_url = false;
                const val = $(e.target).val();
                this.isAutoUpdate && this.inputDisplay.setValue(val);
                this.btnOk.setDisabled($.trim(val)==='');
            });
            this.appOptions.isDesktopApp && this.inputUrl.on('button:click', _.bind(this.onSelectFile, this));

            this.inputRange = new Common.UI.InputFieldBtn({
                el          : $('#id-dlg-hyperlink-range'),
                allowBlank  : false,
                blankError  : this.txtEmpty,
                style       : 'width: 100%;',
                btnHint     : this.textSelectData,
                validateOnChange: true,
                validateOnBlur: false,
                value: Common.Utils.InternalSettings.get("sse-settings-r1c1") ? 'R1C1' : 'A1',
                validation  : (value) => {
                    if (this.inputRange.isDisabled()) // named range
                        return true;
                    const isvalid = this.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.Chart, value, false);
                    if (isvalid === Asc.c_oAscError.ID.No) {
                        return true;
                    }
                        return this.textInvalidRange;
                }
            });
            this.inputRange._input.on('input', (e) => {
                this.isInputFirstChange_range && this.inputRange.showError();
                this.isInputFirstChange_range = false;
                const val = $(e.target).val();
                this.isAutoUpdate && this.inputDisplay.setValue(this.internalList.getSelectedRec().get('name') + (val!=='' ? `!${val}` : ''));
                this.btnOk.setDisabled($.trim(val)==='');
            });
            this.inputRange.on('button:click', _.bind(this.onSelectData, this));

            this.inputDisplay = new Common.UI.InputField({
                el          : $('#id-dlg-hyperlink-display'),
                allowBlank  : true,
                validateOnBlur: false,
                style       : 'width: 100%;'
            });
            this.inputDisplay._input.on('input', (e) => {
                this.isAutoUpdate = ($(e.target).val()==='');
            });

            this.inputTip = new Common.UI.InputField({
                el          : $('#id-dlg-hyperlink-tip'),
                style       : 'width: 100%;',
                maxLength   : Asc.c_oAscMaxTooltipLength
            });

            this.internalList = new Common.UI.TreeView({
                el: $('#id-dlg-hyperlink-list'),
                store: new Common.UI.TreeViewStore(),
                tabindex: 1,
                enableKeyEvents: true
            });
            this.internalList.on('item:select', _.bind(this.onSelectItem, this));

            if (this.appOptions?.canMakeActionLink) {
                const inputCopy = new Common.UI.InputField({
                    el          : $('#id-dlg-clip-copy'),
                    editable    : false,
                    style       : 'width: 176px;'
                });

                const copyBox = $window.find('#id-clip-copy-box');
                copyBox.on('click', _.bind(() => false, this));
                copyBox.parent().on({
                    'shown.bs.dropdown': () => {
                        _.delay(()=> {
                            inputCopy._input.select().focus();
                        },100);
                    }
                });
                copyBox.find('button').on('click', () => {
                    inputCopy._input.select();
                    document.execCommand("copy");
                });

                Common.Gateway.on('setactionlink', (url) => {
                    inputCopy.setValue(url);
                });
            }

            this.linkGetLink = $('#id-dlg-hyperlink-get-link');
            this.linkGetLink.toggleClass('hidden', !(this.appOptions?.canMakeActionLink));

            this.btnOk = _.find(this.getFooterButtons(), (item) => (item.$el && item.$el.find('.primary').addBack().filter('.primary').length>0)) || new Common.UI.Button({ el: $window.find('.primary') });
            this.btnOk.setDisabled(true);

            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
            this.internalList.on('entervalue', _.bind(this.onPrimary, this));
            $window.on('click', '#id-dlg-hyperlink-get-link', _.bind(this.getLink, this));

            this.externalPanel = $window.find('#id-external-link');
            this.internalPanel = $window.find('#id-internal-link');
        },

        getFocusedComponents: function() {
            return [this.btnExternal, this.btnInternal, this.inputUrl, this.internalList, this.inputRange, this.inputDisplay, this.inputTip].concat(this.getFooterButtons());
        },

        show: function() {
            Common.UI.Window.prototype.show.apply(this, arguments);
            Common.Utils.InternalSettings.set("sse-dialog-link-visible", true);
        },

        close: function() {
            Common.Utils.InternalSettings.set("sse-dialog-link-visible", false);
            Common.UI.Window.prototype.close.apply(this, arguments);
        },

        setSettings: function(settings) {
            if (settings) {
                this.settings = settings;

                const type = (settings.props) ? settings.props.asc_getType() : (Common.Utils.InternalSettings.get("sse-settings-link-type") && settings.allowInternal ? Asc.c_oAscHyperlinkType.RangeLink : Asc.c_oAscHyperlinkType.WebLink);
                (type === Asc.c_oAscHyperlinkType.WebLink) ? this.btnExternal.toggle(true) : this.btnInternal.toggle(true);
                this.ShowHideElem(type, settings.props);
                this.btnInternal.setDisabled(!settings.allowInternal && (type === Asc.c_oAscHyperlinkType.WebLink));
                this.btnExternal.setDisabled(!settings.allowInternal && (type === Asc.c_oAscHyperlinkType.RangeLink));

                let defrange = '';
                if (!settings.props) { // add link
                    this.inputDisplay.setValue(settings.isLock ? this.textDefault : settings.text);
                } else {
                    if (type === Asc.c_oAscHyperlinkType.RangeLink) {
                        if (settings.props.asc_getSheet()) {
                            this.inputRange.setValue(settings.props.asc_getRange());
                            this.dataRangeValid = this.inputRange.getValue();
                            defrange = `${settings.props.asc_getSheet()}!${settings.props.asc_getRange()}`;
                        } else {// named range
                            this.inputRange.setDisabled(true);
                            defrange = settings.props.asc_getLocation();
                        }
                    } else {
                        this.inputUrl.setValue(settings.props.asc_getHyperlinkUrl().replace(/ /g, "%20"));
                        this.btnOk.setDisabled($.trim(this.inputUrl.getValue())==='');
                    }
                    this.inputDisplay.setValue(settings.isLock ? this.textDefault : settings.props.asc_getText());
                    this.inputTip.setValue(settings.props.asc_getTooltip());
                }
                this.inputDisplay.setDisabled(settings.isLock);
                !settings.isLock && (this.isAutoUpdate = (this.inputDisplay.getValue()==='' || type === Asc.c_oAscHyperlinkType.WebLink && this.inputUrl.getValue()===this.inputDisplay.getValue()) ||
                                                                                              type === Asc.c_oAscHyperlinkType.RangeLink && defrange===this.inputDisplay.getValue());
            }
        },

        getSettings: function() {
            const props = new Asc.asc_CHyperlink();
            let def_display = "";
            const type = this.btnInternal.isActive() ? Asc.c_oAscHyperlinkType.RangeLink : Asc.c_oAscHyperlinkType.WebLink;
            props.asc_setType(type);

            if (type===Asc.c_oAscHyperlinkType.RangeLink) {
                const rec = this.internalList.getSelectedRec();
                if (rec && rec.get('level')>0) {
                    if (rec.get('type')) {// named range
                        props.asc_setSheet(null);
                        props.asc_setLocation(rec.get('name'));
                        def_display = rec.get('name');
                    } else {
                        props.asc_setSheet(rec.get('name'));
                        props.asc_setRange(this.inputRange.getValue());
                        def_display = `${rec.get('name')}!${this.inputRange.getValue()}`;
                    }
                }
            } else {
                let url = this.inputUrl.getValue().replace(/^\s+|\s+$/g,'');
                if (this.urlType!==AscCommon.c_oAscUrlType.Unsafe && ! /(((^https?)|(^ftp)):\/\/)|(^mailto:)/i.test(url) )
                    url = ( (this.urlType===AscCommon.c_oAscUrlType.Email) ? 'mailto:' : 'http://' ) + url;
                url = url.replace(/%20/g," ");
                props.asc_setHyperlinkUrl(url);
                def_display = url;
            }

            if (this.inputDisplay.isDisabled())
                props.asc_setText(null);
            else {
                if (_.isEmpty(this.inputDisplay.getValue()) || type===Asc.c_oAscHyperlinkType.WebLink && this.isAutoUpdate)
                    this.inputDisplay.setValue(def_display);
                props.asc_setText(this.inputDisplay.getValue());
            }

            props.asc_setTooltip(this.inputTip.getValue());

            return props;
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes.result.value);
        },

        onPrimary: function(event) {
            this._handleInput('ok');
            return false;
        },

        _handleInput: function(state) {
            if (state === 'ok' && this.btnOk.isDisabled())
                return;

            if (this.options.handler) {
                if (state === 'ok') {
                    const checkurl = (this.btnExternal.isActive()) ? this.inputUrl.checkValidate() : true;
                    const checkrange = (this.btnInternal.isActive()) ? this.inputRange.checkValidate() : true;
                    const checkdisp = this.inputDisplay.checkValidate();
                    if (checkurl !== true)  {
                        this.inputUrl.focus();
                        this.isInputFirstChange_url = true;
                        return;
                    }
                    if (checkrange !== true)  {
                        this.inputRange.focus();
                        this.isInputFirstChange_range = true;
                        return;
                    }
                    if (checkdisp !== true) {
                        this.inputDisplay.focus();
                        return;
                    }
                    !this.settings.props && Common.Utils.InternalSettings.set("sse-settings-link-type", this.btnInternal.isActive()); // save last added hyperlink
                }

                this.options.handler.call(this, this, state);
            }

            this.close();
        },

        ShowHideElem: function(value, props) {
            this.externalPanel.toggleClass('hidden', value !== Asc.c_oAscHyperlinkType.WebLink);
            this.internalPanel.toggleClass('hidden', value !== Asc.c_oAscHyperlinkType.RangeLink);
            const store = this.internalList.store;
            if (value===Asc.c_oAscHyperlinkType.RangeLink) {
                if (store.length<1 && this.settings) {
                    const sheets = this.settings.sheets;
                    let count = sheets.length;
                    const arr = [];
                    arr.push(new Common.UI.TreeViewModel({
                        name : this.textSheets,
                        level: 0,
                        index: 0,
                        hasParent: false,
                        isEmptyItem: false,
                        isNotHeader: true,
                        isExpanded: false,
                        hasSubItems: true
                    }));
                    for (let i=0; i<count; i++) {
                        !sheets[i].hidden && arr.push(new Common.UI.TreeViewModel({
                            name : sheets[i].name,
                            level: 1,
                            index: i+1,
                            type: 0, // sheet
                            isVisible: false,
                            hasParent: true
                        }));
                    }
                    arr.push(new Common.UI.TreeViewModel({
                        name : this.textNames,
                        level: 0,
                        index: arr.length,
                        hasParent: false,
                        isEmptyItem: false,
                        isNotHeader: false,
                        isExpanded: false,
                        hasSubItems: false
                    }));
                    const definedNames = arr[arr.length-1];
                    const ranges = this.settings.ranges;
                    let prev_level = 0;
                    count = ranges.length;
                    for (let i=0; i<count; i++) {
                        const range = ranges[i];
                        const scope = range.asc_getScope();
                        if (!range.asc_getIsHidden()) {
                            if (prev_level<1)
                                arr[arr.length-1].set('hasSubItems', true);
                            arr.push(new Common.UI.TreeViewModel({
                                name : (range.asc_getIsXlnm() && sheets[scope] ? `${sheets[scope].name}!` : '') + range.asc_getName(), // add sheet name for print area
                                level: 1,
                                index: arr.length,
                                type: 1, // defined name
                                isVisible: false,
                                hasParent: true
                            }));
                            prev_level = 1;
                        }
                    }
                    store.reset(arr);
                    const sheet = props ? (props.asc_getSheet() || props.asc_getLocation()) : this.api.asc_getWorksheetName(this.settings.currentSheet);
                    const rec = store.findWhere({name: sheet });
                    if (rec) {
                        this.internalList.expandRecord(rec.get('type') ? definedNames : store.at(0));
                        this.internalList.scrollToRecord(this.internalList.selectRecord(rec));
                    }
                }
                const rec = this.internalList.getSelectedRec();
                this.btnOk.setDisabled(!rec || rec.get('level')===0 || rec.get('type')===0 && $.trim(this.inputRange.getValue())==='');
                _.delay(()=> {
                    if (this.inputRange.isDisabled())
                        this.internalList.focus();
                    else
                        this.inputRange.focus();
                },50);
            } else {
                this.btnOk.setDisabled($.trim(this.inputUrl.getValue())==='');
                _.delay(()=> {
                    this.inputUrl.focus();
                },50);
            }
        },

        onLinkTypeClick: function(type, btn, event) {
            this.ShowHideElem(type);
            if (this.isAutoUpdate) {
                if (type===Asc.c_oAscHyperlinkType.RangeLink) {
                    const rec = this.internalList.getSelectedRec();
                    const list = rec?.get('level') ? rec.get('name') : '';
                    if (rec && rec.get('type')===1) {
                        this.inputDisplay.setValue(list);
                    } else {
                        const val = this.inputRange.getValue();
                        this.inputDisplay.setValue(list + (list!=='' && val!=='' ? '!' : '') + val);
                    }

                } else {
                    this.inputDisplay.setValue(this.inputUrl.getValue());
                }
            }
        },

        onSelectItem: function(picker, item, record, e){
            this.btnOk.setDisabled(record.get('level')===0 || record.get('type')===0 && $.trim(this.inputRange.getValue())==='');
            this.inputRange.setDisabled(record.get('type')===1 || record.get('level')===0);
            if (this.isAutoUpdate) {
                const list = record.get('level') ? record.get('name') : '';
                if (record.get('type')===1) {
                    this.inputDisplay.setValue(list);
                } else {
                    const val = this.inputRange.getValue();
                    this.inputDisplay.setValue(list + ((list!=='' && val!=='') ? '!' : '') + val);
                }
            }
            this.linkGetLink.toggleClass('disabled', record.get('level')===0);
        },

        getLink: function(btn) {
            if (btn.cmpEl?.parent().hasClass('open')) return;

            const record = this.internalList.getSelectedRec();
            if (record?.get('level')) {
                let name = record.get('name');
                if (record.get('type')===1) {
                    this.inputDisplay.setValue(name);
                } else {
                    const val = this.inputRange.getValue();
                    name = this.api.asc_getEscapeSheetName(name);
                    name = (name + ((name!=='' && val!=='') ? '!' : '') + val);
                }
                name && Common.Gateway.requestMakeActionLink({
                    action: {
                        type: "internallink", data: name
                    }
                });
            }
        },

        onSelectData: function() {
            if (this.api) {
                const handlerDlg = (dlg, result) => {
                    if (result === 'ok') {
                        this.dataRangeValid = dlg.getSettings();
                        const idx = this.dataRangeValid.indexOf('!');
                        (idx>=0) && (this.dataRangeValid = this.dataRangeValid.substring(idx+1, this.dataRangeValid.length));
                        const rec = this.internalList.store.findWhere({name: this.api.asc_getWorksheetName(this.api.asc_getActiveWorksheetIndex()) });
                        if (rec) {
                            this.internalList.expandRecord(this.internalList.store.at(0));
                            this.internalList.scrollToRecord(this.internalList.selectRecord(rec));
                        }
                        this.inputRange.setValue(this.dataRangeValid);
                        this.inputRange.checkValidate();
                        this.isAutoUpdate && this.inputDisplay.setValue(this.internalList.getSelectedRec().get('name') + (this.dataRangeValid!=='' ? `!${this.dataRangeValid}` : ''));
                        this.btnOk.setDisabled($.trim(this.dataRangeValid)==='');
                    }
                };

                const win = new SSE.Views.CellRangeDialog({
                    handler: handlerDlg
                }).on('close', () => {
                    this.show();
                    _.delay(()=> {
                        this.inputRange.focus();
                    },1);
                    _.delay(()=> {
                        this.api.asc_showWorksheet(this.settings.currentSheet);
                    },1);
                });

                this.api.asc_showWorksheet(this.internalList.getSelectedRec().get('index')-1);

                const xy = Common.Utils.getOffset(this.$window);
                this.hide();
                win.show(this.$window, xy);
                win.setSettings({
                    api     : this.api,
                    range   : (!_.isEmpty(this.inputRange.getValue()) && (this.inputRange.checkValidate()===true)) ? this.inputRange.getValue() : this.dataRangeValid,
                    type    : Asc.c_oAscSelectionDialogType.Chart
                });
            }
        },

        onSelectFile: function() {
            if (this.api) {
                const callback = (result) => {
                    if (result) {
                        this.inputUrl.setValue(result);
                        if (this.inputUrl.checkValidate() !== true)
                            this.isInputFirstChange_url = true;
                        this.isAutoUpdate && this.inputDisplay.setValue(result);
                        this.btnOk.setDisabled($.trim(result)==='');
                    }
                };

                this.api.asc_getFilePath(callback); // change sdk function
            }
        },

        textTitle:          'Hyperlink Settings',
        textInternalLink:   'Place in Document',
        textExternalLink:   'Web Link',
        textEmptyLink:      'Enter link here',
        textEmptyDesc:      'Enter caption here',
        textEmptyTooltip:   'Enter tooltip here',
        strSheet:           'Sheet',
        strRange:           'Range',
        strDisplay:         'Display',
        textTipText:        'Screen Tip Text',
        strLinkTo:          'Link To',
        txtEmpty:           'This field is required',
        textInvalidRange:   'ERROR! Invalid cells range',
        txtNotUrl:          'This field should be a URL in the format \"http://www.example.com\"',
        textDefault:        'Selected range',
        textSheets:         'Sheets',
        textNames:          'Defined names',
        textGetLink: 'Get Link',
        textCopy: 'Copy',
        textSelectData: 'Select data',
        txtSizeLimit: 'This field is limited to 2083 characters',
        txtUrlPlaceholder: 'Enter the web address or select a file',
        textSelectFile: 'Select file'
    }, SSE.Views.HyperlinkSettingsDialog || {}))
});