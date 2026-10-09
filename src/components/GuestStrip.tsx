import Link from "next/link"
import { useRouter } from "next/router"
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react"
import { CONFIG } from "site.config"
import { fetchThread, react, REACTION_KINDS, type Comment, type Reaction } from "src/lib/comments"
import { ago, REACTIONS, refreshCommunity, type Community } from "src/lib/community"
import { hasSession, login, syncSession } from "src/lib/session"
import { postitStyle } from "src/lib/postit"
import NoteDialog from "./NoteDialog"

const PINNED: string = (CONFIG as any).guestbookPinned || ""

type Props = { status: "loading" | "ready" | "error"; data: Community | null }


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

  // 방명록 반응: 띠 아래 줄에서 바로 누릅니다. 내가 누른 것까지 알기 위해 댓글 API 로 읽습니다.
  const [reactions, setReactions] = useState<Reaction[] | null>(null)
  // 포스트잇마다 답글·좋아요·싫어요 수 (GitHub 댓글 번호로 짝을 맞춥니다)
  const [stats, setStats] = useState<Map<number, Comment>>(new Map())
  useEffect(() => {
    const read = () =>
      fetchThread("guestbook")
        .then((t) => {
          setReactions(t.reactions)
          setStats(new Map(t.comments.map((c) => [c.dbId, c])))
        })
        .catch(() => {})
    read()
    window.addEventListener("sessionchange", read)
    return () => window.removeEventListener("sessionchange", read)
  }, [])
  // API 를 아직 못 읽었으면 공개 API 숫자로 먼저 보여 줍니다 (REACTIONS 와 REACTION_KINDS 는 같은 순서)
  const shownReactions: Reaction[] =
    reactions ?? REACTION_KINDS.map(([content], i) => ({ content, count: data?.guestReactions[REACTIONS[i][0]] ?? 0, mine: false }))
  const onReact = async (r: Reaction) => {
    if (!hasSession()) return login()
    const on = !r.mine
    const apply = (on: boolean) => (list: Reaction[]) =>
      list.map((x) => (x.content === r.content ? { ...x, mine: on, count: Math.max(0, x.count + (on ? 1 : -1)) } : x))
    setReactions(apply(on)(shownReactions))
    try {
      await react({ term: "guestbook" }, r.content, on)
      refreshCommunity()
    } catch (e: any) {
      setReactions((list) => (list ? apply(!on)(list) : list))
      alert(e.message)
    }
  }

  // 포스트잇 줄: 스크롤바 대신 ‹ › 로 넘기고, 더 볼 것이 있는 쪽 끝만 흐리게 합니다
  const track = useRef<HTMLDivElement>(null)
  const [edge, setEdge] = useState({ start: true, end: true })
  const measure = useCallback(() => {
    const el = track.current
    if (!el) return
    setEdge({ start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 })
  }, [])
  useEffect(() => {
    const el = track.current
    if (!el) return
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [measure, notes.length])
  const slide = (dir: 1 | -1) => {
    const el = track.current
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" })
  }

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
      // 방금 로그인하고 돌아왔으므로 서버에 로그인 상태를 확인한 뒤 엽니다
      syncSession().then((v) => v && setWriting(true))
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
      <div className="cork-row">
        <div className="cork-head">
          <b>방명록</b>
          {status !== "ready" && <span>{status === "loading" ? "불러오는 중…" : "지금은 불러오지 못했어요"}</span>}
          <Link href="/guestbook" className="cork-all">방명록 전체보기</Link>
        </div>
        {/* 붙이기 칸은 포스트잇이 많아도 늘 보이도록 맨 앞에 둡니다 */}
        <a href={WRITE_URL} className="postit-add" onClick={addNote}>
          <span>{notes.length ? "포스트잇\n붙이기 +" : "포스트잇을\n붙여 주세요 +"}</span>
          {!loggedIn && <small>포스트잇을 붙이려면 GitHub 로그인이 필요합니다</small>}
        </a>
        <div className="cork-track-wrap" data-start={edge.start || undefined} data-end={edge.end || undefined}>
          <button type="button" className="cork-arrow" onClick={() => slide(-1)} disabled={edge.start} aria-label="이전 포스트잇">‹</button>
          <div className="cork-track" ref={track} onScroll={measure}>
            {/* 블로그 주인이 붙여 둔 고정 포스트잇 (site.config.js 의 guestbookPinned) */}
            {PINNED && !notes.some((n) => n.pinned) && (
              <Link href="/guestbook" className="postit postit-pinned" style={{ background: "#ffffff", transform: "rotate(-1deg)" }}>
                <span className="postit-body">{PINNED}</span>
                <span className="postit-who">{CONFIG.profile.name} · 주인장</span>
              </Link>
            )}
            {notes.map((n, i) =>
              n.pinned ? (
                <Link key={n.id} href="/guestbook" className="postit postit-pinned" style={{ background: "#ffffff", transform: "rotate(-1deg)" }}>
                  <span className="postit-body">{n.body || "(내용 없음)"}</span>
                  <span className="postit-who">{CONFIG.profile.name} · 주인장 · {ago(n.createdAt)}</span>
                  <NoteStats c={stats.get(n.id)} />
                </Link>
              ) : (
                <Link key={n.id} href="/guestbook" className="postit" style={postitStyle(i)}>
                  <span className="postit-body">{n.body || "(내용 없음)"}</span>
                  <span className="postit-who">{n.login} · {ago(n.createdAt)}</span>
                  <NoteStats c={stats.get(n.id)} />
                </Link>
              )
            )}
          </div>
          <button type="button" className="cork-arrow" onClick={() => slide(1)} disabled={edge.end} aria-label="다음 포스트잇">›</button>
        </div>
      </div>
      {/* 방명록에 남겨진 반응을 한 줄로 모아 보여줍니다. 누르면 그 자리에서 반응을 남깁니다. */}
      {status === "ready" && (
        <div className="cork-reactions" role="group" aria-label="방명록 반응">
          <span className="cork-count">포스트잇 <b>{data!.guestTotal}</b>장</span>
          <span className="cork-reactions-label">방명록 반응</span>
          {shownReactions.map((r) => {
            const [, emoji, label] = REACTION_KINDS.find(([c]) => c === r.content)!
            return (
              <button key={r.content} type="button" className={r.count ? "rx on" : "rx"} aria-pressed={r.mine} title={loggedIn ? label : `${label} · 누르려면 GitHub 로그인`} onClick={() => onReact(r)}>
                {emoji} <b>{r.count}</b>
              </button>
            )
          })}
        </div>
      )}
      {writing && <NoteDialog onClose={closeDialog} />}
    </section>
  )
}

/** 포스트잇 안 아랫줄: 답글·좋아요·싫어요 수 */
function NoteStats({ c }: { c?: Comment }) {
  return (
    <span className="board-stats" aria-label={`답글 ${c?.replyCount ?? 0}개, 좋아요 ${c?.up ?? 0}, 싫어요 ${c?.down ?? 0}`}>
      <span>💬 {c?.replyCount ?? 0}</span>
      <span>👍 {c?.up ?? 0}</span>
      <span>👎 {c?.down ?? 0}</span>
    </span>
  )
}
