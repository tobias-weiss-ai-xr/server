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

;+(() => {
  !window.common && (window.common = {})
  !common.controller && (common.controller = {})

  common.controller.modals = new (function () {
    let $dlgShare
    let $dlgEmbed
    let $dlgPassword
    let $dlgPrintPassword
    let $dlgWarning
    let appConfig
    const embedCode =
      '<iframe allowtransparency="true" frameborder="0" scrolling="no" src="{embed-url}" width="{width}" height="{height}"></iframe>'
    const minEmbedWidth = 400
    const minEmbedHeight = 600

    function copytext(el, event) {
      el.select()
      if (!document.execCommand("copy")) {
        window.alert("Browser's error! Use keyboard shortcut [Ctrl] + [C]")
      }
    }

    const createDlgShare = function () {
      $dlgShare = common.view.modals.create("share")

      const _encoded = encodeURIComponent(appConfig.shareUrl)
      const _mailto = `mailto:?subject=I have shared a document with you: ${appConfig.docTitle}&body=I have shared a document with you: ${_encoded}`

      $dlgShare
        .find("#btn-copyshort")
        .on("click", copytext.bind(this, $dlgShare.find("#id-short-url")))
      $dlgShare.find(".share-buttons > span").on("click", (e) => {
        if (window.config) {
          const key = $(e.target).attr("data-name")
          const btn = window.config.btnsShare[key]
          if (btn?.getUrl) {
            window.open(
              btn.getUrl(appConfig.shareUrl, appConfig.docTitle),
              btn.target || "",
              btn.features ||
                "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600",
            )
            return
          }
        }

        let _url
        switch ($(e.target).attr("data-name")) {
          case "facebook":
            _url = `https://www.facebook.com/sharer/sharer.php?u=${appConfig.shareUrl}&t=${encodeURI(appConfig.docTitle)}`
            window.open(
              _url,
              "",
              "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600",
            )
            break
          case "twitter":
            _url = `https://twitter.com/share?url=${_encoded}`
            !!appConfig.docTitle && (_url += encodeURIComponent(`&text=${appConfig.docTitle}`))
            window.open(
              _url,
              "",
              "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600",
            )
            break
          case "email":
            window.open(_mailto, "_self")
            break
        }
      })

      $dlgShare.find("#id-short-url").val(appConfig.shareUrl)
      $dlgShare.find(".share-buttons > #email.autotest").attr("data-test", _mailto)
    }

    const createDlgEmbed = function () {
      $dlgEmbed = common.view.modals.create("embed")

      const txtembed = $dlgEmbed.find("#txt-embed-url")
      txtembed.text(
        embedCode
          .replace("{embed-url}", appConfig.embedUrl)
          .replace("{width}", minEmbedWidth)
          .replace("{height}", minEmbedHeight),
      )
      $dlgEmbed.find("#btn-copyembed").on("click", copytext.bind(this, txtembed))
      $dlgEmbed.find("#txt-embed-width, #txt-embed-height").on({
        keypress: (e) => {
          if (e.keyCode === 13) updateEmbedCode()
        },
        focusout: (e) => {
          updateEmbedCode()
        },
      })
    }

    const createDlgPassword = (submitCallback) => {
      if (!$dlgPassword) {
        const submit = () => {
          if (submitCallback) {
            $dlgPassword.modal("hide")
            $dlgPassword.find("#password-input").attr("disabled", true)
            $dlgPassword.find("#password-btn").attr("disabled", true)
            setTimeout(() => {
              submitCallback($dlgPassword.find("#password-input").val())
            }, 350)
          }
        }
        $dlgPassword = common.view.modals.create("password")
        $dlgPassword.modal({ backdrop: "static", keyboard: false })
        $dlgPassword.modal("show")
        $dlgPassword.find("#password-btn").on("click", () => {
          submit()
        })
        $dlgPassword.find("#password-input").keyup((e) => {
          if (e.key === "Enter") {
            submit()
          }
        })
      } else {
        $dlgPassword.modal("show")
        $dlgPassword.find("#password-input").attr("disabled", false).addClass("error").val("")
        $dlgPassword.find("#password-label-error").addClass("error")
        $dlgPassword.find("#password-btn").attr("disabled", false)
      }
      setTimeout(() => {
        $dlgPassword.find("#password-input").focus()
      }, 500)
    }

    const createDlgPrintPassword = (submitCallback, showError) => {
      if (!$dlgPrintPassword) {
        const submit = () => {
          if (submitCallback) {
            $dlgPrintPassword.modal("hide")
            $dlgPrintPassword.find("#password-input").attr("disabled", true)
            $dlgPrintPassword.find("#password-btn").attr("disabled", true)
            setTimeout(() => {
              submitCallback($dlgPrintPassword.find("#password-input").val())
            }, 350)
          }
        }
        $dlgPrintPassword = common.view.modals.create("printPassword")
        $dlgPrintPassword.modal({ backdrop: "static", keyboard: false })
        $dlgPrintPassword.modal("show")
        $dlgPrintPassword.find("#password-btn").on("click", () => {
          submit()
        })
        $dlgPrintPassword.find("#password-input").keyup((e) => {
          if (e.key === "Enter") {
            submit()
          }
        })
        $dlgPrintPassword.on("keydown", (e) => {
          if (e.key === "Escape") {
            $dlgPrintPassword.modal("hide")
          }
        })
      } else {
        $dlgPrintPassword.modal("show")
        $dlgPrintPassword.find("#password-input")[showError ? "addClass" : "removeClass"]("error")
        $dlgPrintPassword
          .find("#password-label-error")
          [showError ? "addClass" : "removeClass"]("error")
        $dlgPrintPassword.find("#password-input").attr("disabled", false).val("")
        $dlgPrintPassword.find("#password-btn").attr("disabled", false)
      }
      setTimeout(() => {
        $dlgPrintPassword.find("#password-input").focus()
      }, 500)
    }

    const showWarning = (config) => {
      $dlgWarning = common.view.modals.create("warning", "body", {
        title: config.title,
        message: config.message,
        buttons: config.buttons || ["ok"],
        primary: config.primary,
      })
      $dlgWarning.on("click", "[data-btn]", function () {
        const btn = $(this).data("btn")
        $dlgWarning.modal("hide")
        if (config.callback) {
          config.callback(btn)
        }
      })
      $dlgWarning.on("click", '[data-dismiss="modal"]', () => {
        if (config.closecallback) {
          config.closecallback()
        }
      })

      $dlgWarning.on("hidden.bs.modal", () => {
        $dlgWarning.remove()
      })

      $dlgWarning.modal({
        backdrop: "static",
        keyboard: false,
        show: true,
      })
    }

    function updateEmbedCode() {
      const $txtwidth = $dlgEmbed.find("#txt-embed-width")
      const $txtheight = $dlgEmbed.find("#txt-embed-height")
      let newWidth = Number.parseInt($txtwidth.val())
      let newHeight = Number.parseInt($txtheight.val())

      if (newWidth < minEmbedWidth) newWidth = minEmbedWidth

      if (newHeight < minEmbedHeight) newHeight = minEmbedHeight

      $dlgEmbed
        .find("#txt-embed-url")
        .text(
          embedCode
            .replace("{embed-url}", appConfig.embedUrl)
            .replace("{width}", newWidth)
            .replace("{height}", newHeight),
        )

      $txtwidth.val(`${newWidth}px`)
      $txtheight.val(`${newHeight}px`)
    }

    const attachToView = (config) => {
      if (config.share && !!appConfig.shareUrl) {
        if (!$dlgShare) {
          createDlgShare()
        }

        $(config.share).on("click", (e) => {
          $dlgShare.modal("show")
        })
      }

      if (config.embed && !!appConfig.embedUrl) {
        if (!$dlgEmbed) {
          createDlgEmbed()
        }

        $(config.embed).on("click", (e) => {
          $dlgEmbed.modal("show")
        })
      }
    }

    return {
      init: (config) => {
        appConfig = config
      },
      attach: attachToView,
      createDlgPassword: createDlgPassword,
      createDlgPrintPassword: createDlgPrintPassword,
      showWarning: showWarning,
    }
  })()
})()
