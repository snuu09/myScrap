# MyBrary

## 이 프로젝트는 무엇인가

**MyBrary**는 웹에서 본 것, 사진, 파일을 모아 **나만의 서재**로 만드는 개인용 앱입니다. 팀 지식베이스나 레시피 앱이 아닙니다. 제품 언어는 **서재**입니다 (문·냉장고·「책장을 연다」 표현 없음).

### 역할

| 역할 | 설명 |
| --- | --- |
| 담기 (Stick) | 붙여넣기, 드래그앤드롭, 클립보드·카메라·사진·파일로 항목을 넣습니다. |
| 분류 (Classify) | Claude(`/api/analyze`) 또는 MIME/URL 휴리스틱으로 유형·태그를 붙인 뒤 미리보고 저장합니다. |
| 찾기 (Find) | `/search`에서 검색·유형·일자별·태그로 찾습니다. 목록은 스크롤에 맞춰 이어 붙습니다. 상세(`/scrap/:id`)와 통계(`/dashboard`)로 봅니다. |

### 주요 기능

- 이메일 / Google / **둘러보기**(익명) 로그인, 아이디·비밀번호 찾기
- 인트로 Theme B **통합 히어로** (담기 → AI 분석 → 정리 → 서재), CTA **내 서재로** → 전용 **`/login`** 페이지 (헤더 로그인도 동일)
- 로그인 시 헤더 3탭: 나의 서재 `/` · 서재 통계 `/dashboard` · 설정 `/settings`, 찾기 아이콘→`/search`(⌘/Ctrl+K), 라이트→다크→시스템 테마 토글
- ChatGPT 스타일 **플로팅 입력창** (법적 Footer와 분리), 분류 드래프트는 `/stick`의 **Workbench**(3단계 레일 + 3D 표지 미리보기)로 표시
- 서재 목록은 **갤러리**(기본) / **마이크로**(3:2 행) 두 레이아웃. 데스크톱(≥960px)에서 마이크로 행 선택 시 우측 **Inspector** 패널, 모바일은 상세 페이지로 이동
- 유형 서가(타입북 캐러셀)는 전체/책갈피/메모/사진/영상/소리/링크/문서 8개를 항상 표시하고 데스크톱 스크롤 시 sticky·compact
- Supabase `scraps` + 비공개 `scrap-media`에 계정별 저장 (RLS)
- **둘러보기는 이 기기 localStorage에 저장** (파일 1.5MB, 합계 약 4MB). 첫 저장 때 1회 안내, 계정 로그인 시 옮길지 물어봄
- 등급 Free / Middle / High (DB `free`/`standard`/`premium`): 용량·배치·광고·리마인드·체험. 비교는 `/upgrade`. 결제 없음
- 설정: 언어·Look(글라스/서재)·컬러 테마(Warm·B / Editorial·A / 현무암 / Soft Deckle)·테마·AI 민감도(0–100, 로컬), 저장 사용량, **마크다운 내보내기**, **DB 초기화**(내 조각·미디어만)
- KO / EN, light / system / dark (Theme B 밤 법랑)

### 문서 · 라이브

