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
if (Common === undefined) {
  const Common = {}
}

Common.Locale = new (function () {
  let l10n = null
  let loadcallback
  let apply = false
  let defLang = "{{DEFAULT_LANG}}"
  let currentLang = defLang
  const _4letterLangs = ["pt-pt", "zh-tw", "sr-cyrl"]

  if (defLang[0] === "{") currentLang = defLang = "en"

  const _applyLocalization = (callback) => {
    _clearRtl()
    try {
      callback && (loadcallback = callback)
      if (l10n) {
        for (const prop in l10n) {
          const p = prop.split(".")
          if (p && p.length > 2) {
            let obj = window
            for (let i = 0; i < p.length - 1; ++i) {
              if (obj[p[i]] === undefined) {
                obj[p[i]] = new Object()
              }
              obj = obj[p[i]]
            }

            if (obj) {
              obj[p[p.length - 1]] = l10n[prop]
            }
          }
        }
        loadcallback?.()
      } else apply = true
    } catch (e) {}
  }

  const _get = (prop, scope) => {
    let res = ""
    if (l10n && scope && scope.name) {
      res = l10n[`${scope.name}.${prop}`]

      if (!res && scope.default) res = scope.default
    }

    return res || (scope ? eval(scope.name).prototype[prop] : "")
  }

  const _getCurrentLanguage = () => currentLang

  const _getDefaultLanguage = () => defLang

  const _getLoadedLanguage = () => loadedLang

  const _getUrlParameterByName = (name) => {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]")
    const regex = new RegExp(`[\\?&]${name}=([^&#]*)`)
    const results = regex.exec(location.search)
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "))
  }

  const _requireLang = (l) => {
    typeof l !== "string" && (l = null)
    let lang = (l || _getUrlParameterByName("lang") || defLang).toLowerCase().split(/[\-_]/)
    lang = lang[0] + (lang.length > 1 ? `-${lang[1]}` : "")
    const idx4Letters = _4letterLangs.indexOf(lang) // try to load 4 letters language
    lang = idx4Letters < 0 ? lang.split(/[\-]/)[0] : _4letterLangs[idx4Letters]
    currentLang = lang
    fetch(`locale/${lang}.json`)
      .then((response) => {
        if (!response.ok) {
          if (idx4Letters >= 0) {
            // try to load 2-letters language
            throw new Error("4letters error")
          }
          currentLang = defLang
          if (lang !== defLang)
            /* load default lang if fetch failed */
            return fetch(`locale/${defLang}.json`)

          throw new Error("server error")
        }
        return response.json()
      })
      .then((response) => {
        if (response.json) {
          if (!response.ok) throw new Error("server error")

          return response.json()
        }
        l10n = response
        /* to break promises chain */
        throw new Error("loaded")
      })
      .then((json) => {
        l10n = json || {}
        apply && _applyLocalization()
      })
      .catch((e) => {
        if (/4letters/.test(e)) {
          return setTimeout(() => {
            _requireLang(lang.split(/[\-_]/)[0])
          }, 0)
        }

        if (!/loaded/.test(e) && currentLang !== defLang && defLang && defLang.length < 3) {
          return setTimeout(() => {
            _requireLang(defLang)
          }, 0)
        }

        l10n = l10n || {}
        apply && _applyLocalization()
        if (e.message === "loaded") {
        } else {
          currentLang = null
          console.log(`fetch error: ${e}`)
        }
      })
  }

  const _clearRtl = () => {
    if (!_isCurrentRtl() && document.body.classList.contains("rtl")) {
      document.body.removeAttribute("dir")
      document.body.classList.remove("rtl")
      document.body.classList.remove("rtl-font")
      document.body.setAttribute("applang", currentLang)
      window.isrtl = false
    }
  }

  if (!window.fetch) {
    /* use fetch polifill if native method isn't supported */
    const polyfills = ["../vendor/fetch/fetch.umd"]
    if (!window.Promise) {
      require(["../vendor/es6-promise/es6-promise.auto.min"], () => {
        require(polyfills, _requireLang)
      })
    } else require(polyfills, _requireLang)
  } else _requireLang()

  const _isCurrentRtl = () => currentLang && /^(ar|he|ur)$/i.test(currentLang)

  return {
    apply: _applyLocalization,
    get: _get,
    getCurrentLanguage: _getCurrentLanguage,
    isCurrentLanguageRtl: _isCurrentRtl,
    getDefaultLanguage: _getDefaultLanguage,
  }
})()
