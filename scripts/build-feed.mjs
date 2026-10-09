// 빌드 전에 실행: content/posts 의 공개 글로 public/feed.xml (RSS 2.0) 을 만듭니다.
import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { createRequire } from "module"

const require = createRequire(import.meta.url)
const { CONFIG } = require("../site.config.js")
const dir = path.join(process.cwd(), "content", "posts")
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

const posts = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".md"))
  .map((f) => matter(fs.readFileSync(path.join(dir, f), "utf8")).data)
  .filter((d) => (d.status || "public") === "public" && d.slug && d.title)
  .map((d) => ({ ...d, date: d.date instanceof Date ? d.date.toISOString().slice(0, 10) : String(d.date).slice(0, 10) }))
  .sort((a, b) => (a.date < b.date ? 1 : -1))
  .slice(0, 50)

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
