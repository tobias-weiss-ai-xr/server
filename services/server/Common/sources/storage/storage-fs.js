const { cp, rm, mkdir } = require("node:fs/promises")
const { stat, readFile, writeFile } = require("node:fs/promises")
const path = require("node:path")
const utils = require("../utils")
const { pipeline } = require("node:stream/promises")

function getFilePath(storageCfg, strPath) {
  const storageFolderPath = storageCfg.fs.folderPath
  return path.join(storageFolderPath, strPath)
}
function getOutputPath(strPath) {
  return strPath.replace(/\\/g, "/")
}

async function headObject(storageCfg, strPath) {
  const fsPath = getFilePath(storageCfg, strPath)
  const stats = await stat(fsPath)
  return { ContentLength: stats.size }
}

async function getObject(storageCfg, strPath) {
  const fsPath = getFilePath(storageCfg, strPath)
  return await readFile(fsPath)
}

async function createReadStream(storageCfg, strPath) {
  const fsPath = getFilePath(storageCfg, strPath)
  const stats = await stat(fsPath)
  const contentLength = stats.size
  const readStream = await utils.promiseCreateReadStream(fsPath)
  return {
    contentLength,
    readStream,
  }
}

async function putObject(storageCfg, strPath, buffer, _contentLength) {
  const fsPath = getFilePath(storageCfg, strPath)
  await mkdir(path.dirname(fsPath), { recursive: true })

  if (Buffer.isBuffer(buffer)) {
    await writeFile(fsPath, buffer)
  } else {
    const writable = await utils.promiseCreateWriteStream(fsPath)
    await pipeline(buffer, writable)
  }
}

async function uploadObject(storageCfg, strPath, filePath) {
  const fsPath = getFilePath(storageCfg, strPath)
  await cp(filePath, fsPath, { force: true, recursive: true })
}

async function copyObject(storageCfgSrc, storageCfgDst, sourceKey, destinationKey) {
  const fsPathSource = getFilePath(storageCfgSrc, sourceKey)
  const fsPathDestination = getFilePath(storageCfgDst, destinationKey)
  await cp(fsPathSource, fsPathDestination, { force: true, recursive: true })
}

async function listObjects(storageCfg, strPath) {
  const storageFolderPath = storageCfg.fs.folderPath
  const fsPath = getFilePath(storageCfg, strPath)
  const values = await utils.listObjects(fsPath)
  return values.map((curvalue) => {
    return getOutputPath(curvalue.substring(storageFolderPath.length + 1))
  })
}

async function deleteObject(storageCfg, strPath) {
  const fsPath = getFilePath(storageCfg, strPath)
  return rm(fsPath, { force: true, recursive: true })
}

async function deletePath(storageCfg, strPath) {
  const fsPath = getFilePath(storageCfg, strPath)
  return rm(fsPath, { force: true, recursive: true, maxRetries: 3 })
}

function needServeStatic() {
  return true
}

module.exports = {
  headObject,
  getObject,
  createReadStream,
  putObject,
  uploadObject,
  copyObject,
  listObjects,
  deleteObject,
  deletePath,
  needServeStatic,
}
