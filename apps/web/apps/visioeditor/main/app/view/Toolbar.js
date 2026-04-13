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
 *  Toolbar.js
 *
 *  Toolbar view
 *
 *  Created on 11/07/24
 *
 */
if (Common === undefined)
    const Common = {};

define([
    'jquery',
    'underscore',
    'backbone',
    'text!visioeditor/main/app/template/Toolbar.template',
    'text!visioeditor/main/app/template/ToolbarView.template',
    'common/main/lib/component/Button',
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/DataView',
    'common/main/lib/component/Menu',
    'common/main/lib/component/Window',
    'common/main/lib/component/SynchronizeTip',
    'common/main/lib/component/Mixtbar'
], ($, _, Backbone, template, template_view) => {

    if (!Common.enumLock)
        Common.enumLock = {};

    const enumLock = {
        cantPrint:      'cant-print',
        lostConnect:    'disconnect',
        disableOnStart: 'on-start',
        fileMenuOpened: 'file-menu-opened'
    };
    for (const key in enumLock) {
        if (enumLock.hasOwnProperty(key)) {
            Common.enumLock[key] = enumLock[key];
        }
    }

    VE.Views.Toolbar =  Common.UI.Mixtbar.extend(_.extend((()=> ({
            el: '#toolbar',

            // Compile our stats template
            // template: _.template(template),

            // Delegated events for creating new items, and clearing completed ones.
            events: {
                //
            },

            initialize: function () {

                /**
                 * UI Components
                 */

                this._state = {};
                Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
                return this;
            },

            applyLayoutEdit: (config) => {
                if (!config.isEdit) return;

                const _set = Common.enumLock;
                const arr = [];

                Common.UI.LayoutManager.addControls(arr);
                return arr;
            },

            applyLayout: function (config) {
                this.lockControls = [];
                const _set = Common.enumLock;
                if ( config.isEdit ) {
                } else {
                    Common.UI.Mixtbar.prototype.initialize.call(this, {
                            template: _.template(template_view),
                            tabs: [
                                {caption: this.textTabFile, action: 'file', layoutname: 'toolbar-file', haspanel:false, dataHintTitle: 'F'}
                            ]
                        }
                    );
                }
                return this;
            },

            render: function (mode) {

                /**
                 * Render UI layout
                 */

                this.fireEvent('render:before', [this]);

                this.isCompactView = mode.compactview;
                if ( mode.isEdit) {
                    // me.$el.html(me.rendererComponents(me.$layout, mode));
                } else {
                    this.$layout.find('.canedit').hide();
                    this.$layout.addClass('folded');
                    this.$el.html(this.$layout);
                }

                this.fireEvent('render:after', [this]);
                Common.UI.Mixtbar.prototype.afterRender.call(this);

                Common.NotificationCenter.on({
                    'window:resize': () => {
                        Common.UI.Mixtbar.prototype.onResize.apply(this, arguments);
                    }
                });

                if ( mode.isEdit ) {
                    // me.setTab('home');
                    // me.processPanelVisible();
                    // Common.NotificationCenter.on('desktop:window', _.bind(me.onDesktopWindow, me));
                }

                if ( this.isCompactView )
                    this.setFolded(true);

                return this;
            },

            onTabClick: function (e) {
                const tab = $(e.currentTarget).find('> a[data-tab]').data('tab');
                const is_file_active = this.isTabActive('file');

                if (!this._isDocReady || tab === 'file' && !Common.Controllers.LaunchController.isScriptLoaded()) return;

                Common.UI.Mixtbar.prototype.onTabClick.apply(this, arguments);

                if ( is_file_active ) {
                    this.fireEvent('file:close');
                } else
                if ( tab === 'file' ) {
                    this.fireEvent('file:open');
                    this.setTab(tab);
                }
            },

            rendererComponentsEdit: ($host, mode) => {
            },

            rendererComponentsCommon: ($host) => {
            },

            rendererComponents: function (html, mode) {
                const $host = $(html);
                this.rendererComponentsCommon($host);
                if (mode.isEdit) {
                    this.rendererComponentsEdit($host, mode);
                }

                return $host;
            },

            onAppReady: function (config) {
                this._isDocReady = true;
                (new Promise( (resolve, reject) => {
                    resolve();
                })).then(() => {
                });
            },

            createDelayedElementsCommon: () => {
            },

            createDelayedElementsEdit: function() {
                if (!this.mode.isEdit) return;
            },

            createDelayedElements: function () {
                this.createDelayedElementsCommon();
                if (this.mode.isEdit) {
                    this.createDelayedElementsEdit();
                }
            },

            onToolbarAfterRender: (toolbar) => {
                // DataView and pickers
            },

            setApi: function (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onAuthParticipantsChanged', _.bind(this.onApiUsersChanged, this));
                this.api.asc_registerCallback('asc_onParticipantsChanged', _.bind(this.onApiUsersChanged, this));
                return this;
            },

            setMode: function (mode) {
                if (mode.isDisconnected) {
                    this.lockToolbar(Common.enumLock.lostConnect, true);
                    if (!mode.enableDownload)
                        this.toolbar.fireEvent('print:disabled', [true]);
                } else {
                    this.toolbar.fireEvent('print:disabled', [!mode.canPrint]);
                }

                this.mode = mode;
            },

            /** coauthoring begin **/
            onApiUsersChanged: (users) => {
            },

            onDesktopWindow: () => {
            },
            /** coauthoring end **/

            lockToolbar: function (causes, lock, opts) {
                Common.Utils.lockControls(causes, lock, opts, this.lockControls);
            }
        }))(), VE.Views.Toolbar || {}));
});
