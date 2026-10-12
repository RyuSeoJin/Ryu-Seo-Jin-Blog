import type { RepoCard } from "src/lib/repos"
import { ArrowUpRightIcon, GithubIcon } from "./Icons"

export const LANG_COLORS: Record<string, string> = {
  Python: "#3572A5", TypeScript: "#3178c6", JavaScript: "#f1e05a", "C#": "#178600", "C++": "#f34b7d", HTML: "#e34c26", CSS: "#563d7c", Shell: "#89e051",
}

/** GitHub 레포 소개글: 이름·소개·언어·별·업데이트일 머리말 + 소개 본문 (+ 접어 둔 README 원문) */
export default function RepoView({ repo, html, readme }: { repo: RepoCard; html: string; readme?: string }) {
  return (
    <>
      <header className="article-head">
        <span className="cat"><GithubIcon /> GitHub 레포</span>
        <h1>{repo.name}</h1>
        {repo.description && <p className="lead">{repo.description}</p>}
        <div className="meta repo-head-meta">
          {repo.language && <span><i className="repo-lang" style={{ background: LANG_COLORS[repo.language] || "var(--muted)" }} />{repo.language}</span>}
          <span>★ {repo.stars}</span>
          {repo.pushedAt && <span>{repo.pushedAt.slice(0, 10).replace(/-/g, ".")} 업데이트</span>}
          <a className="repo-gh-btn" href={repo.url} target="_blank" rel="noopener noreferrer"><GithubIcon /> GitHub에서 보기 <ArrowUpRightIcon /></a>
        </div>
      </header>
      {html ? <div className="prose" dangerouslySetInnerHTML={{ __html: html }} /> : <p className="empty">이 레포에는 아직 소개글(README)이 없어요.</p>}
      {readme && (
        <details className="repo-readme">
          <summary>README 원문 보기 <small>GitHub 저장소의 안내 그대로</small></summary>
          <div className="prose" dangerouslySetInnerHTML={{ __html: readme }} />
        </details>
      )}
    </>
  )
}
