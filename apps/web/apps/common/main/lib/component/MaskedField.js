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
if (Common === undefined)
    const Common = {};

define([], () => {

    Common.UI.MaskedField = Common.UI.BaseView.extend({
        options : {
            maskExp: '',
            maxLength: 999
        },

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);
            const el = this.$el || $(this.el);

            el.addClass('user-select form-control');
            el.attr('maxlength', this.options.maxLength);
            el.on('keypress', (e) => {
                const charCode = String.fromCharCode(e.which);
                if(!this.options.maskExp.test(charCode) && !e.ctrlKey){
                    if (e.keyCode===Common.UI.Keys.RETURN) this.trigger('changed', this, el.val());
                    e.preventDefault();
                    e.stopPropagation();
                }

            });
            el.on('input', (e) => {
                this.trigger('change', this, el.val());
            });
            el.on('blur',  (e) => {
                this.trigger('changed', this, el.val());
            });
        },

        render : function() {
            return this;
        },

        setValue: function(value) {
            if (this.options.maskExp.test(value) && value.length<=this.options.maxLength)
                this.$el.val(value);
        },

        getValue: function() {
            this.$el.val();
        }
    });
});