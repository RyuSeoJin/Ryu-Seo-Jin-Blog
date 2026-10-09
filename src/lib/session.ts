/**
 * 사이트 공통 GitHub 로그인 (giscus 세션 공유)
 *
 * giscus 는 로그인 결과를 이 사이트 브라우저 저장소의 "giscus-session" 에 둡니다.
 * 헤더에서 한 번 로그인하면 모든 글 댓글 창과 방명록이 같은 세션을 씁니다.
 * 로그인한 사람의 아이디·사진은 댓글 창이 보내주는 정보를 저장해 헤더에 보여줍니다.
 */
export const GISCUS_ORIGIN = "https://giscus.app"
const SESSION_KEY = "giscus-session"
const VIEWER_KEY = "site-viewer"

export type Viewer = { login: string; avatarUrl: string; url: string }

const safe = <T,>(fn: () => T, fallback: T): T => {
  try { return fn() } catch { return fallback }
}

export function hasSession(): boolean {
  return safe(() => !!localStorage.getItem(SESSION_KEY), false)
}

export function getViewer(): Viewer | null {
  return safe(() => JSON.parse(localStorage.getItem(VIEWER_KEY) || "null"), null)
}

export function setViewer(v: Viewer | null) {
  safe(() => (v ? localStorage.setItem(VIEWER_KEY, JSON.stringify(v)) : localStorage.removeItem(VIEWER_KEY)), undefined)
  window.dispatchEvent(new Event("sessionchange"))
}

/** 로그인 후 돌아온 주소의 ?giscus=... 를 저장하고 주소에서 지웁니다 (댓글 창이 없는 페이지용) */
export function captureSessionFromUrl(): boolean {
  const url = new URL(window.location.href)
  const s = url.searchParams.get("giscus")
  if (!s) return false
  safe(() => localStorage.setItem(SESSION_KEY, JSON.stringify(s)), undefined)
  url.searchParams.delete("giscus")
  history.replaceState(history.state, "", url.pathname + url.search + url.hash)
  window.dispatchEvent(new Event("sessionchange"))
  return true
}

/** GitHub 승인 화면으로 이동했다가 지금 페이지로 돌아옵니다 */
export function login() {
  const back = new URL(window.location.href)
  back.searchParams.delete("giscus")
  back.hash = ""
  window.location.href = `${GISCUS_ORIGIN}/api/oauth/authorize?redirect_uri=${encodeURIComponent(back.toString())}`
}

export function logout() {
  safe(() => { localStorage.removeItem(SESSION_KEY); localStorage.removeItem(VIEWER_KEY) }, undefined)
  // 댓글 창이 세션 없이 다시 열리도록 새로고침합니다
  window.location.reload()
}
