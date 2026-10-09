import type { GetStaticPaths, GetStaticProps } from "next"
import Link from "next/link"
import ArticleView, { type Nav } from "src/components/ArticleView"
import { ArrowLeftIcon } from "src/components/Icons"
import Seo from "src/components/Seo"
import PostSide, { useMedia } from "src/components/PostSide"
import { renderMarkdown, type Heading } from "src/lib/markdown"
import { getListedPosts, getPostSource, getReachablePosts, type PostMeta } from "src/lib/posts"

type Props = { post: PostMeta; html: string; headings: Heading[]; prev: Nav; next: Nav }

// 사이트의 다른 주소와 겹치는 이름은 글 주소로 쓰지 않습니다
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
  // 넓은 화면이면 목차와 댓글을 오른쪽 칸에, 아니면 댓글을 본문 아래에 둡니다
  const wide = useMedia("(min-width: 1200px)")
  return (
    <>
      <Seo title={post.title} description={post.summary} path={`/${post.slug}`} image={post.thumbnail || undefined} type="article" date={post.date} />
      <div className={wide ? "container article-wrap with-side" : "container article-wrap"}>
        <article className="article">
          <Link href="/" className="back-btn"><ArrowLeftIcon /> 글 목록으로 돌아가기</Link>
          <ArticleView post={post} html={html} prev={prev} next={next} showComments={wide === false} />
        </article>
        {wide && <PostSide headings={headings} />}
      </div>
    </>
  )
}
