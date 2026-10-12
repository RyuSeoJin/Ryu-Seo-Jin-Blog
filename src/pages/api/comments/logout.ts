import type { NextApiRequest, NextApiResponse } from "next"
import { sameOrigin, signOut } from "src/lib/server/github"

/** POST /api/comments/logout → 로그인 쿠키 지우기 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST" || !sameOrigin(req)) return res.status(405).end()
  signOut(res)
  res.json({ ok: true })
}
