// @ts-check

/**
 * @param {Object.<string, *>} query
 * @returns {string}
 */
function makeQueryString(query) {
  const keys = Object.keys(query)
  return keys
    .map((key) => [key, query[key]])
    .filter(([, value]) => value)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join('&')
}

/**
 * @typedef RedirectInfo
 * @property {import('express').Response} res
 * @property {string} dest
 * @property {string} [error]
 * @property {string} [info]
 */

/**
 * @param {RedirectInfo} param0
 */
function redirectWithMsg({ res, dest, error, info }) {
  res.redirect(`${dest}?${makeQueryString({ info, error })}`)
}

module.exports = {
  redirectWithMsg,
}
