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
 *  Header.js
 *
 *  Created on 2/14/14
 *
 */

if (Common === undefined)
    const Common = {};

Common.Views = Common.Views || {};

define([
    'backbone',
    'core'
], (Backbone) => { 

    Common.Views.Header =  Backbone.View.extend(_.extend((()=> {
        let storeUsers;
        let appConfig;
        let $userList;
        let $panelUsers;
        let $btnUsers;
        let $btnUserName;
        let $labelDocName;
        let _readonlyRights = false;
        const _tabStyle = 'fill';
        let _logoImage = '';
        const isPDFEditor = !!window.PDFE;
        const isDocEditor = !!window.DE;
        const isSSEEditor = !!window.SSE;
        const isPEEditor  = !!window.PE;
        const isVisioEditor = !!window.VE;

        const templateUserItem =
                '<li id="<%= user.get("iid") %>" class="<% if (!user.get("online")) { %> offline <% } if (user.get("view")) {%> viewmode <% } %>">' +
                    '<div class="user-name">' +
                        '<div class="color"' + 
                            '<% if (user.get("avatar")) { %>' +
                                'style="background-image: url(<%=user.get("avatar")%>); <% if (user.get("color")!==null) { %> border-color:<%=user.get("color")%>; border-style: solid;<% }%>"' +
                            '<% } else { %>' +
                                'style="background-color: <% if (user.get("color")!==null) { %> <%=user.get("color")%> <% } else { %> #cfcfcf <% }%>;"' +
                            '<% } %>' +
                        '><% if (!user.get("avatar")) { %><%-user.get("initials")%><% } %></div>' +
                        '<label><%= fnEncode(user.get("username")) %></label>' +
                        '<% if (len>1) { %><label class="margin-left-3">(<%=len%>)</label><% } %>' +
                    '</div>'+
                '</li>';

        const templateUserList = _.template(
                '<ul>' +
                    '<% for (originalId in users) { %>' +
                        '<%= usertpl({user: users[originalId][0], fnEncode: fnEncode, len: users[originalId].length}) %>' +
                    '<% } %>' +
                '</ul>');

        const templateRightBox = '<section>' +
                            '<section id="box-doc-name">' +
                                // '<input type="text" id="rib-doc-name" spellcheck="false" data-can-copy="false" style="pointer-events: none;" disabled="disabled">' +
                                //'<label id="rib-doc-name" />' +
                                '<input id="rib-doc-name" autofill="off" autocomplete="off"/></input>' +
                            '</section>' +
                            '<section id="box-right-btn-group" style="display: inherit;">' +
                                '<div class="hedset">' +
                                    '<div class="btn-slot margin-right-2" id="slot-btn-header-form-submit"></div>' +
                                    '<div class="btn-slot margin-right-2" id="slot-btn-start-fill"></div>' +
                                    '<div class="btn-slot margin-right-2 margin-left-5" id="slot-btn-fill-status"></div>' +
                                '</div>' +
                                '<div class="hedset">' +
                                    '<div class="btn-slot" id="slot-hbtn-edit"></div>' +
                                    '<div class="btn-slot" id="slot-hbtn-print"></div>' +
                                    '<div class="btn-slot" id="slot-hbtn-print-quick"></div>' +
                                    '<div class="btn-slot" id="slot-hbtn-download"></div>' +
                                '</div>' +
                                '<div class="hedset" data-layout-name="header-editMode">' +
                                    '<div class="btn-slot" id="slot-btn-edit-mode"></div>' +
                                '</div>' +
                                '<div class="hedset" data-layout-name="header-users">' +
                                    // '<span class="btn-slot text" id="slot-btn-users"></span>' +
                                    '<section id="tlb-box-users" class="box-cousers dropdown">' +
                                        '<div class="btn-users dropdown-toggle" data-toggle="dropdown" data-hint="0" data-hint-direction="bottom" data-hint-offset="big">' +
                                            '<div class="inner-box-icon">' +
                                                '<svg class=""><use xlink:href="#svg-icon-users"></use></svg>' +
                                            '</div>' +
                                            '<label class="caption"></label>' +
                                        '</div>' +
                                        '<div class="cousers-menu dropdown-menu">' +
                                            '<label id="tlb-users-menu-descr"><%= tipUsers %></label>' +
                                            '<div class="cousers-list"></div>' +
                                        '</div>' +
                                    '</section>'+
                                '</div>' +
                                '<div class="hedset">' +
                                    '<div class="btn-slot" id="slot-btn-share"></div>' +
                                '</div>' +
                                '<div class="hedset">' +
                                    '<div class="btn-slot" id="slot-btn-mode"></div>' +
                                    '<div class="btn-slot" id="slot-btn-back"></div>' +
                                    '<div class="btn-slot" id="slot-btn-favorite"></div>' +
                                    '<div class="btn-slot" id="slot-btn-search"></div>' +
                                '</div>' +
                                '<div class="hedset">' +
                                    '<div class="btn-slot" data-layout-name="header-user">' +
                                        '<button type="button" class="btn btn-header slot-btn-user-name hidden">' +
                                            '<div class="color-user-name"></div>' +
                                        '</button>' +
                                        '<div class="btn-current-user hidden">' +
                                            '<div class="color-user-name"></div>' +
                                        '</div>' +
                                    '</div>' +
                                    '<div class="btn-slot" id="slot-btn-close"></div>' +
                                '</div>' +
                            '</section>' +
                        '</section>';

        const templateLeftBox = '<section class="logo">' +
                                '<div id="header-logo"><i></i></div>' +
                            '</section>';

            const templateTitleBox = '<section id="box-document-title">' +
                                '<div class="extra"></div>' +
                                '<div class="hedset" role="menubar" aria-label="<%= scope.ariaQuickAccessToolbar %>">' +
                                    '<div class="btn-slot" id="slot-btn-dt-home"></div>' +
                                    '<div class="btn-slot" id="slot-btn-dt-save" data-layout-name="header-save"></div>' +
                                    '<div class="btn-slot" id="slot-btn-dt-print"></div>' +
                                    '<div class="btn-slot" id="slot-btn-dt-print-quick"></div>' +
                                    '<div class="btn-slot" id="slot-btn-dt-undo"></div>' +
                                    '<div class="btn-slot" id="slot-btn-dt-redo"></div>' +
                                    '<div class="btn-slot" id="slot-btn-dt-start-over"></div>' +    
                                    '<div class="btn-slot" id="slot-btn-dt-quick-access"></div>' +
                                '</div>' +
                                '<div class="lr-separator" id="id-box-doc-name">' +
                                    // '<label id="title-doc-name" /></label>' +
                                    '<input id="title-doc-name" autofill="off" autocomplete="off" spellcheck="false"/></input>' +
                                '</div>' +
                                '<div class="hedset">' +
                                    '<div class="btn-slot" data-layout-name="header-user">' +
                                        '<button type="button" class="btn btn-header slot-btn-user-name hidden">' +
                                            '<div class="color-user-name"></div>' +
                                        '</button>' +
                                        '<div class="btn-current-user hidden">' +
                                            '<div class="color-user-name"></div>' +
                                        '</div>' +
                                    '</div>' +
                                    '<div class="btn-slot" id="slot-btn-close"></div>' +
                                '</div>' +
                            '</section>';

        function onResetUsers(collection, opts) {
            const usercount = collection.getVisibleEditingCount();
            if ( $userList ) {
                if (appConfig && (usercount > 1 && (appConfig.isEdit || appConfig.isRestrictedEdit) || usercount >0 && appConfig.canLiveView)) {
                    $userList.html(templateUserList({
                        users: collection.chain().filter((item)=> item.get('online') && !item.get('view') && !item.get('hidden')).groupBy((item) => item.get('idOriginal')).value(),
                        usertpl: _.template(templateUserItem),
                        fnEncode: (username) => Common.Utils.String.htmlEncode(AscCommon.UserInfoParser.getParsedName(username))
                    }));

                    $userList.scroller = new Common.UI.Scroller({
                        el: $userList.find('ul'),
                        useKeyboard: true,
                        minScrollbarLength: 40,
                        alwaysVisibleY: true
                    });
                    $userList.scroller.update({minScrollbarLength  : 40, alwaysVisibleY: true});
                } else {
                    $userList.empty();
                }
            }

            applyUsers( usercount, collection.getVisibleEditingOriginalCount() );
        };

        function onUsersChanged(model) {
            onResetUsers(model.collection);
        };

        function applyUsers(count, originalCount) {
            if (!$btnUsers) return;
            const has_edit_users = appConfig && (count > 1 && (appConfig.isEdit || appConfig.isRestrictedEdit) || count > 0 && appConfig.canLiveView); // has other user(s) who edit document
            if ( has_edit_users ) {
                $panelUsers.show();
                $btnUsers.find('.caption').html(originalCount);
            } else {
                $panelUsers.hide();
            }
            updateDocNamePosition();
        }

        function onLostEditRights() {
            _readonlyRights = true;
            this.btnShare?.setVisible(false);
            updateDocNamePosition();
        }

        function onUsersClick(e) {
            const usertip = $btnUsers.data('bs.tooltip');
            if ( usertip ) {
                if ( usertip.dontShow===undefined)
                    usertip.dontShow = true;

                usertip.hide();
            }
        }

        function updateDocNamePosition(config) {
            config = config || appConfig;
            if ( $labelDocName && config) {
                const $parent = $labelDocName.parent();
                if (!config.twoLevelHeader) {
                    const _left_width = Common.Utils.getPosition($parent).left;
                    const _right_width = $parent.next().outerWidth();
                    $parent.css('padding-left', _left_width < _right_width ? Math.max(2, _right_width - _left_width) : 2);
                    $parent.css('padding-right', _left_width < _right_width ? 2 : Math.max(2, _left_width - _right_width));
                } else if (!config.compactHeader) {
                    const _left_width = Common.Utils.getPosition($parent).left;
                    const _right_width = $parent.next().outerWidth();
                    const outerWidth = $labelDocName.outerWidth();
                    let cssWidth = $labelDocName[0].style.width;
                    cssWidth = cssWidth ? Number.parseFloat(cssWidth) : outerWidth;
                    if (cssWidth - outerWidth > 0.1) {
                        $parent.css('padding-left', _left_width < _right_width ? Math.max(2, $parent.outerWidth() - 2 - cssWidth) : 2);
                        $parent.css('padding-right', _left_width < _right_width ? 2 : Math.max(2, $parent.outerWidth() - 2 - cssWidth));
                    } else {
                        $parent.css('padding-left', _left_width < _right_width ? Math.max(2, Math.min(_right_width - _left_width + 2, $parent.outerWidth() - 2 - cssWidth)) : 2);
                        $parent.css('padding-right', _left_width < _right_width ? 2 : Math.max(2, Math.min(_left_width - _right_width + 2, $parent.outerWidth() - 2 - cssWidth)));
                    }
                }

                if (!(config.customization?.toolbarHideFileName) && (!config.twoLevelHeader || config.compactHeader)) {
                    let basis = Number.parseFloat($parent.css('padding-left') || 0) + Number.parseFloat($parent.css('padding-right') || 0) + Number.parseInt($labelDocName.css('min-width') || 50); // 2px - box-shadow
                    config.isCrypted && (basis += 20);
                    $parent.css('flex-basis', `${Math.ceil(basis)}px`);
                    $parent.closest('.extra.right').css('flex-basis', `${Math.ceil(basis) + $parent.next().outerWidth()}px`);
                    Common.NotificationCenter.trigger('tab:resize');
                }
            }
        }

        function changePDFMode(config) {
            config = config || appConfig;
            if (!this.btnPDFMode || !config) return;
            const type = config.isPDFEdit ? 'edit' : (config.isPDFAnnotate ? 'comment' : 'view');
            const isEdit = config.isPDFEdit;
            const isComment = !isEdit && config.isPDFAnnotate;
            this.btnPDFMode.setIconCls(`toolbar__icon icon--inverse ${isEdit ? 'btn-edit' : (isComment ? 'btn-menu-comments' : 'btn-sheet-view')}`);
            this.btnPDFMode.setCaption(isEdit ? this.textEdit : (isComment ? this.textComment : this.textView));
            this.btnPDFMode.updateHint(isEdit ? this.tipEdit : (isComment ? this.tipComment : this.tipView));
            this.btnPDFMode.options.value = type;
            if (this.btnPDFMode.menu && typeof this.btnPDFMode.menu === 'object') {
                const item = _.find(this.btnPDFMode.menu.items, (item) => item.value === type);
                (item) ? item.setChecked(true) : this.btnPDFMode.menu.clearAll();
            }
        }

        function changeDocMode(type, lockEditing) {
            if (!this.btnDocMode || !appConfig) return;

            if (lockEditing!==undefined) { //lock only menu item
                this.btnDocMode.menu?.items && (this.btnDocMode.menu.items[0].value==='edit') && this.btnDocMode.menu.items[0].setDisabled(lockEditing);
                return;
            }

            const show = type!==undefined;
            if (type===undefined) {
                if (appConfig.isReviewOnly)
                    type = 'review';
                else {
                    const review = Common.Utils.InternalSettings.get(`${this.appPrefix}track-changes`);
                    type = (review===0 || review===2) ? 'review' : 'edit';
                }
            }

            const isEdit = type==='edit';
            const isReview = type==='review';
            const isViewForm = type==='view-form';
            this.btnDocMode.setIconCls(`toolbar__icon icon--inverse ${isEdit ? 'btn-edit' : (isReview ? 'btn-ic-review' : 'btn-sheet-view')}`);
            this.btnDocMode.setCaption(isEdit ? this.textEdit : isReview ? this.textReview : isViewForm ? this.textViewForm : this.textView);
            this.btnDocMode.updateHint(isEdit ? this.tipDocEdit : isReview ? this.tipReview : isViewForm ? this.tipDocViewForm : this.tipDocView);
            this.btnDocMode.options.value = type;
            if (show && !this.btnDocMode.isVisible()) {
                this.btnDocMode.setVisible(true);
            }
            if (this.btnDocMode.menu && typeof this.btnDocMode.menu === 'object') {
                const item = _.find(this.btnDocMode.menu.items, (item) => item.value === type);
                (item) ? item.setChecked(true) : this.btnDocMode.menu.clearAll();
            }
        }

        function onResize() {
            if (appConfig?.twoLevelHeader && !appConfig.compactHeader)
                updateDocNamePosition();
        }

        function onAppShowed(config) {
            // config.isCrypted =true; //delete fore merge!
            if ( $labelDocName ) {
                if ( config.isCrypted ) {
                    $labelDocName.before(
                        '<div class="inner-box-icon crypted hidden">' +
                            '<svg class="icon"><use xlink:href="#svg-icon-crypted"></use></svg>' +
                        '</div>');
                    this.imgCrypted = $labelDocName.parent().find('.crypted');
                    this._showImgCrypted = true;
                }

                updateDocNamePosition(config);
            }
        }

        function onChangeQuickAccess(caller, props) {
            if (props.save !== undefined) {
                this.btnSave[props.save ? 'show' : 'hide']();
                Common.localStorage.setBool(`${this.appPrefix}quick-access-save`, props.save);
            }
            if (props.print !== undefined) {
                this.btnPrint[props.print ? 'show' : 'hide']();
                Common.localStorage.setBool(`${this.appPrefix}quick-access-print`, props.print);
            }
            if (props.quickPrint !== undefined) {
                this.btnPrintQuick[props.quickPrint ? 'show' : 'hide']();
                Common.localStorage.setBool(`${this.appPrefix}quick-access-quick-print`, props.quickPrint);
            }
            if (props.undo !== undefined) {
                this.btnUndo[props.undo ? 'show' : 'hide']();
                Common.localStorage.setBool(`${this.appPrefix}quick-access-undo`, props.undo);
            }
            if (props.redo !== undefined) {
                this.btnRedo[props.redo ? 'show' : 'hide']();
                Common.localStorage.setBool(`${this.appPrefix}quick-access-redo`, props.redo);
            }
            if (props.startOver !== undefined) {
                this.btnStartOver[props.startOver ? 'show' : 'hide']();
                Common.localStorage.setBool(`${this.appPrefix}quick-access-start-over`, props.startOver);
            }
            Common.NotificationCenter.trigger('edit:complete');

            if ( caller && caller === 'header' )
                Common.NotificationCenter.trigger('quickaccess:changed', props);
            updateDocNamePosition();
        }

        function onAppReady(mode) {
            appConfig = mode;
            this.btnGoBack.on('click', (e) => {
                Common.NotificationCenter.trigger('goback');
            });

            if (this.btnClose) {
                this.btnClose.on('click', (e) => {
                    Common.NotificationCenter.trigger('close');
                });
                this.btnClose.updateHint(appConfig.customization.close.text || this.textClose);
            }

            this.btnFavorite.on('click', (e) => {
                // wait for setFavorite method
                // me.options.favorite = !me.options.favorite;
                // me.btnFavorite.changeIcon(me.options.favorite ? {next: 'btn-in-favorite', curr: 'btn-favorite'} : {next: 'btn-favorite', curr: 'btn-in-favorite'});
                // me.btnFavorite.changeIcon(me.options.favorite ? {next: 'btn-in-favorite'} : {curr: 'btn-in-favorite'});
                // me.btnFavorite.updateHint(!me.options.favorite ? me.textAddFavorite : me.textRemoveFavorite);
                Common.NotificationCenter.trigger('markfavorite', !this.options.favorite);
            });

            if (this.btnShare) {
                this.btnShare.on('click', (e) => {
                    Common.NotificationCenter.trigger('collaboration:sharing');
                });
                this.btnShare.updateHint(this.tipAccessRights);
                this.btnShare.setVisible(!_readonlyRights && appConfig && (appConfig.sharingSettingsUrl?.length || appConfig.canRequestSharingSettings));
                updateDocNamePosition();
            }

            this.btnStartFill?.on('click', (e) => {
                Common.NotificationCenter.trigger('forms:request-fill');
            });

            if (this.btnFillStatus) {
                this.btnFillStatus.updateHint(this.tipFillStatus);
                this.btnFillStatus?.on('click', (e) => {
                    Common.UI.TooltipManager.closeTip('showFillStatus');
                    Common.Gateway.requestFillingStatus(appConfig.user.roles && appConfig.user.roles.length>0 ? appConfig.user.roles[0] : undefined);
                });
            }

            if ( this.logo )
                this.logo.children(0).on('click', (e) => {
                    const _url = !!this.branding && !!this.branding.logo && (this.branding.logo.url!==undefined) ?
                        this.branding.logo.url : '{{PUBLISHER_URL}}';
                    if (_url) {
                        const newDocumentPage = window.open(_url);
                        newDocumentPage?.focus();
                    }
                });

            if ( $panelUsers ) {
                onResetUsers(storeUsers);

                $panelUsers.on('shown.bs.dropdown', () => {
                    $userList.scroller?.update({minScrollbarLength: 40, alwaysVisibleY: true});
                });

                $panelUsers.find('.cousers-menu')
                    .on('click', (e) => false);

                const editingUsers = storeUsers.getVisibleEditingCount();
                $btnUsers.tooltip({
                    title: this.tipUsers,
                    placement: 'bottom',
                    html: true
                });
                $btnUsers.on('click', onUsersClick.bind(this));
                $panelUsers[(appConfig && (editingUsers > 1 && (appConfig.isEdit || appConfig.isRestrictedEdit) || editingUsers > 0 && appConfig.canLiveView)) ? 'show' : 'hide']();
                updateDocNamePosition();
            }

            if (appConfig.user.guest && appConfig.canRenameAnonymous) {
                if (this.btnUserName) {
                    this.btnUserName.on('click', (e) => {
                        Common.NotificationCenter.trigger('user:rename');
                    });
                }
            }

            if ( this.btnPrint ) {
                this.btnPrint.on('click', (e) => {
                    this.fireEvent('print', this);
                });
            }

            if ( this.btnPrintQuick ) {
                this.btnPrintQuick.updateHint(this.tipPrintQuick);
                this.btnPrintQuick.on('click', (e) => {
                    this.fireEvent('print-quick', this);
                });
            }

            if ( this.btnSave ) {
                this.btnSave.on('click', (e) => {
                    this.fireEvent('save', this);
                });
            }

            if ( this.btnUndo ) {
                this.btnUndo.on('click', (e) => {
                    this.fireEvent('undo', this);
                });
            }

            if ( this.btnRedo ) {
                this.btnRedo.on('click', (e) => {
                    this.fireEvent('redo', this);
                });
            }

            if (this.btnStartOver) {
                this.btnStartOver.on('click', (e) => {
                    this.fireEvent('startover', this);
                });
            }

            if (this.btnQuickAccess) {
                this.btnQuickAccess.updateHint(this.tipCustomizeQuickAccessToolbar);
                const arr = [];
                if (this.btnSave && Common.UI.LayoutManager.isElementVisible('header-save')) {
                    arr.push({
                        caption: appConfig.canSaveToFile || appConfig.isDesktopApp && appConfig.isOffline ? this.tipSave : this.textDownload,
                        value: 'save',
                        checkable: true
                    });
                }
                if (this.btnPrint) {
                    arr.push({
                        caption: this.textPrint,
                        value: 'print',
                        checkable: true
                    });
                }
                if (this.btnPrintQuick) {
                    arr.push({
                        caption: this.tipPrintQuick,
                        value: 'quick-print',
                        checkable: true
                    });
                }
                if (this.btnUndo) {
                    arr.push({
                        caption: this.tipUndo,
                        value: 'undo',
                        checkable: true
                    });
                }
                if (this.btnRedo) {
                    arr.push({
                        caption: this.tipRedo,
                        value: 'redo',
                        checkable: true
                    });
                }
                if (this.btnStartOver) {
                    arr.push({
                        caption: this.textStartOver,
                        value: 'startover',
                        checkable: true
                    });
                }
                this.btnQuickAccess.setMenu(new Common.UI.Menu({
                    cls: 'ppm-toolbar',
                    style: 'min-width: 110px;',
                    menuAlign: 'tl-bl',
                    items: arr
                }));
                this.btnQuickAccess.menu.on('show:before', (menu) => {
                    menu.items.forEach((item) => {
                        if (item.value === 'save') {
                            item.setChecked(Common.localStorage.getBool(`${this.appPrefix}quick-access-save`, true), true);
                        } else if (item.value === 'print') {
                            item.setChecked(Common.localStorage.getBool(`${this.appPrefix}quick-access-print`, true), true);
                        } else if (item.value === 'quick-print') {
                            item.setChecked(Common.localStorage.getBool(`${this.appPrefix}quick-access-quick-print`, true), true);
                        } else if (item.value === 'undo') {
                            item.setChecked(Common.localStorage.getBool(`${this.appPrefix}quick-access-undo`, true), true);
                        } else if (item.value === 'redo') {
                            item.setChecked(Common.localStorage.getBool(`${this.appPrefix}quick-access-redo`, true), true);
                        }
                        if (item.value === 'startover') {
                            item.setChecked(Common.localStorage.getBool(`${this.appPrefix}quick-access-start-over`, true), true);
                        }
                    });
                });
                this.btnQuickAccess.menu.on('item:click', (menu, item) => {
                    const props = {};
                    switch (item.value) {
                        case 'save':
                            props.save = item.checked;
                            break;
                        case 'print':
                            props.print = item.checked;
                            break;
                        case 'quick-print':
                            props.quickPrint = item.checked;
                            break;
                        case 'undo':
                            props.undo = item.checked;
                            break;
                        case 'redo':
                            props.redo = item.checked;
                            break;
                        case 'startover':
                            props.startOver = item.checked;
                            break;        
                    }
                    onChangeQuickAccess.call(this, 'header', props);
                });
                Common.NotificationCenter.on('quickaccess:changed', onChangeQuickAccess.bind(this, 'settings'));
            }

            if ( !appConfig.twoLevelHeader ) {
                if ( this.btnDownload ) {
                    this.btnDownload.updateHint(this.tipDownload);
                    this.btnDownload.on('click', (e) => {
                        this.fireEvent('downloadas', ['original']);
                    });
                }
            }

            if ( this.btnEdit ) {
                this.btnEdit.updateHint(this.tipGoEdit);
                this.btnEdit.on('click', (e) => {
                    this.fireEvent('go:editor', this);
                });
            }


            const menuTemplate = _.template('<a id="<%= id %>" tabindex="-1" type="menuitem" class="menu-item"><div>' +
                                            '<% if (!_.isEmpty(iconCls)) { %>' +
                                                '<span class="menu-item-icon <%= iconCls %>"></span>' +
                                            '<% } %>' +
                                            '<b><%= caption %></b></div>' +
                                            '<% if (options.description !== null) { %><label class="margin-left-10 description"><%= options.description %></label>' +
                                            '<% } %></a>');
            if (this.btnPDFMode) {
                const arr = [];
                const type = this.btnPDFMode.options.value;
                // arr.push({
                //     caption: me.textView,
                //     iconCls : 'menu__icon btn-sheet-view',
                //     template: menuTemplate,
                //     description: me.textViewDesc,
                //     value: 'view',
                //     checkable: true,
                //     toggleGroup: 'docmode'
                // });
                if (appConfig.canPDFEdit) {
                    arr.push({
                        caption: this.textComment,
                        iconCls : 'menu__icon btn-menu-comments',
                        template: menuTemplate,
                        description: this.textAnnotateDesc,
                        value: 'comment',
                        checkable: true,
                        toggleGroup: 'docmode'
                    });
                    arr.push({
                        caption: this.textEdit,
                        iconCls : 'menu__icon btn-edit',
                        template: menuTemplate,
                        description: this.textEditDescNoCoedit,
                        value: 'edit',
                        checkable: true,
                        toggleGroup: 'docmode'
                    });
                }
                this.btnPDFMode.setMenu(new Common.UI.Menu({
                    cls: 'ppm-toolbar select-checked-items',
                    style: 'width: 220px;',
                    menuAlign: 'tr-br',
                    items: arr
                }));
                this.btnPDFMode.menu.on('item:click', (menu, item) => {
                    Common.NotificationCenter.trigger('pdf:mode-apply', item.value);
                });
                const item = _.find(this.btnPDFMode.menu.items, (item) => item.value === type);
                item?.setChecked(true);
            } else if (this.btnDocMode) {
                const arr = [];
                const type = this.btnDocMode.options.value;
                !appConfig.isReviewOnly && arr.push({
                    caption: this.textEdit,
                    iconCls : 'menu__icon btn-edit',
                    template: menuTemplate,
                    description: this.textDocEditDesc,
                    value: 'edit',
                    checkable: true,
                    toggleGroup: 'docmode'
                });
                appConfig.canReview && arr.push({
                    caption: this.textReview,
                    iconCls : 'menu__icon btn-ic-review',
                    template: menuTemplate,
                    description: this.textReviewDesc,
                    value: 'review',
                    checkable: true,
                    toggleGroup: 'docmode'
                });
                appConfig.isPDFForm && appConfig.isFormCreator ? arr.push({
                    caption: this.textViewForm,
                    iconCls : 'menu__icon btn-sheet-view',
                    template: menuTemplate,
                    description: this.textDocViewFormDesc,
                    value: 'view-form',
                    checkable: true,
                    toggleGroup: 'docmode'
                }) : arr.push({
                    caption: this.textView,
                    iconCls : 'menu__icon btn-sheet-view',
                    template: menuTemplate,
                    description: this.textDocViewDesc,
                    value: 'view',
                    checkable: true,
                    toggleGroup: 'docmode'
                });
                this.btnDocMode.setMenu(new Common.UI.Menu({
                    cls: 'ppm-toolbar select-checked-items',
                    style: 'width: 220px;',
                    menuAlign: 'tr-br',
                    items: arr
                }));
                this.btnDocMode.menu.on('item:click', (menu, item) => {
                    Common.NotificationCenter.trigger('doc:mode-apply', item.value, true);
                });
                const item = _.find(this.btnDocMode.menu.items, (item) => item.value === type);
                item?.setChecked(true);
            }
            if (appConfig.twoLevelHeader && !appConfig.compactHeader)
                Common.NotificationCenter.on('window:resize', onResize);

            const app = (window.DE || window.PE || window.SSE || window.PDFE || window.VE);
            if(app?.getController('Common.Controllers.Shortcuts')) {
                app.getController('Common.Controllers.Shortcuts').updateShortcutHints(this.shortcutHints);
            }
        }

        function onFocusDocName(e){
            this.imgCrypted?.toggleClass('hidden', true);
            this.isSaveDocName =false;
            if(this.withoutExt) return;
            const name = this.cutDocName($labelDocName.val());
            this.withoutExt = true;
            _.delay(()=> {
                this.setDocTitle(name);
                $labelDocName.select();
            },100);
        }

        function onDocNameChanged(editcomplete) {
            let name = $labelDocName.val();
            name = name.trim();
            if ( !_.isEmpty(name) && this.cutDocName(this.documentCaption) !== name ) {
                this.isSaveDocName =true;
                if ( /[\t*\+:\"<>?|\\\\/]/gim.test(name) ) {
                    _.defer(() => {
                        Common.UI.error({
                            msg: `${(new Common.Views.RenameDialog).txtInvalidName}*+:\"<>?|\/`
                            , callback: () => {
                                _.delay(() => {
                                    $labelDocName.focus();
                                }, 50);
                            }
                        });
                    })
                } else if (this.withoutExt) {
                    name = this.cutDocName(name);
                    this.fireEvent('rename', [name]);
                    name += this.fileExtention;
                    this.withoutExt = false;
                    this.setDocTitle(name);
                    editcomplete && Common.NotificationCenter.trigger('edit:complete', this);
                }
            } else {
                editcomplete && Common.NotificationCenter.trigger('edit:complete', this);
            }
        }

        function onDocNameKeyDown(e) {
            if ( e.keyCode === Common.UI.Keys.RETURN ) {
                onDocNameChanged.call(this, true);
            } else if ( e.keyCode === Common.UI.Keys.ESC ) {
                this.setDocTitle(this.cutDocName(this.documentCaption));
                Common.NotificationCenter.trigger('edit:complete', this);
            } else {
                _.delay(()=> {
                    this.setDocTitle();
                },10);
            }
        }

        return {
            options: {
                branding: {},
                documentCaption: '',
                canBack: false,
                wopi: false
            },

            el: '#header',

            // Delegated events for creating new items, and clearing completed ones.
            events: {
                // 'click #header-logo': function (e) {}
            },

            initialize: function (options) {
                this.options = this.options ? _.extend(this.options, options) : options;

                this.documentCaption = this.options.documentCaption;
                this.branding = this.options.customization;
                this.isModified = false;

                const filter = Common.localStorage.getKeysFilter();
                this.appPrefix = (filter?.length) ? filter.split(',')[0] : '';

                this.shortcutHints = {};

                this.btnGoBack = new Common.UI.Button({
                    id: 'btn-go-back',
                    cls: 'btn-header',
                    iconCls: 'toolbar__icon icon--inverse btn-goback',
                    dataHint: '0',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big'
                });

                storeUsers = this.options.storeUsers;
                storeUsers.bind({
                    add     : onUsersChanged,
                    change  : onUsersChanged,
                    reset   : onResetUsers
                });

                this.btnSearch = new Common.UI.Button({
                    cls: 'btn-header no-caret',
                    iconCls: 'toolbar__icon icon--inverse btn-menu-search',
                    enableToggle: true,
                    dataHint: '0',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big'
                });
                this.shortcutHints.OpenFindDialog = {
                    btn: this.btnSearch,
                    label: this.tipSearch
                };

                this.btnFavorite = new Common.UI.Button({
                    id: 'id-btn-favorite',
                    cls: 'btn-header',
                    iconCls: 'toolbar__icon icon--inverse btn-favorite',
                    dataHint: '0',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big'
                });

                Common.NotificationCenter.on({
                    'app:ready': (mode) => {Common.Utils.asyncCall(onAppReady, this, mode);},
                    'app:face': (mode) => {Common.Utils.asyncCall(onAppShowed, this, mode);},
                    'tab:visible': () => {Common.Utils.asyncCall(updateDocNamePosition, this);},
                    'collaboration:sharingdeny': (mode) => {Common.Utils.asyncCall(onLostEditRights, this, mode);}
                });
                Common.NotificationCenter.on('uitheme:changed', this.onThemeChanged.bind(this));
                Common.NotificationCenter.on('mentions:setusers', this.avatarsUpdate.bind(this));
                Common.NotificationCenter.on('tabstyle:changed', this.changeLogo.bind(this));
                Common.NotificationCenter.on('tabbackground:changed', this.changeLogo.bind(this));
            },

            render: function (el, role) {
                $(el).html(this.getPanel(role));

                return this;
            },

            getPanel: function (role, config) {
                !appConfig && (appConfig = config);

                function createTitleButton(iconid, slot, disabled, hintDirection, hintOffset, hintTitle, lock) {
                    return (new Common.UI.Button({
                        cls: 'btn-header',
                        iconCls: iconid,
                        disabled: disabled === true,
                        lock: lock,
                        dataHint:'0',
                        dataHintDirection: hintDirection ? hintDirection : (config.isDesktopApp ? 'right' : 'left'),
                        dataHintOffset: hintOffset ? hintOffset : (config.isDesktopApp ? '10, -18' : '10, 10'),
                        dataHintTitle: hintTitle
                    })).render(slot);
                }

                if ( role === 'left' && (!config || !config.isDesktopApp)) {
                    $html = $(templateLeftBox);
                    this.logo = $html.find('#header-logo');
                    const logo = this.getSuitableLogo(this.branding, config);
                    this.logo.toggleClass('logo-light', logo.isLight);
                    if (this.branding?.logo && this.logo) {
                        if (this.branding.logo.visible===false) {
                            this.logo.addClass('hidden');
                        } else if (this.branding.logo.image || this.branding.logo.imageDark || this.branding.logo.imageLight) {
                            _logoImage = logo.image;
                            this.logo.html(`<img src="${_logoImage}" style="max-width:300px; max-height:20px; margin: 0;"/>`);
                            this.logo.css({'background-image': 'none', width: 'auto'});
                            (this.branding.logo.url || this.branding.logo.url===undefined) && this.logo.addClass('link');
                        }
                    }

                    return $html;
                }
                if ( role === 'right' ) {
                    const $html = $(_.template(templateRightBox)({
                        tipUsers: this.labelCoUsersDescr,
                        textShare: this.textShare
                    }));

                    if ( !$labelDocName ) {
                        $labelDocName = $html.find('#rib-doc-name');
                        if ( this.documentCaption ) {
                            setTimeout(() => { this.setDocTitle(this.documentCaption); }, 50);
                        }
                    } else {
                        $html.find('#rib-doc-name').hide();
                    }

                    this.setCanRename(!!this.options.canRename);

                    if ( this.options.canBack === true ) {
                        this.btnGoBack.render($html.find('#slot-btn-back'));
                    } else {
                        $html.find('#slot-btn-back').hide();
                    }

                    if ( this.options.favorite !== undefined && this.options.favorite!==null) {
                        this.btnFavorite.render($html.find('#slot-btn-favorite'));
                        this.btnFavorite.changeIcon(this.options.favorite ? {next: 'btn-in-favorite', curr: 'btn-favorite'} : {next: 'btn-favorite', curr: 'btn-in-favorite'});
                        this.btnFavorite.updateHint(!this.options.favorite ? this.textAddFavorite : this.textRemoveFavorite);
                    } else {
                        $html.find('#slot-btn-favorite').hide();
                    }

                    if ( !config.twoLevelHeader) {
                        if ( (config.canDownload || config.canDownloadOrigin) && !config.isOffline  )
                            this.btnDownload = createTitleButton('toolbar__icon icon--inverse btn-download', $html.findById('#slot-hbtn-download'), undefined, 'bottom', 'big');

                        if ( config.canPrint ) {
                            this.btnPrint = createTitleButton('toolbar__icon icon--inverse btn-print', $html.findById('#slot-hbtn-print'), undefined, 'bottom', 'big', 'P');
                            this.shortcutHints.PrintPreviewAndPrint = {
                                btn: this.btnPrint,
                                label: this.tipPrint + (window.VE ? (Common.Utils.String.platformKey('Ctrl+P')) : '')
                            };
                        }

                        if ( config.canQuickPrint )
                            this.btnPrintQuick = createTitleButton('toolbar__icon icon--inverse btn-quick-print', $html.findById('#slot-hbtn-print-quick'), undefined, 'bottom', 'big', 'Q');
                    }
                    if ( config.canRequestEditRights && (!config.twoLevelHeader && config.canEdit && !isPDFEditor || config.isPDFForm && config.canFillForms && config.isRestrictedEdit ||
                                                        isPDFEditor && (config.canPDFEdit && !config.isPDFEdit && !config.isPDFAnnotate || config.isPDFFill)))
                        this.btnEdit = createTitleButton('toolbar__icon icon--inverse btn-edit', $html.findById('#slot-hbtn-edit'), undefined, 'bottom', 'big');

                    this.btnSearch.render($html.find('#slot-btn-search'));

                    if (!config.twoLevelHeader || config.compactHeader) {
                        if (config.user.guest && config.canRenameAnonymous) {
                            this.btnUserName = new Common.UI.Button({
                                el: $html.findById('.slot-btn-user-name'),
                                cls: 'btn-header',
                                dataHint:'0',
                                dataHintDirection: 'bottom',
                                dataHintOffset: 'big',
                                visible: true
                            });
                            this.btnUserName.cmpEl.removeClass('hidden');
                        } else {
                            this.elUserName = $html.find('.btn-current-user');
                            this.elUserName.removeClass('hidden');
                        }
                        $btnUserName = $html.find('.color-user-name');
                        this.setUserName(this.options.userName);

                        if ( config.canCloseEditor )
                            this.btnClose = createTitleButton('toolbar__icon icon--inverse btn-close', $html.findById('#slot-btn-close'), false, 'bottom', 'big');
                    }

                    if (!_readonlyRights && config && (config.sharingSettingsUrl?.length || config.canRequestSharingSettings)) {
                        this.btnShare = new Common.UI.Button({
                            cls: 'btn-header btn-header-share',
                            iconCls: 'toolbar__icon icon--inverse btn-users-share',
                            caption: this.textShare,
                            dataHint: '0',
                            dataHintDirection: 'bottom',
                            dataHintOffset: 'big'
                        });
                        this.btnShare.render($html.find('#slot-btn-share'));
                    } else {
                        $html.find('#slot-btn-share').hide();
                    }

                    if (isPDFEditor && config.isEdit && config.canSwitchMode) { // hide in pdf editor
                        this.btnPDFMode = new Common.UI.Button({
                            cls: 'btn-header btn-header-pdf-mode',
                            iconCls: 'toolbar__icon icon--inverse btn-menu-comments',
                            caption: this.textComment,
                            menu: true,
                            value: 'comment',
                            lock: [Common.enumLock.lostConnect, Common.enumLock.fileMenuOpened, Common.enumLock.changeModeLock],
                            dataHint: '0',
                            dataHintDirection: 'bottom',
                            dataHintOffset: 'big'
                        });
                        this.btnPDFMode.render($html.find('#slot-btn-edit-mode'));
                        changePDFMode.call(this, config);
                        Common.NotificationCenter.on('pdf:mode-changed', _.bind(changePDFMode, this));
                    } else if (isDocEditor && config.isEdit && config.canSwitchMode) {
                        this.btnDocMode = new Common.UI.Button({
                            cls: 'btn-header btn-header-pdf-mode ',
                            iconCls: `toolbar__icon icon--inverse ${config.isReviewOnly ? 'btn-ic-review' : 'btn-edit'}`,
                            caption: config.isReviewOnly ? this.textReview : this.textEdit,
                            menu: true,
                            visible: config.isReviewOnly || !config.canReview,
                            lock: [Common.enumLock.previewReviewMode, Common.enumLock.lostConnect, Common.enumLock.disableOnStart, Common.enumLock.docLockView, Common.enumLock.docLockComments, Common.enumLock.docLockForms, Common.enumLock.fileMenuOpened, Common.enumLock.changeModeLock],
                            value: config.isReviewOnly ? 'review' : 'edit',
                            dataHint: '0',
                            dataHintDirection: 'bottom',
                            dataHintOffset: 'big'
                        });
                        this.btnDocMode.render($html.find('#slot-btn-edit-mode'));
                        changeDocMode.call(this);
                        Common.NotificationCenter.on('doc:mode-changed', _.bind(changeDocMode, this));
                    } else
                        $html.find('#slot-btn-edit-mode').hide();

                    if (config.canStartFilling) {
                        this.btnStartFill = new Common.UI.Button({
                            cls: 'btn-text-default auto yellow',
                            caption: config.customization?.startFillingForm?.text ? config.customization.startFillingForm.text : this.textStartFill,
                            dataHint: '0',
                            dataHintDirection: 'bottom',
                            dataHintOffset: 'big'
                        });
                        this.btnStartFill.render($html.find('#slot-btn-start-fill'));
                    } else {
                        $html.find('#slot-btn-start-fill').hide();
                    }

                    if (config.isPDFForm && config.canRequestFillingStatus) {
                        this.btnFillStatus = new Common.UI.Button({
                            cls: 'btn-header',
                            iconCls: 'toolbar__icon icon--inverse  btn-filling-status',
                        });
                        this.btnFillStatus.render($html.find('#slot-btn-fill-status'));
                    }

                    $userList = $html.find('.cousers-list');
                    $panelUsers = $html.find('.box-cousers');
                    $btnUsers = $panelUsers.find('> .btn-users');
                    $panelUsers.hide();
                    return $html;
                }
                if ( role === 'title' ) {
                    const $html = $(_.template(templateTitleBox)({scope: this}));

                    !!$labelDocName && $labelDocName.hide().off();                  // hide document title if it was created in right box
                    $labelDocName = $html.find('#title-doc-name');
                    setTimeout(() => { this.setDocTitle(this.documentCaption); }, 50);

                    this.options.wopi && $labelDocName.attr('maxlength', this.options.wopi.FileNameMaxLength);

                    if (config.user.guest && config.canRenameAnonymous) {
                        this.btnUserName = new Common.UI.Button({
                            el: $html.findById('.slot-btn-user-name'),
                            cls: 'btn-header',
                            dataHint:'0',
                            dataHintDirection: 'bottom',
                            dataHintOffset: 'big',
                            visible: true
                        });
                        this.btnUserName.cmpEl.removeClass('hidden');
                    }
                    else {
                        this.elUserName = $html.find('.btn-current-user');
                        this.elUserName.removeClass('hidden');
                    }
                    $btnUserName = $html.find('.color-user-name');
                    this.setUserName(this.options.userName);

                    if ( config.canCloseEditor )
                        this.btnClose = createTitleButton('toolbar__icon icon--inverse btn-close', $html.findById('#slot-btn-close'), false, 'left', '10, 10');

                    if ( config.canPrint && config.twoLevelHeader ) {
                        this.btnPrint = createTitleButton('toolbar__icon icon--inverse btn-print', $html.findById('#slot-btn-dt-print'), true, undefined, undefined, 'P');
                        this.shortcutHints.PrintPreviewAndPrint = {
                            btn: this.btnPrint,
                            label: this.tipPrint
                        };
                        !Common.localStorage.getBool(`${this.appPrefix}quick-access-print`, true) && this.btnPrint.hide();
                    }
                    if ( config.canQuickPrint && config.twoLevelHeader ) {
                        this.btnPrintQuick = createTitleButton('toolbar__icon icon--inverse btn-quick-print', $html.findById('#slot-btn-dt-print-quick'), true, undefined, undefined, 'Q');
                        !Common.localStorage.getBool(`${this.appPrefix}quick-access-quick-print`, true) && this.btnPrintQuick.hide();
                    }
                    if (config.showSaveButton) {
                        const save_icon = config.canSaveToFile || config.isDesktopApp && config.isOffline ? 'btn-save' : 'btn-download';
                        this.btnSave = createTitleButton(`toolbar__icon icon--inverse ${save_icon}`, $html.findById('#slot-btn-dt-save'), true, undefined, undefined, 'S');
                        !Common.localStorage.getBool(`${this.appPrefix}quick-access-save`, true) && this.btnSave.hide();
                        
                        // Set hint text based on save availability and editor type
                        if (appConfig.canSaveToFile || appConfig.isDesktopApp && appConfig.isOffline) {
                            this.shortcutHints.Save = {
                                btn: this.btnSave,
                                label: this.tipSave
                            };
                        } else {
                            this.btnSave.updateHint(this.tipDownload);
                        }
                    }
                    this.btnUndo = createTitleButton('toolbar__icon icon--inverse btn-undo icon-rtl', $html.findById('#slot-btn-dt-undo'), true, undefined, undefined, 'Z',
                                                    [Common.enumLock.undoLock, Common.enumLock.fileMenuOpened, Common.enumLock.lostConnect]);
                    !Common.localStorage.getBool(`${this.appPrefix}quick-access-undo`, true) && this.btnUndo.hide();
                    this.shortcutHints.EditUndo = {
                        btn: this.btnUndo,
                        label: this.tipUndo
                    };
                    
                    this.btnRedo = createTitleButton('toolbar__icon icon--inverse btn-redo icon-rtl', $html.findById('#slot-btn-dt-redo'), true, undefined, undefined, 'Y',
                                                    [Common.enumLock.redoLock, Common.enumLock.fileMenuOpened, Common.enumLock.lostConnect]);
                    !Common.localStorage.getBool(`${this.appPrefix}quick-access-redo`, true) && this.btnRedo.hide();
                    this.shortcutHints.EditRedo = {
                        btn: this.btnRedo,
                        label: this.tipRedo
                    };

                    if (isPEEditor) {
                        this.btnStartOver= createTitleButton('toolbar__icon icon--inverse btn-preview', $html.findById('#slot-btn-dt-start-over'), true, undefined, undefined, 'O');
                        !Common.localStorage.getBool(`${this.appPrefix}quick-access-start-over`, true) && this.btnStartOver.hide();
                        this.shortcutHints.DemonstrationStartPresentation = {
                            btn: this.btnStartOver,
                            label: this.tipStartOver
                        };
                    }
                    this.btnQuickAccess = new Common.UI.Button({
                        cls: 'btn-header no-caret',
                        iconCls: 'toolbar__icon icon--inverse btn-more',
                        menu: true,
                        dataHint:'0',
                        dataHintDirection: config.isDesktopApp ? 'right' : 'left',
                        dataHintOffset: config.isDesktopApp ? '10, -18' : '10, 10'
                    });
                    this.btnQuickAccess.render($html.find('#slot-btn-dt-quick-access'));

                    return $html;
                }
            },

            setVisible: (visible) => {
                // visible
                //     ? this.show()
                //     : this.hide();
            },

            setBranding: function (value, config) {
                this.branding = value;
                const element = $('#header-logo');
                const logo = this.getSuitableLogo(value, config);
                element.toggleClass('logo-light', logo.isLight);
                if ( value?.logo && element) {
                    if (value.logo.visible===false) {
                        element.addClass('hidden');
                    } else if (value.logo.image || value.logo.imageDark || value.logo.imageLight) {
                        _logoImage = logo.image;
                        element.html(`<img src="${_logoImage}" style="max-width:300px; max-height:20px; margin: 0;"/>`);
                        element.css({'background-image': 'none', width: 'auto'});
                        (value.logo.url || value.logo.url===undefined) && element.addClass('link');
                    }
                }
            },

            getSuitableLogo: (branding, config, tabStyle, tabBackground) => {
                branding = branding || {};
                let image = branding.logo ? branding.logo.image || branding.logo.imageDark || branding.logo.imageLight : null;
                let isDark = true;
                tabStyle = tabStyle || Common.Utils.InternalSettings.get("settings-tab-style") || 'fill';
                tabBackground = tabBackground || Common.Utils.InternalSettings.get("settings-tab-background") || 'header';
                if (!Common.Utils.isIE) {
                    const header_color = Common.UI.Themes.currentThemeColor(isDocEditor && config.isPDFForm || isPDFEditor ? '--toolbar-header-pdf' :
                                                                            isDocEditor ? '--toolbar-header-document' : isSSEEditor ? '--toolbar-header-spreadsheet' :
                                                                            isVisioEditor ? '--toolbar-header-visio' : '--toolbar-header-presentation');
                    const toolbar_color = Common.UI.Themes.currentThemeColor('--background-toolbar');
                    const logo_type = (!config.twoLevelHeader || config.compactHeader) && (tabBackground==='toolbar') ? toolbar_color : header_color;
                    isDark = (new Common.Utils.RGBColor(logo_type)).isDark();
                    image = !branding.logo ? null : isDark ? (branding.logo.imageDark || branding.logo.image || branding.logo.imageLight) :
                                                             (branding.logo.imageLight || branding.logo.image || branding.logo.imageDark) ;
                }
                return {image: image, isLight: !isDark};
            },

            changeLogo: function () {
                if (!appConfig) return;

                const value = this.branding;
                const logo = this.getSuitableLogo(value, appConfig, Common.Utils.InternalSettings.get("settings-tab-style"), Common.Utils.InternalSettings.get("settings-tab-background"));
                $('#header-logo').toggleClass('logo-light', logo.isLight);
                if ( value?.logo && (value.logo.visible!==false) && appConfig && (value.logo.image || value.logo.imageDark || value.logo.imageLight)) {
                    const image = logo.image; // change logo when image was changed
                    if (image !== _logoImage) {
                        _logoImage = image;
                        $('#header-logo img').attr('src', image);
                    }
                }
            },

            setDocumentCaption: function(value) {
                !value && (value = '');

                this.documentCaption = value;
                const idx = this.documentCaption.lastIndexOf('.');
                this.fileExtention = idx>0 ? this.documentCaption.substring(idx) : '';
                this.isModified && (value += '*');
                this.readOnly && (value += ` (${this.textReadOnly})`);
                if ( $labelDocName && !this.withoutExt ) {
                    this.setDocTitle( value );
                }
                return value;
            },

            getDocumentCaption: function () {
                return this.documentCaption;
            },

            setDocumentChanged: function (changed) {
                this.isModified = changed;

                let _name = this.documentCaption;
                changed && (_name += '*');

                this.setDocTitle(_name);
            },

            setCanBack: function (value, text) {
                this.options.canBack = value;
                this.btnGoBack[value ? 'show' : 'hide']();
                if (value)
                    this.btnGoBack.updateHint((text && typeof text === 'string') ? text : this.textBack);
                updateDocNamePosition();
                return this;
            },

            getCanBack: function () {
                return this.options.canBack;
            },

            setFavorite: function (value) {
                this.options.favorite = value;
                this.btnFavorite[value!==undefined && value!==null ? 'show' : 'hide']();
                this.btnFavorite.changeIcon(value ? {next: 'btn-in-favorite', curr: 'btn-favorite'} : {next: 'btn-favorite', curr: 'btn-in-favorite'});
                this.btnFavorite.updateHint(!value ? this.textAddFavorite : this.textRemoveFavorite);
                updateDocNamePosition();
                return this;
            },

            getFavorite: function () {
                return this.options.favorite;
            },

            setWopi: function(value) {
                this.options.wopi = value;
            },

            setCanRename: function (rename) {
                this.options.canRename = rename;
                if ( $labelDocName ) {
                    const label = $labelDocName;
                    if ( rename ) {
                        label.removeAttr('disabled').tooltip({
                            title: this.txtRename,
                            placement: 'cursor'}
                        );

                        label.on({
                            'keydown': onDocNameKeyDown.bind(this),
                            'focus': onFocusDocName.bind(this),
                            'blur': (e) => {
                                !this.isSaveDocName && onDocNameChanged.call(this);
                                this.imgCrypted?.toggleClass('hidden', false);
                                Common.Utils.isGecko && (label[0].selectionStart = label[0].selectionEnd = 0);
                                if(!this.isSaveDocName) {
                                    this.withoutExt = false;
                                    this.setDocTitle(this.documentCaption);
                                }
                            },
                            'paste': (e) => {
                                setTimeout(() => {
                                    const name = this.cutDocName($labelDocName.val());
                                    this.setDocTitle(name);
                                });
                            }
                        });

                    } else {
                        label.off();
                        label.attr('disabled', true);
                        const tip = label.data('bs.tooltip');
                        if ( tip ) {
                            tip.options.title = '';
                            tip.setContent();
                        }
                    }
                    label.attr('data-can-copy', rename);
                }
            },

            cutDocName: function(name) {
                if(name.length <= this.fileExtention.length) return name;
                const idx =name.length - this.fileExtention.length;

                return (name.substring(idx) === this.fileExtention) ? name.substring(0, idx) : name ;
            },

            setDocTitle: function(name){
                if (!$labelDocName) return;
                const width = this.getTextWidth(name || $labelDocName.val());
                (width>=0) && $labelDocName.width(width);
                name && (width>=0) && $labelDocName.val(name);
                if (this._showImgCrypted && width>=0) {
                    this.imgCrypted.toggleClass('hidden', false);
                    this._showImgCrypted = false;
                }
                (width>=0) && onResize();
            },

            getTextWidth: function(text) {
                if (!this._testCanvas ) {
                    const font = (`${$labelDocName.css('font-size')} ${$labelDocName.css('font-family')}`).trim();
                    if (font) {
                        const canvas = document.createElement("canvas");
                        this._testCanvas = canvas.getContext('2d');
                        this._testCanvas.font = font;
                    }
                }
                if (this._testCanvas) {
                    const mt = this._testCanvas.measureText(text);
                    return (mt.actualBoundingBoxLeft!==undefined) ? Math.ceil(Math.abs(mt.actualBoundingBoxLeft) + Math.abs(mt.actualBoundingBoxRight)) + 1 : (mt.width ? Math.ceil(mt.width)+2 : 0);
                }
                return -1;
            },

            setUserName: function(name) {
                this.options.userName = name;
                if ( this.btnUserName ) {
                    this.btnUserName.updateHint(name);
                } else if (this.elUserName) {
                    this.elUserName.tooltip({
                        title: Common.Utils.String.htmlEncode(name),
                        placement: 'cursor',
                        html: true
                    });
                }
                $btnUserName && this.updateAvatarEl();

                return this;
            },

            setUserAvatar: function(avatar) {
                this.options.userAvatar = avatar;
                $btnUserName && this.updateAvatarEl();
            },

            setUserId: function(id) {
                this.options.currentUserId = id;
            },

            updateAvatarEl: function(){
                if(this.options.userAvatar){
                    $btnUserName.css({
                        'background-image': `url(${this.options.userAvatar})`,
                        'background-color': 'transparent'
                    });
                    $btnUserName.text('');
                } else {
                    $btnUserName.text(Common.Utils.getUserInitials(this.options.userName));
                }
            },

            avatarsUpdate: function(type, users) {
                if (type!=='info') return;
                this.setUserAvatar(Common.UI.ExternalUsers.getImage(this.options.currentUserId));
            },

            getButton: function(type) {
                if (type === 'save')
                    return this.btnSave;
                if (type === 'users')
                    return $panelUsers;
                if (type === 'share')
                    return this.btnShare;
                if (type === 'mode')
                    return this.btnDocMode;
            },

            lockHeaderBtns: function (alias, lock, cause) {
                if ( alias === 'users' ) {
                    if ( lock ) {
                        $btnUsers.addClass('disabled').attr('disabled', 'disabled');
                    } else {
                        $btnUsers.removeClass('disabled').removeAttr('disabled');
                    }
                    if (this.btnShare) {
                        this.btnShare.setDisabled(lock);
                    }
                } else if ( alias === 'rename-user' ) {
                    if (this.btnUserName) {
                        this.btnUserName.setDisabled(lock);
                    }
                } else if ( alias === 'search' ) {
                    if (this.btnSearch) {
                        this.btnSearch.setDisabled(lock);
                    }
                } else if ( alias === 'startfill' ) {
                    this.btnStartFill?.setDisabled(lock);
                } else {
                    const _lockButton = (btn) => {
                        btn && Common.Utils.lockControls(cause, lock, {array: [btn]});
                    };
                    switch ( alias ) {
                    case 'undo': _lockButton(this.btnUndo); break;
                    case 'redo': _lockButton(this.btnRedo); break;
                    case 'mode': _lockButton(this.btnDocMode ? this.btnDocMode : this.btnPDFMode); break;
                    default: break;
                    }
                }
            },

            setDocumentReadOnly: function (readonly) {
                this.readOnly = readonly;
                this.setDocumentCaption(this.documentCaption);
            },

            onStartFilling: function() {
                this.btnStartFill?.setVisible(false);
                updateDocNamePosition();
            },

            onThemeChanged: function() {
                this.changeLogo();
                if (this._testCanvas)
                    this._testCanvas = undefined;
                this.setDocTitle();
            },

            textBack: 'Go to Documents',
            txtRename: 'Rename',
            txtAccessRights: 'Change access rights',
            tipAccessRights: 'Manage document access rights',
            labelCoUsersDescr: 'Document is currently being edited by several users.',
            tipViewUsers: 'View users and manage document access rights',
            tipUsers: 'View users',
            tipDownload: 'Download file',
            tipPrint: 'Print file',
            tipGoEdit: 'Edit current file',
            tipSave: 'Save',
            tipUndo: 'Undo',
            tipRedo: 'Redo',
            textCompactView: 'Hide Toolbar',
            textHideStatusBar: 'Combine sheet and status bars',
            textHideLines: 'Hide Rulers',
            textZoom: 'Zoom',
            textAdvSettings: 'Advanced Settings',
            tipViewSettings: 'View Settings',
            textRemoveFavorite: 'Remove from Favorites',
            textAddFavorite: 'Mark as favorite',
            textHideNotes: 'Hide Notes',
            tipSearch: 'Search',
            textShare: 'Share',
            tipPrintQuick: 'Quick print',
            textReadOnly: 'Read only',
            textView: 'Viewing',
            textComment: 'Commenting',
            textEdit: 'Editing',
            textViewDesc: 'All changes will be saved locally',
            textCommentDesc: 'All changes will be saved to the file. Real time collaboration',
            textEditDesc: 'All changes will be saved to the file. Real time collaboration',
            textViewDescNoCoedit: 'View or annotate',
            textEditDescNoCoedit: 'Add or edit text, shapes, images etc.',
            tipView: 'Viewing',
            tipComment: 'Commenting',
            tipEdit: 'Editing',
            textDocViewDesc: 'View the file, but make no changes',
            textDocEditDesc: 'Make any changes',
            tipDocView: 'Viewing',
            tipDocEdit: 'Editing',
            textReview: 'Reviewing',
            textReviewDesc: 'Suggest changes',
            tipReview: 'Reviewing',
            textClose: 'Close file',
            textStartFill: 'Start filling',
            tipCustomizeQuickAccessToolbar: 'Customize Quick Access Toolbar',
            textPrint: 'Print',
            textViewForm: 'Viewing form',
            tipDocViewForm: 'Viewing form',
            textDocViewFormDesc: 'See how the form will look like when filling out',
            helpDocMode: 'Easily change the way you work on a document: edit, review and track changes, or view only. This works individually for each user. So, you won’t affect or disturb other co-authors. ',
            helpDocModeHeader: 'Switch between modes',
            helpQuickAccess: 'Hide or show the functional buttons of your choice.',
            helpQuickAccessHeader: 'Customize Quick Access',
            ariaQuickAccessToolbar: 'Quick access toolbar',
            textAnnotateDesc: 'Fill forms or annotate',
            textDownload: 'Download',
            tipFillStatus: 'Filling status'
        }
    })(), Common.Views.Header || {}))
});
