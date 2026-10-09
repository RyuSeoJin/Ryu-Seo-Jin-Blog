import { useRouter } from "next/router"
import { useEffect, useRef } from "react"
import { CONFIG } from "site.config"
import { GISCUS_ORIGIN, setViewer } from "src/lib/session"
import { useTheme } from "./Layout"

const G = CONFIG.giscus

type Props = {
  /** 글 댓글은 생략(주소별로 묶임). 방명록처럼 고정된 토론에 연결할 때 이름을 넘깁니다. */
  term?: string
  /** 반응(이모지) 줄을 보일지. 포스트잇 작성 팝업처럼 글만 남기는 곳에서는 끕니다. */
  reactions?: boolean
  title?: string
}

/** 댓글 창 테마: 사이트 색에 보라 포인트를 준 giscus 테마 (public/giscus/*.css). 글 댓글과 방명록이 함께 씁니다. */
function themeUrl(mode: string) {
  if (typeof window === "undefined") return ""
  return `${window.location.origin}/giscus/${mode === "dark" ? "site-dark" : "site-light"}.css`
}

/**
 * giscus 댓글 (GitHub Discussions 에 저장).
 * 로그인 세션은 사이트 전체가 공유하고(src/lib/session.ts), 화면 테마가 바뀌면 댓글 창 테마도 바뀝니다.
 */
export default function Comments({ term, title = "댓글", reactions = true }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [theme] = useTheme()
  const gTheme = themeUrl(theme)
  const ready = G.enable && G.repoId && G.categoryId
  // 글 사이를 이동하면(주소가 바뀌면) 그 글의 토론으로 다시 불러옵니다
  const { asPath } = useRouter()
  const key = term ?? asPath.split(/[?#]/)[0]

  useEffect(() => {
    const el = ref.current
    if (!el || !ready) return
    el.innerHTML = ""
    const s = document.createElement("script")
    s.src = `${GISCUS_ORIGIN}/client.js`
    s.async = true
    s.crossOrigin = "anonymous"
    const attrs: Record<string, string> = {
      "data-repo": G.repo,
      "data-repo-id": G.repoId,
      "data-category": G.category,
      "data-category-id": G.categoryId,
      "data-mapping": term ? "specific" : "pathname",
      ...(term ? { "data-term": term } : {}),
      "data-strict": "1",
      "data-reactions-enabled": reactions ? "1" : "0",
      // 로그인한 사람 정보를 받아 헤더에 보여주기 위해 켭니다
      "data-emit-metadata": "1",
      "data-input-position": "top",
      // 처음 불러올 때는 화면에 실제로 적용된 테마를 씁니다 (useTheme 값은 첫 렌더에서 아직 기본값일 수 있음)
      "data-theme": themeUrl((document.documentElement.dataset.theme as string) || theme),
      "data-lang": "ko",
      "data-loading": "lazy",
    }
    Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v))
    el.appendChild(s)
    // 연결된 토론이 바뀔 때만 다시 불러옵니다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ready])

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== GISCUS_ORIGIN) return
      const g = (e.data as any)?.giscus
      const v = g?.discussion !== undefined || g?.viewer !== undefined ? g?.viewer : undefined
      if (v && v.login) setViewer({ login: v.login, avatarUrl: v.avatarUrl, url: v.url })
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [])

  useEffect(() => {
    const frame = ref.current?.querySelector<HTMLIFrameElement>("iframe.giscus-frame")
    frame?.contentWindow?.postMessage({ giscus: { setConfig: { theme: gTheme } } }, GISCUS_ORIGIN)
  }, [gTheme])

  if (!ready) return null
  return (
    <section className="comments" aria-label={title}>
      <div ref={ref} />
    </section>
  )
}
