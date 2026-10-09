import Link from "next/link"
import type { MouseEvent } from "react"
import type { PostMeta } from "src/lib/posts"
import { tagLabel } from "src/lib/tags"
import { adminEditPost } from "src/lib/session"
import Comments from "./Comments"
import { PenIcon } from "./Icons"
import { useIsOwner } from "./Layout"

export type Nav = { slug: string; title: string } | null

type Props = {
  post: PostMeta
  html: string
  prev: Nav
  next: Nav
  /** 오른쪽 패널 안에서는 이전/다음 글을 패널 안에서 엽니다 */
  onNavigate?: (slug: string) => void
  /** 태그를 눌렀을 때 (패널에서는 패널을 닫고 목록을 거릅니다) */
  onTag?: (tag: string) => void
  /** 댓글을 본문 아래에 둘지 (넓은 화면에서는 오른쪽 목차 아래로 옮기므로 false) */
  showComments?: boolean
}

/** 글 본문 화면. 글 페이지(/[slug])와 메인의 오른쪽 패널이 함께 씁니다. */
export default function ArticleView({ post, html, prev, next, onNavigate, onTag, showComments = true }: Props) {
  const owner = useIsOwner()
  // 새 탭 열기(Ctrl·⌘·가운데 클릭)는 그대로 두고, 일반 클릭만 패널 안에서 처리합니다
  const inPanel = (fn?: () => void) => (e: MouseEvent) => {
    if (!fn || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    fn()
  }
  return (
    <>
      <header className="article-head">
        {post.category && <span className="cat">{post.category}</span>}
        <h1>{post.title}</h1>
        <div className="meta">
          <time dateTime={post.date}>{post.date.replace(/-/g, ".")}</time>
          <span className="dot" />읽는 데 {post.readMinutes}분
          {owner && (
            <a className="edit-link" href={adminEditPost(post.slug)} title="관리자 화면에서 이 글 수정">
              <PenIcon /> 이 글 수정
            </a>
          )}
        </div>
        {post.tags.length > 0 && (
          <div className="tags">
            {post.tags.map((t) => (
              <Link key={t} href={{ pathname: "/", query: { tag: t } }} onClick={inPanel(onTag && (() => onTag(t)))}>
                #{tagLabel(t)}
              </Link>
            ))}
          </div>
        )}
      </header>
      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      {(prev || next) && (
        <nav className="pager" aria-label="다른 글">
          {prev && (
            <Link href={`/${prev.slug}`} onClick={inPanel(onNavigate && (() => onNavigate(prev.slug)))}>
              <small>이전 글</small><b>{prev.title}</b>
            </Link>
          )}
          {next && (
            <Link href={`/${next.slug}`} className="next" onClick={inPanel(onNavigate && (() => onNavigate(next.slug)))}>
              <small>다음 글</small><b>{next.title}</b>
            </Link>
          )}
        </nav>
      )}
      {showComments && <Comments />}
    </>
  )
}
