import Link from "next/link"
import { useRouter } from "next/router"
import { ReactNode, useEffect, useState } from "react"
import { CONFIG } from "site.config"
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
            <Link href="/about" aria-current={pathname === "/about" ? "page" : undefined}>About</Link>
            {/* /fx 는 Next 페이지가 아닌 정적 파일이라 일반 링크로 이동합니다 */}
            <a href="/fx">FX</a>
            <a className="icon-btn" href={`https://github.com/${CONFIG.profile.github}`} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <GithubIcon />
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div className="container">
          <span>© {CONFIG.since}–{new Date().getFullYear()} {CONFIG.profile.nameEn}</span>
          <a href="/feed" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <RssIcon className="" /> RSS
          </a>
        </div>
      </footer>
    </>
  )
}
