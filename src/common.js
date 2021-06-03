const HOST = 'b0eb064f57d5.ngrok.io'

/* eslint-disable prefer-destructuring */

/** @type {string} */
const FB_APP_ID = process.env.FB_APP_ID
/** @type {string} */
const FB_CLIENT_SECRET = process.env.FB_CLIENT_SECRET

/** @type {string} */
// @ts-nocheck
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID
/** @type {string} */
// @ts-nocheck
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET
const NAVER_REDIRECT_URI = `https://${HOST}/auth/naver/callback`

/** @type {string} */
// @ts-nocheck
const KAKAO_JAVASCRIPT_KEY = process.env.KAKAO_JAVASCRIPT_KEY
/** @type {string} */
// @ts-nocheck
const KAKAO_REST_KEY = process.env.KAKAO_REST_KEY
const KAKAO_REDIRECT_URI = `https://${HOST}/auth/kakao/callback`

const APP_CONFIG_JSON = JSON.stringify({
  FB_APP_ID,
  NAVER_CLIENT_ID,
  NAVER_REDIRECT_URI,
  HOST,
  KAKAO_JAVASCRIPT_KEY,
  KAKAO_REDIRECT_URI,
  KAKAO_REST_KEY,
}).replace(/"/g, '\\"')

module.exports = {
  HOST,
  FB_APP_ID,
  FB_CLIENT_SECRET,
  NAVER_CLIENT_ID,
  NAVER_CLIENT_SECRET,
  NAVER_REDIRECT_URI,
  APP_CONFIG_JSON,
  KAKAO_REDIRECT_URI,
  KAKAO_REST_KEY,
}
