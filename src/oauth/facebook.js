// @ts-check

/* eslint-disable prefer-destructuring */

const { default: fetch } = require('node-fetch')
const { getUsersCollection } = require('../mongo')
const { FB_APP_ID, FB_CLIENT_SECRET } = require('../common')
const { createUserOrLogin, setAccessTokenCookie } = require('../auth/auth')

/**
 * @param {string} accessToken
 * @returns {Promise<string>}
 */
async function getFacebookProfileFromAccessToken(accessToken) {
  // https://developers.facebook.com/docs/facebook-login/access-tokens/#generating-an-app-access-token
  // https://developers.facebook.com/docs/graph-api/reference/v10.0/debug_token
  const appAccessTokenReq = await fetch(
    `https://graph.facebook.com/oauth/access_token?client_id=${FB_APP_ID}&client_secret=${FB_CLIENT_SECRET}&grant_type=client_credentials`
  )
  const appAccessToken = (await appAccessTokenReq.json()).access_token

  const debugReq = await fetch(
    `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${appAccessToken}`
  )
  const debugResult = await debugReq.json()

  if (debugResult.data.app_id !== FB_APP_ID) {
    throw new Error('Not a valid access token.')
  }

  const facebookId = debugResult.data.user_id

  const profileRes = await fetch(
    `https://graph.facebook.com/${facebookId}?fields=id,name,picture&access_token=${accessToken}`
  )
  return profileRes.json()
}

/**
 * @param {string} facebookId
 * @returns {Promise<string | undefined>}
 */
async function getUserIdWithFacebookId(facebookId) {
  const users = await getUsersCollection()
  const user = await users.findOne({
    facebookId,
  })

  if (user) {
    return user.id
  }
  return undefined
}

/**
 * facebook 토큰을 검증하고, 해당 검증 결과로부터 우리 서비스의 유저를 만들거나,
 * 혹은 이미 있는 유저를 가져와서, 그 유저의 액세스 토큰을 돌려줍니다.
 * @param {string} token
 */
async function getUserAccessTokenForFacebookAccessToken(token) {
  const fbProfile = await getFacebookProfileFromAccessToken(token)
  const { id: facebookUserId } = fbProfile

  const res = await createUserOrLogin({
    platform: 'facebook',
    platformUserId: facebookUserId,
  })
  return res.accessToken
}

/**
 * @param {import('express').Express} app
 */
function setupFacebookLogin(app) {
  app.post('/auth/facebook/signin', async (req, res) => {
    const { access_token: fbUserAccessToken } = req.query

    if (typeof fbUserAccessToken !== 'string') {
      res.sendStatus(400)
      return
    }

    const userAccessToken = await getUserAccessTokenForFacebookAccessToken(
      fbUserAccessToken
    )
    setAccessTokenCookie(res, userAccessToken)
    res.sendStatus(200)
  })
}

module.exports = {
  getFacebookProfileFromAccessToken,
  getUserIdWithFacebookId,
  getUserAccessTokenForFacebookAccessToken,
  setupFacebookLogin,
}
