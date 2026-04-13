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
 *  ReviewPopover.js
 *
 *  View
 *
 *  Created on 06.06.2018
 *
 */

if (Common === undefined)
    const Common = {};

Common.Views = Common.Views || {};

define([
    'text!common/main/lib/template/CommentsPopover.template',
    'text!common/main/lib/template/ReviewChangesPopover.template',
    'common/main/lib/util/utils',
    'common/main/lib/component/Button',
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/DataView',
    'common/main/lib/component/Layout',
    'common/main/lib/component/Window'
], (commentsTemplate, reviewTemplate) => {

    function replaceWords(template, words) {
        let word;
        let value;
        let tpl = template;

        for (word in words) {
            if (undefined !== word) {
                value = words[word];
                tpl = tpl.replace(new RegExp(word, 'g'), value);
            }
        }

        return tpl;
    }

    Common.Views.ReviewPopover = Common.UI.Window.extend(_.extend({

        // Window

        initialize: function (options) {
            const _options = {};

            _.extend(_options, {
                closable: false,
                width: 265,
                height: 120,
                header: false,
                modal: false,
                automove: false,
                alias: 'Common.Views.ReviewPopover'
            }, options);

            this.template = options.template || [
                    '<div class="box">',
                    '<div id="id-popover" class="comments-popover" style="overflow-y: hidden;position: relative;">',
                        '<div id="id-review-popover"></div>',
                        '<div id="id-comments-popover"></div>',
                    '</div>',
                    //'<div id="id-comments-arrow" class="comments-arrow"></div>',
                    '</div>'
                ].join('');

            this.commentsStore = options.commentsStore;
            this.reviewStore = options.reviewStore;
            this.canRequestUsers = options.canRequestUsers;
            this.canRequestSendNotify = options.canRequestSendNotify;
            this.mentionShare = options.mentionShare;
            this.api = options.api;
            this._state = {commentsVisible: false, reviewVisible: false, arrowCls: 'left'};
            this.isDocEditor = !!window.DE;

            _options.tpl = _.template(this.template)(_options);

            this.arrow = {margin: 20, width: 10, height: 30};
            this.sdkBounds = {width: 0, height: 0, outerWidth: 0, outerHeight: 0, padding: 10, paddingTop: 20};

            Common.UI.Window.prototype.initialize.call(this, _options);

            if (this.canRequestUsers) {
                Common.NotificationCenter.on('mentions:setusers',   _.bind(this.onEmailListMenuCallback, this));
            }

            return this;
        },
        render: function (comments, review) {
            Common.UI.Window.prototype.render.call(this);

            const me = this;
            const window = this.$window;

            window.css({
                height: '',
                minHeight: '',
                overflow: 'hidden',
                position: 'absolute',
                zIndex: '990'
            });

            const body = window.find('.body');
            if (body) {
                body.css('position', 'relative');
            }

            const CommentsPopoverDataView = Common.UI.DataView.extend((() => {

                const parentView = me;

                return {

                    options: {
                        handleSelect: false,
                        allowScrollbar: false,
                        template: _.template('<div class="dataview-ct inner" style="overflow-y: visible;"></div>')
                    },

                    getTextBox: function () {
                        const text = $(this.el).find('textarea');
                        return (text?.length) ? text : undefined;
                    },
                    setFocusToTextBox: function (blur) {
                        const text = $(this.el).find('textarea');
                        if (blur) {
                            text.blur();
                        } else {
                            if (text?.length) {
                                const val = text.val();
                                text.focus();
                                text.val('');
                                text.val(val);
                            }
                        }
                    },
                    getActiveTextBoxVal: function () {
                        const text = $(this.el).find('textarea');
                        return (text?.length) ? text.val().trim() : '';
                    },
                    disableTextBoxButton: (textboxEl) => {
                        const button = $(textboxEl.siblings('#id-comments-change-popover')[0]);

                        if(textboxEl.val().trim().length > 0) {
                            button.removeAttr('disabled');
                            button.removeClass('disabled');
                        } else {
                            button.attr('disabled', true);
                            button.addClass('disabled');
                        }
                    },
                    autoHeightTextBox: function () {
                        const view = this;
                        const textBox = this.$el.find('textarea');
                        let domTextBox = null;
                        const minHeight = 55;
                        let lineHeight = 0;
                        let scrollPos = 0;
                        let oldHeight = 0;
                        let newHeight = 0;


                        function updateTextBoxHeight() {
                            scrollPos = parentView.scroller.getScrollTop();
                            if (domTextBox.scrollHeight > domTextBox.clientHeight) {
                                if (domTextBox.clientHeight + 2 < Number.parseInt($(domTextBox).css('max-height'))) { // 2 = border of textarea
                                    textBox.css({height: `${domTextBox.scrollHeight + lineHeight}px`});

                                    parentView.calculateSizeOfContent();
                                }
                            } else {
                                oldHeight = domTextBox.clientHeight;
                                if (oldHeight >= minHeight) {
                                    textBox.css({height: `${minHeight}px`});

                                    if (domTextBox.scrollHeight > domTextBox.clientHeight) {
                                        newHeight = Math.max(domTextBox.scrollHeight + lineHeight, minHeight);
                                        textBox.css({height: `${newHeight}px`});
                                    }

                                    parentView.calculateSizeOfContent();
                                    parentView.setLeftTop(me.arrowPosX, me.arrowPosY, me.leftX);
                                    parentView.calculateSizeOfContent();
                                }
                            }

                            parentView.scroller.scrollTop(scrollPos);
                            parentView.autoScrollToEditButtons();
                        }

                        function onTextareaInput(event) {
                            updateTextBoxHeight();
                            view.disableTextBoxButton($(event.target));
                        }


                        if (textBox?.length && parentView.scroller) {
                            domTextBox = textBox.get(0);

                            view.disableTextBoxButton(textBox);
                            if (domTextBox) {
                                lineHeight = Number.parseInt(textBox.css('lineHeight'), 10) * 0.25;
                                updateTextBoxHeight();
                                textBox.bind('input propertychange', onTextareaInput)
                            }
                        }

                        this.textBox = textBox;
                    },
                    clearTextBoxBind: function () {
                        if (this.textBox) {
                            this.textBox.unbind('input propertychange');
                            this.textBox = undefined;
                        }
                    }
                }
            })());
            if (CommentsPopoverDataView) {
                if (this.commentsView) {
                    this.commentsView.render($('#id-comments-popover'));
                    this.commentsView.onResetItems();
                } else {
                    this.commentsView = new CommentsPopoverDataView({
                        el: $('#id-comments-popover'),
                        itemTemplate: _.template(replaceWords(commentsTemplate, {
                                textAddReply: me.textAddReply,
                                textMentionReply: me.canRequestSendNotify ? (me.mentionShare ? me.textMention : me.textMentionNotify) : me.textAddReply,
                                textAdd: me.textAdd,
                                textCancel: me.textCancel,
                                textEdit: me.textEdit,
                                textReply: me.textReply,
                                textClose: me.textClose,
                                textComment: me.textComment,
                                maxCommLength: Asc.c_oAscMaxCellOrCommentLength,
                                textMentionComment: me.canRequestSendNotify ? (me.mentionShare ? me.textMention : me.textMentionNotify) : me.textEnterComment
                            })
                        )
                    });

                    const addtooltip = function (dataview, view, record) {
                        if (view.tipsArray) {
                            view.tipsArray.forEach((item) => {
                                item.remove();
                            });
                        }

                        const arr = [];
                        let btns = $(view.el).find('.btn-resolve:not(.comment-resolved)');
                        btns.tooltip({title: me.textResolve, placement: 'cursor'});
                        btns.each((idx, item) => {
                            arr.push($(item).data('bs.tooltip').tip());
                        });
                        btns = $(view.el).find('.comment-resolved');
                        btns.tooltip({title: me.textOpenAgain, placement: 'cursor'});
                        btns.each((idx, item) => {
                            arr.push($(item).data('bs.tooltip').tip());
                        });
                        btns = $(view.el).find('.i-comment-resolved');
                        btns.tooltip({title: me.textViewResolved, placement: 'cursor'});
                        btns.each((idx, item) => {
                            arr.push($(item).data('bs.tooltip').tip());
                        });
                        btns = $(view.el).find('.btn-edit-common');
                        btns.tooltip({title: me.txtEditTip, placement: 'cursor'});
                        btns.each((idx, item) => {
                            arr.push($(item).data('bs.tooltip').tip());
                        });
                        btns = $(view.el).find('.btn-delete');
                        btns.tooltip({title: me.txtDeleteTip, placement: 'cursor'});
                        btns.each((idx, item) => {
                            arr.push($(item).data('bs.tooltip').tip());
                        });
                        view.tipsArray = arr;
                        this.autoHeightTextBox();
                    };

                    const onCommentsViewMouseOver = () => {
                        me._isMouseOver = true;
                    };

                    const onCommentsViewMouseOut = () => {
                        me._isMouseOver = false;
                    };

                    this.commentsView.on('item:add', addtooltip);
                    this.commentsView.on('item:remove', addtooltip);
                    this.commentsView.on('item:change', addtooltip);
                    this.commentsView.cmpEl.on('mouseover', onCommentsViewMouseOver).on('mouseout', onCommentsViewMouseOut);

                    this.commentsView.setStore(me.commentsStore);
                    this.commentsView.onResetItems();

                    this.commentsView.on('item:click', function (picker, item, record, e) {
                        let btn;
                        let showEditBox;
                        let showReplyBox;
                        let commentId;
                        let replyId;
                        let hideAddReply;

                        function readdresolves() {
                            me.update();
                        }

                        btn = $(e.target);
                        if (btn) {
                            showEditBox = record.get('editTextInPopover');
                            showReplyBox = record.get('showReplyInPopover');
                            hideAddReply = record.get('hideAddReply');
                            commentId = record.get('uid');
                            replyId = btn.attr('data-value');

                            if (record.get('hint')) {
                                me.fireEvent('comment:disableHint', [record]);

                                if(!record.get('fullInfoInHint'))
                                    return;
                            }

                            if (btn.hasClass('btn-edit-common')) {
                                const tip = btn.data('bs.tooltip');
                                if (tip) tip.dontShow = true;

                                if (!_.isUndefined(replyId)) {
                                    me.fireEvent('comment:closeEditing', [commentId]);
                                    me.fireEvent('comment:editReply', [commentId, replyId, true]);

                                    this.replyId = replyId;

                                    this.autoHeightTextBox();

                                    me.calculateSizeOfContent();
                                    me.setLeftTop(me.arrowPosX, me.arrowPosY, me.leftX);
                                    me.calculateSizeOfContent();

                                    readdresolves();

                                    me.hookTextBox();

                                    me.autoScrollToEditButtons();
                                    this.setFocusToTextBox();
                                } else {
                                    if (!showEditBox) {
                                        me.fireEvent('comment:closeEditing');
                                        record.set('editTextInPopover', true);

                                        me.fireEvent('comment:show', [commentId]);

                                        this.autoHeightTextBox();

                                        me.calculateSizeOfContent();
                                        me.setLeftTop(me.arrowPosX, me.arrowPosY, me.leftX);
                                        me.calculateSizeOfContent();

                                        readdresolves();

                                        me.hookTextBox();

                                        me.autoScrollToEditButtons();
                                        this.setFocusToTextBox();
                                    }
                                }
                            } else if (btn.hasClass('btn-delete')) {
                                const tip = btn.data('bs.tooltip');
                                if (tip) tip.dontShow = true;

                                if (!_.isUndefined(replyId)) {
                                    me.fireEvent('comment:removeReply', [commentId, replyId]);

                                    me.calculateSizeOfContent();
                                    me.setLeftTop(me.arrowPosX, me.arrowPosY, me.leftX);
                                    me.calculateSizeOfContent();

                                } else {
                                    me.fireEvent('comment:remove', [commentId]);
                                }

                                me.fireEvent('comment:closeEditing');

                                readdresolves();

                            } else if (btn.hasClass('user-reply')) {
                                me.fireEvent('comment:closeEditing');
                                record.set('showReplyInPopover', true);

                                me.calculateSizeOfContent();
                                me.setLeftTop(me.arrowPosX, me.arrowPosY, me.leftX);
                                me.calculateSizeOfContent();

                                readdresolves();

                                this.autoHeightTextBox();
                                me.hookTextBox();

                                me.autoScrollToEditButtons();
                                this.setFocusToTextBox();
                            } else if (btn.hasClass('btn-reply', false)) {
                                if (showReplyBox) {
                                    this.clearTextBoxBind();

                                    me.fireEvent('comment:addReply', [commentId, this.getActiveTextBoxVal()]);
                                    me.fireEvent('comment:closeEditing');
                                    me.calculateSizeOfContent();

                                    readdresolves();
                                }
                            } else if (btn.hasClass('btn-close', false)) {
                                me.fireEvent('comment:closeEditing', [commentId]);
                                me.calculateSizeOfContent();
                                me.fireEvent('comment:show', [commentId]);

                                readdresolves();

                            } else if (btn.hasClass('btn-inner-edit', false)) {

                                if (record.get('dummy')) {
                                    const commentVal = this.getActiveTextBoxVal();
                                    me.clearDummyText();
                                    if (commentVal.length > 0)
                                        me.fireEvent('comment:addDummyComment', [commentVal]);
                                    else {
                                        const text = me.$window.find('textarea:not(.user-message)');
                                        if (text?.length)
                                            setTimeout(() => {
                                                text.focus();
                                            }, 10);
                                    }
                                    return;
                                }

                                this.clearTextBoxBind();

                                if (!_.isUndefined(this.replyId)) {
                                    me.fireEvent('comment:changeReply', [commentId, this.replyId, this.getActiveTextBoxVal()]);
                                    this.replyId = undefined;
                                    me.fireEvent('comment:closeEditing');
                                } else if (showEditBox) {
                                    me.fireEvent('comment:change', [commentId, this.getActiveTextBoxVal()]);
                                    me.fireEvent('comment:closeEditing');
                                    me.calculateSizeOfContent();
                                }

                                readdresolves();

                            } else if (btn.hasClass('btn-inner-close', false)) {
                                if (record.get('dummy')) {
                                    me.clearDummyText();
                                    me.hide();
                                    return;
                                }

                                if (hideAddReply && this.getActiveTextBoxVal().length > 0) {
                                    me.saveText();
                                    record.set('hideAddReply', false);
                                    this.getTextBox().val(me.textVal);
                                    this.autoHeightTextBox();
                                } else {

                                    this.clearTextBoxBind();

                                    me.fireEvent('comment:closeEditing', [commentId]);
                                }

                                this.replyId = undefined;

                                me.calculateSizeOfContent();
                                me.setLeftTop(me.arrowPosX, me.arrowPosY, me.leftX);
                                me.calculateSizeOfContent();

                                readdresolves();

                            } else if (btn.hasClass('btn-resolve')) {
                                const tip = btn.data('bs.tooltip');
                                if (tip) tip.dontShow = true;

                                me.fireEvent('comment:resolve', [commentId]);

                                readdresolves();
                            }
                        }
                    });

                    this.emailMenu = new Common.UI.Menu({
                        maxHeight: 200,
                        cyclic: false,
                        cls: 'font-size-medium',
                        items: []
                    }).on('render:after', function(mnu) {
                        this.scroller = new Common.UI.Scroller({
                            el: $(this.el).find('.dropdown-menu '),
                            useKeyboard: this.enableKeyEvents && !this.handleSelect,
                            minScrollbarLength  : 40,
                            alwaysVisibleY: true
                        });
                    }).on('show:after', function () {
                        this.scroller.update({alwaysVisibleY: true});
                        me.$window.css({zIndex: '1001'});
                    }).on('hide:after', () => {
                        me.$window.css({zIndex: '990'});
                    });

                    me.on({
                        'show': () => {
                            me.commentsView.autoHeightTextBox();
                            me.$window.find('textarea').keydown((event) => {
                                if (event.keyCode === Common.UI.Keys.ESC) {
                                    me.hide(true); // clear text in dummy comment
                                }
                            });
                        },
                        'animate:before': () => {
                            const text = me.$window.find('textarea');
                            if (text?.length){
                                text.focus();
                                me.commentsView.disableTextBoxButton(text);
                            }
                        }
                    });
                }
            }

            const ReviewPopoverDataView = Common.UI.DataView.extend((() => ({
                    options : {
                        handleSelect: false,
                        scrollable: true,
                        template: _.template('<div class="dataview-ct inner" style="overflow-y: visible;">'+
                            '</div>'
                        )
                    }
                }))());
            if (ReviewPopoverDataView) {
                if (this.reviewChangesView) {
                    this.reviewChangesView.render($('#id-review-popover'));
                    this.reviewChangesView.onResetItems();
                } else {
                    this.reviewChangesView = new ReviewPopoverDataView({
                        el: $('#id-review-popover'),
                        itemTemplate: _.template(reviewTemplate)
                    });

                    const addtooltip = (dataview, view, record) => {
                        if (view.tipsArray) {
                            view.tipsArray.forEach((item) => {
                                item.remove();
                            });
                        }

                        const arr = [];
                        let btns = $(view.el).find('.btn-goto');
                        btns.tooltip({title: me.textFollowMove, placement: 'cursor'});
                        btns.each((idx, item) => {
                            arr.push($(item).data('bs.tooltip').tip());
                        });
                        btns = $(view.el).find('.btn-accept');
                        btns.tooltip({title: me.txtAccept, placement: 'cursor'});
                        btns.each((idx, item) => {
                            arr.push($(item).data('bs.tooltip').tip());
                        });
                        btns = $(view.el).find('.btn-reject');
                        btns.tooltip({title: me.txtReject, placement: 'cursor'});
                        btns.each((idx, item) => {
                            arr.push($(item).data('bs.tooltip').tip());
                        });
                        view.tipsArray = arr;
                    };

                    this.reviewChangesView.on('item:add', addtooltip);
                    this.reviewChangesView.on('item:remove', addtooltip);
                    this.reviewChangesView.on('item:change', addtooltip);

                    this.reviewChangesView.on('item:click', (picker, item, record, e) => {
                        const btn = $(e.target);
                        if (btn) {
                            if (btn.hasClass('btn-accept')) {
                                const tip = btn.data('bs.tooltip');
                                if (tip) tip.dontShow = true;

                                me.fireEvent('reviewchange:accept', [record.get('changedata')]);
                            } else if (btn.hasClass('btn-reject')) {
                                const tip = btn.data('bs.tooltip');
                                if (tip) tip.dontShow = true;

                                me.fireEvent('reviewchange:reject', [record.get('changedata')]);
                            } else if (btn.hasClass('btn-delete')) {
                                me.fireEvent('reviewchange:delete', [record.get('changedata')]);
                            } else if (btn.hasClass('btn-goto')) {
                                const tip = btn.data('bs.tooltip');
                                if (tip) tip.dontShow = true;

                                me.fireEvent('reviewchange:goto', [record.get('changedata')]);
                            }
                        }
                    });

                    this.reviewChangesView.setStore(me.reviewStore);
                    this.reviewChangesView.onResetItems();
                }
            }

            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: window.find('#id-popover'),
                    minScrollbarLength  : 40,
                    wheelSpeed: 10,
                    alwaysVisibleY: true
                });
            }
        },

        showComments: function (animate, loadText, focus, showText) {
            this.options.animate = animate;
            const textBox = this.commentsView.getTextBox();

            if (loadText && this.textVal) {
                textBox?.val(this.textVal);
            }

            if (showText?.length) {
                textBox?.val(showText);
            }

            this.show(animate);
            this.hookTextBox();

            this._state.commentsVisible = true;
        },

        showReview: function (animate, lock, lockuser) {
            this.show(animate);
            // this.reviewChangesView.cmpEl.find('.lock-area').toggleClass('hidden', !lock);
            // this.reviewChangesView.cmpEl.find('.lock-author').toggleClass('hidden', !lock || _.isEmpty(lockuser)).text(lockuser);
            this._state.reviewVisible = true;
        },

        show: function (animate, loadText, focus, showText) {
            this.options.animate = animate;

            Common.UI.Window.prototype.show.call(this);
            if (this.scroller) {
                this.scroller.update({minScrollbarLength: 40, alwaysVisibleY: true});
            }
        },

        hideComments: function () {
            if (this.handlerHide) {
                this.handlerHide();
            }
            this.hideTips();
            this.hideMentions();
            this._state.commentsVisible = false;
            if (!this._state.reviewVisible)
                this.hide();
            else
                this.calculateSizeOfContent();
        },

        hideReview: function () {
            if (this.handlerHide) {
                this.handlerHide();
            }
            this.hideTips();

            this._state.reviewVisible = false;
            if (!this._state.commentsVisible)
                this.hide();
            else
                this.calculateSizeOfContent();
        },

        hide: function () {
            if (this.handlerHide) {
                this.handlerHide.apply(this, arguments);
            }

            this.hideTips();
            this.hideMentions();

            Common.UI.Window.prototype.hide.call(this);

            if (!_.isUndefined(this.e) && this.e.keyCode === Common.UI.Keys.ESC) {
                this.e.preventDefault();
                this.e.stopImmediatePropagation();
                this.e = undefined;
            }
        },

        // CommentsPopover

        update: function (needRender) {
            if (this.commentsView && needRender)
                this.commentsView.onResetItems();
            if (this.scroller) {
                this.scroller.update({minScrollbarLength: 40, alwaysVisibleY: true});
            }
        },

        isVisible: function () {
            return (this.$window?.is(':visible'));
        },
        setLeftTop: function (posX, posY, leftX, loadInnerValues, retainContent) {
            if (!this.$window)
                this.render();

            if (loadInnerValues) {
                posX = this.arrowPosX;
                posY = this.arrowPosY;
                leftX = this.leftX;
            }

            if (_.isUndefined(posX) && _.isUndefined(posY))
                return;

            this.arrowPosX = posX;
            this.arrowPosY = posY;
            this.leftX = leftX;

            const commentsView = $('#id-popover');
            const arrowView = $('#id-comments-arrow');
            const editorView = $('#editor_sdk');
            let editorBounds = null;
            let sdkBoundsHeight = 0;
            const sdkBoundsTop = 0;
            const sdkBoundsLeft = 0;
            let sdkPanelRight = '';
            let sdkPanelRightWidth = 0;
            let sdkPanelLeft = '';
            let sdkPanelLeftWidth = 0;
            let sdkPanelThumbs = ''; // for PE
            let sdkPanelThumbsWidth = 0; // for PE
            let sdkPanelTop = '';
            let sdkPanelHeight = 0;
            let leftPos = 0;
            let windowWidth = 0;
            let outerHeight = 0;
            let topPos = 0;
            let sdkBoundsTopPos = 0;

            if (commentsView && arrowView && editorView && editorView.get(0)) {
                editorBounds = Common.Utils.getBoundingClientRect(editorView.get(0));
                if (editorBounds) {
                    sdkBoundsHeight = editorBounds.height - this.sdkBounds.padding * 2;

                    this.$window.css({maxHeight: `${Math.min(editorBounds.height, Math.max(300, editorBounds.height * 0.75)) - this.sdkBounds.padding * 2}px`});

                    this.sdkBounds.width = this.sdkBounds.outerWidth = editorBounds.width;
                    this.sdkBounds.height = this.sdkBounds.outerHeight = editorBounds.height;

                    // LEFT CORNER

                    if (!_.isUndefined(posX)) {
                        const isOnSheet = !_.isUndefined(leftX);
                        const isRtl = isOnSheet ? posX < leftX : Common.UI.isRTL();
                        if (isOnSheet && isRtl) {
                            const tmp = posX;
                            posX = leftX;
                            leftX = tmp;
                        }

                        sdkPanelRight = $('#id_vertical_scroll');
                        if (sdkPanelRight.length) {
                            sdkPanelRightWidth = (sdkPanelRight.css('display') !== 'none') ? sdkPanelRight.width() : 0;
                        } else {
                            sdkPanelRight = $('#ws-v-scrollbar');
                            if (sdkPanelRight.length) {
                                sdkPanelRightWidth = (sdkPanelRight.css('display') !== 'none') ? sdkPanelRight.width() : 0;
                            }
                        }

                        this.sdkBounds.width -= sdkPanelRightWidth;

                        sdkPanelLeft = $('#id_panel_left');
                        if (sdkPanelLeft.length) {
                            sdkPanelLeftWidth = (sdkPanelLeft.css('display') !== 'none') ? sdkPanelLeft.width() : 0;
                        }
                        sdkPanelThumbs = $('#id_panel_thumbnails');
                        if (sdkPanelThumbs.length) {
                            sdkPanelThumbsWidth = (sdkPanelThumbs.css('display') !== 'none') ? sdkPanelThumbs.width() : 0;
                            this.sdkBounds.width -= sdkPanelThumbsWidth;
                        }

                        if (!isRtl) {
                            leftPos = Math.min(sdkBoundsLeft + posX + this.arrow.width, sdkBoundsLeft + this.sdkBounds.width - this.$window.outerWidth() - 25);
                            leftPos = Math.max(sdkBoundsLeft + sdkPanelLeftWidth + this.arrow.width, leftPos);
                        } else if (this.isDocEditor) {
                            leftPos = Math.max(sdkBoundsLeft + sdkPanelLeftWidth + 25, sdkBoundsLeft + this.sdkBounds.width - this.$window.outerWidth() - posX + 7);
                            leftPos = Math.min(sdkBoundsLeft + this.sdkBounds.width - this.$window.outerWidth() - 25, leftPos);
                        } else {
                            leftPos = Math.max(sdkBoundsLeft + sdkPanelLeftWidth, sdkBoundsLeft + posX - this.$window.outerWidth() - this.arrow.width - 25);
                            leftPos = Math.min(sdkBoundsLeft + this.sdkBounds.width - this.$window.outerWidth() - 25, leftPos);
                        }

                        this._state.arrowCls = isOnSheet && Common.UI.isRTL() ? 'right' : 'left';
                        arrowView.removeClass('right top bottom').addClass(this._state.arrowCls);
                        arrowView.css({left: ''});

                        if (isOnSheet) {
                            windowWidth = this.$window.outerWidth();
                            if (windowWidth) {
                                if ((posX + windowWidth > this.sdkBounds.width - this.arrow.width + 5) && (leftX > windowWidth) || (isRtl && sdkBoundsLeft + leftX > windowWidth + this.arrow.width)) {
                                    leftPos = sdkBoundsLeft + leftX - windowWidth - this.arrow.width;
                                    this._state.arrowCls = Common.UI.isRTL() ? 'left' : 'right';
                                    arrowView.removeClass('left right').addClass(this._state.arrowCls);
                                } else {
                                    leftPos = sdkBoundsLeft + posX + this.arrow.width;
                                }
                            }
                        }

                        this.$window.css('left', `${leftPos}px`);
                    }

                    // TOP CORNER

                    if (!_.isUndefined(posY)) {
                        sdkPanelTop = $('#id_panel_top');
                        sdkBoundsTopPos = sdkBoundsTop;
                        if (sdkPanelTop.length) {
                            sdkPanelHeight = (sdkPanelTop.css('display') !== 'none') ? sdkPanelTop.height() : 0;
                            sdkBoundsTopPos += this.sdkBounds.paddingTop;
                        } else {
                            sdkPanelTop = $('#ws-h-scrollbar');
                            if (sdkPanelTop.length) {
                                sdkPanelHeight = (sdkPanelTop.css('display') !== 'none') ? sdkPanelTop.height() : 0;
                            }
                        }

                        this.sdkBounds.height -= sdkPanelHeight;

                        outerHeight = this.$window.outerHeight();

                        topPos = Math.min(sdkBoundsTop + sdkBoundsHeight - outerHeight, this.arrowPosY + sdkBoundsTop - this.arrow.height);
                        topPos = Math.max(topPos, sdkBoundsTopPos);

                        let arrowPosY = 0;
                        if (Math.ceil(sdkBoundsHeight) <= Math.ceil(outerHeight))
                            arrowPosY = Math.min(arrowPosY, sdkBoundsHeight - (sdkPanelHeight + this.arrow.margin + this.arrow.height));
                        else {
                            arrowPosY = Math.max(this.arrow.margin, this.arrowPosY - (sdkBoundsHeight - outerHeight) - this.arrow.height);
                            arrowPosY = Math.min(arrowPosY, outerHeight - this.arrow.margin - this.arrow.height);
                        }
                        arrowView.css({top: `${arrowPosY}px`});
                        this.$window.css('top', `${topPos}px`);
                    }
                }
            }
            if (!retainContent || this.isOverCursor())
                this.calculateSizeOfContent();
        },
        calculateSizeOfContent: function (testVisible) {
            if (testVisible && !this.$window.is(':visible'))
                return;

            this.$window.css({overflow: 'hidden'});

            const arrowView = $('#id-comments-arrow');
            const commentsView = $('#id-popover');
            let contentBounds = null;
            let editorView = null;
            let editorBounds = null;
            let sdkBoundsHeight = 0;
            const sdkBoundsTop = 0;
            const sdkBoundsLeft = 0;
            let sdkPanelTop = '';
            let sdkPanelHeight = 0;
            let arrowPosY = 0;
            let arrowPosX = 0;
            let windowHeight = 0;
            let outerHeight = 0;
            let topPos = 0;
            let sdkBoundsTopPos = 0;

            if (commentsView && arrowView && commentsView.get(0)) {
                const scrollPos = this.scroller.getScrollTop();

                commentsView.css({height: '100%'});

                contentBounds = Common.Utils.getBoundingClientRect(commentsView.get(0));
                if (contentBounds) {
                    editorView = $('#editor_sdk');
                    if (editorView?.get(0)) {
                        editorBounds = Common.Utils.getBoundingClientRect(editorView.get(0));
                        if (editorBounds) {
                            sdkBoundsHeight = editorBounds.height - this.sdkBounds.padding * 2;
                            sdkBoundsTopPos = sdkBoundsTop;
                            windowHeight = this.$window.outerHeight();
                            const maxWindowHeight = Math.min(editorBounds.height, Math.max(300, editorBounds.height * 0.75)) - this.sdkBounds.padding * 2;

                            // TOP CORNER

                            sdkPanelTop = $('#id_panel_top');
                            if (sdkPanelTop.length) {
                                sdkPanelHeight = (sdkPanelTop.css('display') !== 'none') ? sdkPanelTop.height() : 0;
                                sdkBoundsTopPos += this.sdkBounds.paddingTop;
                            } else {
                                sdkPanelTop = $('#ws-h-scrollbar');
                                if (sdkPanelTop.length) {
                                    sdkPanelHeight = (sdkPanelTop.css('display') !== 'none') ? sdkPanelTop.height() : 0;
                                }
                            }

                            outerHeight = Math.max(commentsView.outerHeight(), windowHeight);

                            const movePos = this.isOverCursor();
                            if (movePos) {
                                if (Math.ceil(maxWindowHeight) <= Math.ceil(outerHeight)) {
                                    this.$window.css({
                                        maxHeight: `${maxWindowHeight}px`
                                    });
                                    commentsView.css({height: `${maxWindowHeight - 3}px`});
                                    outerHeight = maxWindowHeight;
                                }
                                let leftPos = Number.parseInt(this.$window.css('left')) - this.arrow.width;
                                const newTopDown = movePos[1][1] + sdkPanelHeight + this.arrow.width;// try move down
                                const newTopUp = movePos[0][1] + sdkPanelHeight - this.arrow.width; // try move up
                                let isMoveDown = false;
                                if (newTopDown + outerHeight>sdkBoundsTop + sdkBoundsHeight) {
                                    const diffDown = sdkBoundsTop + sdkBoundsHeight - newTopDown;
                                    if (newTopUp - outerHeight<sdkBoundsTop) {
                                        const diffUp = newTopUp - sdkBoundsTop;
                                        if (diffDown < diffUp * 0.9) {// magic)
                                            this.$window.css({
                                                maxHeight: `${diffUp}px`,
                                                top: `${sdkBoundsTop}px`
                                            });
                                            commentsView.css({height: `${diffUp - 3}px`});
                                        } else {
                                            this.$window.css({
                                                maxHeight: `${diffDown}px`,
                                                top: `${newTopDown}px`
                                            });
                                            isMoveDown = true;
                                            commentsView.css({height: `${diffDown - 3}px`});
                                        }
                                    } else
                                        this.$window.css('top', `${newTopUp - outerHeight}px`); // move up
                                } else {
                                    isMoveDown = true;
                                    this.$window.css('top', `${newTopDown}px`); // move down
                                }
                                leftPos -= this.arrow.height;
                                this.$window.css('left', `${leftPos}px`);
                                arrowPosX = movePos[isMoveDown ? 1 : 0][0];
                                arrowPosX = Math.max(0, arrowPosX - leftPos - this.arrow.height/2);
                                arrowPosX = Math.min(arrowPosX, this.$window.outerWidth() - this.arrow.height);
                                arrowView.css({top: '', left: `${arrowPosX}px`});
                                arrowView.toggleClass('top', isMoveDown);
                                arrowView.toggleClass('bottom', !isMoveDown);
                                arrowView.removeClass('left right');
                            } else {
                                if (Math.ceil(maxWindowHeight) <= Math.ceil(outerHeight)) {
                                    this.$window.css({
                                        maxHeight: `${maxWindowHeight}px`
                                    });
                                    commentsView.css({height: `${maxWindowHeight - 3}px`});
                                    outerHeight = maxWindowHeight;

                                } else
                                    outerHeight = windowHeight;
                                if (outerHeight > 0) {
                                    if (contentBounds.top + outerHeight > sdkBoundsHeight + sdkBoundsTop || contentBounds.height === 0) {
                                        topPos = Math.min(sdkBoundsTop + sdkBoundsHeight - outerHeight, this.arrowPosY + sdkBoundsTop - this.arrow.height);
                                        topPos = Math.max(topPos, sdkBoundsTopPos);
                                        this.$window.css({top: `${topPos}px`});
                                    }
                                }
                                arrowPosY = Math.max(this.arrow.margin, this.arrowPosY - (sdkBoundsHeight - outerHeight) - this.arrow.height);
                                arrowPosY = Math.min(arrowPosY, outerHeight - this.arrow.margin - this.arrow.height);

                                arrowView.css({top: `${arrowPosY}px`, left: ''});
                                arrowView.removeClass('top bottom right left');
                                arrowView.addClass(this._state.arrowCls);
                                this.scroller.scrollTop(scrollPos);
                            }
                        }
                    }
                }
            }

            this.$window.css({overflow: ''});
            if (this.scroller) {
                this.scroller.update({minScrollbarLength: 40, alwaysVisibleY: true});
            }
        },

        isOverCursor: function() {
            if (!this.api.asc_GetSelectionBounds) return;
            
            const p = this.api.asc_GetSelectionBounds();
            const isCursor = Math.abs(p[0][0] - p[1][0])<0.1 && Math.abs(p[0][1] - p[1][1])<0.1 && Math.abs(p[2][0] - p[3][0])<0.1 && Math.abs(p[2][1] - p[3][1])<0.1;
            const sdkPanelLeft = $('#id_panel_left');
            let sdkPanelLeftWidth = 0;
            if (sdkPanelLeft.length)
                sdkPanelLeftWidth = (sdkPanelLeft.css('display') !== 'none') ? sdkPanelLeft.width() : 0;
            const x0 = p[0][0] + sdkPanelLeftWidth;
            const y0 = p[0][1];
            const x1 = p[isCursor ? 2 : 1][0] + sdkPanelLeftWidth;
            const y1 = p[isCursor ? 2 : 1][1];
            const leftPos = Number.parseInt(this.$window.css('left')) - this.arrow.width;
            const windowWidth = this.$window.outerWidth() + this.arrow.width;
            const topPos = Number.parseInt(this.$window.css('top'));
            const windowHeight = this.$window.outerHeight();
            if (x0>leftPos && x0<leftPos+windowWidth && y0>topPos && y0<topPos+windowHeight ||
                x1>leftPos && x1<leftPos+windowWidth && y1>topPos && y1<topPos+windowHeight) {
                const newDown = (y0>y1) ? [x0, y0] : [x1, y1];// try move down
                const newUp = (y0<y1) ? [x0, y0] : [x1, y1]; // try move up
                return [newUp, newDown];
            }
        },

        saveText: function (clear) {
            if (this.commentsView && this.commentsView.cmpEl.find('.lock-area').length < 1) {
                this.textVal = undefined;
                if (!clear) {
                    this.textVal = this.commentsView.getActiveTextBoxVal();
                } else {
                    this.commentsView.clearTextBoxBind();
                }
            }
        },
        loadText: function () {
            if (this.textVal && this.commentsView) {
                const textBox = this.commentsView.getTextBox();
                textBox?.val(this.textVal);
            }
        },
        getEditText: function () {
            if (this.commentsView) {
                return this.commentsView.getActiveTextBoxVal();
            }

            return undefined;
        },
        saveDummyText: function () {
            if (this.commentsView && this.commentsView.cmpEl.find('.lock-area').length < 1) {
                this.textDummyVal = this.commentsView.getActiveTextBoxVal();
            }
        },
        clearDummyText: function () {
            if (this.commentsView && this.commentsView.cmpEl.find('.lock-area').length < 1) {
                this.textDummyVal = undefined;
                const textBox = this.commentsView.getTextBox();
                textBox?.val('');
                this.commentsView.clearTextBoxBind();
            }
        },
        getDummyText: function() {
            return this.textDummyVal || '';
        },

        hookTextBox: function () {
            const me = this;
            const textBox = this.commentsView.getTextBox();

            textBox?.keydown(function (event) {
                if ((event.ctrlKey || event.metaKey) && !event.altKey && event.keyCode === Common.UI.Keys.RETURN) {
                    const buttonChangeComment = $('#id-comments-change-popover');
                    if (buttonChangeComment?.length) {
                        buttonChangeComment.click();
                    }

                    event.stopImmediatePropagation();
                } else if (event.keyCode === Common.UI.Keys.TAB) {
                    let $this;
                    let end;
                    let start;
                    start = this.selectionStart;
                    end = this.selectionEnd;
                    $this = $(this);
                    $this.val(`${$this.val().substring(0, start)}\t${$this.val().substring(end)}`);
                    this.selectionStart = this.selectionEnd = start + 1;

                    // event.stopImmediatePropagation();
                    event.preventDefault();
                }

                me.e = event;
            });

            if (this.canRequestUsers) {
                textBox?.keydown((event) => {
                    if ( event.keyCode === Common.UI.Keys.SPACE || event.keyCode === Common.UI.Keys.TAB ||
                        event.keyCode === Common.UI.Keys.HOME || event.keyCode === Common.UI.Keys.END || event.keyCode === Common.UI.Keys.RIGHT ||
                        event.keyCode === Common.UI.Keys.LEFT || event.keyCode === Common.UI.Keys.UP) {
                        // hide email menu
                        me.onEmailListMenu();
                    } else if (event.keyCode === Common.UI.Keys.DOWN) {
                        if (me.emailMenu?.rendered && me.emailMenu.isVisible()) {
                            _.delay(() => {
                                let selected = me.emailMenu.cmpEl.find('li:not(.divider):first');
                                selected = selected.find('a');
                                selected.focus();
                            }, 10);
                            event.preventDefault();
                        }
                    }
                    me.e = event;
                });
                textBox?.on('input', function (event) {
                    clearTimeout(me._state.timerEmailList);

                    const $this = $(this);
                    const start = this.selectionStart;
                    const val = $this.val();
                    let left = 0;
                    let right = val.length-1;
                    for (let i=start-1; i>=0; i--) {
                        if (val.charCodeAt(i) === 32 /*space*/ || val.charCodeAt(i) === 13 /*enter*/ || val.charCodeAt(i) === 10 /*new line*/ || val.charCodeAt(i) === 9 /*tab*/) {
                            left = i+1; break;
                        }
                    }
                    for (let i=start; i<=right; i++) {
                        if (val.charCodeAt(i) === 32 || val.charCodeAt(i) === 13 || val.charCodeAt(i) === 10 || val.charCodeAt(i) === 9) {
                            right = i-1; break;
                        }
                    }
                    let str = val.substring(left, right+1);
                    const res = str.match(/^(?:[@]|[+](?!1))(\S*)/);
                    if (res && res.length>1) {
                        str = res[1]; // send to show email menu
                        me._state.timerEmailList = setTimeout(() => {
                            me.onEmailListMenu(str, left, right);
                        }, 300);
                    } else
                        me.onEmailListMenu(); // hide email menu
                });
            }
        },

        hideTips: function () {
            if (this.commentsView)
                _.each(this.commentsView.dataViewItems, (item) => {
                    if (item.tipsArray) {
                        item.tipsArray.forEach((item) => {
                            item.hide();
                        });
                    }
                }, this);
            if (this.reviewChangesView)
                _.each(this.reviewChangesView.dataViewItems, (item) => {
                    if (item.tipsArray) {
                        item.tipsArray.forEach((item) => {
                            item.hide();
                        });
                    }
                }, this);
        },

        hideMentions: function () {
            if (this.emailMenu?.rendered)
                this.emailMenu.cmpEl.css('display', 'none');
        },

        moveMentions: function () {
            const menu = this.emailMenu;
            if (menu?.rendered && menu.isVisible() && this.commentsView) {
                const menuContainer = this.$window.find(Common.Utils.String.format('#menu-container-{0}', menu.id));
                const textbox = this.commentsView.getTextBox();
                const textboxDom = textbox ? textbox[0] : null;
                const showPoint = textboxDom ? [textboxDom.offsetLeft, textboxDom.offsetTop + textboxDom.clientHeight + 3] : [0, 0];

                menuContainer.css({left: showPoint[0], top : showPoint[1]});
                menu.menuAlignEl = textbox;
                menu.show();
                menu.cmpEl.css('display', '');
                menu.alignPosition('bl-tl', -5);
            }
        },

        isCommentsViewMouseOver: function () {
            return this._isMouseOver;
        },

        setReviewStore: function(store) {
            this.reviewStore = store;
            if (this.reviewChangesView)
                this.reviewChangesView.setStore(this.reviewStore);
        },

        setCommentsStore: function(store) {
            this.commentsStore = store;
            if (this.commentsView)
                this.commentsView.setStore(this.commentsStore);
        },

        getPopover: function(options) {
            if (!this.popover)
                this.popover = new Common.Views.ReviewPopover(options);
            return this.popover;
        },

        autoScrollToEditButtons: function () {
            const button = $('#id-comments-change-popover');  // TODO: add to cache
            let btnBounds = null;
            const contentBounds = Common.Utils.getBoundingClientRect(this.$window[0]);
            let moveY = 0;
            const padding = 7;

            if (button.length) {
                btnBounds = Common.Utils.getBoundingClientRect(button.get(0));
                if (btnBounds && contentBounds) {
                    moveY = contentBounds.bottom - (btnBounds.bottom + padding);
                    if (moveY < 0) {
                        this.scroller.scrollTop(this.scroller.getScrollTop() - moveY);
                    }
                }
            }
        },

        onEmailListMenu: function(str, left, right) {
            clearTimeout(this._state.timerEmailList);
            if (typeof str === 'string') {
                this._state.emailSearch = {
                    str: str,
                    left: left,
                    right: right,
                    from: 0,
                    count: 100,
                    isPaginated: undefined,
                    requestNext: undefined
                };
                const data = this._state.emailSearch;
                Common.UI.ExternalUsers.get('mention', undefined, data.from, data.count, data.str);
            } else {
                this._state.emailSearch = null;
                this.emailMenu.rendered && this.emailMenu.cmpEl.css('display', 'none');
            }
        },

        onEmailListMenuNext: function() {
            const data = this._state.emailSearch;
            if (data && data.isPaginated!==undefined) {
                data.from += data.count;
                Common.UI.ExternalUsers.get('mention', undefined, data.from, data.count, data.str);
            }
        },

        onEmailListMenuCallback: function(type, users, isPaginated) {
            if (!this._state.emailSearch || type && type!=='mention') return;
            const menu = this.emailMenu;
            let str = this._state.emailSearch.str;
            const left = this._state.emailSearch.left;
            const right = this._state.emailSearch.right;
            const from = this._state.emailSearch.from;
            const isClientSearch = isPaginated===undefined;

            this._state.emailSearch.isPaginated = isPaginated;
            isClientSearch && (this._state.emailSearch = null);

            let menuContainer = this.$window.find(Common.Utils.String.format('#menu-container-{0}', menu.id));
            const textbox = this.commentsView.getTextBox();
            const textboxDom = textbox ? textbox[0] : null;
            const showPoint = textboxDom ? [textboxDom.offsetLeft, textboxDom.offsetTop + textboxDom.clientHeight + 3] : [0, 0];

            if (!menu.rendered) {
                // Prepare menu container
                if (menuContainer.length < 1) {
                    menuContainer = $(Common.Utils.String.format('<div id="menu-container-{0}" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>', menu.id));
                    this.$window.append(menuContainer);
                }

                menu.render(menuContainer);
                menu.cmpEl.css('min-width', textboxDom ? textboxDom.clientWidth : 220);
                menu.cmpEl.attr({tabindex: "-1"});
                menu.on('hide:after', ()=> {
                    setTimeout(()=> {
                        const tb = this.commentsView.getTextBox();
                        tb?.focus();
                    }, 10);
                });
                !isClientSearch && menu.scroller.cmpEl.on('scroll', (event) => {
                    if (this._state.emailSearch && this._state.emailSearch.requestNext>0 && this._state.emailSearch.requestNext < $(event.target).scrollTop()) {
                        this._state.emailSearch.requestNext = -1; // wait for response
                        this.onEmailListMenuNext();
                    }
                });
            }

            if (isClientSearch || from===0) {
                for (let i = 0; i < menu.items.length; i++) {
                    menu.removeItem(menu.items[i]);
                    i--;
                }
            }

            if (users && users.length>0) {
                if (isClientSearch) {
                    str = str.toLowerCase();
                    if (str.length>0) {
                        users = _.filter(users, (item) => {
                            if (item.email && 0 === item.email.toLowerCase().indexOf(str)) return true;

                            const arr = item.name ? item.name.toLowerCase().split(' ') : [];
                            let inName = false;
                            for (let i=0; i<arr.length; i++) {
                                if (0 === arr[i].indexOf(str)) {
                                    inName = true;
                                    break;
                                }
                            }
                            return inName;
                        });
                    }
                }
                const tpl = _.template('<a id="<%= id %>" tabindex="-1" type="menuitem">' +
                                        '<div style="overflow: hidden; text-overflow: ellipsis; max-width: 195px;"><%= Common.Utils.String.htmlEncode(caption) %></div>' +
                                        '<div style="overflow: hidden; text-overflow: ellipsis; max-width: 195px; color: #909090;"><%= Common.Utils.String.htmlEncode(options.value) %></div>' +
                                    '</a>');
                let divider = false;
                _.each(users, (menuItem, index) => {
                    if (divider && !menuItem.hasAccess) {
                        divider = false;
                        menu.addItem(new Common.UI.MenuItem({caption: '--'}));
                    }

                    if (menuItem.email && menuItem.name) {
                        const mnu = new Common.UI.MenuItem({
                            caption     : menuItem.name,
                            value       : menuItem.email,
                            template    : tpl
                        }).on('click', (item, e) => {
                            this.insertEmailToTextbox(item.options.value, left, right);
                        });
                        menu.addItem(mnu);
                        if (menuItem.hasAccess)
                            divider = true;
                    }
                });
            }

            if (menu.items.length>0) {
                menuContainer.css({left: showPoint[0], top : showPoint[1]});
                menu.menuAlignEl = textbox;
                menu.show();
                menu.cmpEl.css('display', '');
                menu.alignPosition('bl-tl', -5);
                menu.scroller.update({alwaysVisibleY: true});
                if (!isClientSearch) {
                    (from===0) && menu.scroller.scrollTop(0);
                    this._state.emailSearch.requestNext = users && users.length>0 ? (1 - 10/menu.items.length) * menu.cmpEl.get(0).scrollHeight : -1;
                }
            } else {
                menu.rendered && menu.cmpEl.css('display', 'none');
            }
        },

        insertEmailToTextbox: function(str, left, right) {
            const textBox = this.commentsView.getTextBox();
            if (!textBox) return;

            const val = textBox.val();
            textBox.val(`${val.substring(0, left)}+${str} ${val.substring(right+1, val.length)}`);
            setTimeout(()=> {
                textBox[0].selectionStart = textBox[0].selectionEnd = left + str.length + 2;
            }, 10);
        },

        textAddReply            : 'Add Reply',
        textAdd                 : "Add",
        textCancel              : 'Cancel',
        textEdit                : 'Edit',
        textReply               : 'Reply',
        textClose               : 'Close',
        textResolve             : 'Resolve',
        textOpenAgain           : "Open Again",
        textFollowMove          : 'Follow Move',
        textMention             : '+mention will provide access to the document and send an email',
        textMentionNotify       : '+mention will notify the user via email',
        textEnterComment        : 'Enter your comment here',
        textViewResolved        : 'You have not permission for reopen comment',
        txtAccept: 'Accept',
        txtReject: 'Reject',
        txtEditTip: 'Edit',
        txtDeleteTip: 'Delete',
        textComment: 'Comment'
    }, Common.Views.ReviewPopover || {}))
});