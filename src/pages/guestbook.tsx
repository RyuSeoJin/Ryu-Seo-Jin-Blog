import Comments from "src/components/Comments"
import Seo from "src/components/Seo"

/** 블로그 전체에 남기는 댓글. GitHub Discussions 의 "guestbook" 토론 하나에 모입니다. */
export default function Guestbook() {
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
              GitHub 계정으로 로그인하면 쓸 수 있고, 오른쪽 위 <b>로그인</b> 버튼으로 한 번 로그인하면 모든 글의 댓글에도 바로 쓸 수 있어요.
            </p>
          </header>
          <Comments term="guestbook" title="방명록" />
        </article>
      </div>
    </>
  )
}
