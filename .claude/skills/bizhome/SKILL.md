---
name: bizhome
description: T.M LINK 비즈홈(디지털 명함 홈페이지)을 새로 만들거나 고칠 때 쓰는 제작 규칙. "비즈홈 만들어줘", "○○ 대표님 비즈홈", "비즈홈 디자인 수정", "히어로 모션 넣어줘" 같은 요청에 사용한다. 기준 구현은 songsh/index.html.
---

# 비즈홈 제작 규칙

비즈홈은 한 사람을 소개하는 모바일 한 장짜리 페이지다. 저장소 `jinjjabg-hub/bizhome`(GitHub Pages, `bizhome.bizmy.net`)에 `<슬러그>/index.html` 로 올라간다. 새 비즈홈은 `songsh/` 를 복사해서 시작하고, 아래 규칙을 지킨다.

## 폴더 구성

```
<슬러그>/
  index.html            한 파일에 CSS·JS 포함 (빌드 없음)
  Paperlogy-4Regular.woff2, Paperlogy-7Bold.woff2
  hero.webp             히어로 사진
  hero.mp4              (선택) 히어로 모션
  profil.jpg            원형 프로필
  portfolio*.jpg        포트폴리오 슬라이드
  og_v3.jpg             공유 미리보기 1200×630
  icon-180/192/512.png, manifest.json
  news.json             소식판 글 (../news-board.js 가 읽음)
```

- 폰트는 **슬러그 폴더 안**에 두고 `url('Paperlogy-7Bold.woff2')` 처럼 같은 폴더 경로로 부른다. `../fonts/` 는 없는 폴더라 폰트가 조용히 빠진다.
- 이미지·폰트를 부르는 경로는 만들고 나서 반드시 404 검사를 한다(아래 "검수").

## 섹션 순서

언어 바 → HERO → 프로필·슬로건 → 소식판(`#news-board`) → ABOUT → WHY → DIFFERENCE → REFERRAL(슬라이더) → PORTFOLIO(슬라이더 + 주문 CTA) → CAREER → CONTACT(전화·링크 타일) → 액션 버튼(전달 / 연락처 저장 / 카드북 저장) → 만두 연결 → 푸터.

고객에게 없는 섹션은 빼되 순서는 유지한다. 섹션마다 영문 라벨(`.sec-label`) + 제목(`.sec-title`) 구조를 쓴다.

## 대표가 정한 규칙 (바꾸지 말 것)

1. **언어는 기본 4개국어(KR·EN·JP·CN).** 그 이상은 추가비를 받는 옵션이라 카드마다 개수가 다르다. 본문의 "4개국어"와 언어 바의 버튼 개수가 달라도 오류가 아니니 맞추려고 고치지 않는다. 추가 언어를 넣을 때는 모든 `data-lang` 묶음에 그 언어 span 을 빠짐없이 넣는다.
2. **언어 바는 지금 위치 그대로** — 화면 오른쪽 위 고정(`.lang-bar`, `position:fixed`).
3. **"카드 현황 보기" 버튼은 모든 방문자에게 보인다.** 오른쪽 아래 고정. 숨기거나 주인 전용으로 바꾸지 않는다.
4. **확대 가능.** viewport 는 `width=device-width, initial-scale=1.0` 까지만 쓴다. `maximum-scale`, `user-scalable=no` 금지.
5. **이모지를 아이콘으로 쓰지 않는다.** 아래 "아이콘" 참고.
6. **히어로 이미지는 가볍게.** WebP, 가로 약 980px, 250KB 이하. PNG 원본을 그대로 걸지 않는다.

## 타이포·줄바꿈

