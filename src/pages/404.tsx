import Link from "next/link"
import Seo from "src/components/Seo"

export default function NotFound() {
  return (
    <>
      <Seo title="페이지를 찾을 수 없어요" />
      <div className="container" style={{ paddingBlock: "96px", display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
        <span className="eyebrow">404</span>
        <h1 style={{ margin: 0, fontSize: 30, letterSpacing: "-0.02em" }}>페이지를 찾을 수 없어요</h1>
        <p style={{ margin: 0, color: "var(--muted)" }}>주소가 바뀌었거나 삭제된 글일 수 있어요.</p>
        <Link href="/" className="chip" style={{ marginTop: 8 }}>글 목록으로 가기</Link>
      </div>
    </>
  )
}
