import type { GetStaticProps } from "next"
import dynamic from "next/dynamic"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useCallback, useEffect, useRef, useState } from "react"
import { CONFIG } from "site.config"
import { ArrowLeftIcon } from "src/components/Icons"
import { useTheme } from "src/components/Layout"
import { getReachablePosts } from "src/lib/posts"
import { getViewer, login, syncSession, type Viewer } from "src/lib/session"
import { tagLabel } from "src/lib/tags"
import { loadPost, savePost, SLUG_RE, uploadImage, type WriteMeta } from "src/lib/write"

// 편집기는 브라우저에서만 돌아갑니다
const BlockEditor = dynamic(() => import("src/components/write/BlockEditor"), {
  ssr: false,
  loading: () => <p className="write-loading">편집기를 불러오는 중…</p>,
})

type Props = { categories: string[]; tags: string[]; slugs: string[] }

// 관리자 화면(/admin)에서 쓰던 카테고리 목록 + 실제 글에 쓰인 카테고리
const BASE_CATEGORIES = ["📔 위키", "👾 Unity", "🕹️ 프로젝트", "🃏 Unreal Engine", "🥖블렌더", "💠깃허브", "📟 아카이브", "🔸사이트 링크", "😎 Daily"]

export const getStaticProps: GetStaticProps<Props> = async () => {
  const posts = getReachablePosts()
  const categories = Array.from(new Set([...BASE_CATEGORIES, ...posts.map((p) => p.category).filter(Boolean)]))
  const count = new Map<string, number>()
  posts.forEach((p) => p.tags.forEach((t) => count.set(t, (count.get(t) || 0) + 1)))
  const tags = Array.from(count.keys()).sort((a, b) => (count.get(b)! - count.get(a)!) || a.localeCompare(b))
  return { props: { categories, tags, slugs: posts.map((p) => p.slug) } }
}

const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}
const emptyMeta = (): WriteMeta => ({ title: "", slug: "", date: today(), status: "draft", category: "", tags: [], summary: "", thumbnail: "" })

// 방금 올린 이미지는 배포 전이라 사이트 주소로 아직 안 보이므로, 편집 중에는 GitHub 원본 주소로 보여 주고
// 저장할 때 사이트 주소(/images/uploads/...)로 바꿉니다.
const [OWNER, NAME] = CONFIG.giscus.repo.split("/")
const RAW_PREFIX = `https://raw.githubusercontent.com/${OWNER}/${NAME}/${(CONFIG as any).cms?.branch || "main"}/public`
const toSitePaths = (md: string) => md.split(RAW_PREFIX).join("")

// 편집기가 다루기 어려운 HTML 이 들어 있는 글은 마크다운으로 고치는 편이 안전합니다
const hasHtml = (md: string) => /<\/?(div|details|summary|span|table|img|aside|figure|iframe|video|br)[\s>/]/i.test(md)

/** 이미지를 가로 1920px 이하로 줄여 data URL 로 (gif 는 그대로) */
async function shrink(file: File): Promise<string> {
  const read = (f: Blob) => new Promise<string>((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.onerror = no; r.readAsDataURL(f) })
  if (file.type === "image/gif") return read(file)
  const url = await read(file)
  const img = await new Promise<HTMLImageElement>((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = url })
  const scale = Math.min(1, 1920 / img.naturalWidth)
  const c = document.createElement("canvas")
  c.width = Math.round(img.naturalWidth * scale)
  c.height = Math.round(img.naturalHeight * scale)
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height)
  return c.toDataURL(file.type === "image/png" && scale === 1 ? "image/png" : "image/webp", 0.86)
}

/**
 * 블로그 주인 전용 글쓰기 화면.
 * /write → 새 글, /write?slug=글주소 → 그 글 고치기. 저장하면 GitHub 에 커밋되고 1~2분 뒤 블로그에 반영됩니다.
 */
