const CONFIG = {
  // 프로필
  profile: {
    name: "류서진",
    nameEn: "Ryu Seo Jin",
    image: "/RyuSeoJin_Black.svg",
    role: "레벨 디자이너",
    bio: "동선과 시선 유도, 플로우를 고려한 공간 디자인을 지향합니다.",
    email: "fbwls0218@gmail.com",
    linkedin: "RyuSeoJin",
    github: "RyuSeoJin",
  },
  // 사이드바 "포트폴리오·도구" 목록
  projects: [
    { name: "포트폴리오 1 · Lakaya(창작 슈팅 게임) 레벨 기획서", href: "https://ryuseojin.com/" },
    { name: "포트폴리오 2 · 로스트아크 아르모체 하드 레벨 역기획서", href: "https://ryuseojin.com/" },
    { name: "포트폴리오 3 · 로스트아크 4막: 에키드나 레벨 역기획서", href: "https://ryuseojin.com/" },
    { name: "도트 이펙트 작업대", href: "/fx" },
  ],
  blog: {
    title: "Ryu Seo Jin",
    description: "레벨 디자이너 류서진의 공부 기록과 포트폴리오",
    scheme: "dark", // 처음 방문했을 때의 테마: 'light' | 'dark' | 'system'
  },
  link: "https://ryuseojin.com",
  since: 2022,
  lang: "ko-KR",

  // 댓글 (giscus: GitHub Discussions 에 저장, 방문자는 GitHub 로 로그인)
  // 값은 https://giscus.app 설정 화면에서 확인할 수 있습니다. 비밀값이 아닙니다.
  giscus: {
    enable: true,
    repo: "RyuSeoJin/morethan-log",
    repoId: "R_kgDOQ6XffA",
    category: "Announcements",
    categoryId: "DIC_kwDOQ6XffM4DHZTH",
  },
  // 웹 관리자 화면 (/admin)
  cms: {
    repo: "RyuSeoJin/morethan-log",
    branch: "main",
  },
}

module.exports = { CONFIG }
