import type { GetStaticPaths, GetStaticProps } from "next"
import Link from "next/link"
import Comments from "src/components/Comments"
import { ArrowLeftIcon } from "src/components/Icons"
import Seo from "src/components/Seo"
import Toc from "src/components/Toc"
import { renderMarkdown, type Heading } from "src/lib/markdown"
import { getListedPosts, getPostSource, getReachablePosts, type PostMeta } from "src/lib/posts"
import { tagLabel } from "src/lib/tags"

type Nav = { slug: string; title: string } | null
type Props = { post: PostMeta; html: string; headings: Heading[]; prev: Nav; next: Nav }

// about 은 별도 페이지(/about)에서 보여줍니다
const RESERVED = new Set(["about", "fx", "admin", "feed"])

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: getReachablePosts().filter((p) => !RESERVED.has(p.slug)).map((p) => ({ params: { slug: p.slug } })),
  fallback: false,
})

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const src = getPostSource(String(params?.slug))
  if (!src) return { notFound: true }
  const { content, ...post } = src
  const { html, headings } = await renderMarkdown(content)
  const listed = getListedPosts()
  const i = listed.findIndex((p) => p.slug === post.slug)
  const pick = (p?: PostMeta): Nav => (p ? { slug: p.slug, title: p.title } : null)
  // 목록은 최신순이므로 "이전 글"은 더 오래된 글(i+1)입니다
  return { props: { post, html, headings, prev: i >= 0 ? pick(listed[i + 1]) : null, next: i >= 0 ? pick(listed[i - 1]) : null } }
}

export default function PostPage({ post, html, headings, prev, next }: Props) {
  return (
    <>
      <Seo title={post.title} description={post.summary} path={`/${post.slug}`} image={post.thumbnail || undefined} type="article" date={post.date} />
      <div className="container article-wrap">
        <article className="article">
          <Link href="/" className="back"><ArrowLeftIcon /> 글 목록</Link>
          <header className="article-head">
            {post.category && <span className="cat">{post.category}</span>}
            <h1>{post.title}</h1>
            <div className="meta">
              <time dateTime={post.date}>{post.date.replace(/-/g, ".")}</time>
              <span className="dot" />읽는 데 {post.readMinutes}분
            </div>
            {post.tags.length > 0 && (
              <div className="tags">
                {post.tags.map((t) => (
                  <Link key={t} href={{ pathname: "/", query: { tag: t } }}>#{tagLabel(t)}</Link>
                ))}
              </div>
            )}
          </header>
          <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
          {(prev || next) && (
            <nav className="pager" aria-label="다른 글">
              {prev && <Link href={`/${prev.slug}`}><small>이전 글</small><b>{prev.title}</b></Link>}
              {next && <Link href={`/${next.slug}`} className="next"><small>다음 글</small><b>{next.title}</b></Link>}
            </nav>
          )}
          <Comments slug={post.slug} />
        </article>
        <Toc headings={headings} />
      </div>
    </>
  )
}
