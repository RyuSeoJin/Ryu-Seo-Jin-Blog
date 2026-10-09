---
title: "[UE] UMG, WBP에 대한 설명과 적용"
slug: "unrealengine-umg-wbp"
date: "2022-09-11"
type: "Post"
status: "public"
category: "🃏 Unreal Engine"
tags: ["2::언리얼엔진::기능"]
summary: "UMG : 언리얼에서 제공하는 UI제작 툴 ➡\nGUI : 그래픽 사용자 인터페이스 ➡\nWBP : 위젯 블루프린트. ➡\n이에 대한 설명과, 블루프린트를 활용한 인게임 적용 정리."
thumbnail: ""
---
![](/images/posts/unrealengine-umg-wbp/01.webp)

### **1. UMG, WBP는 무엇인가?**

#### 1.1. 그 전에, GUI란?

Graphical User Interface의 약자로, `그래픽 사용자 인터페이스`를 뜻한다.

사용자가 편리하게 사용할 수 있도록 입출력 등의 사용성에 관련된 기능을 알기 쉬운 “아이콘” 등등의 그래픽으로 나타낸 것이다.

UI(User Interface)가 '사용자와 시스템 사이의 접점'이라는 넓은 의미라면, GUI는 그중에서도 '그래픽'을 매개로 하는 구체적인 형태를 뜻한다.

게임에서는 버튼, 아이콘, 프로그레스 바 등이 모두 GUI에 해당한다.

#### 1.2. UMG란?

Unreal Motion Graphics Designer**의 약자로,** `언리얼에서 제공하는 UI제작 툴`이다.

#### 1.3. WBP란?

Widget Blueprint의 약자로, UI를 위한 블루프린트 위젯을 의미한다.

**디자이너(Designer) 모드**와 **그래프(Graph) 모드**로 나뉘며,

디자이너 모드에서는 레이아웃을 잡고,

그래프 모드에서는 블루프린트 노드로 기능을 구현한다는 점이 핵심이다.

#### 1.4. 요약하자면

UMG라는 언리얼 엔진에서 제공해주는 '시스템(환경)'에서 WBP라는 기능을 통해 UI를 구현할 수 있다.

라고 이해하면 될 것 같다.

그러면 사용 방법에 대해 알아보자.

![](/images/posts/unrealengine-umg-wbp/02.webp)

### **2. GUI 만들어보기**

해당 UI가 어떤 용도로 쓰이는지 생각하며, 해당 GUI를 제작해보자.
\[자세한 내용들에 대해서는 이후에 다른 기능을 제작하면서 알아본다.\]

> **Content 폴더에 GUI 폴더를 만들어준다.**

![](/images/posts/unrealengine-umg-wbp/03.webp)

처음 시작할 때 한 번만 세팅해준다. 이후 GUI를 만지는 것은 전부 해당 폴더에서 진행한다.

> **GUI 폴더 내부에 위젯 블루프린트를 생성한다.**

![](/images/posts/unrealengine-umg-wbp/04.webp)

> **User Widget 선택**

![](/images/posts/unrealengine-umg-wbp/05.webp)

> **생긴 블루프린트를 해당 UI의 목적에 맞게 이름을 변경해준다.
> 앞에는 WBP를 붙여준다. \[Widget Blueprint의 약자\]**

![](/images/posts/unrealengine-umg-wbp/06.webp)

필자는 밑에 설명할 GUI를 간단하게 만들고 이후에 더 자세하게 만들기를 위해 WBP\_MainMenu이라 설정했다.

> **위에서 만든 WBP\_MainMenu를 연다.**

![](/images/posts/unrealengine-umg-wbp/07.webp)

뭔가 복잡하지만, 하나씩 알아가자.

![](/images/posts/unrealengine-umg-wbp/08.webp)

### **3. 위젯 블루프린트 (WBP)에 대해 알아보자.**

> **WBP\_MainMenu를 열면 동그라미 쳐져 있는 것을 드래그하여 출력 해상도를 조정할 수 있다.**

![](/images/posts/unrealengine-umg-wbp/09.webp)

![](/images/posts/unrealengine-umg-wbp/10.webp)

![](/images/posts/unrealengine-umg-wbp/11.webp)

