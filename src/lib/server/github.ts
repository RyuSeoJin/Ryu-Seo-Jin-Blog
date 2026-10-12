/**
 * 블로그 자체 댓글의 서버 쪽 (API 라우트에서만 씁니다).
 *
 * - 댓글은 지금처럼 GitHub Discussions 에 저장합니다. 글 하나 = 토론 하나(제목은 글 주소), 방명록 = "guestbook" 토론.
 * - 방문자 로그인은 블로그 전용 GitHub App 으로 하고, 받은 토큰은 암호화해 httpOnly 쿠키에만 둡니다.
 * - 로그인하지 않은 방문자에게 댓글을 보여주거나 새 토론을 만들 때는 App 설치 토큰을 씁니다.
 *
 * 필요한 Vercel 환경 변수: GITHUB_COMMENTAPP_ID, GITHUB_COMMENTAPP_CLIENT_ID, GITHUB_COMMENTAPP_CLIENT_SECRET, GITHUB_COMMENTAPP_PRIVATE_KEY
 */
import crypto from "crypto"
import fs from "fs"
import path from "path"
import type { NextApiRequest, NextApiResponse } from "next"
import { CONFIG } from "site.config"

const [OWNER, NAME] = CONFIG.giscus.repo.split("/")
const REPO_ID = CONFIG.giscus.repoId
const CATEGORY_ID = CONFIG.giscus.categoryId
const env = (k: string) => {
  const v = process.env[k]
  if (!v) throw new HttpError(503, "댓글 설정이 아직 끝나지 않았어요.")
  return v
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

// ── 쿠키 암호화 (AES-256-GCM, 키는 App client secret 에서 만듭니다) ──
const key = () => crypto.createHash("sha256").update(`comments:${env("GITHUB_COMMENTAPP_CLIENT_SECRET")}`).digest()
export function seal(data: object): string {
  const iv = crypto.randomBytes(12)
  const c = crypto.createCipheriv("aes-256-gcm", key(), iv)
  const enc = Buffer.concat([c.update(JSON.stringify(data), "utf8"), c.final()])
  return Buffer.concat([iv, c.getAuthTag(), enc]).toString("base64url")
}
export function unseal<T>(s: string | undefined): T | null {
  if (!s) return null
  try {
    const b = Buffer.from(s, "base64url")
    const d = crypto.createDecipheriv("aes-256-gcm", key(), b.subarray(0, 12))
    d.setAuthTag(b.subarray(12, 28))
    return JSON.parse(Buffer.concat([d.update(b.subarray(28)), d.final()]).toString("utf8"))
  } catch {
    return null
  }
}

export function getCookie(req: NextApiRequest, name: string): string | undefined {
  const m = (req.headers.cookie || "").match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))
  return m?.[1]
}
export function cookie(name: string, value: string, maxAge: number): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : ""
  return `${name}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure}`
}

// ── 방문자 로그인 정보 ──
export const AUTH_COOKIE = "rsj_auth"
const AUTH_MAX_AGE = 60 * 60 * 24 * 180
type Auth = { t: string; r?: string; e?: number; l: string; a: string }
export type Viewer = { login: string; avatarUrl: string; url: string }

async function oauthToken(params: Record<string, string>) {
  const r = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: env("GITHUB_COMMENTAPP_CLIENT_ID"), client_secret: env("GITHUB_COMMENTAPP_CLIENT_SECRET"), ...params }),
  })
  const d = await r.json()
  if (!d.access_token) throw new HttpError(401, d.error_description || "GitHub 로그인에 실패했어요.")
  return d as { access_token: string; refresh_token?: string; expires_in?: number }
}

/** 로그인 콜백: code 를 토큰으로 바꾸고 쿠키에 담습니다 */
export async function signIn(res: NextApiResponse, code: string): Promise<Viewer> {
  const tok = await oauthToken({ code })
  const u = await fetch("https://api.github.com/user", { headers: { Authorization: `Bearer ${tok.access_token}`, Accept: "application/vnd.github+json" } }).then((r) => r.json())
  if (!u.login) throw new HttpError(401, "GitHub 계정 정보를 받지 못했어요.")
  const auth: Auth = { t: tok.access_token, r: tok.refresh_token, e: tok.expires_in ? Date.now() + tok.expires_in * 1000 : undefined, l: u.login, a: u.avatar_url }
  res.appendHeader("Set-Cookie", cookie(AUTH_COOKIE, seal(auth), AUTH_MAX_AGE))
  return toViewer(auth)
}

export function signOut(res: NextApiResponse) {
  res.appendHeader("Set-Cookie", cookie(AUTH_COOKIE, "", 0))
}

const toViewer = (a: Auth): Viewer => ({ login: a.l, avatarUrl: a.a, url: `https://github.com/${a.l}` })

/** 쿠키의 로그인 정보. 토큰이 만료됐으면 새로 받아 쿠키도 바꿉니다. 로그인 전이면 null. */
export async function getAuth(req: NextApiRequest, res: NextApiResponse): Promise<{ token: string; viewer: Viewer } | null> {
  const a = unseal<Auth>(getCookie(req, AUTH_COOKIE))
  if (!a) return null
  if (a.e && Date.now() > a.e - 60_000) {
    if (!a.r) return null
    try {
      const tok = await oauthToken({ grant_type: "refresh_token", refresh_token: a.r })
      a.t = tok.access_token
      a.r = tok.refresh_token ?? a.r
      a.e = tok.expires_in ? Date.now() + tok.expires_in * 1000 : undefined
      res.appendHeader("Set-Cookie", cookie(AUTH_COOKIE, seal(a), AUTH_MAX_AGE))
    } catch {
      signOut(res)
      return null
    }
  }
  return { token: a.t, viewer: toViewer(a) }
}

