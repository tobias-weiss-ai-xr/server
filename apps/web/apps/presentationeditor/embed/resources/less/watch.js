;(() => {
  const path = require("node:path")
  const util = require("node:util")
  const fs = require("node:fs")
  const watchr = require("watchr")
  const less = require("less")
  const cwd = process.cwd()
  const watchPath = process.argv.length === 3 ? path.resolve(cwd, process.argv[2]) : cwd

  const options = {
    compress: false,
    yuicompress: false,
    optimization: 1,
    silent: false,
    paths: [],
    color: true,
    strictImports: false,
  }

  const parseLessFile = (input, output) => (e, data) => {
    if (e) {
      console.log("lessc:", e.message)
    }

    new less.Parser({
      paths: [path.dirname(input)],
      optimization: options.optimization,
      filename: input,
    }).parse(data, (err, tree) => {
      if (err) {
        less.writeError(err, options)
      } else {
        try {
          const css = tree.toCSS({ compress: options.compress })
          if (output) {
            const fd = fs.openSync(output, "w")
            fs.writeSync(fd, css, 0, "utf8")
          } else {
            console.log("WARNING: output is undefined")
            util.print(css)
          }
        } catch (e) {
          less.writeError(e, options)
        }
      }
    })
  }

  console.log(">>> Script is polling for changes. Press Ctrl-C to Stop.")

  watchr.watch({
    path: watchPath,
    listener: (eventName, filePath, fileCurrentStat, filePreviousStat) => {
      if (eventName === "change" || eventName === "update") {
        console.log(
          ">>> Change detected at",
          new Date().toLocaleTimeString(),
          "to:",
          path.basename(filePath),
        )

        const baseFilePath = path.basename(filePath, ".less")
        fs.readFile(filePath, "utf-8", parseLessFile(filePath, `../css/${baseFilePath}.css`))

        console.log("overwrite", `${baseFilePath}.css`)
      }
    },
    next: (err, watcher) => {
      if (err) {
        console.log("!!! epic fail")
        throw err
      }

      console.log("Now watching:", watchPath)
    },
  })
})()
