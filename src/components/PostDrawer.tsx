import Head from "next/head"
import { useEffect, useRef, useState } from "react"
import type { PostMeta } from "src/lib/posts"
import ArticleView, { type Nav } from "./ArticleView"
import { ArrowUpRightIcon, CloseIcon } from "./Icons"

type Data = { post: PostMeta; html: string; prev: Nav; next: Nav }

const cache = new Map<string, Data>()

/** 글 페이지(/[slug])가 빌드 때 만들어 둔 데이터를 그대로 받아 옵니다 */
async function loadPost(slug: string): Promise<Data> {
  const hit = cache.get(slug)
  if (hit) return hit
  const buildId = (window as any).__NEXT_DATA__?.buildId
  const res = await fetch(`/_next/data/${buildId}/${encodeURIComponent(slug)}.json`)
  if (!res.ok) throw new Error(String(res.status))
  const { pageProps } = await res.json()
  const data: Data = { post: pageProps.post, html: pageProps.html, prev: pageProps.prev, next: pageProps.next }
  cache.set(slug, data)
  return data
}

type Props = {
  slug: string
  onClose: () => void
  onNavigate: (slug: string) => void
  onTag: (tag: string) => void
}

/**
 * 메인 화면에서 글을 누르면 오른쪽에서 열리는 패널.
 * 주소는 /글주소 로 바뀌어 공유할 수 있고, 닫기·Esc·바깥 클릭·뒤로 가기로 닫힙니다.
 */
export default function PostDrawer({ slug, onClose, onNavigate, onTag }: Props) {
  const [state, setState] = useState<{ slug: string; data?: Data; error?: boolean }>({ slug })
  const panel = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let alive = true
    setState((s) => ({ slug, data: s.slug === slug ? s.data : cache.get(slug) }))
    loadPost(slug)
      .then((data) => alive && setState({ slug, data }))
      .catch(() => alive && setState({ slug, error: true }))
    panel.current?.scrollTo({ top: 0 })
    return () => { alive = false }
  }, [slug])

  // 열려 있는 동안 뒤 화면 스크롤을 막고, Esc 로 닫고, 닫으면 원래 위치로 포커스를 돌려줍니다
  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeBtn.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener("keydown", onKey)
      prevFocus?.focus?.({ preventScroll: true })
    }
  }, [onClose])

  const d = state.data
  return (
    <div className="drawer-root">
      {d && (
        <Head>
          <title>{`${d.post.title} | Ryu Seo Jin`}</title>
        </Head>
      )}
      <div className="drawer-backdrop" onClick={onClose} aria-hidden />
      <div className="drawer" role="dialog" aria-modal="true" aria-label={d?.post.title || "글"} ref={panel}>
        <div className="drawer-bar">
          <button ref={closeBtn} className="icon-btn" onClick={onClose} aria-label="닫기" title="닫기 (Esc)">
            <CloseIcon />
          </button>
          <a className="drawer-full" href={`/${slug}`}>
            전체 화면으로 보기 <ArrowUpRightIcon />
          </a>
        </div>
        <article className="drawer-body">
          {d ? (
            <ArticleView post={d.post} html={d.html} prev={d.prev} next={d.next} onNavigate={onNavigate} onTag={onTag} />
          ) : state.error ? (
            <p className="empty">
              글을 불러오지 못했어요. <a href={`/${slug}`} style={{ color: "var(--accent)" }}>전체 화면으로 열기</a>
            </p>
          ) : (
            <div className="drawer-skeleton" aria-label="불러오는 중">
              <span style={{ width: "30%" }} />
              <span style={{ width: "85%", height: 28 }} />
              <span style={{ width: "40%" }} />
              <span style={{ width: "100%", marginTop: 24 }} />
              <span style={{ width: "92%" }} />
              <span style={{ width: "96%" }} />
            </div>
          )}
        </article>
      </div>
    </div>
  )
}
