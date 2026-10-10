import matter from "gray-matter"
import type { NextApiRequest, NextApiResponse } from "next"
import { fail, HttpError } from "src/lib/server/github"
import { ownerAuth, readFile } from "src/lib/server/repo"
import { SLUG_RE, type WriteMeta } from "src/lib/write"

const day = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v ?? "").slice(0, 10))

/** GET /api/write/post?slug=글주소 → 고칠 글의 정보와 본문 (블로그 주인만) */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store")
  try {
    const token = await ownerAuth(req, res)
    const slug = req.query.slug
    if (typeof slug !== "string" || !SLUG_RE.test(slug)) throw new HttpError(400, "잘못된 글 주소예요.")
    const file = await readFile(token, `content/posts/${slug}.md`)
    if (!file) throw new HttpError(404, "그 주소의 글이 없어요.")
    const { data, content } = matter(file.text)
    const meta: WriteMeta = {
      title: String(data.title ?? ""),
      slug,
      date: day(data.date),
      status: ["public", "unlisted", "draft"].includes(data.status) ? data.status : "public",
      category: String(data.category ?? ""),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      summary: String(data.summary ?? ""),
      thumbnail: String(data.thumbnail ?? ""),
    }
    res.json({ meta, body: content.replace(/^\n+/, "") })
  } catch (e) {
    fail(res, e)
  }
}
