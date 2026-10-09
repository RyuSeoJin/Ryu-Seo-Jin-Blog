import crypto from "crypto"
import type { NextApiRequest, NextApiResponse } from "next"
import { cookie, fail, safeReturn, seal } from "src/lib/server/github"

/** GET /api/comments/login?return=/글주소 → GitHub 로그인 화면으로 보냅니다 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const state = crypto.randomBytes(16).toString("hex")
    const clientId = process.env.GITHUB_APP_CLIENT_ID
    if (!clientId) return res.status(503).setHeader("Content-Type", "text/plain; charset=utf-8").send("댓글 로그인 설정이 아직 끝나지 않았어요.")
    res.setHeader("Set-Cookie", cookie("rsj_oauth", seal({ s: state, r: safeReturn(req.query.return) }), 600))
    const proto = (req.headers["x-forwarded-proto"] as string) || "http"
    const redirect = `${proto}://${req.headers.host}/api/comments/callback`
    res.redirect(302, `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirect)}&state=${state}`)
  } catch (e) {
    fail(res, e)
  }
}
