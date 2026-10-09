import { useEffect, useRef } from "react"
import { CONFIG } from "site.config"
import { useTheme } from "./Layout"

const G = CONFIG.giscus
const ORIGIN = "https://giscus.app"

/**
 * giscus 댓글 (GitHub Discussions 에 저장).
 * 글 주소(pathname)마다 토론 글 하나가 생기고, 화면 테마가 바뀌면 댓글 창 테마도 바뀝니다.
 */
export default function Comments({ slug }: { slug: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [theme] = useTheme()
  const gTheme = theme === "dark" ? "dark" : "light"
  const ready = G.enable && G.repoId && G.categoryId

  useEffect(() => {
    const el = ref.current
    if (!el || !ready) return
    el.innerHTML = ""
    const s = document.createElement("script")
    s.src = `${ORIGIN}/client.js`
    s.async = true
    s.crossOrigin = "anonymous"
    const attrs: Record<string, string> = {
      "data-repo": G.repo,
      "data-repo-id": G.repoId,
      "data-category": G.category,
      "data-category-id": G.categoryId,
      "data-mapping": "pathname",
      "data-strict": "1",
      "data-reactions-enabled": "1",
      "data-emit-metadata": "0",
      "data-input-position": "top",
      "data-theme": gTheme,
      "data-lang": "ko",
      "data-loading": "lazy",
    }
    Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v))
    el.appendChild(s)
    // 글이 바뀔 때만 다시 불러옵니다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, ready])

  useEffect(() => {
    const frame = ref.current?.querySelector<HTMLIFrameElement>("iframe.giscus-frame")
    frame?.contentWindow?.postMessage({ giscus: { setConfig: { theme: gTheme } } }, ORIGIN)
  }, [gTheme])

  if (!ready) return null
  return <section className="comments" aria-label="댓글" ref={ref} />
}
