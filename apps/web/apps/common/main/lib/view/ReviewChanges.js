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
 *  ReviewChanges.js
 *
 *  View
 *
 *  Created on 05.08.15
 *
 */

if (Common === undefined)
    const Common = {};

Common.Views = Common.Views || {};

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/Button',
    'common/main/lib/component/DataView',
    'common/main/lib/component/Layout',
    'common/main/lib/component/Window'
], () => {

    if (!Common.enumLock)
        Common.enumLock = {};

    const enumLock = {
        noSpellcheckLangs: 'no-spellcheck-langs',
        isReviewOnly:   'review-only',
        reviewChangelock: 'review-change-lock',
        hasCoeditingUsers: 'has-coediting-users',
        previewReviewMode: 'preview-review-mode', // display mode on Collaboration tab
        viewFormMode:   'view-form-mode', // view form mode on Forms tab
        viewMode:       'view-mode', // view mode on disconnect, version history etc (used for locking buttons not in toolbar) or view mode from header mode button (for toolbar)
        hideComments:   'hide-comments', // no live comments and left panel is closed
        cantShare: 'cant-share',
        customLock: 'custom-lock' // for custom buttons in toolbar
    };
    for (const key in enumLock) {
        if (enumLock.hasOwnProperty(key)) {
            Common.enumLock[key] = enumLock[key];
        }
    }

    Common.Views.ReviewChanges = Common.UI.BaseView.extend(_.extend(((()=> {
        const template =
            '<section id="review-changes-panel" class="panel" data-tab="review" role="tabpanel" aria-labelledby="review">' +
                '<div class="group no-group-mask review">' +
                    '<span id="slot-btn-sharing" class="btn-slot text x-huge"></span>' +
                    '<span id="slot-btn-coauthmode" class="btn-slot text x-huge"></span>' +
                '</div>' +
                '<div class="separator long sharing"></div>' +
                '<div class="group">' +
                    '<span class="btn-slot text x-huge slot-comment"></span>' +
                    '<span class="btn-slot text x-huge" id="slot-comment-remove"></span>' +
                    '<span class="btn-slot text x-huge" id="slot-comment-resolve"></span>' +
                '</div>' +
                '<div class="separator long comments"></div>' +
                '<div class="group">' +
                    '<span id="btn-review-on" class="btn-slot text x-huge"></span>' +
                '</div>' +
                '<div class="group no-group-mask review" style="padding-left: 0;padding-right:0;">' +
                    '<span id="btn-review-view" class="btn-slot text x-huge"></span>' +
                '</div>' +
                '<div class="group move-changes" style="padding-left: 0;padding-right:0;">' +
                    '<span id="btn-change-prev" class="btn-slot text x-huge"></span>' +
                    '<span id="btn-change-next" class="btn-slot text x-huge"></span>' +
                    '<span id="btn-change-accept" class="btn-slot text x-huge"></span>' +
                    '<span id="btn-change-reject" class="btn-slot text x-huge"></span>' +
                '</div>' +
                '<div class="separator long review"></div>' +
                '<div class="group">' +
                    '<span id="slot-btn-compare" class="btn-slot text x-huge"></span>' +
                    '<span id="slot-btn-combine" class="btn-slot text x-huge"></span>' +
                '</div>' +
                '<div class="separator long compare"></div>' +
                '<div class="group no-group-mask review form-view">' +
                    '<span id="slot-btn-chat" class="btn-slot text x-huge"></span>' +
                '</div>' +
                '<div class="separator long chat"></div>' +
                '<div class="group no-group-mask review form-view">' +
                    '<span id="slot-btn-history" class="btn-slot text x-huge"></span>' +
                '</div>' +
                '<div class="separator long history"></div>' +
                '<div class="group">' +
                    '<span id="slot-btn-mailrecepients" class="btn-slot text x-huge" data-layout-name="toolbar-collaboration-mailmerge"></span>' +
                '</div>' +
            '</section>';

        function setEvents() {
            const me = this;

            if ( me.appConfig.canReview ) {
                this.btnAccept.on('click', (e) => {
                    me.fireEvent('reviewchange:accept', [me.btnAccept, 'current']);
                });

                this.btnAccept.menu?.on('item:click', (menu, item, e) => {
                    me.fireEvent('reviewchange:accept', [menu, item]);
                });

                this.btnReject.on('click', (e) => {
                    me.fireEvent('reviewchange:reject', [me.btnReject, 'current']);
                });

                this.btnReject.menu?.on('item:click', (menu, item, e) => {
                    me.fireEvent('reviewchange:reject', [menu, item]);
                });

                if (me.appConfig.canFeatureComparison) {
                    this.btnCompare.on('click', (e) => {
                        me.fireEvent('reviewchange:compare', ['file']);
                    });

                    this.btnCompare.menu.on('item:click', (menu, item, e) => {
                        me.fireEvent('reviewchange:compare', [item.value]);
                    });


                    this.btnCombine.on('click', (e) => {
                        me.fireEvent('reviewchange:combine', ['file']);
                    });

                    this.btnCombine.menu.on('item:click', (menu, item, e) => {
                        me.fireEvent('reviewchange:combine', [item.value]);
                    });
                }

                this.btnsTurnReview.forEach((button) => {
                    button.on('click', (btn, e) => {
                        Common.NotificationCenter.trigger('reviewchanges:turn', btn.pressed);
                        Common.NotificationCenter.trigger('edit:complete');
                    });
                    !me.appConfig.isReviewOnly && button.menu.on('item:toggle', (menu, item, state, e) => {
                        if (state) {
                            if (item.value===2) // ON track changes for everyone
                                Common.UI.warning({
                                    title: me.textWarnTrackChangesTitle,
                                    msg: me.textWarnTrackChanges,
                                    maxwidth: 600,
                                    buttons: [{
                                        value: 'enable',
                                        caption: me.textEnable
                                    }, 'cancel'],
                                    primary: 'enable',
                                    callback: (btn)=> {
                                        if (btn === 'enable') {
                                            Common.NotificationCenter.trigger('reviewchanges:turn', item.value===0 || item.value===2, item.value>1);
                                        } else {
                                            const old = Common.Utils.InternalSettings.get(`${me.appPrefix}track-changes`);
                                            me.turnChanges(old===0 || old===2, old>1);
                                        }
                                        Common.NotificationCenter.trigger('edit:complete');
                                    }
                                });
                            else
                                Common.NotificationCenter.trigger('reviewchanges:turn', item.value===0 || item.value===2, item.value>1);
                        }
                    });
                });
            }
            if (this.appConfig.canViewReview) {
                this.btnPrev.on('click', (e) => {
                    me.fireEvent('reviewchange:preview', [me.btnPrev, 'prev']);
                });

                this.btnNext.on('click', (e) => {
                    me.fireEvent('reviewchange:preview', [me.btnNext, 'next']);
                });

                this.btnReviewView?.menu.on('item:click', (menu, item, e) => {
                    me.fireEvent('reviewchange:view', [menu, item]);
                });
            }

            this.btnsSpelling.forEach((button) => {
                button.on('click', (b, e) => {
                    Common.NotificationCenter.trigger('spelling:turn', b.pressed ? 'on' : 'off');
                    Common.NotificationCenter.trigger('edit:complete', me);
                });
            });

            this.btnsDocLang.forEach((button) => {
                button.on('click', function (b, e) {
                    me.fireEvent('lang:document', this);
                });
            });

            this.btnSharing?.on('click', (btn, e) => {
                Common.NotificationCenter.trigger('collaboration:sharing');
            });

            this.btnCoAuthMode?.menu.on('item:click', (menu, item, e) => {
                me.fireEvent('collaboration:coauthmode', [menu, item]);
            });

            this.btnHistory?.on('click', (btn, e) => {
                Common.NotificationCenter.trigger('collaboration:history');
            });

            this.btnChat?.on('click', (btn, e) => {
                me.fireEvent('collaboration:chat', [btn.pressed]);
            });

            if (this.btnCommentRemove) {
                this.btnCommentRemove.on('click', (e) => {
                    me.fireEvent('comment:removeComments', ['current']);
                });

                this.btnCommentRemove.menu.on('item:click', (menu, item, e) => {
                    me.fireEvent('comment:removeComments', [item.value]);
                });
            }
            if (this.btnCommentResolve) {
                this.btnCommentResolve.on('click', (e) => {
                    me.fireEvent('comment:resolveComments', ['current']);
                });

                this.btnCommentResolve.menu.on('item:click', (menu, item, e) => {
                    me.fireEvent('comment:resolveComments', [item.value]);
                });
            }

            this.mnuMailRecepients?.on('item:click', (menu, item, e) => {
                    me.fireEvent('collaboration:mailmerge', [item.value]);
                });

            Common.NotificationCenter.on('protect:doclock', (e) => {
                me.fireEvent('protect:update');
            });
            me.fireEvent('protect:update');
        }

        return {
            // el: '#review-changes-panel',

            options: {},

            initialize: function (options) {
                Common.UI.BaseView.prototype.initialize.call(this, options);

                this.appConfig = options.mode;
                this.tabOptions = {
                    canCommentResolve: options.tabOptions && options.tabOptions.canCommentResolve !== undefined
                        ? options.tabOptions.canCommentResolve
                        : true
                }
                this.lockedControls = [];
                const filter = Common.localStorage.getKeysFilter();
                this.appPrefix = (filter?.length) ? filter.split(',')[0] : '';
                const _set = Common.enumLock;
                if ( this.appConfig.canReview ) {
                    this.btnAccept = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        caption: this.txtAccept,
                        split: !this.appConfig.canUseReviewPermissions,
                        iconCls: 'toolbar__icon btn-review-save',
                        lock: [_set.reviewChangelock, _set.isReviewOnly, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.docLockReview, _set.viewMode],
                        action: 'review-accept',
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.lockedControls.push(this.btnAccept);

                    this.btnReject = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        caption: this.txtReject,
                        split: !this.appConfig.canUseReviewPermissions,
                        iconCls: 'toolbar__icon btn-review-deny',
                        lock: [_set.reviewChangelock, _set.isReviewOnly, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.docLockReview, _set.viewMode],
                        action: 'review-reject',
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.lockedControls.push(this.btnReject);

                    if (this.appConfig.canFeatureComparison) {
                        this.btnCompare = new Common.UI.Button({
                            cls: 'btn-toolbar  x-huge icon-top',
                            caption: this.txtCompare,
                            split: true,
                            iconCls: 'toolbar__icon btn-compare',
                            lock: [_set.hasCoeditingUsers, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.viewMode],
                            action: 'compare-document',
                            dataHint: '1',
                            dataHintDirection: 'bottom',
                            dataHintOffset: 'small'
                        });
                        this.lockedControls.push(this.btnCompare);

                        this.btnCombine = new Common.UI.Button({
                            cls: 'btn-toolbar  x-huge icon-top',
                            caption: this.txtCombine,
                            split: true,
                            iconCls: 'toolbar__icon btn-combine',
                            lock: [_set.hasCoeditingUsers, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.viewMode],
                            action: 'combine-document',
                            dataHint: '1',
                            dataHintDirection: 'bottom',
                            dataHintOffset: 'small'
                        });
                        this.lockedControls.push(this.btnCombine);
                    }
                    this.btnTurnOn = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-big-ic-review',
                        lock: [_set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.docLockReview, _set.viewMode],
                        caption: this.txtTurnon,
                        split: !this.appConfig.isReviewOnly,
                        action: 'track-changes',
                        enableToggle: true,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.btnsTurnReview = [this.btnTurnOn];
                    this.lockedControls.push(this.btnTurnOn);
                }
                if (this.appConfig.canViewReview) {
                    this.btnPrev = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: Common.UI.isRTL() ? 'toolbar__icon btn-review-next' : 'toolbar__icon btn-review-prev',
                        lock: [_set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.viewMode, _set.viewMode],
                        caption: this.txtPrev,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.lockedControls.push(this.btnPrev);

                    this.btnNext = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls:  Common.UI.isRTL() ? 'toolbar__icon btn-review-prev' : 'toolbar__icon btn-review-next',
                        lock: [_set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.viewMode, _set.viewMode],
                        caption: this.txtNext,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.lockedControls.push(this.btnNext);

                    if (!this.appConfig.isRestrictedEdit && !(this.appConfig.customization?.review?.hideReviewDisplay)) {// hide Display mode option for fillForms and commenting mode
                        const menuTemplate = _.template('<a id="<%= id %>" tabindex="-1" type="menuitem"><div><b><%= caption %></b></div>' +
                            '<% if (options.description !== null) { %><label class="description"><%= options.description %></label>' +
                            '<% } %></a>');

                        this.btnReviewView = new Common.UI.Button({
                            cls: 'btn-toolbar x-huge icon-top',
                            iconCls: 'toolbar__icon btn-ic-reviewview',
                            lock: [_set.viewFormMode, _set.lostConnect, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.viewMode],
                            caption: this.txtView,
                            menu: new Common.UI.Menu({
                                cls: 'ppm-toolbar',
                                items: [
                                    {
                                        caption: this.txtMarkupCap,
                                        checkable: true,
                                        toggleGroup: 'menuReviewView',
                                        checked: true,
                                        value: 'markup',
                                        template: menuTemplate,
                                        description: Common.Utils.String.format(this.txtMarkup, !this.appConfig.isEdit && !this.appConfig.isRestrictedEdit ? '' : `(${this.txtEditing})`)
                                    },
                                    {
                                        caption: this.txtMarkupSimpleCap,
                                        checkable: true,
                                        toggleGroup: 'menuReviewView',
                                        checked: false,
                                        value: 'simple',
                                        template: menuTemplate,
                                        description: Common.Utils.String.format(this.txtMarkupSimple, !this.appConfig.isEdit && !this.appConfig.isRestrictedEdit ? '' : `(${this.txtEditing})`)
                                    },
                                    {
                                        caption: this.txtFinalCap,
                                        checkable: true,
                                        toggleGroup: 'menuReviewView',
                                        checked: false,
                                        template: menuTemplate,
                                        description: Common.Utils.String.format(this.txtFinal, !this.appConfig.isEdit && !this.appConfig.isRestrictedEdit ? '' : `(${this.txtPreview})`),
                                        value: 'final'
                                    },
                                    {
                                        caption: this.txtOriginalCap,
                                        checkable: true,
                                        toggleGroup: 'menuReviewView',
                                        checked: false,
                                        template: menuTemplate,
                                        description: Common.Utils.String.format(this.txtOriginal, !this.appConfig.isEdit && !this.appConfig.isRestrictedEdit ? '' : `(${this.txtPreview})`),
                                        value: 'original'
                                    }
                                ]
                            }),
                            action: 'review-display-mode',
                            dataHint: '1',
                            dataHintDirection: 'bottom',
                            dataHintOffset: 'small'
                        });
                        this.lockedControls.push(this.btnReviewView);
                    }
                }

                if ((!!this.appConfig.sharingSettingsUrl && this.appConfig.sharingSettingsUrl.length || this.appConfig.canRequestSharingSettings) && this._readonlyRights!==true) {
                    this.btnSharing = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-ic-sharing',
                        lock: [_set.viewFormMode, _set.cantShare, _set.lostConnect],
                        caption: this.txtSharing,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.lockedControls.push(this.btnSharing);
                }

                if (this.appConfig.isEdit && !this.appConfig.isOffline && this.appConfig.canCoAuthoring && this.appConfig.canChangeCoAuthoring) {
                    this.btnCoAuthMode = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-ic-coedit',
                        lock: [_set.viewFormMode, _set.lostConnect, _set.docLockView, _set.viewMode],
                        caption: this.txtCoAuthMode,
                        menu: true,
                        action: 'co-edit-mode',
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.lockedControls.push(this.btnCoAuthMode);
                }

                this.btnsSpelling = [];
                this.btnsDocLang = [];

                if (this.appConfig.canUseHistory && !this.appConfig.isDisconnected) {
                    this.btnHistory = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-ic-history',
                        lock: [_set.lostConnect],
                        caption: this.txtHistory,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.lockedControls.push(this.btnHistory);
                }

                if (this.appConfig.canCoAuthoring && this.appConfig.canChat) {
                    this.btnChat = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-ic-chat',
                        lock: [_set.lostConnect],
                        caption: this.txtChat,
                        enableToggle: true,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.lockedControls.push(this.btnChat);
                }

                if ( this.appConfig.canCoAuthoring && this.appConfig.canComments ) {
                    this.canComments = true; // fix for loading protected document
                    this.btnCommentRemove = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        caption: this.txtCommentRemove,
                        split: true,
                        iconCls: 'toolbar__icon btn-rem-comment',
                        lock: [_set.previewReviewMode, _set.viewFormMode, _set.hideComments, _set.Objects, _set.lostConnect, _set.docLockView, _set.docLockForms, _set.viewMode, _set.slideMasterMode],
                        action: 'comment-remove',
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.lockedControls.push(this.btnCommentRemove);
                    if(this.tabOptions.canCommentResolve) {
                        this.btnCommentResolve = new Common.UI.Button({
                            cls: 'btn-toolbar x-huge icon-top',
                            caption: this.txtCommentResolve,
                            split: true,
                            iconCls: 'toolbar__icon btn-resolve-all',
                            lock: [_set.previewReviewMode, _set.viewFormMode, _set.hideComments, _set.Objects, _set.lostConnect, _set.docLockView, _set.docLockForms, _set.viewMode, _set.slideMasterMode],
                            action: 'comment-resolve',
                            dataHint: '1',
                            dataHintDirection: 'bottom',
                            dataHintOffset: 'small'
                        });
                        this.lockedControls.push(this.btnCommentResolve);
                    }
                }

                if (this.appConfig.isEdit && this.appConfig.canCoAuthoring && this.appConfig.canUseMailMerge) {
                    this.btnMailRecepients = new Common.UI.Button({
                        id: 'id-toolbar-btn-mailrecepients',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-mailmerge',
                        lock: [_set.mmergeLock, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.viewMode],
                        caption: this.txtMailMerge,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small',
                        menu: new Common.UI.Menu({
                            items: [
                                {caption: this.mniMMFromFile, value: 'file'},
                                {caption: this.mniMMFromUrl, value: 'url'},
                                {caption: this.mniMMFromStorage, value: 'storage'}
                            ]
                        }),
                        action: 'mail-merge'
                    });
                    this.mnuMailRecepients = this.btnMailRecepients.menu;
                    this.lockedControls.push(this.btnMailRecepients);
                }
                Common.UI.LayoutManager.addControls(this.lockedControls);
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
                    const menuTemplate = _.template('<a id="<%= id %>" tabindex="-1" type="menuitem"><div><b><%= caption %></b></div>' +
                        '<% if (options.description !== null) { %><label class="description"><%= options.description %></label>' +
                        '<% } %></a>');

                    if ( config.canReview ) {
                        const idx = Common.Utils.InternalSettings.get(`${this.appPrefix}track-changes`);
                        !config.isReviewOnly && this.btnTurnOn.setMenu(
                            new Common.UI.Menu({items: [
                                {
                                    caption: this.txtOn,
                                    value: 0,
                                    checkable: true,
                                    checked: idx===0,
                                    toggleGroup: 'menuTurnReviewTlb'
                                },
                                {
                                    caption: this.txtOff,
                                    value: 1,
                                    checkable: true,
                                    checked: idx===1,
                                    toggleGroup: 'menuTurnReviewTlb'
                                },
                                {
                                    caption: this.txtOnGlobal,
                                    value: 2,
                                    checkable: true,
                                    checked: idx===2,
                                    toggleGroup: 'menuTurnReviewTlb'
                                },
                                {
                                    caption: this.txtOffGlobal,
                                    value: 3,
                                    checkable: true,
                                    checked: idx===3,
                                    toggleGroup: 'menuTurnReviewTlb'
                                }
                            ]})
                        );
                        this.btnTurnOn.updateHint(this.tipReview);

                        if (!this.appConfig.canUseReviewPermissions) {
                            this.btnAccept.setMenu(
                                new Common.UI.Menu({
                                    items: [
                                        {
                                            caption: this.txtAcceptCurrent,
                                            value: 'current'
                                        },
                                        {
                                            caption: this.txtAcceptAll,
                                            value: 'all'
                                        }
                                    ]
                                })
                            );
                            this.btnReject.setMenu(
                                new Common.UI.Menu({
                                    items: [
                                        {
                                            caption: this.txtRejectCurrent,
                                            value: 'current'
                                        },
                                        {
                                            caption: this.txtRejectAll,
                                            value: 'all'
                                        }
                                    ]
                                })
                            );
                        }
                        this.btnAccept.updateHint([this.tipAcceptCurrent, this.txtAcceptChanges]);
                        this.btnReject.updateHint([this.tipRejectCurrent, this.txtRejectChanges]);

                        if (config.canFeatureComparison) {
                            this.btnCompare.setMenu(new Common.UI.Menu({
                                items: [
                                    {caption: this.mniFromFile, value: 'file'},
                                    {caption: this.mniFromUrl, value: 'url'},
                                    {caption: this.mniFromStorage, value: 'storage'}
                                    ,{caption: '--'},
                                    {caption: this.mniSettings, value: 'settings'}
                                ]
                            }));
                            this.btnCompare.menu.items[2].setVisible(this.appConfig.canRequestSelectDocument || this.appConfig.canRequestCompareFile || this.appConfig.fileChoiceUrl && this.appConfig.fileChoiceUrl.indexOf("{documentType}")>-1);
                            this.btnCompare.menu.items[1].setDisabled(this.appConfig.disableNetworkFunctionality);
                            this.btnCompare.menu.items[2].setDisabled(this.appConfig.disableNetworkFunctionality);
                            this.btnCompare.updateHint(this.tipCompare);


                            this.btnCombine.setMenu(new Common.UI.Menu({
                                items: [
                                    {caption: this.mniFromFile, value: 'file'},
                                    {caption: this.mniFromUrl, value: 'url'},
                                    {caption: this.mniFromStorage, value: 'storage'}
                                    ,{caption: '--'},
                                    {caption: this.mniSettings, value: 'settings'}
                                ]
                            }));
                            this.btnCombine.menu.items[2].setVisible(this.appConfig.canRequestSelectDocument || this.appConfig.fileChoiceUrl && this.appConfig.fileChoiceUrl.indexOf("{documentType}")>-1);
                            this.btnCombine.menu.items[1].setDisabled(this.appConfig.disableNetworkFunctionality);
                            this.btnCombine.menu.items[2].setDisabled(this.appConfig.disableNetworkFunctionality);
                            this.btnCombine.updateHint(this.tipCombine);
                        }

                        Common.Utils.lockControls(Common.enumLock.isReviewOnly, config.isReviewOnly, {array: [this.btnAccept, this.btnReject]});
                    }
                    if (this.appConfig.canViewReview) {
                        this.btnPrev.updateHint(this.hintPrev);
                        this.btnNext.updateHint(this.hintNext);

                        this.btnReviewView?.updateHint(this.tipReviewView);
                    }
                    this.btnSharing?.updateHint(this.tipSharing);
                    this.btnHistory?.updateHint(this.tipHistory);
                    if(this.btnChat) {
                        const app = (window.DE || window.PE || window.SSE || window.PDFE || window.VE);
                        app.getController('Common.Controllers.Shortcuts').updateShortcutHints({
                            OpenChatPanel: {
                                btn: this.btnChat,
                                label: this.txtChat
                            }
                        });
                    }
                    this.btnMailRecepients?.updateHint(this.tipMailRecepients);
                    if (this.btnCoAuthMode) {
                        this.btnCoAuthMode.setMenu(
                            new Common.UI.Menu({
                                cls: 'ppm-toolbar',
                                style: 'max-width: 220px;',
                                items: [
                                    {
                                        caption: this.strFast,
                                        checkable: true,
                                        toggleGroup: 'menuCoauthMode',
                                        checked: true,
                                        template: menuTemplate,
                                        description: this.strFastDesc,
                                        value: 1
                                    },
                                    {
                                        caption: this.strStrict,
                                        checkable: true,
                                        toggleGroup: 'menuCoauthMode',
                                        checked: false,
                                        template: menuTemplate,
                                        description: this.strStrictDesc,
                                        value: 0
                                    }
                                ]
                            }));
                        this.btnCoAuthMode.updateHint(this.tipCoAuthMode);
                        this.turnCoAuthMode(Common.Utils.InternalSettings.get(`${this.appPrefix}settings-coauthmode`));
                    }

                    if (this.btnCommentRemove) {
                        const items = [
                            {
                                caption: config.canDeleteComments ? this.txtCommentRemCurrent : this.txtCommentRemMyCurrent,
                                value: 'current'
                            },
                            {
                                caption: this.txtCommentRemMy,
                                value: 'my'
                            }
                        ];
                        if (config.canDeleteComments)
                            items.push({
                                caption: this.txtCommentRemAll,
                                value: 'all'
                            });
                        this.btnCommentRemove.setMenu(
                            new Common.UI.Menu({items: items})
                        );
                        this.btnCommentRemove.updateHint([this.tipCommentRemCurrent, this.tipCommentRem]);
                    }

                     if (this.btnCommentResolve) {
                        const items = [
                            {
                                caption: config.canEditComments ? this.txtCommentResolveCurrent : this.txtCommentResolveMyCurrent,
                                value: 'current'
                            },
                            {
                                caption: this.txtCommentResolveMy,
                                value: 'my'
                            }
                        ];
                        if (config.canEditComments)
                            items.push({
                                caption: this.txtCommentResolveAll,
                                value: 'all'
                            });
                        this.btnCommentResolve.setMenu(
                            new Common.UI.Menu({items: items})
                        );
                        this.btnCommentResolve.updateHint([this.tipCommentResolveCurrent, this.tipCommentResolve]);
                    }

                    const separator_sharing = !(this.btnSharing || this.btnCoAuthMode) ? this.$el.find('.separator.sharing') : '.separator.sharing';
                    const separator_comments = !(this.btnCommentRemove || this.btnCommentResolve) ? this.$el.find('.separator.comments') : '.separator.comments';
                    const separator_review = !(config.canReview || config.canViewReview) ? this.$el.find('.separator.review') : '.separator.review';
                    const separator_compare = !(config.canReview && config.canFeatureComparison) ? this.$el.find('.separator.compare') : '.separator.compare';
                    const separator_chat = !this.btnChat ? this.$el.find('.separator.chat') : '.separator.chat';
                    const separator_history = !this.btnHistory ? this.$el.find('.separator.history') : '.separator.history';
                    let separator_last;

                    if (typeof separator_sharing === 'object')
                        separator_sharing.hide().prev('.group').hide();
                    else
                        separator_last = separator_sharing;

                    if (typeof separator_comments === 'object')
                        separator_comments.hide().prev('.group').hide();
                    else
                        separator_last = separator_comments;

                    if (typeof separator_review === 'object')
                        separator_review.hide().prevUntil('.separator.comments').hide();
                    else
                        separator_last = separator_review;

                    if (typeof separator_compare === 'object')
                        separator_compare.hide().prev('.group').hide();
                    else
                        separator_last = separator_compare;

                    if (typeof separator_chat === 'object')
                        separator_chat.hide().prev('.group').hide();
                    else
                        separator_last = separator_chat;

                    if (typeof separator_history === 'object')
                        separator_history.hide().prev('.group').hide();
                    else
                        separator_last = separator_history;

                    if ((!this.btnMailRecepients || !Common.UI.LayoutManager.isElementVisible('toolbar-collaboration-mailmerge')) && separator_last)
                        this.$el.find(separator_last).hide();

//!                 NOTE: conflicted code from branch feature/pdf-history. remove if is not relevant and merge is successful
//!                    Common.NotificationCenter.trigger('tab:visible', 'review', (window.PDFE && (config.isPDFAnnotate || config.isPDFEdit) || !window.PDFE && (config.isEdit || config.canViewReview || me.canComments))
//!                                                                                && Common.UI.LayoutManager.isElementVisible('toolbar-collaboration'));
                    const visible = (config.isEdit || config.canViewReview || this.canComments) && Common.UI.LayoutManager.isElementVisible('toolbar-collaboration');
                    Common.NotificationCenter.trigger('tab:visible', 'review', visible);
                    if (Common.Utils.InternalSettings.get('toolbar-active-tab') && visible) { // collaboration tab has hign priority in view mode
                        Common.Utils.InternalSettings.set('toolbar-active-tab', null);
                        Common.NotificationCenter.trigger('tab:set-active', 'review', true);
                    }
                    setEvents.call(this);
                });
            },

            getPanel: function () {
                this.$el = $(_.template(template)( {} ));

                if ( this.appConfig.canReview ) {
                    this.btnAccept.render(this.$el.find('#btn-change-accept'));
                    this.btnReject.render(this.$el.find('#btn-change-reject'));
                    this.appConfig.canFeatureComparison && this.btnCompare.render(this.$el.find('#slot-btn-compare'));
                    this.appConfig.canFeatureComparison && this.btnCombine.render(this.$el.find('#slot-btn-combine'));
                    this.btnTurnOn.render(this.$el.find('#btn-review-on'));
                }
                this.btnPrev?.render(this.$el.find('#btn-change-prev'));
                this.btnNext?.render(this.$el.find('#btn-change-next'));
                this.btnReviewView?.render(this.$el.find('#btn-review-view'));

                this.btnSharing?.render(this.$el.find('#slot-btn-sharing'));
                this.btnCoAuthMode?.render(this.$el.find('#slot-btn-coauthmode'));
                this.btnHistory?.render(this.$el.find('#slot-btn-history'));
                this.btnChat?.render(this.$el.find('#slot-btn-chat'));
                this.btnCommentRemove?.render(this.$el.find('#slot-comment-remove'));
                this.btnCommentResolve?.render(this.$el.find('#slot-comment-resolve'));
                this.btnMailRecepients?.render(this.$el.find('#slot-btn-mailrecepients'));

                return this.$el;
            },

            show: function () {
                Common.UI.BaseView.prototype.show.call(this);
                this.fireEvent('show', this);
            },

            getButton: function(type, parent) {
                if ( type === 'turn' && parent === 'statusbar' ) {
                    const button = new Common.UI.Button({
                        cls         : 'btn-toolbar',
                        iconCls     : 'toolbar__icon btn-ic-review',
                        lock: [Common.enumLock.viewMode, Common.enumLock.previewReviewMode, Common.enumLock.viewFormMode, Common.enumLock.lostConnect, Common.enumLock.docLockView, Common.enumLock.docLockForms, Common.enumLock.docLockComments, Common.enumLock.docLockReview],
                        hintAnchor  : 'top',
                        hint        : this.tipReview,
                        split       : !this.appConfig.isReviewOnly,
                        enableToggle: true,
                        menu: this.appConfig.isReviewOnly ? false : new Common.UI.Menu({
                            menuAlign: 'bl-tl',
                            style: 'margin-top:-5px;',
                            items: [
                            {
                                caption: this.txtOn,
                                value: 0,
                                checkable: true,
                                toggleGroup: 'menuTurnReviewStb'
                            },
                            {
                                caption: this.txtOff,
                                value: 1,
                                checkable: true,
                                toggleGroup: 'menuTurnReviewStb'
                            },
                            {
                                caption: this.txtOnGlobal,
                                value: 2,
                                checkable: true,
                                toggleGroup: 'menuTurnReviewStb'
                            },
                            {
                                caption: this.txtOffGlobal,
                                value: 3,
                                checkable: true,
                                toggleGroup: 'menuTurnReviewStb'
                            }
                        ]}),
                        action: 'track-changes',
                        dataHint: '0',
                        dataHintDirection: 'top',
                        dataHintOffset: '2, -16'
                    });

                    this.btnsTurnReview.push(button);
                    this.lockedControls.push(button);
                    Common.UI.LayoutManager.addControls(button);
                    return button;
                }
                if ( type === 'spelling' ) {
                    button = new Common.UI.Button({
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-ic-docspell',
                        lock: [Common.enumLock.viewMode,  Common.enumLock.viewFormMode, Common.enumLock.previewReviewMode, Common.enumLock.docLockView, Common.enumLock.docLockForms, Common.enumLock.docLockComments],
                        hintAnchor  : 'top',
                        hint: this.tipSetSpelling,
                        enableToggle: true,
                        dataHint: '0',
                        dataHintDirection: 'top',
                        dataHintOffset: 'small',
                        visible:  Common.UI.FeaturesManager.canChange('spellcheck')
                    });
                    this.btnsSpelling.push(button);
                    this.lockedControls.push(button);
                    Common.UI.LayoutManager.addControls(button);
                    return button;
                }if (type === 'doclang' && parent === 'statusbar' ) {
                    button = new Common.UI.Button({
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-ic-doclang',
                        lock: [Common.enumLock.viewMode, Common.enumLock.previewReviewMode, Common.enumLock.viewFormMode, Common.enumLock.noSpellcheckLangs, Common.enumLock.lostConnect, Common.enumLock.docLockView, Common.enumLock.docLockForms, Common.enumLock.docLockComments],
                        hintAnchor  : 'top',
                        hint: this.tipSetDocLang,
                        dataHint: '0',
                        dataHintDirection: 'top',
                        dataHintOffset: 'small'
                    });
                    this.btnsDocLang.push(button);
                    this.lockedControls.push(button);
                    Common.UI.LayoutManager.addControls(button);
                    Common.Utils.lockControls(Common.enumLock.noSpellcheckLangs, true, {array: [button]});
                    return button;
                }
            },

            getButtons: function() {
                return this.lockedControls;
            },

            getUserName: (username) => Common.Utils.String.htmlEncode(AscCommon.UserInfoParser.getParsedName(username)),

            turnChanges: function(state, global) {
                this.btnsTurnReview.forEach((button) => {
                    if ( button && button.pressed !== state ) {
                        button.toggle(state, true);
                    }
                    if (button.menu) {
                        button.menu.items[0].setChecked(state && !global, true);
                        button.menu.items[1].setChecked(!state && !global, true);
                        button.menu.items[2].setChecked(state && !!global, true);
                        button.menu.items[3].setChecked(!state && !!global, true);
                    }
                }, this);
                Common.NotificationCenter.trigger('doc:mode-apply', state ? 'review' : 'edit', false);
            },

            markChanges: function(status) {
                this.btnsTurnReview.forEach((button) => {
                    if ( button ) {
                        const _icon_el = $('.icon', button.cmpEl);
                        _icon_el[status ? 'addClass' : 'removeClass']('btn-ic-changes');
                    }
                }, this);
            },

            turnSpelling: function (state) {
                this.btnsSpelling?.forEach((button) => {
                    if ( button && button.pressed !== state ) {
                        button.toggle(state, true);
                    }
                }, this);
            },

            turnCoAuthMode: function (fast) {
                if (this.btnCoAuthMode) {
                    this.btnCoAuthMode.menu.items[0].setChecked(fast, true);
                    this.btnCoAuthMode.menu.items[1].setChecked(!fast, true);
                }
            },

            turnChat: function (state) {
                this.btnChat?.toggle(state, true);
            },

            turnDisplayMode: function(mode) {
                if (this.btnReviewView) {
                    this.btnReviewView.menu.items[0].setChecked(mode==='markup', true);
                    this.btnReviewView.menu.items[1].setChecked(mode==='simple', true);
                    this.btnReviewView.menu.items[2].setChecked(mode==='final', true);
                    this.btnReviewView.menu.items[3].setChecked(mode==='original', true);
                }
            },

            onLostEditRights: function() {
                this._readonlyRights = true;
            },

            txtAccept: 'Accept',
            txtAcceptCurrent: 'Accept current Changes',
            txtAcceptAll: 'Accept all Changes',
            txtReject: 'Reject',
            txtRejectCurrent: 'Reject current Changes',
            txtRejectAll: 'Reject all Changes',
            hintNext: 'To Next Change',
            hintPrev: 'To Previous Change',
            txtPrev: 'Previous',
            txtNext: 'Next',
            txtTurnon: 'Turn On',
            txtSpelling: 'Spell checking',
            txtDocLang: 'Language',
            tipSetDocLang: 'Set Document Language',
            tipSetSpelling: 'Spell checking',
            tipReview: 'Review',
            txtAcceptChanges: 'Accept Changes',
            txtRejectChanges: 'Reject Changes',
            txtView: 'Display Mode',
            txtMarkup: 'Text with changes {0}',
            txtFinal: 'All changes like accept {0}',
            txtOriginal: 'Text without changes {0}',
            tipReviewView: 'Select the way you want the changes to be displayed',
            tipAcceptCurrent: 'Accept current changes',
            tipRejectCurrent: 'Reject current changes',
            txtSharing: 'Sharing',
            tipSharing: 'Manage document access rights',
            txtCoAuthMode: 'Co-editing Mode',
            tipCoAuthMode: 'Set co-editing mode',
            strFast: 'Fast',
            strStrict: 'Strict',
            txtHistory: 'Version History',
            tipHistory: 'Show version history',
            txtChat: 'Chat',
            txtMarkupCap: 'Markup',
            txtFinalCap: 'Final',
            txtOriginalCap: 'Original',
            strFastDesc: 'Real-time co-editing. All changes are saved automatically.',
            strStrictDesc: 'Use the \'Save\' button to sync the changes you and others make.',
            txtCompare: 'Compare',
            tipCompare: 'Compare current document with another one',
            txtCombine: 'Combine',
            tipCombine: 'Combine current document with another one',
            mniFromFile: 'Document from File',
            mniFromUrl: 'Document from URL',
            mniFromStorage: 'Document from Storage',
            mniSettings: 'Comparison Settings',
            txtCommentRemove: 'Remove',
            tipCommentRemCurrent: 'Remove current comments',
            tipCommentRem: 'Remove comments',
            txtCommentRemCurrent: 'Remove Current Comments',
            txtCommentRemMyCurrent: 'Remove My Current Comments',
            txtCommentRemMy: 'Remove My Comments',
            txtCommentRemAll: 'Remove All Comments',
            txtCommentResolve: 'Resolve',
            tipCommentResolveCurrent: 'Resolve current comments',
            tipCommentResolve: 'Resolve comments',
            txtCommentResolveCurrent: 'Resolve Current Comments',
            txtCommentResolveMyCurrent: 'Resolve My Current Comments',
            txtCommentResolveMy: 'Resolve My Comments',
            txtCommentResolveAll: 'Resolve All Comments',
            txtOnGlobal: 'ON for me and everyone',
            txtOffGlobal: 'OFF for me and everyone',
            txtOn: 'ON for me',
            txtOff: 'OFF for me',
            textWarnTrackChangesTitle: 'Enable Track Changes for everyone?',
            textWarnTrackChanges: 'Track Changes will be switched ON for all users with full access. The next time anyone opens the doc, Track Changes will remain enabled.',
            textEnable: 'Enable',
            txtMarkupSimpleCap: 'Simple Markup',
            txtMarkupSimple: 'All changes {0}<br>Turn off balloons',
            txtEditing: 'Editing',
            txtPreview: 'Preview',
            txtMailMerge: 'Mail Merge',
            mniMMFromFile: 'From File',
            mniMMFromUrl: 'From URL',
            mniMMFromStorage: 'From Storage',
            tipMailRecepients: 'Mail Merge'
        }
    })()), Common.Views.ReviewChanges || {}));

    Common.Views.ReviewChangesDialog = Common.UI.Window.extend(_.extend({
        options: {
            width       : 330,
            title       : 'Review Changes',
            modal       : false,
            cls         : 'review-changes modal-dlg',
            alias       : 'Common.Views.ReviewChangesDialog'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title    : this.textTitle
            },  options || {});

            this.template = [
                '<div class="box">',
                    '<div class="input-row">',
                        '<div id="id-review-button-prev" style=""></div>',
                        '<div id="id-review-button-next" style=""></div>',
                        '<div id="id-review-button-accept" style=""></div>',
                        '<div id="id-review-button-reject" style="margin-right: 0;"></div>',
                    '</div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            this.popoverChanges = this.options.popoverChanges;
            this.mode = this.options.mode;
            this.docProtection = this.options.docProtection;

            const filter = Common.localStorage.getKeysFilter();
            this.appPrefix = (filter?.length) ? filter.split(',')[0] : '';

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            const _set = Common.enumLock;
            this.btnPrev = new Common.UI.Button({
                cls: 'dlg-btn iconic',
                iconCls: 'img-commonctrl prev',
                hint: this.txtPrev,
                hintAnchor: 'top'
            });
            this.btnPrev.render( this.$window.find('#id-review-button-prev'));

            this.btnNext = new Common.UI.Button({
                cls: ' dlg-btn iconic',
                iconCls: 'img-commonctrl next',
                hint: this.txtNext,
                hintAnchor: 'top'
            });
            this.btnNext.render( this.$window.find('#id-review-button-next'));

            this.btnAccept = new Common.UI.Button({
                cls         : 'btn-toolbar',
                caption     : this.txtAccept,
                split       : true,
                disabled    : this.mode.isReviewOnly || this.docProtection.isReviewOnly || !!Common.Utils.InternalSettings.get(`${this.appPrefix}accept-reject-lock`),
                lock        : [_set.reviewChangelock, _set.isReviewOnly, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.docLockReview, _set.viewMode],
                menu        : this.mode.canUseReviewPermissions ? false : new Common.UI.Menu({
                    items: [
                        this.mnuAcceptCurrent = new Common.UI.MenuItem({
                            caption: this.txtAcceptCurrent,
                            value: 'current'
                        }),
                        this.mnuAcceptAll = new Common.UI.MenuItem({
                            caption: this.txtAcceptAll,
                            value: 'all'
                        })
                    ]
                })
            });
            this.btnAccept.render(this.$window.find('#id-review-button-accept'));

            this.btnReject = new Common.UI.Button({
                cls         : 'btn-toolbar',
                caption     : this.txtReject,
                split       : true,
                lock        : [_set.reviewChangelock, _set.isReviewOnly, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.docLockReview, _set.viewMode],
                menu        : this.mode.canUseReviewPermissions ? false : new Common.UI.Menu({
                    items: [
                        this.mnuRejectCurrent = new Common.UI.MenuItem({
                            caption: this.txtRejectCurrent,
                            value: 'current'
                        }),
                        this.mnuRejectAll = new Common.UI.MenuItem({
                            caption: this.txtRejectAll,
                            value: 'all'
                        })
                    ]
                })
            });
            this.btnReject.render(this.$window.find('#id-review-button-reject'));
            const arr = [this.btnAccept, this.btnReject];
            Common.Utils.lockControls(Common.enumLock.isReviewOnly, this.mode.isReviewOnly, {array: arr});
            Common.Utils.lockControls(Common.enumLock.docLockView, this.docProtection.isReadOnly, {array: arr});
            Common.Utils.lockControls(Common.enumLock.docLockForms, this.docProtection.isFormsOnly, {array: arr});
            Common.Utils.lockControls(Common.enumLock.docLockReview, this.docProtection.isReviewOnly, {array: arr});
            Common.Utils.lockControls(Common.enumLock.docLockComments, this.docProtection.isCommentsOnly, {array: arr});
            Common.Utils.lockControls(Common.enumLock.reviewChangelock, !!Common.Utils.InternalSettings.get(`${this.appPrefix}accept-reject-lock`), {array: arr});
            this.btnPrev.on('click', (e) => {
                this.fireEvent('reviewchange:preview', [this.btnPrev, 'prev']);
            });

            this.btnNext.on('click', (e) => {
                this.fireEvent('reviewchange:preview', [this.btnNext, 'next']);
            });

            this.btnAccept.on('click', (e) => {
                this.fireEvent('reviewchange:accept', [this.btnAccept, 'current']);
            });

            this.btnAccept.menu?.on('item:click', (menu, item, e) => {
                this.fireEvent('reviewchange:accept', [menu, item]);
            });

            this.btnReject.on('click', (e) => {
                this.fireEvent('reviewchange:reject', [this.btnReject, 'current']);
            });

            this.btnReject.menu?.on('item:click', (menu, item, e) => {
                this.fireEvent('reviewchange:reject', [menu, item]);
            });

            return this;
        },

        textTitle: 'Review Changes',
        txtPrev: 'To previous change',
        txtNext: 'To next change',
        txtAccept: 'Accept',
        txtAcceptCurrent: 'Accept Current Change',
        txtAcceptAll: 'Accept All Changes',
        txtReject: 'Reject',
        txtRejectCurrent: 'Reject Current Change',
        txtRejectAll: 'Reject All Changes'
    }, Common.Views.ReviewChangesDialog || {}));
});