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
 *  Created on 4/19/14
 *
 */


if (Common === undefined)
    const Common = {};

const c_oHyperlinkType = {
    InternalLink:0,
    WebLink: 1
};

define([], () => { 
    PE.Views.HyperlinkSettingsDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 350,
            style: 'min-width: 230px;',
            cls: 'modal-dlg',
            id: 'window-hyperlink-settings',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box" style="height: 330px;">',
                    '<div style="margin-bottom: 10px;">',
                        '<button type="button" class="btn btn-text-default auto" id="id-dlg-hyperlink-external">', this.textExternalLink,'</button>',
                        '<button type="button" class="btn btn-text-default auto" id="id-dlg-hyperlink-internal">', this.textInternalLink,'</button>',
                    '</div>',
                    '<div id="id-external-link">',
                        '<div class="input-row">',
                            `<label>${this.strLinkTo}</label>`,
                        '</div>',
                        '<div id="id-dlg-hyperlink-url" class="input-row" style="margin-bottom: 5px;"></div>',
                    '</div>',
                    '<div id="id-internal-link" class="hidden">',
                        '<div class="input-row">',
                            `<label>${this.strLinkTo}</label>`,
                        '</div>',
                        '<div id="id-dlg-hyperlink-list" style="width:100%; height: 171px;"></div>',
                    '</div>',
                    '<div class="input-row">',
                        `<label>${this.strDisplay}</label>`,
                    '</div>',
                    '<div id="id-dlg-hyperlink-display" class="input-row" style="margin-bottom: 5px;"></div>',
                    '<div class="input-row">',
                        `<label>${this.textTipText}</label>`,
                    '</div>',
                    '<div id="id-dlg-hyperlink-tip" class="input-row" style="margin-bottom: 5px;"></div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            this.slides = this.options.slides;
            this.api = this.options.api;
            this.type = options.type;
            this.urlType = AscCommon.c_oAscUrlType.Invalid;
            this.appOptions = this.options.appOptions;

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
            this.btnExternal.on('click', _.bind(this.onLinkTypeClick, this, c_oHyperlinkType.WebLink));

            this.btnInternal = new Common.UI.Button({
                el: $('#id-dlg-hyperlink-internal'),
                enableToggle: true,
                toggleGroup: 'hyperlink-type',
                allowDepress: false
            });
            this.btnInternal.on('click', _.bind(this.onLinkTypeClick, this, c_oHyperlinkType.InternalLink));

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
                    if (trimmed.length>2083) return this.txtSizeLimit;

                    this.urlType = this.api.asc_getUrlType(trimmed);
                    return (this.urlType!==AscCommon.c_oAscUrlType.Invalid) ? true : this.txtNotUrl;
                }
            };
            this.inputUrl = this.appOptions.isDesktopApp ? new Common.UI.InputFieldBtn(config) : new Common.UI.InputField(config);
            this.inputUrl._input.on('input', (e) => {
                this.isInputFirstChange && this.inputUrl.showError();
                this.isInputFirstChange = false;
                const val = $(e.target).val();
                if (this.isAutoUpdate) {
                    this.inputDisplay.setValue(val);
                    this.isTextChanged = true;
                }
                this.btnOk.setDisabled($.trim(val)==='');
            });
            this.appOptions.isDesktopApp && this.inputUrl.on('button:click', _.bind(this.onSelectFile, this));

            this.inputDisplay = new Common.UI.InputField({
                el          : $('#id-dlg-hyperlink-display'),
                allowBlank  : true,
                validateOnBlur: false,
                style       : 'width: 100%;'
            }).on('changed:after', () => {
                this.isTextChanged = true;
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
                enableKeyEvents: true,
                tabindex: 1
            });
            this.internalList.on('item:select', _.bind(this.onSelectItem, this));

            this.btnOk = _.find(this.getFooterButtons(), (item) => (item.$el && item.$el.find('.primary').addBack().filter('.primary').length>0)) || new Common.UI.Button({ el: $window.find('.primary') });
            this.btnOk.setDisabled(true);

            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
            this.internalList.on('entervalue', _.bind(this.onPrimary, this));
            this.externalPanel = $window.find('#id-external-link');
            this.internalPanel = $window.find('#id-internal-link');
        },

        getFocusedComponents: function() {
            return [this.btnExternal, this.btnInternal, this.inputUrl, this.internalList, this.inputDisplay, this.inputTip].concat(this.getFooterButtons());
        },

        setSettings: function (props) {
            if (props) {

                const type = (this.type!==undefined) ? this.type : this.parseUrl(props.get_Value());
                (type === c_oHyperlinkType.WebLink) ? this.btnExternal.toggle(true) : this.btnInternal.toggle(true);
                this.ShowHideElem(type, props.get_Value());
                
                if (props.get_Text()!==null) {
                    this.inputDisplay.setValue(props.get_Text());
                    this.inputDisplay.setDisabled(false);
                    this.isAutoUpdate = (this.inputDisplay.getValue()==='' || type === c_oHyperlinkType.WebLink && this.inputUrl.getValue()===this.inputDisplay.getValue());
                } else {
                    this.inputDisplay.setValue(this.textDefault);
                    this.inputDisplay.setDisabled(true);
                }
                this.isTextChanged = false;
                this.inputTip.setValue(props.get_ToolTip());

                this._originalProps = props;
            }
        },

        getSettings: function () {
            const props   = new Asc.CHyperlinkProperty();
            let def_display = '';
            const type = this.btnExternal.isActive() ? c_oHyperlinkType.WebLink : c_oHyperlinkType.InternalLink;
            if (type===c_oHyperlinkType.InternalLink) {//InternalLink
                let url = "ppaction://hlink";
                let tip = '';
                const txttip = this.inputTip.getValue();
                const rec = this.internalList.getSelectedRec();
                if (rec) {
                    url = url + rec.get('type');
                    tip = rec.get('tiptext');
                }
                props.put_Value( url );
                props.put_ToolTip(_.isEmpty(txttip) ? tip : txttip);
                def_display = tip;
            } else {
                let url = $.trim(this.inputUrl.getValue());
                if (this.urlType!==AscCommon.c_oAscUrlType.Unsafe && ! /(((^https?)|(^ftp)):\/\/)|(^mailto:)/i.test(url) )
                    url = ( (this.urlType===AscCommon.c_oAscUrlType.Email) ? 'mailto:' : 'http://' ) + url;
                url = url.replace(/%20/g," ");
                props.put_Value( url );
                props.put_ToolTip(this.inputTip.getValue());
                def_display = url;
            }

            if (!this.inputDisplay.isDisabled() && (this.isTextChanged || _.isEmpty(this.inputDisplay.getValue()))) {
                if (_.isEmpty(this.inputDisplay.getValue()) || type===c_oHyperlinkType.WebLink && this.isAutoUpdate)
                    this.inputDisplay.setValue(def_display);
                props.put_Text(this.inputDisplay.getValue());
            }
            else
                props.put_Text(null);

            return props;
        },

        onBtnClick: function(event) {
            if (event.currentTarget?.attributes.result)
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
                    const checkdisp = this.inputDisplay.checkValidate();
                    if (checkurl !== true)  {
                        this.isInputFirstChange = true;
                        this.inputUrl.focus();
                        return;
                    }
                    if (checkdisp !== true) {
                        this.inputDisplay.focus();
                        return;
                    }
                    !this._originalProps.get_Value() &&  Common.Utils.InternalSettings.set("pe-settings-link-type", this.btnInternal.isActive());
                }
                this.options.handler.call(this, this, state);
            }

            this.close();
        },

        ShowHideElem: function(value, url) {
            this.externalPanel.toggleClass('hidden', value !== c_oHyperlinkType.WebLink);
            this.internalPanel.toggleClass('hidden', value !== c_oHyperlinkType.InternalLink);
            if (value===c_oHyperlinkType.InternalLink) {
                if (url===null || url===undefined || url==='' )
                    url = "ppaction://hlinkshowjump?jump=firstslide";
                const store = this.internalList.store;
                if (store.length<1) {
                    const arr = [];
                    let i = 0;
                    arr.push(new Common.UI.TreeViewModel({
                        name : this.txtFirst,
                        level: 0,
                        index: i++,
                        hasParent: false,
                        isEmptyItem: false,
                        isNotHeader: true,
                        hasSubItems: false,
                        type: "showjump?jump=firstslide",
                        tiptext: this.txtFirst,
                        selected: url === "ppaction://hlinkshowjump?jump=firstslide"
                    }));
                    arr.push(new Common.UI.TreeViewModel({
                        name : this.txtLast,
                        level: 0,
                        index: i++,
                        hasParent: false,
                        isEmptyItem: false,
                        isNotHeader: true,
                        hasSubItems: false,
                        type: "showjump?jump=lastslide",
                        tiptext: this.txtLast,
                        selected: url === "ppaction://hlinkshowjump?jump=lastslide"
                    }));
                    arr.push(new Common.UI.TreeViewModel({
                        name : this.txtNext,
                        level: 0,
                        index: i++,
                        hasParent: false,
                        isEmptyItem: false,
                        isNotHeader: true,
                        hasSubItems: false,
                        type: "showjump?jump=nextslide",
                        tiptext: this.txtNext,
                        selected: url === "ppaction://hlinkshowjump?jump=nextslide"
                    }));
                    arr.push(new Common.UI.TreeViewModel({
                        name : this.txtPrev,
                        level: 0,
                        index: i++,
                        hasParent: false,
                        isEmptyItem: false,
                        isNotHeader: true,
                        hasSubItems: false,
                        type: "showjump?jump=previousslide",
                        tiptext: this.txtPrev,
                        selected: url === "ppaction://hlinkshowjump?jump=previousslide"
                    }));
                    arr.push(new Common.UI.TreeViewModel({
                        name : this.textSlides,
                        level: 0,
                        index: i++,
                        hasParent: false,
                        isEmptyItem: false,
                        isNotHeader: true,
                        hasSubItems: this.api.getCountPages()>0
                    }));
                    const mask = "ppaction://hlinksldjumpslide";
                    const indSlide = url.indexOf(mask);
                    const slideNum = (0 === indSlide) ? Number.parseInt(url.substring(mask.length)) : -1;
                    for (let i=0; i<this.api.getCountPages(); i++) {
                        arr.push(new Common.UI.TreeViewModel({
                            name : `${this.txtSlide} ${i+1}`,
                            level: 1,
                            index: arr.length,
                            hasParent: false,
                            isEmptyItem: false,
                            isNotHeader: true,
                            hasSubItems: false,
                            type: `sldjumpslide${i}`,
                            tiptext: `${this.txtSlide} ${i+1}`,
                            selected: i===slideNum
                        }));
                    }
                    store.reset(arr);
                }
                const rec = this.internalList.getSelectedRec();
                rec && this.internalList.scrollToRecord(rec);
                this.btnOk.setDisabled(!rec || rec.get('index')===4);
                _.delay(()=> {
                    this.inputDisplay.focus();
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
                if (type===c_oHyperlinkType.InternalLink) {
                    const rec = this.internalList.getSelectedRec();
                    this.inputDisplay.setValue(rec && (rec.get('level') || rec.get('index')<4) ? rec.get('name') : '');
                } else {
                    this.inputDisplay.setValue(this.inputUrl.getValue());
                }
                this.isTextChanged = true;
            }
        },

        parseUrl: function(url) {
            if (url===null || url===undefined || url==='' )
                return Common.Utils.InternalSettings.get("pe-settings-link-type") ? c_oHyperlinkType.InternalLink : c_oHyperlinkType.WebLink;

            const indAction = url.indexOf("ppaction://hlink");
            if (0 === indAction)
            {
                return c_oHyperlinkType.InternalLink;
            }
                this.inputUrl.setValue(url ? url.replace(/ /g, "%20") : '');
                return c_oHyperlinkType.WebLink;
        },

        onSelectItem: function(picker, item, record, e){
            if (!record) return;
            this.btnOk.setDisabled(record.get('index')===4);
            if (this.isAutoUpdate) {
                this.inputDisplay.setValue((record.get('level') || record.get('index')<4) ? record.get('name') : '');
                this.isTextChanged = true;
            }
        },

        onSelectFile: function() {
            if (this.api) {
                const callback = (result) => {
                    if (result) {
                        this.inputUrl.setValue(result);
                        if (this.inputUrl.checkValidate() !== true)
                            this.isInputFirstChange = true;
                        if (this.isAutoUpdate) {
                            this.inputDisplay.setValue(result);
                            this.isTextChanged = true;
                        }
                        this.btnOk.setDisabled($.trim(result)==='');
                    }
                };

                this.api.asc_getFilePath(callback); // change sdk function
            }
        },

        textTitle:          'Hyperlink Settings',
        textInternalLink:   'Place in Document',
        textExternalLink:   'External Link',
        textEmptyLink:      'Enter link here',
        textEmptyDesc:      'Enter caption here',
        textEmptyTooltip:   'Enter tooltip here',
        txtSlide:           'Slide',
        strDisplay:         'Display',
        textTipText:        'Screen Tip Text',
        strLinkTo:          'Link To',
        txtEmpty:           'This field is required',
        txtNotUrl:          'This field should be a URL in the format \"http://www.example.com\"',
        txtNext:            'Next Slide',
        txtPrev:            'Previous Slide',
        txtFirst:           'First Slide',
        txtLast:            'Last Slide',
        textDefault:        'Selected text',
        textSlides: 'Slides',
        txtSizeLimit: 'This field is limited to 2083 characters',
        txtUrlPlaceholder: 'Enter the web address or select a file',
        textSelectFile: 'Select file'
    }, PE.Views.HyperlinkSettingsDialog || {}))
});