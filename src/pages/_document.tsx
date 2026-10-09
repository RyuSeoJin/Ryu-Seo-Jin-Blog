import { Head, Html, Main, NextScript } from "next/document"
import { CONFIG } from "site.config"

// 저장된 테마 → 없으면 설정값(scheme) → system 이면 OS 설정. 화면이 그려지기 전에 정해 깜빡임을 막습니다.
const themeScript = `(function(){try{var s=localStorage.getItem('theme');var d=${JSON.stringify(CONFIG.blog.scheme)};var t=s||(d==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):d);document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();`

export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="192x192" href="/apple-touch-icon.png" />
        <link rel="alternate" type="application/rss+xml" title={CONFIG.blog.title} href="/feed" />
        {/* Pretendard 다이나믹 서브셋: 화면에 나온 글자 묶음만 내려받습니다 (전체 9종 7MB → 보통 수백 KB) */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
