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
 *    Chat.js
 *
 *    View
 *
 *    Created on 27 February 2014
 *
 */

if (Common === undefined)
    const Common = {};

Common.Views = Common.Views || {};

define([
    'text!common/main/lib/template/Chat.template',
    'common/main/lib/util/utils',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout'
], (template) => {

    Common.Views.Chat = Common.UI.BaseView.extend(_.extend({
        el: '#left-panel-chat',
        template: _.template(template),
        storeUsers: undefined,
        storeMessages: undefined,

        tplUser: ['<li id="<%= user.get("iid") %>"<% if (!user.get("online")) { %> class="offline"<% } %>>',
                        '<div class="name"><div class="color" style="background-color: <%= user.get("color") %>;" ></div><%= Common.Utils.String.htmlEncode(user.get("parsedName")) %>',
                        '</div>',
                    '</li>'].join(''),

        templateUserList: _.template('<ul>' +
                            '<% for (originalId in users) { %>' +
                                '<%= _.template(usertpl)({user: users[originalId][0], scope: scope}) %>' +
                            '<% } %>' +
                    '</ul>'),

        tplMsg: ['<li>',
                    '<% if (msg.get("type")==1) { %>',
                        '<div class="message service" data-can-copy="true"><%= msg.get("message") %></div>',
                    '<% } else { %>',
                        '<div class="color"', 
                            '<% if (msg.get("avatar")) { %>',
                                'style="background-image: url(<%=msg.get("avatar")%>); <% if (msg.get("usercolor")!==null) { %> border-color:<%=msg.get("usercolor")%>; border-style:solid;<% }%>"', 
                            '<% } else { %>',
                                'style="background-color: <% if (msg.get("usercolor")!==null) { %> <%=msg.get("usercolor")%> <% } else { %> #cfcfcf <% }%>;"',
                            '<% } %>',
                        '><% if (!msg.get("avatar")) { %><%-msg.get("initials")%><% } %></div>',
                        '<div class="user-content">',
                            '<div class="user-name" data-can-copy="true">',
                                '<%= Common.Utils.String.htmlEncode(msg.get("parsedName")) %>',
                            '</div>',
                            '<label class="message user-select" data-can-copy="true" tabindex="-1" oo_editor_input="true"><%= msg.get("message") %></label>',
                        '</div>',
                    '<% } %>',
            '</li>'].join(''),

        templateMsgList: _.template('<ul>' +
                        '<% _.each(messages, function(item) { %>' +
                            '<%= _.template(msgtpl)({msg: item, scope: scope}) %>' +
                        '<% }); %>' +
                    '</ul>'),

        events: {
        },

        usersBoxHeight: 117,
        messageBoxHeight: 70,
        addMessageBoxHeight: 110,

        initialize: function(options) {
            _.extend(this, options);
            Common.UI.BaseView.prototype.initialize.call(this, arguments);

            this.storeUsers.bind({
                add     : _.bind(this._onResetUsers, this),
                change  : _.bind(this._onResetUsers, this),
                reset   : _.bind(this._onResetUsers, this)
            });

            this.storeMessages.bind({
                add     : _.bind(this._onAddMessage, this),
                reset   : _.bind(this._onResetMessages, this)
            });
        },

        render: function(el) {
            el = el || this.el;
            $(el).html(this.template({scope: this, maxMsgLength: Asc.c_oAscMaxCellOrCommentLength, textChat: this.textChat, textEnterMessage: this.textEnterMessage }));

            this.panelBox       = $('#chat-box', this.el);
            this.panelUsers     = $('#chat-users', this.el);
            this.panelMessages  = $('#chat-messages', this.el);
            this.txtMessage     = $('#chat-msg-text', this.el);
            this.panelOptions   = $('#chat-options', this.el);

            this.panelUsers.scroller = new Common.UI.Scroller({
                el              : $('#chat-users'),
                useKeyboard     : true,
                minScrollbarLength  : 25
            });
            this.panelMessages.scroller = new Common.UI.Scroller({
                el              : $('#chat-messages'),
                includePadding  : true,
                useKeyboard     : true,
                minScrollbarLength  : 40
            });
            this.panelOptions.scroller = new Common.UI.Scroller({el: $('#chat-options')});

            this.buttonClose = new Common.UI.Button({
                parentEl: $('#chat-btn-close', this.$el),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-close',
                hint: this.textClosePanel
            });
            this.buttonClose.on('click', _.bind(this.onClickClosePanel, this));

            $('#chat-msg-btn-add', this.el).on('click', _.bind(this._onBtnAddMessage, this));
            this.txtMessage.on('keydown', _.bind(this._onKeyDown, this));

            this.setupLayout();
            this.trigger('render:after', this);
            return this;
        },

        focus: function() {
            _.defer(()=> {
                this.txtMessage.focus();
            }, 100);

            this.updateLayout(true);
            this.setupAutoSizingTextBox();
        },

        getFocusElement: function () {
            return this.txtMessage;
        },

        _onKeyDown: function(event) {
            if (event.keyCode === Common.UI.Keys.RETURN) {
                if ((event.ctrlKey || event.metaKey) && !event.altKey) {
                    this._onBtnAddMessage(event);
                }
            }
        },

        _onResetUsers: function(c, opts) {
            if (this.panelUsers) {
                this.panelUsers.html(this.templateUserList({users: this.storeUsers.chain().filter((item)=> item.get('online')).groupBy((item) => item.get('idOriginal')).value(),
                                                            usertpl: this.tplUser, scope: this}));
                this.panelUsers.scroller.update({minScrollbarLength  : 25, alwaysVisibleY: true});
            }
        },

        _onAddMessage: function(m, c, opts) {
            if (this.panelMessages) {
                const content = this.panelMessages.find('ul');
                if (content?.length) {
                    this._prepareMessage(m);
                    content.append(_.template(this.tplMsg)({msg: m, scope: this}));

                    // scroll to end

                    this.panelMessages.scroller.update({minScrollbarLength  : 40, alwaysVisibleY: true});
                    this.panelMessages.scroller.scrollTop(Common.Utils.getBoundingClientRect(content.get(0)).height);
                }
            }
        },

        _onResetMessages: function(c, opts) {
            if (this.panelMessages) {
                let user;
                let color;
                c.each(function(msg){
                    this._prepareMessage(msg);
                }, this);

                this.panelMessages.html(this.templateMsgList({messages: c.models, msgtpl: this.tplMsg, scope: this}));
                this.panelMessages.scroller.update({minScrollbarLength  : 40, alwaysVisibleY: true});
            }
        },

        renderMessages: function() {
            if (this.panelMessages && this.storeMessages) {
                this.panelMessages.html(this.templateMsgList({messages: this.storeMessages.models, msgtpl: this.tplMsg, scope: this}));
                this.panelMessages.scroller.update({minScrollbarLength  : 40, alwaysVisibleY: true});
            }
        },

        _onBtnAddMessage: function(e) {
            if (this.txtMessage) {
                this.fireEvent('message:add', [this, this.txtMessage.val().trim()]);
                this.txtMessage.val('');
                this.focus();
            }
        },

        _prepareMessage: function(m) {
            const user    = this.storeUsers.findOriginalUser(m.get('userid'));
            const avatar = Common.UI.ExternalUsers.getImage(m.get('userid'));
            m.set({
                usercolor   : user ? user.get('color') : Common.UI.ExternalUsers.getColor(m.get('userid')),
                avatar      : avatar,
                initials    : user ? user.get('initials') : Common.Utils.getUserInitials(m.get('parsedName')),
                message     : this._pickLink(m.get('message'))
            }, {silent:true});
            (avatar===undefined) && Common.UI.ExternalUsers.get('info', [m.get('userid')]);
        },

        _pickLink: (message) => {
            let arr = [];
            let offset;
            let len;

            message.replace(Common.Utils.ipStrongRe, (subStr) => {
                const result = /[\.,\?\+;:=!\(\)]+$/.exec(subStr);
                if (result)
                    subStr = subStr.substring(0, result.index);
                offset = arguments[arguments.length-2];
                arr.push({start: offset, end: subStr.length+offset, str: `<a href="${subStr}" target="_blank" data-can-copy="true">${subStr}</a>`});
                return '';
            });

            if (message.length<1000 || message.search(/\S{255,}/)<0)
                message.replace(Common.Utils.hostnameStrongRe, (subStr) => {
                    const result = /[\.,\?\+;:=!\(\)]+$/.exec(subStr);
                    if (result)
                        subStr = subStr.substring(0, result.index);
                    const ref = (! /(((^https?)|(^ftp)):\/\/)/i.test(subStr) ) ? (`http://${subStr}`) : subStr;
                    offset = arguments[arguments.length-2];
                    len = subStr.length;
                    const elem = _.find(arr, (item)=> ( (offset>=item.start) && (offset<item.end) ||
                            (offset<=item.start) && (offset+len>item.start)));
                    if (!elem)
                        arr.push({start: offset, end: len+offset, str: `<a href="${ref}" target="_blank" data-can-copy="true">${subStr}</a>`});
                    return '';
                });

            message.replace(Common.Utils.emailStrongRe, (subStr) => {
                const ref = (! /((^mailto:)\/\/)/i.test(subStr) ) ? (`mailto:${subStr}`) : subStr;
                offset = arguments[arguments.length-2];
                len = subStr.length;
                const elem = _.find(arr, (item)=> ( (offset>=item.start) && (offset<item.end) ||
                        (offset<=item.start) && (offset+len>item.start)));
                if (!elem)
                    arr.push({start: offset, end: len+offset, str: `<a href="${ref}">${subStr}</a>`});
                return '';
            });

            arr = _.sortBy(arr, (item)=> item.start);

            let str_res = (arr.length>0) ? ( Common.Utils.String.htmlEncode(message.substring(0, arr[0].start)) + arr[0].str) : Common.Utils.String.htmlEncode(message);
            for (let i=1; i<arr.length; i++) {
                str_res += (Common.Utils.String.htmlEncode(message.substring(arr[i-1].end, arr[i].start)) + arr[i].str);
            }
            if (arr.length>0) {
                str_res += Common.Utils.String.htmlEncode(message.substring(arr[i-1].end, message.length));
            }
            return str_res;
        },

        hide: function () {
            Common.UI.BaseView.prototype.hide.call(this,arguments);
            this.fireEvent('hide', this );
            this.textBoxAutoSizeLocked = undefined;
        },

        setupLayout: function () {
            const parent = $(this.el);
            const items = this.panelBox.find(' > .layout-item');

            this.layout = new Common.UI.VBoxLayout({
                box: this.panelBox,
                items: [
                    {el: items[0], rely: true, behaviour: 'splitter',
                        resize: {
                            hidden: false,
                            autohide: false,
                            fmin: (() => this.usersBoxHeight),
                            fmax: (() => Math.max(this.usersBoxHeight-20,this.panelBox.height() * 0.5 - this.messageBoxHeight))
                        }},
                    {el: items[1], rely: true, behaviour: 'splitter',
                        resize: {
                            hidden: false,
                            autohide: false,
                            fmin: (() => Math.max(this.messageBoxHeight + this.usersBoxHeight, this.panelBox.height() * 0.5)),
                            fmax: (() => this.panelBox.height() - this.addMessageBoxHeight)
                        }},
                    {el: items[2], stretch: true}
                ]
            });

            this.layout.on('layout:resizedrag', (resizer) => {
                this.updateScrolls();
                this.usersCachedHeigt = this.panelUsers.height() + 8 + 1; // resizeHeight * 2 + 1
                if (!resizer.index) {
                    this.textBoxAutoSizeLocked = true;
                }
            }, this);

            $(window).on('resize', () => {
                if (parent.css('display') !== 'none') {
                    this.updateLayout();
                }
            });

            this.updateLayout();

            // default sizes

            const height = this.panelBox.height();

            this.layout.setResizeValue(0, this.usersBoxHeight);
            this.layout.setResizeValue(1,
                Math.max (this.addMessageBoxHeight,
                    Math.max (height * 0.5, height - this.panelOptions.height() - 4)));

            // text box setup autosize input text

            this.setupAutoSizingTextBox();
            this.disableTextBoxButton($(this.txtMessage));
            this.txtMessage.bind('input propertychange',  _.bind(this.onTextareaInput, this));
        },
        onTextareaInput: function(event) {
            this.updateHeightTextBox(event);
            this.disableTextBoxButton($(event.target));
        },
        disableTextBoxButton: (textboxEl) => {
            const button = $(textboxEl.siblings('#chat-msg-btn-add')[0]);

            if(textboxEl.val().trim().length > 0) {
                button.removeAttr('disabled');
                button.removeClass('disabled');
            } else {
                button.attr('disabled', true);
                button.addClass('disabled');
            }
        },
        updateLayout: function (applyUsersAutoSizig) {
            const height = this.panelBox.height();

            this.layout.setResizeValue(1,
                Math.max (this.addMessageBoxHeight,
                    Math.max (height * 0.5, height - this.panelOptions.height() - 4)));

            if (applyUsersAutoSizig) {

                const oldHeight = this.panelUsers.css('height');
                this.panelUsers.css('height', '1px');
                const content = this.panelUsers.get(0).scrollHeight;

                this.layout.setResizeValue(0, Math.max(this.usersBoxHeight,
                    Math.min(content+2, Math.floor(height * 0.5) - this.messageBoxHeight)));
            } else {
                this.layout.setResizeValue(0, Math.max(this.usersBoxHeight,
                    Math.min(this.usersCachedHeigt + 2, Math.floor(height * 0.5) - this.messageBoxHeight)));
            }

            this.updateScrolls();
            this.updateHeightTextBox(null);
        },

        setupAutoSizingTextBox: function () {
            this.lineHeight = 0;
            this.minHeight = 44;
            this.lineHeight = Number.parseInt(this.txtMessage.css('lineHeight'), 10) * 1.25;  // TODO: need fix

            this.updateHeightTextBox(true);
        },

        updateHeightTextBox: function (event) {
            const textBox = this.txtMessage;
            let controlHeight;
            let contentHeight;
            let height;
            const textBoxMinHeightIndent = 36 + 4;    // 4px - autosize line height + big around border

            height = this.panelBox.height();

            if (event && 0 === textBox.val().length) {
                this.layout.setResizeValue(1, Math.max(this.addMessageBoxHeight, height - this.addMessageBoxHeight));
                this.textBoxAutoSizeLocked = undefined;
                this.updateScrolls();
                return;
            }

            if (!_.isUndefined(this.textBoxAutoSizeLocked))
                return;

            controlHeight = textBox.height();
            contentHeight = textBox.get(0).scrollHeight;

            // calculate text content height

            textBox.css({height: `${this.minHeight}px`});

            controlHeight = textBox.height();
            contentHeight = Math.max(textBox.get(0).scrollHeight + this.lineHeight, 1);

            textBox.css({height: '100%'});

            height = this.panelBox.height();

            if (this.layout.setResizeValue(1, Math.max(this.addMessageBoxHeight, Math.min(height - contentHeight - textBoxMinHeightIndent, height - this.addMessageBoxHeight))))
                this.updateScrolls(); // update when resize position changed
        },

        updateScrolls: function () {
            if (this.panelUsers?.scroller && this.panelMessages && this.panelMessages.scroller) {
                this.panelUsers.scroller.update({minScrollbarLength: 25, alwaysVisibleY: true});
                this.panelMessages.scroller.update({minScrollbarLength: 40, alwaysVisibleY: true});
            }
        },

        onClickClosePanel: () => {
            Common.NotificationCenter.trigger('leftmenu:change', 'hide');
        },

        textSend: "Send",
        textChat: "Chat",
        textClosePanel: "Close chat",
        textEnterMessage: "Enter your message here"

    }, Common.Views.Chat || {}))
});