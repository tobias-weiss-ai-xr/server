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

define([
    'common/main/lib/component/BaseView',
    'common/main/lib/util/utils'
], () => {

    Common.UI.Calendar = Common.UI.BaseView.extend(_.extend({

        template    :
            _.template([
                '<div id="calendar" class="calendar-box">',
                    '<div class="calendar-header">',
                        '<div class="top-row">',
                            '<div id="prev-arrow"><button type="button"><i class="arrow-prev img-commonctrl"></i></button></div>',
                            '<div class="title"></div>',
                            '<div id="next-arrow"><button type="button"><i class="arrow-next img-commonctrl" /></button></div>',
                        '</div>',
                        '<div class="bottom-row"></div>',
                    '</div>',
                    '<div class="calendar-content"></div>',
                '</div>'
                ].join('')),

        options: {
            date: undefined,
            firstday: 0 // 0 - sunday, 1 - monday
        },

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            this.monthNames = [this.textJanuary, this.textFebruary, this.textMarch, this.textApril, this.textMay, this.textJune, this.textJuly, this.textAugust, this.textSeptember, this.textOctober, this.textNovember, this.textDecember];
            this.dayNamesShort = [this.textShortSunday, this.textShortMonday, this.textShortTuesday, this.textShortWednesday, this.textShortThursday, this.textShortFriday, this.textShortSaturday];
            this.monthShortNames = [this.textShortJanuary, this.textShortFebruary, this.textShortMarch, this.textShortApril, this.textShortMay, this.textShortJune, this.textShortJuly, this.textShortAugust, this.textShortSeptember, this.textShortOctober, this.textShortNovember, this.textShortDecember];

            this.options.date = options.date;
            if (!_.isUndefined(options.firstday) && (options.firstday === 0 || options.firstday === 1)) {
                this.options.firstday = options.firstday;
            }

            this.enableKeyEvents= this.options.enableKeyEvents;

            this._state = undefined; // 0 - month, 1 - months, 2 - years

            this.render();
        },

        render: function () {
            this.cmpEl = this.$el || $(this.el);
            this.cmpEl.html(this.template());

            this.currentDate = this.options.date || new Date();

            this.btnPrev = new Common.UI.Button({
                parentEl: this.cmpEl.find('#prev-arrow'),
                cls: '',
                scaling: false,
                iconCls: 'arrow-prev img-commonctrl'
            });
            this.btnPrev.on('click', _.bind(this.onClickPrev, this));

            this.btnNext = new Common.UI.Button({
                parentEl: this.cmpEl.find('#next-arrow'),
                cls: '',
                scaling: false,
                iconCls: 'arrow-next img-commonctrl'
            });
            this.btnNext.on('click', _.bind(this.onClickNext, this));

            this.cmpEl.on('keydown', (e) => {
                this.trigger('calendar:keydown', this, e);
            });

            this.renderMonth(this.currentDate);

            this.trigger('render:after', this);
            return this;
        },

        onClickPrev: function () {
            if (this._state === 0) {
                const d = new Date(this.currentDate);
                d.setMonth(d.getMonth() - 1);
                if (d.getFullYear() > 0) {
                    this.renderMonth(d);
                }
            } else if (this._state === 1) {
                const d = new Date(this.currentDate);
                d.setFullYear(d.getFullYear() - 1);
                if (d.getFullYear() > 0) {
                    this.renderMonths(d);
                }
            } else if (this._state === 2) {
                const year = this.currentDate.getFullYear();
                let newYear;
                if (year % 10 !== 0) {
                    newYear = String(year);
                    newYear = Number(`${newYear.slice(0, -1)}0`) - 1;
                } else {
                    newYear = year - 1;
                }
                if (newYear > 0) {
                    this.currentDate.setFullYear(newYear);
                    this.renderYears(newYear);
                }
            }
        },

        onClickNext: function () {
            if (this._state === 0) {
                const d = new Date(this.currentDate);
                d.setMonth(d.getMonth() + 1);
                if (d.getFullYear() > 0) {
                    this.renderMonth(d);
                }
            } else if (this._state === 1) {
                const d = new Date(this.currentDate);
                d.setFullYear(d.getFullYear() + 1);
                if (d.getFullYear() > 0) {
                    this.renderMonths(d);
                }
            } else if (this._state === 2) {
                const year = this.currentDate.getFullYear();
                let newYear;
                if (year % 10 !== 9) {
                    newYear = String(year);
                    newYear = Number(`${newYear.slice(0, -1)}9`) + 1;
                } else {
                    newYear = year + 1;
                }
                if (newYear > 0) {
                    this.currentDate.setFullYear(newYear);
                    this.renderYears(newYear);
                }
            }
        },

        renderYears: function (year) {
            const year = _.isNumber(year) ? year : (this.currentDate ? this.currentDate.getFullYear() : new Date().getFullYear());

            this._state = 2;
            this.$el.removeClass('view-days view-months').addClass('view-years');

            let firstYear = year;
            let lastYear = year;
            if ((firstYear % 10) !== 0) {
                const strYear = String(year);
                firstYear = Number(`${strYear.slice(0, -1)}0`);
            }
            if ((lastYear % 10) !== 9) {
                const strYear = String(year);
                lastYear = Number(`${strYear.slice(0, -1)}9`);
            }

            this.topTitle = _.template([
                `<label>${firstYear}-${lastYear}</label>`
            ].join(''));
            this.cmpEl.find('.calendar-header .title').html(this.topTitle);

            this.bottomTitle = _.template([
                `<label>${this.textYears}</label>`
            ].join(''));
            this.cmpEl.find('.calendar-header .bottom-row').html(this.bottomTitle);

            const arrYears = [];
            let tmpYear = firstYear - 3;

            for (let i = 0; i < 16; i++) {
                arrYears.push({
                    year: (tmpYear > 0) ? tmpYear : '',
                    isCurrentDecade: !!((tmpYear >= firstYear) && (tmpYear <= lastYear)),
                    disabled: !(tmpYear > 0),
                    selected: (_.isDate(this.selectedDate)) ?
                        (tmpYear === this.selectedDate.getFullYear()) :
                        (tmpYear === new Date().getFullYear())
                });
                tmpYear++;
            }

            if (!this.yearPicker) {
                this.yearPicker = new Common.UI.DataView({
                    el: this.cmpEl.find('.calendar-content'),
                    store: new Common.UI.DataViewStore(arrYears),
                    itemTemplate: _.template('<div class="name-year <% if (!isCurrentDecade) { %> no-current-decade <% } %>" data-year="<%= year %>"><%= year %></div>')
                });
                this.yearPicker.on('item:click', (picker, item, record, e) => {
                    const year = record.get('year');
                    const date = new Date();
                    date.setFullYear(year);
                    this.renderMonths(date);
                });
                this.enableKeyEvents && this.yearPicker.on('item:keydown', (view, record, e) => {
                    if (e.keyCode===Common.UI.Keys.ESC) {
                        Common.NotificationCenter.trigger('dataview:blur');
                    }
                });
            } else
                this.yearPicker.store.reset(arrYears);

            this.enableKeyEvents && _.delay(() => {
                this.monthPicker.focus();
            }, 10);
        },

        renderMonths: function (date) {
            const curDate = (_.isDate(date)) ? date : (this.currentDate ? this.currentDate : new Date());
            let year = curDate.getFullYear();

            this._state = 1;
            this.currentDate = curDate;
            this.$el.removeClass('view-years view-days').addClass('view-months');

            // Number of year
            this.topTitle = _.template([
                `<div class="button"><label>${year}</label></div>`
            ].join(''));
            this.cmpEl.find('.calendar-header .title').html(this.topTitle);
            this.cmpEl.find('.calendar-header .title').off();
            this.cmpEl.find('.calendar-header .title').on('click', _.bind(this.renderYears, this));

            this.bottomTitle = _.template([
                `<label>${this.textMonths}</label>`
            ].join(''));
            this.cmpEl.find('.calendar-header .bottom-row').html(this.bottomTitle);

            const arrMonths = [];
            const today = new Date();

            for (let ind = 0; ind < 12; ind++) {
                arrMonths.push({
                    indexMonth: ind,
                    nameMonth: this.monthShortNames[ind],
                    year: year,
                    curYear: true,
                    isCurrentMonth: (ind === curDate.getMonth()),
                    selected: (_.isDate(this.selectedDate)) ?
                        (ind === this.selectedDate.getMonth() && year === this.selectedDate.getFullYear()) :
                        (ind === today.getMonth() && year === today.getFullYear())
                });
            }
            year = year + 1;
            for (let ind = 0; ind < 4; ind++) {
                arrMonths.push({
                    indexMonth: ind,
                    nameMonth: this.monthShortNames[ind],
                    year: year,
                    curYear: false,
                    selected: (_.isDate(this.selectedDate)) ?
                        (ind === this.selectedDate.getMonth() && year === this.selectedDate.getFullYear()) :
                        (ind === today.getMonth() && year === today.getFullYear())
                });
            }

            if (!this.monthsPicker) {
                this.monthsPicker = new Common.UI.DataView({
                    el: this.cmpEl.find('.calendar-content'),
                    store: new Common.UI.DataViewStore(arrMonths),
                    itemTemplate: _.template('<div class="name-month <% if (!curYear) { %> no-cur-year <% } %>" data-month="<%= indexMonth %>" data-year="<%= year %>"><%= nameMonth %></div>')
                });
                this.monthsPicker.on('item:click', (picker, item, record, e) => {
                    const month = record.get('indexMonth');
                    const year = record.get('year');
                    const date = new Date();
                    date.setFullYear(year, month);
                    this.renderMonth(date);
                });
                this.enableKeyEvents && this.monthsPicker.on('item:keydown', (view, record, e) => {
                    if (e.keyCode===Common.UI.Keys.ESC) {
                        Common.NotificationCenter.trigger('dataview:blur');
                    }
                });
            } else
                this.monthsPicker.store.reset(arrMonths);

            this.enableKeyEvents && _.delay(() => {
                this.monthPicker.focus();
            }, 10);
        },

        renderMonth: function (date) {
            this._state = 0;
            const firstDay = this.options.firstday;

            // Current date
            const curDate = date || new Date();
            const curMonth = curDate.getMonth();
            const curIndexDayInWeek = curDate.getDay();
            const curNumberDayInMonth = curDate.getDate();
            const curYear = curDate.getFullYear();

            this.currentDate = curDate;
            this.$el.removeClass('view-years view-months').addClass('view-days');

            // Name month
            this.topTitle = _.template([
                '<div class="button">',
                `<label>${this.monthNames[curMonth]} ${curYear}</label>`,
                '</div>'
            ].join(''));
            this.cmpEl.find('.calendar-header .title').html(this.topTitle);
            this.cmpEl.find('.calendar-header .title').off();
            this.cmpEl.find('.calendar-header .title').on('click', _.bind(this.renderMonths, this));

            // Name days of week
            let dayNamesTemplate = '';
            for (let i = firstDay; i < 7; i++) {
                dayNamesTemplate += `<label>${this.dayNamesShort[i]}</label>`;
            }
            if (firstDay > 0) {
                dayNamesTemplate += `<label>${this.dayNamesShort[0]}</label>`;
            }
            this.cmpEl.find('.calendar-header .bottom-row').html(_.template(dayNamesTemplate));

            // Month
            const rows = 6;
            const cols = 7;

            const arrDays = [];

            const d = new Date(curDate);
            d.setDate(1);
            const firstDayOfMonthIndex = d.getDay();

            const daysInPrevMonth = this.daysInMonth(d.getTime() - (10 * 24 * 60 * 60 * 1000));
            let numberDay;
            let month;
            let year;
            if (firstDay === 0) {
                numberDay = (firstDayOfMonthIndex > 0) ? (daysInPrevMonth - (firstDayOfMonthIndex - 1)) : 1;
            } else {
                if (firstDayOfMonthIndex === 0) {
                    numberDay = daysInPrevMonth - 5;
                } else {
                    numberDay = daysInPrevMonth - (firstDayOfMonthIndex - 2);
                }
            }
            if ((firstDayOfMonthIndex > 0 && firstDay === 0) || firstDay === 1) {
                if (curMonth - 1 >= 0) {
                    month = curMonth - 1;
                    year = curYear;
                } else {
                    month = 11;
                    year = curYear - 1;
                }
            } else {
                month = curMonth;
                year = curYear;
            }

            const tmp = new Date();
            tmp.setFullYear(year, month, numberDay);
            const today = new Date();

            for(let r = 0; r < rows; r++) {
                for(let c = 0; c < cols; c++) {
                    const tmpDay = tmp.getDay();
                    const tmpNumber = tmp.getDate();
                    const tmpMonth = tmp.getMonth();
                    const tmpYear = tmp.getFullYear();
                    arrDays.push({
                        indexInWeek: tmpDay,
                        dayNumber: tmpNumber,
                        month: tmpMonth,
                        year: tmpYear,
                        isCurrentMonth: tmpMonth === curMonth,
                        selected: (_.isDate(this.selectedDate)) ?
                            (tmpNumber === this.selectedDate.getDate() && tmpMonth === this.selectedDate.getMonth() && tmpYear === this.selectedDate.getFullYear()) :
                            (tmpNumber === today.getDate() && tmpMonth === today.getMonth() && tmpYear === today.getFullYear())
                    });
                    tmp.setDate(tmpNumber + 1);
                }
            }

            if (!this.monthPicker) {
                this.monthPicker = new Common.UI.DataView({
                    el: this.cmpEl.find('.calendar-content'),
                    store: new Common.UI.DataViewStore(arrDays),
                    itemTemplate: _.template('<div class="number-day<% if (indexInWeek === 6 || indexInWeek === 0) { %> weekend<% } %><% if (!isCurrentMonth) { %> no-current-month<% } %>" data-number="<%= dayNumber %>" data-month="<%= month %>" data-year="<%= year %>"><%= dayNumber %></div>')
                });
                this.monthPicker.on('item:click', (picker, item, record, e) => {
                    const day = record.get('dayNumber');
                    const month = record.get('month');
                    const year = record.get('year');
                    if (_.isUndefined(this.selectedDate)) {
                        this.selectedDate = new Date();
                    }
                    this.selectedDate.setFullYear(year, month, day);
                    this.trigger('date:click', this, this.selectedDate);
                });
                this.enableKeyEvents && this.monthPicker.on('item:keydown', (view, record, e) => {
                    if (e.keyCode===Common.UI.Keys.ESC) {
                        Common.NotificationCenter.trigger('dataview:blur');
                    }
                });
            } else
                this.monthPicker.store.reset(arrDays);

            this.enableKeyEvents && _.delay(() => {
                this.monthPicker.focus();
            }, 10);
        },

        daysInMonth: (date) => {
            let d;
            d = date ? new Date(date) : new Date();
            const result = new Date();
            result.setFullYear(d.getFullYear(), d.getMonth() + 1, 0);
            return result.getDate();
        },

        setDate: function (date) {
            if (_.isDate(date)) {
                this.selectedDate = new Date(date);
                this.renderMonth(this.selectedDate);
            }
        },

        focus: function () {
            this.enableKeyEvents && this.monthPicker && _.delay(() => {
                this.monthPicker.focus();
            }, 10);
        },

        textJanuary: 'January',
        textFebruary: 'February',
        textMarch: 'March',
        textApril: 'April',
        textMay: 'May',
        textJune: 'June',
        textJuly: 'July',
        textAugust: 'August',
        textSeptember: 'September',
        textOctober: 'October',
        textNovember: 'November',
        textDecember: 'December',
        textShortJanuary: 'Jan',
        textShortFebruary: 'Feb',
        textShortMarch: 'Mar',
        textShortApril: 'Apr',
        textShortMay: 'May',
        textShortJune: 'Jun',
        textShortJuly: 'Jul',
        textShortAugust: 'Aug',
        textShortSeptember: 'Sep',
        textShortOctober: 'Oct',
        textShortNovember: 'Nov',
        textShortDecember: 'Dec',
        textShortSunday: 'Su',
        textShortMonday: 'Mo',
        textShortTuesday: 'Tu',
        textShortWednesday: 'We',
        textShortThursday: 'Th',
        textShortFriday: 'Fr',
        textShortSaturday: 'Sa',
        textMonths: 'Months',
        textYears: 'Years'
    }, Common.UI.Calendar || {}));
});