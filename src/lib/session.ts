/**
 * 사이트 공통 GitHub 로그인 (블로그 전용 GitHub App)
 *
 * 로그인 토큰은 서버가 암호화해 httpOnly 쿠키에 두고(src/lib/server/github.ts), 화면은 그 토큰을 보지 않습니다.
 * 화면에는 누가 로그인했는지(아이디·사진)만 "site-viewer" 에 기억해 헤더·댓글 창이 바로 그릴 수 있게 합니다.
 */
const VIEWER_KEY = "site-viewer"

export type Viewer = { login: string; avatarUrl: string; url: string }

const safe = <T,>(fn: () => T, fallback: T): T => {
  try { return fn() } catch { return fallback }
}

export function getViewer(): Viewer | null {
  return safe(() => JSON.parse(localStorage.getItem(VIEWER_KEY) || "null"), null)
}

export function hasSession(): boolean {
  return !!getViewer()
}

export function setViewer(v: Viewer | null) {
  const before = safe(() => localStorage.getItem(VIEWER_KEY), null)
  const after = v ? JSON.stringify(v) : null
  safe(() => (after ? localStorage.setItem(VIEWER_KEY, after) : localStorage.removeItem(VIEWER_KEY)), undefined)
  if (before !== after) window.dispatchEvent(new Event("sessionchange"))
}

/** 서버의 로그인 쿠키와 화면의 기억을 맞춥니다 (페이지를 열 때 한 번) */
let syncing: Promise<Viewer | null> | null = null
export function syncSession(): Promise<Viewer | null> {
  syncing ||= fetch("/api/comments/me")
    .then((r) => (r.ok ? r.json() : { viewer: getViewer() }))
    .then((d) => {
      setViewer(d.viewer ?? null)
      return d.viewer ?? null
    })
    .catch(() => getViewer())
    .finally(() => setTimeout(() => (syncing = null), 0))
  return syncing
}

if (typeof window !== "undefined") {
  // 서버가 로그인이 만료됐다고 알려 오면 화면에서도 로그아웃 상태로 바꿉니다
  window.addEventListener("sessionexpired", () => setViewer(null))
}

/** GitHub 로그인 화면으로 갔다가 지금 페이지(또는 returnTo 경로)로 돌아옵니다 */
export function login(returnTo?: string) {
  const here = window.location.pathname + window.location.search
  window.location.href = `/api/comments/login?return=${encodeURIComponent(returnTo || here)}`
}

export async function logout() {
  await fetch("/api/comments/logout", { method: "POST" }).catch(() => {})
  setViewer(null)
}

/** 블로그 주인(관리자)인지: 댓글 로그인 정보 또는 /admin(Decap) 로그인 정보로 판별합니다.
 *  화면에 글쓰기 버튼을 보여줄지만 정하며, 실제 저장 권한은 /admin 의 GitHub 로그인이 검사합니다. */
export function isOwner(owner: string): boolean {
  const o = owner.toLowerCase()
  const v = getViewer()
  if (v?.login?.toLowerCase() === o) return true
  return safe(() => {
    const d = JSON.parse(localStorage.getItem("decap-cms-user") || "null")
    return String(d?.login || "").toLowerCase() === o
  }, false)
}

/** 관리자 화면 주소: 새 글, 특정 글 수정 */
export const adminNewPost = "/admin#/collections/posts/new"
export const adminEditPost = (slug: string) => `/admin#/collections/posts/entries/${encodeURIComponent(slug)}`
