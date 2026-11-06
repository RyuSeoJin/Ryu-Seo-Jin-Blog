---
title: "[깃허브] markcont — 마크다운을 보기 좋게 보고 바로 고치는 뷰어"
slug: "github-markcont"
date: "2026-11-06"
type: "Post"
status: "public"
category: "💠깃허브"
tags: ["98::폴더관리::깃허브"]
summary: "기획서 · 규칙 문서 같은 마크다운 파일을 보기 좋게 보고, 그 자리에서 고치고, AI와 함께 다듬을 수 있게 만든 웹 앱 · PC 프로그램 소개"
thumbnail: "/images/posts/github-markcont/demo.gif"
---
> 📦 GitHub 저장소: [RyuSeoJin/markcont](https://github.com/RyuSeoJin/markcont) · 🌐 [웹 앱 바로 쓰기](https://ryuseojin.github.io/markcont/) · 📥 [PC 프로그램 내려받기](https://github.com/RyuSeoJin/markcont/releases/latest)

![markcont 데모](/images/posts/github-markcont/demo.gif)

## 한 줄로

마크다운 파일을 **보기 좋게 보고, 그 자리에서 바로 고치는** 뷰어 markcont(**mark**down **cont**roller)를 제작했습니다. 웹 앱과 Windows · macOS · Linux PC 프로그램으로 쓸 수 있습니다.

## 왜 만들었나요

AI(Claude Code · Codex)와 함께 기획서 · 규칙 문서를 마크다운으로 쓰다 보니, 다음과 같은 문제를 겪었습니다.

* 메모장 · 코드 편집기로 열면 **표 · 알림 상자 · 흐름도가 기호 그대로** 보여서 문서를 한눈에 읽기 어렵습니다.
* 흐름 노드 · 노출 위치 · 데이터 정의처럼 기획서에 꼭 필요한 내용을 **그림으로 보여 줄 방법**이 마땅치 않았습니다.
* AI가 고친 곳이 **어디인지, 저장하면 무엇이 바뀌는지** 확인하기 번거로웠습니다.

그래서 "마크다운을 열면 바로 읽기 좋은 문서가 되고, 고친 곳이 보이고, AI에게 맡기기 쉬운" 뷰어를 직접 만들었습니다.

## 무엇을 할 수 있나요

| 기능 | 내용 |
| --- | --- |
| 보기 좋게 | 알림 상자 · 표 · 체크리스트 · 코드 색상 · 수식 · 화학식을 GitHub 스타일로 |
| 실시간 편집 | 원본과 결과를 나란히, 고친 줄 표시 · 저장 후 바뀐 내용 · 되돌리기 기록 |
| 폴더 작업 공간 | 여러 폴더를 트리로 열고 새 문서 · 이름 바꾸기 · 삭제 |
| markcont 다이어그램 | 노드 표로 그리는 흐름도(유저 · 시스템 구역, 예 = 파랑 · 아니오 = 빨강), 주고받는 순서, 상태 변화, 일정표 |
| 기획서용 블록 | 진입점을 나눠 보여 주는 **노출 위치**, 데이터마다 카드로 보여 주는 **데이터 정의**, 표 칸 **상태 배지** |
| AI와 함께 | 작성 규칙 문서를 AI에게 주고 "이 규칙대로 다시 써 줘", PC 프로그램은 Claude와 MCP로 연결해 열어 둔 폴더의 문서를 직접 고치기 |
| 저장 · 내보내기 | 저장 전 바뀐 내용 확인, 새 파일로 저장, PDF · HTML, **다른 뷰어용으로 저장**(전용 문법을 표준 마크다운으로) |
| 한국어 · English | 화면과 안내 문서 모두 두 언어 |

## 어떻게 쓰나요

### 1. 바로 쓰기 (설치 없음)

[ryuseojin.github.io/markcont](https://ryuseojin.github.io/markcont/) 에 들어가 `.md` 파일을 창에 끌어다 놓거나 **파일 열기 · 폴더 열기**를 누릅니다. 파일은 내 컴퓨터 안에서만 읽고, 어디에도 올라가지 않습니다.

### 2. PC 프로그램

[Releases](https://github.com/RyuSeoJin/markcont/releases/latest) 에서 받아 설치합니다.

* Windows: `-setup.exe`
* macOS: `.dmg`
* Linux: `.AppImage` 또는 `.deb`

설치하면 `.md` 파일을 더블클릭해서 바로 열 수 있고, Claude Desktop · Claude Code와 연결할 수 있습니다.

### 3. AI에게 문서 맡기기

**⋯ → 마크다운 작성 규칙**(큰 흐름도는 **워크플로우 작성 규칙**)을 AI에게 같이 주고 "이 규칙대로 다시 써 줘"라고 하면, markcont에서 보기 좋은 모양으로 정리됩니다. GitHub 같은 다른 곳에서도 볼 문서라면 "9장 표에서 ❌인 문법은 쓰지 마"를 덧붙이면 됩니다.

## 지키는 원칙

* **원본 글은 바꾸지 않고 보여 주는 방식으로 해결합니다.** 상태 배지 · 표 줄바꿈 · 섹션 묶기는 문서 정보와 섹션 줄만으로 켜고, 본문 글은 그대로 둡니다.
* **markcont 전용 문법도 다른 곳으로 가져갈 수 있게 합니다.** 다른 뷰어용으로 저장하면 표준 마크다운 사본을 만들고, 다이어그램은 Mermaid로 바꿉니다.
* **외부 라이브러리 없이 그립니다.** 흐름도 · 노출 위치 · 데이터 정의는 markcont가 직접 SVG · HTML로 그려서 인터넷 없이도 동작합니다.
