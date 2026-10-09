import { useRouter } from "next/router"
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react"
import { CONFIG } from "site.config"
import {
  fetchThread, MAX_LEN, postComment, react, REACTION_KINDS, removeComment, stamp,
  type Comment, type Reaction, type Thread,
} from "src/lib/comments"
import { refreshCommunity } from "src/lib/community"
import { getViewer, login, setViewer, type Viewer } from "src/lib/session"
import { MoreIcon, RefreshIcon, SendIcon, ThumbDownIcon, ThumbUpIcon } from "./Icons"

type Props = {
  /** 글 댓글은 생략(글 주소로 묶임). 방명록처럼 고정된 토론에 연결할 때 이름을 넘깁니다. */
  term?: string
  title?: string
  /** 작성칸만 보여 줍니다 (메인의 포스트잇 작성 팝업) */
  composeOnly?: boolean
  /** 글 전체에 다는 반응(이모지) 줄을 보여 줄지 (방명록 페이지) */
  discussionReactions?: boolean
  placeholder?: string
  onPosted?: () => void
}

const OWNER = CONFIG.profile.github.toLowerCase()
const PAGE = 20
/** 인기 댓글 탭에서 BEST 를 붙이는 조건: 상위 3개 중 좋아요 3개 이상 */
const BEST_TOP = 3
const BEST_MIN_UP = 3

/**
 * 블로그 자체 댓글 창 (GitHub Discussions 에 저장, GitHub 로그인).
 * 인기/최신 탭, BEST, 좋아요·싫어요, 답글을 지원합니다. 서버 쪽은 src/pages/api/comments.
 */
