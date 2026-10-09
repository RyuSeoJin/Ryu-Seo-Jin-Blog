---
title: "[Unity] 스프라이트 시트 개념 및 분리"
slug: "wiki-unity-spritesheet"
date: "2025-09-17"
type: "Post"
status: "public"
category: "👾 Unity"
tags: ["3::유니티::개념", "3::유니티::구현"]
summary: ""
thumbnail: ""
---
![](/images/posts/wiki-unity-spritesheet/01.webp)

### 1. 스프라이트 시트란?

![예시 이미지 : itch.io > Tech Dungeon: Roguelite - Asset Pack](/images/posts/wiki-unity-spritesheet/02.webp)

![참고 에셋 출처 : itch.io > Tech Dungeon: Roguelite - Asset Pack](/images/posts/wiki-unity-spritesheet/03.webp)

하나의 이미지 파일(.png)에 여러 동적인 이미지가 모여있는 형식의 이미지 파일을 뜻한다.

보통 하나의 오브젝트를 기준으로 여러 동적인 이미지가 모여있다.

평범한 상태로는 이미지를 각각 구분하여 지정할 수 없으나, 컴포넌트 값을 수정하여, 각 이미지를 따로 사용할 수 있다.

![](/images/posts/wiki-unity-spritesheet/04.webp)

### 2. 컴포넌트 값 수정 (Inspector)

유니티에서 이미지 파일을 선택하면, 인스펙터 창이 노출된다.

![](/images/posts/wiki-unity-spritesheet/05.webp)

타일맵 기능을 사용하기 위해서는, 잘라서 원하는 형태로 쓸 수 있도록 설정을 변경해줘야 한다.

![](/images/posts/wiki-unity-spritesheet/06.webp)

에셋을 선택하면 인스펙터 창이 노출된다.

| 번호 | 항목 | 설정값 |
| --- | --- | --- |
| 01 | Sprite Mode | Multiple 설정 |
| 02 | Pixels Per Unit | 32 설정 |
| 03 | Filter Mode | Point (no filter) 설정 |

이후 Apply 버튼 선택하여 인스펙터 값 저장한다.

\[↓\] 아래의 버튼을 클릭하여 각 항목별 설명을 확인할 수 있습니다.

#### Sprite Mode / Pixels Per Unit / Filter Mode 설명

![](/images/posts/wiki-unity-spritesheet/07.webp)

### 3. 이미지 자르기 (Sprite Editer)

![](/images/posts/wiki-unity-spritesheet/08.webp)

인스펙터 의 Open Sprite Editor 버튼 선택 시, Sprite Editor 창이 열린다.

![](/images/posts/wiki-unity-spritesheet/09.webp)

Slice 버튼 선택하여 아래의 값으로 변경 후 Slice 버튼 선택 시, 타일 크기에 맞게 이미지가 잘라져서 설정된다.

- Type → Grid By Cell Size 설정

- Pixel Size는 (x)32 × (y)32로 설정 (현재 예제 에셋의 규격이 32px 규격의 맵 타일이기 때문임)

이후 우측 상단의 Apply 버튼 선택하여 저장한다.

※ 잘려진 이미지를 하나씩 클릭하여 이름 설정 가능하다.

![](/images/posts/wiki-unity-spritesheet/10.webp)

이제 타일셋이 Slice 세팅에 맞춰 잘려 있는 것을 확인할 수 있으며, 이를 통해 다른 작업이 가능하다.

(캐릭터 설정, 배경 타일맵 설정 등)

![](/images/posts/wiki-unity-spritesheet/11.webp)

#### \[문제 해결\] Sprite Editor에서 Slice가 안 보이는 경우

![](/images/posts/wiki-unity-spritesheet/12.webp)

Sprite Editor 창을 조정하면 보인다.

![](/images/posts/wiki-unity-spritesheet/13.webp)
