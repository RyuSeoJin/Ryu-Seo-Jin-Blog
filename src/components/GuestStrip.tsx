import Link from "next/link"
import { CONFIG } from "site.config"
import { ago, type Community } from "src/lib/community"

const PINNED: string = (CONFIG as any).guestbookPinned || ""

type Props = { status: "loading" | "ready" | "error"; data: Community | null }

const COLORS = ["#fff3a6", "#c8f0d2", "#ffd6e0", "#cfe3ff", "#ffe2b8"]
const TILTS = [-2, 1.5, -1, 2, -1.5]

/** 메인 상단 코르크 띠: 방명록 최근 글을 포스트잇으로 보여줍니다 */
export default function GuestStrip({ status, data }: Props) {
  const notes = data?.guestbook ?? []
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
      <Link href="/guestbook" className="postit-add">
        {notes.length ? "포스트잇\n붙이기 +" : "첫 포스트잇을\n붙여 주세요 +"}
      </Link>
    </section>
  )
}
