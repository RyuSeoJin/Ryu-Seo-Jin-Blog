import type { NextApiRequest, NextApiResponse } from "next"
import crypto from "crypto"

/**
 * 웹 관리자(/admin) GitHub 로그인 1단계: GitHub 로그인 화면으로 보냅니다.
 * Vercel 환경변수 GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET 이 필요합니다.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId) {
    res.status(500).send("GITHUB_CLIENT_ID 환경변수가 설정되지 않았어요.")
    return
  }
  const state = crypto.randomBytes(16).toString("hex")
  const host = req.headers["x-forwarded-host"] || req.headers.host
  const proto = (req.headers["x-forwarded-proto"] as string) || "https"
  const redirectUri = `${proto}://${host}/api/decap/callback`
  const url = new URL("https://github.com/login/oauth/authorize")
  url.searchParams.set("client_id", clientId)
  url.searchParams.set("redirect_uri", redirectUri)
  // 공개 저장소이므로 public_repo 권한이면 충분합니다
  url.searchParams.set("scope", String(req.query.scope || "public_repo"))
  url.searchParams.set("state", state)
  res.setHeader("Set-Cookie", `decap_state=${state}; Path=/api/decap; HttpOnly; Secure; SameSite=Lax; Max-Age=600`)
  res.redirect(302, url.toString())
}
