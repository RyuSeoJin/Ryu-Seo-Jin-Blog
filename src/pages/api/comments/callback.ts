import type { NextApiRequest, NextApiResponse } from "next"
import { cookie, getCookie, safeReturn, signIn, unseal } from "src/lib/server/github"

/** GET /api/comments/callback?code&state → 로그인 마무리 후 원래 보던 화면으로 돌아갑니다 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const saved = unseal<{ s: string; r: string }>(getCookie(req, "rsj_oauth"))
  res.setHeader("Set-Cookie", cookie("rsj_oauth", "", 0))
  const back = safeReturn(saved?.r)
  const { code, state } = req.query
  if (!saved || typeof code !== "string" || state !== saved.s) return res.redirect(302, back)
  try {
    await signIn(res, code)
  } catch {
    // 실패하면 로그인 전 상태로 원래 화면에 돌아갑니다
  }
  res.redirect(302, back)
}
