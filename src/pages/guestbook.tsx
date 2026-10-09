import { useRouter } from "next/router"
import { useEffect, useRef } from "react"
import Comments from "src/components/Comments"
import Seo from "src/components/Seo"

/** 블로그 전체에 남기는 댓글. GitHub Discussions 의 "guestbook" 토론 하나에 모입니다. */
export default function Guestbook() {
  const router = useRouter()
  const box = useRef<HTMLDivElement>(null)

  // 메인의 "포스트잇 붙이기"로 들어오면(?write=1) 댓글 창이 뜨는 대로 작성칸으로 내려갑니다
  useEffect(() => {
    if (!router.isReady || router.query.write !== "1") return
    let tries = 0
    const timer = window.setInterval(() => {
      const input = box.current?.querySelector<HTMLTextAreaElement>(".cmt-composer textarea")
      if (input || ++tries > 40) {
        window.clearInterval(timer)
        box.current?.scrollIntoView({ behavior: "smooth", block: "start" })
        input?.focus({ preventScroll: true })
        router.replace("/guestbook", undefined, { shallow: true, scroll: false })
      }
    }, 150)
    return () => window.clearInterval(timer)
  }, [router.isReady, router.query.write]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Seo title="방명록" description="블로그에 자유롭게 인사나 의견을 남겨 주세요." path="/guestbook" />
      <div className="container article-wrap" style={{ gridTemplateColumns: "minmax(0, 760px)" }}>
        <article className="article">
          <header className="article-head">
            <span className="cat">방명록</span>
            <h1>방명록</h1>
            <p className="lead">
              특정 글이 아니라 블로그에 남기는 댓글이에요. 인사, 피드백, 궁금한 점을 자유롭게 남겨 주세요.
              남긴 글은 메인 화면 맨 위 방명록 띠에 포스트잇으로 붙어요.
            </p>
          </header>
          <div ref={box} style={{ scrollMarginTop: "calc(var(--header-h) + 16px)" }}>
            <Comments term="guestbook" title="방명록" discussionReactions placeholder="한마디를 남겨 주세요. 메인 화면 방명록 띠에 포스트잇으로 붙어요." />
          </div>
        </article>
      </div>
    </>
  )
}
