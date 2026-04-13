const mongoDB = require("mongodb")
const config = require("./config.json")
const _errorConnection = true

const logger = require("./../../Common/sources/logger")

function CreateDbClient() {
  return new mongoDB.Db(
    config.mongodb.database,
    new mongoDB.Server(config.mongodb.host, config.mongodb.port, { auto_reconnect: true }),
    { safe: false },
  )
}
exports.insert = (_collectionName, _newElement) => {
  const _db = CreateDbClient()
  if (!_db) {
    logger.error("Error _db")
    return
  }

  _db.open((err, db) => {
    if (!err) {
      // open collection. If it doesn't exist, it will be created
      db.collection(_collectionName, (err, collection) => {
        if (!err) {
          collection.insert(_newElement)
        } else {
          logger.error("Error collection")
          return
        }

        db.close()
      })
    } else {
      logger.error("Error open database")
    }
  })
}
exports.remove = (_collectionName, _removeElements) => {
  const _db = CreateDbClient()
  if (!_db) {
    logger.error("Error _db")
    return
  }

  // Opening the database
  _db.open((err, db) => {
    if (!err) {
      // open collection. If it doesn't exist, it will be created
      db.collection(_collectionName, (err, collection) => {
        if (!err) {
          collection.remove(_removeElements, (_err, _collection) => {
            logger.info("All elements remove")
          })
        } else {
          logger.error("Error collection")
          return
        }

        db.close()
      })
    } else {
      logger.error("Error open database")
    }
  })
}
exports.load = (_collectionName, callbackFunction) => {
  const _db = CreateDbClient()
  if (!_db) {
    logger.error("Error _db")
    return callbackFunction(null)
  }

  const result = []

  // opening database
  _db.open((err, db) => {
    // open collection. If it doesn't exist, it will be created
    db.collection(_collectionName, (err, collection) => {
      // Get all elements of a collection with find()
      collection.find((err, cursor) => {
        cursor.each((err, item) => {
          // Null denotes the last element
          if (item != null) {
            if (!Object.hasOwn(result, item.docid)) {
              result[item.docid] = [item]
            } else {
              result[item.docid].push(item)
            }
          } else {
            callbackFunction(result)
          }
        })

        db.close()
      })
    })
  })
}
