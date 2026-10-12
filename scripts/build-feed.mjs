// 빌드 전에 실행: content/posts 의 공개 글로 public/feed.xml (RSS 2.0), public/sitemap.xml, public/robots.txt 를 만듭니다.
// 관리자 화면(/admin)에서 글을 쓰거나 지워도 다음 배포 때 저절로 반영됩니다.
import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { createRequire } from "module"

const require = createRequire(import.meta.url)
const { CONFIG } = require("../site.config.js")
const dir = path.join(process.cwd(), "content", "posts")
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

const all = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".md"))
  .map((f) => matter(fs.readFileSync(path.join(dir, f), "utf8")).data)
  .filter((d) => (d.status || "public") === "public" && d.slug && d.title)
  .map((d) => ({ ...d, date: d.date instanceof Date ? d.date.toISOString().slice(0, 10) : String(d.date).slice(0, 10) }))
  .sort((a, b) => (a.date < b.date ? 1 : -1))
const posts = all.slice(0, 50)

const items = posts
  .map((p) => {
    const url = `${CONFIG.link}/${p.slug}`
    return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(p.date + "T09:00:00+09:00").toUTCString()}</pubDate>
      ${p.category ? `<category>${esc(p.category)}</category>` : ""}
      <description>${esc(p.summary || "")}</description>
    </item>`
  })
  .join("\n")

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${esc(CONFIG.blog.title)}</title>
    <link>${CONFIG.link}</link>
    <description>${esc(CONFIG.blog.description)}</description>
    <language>ko</language>
${items}
  </channel>
</rss>
`
fs.writeFileSync(path.join(process.cwd(), "public", "feed.xml"), xml)
console.log(`feed.xml: 글 ${posts.length}편`)

// ── 사이트맵: 메인·방명록·도트 이펙트 작업대 + 공개 글 전부 (lastmod 는 글 날짜) ──
const latest = all[0]?.date
const pages = [
  { loc: CONFIG.link, lastmod: latest, priority: "1.0" },
  { loc: `${CONFIG.link}/guestbook`, priority: "0.6" },
  { loc: `${CONFIG.link}/fx`, priority: "0.5" },
  ...all.map((p) => ({ loc: `${CONFIG.link}/${encodeURIComponent(p.slug)}`, lastmod: p.date, priority: "0.8" })),
]
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((u) => `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}<priority>${u.priority}</priority></url>`).join("\n")}
</urlset>
`
fs.writeFileSync(path.join(process.cwd(), "public", "sitemap.xml"), sitemap)
fs.writeFileSync(
  path.join(process.cwd(), "public", "robots.txt"),
  `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${CONFIG.link}/sitemap.xml
`
)
console.log(`sitemap.xml: 주소 ${pages.length}개`)
