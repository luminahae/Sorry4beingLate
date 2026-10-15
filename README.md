# 그러니까, 제가 왜 늦었냐면.. (Sorry4beingLate) — 웹 버전

상황·대상·의도만 입력하면 **자동으로 사과문을 생성**해 주는 정적 웹 페이지입니다.
2024년 원본 프로젝트(OpenAI API 기반 변명 생성기)를 Figma UI에 맞춰 재구성했습니다.

원작: [@Jamessung644](https://github.com/jamessung644) · @being0606 · @2hyunhyung · @lumina.hae  
웹 버전 개발: @lumina.hae
Figma: https://www.figma.com/design/uKI3DwSVeblXVMIMDy4wd6

## 특징
- **API 키 없이 바로 동작** — 내장 템플릿 생성기가 자동으로 사과문을 만듭니다.
  (상세 설정에 OpenAI 키를 넣으면 실제 GPT로 생성. 키는 브라우저 localStorage에만 저장)
- 흐름: **스플래시(사과🍎 밀기) → 입력 → 로딩(밈) → 결과**
- 입력: 누구에게 / 무슨 상황 / 어떤 의도 (+ 상세: 보내는 사람·형식·기타)
- 슬라이더 2종으로 톤 조절
  - **장문형 ↔ 단문형** (길이)
  - **T형(논리·팩트) ↔ F형(감성·공감)** — 원본 `adjective.js`의 20단계 형용사와 연동
- 결과 액션: **정보 수정 · 새로고침(재생성) · 이미지 저장(PNG) · 홈으로 · 복사·공유**
  - 복사·공유: 모바일은 공유 시트, 데스크톱은 클립보드 복사로 폴백
  - 이미지 저장: `<canvas>`로 편지 카드를 그려 PNG 다운로드 (외부 라이브러리 없음)

## 실행
정적 파일이라 아무 정적 서버로 열면 됩니다.

```bash
py -m http.server 8130 --directory sorry4beinglate
```

→ http://localhost:8130

## 파일 구조
- `index.html` — 4개 뷰(스플래시/입력/로딩/결과) 마크업
- `style.css` — 브라우저 창 목업 + 파란 손글씨 브랜딩
- `app.js` — 뷰 전환, 드래그 시작, 내장 사과문 생성기, GPT 경로, 이미지 저장/공유
- `assets/logo.png` — 사과(🍎)+두 손 모아 비는 손 로고

## 참고
사과문 생성은 템플릿 엔진이라 실제 GPT처럼 완벽한 문장은 아닙니다.
자연스러운 결과를 원하면 상세 설정에서 OpenAI 키를 넣어 주세요.
