import Link from "next/link"
import { CONFIG } from "site.config"
import { useRouter } from "next/router"
import type { MouseEvent } from "react"
import { ago, type Community } from "src/lib/community"
import { hasSession, login } from "src/lib/session"

const PINNED: string = (CONFIG as any).guestbookPinned || ""

type Props = { status: "loading" | "ready" | "error"; data: Community | null }

const COLORS = ["#fff3a6", "#c8f0d2", "#ffd6e0", "#cfe3ff", "#ffe2b8"]
const TILTS = [-2, 1.5, -1, 2, -1.5]

/** 메인 상단 코르크 띠: 방명록 최근 글을 포스트잇으로 보여줍니다 */
// 방명록 작성칸으로 바로 가는 주소 (방명록 페이지가 write=1 을 보면 작성칸으로 스크롤)
const WRITE_URL = "/guestbook?write=1"

export default function GuestStrip({ status, data }: Props) {
  const notes = data?.guestbook ?? []
  const router = useRouter()
  // 로그인 전이면 GitHub 승인으로 바로 보내고, 승인 후 방명록 작성칸으로 돌아옵니다
  const addNote = (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    if (hasSession()) router.push(WRITE_URL)
    else login(WRITE_URL)
  }
  return (
    <section className="cork-strip" aria-label="방명록">
      <div className="cork-head">
        <b>방명록</b>
        <span>{status === "ready" ? (data!.guestTotal ? `${data!.guestTotal}개의 한마디` : "아직 비어 있어요") : status === "loading" ? "불러오는 중…" : "지금은 불러오지 못했어요"}</span>
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
        {notes.length ? "포스트잇\n붙이기 +" : "첫 포스트잇을\n붙여 주세요 +"}
      </a>
    </section>
  )
}
