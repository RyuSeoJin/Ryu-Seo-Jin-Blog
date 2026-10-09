import type { NextApiRequest, NextApiResponse } from "next"
import { MAX_LEN, REACTION_KINDS, type Comment, type Reaction, type Thread } from "src/lib/comments"
import { appToken, ensureDiscussion, fail, findDiscussion, getAuth, gql, HttpError, sameOrigin, signOut, validTerm } from "src/lib/server/github"

const FIELDS = `id databaseId url body createdAt deletedAt viewerCanDelete author{login avatarUrl(size:80) url} reactionGroups{content viewerHasReacted reactors{totalCount}}`

function toComment(n: any, canDelete: boolean): Comment {
  const g = (c: string) => n.reactionGroups?.find((x: any) => x.content === c)
  return {
    id: n.id,
    dbId: n.databaseId,
    url: n.url,
    body: n.deletedAt ? "" : n.body,
    createdAt: n.createdAt,
    author: n.author ? { login: n.author.login, avatarUrl: n.author.avatarUrl, url: n.author.url } : null,
    up: g("THUMBS_UP")?.reactors.totalCount ?? 0,
    down: g("THUMBS_DOWN")?.reactors.totalCount ?? 0,
    myUp: !!g("THUMBS_UP")?.viewerHasReacted,
    myDown: !!g("THUMBS_DOWN")?.viewerHasReacted,
    canDelete: canDelete && !!n.viewerCanDelete && !n.deletedAt,
    replyCount: n.replies?.totalCount ?? 0,
    replies: (n.replies?.nodes ?? []).filter((r: any) => !r.deletedAt).map((r: any) => toComment(r, canDelete)),
  }
}

/**
 * GET  /api/comments?term=글주소     → 댓글 목록 (로그인했으면 내 반응·삭제 가능 여부 포함)
 * POST /api/comments {term, body, replyTo?} → 댓글·답글 쓰기 (로그인 필요)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store")
  try {
    if (req.method === "GET") return res.json(await read(req, res))
    if (req.method === "POST") return res.json(await write(req, res))
    res.status(405).end()
  } catch (e) {
    fail(res, e)
  }
}

async function read(req: NextApiRequest, res: NextApiResponse): Promise<Thread> {
  const term = req.query.term
  if (typeof term !== "string" || !/^[a-z0-9][a-z0-9-]{0,120}$/i.test(term)) throw new HttpError(400, "잘못된 주소예요.")
  let auth = await getAuth(req, res)
  const id = await findDiscussion(term)
  const none: Reaction[] = REACTION_KINDS.map(([content]) => ({ content, count: 0, mine: false }))
  if (!id) return { total: 0, comments: [], viewer: auth?.viewer ?? null, reactions: none }

  const query = `query($id:ID!){node(id:$id){... on Discussion{reactionGroups{content viewerHasReacted reactors{totalCount}} comments(last:100){totalCount nodes{${FIELDS} replies(first:100){totalCount nodes{${FIELDS}}}}}}}}`
  let d: any
  try {
    d = await gql(auth?.token ?? (await appToken()), query, { id })
  } catch (e) {
    // 로그인 토큰이 막혔으면 로그아웃 처리하고 로그인 전 방문자로 다시 읽습니다
    if (!(e instanceof HttpError && e.status === 401 && auth)) throw e
    signOut(res)
    auth = null
    d = await gql(await appToken(), query, { id })
  }
  const nodes: any[] = d.node.comments.nodes.filter((n: any) => !n.deletedAt || n.replies?.totalCount)
  const comments = nodes.map((n) => toComment(n, !!auth))
  const total = comments.length + comments.reduce((s, c) => s + c.replies.length, 0)
  const reactions: Reaction[] = REACTION_KINDS.map(([content]) => {
    const g = d.node.reactionGroups?.find((x: any) => x.content === content)
    return { content, count: g?.reactors.totalCount ?? 0, mine: !!auth && !!g?.viewerHasReacted }
  })
  return { total, comments, viewer: auth?.viewer ?? null, reactions }
}

async function write(req: NextApiRequest, res: NextApiResponse): Promise<{ comment: Comment }> {
  if (!sameOrigin(req)) throw new HttpError(403, "허용되지 않은 요청이에요.")
  const auth = await getAuth(req, res)
  if (!auth) throw new HttpError(401, "댓글을 쓰려면 GitHub 로그인이 필요해요.")
  const { term, body, replyTo } = req.body || {}
  if (!validTerm(term)) throw new HttpError(400, "댓글을 달 수 없는 주소예요.")
  const text = typeof body === "string" ? body.trim() : ""
  if (!text) throw new HttpError(400, "내용을 적어 주세요.")
  if (text.length > MAX_LEN) throw new HttpError(400, `${MAX_LEN}자까지 쓸 수 있어요.`)
  if (replyTo !== undefined && typeof replyTo !== "string") throw new HttpError(400, "잘못된 답글 대상이에요.")

  const discussionId = (await findDiscussion(term)) ?? (await ensureDiscussion(term))
  const d = await gql(
    auth.token,
    `mutation($d:ID!,$b:String!,$r:ID){addDiscussionComment(input:{discussionId:$d,body:$b,replyToId:$r}){comment{${FIELDS}}}}`,
    { d: discussionId, b: text, r: replyTo ?? null }
  )
  return { comment: toComment({ ...d.addDiscussionComment.comment, replies: { totalCount: 0, nodes: [] } }, true) }
}
