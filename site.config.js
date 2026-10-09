const CONFIG = {
  // profile setting (required)
  profile: {
    name: "류서진",
    image: "/RyuSeoJin_Black.svg", // If you want to create your own notion avatar, check out https://notion-avatar.vercel.app
    role: "레벨 디자이너",
    bio: "동선과 시선 유도, 플로우를 고려한 공간 디자인을 지향합니다.",
    email: "fbwls0218@gmail.com",
    linkedin: "RyuSeoJin",
    github: "RyuSeoJin",
    instagram: "",
  },
  projects: [
    {
      name: `포트폴리오 1 [Lakaya(창작 슈팅 게임) 레벨 기획서]`,
      href: "https://ryuseojin.com/",
    },
    {
      name: `포트폴리오 2 [로스트아크 아르모체 하드 레벨 역기획서]`,
      href: "https://ryuseojin.com/",
    },
    {
      name: `포트폴리오 3 [로스트아크 4막: 에키드나 레벨 역기획서]`,
      href: "https://ryuseojin.com/",
    },
    {
      name: `도트 이펙트 작업대`,
      href: "https://ryuseojin.com/fx",
    },
  ],
  // blog setting (required)
  blog: {
    title: "Ryu Seo Jin",
    description: "오신 것을 환영합니다.",
    scheme: "dark", // 'light' | 'dark' | 'system'
  },

  // CONFIG configration (required)
  link: "https://ryuseojin.com/",
  since: 2022, // If leave this empty, current year will be used.
  lang: "ko-KR", // ['en-US', 'zh-CN', 'zh-HK', 'zh-TW', 'ja-JP', 'es-ES', 'ko-KR']
  ogImageGenerateURL: "https://og-image-korean.vercel.app", // The link to generate OG image, don't end with a slash

  // notion configuration (required)
  notionConfig: {
    pageId: process.env.NOTION_PAGE_ID,
  },

  // plugin configuration (optional)
  googleAnalytics: {
    enable: false,
    config: {
      measurementId: process.env.NEXT_PUBLIC_GOOGLE_MEASUREMENT_ID || "",
    },
  },
  googleSearchConsole: {
    enable: false,
    config: {
      siteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
    },
  },
  naverSearchAdvisor: {
    enable: false,
    config: {
      siteVerification: process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION || "",
    },
  },
  utterances: {
    enable: true,
    config: {
      repo: process.env.NEXT_PUBLIC_UTTERANCES_REPO || "",
      "issue-term": "og:title",
      label: "💬 Utterances",
    },
  },
  cusdis: {
    enable: false,
    config: {
      host: "https://cusdis.com",
      appid: "", // Embed Code -> data-app-id value
    },
  },
  isProd: process.env.VERCEL_ENV === "production", // distinguish between development and production environment (ref: https://vercel.com/docs/environment-variables#system-environment-variables)
  revalidateTime: 3600, // revalidate time for [slug], index
}

module.exports = { CONFIG }
