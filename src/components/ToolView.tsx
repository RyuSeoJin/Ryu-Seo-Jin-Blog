import Head from "next/head"
import { useEffect, useRef } from "react"
import { ArrowLeftIcon } from "./Icons"
import { useTheme } from "./Layout"

type Props = { onBack: () => void }

/**
 * 메인 화면 안에서 여는 도트 이펙트 작업대.
 * 왼쪽 칸은 그대로 두고, 가운데·오른쪽 자리에 /fx 작업대를 그대로 띄웁니다.
 */
export default function ToolView({ onBack }: Props) {
  const frame = useRef<HTMLIFrameElement>(null)
  const [theme] = useTheme()
  // 처음 열 때의 테마는 주소로, 이후 바뀌면 메시지로 작업대에 알려 블로그와 같은 테마를 씁니다
  const initialTheme = useRef(theme)
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])
  const sendTheme = () => frame.current?.contentWindow?.postMessage({ type: "theme", theme }, window.location.origin)
  useEffect(sendTheme, [theme]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="reader tool-view">
      <Head>
        <title>도트 이펙트 작업대 | Ryu Seo Jin</title>
      </Head>
      <div className="reader-bar">
        <button className="back-btn" onClick={onBack}><ArrowLeftIcon /> 글 목록으로 돌아가기</button>
        <span className="tool-title">도트 이펙트 작업대</span>
      </div>
      <iframe ref={frame} className="tool-frame" src={`/fx/index.html?theme=${initialTheme.current}`} title="도트 이펙트 작업대" onLoad={sendTheme} />
    </div>
  )
}
