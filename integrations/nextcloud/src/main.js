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

/* eslint-disable import/no-unresolved */

/* global _, $, _oc_appswebroots */

import {
	File,
	FileAction,
	registerFileAction,
	Permission,
	DefaultType,
	addNewFileMenuEntry,
	davGetClient,
	davRootPath,
	davGetDefaultPropfind,
	davResultToNode,
} from '@nextcloud/files'
import { emit } from '@nextcloud/event-bus'
import AppDarkSvg from '../img/app-dark.svg?raw'
import NewDocxSvg from '../img/new-docx.svg?raw'
import NewXlsxSvg from '../img/new-xlsx.svg?raw'
import NewPptxSvg from '../img/new-pptx.svg?raw'
import NewPdfSvg from '../img/new-pdf.svg?raw'
import { isPublicShare, getSharingToken } from '@nextcloud/sharing/public'
import { loadState } from '@nextcloud/initial-state'

/**
 * @param {object} OCA Nextcloud OCA object
 */
(function(OCA) {

	OCA.WorldOffice = _.extend({
		AppName: 'world-office',
		context: null,
		frameSelector: null,
	}, OCA.WorldOffice)

	OCA.WorldOffice.setting = OCP.InitialState.loadState(OCA.WorldOffice.AppName, 'settings')
	OCA.WorldOffice.mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini|Macintosh/i.test(navigator.userAgent)
							&& navigator.maxTouchPoints && navigator.maxTouchPoints > 1

	OCA.WorldOffice.CreateFile = function(name, fileList, templateId, targetId, open = true) {
		const dir = fileList.getCurrentDirectory()

		OCA.WorldOffice.CreateFileProcess(name, dir, templateId, targetId, open, (response) => {
			fileList.add(response, { animate: true })
		})
	}

	OCA.WorldOffice.CreateFileOverload = function(name, context, templateId, targetId, open = true, filesContext = null) {
		if (!context.view) {
			context.view = OCP.Files.Router._router.app.currentView
		}

		OCA.WorldOffice.CreateFileProcess(name, context.dir, templateId, targetId, open, async (response) => {
			if (!context.view && filesContext !== null) {
				const file = new File({
					source: filesContext.source + '/' + response.name,
					id: response.id,
					mtime: new Date(),
					mime: response.mimetype,
					name: response.name,
					owner: OC.getCurrentUser().uid || null,
					permissions: Permission.ALL,
					type: 'file',
					root: filesContext?.root || '/files/' + OC.getCurrentUser().uid,
				})
				emit('files:node:created', file)
			} else {
				const viewContents = await context.view.getContents(context.dir)
				if (viewContents.folder && (viewContents.folder.fileid === response.parentId)) {
					const newFile = viewContents.contents.find(node => node.fileid === response.id)
					if (newFile) emit('files:node:created', newFile)
				}
			}
		})
	}

	OCA.WorldOffice.CreateFileProcess = function(name, dir, templateId, targetId, open, callback) {
		let winEditor = null
		if (((!OCA.WorldOffice.setting.sameTab && !OCA.WorldOffice.setting.enableSharing) || OCA.WorldOffice.mobile || OCA.WorldOffice.Desktop) && open) {
			const loaderUrl = OCA.WorldOffice.Desktop ? '' : OC.filePath(OCA.WorldOffice.AppName, 'templates', 'loader.html')
			winEditor = window.open(loaderUrl)
		}

		const createData = {
			name,
			dir,
		}

		if (templateId) {
			createData.templateId = templateId
		}

		if (targetId) {
			createData.targetId = targetId
		}

		if (isPublicShare()) {
			createData.shareToken = encodeURIComponent(getSharingToken())
		}

		$.post(OC.generateUrl('apps/' + OCA.WorldOffice.AppName + '/ajax/new'),
			createData,
			function onSuccess(response) {
				if (response.error) {
					if (winEditor) {
						winEditor.close()
					}
					OCP.Toast.error(response.error)
					return
				}

				callback(response)

				if (open) {
					const fileName = response.name
					OCA.WorldOffice.OpenEditor(response.id, dir, fileName, winEditor)

					OCA.WorldOffice.context = {
						fileName: response.name,
						dir,
					}
				}

				OCP.Toast.success(t(OCA.WorldOffice.AppName, 'File created'))
			},
		)
	}

	OCA.WorldOffice.OpenEditor = function(fileId, fileDir, fileName, winEditor, isDefault = true) {
		let filePath = ''
		if (fileName) {
			filePath = fileDir.replace(/\/$/, '') + '/' + fileName
		}
		let url = OC.generateUrl('/apps/' + OCA.WorldOffice.AppName + '/{fileId}?filePath={filePath}',
			{
				fileId,
				filePath,
			})

		if (isPublicShare()) {
			url = OC.generateUrl('apps/' + OCA.WorldOffice.AppName + '/s/{shareToken}?fileId={fileId}',
				{
					shareToken: encodeURIComponent(getSharingToken()),
					fileId,
				})
		}

		if (winEditor && winEditor.location) {
			OCA.WorldOffice.SetDefaultUrl()
			winEditor.location.href = url
		} else if ((!OCA.WorldOffice.setting.sameTab && !OCA.WorldOffice.setting.enableSharing)
			|| OCA.WorldOffice.mobile || OCA.WorldOffice.Desktop || (isPublicShare() && !OCA.WorldOffice.isViewIsFile()
			&& !OCA.WorldOffice.setting.sameTab && OCA.WorldOffice.setting.enableSharing)
			|| (!OCA.WorldOffice.setting.sameTab && !isDefault)) {
			OCA.WorldOffice.SetDefaultUrl()
			winEditor = window.open(url, '_blank')
		} else {
			if (OCA.WorldOffice.setting.enableSharing
				&& !isPublicShare()
				&& (window.OCP?.Files?.Router?.query?.openfile === undefined || window.OCP?.Files?.Router?.query?.openfile === 'false'
					|| window.OCP?.Files?.Router?.query?.enableSharing === undefined
				)) {
				window.OCP?.Files?.Router?.goToRoute(
					null, // use default route
					{ view: 'files', fileid: fileId },
					{ ...OCP.Files.Router.query, openfile: 'true', enableSharing: 'true' },
				)
				url = window.location.href
				OCA.WorldOffice.SetDefaultUrl()
				window.open(url, '_blank')
				return
			}
			OCA.WorldOffice.frameSelector = '#world-officeFrame'
			const $iframe = $('<div class="world-office-iframe-container"><iframe id="world-officeFrame" nonce="' + btoa(OC.requestToken) + '" scrolling="no" allowfullscreen src="' + url + '&inframe=true" /></div>')

			const frameContainer = $('#app-content').length > 0 ? $('#app-content') : $('#app-content-vue')
			frameContainer.append($iframe)

			$('body').addClass('world-office-inline')

			if (OCA.Files.Sidebar) {
				OCA.Files.Sidebar.close()
			}

			const scrollTop = $('#app-content').scrollTop()
			$(OCA.WorldOffice.frameSelector).css('top', scrollTop)

			const currentQuery = { ...OCP.Files.Router.query }
			if (isDefault) {
				currentQuery.openfile = 'true'
			} else {
				delete currentQuery.openfile
			}

			window.OCP?.Files?.Router?.goToRoute(
				null, // use default route
				{ view: 'files', fileid: fileId },
				currentQuery,
			)
		}
	}

	OCA.WorldOffice.CloseEditor = function() {
		$('body').removeClass('world-office-inline')

		const iframeContainer = document.querySelector('.world-office-iframe-container')
		if (iframeContainer !== null) {
			iframeContainer.remove()
		}

		OCA.WorldOffice.context = null

		OCA.WorldOffice.SetDefaultUrl()
	}

	OCA.WorldOffice.SetDefaultUrl = function() {
		// eslint-disable-next-line no-unused-vars
		const { openfile, enableSharing, ...query } = OCP.Files.Router.query
		window.OCP?.Files?.Router?.goToRoute(
			null, // use default route
			{ view: 'files', fileid: undefined },
			query,
		)
	}

	OCA.WorldOffice.OpenShareDialog = function() {
		if (OCA.WorldOffice.context) {
			if (!$('#app-sidebar-vue').is(':visible')) {
				OCA.Files.Sidebar.open(OCA.WorldOffice.context.dir + '/' + OCA.WorldOffice.context.fileName)
				OCA.Files.Sidebar.setActiveTab('sharing')
			} else {
				OCA.Files.Sidebar.close()
			}
		}
	}

	OCA.WorldOffice.RefreshVersionsDialog = function() {
		if (OCA.WorldOffice.context) {
			if ($('#app-sidebar-vue').is(':visible')) {
				OCA.Files.Sidebar.close()
				OCA.Files.Sidebar.open(OCA.WorldOffice.context.dir + '/' + OCA.WorldOffice.context.fileName)
				OCA.Files.Sidebar.setActiveTab('versionsTabView')
			}
		}
	}

	OCA.WorldOffice.FileClick = function(fileName, context) {
		const fileInfoModel = context.fileInfoModel || context.fileList.getModelForFile(fileName)
		const fileId = context.fileId || (context.$file && context.$file[0].dataset.id) || fileInfoModel.id
		const winEditor = !fileInfoModel && !OCA.WorldOffice.setting.sameTab ? document : null

		OCA.WorldOffice.OpenEditor(fileId, context.dir, fileName, winEditor)

		OCA.WorldOffice.context = context
		OCA.WorldOffice.context.fileName = fileName
	}

	OCA.WorldOffice.FileClickExec = async function(file, view, dir, isDefault = true) {
		if (OCA.WorldOffice.context !== null
			&& document.querySelector('.world-office-iframe-container')
			&& !OCA.WorldOffice.Desktop) {
			return null
		}

		OCA.WorldOffice.OpenEditor(file.fileid, dir, file.basename, 0, isDefault)

		OCA.WorldOffice.context = {
			fileName: file.basename,
			dir,
		}

		return null
	}

	OCA.WorldOffice.FileConvertClick = function(fileName, context) {
		const fileInfoModel = context.fileInfoModel || context.fileList.getModelForFile(fileName)
		const fileList = context.fileList
		const fileId = context.$file ? context.$file[0].dataset.id : fileInfoModel.id

		OCA.WorldOffice.FileConvert(fileId, (response) => {
			if (response.parentId === fileList.dirInfo.id) {
				fileList.add(response, { animate: true })
			}
		})
	}

	OCA.WorldOffice.FileConvertClickExec = async function(file, view, dir) {
		OCA.WorldOffice.FileConvert(file.fileid, async (response) => {
			const viewContents = await view.getContents(dir)

			if (viewContents.folder && (viewContents.folder.fileid === response.parentId)) {
				const newFile = viewContents.contents.find(node => node.fileid === response.id)
				if (newFile) emit('files:node:created', newFile)
			}
		})

		return null
	}

	OCA.WorldOffice.FileConvert = function(fileId, callback) {
		const convertData = {
			fileId,
		}

		if (isPublicShare()) {
			convertData.shareToken = encodeURIComponent(getSharingToken())
		}

		$.post(OC.generateUrl('apps/' + OCA.WorldOffice.AppName + '/ajax/convert'),
			convertData,
			function onSuccess(response) {
				if (response.error) {
					OCP.Toast.error(response.error)
					return
				}

				callback(response)

				OCP.Toast.success(t(OCA.WorldOffice.AppName, 'File has been converted. Its content might look different.'))
			})
	}

	OCA.WorldOffice.DownloadClick = function(fileName, context) {
		const fileId = context.fileInfoModel.id

		OCA.WorldOffice.Download(fileName, fileId)
	}

	OCA.WorldOffice.DownloadClickExec = async function(file) {
		OCA.WorldOffice.Download(file.basename, file.fileid)

		return null
	}

	OCA.WorldOffice.Download = function(fileName, fileId) {
		$.get(OC.filePath(OCA.WorldOffice.AppName, 'templates', 'downloadPicker.html'),
			function(tmpl) {
				const dialog = $(tmpl).octemplate({
					dialog_name: 'download-picker',
					dialog_title: t('world-office', 'Download as'),
				})

				$(dialog[0].querySelectorAll('p')).text(t(OCA.WorldOffice.AppName, 'Choose a format to convert {fileName}', { fileName }))

				const extension = OCA.WorldOffice.getFileExtension(fileName)
				const selectNode = dialog[0].querySelectorAll('select')[0]
				const optionNodeOrigin = selectNode.querySelectorAll('option')[0]

				$(optionNodeOrigin).attr('data-value', extension)
				$(optionNodeOrigin).text(t(OCA.WorldOffice.AppName, 'Origin format'))

				dialog[0].dataset.format = extension
				selectNode.onchange = function() {
					dialog[0].dataset.format = $('#world-office-download-select option:selected').attr('data-value')
				}

				OCA.WorldOffice.setting.formats[extension].saveas.forEach(ext => {
					const optionNode = optionNodeOrigin.cloneNode(true)

					$(optionNode).attr('data-value', ext)
					$(optionNode).text(ext)

					selectNode.append(optionNode)
				})

				$('body').append(dialog)

				$('#download-picker').ocdialog({
					closeOnEscape: true,
					modal: true,
					buttons: [{
						text: t('core', 'Cancel'),
						classes: 'cancel',
						click() {
							$(this).ocdialog('close')
						},
					}, {
						text: t('world-office', 'Download'),
						classes: 'primary',
						click() {
							const format = this.dataset.format
							const downloadLink = OC.generateUrl('apps/' + OCA.WorldOffice.AppName + '/downloadas?fileId={fileId}&toExtension={toExtension}', {
								fileId,
								toExtension: format,
							})

							location.href = downloadLink
							$(this).ocdialog('close')
						},
					}],
				})
			})
	}

	OCA.WorldOffice.OpenFormPicker = function(name, filelist, filesContext = null) {
		const filterMimes = [
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		]

		const buttons = [
			{
				text: t(OCA.WorldOffice.AppName, 'Blank'),
				type: 'blank',
			},
			{
				text: t(OCA.WorldOffice.AppName, 'From text document'),
				type: 'target',
				defaultButton: true,
			},
		]

		OC.dialogs.filepicker(t(OCA.WorldOffice.AppName, 'Create new PDF form'),
			async function(filePath, type) {
				let dialogFileList = OC.dialogs.filelist
				let targetId = 0

				const targetFileName = OC.basename(filePath)
				const targetFolderPath = OC.dirname(filePath)

				if (!dialogFileList) {
					const results = await davGetClient().getDirectoryContents(davRootPath + targetFolderPath, {
						details: true,
						data: davGetDefaultPropfind(),
					})
					dialogFileList = results.data.map((result) => davResultToNode(result))
				}

				if (type === 'target') {
					dialogFileList.forEach(item => {
						const itemName = item.name ? item.name : item.basename
						if (itemName === targetFileName) {
							targetId = item.id ? item.id : item.fileid
						}
					})
				}
				if (filelist.getCurrentDirectory) {
					OCA.WorldOffice.CreateFile(name, filelist, 0, targetId)
				} else {
					OCA.WorldOffice.CreateFileOverload(name, filelist, 0, targetId, true, filesContext)
				}
			},
			false,
			filterMimes,
			true,
			OC.dialogs.FILEPICKER_TYPE_CUSTOM,
			filelist.getCurrentDirectory ? filelist.getCurrentDirectory() : filelist.dir,
			{
				buttons,
			})
	}

	OCA.WorldOffice.CreateFormClick = function(fileName, context) {
		const fileList = context.fileList
		const name = fileName.replace(/\.[^.]+$/, '.pdf')
		const targetId = context.fileInfoModel.id

		OCA.WorldOffice.CreateFile(name, fileList, 0, targetId, false)
	}

	OCA.WorldOffice.CreateFormClickExec = async function(file, view, dir) {
		const name = file.basename.replace(/\.[^.]+$/, '.pdf')
		const context = {
			dir,
			view,
		}

		OCA.WorldOffice.CreateFileOverload(name, context, 0, file.fileid, false)

		return null
	}

	OCA.WorldOffice.registerAction = function() {
		const formats = OCA.WorldOffice.setting.formats

		const getConfig = function(file) {
			const fileExt = file?.extension?.toLowerCase()?.replace('.', '')
			const config = formats[fileExt]

			return config
		}

		if (OCA.Files && OCA.Files.fileActions) {
			$.each(formats, function(ext, config) {
				if (!config.mime) {
					return true
				}

				const mimeTypes = config.mime
				mimeTypes.forEach((mime) => {
					OCA.Files.fileActions.registerAction({
						name: 'world-officeOpen',
						displayName: t(OCA.WorldOffice.AppName, 'Open in word-office'),
						mime,
						permissions: OC.PERMISSION_READ,
						iconClass: 'icon-world-office-open',
						actionHandler: OCA.WorldOffice.FileClick,
					})

					if (config.def) {
						OCA.Files.fileActions.setDefault(mime, 'world-officeOpen')
					}

					if (config.conv) {
						OCA.Files.fileActions.registerAction({
							name: 'world-officeConvert',
							displayName: t(OCA.WorldOffice.AppName, 'Convert with word-office'),
							mime,
							permissions: (isPublicShare() ? OC.PERMISSION_UPDATE : OC.PERMISSION_READ),
							iconClass: 'icon-world-office-convert',
							actionHandler: OCA.WorldOffice.FileConvertClick,
						})
					}

					if (config.createForm) {
						OCA.Files.fileActions.registerAction({
							name: 'world-officeCreateForm',
							displayName: t(OCA.WorldOffice.AppName, 'Create form'),
							mime,
							permissions: (isPublicShare() ? OC.PERMISSION_UPDATE : OC.PERMISSION_READ),
							iconClass: 'icon-world-office-create',
							actionHandler: OCA.WorldOffice.CreateFormClick,
						})
					}

					if (config.saveas && !isPublicShare() && !OCA.WorldOffice.setting.disableDownload) {
						OCA.Files.fileActions.registerAction({
							name: 'world-officeDownload',
							displayName: t(OCA.WorldOffice.AppName, 'Download as'),
							mime,
							permissions: OC.PERMISSION_READ,
							iconClass: 'icon-world-office-download',
							actionHandler: OCA.WorldOffice.DownloadClick,
						})
					}
				})
			})
		} else {
			registerFileAction(new FileAction({
				id: 'world-office-open-def',
				displayName: () => t(OCA.WorldOffice.AppName, 'Open in word-office'),
				iconSvgInline: () => AppDarkSvg,
				enabled: (files) => {
					const config = getConfig(files[0])

					if (!config) return false
					if (!config.def) return false

					if (Permission.READ !== (files[0].permissions & Permission.READ)) { return false }

					return true
				},
				exec: OCA.WorldOffice.FileClickExec,
				default: DefaultType.HIDDEN,
				order: -1,
			}))

			registerFileAction(new FileAction({
				id: 'world-office-open',
				displayName: () => t(OCA.WorldOffice.AppName, 'Open in word-office'),
				iconSvgInline: () => AppDarkSvg,
				enabled: (files) => {
					const config = getConfig(files[0])

					if (!config) return false
					if (config.def) return false

					if (Permission.READ !== (files[0].permissions & Permission.READ)) { return false }

					return true
				},
				exec(file, view, dir) {
					OCA.WorldOffice.FileClickExec(file, view, dir, false)
				},
			}))

			registerFileAction(new FileAction({
				id: 'world-office-convert',
				displayName: () => t(OCA.WorldOffice.AppName, 'Convert with word-office'),
				iconSvgInline: () => AppDarkSvg,
				enabled: (files) => {
					const config = getConfig(files[0])

					if (!config) return false
					if (!config.conv) return false

					const required = isPublicShare() ? Permission.UPDATE : Permission.READ
					if (required !== (files[0].permissions & required)) { return false }

					if (files[0].attributes['mount-type'] === 'shared') {
						if (required !== (files[0].attributes['share-permissions'] & required)) { return false }

						const attributes = JSON.parse(files[0].attributes['share-attributes'])
						const downloadAttribute = attributes.find((attribute) => attribute.scope === 'permissions' && attribute.key === 'download')
						if (downloadAttribute !== undefined && downloadAttribute.enabled === false) { return false }
					}

					return true
				},
				exec: OCA.WorldOffice.FileConvertClickExec,
			}))

			registerFileAction(new FileAction({
				id: 'world-office-create-form',
				displayName: () => t(OCA.WorldOffice.AppName, 'Create form'),
				iconSvgInline: () => AppDarkSvg,
				enabled: (files) => {
					const config = getConfig(files[0])

					if (!config) return false
					if (!config.createForm) return false

					const required = isPublicShare() ? Permission.UPDATE : Permission.READ
					if (required !== (files[0].permissions & required)) { return false }

					if (files[0].attributes['mount-type'] === 'shared') {
						if (required !== (files[0].attributes['share-permissions'] & required)) { return false }

						const attributes = JSON.parse(files[0].attributes['share-attributes'])
						const downloadAttribute = attributes.find((attribute) => attribute.scope === 'permissions' && attribute.key === 'download')
						if (downloadAttribute !== undefined && downloadAttribute.enabled === false) { return false }
					}

					return true
				},
				exec: OCA.WorldOffice.CreateFormClickExec,
			}))

			if (!isPublicShare()) {
				registerFileAction(new FileAction({
					id: 'world-office-download-as',
					displayName: () => t(OCA.WorldOffice.AppName, 'Download as'),
					iconSvgInline: () => AppDarkSvg,
					enabled: (files) => {
						if (OCA.WorldOffice.setting.disableDownload) {
							return false
						}
						const config = getConfig(files[0])

						if (!config) return false
						if (!config.saveas) return false

						if (Permission.READ !== (files[0].permissions & Permission.READ)) { return false }

						if (files[0].attributes['mount-type'] === 'shared') {
							const attributes = JSON.parse(files[0].attributes['share-attributes'])
							const downloadAttribute = attributes.find((attribute) => attribute.scope === 'permissions' && attribute.key === 'download')
							if (downloadAttribute !== undefined && downloadAttribute.enabled === false) { return false }
						}

						return true
					},
					exec: OCA.WorldOffice.DownloadClickExec,
				}))
			}
		}
	}

	OCA.WorldOffice.registerNewFileMenu = function() {

		if (isPublicShare() && !OCA.WorldOffice.isViewIsFile()) {
			if (OCA.WorldOffice.GetTemplates) {
				OCA.WorldOffice.GetTemplates()
			}
			// Document
			addNewFileMenuEntry({
				id: 'new-world-office-docx',
				displayName: t(OCA.WorldOffice.AppName, 'New document'),
				enabled: (folder) => {
					return (folder.permissions & Permission.CREATE) !== 0
				},
				iconSvgInline: NewDocxSvg,
				order: 21,
				handler: (context) => {
					const name = t(OCA.WorldOffice.AppName, 'New document')
					if (!isPublicShare() && OCA.WorldOffice.TemplateExist('document')) {
						OCA.WorldOffice.OpenTemplatePicker(name, '.docx', 'document')
					} else {
						const dirContext = { dir: context.path }
						OCA.WorldOffice.CreateFileOverload(name + '.docx', dirContext, null, null, true, context)
					}
				},
			})

			// Spreadsheet
			addNewFileMenuEntry({
				id: 'new-world-office-xlsx',
				displayName: t(OCA.WorldOffice.AppName, 'New spreadsheet'),
				enabled: (folder) => {
					return (folder.permissions & Permission.CREATE) !== 0
				},
				iconSvgInline: NewXlsxSvg,
				order: 22,
				handler: (context) => {
					const name = t(OCA.WorldOffice.AppName, 'New spreadsheet')
					if (!isPublicShare() && OCA.WorldOffice.TemplateExist('spreadsheet')) {
						OCA.WorldOffice.OpenTemplatePicker(name, '.xlsx', 'spreadsheet')
					} else {
						const dirContext = { dir: context.path }
						OCA.WorldOffice.CreateFileOverload(name + '.xlsx', dirContext, null, null, true, context)
					}
				},
			})

			// Presentation
			addNewFileMenuEntry({
				id: 'new-world-office-pptx',
				displayName: t(OCA.WorldOffice.AppName, 'New presentation'),
				enabled: (context) => {
					return (context.permissions & Permission.CREATE) !== 0
				},
				iconSvgInline: NewPptxSvg,
				order: 23,
				handler: (context) => {
					const name = t(OCA.WorldOffice.AppName, 'New presentation')
					if (!isPublicShare() && OCA.WorldOffice.TemplateExist('presentation')) {
						OCA.WorldOffice.OpenTemplatePicker(name, '.pptx', 'presentation')
					} else {
						const dirContext = { dir: context.path }
						OCA.WorldOffice.CreateFileOverload(name + '.pptx', dirContext, null, null, true, context)
					}
				},
			})
		}

		// PDF Form
		addNewFileMenuEntry({
			id: 'new-world-office-pdf',
			displayName: t(OCA.WorldOffice.AppName, 'New PDF form'),
			enabled: folder => {
				return (folder.permissions & Permission.CREATE) !== 0
			},
			iconSvgInline: NewPdfSvg,
			order: 24,
			handler: context => {
				const name = t(OCA.WorldOffice.AppName, 'New PDF form')
				const dirContext = { dir: context.path }
				OCA.WorldOffice.OpenFormPicker(name + '.pdf', dirContext, context)
			},
		})

		if (!isPublicShare() && OCA.WorldOffice.GetTemplates) {
			OCA.WorldOffice.GetTemplates()
		}
	}

	OCA.WorldOffice.NewFileMenu = {
		attach(menu) {
			const fileList = menu.fileList

			if (fileList.id !== 'files' && fileList.id !== 'files.public') {
				return
			}

			if (isPublicShare() && !OCA.WorldOffice.isViewIsFile()) {
				menu.addMenuEntry({
					id: 'world-officeDocx',
					displayName: t(OCA.WorldOffice.AppName, 'New document'),
					templateName: t(OCA.WorldOffice.AppName, 'New document'),
					iconClass: 'icon-world-office-new-docx',
					fileType: 'docx',
					actionHandler(name) {
						if (!isPublicShare() && OCA.WorldOffice.TemplateExist('document')) {
							OCA.WorldOffice.OpenTemplatePicker(name, '.docx', 'document')
						} else {
							OCA.WorldOffice.CreateFile(name + '.docx', fileList)
						}
					},
				})

				menu.addMenuEntry({
					id: 'world-officeXlsx',
					displayName: t(OCA.WorldOffice.AppName, 'New spreadsheet'),
					templateName: t(OCA.WorldOffice.AppName, 'New spreadsheet'),
					iconClass: 'icon-world-office-new-xlsx',
					fileType: 'xlsx',
					actionHandler(name) {
						if (!isPublicShare() && OCA.WorldOffice.TemplateExist('spreadsheet')) {
							OCA.WorldOffice.OpenTemplatePicker(name, '.xlsx', 'spreadsheet')
						} else {
							OCA.WorldOffice.CreateFile(name + '.xlsx', fileList)
						}
					},
				})

				menu.addMenuEntry({
					id: 'world-officePpts',
					displayName: t(OCA.WorldOffice.AppName, 'New presentation'),
					templateName: t(OCA.WorldOffice.AppName, 'New presentation'),
					iconClass: 'icon-world-office-new-pptx',
					fileType: 'pptx',
					actionHandler(name) {
						if (!isPublicShare() && OCA.WorldOffice.TemplateExist('presentation')) {
							OCA.WorldOffice.OpenTemplatePicker(name, '.pptx', 'presentation')
						} else {
							OCA.WorldOffice.CreateFile(name + '.pptx', fileList)
						}
					},
				})

				if (OCA.WorldOffice.GetTemplates) {
					OCA.WorldOffice.GetTemplates()
				}
			}

			menu.addMenuEntry({
				id: 'world-officePdf',
				displayName: t(OCA.WorldOffice.AppName, 'New PDF form'),
				templateName: t(OCA.WorldOffice.AppName, 'New PDF form'),
				iconClass: 'icon-world-office-new-pdf',
				fileType: 'pdf',
				actionHandler(name) {
					OCA.WorldOffice.OpenFormPicker(name + '.pdf', fileList)
				},
			})
		},
	}

	OCA.WorldOffice.getFileExtension = function(fileName) {
		const extension = fileName.substr(fileName.lastIndexOf('.') + 1).toLowerCase()
		return extension
	}

	OCA.WorldOffice.isViewIsFile = function() {
		const mimetype = document.getElementById('mimetype')?.value
		if (mimetype !== undefined) {
			return mimetype !== 'httpd/unix-directory'
		}

		try {
			return loadState('files_sharing', 'view') === 'public-file-share'
		} catch {
			return false
		}
	}

	const initPage = function() {
		if (isPublicShare() && OCA.WorldOffice.isViewIsFile()) {
			// file by shared link
			let fileName = ''
			const fileNameDomElement = document.getElementById('filename')
			if (fileNameDomElement !== null && fileNameDomElement.value) {
				fileName = fileNameDomElement.value
			} else {
				try {
					fileName = loadState('files_sharing', 'filename')
				} catch {
					return
				}
			}

			const extension = OCA.WorldOffice.getFileExtension(fileName)
			const formats = OCA.WorldOffice.setting.formats

			const config = formats[extension]
			if (!config) {
				return
			}

			registerFileAction(new FileAction({
				id: 'world-office-public-open',
				displayName: () => t(OCA.WorldOffice.AppName, 'Open in word-office'),
				iconSvgInline: () => AppDarkSvg,
				enabled: (files) => {
					if (Permission.READ !== (files[0].permissions & Permission.READ)) { return false }

					return true
				},
				exec(file, view, dir) {
					OCA.WorldOffice.FileClickExec(file, view, dir, false)
				},
			}))

			if (config.def
				&& !_oc_appswebroots.richdocuments
				&& !(_oc_appswebroots.files_pdfviewer && extension === 'pdf')
				&& !(_oc_appswebroots.text && extension === 'txt')) {
				const editorUrl = OC.generateUrl('apps/' + OCA.WorldOffice.AppName + '/s/' + encodeURIComponent(getSharingToken()))

				OCA.WorldOffice.frameSelector = '#world-officeFrame'
				const container = document.createElement('div')
				container.classList.add('world-office-iframe-container')
				const iframe = document.createElement('iframe')
				iframe.id = 'world-officeFrame'
				iframe.nonce = btoa(OC.requestToken)
				iframe.scrolling = 'no'
				iframe.allowFullscreen = true
				iframe.src = `${editorUrl}?inframe=true`
				container.appendChild(iframe)
				const appContent = document.querySelector('#app-content') || document.querySelector('#app-content-vue')
				appContent.appendChild(container)
				$('body').addClass('world-office-inline')
			}
		} else {
			OC.Plugins.register('OCA.Files.NewFileMenu', OCA.WorldOffice.NewFileMenu)

			OCA.WorldOffice.registerNewFileMenu()

			OCA.WorldOffice.registerAction()
		}
	}
	initPage()

})(OCA)
