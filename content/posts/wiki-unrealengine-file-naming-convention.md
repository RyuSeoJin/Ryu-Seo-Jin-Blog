---
title: "[UE] 파일 네이밍 규칙"
slug: "wiki-unrealengine-file-naming-convention"
date: "2022-07-21"
type: "Post"
status: "public"
category: "🃏 Unreal Engine"
tags: ["2::언리얼엔진::참고자료"]
summary: ""
thumbnail: ""
---
![](/images/posts/wiki-unrealengine-file-naming-convention/01.webp)

#### 참고 자료

[https://github.com/VLAST-GIT/UE5-StyleGuide](https://github.com/VLAST-GIT/UE5-StyleGuide)

참고 자료를 개인 작업 또는 팀 프로젝트를 하게 될 때 어떻게 적용시킬 것인 지에 대한 정리

### 1. 네이밍을 해야 하는 이유

| 번호 | 설명 |
| --- | --- |
| 01 | 하나의 스타일 가이드를 따라 협업하는 프로젝트는 마치 한 사람이 제작한 것처럼 일관성이 유지. |
| 02 | 이는 작업 과정에서의 모호성을 없애고 다른 팀원의 작업에 대한 불확실한 짐작을 할 필요가 없도록 만들어 줍니다. |
| 03 | 그 결과로 팀은 더 나은 생산성을 얻게 되며, 유지보수가 쉬워지게 됩니다. |
| 04 | 스타일 가이드를 지키지 않은 구조, 에셋명, 코드 등을 보게 된다면, 당신은 즉시 그것을 작성한 팀원에게 이를 알리고 스타일 가이드를 지키도록 정정해주어야 합니다. |
| 05 | 모든 사람이 같은 스타일 가이드를 지킨다는 것은 팀원 간의 질문과 답변을 더욱 쉽게 해줍니다. 아무렇게나 꼬아놓은 블루프린트를 풀거나 알 수 없는 변수명으로 가려진 머티리얼에 생긴 문제를 해결해주는 걸 좋아하는 사람은 없습니다. |
| 06 | 스타일 가이드를 통해, 협업 능력을 키우기 위함. |

![](/images/posts/wiki-unrealengine-file-naming-convention/02.webp)

### 2. 폴더명 규칙

#### 2.1. 파스칼 케이스 사용

| 설명 |
| --- |
| 띄어쓰기를 모두 붙여서 표현한다. 즉, 공백이 없다.<br><br>각 단어의 첫 글자는 대문자로 사용한다.<br><br>예시)<br>DesertEagle, StyleGuide, ASeriesOfWords |

#### 2.2. 공백(스페이스 바)을 사용하지 말 것

금지된 문자에 따라 폴더 이름에     공백을 사용해선 안 됩니다.

#### 2.3. 영문과 숫자 이외의 문자(특수문자 포함)를 사용하지 말 것

폴더 이름에 허용되는 문자는 A-Z, a-z, 0~9, \_(언더바)

![](/images/posts/wiki-unrealengine-file-naming-convention/03.webp)

### 3. 금지 사항들

#### 3.1. 금지 문자

아래의 문자들은 에셋명, 폴더명, 변수명 등 프로젝트 내 어디에서도 사용되어선 안 됩니다.

| 번호 | 설명 |
| --- | --- |
| 01 |    <br>공백(스페이스바) |
| 02 | <mark>\\ <br></mark>백슬래시 기호 |
| 03 | <mark>#!@$%</mark> <br>대부분의 특수 기호 |
| 04 | 한글 등 모든 유니코드 문자 (즉, 영문이 아닌 대부분의 문자) |

**즉, 다음의 문자들만 허용됩니다.**

| 번호 | 설명 |
| --- | --- |
| 01 | <mark>A-Z<br></mark>ABCDEFGHIJKLMNOPQRSTUVWXYZ |
| 02 | <mark>a-z<br></mark>abcdefghijklmnopqrstuvwxyz |
| 03 | <mark>0~9<br></mark>0123456789 |
| 04 | <mark> \_ <br></mark>밑줄(언더바) |

