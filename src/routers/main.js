// @ts-check

const { SESV2 } = require('aws-sdk')
const express = require('express')
const { v4: uuidv4, v1: uuidv1 } = require('uuid')
const {
  setAccessTokenCookie,
  encryptPassword,
  comparePassword,
  getAccessTokenForUserId,
} = require('../auth/auth')
const { signJWT } = require('../auth/jwt')

const { APP_CONFIG_JSON, HOST } = require('../common')
const { getUsersCollection } = require('../mongo')

const ses = new SESV2()

const router = express.Router()

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

router.get('/', (req, res) => {
  if (req.user) {
    res.render('home', {
      APP_CONFIG_JSON,
    })
  } else {
    res.render('signin', {
      APP_CONFIG_JSON,
    })
  }
})

router.get('/request-reset-password', (req, res) => {
  res.render('request-reset-password', {
    APP_CONFIG_JSON,
  })
})

router.get('/reset-password', async (req, res) => {
  const { code } = req.query

  const users = await getUsersCollection()
  const user = await users.findOne({
    passwordResetCode: code,
  })

  if (!user || !user.pendingPassword) {
    res.status(400).end()
    return
  }

  const { pendingPassword } = user

  await users.updateOne(
    {
      id: user.id,
    },
    {
      $set: {
        password: pendingPassword,
        pendingPassword: null,
      },
    }
  )

  redirectWithMsg({
    res,
    dest: '/',
    info: '비밀번호가 초기화되었습니다. 바뀐 비밀번호로 로그인 해 주세요!',
  })
})

router.post('/request-reset-password', async (req, res) => {
  if (!req.body) {
    res.status(400).end()
    return
  }

  const users = await getUsersCollection()
  const { email, password } = req.body

  if (!email || !password) {
    redirectWithMsg({
      res,
      dest: '/request-reset-password',
      error: '이메일과 비밀번호를 모두 입력해 주세요.',
    })
    return
  }

  const existingUser = await users.findOne({
    email,
  })

  if (!existingUser) {
    redirectWithMsg({
      res,
      dest: '/request-reset-password',
      error: '존재하지 않는 이메일입니다.',
    })
    return
  }

  const passwordResetCode = uuidv1()

  await ses
    .sendEmail({
      Content: {
        Simple: {
          Body: {
            Text: {
              Data: `다음 링크를 눌러 비밀번호를 초기화해 주세요. https://${HOST}/reset-password?code=${passwordResetCode}`,
              Charset: 'UTF-8',
            },
          },
          Subject: {
            Data: '비밀번호 초기화',
            Charset: 'UTF-8',
          },
        },
      },
      Destination: {
        ToAddresses: [email],
      },
      FromEmailAddress: `noreply@myuniqueproject.com`,
    })
    .promise()

  await users.updateOne(
    {
      id: existingUser.id,
    },
    {
      $set: {
        pendingPassword: await encryptPassword(password),
        passwordResetCode,
      },
    }
  )

  redirectWithMsg({
    res,
    dest: '/',
    info: '비밀번호 초기화 요청이 전송되었습니다. 이메일을 확인해주세요.',
  })
})

router.get('/signup', (req, res) => {
  res.render('signup', {
    APP_CONFIG_JSON,
  })
})

router.post('/signin', async (req, res) => {
  if (!req.body) {
    redirectWithMsg({
      res,
      dest: '/',
      error: '잘못된 요청입니다.',
    })
    return
  }

  const users = await getUsersCollection()
  const { email, password } = req.body

  if (!email || !password) {
    redirectWithMsg({
      res,
      dest: '/',
      error: '이메일과 비밀번호를 모두 입력해주세요.',
    })
    return
  }

  const existingUser = await users.findOne({
    email,
  })

  if (!existingUser) {
    redirectWithMsg({
      res,
      dest: '/',
      error: '이메일 혹은 비밀번호가 일치하지 않습니다.',
    })
    return
  }

  if (await comparePassword(password, existingUser.password)) {
    const token = await getAccessTokenForUserId(existingUser.id)
    setAccessTokenCookie(res, token)

    redirectWithMsg({
      res,
      dest: '/',
      info: '로그인 되었습니다.',
    })
  } else {
    redirectWithMsg({
      res,
      dest: '/',
      error: '이메일 혹은 비밀번호가 일치하지 않습니다.',
    })
  }
})

router.get('/verify-email', async (req, res) => {
  const { code } = req.query
  if (!code) {
    res.status(400).end()
    return
  }

  const users = await getUsersCollection()
  const user = await users.findOne({ emailVerificationCode: code })

  if (!user) {
    res.status(400).end()
    return
  }

  await users.updateOne(
    {
      id: user.id,
    },
    {
      $set: {
        verified: true,
      },
    }
  )
  redirectWithMsg({
    res,
    dest: '/',
    info: '이메일이 인증되었습니다.',
  })
})

router.post('/signup', async (req, res) => {
  const users = await getUsersCollection()
  const { email, password } = req.body

  if (!email || !password) {
    redirectWithMsg({
      dest: '/signup',
      error: '이메일과 비밀번호를 모두 입력해주세요.',
      res,
    })
    return
  }

  const existingUser = await users.findOne({
    email,
  })

  if (existingUser) {
    redirectWithMsg({
      dest: '/signup',
      error: '같은 이메일이 이미 존재합니다.',
      res,
    })
    return
  }

  const newUserId = uuidv4()
  const emailVerificationCode = uuidv1()
  await ses
    .sendEmail({
      Content: {
        Simple: {
          Body: {
            Text: {
              Data: `다음 링크를 눌러 이메일 인증을 진행해 주세요. https://${HOST}/verify-email?code=${emailVerificationCode}`,
              Charset: 'UTF-8',
            },
          },
          Subject: {
            Data: '이메일 인증',
            Charset: 'UTF-8',
          },
        },
      },
      Destination: {
        ToAddresses: [email],
      },
      FromEmailAddress: `noreply@myuniqueproject.com`,
    })
    .promise()

  await users.insertOne({
    id: newUserId,
    email,
    password: await encryptPassword(password), // TODO: use encryption
    verified: false, // needs email verification
    emailVerificationCode,
  })

  setAccessTokenCookie(res, await signJWT(newUserId))
  res.redirect('/')
})

router.get('/logout', (req, res) => {
  res.clearCookie('access_token')
  res.redirect('/')
})

module.exports = router
