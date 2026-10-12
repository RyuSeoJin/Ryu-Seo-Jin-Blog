import { useEffect, useState } from "react"
import type { Heading } from "src/lib/markdown"

/** 오른쪽 목차. 지금 읽는 위치의 제목을 강조합니다. */
export default function Toc({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string>("")

  useEffect(() => {
    if (!headings.length) return
    const els = headings.map((h) => document.getElementById(h.id)).filter(Boolean) as HTMLElement[]
    const onScroll = () => {
      const y = window.scrollY + 120
      let cur = els[0]?.id ?? ""
      for (const el of els) if (el.offsetTop <= y) cur = el.id
      setActive(cur)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [headings])

  if (headings.length < 2) return <aside className="toc" aria-hidden />
  return (
    <aside className="toc" aria-label="목차">
      <p className="side-h">목차</p>
      <ol>
        {headings.map((h) => (
          <li key={h.id} className={`d${h.depth}`}>
            <a href={`#${h.id}`} className={active === h.id ? "on" : undefined}>{h.text}</a>
          </li>
        ))}
      </ol>
    </aside>
  )
}