![](/images/posts/wiki-unrealengine-file-naming-convention/04.webp)

### 4. 에셋 명명 규칙

**스타일 가이드의 모든 부분이 그렇지만, 에셋 명명 규칙은 반드시 지켜야 합니다.**

명명 규칙에 따라 일관되게 지어진 에셋 이름을 통해 에셋 관리, 검색, 분석, 유지보수를 매우 쉽게 만들어줍니다.

명명 규칙의 큰 틀은 다음과 같이 <mark> \_ </mark>(밑줄)에 의해 에셋의 종류, 이름 등을 구분합니다.

#### 4.1. 에셋명 기본 형식: 접두사\_기본에셋명\_세부변형\_접미사

접두사와 접미사는 에셋 형식에 따라 다음의 에셋 접두사 & 접미사 테이블에 의해 결정됩니다.

접두사는 기본적인 에셋의 형태에 따라 변형됩니다.

접미사는 에셋의 형태에서 디테일이 필요한 경우 사용됩니다. 텍스처를 제외한 에셋유형에는 가능한 한 접미사가 사용되지 않습니다.

> 에셋 접두사 &접미사 테이블

에셋명 기본 형식의 접두사, 접미사 규칙입니다.

이 스타일 가이드는 텍스처를 제외한 에셋유형에는 가능한 한 접미사를 사용하지 않습니다.

토글을 열어 어떤 네이밍이 사용되는 지 알 수 있습니다.

<details>
<summary>흔히 사용되는 에셋</summary>

|   |   |   |   |
| --- | --- | --- | --- |
| 에셋 유형 | 접두사 | 접미사 | Notes |
| 레벨 |  |  | Maps 폴더 안에 있어야 한다. |
| 블루프린트 | BP\_ |  |  |
| 머티리얼 | M\_ |  |  |
| 머티리얼 인스턴스 | MI\_ |  |  |
| 스태틱 메시 | SM\_ |  |  |
| 스켈레탈 메시 | SKM\_ |  |  |
| 텍스처 | T\_ | \_? | 접미사 디테일은 텍스처 (Testures) 항목을 봐주세요. |
| 나이아가라 시스템 | NS\_ |  |  |
| 위젯 블루프린트 | WBP\_ |  |  |

</details>

<details>
<summary>애니메이션</summary>

|   |   |   |   |
| --- | --- | --- | --- |
| 에셋 유형 | 접두사 | 접미사 | Notes |
| 에임 오프셋 | AO\_ |  |  |
|  오프셋 1D | AO\_ |  |  |
| 애니메이션 블루프린트 | ABP\_ |  |  |
| 애니메이션 컴포짓 | AC\_ |  |  |
| 애니메이션 몽타주 | AM\_ |  |  |
| 애니메이션 시퀀스 | A\_ |  |  |
| 블렌드 스페이스 | BS\_ |  |  |
| 블렌드 스페이스 1D | BS\_ |  |  |
| 레벨 시퀀스 | LS\_ |  |  |
| 컨트롤 릭 *Control Rig* | CR\_ |  |  |
| IK 릭 *IK Rig* | IK\_ |  |  |
| IK 리타기터 *IK Retargeter* | RTG\_ |  |  |
| 스켈레탈 메시 *Skeletal Mesh* | SKM\_ |  |  |
| 스켈레톤 *Skeleton* | SKEL\_ |  |  |

</details>

<details>
<summary>인공 지능 (Artificail Intelligence)</summary>

