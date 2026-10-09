---
title: "[Unity] 유니티 폰트 추가"
slug: "wiki-unity-add-font"
date: "2025-09-23"
type: "Post"
status: "public"
category: "👾 Unity"
tags: ["3::유니티::구현"]
summary: ""
thumbnail: ""
---
![](/images/posts/wiki-unity-add-font/01.webp)

### 1. 패키지 추가

Package Manager에서 TextMeshPro 설치

![](/images/posts/wiki-unity-add-font/02.webp)

### 2. 다운로드한 폰트를 프로젝트 안에 넣기

![](/images/posts/wiki-unity-add-font/03.webp)

폰트를 프로젝트 내에 추가한다.

![](/images/posts/wiki-unity-add-font/04.webp)

### 3. 폰트 제작 창 불러오기

![](/images/posts/wiki-unity-add-font/05.webp)

![](/images/posts/wiki-unity-add-font/06.webp)

Window → TextMeshPro → Font Asset Creator 선택하여 Font Asset Creator 창 불러온다.

![](/images/posts/wiki-unity-add-font/07.webp)

### 4. 컴포넌트 설정 후 생성

![](/images/posts/wiki-unity-add-font/08.webp)

아래 내용 전부 기입 후 \[Generate Font Atlas\] 버튼 선택한다.

| 번호 | 항목 | 설명 |
| --- | --- | --- |
| 01 | Source Font File | 본인이 추가할 폰트를 넣는다. |
| 02 | Padding | 글자 간격 (4~6로 설정) |
| 03 | Packing Method | Fast |
| 04 | Atlas Resolution | 해상도, 넉넉하게 4096 세팅 |
| 05 | Character Sequence (Decimal) | 32-126,44032-55203,12593-12643,8200-9900  기입<br><br>영어 범위 : 32-126 / 한글 범위 : 44032-55203 / 한글 자모 : 12593-12643 / 특수 문자 : 8200-9900 을 의미한다. |
| 06 | Character Set | CustomRange |

![](/images/posts/wiki-unity-add-font/09.webp)

생성되면 글씨가 노출된다.

글꼴에 따라 지원하지 않는 특수 문자는 missing 이 노출된다.

![](/images/posts/wiki-unity-add-font/10.webp)

### 5. 저장 후 이용

![](/images/posts/wiki-unity-add-font/11.webp)

Font Asset Creator 창에서 \[Save\] 또는 \[Save as\]를 통해 저장 후 폰트를 사용할 수 있다.

![](/images/posts/wiki-unity-add-font/12.webp)

![](/images/posts/wiki-unity-add-font/13.webp)

폰트를 Text UI로 불러와서 사용할 수 있다.

![](/images/posts/wiki-unity-add-font/14.webp)
