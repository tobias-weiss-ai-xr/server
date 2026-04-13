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
define([], () => {
  if (window.Common === undefined) {
    window.Common = {}
  }

  if (Common.Utils === undefined) {
    Common.Utils = {}
  }

  function _extend_object(dest, source) {
    if (typeof _ !== "undefined") {
      return _.extend({}, dest, source)
    }
    if (Object) {
      return Object.assign({}, dest, source)
    }

    return source
  }

  const utils = new (function () {
    const userAgent = navigator.userAgent.toLowerCase()
    const check = (regex) => regex.test(userAgent)
    const isStrict = document.compatMode === "CSS1Compat"
    const version = (is, regex) => {
      let m
      return is && (m = regex.exec(userAgent)) ? Number.parseFloat(m[1]) : 0
    }
    const docMode = document.documentMode
    const isEdge = check(/edge/)
    const isOpera = check(/opera/)
    const isOpera10_5 = isOpera && check(/version\/10\.5/)
    const isIE = !isOpera && (check(/msie/) || check(/trident/) || check(/edge/))
    const isIE7 =
      isIE &&
      ((check(/msie 7/) && docMode !== 8 && docMode !== 9 && docMode !== 10) || docMode === 7)
    const isIE8 =
      isIE &&
      ((check(/msie 8/) && docMode !== 7 && docMode !== 9 && docMode !== 10) || docMode === 8)
    const isIE9 =
      isIE &&
      ((check(/msie 9/) && docMode !== 7 && docMode !== 8 && docMode !== 10) || docMode === 9)
    const isIE10 =
      isIE &&
      ((check(/msie 10/) && docMode !== 7 && docMode !== 8 && docMode !== 9) || docMode === 10)
    const isIE11 =
      isIE &&
      ((check(/trident\/7\.0/) &&
        docMode !== 7 &&
        docMode !== 8 &&
        docMode !== 9 &&
        docMode !== 10) ||
        docMode === 11)
    const isIE6 = isIE && check(/msie 6/)
    const isChrome = !isIE && check(/\bchrome\b/)
    const isWebKit = !isIE && check(/webkit/)
    const isSafari = !isIE && !isChrome && check(/safari/)
    const isSafari2 = isSafari && check(/applewebkit\/4/) // unique to Safari 2
    const isSafari3 = isSafari && check(/version\/3/)
    const isSafari4 = isSafari && check(/version\/4/)
    const isSafari5_0 = isSafari && check(/version\/5\.0/)
    const isSafari5 = isSafari && check(/version\/5/)
    const isGecko = !isWebKit && !isIE && check(/gecko/) // IE11 adds "like gecko" into the user agent string
    const isGecko3 = isGecko && check(/rv:1\.9/)
    const isGecko4 = isGecko && check(/rv:2\.0/)
    const isGecko5 = isGecko && check(/rv:5\./)
    const isGecko10 = isGecko && check(/rv:10\./)
    const isFF3_0 = isGecko3 && check(/rv:1\.9\.0/)
    const isFF3_5 = isGecko3 && check(/rv:1\.9\.1/)
    const isFF3_6 = isGecko3 && check(/rv:1\.9\.2/)
    const isWindows = check(/windows|win32/)
    const isMac = check(/macintosh|mac os x/)
    const isLinux = check(/linux/)
    const chromeVersion = version(true, /\bchrome\/(\d+\.\d+)/)
    const firefoxVersion = version(true, /\bfirefox\/(\d+\.\d+)/)
    const ieVersion = version(isIE, /msie (\d+\.\d+)/)
    const operaVersion = version(isOpera, /version\/(\d+\.\d+)/)
    const safariVersion = version(isSafari, /version\/(\d+\.\d+)/)
    const webKitVersion = version(isWebKit, /webkit\/(\d+\.\d+)/)
    const isSecure = /^https/i.test(window.location.protocol)
    const emailRe =
      /^(mailto:)?([a-z0-9'\._-]+@[a-z0-9\.-]+\.[a-z0-9]{2,4})([a-яё0-9\._%+-=\? :&]*)/i
    const ipRe =
      /^(((https?)|(ftps?)):\/\/)?([\-\wа-яё]*:?[\-\wа-яё]*@)?(((1[0-9]{2}|2[0-4][0-9]|25[0-5]|[1-9][0-9]|[0-9])\.){3}(1[0-9]{2}|2[0-4][0-9]|25[0-5]|[1-9][0-9]|[0-9]))(:\d+)?(\/[%\-\wа-яё]*(\.[\wа-яё]{2,})?(([\wа-яё\-\.\?\\\/+@&#;:`~=%!,\(\)]*)(\.[\wа-яё]{2,})?)*)*\/?/i
    const hostnameRe =
      /^(((https?)|(ftps?)):\/\/)?([\-\wа-яё]*:?[\-\wа-яё]*@)?(([\-\wа-яё]+\.)+[\wа-яё\-]{2,}(:\d+)?(\/[%\-\wа-яё]*(\.[\wа-яё]{2,})?(([\wа-яё\-\.\?\\\/\+@&#;:`'~=%!,\(\)]*)(\.[\wа-яё]{2,})?)*)*\/?)/i
    const localRe =
      /^(((https?)|(ftps?)):\/\/)([\-\wа-яё]*:?[\-\wа-яё]*@)?(([\-\wа-яё]+)(:\d+)?(\/[%\-\wа-яё]*(\.[\wа-яё]{2,})?(([\wа-яё\-\.\?\\\/\+@&#;:`'~=%!,\(\)]*)(\.[\wа-яё]{2,})?)*)*\/?)/i
    const emailStrongRe =
      /(mailto:)?([a-z0-9'\.\+_-]+@[a-z0-9\.-]+\.[a-z0-9]{2,4})([a-яё0-9\._%+-=\?:&]*)/gi
    const emailAddStrongRe =
      /(mailto:|\s[@]|\s[+])?([a-z0-9'\._-]+@[a-z0-9\.-]+\.[a-z0-9]{2,4})([a-яё0-9\._%\+-=\?:&]*)/gi
    const ipStrongRe =
      /(((https?)|(ftps?)):\/\/([\-\wа-яё]*:?[\-\wа-яё]*@)?)(((1[0-9]{2}|2[0-4][0-9]|25[0-5]|[1-9][0-9]|[0-9])\.){3}(1[0-9]{2}|2[0-4][0-9]|25[0-5]|[1-9][0-9]|[0-9]))(:\d+)?(\/[%\-\wа-яё]*(\.[\wа-яё]{2,})?(([\wа-яё\-\.\?\\\/\+@&#;:`~=%!,\(\)]*)(\.[\wа-яё]{2,})?)*)*\/?/gi
    const hostnameStrongRe =
      /((((https?)|(ftps?)):\/\/([\-\wа-яё]*:?[\-\wа-яё]*@)?)|(([\-\wа-яё]*:?[\-\wа-яё]*@)?www\.))((([\-\wа-яё]+\.)+[\wа-яё\-]{2,}|([\-\wа-яё]+))(:\d+)?(\/[%\-\wа-яё]*(\.[\wа-яё]{2,})?(([\wа-яё\-\.\?\\\/\+@&#;:`~=%!,\(\)]*)(\.[\wа-яё]{2,})?)*)*\/?)/gi
    const documentSettingsType = {
      Paragraph: 0,
      Table: 1,
      Header: 2,
      TextArt: 3,
      Shape: 4,
      Image: 5,
      Slide: 6,
      Chart: 7,
      MailMerge: 8,
      Signature: 9,
      Pivot: 10,
      Cell: 11,
      Slicer: 12,
      Form: 13,
    }
    const importTextType = {
      DRM: 0,
      CSV: 1,
      TXT: 2,
      Paste: 3,
      Columns: 4,
      Data: 5,
    }
    const isMobile =
      /android|avantgo|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
        navigator.userAgent || navigator.vendor || window.opera,
      )
    let needRepaint = undefined
    const checkSize = () => {
      let scale = {}
      if (!!window.AscCommon && !!window.AscCommon.checkDeviceScale) {
        scale = window.AscCommon.checkDeviceScale()
        AscCommon.correctApplicationScale(scale)
      } else {
        const str_mq_125 =
          "screen and (-webkit-min-device-pixel-ratio: 1.25) and (-webkit-max-device-pixel-ratio: 1.49), " +
          "screen and (min-resolution: 1.25dppx) and (max-resolution: 1.49dppx)"
        const str_mq_150 =
          "screen and (-webkit-min-device-pixel-ratio: 1.5) and (-webkit-max-device-pixel-ratio: 1.74), " +
          "screen and (min-resolution: 1.5dppx) and (max-resolution: 1.74dppx)"
        const str_mq_175 =
          "screen and (-webkit-min-device-pixel-ratio: 1.75) and (-webkit-max-device-pixel-ratio: 1.99), " +
          "screen and (min-resolution: 1.75dppx) and (max-resolution: 1.99dppx)"
        const str_mq_200 =
          "screen and (-webkit-min-device-pixel-ratio: 2), " +
          "screen and (min-resolution: 2dppx), screen and (min-resolution: 192dpi)"
        const str_mq_225 =
          "screen and (-webkit-min-device-pixel-ratio: 2.25), " +
          "screen and (min-resolution: 2.25dppx), screen and (min-resolution: 216dpi)"

        if (window.matchMedia(str_mq_125).matches) {
          scale.devicePixelRatio = 1.25
        } else if (window.matchMedia(str_mq_150).matches) {
          scale.devicePixelRatio = 1.5
        } else if (window.matchMedia(str_mq_175).matches) {
          scale.devicePixelRatio = 1.75
        } else if (window.matchMedia(str_mq_200).matches) scale.devicePixelRatio = 2
        else scale.devicePixelRatio = 1

        if (window.matchMedia(str_mq_225).matches) {
          scale.devicePixelRatio = 2.25
        }
      }

      const $root = $(document.body)
      const classes = document.body.className
      const clear_list = classes.replace(/pixel-ratio__[\w-]+/gi, "").trim()
      if (scale.devicePixelRatio < 1.25) {
        if (/pixel-ratio__/.test(classes)) {
          document.body.className = clear_list
        }
      } else if (scale.devicePixelRatio < 1.5) {
        if (!/pixel-ratio__1_25/.test(classes)) {
          document.body.className = `${clear_list} pixel-ratio__1_25`
        }
      } else if (scale.devicePixelRatio < 1.75) {
        if (!/pixel-ratio__1_5/.test(classes)) {
          document.body.className = `${clear_list} pixel-ratio__1_5`
        }
      } else if (!(scale.devicePixelRatio < 1.75) && scale.devicePixelRatio < 2) {
        if (!/pixel-ratio__1_75/.test(classes)) {
          document.body.className = `${clear_list} pixel-ratio__1_75`
        }
      } else if (!(scale.devicePixelRatio < 2) && scale.devicePixelRatio < 2.25) {
        if (!/pixel-ratio__2\b/.test(classes)) {
          document.body.className = `${clear_list} pixel-ratio__2`
        }
      } else {
        // $root.addClass('pixel-ratio__2_5');
        if (!/pixel-ratio__2_5/.test(classes)) {
          document.body.className = `${clear_list} pixel-ratio__2_5`
        }
      }

      this.zoom = scale.correct ? scale.zoom : 1
      this.innerWidth = window.innerWidth * this.zoom
      this.innerHeight = window.innerHeight * this.zoom
      this.applicationPixelRatio = scale.applicationPixelRatio || scale.devicePixelRatio
      if (this.innerWidth < 1 && needRepaint === undefined) needRepaint = true
      else if (needRepaint && this.innerWidth > 0) {
        needRepaint = false
        jQuery.support?.forceStyleTests()
        Common.NotificationCenter.trigger("app:repaint")
      }
    }
    const checkSizeIE = () => {
      this.innerWidth = window.innerWidth
      this.innerHeight = window.innerHeight
    }
    const isOffsetUsedZoom = () => {
      if (isChrome && 128 <= chromeVersion) return !(this.zoom === 1)
      return false
    }
    const getBoundingClientRect = (element) => {
      const rect = _extend_object({}, element.getBoundingClientRect())
      if (!isOffsetUsedZoom()) return rect

      const koef = this.zoom
      const newRect = {}
      if (rect.x !== undefined) newRect.x = rect.x * koef
      if (rect.y !== undefined) newRect.y = rect.y * koef
      if (rect.width !== undefined) newRect.width = rect.width * koef
      if (rect.height !== undefined) newRect.height = rect.height * koef

      if (rect.left !== undefined) newRect.left = rect.left * koef
      if (rect.top !== undefined) newRect.top = rect.top * koef
      if (rect.right !== undefined) newRect.right = rect.right * koef
      if (rect.bottom !== undefined) newRect.bottom = rect.bottom * koef
      return newRect
    }
    const getOffset = ($element) => {
      const pos = _extend_object({}, $element.offset())
      if (!isOffsetUsedZoom()) return pos
      return { left: pos.left * this.zoom, top: pos.top * this.zoom }
    }
    const getPosition = ($element) => {
      const pos = _extend_object({}, $element.position())
      if (!isOffsetUsedZoom()) return pos
      return { left: pos.left * this.zoom, top: pos.top * this.zoom }
    }
    const setOffset = ($element, options) => {
      let curPosition
      let curLeft
      let curCSSTop
      let curTop
      let curOffset
      let curCSSLeft
      let calculatePosition
      const position = $element.css("position")
      const props = {}

      if (position === "static") {
        $element[0].style.position = "relative"
      }

      curOffset = getOffset($element)
      curCSSTop = $element.css("top")
      curCSSLeft = $element.css("left")
      calculatePosition =
        (position === "absolute" || position === "fixed") &&
        (curCSSTop + curCSSLeft).indexOf("auto") > -1

      if (calculatePosition) {
        curPosition = getPosition($element)
        curTop = curPosition.top
        curLeft = curPosition.left
      } else {
        curTop = Number.parseFloat(curCSSTop) || 0
        curLeft = Number.parseFloat(curCSSLeft) || 0
      }

      if (options.top != null) {
        props.top = options.top - curOffset.top + curTop
      }
      if (options.left != null) {
        props.left = options.left - curOffset.left + curLeft
      }
      $element.css(props)
      return $element
    }

    this.zoom = 1
    this.applicationPixelRatio = 1
    this.innerWidth = window.innerWidth
    this.innerHeight = window.innerHeight
    if (isIE) {
      $(document.body).addClass("ie")
      $(window).on("resize", checkSizeIE)
    } else {
      checkSize()
      $(window).on("resize", checkSize)
    }

    return {
      checkSize: checkSize,

      userAgent: userAgent,
      isStrict: isStrict,
      isIEQuirks: isIE && !isStrict && (isIE6 || isIE7 || isIE8 || isIE9),
      isOpera: isOpera,
      isOpera10_5: isOpera10_5,
      isWebKit: isWebKit,
      isChrome: isChrome,
      isSafari: isSafari,
      isSafari3: isSafari3,
      isSafari4: isSafari4,
      isSafari5: isSafari5,
      isSafari5_0: isSafari5_0,
      isSafari2: isSafari2,
      isIE: isIE,
      isIE6: isIE6,
      isIE7: isIE7,
      isIE7m: isIE6 || isIE7,
      isIE7p: isIE && !isIE6,
      isIE8: isIE8,
      isIE8m: isIE6 || isIE7 || isIE8,
      isIE8p: isIE && !(isIE6 || isIE7),
      isIE9: isIE9,
      isIE9m: isIE6 || isIE7 || isIE8 || isIE9,
      isIE9p: isIE && !(isIE6 || isIE7 || isIE8),
      isIE10: isIE10,
      isIE10m: isIE6 || isIE7 || isIE8 || isIE9 || isIE10,
      isIE10p: isIE && !(isIE6 || isIE7 || isIE8 || isIE9),
      isIE11: isIE11,
      isIE11m: isIE6 || isIE7 || isIE8 || isIE9 || isIE10 || isIE11,
      isIE11p: isIE && !(isIE6 || isIE7 || isIE8 || isIE9 || isIE10),
      isGecko: isGecko,
      isGecko3: isGecko3,
      isGecko4: isGecko4,
      isGecko5: isGecko5,
      isGecko10: isGecko10,
      isFF3_0: isFF3_0,
      isFF3_5: isFF3_5,
      isFF3_6: isFF3_6,
      isFF4: 4 <= firefoxVersion && firefoxVersion < 5,
      isFF5: 5 <= firefoxVersion && firefoxVersion < 6,
      isFF10: 10 <= firefoxVersion && firefoxVersion < 11,
      isLinux: isLinux,
      isWindows: isWindows,
      isMac: isMac,
      chromeVersion: chromeVersion,
      firefoxVersion: firefoxVersion,
      ieVersion: ieVersion,
      operaVersion: operaVersion,
      safariVersion: safariVersion,
      webKitVersion: webKitVersion,
      isSecure: isSecure,
      emailRe: emailRe,
      ipRe: ipRe,
      hostnameRe: hostnameRe,
      localRe: localRe,
      emailStrongRe: emailStrongRe,
      emailAddStrongRe: emailAddStrongRe,
      ipStrongRe: ipStrongRe,
      hostnameStrongRe: hostnameStrongRe,
      documentSettingsType: documentSettingsType,
      importTextType: importTextType,
      zoom: () => this.zoom,
      applicationPixelRatio: () => this.applicationPixelRatio,
      topOffset: 0,
      innerWidth: () => this.innerWidth,
      innerHeight: () => this.innerHeight,
      croppedGeometry: () => ({
        left: 0,
        top: Common.Utils.InternalSettings.get("window-inactive-area-top"),
        width: this.innerWidth,
        height: this.innerHeight - Common.Utils.InternalSettings.get("window-inactive-area-top"),
      }),
      getBoundingClientRect: getBoundingClientRect,
      getOffset: getOffset,
      setOffset: setOffset,
      getPosition: getPosition,
    }
  })()

  Common.Utils = _extend_object(Common.Utils, utils)

  const themecolor = new (function () {
    let initnames = true

    return {
      txtBlack: "Black",
      txtWhite: "White",
      txtRed: "Red",
      txtGreen: "Green",
      txtBlue: "Blue",
      txtYellow: "Yellow",
      txtPurple: "Purple",
      txtAqua: "Aqua",
      txtDarkRed: "Dark red",
      txtDarkGreen: "Dark green",
      txtDarkBlue: "Dark blue",
      txtDarkYellow: "Dark yellow",
      txtDarkPurple: "Dark purple",
      txtDarkTeal: "Dark teal",
      txtLightGray: "Light gray",
      txtGray: "Gray",
      txtLightBlue: "Light blue",
      txtPink: "Pink",
      txtLightYellow: "Light yellow",
      txtSkyBlue: "Sky blue",
      txtRose: "Rose",
      txtTurquosie: "Turquosie",
      txtLightGreen: "Light green",
      txtLavender: "Lavender",
      txtLightOrange: "Light orange",
      txtTeal: "Teal",
      txtGold: "Gold",
      txtOrange: "Orange",
      txtIndigo: "Indigo",
      txtBrown: "Brown",
      txtDarkGray: "Dark gray",
      txtbackground: "Background",
      txttext: "Text",
      txtaccent: "Accent",
      txtDarker: "Darker",
      txtLighter: "Lighter",
      txtBrightGreen: "Bright green",
      txtViolet: "Violet",

      ThemeValues: [6, 15, 7, 16, 0, 1, 2, 3, 4, 5],

      getTranslation: function (name) {
        if (!name) return ""

        return this[`txt${name.replace(" ", "")}`] || name
      },

      getEffectTranslation: function (value) {
        value = Number.parseInt(value * 100)
        if (value !== 0) {
          return `${value > 0 ? this.txtLighter : this.txtDarker} ${Math.abs(value)}%`
        }
        return ""
      },

      setColors: function (colors, standart_colors) {
        if (initnames) {
          for (let i = 1; i < 3; i++) {
            this[`txtbackground${i}`] = `${this.txtbackground} ${i}`
            this[`txttext${i}`] = `${this.txttext} ${i}`
          }
          for (let i = 1; i < 7; i++) {
            this[`txtaccent${i}`] = `${this.txtaccent} ${i}`
          }
          initnames = false
        }

        let i
        let j
        let item

        if (standart_colors && standart_colors.length > 0) {
          const standartcolors = []

          for (i = 0; i < standart_colors.length; i++) {
            item = {
              color: this.getHexColor(
                standart_colors[i].get_r(),
                standart_colors[i].get_g(),
                standart_colors[i].get_b(),
              ),
              tip: this.getTranslation(standart_colors[i].asc_getName()),
            }
            standartcolors.push(item)
          }

          this.standartcolors = standartcolors
        }

        const effectСolors = []

        for (i = 0; i < 6; i++) {
          for (j = 0; j < 10; j++) {
            const idx = i + j * 6
            let colorName = this.getTranslation(colors[idx].asc_getName())
            const schemeName = this.getTranslation(colors[idx].asc_getNameInColorScheme())
            const effectName = this.getEffectTranslation(colors[idx].asc_getEffectValue())
            if (colorName) {
              schemeName && (colorName += `${Common.Utils.String.textComma} ${schemeName}`)
              effectName && (colorName += `${Common.Utils.String.textComma} ${effectName}`)
            }
            item = {
              color: this.getHexColor(
                colors[idx].get_r(),
                colors[idx].get_g(),
                colors[idx].get_b(),
              ),
              effectId: idx,
              effectValue: this.ThemeValues[j],
              tip: colorName,
            }
            effectСolors.push(item)
          }
        }
        this.effectcolors = effectСolors
      },

      getEffectColors: function () {
        return this.effectcolors
      },

      getStandartColors: function () {
        return this.standartcolors
      },

      getHexColor: (r, g, b) => {
        r = r.toString(16)
        g = g.toString(16)
        b = b.toString(16)
        if (r.length === 1) r = `0${r}`
        if (g.length === 1) g = `0${g}`
        if (b.length === 1) b = `0${b}`
        return r + g + b
      },

      getRgbColor: (clr) => {
        let color = typeof clr === "object" ? clr.color : clr

        color = color.replace(/#/, "")
        if (color.length === 3) color = color.replace(/(.)/g, "$1$1")
        color = Number.parseInt(color, 16)
        const c = new Asc.asc_CColor()
        c.put_type(
          typeof clr === "object" && clr.effectId !== undefined
            ? Asc.c_oAscColor.COLOR_TYPE_SCHEME
            : Asc.c_oAscColor.COLOR_TYPE_SRGB,
        )
        c.put_r(color >> 16)
        c.put_g((color & 0xff00) >> 8)
        c.put_b(color & 0xff)
        c.put_a(0xff)
        if (clr.effectId !== undefined) c.put_value(clr.effectId)
        return c
      },

      colorValue2EffectId: function (clr) {
        if (typeof clr === "object" && clr && clr.effectValue !== undefined && this.effectcolors) {
          for (let i = 0; i < this.effectcolors.length; i++) {
            if (
              this.effectcolors[i].effectValue === clr.effectValue &&
              clr.color.toUpperCase() === this.effectcolors[i].color.toUpperCase()
            ) {
              clr.effectId = this.effectcolors[i].effectId
              break
            }
          }
        }
        return clr
      },

      selectPickerColorByEffect: (color, picker) => {
        if (!color) picker.clearSelection()
        else {
          if (typeof color === "object") {
            let isselected = false
            for (let i = 0; i < 10; i++) {
              if (Common.Utils.ThemeColor.ThemeValues[i] === color.effectValue) {
                picker.select(color, true)
                isselected = true
                break
              }
            }
            if (!isselected) picker.clearSelection()
          } else picker.select(color, true)
        }
      },
    }
  })()
  Common.Utils.ThemeColor = _extend_object(themecolor, Common.Utils.ThemeColor)

  const metrics = new (function () {
    const me = this

    me.c_MetricUnits = {
      cm: 0,
      pt: 1,
      inch: 2,
    }

    me.currentMetric = me.c_MetricUnits.pt
    me.metricName = ["Cm", "Pt", "Inch"]
    me.defaultMetric = me.c_MetricUnits.cm

    return {
      c_MetricUnits: me.c_MetricUnits,
      txtCm: "cm",
      txtPt: "pt",
      txtInch: '"',

      setCurrentMetric: (value) => {
        me.currentMetric = value
      },

      getCurrentMetric: () => me.currentMetric,

      getCurrentMetricName: function () {
        return this[`txt${me.metricName[me.currentMetric]}`]
      },

      getMetricName: function (unit) {
        return this[`txt${me.metricName[(unit !== undefined) ? unit : 0]}`]
      },

      setDefaultMetric: (value) => {
        me.defaultMetric = value
      },

      getDefaultMetric: () => me.defaultMetric,

      fnRecalcToMM: (value) => {
        // value in pt/cm/inch. need to convert to mm
        if (value !== null && value !== undefined) {
          switch (me.currentMetric) {
            case me.c_MetricUnits.cm:
              return value * 10
            case me.c_MetricUnits.pt:
              return (value * 25.4) / 72.0
            case me.c_MetricUnits.inch:
              return value * 25.4
          }
        }
        return value
      },

      fnRecalcFromMM: (value) => {
        // value in mm. need to convert to pt/cm/inch
        switch (me.currentMetric) {
          case me.c_MetricUnits.cm:
            return Number.parseFloat((value / 10).toFixed(4))
          case me.c_MetricUnits.pt:
            return Number.parseFloat(((value * 72.0) / 25.4).toFixed(3))
          case me.c_MetricUnits.inch:
            return Number.parseFloat((value / 25.4).toFixed(3))
        }
        return value
      },
    }
  })()

  Common.Utils.Metric = _extend_object(metrics, Common.Utils.Metric)

  Common.Utils.RGBColor = (colorString) => {
    let r
    let g
    let b

    if (colorString.charAt(0) === "#") {
      colorString = colorString.substr(1, 6)
    }

    colorString = colorString.replace(/ /g, "")
    colorString = colorString.toLowerCase()

    const colorDefinitions = [
      {
        re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
        //                    example: ['rgb(123, 234, 45)', 'rgb(255,234,245)'],
        process: (bits) => [
          Number.parseInt(bits[1]),
          Number.parseInt(bits[2]),
          Number.parseInt(bits[3]),
        ],
      },
      {
        re: /^hsb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
        //                    example: ['hsb(123, 34, 100)'],
        process: (bits) => {
          const rgb = {}
          let h = Math.round(bits[1])
          const s = Math.round((bits[2] * 255) / 100)
          const v = Math.round((bits[3] * 255) / 100)
          if (s === 0) {
            rgb.r = rgb.g = rgb.b = v
          } else {
            const t1 = v
            const t2 = ((255 - s) * v) / 255
            const t3 = ((t1 - t2) * (h % 60)) / 60

            if (h === 360) h = 0
            if (h < 60) {
              rgb.r = t1
              rgb.b = t2
              rgb.g = t2 + t3
            } else if (h < 120) {
              rgb.g = t1
              rgb.b = t2
              rgb.r = t1 - t3
            } else if (h < 180) {
              rgb.g = t1
              rgb.r = t2
              rgb.b = t2 + t3
            } else if (h < 240) {
              rgb.b = t1
              rgb.r = t2
              rgb.g = t1 - t3
            } else if (h < 300) {
              rgb.b = t1
              rgb.g = t2
              rgb.r = t2 + t3
            } else if (h < 360) {
              rgb.r = t1
              rgb.g = t2
              rgb.b = t1 - t3
            } else {
              rgb.r = 0
              rgb.g = 0
              rgb.b = 0
            }
          }
          return [Math.round(rgb.r), Math.round(rgb.g), Math.round(rgb.b)]
        },
      },
      {
        re: /^(\w{2})(\w{2})(\w{2})$/,
        //                    example: ['#00ff00', '336699'],
        process: (bits) => [
          Number.parseInt(bits[1], 16),
          Number.parseInt(bits[2], 16),
          Number.parseInt(bits[3], 16),
        ],
      },
      {
        re: /^(\w{1})(\w{1})(\w{1})$/,
        //                    example: ['#fb0', 'f0f'],
        process: (bits) => [
          Number.parseInt(bits[1] + bits[1], 16),
          Number.parseInt(bits[2] + bits[2], 16),
          Number.parseInt(bits[3] + bits[3], 16),
        ],
      },
    ]

    for (let i = 0; i < colorDefinitions.length; i++) {
      const re = colorDefinitions[i].re
      const processor = colorDefinitions[i].process
      const bits = re.exec(colorString)
      if (bits) {
        const channels = processor(bits)
        r = channels[0]
        g = channels[1]
        b = channels[2]
      }
    }

    r = r < 0 || Number.isNaN(r) ? 0 : r > 255 ? 255 : r
    g = g < 0 || Number.isNaN(g) ? 0 : g > 255 ? 255 : g
    b = b < 0 || Number.isNaN(b) ? 0 : b > 255 ? 255 : b

    const isEqual = (color) => r === color.r && g === color.g && b === color.b

    const toRGB = () => `rgb(${r}, ${g}, ${b})`

    const toRGBA = (alfa) => {
      if (alfa === undefined) alfa = 1
      return `rgba(${r}, ${g}, ${b}, ${alfa})`
    }

    const toHex = () => {
      let _r = r.toString(16)
      let _g = g.toString(16)
      let _b = b.toString(16)
      if (_r.length === 1) _r = `0${_r}`
      if (_g.length === 1) _g = `0${_g}`
      if (_b.length === 1) _b = `0${_b}`
      return `#${_r}${_g}${_b}`
    }

    const toHSB = () => {
      const hsb = {
        h: 0,
        s: 0,
        b: 0,
      }

      const min = Math.min(r, g, b)
      const max = Math.max(r, g, b)
      const delta = max - min
      hsb.b = max
      hsb.s = max !== 0 ? (255 * delta) / max : 0
      if (hsb.s !== 0) {
        if (r === max) {
          hsb.h = 0 + (g - b) / delta
        } else if (g === max) {
          hsb.h = 2 + (b - r) / delta
        } else {
          hsb.h = 4 + (r - g) / delta
        }
      } else {
        hsb.h = 0
      }
      hsb.h *= 60
      if (hsb.h < 0) {
        hsb.h += 360
      }
      hsb.s *= 100 / 255
      hsb.b *= 100 / 255

      hsb.h = Number.parseInt(hsb.h)
      hsb.s = Number.parseInt(hsb.s)
      hsb.b = Number.parseInt(hsb.b)

      return hsb
    }

    const isDark = () => Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b)) < 140

    return {
      r: r,
      g: g,
      b: b,
      isEqual: isEqual,
      toRGB: toRGB,
      toRGBA: toRGBA,
      toHex: toHex,
      toHSB: toHSB,
      isDark: isDark,
    }
  }

  const utilsString = new (function () {
    return {
      textCtrl: "Ctrl",
      textShift: "Shift",
      textAlt: "Alt",
      textComma: ",",

      format: (format) => {
        let args = _.toArray(arguments).slice(1)
        if (args.length && typeof args[0] === "object") args = args[0]
        return format.replace(/\{(\d+)\}/g, (s, i) => args[i])
      },

      htmlEncode: (string) => {
        return typeof _ !== "undefined"
          ? _.escape(string)
          : string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // $& means the whole matched string
      },

      htmlDecode: (string) => _.unescape(string),

      ellipsis: (value, len, word) => {
        if (value && value.length > len) {
          if (word) {
            const vs = value.substr(0, len - 2)
            const index = Math.max(
              vs.lastIndexOf(" "),
              vs.lastIndexOf("."),
              vs.lastIndexOf("!"),
              vs.lastIndexOf("?"),
            )
            if (index !== -1 && index >= len - 15) {
              return `${vs.substr(0, index)}...`
            }
          }
          return `${value.substr(0, len - 3)}...`
        }
        return value
      },

      platformKey: function (string, template, hookFn) {
        if (_.isEmpty(template)) template = " ({0})"

        if (Common.Utils.isMac) {
          if (_.isFunction(hookFn)) {
            string = hookFn.call(this, string)
          }
          return Common.Utils.String.format(
            template,
            string
              .replace(/\+(?=\S)/g, "")
              .replace(/Ctrl|ctrl/g, "⌘")
              .replace(/Alt|alt/g, "⌥")
              .replace(/Shift|shift/g, "⇧"),
          )
        }

        return Common.Utils.String.format(
          template,
          string
            .replace(/Ctrl|ctrl/g, this.textCtrl)
            .replace(/Alt|alt/g, this.textAlt)
            .replace(/Shift|shift/g, this.textShift),
        )
      },

      parseFloat: (string) => {
        typeof string === "string" && (string = string.replace(",", "."))
        return Number.parseFloat(string)
      },

      encodeSurrogateChar: (nUnicode) => {
        if (nUnicode < 0x10000) {
          return String.fromCharCode(nUnicode)
        }
        nUnicode = nUnicode - 0x10000
        const nLeadingChar = 0xd800 | (nUnicode >> 10)
        const nTrailingChar = 0xdc00 | (nUnicode & 0x3ff)
        return String.fromCharCode(nLeadingChar) + String.fromCharCode(nTrailingChar)
      },

      fixedDigits: (num, digits, fill) => {
        fill === undefined && (fill = "0")
        let strfill = ""
        const str = num.toString()
        for (let i = str.length; i < digits; i++) strfill += fill
        return strfill + str
      },
    }
  })()

  Common.Utils.String = _extend_object(utilsString, Common.Utils.String)

  Common.Utils.isBrowserSupported = () =>
    !(
      (Common.Utils.ieVersion !== 0 && Common.Utils.ieVersion < 10.0) ||
      (Common.Utils.safariVersion !== 0 && Common.Utils.safariVersion < 5.0) ||
      (Common.Utils.firefoxVersion !== 0 && Common.Utils.firefoxVersion < 4.0) ||
      (Common.Utils.chromeVersion !== 0 && Common.Utils.chromeVersion < 7.0) ||
      (Common.Utils.operaVersion !== 0 && Common.Utils.operaVersion < 10.5)
    )

  Common.Utils.showBrowserRestriction = () => {
    if (
      document.getElementsByClassName &&
      document.getElementsByClassName("app-error-panel").length > 0
    )
      return
    const editor = window.DE
      ? "Document"
      : window.SSE
        ? "Spreadsheet"
        : window.PE
          ? "Presentation"
          : window.PDFE
            ? "PDF"
            : window.VE
              ? "Visio"
              : "that"
    const newDiv = document.createElement("div")
    newDiv.innerHTML = `<div class="app-error-panel"><div class="message-block"><div class="message-inner"><div class="title">Your browser is not supported.</div><div class="text">Sorry, ${editor} Editor is currently only supported in the latest versions of the Chrome, Firefox, Safari or Internet Explorer web browsers.</div></div></div><div class="message-auxiliary"></div></div>`

    document.body.appendChild(newDiv)

    $("#loading-mask").hide().remove()
    $("#viewport").hide().remove()
  }

  Common.Utils.applyCustomization = (config, elmap) => {
    for (const name in config) {
      let $el
      if (elmap[name]) {
        $el = $(elmap[name])

        if ($el.length) {
          const item = config[name]
          if (item === false || item.visible === false) {
            $el.hide()
          } else {
            if (item.text) {
              $el.text(item.text)
            }

            if (item.visible === false) {
              $el.hide()
            }
          }
        }
      }
    }
  }

  Common.Utils.applyCustomizationPlugins = (plugins) => {
    if (!plugins || plugins.length < 1) return

    const _createXMLHTTPObject = () => {
      let xmlhttp
      if (typeof XMLHttpRequest !== "undefined") {
        xmlhttp = new XMLHttpRequest()
      } else {
        try {
          xmlhttp = new ActiveXObject("Msxml2.XMLHTTP")
        } catch (e) {
          try {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP")
          } catch (E) {
            xmlhttp = false
          }
        }
      }

      return xmlhttp
    }

    const _getPluginCode = (url) => {
      if (!url) return ""
      try {
        const xhrObj = _createXMLHTTPObject()
        if (xhrObj && url) {
          xhrObj.open("GET", url, false)
          xhrObj.send("")
          if (xhrObj.status === 200) eval(xhrObj.responseText)
        }
      } catch (e) {}
      return null
    }

    plugins.forEach((url) => {
      if (url) _getPluginCode(url)
    })
  }

  Common.Utils.fillUserInfo = (info, lang, defname, defid) => {
    const _user = info || {}
    _user.anonymous = !_user.id
    !_user.id && (_user.id = defid)
    _user.fullname = !_user.name ? defname : _user.name
    _user.group &&
      (_user.fullname =
        _user.group.toString() + AscCommon.UserInfoParser.getSeparator() + _user.fullname)
    _user.guest = !_user.name
    return _user
  }

  Common.Utils.createXhr = () => {
    let xmlhttp

    if (typeof XMLHttpRequest !== "undefined") {
      xmlhttp = new XMLHttpRequest()
    } else {
      try {
        xmlhttp = new ActiveXObject("Msxml2.XMLHTTP")
      } catch (e) {
        try {
          xmlhttp = new ActiveXObject("Microsoft.XMLHTTP")
        } catch (E) {
          xmlhttp = false
        }
      }
    }

    return xmlhttp
  }

  Common.Utils.getConfigJson = (url) => {
    if (url) {
      try {
        const xhrObj = Common.Utils.createXhr()
        if (xhrObj) {
          xhrObj.open("GET", url, false)
          xhrObj.send("")

          return JSON.parse(xhrObj.responseText)
        }
      } catch (e) {}
    }

    return null
  }

  Common.Utils.loadConfig = (url, callback) => {
    fetch(url, {
      method: "get",
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => {
        if (response.ok) return response.json()
        return "error"
      })
      .then((json) => {
        callback(json)
      })
      .catch((e) => {
        callback("error")
      })
  }

  Common.Utils.asyncCall = (callback, scope, args) => {
    new Promise((resolve, reject) => {
      resolve()
    }).then(() => {
      callback.call(scope, args)
    })
  }

  // Extend javascript String type
  String.prototype.strongMatch = function (regExp) {
    if (regExp && regExp instanceof RegExp) {
      const arr = this.toString().match(regExp)
      return !!(arr && arr.length > 0 && arr[0].length === this.length)
    }

    return false
  }

  Common.Utils.InternalSettings = new (function () {
    const settings = {}

    const _get = (name) => settings[name]
    const _set = (name, value) => {
      settings[name] = value
    }

    return {
      get: _get,
      set: _set,
    }
  })()

  Common.Utils.lockControls = (causes, lock, opts, defControls) => {
    !opts && (opts = {})

    let controls = opts.array || defControls
    opts.merge && (controls = _.union(defControls, controls))

    function doLock(cmp, cause) {
      if (cmp?.options && _.contains(cmp.options.lock, cause)) {
        const index = cmp.keepState.indexOf(cause)
        if (lock) {
          if (index < 0) {
            cmp.keepState.push(cause)
          }
        } else {
          if (!(index < 0)) {
            cmp.keepState.splice(index, 1)
          }
        }
      }
    }

    _.each(controls, (item) => {
      if (item && _.isFunction(item.setDisabled)) {
        !item.keepState && (item.keepState = [])
        if (opts.clear && opts.clear.length > 0 && item.keepState.length > 0) {
          item.keepState = _.difference(item.keepState, opts.clear)
        }

        _.isArray(causes)
          ? _.each(causes, (c) => {
              doLock(item, c)
            })
          : doLock(item, causes)

        if (!(item.keepState.length > 0)) {
          item.isDisabled() && item.setDisabled(false)
        } else {
          !item.isDisabled() && item.setDisabled(true)
        }
      }
    })
  }

  Common.Utils.injectButtons = (
    $slots,
    id,
    iconCls,
    caption,
    lock,
    split,
    menu,
    toggle,
    dataHint,
    dataHintDirection,
    dataHintOffset,
    dataHintTitle,
    action,
  ) => {
    const btnsArr = createButtonSet()
    btnsArr.setDisabled(true)
    id = id || `id-toolbar-${iconCls}`
    $slots.each((index, el) => {
      let _cls = "btn-toolbar"
      ;/x-huge/.test(el.className) && (_cls += " x-huge icon-top")

      const button = new Common.UI.Button({
        parentEl: $slots.eq(index),
        id: id + index,
        cls: _cls,
        iconCls: iconCls,
        caption: caption,
        split: split || false,
        menu: menu || false,
        enableToggle: toggle || false,
        lock: lock,
        disabled: true,
        action: action,
        dataHint: dataHint,
        dataHintDirection: dataHintDirection,
        dataHintOffset: dataHintOffset,
        dataHintTitle: dataHintTitle,
      })

      btnsArr.add(button)
    })
    return btnsArr
  }

  Common.Utils.injectComponent = ($slot, cmp) => {
    if (cmp && $slot.length) {
      cmp.rendered ? $slot.append(cmp.$el) : cmp.render($slot)
    }
  }

  Common.Utils.startFullscreenForElement = (element) => {
    if (element) {
      if (element.requestFullscreen) {
        element.requestFullscreen()
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen()
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen()
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen()
      }
    }
  }

  Common.Utils.cancelFullscreen = () => {
    if (
      !(
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      )
    )
      return
    if (document.cancelFullScreen) {
      document.cancelFullScreen()
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    }
  }

  Common.Utils.warningDocumentIsLocked = (opts) => {
    if (opts.disablefunc) opts.disablefunc(true)

    const app = window.DE || window.PE || window.SSE || window.PDFE || window.VE

    Common.UI.warning({
      msg: Common.Locale.get("warnFileLocked", {
        name: "Common.Translation",
        default: "You can't edit this file. Document is in use by another application.",
      }),
      buttons: [
        {
          value: "view",
          caption: Common.Locale.get("warnFileLockedBtnView", {
            name: "Common.Translation",
            default: "Open for viewing",
          }),
        },
        {
          value: "edit",
          caption: Common.Locale.get("warnFileLockedBtnEdit", {
            name: "Common.Translation",
            default: "Create a copy",
          }),
        },
      ],
      primary: "view",
      callback: (btn) => {
        if (btn === "edit") {
          if (opts.disablefunc) opts.disablefunc(false)
          app
            .getController("Main")
            .api.asc_setLocalRestrictions(Asc.c_oAscLocalRestrictionType.None)
        }
      },
    })
  }

  jQuery.fn.extend({
    elementById: function (id, parent) {
      /**
       * usage:   $obj.findById('#id')
       *          $().findById('#id', $obj | node)
       *          $.fn.findById('#id', $obj | node)
       *
       * return:  dom element
       * */
      let _el = document.getElementById(id.substring(1))
      if (!_el) {
        parent = parent || this
        if (parent && parent.length > 0) {
          parent.each((i, node) => {
            if (node.querySelectorAll) {
              _el = node.querySelectorAll(id)
              if (_el.length === 0) {
                if (`#${node.id}` === id) {
                  _el = node
                  return false
                }
              } else if (_el.length) {
                _el = _el[0]
                return false
              }
            }
          })
        } else {
          if (parent?.querySelectorAll) {
            _el = parent.querySelectorAll(id)
            if (_el?.length) return _el[0]
          }
        }
      }

      return _el
    },

    findById: function (id, parent) {
      const _el = $.fn.elementById.apply(this, arguments)
      return _el ? $(_el) : $()
    },
  })

  Common.Utils.InternalSettings.set("toolbar-height-tabs", 32)
  Common.Utils.InternalSettings.set("toolbar-height-tabs-top-title", 28)
  Common.Utils.InternalSettings.set(
    "toolbar-height-controls",
    Number.parseInt(
      window.getComputedStyle(document.body).getPropertyValue("--toolbar-height-controls") ||
        (Common.Utils.isIE ? 66 : 84),
    ),
  )
  Common.Utils.InternalSettings.set("document-title-height", 28)
  Common.Utils.InternalSettings.set("window-inactive-area-top", 0)

  Common.Utils.InternalSettings.set(
    "toolbar-height-compact",
    Common.Utils.InternalSettings.get("toolbar-height-tabs"),
  )
  Common.Utils.InternalSettings.set(
    "toolbar-height-normal",
    Common.Utils.InternalSettings.get("toolbar-height-tabs") +
      Common.Utils.InternalSettings.get("toolbar-height-controls"),
  )

  Common.Utils.ModalWindow = new (function () {
    let count = 0
    return {
      show: () => {
        count++
      },

      close: () => {
        count--
      },

      isVisible: () => count > 0,
    }
  })()

  Common.Utils.UserInfoParser = new (function () {
    let parse = false
    const separator = String.fromCharCode(160)
    return {
      setParser: (value) => {
        parse = !!value
      },

      getSeparator: () => separator,

      getParsedName: (username) => {
        if (parse && username) {
          return username.substring(username.indexOf(separator) + 1)
        }
        return username
      },

      getParsedGroups: (username) => {
        if (parse && username) {
          const idx = username.indexOf(separator)
          const groups = idx > -1 ? username.substring(0, idx).split(",") : []
          for (let i = 0; i < groups.length; i++) groups[i] = groups[i].trim()
          return groups
        }
        return undefined
      },
    }
  })()

  Common.Utils.getUserInitials = (username) => {
    const fio = username.split(" ")
    let initials = fio[0].substring(0, 1).toUpperCase()
    for (let i = fio.length - 1; i > 0; i--) {
      if (fio[i][0] !== "(" && fio[i][0] !== ")") {
        if (/[\u0600-\u06FF]/.test(initials)) initials += "\u2009"
        initials += fio[i].substring(0, 1).toUpperCase()
        break
      }
    }
    return initials
  }

  Common.Utils.getKeyByValue = (obj, value) => {
    for (const prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        if (obj[prop] === value) return prop
      }
    }
  }

  Common.Utils.checkComponentLoaded = (cmp) => typeof cmp === "function"

  !Common.UI && (Common.UI = {})
  Common.UI.isRTL = () => {
    if (window.isrtl === undefined) {
      if (window.nativeprocvars && window.nativeprocvars.rtl !== undefined)
        window.isrtl = window.nativeprocvars.rtl
      else window.isrtl = !Common.Utils.isIE && Common.Locale.isCurrentLanguageRtl()
    }

    return window.isrtl
  }

  Common.UI.iconsStr2IconsObj = (icons) => {
    if (typeof icons !== "string") return icons

    /*
            valid params:
            theme-type - {string} theme type (light|dark|common)
            theme-name - {string} the name of theme
            state - {string} state of icons for different situations (normal|hover|active)
            scale - {string} list of avaliable scales (100|125|150|175|200|default|*)
            extension - {string} use it after symbol "." (png|jpeg|svg)

            Example: "resources/%theme-type%(light|dark)/icon%state%(normal|hover)%scale%(default).%extension%(png)"
        */
    const params_array = {
      "theme-name": { origin: "", values: [""] },
      "theme-type": { origin: "", values: [""] },
      state: { origin: "", values: ["normal"] },
      scale: { origin: "", values: [] },
      extension: { origin: "", values: [] },
    }

    // For bug in version <= 8.2.0
    let initScaleAddon = ""

    const param_parse = (name) => {
      const posOrigin = icons.indexOf(`%${name}%`)
      if (posOrigin === -1) return
      const pos = posOrigin + name.length + 2
      const pos1 = icons.indexOf("(", pos)
      if (pos1 !== pos) return
      const pos2 = icons.indexOf(")", pos1)
      params_array[name].origin = icons.substring(posOrigin, pos2 + 1)
      params_array[name].values = icons.substring(pos1 + 1, pos2).split("|")

      if ("scale" === name && posOrigin > 0 && icons.charCodeAt(posOrigin - 1) === 47)
        initScaleAddon = "icon"
    }

    for (const name in params_array) param_parse(name)

    for (
      let styleIndex = 0, stylesLen = params_array.scale.values.length;
      styleIndex < stylesLen;
      styleIndex++
    ) {
      if ("default" === params_array.scale.values[styleIndex])
        params_array.scale.values.splice(styleIndex, 1, "100", "125", "150", "175", "200")
    }

    let rasterExt = ""
    let isSvgPresent = false

    for (
      let extIndex = 0, extsLen = params_array.extension.values.length;
      extIndex < extsLen;
      extIndex++
    ) {
      if ("svg" === params_array.extension.values[extIndex]) isSvgPresent = true
      else rasterExt = params_array.extension.values[extIndex]
    }
    if (isSvgPresent && rasterExt === "") rasterExt = "svg"

    const iconsObject = []
    for (
      let themeNameIndex = 0, themeNamesLen = params_array["theme-name"].values.length;
      themeNameIndex < themeNamesLen;
      themeNameIndex++
    ) {
      const themeName = params_array["theme-name"].values[themeNameIndex]
      for (
        let themeTypeIndex = 0, themeTypesLen = params_array["theme-type"].values.length;
        themeTypeIndex < themeTypesLen;
        themeTypeIndex++
      ) {
        let url = icons
        const themeType = params_array["theme-type"].values[themeTypeIndex]

        const obj = {}
        if ("" !== themeName) obj.theme = themeName

        if ("" !== themeType) obj.style = themeType

        if ("" !== params_array["theme-name"].origin)
          url = url.replaceAll(params_array["theme-name"].origin, themeName)
        if ("" !== params_array["theme-type"].origin)
          url = url.replaceAll(params_array["theme-type"].origin, themeType)

        let scalesLen = params_array.scale.values.length
        if (0 === scalesLen) {
          params_array.scale.values.push("100")
          scalesLen++
        }
        for (let scaleIndex = 0; scaleIndex < scalesLen; scaleIndex++) {
          let scaleValue = params_array.scale.values[scaleIndex]
          let isAll = false

          if (scaleValue.length > 0) {
            if (scaleValue === "*") isAll = true
            else if (scaleValue.charAt(scaleValue.length - 1) === "%")
              scaleValue = scaleValue.substring(0, scaleValue.length - 1)
          } else {
            isAll = true
            scaleValue = "*"
          }

          let addonScale = ""
          if (!isAll) {
            const intScale = Number.parseInt(scaleValue)
            if (intScale !== 100) {
              let addon100 = intScale % 100
              addonScale = `@${(intScale / 100) >> 0}`
              if (addon100 !== 0) {
                if (0 === addon100 % 10) addon100 /= 10
                addonScale += `.${addon100}`
              }
              addonScale += "x"
            }
            scaleValue = `${scaleValue}%`
          }

          let urlAll = url
          if (params_array.scale.origin !== "")
            urlAll = urlAll.replaceAll(params_array.scale.origin, initScaleAddon + addonScale)
          if (params_array.extension.origin !== "")
            urlAll = urlAll.replaceAll(
              params_array.extension.origin,
              isAll && isSvgPresent ? "svg" : rasterExt,
            )

          obj[scaleValue] = {}
          const states = params_array.state.values
          for (
            let stateIndex = 0, statesLen = states.length;
            stateIndex < statesLen;
            stateIndex++
          ) {
            const stateValue = params_array.state.values[stateIndex]
            if (params_array.state.origin !== "") {
              if ("normal" === stateValue) {
                const statePos = urlAll.indexOf(params_array.state.origin)
                obj[scaleValue][stateValue] = urlAll.replace(params_array.state.origin, "")
                if (obj[scaleValue][stateValue].charAt(statePos) === "/")
                  obj[scaleValue][stateValue] =
                    obj[scaleValue][stateValue].substring(0, statePos) +
                    obj[scaleValue][stateValue].substring(statePos + 1)
              } else {
                obj[scaleValue][stateValue] = urlAll.replace(
                  params_array.state.origin,
                  `_${stateValue}`,
                )
              }
            } else obj[scaleValue][stateValue] = urlAll
          }
        }
        iconsObject.push(obj)
      }
    }

    return iconsObject
  }

  Common.UI.getSuitableIcons = (icons) => {
    if (!icons) return

    icons = Common.UI.iconsStr2IconsObj(icons)
    if (icons.length && typeof icons[0] !== "string") {
      const theme = Common.UI.Themes.currentThemeId().toLowerCase()
      const style = Common.UI.Themes.isDarkTheme() ? "dark" : "light"
      let idx = -1
      for (let i = 0; i < icons.length; i++) {
        if (icons[i].theme && icons[i].theme.toLowerCase() === theme) {
          idx = i
          break
        }
      }
      if (idx < 0)
        for (let i = 0; i < icons.length; i++) {
          if (icons[i].style && icons[i].style.toLowerCase() === style) {
            idx = i
            break
          }
        }
      idx < 0 && (idx = 0)

      const ratio = Common.Utils.applicationPixelRatio() * 100
      const current = icons[idx]
      let bestDistance = 10000
      let currentDistance = 0
      let defUrl
      let bestUrl
      for (const key in current) {
        if (current.hasOwnProperty(key)) {
          if (key === "default" || key === "*") {
            defUrl = current[key]
          } else if (!Number.isNaN(Number.parseInt(key))) {
            currentDistance = Math.abs(ratio - Number.parseInt(key))
            if (currentDistance < bestDistance - 0.01) {
              bestDistance = currentDistance
              bestUrl = current[key]
            }
          }
        }
      }
      bestDistance > 0.01 && defUrl && (bestUrl = defUrl)
      return {
        normal: bestUrl ? bestUrl.normal : "",
        hover: bestUrl ? bestUrl.hover || bestUrl.normal : "",
        active: bestUrl ? bestUrl.active || bestUrl.normal : "",
      }
    }
    const url =
      icons[
        (Common.Utils.applicationPixelRatio() > 1 && icons.length > 1 ? 1 : 0) +
          (icons.length > 2 ? 2 : 0)
      ]
    return {
      normal: url,
      hover: url,
      active: url,
    }
  }

  Common.UI.simpleColorsConfig = {
    colors: [
      "1755A0",
      "D43230",
      "F5C346",
      "EA3368",
      "12A489",
      "552F8B",
      "9D1F87",
      "BB2765",
      "479ED2",
      "67C9FA",
      "3D8A44",
      "80CA3D",
      "1C19B4",
      "7F4B0F",
      "FF7E07",
      "FFFFFF",
      "D3D3D4",
      "879397",
      "575757",
      "000000",
    ],
    dynamiccolors: 5,
    themecolors: 0,
    effects: 0,
    columns: 5,
    cls: "palette-large",
    paletteWidth: 174,
  }

  Common.UI.blockOperations = {
    ApplyEditRights: -255,
    LoadingDocument: -256,
    UpdateChart: -257,
  }

  Common.UI.isValidNumber = (val) => {
    const regstr = /^\s*[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)\s*$/
    if (typeof val === "string") {
      const findComma = val.match(/,/g)
      if (findComma && findComma.length === 1) {
        val = val.replace(",", ".")
      }
    }

    return (
      typeof val === "number" ||
      !(val === "" || !regstr.test(val.trim()) || Number.isNaN(Number.parseFloat(val)))
    )
  }
})