- 로드맵: [ROADMAP.md](ROADMAP.md) · 제품: [PRODUCT.md](PRODUCT.md) · 디자인: [DESIGN.md](DESIGN.md) · 구조: [ARCHITECTURE.md](ARCHITECTURE.md)
- 라이브: [https://mybrary-snuu09.web.app](https://mybrary-snuu09.web.app)

스택: Vite + React (TypeScript) SPA · Firebase Hosting(`mybrary-snuu09`) · Auth/DB/Storage는 Supabase · 분류는 Supabase Edge Function `analyze` (Spark에서도 동작. Cloud Function / Netlify 트윈은 보관).

---

## 로컬 실행

```bash
cp .env.example .env
# VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 입력
npm install
npm run dev
```

보통 [http://localhost:5173](http://localhost:5173) 입니다. `@netlify/vite-plugin`으로 함수도 같은 개발 서버에서 붙습니다.

```bash
npm run build
```

## 환경 변수

| 이름 | 위치 | 역할 |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Vite (`dist`에 포함) | 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | Vite (`dist`에 포함) | anon / publishable 키 (`service_role` 금지) |
| `VITE_ADMOB_PUBLISHER_ID` | Vite (선택) | AdMob/AdSense `ca-pub-…` (무료·중간 등급 배너) |
| `VITE_ADMOB_BANNER_SLOT` | Vite (선택) | 배너 슬롯 ID |
| `ANTHROPIC_API_KEY` | Cloud / Netlify Function | Anthropic SDK. 브라우저에 두지 않음 |
| `SUPABASE_URL` | Cloud Function만 | JWT 검증용 프로젝트 URL |
| `SUPABASE_ANON_KEY` | Cloud Function만 | JWT 검증용 anon 키 |

## 사용 흐름

1. 인트로 **내 서재로** 또는 헤더 **로그인**: chooser(Google / 이메일 / 둘러보기), 회원가입 확인 비밀번호, 찾기/재설정. env가 비면 설정 안내가 나옵니다.
2. 서재에서 플로팅 Stick(한 줄 compact, 보내기 **분류하기**)으로 붙여넣기·드롭·**+**(스크림). 열린 초안이 있으면 새 분류하기/붙여넣기/드롭이 초안을 교체합니다. 로컬 `npm run dev`는 Netlify Vite plugin으로 `/api/analyze` → Claude(`ANTHROPIC_API_KEY`); 없으면 MIME/URL 폴백이며 초안에 힌트가 보입니다. URL은 OG도 붙입니다. 드래프트는 풀 시트+블러 스크림입니다.
3. 태그 확인 후 저장 → Supabase. 최신순 목록은 스크롤에 맞춰 이어 붙습니다. 찾기는 `/search` (검색·유형·일자별·태그). 행 탭 → `/scrap/:id`. 헤더 **통계** → `/dashboard`.
4. 등급·체험·용량은 설정에서 확인. **DB 초기화**는 그 계정의 조각·미디어만 지웁니다. 언어·Look·테마·팔레트는 이 기기에만. **나가기**로 인트로.
5. **둘러보기**는 계정이 아니라 이 브라우저(`mybrary.guest.*`)에 저장합니다. 첫 저장 전에 안내 시트가 한 번 뜨고, 같은 브라우저로 다시 둘러보기하면 그 조각을 이어서 봅니다. 다른 브라우저·시크릿·기록 삭제는 복구 경로가 없습니다. 이메일·Google로 로그인하면 이 기기의 조각을 계정으로 옮길지 한 번 물어봅니다.

## 배포 (Firebase Hosting)

라이브: [https://mybrary-snuu09.web.app](https://mybrary-snuu09.web.app) · [https://mybrary-snuu09.firebaseapp.com](https://mybrary-snuu09.firebaseapp.com)

### Push → 라이브 (무료)

`main`에 push하면 [`.github/workflows/firebase-hosting.yml`](.github/workflows/firebase-hosting.yml)이 `dist`를 빌드해 Hosting **live**에 올립니다. 공개 저장소 GitHub Actions 분 + Hosting Spark 할당량만 쓰며, Cloud Functions는 이 워크플로에서 배포하지 않습니다.

한 번만 GitHub Actions secrets가 필요합니다 (`Settings → Secrets and variables → Actions`):

| Secret | 용도 |
| --- | --- |
| `FIREBASE_SERVICE_ACCOUNT_MYBRARY_SNUU09` | Hosting 배포용 서비스 계정 JSON (`firebase init hosting:github`가 만들어 줌) |
| `VITE_SUPABASE_URL` | 빌드 시 Vite에 주입 |
| `VITE_SUPABASE_ANON_KEY` | 빌드 시 Vite에 주입 |
| `VITE_ADMOB_PUBLISHER_ID` / `VITE_ADMOB_BANNER_SLOT` | 선택 |

로컬에서 서비스 계정 시크릿만 만들 때: `npx -y firebase-tools@latest init hosting:github --project mybrary-snuu09` (저장소 `snuu09/myScrap`). Vite 시크릿은 `.env` 값을 repo secrets에 수동으로 넣거나 `gh secret set`로 넣습니다.

로컬 수동 배포는 그대로 `npm run deploy:hosting`입니다.

### 백엔드 · Auth

1. Supabase Auth에서 Email, Google, Anonymous 활성화. 마이그레이션 순서: [20260820140000_scraps_media_realtime.sql](supabase/migrations/20260820140000_scraps_media_realtime.sql) → [20260829143000_profiles_plans.sql](supabase/migrations/20260829143000_profiles_plans.sql) → [20260905100000_scrap_engagement.sql](supabase/migrations/20260905100000_scrap_engagement.sql). Redirect URL에 위 Hosting 도메인 추가. 등급/관리자 수동 설정은 [supabase/README.md](supabase/README.md).
2. 분류: 클라이언트는 Supabase Edge Function `analyze`를 사용자 JWT로 호출합니다. 시크릿 `ANTHROPIC_API_KEY`가 없으면 MIME/URL 폴백입니다. Firebase Cloud Function과 Netlify `/api/analyze`는 Spark에서 쓰지 않습니다.
3. 모델 ID는 `claude-sonnet-4-5` (과제명의 `claude-sonnet-5`는 현재 id가 아님).

Netlify는 선택: `npm run build`, publish `dist`, 동일 Vite 키 + 사이트 env의 `ANTHROPIC_API_KEY`. Netlify 분석 함수는 [netlify/functions/analyze.ts](netlify/functions/analyze.ts).

## 폴더 구조

```
src/                   React UI, Plan, 필터, 둘러보기 로컬 저장, AdMob 슬롯, i18n
public/assets/         파비콘, 인트로 스틸
firebase.json          Hosting(dist) + /api/analyze rewrite
functions/             Cloud Function 분류 (JWT 필요)
netlify/functions/     Netlify용 동일 분류
supabase/              scraps RLS, profiles/plans, scrap-media, 선택 og-preview
```
