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
 *  TableOptionsDialog.js
 *
 *  Created on 4/9/14
 *
 */


if (Common === undefined)
    const Common = {};

define([], () => { 

    SSE.Views.TableOptionsDialog = Common.UI.Window.extend(_.extend({
        options: {
            width   : 355,
            cls     : 'modal-dlg',
            modal   : false,
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.txtFormat
            }, options);

            this.template = [
                '<div class="box">',
                    '<div id="id-dlg-tableoptions-range" class="input-row"  style="margin-bottom: 5px;"></div>',
                    '<div class="input-row hidden" id="id-dlg-tableoptions-title" style="margin-top: 5px;"></div>',
                    `<label class="" id="id-dlg-tableoptions-lbl" style="margin-top: 5px;">${this.txtNote}</label>`,
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            this.checkRangeType = Asc.c_oAscSelectionDialogType.FormatTable;
            this.selectionType = Asc.c_oAscSelectionType.RangeCells;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            const $window = this.getChild();

            this.inputRange = new Common.UI.InputField({
                el          : $('#id-dlg-tableoptions-range'),
                name        : 'range',
                style       : 'width: 100%;',
                allowBlank  : false,
                blankError  : this.txtEmpty,
                validateOnChange: true
            });

            this.cbTitle = new Common.UI.CheckBox({
                el          : $('#id-dlg-tableoptions-title'),
                labelText   : this.txtTitle
            });

            this.lblNote =$window.find('#id-dlg-tableoptions-lbl');

            $window.find('.dlg-btn').on('click',     _.bind(this.onBtnClick, this));

            this.on('close', _.bind(this.onClose, this));
        },

        onPrimary: function() {
            this._handleInput('ok');
            return false;
        },

        setSettings: function(settings) {

            if (settings.api) {
                this.api = settings.api;

                if (settings.range) {
                    this.checkRangeType = Asc.c_oAscSelectionDialogType.FormatTableChangeRange;
                    this.inputRange.setValue(settings.range);
                    this.api.asc_setSelectionDialogMode(Asc.c_oAscSelectionDialogType.FormatTable, settings.range);
                } else {
                    this.cbTitle.$el?.removeClass('hidden');
                    this.lblNote.addClass('hidden');
                    this.setHeight(152);
                    const options = this.api.asc_getAddFormatTableOptions();
                    this.inputRange.setValue(options.asc_getRange());
                    this.cbTitle.setValue(options.asc_getIsTitle());
                    this.api.asc_setSelectionDialogMode(Asc.c_oAscSelectionDialogType.FormatTable, options.asc_getRange());
                }
                if (settings.title)
                    this.setTitle(settings.title);
                if (settings.selectionType)
                    this.selectionType = settings.selectionType;

                this.wrapEvents = {
                    onApiRangeChanged: _.bind(this.onApiRangeChanged, this)
                };
                this.api.asc_registerCallback('asc_onSelectionRangeChanged', this.wrapEvents.onApiRangeChanged);
                Common.NotificationCenter.trigger('cells:range', Asc.c_oAscSelectionDialogType.FormatTable);
            }

            this.inputRange.validation = (value) => {
                const isvalid = this.api.asc_checkDataRange(this.checkRangeType, value, false);
                return (isvalid===Asc.c_oAscError.ID.DataRangeError) ? this.txtInvalidRange : true;
            };
        },

        getSettings: function () {
            if (this.checkRangeType === Asc.c_oAscSelectionDialogType.FormatTable) {
                const options = this.api.asc_getAddFormatTableOptions(this.inputRange.getValue());
                options.asc_setIsTitle(this.cbTitle.checked);
                return { selectionType: this.selectionType,  range: options};
            }
                return { selectionType: this.selectionType,  range: this.inputRange.getValue()};
        },

        onApiRangeChanged: function(name) {
            this.inputRange.setValue(name);
            if (this.inputRange.cmpEl.hasClass('error'))
                this.inputRange.cmpEl.removeClass('error');
        },

        isRangeValid: function() {
            const isvalid = this.api.asc_checkDataRange(this.checkRangeType, this.inputRange.getValue(), true);
            if (isvalid === Asc.c_oAscError.ID.No)
                return true;
            
                switch (isvalid) {
                    case Asc.c_oAscError.ID.AutoFilterDataRangeError:
                        Common.UI.warning({msg: this.errorAutoFilterDataRange});
                        break;
                    case Asc.c_oAscError.ID.FTChangeTableRangeError:
                        Common.UI.warning({msg: this.errorFTChangeTableRangeError});
                        break;
                    case Asc.c_oAscError.ID.FTRangeIncludedOtherTables:
                        Common.UI.warning({msg: this.errorFTRangeIncludedOtherTables});
                        break;
                    case Asc.c_oAscError.ID.MultiCellsInTablesFormulaArray:
                        Common.UI.warning({msg: this.errorMultiCellFormula});
                        break;
                    case Asc.c_oAscError.ID.LargeRangeWarning:
                        this.selectionType = Asc.c_oAscSelectionType.RangeMax;
                        return true;
                }
            return false;
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes.result.value);
        },

        onClose: function(event) {
            if (this.api) {
                this.api.asc_setSelectionDialogMode(Asc.c_oAscSelectionDialogType.None);
                this.api.asc_unregisterCallback('asc_onSelectionRangeChanged', this.wrapEvents.onApiRangeChanged);
            }
            Common.NotificationCenter.trigger('cells:range', Asc.c_oAscSelectionDialogType.None);
            Common.NotificationCenter.trigger('edit:complete', this);

            SSE.getController('RightMenu').SetDisabled(false);
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                if (state === 'ok') {
                    if (this.isRangeValid() !== true)
                        return;
                }
                this.options.handler.call(this, this, state);
            }

            this.close();
        },

        show: function () {
            Common.UI.Window.prototype.show.call(this);
            SSE.getController('RightMenu').SetDisabled(true);
        },

        txtTitle    : 'Title',
        txtFormat   : 'Create Table',
        txtEmpty    : 'This field is required',
        txtInvalidRange: 'ERROR! Invalid cells range',
        errorAutoFilterDataRange: 'The operation could not be done for the selected range of cells.<br>Select a uniform data range inside or outside the table and try again.',
        errorFTChangeTableRangeError: 'Operation could not be completed for the selected cell range.<br>Select a range so that the first table row was on the same row<br>and the resulting table overlapped the current one.',
        errorFTRangeIncludedOtherTables: 'Operation could not be completed for the selected cell range.<br>Select a range which does not include other tables.',
        errorMultiCellFormula: 'Multi-cell array formulas are not allowed in tables.',
        txtNote: 'The headers must remain in the same row, and the resulting table range must overlap the original table range.'
    }, SSE.Views.TableOptionsDialog || {}))
});