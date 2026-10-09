---
title: "[Unity_문제해결] TextMeshPro 오브젝트가 Public Text에 할당되지 않는 경우"
slug: "wiki-unity-problem-testmeshpro-assignment-error"
date: "2025-09-23"
type: "Post"
status: "public"
category: "👾 Unity"
tags: ["3::유니티::문제해결"]
summary: ""
thumbnail: ""
---
![](/images/posts/wiki-unity-problem-testmeshpro-assignment-error/01.webp)

### 1. 문제사항

스크립트에 Text 형식이 할당되지 않는다

![](/images/posts/wiki-unity-problem-testmeshpro-assignment-error/02.webp)

![](/images/posts/wiki-unity-problem-testmeshpro-assignment-error/03.webp)

### 2. 문제 해결 방법

#### 2.1. 스크립트에 text 형식 대신 TextMeshProUGUI 사용

![](/images/posts/wiki-unity-problem-testmeshpro-assignment-error/04.png)

`public TextMeshProUGUI uiText;`

#### 2.2. 스크립트에 using 문에 TMPro 추가

![](/images/posts/wiki-unity-problem-testmeshpro-assignment-error/05.png)

`using TMPro;`

#### 2.3. 문제 해결

![](/images/posts/wiki-unity-problem-testmeshpro-assignment-error/06.webp)

이제 TextMeshPro의 Text 파일이 할당되는 것을 확인할 수 있다.

![](/images/posts/wiki-unity-problem-testmeshpro-assignment-error/07.webp)
