import { useEffect, useState } from "react"
import type { Heading } from "src/lib/markdown"
import Comments from "./Comments"
import Toc from "./Toc"

/** 화면 너비 조건이 맞는지. 첫 화면(서버)에서는 아직 모르므로 null 입니다. */
export function useMedia(query: string): boolean | null {
  const [match, setMatch] = useState<boolean | null>(null)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const read = () => setMatch(mq.matches)
    read()
    mq.addEventListener("change", read)
    return () => mq.removeEventListener("change", read)
  }, [query])
  return match
}

/** 넓은 화면의 글 오른쪽 칸: 위에는 목차, 아래에는 댓글. 글이 길어도 스크롤 없이 바로 댓글을 볼 수 있습니다. */
export default function PostSide({ headings }: { headings: Heading[] }) {
  return (
    <div className="post-side">
      {headings.length >= 2 && <Toc headings={headings} />}
      <div className="side-comments">
        <Comments />
      </div>
    </div>
  )
}
