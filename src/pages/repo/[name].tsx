import type { GetStaticPaths, GetStaticProps } from "next"
import Link from "next/link"
import { ArrowLeftIcon } from "src/components/Icons"
import RepoView from "src/components/RepoView"
import Seo from "src/components/Seo"
import Toc from "src/components/Toc"
import type { Heading } from "src/lib/markdown"
import { getRepoPage, repoNames, type RepoCard } from "src/lib/repos"

type Props = { repo: RepoCard; html: string; headings: Heading[]; readme: string }

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: repoNames().map((name) => ({ params: { name } })),
  fallback: false,
})

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const page = await getRepoPage(String(params?.name))
  if (!page) return { notFound: true }
  return { props: page }
}

/** GitHub 레포 소개글 페이지 (/repo/이름). 메인 화면에서는 같은 내용을 가운데 칸에 엽니다. */
export default function RepoPage({ repo, html, headings, readme }: Props) {
  return (
    <>
      <Seo title={repo.name} description={repo.description || `${repo.name} GitHub 레포 소개`} path={`/repo/${repo.name}`} />
      <div className="container article-wrap">
        <article className="article">
          <Link href="/" className="back-btn"><ArrowLeftIcon /> 글 목록으로 돌아가기</Link>
          <RepoView repo={repo} html={html} readme={readme} />
        </article>
        <Toc headings={headings} />
      </div>
    </>
  )
}
