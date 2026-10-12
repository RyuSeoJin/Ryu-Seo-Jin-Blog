import type { NextApiRequest, NextApiResponse } from "next"
import { fail, HttpError, sameOrigin } from "src/lib/server/github"
import { ownerAuth, readFile, writeFile } from "src/lib/server/repo"
import { buildMarkdown, SLUG_RE, type WriteMeta } from "src/lib/write"

export const config = { api: { bodyParser: { sizeLimit: "2mb" } } }

/** POST /api/write/save {meta, body, isNew} → content/posts/글주소.md 로 커밋 (블로그 주인만) */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store")
  try {
    if (req.method !== "POST") return res.status(405).end()
    if (!sameOrigin(req)) throw new HttpError(403, "허용되지 않은 요청이에요.")
    const token = await ownerAuth(req, res)
    const { meta, body, isNew } = (req.body || {}) as { meta: WriteMeta; body: string; isNew: boolean }
    if (!meta || typeof body !== "string") throw new HttpError(400, "잘못된 요청이에요.")
    if (!meta.title?.trim()) throw new HttpError(400, "제목을 적어 주세요.")
    if (!SLUG_RE.test(meta.slug || "")) throw new HttpError(400, "주소는 영문 소문자, 숫자, - 만 쓸 수 있어요.")
    if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date || "")) throw new HttpError(400, "날짜 형식이 맞지 않아요.")
    if (!["public", "unlisted", "draft"].includes(meta.status)) throw new HttpError(400, "공개 상태가 맞지 않아요.")
    const clean: WriteMeta = {
      title: meta.title.trim(),
      slug: meta.slug,
      date: meta.date,
      status: meta.status,
      category: String(meta.category || ""),
      tags: Array.isArray(meta.tags) ? meta.tags.map(String).filter(Boolean) : [],
      summary: String(meta.summary || ""),
      thumbnail: String(meta.thumbnail || ""),
    }
    const path = `content/posts/${clean.slug}.md`
    const existing = await readFile(token, path)
    if (isNew && existing) throw new HttpError(409, "이미 같은 주소의 글이 있어요. 주소를 바꿔 주세요.")
    await writeFile(token, path, Buffer.from(buildMarkdown(clean, body), "utf8"), `${existing ? "글 수정" : "글 작성"}: ${clean.slug}`, existing?.sha)
    res.json({ ok: true })
  } catch (e) {
    fail(res, e)
  }
}
