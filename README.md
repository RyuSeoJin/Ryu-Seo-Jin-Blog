# Ryu Seo Jin 블로그

레벨 디자이너 류서진의 공부 기록과 포트폴리오 — https://ryuseojin.com

Next.js(pages router) 정적 블로그입니다. 글은 노션이 아니라 저장소 안의 마크다운 파일로 관리합니다.

## 글 쓰기

### 방법 1. 웹 관리자 화면
1. https://ryuseojin.com/admin 에 접속해 GitHub로 로그인합니다.
2. "새 글"에서 작성하고 저장하면 저장소에 커밋되고, Vercel이 자동으로 다시 배포합니다(1~2분).
3. 공개 상태를 "임시저장"으로 두면 사이트에 보이지 않습니다.

### 방법 2. 마크다운 파일
`content/posts/<주소>.md` 파일을 만들고 push합니다.

```md
---
title: "[Unity] 타일맵 개념 및 설정 방법"
slug: "wiki-unity-tilemap"      # 글 주소: ryuseojin.com/wiki-unity-tilemap
date: "2025-09-18"
status: "public"                # public(목록에 보임) | unlisted(링크로만) | draft(숨김)
category: "👾 Unity"
tags: ["3::유니티::개념"]        # "순서::분류::이름" 형식이면 사이드바 주제 트리에 묶입니다
summary: ""
thumbnail: ""                   # 예) /images/posts/<주소>/thumb.webp
---

본문…
```

이미지는 `public/images/posts/<주소>/` 에 넣고 `![설명](/images/posts/<주소>/01.webp)` 처럼 씁니다.
펼치기 블록은 `<details><summary>제목</summary> … </details>` 를 그대로 쓸 수 있습니다.

## 구조

| 경로 | 내용 |
|---|---|
| `content/posts/` | 글 마크다운 (`about.md` 는 /about 페이지) |
| `public/images/` | 글 이미지 (노션에서 옮긴 것은 `posts/`, 관리자 화면 업로드는 `uploads/`) |
| `public/fx/` | 도트 이펙트 작업대 (/fx) |
| `public/admin/` | 웹 관리자 화면 (Decap CMS) |
| `src/pages/api/decap/` | 관리자 화면 GitHub 로그인 |
| `scripts/build-feed.mjs` | 빌드 전에 RSS(/feed) 생성 |
| `site.config.js` | 프로필, 포트폴리오 링크, 테마 기본값 |

## 로컬 실행

```bash
npm install
npm run dev
```

## Vercel 환경변수

| 이름 | 용도 |
|---|---|
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | 관리자 화면 로그인용 GitHub OAuth App |
| `NEXT_PUBLIC_UTTERANCES_REPO` | 댓글(utterances) 저장소, 예) `RyuSeoJin/morethan-log` |
