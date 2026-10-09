import type { GetStaticProps } from "next"
import Link from "next/link"
import { useRouter } from "next/router"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { CONFIG } from "site.config"
import GuestStrip from "src/components/GuestStrip"
import PostReader from "src/components/PostReader"
import ToolView from "src/components/ToolView"
import Seo from "src/components/Seo"
import { ArrowUpRightIcon, CloseIcon, GithubIcon, SearchIcon } from "src/components/Icons"
import { ago, useCommunity } from "src/lib/community"
import { getListedPosts, getTopicTree, type PostMeta, type TopicGroup } from "src/lib/posts"
import { splitCategory, tagLabel } from "src/lib/tags"

type Props = { posts: PostMeta[]; topics: TopicGroup[]; categories: { name: string; count: number }[] }

export const getStaticProps: GetStaticProps<Props> = async () => {
  const posts = getListedPosts()
  const counts = new Map<string, number>()
  posts.forEach((p) => p.category && counts.set(p.category, (counts.get(p.category) || 0) + 1))
  const categories = [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
  return { props: { posts, topics: getTopicTree(posts), categories } }
}

const fmtDate = (d: string) => d.replace(/-/g, ".")
const FEATURED: { project?: string; pick?: string } = (CONFIG as any).featured || {}

export default function Home({ posts, topics, categories }: Props) {
  const router = useRouter()
  const q = typeof router.query.q === "string" ? router.query.q : ""
  const category = typeof router.query.category === "string" ? router.query.category : ""
  const tag = typeof router.query.tag === "string" ? router.query.tag : ""

  // 검색어·분류는 주소에 남겨 공유하거나 뒤로 가기로 돌아올 수 있게 합니다
  const setQuery = (patch: Record<string, string>) => {
    const next: Record<string, string> = { q, category, tag, ...patch }
    Object.keys(next).forEach((k) => !next[k] && delete next[k])
    router.replace({ pathname: "/", query: next }, undefined, { shallow: true, scroll: false })
  }

  // ── 오른쪽 패널: 글을 누르면 주소는 /글주소 로 바꾸고, 메인 화면 위에 패널로 엽니다 ──
  const openSlug = typeof router.query.p === "string" ? router.query.p : ""
  // 도구(도트 이펙트 작업대)도 같은 자리에서 엽니다. 주소는 /fx
  const openTool = router.query.tool === "fx" && !openSlug
  const reading = !!openSlug || openTool
  const filters = () => {
    const f: Record<string, string> = { q, category, tag }
    Object.keys(f).forEach((k) => !f[k] && delete f[k])
    return f
  }
  const openedHere = useRef(false)
  const listScroll = useRef(0)
  const openPost = (e: React.MouseEvent, slug: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return // 새 탭 열기는 그대로
    e.preventDefault()
    openedHere.current = true
    listScroll.current = window.scrollY
    router.push({ pathname: "/", query: { ...filters(), p: slug } }, `/${slug}`, { shallow: true, scroll: false })
  }
  const openFx = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    openedHere.current = true
    listScroll.current = window.scrollY
    router.push({ pathname: "/", query: { ...filters(), tool: "fx" } }, "/fx", { shallow: true, scroll: false })
  }
  const closePost = useCallback(() => {
    if (openedHere.current) {
      openedHere.current = false
      router.back()
    } else {
      router.replace({ pathname: "/", query: filters() }, undefined, { shallow: true, scroll: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, q, category, tag])
  const navigatePost = useCallback(
    (slug: string) => router.replace({ pathname: "/", query: { ...filters(), p: slug } }, `/${slug}`, { shallow: true, scroll: false }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, q, category, tag]
  )
  // 글에서 목록으로 돌아오면 보던 위치로 되돌립니다
  const wasOpen = useRef(false)
  useEffect(() => {
    if (wasOpen.current && !reading) requestAnimationFrame(() => window.scrollTo({ top: listScroll.current }))
    wasOpen.current = reading
  }, [reading])
  const tagFromPost = useCallback(
    (t: string) => {
      openedHere.current = false
      router.replace({ pathname: "/", query: { tag: t } }, undefined, { shallow: true, scroll: false })
    },
    [router]
  )

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return posts.filter((p) => {
      if (category && p.category !== category) return false
      if (tag && !p.tags.includes(tag)) return false
      if (!needle) return true
      return [p.title, p.summary, p.category, ...p.tags].join(" ").toLowerCase().includes(needle)
    })
  }, [posts, q, category, tag])

  // LOG 번호: 가장 오래된 글이 #1, 최신 글이 #전체
  const logNo = useMemo(() => new Map(posts.map((p, i) => [p.slug, posts.length - i])), [posts])
  const filtering = !!(q.trim() || category || tag)
  const latest = posts[0]
  const project = posts.find((p) => p.slug === FEATURED.project)
  const pick = posts.find((p) => p.slug === FEATURED.pick)

  // 연·월로 묶고, 같은 달에 같은 분류 글이 2편 이상이면 "Unity 6편"처럼 표시합니다
  const byMonth = useMemo(() => {
    const list = filtering ? filtered : filtered.filter((p) => p.slug !== latest?.slug)
    const m = new Map<string, PostMeta[]>()
    list.forEach((p) => {
      const k = p.date.slice(0, 7) || "날짜 없음"
      m.set(k, [...(m.get(k) || []), p])
    })
    return [...m].map(([month, items]) => {
      const c = new Map<string, number>()
      items.forEach((p) => p.category && c.set(p.category, (c.get(p.category) || 0) + 1))
      const top = [...c].sort((a, b) => b[1] - a[1])[0]
      return { month: month.replace("-", "."), items, series: top && top[1] >= 2 ? `${splitCategory(top[0]).text} ${top[1]}편` : "" }
    })
  }, [filtered, filtering, latest])

  // 오른쪽 "이어 읽는 시리즈": 글이 많은 주제 4개
  const series = useMemo(() => {
    const all = topics.flatMap((g) => g.items.map((i) => ({ ...i, group: g.group })))
    return all.sort((a, b) => b.count - a.count).slice(0, 4)
  }, [topics])
  const seriesMax = series[0]?.count || 1

  const community = useCommunity()
  const counts = community.data?.commentCounts || {}
  const years = posts.length ? `${posts[posts.length - 1].date.slice(0, 4)} → ${posts[0].date.slice(0, 4)}` : ""

  return (
    <>
      <Seo />
      {/* 맨 위: 방명록 포스트잇 띠 (글이나 도구를 열면 숨김) */}
      <div className="container strip-wrap" hidden={reading}>
        <GuestStrip status={community.status} data={community.data} />
      </div>

      <div className={`container home${reading ? " reading" : ""}`}>
        {/* 왼쪽: 프로필 · 도구 */}
        <aside className="side side-left" aria-label="프로필">
          <div className="card">
            <div className="profile">
              <img src={CONFIG.profile.image} alt="" width={56} height={56} />
              <div><b>{CONFIG.profile.name}</b><span>{CONFIG.profile.role}</span></div>
            </div>
            <p className="bio">{CONFIG.profile.bio}</p>
            <div className="links">
              <a href={`https://github.com/${CONFIG.profile.github}`} target="_blank" rel="noopener noreferrer"><GithubIcon /> GitHub</a>
            </div>
          </div>

          <div className="card">
            <p className="side-h">도구</p>
            <ul className="projects">
              {CONFIG.projects.map((p: { name: string; href: string }) => (
                <li key={p.name}>
                  <a
                    href={p.href}
                    aria-current={p.href === "/fx" && openTool ? "page" : undefined}
                    onClick={p.href === "/fx" ? openFx : undefined}
                    {...(p.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    <ArrowUpRightIcon />{p.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* 가운데 + 오른쪽: 글을 열면 이 자리에 본문을 보여줍니다 */}
        {openSlug && <PostReader slug={openSlug} onBack={closePost} onNavigate={navigatePost} onTag={tagFromPost} />}
        {openTool && <ToolView onBack={closePost} />}

        {/* 가운데: 기록 */}
        <div className="feed" hidden={reading}>
          <div className="feed-head">
            <h1>기록</h1>
            <span>전체 {posts.length}편 · {years}</span>
          </div>

          {!filtering && latest && (
            <>
              <Link href={`/${latest.slug}`} onClick={(e) => openPost(e, latest.slug)} className="latest-card">
                <div className="latest-meta">
                  <b>LOG #{logNo.get(latest.slug)} · 최신</b>
                  <span>{fmtDate(latest.date)}{latest.category && ` · ${splitCategory(latest.category).text}`}</span>
                </div>
                <h2>{latest.title}</h2>
                {latest.summary && <p>{latest.summary}</p>}
              </Link>
              {(project || pick) && (
                <div className="feature-grid">
                  {[{ p: project, label: "대표 프로젝트" }, { p: pick, label: "추천 글" }].map(({ p, label }) =>
                    p ? (
                      <Link key={p.slug} href={`/${p.slug}`} onClick={(e) => openPost(e, p.slug)} className="feature-card">
                        {p.thumbnail ? <img src={p.thumbnail} alt="" loading="lazy" decoding="async" /> : <span className="feature-ph" />}
                        <div><small>{label}</small><b>{p.title}</b></div>
                      </Link>
                    ) : null
                  )}
                </div>
              )}
            </>
          )}

          <div className="toolbar">
            <label className="search">
              <SearchIcon />
              <span className="sr-only">글 검색</span>
              <input
                id="q"
                type="search"
                value={q}
                placeholder="제목, 요약, 태그로 찾기"
                onChange={(e) => setQuery({ q: e.target.value })}
              />
            </label>
            <div className="chips" role="group" aria-label="카테고리">
              <button className="chip" aria-pressed={!category} onClick={() => setQuery({ category: "" })}>
                전체 <span className="n">{posts.length}</span>
              </button>
              {categories.map((c) => (
                <button key={c.name} className="chip" aria-pressed={category === c.name} onClick={() => setQuery({ category: category === c.name ? "" : c.name })}>
                  {c.name} <span className="n">{c.count}</span>
                </button>
              ))}
            </div>
            {tag && (
              <div className="active-filter">
                주제
                <button onClick={() => setQuery({ tag: "" })} aria-label={`${tagLabel(tag)} 주제 해제`}>
                  {tagLabel(tag)} <CloseIcon />
                </button>
              </div>
            )}
          </div>

          {byMonth.length === 0 && <p className="empty">조건에 맞는 글이 없어요. 검색어나 분류를 바꿔 보세요.</p>}
          {byMonth.map(({ month, items, series }) => (
            <section key={month} aria-label={`${month} 기록`} className="log-group">
              <div className="log-month"><b>{month}</b><span />{series && <em>{series}</em>}</div>
              <ul className="log-list">
                {items.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/${p.slug}`} onClick={(e) => openPost(e, p.slug)} className="log-row">
                      <span className="log-no">LOG #{logNo.get(p.slug)}</span>
                      <span className="log-title">
                        <b>{p.title}</b>
                        {p.summary && <small>{p.summary}</small>}
                      </span>
                      <span className="log-side">
                        {counts[p.slug] ? <em>댓글 {counts[p.slug]}</em> : null}
                        {p.thumbnail && <img src={p.thumbnail} alt="" loading="lazy" decoding="async" />}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* 오른쪽: 시리즈 · 최근 댓글 · 주제 */}
        <aside className="side side-right" aria-label="시리즈와 주제" hidden={reading}>
          <p className="side-h">이어 읽는 시리즈</p>
          <div className="series">
            {series.map((s) => (
              <button key={s.tag} onClick={() => setQuery({ tag: tag === s.tag ? "" : s.tag })} aria-pressed={tag === s.tag}>
                <span className="series-row"><span>{s.group} · {s.name}</span><b>{s.count}</b></span>
                <span className="series-bar" style={{ width: `${Math.round((s.count / seriesMax) * 100)}%` }} />
              </button>
            ))}
          </div>

          <p className="side-h">최근 댓글</p>
          <div className="recent">
            {community.status === "loading" && <p className="recent-empty">불러오는 중…</p>}
            {community.status === "error" && <p className="recent-empty">지금은 불러오지 못했어요.</p>}
            {community.status === "ready" && !community.data!.recent.length && <p className="recent-empty">아직 댓글이 없어요. 글 아래에서 첫 댓글을 남겨 주세요.</p>}
            {community.data?.recent.map((c) => {
              const post = posts.find((p) => p.slug === c.slug)
              return (
                <Link key={c.id} href={`/${c.slug}`} onClick={(e) => openPost(e, c.slug)} className="recent-item">
                  <span className="recent-who">{c.login} · {ago(c.createdAt)}</span>
                  <span className="recent-body">“{c.body || "(내용 없음)"}”</span>
                  <span className="recent-post">↳ {post?.title || c.slug}</span>
                </Link>
              )
            })}
          </div>

          <p className="side-h">주제</p>
          <div className="topics">
            {topics.map((g) => (
              <div key={g.group}>
                <div className="g">{g.group}</div>
                <ul>
                  {g.items.map((i) => (
                    <li key={i.tag}>
                      <button aria-pressed={tag === i.tag} onClick={() => setQuery({ tag: tag === i.tag ? "" : i.tag })}>
                        {i.name} <span className="n">{i.count}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </>
  )
}
