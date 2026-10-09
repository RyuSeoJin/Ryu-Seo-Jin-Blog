import type { GetStaticPaths, GetStaticProps } from "next"
import Link from "next/link"
import ArticleView, { type Nav } from "src/components/ArticleView"
import { ArrowLeftIcon } from "src/components/Icons"
import Seo from "src/components/Seo"
import Toc from "src/components/Toc"
import { renderMarkdown, type Heading } from "src/lib/markdown"
import { getListedPosts, getPostSource, getReachablePosts, type PostMeta } from "src/lib/posts"

type Props = { post: PostMeta; html: string; headings: Heading[]; prev: Nav; next: Nav }

// about 은 별도 페이지(/about)에서 보여줍니다
const RESERVED = new Set(["about", "fx", "admin", "feed", "guestbook"])

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
          <ArticleView post={post} html={html} prev={prev} next={next} />
        </article>
        <Toc headings={headings} />
      </div>
    </>
  )
}