- 본문 글꼴 `Paperlogy`(400, 700~900), 힌디어만 `Noto Sans Devanagari`.
- 한국어 줄바꿈: `[data-lang="kr"]{word-break:keep-all;overflow-wrap:break-word;}`
  화면 폭은 폰마다 달라서 줄이 바뀌는 **위치**는 달라지지만, 이 규칙이 있으면 어느 폰에서든 단어 **중간**("언/어")에서는 끊기지 않는다.
  중국어·일본어에는 걸지 않는다(띄어쓰기가 없어 줄바꿈 자체가 사라진다). `body` 전체에 걸지 말 것.

## 색

고객마다 주색은 바꿔도 되지만 변수 구조는 유지한다.

```css
:root{ --gold:#d4a537; --gold-soft:#e8c877; --dark:#276152; --dark2:#1d4a3e; --gray:#8a8a92; --light:#f6f5f2; }
```

`--dark` / `--dark2` 를 번갈아 섹션 배경으로 쓰고, 연락처부터 푸터까지는 `--light` 로 이어 붙인다. 밝은 구간 사이에 배경을 안 준 div 가 끼면 그 줄만 진한 띠로 보이니, 밝은 구간의 모든 블록에 `background:var(--light)` 를 준다.

## 아이콘

`assets/icons.svg` 가 스프라이트다(Lucide 라인 아이콘 + Instagram·Threads 로고). 필요한 `<symbol>` 만 골라 `<body>` 바로 아래에 붙이고 이렇게 쓴다.

```html
<svg class="ico" aria-hidden="true"><use href="#i-phone"/></svg>
<span class="ico-chip"><svg class="ico" aria-hidden="true"><use href="#i-building"/></svg></span>
```

- `.ico` — 글자 옆 인라인 아이콘(버튼, 태그, 연락처 라벨). 글자색을 따라간다.
- `.ico-chip` — 골드 테두리 둥근 사각 안의 아이콘. 소개 대상 제목, 경력 항목처럼 줄 머리에 쓴다.
- 링크 타일: 56px 타일 배경(`<svg><rect …/></svg>`) 위에 `.tile-glyph` 로 흰 로고를 올린다. Instagram `#b-instagram`, Threads `#b-threads`, 홈페이지 `#i-house`.
- 들어 있는 아이콘: building globe scale mic utensils handshake stethoscope chef wine phone send user-plus book arrow zap message chart house check pin mail calendar briefcase award graduation users star link clock camera heart.
- 없는 아이콘은 `npm i lucide-static` 의 `icons/<이름>.svg` 안쪽 내용을 `<symbol id="i-…" viewBox="0 0 24 24">` 로 감싸 추가한다. 브랜드 로고는 `simple-icons` 의 path 를 쓴다. 손으로 그리거나 글자("@")로 대신하지 않는다.
- 업종에 맞는 아이콘을 고른다(변호사 scale, 강사 mic, 외식업 utensils 등).

## 히어로

```html
<div class="hero" data-motion="">
  <img src="hero.webp" alt="이름" width="981" height="1602" fetchpriority="high">
  <div class="hero-grad"></div>
  <div class="hero-txt"> 회사 / 이름 / 직함 </div>
</div>
```

- `<head>` 에 `<link rel="preload" as="image" href="hero.webp" fetchpriority="high">`.
- 사진은 세로 전신 또는 상반신, 아래쪽 1/4 은 글자가 올라가므로 얼굴이 위쪽 절반에 오게 한다.
- 변환: `python3 -c "from PIL import Image; Image.open('hero.png').save('hero.webp', quality=84, method=6)"`

### 모션 1단계 — 기본 (모든 비즈홈)

CSS 만으로 사진이 번지듯 나타나고(`heroIn`, 2.4초) 회사·이름·직함이 차례로 올라온다(`heroRise`). songsh 의 `.hero` CSS 블록을 그대로 쓴다. `prefers-reduced-motion` 인 기기에서는 꺼진다.

### 모션 2단계 — 인물 영상 (옵션)

`data-motion="hero.mp4"` 를 넣으면 영상이 사진 위에서 **한 번** 재생되고 끝나면 사진으로 돌아간다. 데이터 절약 모드·모션 줄이기 설정에서는 영상 없이 사진만 나온다. 로더는 songsh 의 "히어로 모션" 스크립트를 그대로 쓴다.

