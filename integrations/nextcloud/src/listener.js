/**
 *
 * (c) Copyright Ascensio System SIA 2026
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms of the GNU Affero General Public License
 * (AGPL) version 3 as published by the Free Software Foundation.
 * In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * For details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * The interactive user interfaces in modified source and object code versions of the Program
 * must display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical
 * writing content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0 International.
 * See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */

/* global _, $ */

/**
 * @param {object} OCA Nextcloud OCA object
 */
(function(OCA) {

	OCA.WorldOffice = _.extend({
		AppName: 'world-office',
		frameSelector: null,
		titleBase: window.document.title,
		favIconBase: $('link[rel="icon"]').attr('href'),
	}, OCA.WorldOffice)

	OCA.WorldOffice.onRequestClose = function() {

		$(OCA.WorldOffice.frameSelector).remove()

		if (OCA.Viewer && OCA.Viewer.close) {
			OCA.Viewer.close()
		}

		if (OCA.WorldOffice.CloseEditor) {
			OCA.WorldOffice.CloseEditor()
		}
	}

	OCA.WorldOffice.onRequestSaveAs = function(saveData) {

		OC.dialogs.filepicker(t(OCA.WorldOffice.AppName, 'Save as'),
			function(fileDir) {
				saveData.dir = fileDir
				$(OCA.WorldOffice.frameSelector)[0].contentWindow.OCA.WorldOffice.editorSaveAs(saveData)
			},
			false,
			'httpd/unix-directory',
			true,
			OC.dialogs.FILEPICKER_TYPE_CHOOSE,
			saveData.dir)
	}

	OCA.WorldOffice.onRequestInsertImage = function(imageMimes) {
		OC.dialogs.filepicker(t(OCA.WorldOffice.AppName, 'Insert image'),
			$(OCA.WorldOffice.frameSelector)[0].contentWindow.OCA.WorldOffice.editorInsertImage,
			false,
			imageMimes,
			true)
	}

	OCA.WorldOffice.onRequestMailMergeRecipients = function(recipientMimes) {
		OC.dialogs.filepicker(t(OCA.WorldOffice.AppName, 'Select recipients'),
			$(OCA.WorldOffice.frameSelector)[0].contentWindow.OCA.WorldOffice.editorSetRecipient,
			false,
			recipientMimes,
			true)
	}

	OCA.WorldOffice.onRequestSelectDocument = function(revisedMimes, documentSelectionType) {
		let title
		switch (documentSelectionType) {
		case 'combine':
			title = t(OCA.WorldOffice.AppName, 'Select file to combine')
			break
		case 'compare':
			title = t(OCA.WorldOffice.AppName, 'Select file to compare')
			break
		case 'insert-text':
			title = t(OCA.WorldOffice.AppName, 'Select file to insert text')
			break
		default:
			title = t(OCA.WorldOffice.AppName, 'Select file')
		}
		OC.dialogs.filepicker(title,
			$(OCA.WorldOffice.frameSelector)[0].contentWindow.OCA.WorldOffice.editorSetRequested.bind({ documentSelectionType }),
			false,
			revisedMimes,
			true)
	}

	OCA.WorldOffice.onRequestReferenceSource = function(referenceSourceMimes) {
		OC.dialogs.filepicker(t(OCA.WorldOffice.AppName, 'Select data source'),
			$(OCA.WorldOffice.frameSelector)[0].contentWindow.OCA.WorldOffice.editorReferenceSource,
			false,
			referenceSourceMimes,
			true)
	}

	OCA.WorldOffice.onDocumentReady = function() {
		OCA.WorldOffice.setViewport()
	}

	OCA.WorldOffice.changeFavicon = function(favicon) {
		$('link[rel="icon"]').attr('href', favicon)
	}

	OCA.WorldOffice.setViewport = function() {
		document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0')
	}

	OCA.WorldOffice.onShowMessage = function(messageObj) {
		switch (messageObj.type) {
		case 'success':
			OCP.Toast.success(messageObj.message, messageObj.props)
			break
		case 'error':
			OCP.Toast.error(messageObj.message, messageObj.props)
			break
		}
	}

	window.addEventListener('message', function(event) {
		if (!$(OCA.WorldOffice.frameSelector).length
			|| $(OCA.WorldOffice.frameSelector)[0].contentWindow !== event.source
			|| !event.data.method) {
			return
		}
		switch (event.data.method) {
		case 'editorRequestClose':
			OCA.WorldOffice.onRequestClose()
			break
		case 'editorRequestSharingSettings':
			if (OCA.WorldOffice.OpenShareDialog) {
				OCA.WorldOffice.OpenShareDialog()
			}
			break
		case 'onRefreshVersionsDialog':
			if (OCA.WorldOffice.RefreshVersionsDialog) {
				OCA.WorldOffice.RefreshVersionsDialog()
			}
			break
		case 'editorRequestSaveAs':
			OCA.WorldOffice.onRequestSaveAs(event.data.param)
			break
		case 'editorRequestInsertImage':
			OCA.WorldOffice.onRequestInsertImage(event.data.param)
			break
		case 'editorRequestMailMergeRecipients':
			OCA.WorldOffice.onRequestMailMergeRecipients(event.data.param)
			break
		case 'editorRequestSelectDocument':
			OCA.WorldOffice.onRequestSelectDocument(event.data.param, event.data.documentSelectionType)
			break
		case 'editorRequestReferenceSource':
			OCA.WorldOffice.onRequestReferenceSource(event.data.param)
			break
		case 'onDocumentReady':
			OCA.WorldOffice.onDocumentReady(event.data.param)
			break
		case 'changeFavicon':
			OCA.WorldOffice.changeFavicon(event.data.param)
			break
		case 'onShowMessage':
			OCA.WorldOffice.onShowMessage(event.data.param)
			break
		}
	}, false)

	window.addEventListener('popstate', function(event) {
		if ($(OCA.WorldOffice.frameSelector).length) {
			OCA.WorldOffice.onRequestClose()
		}
	})

	const mutationObserver = new MutationObserver(mutationRecords => {
		if (mutationRecords[0] && mutationRecords[0].removedNodes) {
			mutationRecords[0].removedNodes.forEach((node) => {
				if (node.id && '#' + node.id === OCA.WorldOffice.frameSelector) {
					OCA.WorldOffice.changeFavicon(OCA.WorldOffice.favIconBase)
					window.document.title = OCA.WorldOffice.titleBase
					OCA.WorldOffice.frameSelector = null
				}
			  })
		}
	  })

	mutationObserver.observe(document.querySelector('body'), {
		childList: true,
		subtree: true,
		characterDataOldValue: true,
	  })

})(OCA)
