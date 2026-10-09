import Link from "next/link"
import { useRouter } from "next/router"
import { ReactNode, useEffect, useRef, useState } from "react"
import { CONFIG } from "site.config"
import { captureSessionFromUrl, getViewer, hasSession, login, logout, type Viewer } from "src/lib/session"
import { GithubIcon, MoonIcon, RssIcon, SunIcon } from "./Icons"

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

/** 사이트 공통 GitHub 로그인. 로그인하면 모든 글 댓글과 방명록에 바로 쓸 수 있어요. */
function Account() {
  const [s, setS] = useState<{ ready: boolean; session: boolean; viewer: Viewer | null }>({ ready: false, session: false, viewer: null })
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    captureSessionFromUrl()
    const read = () => setS({ ready: true, session: hasSession(), viewer: getViewer() })
    read()
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
      <button className="login-btn" onClick={login} title="GitHub로 로그인하면 댓글과 방명록을 바로 쓸 수 있어요">
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
          <Link href="/guestbook" role="menuitem" onClick={() => setOpen(false)}>방명록 쓰기</Link>
          {v && <a href={v.url} target="_blank" rel="noopener noreferrer" role="menuitem">GitHub 프로필</a>}
          <button role="menuitem" onClick={logout}>로그아웃</button>
        </div>
      )}
    </div>
  )
}

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useRouter()
  return (
    <>
      <header className="site-header">
        <div className="container">
          <Link href="/" className="wordmark" aria-label="홈으로">
            <i aria-hidden />
            {CONFIG.blog.title}
          </Link>
          <nav className="nav" aria-label="주 메뉴">
            <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>글</Link>
            <Link href="/guestbook" aria-current={pathname === "/guestbook" ? "page" : undefined}>방명록</Link>
            <Link href="/about" aria-current={pathname === "/about" ? "page" : undefined}>About</Link>
            {/* /fx 는 Next 페이지가 아닌 정적 파일이라 일반 링크로 이동합니다 */}
            <a href="/fx">FX</a>
            <ThemeToggle />
            <Account />
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div className="container">
          <span>© {CONFIG.since}–{new Date().getFullYear()} {CONFIG.profile.nameEn}</span>
          <a href="/feed">
            <RssIcon /> RSS
          </a>
        </div>
      </footer>
    </>
  )
}
