/** 글쓰기 화면(/write)과 API 가 함께 쓰는 글 정보 모양 */

export type WriteMeta = {
  title: string
  slug: string
  date: string // YYYY-MM-DD
  status: "public" | "unlisted" | "draft"
  category: string
  tags: string[]
  summary: string
  thumbnail: string
}

export const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,120}$/

/** 기존 글과 같은 모양의 머리말(frontmatter) + 본문 마크다운 */
export function buildMarkdown(m: WriteMeta, body: string): string {
  const q = (s: string) => JSON.stringify(s ?? "")
  return [
    "---",
    `title: ${q(m.title)}`,
    `slug: ${q(m.slug)}`,
    `date: ${q(m.date)}`,
    `type: "Post"`,
    `status: ${q(m.status)}`,
    `category: ${q(m.category)}`,
    `tags: [${m.tags.map(q).join(", ")}]`,
    `summary: ${q(m.summary)}`,
    `thumbnail: ${q(m.thumbnail)}`,
    "---",
    body.replace(/\s+$/, "") + "\n",
  ].join("\n")
}

const json = async <T,>(r: Response): Promise<T> => {
  const d = await r.json().catch(() => ({}))
  if (r.status === 401) window.dispatchEvent(new Event("sessionexpired"))
  if (!r.ok) throw new Error(d.error || "잠시 후 다시 시도해 주세요.")
  return d
}
const post = (url: string, body: object) =>
  fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })

export const loadPost = (slug: string) => fetch(`/api/write/post?slug=${encodeURIComponent(slug)}`).then((r) => json<{ meta: WriteMeta; body: string }>(r))
export const savePost = (meta: WriteMeta, body: string, isNew: boolean) => post("/api/write/save", { meta, body, isNew }).then((r) => json<{ ok: true }>(r))
export const uploadImage = (name: string, data: string) => post("/api/write/upload", { name, data }).then((r) => json<{ path: string; preview: string }>(r))
