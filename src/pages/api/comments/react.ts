import type { NextApiRequest, NextApiResponse } from "next"
import { REACTION_KINDS } from "src/lib/comments"
import { ensureDiscussion, fail, findDiscussion, getAuth, gql, HttpError, sameOrigin, validTerm } from "src/lib/server/github"

/** POST /api/comments/react {id 또는 term, content, on} → 댓글의 좋아요·싫어요, 또는 방명록 전체 반응 누르기/취소 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store")
  try {
    if (req.method !== "POST") return res.status(405).end()
    if (!sameOrigin(req)) throw new HttpError(403, "허용되지 않은 요청이에요.")
    const auth = await getAuth(req, res)
    if (!auth) throw new HttpError(401, "GitHub 로그인이 필요해요.")
    const { id, term, content, on } = req.body || {}
    if (!REACTION_KINDS.some(([c]) => c === content)) throw new HttpError(400, "잘못된 반응이에요.")
    let subject: string
    if (typeof id === "string") subject = id
    else if (validTerm(term)) subject = (await findDiscussion(term)) ?? (await ensureDiscussion(term))
    else throw new HttpError(400, "잘못된 요청이에요.")
    const op = on ? "addReaction" : "removeReaction"
    await gql(auth.token, `mutation($s:ID!,$c:ReactionContent!){${op}(input:{subjectId:$s,content:$c}){clientMutationId}}`, { s: subject, c: content })
    res.json({ ok: true })
  } catch (e) {
    fail(res, e)
  }
}
