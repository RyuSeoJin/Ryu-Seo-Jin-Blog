---
title: "[분석] 할로우 나이트 : 2D 횡스크롤 게임의 배경을 통한 입체감 표현 방식"
slug: "wiki-analysis-hollowknight-depth-design"
date: "2022-04-27"
type: "Post"
status: "public"
category: "📔 위키"
tags: ["4::WIKI::분석"]
summary: "2D 횡스크롤 게임이지만, 다양한 기법을 통해 2D 게임으로 입체적인 게임 환경을 성공적으로 구현하였는데, 어떤 기법을 사용하여 입체적인 2D 게임 환경을 구현하였는지 파악해보기 위해 분석."
thumbnail: ""
---
![](/images/posts/wiki-analysis-hollowknight-depth-design/01.webp)

### 0. 분석 사유

2D 횡스크롤 게임이지만, 다양한 기법을 통해 2D 게임으로 입체적인 게임 환경을 성공적으로 구현한 게임이다.

어떤 기법을 사용하여 입체적인 2D 게임 환경을 구현하였는지 파악해보기 위해 분석하게 되었다.

![](/images/posts/wiki-analysis-hollowknight-depth-design/02.webp)

### **3. 컨셉에 따른 디테일한 배경 디자인과 조명 및 그림자**

각각의 배경 컨셉은 각 구역의 컨셉에 따라 디자인이 섬세하게 되어 있다.

![](/images/posts/wiki-analysis-hollowknight-depth-design/03.webp)

예를 들어 나무, 돌, 물 등은 각 구역의 컨셉에 맞춰 작업되어 환경에 깊이감을 더욱 부여하여 전반적인 분위기를 강화했다.

독극 지대에서의 물은 초록빛을 띄며, 들어가면 피해를 입을 것 같다는 암시 등 다양한 방법으로 컨셉을 잘 녹여냈으며 조명 효과와 그림자를 통해 캐릭터와 배경에 입체감을 부여했고 특히 동굴이나 통로 같은 공간에서 더욱 두드러지게 표현되었다.

![](/images/posts/wiki-analysis-hollowknight-depth-design/04.webp)

### 4. 애니메이션

인게임에서 할로우나이트는 캐릭터의 움직임 뿐만 아니라, 배경의 움직임까지 세심하게 고려하였다.

캐릭터의 다양한 움직임은 물론 그에 상호작용되는 배경 애니메이션의 움직임 등을 통해 공간에 생동감을 불어넣어 더욱 입체감을 부여한다.

단순히 다른 속도로 스크롤링할 뿐만 아니라, **`플레이어가 지나갈때 특정 레이어의 풀이나 돌이 플레이어가 움직인 방향으로 움직인다거나`** 등 다양한 방식으로 플레이어와 배경 애니메이션이 상호작용함으로써, 입체감을 살린것으로 보인다.

![](/images/posts/wiki-analysis-hollowknight-depth-design/05.webp)

### **5. 음향 효과**

할로우 나이트는 음향 효과를 통해서도 입체감을 부여했다.

각 지역마다 독특하고 다양한 배경음과 효과음이 사용되어 플레이어가 더욱 몰입할 수 있게 하였다.

예를 들어, 플레이어가 동굴을 탐험하는 동안에는 고요하고 어두운 음악이 플레이되고, 물방울이 떨어지는 소리 등 공간의 깊이와 분위기를 더욱 강조했다.

![](/images/posts/wiki-analysis-hollowknight-depth-design/06.webp)
