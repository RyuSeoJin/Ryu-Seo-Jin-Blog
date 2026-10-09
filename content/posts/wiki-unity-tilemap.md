---
title: "[Unity] 타일맵 개념 및 설정 방법"
slug: "wiki-unity-tilemap"
date: "2025-09-18"
type: "Post"
status: "public"
category: "👾 Unity"
tags: ["3::유니티::개념", "3::유니티::구현"]
summary: ""
thumbnail: ""
---
![](/images/posts/wiki-unity-tilemap/01.webp)

#### 참고 에셋

![사용 에셋 출처 : itch.io > Tech Dungeon: Roguelite - Asset Pack](/images/posts/wiki-unity-tilemap/02.webp)

[🔗 Tech Dungeon: Roguelite - Asset Pack](https://trevor-pupkin.itch.io/tech-dungeon-roguelite)

![](/images/posts/wiki-unity-tilemap/03.webp)

### 1. 타일맵이란?

타일맵은 유니티에서 제공해주는 기능으로, 타일 기반의 환경을 쉽게 만들 수 있게 해주는 기능이다.

> 타일 : 반복해서 배경을 만들 수 있도록 잘라놓은 그림

타일맵 시스템을 사용하여 작은 스프라이트들로 광대한 게임 환경을 구성할 수 있다.

![](/images/posts/wiki-unity-tilemap/04.webp)

### 2. Tile Palette 설정

![](/images/posts/wiki-unity-tilemap/05.webp)

Window → 2D → Tile Palette 를 통해 타일 팔레트 창을 열 수 있다.

![](/images/posts/wiki-unity-tilemap/06.webp)

노출된 ‘Tile Palette’ 창을 인스펙터 창에 드래그하여 포함시킨다.

![](/images/posts/wiki-unity-tilemap/07.webp)

### 3. 팔레트 새로 만들기

![](/images/posts/wiki-unity-tilemap/08.webp)

Tile Palette 창 → Create New Palette 버튼 선택 → 이름 짓고 Create 버튼 선택 → 폴더 경로(필자는 Tile로 생성) 설정

이제 Floor이라는 팔레트가 만들어졌다.

![](/images/posts/wiki-unity-tilemap/09.webp)

### 4. 스프라이트 시트 → 타일 팔레트 적용

![](/images/posts/wiki-unity-tilemap/10.webp)

스프라이트 시트 → 팔레트에 스프라이트 시트를 드래그 → 조금 전에 생성한 타일 팔레트 폴더로 설정 시, 해당 스프라이트로 여러 타일이 생성된 것을 확인할 수 있다.

스프라이트에 대한 설명은 아래 페이지를 참조한다.

[🔗 Unity 스프라이트 시트 개념 및 분리](https://ryuseojin.com/wiki-unity-spritesheet)

![](/images/posts/wiki-unity-tilemap/11.webp)

### 5. 타일 적용하기

![](/images/posts/wiki-unity-tilemap/12.webp)

이렇게 나누어진 타일을 바닥에 그려주기 위해서는 하이어라키 창에 새로운 GameObject를 만들어야 한다.

![](/images/posts/wiki-unity-tilemap/13.webp)

우리는 2D 탑다운 기준으로 만드므로 2D Object → Tilemap → Rectangular 로 설정한다.

- hexagonal → 육각형 타일맵

- isometric → 대각선형 타일맵

![](/images/posts/wiki-unity-tilemap/14.webp)
