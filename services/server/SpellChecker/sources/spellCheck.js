const sockjs = require("sockjs")
const nodehun = require("nodehun")
const logger = require("./../../Common/sources/logger")
const utils = require("./../../Common/sources/utils")
const fs = require("node:fs")
const co = require("co")
const cfgSockjs = require("config").get("services.CoAuthoring.sockjs")
const languages = require("./languages")
const allLanguages = languages.allLanguages
const path = require("node:path")
const arrExistDictionaries = {}
const pathDictionaries = require("config").get("SpellChecker.server.dictDir")
const arrDictionaries = {}

function spell(type, word, id) {
  return new Promise((resolve, reject) => {
    let dict = null
    if (arrDictionaries[id]) {
      dict = arrDictionaries[id]
    } else {
      if (arrExistDictionaries[id]) {
        const pathTmp = path.join(pathDictionaries, allLanguages[id], `${allLanguages[id]}.`)

        dict = arrDictionaries[id] = new nodehun(`${pathTmp}aff`, `${pathTmp}dic`)
      }
    }

    if (dict) {
      if ("spell" === type) {
        // use setImmediate because https://github.com/nodejs/node/issues/5691
        dict.spell(word).then((isCorrect) => {
          return setImmediate(resolve, isCorrect)
        })
      } else if ("suggest" === type) {
        dict.suggest(word).then((suggestions) => {
          return setImmediate(resolve, suggestions)
        })
      }
    } else {
      return setImmediate(resolve, true)
    }
  })
}

exports.install = (server, callbackFunction) => {
  utils.listFolders(pathDictionaries, true).then((values) => {
    return co(function* () {
      let lang
      for (let i = 0; i < values.length; ++i) {
        lang = languages.sToId(path.basename(values[i]))
        if (-1 !== lang) {
          arrExistDictionaries[lang] = 1
        }
      }
      yield spell("spell", "color", 0x0409)
      callbackFunction()
    })
  })

  const sockjs_echo = sockjs.createServer(cfgSockjs)

  sockjs_echo.on("connection", (conn) => {
    if (!conn) {
      logger.error("null == conn")
      return
    }
    conn.on("data", (message) => {
      try {
        const data = JSON.parse(message)
        switch (data.type) {
          case "spellCheck":
            spellCheck(conn, data.spellCheckData)
            break
        }
      } catch (e) {
        logger.error("error receiving response: %s", e)
      }
    })
    conn.on("error", () => {
      logger.error("On error")
    })
    conn.on("close", () => {
      logger.info("Connection closed or timed out")
    })

    sendData(conn, { type: "init", languages: Object.keys(arrExistDictionaries) })
  })

  function sendData(conn, data) {
    conn.write(JSON.stringify(data))
  }

  function spellCheck(conn, data) {
    return co(function* () {
      const promises = []
      for (let i = 0, length = data.usrWords.length; i < length; ++i) {
        promises.push(spell(data.type, data.usrWords[i], data.usrLang[i]))
      }
      yield Promise.all(promises).then((values) => {
        data["spell" === data.type ? "usrCorrect" : "usrSuggest"] = values
      })
      sendData(conn, { type: "spellCheck", spellCheckData: data })
    })
  }

  sockjs_echo.installHandlers(server, {
    prefix: "/doc/[0-9-.a-zA-Z_=]*/c",
    log: (severity, message) => {
      //TODO: handle severity
      logger.info(message)
    },
  })
}
exports.spellSuggest = (type, word, lang, callbackFunction) =>
  co(function* () {
    callbackFunction(yield spell(type, word, lang))
  })
