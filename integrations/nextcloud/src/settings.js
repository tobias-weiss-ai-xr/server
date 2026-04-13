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

/* global _, jQuery */

import { spawnDialog } from '@nextcloud/vue/functions/dialog'
import { defineAsyncComponent } from 'vue'

/**
 * @param {object} $ JQueryStatic object
 * @param {object} OC Nextcloud OCA object
 */
(function($, OC) {

	$(document).ready(function() {
		OCA.WorldOffice = _.extend({}, OCA.WorldOffice)
		if (!OCA.WorldOffice.AppName) {
			OCA.WorldOffice = {
				AppName: 'worldoffice',
			}
		}

		const advToogle = function() {
			$('#worldofficeSecretPanel').toggleClass('worldoffice-hide')
			$('#worldofficeAdv .icon').toggleClass('icon-triangle-s icon-triangle-n')
		}

		if ($('#worldofficeInternalUrl').val().length
			|| $('#worldofficeStorageUrl').val().length
			|| $('#worldofficeJwtHeader').val().length) {
			advToogle()
		}

		$('#worldofficeAdv').click(advToogle)

		$('#worldofficeGroups').prop('checked', $('#worldofficeLimitGroups').val() !== '')

		const groupListToggle = function() {
			if ($('#worldofficeGroups').prop('checked')) {
				OC.Settings.setupGroupsSelect($('#worldofficeLimitGroups'))
			} else {
				$('#worldofficeLimitGroups').select2('destroy')
			}
		}

		$('#worldofficeGroups').click(groupListToggle)
		groupListToggle()

		const demoToggle = function() {
			$('#worldofficeAddrSettings input:not(#worldofficeStorageUrl)').prop('disabled', $('#worldofficeDemo').prop('checked'))
		}

		$('#worldofficeDemo').click(demoToggle)
		demoToggle()

		const watermarkToggle = function() {
			$('#worldofficeWatermarkSettings').toggleClass('worldoffice-hide', !$('#worldofficeWatermark_enabled').prop('checked'))
		}

		$('#worldofficeWatermark_enabled').click(watermarkToggle)

		$('#worldofficeWatermark_shareAll').click(function() {
			$('#worldofficeWatermark_shareRead').parent().toggleClass('worldoffice-hide')
		})

		$('#worldofficeWatermark_linkAll').click(function() {
			$('#worldofficeWatermark_link_sensitive').toggleClass('worldoffice-hide')
		})

		const watermarkGroupLists = [
			'allGroups',
		]

		const watermarkTagLists = [
			'allTags',
			'linkTags',
		]

		const watermarkNodeBehaviour = function(watermark) {
			const watermarkListToggle = function() {
				if ($('#worldofficeWatermark_' + watermark).prop('checked')) {
					if (watermark.indexOf('Group') >= 0) {
						OC.Settings.setupGroupsSelect($('#worldofficeWatermark_' + watermark + 'List'))
					} else {
						$('#worldofficeWatermark_' + watermark + 'List').select2({
							allowClear: true,
							closeOnSelect: false,
							multiple: true,
							separator: '|',
							toggleSelect: true,
							placeholder: t(OCA.WorldOffice.AppName, 'Select tag'),
							query: _.debounce(function(query) {
								query.callback({
									results: OC.SystemTags.collection.filterByName(query.term),
								})
							}, 100, true),
							initSelection(element, callback) {
								const selection = ($(element).val() || []).split('|').map(function(tagId) {
									return OC.SystemTags.collection.get(tagId)
								})
								callback(selection)
							},
							formatResult(tag) {
								return OC.SystemTags.getDescriptiveTag(tag)
							},
							formatSelection(tag) {
								return tag.get('name')
							},
							sortResults(results) {
								results.sort(function(a, b) {
									return OC.Util.naturalSortCompare(a.get('name'), b.get('name'))
								})
								return results
							},
						})
					}
				} else {
					$('#worldofficeWatermark_' + watermark + 'List').select2('destroy')
				}
			}

			$('#worldofficeWatermark_' + watermark).click(watermarkListToggle)
			watermarkListToggle()
		}

		$.each(watermarkGroupLists, function(i, watermarkGroup) {
			watermarkNodeBehaviour(watermarkGroup)
		})

		if (OC.SystemTags && OC.SystemTags.collection) {
			OC.SystemTags.collection.fetch({
				success() {
					$.each(watermarkTagLists, function(i, watermarkTag) {
						watermarkNodeBehaviour(watermarkTag)
					})
				},
			})
		}

		const connectionError = document.getElementById('worldofficeSettingsState').value
		if (connectionError !== '') {
			OCP.Toast.error(t(OCA.WorldOffice.AppName, 'Error when trying to connect') + ' (' + connectionError + ')')
		}

		$('#worldofficeAddrSave').click(function() {
			$('.section-worldoffice').addClass('icon-loading')
			const worldofficeUrl = $('#worldofficeUrl').val().trim()

			if (!worldofficeUrl.length) {
				$('#worldofficeInternalUrl, #worldofficeStorageUrl, #worldofficeSecret, #worldofficeJwtHeader').val('')
			}

			const worldofficeInternalUrl = ($('#worldofficeInternalUrl').val() || '').trim()
			const worldofficeStorageUrl = ($('#worldofficeStorageUrl').val() || '').trim()
			const worldofficeVerifyPeerOff = $('#worldofficeVerifyPeerOff').prop('checked')
			const worldofficeSecret = ($('#worldofficeSecret').val() || '').trim()
			const jwtHeader = ($('#worldofficeJwtHeader').val() || '').trim()
			const demo = $('#worldofficeDemo').prop('checked')

			$.ajax({
				method: 'PUT',
				url: OC.generateUrl('apps/' + OCA.WorldOffice.AppName + '/ajax/settings/address'),
				data: {
					documentserver: worldofficeUrl,
					documentserverInternal: worldofficeInternalUrl,
					storageUrl: worldofficeStorageUrl,
					verifyPeerOff: worldofficeVerifyPeerOff,
					secret: worldofficeSecret,
					jwtHeader,
					demo,
				},
				success: function onSuccess(response) {
					$('.section-worldoffice').removeClass('icon-loading')
					if (response && (response.documentserver != null || demo)) {
						$('#worldofficeUrl').val(response.documentserver)
						$('#worldofficeInternalUrl').val(response.documentserverInternal)
						$('#worldofficeStorageUrl').val(response.storageUrl)
						$('#worldofficeSecret').val(response.secret)
						$('#worldofficeJwtHeader').val(response.jwtHeader)

						$('.section-worldoffice-common, .section-worldoffice-templates, .section-worldoffice-watermark').toggleClass('worldoffice-hide', (response.documentserver == null && !demo) || !!response.error.length)

						const versionMessage = response.version ? (' (' + t(OCA.WorldOffice.AppName, 'version') + ' ' + response.version + ')') : ''

						if (response.error) {
							OCP.Toast.error(t(OCA.WorldOffice.AppName, 'Error when trying to connect') + ' (' + response.error + ')' + versionMessage)
						} else {
							if (response.secret !== null) {
								OCP.Toast.success(t(OCA.WorldOffice.AppName, 'Server settings have been successfully updated') + versionMessage)
							} else {
								spawnDialog(defineAsyncComponent(() => import('./views/EmptyJwtInfoDialog.vue')))
							}
						}
					} else {
						$('.section-worldoffice-common, .section-worldoffice-templates, .section-worldoffice-watermark').addClass('worldoffice-hide')
					}
				},
			})
		})

		$('#worldofficeSave').click(function() {
			$('.section-worldoffice').addClass('icon-loading')

			const defFormats = {}
			$('input[id^="worldofficeDefFormat"]').each(function() {
				defFormats[this.name] = this.checked
			})

			const editFormats = {}
			$('input[id^="worldofficeEditFormat"]').each(function() {
				editFormats[this.name] = this.checked
			})

			const sameTab = $('#worldofficeSameTab').is(':checked')
			const enableSharing = $('#worldofficeEnableSharing').is(':checked')
			const preview = $('#worldofficePreview').is(':checked')
			const advanced = $('#worldofficeAdvanced').is(':checked')
			const cronChecker = $('#worldofficeCronChecker').is(':checked')
			const emailNotifications = $('#worldofficeEmailNotifications').is(':checked')
			const versionHistory = $('#worldofficeVersionHistory').is(':checked')

			const limitGroupsString = $('#worldofficeGroups').prop('checked') ? $('#worldofficeLimitGroups').val() : ''
			const limitGroups = limitGroupsString ? limitGroupsString.split('|') : []

			const chat = $('#worldofficeChat').is(':checked')
			const compactHeader = $('#worldofficeCompactHeader').is(':checked')
			const feedback = $('#worldofficeFeedback').is(':checked')
			const forcesave = $('#worldofficeForcesave').is(':checked')
			const liveViewOnShare = $('#worldofficeLiveViewOnShare').is(':checked')
			const help = $('#worldofficeHelp').is(':checked')
			const reviewDisplay = $("input[type='radio'][name='reviewDisplay']:checked").attr('id').replace('worldofficeReviewDisplay_', '')
			const theme = $("input[type='radio'][name='theme']:checked").attr('id').replace('worldofficeTheme_', '')
			const unknownAuthor = $('#worldofficeUnknownAuthor').val().trim()

			$.ajax({
				method: 'PUT',
				url: OC.generateUrl('apps/' + OCA.WorldOffice.AppName + '/ajax/settings/common'),
				data: {
					defFormats,
					editFormats,
					sameTab,
					enableSharing,
					preview,
					advanced,
					cronChecker,
					emailNotifications,
					versionHistory,
					limitGroups,
					chat,
					compactHeader,
					feedback,
					forcesave,
					liveViewOnShare,
					help,
					reviewDisplay,
					theme,
					unknownAuthor,
				},
				success: function onSuccess(response) {
					$('.section-worldoffice').removeClass('icon-loading')
					if (response) {
						OCP.Toast.success(t(OCA.WorldOffice.AppName, 'Common settings have been successfully updated'))
					}
				},
			})
		})

		$('#worldofficeSecuritySave').click(function() {
			$('.section-worldoffice').addClass('icon-loading')

			const plugins = $('#worldofficePlugins').is(':checked')
			const macros = $('#worldofficeMacros').is(':checked')
			const protection = $("input[type='radio'][name='protection']:checked").attr('id').replace('worldofficeProtection_', '')

			const watermarkSettings = {
				enabled: $('#worldofficeWatermark_enabled').is(':checked'),
			}
			if (watermarkSettings.enabled) {
				watermarkSettings.text = ($('#worldofficeWatermark_text').val() || '').trim()

				const watermarkLabels = [
					'allGroups',
					'allTags',
					'linkAll',
					'linkRead',
					'linkSecure',
					'linkTags',
					'shareAll',
					'shareRead',
				]
				$.each(watermarkLabels, function(i, watermarkLabel) {
					watermarkSettings[watermarkLabel] = $('#worldofficeWatermark_' + watermarkLabel).is(':checked')
				})

				$.each(watermarkGroupLists.concat(watermarkTagLists), function(i, watermarkList) {
					const list = $('#worldofficeWatermark_' + watermarkList).is(':checked') ? $('#worldofficeWatermark_' + watermarkList + 'List').val() : ''
					watermarkSettings[watermarkList + 'List'] = list ? list.split('|') : []
				})
			}

			$.ajax({
				method: 'PUT',
				url: OC.generateUrl('apps/' + OCA.WorldOffice.AppName + '/ajax/settings/security'),
				data: {
					watermarks: watermarkSettings,
					plugins,
					macros,
					protection,
				},
				success: function onSuccess(response) {
					$('.section-worldoffice').removeClass('icon-loading')
					if (response) {
						OCP.Toast.success(t(OCA.WorldOffice.AppName, 'Security settings have been successfully updated'))
					}
				},
			})
		})

		$('.section-worldoffice-addr input').keypress(function(e) {
			const code = e.keyCode || e.which
			if (code === 13) {
				$('#worldofficeAddrSave').click()
			}
		})

		$('#worldofficeSecret-show').click(function() {
			if ($('#worldofficeSecret').attr('type') === 'password') {
				$('#worldofficeSecret').attr('type', 'text')
			} else {
				$('#worldofficeSecret').attr('type', 'password')
			}
		})

		$('#worldofficeClearVersionHistory').click(function() {
			OC.dialogs.confirm(
				t(OCA.WorldOffice.AppName, 'Are you sure you want to clear metadata?'),
				t(OCA.WorldOffice.AppName, 'Confirm metadata removal'),
				(clicked) => {
					if (!clicked) {
						return
					}

					$('.section-worldoffice').addClass('icon-loading')

					$.ajax({
						method: 'DELETE',
						url: OC.generateUrl('apps/' + OCA.WorldOffice.AppName + '/ajax/settings/history'),
						success: function onSuccess(response) {
							$('.section-worldoffice').removeClass('icon-loading')
							if (response) {
								OCP.Toast.success(t(OCA.WorldOffice.AppName, 'All history successfully deleted'))
							}
						},
					})
				},
			)
		})

		$('#worldofficeAddTemplate').change(function() {
			const file = this.files[0]
			const data = new FormData()

			data.append('file', file)

			$('.section-worldoffice').addClass('icon-loading')
			OCA.WorldOffice.AddTemplate(file, (template, error) => {

				$('.section-worldoffice').removeClass('icon-loading')
				const message = error
					? t(OCA.WorldOffice.AppName, 'Error') + ': ' + error
					: t(OCA.WorldOffice.AppName, 'Template successfully added')

				if (error) {
					OCP.Toast.error(message)
					return
				}

				if (template) {
					OCA.WorldOffice.AttachItemTemplate(template)
				}
				OCP.Toast.success(message)
			})
		})

		$(document).on('click', '.worldoffice-template-delete', function(event) {
			const item = $(event.target).parents('.worldoffice-template-item')
			const templateId = $(item).attr('data-id')

			$('.section-worldoffice').addClass('icon-loading')
			OCA.WorldOffice.DeleteTemplate(templateId, (response) => {
				$('.section-worldoffice').removeClass('icon-loading')

				const message = response.error
					? t(OCA.WorldOffice.AppName, 'Error') + ': ' + response.error
					: t(OCA.WorldOffice.AppName, 'Template successfully deleted')
				if (response.error) {
					OCP.Toast.error(message)
					return
				}

				$(item).detach()
				OCP.Toast.success(message)
			})
		})

		$(document).on('click', '.worldoffice-template-item p', function(event) {
			const item = $(event.target).parents('.worldoffice-template-item')
			const templateId = $(item).attr('data-id')

			const url = OC.generateUrl('/apps/' + OCA.WorldOffice.AppName + '/{fileId}?template={template}',
				{
					fileId: templateId,
					template: 'true',
				})

			window.open(url)
		})

		$(document).on('click', '.worldoffice-template-download', function(event) {
			const item = $(event.target).parents('.worldoffice-template-item')
			const templateId = $(item).attr('data-id')

			const downloadLink = OC.generateUrl('apps/' + OCA.WorldOffice.AppName + '/downloadas?fileId={fileId}&template={template}', {
				fileId: templateId,
				template: 'true',
			})

			location.href = downloadLink
		})

		const sameTabCheckbox = document.getElementById('worldofficeSameTab')
		const sharingBlock = document.getElementById('worldofficeEnableSharingBlock')
		const sharingCheckbox = document.getElementById('worldofficeEnableSharing')

		sameTabCheckbox.onclick = function() {
			const isChecked = sameTabCheckbox.checked
			sharingBlock.style.display = isChecked ? 'none' : 'block'
			sharingCheckbox.checked = isChecked ? sharingCheckbox.checked : false
		}
	})

})(jQuery, OC)
