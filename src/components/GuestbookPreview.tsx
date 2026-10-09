import Link from "next/link"
import { useEffect, useState } from "react"
import { CONFIG } from "site.config"

type Entry = { id: number; login: string; avatar: string; body: string; createdAt: string; url: string }
type State = { status: "loading" | "ready" | "error"; entries: Entry[]; total: number }

const CACHE_KEY = "guestbook-preview"
const CACHE_MS = 5 * 60 * 1000
const API = `https://api.github.com/repos/${CONFIG.giscus.repo}`

/** 마크다운·인용을 걷어낸 짧은 미리보기 문장 */
function plain(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^>.*$/gm, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`#~>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function ago(iso: string): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 60) return "방금"
  if (s < 3600) return `${Math.floor(s / 60)}분 전`
  if (s < 86400) return `${Math.floor(s / 3600)}시간 전`
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}일 전`
  return new Date(iso).toLocaleDateString("ko-KR")
}

/**
 * 메인 화면용 방명록 미리보기 (최근 3개).
 * GitHub 공개 API 로 "guestbook" 토론의 댓글을 읽고, 5분간 브라우저에 보관합니다.
 */
export default function GuestbookPreview() {
  const [st, setSt] = useState<State>({ status: "loading", entries: [], total: 0 })

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null")
        if (cached && Date.now() - cached.at < CACHE_MS) {
          setSt({ status: "ready", entries: cached.entries, total: cached.total })
          return
        }
      } catch {}
      try {
        const list = await fetch(`${API}/discussions?per_page=100`).then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        const gb = (list as any[]).find((d) => d.title === "guestbook")
        let entries: Entry[] = []
        let total = 0
        if (gb) {
          total = gb.comments
          const comments = await fetch(`${API}/discussions/${gb.number}/comments?per_page=100`).then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
          entries = (comments as any[])
            .slice(-3)
            .reverse()
            .map((c) => ({ id: c.id, login: c.user?.login ?? "알 수 없음", avatar: c.user?.avatar_url ?? "", body: plain(c.body || ""), createdAt: c.created_at, url: c.html_url }))
        }
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), entries, total })) } catch {}
        if (alive) setSt({ status: "ready", entries, total })
      } catch {
        if (alive) setSt({ status: "error", entries: [], total: 0 })
      }
    }
    load()
    return () => { alive = false }
  }, [])

  return (
    <section className="gb-card" aria-label="방명록">
      <div className="gb-head">
        <p className="side-h" style={{ margin: 0 }}>방명록</p>
        {st.status === "ready" && st.total > 0 && <span className="gb-count">{st.total}</span>}
      </div>
      {st.status === "loading" && <p className="gb-empty">불러오는 중…</p>}
      {st.status === "error" && <p className="gb-empty">지금은 방명록을 불러오지 못했어요.</p>}
      {st.status === "ready" && st.entries.length === 0 && <p className="gb-empty">아직 방명록이 없어요. 첫 인사를 남겨 주세요.</p>}
      {st.entries.length > 0 && (
        <ul className="gb-list">
          {st.entries.map((e) => (
            <li key={e.id}>
              <img src={e.avatar} alt="" width={24} height={24} loading="lazy" />
              <div>
                <div className="gb-meta"><b>{e.login}</b><time dateTime={e.createdAt}>{ago(e.createdAt)}</time></div>
                <p>{e.body || "(내용 없음)"}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Link href="/guestbook" className="gb-write">방명록 쓰기 →</Link>
    </section>
  )
}
