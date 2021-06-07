// @ts-check

const express = require('express')
const cookieParser = require('cookie-parser')
const pino = require('pino-http')()
const helmet = require('helmet')

const app = express()
app.use(pino)
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true })) // form POST를 처리하기 위해 필요합니다.
app.set('views', 'src/views')
app.set('view engine', 'pug')

const mainRouter = require('./routers/main')
const postsRouter = require('./routers/post')
const { setupNaverLogin } = require('./oauth/naver')
const { setupKakaoLogin } = require('./oauth/kakao')
const { setupFacebookLogin } = require('./oauth/facebook')
const authMiddleware = require('./auth/middleware')

app.use(cookieParser())
app.use(authMiddleware())

setupNaverLogin(app)
setupKakaoLogin(app)
setupFacebookLogin(app)

app.use('/public', express.static('src/public'))
app.use('/posts', postsRouter)
app.use('/', mainRouter)

// @ts-ignore
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.statusCode = err.statusCode || 500
  res.send(err.message)
})

module.exports = app
