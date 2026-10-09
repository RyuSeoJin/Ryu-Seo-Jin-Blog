import Link from "next/link"
import { useRouter } from "next/router"
import { ReactNode, useEffect, useRef, useState } from "react"
import { CONFIG } from "site.config"
import { adminNewPost, getViewer, hasSession, isOwner, login, logout, syncSession, type Viewer } from "src/lib/session"
import { GithubIcon, MoonIcon, PenIcon, RssIcon, SunIcon } from "./Icons"

type Theme = "light" | "dark"

export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>("dark")
  useEffect(() => {
    setThemeState((document.documentElement.dataset.theme as Theme) || "dark")
    const onChange = (e: Event) => setThemeState((e as CustomEvent<Theme>).detail)
    window.addEventListener("themechange", onChange)
    return () => window.removeEventListener("themechange", onChange)
  }, [])
  const setTheme = (t: Theme) => {
    document.documentElement.dataset.theme = t
    try { localStorage.setItem("theme", t) } catch {}
    window.dispatchEvent(new CustomEvent("themechange", { detail: t }))
  }
  return [theme, setTheme]
}

function ThemeToggle() {
  const [theme, setTheme] = useTheme()
  const next = theme === "dark" ? "light" : "dark"
  return (
    <button className="icon-btn" onClick={() => setTheme(next)} aria-label={next === "dark" ? "어두운 화면으로" : "밝은 화면으로"} title={next === "dark" ? "어두운 화면" : "밝은 화면"}>
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}

/** 지금 보는 사람이 블로그 주인인지 (로그인 정보가 바뀌면 다시 계산) */
export function useIsOwner(): boolean {
  const [owner, setOwner] = useState(false)
  useEffect(() => {
    const read = () => setOwner(isOwner(CONFIG.profile.github))
    read()
    window.addEventListener("sessionchange", read)
    window.addEventListener("storage", read)
    return () => {
      window.removeEventListener("sessionchange", read)
      window.removeEventListener("storage", read)
    }
  }, [])
  return owner
}

/** 관리자일 때만 헤더에 보이는 글쓰기 버튼 */
function WriteButton() {
  const owner = useIsOwner()
  if (!owner) return null
  return (
    <a className="write-btn" href={adminNewPost} title="새 글 쓰기 (관리자)">
      <PenIcon /> <span>글쓰기</span>
    </a>
  )
}

/** 사이트 공통 GitHub 로그인. 로그인하면 모든 글 댓글과 방명록에 바로 쓸 수 있어요. */
function Account() {
  const [s, setS] = useState<{ ready: boolean; session: boolean; viewer: Viewer | null }>({ ready: false, session: false, viewer: null })
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const read = () => setS({ ready: true, session: hasSession(), viewer: getViewer() })
    read()
    // 서버의 로그인 쿠키와 맞춥니다 (다른 기기에서 로그아웃했거나 방금 로그인하고 돌아온 경우)
    syncSession()
    window.addEventListener("sessionchange", read)
    window.addEventListener("storage", read)
    return () => {
      window.removeEventListener("sessionchange", read)
      window.removeEventListener("storage", read)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  if (!s.ready) return <span className="account-ph" aria-hidden />
  if (!s.session)
    return (
      <button className="login-btn" onClick={() => login()} title="GitHub로 로그인하면 댓글과 방명록을 바로 쓸 수 있어요">
        <GithubIcon /> <span>로그인</span>
      </button>
    )
  const v = s.viewer
  return (
    <div className="account" ref={box}>
      <button className="avatar-btn" aria-haspopup="menu" aria-expanded={open} aria-label="내 계정" onClick={() => setOpen(!open)}>
        {v ? <img src={v.avatarUrl} alt="" width={28} height={28} /> : <GithubIcon />}
      </button>
      {open && (
        <div className="account-menu" role="menu">
          <div className="who">
            <b>{v ? `@${v.login}` : "GitHub로 로그인됨"}</b>
            <span>글 댓글과 방명록을 바로 쓸 수 있어요</span>
          </div>
          {v && v.login.toLowerCase() === CONFIG.profile.github.toLowerCase() && (
            <>
              <a href={adminNewPost} role="menuitem">✏️ 새 글 쓰기</a>
              <a href="/admin" role="menuitem">글 관리 (관리자 화면)</a>
            </>
          )}
          <Link href="/guestbook" role="menuitem" onClick={() => setOpen(false)}>방명록 쓰기</Link>
          {v && <a href={v.url} target="_blank" rel="noopener noreferrer" role="menuitem">GitHub 프로필</a>}
          <button role="menuitem" onClick={() => { setOpen(false); logout() }}>로그아웃</button>
        </div>
      )}
    </div>
  )
}

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname, query } = useRouter()
  return (
    <>
      <header className="site-header">
        <div className="container">
          <Link href="/" className="wordmark" aria-label="홈으로">
            <i aria-hidden />
            {CONFIG.blog.title}
          </Link>
          <nav className="nav" aria-label="주 메뉴">
            <Link href="/" aria-current={pathname === "/" && !query.tool && !query.p ? "page" : undefined}>글</Link>
            <Link href="/guestbook" aria-current={pathname === "/guestbook" ? "page" : undefined}>방명록</Link>
            <Link href="/about" aria-current={pathname === "/about" ? "page" : undefined}>About</Link>
            {/* 메인 화면 안에서 작업대를 엽니다. 주소는 /fx (직접 열면 작업대 전체 화면) */}
            <Link href={{ pathname: "/", query: { tool: "fx" } }} as="/fx" aria-current={query.tool === "fx" ? "page" : undefined}>FX</Link>
            <ThemeToggle />
            <WriteButton />
            <Account />
          </nav>
        </div>
      </header>
      {/* 페이지가 바뀌면(메인 → 방명록 등) 새 화면이 살짝 떠오르며 나타납니다 */}
      <main key={pathname} className="page-in">{children}</main>
      <footer className="site-footer">
        <div className="container">
          <span>© {CONFIG.since}–{new Date().getFullYear()} {CONFIG.profile.nameEn}</span>
          <span className="foot-links">
            <a href="/feed"><RssIcon /> RSS</a>
            <a href="/admin">관리자</a>
          </span>
        </div>
      </footer>
    </>
  )
}
