/* Copyright (c) 2012, 2014 Hyeonje Alex Jun and other contributors
 * Licensed under the MIT License
 */
;((factory) => {
  if (typeof define === "function" && define.amd) {
    // AMD. Register as an anonymous module.
    define(["jquery"], factory)
  } else if (typeof exports === "object") {
    // Node/CommonJS
    factory(require("jquery"))
  } else {
    // Browser globals
    factory(jQuery)
  }
})(($) => {
  // The default settings for the plugin
  const defaultSettings = {
    wheelSpeed: 10,
    wheelPropagation: false,
    minScrollbarLength: null,
    useBothWheelAxes: false,
    useKeyboard: true,
    suppressScrollX: false,
    suppressScrollY: false,
    scrollXMarginOffset: 0,
    scrollYMarginOffset: 0,
    includePadding: false,
    includeMargin: true,
  }

  const getEventClassName = (() => {
    let incrementingId = 0
    return () => {
      const id = incrementingId
      incrementingId += 1
      return `.perfect-scrollbar-${id}`
    }
  })()

  $.fn.perfectScrollbar = function (suppliedSettings, option) {
    return this.each(function () {
      // Use the default settings
      const settings = $.extend(true, {}, defaultSettings)
      const $this = $(this)

      if (typeof suppliedSettings === "object") {
        // But over-ride any supplied
        $.extend(true, settings, suppliedSettings)
      } else {
        // If no settings were supplied, then the first param must be the option
        option = suppliedSettings
      }

      // Catch options

      if (option === "update") {
        if ($this.data("perfect-scrollbar-update")) {
          $this.data("perfect-scrollbar-update")()
        }
        return $this
      }
      if (option === "destroy") {
        if ($this.data("perfect-scrollbar-destroy")) {
          $this.data("perfect-scrollbar-destroy")()
        }
        return $this
      }

      if ($this.data("perfect-scrollbar")) {
        // if there's already perfect-scrollbar
        return $this.data("perfect-scrollbar")
      }

      // Or generate new perfectScrollbar

      // Set class to the container
      $this.addClass("ps-container oo")

      const $scrollbarXRail = $("<div class='ps-scrollbar-x-rail'></div>").appendTo($this)
      const $scrollbarYRail = $("<div class='ps-scrollbar-y-rail'></div>").appendTo($this)
      let $scrollbarX = $("<div class='ps-scrollbar-x'><div></div></div>").appendTo($scrollbarXRail)
      let $scrollbarY = $("<div class='ps-scrollbar-y'><div></div></div>").appendTo($scrollbarYRail)
      let scrollbarXActive
      let scrollbarYActive
      let containerWidth
      let containerHeight
      let contentWidth
      let contentHeight
      let scrollbarXWidth
      let scrollbarXLeft
      let scrollbarXBottom = Number.parseInt($scrollbarXRail.css("bottom"), 10)
      let scrollbarXRailWidth
      let scrollbarYHeight
      let scrollbarYTop
      let scrollbarYRight = Number.parseInt($scrollbarYRail.css("right"), 10)
      let scrollbarYRailHeight
      const eventClassName = getEventClassName()
      let canScrollX = false

      const updateContentScrollTop = (currentTop, deltaY) => {
        const newTop = currentTop + deltaY
        const maxTop = scrollbarYRailHeight - scrollbarYHeight

        if (newTop < 0) {
          scrollbarYTop = 0
        } else if (newTop > maxTop) {
          scrollbarYTop = maxTop
        } else {
          scrollbarYTop = newTop
        }

        const scrollTop = Number.parseInt(
          (scrollbarYTop * (contentHeight - containerHeight)) /
            (scrollbarYRailHeight - scrollbarYHeight),
          10,
        )
        $this.scrollTop(scrollTop)
        $scrollbarXRail.css({ bottom: scrollbarXBottom - scrollTop })
      }

      const updateContentScrollLeft = (currentLeft, deltaX) => {
        const maxLeft = scrollbarXRailWidth - scrollbarXWidth

        if (Common.UI.isRTL()) {
          currentLeft = maxLeft - currentLeft
          deltaX *= -1
        }

        const newLeft = currentLeft + deltaX
        if (newLeft < 0) {
          scrollbarXLeft = 0
        } else if (newLeft > maxLeft) {
          scrollbarXLeft = maxLeft
        } else {
          scrollbarXLeft = newLeft
        }

        const scrollLeft = Number.parseInt(
          (scrollbarXLeft * (contentWidth - containerWidth)) /
            (scrollbarXRailWidth - scrollbarXWidth),
          10,
        )
        $this.scrollLeft(scrollLeft * (Common.UI.isRTL() ? -1 : 1))
        $scrollbarYRail.css({ right: scrollbarYRight - scrollLeft })
        Common.UI.isRTL() && canScrollX && $scrollbarYRail.css({ left: $this.scrollLeft() + 1 })
      }

      const getSettingsAdjustedThumbSize = (thumbSize) => {
        if (settings.minScrollbarLength) {
          thumbSize = Math.max(thumbSize, settings.minScrollbarLength)
        }
        return thumbSize
      }

      let updateScrollbarCss = () => {
        $scrollbarXRail.css({
          left: Common.UI.isRTL() ? "auto" : $this.scrollLeft(),
          right: !Common.UI.isRTL() ? "auto" : -$this.scrollLeft(),
          bottom: scrollbarXBottom - $this.scrollTop(),
          width: scrollbarXRailWidth,
          display: scrollbarXActive ? "inherit" : "none",
        })

        if ($scrollbarYRail.hasClass("in-scrolling"))
          $scrollbarYRail.css({
            /*top: $this.scrollTop(),*/ right: scrollbarYRight - $this.scrollLeft(),
            height: scrollbarYRailHeight,
            display: scrollbarYActive ? "inherit" : "none",
          })
        else {
          $scrollbarYRail.css({
            top: $this.scrollTop(),
            right: scrollbarYRight - $this.scrollLeft(),
            height: scrollbarYRailHeight,
            display: scrollbarYActive ? "inherit" : "none",
          })
          Common.UI.isRTL() && canScrollX && $scrollbarYRail.css({ left: $this.scrollLeft() + 1 })
        }

        $scrollbarX?.css({
          left: Common.UI.isRTL() ? "auto" : scrollbarXLeft,
          right: !Common.UI.isRTL() ? "auto" : scrollbarXLeft,
          width: scrollbarXWidth,
        })
        $scrollbarY?.css({ top: scrollbarYTop, height: scrollbarYHeight })
      }

      const updateBarSizeAndPosition = function () {
        containerWidth = settings.includePadding ? $this.innerWidth() : $this.width()
        containerHeight = settings.includePadding ? $this.innerHeight() : $this.height()
        scrollbarYRailHeight =
          containerHeight -
          (settings.includeMargin
            ? Number.parseInt($scrollbarYRail.css("margin-top")) +
              Number.parseInt($scrollbarYRail.css("margin-bottom"))
            : 0)
        scrollbarXRailWidth =
          containerWidth -
          (settings.includeMargin
            ? Number.parseInt($scrollbarXRail.css("margin-left")) +
              Number.parseInt($scrollbarXRail.css("margin-right"))
            : 0)
        contentWidth = $this.prop("scrollWidth")
        contentHeight = $this.prop("scrollHeight")

        if (
          !settings.suppressScrollX &&
          containerWidth + settings.scrollXMarginOffset < contentWidth
        ) {
          scrollbarXActive = true
          scrollbarXWidth = getSettingsAdjustedThumbSize(
            Number.parseInt((scrollbarXRailWidth * containerWidth) / contentWidth, 10),
          )
          scrollbarXLeft = Number.parseInt(
            ($this.scrollLeft() *
              (Common.UI.isRTL() ? -1 : 1) *
              (scrollbarXRailWidth - scrollbarXWidth)) /
              (contentWidth - containerWidth),
            10,
          )
        } else {
          scrollbarXActive = false
          scrollbarXWidth = 0
          scrollbarXLeft = 0
          $this.scrollLeft(0)
        }

        if (
          !settings.suppressScrollY &&
          containerHeight + settings.scrollYMarginOffset < contentHeight
        ) {
          scrollbarYActive = true
          scrollbarYHeight = getSettingsAdjustedThumbSize(
            Number.parseInt((scrollbarYRailHeight * containerHeight) / contentHeight, 10),
          )
          scrollbarYTop = Number.parseInt(
            ($this.scrollTop() * (scrollbarYRailHeight - scrollbarYHeight)) /
              (contentHeight - containerHeight),
            10,
          )
        } else {
          scrollbarYActive = false
          scrollbarYHeight = 0
          scrollbarYTop = 0
          $this.scrollTop(0)
        }

        if (scrollbarYTop >= scrollbarYRailHeight - scrollbarYHeight) {
          scrollbarYTop = scrollbarYRailHeight - scrollbarYHeight
        }
        if (scrollbarXLeft >= scrollbarXRailWidth - scrollbarXWidth) {
          scrollbarXLeft = scrollbarXRailWidth - scrollbarXWidth
        }

        updateScrollbarCss()

        if (settings.onChange) {
          settings.onChange(this)
        }
      }

      const bindMouseScrollXHandler = () => {
        let currentLeft
        let currentPageX

        $scrollbarX.bind(`mousedown${eventClassName}`, (e) => {
          canScrollX = true
          Common.NotificationCenter.trigger("hints:clear")
          currentPageX = e.pageX * Common.Utils.zoom()
          currentLeft = Common.Utils.getPosition($scrollbarX).left
          $scrollbarXRail.addClass("in-scrolling")
          e.stopPropagation()
          e.preventDefault()
        })

        $(document).bind(`mousemove${eventClassName}`, (e) => {
          if ($scrollbarXRail.hasClass("in-scrolling")) {
            updateContentScrollLeft(currentLeft, e.pageX * Common.Utils.zoom() - currentPageX)
            e.stopPropagation()
            e.preventDefault()
          }
        })

        $(document).bind(`mouseup${eventClassName}`, (e) => {
          if ($scrollbarXRail.hasClass("in-scrolling")) {
            $scrollbarXRail.removeClass("in-scrolling")
          }
        })

        currentLeft = currentPageX = null
      }

      const bindMouseScrollYHandler = () => {
        let currentTop
        let currentPageY

        $scrollbarY.bind(`mousedown${eventClassName}`, (e) => {
          Common.NotificationCenter.trigger("hints:clear")
          currentPageY = e.pageY * Common.Utils.zoom()
          currentTop = Common.Utils.getPosition($scrollbarY).top
          $scrollbarYRail.addClass("in-scrolling")

          const margin = Number.parseInt($scrollbarYRail.css("margin-top"))
          const rect = Common.Utils.getBoundingClientRect($scrollbarYRail[0])
          $scrollbarYRail.css({
            position: "fixed",
            left: rect.left,
            top: rect.top - margin,
          })

          e.stopPropagation()
          e.preventDefault()
        })

        $(document).bind(`mousemove${eventClassName}`, (e) => {
          if ($scrollbarYRail.hasClass("in-scrolling")) {
            updateContentScrollTop(currentTop, e.pageY * Common.Utils.zoom() - currentPageY)
            e.stopPropagation()
            e.preventDefault()
          }
        })

        $(document).bind(`mouseup${eventClassName}`, (e) => {
          if ($scrollbarYRail.hasClass("in-scrolling")) {
            $scrollbarYRail.removeClass("in-scrolling")

            $scrollbarYRail.css({
              position: "",
              left: "",
              top: "",
            })

            updateScrollbarCss()
          }
        })

        currentTop = currentPageY = null
      }

      // check if the default scrolling should be prevented.
      const shouldPreventDefault = (deltaX, deltaY) => {
        const scrollTop = $this.scrollTop()
        if (deltaX === 0) {
          if (!scrollbarYActive) {
            return false
          }
          if (
            (scrollTop === 0 && deltaY > 0) ||
            (scrollTop >= contentHeight - containerHeight && deltaY < 0)
          ) {
            return !settings.wheelPropagation
          }
        }

        const scrollLeft = $this.scrollLeft()
        if (deltaY === 0) {
          if (!scrollbarXActive) {
            return false
          }
          if (
            (scrollLeft === 0 && deltaX < 0) ||
            (scrollLeft >= contentWidth - containerWidth && deltaX > 0)
          ) {
            return !settings.wheelPropagation
          }
        }
        return true
      }

      // bind handlers
      const bindMouseWheelHandler = () => {
        // FIXME: Backward compatibility.
        // After e.deltaFactor applied, wheelSpeed should have smaller value.
        // Currently, there's no way to change the settings after the scrollbar initialized.
        // But if the way is implemented in the future, wheelSpeed should be reset.
        settings.wheelSpeed /= 10

        let shouldPrevent = false
        $this.bind(
          `mousewheel${eventClassName}`,
          (e, deprecatedDelta, deprecatedDeltaX, deprecatedDeltaY) => {
            Common.NotificationCenter.trigger("hints:clear")
            const deltaX = e.deltaX * e.deltaFactor || deprecatedDeltaX
            const deltaY = e.deltaY * e.deltaFactor || deprecatedDeltaY

            if (e?.target && (e.target.type === "textarea" || e.target.type === "input")) {
              e.stopImmediatePropagation()
              e.preventDefault()

              const scroll = $(e.target).scrollTop()
              let wheelDeltaY = 0
              if (e.originalEvent) {
                if (e.originalEvent.wheelDelta) wheelDeltaY = e.originalEvent.wheelDelta
                else if (e.originalEvent.deltaY) wheelDeltaY = -e.originalEvent.deltaY * 40
                else if (e.originalEvent.detail) wheelDeltaY = e.originalEvent.detail
              } else {
                wheelDeltaY = e.wheelDelta !== undefined ? e.wheelDelta : e.deltaY
              }

              $(e.target).scrollTop(scroll - wheelDeltaY)

              return
            }

            shouldPrevent = false
            if (!settings.useBothWheelAxes) {
              // deltaX will only be used for horizontal scrolling and deltaY will
              // only be used for vertical scrolling - this is the default
              $this.scrollTop($this.scrollTop() - deltaY * settings.wheelSpeed)
              $this.scrollLeft($this.scrollLeft() + deltaX * settings.wheelSpeed)
            } else if (scrollbarYActive && !scrollbarXActive) {
              // only vertical scrollbar is active and useBothWheelAxes option is
              // active, so let's scroll vertical bar using both mouse wheel axes
              if (deltaY) {
                $this.scrollTop($this.scrollTop() - deltaY * settings.wheelSpeed)
              } else {
                $this.scrollTop($this.scrollTop() + deltaX * settings.wheelSpeed)
              }
              shouldPrevent = true
            } else if (scrollbarXActive && !scrollbarYActive) {
              // useBothWheelAxes and only horizontal bar is active, so use both
              // wheel axes for horizontal bar
              if (deltaX) {
                canScrollX = true
                $this.scrollLeft($this.scrollLeft() + deltaX * settings.wheelSpeed)
              } else {
                $this.scrollLeft($this.scrollLeft() - deltaY * settings.wheelSpeed)
              }
              shouldPrevent = true
            }

            // update bar position
            updateBarSizeAndPosition()

            shouldPrevent = shouldPrevent || shouldPreventDefault(deltaX, deltaY)
            if (shouldPrevent) {
              e.stopPropagation()
              e.preventDefault()
            }
          },
        )

        // fix Firefox scroll problem
        $this.bind(`MozMousePixelScroll${eventClassName}`, (e) => {
          if (shouldPrevent) {
            e.preventDefault()
          }
        })
      }

      const bindKeyboardHandler = () => {
        let hovered = false
        $this.bind(`mouseenter${eventClassName}`, (e) => {
          hovered = true
        })
        $this.bind(`mouseleave${eventClassName}`, (e) => {
          hovered = false
        })

        let shouldPrevent = false
        $(document).bind(`keydown${eventClassName}`, (e) => {
          if (!hovered || $(document.activeElement).is(":input,[contenteditable]")) {
            return
          }

          let deltaX = 0
          let deltaY = 0

          switch (e.which) {
            case 37: // left
              deltaX = -30
              break
            case 38: // up
              deltaY = 30
              break
            case 39: // right
              deltaX = 30
              break
            case 40: // down
              deltaY = -30
              break
            case 33: // page up
              deltaY = 90
              break
            case 32: // space bar
            case 34: // page down
              deltaY = -90
              break
            case 35: // end
              deltaY = -containerHeight
              break
            case 36: // home
              deltaY = containerHeight
              break
            default:
              return
          }

          $this.scrollTop($this.scrollTop() - deltaY)
          $this.scrollLeft($this.scrollLeft() + deltaX)

          shouldPrevent = shouldPreventDefault(deltaX, deltaY)
          if (shouldPrevent) {
            e.preventDefault()
          }
        })
      }

      const bindRailClickHandler = () => {
        const stopPropagation = (e) => {
          e.stopPropagation()
        }

        $scrollbarY.bind(`click${eventClassName}`, stopPropagation)
        $scrollbarYRail.bind(`click${eventClassName}`, (e) => {
          const halfOfScrollbarLength = Number.parseInt(scrollbarYHeight / 2, 10)
          const positionTop =
            e.pageY * Common.Utils.zoom() -
            Common.Utils.getOffset($scrollbarYRail).top -
            halfOfScrollbarLength
          const maxPositionTop = scrollbarYRailHeight - scrollbarYHeight
          let positionRatio = positionTop / maxPositionTop

          if (positionRatio < 0) {
            positionRatio = 0
          } else if (positionRatio > 1) {
            positionRatio = 1
          }

          $this.scrollTop((contentHeight - containerHeight) * positionRatio)
        })

        $scrollbarX.bind(`click${eventClassName}`, stopPropagation)
        $scrollbarXRail.bind(`click${eventClassName}`, (e) => {
          const halfOfScrollbarLength = Number.parseInt(scrollbarXWidth / 2, 10)
          const maxPositionLeft = scrollbarXRailWidth - scrollbarXWidth
          const positionLeft = Common.UI.isRTL()
            ? maxPositionLeft -
              (e.pageX * Common.Utils.zoom() - Common.Utils.getOffset($scrollbarXRail).left) +
              halfOfScrollbarLength
            : e.pageX * Common.Utils.zoom() -
              Common.Utils.getOffset($scrollbarXRail).left -
              halfOfScrollbarLength
          let positionRatio = positionLeft / maxPositionLeft
          canScrollX = true
          if (positionRatio < 0) {
            positionRatio = 0
          } else if (positionRatio > 1) {
            positionRatio = 1
          }
          $this.scrollLeft(
            (contentWidth - containerWidth) * positionRatio * (Common.UI.isRTL() ? -1 : 1),
          )
        })
      }

      // bind mobile touch handler
      const bindMobileTouchHandler = () => {
        const applyTouchMove = (differenceX, differenceY) => {
          $this.scrollTop($this.scrollTop() - differenceY)
          $this.scrollLeft($this.scrollLeft() - differenceX)

          // update bar position
          updateBarSizeAndPosition()
        }

        let startCoords = {}
        let startTime = 0
        const speed = {}
        let breakingProcess = null
        let inGlobalTouch = false

        $(window).bind(`touchstart${eventClassName}`, (e) => {
          inGlobalTouch = true
        })
        $(window).bind(`touchend${eventClassName}`, (e) => {
          inGlobalTouch = false
        })

        $this.bind(`touchstart${eventClassName}`, (e) => {
          const touch = e.originalEvent.targetTouches[0]

          startCoords.pageX = touch.pageX
          startCoords.pageY = touch.pageY

          startTime = new Date().getTime()

          if (breakingProcess !== null) {
            clearInterval(breakingProcess)
          }

          e.stopPropagation()
        })
        $this.bind(`touchmove${eventClassName}`, (e) => {
          if (!inGlobalTouch && e.originalEvent.targetTouches.length === 1) {
            const touch = e.originalEvent.targetTouches[0]

            const currentCoords = {}
            currentCoords.pageX = touch.pageX
            currentCoords.pageY = touch.pageY

            const differenceX = currentCoords.pageX - startCoords.pageX
            const differenceY = currentCoords.pageY - startCoords.pageY

            applyTouchMove(differenceX, differenceY)
            startCoords = currentCoords

            const currentTime = new Date().getTime()

            const timeGap = currentTime - startTime
            if (timeGap > 0) {
              speed.x = differenceX / timeGap
              speed.y = differenceY / timeGap
              startTime = currentTime
            }

            e.preventDefault()
          }
        })
        $this.bind(`touchend${eventClassName}`, (e) => {
          clearInterval(breakingProcess)
          breakingProcess = setInterval(() => {
            if (Math.abs(speed.x) < 0.01 && Math.abs(speed.y) < 0.01) {
              clearInterval(breakingProcess)
              return
            }

            applyTouchMove(speed.x * 30, speed.y * 30)

            speed.x *= 0.8
            speed.y *= 0.8
          }, 10)
        })
      }

      const bindScrollHandler = () => {
        $this.bind(`scroll${eventClassName}`, (e) => {
          updateBarSizeAndPosition()
        })
      }

      const destroy = () => {
        $this.unbind(eventClassName)
        $(window).unbind(eventClassName)
        $(document).unbind(eventClassName)
        $this.data("perfect-scrollbar", null)
        $this.data("perfect-scrollbar-update", null)
        $this.data("perfect-scrollbar-destroy", null)
        $scrollbarX.remove()
        $scrollbarY.remove()
        $scrollbarXRail.remove()
        $scrollbarYRail.remove()

        // clean all variables
        $scrollbarX =
          $scrollbarY =
          containerWidth =
          containerHeight =
          contentWidth =
          contentHeight =
          scrollbarXWidth =
          scrollbarXLeft =
          scrollbarXBottom =
          scrollbarYHeight =
          scrollbarYTop =
          scrollbarYRight =
            null

        canScrollX = false
      }

      const ieSupport = (version) => {
        $this.addClass("ie").addClass(`ie${version}`)

        const bindHoverHandlers = () => {
          const mouseenter = function () {
            $(this).addClass("hover")
          }
          const mouseleave = function () {
            $(this).removeClass("hover")
          }
          $this
            .bind(`mouseenter${eventClassName}`, mouseenter)
            .bind(`mouseleave${eventClassName}`, mouseleave)
          $scrollbarXRail
            .bind(`mouseenter${eventClassName}`, mouseenter)
            .bind(`mouseleave${eventClassName}`, mouseleave)
          $scrollbarYRail
            .bind(`mouseenter${eventClassName}`, mouseenter)
            .bind(`mouseleave${eventClassName}`, mouseleave)
          $scrollbarX
            .bind(`mouseenter${eventClassName}`, mouseenter)
            .bind(`mouseleave${eventClassName}`, mouseleave)
          $scrollbarY
            .bind(`mouseenter${eventClassName}`, mouseenter)
            .bind(`mouseleave${eventClassName}`, mouseleave)
        }

        const fixIe6ScrollbarPosition = () => {
          updateScrollbarCss = () => {
            $scrollbarX.css({
              left: scrollbarXLeft + $this.scrollLeft(),
              bottom: scrollbarXBottom,
              width: scrollbarXWidth,
            })
            $scrollbarY.css({
              top: scrollbarYTop + $this.scrollTop(),
              right: scrollbarYRight,
              height: scrollbarYHeight,
            })
            $scrollbarX.hide().show()
            $scrollbarY.hide().show()
          }
        }

        if (version === 6) {
          bindHoverHandlers()
          fixIe6ScrollbarPosition()
        }
      }

      const supportsTouch =
        "ontouchstart" in window ||
        (window.DocumentTouch && document instanceof window.DocumentTouch)

      const initialize = () => {
        const ieMatch = navigator.userAgent.toLowerCase().match(/(msie) ([\w.]+)/)
        if (ieMatch && ieMatch[1] === "msie") {
          // must be executed at first, because 'ieSupport' may addClass to the container
          ieSupport(Number.parseInt(ieMatch[2], 10))
        }

        updateBarSizeAndPosition()
        bindScrollHandler()
        bindMouseScrollXHandler()
        bindMouseScrollYHandler()
        bindRailClickHandler()
        if (supportsTouch) {
          bindMobileTouchHandler()
        }
        if ($this.mousewheel) {
          bindMouseWheelHandler()
        }
        if (settings.useKeyboard) {
          bindKeyboardHandler()
        }
        $this.data("perfect-scrollbar", $this)
        $this.data("perfect-scrollbar-update", updateBarSizeAndPosition)
        $this.data("perfect-scrollbar-destroy", destroy)
      }

      // initialize
      initialize()

      return $this
    })
  }
})
