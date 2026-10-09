import type { NextApiRequest, NextApiResponse } from "next"
import { fail, getAuth } from "src/lib/server/github"

/** GET /api/comments/me → 지금 로그인한 GitHub 계정 (없으면 null) */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store")
  try {
    const auth = await getAuth(req, res)
    res.json({ viewer: auth?.viewer ?? null })
  } catch (e) {
    fail(res, e)
  }
}
