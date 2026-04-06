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
				AppName: 'world-office',
			}
		}

		const advToogle = function() {
			$('#world-officeSecretPanel').toggleClass('world-office-hide')
			$('#world-officeAdv .icon').toggleClass('icon-triangle-s icon-triangle-n')
		}

		if ($('#world-officeInternalUrl').val().length
			|| $('#world-officeStorageUrl').val().length
			|| $('#world-officeJwtHeader').val().length) {
			advToogle()
		}

		$('#world-officeAdv').click(advToogle)

		$('#world-officeGroups').prop('checked', $('#world-officeLimitGroups').val() !== '')

		const groupListToggle = function() {
			if ($('#world-officeGroups').prop('checked')) {
				OC.Settings.setupGroupsSelect($('#world-officeLimitGroups'))
			} else {
				$('#world-officeLimitGroups').select2('destroy')
			}
		}

		$('#world-officeGroups').click(groupListToggle)
		groupListToggle()

		const demoToggle = function() {
			$('#world-officeAddrSettings input:not(#world-officeStorageUrl)').prop('disabled', $('#world-officeDemo').prop('checked'))
		}

		$('#world-officeDemo').click(demoToggle)
		demoToggle()

		const watermarkToggle = function() {
			$('#world-officeWatermarkSettings').toggleClass('world-office-hide', !$('#world-officeWatermark_enabled').prop('checked'))
		}

		$('#world-officeWatermark_enabled').click(watermarkToggle)

		$('#world-officeWatermark_shareAll').click(function() {
			$('#world-officeWatermark_shareRead').parent().toggleClass('world-office-hide')
		})

		$('#world-officeWatermark_linkAll').click(function() {
			$('#world-officeWatermark_link_sensitive').toggleClass('world-office-hide')
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
				if ($('#world-officeWatermark_' + watermark).prop('checked')) {
					if (watermark.indexOf('Group') >= 0) {
						OC.Settings.setupGroupsSelect($('#world-officeWatermark_' + watermark + 'List'))
					} else {
						$('#world-officeWatermark_' + watermark + 'List').select2({
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
					$('#world-officeWatermark_' + watermark + 'List').select2('destroy')
				}
			}

			$('#world-officeWatermark_' + watermark).click(watermarkListToggle)
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

		const connectionError = document.getElementById('world-officeSettingsState').value
		if (connectionError !== '') {
			OCP.Toast.error(t(OCA.WorldOffice.AppName, 'Error when trying to connect') + ' (' + connectionError + ')')
		}

		$('#world-officeAddrSave').click(function() {
			$('.section-world-office').addClass('icon-loading')
			const world-officeUrl = $('#world-officeUrl').val().trim()

			if (!world-officeUrl.length) {
				$('#world-officeInternalUrl, #world-officeStorageUrl, #world-officeSecret, #world-officeJwtHeader').val('')
			}

			const world-officeInternalUrl = ($('#world-officeInternalUrl').val() || '').trim()
			const world-officeStorageUrl = ($('#world-officeStorageUrl').val() || '').trim()
			const world-officeVerifyPeerOff = $('#world-officeVerifyPeerOff').prop('checked')
			const world-officeSecret = ($('#world-officeSecret').val() || '').trim()
			const jwtHeader = ($('#world-officeJwtHeader').val() || '').trim()
			const demo = $('#world-officeDemo').prop('checked')

			$.ajax({
				method: 'PUT',
				url: OC.generateUrl('apps/' + OCA.WorldOffice.AppName + '/ajax/settings/address'),
				data: {
					documentserver: world-officeUrl,
					documentserverInternal: world-officeInternalUrl,
					storageUrl: world-officeStorageUrl,
					verifyPeerOff: world-officeVerifyPeerOff,
					secret: world-officeSecret,
					jwtHeader,
					demo,
				},
				success: function onSuccess(response) {
					$('.section-world-office').removeClass('icon-loading')
					if (response && (response.documentserver != null || demo)) {
						$('#world-officeUrl').val(response.documentserver)
						$('#world-officeInternalUrl').val(response.documentserverInternal)
						$('#world-officeStorageUrl').val(response.storageUrl)
						$('#world-officeSecret').val(response.secret)
						$('#world-officeJwtHeader').val(response.jwtHeader)

						$('.section-world-office-common, .section-world-office-templates, .section-world-office-watermark').toggleClass('world-office-hide', (response.documentserver == null && !demo) || !!response.error.length)

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
						$('.section-world-office-common, .section-world-office-templates, .section-world-office-watermark').addClass('world-office-hide')
					}
				},
			})
		})

		$('#world-officeSave').click(function() {
			$('.section-world-office').addClass('icon-loading')

			const defFormats = {}
			$('input[id^="world-officeDefFormat"]').each(function() {
				defFormats[this.name] = this.checked
			})

			const editFormats = {}
			$('input[id^="world-officeEditFormat"]').each(function() {
				editFormats[this.name] = this.checked
			})

			const sameTab = $('#world-officeSameTab').is(':checked')
			const enableSharing = $('#world-officeEnableSharing').is(':checked')
			const preview = $('#world-officePreview').is(':checked')
			const advanced = $('#world-officeAdvanced').is(':checked')
			const cronChecker = $('#world-officeCronChecker').is(':checked')
			const emailNotifications = $('#world-officeEmailNotifications').is(':checked')
			const versionHistory = $('#world-officeVersionHistory').is(':checked')

			const limitGroupsString = $('#world-officeGroups').prop('checked') ? $('#world-officeLimitGroups').val() : ''
			const limitGroups = limitGroupsString ? limitGroupsString.split('|') : []

			const chat = $('#world-officeChat').is(':checked')
			const compactHeader = $('#world-officeCompactHeader').is(':checked')
			const feedback = $('#world-officeFeedback').is(':checked')
			const forcesave = $('#world-officeForcesave').is(':checked')
			const liveViewOnShare = $('#world-officeLiveViewOnShare').is(':checked')
			const help = $('#world-officeHelp').is(':checked')
			const reviewDisplay = $("input[type='radio'][name='reviewDisplay']:checked").attr('id').replace('world-officeReviewDisplay_', '')
			const theme = $("input[type='radio'][name='theme']:checked").attr('id').replace('world-officeTheme_', '')
			const unknownAuthor = $('#world-officeUnknownAuthor').val().trim()

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
					$('.section-world-office').removeClass('icon-loading')
					if (response) {
						OCP.Toast.success(t(OCA.WorldOffice.AppName, 'Common settings have been successfully updated'))
					}
				},
			})
		})

		$('#world-officeSecuritySave').click(function() {
			$('.section-world-office').addClass('icon-loading')

			const plugins = $('#world-officePlugins').is(':checked')
			const macros = $('#world-officeMacros').is(':checked')
			const protection = $("input[type='radio'][name='protection']:checked").attr('id').replace('world-officeProtection_', '')

			const watermarkSettings = {
				enabled: $('#world-officeWatermark_enabled').is(':checked'),
			}
			if (watermarkSettings.enabled) {
				watermarkSettings.text = ($('#world-officeWatermark_text').val() || '').trim()

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
					watermarkSettings[watermarkLabel] = $('#world-officeWatermark_' + watermarkLabel).is(':checked')
				})

				$.each(watermarkGroupLists.concat(watermarkTagLists), function(i, watermarkList) {
					const list = $('#world-officeWatermark_' + watermarkList).is(':checked') ? $('#world-officeWatermark_' + watermarkList + 'List').val() : ''
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
					$('.section-world-office').removeClass('icon-loading')
					if (response) {
						OCP.Toast.success(t(OCA.WorldOffice.AppName, 'Security settings have been successfully updated'))
					}
				},
			})
		})

		$('.section-world-office-addr input').keypress(function(e) {
			const code = e.keyCode || e.which
			if (code === 13) {
				$('#world-officeAddrSave').click()
			}
		})

		$('#world-officeSecret-show').click(function() {
			if ($('#world-officeSecret').attr('type') === 'password') {
				$('#world-officeSecret').attr('type', 'text')
			} else {
				$('#world-officeSecret').attr('type', 'password')
			}
		})

		$('#world-officeClearVersionHistory').click(function() {
			OC.dialogs.confirm(
				t(OCA.WorldOffice.AppName, 'Are you sure you want to clear metadata?'),
				t(OCA.WorldOffice.AppName, 'Confirm metadata removal'),
				(clicked) => {
					if (!clicked) {
						return
					}

					$('.section-world-office').addClass('icon-loading')

					$.ajax({
						method: 'DELETE',
						url: OC.generateUrl('apps/' + OCA.WorldOffice.AppName + '/ajax/settings/history'),
						success: function onSuccess(response) {
							$('.section-world-office').removeClass('icon-loading')
							if (response) {
								OCP.Toast.success(t(OCA.WorldOffice.AppName, 'All history successfully deleted'))
							}
						},
					})
				},
			)
		})

		$('#world-officeAddTemplate').change(function() {
			const file = this.files[0]
			const data = new FormData()

			data.append('file', file)

			$('.section-world-office').addClass('icon-loading')
			OCA.WorldOffice.AddTemplate(file, (template, error) => {

				$('.section-world-office').removeClass('icon-loading')
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

		$(document).on('click', '.world-office-template-delete', function(event) {
			const item = $(event.target).parents('.world-office-template-item')
			const templateId = $(item).attr('data-id')

			$('.section-world-office').addClass('icon-loading')
			OCA.WorldOffice.DeleteTemplate(templateId, (response) => {
				$('.section-world-office').removeClass('icon-loading')

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

		$(document).on('click', '.world-office-template-item p', function(event) {
			const item = $(event.target).parents('.world-office-template-item')
			const templateId = $(item).attr('data-id')

			const url = OC.generateUrl('/apps/' + OCA.WorldOffice.AppName + '/{fileId}?template={template}',
				{
					fileId: templateId,
					template: 'true',
				})

			window.open(url)
		})

		$(document).on('click', '.world-office-template-download', function(event) {
			const item = $(event.target).parents('.world-office-template-item')
			const templateId = $(item).attr('data-id')

			const downloadLink = OC.generateUrl('apps/' + OCA.WorldOffice.AppName + '/downloadas?fileId={fileId}&template={template}', {
				fileId: templateId,
				template: 'true',
			})

			location.href = downloadLink
		})

		const sameTabCheckbox = document.getElementById('world-officeSameTab')
		const sharingBlock = document.getElementById('world-officeEnableSharingBlock')
		const sharingCheckbox = document.getElementById('world-officeEnableSharing')

		sameTabCheckbox.onclick = function() {
			const isChecked = sameTabCheckbox.checked
			sharingBlock.style.display = isChecked ? 'none' : 'block'
			sharingCheckbox.checked = isChecked ? sharingCheckbox.checked : false
		}
	})

})(jQuery, OC)