export default function Comments({ term, title = "댓글", composeOnly, discussionReactions, placeholder, onPosted }: Props) {
  const { asPath } = useRouter()
  const key = term ?? asPath.split(/[?#]/)[0].replace(/^\//, "")
  const [viewer, setV] = useState<Viewer | null>(null)
  const [thread, setThread] = useState<Thread | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [tab, setTab] = useState<"best" | "new">("best")
  const [shown, setShown] = useState(PAGE)
  // 정렬은 불러올 때·탭을 바꿀 때만 다시 합니다 (좋아요를 누르는 동안 댓글이 자리를 옮기지 않게)
  const [loadedAt, setLoadedAt] = useState(0)

  const load = useCallback(async () => {
    if (composeOnly) return
    setStatus((s) => (s === "ready" ? s : "loading"))
    try {
      const t = await fetchThread(key)
      setThread(t)
      setLoadedAt(Date.now())
      setStatus("ready")
      setViewer(t.viewer)
    } catch {
      setStatus("error")
    }
  }, [key, composeOnly])

  useEffect(() => {
    setThread(null)
    setStatus("loading")
    setShown(PAGE)
    load()
  }, [load])

  // 헤더에서 로그인·로그아웃하면 바로 반영합니다
  useEffect(() => {
    const read = () => setV(getViewer())
    read()
    const onChange = () => { read(); load() }
    window.addEventListener("sessionchange", onChange)
    return () => window.removeEventListener("sessionchange", onChange)
  }, [load])

  const patch = (id: string, fn: (c: Comment) => Comment) =>
    setThread((t) => t && {
      ...t,
      comments: t.comments.map((c) => (c.id === id ? fn(c) : { ...c, replies: c.replies.map((r) => (r.id === id ? fn(r) : r)) })),
    })

  const onReact = async (c: Comment, kind: "up" | "down") => {
    if (!viewer) return login()
    const turnOn = kind === "up" ? !c.myUp : !c.myDown
    const other = kind === "up" ? c.myDown : c.myUp
    // 좋아요와 싫어요는 하나만: 반대쪽이 눌려 있으면 함께 취소합니다
    patch(c.id, (x) => ({
      ...x,
      up: x.up + (kind === "up" ? (turnOn ? 1 : -1) : turnOn && other ? -1 : 0),
      down: x.down + (kind === "down" ? (turnOn ? 1 : -1) : turnOn && other ? -1 : 0),
      myUp: kind === "up" ? turnOn : turnOn ? false : x.myUp,
      myDown: kind === "down" ? turnOn : turnOn ? false : x.myDown,
    }))
    try {
      await react({ id: c.id }, kind === "up" ? "THUMBS_UP" : "THUMBS_DOWN", turnOn)
      if (turnOn && other) await react({ id: c.id }, kind === "up" ? "THUMBS_DOWN" : "THUMBS_UP", false)
    } catch (e: any) {
      alert(e.message)
      load()
    }
  }

  const onDelete = async (c: Comment) => {
    if (!confirm("이 댓글을 지울까요? 지운 댓글은 되돌릴 수 없어요.")) return
    try {
      await removeComment(c.id)
      refreshCommunity()
      load()
    } catch (e: any) {
      alert(e.message)
    }
  }

  const onPost = async (body: string, replyTo?: string) => {
    const { comment } = await postComment(key, body, replyTo)
    refreshCommunity()
    setThread((t) => {
      const base: Thread = t ?? { total: 0, comments: [], viewer, reactions: [] }
      if (!replyTo) return { ...base, total: base.total + 1, comments: [...base.comments, comment] }
      return {
        ...base,
        total: base.total + 1,
        comments: base.comments.map((c) => (c.id === replyTo ? { ...c, replyCount: c.replyCount + 1, replies: [...c.replies, comment] } : c)),
      }
    })
    if (!replyTo) setTab("new")
    onPosted?.()
  }

  const onDiscussionReact = async (r: Reaction) => {
    if (!viewer) return login()
    const on = !r.mine
    setThread((t) => t && { ...t, reactions: t.reactions.map((x) => (x.content === r.content ? { ...x, mine: on, count: x.count + (on ? 1 : -1) } : x)) })
    try {
      await react({ term: key }, r.content, on)
      refreshCommunity()
    } catch (e: any) {
      alert(e.message)
      load()
    }
  }

  const composer = <Composer viewer={viewer} placeholder={placeholder} onSubmit={(b) => onPost(b)} autoFocus={composeOnly} />
  const list = thread?.comments ?? []
  const order = useMemo(() => {
    const byNew = (a: Comment, b: Comment) => (a.createdAt < b.createdAt ? 1 : -1)
    const by = tab === "best" ? (a: Comment, b: Comment) => b.up - b.down - (a.up - a.down) || byNew(a, b) : byNew
    return [...list].sort(by).map((c) => c.id)
  }, [loadedAt, tab]) // eslint-disable-line react-hooks/exhaustive-deps
  // 방금 쓴 댓글처럼 정렬 뒤에 생긴 것은 맨 위에 둡니다
  const byId = new Map(list.map((c) => [c.id, c]))
  const fresh = list.filter((c) => !order.includes(c.id)).reverse()
  const sorted = [...fresh, ...order.map((id) => byId.get(id)).filter(Boolean)] as Comment[]
  if (composeOnly) return <section className="cmt cmt-compose-only" aria-label={title}>{composer}</section>

  const isBest = (c: Comment, i: number) => tab === "best" && i < BEST_TOP && c.up >= BEST_MIN_UP && c.up > c.down

  return (
    <section className="cmt" aria-label={title}>
      <div className="cmt-head">
        <h2>{title} <b>{thread?.total ?? 0}</b></h2>
        <button className="cmt-refresh" onClick={load} aria-label="새로고침" title="새로고침" data-spin={status === "loading" || undefined}>
          <RefreshIcon />
        </button>
      </div>

      {composer}

      {discussionReactions && thread && (
        <div className="cmt-dreact" aria-label="방명록 반응">
          {thread.reactions.map((r) => {
            const k = REACTION_KINDS.find(([c]) => c === r.content)!
            return (
              <button key={r.content} aria-pressed={r.mine} title={k[2]} onClick={() => onDiscussionReact(r)}>
                <span aria-hidden>{k[1]}</span> {r.count}
              </button>
            )
          })}
        </div>
      )}

      <div className="cmt-tabs" role="tablist">
        <button role="tab" aria-selected={tab === "best"} onClick={() => setTab("best")}>인기 댓글</button>
        <button role="tab" aria-selected={tab === "new"} onClick={() => setTab("new")}>최신 댓글</button>
      </div>

      {status === "error" && !thread ? (
        <p className="cmt-empty">댓글을 불러오지 못했어요. <button className="cmt-link" onClick={load}>다시 시도</button></p>
      ) : status === "loading" && !thread ? (
        <p className="cmt-empty">불러오는 중…</p>
      ) : sorted.length === 0 ? (
        <p className="cmt-empty">첫 댓글을 남겨 주세요.</p>
      ) : (
        <ul className="cmt-list">
          {sorted.slice(0, shown).map((c, i) => (
            <Item
              key={c.id}
              c={c}
              best={isBest(c, i)}
              viewer={viewer}
              onReact={onReact}
              onDelete={onDelete}
              onReply={(b) => onPost(b, c.id)}
            />
          ))}
        </ul>
      )}
      {sorted.length > shown && (
        <button className="cmt-more" onClick={() => setShown((n) => n + PAGE)}>댓글 더보기 ({sorted.length - shown})</button>
      )}
    </section>
  )
}

function Composer({ viewer, placeholder, onSubmit, autoFocus, reply }: {
  viewer: Viewer | null
  placeholder?: string
  onSubmit: (body: string) => Promise<void>
  autoFocus?: boolean
  reply?: boolean
}) {
  const [text, setText] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (autoFocus && viewer) ref.current?.focus()
  }, [autoFocus, viewer])

  const submit = async () => {
    const body = text.trim()
    if (!body) return setError("내용을 적어 주세요.")
    setBusy(true)
    setError("")
    try {
      await onSubmit(body)
      setText("")
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className={reply ? "cmt-composer is-reply" : "cmt-composer"}>
      <textarea
        ref={ref}
        value={text}
        maxLength={MAX_LEN}
        rows={reply ? 2 : 3}
        readOnly={!viewer}
        placeholder={viewer ? placeholder || (reply ? "답글을 남겨 주세요" : "댓글을 남겨 주세요") : "댓글을 남기려면 로그인이 필요합니다."}
        onChange={(e) => { setText(e.target.value); if (error) setError("") }}
        onKeyDown={onKey}
        onClick={() => !viewer && login()}
        aria-label={reply ? "답글 쓰기" : "댓글 쓰기"}
      />
      <div className="cmt-composer-foot">
        {error ? <span className="cmt-error" role="alert">{error}</span> : viewer ? <span className="cmt-as">@{viewer.login}</span> : <span />}
        <span className="cmt-count">{text.length}/{MAX_LEN}</span>
        <button className="cmt-send" onClick={() => (viewer ? submit() : login())} disabled={busy || (!!viewer && !text.trim())} aria-label={viewer ? "등록" : "GitHub로 로그인"}>
          <SendIcon />
        </button>
      </div>
    </div>
  )
}

function Item({ c, best, viewer, onReact, onDelete, onReply, isReply }: {
  c: Comment
  best?: boolean
  viewer: Viewer | null
  onReact: (c: Comment, kind: "up" | "down") => void
  onDelete: (c: Comment) => void
  onReply?: (body: string) => Promise<void>
  isReply?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const a = c.author
  const owner = a?.login.toLowerCase() === OWNER

  useEffect(() => {
    if (!menu) return
    const close = (e: MouseEvent) => !menuRef.current?.contains(e.target as Node) && setMenu(false)
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [menu])

  return (
    <li className={isReply ? "cmt-item is-reply" : "cmt-item"}>
      <div className="cmt-meta">
        {a ? <img className="cmt-avatar" src={a.avatarUrl} alt="" width={32} height={32} loading="lazy" /> : <span className="cmt-avatar" aria-hidden />}
        <div className="cmt-who">
          <span className="cmt-name">
            {a ? <a href={a.url} target="_blank" rel="noopener noreferrer">{a.login}</a> : "알 수 없음"}
            {owner && <em className="cmt-badge">주인장</em>}
          </span>
          <time dateTime={c.createdAt}>{stamp(c.createdAt)}</time>
        </div>
        <div className="cmt-menu" ref={menuRef}>
          <button onClick={() => setMenu(!menu)} aria-label="더보기" aria-haspopup="menu" aria-expanded={menu}><MoreIcon /></button>
          {menu && (
            <div role="menu">
              <a role="menuitem" href={c.url} target="_blank" rel="noopener noreferrer">GitHub에서 보기</a>
              {c.canDelete && <button role="menuitem" onClick={() => { setMenu(false); onDelete(c) }}>삭제</button>}
            </div>
          )}
        </div>
      </div>
      <p className="cmt-body">
        {best && <em className="cmt-best">BEST</em>}
        {c.body || <span className="cmt-deleted">삭제된 댓글입니다.</span>}
      </p>
      <div className="cmt-actions">
        {!isReply && (
          <button className="cmt-chip" aria-expanded={open} onClick={() => setOpen(!open)}>답글 {c.replyCount}</button>
        )}
        <span className="cmt-votes">
          <button className="cmt-chip" aria-pressed={c.myUp} onClick={() => onReact(c, "up")} aria-label={`좋아요 ${c.up}`}><ThumbUpIcon /> {c.up}</button>
          <button className="cmt-chip" aria-pressed={c.myDown} onClick={() => onReact(c, "down")} aria-label={`싫어요 ${c.down}`}><ThumbDownIcon /> {c.down}</button>
        </span>
      </div>
      {open && !isReply && (
        <div className="cmt-replies">
          {c.replies.length > 0 && (
            <ul className="cmt-list">
              {c.replies.map((r) => (
                <Item key={r.id} c={r} viewer={viewer} onReact={onReact} onDelete={onDelete} isReply />
              ))}
            </ul>
          )}
          {onReply && <Composer viewer={viewer} onSubmit={onReply} autoFocus reply />}
        </div>
      )}
    </li>
  )
}
