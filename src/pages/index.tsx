import type { GetStaticProps } from "next"
import Link from "next/link"
import { useRouter } from "next/router"
import { useMemo } from "react"
import { CONFIG } from "site.config"
import Seo from "src/components/Seo"
import { ArrowUpRightIcon, CloseIcon, GithubIcon, LinkedinIcon, MailIcon, SearchIcon } from "src/components/Icons"
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

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return posts.filter((p) => {
      if (category && p.category !== category) return false
      if (tag && !p.tags.includes(tag)) return false
      if (!needle) return true
      return [p.title, p.summary, p.category, ...p.tags].join(" ").toLowerCase().includes(needle)
    })
  }, [posts, q, category, tag])

  const byYear = useMemo(() => {
    const m = new Map<string, PostMeta[]>()
    filtered.forEach((p) => {
      const y = p.date.slice(0, 4) || "날짜 없음"
      m.set(y, [...(m.get(y) || []), p])
    })
    return [...m]
  }, [filtered])

  return (
    <>
      <Seo />
      <div className="container home">
        <div>
          <section className="hero">
            <span className="eyebrow">{CONFIG.profile.role} · {CONFIG.profile.name}</span>
            <h1>{CONFIG.profile.bio}</h1>
            <p>공부한 내용과 작업 기록을 모아 둔 블로그 겸 포트폴리오입니다. 글 {posts.length}편.</p>
          </section>

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

          {byYear.length === 0 && <p className="empty">조건에 맞는 글이 없어요. 검색어나 분류를 바꿔 보세요.</p>}
          {byYear.map(([year, list]) => (
            <section key={year} aria-label={`${year}년 글`}>
              <div className="year"><h2>{year}</h2><span /></div>
              <ul className="post-list">
                {list.map((p) => (
                  <li key={p.slug} className="post-row">
                    <Link href={`/${p.slug}`}>
                      <div className="info">
                        <h3>{p.title}</h3>
                        {p.summary && <p>{p.summary}</p>}
                        <div className="meta">
                          <time dateTime={p.date}>{fmtDate(p.date)}</time>
                          {p.category && <><span className="dot" />{splitCategory(p.category).text}</>}
                          <span className="dot" />{p.readMinutes}분
                        </div>
                      </div>
                      {p.thumbnail && (
                        <div className="thumb"><img src={p.thumbnail} alt="" loading="lazy" decoding="async" /></div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <aside className="aside">
          <div>
            <div className="profile">
              <img src={CONFIG.profile.image} alt="" width={56} height={56} />
              <div><b>{CONFIG.profile.name}</b><span>{CONFIG.profile.role}</span></div>
            </div>
            <div className="links" style={{ marginTop: 14 }}>
              <a href={`mailto:${CONFIG.profile.email}`}><MailIcon /> 메일</a>
              <a href={`https://github.com/${CONFIG.profile.github}`} target="_blank" rel="noopener noreferrer"><GithubIcon /> GitHub</a>
              <a href={`https://www.linkedin.com/in/${CONFIG.profile.linkedin}`} target="_blank" rel="noopener noreferrer"><LinkedinIcon /> LinkedIn</a>
              <Link href="/guestbook">✍️ 방명록</Link>
            </div>
          </div>

          <div>
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
          </div>

          <div>
            <p className="side-h">포트폴리오 · 도구</p>
            <ul className="projects">
              {CONFIG.projects.map((p: { name: string; href: string }) => (
                <li key={p.name}>
                  <a href={p.href} {...(p.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                    <ArrowUpRightIcon />{p.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  )
}
