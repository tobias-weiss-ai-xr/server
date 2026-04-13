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
 *  ExternalOleEditor.js
 *
 *  Created on 3/10/22
 *
 */

if (Common === undefined)
    const Common = {};

Common.Controllers = Common.Controllers || {};

define([
    'core'
], () => { 
    Common.Controllers.ExternalOleEditor = Backbone.Controller.extend(_.extend((() => {
        let appLang         = '{{DEFAULT_LANG}}';
        let customization   = undefined;
        let targetApp       = '';
        let externalEditor  = null;
        let isAppFirstOpened = true;


        const createExternalEditor = function() {
            Common.UI.HintManager.setInternalEditorLoading(true);
            !!customization && (customization.uiTheme = Common.localStorage.getItem("ui-theme-id", "theme-light"));
            externalEditor = new DocsAPI.DocEditor('id-ole-editor-placeholder', {
                width       : '100%',
                height      : '100%',
                documentType: 'cell',
                document    : {
                    url         : '_ole_',
                    permissions : {
                        edit    : true,
                        download: false
                    }
                },
                editorConfig: {
                    mode            : 'editole',
                    targetApp       : targetApp,
                    lang            : appLang,
                    canCoAuthoring  : false,
                    canBackToFolder : false,
                    canCreateNew    : false,
                    customization   : customization,
                    user            : {id: (`uid-${Date.now()}`)}
                },
                events: {
                    'onAppReady'            : () => {},
                    'onDocumentStateChange' : () => {},
                    'onError'               : () => {},
                    'onInternalMessage'     : _.bind(this.onInternalMessage, this)
                }
            });
            Common.Gateway.on('processmouse', _.bind(this.onProcessMouse, this));
        };

        return {
            views: [],

            initialize: function() {
                this.addListeners({
                    'Common.Views.ExternalOleEditor': {
                        'setoledata': _.bind(this.setOleData, this),
                        'drag': _.bind((o, state)=> {
                            externalEditor?.serviceCommand('window:drag', state === 'start');
                        },this),
                        'resize': _.bind((o, state)=> {
                            externalEditor?.serviceCommand('window:resize', state === 'start');
                        },this),
                        'animate:before': _.bind(function(){
                            if(!this.isAppFirstOpened) {
                                externalEditor?.serviceCommand('reshow');
                            }
                        },this),
                        'show': _.bind(function(cmp){
                            const h = this.oleEditorView.getHeight();
                            const innerHeight = Common.Utils.innerHeight() - Common.Utils.InternalSettings.get('window-inactive-area-top');
                            if (innerHeight<h) {
                                this.oleEditorView.setHeight(innerHeight);
                            }

                            if (externalEditor) {
                                externalEditor.serviceCommand('setAppDisabled',false);
                                if (isAppFirstOpened && this.oleEditorView._isExternalDocReady) {
                                    isAppFirstOpened = false;
                                    this.oleEditorView._oleData && this.setOleData();
                                }

                                if (this.needDisableEditing && this.oleEditorView._isExternalDocReady) {
                                    this.onOleEditingDisabled();
                                }
                                externalEditor.attachMouseEvents();
                            } else {
                                require(['api'], function () {
                                    createExternalEditor.apply(this);
                                }.bind(this));
                            }
                            this.isExternalEditorVisible = true;
                            this.isHandlerCalled = false;
                        }, this),
                        'hide':  _.bind(function(cmp){
                            if (externalEditor) {
                                externalEditor.detachMouseEvents();
                                this.isExternalEditorVisible = false;
                            }
                            Common.UI.HintManager.setInternalEditorLoading(false);
                        }, this)
                    }
                });

                Common.NotificationCenter.on('script:loaded', _.bind(this.onPostLoadComplete, this));
            },

            onLaunch: () => {},

            onPostLoadComplete: function() {
                this.views = this.getApplication().getClasseRefs('view', ['Common.Views.ExternalOleEditor']);
                this.oleEditorView = this.createView('Common.Views.ExternalOleEditor',{handler: this.handler.bind(this)});
            },

            setApi: function(api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onCloseOleEditor', _.bind(this.onOleEditingDisabled, this));
                this.api.asc_registerCallback('asc_sendFromGeneralToOleEditor', _.bind(this.onSendFromGeneralToFrameEditor, this));
                return this;
            },

            handler: function(result, value) {
                if (this.isHandlerCalled) return;
                this.isHandlerCalled = true;
                if (this.oleEditorView._isExternalDocReady)
                    externalEditor?.serviceCommand('queryClose',{mr:result});
                else {
                    this.oleEditorView.hide();
                    this.isHandlerCalled = false;
                }
            },

            setOleData: function() {
                if (!isAppFirstOpened) {
                    externalEditor?.serviceCommand('setOleData', this.oleEditorView._oleData);
                    this.oleEditorView._oleData = null;
                }
            },

            loadConfig: (data) => {
                if (data?.config) {
                    if (data.config.lang) appLang = data.config.lang;
                    if (data.config.customization) customization = data.config.customization;
                    if (data.config.targetApp) targetApp = data.config.targetApp;
                }
            },

            onOleEditingDisabled: function() {
                if ( !this.oleEditorView.isVisible() || !this.oleEditorView._isExternalDocReady ) {
                    this.needDisableEditing = true;
                    return;
                }

                this.oleEditorView.setControlsDisabled(true);

                Common.UI.alert({
                    title: this.warningTitle,
                    msg  : this.warningText,
                    iconCls: 'warn',
                    buttons: ['ok'],
                    callback: _.bind(function(btn){
                        this.oleEditorView.setControlsDisabled(false);
                        this.oleEditorView.hide();
                    }, this)
                });

                this.needDisableEditing = false;
            },

            onInternalMessage: function(data) {
                const eventData  = data.data;

                if (this.oleEditorView) {
                    if (eventData.type === 'documentReady') {
                        this.oleEditorView._isExternalDocReady = true;
                        this.isExternalEditorVisible && (isAppFirstOpened = false);
                        this.oleEditorView._oleData && this.setOleData();
                        if (this.needDisableEditing) {
                            this.onOleEditingDisabled();
                        }
                    } else
                    if (eventData.type === 'frameEditorReady') {
                        if (this.needDisableEditing===undefined)
                            this.oleEditorView.setControlsDisabled(false);
                    } else
                    if (eventData.type === "shortcut") {
                        if (eventData.data.key === 'escape')
                            this.oleEditorView.hide();
                    } else
                    if (eventData.type === "canClose") {
                        if (eventData.data.answer === true) {
                            if (externalEditor) {
                                externalEditor.serviceCommand('setAppDisabled',true);
                                if (eventData.data.mr === 'ok')
                                    externalEditor.serviceCommand('getOleData');
                            }
                            this.oleEditorView.hide();
                        }
                        this.isHandlerCalled = false;
                    } else
                    if (eventData.type === "processMouse") {
                        if (eventData.data.event === 'mouse:up') {
                            this.oleEditorView.binding.dragStop();
                            if (this.oleEditorView.binding.resizeStop)  this.oleEditorView.binding.resizeStop();
                        } else
                        if (eventData.data.event === 'mouse:move') {
                            const x = Number.parseInt(this.oleEditorView.$window.css('left')) + eventData.data.pagex;
                            const y = Number.parseInt(this.oleEditorView.$window.css('top')) + eventData.data.pagey + 34;
                            this.oleEditorView.binding.drag({pageX:x, pageY:y});
                            if (this.oleEditorView.binding.resize)  this.oleEditorView.binding.resize({pageX:x, pageY:y});
                        }
                    }  else
                    if (eventData.type === "resize") {
                        const w = eventData.data.width;
                        const h = eventData.data.height;
                        if (w>0 && h>0)
                            this.oleEditorView.setInnerSize(w, h);
                    } else
                    if (eventData.type === "frameToGeneralData") {
                        this.api?.asc_getInformationBetweenFrameAndGeneralEditor(eventData.data);
                    } else
                        this.oleEditorView.fireEvent('internalmessage', this.oleEditorView, eventData);
                }
            } ,

            onProcessMouse: function(data) {
                if (data.type === 'mouseup' && this.isExternalEditorVisible) {
                    externalEditor?.serviceCommand('processmouse', data);
                }
            },

            onSendFromGeneralToFrameEditor: (data) => {
                externalEditor?.serviceCommand('generalToFrameData', data);
            },

            warningTitle: 'Warning',
            warningText: 'The object is disabled because of editing by another user.',
            textClose: 'Close',
            textAnonymous: 'Anonymous'
        }
    })(), Common.Controllers.ExternalOleEditor || {}));
});
