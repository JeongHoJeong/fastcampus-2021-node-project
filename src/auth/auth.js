// @ts-check

const { signJWT } = require('./jwt')
const { getUsersCollection } = require('../mongo')

/**
 * @param {string} userId
 */
async function getAccessTokenForUserId(userId) {
  return signJWT(userId)
}

/**
 * @typedef Input
 * @property {string} platformUserId
 * @property {string} platform
 * @property {string} [nickname]
 * @property {string} [profileImageURL]
 */

/**
 * @typedef Output
 * @property {string} userId
 * @property {string} accessToken
 */

/**
 * @param {Input} param0
 * @returns {Promise<Output>}
 */
async function createUserOrLogin({
  platformUserId,
  platform,
  nickname,
  profileImageURL,
}) {
  const users = await getUsersCollection()

  const existingUser = await users.findOne({
    platform,
    platformUserId,
  })

  // TODO
}

/**
 * @param {import('express').Response} res
 * @param {string} token
 */
function setAccessTokenCookie(res, token) {
  res.cookie('access_token', token, {
    httpOnly: true,
    secure: true,
  })
}

/**
 * @param {string} password
 * @returns {Promise<string>}
 */
async function encryptPassword(password) {
  return new Promise((resolve, reject) => {
    // TODO
  })
}

/**
 * @param {string} plainText
 * @param {string} password
 * @returns {Promise<boolean>}
 */
async function comparePassword(plainText, password) {
  return new Promise((resolve, reject) => {
    // TODO
  })
}

module.exports = {
  getAccessTokenForUserId,
  createUserOrLogin,
  setAccessTokenCookie,
  encryptPassword,
  comparePassword,
}
