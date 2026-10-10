import type { NextApiRequest, NextApiResponse } from "next"
import { MAX_LEN } from "src/lib/comments"
import { FIELDS, toComment } from "src/lib/server/commentShape"
import { fail, getAuth, gql, HttpError, sameOrigin } from "src/lib/server/github"

/** POST /api/comments/edit {id, body} → 내 댓글·답글 고치기 (쓴 사람 본인만) */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store")
  try {
    if (req.method !== "POST") return res.status(405).end()
    if (!sameOrigin(req)) throw new HttpError(403, "허용되지 않은 요청이에요.")
    const auth = await getAuth(req, res)
    if (!auth) throw new HttpError(401, "GitHub 로그인이 필요해요.")
    const { id, body } = req.body || {}
    const text = typeof body === "string" ? body.trim() : ""
    if (typeof id !== "string") throw new HttpError(400, "잘못된 요청이에요.")
    if (!text) throw new HttpError(400, "내용을 적어 주세요.")
    if (text.length > MAX_LEN) throw new HttpError(400, `${MAX_LEN}자까지 쓸 수 있어요.`)
    // 블로그 주인 계정은 GitHub 에서 남의 댓글도 고칠 수 있으므로, 여기서 쓴 사람 본인인지 따로 확인합니다
    const who = await gql(auth.token, `query($id:ID!){node(id:$id){... on DiscussionComment{author{login}}}}`, { id })
    if (who.node?.author?.login?.toLowerCase() !== auth.viewer.login.toLowerCase()) throw new HttpError(403, "내가 쓴 댓글만 고칠 수 있어요.")
    const d = await gql(auth.token, `mutation($id:ID!,$b:String!){updateDiscussionComment(input:{commentId:$id,body:$b}){comment{${FIELDS} replies(first:100){totalCount nodes{${FIELDS}}}}}}`, { id, b: text })
    res.json({ comment: toComment(d.updateDiscussionComment.comment, auth.viewer.login) })
  } catch (e) {
    fail(res, e)
  }
}
