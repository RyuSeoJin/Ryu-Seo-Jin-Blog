---
title: "[Unity_문제해결] TMP(TextMeshPro) - SubMeshUI 생기는 현상"
slug: "wiki-unity-problem-tmp-submeshui"
date: "2025-09-27"
type: "Post"
status: "public"
category: "👾 Unity"
tags: ["3::유니티::문제해결"]
summary: ""
thumbnail: ""
---
![](/images/posts/wiki-unity-problem-tmp-submeshui/01.webp)

### 1. 문제사항

![](/images/posts/wiki-unity-problem-tmp-submeshui/02.webp)

TMP SubMeshUI \[글꼴 이름\]

작업을 하다 보면 Hierarchy에 TMP SubMeshUI가 생기는 현상이 있다.

TMP = TextMeshPro

![](/images/posts/wiki-unity-problem-tmp-submeshui/03.webp)

### 2. 문제 해결 방법

다음 현상이 생기는 이유로는 ‘해당 글꼴에 지원하지 않는 텍스트가 포함되어서’ 이다.

정상적인 상황에서는 발생하지 않으며, 해당 경우에는 글꼴을 지워서 해결할 수 있다.

지우지 않는 경우 지원하지 않는 텍스트를 사용하기 위해 엔진 상에서 추가로 머테리얼을 자동해서 만들기 때문에 그만큼의 불필요한 리소스를 사용하게 된다.

#### 2.1. 폰트 파일 확인

폰트 파일에 해당 글자가 포함되어 있는 지 확인하는 방법은 다음과 같다.

![](/images/posts/wiki-unity-problem-tmp-submeshui/04.webp)

폰트 에셋(TMP\_Font Asset) 을 선택하여 Inspector 창 진입 → ~~~ Table 선택하여 포함되어 있는 지 확인 가능하다.

#### 2.2. 문제 해결

![](/images/posts/wiki-unity-problem-tmp-submeshui/05.webp)

TMP SubMeshUI 오브젝트가 생긴 TMPMeshPro Text가 적용된 오브젝트 선택 → Inspector 창의 Text Input 영역에 지원하지 않는 글꼴을 제거한 후, TMP SubMeshUI를 삭제할 수 있다.

![](/images/posts/wiki-unity-problem-tmp-submeshui/06.webp)
