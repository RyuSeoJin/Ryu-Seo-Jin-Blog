import type { NextApiRequest, NextApiResponse } from "next"
import { fail, HttpError, sameOrigin } from "src/lib/server/github"
import { ownerAuth, rawUrl, writeFile } from "src/lib/server/repo"

// 화면에서 줄여서 보내므로 넉넉히 4MB (Vercel 함수 요청 한도 4.5MB 안쪽)
export const config = { api: { bodyParser: { sizeLimit: "4mb" } } }

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" }

/** POST /api/write/upload {name, data: "data:image/...;base64,..."} → public/images/uploads 에 커밋 (블로그 주인만) */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store")
  try {
    if (req.method !== "POST") return res.status(405).end()
    if (!sameOrigin(req)) throw new HttpError(403, "허용되지 않은 요청이에요.")
    const token = await ownerAuth(req, res)
    const { name, data } = req.body || {}
    const m = typeof data === "string" && data.match(/^data:(image\/[a-z]+);base64,(.+)$/)
    if (!m || !EXT[m[1]]) throw new HttpError(400, "jpg, png, webp, gif 이미지만 올릴 수 있어요.")
    const buf = Buffer.from(m[2], "base64")
    if (buf.length > 3 * 1024 * 1024) throw new HttpError(413, "이미지가 너무 커요 (3MB 이하).")
    const base = String(name || "image").replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "image"
    const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14)
    const file = `public/images/uploads/${stamp}-${base}.${EXT[m[1]]}`
    await writeFile(token, file, buf, `이미지 업로드: ${file.replace("public/", "")}`)
    res.json({ path: file.replace(/^public/, ""), preview: rawUrl(file) })
  } catch (e) {
    fail(res, e)
  }
}
