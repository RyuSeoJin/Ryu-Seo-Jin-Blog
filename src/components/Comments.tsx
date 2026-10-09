import { useEffect, useRef } from "react"
import { CONFIG } from "site.config"
import { useTheme } from "./Layout"

/** utterances 댓글. 화면 테마가 바뀌면 댓글 창 테마도 바꿉니다. */
export default function Comments({ slug }: { slug: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [theme] = useTheme()
  const ghTheme = theme === "dark" ? "github-dark" : "github-light"

  useEffect(() => {
    const el = ref.current
    if (!el || !CONFIG.utterances.enable || !CONFIG.utterances.repo) return
    el.innerHTML = ""
    const s = document.createElement("script")
    s.src = "https://utteranc.es/client.js"
    s.async = true
    s.crossOrigin = "anonymous"
    s.setAttribute("repo", CONFIG.utterances.repo)
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

  if (!CONFIG.utterances.enable || !CONFIG.utterances.repo) return null
  return <section className="comments" aria-label="댓글" ref={ref} />
}
