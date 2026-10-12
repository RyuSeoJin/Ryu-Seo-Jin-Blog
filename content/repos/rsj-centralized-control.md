## 한 줄로

여러 작업 저장소가 **같은 규칙으로 문서를 만들고 운영되도록**, 그 규칙을 한 곳에 모아 두고 나눠 주는 **중앙 규칙 저장소**입니다.

## 왜 만들었나요

언리얼 엔진 공부 문서, 게임 기획서, QA 테스트 케이스, 앱 기획 슬라이드처럼 성격이 다른 작업을 저장소 여러 개에서 나눠 하고 있습니다. 대부분은 AI(Claude Code · Codex)와 함께 만드는데, 작업이 늘수록 이런 문제가 생겼습니다.

- 문서 쓰는 방식, 이력 남기는 법, git 규칙이 **저장소마다 조금씩 달라졌습니다.**
- 한 저장소에서 규칙을 고쳐도 **다른 저장소는 예전 규칙 그대로** 남았습니다.
- AI에게 매번 같은 설명을 다시 해야 했고, 그래도 **결과물의 모양이 들쭉날쭉**했습니다.

그래서 "모든 저장소가 따르는 규칙"은 이 저장소 한 곳에서만 고치고, 각 작업 저장소는 그걸 **받아서** 쓰도록 나눴습니다. 규칙을 한 번 고치면 모든 저장소가 같은 규칙을 받아 갑니다.

## 무엇이 들어 있나요

| 구역 | 내용 |
|---|---|
| `core/base/` | 꼭 따르는 기본 규칙 — 문서 제작 절차, 작성 원칙, 변경 이력·남은 일 기록법, git 규칙, HTML 출력 규칙, 디자인 마스터, 검사·받기 도구 |
| `core/modules/` | 필요한 저장소만 골라 켜는 모듈 |
| `center-change-log.md` | 규칙이 언제, 왜 바뀌었는지와 받아 가는 쪽이 할 일 |

골라 켜는 모듈은 이런 것들이 있습니다.

| 모듈 | 무엇에 쓰나 |
|---|---|
| `ue-doc` · `ue-build` · `ue-localization` | 언리얼 엔진 문서 · C++ 빌드 점검 · 번역 |
| `gdd` | 구현 전에 합의하는 시스템 기획서와 콘텐츠 총괄표 |
| `tc` · `automation` · `sut` · `llm` · `qa-site` | QA 테스트 케이스 · 자동화 · LLM 출력 검증 · QA 문서 사이트 |
| `app-planning-slides` · `app-preview` · `html-design-kit` | 앱 기획 슬라이드 · 화면 흐름 미리보기 · 부품형 HTML |
| `pixel-art` · `aseprite` | 픽셀 캐릭터 규칙과 Aseprite 작업 |
| `android-emulator` | 안드로이드 에뮬레이터 설치 · 점검 |

## 어떻게 쓰나요

### 1. 처음 받기

받을 저장소 맨 위 폴더에 이름표 파일 `workspace.json`을 하나 두고, 받기 도구를 실행합니다.

```bash
python {이 저장소를 받은 위치}/core/base/scripts/sync_core.py --from https://github.com/RyuSeoJin/rsj-centralized-control --repo-root {받을 저장소}
```

그다음 읽기 규칙 파일을 만들고 제대로 받았는지 검사합니다.

```bash
python core/base/scripts/regen.py
python core/base/scripts/check_rules.py
```

### 2. 필요한 모듈 켜기

```bash
python core/base/scripts/module.py list
```

목록에서 필요한 모듈을 골라 켜면, 그 모듈의 규칙·서식·도구가 함께 따라옵니다. 켜지 않은 모듈은 AI가 읽지도 않습니다.

### 3. 규칙이 바뀌면 다시 받기

```bash
python core/base/scripts/sync_core.py --from https://github.com/RyuSeoJin/rsj-centralized-control --check
python core/base/scripts/sync_core.py --from https://github.com/RyuSeoJin/rsj-centralized-control
```

`--check`로 무엇이 바뀌는지 먼저 보고 받습니다. 받는 쪽에서 `core/`를 직접 고친 파일이 있으면 도구가 멈춥니다. 그 수정은 이 중앙 저장소로 먼저 옮겨야 합니다.

## 지키는 원칙

- **규칙은 여기서만 고칩니다.** 작업 저장소에서 고치면 다음에 받을 때 사라지기 때문입니다.
- **중앙 규칙에는 특정 프로젝트 이름이나 값을 적지 않습니다.** "문장에서 프로젝트 이름을 지워도 말이 되는가"로 중앙 규칙인지 프로젝트 규칙인지 가릅니다.
- 이 규칙들은 사람이 지키길 기대하지 않고 **검사 도구와 GitHub Actions로 막습니다.** 프로젝트 파일이 중앙에 섞여 들어오면 합쳐지지 않습니다.
