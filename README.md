# Ryu Seo Jin 블로그

레벨 디자이너 류서진의 공부 기록과 포트폴리오 — https://ryuseojin.com

Next.js(pages router) 정적 블로그입니다. 글은 노션이 아니라 저장소 안의 마크다운 파일로 관리합니다.

## 글 쓰기

### 방법 1. 글쓰기 화면 (/write)
1. https://ryuseojin.com 에서 블로그 주인 GitHub 계정으로 로그인한 뒤, 헤더의 "새 글 쓰기"를 누릅니다.
2. 노션처럼 블록으로 씁니다. `/` 로 제목·목록·코드·이미지 메뉴, 이미지는 붙여넣기·끌어 놓기.
3. 저장하면 `content/posts/<주소>.md` 로 커밋되고 Vercel 이 다시 배포합니다(1~2분). "임시저장" 상태는 사이트에 보이지 않습니다.
4. 예전 관리자 화면(/admin, Decap CMS)도 그대로 쓸 수 있습니다.

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
| `content/posts/` | 글 마크다운 |
| `content/repos/` | GitHub 레포 소개글 (/repo/<이름>) |
| `public/images/` | 글 이미지 (노션에서 옮긴 것은 `posts/`, 관리자 화면 업로드는 `uploads/`) |
| `public/fx/` | 도트 이펙트 작업대 (/fx) |
| `public/admin/` | 웹 관리자 화면 (Decap CMS) |
| `src/pages/write.tsx`, `src/pages/api/write/` | 글쓰기 화면과 저장(주인만) |
| `src/pages/api/comments/` | 댓글·방명록 API (GitHub Discussions) |
| `src/pages/api/decap/` | 관리자 화면 GitHub 로그인 |
| `scripts/build-feed.mjs` | 빌드 전에 RSS(/feed) · sitemap.xml · robots.txt 생성 |
| `site.config.js` | 프로필, 도구·GitHub 레포 목록, 테마 기본값 |

## 로컬 실행

```bash
npm install
npm run dev
```

## Vercel 환경변수

| 이름 | 용도 |
|---|---|
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | 관리자 화면(/admin) 로그인용 GitHub OAuth App |
| `GITHUB_COMMENTAPP_ID`, `GITHUB_COMMENTAPP_CLIENT_ID`, `GITHUB_COMMENTAPP_CLIENT_SECRET`, `GITHUB_COMMENTAPP_PRIVATE_KEY` | 댓글·방명록 로그인과 글쓰기 저장용 GitHub App (Discussions · Contents 읽기·쓰기, 공개 앱) |


## 댓글

블로그 자체 댓글 창(`src/components/Comments.tsx`)을 씁니다. 방문자는 GitHub 로 로그인하고, 댓글은 이 저장소의
Discussions(Announcements 분류)에 저장됩니다 — 글 하나가 토론 하나(제목 = 글 주소), 방명록은 `guestbook` 토론.
인기/최신 탭, 좋아요·싫어요, 답글, 내 댓글 수정·삭제를 지원합니다.

## 라이선스

이 저장소의 글·이미지·코드·디자인은 모두 류서진에게 저작권이 있습니다(All rights reserved).
공개 저장소이지만 사용을 허락하는 라이선스는 없으니, 출처를 밝힌 짧은 인용 외에는 허락 없이 쓸 수 없습니다.
자세한 내용은 [LICENSE](LICENSE)를 보세요.