|   |   |   |   |
| --- | --- | --- | --- |
| 에셋 유형 | 접두사 | 접미사 | Notes |
| AI Controller | AIC\_ |  |  |
| Behavior Tree | BT\_ |  |  |
| Blackboard | BB\_ |  |  |
| Decorator | BTDecorator\_ |  |  |
| Service | BTService\_ |  |  |
| Task | BTTask\_ |  |  |
| Environment Query | EQS\_ |  |  |
| EnvQueryContext | EQS\_ | Context |  |

</details>

<details>
<summary>블루프린트 (Blueprints)</summary>

|   |   |   |   |
| --- | --- | --- | --- |
| 에셋 유형 | 접두사 | 접미사 | Notes |
| 블루프린트 | BP\_ |  |  |
| 블루프린트 컴포넌트 | BPC\_ |  |  |
| 블루프린트 함수 라이브러리 | BPFL\_ |  |  |
| 블루프린트 인터페이스 | BPI\_ |  |  |
| 블루프린트 매크로 라이브러리 | BPML\_ |  | 가능한 한 사용하지 않는다. |
| 열거형 *Enumeration* | E |  | 접두사 후 밑줄 없음. eg. ECharacterState |
| 구조체 *Structure* | S |  | 접두사 후 밑줄 없음. |
| 위젯 블루프린트 | WBP\_ |  |  |
| 게임플레이 어빌리티 | GA\_ |  |  |

</details>

<details>
<summary>머티리얼 (Materials)</summary>

|   |   |   |   |
| --- | --- | --- | --- |
| 에셋 유형 | 접두사 | 접미사 | Notes |
| 머티리얼 | M\_ |  |  |
| 머티리얼 (포스트 프로세스) | M\_PP\_ |  |  |
| 머티리얼 (데칼) | M\_Decal\_ |  |  |
| 머티리얼 인스턴스 | MI\_ |  |  |
| 머티리얼 인스턴스 (포스트 프로세스) | MI\_PP\_ |  |  |
| 머티리얼 인스턴스 (데칼) | MI\_Decal\_ |  |  |
| 머티리얼 함수 | MF\_ |  |  |
| 머티리얼 파라미터 컬렉션 | MPC\_ |  |  |
| 서브서피스 프로파일 *Subsurface Profile* | SSP\_ |  |  |
| 피직스 머티리얼 | PM\_ |  |  |

</details>

<details>
<summary>텍스처 (Textures)</summary>

