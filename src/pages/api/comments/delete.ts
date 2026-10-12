import type { NextApiRequest, NextApiResponse } from "next"
import { fail, getAuth, gql, HttpError, sameOrigin } from "src/lib/server/github"

/** POST /api/comments/delete {id} → 내 댓글 지우기 (블로그 주인은 모든 댓글을 지울 수 있음: GitHub 권한 그대로) */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store")
  try {
    if (req.method !== "POST") return res.status(405).end()
    if (!sameOrigin(req)) throw new HttpError(403, "허용되지 않은 요청이에요.")
    const auth = await getAuth(req, res)
    if (!auth) throw new HttpError(401, "GitHub 로그인이 필요해요.")
    const { id } = req.body || {}
    if (typeof id !== "string") throw new HttpError(400, "잘못된 요청이에요.")
    await gql(auth.token, `mutation($id:ID!){deleteDiscussionComment(input:{id:$id}){clientMutationId}}`, { id })
    res.json({ ok: true })
  } catch (e) {
    fail(res, e)
  }
}
