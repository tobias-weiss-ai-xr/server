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
Common.Controllers = Common.Controllers || {};

define([
    'core',
    'common/main/lib/view/Protection'
], () => {

    Common.Controllers.Protection = Backbone.Controller.extend(_.extend({
        models : [],
        collections : [
        ],
        views : [
            'Common.Views.Protection'
        ],
        sdkViewName : '#id_main',

        initialize: function () {

            this.addListeners({
                'Common.Views.Protection': {
                    'protect:password':      _.bind(this.onPasswordClick, this),
                    'protect:signature':     _.bind(this.onSignatureClick, this),
                    'protect:protectForm':   _.bind(this.onProtectForm, this),
                }
            });
        },
        onLaunch: function () {
            this._state = {};

            Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            Common.NotificationCenter.on('api:disconnect', _.bind(this.onCoAuthoringDisconnect, this));
        },
        setConfig: function (data, api) {
            this.setApi(api);

            if (data) {
                this.sdkViewName        =   data.sdkviewname || this.sdkViewName;
            }
        },
        setApi: function (api) {
            if (api) {
                this.api = api;

                if (this.appConfig.isPasswordSupport)
                    this.api.asc_registerCallback('asc_onDocumentPassword',  _.bind(this.onDocumentPassword, this));
                if (this.appConfig.isSignatureSupport) {
                    Common.NotificationCenter.on('protect:sign',            _.bind(this.onSignatureRequest, this));
                    Common.NotificationCenter.on('protect:signature',       _.bind(this.onSignatureClick, this));
                    this.api.asc_registerCallback('asc_onSignatureClick',   _.bind(this.onSignatureSign, this));
                    this.api.asc_registerCallback('asc_onUpdateSignatures', _.bind(this.onApiUpdateSignatures, this));
                }
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.onCoAuthoringDisconnect, this));

                Common.NotificationCenter.on('doc:mode-changed',  _.bind(this.onChangeDocMode, this));
            }
        },

        setMode: function(mode) {
            this.appConfig = mode;

            this.view = this.createView('Common.Views.Protection', {
                mode: mode
            });

            return this;
        },

        onDocumentPassword: function(hasPassword, disabled) {
            this.view?.onDocumentPassword(hasPassword, disabled);
        },

        SetDisabled: function(state, canProtect) {
            this.view?.SetDisabled(state, canProtect);
        },

        onPasswordClick: function(btn, opts){
            switch (opts) {
                case 'add': this.addPassword(); break;
                case 'delete': this.deletePassword(); break;
            }

            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        onSignatureRequest: function(guid){
            this.api.asc_RequestSign(guid);
        },

        onSignatureClick: function(type, signed, guid){
            switch (type) {
                case 'invisible': this.onSignatureRequest('unvisibleAdd'); break;
                case 'visible': this.addVisibleSignature(signed, guid); break;
            }
        },

        onProtectForm: function(state) {
            this.api?.asc_markAsFinal(state);
        },

        createToolbarPanel: function() {
            return this.view.getPanel();
        },

        getView: function(name) {
            return !name && this.view ?
                this.view : Backbone.Controller.prototype.getView.call(this, name);
        },

        onAppReady: function (config) {
            (new Promise((accept, reject) => {
                accept();
            })).then(()=> {
                this.onChangeProtectDocument();
                Common.NotificationCenter.on('protect:doclock', _.bind(this.onChangeProtectDocument, this));
            });
        },

        onChangeProtectDocument: function(props) {
            if (!props) {
                const docprotect = this.getApplication().getController('DocProtection');
                props = docprotect ? docprotect.getDocProps() : null;
            }
            if (props && this.view) {
                this.view._state.docProtection = props;
            }
        },

        addPassword: function() {
            const win = new Common.Views.PasswordDialog({
                    api: this.api,
                    handler: (result, props) => {
                        if (result === 'ok') {
                            this.api.asc_setCurrentPassword(props);
                        }
                        Common.NotificationCenter.trigger('edit:complete');
                    }
                });

            win.show();
        },

        deletePassword: function() {
            this.api.asc_resetPassword();
        },

        addInvisibleSignature: function() {
            const win = new Common.Views.SignDialog({
                    api: this.api,
                    signType: 'invisible',
                    handler: (dlg, result) => {
                        if (result === 'ok') {
                            const props = dlg.getSettings();
                            this.api.asc_Sign(props.certificateId);
                        }
                        Common.NotificationCenter.trigger('edit:complete');
                    }
                });

            win.show();
        },

        addVisibleSignature: function(signed, guid) {
            const win = new Common.Views.SignSettingsDialog({
                    type: (!signed) ? 'edit' : 'view',
                    handler: (dlg, result) => {
                        if (!signed && result === 'ok') {
                            this.api.asc_AddSignatureLine2(dlg.getSettings());
                        }
                        Common.NotificationCenter.trigger('edit:complete');
                    }
                });

            win.show();

            if (guid)
                win.setSettings(this.api.asc_getSignatureSetup(guid));
        },

        signVisibleSignature: function(guid, width, height) {
            if (_.isUndefined(this.fontStore)) {
                this.fontStore = new Common.Collections.Fonts();
                const fonts = this.getApplication().getController('Toolbar').getView('Toolbar').cmbFontName.store.toJSON();
                const arr = [];
                _.each(fonts, (font, index)=> {
                    if (!font.cloneid) {
                        arr.push(_.clone(font));
                    }
                });
                this.fontStore.add(arr);
            }

            const win = new Common.Views.SignDialog({
                api: this.api,
                signType: 'visible',
                fontStore: this.fontStore,
                signSize: {width: width || 0, height: height || 0},
                handler: (dlg, result) => {
                    if (result === 'ok') {
                        const props = dlg.getSettings();
                        this.api.asc_Sign(props.certificateId, guid, props.images[0], props.images[1]);
                    }
                    Common.NotificationCenter.trigger('edit:complete');
                }
            });

            win.show();
        },

        onSignatureSign: function(guid, width, height, isVisible) {
            (isVisible) ? this.signVisibleSignature(guid, width, height) : this.addInvisibleSignature();
        },

        onApiUpdateSignatures: function(valid, requested){
            this.SetDisabled(valid && valid.length>0, true);// can add invisible signature
        },

        onCoAuthoringDisconnect: function() {
            this.SetDisabled(true);
        },

        onChangeDocMode: function () {
            if(this.view?.btnProtectForm) {
                this.view.btnProtectForm.toggle(this.api.asc_isFinal(), true);
            }
        }

    }, Common.Controllers.Protection || {}));
});