기본 동작은 **"서 있다가 앉는다"** 로 한다.

- 인물이 계속 화면 안에 있어 얼굴이 흐트러지지 않고, 3~4초면 끝나 이름이 바로 보인다.
- "걸어 들어와 앉는다"는 6~8초로 길고 용량이 2배 이상이며 AI 영상에서 얼굴·옷이 바뀌기 쉽다. 고객이 특별히 원할 때만 한다.

만드는 법(사진 한 장에서 출발):

1. 이미지→영상 AI(Kling, Veo, Seedance 등)에 **히어로 사진을 첫 장면**으로 넣고 "의자에서 천천히 일어나 옆에 선다, 카메라 고정, 배경 그대로" 로 4~5초 생성한다.
2. 그 영상을 **거꾸로** 돌린다. 일어나는 동작을 뒤집으면 앉는 동작이 되고, 마지막 장면이 원본 사진과 정확히 같아져 사진으로 넘어갈 때 이음매가 없다.
3. 걸어 들어오는 버전은 뒤집기가 안 된다(뒷걸음이 된다). 빈 의자 장면을 따로 만들어 첫 장면=빈 의자, 끝 장면=히어로 사진으로 지정할 수 있는 모델을 써야 한다.

후처리:

```bash
ffmpeg -i raw.mp4 -vf "reverse,scale=720:-2,fps=30" -an -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart hero.mp4
```

```bash
ffmpeg -sseof -0.05 -i hero.mp4 -frames:v 1 -q:v 2 last.png
```

- 소리 없음, 세로 비율은 히어로 사진과 동일, 1.5MB 이하.
- AI 영상은 색이 미세하게 달라지므로, 영상의 마지막 장면(`last.png`)과 `hero.webp` 를 나란히 놓고 비교한다. 차이가 보이면 `last.png` 를 `hero.webp` 로 다시 저장해 맞춘다.
- 영상에 글자·로고·워터마크가 생겼으면 다시 만든다.

## 건드리지 않는 기능

- `saveContact()` vCard, `shareCard()` (카카오 키는 비워 두면 링크 공유)
- `save-to-cardbook.js`, 만두 연결 스크립트(`slug` 값만 고객별로 변경)
- 통계 스크립트(`LOG_URL`): 조회·연락처 저장·카드북 저장을 센다. 연락처 저장 버튼은 `.btn[onclick^="saveContact"]` 로 찾으므로 버튼의 `onclick` 을 바꾸면 집계가 끊긴다.
- `news-board.js`, `dica-edit.js` 로드 줄

고객별로 바꾸는 값: `<title>`, og 태그 4개, vCard 내용, `saveToCardbook({...})` 인자, 만두 `slug`(두 군데), 전화번호, 링크 타일 주소, `manifest.json`.

## 검수

올리기 전에 폰 화면(390×844)으로 띄워 확인한다.

1. 404 없음 — 특히 폰트 2개와 `hero.webp`. `document.fonts` 에서 Paperlogy 가 `loaded` 인지 본다.
2. 본문에 이모지가 남아 있지 않다.
3. 언어 버튼을 하나씩 눌러 빈 칸이 생기는 곳이 없는지 본다.
4. 가로 스크롤이 생기지 않는다(`scrollWidth` 가 화면 폭과 같다).
5. 두 손가락 확대가 된다.
6. 연락처~푸터 구간에 진한 띠가 끼어 있지 않다.
7. `data-motion` 을 썼으면 영상이 한 번 재생되고 사진으로 자연스럽게 돌아온다.

`cardbook.bizmy.net`, `jinjjabg-hub.github.io` 스크립트는 작업 환경에서 막혀 있을 수 있다. 그 경우 MANDU 아이콘이 깨져 보이는 것은 정상이며, 실서버에서 확인한다.
