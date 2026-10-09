import Link from "next/link"
import { useRouter } from "next/router"
import { useCallback, useEffect, useState, type MouseEvent } from "react"
import { CONFIG } from "site.config"
import { ago, refreshCommunity, type Community } from "src/lib/community"
import { hasSession, login } from "src/lib/session"
import NoteDialog from "./NoteDialog"

const PINNED: string = (CONFIG as any).guestbookPinned || ""

type Props = { status: "loading" | "ready" | "error"; data: Community | null }

// 클래식 포스트잇 색 (채도를 한 단계 낮춰 보라 테마와 부딪히지 않게)
const COLORS = ["#fff4b8", "#d9f5e0", "#ffdbe6", "#dbe8ff", "#ffe6c7"]
const TILTS = [-2, 1.5, -1, 2, -1.5]

// 방명록 작성칸으로 바로 가는 주소 (새 탭으로 열 때. 방명록 페이지가 write=1 을 보면 작성칸으로 스크롤)
const WRITE_URL = "/guestbook?write=1"
// GitHub 로그인 후 돌아올 주소: 메인으로 돌아와 작성 팝업을 엽니다
const RETURN_URL = "/?note=1"

/** 메인 상단 코르크 띠: 방명록 최근 글을 포스트잇으로 보여줍니다 */
export default function GuestStrip({ status, data }: Props) {
  const notes = data?.guestbook ?? []
  const router = useRouter()

  // 로그인 여부 (헤더에서 로그인·로그아웃하면 바로 반영)
  const [loggedIn, setLoggedIn] = useState(false)
  useEffect(() => {
    const read = () => setLoggedIn(hasSession())
    read()
    window.addEventListener("sessionchange", read)
    window.addEventListener("storage", read)
    return () => {
      window.removeEventListener("sessionchange", read)
      window.removeEventListener("storage", read)
    }
  }, [])

  // 작성 팝업
  const [writing, setWriting] = useState(false)
  const closeDialog = useCallback(() => {
    setWriting(false)
    // 방금 붙인 포스트잇이 띠에 보이도록 다시 불러옵니다
    refreshCommunity()
  }, [])

  // 로그인하고 돌아왔으면(?note=1) 팝업을 열고 주소를 정리합니다
  useEffect(() => {
    if (!router.isReady || router.query.note !== "1") return
    const t = window.setTimeout(() => {
      router.replace("/", undefined, { shallow: true, scroll: false })
      if (hasSession()) setWriting(true)
    }, 0)
    return () => window.clearTimeout(t)
  }, [router.isReady, router.query.note]) // eslint-disable-line react-hooks/exhaustive-deps

  // 로그인했으면 팝업으로 바로 쓰고, 로그인 전이면 GitHub 승인 후 메인으로 돌아와 팝업을 엽니다
  const addNote = (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    if (hasSession()) setWriting(true)
    else login(RETURN_URL)
  }

  return (
    <section className="cork-strip" aria-label="방명록">
      <div className="cork-head">
        <b>방명록</b>
        <span>{status === "ready" ? (data!.guestTotal ? `${data!.guestTotal}개의 한마디` : "아직 비어 있어요") : status === "loading" ? "불러오는 중…" : "지금은 불러오지 못했어요"}</span>
        <Link href="/guestbook" className="cork-all">방명록 전체보기</Link>
      </div>
      {/* 블로그 주인이 붙여 둔 고정 포스트잇 (site.config.js 의 guestbookPinned) */}
      {PINNED && (
        <Link href="/guestbook" className="postit postit-pinned" style={{ background: "#ffffff", transform: "rotate(-1deg)" }}>
          <span className="postit-body">{PINNED}</span>
          <span className="postit-who">{CONFIG.profile.name} · 주인장</span>
        </Link>
      )}
      {notes.map((n, i) => (
        <a key={n.id} href={n.url} target="_blank" rel="noopener noreferrer" className="postit" style={{ background: COLORS[i % COLORS.length], transform: `rotate(${TILTS[i % TILTS.length]}deg)` }}>
          <span className="postit-body">{n.body || "(내용 없음)"}</span>
          <span className="postit-who">{n.login} · {ago(n.createdAt)}</span>
        </a>
      ))}
      <a href={WRITE_URL} className="postit-add" onClick={addNote}>
        <span>{notes.length ? "포스트잇\n붙이기 +" : "포스트잇을\n붙여 주세요 +"}</span>
        {!loggedIn && <small>포스트잇을 붙이려면 GitHub 로그인이 필요합니다</small>}
      </a>
      {writing && <NoteDialog onClose={closeDialog} />}
    </section>
  )
}
