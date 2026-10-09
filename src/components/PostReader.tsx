import Head from "next/head"
import { useEffect, useState } from "react"
import type { Heading } from "src/lib/markdown"
import type { PostMeta } from "src/lib/posts"
import ArticleView, { type Nav } from "./ArticleView"
import { ArrowLeftIcon } from "./Icons"
import Toc from "./Toc"

type Data = { post: PostMeta; html: string; headings: Heading[]; prev: Nav; next: Nav }

const cache = new Map<string, Data>()

/** 글 페이지(/[slug])가 빌드 때 만들어 둔 데이터를 그대로 받아 옵니다 */
async function loadPost(slug: string): Promise<Data> {
  const hit = cache.get(slug)
  if (hit) return hit
  const buildId = (window as any).__NEXT_DATA__?.buildId
  const res = await fetch(`/_next/data/${buildId}/${encodeURIComponent(slug)}.json`)
  if (!res.ok) throw new Error(String(res.status))
  const { pageProps: p } = await res.json()
  const data: Data = { post: p.post, html: p.html, headings: p.headings || [], prev: p.prev, next: p.next }
  cache.set(slug, data)
  return data
}

type Props = {
  slug: string
  onBack: () => void
  onNavigate: (slug: string) => void
  onTag: (tag: string) => void
}

/**
 * 메인 화면 안에서 읽는 글. 왼쪽 칸(프로필·포트폴리오·방명록)은 그대로 두고
 * 가운데 글 목록과 오른쪽 주제 자리에 본문을 보여줍니다. 주소는 /글주소 로 바뀝니다.
 */
export default function PostReader({ slug, onBack, onNavigate, onTag }: Props) {
  const [state, setState] = useState<{ slug: string; data?: Data; error?: boolean }>({ slug, data: cache.get(slug) })

  useEffect(() => {
    let alive = true
    setState({ slug, data: cache.get(slug) })
    window.scrollTo({ top: 0 })
    loadPost(slug)
      .then((data) => alive && setState({ slug, data }))
      .catch(() => alive && setState({ slug, error: true }))
    return () => { alive = false }
  }, [slug])

  const d = state.data
  return (
    <div className="reader">
      {d && (
        <Head>
          <title>{`${d.post.title} | Ryu Seo Jin`}</title>
        </Head>
      )}
      <article className="article reader-article">
        <div className="reader-bar">
          <button className="back-btn" onClick={onBack}><ArrowLeftIcon /> 글 목록으로 돌아가기</button>
        </div>
        {d ? (
          <ArticleView post={d.post} html={d.html} prev={d.prev} next={d.next} onNavigate={onNavigate} onTag={onTag} />
        ) : state.error ? (
          <p className="empty">
            글을 불러오지 못했어요. <a href={`/${slug}`} style={{ color: "var(--accent)" }}>전체 화면으로 열기</a>
          </p>
        ) : (
          <div className="skeleton" aria-label="불러오는 중">
            <span style={{ width: "30%" }} />
            <span style={{ width: "85%", height: 28 }} />
            <span style={{ width: "40%" }} />
            <span style={{ width: "100%", marginTop: 24 }} />
            <span style={{ width: "92%" }} />
            <span style={{ width: "96%" }} />
          </div>
        )}
      </article>
      {d && <Toc headings={d.headings} />}
    </div>
  )
}
