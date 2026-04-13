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

if (window.Common === undefined) {
  window.Common = {}
}

Common.Gateway = new (function () {
  const $me = $(this)

  const commandMap = {
    init: (data) => {
      $me.trigger("init", data)
    },

    openDocument: (data) => {
      $me.trigger("opendocument", data)
    },

    openDocumentFromBinary: (data) => {
      $me.trigger("opendocumentfrombinary", data)
    },

    showMessage: (data) => {
      $me.trigger("showmessage", data)
    },

    applyEditRights: (data) => {
      $me.trigger("applyeditrights", data)
    },

    processRightsChange: (data) => {
      $me.trigger("processrightschange", data)
    },

    refreshHistory: (data) => {
      $me.trigger("refreshhistory", data)
    },

    setHistoryData: (data) => {
      $me.trigger("sethistorydata", data)
    },

    setEmailAddresses: (data) => {
      $me.trigger("setemailaddresses", data)
    },

    setActionLink: (data) => {
      $me.trigger("setactionlink", data.url)
    },

    processMailMerge: (data) => {
      $me.trigger("processmailmerge", data)
    },

    downloadAs: (data) => {
      $me.trigger("downloadas", data)
    },

    processMouse: (data) => {
      $me.trigger("processmouse", data)
    },

    internalCommand: (data) => {
      $me.trigger("internalcommand", data)
    },

    resetFocus: (data) => {
      $me.trigger("resetfocus", data)
    },

    setUsers: (data) => {
      $me.trigger("setusers", data)
    },

    showSharingSettings: (data) => {
      $me.trigger("showsharingsettings", data)
    },

    setSharingSettings: (data) => {
      $me.trigger("setsharingsettings", data)
    },

    insertImage: (data) => {
      $me.trigger("insertimage", data)
    },

    setMailMergeRecipients: (data) => {
      $me.trigger("setmailmergerecipients", data)
    },

    setRevisedFile: (data) => {
      $me.trigger("setrevisedfile", data)
    },

    setFavorite: (data) => {
      $me.trigger("setfavorite", data)
    },

    requestClose: (data) => {
      $me.trigger("requestclose", data)
    },

    blurFocus: (data) => {
      $me.trigger("blurfocus", data)
    },

    grabFocus: (data) => {
      $me.trigger("grabfocus", data)
    },

    setReferenceData: (data) => {
      $me.trigger("setreferencedata", data)
    },

    refreshFile: (data) => {
      $me.trigger("refreshfile", data)
    },

    setRequestedDocument: (data) => {
      $me.trigger("setrequesteddocument", data)
    },

    setRequestedSpreadsheet: (data) => {
      $me.trigger("setrequestedspreadsheet", data)
    },

    setReferenceSource: (data) => {
      $me.trigger("setreferencesource", data)
    },

    startFilling: (data) => {
      $me.trigger("startfilling", data)
    },

    requestRoles: (data) => {
      $me.trigger("requestroles", data)
    },
  }

  const _postMessage = (msg, buffer) => {
    // TODO: specify explicit origin
    if (window.parent && window.JSON) {
      msg.frameEditorId = window.frameEditorId
      buffer
        ? window.parent.postMessage(msg, "*", [buffer])
        : window.parent.postMessage(window.JSON.stringify(msg), "*")
    }
  }

  const _onMessage = function (msg) {
    // TODO: check message origin
    if (
      msg.origin !== window.parentOrigin &&
      msg.origin !== window.location.origin &&
      !(
        msg.origin === "null" &&
        (window.parentOrigin === "file://" || window.location.origin === "file://")
      )
    )
      return

    const data = msg.data
    if (data && data.command === "openDocumentFromBinary") {
      handler = commandMap[data.command]
      if (handler) {
        handler.call(this, data.data)
      }
      return
    }

    if (Object.prototype.toString.apply(data) !== "[object String]" || !window.JSON) {
      return
    }

    let cmd
    let handler

    try {
      cmd = window.JSON.parse(data)
    } catch (e) {
      cmd = ""
    }

    if (cmd) {
      handler = commandMap[cmd.command]
      if (handler) {
        handler.call(this, cmd.data)
      }
    }
  }

  const fn = (e) => {
    _onMessage(e)
  }

  if (window.attachEvent) {
    window.attachEvent("onmessage", fn)
  } else {
    window.addEventListener("message", fn, false)
  }

  return {
    appReady: () => {
      _postMessage({ event: "onAppReady" })
    },

    requestEditRights: () => {
      _postMessage({ event: "onRequestEditRights" })
    },

    requestHistory: () => {
      _postMessage({ event: "onRequestHistory" })
    },

    requestHistoryData: (revision) => {
      _postMessage({
        event: "onRequestHistoryData",
        data: revision,
      })
    },

    requestRestore: (version, url, fileType) => {
      _postMessage({
        event: "onRequestRestore",
        data: {
          version: version,
          url: url,
          fileType: fileType,
        },
      })
    },

    requestEmailAddresses: () => {
      _postMessage({ event: "onRequestEmailAddresses" })
    },

    requestStartMailMerge: () => {
      _postMessage({ event: "onRequestStartMailMerge" })
    },

    requestHistoryClose: (revision) => {
      _postMessage({ event: "onRequestHistoryClose" })
    },

    reportError: (code, description) => {
      _postMessage({
        event: "onError",
        data: {
          errorCode: code,
          errorDescription: description,
        },
      })
    },

    reportWarning: (code, description) => {
      _postMessage({
        event: "onWarning",
        data: {
          warningCode: code,
          warningDescription: description,
        },
      })
    },

    sendInfo: (info) => {
      _postMessage({
        event: "onInfo",
        data: info,
      })
    },

    setDocumentModified: (modified) => {
      _postMessage({
        event: "onDocumentStateChange",
        data: modified,
      })
    },

    internalMessage: (type, data) => {
      _postMessage({
        event: "onInternalMessage",
        data: {
          type: type,
          data: data,
        },
      })
    },

    updateVersion: () => {
      _postMessage({ event: "onOutdatedVersion" })
    },

    downloadAs: (url, fileType) => {
      _postMessage({
        event: "onDownloadAs",
        data: {
          url: url,
          fileType: fileType,
        },
      })
    },

    requestSaveAs: (url, title, fileType) => {
      _postMessage({
        event: "onRequestSaveAs",
        data: {
          url: url,
          title: title,
          fileType: fileType,
        },
      })
    },

    collaborativeChanges: () => {
      _postMessage({ event: "onCollaborativeChanges" })
    },

    requestRename: (title) => {
      _postMessage({ event: "onRequestRename", data: title })
    },

    metaChange: (meta) => {
      _postMessage({ event: "onMetaChange", data: meta })
    },

    documentReady: () => {
      _postMessage({ event: "onDocumentReady" })
    },

    requestClose: () => {
      _postMessage({ event: "onRequestClose" })
    },

    requestMakeActionLink: (config) => {
      _postMessage({ event: "onMakeActionLink", data: config })
    },

    requestUsers: (command, id, from, count, search) => {
      // from, count, search are used for mentions
      _postMessage({
        event: "onRequestUsers",
        data: { c: command, id: id, from: from, count: count, search: search },
      })
    },

    requestSendNotify: (emails) => {
      _postMessage({ event: "onRequestSendNotify", data: emails })
    },

    requestInsertImage: (command) => {
      _postMessage({ event: "onRequestInsertImage", data: { c: command } })
    },

    requestMailMergeRecipients: () => {
      _postMessage({ event: "onRequestMailMergeRecipients" })
    },

    requestCompareFile: () => {
      _postMessage({ event: "onRequestCompareFile" })
    },

    requestSharingSettings: () => {
      _postMessage({ event: "onRequestSharingSettings" })
    },

    requestCreateNew: () => {
      _postMessage({ event: "onRequestCreateNew" })
    },

    requestReferenceData: (data) => {
      _postMessage({ event: "onRequestReferenceData", data: data })
    },

    requestOpen: (data) => {
      _postMessage({ event: "onRequestOpen", data: data })
    },

    requestSelectDocument: (command) => {
      _postMessage({ event: "onRequestSelectDocument", data: { c: command } })
    },

    requestSelectSpreadsheet: (command) => {
      _postMessage({ event: "onRequestSelectSpreadsheet", data: { c: command } })
    },

    requestReferenceSource: () => {
      _postMessage({ event: "onRequestReferenceSource" })
    },

    requestStartFilling: (roles) => {
      _postMessage({
        event: "onRequestStartFilling",
        data: roles,
      })
    },

    switchEditorType: (value, restart) => {
      _postMessage({ event: "onSwitchEditorType", data: { type: value, restart: restart } })
    },

    startFilling: () => {
      _postMessage({ event: "onStartFilling" })
    },

    requestFillingStatus: (role) => {
      _postMessage({
        event: "onRequestFillingStatus",
        data: role,
      })
    },

    pluginsReady: () => {
      _postMessage({ event: "onPluginsReady" })
    },

    requestRefreshFile: () => {
      _postMessage({ event: "onRequestRefreshFile" })
    },

    userActionRequired: () => {
      _postMessage({ event: "onUserActionRequired" })
    },

    saveDocument: (data) => {
      data &&
        _postMessage(
          {
            event: "onSaveDocument",
            data: data.buffer,
          },
          data.buffer,
        )
    },

    submitForm: () => {
      _postMessage({ event: "onSubmit" })
    },

    on: (event, handler) => {
      const localHandler = (event, data) => {
        handler.call(this, data)
      }

      $me.on(event, localHandler)
    },
  }
})()
