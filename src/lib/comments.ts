/** 블로그 자체 댓글: 화면과 API 가 함께 쓰는 모양과 요청 함수 */

export type Author = { login: string; avatarUrl: string; url: string }
export type Comment = {
  id: string
  url: string
  body: string
  createdAt: string
  author: Author | null
  up: number
  down: number
  myUp: boolean
  myDown: boolean
  canDelete: boolean
  replyCount: number
  replies: Comment[]
}
export type Reaction = { content: string; count: number; mine: boolean }
export type Thread = { total: number; comments: Comment[]; viewer: Author | null; reactions: Reaction[] }

/** GitHub 반응 종류: GraphQL 이름, 이모지, 이름 */
export const REACTION_KINDS: [content: string, emoji: string, label: string][] = [
  ["THUMBS_UP", "👍", "좋아요"], ["HEART", "❤️", "하트"], ["HOORAY", "🎉", "축하"], ["LAUGH", "😄", "웃음"],
  ["ROCKET", "🚀", "로켓"], ["EYES", "👀", "눈"], ["CONFUSED", "😕", "갸우뚱"], ["THUMBS_DOWN", "👎", "별로"],
]

export const MAX_LEN = 500

async function call<T>(url: string, body?: object): Promise<T> {
  const r = await fetch(url, body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : undefined)
  const d = await r.json().catch(() => ({}))
  if (r.status === 401) window.dispatchEvent(new Event("sessionexpired"))
  if (!r.ok) throw new Error(d.error || "잠시 후 다시 시도해 주세요.")
  return d as T
}

export const fetchThread = (term: string) => call<Thread>(`/api/comments?term=${encodeURIComponent(term)}`)
export const postComment = (term: string, body: string, replyTo?: string) => call<{ comment: Comment }>("/api/comments", { term, body, replyTo })
/** 댓글(id)이나 토론 전체(term)에 반응 누르기/취소 */
export const react = (target: { id: string } | { term: string }, content: string, on: boolean) => call<{ ok: true }>("/api/comments/react", { ...target, content, on })
export const removeComment = (id: string) => call<{ ok: true }>("/api/comments/delete", { id })

/** 2026.08.22 22:54 */
export function stamp(iso: string): string {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}
