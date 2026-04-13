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

define([], () => {
  if (window.SSE?.Views?.DocumentHolder) {
    const dh = window.SSE.Views.DocumentHolder.prototype

    dh.createDelayedElementsViewer = function () {
      if (this.menuViewCopy) return // menu is already inited

      this.menuViewCopy = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-copy",
        caption: this.txtCopy,
        value: "copy",
      })

      this.menuViewUndo = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-undo icon-rtl",
        caption: this.textUndo,
      })

      this.menuViewCopySeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.menuViewAddComment = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-add-comment",
        id: "id-context-menu-item-view-add-comment",
        caption: this.txtAddComment,
      })

      this.pmiViewGetRangeList = new Common.UI.MenuItem({
        caption: this.txtGetLink,
      })

      this.menuSignatureViewSign = new Common.UI.MenuItem({ caption: this.strSign, value: 0 })
      this.menuSignatureDetails = new Common.UI.MenuItem({ caption: this.strDetails, value: 1 })
      this.menuSignatureViewSetup = new Common.UI.MenuItem({ caption: this.strSetup, value: 2 })
      this.menuSignatureRemove = new Common.UI.MenuItem({ caption: this.strDelete, value: 3 })
      this.menuViewSignSeparator = new Common.UI.MenuItem({ caption: "--" })
      this.menuViewCommentSeparator = new Common.UI.MenuItem({ caption: "--" })

      this.viewModeMenu = new Common.UI.Menu({
        cls: "shifted-right",
        items: [
          this.menuViewCopy,
          this.menuViewUndo,
          this.menuViewCopySeparator,
          this.menuSignatureViewSign,
          this.menuSignatureDetails,
          this.menuSignatureViewSetup,
          this.menuSignatureRemove,
          this.menuViewSignSeparator,
          this.menuViewAddComment,
          this.menuViewCommentSeparator,
          this.pmiViewGetRangeList,
        ],
      }).on("hide:after", (menu, e, isFromInputControl) => {
        this.clearCustomItems(menu)
      })

      this.fireEvent("createdelayedelements", [this, "view"])
    }

    dh.createDelayedElements = function () {
      if (
        this.pmiCut ||
        !(
          window.styles_loaded ||
          this.mode.isEditDiagram ||
          this.mode.isEditMailMerge ||
          this.mode.isEditOle
        )
      )
        return // menu is already inited or editor styles are not loaded
      this.pmiCut = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-cut",
        caption: this.txtCut,
        value: "cut",
      })

      this.pmiCopy = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-copy",
        caption: this.txtCopy,
        value: "copy",
      })

      this.pmiPaste = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-paste",
        caption: this.txtPaste,
        value: "paste",
      })

      this.pmiSelectTable = new Common.UI.MenuItem({
        caption: this.txtSelect,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            { caption: this.selectRowText, value: Asc.c_oAscChangeSelectionFormatTable.row },
            { caption: this.selectColumnText, value: Asc.c_oAscChangeSelectionFormatTable.column },
            { caption: this.selectDataText, value: Asc.c_oAscChangeSelectionFormatTable.data },
            { caption: this.selectTableText, value: Asc.c_oAscChangeSelectionFormatTable.all },
          ],
        }),
      })

      this.pmiInsertEntire = new Common.UI.MenuItem({
        caption: this.txtInsert,
      })

      this.pmiInsertCells = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-addcell",
        caption: this.txtInsert,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            {
              caption: this.txtShiftRight,
              value: Asc.c_oAscInsertOptions.InsertCellsAndShiftRight,
            },
            {
              caption: this.txtShiftDown,
              value: Asc.c_oAscInsertOptions.InsertCellsAndShiftDown,
            },
            {
              caption: this.txtRow,
              value: Asc.c_oAscInsertOptions.InsertRows,
            },
            {
              caption: this.txtColumn,
              value: Asc.c_oAscInsertOptions.InsertColumns,
            },
          ],
        }),
      })

      this.pmiInsertTable = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-addcell",
        caption: this.txtInsert,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            {
              caption: this.insertRowAboveText,
              value: Asc.c_oAscInsertOptions.InsertTableRowAbove,
            },
            {
              caption: this.insertRowBelowText,
              value: Asc.c_oAscInsertOptions.InsertTableRowBelow,
            },
            {
              caption: this.insertColumnLeftText,
              value: Asc.c_oAscInsertOptions.InsertTableColLeft,
            },
            {
              caption: this.insertColumnRightText,
              value: Asc.c_oAscInsertOptions.InsertTableColRight,
            },
          ],
        }),
      })

      this.pmiDeleteEntire = new Common.UI.MenuItem({
        caption: this.txtDelete,
      })

      this.pmiDeleteCells = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-delcell",
        caption: this.txtDelete,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            {
              caption: this.txtShiftLeft,
              value: Asc.c_oAscDeleteOptions.DeleteCellsAndShiftLeft,
            },
            {
              caption: this.txtShiftUp,
              value: Asc.c_oAscDeleteOptions.DeleteCellsAndShiftTop,
            },
            {
              caption: this.txtRow,
              value: Asc.c_oAscDeleteOptions.DeleteRows,
            },
            {
              caption: this.txtColumn,
              value: Asc.c_oAscDeleteOptions.DeleteColumns,
            },
          ],
        }),
      })

      this.pmiDeleteTable = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-delcell",
        caption: this.txtDelete,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            { caption: this.deleteRowText, value: Asc.c_oAscDeleteOptions.DeleteRows },
            { caption: this.deleteColumnText, value: Asc.c_oAscDeleteOptions.DeleteColumns },
            { caption: this.deleteTableText, value: Asc.c_oAscDeleteOptions.DeleteTable },
          ],
        }),
      })

      this.pmiClear = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-clearstyle",
        caption: this.txtClear,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            {
              caption: this.txtClearAll,
              value: Asc.c_oAscCleanOptions.All,
            },
            {
              caption: this.txtClearText,
              value: Asc.c_oAscCleanOptions.Text,
            },
            {
              caption: this.txtClearFormat,
              value: Asc.c_oAscCleanOptions.Format,
            },
            {
              caption: this.txtClearComments,
              value: Asc.c_oAscCleanOptions.Comments,
            },
            {
              caption: this.txtClearHyper,
              value: Asc.c_oAscCleanOptions.Hyperlinks,
            },
          ],
        }),
      })

      this.pmiSortCells = new Common.UI.MenuItem({
        caption: this.txtSort,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            {
              iconCls: "menu__icon btn-sort-down",
              caption: this.txtAscending,
              value: Asc.c_oAscSortOptions.Ascending,
            },
            {
              iconCls: "menu__icon btn-sort-up",
              caption: this.txtDescending,
              value: Asc.c_oAscSortOptions.Descending,
            },
            {
              caption: this.txtSortCellColor,
              value: Asc.c_oAscSortOptions.ByColorFill,
            },
            {
              caption: this.txtSortFontColor,
              value: Asc.c_oAscSortOptions.ByColorFont,
            },
            {
              caption: this.txtCustomSort,
              value: "advanced",
            },
          ],
        }),
      })

      this.pmiFilterCells = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-autofilter",
        caption: this.txtFilter,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            {
              caption: this.txtFilterValue,
              value: 0,
            },
            {
              caption: this.txtFilterCellColor,
              value: 1,
            },
            {
              caption: this.txtFilterFontColor,
              value: 2,
            },
          ],
        }),
      })

      this.pmiReapply = new Common.UI.MenuItem({
        caption: this.txtReapply,
      })

      this.mnuRefreshPivot = new Common.UI.MenuItem({
        caption: this.txtRefresh,
      })

      this.mnuExpandCollapsePivot = new Common.UI.MenuItem({
        caption: this.txtExpandCollapse,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            {
              caption: this.txtExpand,
              value: {
                visible: true,
                isAll: false,
              },
            },
            {
              caption: this.txtCollapse,
              value: {
                visible: false,
                isAll: false,
              },
            },
            {
              caption: this.txtExpandEntire,
              value: {
                visible: true,
                isAll: true,
              },
            },
            {
              caption: this.txtCollapseEntire,
              value: {
                visible: false,
                isAll: true,
              },
            },
          ],
        }),
      })

      this.mnuGroupPivot = new Common.UI.MenuItem({
        caption: this.txtGroup,
        value: "grouping",
      })

      this.mnuUnGroupPivot = new Common.UI.MenuItem({
        caption: this.txtUngroup,
        value: "ungrouping",
      })

      this.mnuPivotSettings = new Common.UI.MenuItem({
        caption: this.txtPivotSettings,
      })

      this.mnuFieldSettings = new Common.UI.MenuItem({
        caption: this.txtFieldSettings,
      })

      this.mnuPivotFilter = new Common.UI.MenuItem({
        caption: this.txtFilter,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            {
              caption: this.txtClear,
              value: "clear",
            },
            {
              caption: "--",
            },
            {
              caption: this.txtTop10,
              value: "top10",
            },
            {
              caption: this.txtValueFilter,
              value: "value",
            },
            {
              caption: this.txtLabelFilter,
              value: "label",
            },
          ],
        }),
      })

      this.mnuPivotSort = new Common.UI.MenuItem({
        caption: this.txtSort,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            {
              iconCls: "menu__icon btn-sort-down",
              caption: this.txtAscending,
              value: Asc.c_oAscSortOptions.Ascending,
            },
            {
              iconCls: "menu__icon btn-sort-up",
              caption: this.txtDescending,
              value: Asc.c_oAscSortOptions.Descending,
            },
            {
              caption: this.txtSortOption,
              value: "advanced",
            },
          ],
        }),
      })

      this.mnuDeleteField = new Common.UI.MenuItem({
        caption: this.txtDelField,
      })

      this.mnuSubtotalField = new Common.UI.MenuItem({
        caption: this.txtSubtotalField,
        checkable: true,
        allowDepress: true,
      })

      this.mnuSummarize = new Common.UI.MenuItem({
        caption: this.txtSummarize,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            {
              caption: this.txtSum,
              value: Asc.c_oAscDataConsolidateFunction.Sum,
              checkable: true,
            },
            {
              caption: this.txtCount,
              value: Asc.c_oAscDataConsolidateFunction.Count,
              checkable: true,
            },
            {
              caption: this.txtAverage,
              value: Asc.c_oAscDataConsolidateFunction.Average,
              checkable: true,
            },
            {
              caption: this.txtMax,
              value: Asc.c_oAscDataConsolidateFunction.Max,
              checkable: true,
            },
            {
              caption: this.txtMin,
              value: Asc.c_oAscDataConsolidateFunction.Min,
              checkable: true,
            },
            {
              caption: this.txtProduct,
              value: Asc.c_oAscDataConsolidateFunction.Product,
              checkable: true,
            },
            {
              caption: "--",
            },
            {
              caption: this.txtMoreOptions,
              value: -1,
            },
          ],
        }),
      })

      this.mnuShowAs = new Common.UI.MenuItem({
        caption: this.txtShowAs,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            {
              caption: this.txtNormal,
              value: Asc.c_oAscShowDataAs.Normal,
              numFormat: Asc.c_oAscNumFormatType.General,
              checkable: true,
            },
            {
              caption: this.txtPercentOfGrand,
              value: Asc.c_oAscShowDataAs.PercentOfTotal,
              numFormat: Asc.c_oAscNumFormatType.Percent,
              checkable: true,
            },
            {
              caption: this.txtPercentOfCol,
              value: Asc.c_oAscShowDataAs.PercentOfCol,
              numFormat: Asc.c_oAscNumFormatType.Percent,
              checkable: true,
            },
            {
              caption: this.txtPercentOfTotal,
              value: Asc.c_oAscShowDataAs.PercentOfRow,
              numFormat: Asc.c_oAscNumFormatType.Percent,
              checkable: true,
            },
            {
              caption: this.txtPercent,
              value: Asc.c_oAscShowDataAs.Percent,
              numFormat: Asc.c_oAscNumFormatType.Percent,
              showMore: true,
              checkable: true,
            },
            {
              caption: this.txtPercentOfParentRow,
              value: Asc.c_oAscShowDataAs.PercentOfParentRow,
              numFormat: Asc.c_oAscNumFormatType.Percent,
              checkable: true,
            },
            {
              caption: this.txtPercentOfParentCol,
              value: Asc.c_oAscShowDataAs.PercentOfParentCol,
              numFormat: Asc.c_oAscNumFormatType.Percent,
              checkable: true,
            },
            {
              caption: this.txtPercentOfParent,
              value: Asc.c_oAscShowDataAs.PercentOfParent,
              numFormat: Asc.c_oAscNumFormatType.Percent,
              showMore: true,
              checkable: true,
            },
            {
              caption: this.txtDifference,
              value: Asc.c_oAscShowDataAs.Difference,
              numFormat: Asc.c_oAscNumFormatType.General,
              showMore: true,
              checkable: true,
            },
            {
              caption: this.txtPercentDiff,
              value: Asc.c_oAscShowDataAs.PercentDiff,
              numFormat: Asc.c_oAscNumFormatType.Percent,
              showMore: true,
              checkable: true,
            },
            {
              caption: this.txtRunTotal,
              value: Asc.c_oAscShowDataAs.RunTotal,
              numFormat: Asc.c_oAscNumFormatType.General,
              showMore: true,
              checkable: true,
            },
            {
              caption: this.txtPercentOfRunTotal,
              value: Asc.c_oAscShowDataAs.PercentOfRunningTotal,
              numFormat: Asc.c_oAscNumFormatType.Percent,
              showMore: true,
              checkable: true,
            },
            {
              caption: this.txtRankAscending,
              value: Asc.c_oAscShowDataAs.RankAscending,
              numFormat: Asc.c_oAscNumFormatType.General,
              showMore: true,
              checkable: true,
            },
            {
              caption: this.txtRankDescending,
              value: Asc.c_oAscShowDataAs.RankDescending,
              numFormat: Asc.c_oAscNumFormatType.General,
              showMore: true,
              checkable: true,
            },
            {
              caption: this.txtIndex,
              value: Asc.c_oAscShowDataAs.Index,
              numFormat: Asc.c_oAscNumFormatType.General,
              checkable: true,
            },
            {
              caption: "--",
            },
            {
              caption: this.txtMoreOptions,
              value: -1,
            },
          ],
        }),
      })

      this.mnuShowDetails = new Common.UI.MenuItem({
        caption: this.txtShowDetails,
      })

      this.mnuPivotRefreshSeparator = new Common.UI.MenuItem({ caption: "--" })
      this.mnuPivotSubtotalSeparator = new Common.UI.MenuItem({ caption: "--" })
      this.mnuPivotExpandCollapseSeparator = new Common.UI.MenuItem({ caption: "--" })
      this.mnuPivotGroupSeparator = new Common.UI.MenuItem({ caption: "--" })
      this.mnuPivotDeleteSeparator = new Common.UI.MenuItem({ caption: "--" })
      this.mnuPivotValueSeparator = new Common.UI.MenuItem({ caption: "--" })
      this.mnuPivotFilterSeparator = new Common.UI.MenuItem({ caption: "--" })
      this.mnuShowDetailsSeparator = new Common.UI.MenuItem({ caption: "--" })

      this.pmiInsFunction = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-function",
        caption: this.txtFormula,
      })

      this.menuAddHyperlink = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-inserthyperlink",
        caption: this.txtInsHyperlink,
        inCell: true,
      })

      this.menuEditHyperlink = new Common.UI.MenuItem({
        caption: this.editHyperlinkText,
        inCell: true,
      })

      this.menuRemoveHyperlink = new Common.UI.MenuItem({
        caption: this.removeHyperlinkText,
      })

      this.menuHyperlink = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-inserthyperlink",
        caption: this.txtInsHyperlink,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [this.menuEditHyperlink, this.menuRemoveHyperlink],
        }),
      })

      this.pmiRowHeight = new Common.UI.MenuItem({
        caption: this.txtRowHeight,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            { caption: this.txtAutoRowHeight, value: "auto-row-height" },
            { caption: this.txtCustomRowHeight, value: "row-height" },
          ],
        }),
      })

      this.pmiColumnWidth = new Common.UI.MenuItem({
        caption: this.txtColumnWidth,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            { caption: this.txtAutoColumnWidth, value: "auto-column-width" },
            { caption: this.txtCustomColumnWidth, value: "column-width" },
          ],
        }),
      })

      this.pmiEntireHide = new Common.UI.MenuItem({
        caption: this.txtHide,
      })

      this.pmiEntireShow = new Common.UI.MenuItem({
        caption: this.txtShow,
      })

      this.pmiAddComment = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-add-comment",
        id: "id-context-menu-item-add-comment",
        caption: this.txtAddComment,
      })

      this.pmiAddCommentSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.pmiCellMenuSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.pmiFunctionSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.pmiFreezeSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.pmiCellSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.pmiAddNamedRange = new Common.UI.MenuItem({
        id: "id-context-menu-item-add-named-range",
        caption: this.txtAddNamedRange,
      })

      this.pmiFreezePanes = new Common.UI.MenuItem({
        caption: this.textFreezePanes,
      })

      this.pmiEntriesList = new Common.UI.MenuItem({
        caption: this.textEntriesList,
      })

      this.pmiSparklines = new Common.UI.MenuItem({
        caption: this.txtSparklines,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            { caption: this.txtClearSparklines, value: Asc.c_oAscCleanOptions.Sparklines },
            {
              caption: this.txtClearSparklineGroups,
              value: Asc.c_oAscCleanOptions.SparklineGroups,
            },
          ],
        }),
      })

      const numFormatTemplate = _.template(
        '<a id="<%= id %>" tabindex="-1" type="menuitem">' +
          '<div style="position: relative;">' +
          '<div class="display-value"><%= caption %></div>' +
          '<label class="example-val" style="cursor: pointer;"><%= options.exampleval ? options.exampleval : "" %></label>' +
          "</div></a>",
      )

      this.pmiNumFormat = new Common.UI.MenuItem({
        caption: this.txtNumFormat,
        menu: new Common.UI.Menu({
          cls: "shifted-right format-num-cls",
          menuAlign: "tl-tr",
          items: [
            {
              caption: this.txtGeneral,
              template: numFormatTemplate,
              format: "General",
              exampleval: "100",
              value: Asc.c_oAscNumFormatType.General,
            },
            {
              caption: this.txtNumber,
              template: numFormatTemplate,
              format: "0.00",
              exampleval: "100,00",
              value: Asc.c_oAscNumFormatType.Number,
            },
            {
              caption: this.txtScientific,
              template: numFormatTemplate,
              format: "0.00E+00",
              exampleval: "1,00E+02",
              value: Asc.c_oAscNumFormatType.Scientific,
            },
            {
              caption: this.txtAccounting,
              template: numFormatTemplate,
              format: '_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)',
              exampleval: "100,00 $",
              value: Asc.c_oAscNumFormatType.Accounting,
            },
            {
              caption: this.txtCurrency,
              template: numFormatTemplate,
              format: "$#,##0.00",
              exampleval: "100,00 $",
              value: Asc.c_oAscNumFormatType.Currency,
            },
            {
              caption: this.txtDateShort,
              template: numFormatTemplate,
              format: "MM-dd-yyyy",
              exampleval: "04-09-1900",
              value: Asc.c_oAscNumFormatType.Date,
            },
            {
              caption: this.txtDateLong,
              template: numFormatTemplate,
              format: "MMMM d yyyy",
              exampleval: "April 9 1900",
              value: Asc.c_oAscNumFormatType.Date,
            },
            {
              caption: this.txtTime,
              template: numFormatTemplate,
              format: "HH:MM:ss",
              exampleval: "00:00:00",
              value: Asc.c_oAscNumFormatType.Time,
            },
            {
              caption: this.txtPercentage,
              template: numFormatTemplate,
              format: "0.00%",
              exampleval: "100,00%",
              value: Asc.c_oAscNumFormatType.Percent,
            },
            {
              caption: this.txtFraction,
              template: numFormatTemplate,
              format: "# ?/?",
              exampleval: "100",
              value: Asc.c_oAscNumFormatType.Fraction,
            },
            {
              caption: this.txtText,
              template: numFormatTemplate,
              format: "@",
              exampleval: "100",
              value: Asc.c_oAscNumFormatType.Text,
            },
            { caption: "--" },
            (this.pmiAdvancedNumFormat = new Common.UI.MenuItem({
              caption: this.textMoreFormats,
              value: "advanced",
            })),
          ],
        }),
      })

      this.pmiCellFormat = new Common.UI.MenuItem({
        caption: this.txtCellFormat,
      })

      this.pmiCondFormat = new Common.UI.MenuItem({
        caption: this.txtCondFormat,
      })

      this.pmiGetRangeList = new Common.UI.MenuItem({
        caption: this.txtGetLink,
      })

      this.ssMenu = new Common.UI.Menu({
        cls: "shifted-right",
        restoreHeightAndTop: true,
        scrollToCheckedItem: false,
        id: "id-context-menu-cell",
        items: [
          this.pmiCut,
          this.pmiCopy,
          this.pmiPaste,
          { caption: "--" },
          this.pmiSelectTable,
          this.pmiInsertEntire,
          this.pmiInsertCells,
          this.pmiInsertTable,
          this.pmiDeleteEntire,
          this.pmiDeleteCells,
          this.pmiDeleteTable,
          this.pmiClear,
          this.pmiCellSeparator,
          this.pmiSparklines,
          this.pmiSortCells,
          this.pmiFilterCells,
          this.pmiReapply,
          this.mnuRefreshPivot,
          this.mnuPivotRefreshSeparator,
          this.mnuPivotSort,
          this.mnuPivotFilter,
          this.mnuPivotFilterSeparator,
          this.mnuSubtotalField,
          this.mnuPivotSubtotalSeparator,
          this.mnuExpandCollapsePivot,
          this.mnuPivotExpandCollapseSeparator,
          this.mnuGroupPivot,
          this.mnuUnGroupPivot,
          this.mnuPivotGroupSeparator,
          this.mnuDeleteField,
          this.mnuPivotDeleteSeparator,
          this.mnuSummarize,
          this.mnuShowAs,
          this.mnuPivotValueSeparator,
          this.mnuShowDetails,
          this.mnuShowDetailsSeparator,
          this.mnuFieldSettings,
          this.mnuPivotSettings,
          this.pmiAddCommentSeparator,
          this.pmiAddComment,
          this.pmiCellMenuSeparator,
          this.pmiCellFormat,
          this.pmiNumFormat,
          this.pmiCondFormat,
          this.pmiEntriesList,
          this.pmiGetRangeList,
          this.pmiAddNamedRange,
          this.pmiFunctionSeparator,
          this.pmiInsFunction,
          this.menuAddHyperlink,
          this.menuHyperlink,
          this.pmiRowHeight,
          this.pmiColumnWidth,
          this.pmiEntireHide,
          this.pmiEntireShow,
          this.pmiFreezeSeparator,
          this.pmiFreezePanes,
        ],
      }).on("hide:after", (menu, e, isFromInputControl) => {
        this.clearCustomItems(menu)
      })

      this.mnuGroupImg = new Common.UI.MenuItem({
        caption: this.txtGroup,
        iconCls: "menu__icon btn-shape-group",
        type: "group",
        value: "grouping",
      })

      this.mnuUnGroupImg = new Common.UI.MenuItem({
        caption: this.txtUngroup,
        iconCls: "menu__icon btn-shape-ungroup",
        type: "group",
        value: "ungrouping",
      })

      this.mnuShapeSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.mnuShapeAdvanced = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-menu-shape",
        caption: this.advancedShapeText,
      })

      this.mnuImgAdvanced = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-menu-image",
        caption: this.advancedImgText,
      })

      this.mnuSlicerSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.mnuSlicerAdvanced = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-slicer",
        caption: this.advancedSlicerText,
      })

      this.mnuChartEdit = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-menu-chart",
        caption: this.chartText,
      })

      this.mnuChartData = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-select-range",
        caption: this.chartDataText,
      })

      this.mnuChartType = new Common.UI.MenuItem({
        caption: this.chartTypeText,
      })

      this.pmiImgCut = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-cut",
        caption: this.txtCut,
        value: "cut",
      })

      this.pmiImgCopy = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-copy",
        caption: this.txtCopy,
        value: "copy",
      })

      this.pmiImgPaste = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-paste",
        caption: this.txtPaste,
        value: "paste",
      })

      this.menuSignatureEditSign = new Common.UI.MenuItem({ caption: this.strSign, value: 0 })
      this.menuSignatureEditSetup = new Common.UI.MenuItem({ caption: this.strSetup, value: 2 })
      this.menuEditSignSeparator = new Common.UI.MenuItem({ caption: "--" })

      this.menuImgOriginalSize = new Common.UI.MenuItem({
        caption: this.originalSizeText,
      })

      this.menuImgReplace = new Common.UI.MenuItem({
        caption: this.textReplace,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            new Common.UI.MenuItem({ caption: this.textFromFile, value: "file" }),
            new Common.UI.MenuItem({ caption: this.textFromUrl, value: "url" }),
            new Common.UI.MenuItem({ caption: this.textFromStorage, value: "storage" }),
          ],
        }),
      })

      this.menuImgCrop = new Common.UI.MenuItem({
        caption: this.textCrop,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            new Common.UI.MenuItem({
              caption: this.textCrop,
              checkable: true,
              allowDepress: true,
              value: 0,
            }),
            new Common.UI.MenuItem({
              caption: this.textCropFill,
              value: 1,
            }),
            new Common.UI.MenuItem({
              caption: this.textCropFit,
              value: 2,
            }),
          ],
        }),
      })

      this.menuImgResetCrop = new Common.UI.MenuItem({
        caption: this.textResetCrop,
        iconCls: "menu__icon btn-reset",
      })

      this.mnuBringToFront = new Common.UI.MenuItem({
        caption: this.textArrangeFront,
        iconCls: "menu__icon btn-arrange-front",
        type: "arrange",
        value: Asc.c_oAscDrawingLayerType.BringToFront,
      })
      this.mnuSendToBack = new Common.UI.MenuItem({
        caption: this.textArrangeBack,
        iconCls: "menu__icon btn-arrange-back",
        type: "arrange",
        value: Asc.c_oAscDrawingLayerType.SendToBack,
      })
      this.mnuBringForward = new Common.UI.MenuItem({
        caption: this.textArrangeForward,
        iconCls: "menu__icon btn-arrange-forward",
        type: "arrange",
        value: Asc.c_oAscDrawingLayerType.BringForward,
      })
      this.mnuSendBackward = new Common.UI.MenuItem({
        caption: this.textArrangeBackward,
        iconCls: "menu__icon btn-arrange-backward",
        type: "arrange",
        value: Asc.c_oAscDrawingLayerType.SendBackward,
      })

      this.menuImageArrange = new Common.UI.MenuItem({
        caption: this.textArrange,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            this.mnuBringToFront,
            this.mnuSendToBack,
            this.mnuBringForward,
            this.mnuSendBackward,
            { caption: "--" },
            this.mnuGroupImg,
            this.mnuUnGroupImg,
          ],
        }),
      })

      this.menuImageAlign = new Common.UI.MenuItem({
        caption: this.textAlign,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            {
              caption: this.textShapeAlignLeft,
              iconCls: "menu__icon btn-shape-align-left",
              value: 0,
            },
            {
              caption: this.textShapeAlignCenter,
              iconCls: "menu__icon btn-shape-align-center",
              value: 4,
            },
            {
              caption: this.textShapeAlignRight,
              iconCls: "menu__icon btn-shape-align-right",
              value: 1,
            },
            {
              caption: this.textShapeAlignTop,
              iconCls: "menu__icon btn-shape-align-top",
              value: 3,
            },
            {
              caption: this.textShapeAlignMiddle,
              iconCls: "menu__icon btn-shape-align-middle",
              value: 5,
            },
            {
              caption: this.textShapeAlignBottom,
              iconCls: "menu__icon btn-shape-align-bottom",
              value: 2,
            },
            { caption: "--" },
            {
              caption: this.txtDistribHor,
              iconCls: "menu__icon btn-shape-distribute-hor",
              value: 6,
            },
            {
              caption: this.txtDistribVert,
              iconCls: "menu__icon btn-shape-distribute-vert",
              value: 7,
            },
          ],
        }),
      })

      const _toolbar_view = SSE.getController("Toolbar").getView("Toolbar")
      this.menuShapesMerge = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-combine-shapes",
        caption: this.textShapesMerge,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            {
              caption: _toolbar_view.textShapesUnion,
              iconCls: "menu__icon btn-union-shapes",
              value: "unite",
            },
            {
              caption: _toolbar_view.textShapesCombine,
              iconCls: "menu__icon btn-combine-shapes",
              value: "exclude",
            },
            {
              caption: _toolbar_view.textShapesFragment,
              iconCls: "menu__icon btn-fragment-shapes",
              value: "divide",
            },
            {
              caption: _toolbar_view.textShapesIntersect,
              iconCls: "menu__icon btn-intersect-shapes",
              value: "intersect",
            },
            {
              caption: _toolbar_view.textShapesSubstract,
              iconCls: "menu__icon btn-substract-shapes",
              value: "subtract",
            },
          ],
        }),
      })

      const _СhartSettingsDlg_view = SSE.Views.ChartSettingsDlg.prototype
      this.menuChartElement = new Common.UI.MenuItem({
        menu: new Common.UI.Menu({
          items: [
            {
              caption: this.textAxes,
              value: "axes",
              disabled: false,
              menu: new Common.UI.Menu({
                cls: "shifted-right",
                menuAlign: "tl-tr",
                items: [
                  {
                    caption: _СhartSettingsDlg_view.textHorAxis,
                    value: "bShowHorAxis",
                    stopPropagation: true,
                    checkable: true,
                  },
                  {
                    caption: _СhartSettingsDlg_view.textVertAxis,
                    value: "bShowVertAxis",
                    stopPropagation: true,
                    checkable: true,
                  },
                  {
                    caption: _СhartSettingsDlg_view.textHorAxisSec,
                    value: "bShowHorAxSec",
                    stopPropagation: true,
                    checkable: true,
                  },
                  {
                    caption: _СhartSettingsDlg_view.textVertAxisSec,
                    value: "bShowVertAxSec",
                    stopPropagation: true,
                    checkable: true,
                  },
                  {
                    caption: this.DepthAxis,
                    value: "bShowDepthAxes",
                    stopPropagation: true,
                    checkable: true,
                  },
                ],
              }),
            },
            {
              caption: this.textAxisTitles,
              value: "axisTitles",
              disabled: false,
              menu: new Common.UI.Menu({
                cls: "shifted-right",
                menuAlign: "tl-tr",
                items: [
                  {
                    caption: _СhartSettingsDlg_view.textHorAxis,
                    value: "bShowHorAxTitle",
                    stopPropagation: true,
                    checkable: true,
                  },
                  {
                    caption: _СhartSettingsDlg_view.textVertAxis,
                    value: "bShowVertAxTitle",
                    stopPropagation: true,
                    checkable: true,
                  },
                  {
                    caption: _СhartSettingsDlg_view.textHorAxisSec,
                    value: "bShowHorAxTitleSec",
                    stopPropagation: true,
                    checkable: true,
                  },
                  {
                    caption: _СhartSettingsDlg_view.textVertAxisSec,
                    value: "bShowVertAxisTitleSec",
                    stopPropagation: true,
                    checkable: true,
                  },
                  {
                    caption: this.DepthAxis,
                    value: "bShowDepthAxisTitle",
                    stopPropagation: true,
                    checkable: true,
                  },
                ],
              }),
            },
            {
              caption: this.textChartTitle,
              value: "chartTitle",
              disabled: false,
              menu: new Common.UI.Menu({
                cls: "shifted-right",
                menuAlign: "tl-tr",
                items: [
                  {
                    caption: this.textNone,
                    value: "bShowChartTitleNone",
                    stopPropagation: true,
                    toggleGroup: "chartTitle",
                    checkable: true,
                  },
                  {
                    caption: _СhartSettingsDlg_view.textNoOverlay,
                    value: "bShowChartTitle",
                    stopPropagation: true,
                    toggleGroup: "chartTitle",
                    checkable: true,
                  },
                  {
                    caption: _СhartSettingsDlg_view.textOverlay,
                    value: "bOverlayTitle",
                    stopPropagation: true,
                    toggleGroup: "chartTitle",
                    checkable: true,
                  },
                ],
              }),
            },
            {
              caption: _СhartSettingsDlg_view.textDataLabels,
              value: "dataLabels",
              disabled: false,
              menu: new Common.UI.Menu({
                cls: "shifted-right",
                menuAlign: "tl-tr",
                items: [
                  {
                    caption: this.textNone,
                    value: "bShowDataLabels",
                    stopPropagation: true,
                    toggleGroup: "dataLabels",
                    checkable: true,
                  },
                  {
                    caption: _СhartSettingsDlg_view.textCenter,
                    value: "CenterData",
                    stopPropagation: true,
                    toggleGroup: "dataLabels",
                    checkable: true,
                  },
                  {
                    caption: _СhartSettingsDlg_view.textInnerBottom,
                    value: "InnerBottomData",
                    stopPropagation: true,
                    toggleGroup: "dataLabels",
                    checkable: true,
                  },
                  {
                    caption: _СhartSettingsDlg_view.textInnerTop,
                    value: "InnerTopData",
                    stopPropagation: true,
                    toggleGroup: "dataLabels",
                    checkable: true,
                  },
                  {
                    caption: _СhartSettingsDlg_view.textOuterTop,
                    value: "OuterTopData",
                    stopPropagation: true,
                    toggleGroup: "dataLabels",
                    checkable: true,
                  },
                  {
                    caption: _СhartSettingsDlg_view.textTop,
                    value: "TopData",
                    stopPropagation: true,
                    toggleGroup: "dataLabels",
                    checkable: true,
                  },
                  {
                    caption: _СhartSettingsDlg_view.textLeft,
                    value: "LeftData",
                    stopPropagation: true,
                    toggleGroup: "dataLabels",
                    checkable: true,
                  },
                  {
                    caption: _СhartSettingsDlg_view.textRight,
                    value: "RightData",
                    stopPropagation: true,
                    checkable: true,
                  },
                  {
                    caption: _СhartSettingsDlg_view.textBottom,
                    value: "BottomData",
                    stopPropagation: true,
                    toggleGroup: "dataLabels",
                    checkable: true,
                  },
                  {
                    caption: _СhartSettingsDlg_view.textFit,
                    value: "FitWidthData",
                    stopPropagation: true,
                    toggleGroup: "dataLabels",
                    checkable: true,
                  },
                ],
              }),
            },
            // {
            //     caption: me.textDataTable,
            //     value: 'dataTable',
            //     disabled: false,
            //     menu: new Common.UI.Menu({
            //         cls: 'shifted-right',
            //         menuAlign: 'tl-tr',
            //         items: [
            //             {
            //                 caption: me.textNone,
            //                 value: 'bShowDataNone'
            //             },
            //             {
            //                 caption: me.textShowDataTable,
            //                 value: 'bShowDataTable'
            //             },
            //             {
            //                 caption: me.textShowLegendKeys,
            //                 value: 'bShowLegendKeys'
            //             }
            //         ]
            //     })
            // },
            {
              caption: this.textErrorBars,
              value: "errorBars",
              disabled: false,
              menu: new Common.UI.Menu({
                cls: "shifted-right",
                menuAlign: "tl-tr",
                items: [
                  {
                    caption: this.textNone,
                    value: "noneError",
                    stopPropagation: true,
                    disabled: false,
                  },
                  {
                    caption: this.textStandardError,
                    value: "standardError",
                    stopPropagation: true,
                    disabled: false,
                  },
                  {
                    caption: this.txtPercentage,
                    value: "percentage",
                    stopPropagation: true,
                    disabled: false,
                  },
                  {
                    caption: this.textStandardDeviation,
                    value: "standardDeviation",
                    stopPropagation: true,
                    disabled: false,
                  },
                ],
              }),
            },
            {
              caption: _СhartSettingsDlg_view.textGridLines,
              value: "gridLines",
              disabled: false,
              menu: new Common.UI.Menu({
                cls: "shifted-right",
                menuAlign: "tl-tr",
                items: [
                  {
                    caption: this.textHorizontalMajor,
                    value: "bShowHorMajor",
                    stopPropagation: true,
                    checkable: true,
                  },
                  {
                    caption: this.textVerticalMajor,
                    value: "bShowVerMajor",
                    stopPropagation: true,
                    checkable: true,
                  },
                  {
                    caption: this.textHorizontalMinor,
                    value: "bShowHorMinor",
                    stopPropagation: true,
                    checkable: true,
                  },
                  {
                    caption: this.textVerticalMinor,
                    value: "bShowVerMinor",
                    stopPropagation: true,
                    checkable: true,
                  },
                ],
              }),
            },
            {
              caption: _СhartSettingsDlg_view.textLegendPos,
              value: "legend",
              disabled: false,
              menu: new Common.UI.Menu({
                cls: "shifted-right",
                menuAlign: "tl-tr",
                items: [
                  {
                    caption: this.textNone,
                    value: "NoneLegend",
                    stopPropagation: true,
                    toggleGroup: "legend",
                    checkable: true,
                  },
                  {
                    caption: _СhartSettingsDlg_view.textTop,
                    value: "TopLegend",
                    stopPropagation: true,
                    toggleGroup: "legend",
                    checkable: true,
                  },
                  {
                    caption: _СhartSettingsDlg_view.textLeft,
                    value: "LeftLegend",
                    stopPropagation: true,
                    toggleGroup: "legend",
                    checkable: true,
                  },
                  {
                    caption: _СhartSettingsDlg_view.textRight,
                    value: "RightLegend",
                    stopPropagation: true,
                    toggleGroup: "legend",
                    checkable: true,
                  },
                  {
                    caption: _СhartSettingsDlg_view.textBottom,
                    value: "BottomLegend",
                    stopPropagation: true,
                    toggleGroup: "legend",
                    checkable: true,
                  },
                  {
                    caption: _СhartSettingsDlg_view.textLeftOverlay,
                    value: "LeftOverlay",
                    stopPropagation: true,
                    toggleGroup: "legend",
                    checkable: true,
                  },
                  {
                    caption: _СhartSettingsDlg_view.textRightOverlay,
                    value: "RightOverlay",
                    stopPropagation: true,
                    toggleGroup: "legend",
                    checkable: true,
                  },
                ],
              }),
            },
            {
              caption: this.textTrendline,
              value: "trendLines",
              disabled: false,
              menu: new Common.UI.Menu({
                cls: "shifted-right",
                menuAlign: "tl-tr",
                items: [
                  {
                    caption: this.textNone,
                    stopPropagation: true,
                    value: "trendLineNone",
                  },
                  {
                    caption: this.textLinear,
                    stopPropagation: true,
                    value: "trendLineLinear",
                  },
                  {
                    caption: this.textExponential,
                    stopPropagation: true,
                    value: "trendLineExponential",
                  },
                  {
                    caption: this.textLinearForecast,
                    stopPropagation: true,
                    value: "trendLineForecast",
                  },
                  {
                    caption: this.textMovingAverage,
                    stopPropagation: true,
                    value: "trendLineMovingAverage",
                  },
                ],
              }),
            },
            {
              caption: this.textUpDownBars,
              value: "upDownBars",
              disabled: false,
              menu: new Common.UI.Menu({
                cls: "shifted-right",
                menuAlign: "tl-tr",
                items: [
                  {
                    caption: this.textNone,
                    stopPropagation: true,
                    value: "bShowUpDownNone",
                  },
                  {
                    caption: this.textShowUpDown,
                    stopPropagation: true,
                    value: "bShowUpDownBars",
                  },
                ],
              }),
            },
          ],
        }),
      })

      this.menuImgRotate = new Common.UI.MenuItem({
        caption: this.textRotate,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            new Common.UI.MenuItem({
              iconCls: "menu__icon btn-rotate-90",
              caption: this.textRotate90,
              type: "rotate",
              value: 1,
            }),
            new Common.UI.MenuItem({
              iconCls: "menu__icon btn-rotate-270",
              caption: this.textRotate270,
              type: "rotate",
              value: 0,
            }),
            { caption: "--" },
            new Common.UI.MenuItem({
              iconCls: "menu__icon btn-flip-hor",
              caption: this.textFlipH,
              type: "flip",
              value: 1,
            }),
            new Common.UI.MenuItem({
              iconCls: "menu__icon btn-flip-vert",
              caption: this.textFlipV,
              type: "flip",
              value: 0,
            }),
          ],
        }),
      })

      this.menuImgMacro = new Common.UI.MenuItem({
        caption: this.textMacro,
      })

      this.menuSaveAsPicture = new Common.UI.MenuItem({
        caption: this.textSaveAsPicture,
      })

      const menuSaveAsPictureSeparator = new Common.UI.MenuItem({ caption: "--" })

      this.menuImgEditPoints = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-edit-points",
        caption: this.textEditPoints,
      })

      this.menuEditObject = new Common.UI.MenuItem({
        caption: this.txtEditObject,
      })

      this.menuEditObjectSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.menuHyperlinkPicSeparator = new Common.UI.MenuItem({
        caption: "--",
      })

      this.menuAddHyperlinkPic = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-inserthyperlink",
        caption: this.txtInsHyperlink,
      })

      this.menuEditHyperlinkPic = new Common.UI.MenuItem({
        caption: this.editHyperlinkText,
      })

      this.menuRemoveHyperlinkPic = new Common.UI.MenuItem({
        caption: this.removeHyperlinkText,
      })

      this.menuHyperlinkPic = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-inserthyperlink",
        caption: this.txtInsHyperlink,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [this.menuEditHyperlinkPic, this.menuRemoveHyperlinkPic],
        }),
      })

      this.imgMenu = new Common.UI.Menu({
        cls: "shifted-right",
        restoreHeightAndTop: true,
        scrollToCheckedItem: false,
        items: [
          this.pmiImgCut,
          this.pmiImgCopy,
          this.pmiImgPaste,
          this.menuEditObjectSeparator,
          this.menuEditObject,
          { caption: "--" },
          this.menuSignatureEditSign,
          this.menuSignatureEditSetup,
          this.menuEditSignSeparator,
          this.menuImageArrange,
          this.menuImageAlign,
          this.menuShapesMerge,
          this.menuImgRotate,
          this.menuImgMacro,
          menuSaveAsPictureSeparator,
          this.menuSaveAsPicture,
          this.mnuShapeSeparator,
          this.menuAddHyperlinkPic,
          this.menuHyperlinkPic,
          this.menuHyperlinkPicSeparator,
          this.menuImgCrop,
          this.menuImgResetCrop,
          this.mnuChartData,
          this.mnuChartType,
          this.mnuChartEdit,
          this.menuImgEditPoints,
          this.mnuShapeAdvanced,
          this.menuImgOriginalSize,
          this.menuImgReplace,
          this.mnuImgAdvanced,
          this.mnuSlicerSeparator,
          this.mnuSlicerAdvanced,
        ],
      }).on("hide:after", (menu, e, isFromInputControl) => {
        this.clearCustomItems(menu)
      })

      this.menuParagraphVAlign = new Common.UI.MenuItem({
        caption: this.AlignText,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            (this.menuParagraphTop = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-top",
              caption: this.AlignTop,
              checkable: true,
              checkmark: false,
              toggleGroup: "popupparagraphvalign",
              value: Asc.c_oAscVAlign.Top,
            })),
            (this.menuParagraphCenter = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-middle",
              caption: this.AlignMiddle,
              checkable: true,
              checkmark: false,
              toggleGroup: "popupparagraphvalign",
              value: Asc.c_oAscVAlign.Center,
            })),
            (this.menuParagraphBottom = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-bottom",
              caption: this.AlignBottom,
              checkable: true,
              checkmark: false,
              toggleGroup: "popupparagraphvalign",
              value: Asc.c_oAscVAlign.Bottom,
            })),
            { caption: "--" },
            (this.menuParagraphLeft = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-left",
              caption: this.AlignLeft,
              checkable: true,
              checkmark: false,
              toggleGroup: "popupparagraphhalign",
              halign: 1,
            })),
            (this.menuParagraphHCenter = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-center",
              caption: this.AlignCenter,
              checkable: true,
              checkmark: false,
              toggleGroup: "popupparagraphhalign",
              halign: 2,
            })),
            (this.menuParagraphRight = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-right",
              caption: this.AlignRight,
              checkable: true,
              checkmark: false,
              toggleGroup: "popupparagraphhalign",
              halign: 0,
            })),
            (this.menuParagraphJust = new Common.UI.MenuItem({
              iconCls: "menu__icon btn-align-just",
              caption: this.AlignJust,
              checkable: true,
              checkmark: false,
              toggleGroup: "popupparagraphhalign",
              halign: 3,
            })),
          ],
        }),
      })

      this.menuParagraphDirection = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-text-orient-hor",
        caption: this.directionText,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            (this.menuParagraphDirectH = new Common.UI.MenuItem({
              caption: this.directHText,
              iconCls: "menu__icon btn-text-orient-hor",
              checkable: true,
              checkmark: false,
              checked: false,
              toggleGroup: "popupparagraphdirect",
              direction: Asc.c_oAscVertDrawingText.normal,
            })),
            (this.menuParagraphDirect90 = new Common.UI.MenuItem({
              caption: this.direct90Text,
              iconCls: "menu__icon btn-text-orient-rdown",
              checkable: true,
              checkmark: false,
              checked: false,
              toggleGroup: "popupparagraphdirect",
              direction: Asc.c_oAscVertDrawingText.vert,
            })),
            (this.menuParagraphDirect270 = new Common.UI.MenuItem({
              caption: this.direct270Text,
              iconCls: "menu__icon btn-text-orient-rup",
              checkable: true,
              checkmark: false,
              checked: false,
              toggleGroup: "popupparagraphdirect",
              direction: Asc.c_oAscVertDrawingText.vert270,
            })),
          ],
        }),
      })

      this.menuParagraphBullets = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-setmarkers",
        caption: this.bulletsText,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [
            {
              template: _.template(
                '<div id="id-docholder-menu-bullets" class="menu-layouts" style="width: 376px;"></div>',
              ),
            },
            { caption: "--" },
            (this.menuParagraphBulletNone = new Common.UI.MenuItem({
              caption: this.textNone,
              checkable: true,
              checked: false,
              value: -1,
            })),
            (this.mnuListSettings = new Common.UI.MenuItem({
              caption: this.textListSettings,
              value: "settings",
            })),
          ],
        }),
      })

      this._markersArr = [
        '{"bulletTypeface":{"type":"bufont","typeface":"Symbol"},"bulletType":{"type":"char","char":"·","startAt":null}}',
        '{"bulletTypeface":{"type":"bufont","typeface":"Courier New"},"bulletType":{"type":"char","char":"o","startAt":null}}',
        '{"bulletTypeface":{"type":"bufont","typeface":"Wingdings"},"bulletType":{"type":"char","char":"§","startAt":null}}',
        '{"bulletTypeface":{"type":"bufont","typeface":"Wingdings"},"bulletType":{"type":"char","char":"v","startAt":null}}',
        '{"bulletTypeface":{"type":"bufont","typeface":"Wingdings"},"bulletType":{"type":"char","char":"Ø","startAt":null}}',
        '{"bulletTypeface":{"type":"bufont","typeface":"Wingdings"},"bulletType":{"type":"char","char":"ü","startAt":null}}',
        '{"bulletTypeface":{"type":"bufont","typeface":"Symbol"},"bulletType":{"type":"char","char":"¨","startAt":null}}',
        '{"bulletTypeface":{"type":"bufont","typeface":"Arial"},"bulletType":{"type":"char","char":"–","startAt":null}}',
      ]
      this._numbersArr = [
        '{"bulletTypeface":{"type":"bufont","typeface":"Arial"},"bulletType":{"type":"autonum","char":null,"autoNumType":"alphaUcPeriod","startAt":null}}',
        '{"bulletTypeface":{"type":"bufont","typeface":"Arial"},"bulletType":{"type":"autonum","char":null,"autoNumType":"alphaLcParenR","startAt":null}}',
        '{"bulletTypeface":{"type":"bufont","typeface":"Arial"},"bulletType":{"type":"autonum","char":null,"autoNumType":"alphaLcPeriod","startAt":null}}',
        '{"bulletTypeface":{"type":"bufont","typeface":"Arial"},"bulletType":{"type":"autonum","char":null,"autoNumType":"arabicPeriod","startAt":null}}',
        '{"bulletTypeface":{"type":"bufont","typeface":"Arial"},"bulletType":{"type":"autonum","char":null,"autoNumType":"arabicParenR","startAt":null}}',
        '{"bulletTypeface":{"type":"bufont","typeface":"Arial"},"bulletType":{"type":"autonum","char":null,"autoNumType":"romanUcPeriod","startAt":null}}',
        '{"bulletTypeface":{"type":"bufont","typeface":"Arial"},"bulletType":{"type":"autonum","char":null,"autoNumType":"romanLcPeriod","startAt":null}}',
      ]
      this.paraBulletsPicker = {
        conf: { rec: null },
        delayRenderTips: true,
        store: new Common.UI.DataViewStore([
          {
            group: "menu-list-bullet-group",
            id: `id-markers-${Common.UI.getId()}`,
            type: 0,
            subtype: 1,
            numberingInfo: this._markersArr[0],
            skipRenderOnChange: true,
            tip: this.tipMarkersFRound,
          },
          {
            group: "menu-list-bullet-group",
            id: `id-markers-${Common.UI.getId()}`,
            type: 0,
            subtype: 2,
            numberingInfo: this._markersArr[1],
            skipRenderOnChange: true,
            tip: this.tipMarkersHRound,
          },
          {
            group: "menu-list-bullet-group",
            id: `id-markers-${Common.UI.getId()}`,
            type: 0,
            subtype: 3,
            numberingInfo: this._markersArr[2],
            skipRenderOnChange: true,
            tip: this.tipMarkersFSquare,
          },
          {
            group: "menu-list-bullet-group",
            id: `id-markers-${Common.UI.getId()}`,
            type: 0,
            subtype: 4,
            numberingInfo: this._markersArr[3],
            skipRenderOnChange: true,
            tip: this.tipMarkersStar,
          },
          {
            group: "menu-list-bullet-group",
            id: `id-markers-${Common.UI.getId()}`,
            type: 0,
            subtype: 5,
            numberingInfo: this._markersArr[4],
            skipRenderOnChange: true,
            tip: this.tipMarkersArrow,
          },
          {
            group: "menu-list-bullet-group",
            id: `id-markers-${Common.UI.getId()}`,
            type: 0,
            subtype: 6,
            numberingInfo: this._markersArr[5],
            skipRenderOnChange: true,
            tip: this.tipMarkersCheckmark,
          },
          {
            group: "menu-list-bullet-group",
            id: `id-markers-${Common.UI.getId()}`,
            type: 0,
            subtype: 7,
            numberingInfo: this._markersArr[6],
            skipRenderOnChange: true,
            tip: this.tipMarkersFRhombus,
          },
          {
            group: "menu-list-bullet-group",
            id: `id-markers-${Common.UI.getId()}`,
            type: 0,
            subtype: 8,
            numberingInfo: this._markersArr[7],
            skipRenderOnChange: true,
            tip: this.tipMarkersDash,
          },
          {
            group: "menu-list-number-group",
            id: `id-numbers-${Common.UI.getId()}`,
            type: 1,
            subtype: 4,
            numberingInfo: this._numbersArr[0],
            skipRenderOnChange: true,
            tip: this.tipNumCapitalLetters,
          },
          {
            group: "menu-list-number-group",
            id: `id-numbers-${Common.UI.getId()}`,
            type: 1,
            subtype: 5,
            numberingInfo: this._numbersArr[1],
            skipRenderOnChange: true,
            tip: this.tipNumLettersParentheses,
          },
          {
            group: "menu-list-number-group",
            id: `id-numbers-${Common.UI.getId()}`,
            type: 1,
            subtype: 6,
            numberingInfo: this._numbersArr[2],
            skipRenderOnChange: true,
            tip: this.tipNumLettersPoints,
          },
          {
            group: "menu-list-number-group",
            id: `id-numbers-${Common.UI.getId()}`,
            type: 1,
            subtype: 1,
            numberingInfo: this._numbersArr[3],
            skipRenderOnChange: true,
            tip: this.tipNumNumbersPoint,
          },
          {
            group: "menu-list-number-group",
            id: `id-numbers-${Common.UI.getId()}`,
            type: 1,
            subtype: 2,
            numberingInfo: this._numbersArr[4],
            skipRenderOnChange: true,
            tip: this.tipNumNumbersParentheses,
          },
          {
            group: "menu-list-number-group",
            id: `id-numbers-${Common.UI.getId()}`,
            type: 1,
            subtype: 3,
            numberingInfo: this._numbersArr[5],
            skipRenderOnChange: true,
            tip: this.tipNumRoman,
          },
          {
            group: "menu-list-number-group",
            id: `id-numbers-${Common.UI.getId()}`,
            type: 1,
            subtype: 7,
            numberingInfo: this._numbersArr[6],
            skipRenderOnChange: true,
            tip: this.tipNumRomanSmall,
          },
        ]),
        groups: new Common.UI.DataViewGroupStore([
          { id: "menu-list-bullet-group", caption: this.textBullets },
          { id: "menu-list-number-group", caption: this.textNumbering },
        ]),
        selectRecord: function (rec) {
          this.conf.rec = rec
        },
      }

      this.menuAddHyperlinkShape = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-inserthyperlink",
        caption: this.txtInsHyperlink,
      })

      this.menuEditHyperlinkShape = new Common.UI.MenuItem({
        caption: this.editHyperlinkText,
      })

      this.menuRemoveHyperlinkShape = new Common.UI.MenuItem({
        caption: this.removeHyperlinkText,
      })

      this.menuHyperlinkShape = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-inserthyperlink",
        caption: this.txtInsHyperlink,
        menu: new Common.UI.Menu({
          cls: "shifted-right",
          menuAlign: "tl-tr",
          items: [this.menuEditHyperlinkShape, this.menuRemoveHyperlinkShape],
        }),
      })

      this.pmiTextAdvanced = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-paragraph",
        caption: this.txtTextAdvanced,
      })

      this.pmiTextCut = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-cut",
        caption: this.txtCut,
        value: "cut",
      })

      this.pmiTextCopy = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-copy",
        caption: this.txtCopy,
        value: "copy",
      })

      this.pmiTextPaste = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-paste",
        caption: this.txtPaste,
        value: "paste",
      })

      this.menuParagraphEquation = new Common.UI.MenuItem({
        caption: this.advancedEquationText,
        iconCls: "menu__icon btn-equation",
        menu: this.createEquationMenu("popupparaeqinput", "tl-tr"),
      })

      this.textInShapeMenu = new Common.UI.Menu({
        cls: "shifted-right",
        scrollToCheckedItem: false,
        items: [
          this.pmiTextCut,
          this.pmiTextCopy,
          this.pmiTextPaste,
          { caption: "--" },
          this.menuParagraphVAlign,
          this.menuParagraphDirection,
          this.menuParagraphBullets,
          this.menuAddHyperlinkShape,
          this.menuHyperlinkShape,
          { caption: "--" },
          this.pmiTextAdvanced,
          this.menuParagraphEquation,
        ],
      }).on("hide:after", (menu, e, isFromInputControl) => {
        this.clearCustomItems(menu)
      })

      this.pmiCommonCut = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-cut",
        caption: this.txtCut,
        value: "cut",
      })

      this.pmiCommonCopy = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-copy",
        caption: this.txtCopy,
        value: "copy",
      })

      this.pmiCommonPaste = new Common.UI.MenuItem({
        iconCls: "menu__icon btn-paste",
        caption: this.txtPaste,
        value: "paste",
      })

      this.copyPasteMenu = new Common.UI.Menu({
        cls: "shifted-right",
        items: [this.pmiCommonCut, this.pmiCommonCopy, this.pmiCommonPaste],
      }).on("hide:after", (menu, e, isFromInputControl) => {
        this.clearCustomItems(menu)
      })

      this.entriesMenu = new Common.UI.Menu({
        maxHeight: 200,
        cyclic: false,
        items: [],
      })
        .on("show:after", function () {
          this.scroller.update({ alwaysVisibleY: true })
        })
        .on("keydown:before", (menu, e) => {
          if (e.altKey && e.keyCode === Common.UI.Keys.DOWN) {
            const li = $(e.target).closest("li")
            if (li.length > 0) li.click()
            else menu.hide()
          }
        })

      this.funcMenu = new Common.UI.Menu({
        maxHeight: 200,
        cyclic: false,
        items: [],
      }).on("render:after", (mnu) => {
        mnu.cmpEl.removeAttr("oo_editor_input").attr("oo_editor_keyboard", true)
      })

      this.tableTotalMenu = new Common.UI.Menu({
        maxHeight: 160,
        menuAlign: "tr-br",
        cyclic: false,
        cls: "lang-menu",
        items: [
          {
            caption: this.textNone,
            value: Asc.ETotalsRowFunction.totalrowfunctionNone,
            checkable: true,
          },
          {
            caption: this.textAverage,
            value: Asc.ETotalsRowFunction.totalrowfunctionAverage,
            checkable: true,
          },
          {
            caption: this.textCount,
            value: Asc.ETotalsRowFunction.totalrowfunctionCount,
            checkable: true,
          },
          {
            caption: this.textMax,
            value: Asc.ETotalsRowFunction.totalrowfunctionMax,
            checkable: true,
          },
          {
            caption: this.textMin,
            value: Asc.ETotalsRowFunction.totalrowfunctionMin,
            checkable: true,
          },
          {
            caption: this.textSum,
            value: Asc.ETotalsRowFunction.totalrowfunctionSum,
            checkable: true,
          },
          {
            caption: this.textStdDev,
            value: Asc.ETotalsRowFunction.totalrowfunctionStdDev,
            checkable: true,
          },
          {
            caption: this.textVar,
            value: Asc.ETotalsRowFunction.totalrowfunctionVar,
            checkable: true,
          },
          {
            caption: this.textMore,
            value: Asc.ETotalsRowFunction.totalrowfunctionCustom,
            checkable: true,
          },
        ],
      })

      this.fillMenu = new Common.UI.Menu({
        restoreHeightAndTop: true,
        items: [
          { caption: this.textCopyCells, value: Asc.c_oAscFillType.copyCells },
          { caption: this.textFillSeries, value: Asc.c_oAscFillType.fillSeries },
          { caption: this.textFillFormatOnly, value: Asc.c_oAscFillType.fillFormattingOnly },
          { caption: this.textFillWithoutFormat, value: Asc.c_oAscFillType.fillWithoutFormatting },
          { caption: "--" },
          { caption: this.textFillDays, value: Asc.c_oAscFillType.fillDays },
          { caption: this.textFillWeekdays, value: Asc.c_oAscFillType.fillWeekdays },
          { caption: this.textFillMonths, value: Asc.c_oAscFillType.fillMonths },
          { caption: this.textFillYears, value: Asc.c_oAscFillType.fillYears },
          { caption: "--" },
          { caption: this.textLinearTrend, value: Asc.c_oAscFillType.linearTrend },
          { caption: this.textGrowthTrend, value: Asc.c_oAscFillType.growthTrend },
          { caption: this.textFlashFill, value: Asc.c_oAscFillType.flashFill },
          { caption: this.textSeries, value: Asc.c_oAscFillType.series },
        ],
      })

      this.fireEvent("createdelayedelements", [this, "edit"])
    }
  }
})
