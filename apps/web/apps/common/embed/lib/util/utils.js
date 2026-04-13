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
  !common.utils && (common.utils = {})

  common.utils = new (function () {
    const userAgent = navigator.userAgent.toLowerCase()
    const check = (regex) => regex.test(userAgent)
    const version = (is, regex) => {
      let m
      return is && (m = regex.exec(userAgent)) ? Number.parseFloat(m[1]) : 0
    }
    const isOpera = check(/opera/)
    const isIE = !isOpera && (check(/msie/) || check(/trident/) || check(/edge/))
    const isChrome = !isIE && check(/\bchrome\b/)
    const chromeVersion = version(true, /\bchrome\/(\d+\.\d+)/)
    const isMac = check(/macintosh|mac os x/)
    let zoom = 1
    const checkSize = () => {
      let scale = {}
      if (!!window.AscCommon && !!window.AscCommon.checkDeviceScale) {
        scale = window.AscCommon.checkDeviceScale()
        AscCommon.correctApplicationScale(scale)
        scale.correct && (zoom = scale.zoom)
      }
    }
    const isOffsetUsedZoom = () => {
      if (isChrome && 128 <= chromeVersion) return !(zoom === 1)
      return false
    }
    const getBoundingClientRect = (element) => {
      const rect = element.getBoundingClientRect()
      if (!isOffsetUsedZoom()) return rect

      const koef = zoom
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
      const pos = $element.offset()
      if (!isOffsetUsedZoom()) return pos
      return { left: pos.left * zoom, top: pos.top * zoom }
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
    }
    const getPosition = ($element) => {
      const pos = $element.position()
      if (!isOffsetUsedZoom()) return pos
      return { left: pos.left * zoom, top: pos.top * zoom }
    }
    if (!isIE) {
      checkSize()
      $(window).on("resize", checkSize)
    }
    return {
      openLink: (url) => {
        if (url) {
          const newDocumentPage = window.open(url, "_blank")
          if (newDocumentPage) newDocumentPage.focus()
        }
      },
      dialogPrint: (url, api) => {
        $("#id-print-frame").remove()

        if (url) {
          const iframePrint = document.createElement("iframe")

          iframePrint.id = "id-print-frame"
          iframePrint.style.display = "none"
          iframePrint.style.visibility = "hidden"
          iframePrint.style.position = "fixed"
          iframePrint.style.right = "0"
          iframePrint.style.bottom = "0"
          document.body.appendChild(iframePrint)

          iframePrint.onload = () => {
            try {
              iframePrint.contentWindow.focus()
              iframePrint.contentWindow.print()
              iframePrint.contentWindow.blur()
              window.focus()
            } catch (e) {
              api.asc_DownloadAs(new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.PDF))
            }
          }

          iframePrint.src = url
        }
      },
      htmlEncode: (value) => $("<div/>").text(value).html(),

      fillUserInfo: (info, lang, defname, defid) => {
        const _user = info || {}
        _user.anonymous = !_user.id
        !_user.id && (_user.id = defid)
        _user.fullname = !_user.name ? defname : _user.name
        _user.group &&
          (_user.fullname =
            _user.group.toString() + AscCommon.UserInfoParser.getSeparator() + _user.fullname)
        _user.guest = !_user.name
        return _user
      },

      fixedDigits: (num, digits, fill) => {
        fill === undefined && (fill = "0")
        let strfill = ""
        const str = num.toString()
        for (let i = str.length; i < digits; i++) strfill += fill
        return strfill + str
      },
      getKeyByValue: (obj, value) => {
        for (const prop in obj) {
          if (obj.hasOwnProperty(prop)) {
            if (obj[prop] === value) return prop
          }
        }
      },
      getBoundingClientRect: getBoundingClientRect,
      getOffset: getOffset,
      setOffset: setOffset,
      getPosition: getPosition,
      isMac: isMac,
      isIE: isIE,
    }
  })()
})()
