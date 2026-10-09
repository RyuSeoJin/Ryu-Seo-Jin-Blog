import path from "path"
import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"
import remarkRehype from "remark-rehype"
import rehypeRaw from "rehype-raw"
import rehypeSlug from "rehype-slug"
import rehypeHighlight from "rehype-highlight"
import rehypeStringify from "rehype-stringify"
import { visit } from "unist-util-visit"
import { toString } from "hast-util-to-string"
import sharp from "sharp"

export type Heading = { id: string; text: string; depth: 2 | 3 }

type HastNode = {
  type: string
  tagName?: string
  properties?: Record<string, any>
  children?: HastNode[]
  value?: string
}

/** h2·h3 를 모아 목차를 만듭니다 */
function rehypeCollectHeadings(out: Heading[]) {
  return () => (tree: HastNode) => {
    visit(tree as any, "element", (node: HastNode) => {
      if (node.tagName === "h2" || node.tagName === "h3") {
        const id = node.properties?.id
        if (id) out.push({ id: String(id), text: toString(node as any), depth: node.tagName === "h2" ? 2 : 3 })
      }
    })
  }
}

/** 로컬 이미지에 가로·세로 크기와 지연 로딩을 붙여 레이아웃 흔들림을 막습니다 */
function rehypeImages() {
  return async (tree: HastNode) => {
    const jobs: Promise<void>[] = []
    visit(tree as any, "element", (node: HastNode) => {
      if (node.tagName !== "img") return
      const p = (node.properties ||= {})
      p.loading = "lazy"
      p.decoding = "async"
      const src = String(p.src || "")
      if (src.startsWith("/") && !p.width) {
        const file = path.join(process.cwd(), "public", decodeURIComponent(src))
        jobs.push(
          sharp(file)
            .metadata()
            .then((m) => {
              if (m.width && m.height) {
                p.width = m.width
                p.height = m.pageHeight || m.height
              }
            })
            .catch(() => {})
        )
      }
    })
    await Promise.all(jobs)
  }
}

/** 외부 링크는 새 탭, 표는 가로 스크롤 상자로 감쌉니다 */
function rehypeTweaks() {
  return (tree: HastNode) => {
    visit(tree as any, "element", (node: HastNode, index: number | undefined, parent: HastNode | undefined) => {
      if (node.tagName === "a") {
        const href = String(node.properties?.href || "")
        if (/^https?:\/\//.test(href) && !href.startsWith("https://ryuseojin.com")) {
          node.properties = { ...node.properties, target: "_blank", rel: "noopener noreferrer" }
        }
      }
      if (node.tagName === "table" && parent && typeof index === "number" && parent.tagName !== "div") {
        parent.children![index] = {
          type: "element",
          tagName: "div",
          properties: { className: ["table-wrap"] },
          children: [node],
        }
      }
      if (node.tagName === "iframe") {
        node.properties = { ...node.properties, loading: "lazy" }
      }
    })
  }
}

export async function renderMarkdown(md: string): Promise<{ html: string; headings: Heading[] }> {
  const headings: Heading[] = []
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeCollectHeadings(headings))
    .use(rehypeHighlight, { detect: false, ignoreMissing: true } as any)
    .use(rehypeImages)
    .use(rehypeTweaks)
    .use(rehypeStringify)
    .process(md)
  return { html: String(file), headings }
}
