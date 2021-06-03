;(async () => {
  const naver = new naver_id_login(
    APP_CONFIG.NAVER_CLIENT_ID,
    APP_CONFIG.NAVER_REDIRECT_URI
  )
  const token = naver.oauthParams.access_token

  await fetch(`/auth/naver/signin?token=${token}`, {
    method: 'POST',
  })
  window.location.href = '/'
})()
