/**
 * 빌드 때 만들어 둔 페이지 데이터(pageProps)를 브라우저에서 받아 옵니다. 메인 화면 안에서 글·레포 소개를 열 때 씁니다.
 * 화면을 연 뒤 사이트가 새로 배포되면 예전 빌드 주소의 데이터가 사라지므로,
 * 그때는 그 페이지 HTML 에 들어 있는 최신 데이터(__NEXT_DATA__)를 대신 읽습니다.
 * path 는 "/글주소" 나 "/repo/이름" 처럼 / 로 시작합니다.
 */
export async function loadPageProps(path: string): Promise<any> {
  const buildId = (window as any).__NEXT_DATA__?.buildId
  const res = await fetch(`/_next/data/${buildId}${path}.json`).catch(() => null)
  if (res?.ok) return (await res.json()).pageProps
  const html = await fetch(path).then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
  const raw = new DOMParser().parseFromString(html, "text/html").getElementById("__NEXT_DATA__")?.textContent
  const p = raw && JSON.parse(raw).props?.pageProps
  if (!p) throw new Error("no data")
  return p
}
