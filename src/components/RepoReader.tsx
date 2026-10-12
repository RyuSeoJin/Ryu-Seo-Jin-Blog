import Head from "next/head"
import { useEffect, useState } from "react"
import type { Heading } from "src/lib/markdown"
import { loadPageProps } from "src/lib/pageData"
import type { RepoCard } from "src/lib/repos"
import { ArrowLeftIcon } from "./Icons"
import RepoView from "./RepoView"
import Toc from "./Toc"

type Data = { repo: RepoCard; html: string; headings: Heading[]; readme: string }
const cache = new Map<string, Data>()

/** 메인 화면 안에서 읽는 GitHub 레포 소개글 (글을 열 때와 같은 자리, 주소는 /repo/이름) */
export default function RepoReader({ name, onBack }: { name: string; onBack: () => void }) {
  const [data, setData] = useState<Data | undefined>(cache.get(name))
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let alive = true
    setError(false)
    setData(cache.get(name))
    window.scrollTo({ top: 0 })
    loadPageProps(`/repo/${encodeURIComponent(name)}`)
      .then((p) => {
        if (!p?.repo) throw new Error("no data")
        cache.set(name, p)
        if (alive) setData(p)
      })
      .catch(() => alive && setError(true))
    return () => { alive = false }
  }, [name, attempt])

  return (
    <div className="reader">
      {data && <Head><title>{`${data.repo.name} | Ryu Seo Jin`}</title></Head>}
      <article className="article reader-article">
        <div className="reader-bar">
          <button className="back-btn" onClick={onBack}><ArrowLeftIcon /> 글 목록으로 돌아가기</button>
        </div>
        {data ? (
          <RepoView repo={data.repo} html={data.html} readme={data.readme} />
        ) : error ? (
          <p className="empty">
            소개글을 불러오지 못했어요.{" "}
            <button className="cmt-link" onClick={() => setAttempt((n) => n + 1)}>다시 시도</button>
          </p>
        ) : (
          <div className="skeleton" aria-label="불러오는 중">
            <span style={{ width: "30%" }} />
            <span style={{ width: "70%", height: 28 }} />
            <span style={{ width: "100%", marginTop: 24 }} />
            <span style={{ width: "92%" }} />
          </div>
        )}
      </article>
      {data && <Toc headings={data.headings} />}
    </div>
  )
}
