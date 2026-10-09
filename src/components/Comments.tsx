import { useEffect, useRef } from "react"
import { CONFIG } from "site.config"
import { useTheme } from "./Layout"

// NEXT_PUBLIC_ 값은 TS 파일에서 직접 읽어야 브라우저 코드에 들어갑니다 (site.config.js 에서는 비어 있음)
const REPO = process.env.NEXT_PUBLIC_UTTERANCES_REPO || CONFIG.utterances.repo

/** utterances 댓글. 화면 테마가 바뀌면 댓글 창 테마도 바꿉니다. */
export default function Comments({ slug }: { slug: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [theme] = useTheme()
  const ghTheme = theme === "dark" ? "github-dark" : "github-light"

  useEffect(() => {
    const el = ref.current
    if (!el || !CONFIG.utterances.enable || !REPO) return
    el.innerHTML = ""
    const s = document.createElement("script")
    s.src = "https://utteranc.es/client.js"
    s.async = true
    s.crossOrigin = "anonymous"
    s.setAttribute("repo", REPO)
    s.setAttribute("issue-term", CONFIG.utterances.issueTerm)
    s.setAttribute("label", CONFIG.utterances.label)
    s.setAttribute("theme", ghTheme)
    el.appendChild(s)
    // 글이 바뀔 때만 다시 불러옵니다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  useEffect(() => {
    const frame = ref.current?.querySelector<HTMLIFrameElement>("iframe.utterances-frame")
    frame?.contentWindow?.postMessage({ type: "set-theme", theme: ghTheme }, "https://utteranc.es")
  }, [ghTheme])

  if (!CONFIG.utterances.enable || !REPO) return null
  return <section className="comments" aria-label="댓글" ref={ref} />
}
