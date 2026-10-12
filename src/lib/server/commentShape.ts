/** GitHub 토론 댓글 → 화면용 댓글 모양 (댓글 API 들이 함께 씁니다) */
import type { Comment } from "src/lib/comments"

export const FIELDS = `id databaseId url body createdAt lastEditedAt deletedAt viewerCanDelete author{login avatarUrl(size:80) url} reactionGroups{content viewerHasReacted reactors{totalCount}}`

/** viewer: 지금 로그인한 GitHub 아이디 (없으면 null) */
export function toComment(n: any, viewer: string | null): Comment {
  const g = (c: string) => n.reactionGroups?.find((x: any) => x.content === c)
  const mine = !!viewer && !!n.author && n.author.login.toLowerCase() === viewer.toLowerCase()
  return {
    id: n.id,
    dbId: n.databaseId,
    url: n.url,
    body: n.deletedAt ? "" : n.body,
    createdAt: n.createdAt,
    edited: !!n.lastEditedAt && !n.deletedAt,
    author: n.author ? { login: n.author.login, avatarUrl: n.author.avatarUrl, url: n.author.url } : null,
    up: g("THUMBS_UP")?.reactors.totalCount ?? 0,
    down: g("THUMBS_DOWN")?.reactors.totalCount ?? 0,
    myUp: !!g("THUMBS_UP")?.viewerHasReacted,
    myDown: !!g("THUMBS_DOWN")?.viewerHasReacted,
    canDelete: !!viewer && !!n.viewerCanDelete && !n.deletedAt,
    // 고치기는 쓴 사람 본인만 (블로그 주인도 남의 댓글은 지우기만 됩니다)
    canEdit: mine && !n.deletedAt,
    replyCount: n.replies?.totalCount ?? 0,
    replies: (n.replies?.nodes ?? []).filter((r: any) => !r.deletedAt).map((r: any) => toComment(r, viewer)),
  }
}