export default function Write({ categories, tags: knownTags, slugs }: Props) {
  const router = useRouter()
  const [theme] = useTheme()
  const editSlug = typeof router.query.slug === "string" ? router.query.slug : ""
  const isNew = !editSlug

  const [viewer, setV] = useState<Viewer | null>(null)
  const [checked, setChecked] = useState(false)
  const [meta, setMeta] = useState<WriteMeta>(emptyMeta)
  const [body, setBody] = useState("")
  const [editorKey, setEditorKey] = useState(0)
  const [mode, setMode] = useState<"blocks" | "markdown">("blocks")
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading")
  const [loadError, setLoadError] = useState("")
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<{ kind: "ok" | "error" | "info"; text: string; link?: string } | null>(null)
  const [tagInput, setTagInput] = useState("")
  const thumbInput = useRef<HTMLInputElement>(null)
  const draftKey = `write-draft:${editSlug || "new"}`

  const isOwner = !!viewer && viewer.login.toLowerCase() === CONFIG.profile.github.toLowerCase()

  // 로그인 확인
  useEffect(() => {
    setV(getViewer())
    syncSession().then((v) => { setV(v); setChecked(true) })
    const read = () => setV(getViewer())
    window.addEventListener("sessionchange", read)
    return () => window.removeEventListener("sessionchange", read)
  }, [])

  // 글 불러오기 (고치기) 또는 새 글 준비, 브라우저에 남은 임시 글 복구
  useEffect(() => {
    if (!router.isReady || !isOwner) return
    let alive = true
    const restore = () => {
      try {
        const d = JSON.parse(localStorage.getItem(draftKey) || "null")
        return d && d.meta && typeof d.body === "string" ? (d as { meta: WriteMeta; body: string; at: number }) : null
      } catch { return null }
    }
    const start = (m: WriteMeta, b: string, fromServer: boolean) => {
      const draft = restore()
      if (draft) {
        m = draft.meta
        b = draft.body
        setNotice({ kind: "info", text: `저장하지 않은 내용(${new Date(draft.at).toLocaleString("ko-KR")})을 이어서 불러왔어요.` })
        setDirty(true)
      } else if (fromServer && hasHtml(b)) {
        setNotice({ kind: "info", text: "이 글에는 HTML 이 들어 있어 마크다운 모드로 열었어요. 블록 편집기로 바꾸면 일부 모양이 달라질 수 있어요." })
      }
      setMeta(m)
      setBody(b)
      setMode(fromServer && hasHtml(b) && !draft ? "markdown" : "blocks")
      setEditorKey((k) => k + 1)
      setPhase("ready")
    }
    setPhase("loading")
    if (isNew) start(emptyMeta(), "", false)
    else
      loadPost(editSlug)
        .then((d) => alive && start(d.meta, d.body, true))
        .catch((e) => { if (alive) { setLoadError(e.message); setPhase("error") } })
    return () => { alive = false }
  }, [router.isReady, editSlug, isOwner]) // eslint-disable-line react-hooks/exhaustive-deps

  // 쓰는 동안 브라우저에 임시로 남겨 둡니다 (창이 닫혀도 잃어버리지 않게)
  useEffect(() => {
    if (!dirty || phase !== "ready") return
    const t = setTimeout(() => {
      try { localStorage.setItem(draftKey, JSON.stringify({ meta, body, at: Date.now() })) } catch {}
    }, 600)
    return () => clearTimeout(t)
  }, [meta, body, dirty, phase, draftKey])

  // 저장하지 않고 나가려 하면 한 번 묻습니다
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = "" } }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  const set = <K extends keyof WriteMeta>(k: K, v: WriteMeta[K]) => { setMeta((m) => ({ ...m, [k]: v })); setDirty(true) }
  const onBody = useCallback((md: string) => { setBody(md); setDirty(true) }, [])

  const upload = useCallback(async (file: File) => {
    setNotice({ kind: "info", text: `이미지 올리는 중… (${file.name})` })
    try {
      const { preview } = await uploadImage(file.name, await shrink(file))
      setNotice(null)
      return preview
    } catch (e: any) {
      setNotice({ kind: "error", text: e.message })
      throw e
    }
  }, [])

  const switchMode = (next: "blocks" | "markdown") => {
    if (next === mode) return
    if (next === "blocks" && hasHtml(body) && !confirm("HTML 이 들어 있는 부분은 블록 편집기에서 모양이 바뀌거나 빠질 수 있어요. 바꿀까요?")) return
    setMode(next)
    setEditorKey((k) => k + 1)
  }

  const addTag = (raw: string) => {
    const t = raw.trim()
    if (!t || meta.tags.includes(t)) return setTagInput("")
    set("tags", [...meta.tags, t])
    setTagInput("")
  }

  const slugTaken = isNew && !!meta.slug && slugs.includes(meta.slug)
  const save = async () => {
    if (!meta.title.trim()) return setNotice({ kind: "error", text: "제목을 적어 주세요." })
    if (!SLUG_RE.test(meta.slug)) return setNotice({ kind: "error", text: "글 주소를 영문 소문자, 숫자, - 로 적어 주세요. (오른쪽 설정 칸)" })
    if (slugTaken) return setNotice({ kind: "error", text: "이미 있는 글 주소예요. 다른 주소를 적어 주세요." })
    setSaving(true)
    setNotice({ kind: "info", text: "저장하는 중…" })
    try {
      await savePost({ ...meta, thumbnail: toSitePaths(meta.thumbnail) }, toSitePaths(body), isNew)
      try { localStorage.removeItem(draftKey) } catch {}
      setDirty(false)
      setNotice({
        kind: "ok",
        text: meta.status === "draft" ? "임시저장했어요. 블로그에는 보이지 않아요." : "저장했어요. 1~2분 뒤 블로그에 반영돼요.",
        link: meta.status === "draft" ? undefined : `/${meta.slug}`,
      })
      if (isNew) router.replace({ pathname: "/write", query: { slug: meta.slug } }, undefined, { shallow: true })
    } catch (e: any) {
      setNotice({ kind: "error", text: e.message })
    } finally {
      setSaving(false)
    }
  }

  // Ctrl/⌘ + S 로 저장
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); if (!saving && phase === "ready") save() }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  const head = <Head><title>{`${isNew ? "새 글" : "글 고치기"} | ${CONFIG.blog.title}`}</title><meta name="robots" content="noindex" /></Head>

  if (!checked && !viewer) return <>{head}<div className="container write-gate"><p>로그인 확인 중…</p></div></>
  if (!isOwner)
    return (
      <>
        {head}
        <div className="container write-gate">
          <h1>글쓰기</h1>
          <p>블로그 주인만 글을 쓸 수 있어요.{viewer ? ` (지금 로그인: @${viewer.login})` : ""}</p>
          {!viewer && <button className="write-save" onClick={() => login()}>GitHub로 로그인</button>}
        </div>
      </>
    )

  return (
    <>
      {head}
      <div className="write-bar">
        <div className="container write-bar-in">
          <Link href={editSlug ? `/${editSlug}` : "/"} className="write-back"><ArrowLeftIcon /> {editSlug ? "글로 돌아가기" : "나가기"}</Link>
          <span className="write-state">{saving ? "저장 중…" : dirty ? "저장 안 됨" : isNew ? "새 글" : "저장됨"}</span>
          <div className="write-mode" role="tablist" aria-label="편집 방식">
            <button role="tab" aria-selected={mode === "blocks"} onClick={() => switchMode("blocks")}>블록</button>
            <button role="tab" aria-selected={mode === "markdown"} onClick={() => switchMode("markdown")}>마크다운</button>
          </div>
          <button className="write-save" onClick={save} disabled={saving || phase !== "ready"} title="Ctrl+S">
            {meta.status === "draft" ? "임시저장" : "저장하고 게시"}
          </button>
        </div>
      </div>

      {notice && (
        <div className={`container write-notice is-${notice.kind}`} role="status">
          <span>{notice.text}</span>
          {notice.link && <a href={notice.link} target="_blank" rel="noopener noreferrer">블로그에서 보기 ↗</a>}
          <button onClick={() => setNotice(null)} aria-label="알림 닫기">×</button>
        </div>
      )}

      {phase === "loading" ? (
        <div className="container write-gate"><p>글을 불러오는 중…</p></div>
      ) : phase === "error" ? (
        <div className="container write-gate"><p>글을 불러오지 못했어요. {loadError}</p></div>
      ) : (
        <div className="container write-grid">
          <div className="write-main">
            <textarea
              className="write-title"
              rows={1}
              placeholder="제목"
              value={meta.title}
              onChange={(e) => set("title", e.target.value.replace(/\n/g, ""))}
              onInput={(e) => { const t = e.currentTarget; t.style.height = "auto"; t.style.height = `${t.scrollHeight}px` }}
            />
            {mode === "blocks" ? (
              <div className="write-editor">
                <BlockEditor key={editorKey} markdown={body} onChange={onBody} theme={theme === "dark" ? "dark" : "light"} uploadFile={upload} />
              </div>
            ) : (
              <textarea
                key={editorKey}
                className="write-md"
                value={body}
                onChange={(e) => onBody(e.target.value)}
                placeholder="마크다운으로 쓰세요. ## 제목, - 목록, ```코드``` …"
                spellCheck={false}
              />
            )}
          </div>

          <aside className="write-side" aria-label="글 설정">
            <label className="write-field">
              <span>글 주소</span>
              <div className="write-slug">
                <em>/</em>
                <input value={meta.slug} readOnly={!isNew} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} placeholder="wiki-unity-tilemap" />
              </div>
              <small className={slugTaken ? "is-error" : ""}>{!isNew ? "이미 게시된 글의 주소는 바꿀 수 없어요." : slugTaken ? "이미 있는 주소예요." : "영문 소문자, 숫자, - 만 써요."}</small>
            </label>

            <div className="write-field">
              <span>공개 상태</span>
              <div className="write-seg">
                {([["draft", "임시저장"], ["public", "공개"], ["unlisted", "링크만"]] as const).map(([v, l]) => (
                  <button key={v} aria-pressed={meta.status === v} onClick={() => set("status", v)}>{l}</button>
                ))}
              </div>
            </div>

            <label className="write-field">
              <span>날짜</span>
              <input type="date" value={meta.date} onChange={(e) => set("date", e.target.value)} />
            </label>

            <label className="write-field">
              <span>카테고리</span>
              <select value={meta.category} onChange={(e) => set("category", e.target.value)}>
                <option value="">(없음)</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>

            <div className="write-field">
              <span>태그</span>
              <div className="write-tags">
                {meta.tags.map((t) => (
                  <button key={t} className="write-tag" onClick={() => set("tags", meta.tags.filter((x) => x !== t))} title="눌러서 빼기">
                    #{tagLabel(t)} ×
                  </button>
                ))}
                <input
                  list="write-tag-list"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(tagInput) } }}
                  onBlur={() => tagInput && addTag(tagInput)}
                  placeholder="태그 고르기·입력 후 Enter"
                />
                <datalist id="write-tag-list">
                  {knownTags.filter((t) => !meta.tags.includes(t)).map((t) => <option key={t} value={t}>{tagLabel(t)}</option>)}
                </datalist>
              </div>
            </div>

            <label className="write-field">
              <span>요약</span>
              <textarea rows={3} value={meta.summary} onChange={(e) => set("summary", e.target.value)} placeholder="목록과 검색 결과에 보이는 한두 줄" />
            </label>

            <div className="write-field">
              <span>대표 이미지</span>
              {meta.thumbnail ? (
                <div className="write-thumb">
                  <img src={meta.thumbnail} alt="" />
                  <button onClick={() => set("thumbnail", "")}>빼기</button>
                </div>
              ) : (
                <button className="write-thumb-add" onClick={() => thumbInput.current?.click()}>+ 이미지 올리기</button>
              )}
              <input
                ref={thumbInput}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                hidden
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  e.target.value = ""
                  if (f) try { set("thumbnail", await upload(f)) } catch {}
                }}
              />
            </div>

            <p className="write-help">
              <b>/</b> 블록 메뉴 · 블록 왼쪽 <b>⋮⋮</b> 끌어 옮기기 · 이미지 붙여넣기·끌어 놓기 · <b>Ctrl+S</b> 저장
            </p>
          </aside>
        </div>
      )}
    </>
  )
}
