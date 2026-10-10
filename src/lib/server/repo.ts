/**
 * 글쓰기 화면(/write)의 서버 쪽: 블로그 주인만 저장소 파일을 읽고 씁니다.
 * 주인의 GitHub 로그인 토큰(댓글 앱, Contents 읽기·쓰기 권한)으로 커밋하므로
 * 커밋 기록에는 주인 이름으로 남고, 저장 뒤에는 Vercel 이 자동으로 다시 배포합니다.
 */
import type { NextApiRequest, NextApiResponse } from "next"
import { CONFIG } from "site.config"
import { getAuth, HttpError } from "./github"

const [OWNER, NAME] = CONFIG.giscus.repo.split("/")
const BRANCH = (CONFIG as any).cms?.branch || "main"

/** 블로그 주인으로 로그인했는지 확인하고 토큰을 돌려줍니다 */
export async function ownerAuth(req: NextApiRequest, res: NextApiResponse): Promise<string> {
  const auth = await getAuth(req, res)
  if (!auth) throw new HttpError(401, "GitHub 로그인이 필요해요.")
  if (auth.viewer.login.toLowerCase() !== CONFIG.profile.github.toLowerCase()) throw new HttpError(403, "블로그 주인만 글을 쓸 수 있어요.")
  return auth.token
}

async function api(token: string, method: string, path: string, body?: object) {
  const r = await fetch(`https://api.github.com/repos/${OWNER}/${NAME}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  })
  const d = await r.json().catch(() => ({}))
  if (!r.ok) {
    console.error("[write] github api error:", method, path, r.status, d.message)
    if (r.status === 403 || (r.status === 404 && method !== "GET"))
      throw new HttpError(403, "저장 권한이 없어요. GitHub 앱에 Contents 읽기·쓰기 권한을 주고 승인했는지 확인해 주세요.")
    throw new HttpError(r.status, d.message || "GitHub 요청이 실패했어요.")
  }
  return d
}

/** 저장소의 파일 하나 (없으면 null) */
export async function readFile(token: string, path: string): Promise<{ sha: string; text: string } | null> {
  try {
    const d = await api(token, "GET", `/contents/${encodeURI(path)}?ref=${BRANCH}`)
    return { sha: d.sha, text: Buffer.from(d.content, "base64").toString("utf8") }
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return null
    throw e
  }
}

/** 파일을 만들거나 고쳐서 커밋합니다 */
export async function writeFile(token: string, path: string, content: Buffer, message: string, sha?: string) {
  await api(token, "PUT", `/contents/${encodeURI(path)}`, {
    message,
    content: content.toString("base64"),
    branch: BRANCH,
    ...(sha ? { sha } : {}),
  })
}

/** 공개 저장소의 원본 파일 주소 (배포 전에도 바로 볼 수 있음) */
export const rawUrl = (path: string) => `https://raw.githubusercontent.com/${OWNER}/${NAME}/${BRANCH}/${path}`
