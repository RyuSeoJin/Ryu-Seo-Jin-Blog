import { useEffect, useState } from "react"
import { CONFIG } from "site.config"

/**
 * 방명록·댓글 데이터 (GitHub Discussions 공개 API, 로그인 불필요).
 * giscus 는 글 주소(slug)를 토론 제목으로 쓰고, 방명록은 "guestbook" 토론 하나에 모읍니다.
 * 한 번 불러온 결과는 5분간 브라우저에 보관해 요청을 아낍니다.
 */
export type Note = { id: number; login: string; avatar: string; body: string; createdAt: string; url: string }
export type RecentComment = Note & { slug: string }
export type Community = {
  guestbook: Note[]
  guestTotal: number
  commentCounts: Record<string, number>
  recent: RecentComment[]
}

const API = `https://api.github.com/repos/${CONFIG.giscus.repo}`
const CACHE_KEY = "community-v1"
const CACHE_MS = 5 * 60 * 1000

/** 마크다운·인용을 걷어낸 짧은 문장 */
export function plain(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^>.*$/gm, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`#~>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export function ago(iso: string): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 60) return "방금"
  if (s < 3600) return `${Math.floor(s / 60)}분 전`
  if (s < 86400) return `${Math.floor(s / 3600)}시간 전`
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}일 전`
  return new Date(iso).toLocaleDateString("ko-KR")
}

const toNote = (c: any): Note => ({
  id: c.id,
  login: c.user?.login ?? "알 수 없음",
  avatar: c.user?.avatar_url ?? "",
  body: plain(c.body || ""),
  createdAt: c.created_at,
  url: c.html_url,
})

const getJson = (url: string) => fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(r.status)))

async function load(): Promise<Community> {
  const list: any[] = await getJson(`${API}/discussions?per_page=100`)
  const commentCounts: Record<string, number> = {}
  let guest: any = null
  for (const d of list) {
    if (d.title === "guestbook") guest = d
    else if (d.comments > 0) commentCounts[d.title] = (commentCounts[d.title] || 0) + d.comments
  }

  const guestbook: Note[] = guest
    ? ((await getJson(`${API}/discussions/${guest.number}/comments?per_page=100`)) as any[]).slice(-8).reverse().map(toNote)
    : []

  // 최근에 댓글이 달린 글 3개에서 마지막 댓글을 하나씩 가져옵니다
  const active = list
    .filter((d) => d.title !== "guestbook" && d.comments > 0)
    .sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1))
    .slice(0, 3)
  const recent: RecentComment[] = (
    await Promise.all(
      active.map(async (d) => {
        const cs: any[] = await getJson(`${API}/discussions/${d.number}/comments?per_page=100`)
        const last = cs[cs.length - 1]
        return last ? { ...toNote(last), slug: d.title } : null
      })
    )
  )
    .filter(Boolean)
    .sort((a, b) => (a!.createdAt < b!.createdAt ? 1 : -1)) as RecentComment[]

  return { guestbook, guestTotal: guest?.comments ?? 0, commentCounts, recent }
}

let inflight: Promise<Community> | null = null

/** 방명록에 새 글을 붙인 뒤 부르면, 보관해 둔 데이터를 버리고 다시 불러옵니다 */
export function refreshCommunity() {
  try { sessionStorage.removeItem(CACHE_KEY) } catch {}
  inflight = null
  window.dispatchEvent(new Event("communitychange"))
}

/** 방명록·댓글 데이터를 한 번만 불러와 여러 컴포넌트가 함께 씁니다 */
export function useCommunity(): { status: "loading" | "ready" | "error"; data: Community | null } {
  const [st, setSt] = useState<{ status: "loading" | "ready" | "error"; data: Community | null }>({ status: "loading", data: null })
  useEffect(() => {
    let alive = true
    const run = () => {
      try {
        const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null")
        if (cached && Date.now() - cached.at < CACHE_MS) {
          setSt({ status: "ready", data: cached.data })
          return
        }
      } catch {}
      inflight ||= load()
      inflight
        .then((data) => {
          try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data })) } catch {}
          if (alive) setSt({ status: "ready", data })
        })
        .catch(() => {
          inflight = null
          if (alive) setSt((prev) => (prev.data ? prev : { status: "error", data: null }))
        })
    }
    run()
    window.addEventListener("communitychange", run)
    return () => {
      alive = false
      window.removeEventListener("communitychange", run)
    }
  }, [])
  return st
}
