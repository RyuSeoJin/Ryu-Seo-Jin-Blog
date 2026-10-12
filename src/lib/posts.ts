import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { parseTag } from "./tags"

export type PostStatus = "public" | "unlisted" | "draft"

export type PostMeta = {
  slug: string
  title: string
  date: string // YYYY-MM-DD
  category: string
  tags: string[]
  summary: string
  thumbnail: string
  status: PostStatus
  readMinutes: number
}

const POSTS_DIR = path.join(process.cwd(), "content", "posts")

function toDateString(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  return String(v ?? "").slice(0, 10)
}

// 한국어 본문 기준 분당 약 500자
function readMinutes(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, "")
  return Math.max(1, Math.round(text.length / 500))
}

type RawPost = PostMeta & { content: string }

let cache: RawPost[] | null = null

function loadAll(): RawPost[] {
  if (cache && process.env.NODE_ENV === "production") return cache
  const files = fs.existsSync(POSTS_DIR)
    ? fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))
    : []
  const posts = files.map((file) => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8")
    const { data, content } = matter(raw)
    const slug = String(data.slug || file.replace(/\.md$/, "")).trim()
    const status = (["public", "unlisted", "draft"].includes(data.status)
      ? data.status
      : "public") as PostStatus
    return {
      slug,
      title: String(data.title || slug),
      date: toDateString(data.date),
      category: String(data.category || ""),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      summary: String(data.summary || ""),
      thumbnail: String(data.thumbnail || ""),
      status,
      readMinutes: readMinutes(content),
      content,
    }
  })
  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title)))
  cache = posts
  return posts
}

const meta = ({ content, ...m }: RawPost): PostMeta => m

/** 목록에 보이는 글 (public 만) */
export function getListedPosts(): PostMeta[] {
  return loadAll().filter((p) => p.status === "public").map(meta)
}

/** 주소로 열 수 있는 글 (public + unlisted) */
export function getReachablePosts(): PostMeta[] {
  return loadAll().filter((p) => p.status !== "draft").map(meta)
}

export function getPostSource(slug: string): RawPost | null {
  return loadAll().find((p) => p.slug === slug && p.status !== "draft") ?? null
}

export type TopicGroup = { group: string; order: number; items: { tag: string; name: string; count: number }[] }

/** "4::WIKI::용어" 형태의 태그를 분류별로 묶습니다 */
export function getTopicTree(posts: PostMeta[]): TopicGroup[] {
  const groups = new Map<string, TopicGroup>()
  for (const p of posts) {
    for (const tag of p.tags) {
      const t = parseTag(tag)
      const g = groups.get(t.group) ?? { group: t.group, order: t.order, items: [] }
      const item = g.items.find((i) => i.tag === tag)
      if (item) item.count++
      else g.items.push({ tag, name: t.name, count: 1 })
      groups.set(t.group, g)
    }
  }
  return [...groups.values()]
    .sort((a, b) => a.order - b.order || a.group.localeCompare(b.group))
    .map((g) => ({ ...g, items: g.items.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)) }))
}
