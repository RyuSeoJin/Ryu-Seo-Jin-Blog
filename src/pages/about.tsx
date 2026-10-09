import type { GetStaticProps } from "next"
import Seo from "src/components/Seo"
import { renderMarkdown } from "src/lib/markdown"
import { getPostSource } from "src/lib/posts"

type Props = { title: string; html: string }

// content/posts/about.md 를 About 페이지로 보여줍니다 (status: unlisted 라 목록에는 안 나옵니다)
export const getStaticProps: GetStaticProps<Props> = async () => {
  const src = getPostSource("about")
  if (!src) return { notFound: true }
  const { html } = await renderMarkdown(src.content)
  return { props: { title: src.title, html } }
}

export default function About({ title, html }: Props) {
  return (
    <>
      <Seo title="About" path="/about" />
      <div className="container article-wrap" style={{ gridTemplateColumns: "minmax(0, 760px)" }}>
        <article className="article">
          <header className="article-head">
            <span className="cat">About</span>
            <h1>{title}</h1>
          </header>
          <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
        </article>
      </div>
    </>
  )
}
