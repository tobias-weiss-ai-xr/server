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
 *  Protection.js
 *
 *  Created on 14.11.2017
 *
 */

if (Common === undefined)
    const Common = {};

Common.Views = Common.Views || {};

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout',
    'common/main/lib/component/Window'
], (template) => {

    Common.Views.Protection = Common.UI.BaseView.extend(_.extend(((()=> {
        const template =
            '<section id="protection-panel" class="panel" data-tab="protect" role="tabpanel" aria-labelledby="protect">' +
            '<div class="group">' +
                '<span id="slot-btn-add-password" class="btn-slot text x-huge"></span>' +
                '<span id="slot-btn-change-password" class="btn-slot text x-huge"></span>' +
                '<span id="slot-btn-signature" class="btn-slot text x-huge"></span>' +
            '</div>' +
            '<div class="separator long protect-form"></div>' + 
            '<div class="group">' +
                '<span id="slot-btn-protect-form" class="btn-slot text x-huge"></span>' +
            '</div>' +
            '</section>';

        function setEvents() {

            if (this.appConfig.isPasswordSupport) {
                this.btnsAddPwd.concat(this.btnsChangePwd).forEach((button) => {
                    button.on('click', (b, e) => {
                        this.fireEvent('protect:password', [b, 'add']);
                    });
                });

                this.btnsDelPwd.forEach((button) => {
                    button.on('click', (b, e) => {
                        this.fireEvent('protect:password', [b, 'delete']);
                    });
                });

                this.btnPwd.on('click', (b, e) => {
                    !b.pressed && this.fireEvent('protect:password', [b, 'delete']);
                });
                this.btnPwd.menu.on('item:click', (menu, item, e) => {
                    this.fireEvent('protect:password', [menu, item.value]);
                });
            }

            if (this.appConfig.isSignatureSupport) {
                if (this.btnSignature.menu) {
                    this.btnSignature.menu.on('item:click', (menu, item, e) => {
                        this.fireEvent('protect:signature', [item.value, false]);
                    });
                    this.btnSignature.menu.on('show:after', (menu, e) => {
                        if (this._state) {
                            const isProtected = this._state.docProtection ? this._state.docProtection.isReadOnly || this._state.docProtection.isFormsOnly || this._state.docProtection.isCommentsOnly : false;
                            menu.items?.[1].setDisabled(isProtected || this._state.disabled);
                        }
                    });
                }

                this.btnsInvisibleSignature.forEach((button) => {
                    button.on('click', (b, e) => {
                        this.fireEvent('protect:signature', ['invisible']);
                    });
                });
            }
            this._isSetEvents = true;
        }

        return {

            options: {},

            initialize: function (options) {
                Common.UI.BaseView.prototype.initialize.call(this, options);

                this.appConfig = options.mode;

                this.btnsInvisibleSignature = [];
                this.btnsAddPwd = [];
                this.btnsDelPwd = [];
                this.btnsChangePwd = [];

                this._state = {disabled: false, hasPassword: false, disabledPassword: false, invisibleSignDisabled: false};
                const filter = Common.localStorage.getKeysFilter();
                this.appPrefix = (filter?.length) ? filter.split(',')[0] : '';

                if ( this.appConfig.isPasswordSupport ) {
                    this.btnAddPwd = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-ic-protect',
                        caption: this.txtEncrypt,
                        dataHint    : '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.btnsAddPwd.push(this.btnAddPwd);

                    this.btnPwd = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-ic-protect',
                        caption: this.txtEncrypt,
                        split: true,
                        enableToggle: true,
                        menu: true,
                        visible: false,
                        dataHint    : '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                }
                if (this.appConfig.isSignatureSupport) {
                    this.btnSignature = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-ic-signature',
                        caption: this.txtSignature,
                        menu: (this.appPrefix !== 'pe-'),
                        dataHint    : '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    if (!this.btnSignature.menu)
                        this.btnsInvisibleSignature.push(this.btnSignature);
                }

                if(0 && this.appConfig.isPDFForm) {
                    this.btnProtectForm = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-restrict-editing',
                        caption: this.txtProtectForm,
                        enableToggle: true,
                        dataHint    : '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.btnProtectForm.on('toggle', (btn, state) => {
                        this.fireEvent('protect:protectForm', [state]);
                    });
                }

                Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            },

            render: function (el) {
                this.boxSdk = $('#editor_sdk');
                if ( el ) el.html( this.getPanel() );

                return this;
            },

            onAppReady: function (config) {
                (new Promise((accept, reject) => {
                    accept();
                })).then(()=> {
                    if ( config.canProtect) {
                        if ( config.isPasswordSupport) {
                            this.btnAddPwd.updateHint(this.hintAddPwd);
                            this.btnPwd.updateHint([this.hintDelPwd, this.hintPwd]);

                            this.btnPwd.setMenu(
                                new Common.UI.Menu({
                                    items: [
                                        {
                                            caption: this.txtChangePwd,
                                            value: 'add'
                                        },
                                        {
                                            caption: this.txtDeletePwd,
                                            value: 'delete'
                                        }
                                    ]
                                })
                            );
                        }
                        if (this.btnSignature) {
                            this.btnSignature.updateHint((this.btnSignature.menu) ? this.hintSignature : this.txtInvisibleSignature);
                            this.btnSignature.menu && this.btnSignature.setMenu(
                                new Common.UI.Menu({
                                    items: [
                                        {
                                            caption: this.txtInvisibleSignature,
                                            value: 'invisible'
                                        },
                                        {
                                            caption: this.txtSignatureLine,
                                            value: 'visible',
                                            disabled: this._state.disabled
                                        }
                                    ]
                                })
                            );
                        }
                        Common.NotificationCenter.trigger('tab:visible', 'protect', Common.UI.LayoutManager.isElementVisible('toolbar-protect'));
                    }
                    !this.btnProtectForm && (this.$el || $(this.el)).find('.separator.protect-form').hide();

                    setEvents.call(this);
                });
            },

            getPanel: function () {
                this.$el = $(_.template(template)( {} ));

                if ( this.appConfig.canProtect ) {
                    this.btnAddPwd?.render(this.$el.find('#slot-btn-add-password'));
                    this.btnPwd?.render(this.$el.find('#slot-btn-change-password'));
                    this.btnSignature?.render(this.$el.find('#slot-btn-signature'));
                    this.btnProtectForm?.render(this.$el.find('#slot-btn-protect-form'));
                }
                return this.$el;
            },

            show: function () {
                Common.UI.BaseView.prototype.show.call(this);
                this.fireEvent('show', this);
            },

            getButton: function(type, parent) {
                if ( type === 'signature' ) {
                    const button = new Common.UI.Button({
                        cls: 'btn-text-default auto',
                        caption: this.txtInvisibleSignature,
                        disabled: this._state.invisibleSignDisabled,
                        dataHint: '2',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'medium'
                    });
                    this.btnsInvisibleSignature.push(button);
                    if (this._isSetEvents) {
                        button.on('click', (b, e) => {
                            this.fireEvent('protect:signature', ['invisible']);
                        });
                    }
                    return button;
                }if ( type === 'add-password' ) {
                    const button = new Common.UI.Button({
                        cls: 'btn-text-default auto',
                        caption: this.txtAddPwd,
                        disabled: this._state.disabled || this._state.disabledPassword,
                        visible: !this._state.hasPassword,
                        dataHint: '2',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'medium'
                    });
                    this.btnsAddPwd.push(button);
                    if (this._isSetEvents) {
                        button.on('click', (b, e) => {
                            this.fireEvent('protect:password', [b, 'add']);
                        });
                    }
                    return button;
                }if ( type === 'del-password' ) {
                    const button = new Common.UI.Button({
                        cls: 'btn-text-default auto',
                        caption: this.txtDeletePwd,
                        disabled: this._state.disabled || this._state.disabledPassword,
                        visible: this._state.hasPassword,
                        dataHint: '2',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'medium'
                    });
                    this.btnsDelPwd.push(button);
                    if (this._isSetEvents) {
                        button.on('click', (b, e) => {
                            this.fireEvent('protect:password', [b, 'delete']);
                        });
                    }
                    return button;
                }if ( type === 'change-password' ) {
                    const button = new Common.UI.Button({
                        cls: 'btn-text-default auto',
                        caption: this.txtChangePwd,
                        disabled: this._state.disabled || this._state.disabledPassword,
                        visible: this._state.hasPassword,
                        dataHint: '2',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'medium'
                    });
                    this.btnsChangePwd.push(button);
                    if (this._isSetEvents) {
                        button.on('click', (b, e) => {
                            this.fireEvent('protect:password', [b, 'add']);
                        });
                    }
                    return button;
                }
            },

            SetDisabled: function (state, canProtect) {
                this._state.disabled = state;
                this._state.invisibleSignDisabled = state && !canProtect;
                const isProtected = this._state.docProtection ? this._state.docProtection.isReadOnly || this._state.docProtection.isFormsOnly || this._state.docProtection.isCommentsOnly : false;
                this.btnsInvisibleSignature?.forEach((button) => {
                    if ( button ) {
                        button.setDisabled(state && !canProtect);
                    }
                }, this);
                if (this.btnSignature?.menu) {
                    this.btnSignature.menu.items?.[1].setDisabled(state || isProtected); // disable adding signature line
                    this.btnSignature.setDisabled(state && !canProtect); // disable adding any signature
                }
                this.btnsAddPwd.concat(this.btnsDelPwd, this.btnsChangePwd).forEach(function(button) {
                    if ( button ) {
                        button.setDisabled(state || this._state.disabledPassword);
                    }
                }, this);
            },

            onDocumentPassword: function (hasPassword, disabledPassword) {
                this._state.hasPassword = hasPassword;
                this._state.disabledPassword = !!disabledPassword;
                const disabled = this._state.disabledPassword || this._state.disabled;
                this.btnsAddPwd?.forEach((button) => {
                    if ( button ) {
                        button.setVisible(!hasPassword);
                        button.setDisabled(disabled);
                    }
                }, this);
                this.btnsDelPwd.concat(this.btnsChangePwd).forEach((button) => {
                    if ( button ) {
                        button.setVisible(hasPassword);
                        button.setDisabled(disabled);
                    }
                }, this);
                this.btnPwd.setVisible(hasPassword);
                this.btnPwd.toggle(hasPassword, true);
            },

            txtEncrypt: 'Encrypt',
            txtProtectForm: 'Protect Form',
            txtSignature: 'Signature',
            hintAddPwd: 'Encrypt with password',
            hintPwd: 'Change or delete password',
            hintSignature: 'Add digital signature or signature line',
            txtChangePwd: 'Change password',
            txtDeletePwd: 'Delete password',
            txtAddPwd: 'Add password',
            txtInvisibleSignature: 'Add digital signature',
            txtSignatureLine: 'Add Signature line',
            hintDelPwd: 'Delete password'
        }
    })()), Common.Views.Protection || {}));
});