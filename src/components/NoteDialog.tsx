import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import Comments from "./Comments"

type Props = { onClose: () => void }

/** 메인에서 바로 방명록 포스트잇을 쓰는 팝업. 작성칸은 방명록(giscus "guestbook")과 같은 곳입니다. */
export default function NoteDialog({ onClose }: Props) {
  const closeBtn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    // 팝업이 떠 있는 동안 뒤 화면이 스크롤되지 않게 합니다
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeBtn.current?.focus()
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  // 화면 전환 애니메이션이 걸린 부모 안에 갇히지 않도록 body 바로 아래에 그립니다
  return createPortal(
    <div className="note-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="note-dialog" role="dialog" aria-modal="true" aria-labelledby="note-dialog-title">
        <div className="note-dialog-head">
          <b id="note-dialog-title">포스트잇 붙이기</b>
          <button ref={closeBtn} type="button" className="note-close" onClick={onClose} aria-label="닫기">×</button>
        </div>
        <p className="note-dialog-hint">아래 칸에 한마디를 쓰고 <b>댓글</b> 버튼을 누르면 메인 방명록 띠에 포스트잇으로 붙어요.</p>
        <div className="note-dialog-body">
          <Comments term="guestbook" title="방명록 쓰기" />
        </div>
      </div>
    </div>,
    document.body
  )
}