드래그를 통해 직접 설정할 수 있다.

> **우측 상단 Screen Size를 통해서도 출력 해상도를 조정할 수 있다.**

![](/images/posts/unrealengine-umg-wbp/12.webp)

21.5~24인치 모니터는 1920\*1080 (16:9)
27인지 모니터는 2560\*1440 (16:9) 로 표시된다.

하나의 해상도만 설정할 것이라면 모르겠으나, 하단에 있는 DPI Scale은 가급적 1.0으로 맞춰놓는 것을 권장한다.

![](/images/posts/unrealengine-umg-wbp/13.webp)

> **좌측에 팔레트 기능을 통해 도구\[프로그레스바 등등\]를 이용하여 생성 가능하다.**

![](/images/posts/unrealengine-umg-wbp/14.webp)

팔레트 기능이 없는 경우, Window → Palette 기능을 체크해주자.

> **★Canvas Panel을 팔레트에서 검색하여 위젯에 설정한다.★**

![](/images/posts/unrealengine-umg-wbp/15.webp)

위치는 PANEL → Canvas Panel이다.

Canvas Panel은 최상위 계층이며, 이 밑에 UI를 적어 내려가는 방식으로 이해하면 된다.

![](/images/posts/unrealengine-umg-wbp/16.webp)

![](/images/posts/unrealengine-umg-wbp/17.webp)

Palette의 Canvas Panel을 드래그하여 하단의 Hierarchy의 \[WBP\_MainMenu\]에 연결한다.

> **만든 Canvas Panel을 클릭하면 우리가 보여질 UI 부분을 확인할 수 있다.**

클릭하지 않아도 점선으로 표시된다.

![](/images/posts/unrealengine-umg-wbp/18.webp)

> **Designer 와 Graph**

우측 상단을 보면 Designer 와 Graph 부분이 있다.

Designer로 체크하면 디자인이 어떻게 이루어져 있는 지 볼 수 있는 곳이고,

Graph로 체크하면 이벤트 그래프로 이동하여, 어떻게 작동하는 지를 설정할 수 있다.

이를 번갈아가며 작업을 하게 된다.

![](/images/posts/unrealengine-umg-wbp/19.webp)

팔레트에서의 세부 기능들과 그래프를 통한 구현은 이후에 작업하는 GUI에서 하나씩 다룬다.

![](/images/posts/unrealengine-umg-wbp/20.webp)

### **4. 만든 GUI를 플레이 화면에 보이게 하는 방법**

우리가 지금 위에서 만든 위젯 블루프린트는 WBP\_MainMenu이다.

즉, 해당 **위젯의 용도는 게임이 시작하게 되면 플레이어 화면에 보여야 하는 것**이다.

만든 위젯 블루프린트를 실제 플레이어 화면에 노출시킬 수 있도록 해보자.

> **Player 블루프린트로 이동하여 BeginPlay 이벤트를 호출한다.**

![](/images/posts/unrealengine-umg-wbp/21.webp)

Event BeginPlay = 게임이 시작되면 해당 이벤트를 호출한다.

라는 뜻이다.

> **노드를 Createwidget을 검색하여 위젯을 생성시킨다.**

![](/images/posts/unrealengine-umg-wbp/22.webp)

![](/images/posts/unrealengine-umg-wbp/23.webp)

> **가져온 노드의 Class를 우리가 설정한 WBP\_MainMenu로 바꾼다.**

![](/images/posts/unrealengine-umg-wbp/24.webp)

![](/images/posts/unrealengine-umg-wbp/25.webp)

> **위젯을 생성시켰지만, 우리가 보여질 화면(Viewport)에는 보여지지 않는다.**

이를 Add to Viewport 를 통해 넣어주고 연결시킨다.

![](/images/posts/unrealengine-umg-wbp/26.webp)

이렇게 설정하면, 우리가 설정한 위젯블루프린트의 형태를 인게임 Viewport에 보여줄 수 있다.

작업하는 형태에 따라 노드가 조금씩 달라지므로, 이후 작업하게 될 경우 각각 추가해서 다룬다.

큰 틀은 이렇게 진행된다. 라고 이해하면 된다.

![](/images/posts/unrealengine-umg-wbp/27.webp)
