import Head from "next/head"
import { CONFIG } from "site.config"

type Props = { title?: string; description?: string; path?: string; image?: string; type?: "website" | "article"; date?: string }

export default function Seo({ title, description, path = "", image, type = "website", date }: Props) {
  const fullTitle = title ? `${title} | ${CONFIG.blog.title}` : CONFIG.blog.title
  const desc = description || CONFIG.blog.description
  const url = `${CONFIG.link}${path}`
  const img = image ? (image.startsWith("http") ? image : `${CONFIG.link}${image}`) : `${CONFIG.link}/apple-touch-icon.png`
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title || CONFIG.blog.title} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta property="og:locale" content="ko_KR" />
      <meta name="twitter:card" content="summary_large_image" />
      {date && <meta property="article:published_time" content={date} />}
    </Head>
  )
}
