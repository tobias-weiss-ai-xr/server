ace.define("ace/ext/menu_tools/settings_menu.css", ["require", "exports", "module"], (e, t, n) => {
  n.exports =
    "#ace_settingsmenu, #kbshortcutmenu {\n    background-color: #F7F7F7;\n    color: black;\n    box-shadow: -5px 4px 5px rgba(126, 126, 126, 0.55);\n    padding: 1em 0.5em 2em 1em;\n    overflow: auto;\n    position: absolute;\n    margin: 0;\n    bottom: 0;\n    right: 0;\n    top: 0;\n    z-index: 9991;\n    cursor: default;\n}\n\n.ace_dark #ace_settingsmenu, .ace_dark #kbshortcutmenu {\n    box-shadow: -20px 10px 25px rgba(126, 126, 126, 0.25);\n    background-color: rgba(255, 255, 255, 0.6);\n    color: black;\n}\n\n.ace_optionsMenuEntry:hover {\n    background-color: rgba(100, 100, 100, 0.1);\n    transition: all 0.3s\n}\n\n.ace_closeButton {\n    background: rgba(245, 146, 146, 0.5);\n    border: 1px solid #F48A8A;\n    border-radius: 50%;\n    padding: 7px;\n    position: absolute;\n    right: -8px;\n    top: -8px;\n    z-index: 100000;\n}\n.ace_closeButton{\n    background: rgba(245, 146, 146, 0.9);\n}\n.ace_optionsMenuKey {\n    color: darkslateblue;\n    font-weight: bold;\n}\n.ace_optionsMenuCommand {\n    color: darkcyan;\n    font-weight: normal;\n}\n.ace_optionsMenuEntry input, .ace_optionsMenuEntry button {\n    vertical-align: middle;\n}\n\n.ace_optionsMenuEntry button[ace_selected_button=true] {\n    background: #e7e7e7;\n    box-shadow: 1px 0px 2px 0px #adadad inset;\n    border-color: #adadad;\n}\n.ace_optionsMenuEntry button {\n    background: white;\n    border: 1px solid lightgray;\n    margin: 0px;\n}\n.ace_optionsMenuEntry button:hover{\n    background: #f0f0f0;\n}"
}),
  ace.define(
    "ace/ext/menu_tools/overlay_page",
    ["require", "exports", "module", "ace/lib/dom", "ace/ext/menu_tools/settings_menu.css"],
    (e, t, n) => {
      const r = e("../../lib/dom")
      let i = e("./settings_menu.css")
      r.importCssString(i, "settings_menu.css", !1),
        (n.exports.overlayPage = (t, n, r) => {
          function o(e) {
            e.keyCode === 27 && u()
          }
          function u() {
            if (!i) return
            document.removeEventListener("keydown", o),
              i.parentNode.removeChild(i),
              t?.focus(),
              (i = null),
              r?.()
          }
          function a(e) {
            ;(s = e), e && ((i.style.pointerEvents = "none"), (n.style.pointerEvents = "auto"))
          }
          const i = document.createElement("div")
          let s = !1
          return (
            (i.style.cssText = `margin: 0; padding: 0; position: fixed; top:0; bottom:0; left:0; right:0;z-index: 9990; ${t ? "background-color: rgba(0, 0, 0, 0.3);" : ""}`),
            i.addEventListener("click", (e) => {
              s || u()
            }),
            document.addEventListener("keydown", o),
            n.addEventListener("click", (e) => {
              e.stopPropagation()
            }),
            i.appendChild(n),
            document.body.appendChild(i),
            t?.blur(),
            { close: u, setIgnoreFocusOut: a }
          )
        })
    },
  ),
  ace.define(
    "ace/ext/menu_tools/get_editor_keyboard_shortcuts",
    ["require", "exports", "module", "ace/lib/keys"],
    (e, t, n) => {
      const r = e("../../lib/keys")
      n.exports.getEditorKeybordShortcuts = (e) => {
        const t = r.KEY_MODS
        const n = []
        const i = {}
        return (
          e.keyBinding.$handlers.forEach((e) => {
            const t = e.commandKeyBinding
            for (const r in t) {
              const s = r.replace(/(^|-)\w/g, (e) => e.toUpperCase())
              let o = t[r]
              Array.isArray(o) || (o = [o]),
                o.forEach((e) => {
                  typeof e !== "string" && (e = e.name),
                    i[e] ? (i[e].key += `|${s}`) : ((i[e] = { key: s, command: e }), n.push(i[e]))
                })
            }
          }),
          n
        )
      }
    },
  ),
  ace.define(
    "ace/ext/keybinding_menu",
    [
      "require",
      "exports",
      "module",
      "ace/editor",
      "ace/ext/menu_tools/overlay_page",
      "ace/ext/menu_tools/get_editor_keyboard_shortcuts",
    ],
    (e, t, n) => {
      function i(t) {
        if (!document.getElementById("kbshortcutmenu")) {
          const n = e("./menu_tools/overlay_page").overlayPage
          const r = e("./menu_tools/get_editor_keyboard_shortcuts").getEditorKeybordShortcuts
          const i = r(t)
          const s = document.createElement("div")
          const o = i.reduce(
            (e, t) =>
              `${e}<div class="ace_optionsMenuEntry"><span class="ace_optionsMenuCommand">${t.command}</span> : <span class="ace_optionsMenuKey">${t.key}</span></div>`,
            "",
          )
          ;(s.id = "kbshortcutmenu"),
            (s.innerHTML = `<h1>Keyboard Shortcuts</h1>${o}</div>`),
            n(t, s)
        }
      }
      const r = e("../editor").Editor
      n.exports.init = (e) => {
        ;(r.prototype.showKeyboardShortcuts = function () {
          i(this)
        }),
          e.commands.addCommands([
            {
              name: "showKeyboardShortcuts",
              bindKey: { win: "Ctrl-Alt-h", mac: "Command-Alt-h" },
              exec: (e, t) => {
                e.showKeyboardShortcuts()
              },
            },
          ])
      }
    },
  )
;(() => {
  ace.require(["ace/ext/keybinding_menu"], (m) => {
    if (typeof module === "object" && typeof exports === "object" && module) {
      module.exports = m
    }
  })
})()
