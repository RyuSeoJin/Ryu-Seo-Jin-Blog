import type { NextApiRequest, NextApiResponse } from "next"
import { cookie, getCookie, safeReturn, signIn, unseal } from "src/lib/server/github"

/** GET /api/comments/callback?code&state → 로그인 마무리 후 원래 보던 화면으로 돌아갑니다.
 *  실패하면 원래 화면 주소에 ?login_error=이유 를 붙여 화면이 알려 주게 합니다. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const saved = unseal<{ s: string; r: string }>(getCookie(req, "rsj_oauth"))
  res.setHeader("Set-Cookie", cookie("rsj_oauth", "", 0))
  const back = safeReturn(saved?.r)
  const withError = (why: string) => `${back}${back.includes("?") ? "&" : "?"}login_error=${encodeURIComponent(why)}`
  const { code, state, error, error_description } = req.query
  if (typeof error === "string") {
    console.error("[comments/callback] github error:", error, error_description)
    return res.redirect(302, withError(String(error_description || error)))
  }
  if (!saved) {
    console.error("[comments/callback] missing state cookie")
    return res.redirect(302, withError("로그인 확인 정보가 없어요. 다시 시도해 주세요."))
  }
  if (typeof code !== "string" || state !== saved.s) {
    console.error("[comments/callback] state mismatch")
    return res.redirect(302, withError("로그인 확인 정보가 맞지 않아요. 다시 시도해 주세요."))
  }
  try {
    await signIn(res, code)
    res.redirect(302, back)
  } catch (e: any) {
    console.error("[comments/callback] sign-in failed:", e?.message || e)
    res.redirect(302, withError(e?.message || "GitHub 로그인에 실패했어요."))
  }
}
