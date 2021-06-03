// @ts-check

/* eslint-disable new-cap */
;(() => {
  const LOGIN_BUTTON_ID = 'naver-login'
  const ORIGINAL_LOGIN_BUTTON_ID = 'naver_id_login_anchor'

  // @ts-ignore
  const naver = new naver_id_login(
    // @ts-ignore
    APP_CONFIG.NAVER_CLIENT_ID,
    // @ts-ignore
    APP_CONFIG.NAVER_REDIRECT_URI
  )
  const state = naver.getUniqState()
  naver.setDomain(`https://${APP_CONFIG.HOST}/`)
  naver.setState(state)
  naver.init_naver_id_login()

  const el = document.getElementById(LOGIN_BUTTON_ID)
  if (!el) {
    throw new Error(
      `Failed to find Naver login button with ID: ${LOGIN_BUTTON_ID}`
    )
  }

  // 로그인 버튼 디자인을 커스터마이즈하기 위해 원래 디자인은 display: none으로 숨기고, 새 디자인의 버튼을 눌렀을 때 원래 버튼의 클릭 이벤트가 불리게 합니다.
  const originalButton = document.getElementById(ORIGINAL_LOGIN_BUTTON_ID)
  if (!originalButton) {
    throw new Error(
      `Failed to find original Naver login button with ID: ${ORIGINAL_LOGIN_BUTTON_ID}. Did you forget to initialize the SDK?`
    )
  }

  el.addEventListener('click', () => {
    originalButton.click()
  })
})()