|   |   |   |   |
| --- | --- | --- | --- |
| 에셋 유형 | 접두사 | 접미사 | Notes |
| 텍스처 | T\_ |  |  |
| - Diffuse/Albedo/Base Color | T\_ | \_D |  |
| - Normal | T\_ | \_N |  |
| - Roughness | T\_ | \_R |  |
| - Alpha/Opacity | T\_ | \_A |  |
| - Mask | T\_ | \_A | *똑같이 Opacity 채널에 들어가므로 Alpha/Opacity와 동일합니다.* |
| - Ambient Occlusion | T\_ | \_O |  |
| - Bump | T\_ | \_B |  |
| - Emissive | T\_ | \_E |  |
| - Specular | T\_ | \_S |  |
| - Metallic | T\_ | \_M |  |
| - RGB채널에 패킹된 텍스처 | T\_ | \_\* | 아래의 [패킹된 텍스처 (Texture Packing)](https://github.com/VLAST-GIT/UE5-StyleGuide#1261-%ED%8C%A8%ED%82%B9%EB%90%9C-%ED%85%8D%EC%8A%A4%EC%B2%98-texture-packing)를 참고해주세요. |
| 텍스처 큐브 *Texture Cube* | TC\_ |  |  |
| 미디어 텍스처 *Media Texture* | MT\_ |  |  |
| 렌더 타깃 *Render Target* | RT\_ |  |  |
| 큐브 렌더 타깃 | RTC\_ |  |  |

</details>

<details>
<summary>피직스 (Physics)</summary>

|   |   |   |   |
| --- | --- | --- | --- |
| 에셋 유형 | 접두사 | 접미사 | Notes |
| 피직스 머티리얼 | PM\_ |  |  |
| 피직스 에셋 | PA\_ |  |  |
| 지오메트리 컬렉션 | GC\_ |  |  |
| 지오메트리 컬렉션 캐시 | GC\_ | \_Cache |  |
| 카오스 솔버 | Solver\_ |  |  |
| 카오스 캐시 컬렉션 | Chaos\_ | \_Cache |  |

</details>

<details>
<summary>유저 인터페이스 (User Interface)</summary>

|   |   |   |   |
| --- | --- | --- | --- |
| 에셋 유형 | 접두사 | 접미사 | Notes |
| Font | Font\_ |  |  |
| 위젯 블루프린트 | WBP\_ |  |  |

</details>

<details>
<summary>기타 (Miscellaneous)</summary>

|   |   |   |   |
| --- | --- | --- | --- |
| 에셋 유형 | 접두사 | 접미사 | Notes |
| 데이터 에셋 | DA\_ |  |  |
| 데이터 테이블 | DT\_ |  |  |
| 플롯 커브 | CV\_Float\_ |  |  |
| 벡터 커브 | CV\_Vector\_ |  |  |
| 컬러 커브 | CV\_Color\_ |  |  |
| 커브 테이블 | CV\_Table\_ |  |  |
| 벡터 필드 | VF\_ |  |  |
| HLOD 레이어 | HLODLayer\_ |  |  |
| 그룸 *Groom* | Groom\_ |  |  |

</details>

<details>
<summary>사운드 (Sounds)</summary>

|   |   |   |   |
| --- | --- | --- | --- |
| 에셋 유형 | 접두사 | 접미사 | Notes |
| Dialogue Voice | DV\_ |  |  |
| Dialogue Wave | DW\_ |  |  |
| Reverb Effect | Reverb\_ |  |  |
| Sound Attenuation | ATT\_ |  |  |
| Sound Class |  |  | No prefix/suffix. Should be put in a folder called SoundClasses |
| Sound Concurrency |  | \_SC | Should be named after a SoundClass |
| Sound Cue | A\_ | \_Cue |  |
| Sound Mix | Mix\_ |  |  |
| Sound Wave | A\_ |  |  |
| 메타 사운드 | MS\_ |  |  |
| 메타 사운드 소스 | MSS\_ |  |  |
| 컨트롤 버스 | CB\_ |  |  |
| 컨트롤 버스 믹스 | CBM\_ |  |  |

</details>

<details>
<summary>FX</summary>

|   |   |   |   |
| --- | --- | --- | --- |
| 에셋 유형 | 접두사 | 접미사 | Notes |
| 나이아가라 시스템 | NS\_ |  |  |
| 나이아가라 모듈 | NM\_ |  |  |
| Niagara Dynamic Input Script | NM\_ |  |  |
| 나이아가라 이미터 | NE\_ |  |  |
| 나이아가라 이펙트 타입 | EffectType\_ |  |  |
| 나이아가라 파라미터 컬렉션 | NPC\_ |  |  |
| - 인스턴스 | NPCI\_ |  |  |

</details>

<details>
<summary>미디어 (Media)</summary>

|   |   |   |   |
| --- | --- | --- | --- |
| 에셋 유형 | 접두사 | 접미사 | Notes |
| File Media Source | MS\_File\_ |  |  |
| Img Media Source | MS\_Img\_ |  |  |
| Stream Media Source | MS\_Stream\_ |  |  |
| Media Player | MP\_ |  |  |
| Media Texture | MT\_ |  |  |

</details>

> 기본에셋명

모든 에셋들은 기본이 되는 에셋 이름인 기본에셋명을 가져야 합니다. 기본에셋명은 그 에셋이 속한 그룹의 문맥에 연관되는 짧고 쉬운 이름일수록 좋습니다.

예를 들어 캐릭터의 이름이 Nina라면, 모든 Nina의 에셋들의 기본에셋명이 Nina가 되어야 합니다.

> 세부변형

세부변형은 기본에셋에서 파생된 다양한 변형의 이름을 지칭합니다.

예를 들어 Nina 캐릭터 에셋에는 다양한 스킨 변형이 있을 수 있습니다. Nina 스켈레탈 메시 중 캐주얼 스타일의 스킨이 있다면 에셋명은 SKM\_Nina\_Casual이 됩니다.

또 다른 예로 레트로 스타일의 스킨이 있다면 에셋명은 SKM\_Nina\_Retro가 될 겁니다.

#### 예시들

#### **기본에셋명 Nina의 특정 변형 예시**

|   |   |
| --- | --- |
| 에셋 유형 | 에셋명 |
| 스켈레탈 메시 (캐릭터 상의) | SKM\_Nina\_Suit\_Shirt |
| 스켈레탈 메시 (캐릭터 하의) | SKM\_Nina\_Suit\_Slacks |
| 머티리얼 (캐릭터 상의) | M\_Nina\_Suit\_Shirt |
| 텍스처 Diffuse/Albedo | T\_Nina\_Suit\_Shirt\_D |
| 텍스처 Normal | T\_Nina\_Suit\_Shirt\_N |

#### **기본에셋명 Rock의 불특정 변형 예시**

|   |   |
| --- | --- |
| 에셋 유형 | 에셋명 |
| 스태틱 메시 (변형1) | SM\_Rock\_01 |
| 스태틱 메시 (변형2) | SM\_Rock\_02 |
| 스태틱 메시 (변형3) | SM\_Rock\_03 |
| 머티리얼 (변형들의 마스터) | M\_Rock |
| 머티리얼 인스턴스 (변형1의 인스턴스) | MI\_Rock\_01 |
| 머티리얼 인스턴스 (눈쌓인 세부변형의 인스턴스) | MI\_Rock\_Snow |

![](/images/posts/wiki-unrealengine-file-naming-convention/05.webp)

### 5. Content 폴더 디렉터리 구조

에셋 명명 규칙과 마찬가지로, 프로젝트 디렉터리 구조 스타일 역시 반드시 지켜야 합니다.

에셋 이름과 Content 디렉터리 구조는 서로 연관이 깊으며, 둘 중 하나를 위반하게 된다면 불필요한 혼란이 많이 생기게 됩니다.

```text
프로젝트 이름 [MySampleProject]의 [Content] 폴더 디렉터리 구조 예제
|-- Content
    |--MySampleProject
        |--3D_Assets
            |-- Building
                |-- Balcony
                |-- Wall
            |-- Nature
                |-- Rock
                |-- Tree
            |-- Props
                |-- OldWoodenBench
            |-- OldSchool
        |--3D_Plants
            |-- Desert
                |-- Cactus
                |-- DesertYellowHead
            |-- Arctic
                |-- Moss
        |--Decals
            |-- Concrete
            |-- Metal
        |--Surfaces
            |-- Asphalt
            |-- Fabric
        |--Characters
            |--Common
                |-- Animations
                |-- Audio
            |-- Nina
                |-- Animations
                |-- Blueprints
                |-- Meshes
                |-- Materials
                |-- Textures
            |-- Abo
                |-- Animations
                |-- Blueprints
                |-- Meshes
                |-- Materials
                |-- Textures
        |--Core
            |-- Characters
            |-- Engine
            |-- GameModes
            |-- Interactables
            |-- Weapons
        |-- Effects
            |-- Electrical
            |-- Fire
            |-- Weather
        |-- Blueprints
        |--Maps
            |-- Campaign1
            |-- Campaign2
        |--MaterialLibrary
            |-- Debug
            |-- Functions
            |-- Textures
            |-- Utility
        |-- GUI
    |--Megascans
    |--StarterContent
    |--ThirdPerson
```