// ── App 설치 토큰 (로그인 전 방문자용 읽기, 새 토론 만들기) ──
let appTok: { token: string; until: number } | null = null
const b64url = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url")
export async function appToken(): Promise<string> {
  if (appTok && Date.now() < appTok.until) return appTok.token
  const now = Math.floor(Date.now() / 1000)
  const unsigned = `${b64url({ alg: "RS256", typ: "JWT" })}.${b64url({ iat: now - 60, exp: now + 540, iss: env("GITHUB_COMMENTAPP_ID") })}`
  const pem = env("GITHUB_COMMENTAPP_PRIVATE_KEY").replace(/\\n/g, "\n")
  const jwt = `${unsigned}.${crypto.createSign("RSA-SHA256").update(unsigned).sign(pem, "base64url")}`
  const h = { Authorization: `Bearer ${jwt}`, Accept: "application/vnd.github+json" }
  const inst = await fetch(`https://api.github.com/repos/${OWNER}/${NAME}/installation`, { headers: h }).then((r) => r.json())
  if (!inst.id) throw new HttpError(503, "블로그 저장소에 댓글 앱이 설치되지 않았어요.")
  const t = await fetch(`https://api.github.com/app/installations/${inst.id}/access_tokens`, { method: "POST", headers: h }).then((r) => r.json())
  if (!t.token) throw new HttpError(503, "댓글 앱 토큰을 받지 못했어요.")
  appTok = { token: t.token, until: Date.now() + 50 * 60 * 1000 }
  return t.token
}

export async function gql<T = any>(token: string, query: string, variables: object = {}): Promise<T> {
  const r = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  })
  if (r.status === 401) throw new HttpError(401, "로그인이 만료됐어요. 다시 로그인해 주세요.")
  const d = await r.json()
  if (d.errors?.length) {
    console.error("[comments] github graphql error:", r.status, JSON.stringify(d.errors).slice(0, 500))
    throw new HttpError(400, `GitHub 오류 (${d.errors[0].type || r.status}): ${d.errors[0].message}`)
  }
  if (!r.ok || !d.data) {
    console.error("[comments] github graphql http error:", r.status, JSON.stringify(d).slice(0, 300))
    throw new HttpError(502, `GitHub 응답 오류 (${r.status}): ${d.message || "알 수 없음"}`)
  }
  return d.data
}

// ── 토론 찾기·만들기 ──
let titles: { map: Map<string, string>; until: number } | null = null
async function discussionIds(force = false): Promise<Map<string, string>> {
  if (!force && titles && Date.now() < titles.until) return titles.map
  const map = new Map<string, string>()
  const token = await appToken()
  let after: string | null = null
  do {
    const d: any = await gql(token, `query($o:String!,$n:String!,$c:ID!,$a:String){repository(owner:$o,name:$n){discussions(first:100,categoryId:$c,after:$a){pageInfo{hasNextPage endCursor} nodes{id title}}}}`, { o: OWNER, n: NAME, c: CATEGORY_ID, a: after })
    const page = d.repository.discussions
    for (const x of page.nodes) if (!map.has(x.title)) map.set(x.title, x.id)
    after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null
  } while (after)
  titles = { map, until: Date.now() + 60_000 }
  return map
}

/** 댓글을 달 수 있는 이름인지: 방명록이거나 실제 있는 글 주소 */
export function validTerm(term: unknown): term is string {
  if (typeof term !== "string" || !/^[a-z0-9][a-z0-9-]{0,120}$/i.test(term)) return false
  if (term === "guestbook") return true
  return fs.existsSync(path.join(process.cwd(), "content", "posts", `${term}.md`))
}

export async function findDiscussion(term: string): Promise<string | null> {
  return (await discussionIds()).get(term) ?? null
}

/** 첫 댓글이 달릴 때 토론을 만듭니다 (공지 분류는 관리자만 글을 열 수 있어 App 토큰으로 만듭니다) */
export async function ensureDiscussion(term: string): Promise<string> {
  const found = (await discussionIds(true)).get(term)
  if (found) return found
  const url = `${CONFIG.link}/${term}`
  const body = `# ${term}\n\n${CONFIG.blog.description}\n\n${url}\n\n<!-- sha1: ${crypto.createHash("sha1").update(term).digest("hex")} -->`
  const d = await gql(await appToken(), `mutation($r:ID!,$c:ID!,$t:String!,$b:String!){createDiscussion(input:{repositoryId:$r,categoryId:$c,title:$t,body:$b}){discussion{id}}}`, { r: REPO_ID, c: CATEGORY_ID, t: term, b: body })
  const id = d.createDiscussion.discussion.id
  titles?.map.set(term, id)
  return id
}

/** 로그인 후 돌아갈 곳: 사이트 내부 경로만 받습니다 */
export const safeReturn = (r: unknown) => (typeof r === "string" && r.startsWith("/") && !r.startsWith("//") && !r.startsWith("/\\") ? r : "/")

/** 쓰기 요청이 이 사이트에서 온 것인지 */
export function sameOrigin(req: NextApiRequest): boolean {
  const origin = req.headers.origin
  return !origin || origin === `https://${req.headers.host}` || origin === `http://${req.headers.host}`
}

export function fail(res: NextApiResponse, e: unknown) {
  const status = e instanceof HttpError ? e.status : 500
  // Vercel 로그에서 원인을 찾을 수 있게 남깁니다
  console.error("[comments] request failed:", status, e instanceof Error ? e.message : e)
  if (status === 401) signOut(res)
  res.status(status).json({ error: e instanceof Error ? e.message : "알 수 없는 오류가 났어요." })
}
