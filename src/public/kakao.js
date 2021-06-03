// @ts-check

// https://developers.kakao.com/docs/latest/ko/getting-started/sdk-js
;(() => {
  Kakao.init(APP_CONFIG.KAKAO_JAVASCRIPT_KEY)

  const el = document.getElementById('kakao-login')
  if (!el) {
    console.error('Kakao login button not found.')
    return
  }
  el.addEventListener('click', () => {
    Kakao.Auth.authorize({
      redirectUri: APP_CONFIG.KAKAO_REDIRECT_URI,
    })
  })
})()
