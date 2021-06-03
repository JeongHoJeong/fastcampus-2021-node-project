// @ts-check

const { verifyJWT } = require('./jwt')
const { getUsersCollection } = require('../mongo')

/** @returns {import('express').RequestHandler} */
function authMiddleware() {
  return async (req, res, next) => {
    /* eslint-disable camelcase */
    const { access_token } = req.cookies
    if (access_token) {
      /** @type {string} */
      try {
        const userId = await verifyJWT(access_token)
        if (userId) {
          const users = await getUsersCollection()
          const user = await users.findOne({
            id: userId,
          })
          if (user) {
            // @ts-ignore
            req.user = user
          }
        }
      } catch (e) {
        console.log('Invalid token', e)
      }
    }
    next()
  }
}

module.exports = authMiddleware
