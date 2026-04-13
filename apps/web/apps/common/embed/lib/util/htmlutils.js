const isIE = /msie|trident/i.test(navigator.userAgent)

const checkLocalStorage = (() => {
  try {
    const storage = window.localStorage
    return true
  } catch (e) {
    return false
  }
})()

if (!window.lang) {
  window.lang = /(?:&|^)lang=([^&]+)&?/i.exec(window.location.search.substring(1))
  window.lang = window.lang ? window.lang[1] : ""
}
window.lang && (window.lang = window.lang.split(/[\-\_]/)[0].toLowerCase())

const isLangRtl = (lang) => lang && /^(ar|he|ur)$/i.test(lang)

let ui_rtl = false
if (window.nativeprocvars && window.nativeprocvars.rtl !== undefined) {
  ui_rtl = window.nativeprocvars.rtl
} else {
  if (isLangRtl(lang))
    if (checkLocalStorage && localStorage.getItem("ui-rtl") !== null)
      ui_rtl = localStorage.getItem("ui-rtl") === "1"
    else ui_rtl = true
}

if (ui_rtl && !isIE) {
  document.body.setAttribute("dir", "rtl")
  document.body.classList.add("rtl")
}
if (isLangRtl(lang)) {
  document.body.classList.add("rtl-font")
}
document.body.setAttribute("applang", lang)

window.isrtl = window.getComputedStyle(document.body).direction === "rtl"
