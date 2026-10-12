import { useEffect, useRef } from "react"
import { ko } from "@blocknote/core/locales"
import { useCreateBlockNote } from "@blocknote/react"
import { BlockNoteView } from "@blocknote/mantine"
import "@blocknote/mantine/style.css"

type Props = {
  /** 처음 보여 줄 본문 (마크다운) */
  markdown: string
  onChange: (markdown: string) => void
  theme: "light" | "dark"
  /** 이미지를 올리고 편집기에서 보여 줄 주소를 돌려줍니다 */
  uploadFile: (file: File) => Promise<string>
}

/**
 * 노션처럼 블록으로 쓰는 편집기 (BlockNote).
 * / 를 치면 제목·목록·코드·이미지·표 메뉴가 뜨고, 블록 왼쪽 손잡이로 끌어 옮길 수 있습니다.
 * 저장은 마크다운으로 바꿔서 합니다 (기존 글과 같은 형식).
 */
export default function BlockEditor({ markdown, onChange, theme, uploadFile }: Props) {
  const editor = useCreateBlockNote({
    dictionary: {
      ...ko,
      placeholders: { ...ko.placeholders, default: "내용을 쓰거나 / 를 눌러 제목·목록·코드·이미지를 넣으세요" },
    },
    uploadFile,
  })
  const ready = useRef(false)

  // 처음 한 번 마크다운을 블록으로 바꿔 넣습니다
  useEffect(() => {
    const blocks = editor.tryParseMarkdownToBlocks(markdown || "")
    editor.replaceBlocks(editor.document, blocks.length ? blocks : [{ type: "paragraph" }])
    ready.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor])

  return (
    <BlockNoteView
      editor={editor}
      theme={theme}
      onChange={() => {
        if (ready.current) onChange(editor.blocksToMarkdownLossy(editor.document))
      }}
    />
  )
}
