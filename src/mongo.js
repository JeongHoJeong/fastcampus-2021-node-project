// @ts-check

const { MongoClient } = require('mongodb')

const { MONGO_PASSWORD, MONGO_CLUSTER, MONGO_USER, MONGO_DBNAME } = process.env

const uri = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_CLUSTER}/${MONGO_DBNAME}?retryWrites=true&w=majority`
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

let didConnect = false

async function getUsersCollection() {
  if (!didConnect) {
    await client.connect()
    didConnect = true
  }
  return client.db().collection('users')
}

module.exports = {
  getUsersCollection,
}
