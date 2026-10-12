/**
 * 메인 왼쪽 "GitHub 레포" 카드에 보여 줄 저장소 정보.
 * site.config.js 의 repos 목록을 빌드할 때 GitHub 공개 API 로 읽어 옵니다 (배포할 때마다 새로 읽음).
 * 읽기에 실패해도 블로그 빌드가 멈추지 않도록, 그때는 설정에 적은 이름·소개만 보여 줍니다.
 */
import fs from "fs"
import path from "path"
import { CONFIG } from "site.config"
import { renderMarkdown, type Heading } from "./markdown"
import { getPostSource } from "./posts"

export type RepoCard = {
  name: string
  url: string
  description: string
  language: string | null
  stars: number
  pushedAt: string | null
  /** 기본 브랜치 (README 안 상대 경로를 GitHub 주소로 바꿀 때 씀) */
  branch: string
}

type RepoConfig = { name: string; owner?: string; note?: string; post?: string }

export async function getRepos(): Promise<RepoCard[]> {
  const list: RepoConfig[] = (CONFIG as any).repos || []
  return Promise.all(
    list.map(async (r) => {
      const owner = r.owner || CONFIG.profile.github
      const fallback: RepoCard = { name: r.name, url: `https://github.com/${owner}/${r.name}`, description: r.note || "", language: null, stars: 0, pushedAt: null, branch: "main" }
      try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${r.name}`, {
          headers: { Accept: "application/vnd.github+json", "User-Agent": "ryuseojin-blog" },
        })
        if (!res.ok) return fallback
        const d = await res.json()
        return {
          name: d.name,
          url: d.html_url,
          description: r.note || d.description || "",
          language: d.language ?? null,
          stars: d.stargazers_count ?? 0,
          pushedAt: d.pushed_at ?? null,
          branch: d.default_branch || "main",
        }
      } catch {
        return fallback
      }
    })
  )
}

/** 설정에 있는 레포 이름 목록 (소개글 페이지 /repo/이름 을 만들 때 씀) */
export const repoNames = (): string[] => ((CONFIG as any).repos || []).map((r: RepoConfig) => r.name)

export type RepoPage = { repo: RepoCard; html: string; headings: Heading[]; readme: string }

/**
 * 레포 소개글.
 * 설정의 post(블로그 글)나 content/repos/이름.md 에 소개(왜 만들었나 · 어떻게 쓰나)가 있으면 그걸 먼저 보여 주고 README 는 접어 둡니다.
 * 없으면 README 를 본문으로 씁니다. README 의 상대 경로 이미지·링크는 GitHub 주소로 고칩니다.
 */
export async function getRepoPage(name: string): Promise<RepoPage | null> {
  const base = await getReadmePage(name)
  if (!base) return null
  // 소개글: 설정의 post(블로그 글) → content/repos/이름.md → 없으면 README
  const cfg = ((CONFIG as any).repos || []).find((r: RepoConfig) => r.name === name) as RepoConfig | undefined
  const fromPost = cfg?.post ? getPostSource(cfg.post)?.content : undefined
  const file = path.join(process.cwd(), "content", "repos", `${name}.md`)
  const md = fromPost ?? (fs.existsSync(file) ? fs.readFileSync(file, "utf8") : undefined)
  if (md === undefined) return { repo: base.repo, html: base.html, headings: base.headings, readme: "" }
  // 블로그 글 맨 위의 "GitHub 저장소" 안내 줄은 레포 화면 머리말과 겹치므로 뺍니다
  const intro = await renderMarkdown(md.replace(/^\s*>\s*📦[^\n]*\n+/, ""))
  return { repo: base.repo, html: intro.html, headings: intro.headings, readme: base.html }
}

async function getReadmePage(name: string): Promise<{ repo: RepoCard; html: string; headings: Heading[] } | null> {
  const repo = (await getRepos()).find((r) => r.name === name)
  if (!repo) return null
  const [, owner] = repo.url.match(/github\.com\/([^/]+)\//) || []
  let md = ""
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${name}/readme`, {
      headers: { Accept: "application/vnd.github.raw", "User-Agent": "ryuseojin-blog" },
    })
    if (res.ok) md = await res.text()
  } catch {}
  if (!md.trim()) return { repo, html: "", headings: [] }
  const raw = `https://raw.githubusercontent.com/${owner}/${name}/${repo.branch}/`
  const blob = `https://github.com/${owner}/${name}/blob/${repo.branch}/`
  const fix = (base: string, u: string) => (/^(https?:|mailto:|#|\/\/)/i.test(u) ? u : base + u.replace(/^\.?\//, ""))
  md = md
    .replace(/!\[([^\]]*)\]\(([^)\s]+)([^)]*)\)/g, (_m, alt, u, rest) => `![${alt}](${fix(raw, u)}${rest})`)
    .replace(/(^|[^!])\[([^\]]*)\]\(([^)\s]+)([^)]*)\)/g, (_m, pre, text, u, rest) => `${pre}[${text}](${fix(blob, u)}${rest})`)
    .replace(/(<img[^>]*\ssrc=["'])([^"']+)/gi, (_m, pre, u) => pre + fix(raw, u))
  const { html, headings } = await renderMarkdown(md)
  return { repo, html, headings }
}
