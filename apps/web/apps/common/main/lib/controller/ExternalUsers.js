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
 *    ExternalUsers.js
 *
 *    Created on 02 February 2023
 *
 */
if (Common === undefined)
    const Common = {};

if (Common.UI === undefined) {
    Common.UI = {};
}

Common.UI.ExternalUsers = new( function() {
    let externalUsers = [];
    let isUsersLoading = false;
    let externalUsersInfo = [];
    let isUsersInfoLoading = false;
    const stackUsersInfoResponse = [];
    let requestedUsersInfo = [];
    let api;
    const userColors = [];

    const _get = (type, ids, from, count, search) => {
        if (type==='info') {
            (typeof ids !== 'object') && (ids = [ids]);
            ids && (ids = _.uniq(ids));
            ids = _.difference(ids, requestedUsersInfo);
            requestedUsersInfo = requestedUsersInfo.concat(ids);
            if (ids.length>100) {
                while (ids.length>0) {
                    Common.Gateway.requestUsers('info', ids.splice(0, 100));
                }
            } else if (ids.length>0)
                Common.Gateway.requestUsers('info', ids);
        } else {
            if (isUsersLoading) return;

            type = type || 'mention';
            if (externalUsers[type]===undefined) {
                isUsersLoading = true;
                Common.Gateway.requestUsers(type || 'mention', undefined, from || 0, count || 100, search || '');
            } else {
                Common.NotificationCenter.trigger('mentions:setusers', type, externalUsers[type]);
            }
        }
    };

    const _getImage = (id, request) => {
        let image
        const user = _.findWhere(externalUsersInfo, {id: id})
        user && (image = user.image);
        request && (image===undefined) && _get('info', [id]);
        return image;
    };

    const _setImage = (id, image) => {
        const user = _.findWhere(externalUsersInfo, {id: id})
        user ? (user.image = image) : externalUsersInfo.push({id: id, image: image});
    };

    const _onUsersInfo = (data) => {
        if (data.c !== 'info') return;

        if (isUsersInfoLoading) {
            stackUsersInfoResponse.push(data);
            return;
        }

        isUsersInfoLoading = true;

        const append = [];
        data.users && _.each(data.users, (item) => {
            const user = _.findWhere(externalUsersInfo, {id: item.id});
            if (user) {
                user.image = item.image;
                user.name = item.name;
                user.email = item.email;
            } else
                append.push(item);
        });
        externalUsersInfo = externalUsersInfo.concat(append);
        Common.NotificationCenter.trigger('mentions:setusers', data.c, data.users);
        isUsersInfoLoading = false;
        if (stackUsersInfoResponse.length>0)
            _onUsersInfo(stackUsersInfoResponse.shift());
    };

    const _init = (canRequestUsers, _api) => {
        Common.Gateway.on('setusers', _onUsersInfo);
        api = _api;
        if (!canRequestUsers) return;

        Common.Gateway.on('setusers', (data) => {
            if (data.c === 'info') return;
            if (data.users===null) {// clear user lists
                externalUsers = [];
                return;
            }
            const type = data.c || 'mention';
            const users = data.users || [];
            if (data.isPaginated===undefined) // use old scheme
                externalUsers[type] = users;
            isUsersLoading = false;
            Common.NotificationCenter.trigger('mentions:setusers', type, users, data.isPaginated);
        });

        Common.NotificationCenter.on('mentions:clearusers',   (type) => {
            if (type !== 'info')
                externalUsers[type || 'mention'] = undefined;
        });
    };

    const _getColor = (id, intValue) => {
        if (!userColors[id]) {
            const color = api.asc_getUserColorById(id);
            userColors[id] = [`#${(`000000${color.toString(16)}`).substr(-6)}`, color];
        }

        return intValue ? userColors[id][1] : userColors[id][0];
    };

    return {
        init: _init,
        get: _get,
        getImage: _getImage,
        setImage: _setImage,
        getColor: _getColor
    }
})();
