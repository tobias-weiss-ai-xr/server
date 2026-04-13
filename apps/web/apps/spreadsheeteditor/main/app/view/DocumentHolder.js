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
 *  DocumentHolder.js
 *
 *  DocumentHolder view
 *
 *  Created on 3/28/14
 *
 */

define([
  "jquery",
  "underscore",
  "backbone",
  "gateway",
  "common/main/lib/component/Menu",
  "common/main/lib/component/Calendar",
  "common/main/lib/view/OpenDialog",
], ($, _, Backbone, gateway) => {
  SSE.Views.DocumentHolder = Backbone.View.extend(
    _.extend(
      {
        el: "#editor_sdk",

        // Compile our stats template
        template: null,

        // Delegated events for creating new items, and clearing completed ones.
        events: {},

        initialize: function () {
          this._preventCustomClick = null
          this._hasCustomItems = false
          this._currentTranslateObj = undefined

          this.setApi = (api) => {
            this.api = api
            return this
          }
        },

        render: function () {
          this.fireEvent("render:before", this)

          this.cmpEl = $(this.el)

          this.fireEvent("render:after", this)
          return this
        },

        setMode: function (m) {
          this.mode = m
          return this
        },

        focus: function () {
          _.defer(() => {
            this.cmpEl?.focus()
          }, 50)
        },

        createDelayedElementsViewer: () => {},

        createDelayedElements: () => {},

        setMenuItemCommentCaptionMode: function (item, add, editable) {
          item.setCaption(
            add ? this.txtAddComment : editable ? this.txtEditComment : this.txtShowComment,
            true,
          )
        },

        createEquationMenu: function (toggleGroup, menuAlign) {
          return new Common.UI.Menu({
            cls: "ppm-toolbar shifted-right",
            menuAlign: menuAlign,
            items: [
              new Common.UI.MenuItem({
                caption: this.currProfText,
                iconCls: "menu__icon btn-professional-equation",
                type: "view",
                value: { all: false, linear: false },
              }),
              new Common.UI.MenuItem({
                caption: this.currLinearText,
                iconCls: "menu__icon btn-linear-equation",
                type: "view",
                value: { all: false, linear: true },
              }),
              new Common.UI.MenuItem({
                caption: this.allProfText,
                iconCls: "menu__icon btn-professional-equation",
                type: "view",
                value: { all: true, linear: false },
              }),
              new Common.UI.MenuItem({
                caption: this.allLinearText,
                iconCls: "menu__icon btn-linear-equation",
                type: "view",
                value: { all: true, linear: true },
              }),
              { caption: "--" },
              new Common.UI.MenuItem({
                caption: this.unicodeText,
                checkable: true,
                checked: false,
                toggleGroup: toggleGroup,
                type: "input",
                value: Asc.c_oAscMathInputType.Unicode,
              }),
              new Common.UI.MenuItem({
                caption: this.latexText,
                checkable: true,
                checked: false,
                toggleGroup: toggleGroup,
                type: "input",
                value: Asc.c_oAscMathInputType.LaTeX,
              }),
              { caption: "--" },
              new Common.UI.MenuItem({
                caption: this.hideEqToolbar,
                isToolbarHide: false,
                type: "hide",
              }),
            ],
          })
        },

        addEquationMenu: () => {},

        clearEquationMenu: () => {},

        equationCallback: () => {},

        initEquationMenu: () => {},

        updateCustomItems: () => {},

        clearCustomItems: () => {},

        parseIcons: () => {},

        tipNumCapitalLetters: "A. B. C.",
        tipNumLettersParentheses: "a) b) c)",
        tipNumLettersPoints: "a. b. c.",
        tipNumNumbersPoint: "1. 2. 3.",
        tipNumNumbersParentheses: "1) 2) 3)",
        tipNumRoman: "I. II. III.",
        tipNumRomanSmall: "i. ii. iii.",
      },
      SSE.Views.DocumentHolder || {},
    ),
  )
})
